import pandas as pd
import re
import jieba
import torch
import numpy as np
from transformers import BertTokenizer, BertModel, CLIPProcessor, CLIPModel
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
from PIL import Image
import requests
from io import BytesIO
import pymysql
from sqlalchemy import create_engine
from config import DB_CONFIG
import os
import pickle
from hashlib import md5

# 初始化缓存计数器
cache_hits = 0
cache_checks = 0

# 停用词列表（可根据需要扩展）
stopwords = set(["的", "是", "在", "和", "有", "了", "要", "也", "都"])


# 中文预处理函数优化
def preprocess(text):
    # 清洗非中文字符
    text = re.sub(r'[^\u4e00-\u9fa5]+', ' ', str(text))
    # 精确分词
    words = jieba.lcut(text.strip())
    # 过滤停用词
    return ' '.join([w for w in words if w not in stopwords and len(w) > 1])

def load_data_from_mysql():
    """从MySQL数据库加载商品数据"""
    try:
        # 使用SQLAlchemy创建连接引擎
        engine = create_engine(
            f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@"
            f"{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}?"
            f"charset={DB_CONFIG['charset']}"
        )

        # 从farms表读取数据
        query = "SELECT * FROM farms"
        df = pd.read_sql(query, engine)

        print("成功从MySQL数据库加载数据")
        return df

    except Exception as e:
        print(f"数据库连接失败: {e}")
        raise


# 清理URL格式
def clean_url(url):
    if pd.isna(url):
        return url

    url = str(url).strip()

    # 处理带引号的URL (CSV中常见问题)
    if url.startswith("'") and url.endswith("'"):
        url = url[1:-1]
    elif url.startswith('"') and url.endswith('"'):
        url = url[1:-1]
    # 处理只有前缀引号的情况
    elif url.startswith("'"):
        url = url[1:]
    elif url.startswith('"'):
        url = url[1:]
    # 处理只有后缀引号的情况
    elif url.endswith("'"):
        url = url[:-1]
    elif url.endswith('"'):
        url = url[:-1]

    # 检查是否以@http开头的特殊格式
    if url.startswith("@http"):
        url = url[1:]  # 去掉@符号

    # 修复不正确的URL格式 (http:\\变成http://)
    if "\\" in url and "http:" in url:
        url = url.replace("http:\\", "http://")
        url = url.replace("\\", "/")

    return url


# 确保数据字段正确
expected_headers = [
    'id', 'imgSrc', 'title', 'price', 'type', 'imgSrc1', 'imgSrc2',
    'imgSrc3', 'imgSrc4', 'shipping_from', 'express_name', 'product_name',
    'specification', 'storage_method', 'shelf_life', 'sales_volume',
    'stock', 'buyer'
]


# 生成BERT嵌入向量
def get_bert_embedding(text, tokenizer, bert_model):
    inputs = tokenizer(text, return_tensors='pt',
                       max_length=64, truncation=True, padding=True)
    with torch.no_grad():
        outputs = bert_model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).squeeze().numpy()


CACHE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "feature_cache")
os.makedirs(CACHE_DIR, exist_ok=True)


def get_image_feature_cache(image_path):
    """获取图片特征缓存"""
    global cache_hits, cache_checks
    cache_checks += 1

    cache_key = md5(image_path.encode()).hexdigest()
    cache_file = os.path.join(CACHE_DIR, f"{cache_key}.pkl")
    if os.path.exists(cache_file):
        print(f"[缓存命中] {image_path}")
        cache_hits += 1
        with open(cache_file, 'rb') as f:
            return pickle.load(f)
    print(f"[缓存未命中] {image_path}")
    return None


def save_image_feature_cache(image_path, feature):
    """保存图片特征缓存"""
    cache_key = md5(image_path.encode()).hexdigest()
    cache_file = os.path.join(CACHE_DIR, f"{cache_key}.pkl")
    with open(cache_file, 'wb') as f:
        pickle.dump(feature, f)


def get_clip_image_embedding(image_path, clip_processor=None, clip_model=None):
    try:
        # 检查缓存
        cached_feature = get_image_feature_cache(image_path)
        if cached_feature is not None:
            return cached_feature

        # 跳过空值
        if pd.isna(image_path):
            return None

        # 确保是字符串并清理URL
        image_path = clean_url(str(image_path).strip())

        if image_path.startswith("http"):  # 处理网络图片
            try:
                response = requests.get(image_path, timeout=10)
                response.raise_for_status()  # 检查HTTP响应状态
                image = Image.open(BytesIO(response.content))
            except requests.exceptions.RequestException as e:
                print(f"HTTP请求失败: {e}")
                return None
        else:  # 处理本地图片
            try:
                image = Image.open(image_path)
            except Exception as e:
                print(f"本地图片加载失败: {e}")
                return None

        inputs = clip_processor(images=image, return_tensors="pt")
        with torch.no_grad():
            outputs = clip_model.get_image_features(**inputs)
        embedding = outputs.squeeze().numpy()

        # 确保输出是一维向量
        if len(embedding.shape) == 0:  # 如果是标量
            embedding = np.array([embedding])
        elif len(embedding.shape) > 1:  # 如果是多维数组
            embedding = embedding.flatten()

        # 添加维度转换逻辑
        if len(embedding) == 512:  # 如果是512维
            # 通过插值扩展到768维
            embedding = np.interp(
                np.linspace(0, 1, 768),
                np.linspace(0, 1, 512),
                embedding
            )

        # 保存到缓存
        save_image_feature_cache(image_path, embedding)
        return embedding

    except Exception as e:
        print(f"图片处理失败: {e}")
        return None


# 修改get_recommendations函数，删除重复代码
# 移除原有的BERT和CLIP模型初始化代码
# 改为在函数参数中接收这些模型

def get_recommendations(product_name, df, product_image=None, top_n=5, text_weight=0.5,
                        image_weight=0.5, tokenizer=None, bert_model=None,
                        clip_model=None, clip_processor=None, text_scaler=None,
                        image_scaler=None, scaled_text_features=None,
                        scaled_image_features=None):
    """基于文本和图像内容的商品推荐函数"""
    # 参数验证和权重归一化
    if text_weight + image_weight != 1.0:
        total = text_weight + image_weight
        text_weight, image_weight = text_weight / total, image_weight / total

    # 处理输入文本
    processed_text = preprocess(product_name)
    text_embedding = get_bert_embedding(processed_text, tokenizer, bert_model)
    scaled_text_query = text_scaler.transform([text_embedding])

    # 处理输入图片
    expected_image_dim = clip_model.config.vision_config.hidden_size

    if product_image:
        print(f"处理查询图片...")
        image_embedding = get_clip_image_embedding(product_image, clip_processor, clip_model)

        if image_embedding is None:
            print("图像特征提取失败，仅使用文本特征")
            image_embedding = np.zeros(expected_image_dim)
            text_weight, image_weight = 1.0, 0.0
        elif image_embedding.shape[0] != expected_image_dim:
            print(f"查询图片维度({image_embedding.shape[0]})与模型维度({expected_image_dim})不匹配")
            if image_embedding.shape[0] < expected_image_dim:
                image_embedding = np.pad(image_embedding, (0, expected_image_dim - image_embedding.shape[0]))
            else:
                image_embedding = image_embedding[:expected_image_dim]
            print(f"已调整查询图片维度至{expected_image_dim}")
    else:
        print("未提供图片，仅使用文本进行推荐")
        image_embedding = np.zeros(expected_image_dim)
        text_weight, image_weight = 1.0, 0.0

    # 标准化图像查询向量
    scaled_image_query = image_scaler.transform([image_embedding])

    # 计算文本相似度
    text_similarities = cosine_similarity(scaled_text_query, scaled_text_features).flatten()

    # 计算图像相似度
    image_similarities = cosine_similarity(scaled_image_query, scaled_image_features).flatten()

    # 计算加权相似度
    combined_similarities = (text_weight * text_similarities) + (image_weight * image_similarities)

    # 获取最相似商品的索引 (多取一个以防查询商品被排除)
    indices = combined_similarities.argsort()[-(top_n + 1):][::-1]

    # 构建结果
    results = df.iloc[indices].copy()
    results['combined_similarity'] = combined_similarities[indices]
    results['text_similarity'] = text_similarities[indices]
    results['image_similarity'] = image_similarities[indices]

    # 排除查询商品本身并确保返回top_n个结果
    results = results[results['product_name'] != product_name].head(top_n)

    print(f"推荐完成 (文本权重: {text_weight:.2f}, 图像权重: {image_weight:.2f})")
    # 返回所有字段
    return results


# 在特征处理代码之前添加这个函数定义
def get_combined_text(row):
    fields = ['product_name', 'title', 'type', 'shipping_from',
              'express_name', 'storage_method', 'shelf_life']
    return ' '.join([str(row[field]) for field in fields if field in row])


def process_features(df, tokenizer, bert_model, clip_model, clip_processor):
    """处理商品特征"""
    # 询问用户是否使用缓存
    while True:
        choice = input("是否使用图片特征缓存？(y/n): ").lower()
        if choice in ['y', 'n']:
            use_cache = choice == 'y'
            break
        print("请输入y或n")

    if use_cache:
        print("检测到缓存模式，将尝试从缓存加载图片特征")
    else:
        print("检测到重新提取模式，将清除现有缓存并重新处理所有图片")
        # 清除现有缓存
        try:
            cache_files = [f for f in os.listdir(CACHE_DIR) if f.endswith('.pkl')]
            for file in cache_files:
                os.remove(os.path.join(CACHE_DIR, file))
            print(f"已清除 {len(cache_files)} 个缓存文件")
        except Exception as e:
            print(f"清除缓存时出错: {e}")

    # 声明使用全局变量
    global cache_hits, cache_checks
    # 重置缓存统计变量
    cache_hits = 0
    cache_checks = 0

    text_features = np.array([
        get_bert_embedding(preprocess(get_combined_text(row)), tokenizer, bert_model)
        for _, row in df.iterrows()
    ])

    # 处理图像特征
    print("处理商品图片...")
    clip_feature_dim = clip_model.config.vision_config.hidden_size

    if 'imgSrc' in df.columns:
        image_features_list = []
        for idx, row in df.iterrows():
            if idx % 10 == 0:
                print(f"处理进度: {idx + 1}/{len(df)} (缓存命中率: {cache_hits}/{cache_checks})")
                # 重置计数器
                cache_hits = 0
                cache_checks = 0
            img_features = []
            img_fields = ['imgSrc', 'imgSrc1', 'imgSrc2', 'imgSrc3', 'imgSrc4']
            for field in img_fields:
                if field in row:
                    path = row[field]
                    if pd.notna(path):
                        clean_path = clean_url(str(path))
                        # 根据用户选择决定是否使用缓存
                        if use_cache:
                            img_feature = get_image_feature_cache(clean_path)
                            if img_feature is None:
                                img_feature = get_clip_image_embedding(
                                    clean_path, clip_processor, clip_model
                                )
                        else:
                            img_feature = get_clip_image_embedding(
                                clean_path, clip_processor, clip_model
                            )

                        if img_feature is not None:
                            img_features.append(img_feature)

            avg_feature = np.mean(img_features, axis=0) if img_features else np.zeros(clip_feature_dim)
            image_features_list.append(avg_feature)

        image_features = np.array(image_features_list)
    else:
        image_features = np.zeros((len(df), clip_feature_dim))

    # 特征标准化
    text_scaler = StandardScaler().fit(text_features)
    image_scaler = StandardScaler().fit(image_features)
    scaled_text_features = text_scaler.transform(text_features)
    scaled_image_features = image_scaler.transform(image_features)

    print(f"文本特征维度: {text_features.shape}")
    print(f"图像特征维度: {image_features.shape}")
    print("特征处理完成！")

    return text_scaler, image_scaler, scaled_text_features, scaled_image_features