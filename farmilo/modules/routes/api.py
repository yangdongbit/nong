from flask import Blueprint, request, jsonify
from ..database.connector import load_data_from_mysql
from ..algorithm.recommender import (
    get_recommendations,
    process_features
)
from transformers import BertTokenizer, BertModel, CLIPProcessor, CLIPModel
import torch
from config import MODEL_PATHS

# 创建蓝图
api_blueprint = Blueprint('api', __name__)

# 初始化模型
print("正在加载BERT模型...")
tokenizer = BertTokenizer.from_pretrained(MODEL_PATHS['bert'])
bert_model = BertModel.from_pretrained(MODEL_PATHS['bert'])

print("正在加载CLIP模型...")
clip_processor = CLIPProcessor.from_pretrained(MODEL_PATHS['clip'])
clip_model = CLIPModel.from_pretrained(MODEL_PATHS['clip'])

# 加载数据并预处理特征
print("正在加载商品数据...")
df = load_data_from_mysql()

# 处理特征
text_scaler, image_scaler, scaled_text_features, scaled_image_features = process_features(
    df, tokenizer, bert_model, clip_model, clip_processor
)


@api_blueprint.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()

        # 获取请求参数
        product_name = data.get('product_name')
        image_url = data.get('image_url')
        text_weight = float(data.get('text_weight', 0.5))
        image_weight = float(data.get('image_weight', 0.5))
        top_n = int(data.get('top_n', 5))

        if not product_name:
            return jsonify({'error': '商品名称不能为空'}), 400

        # 获取推荐结果
        recommendations = get_recommendations(
            product_name=product_name,
            df=df,
            product_image=image_url,
            top_n=top_n,
            text_weight=text_weight,
            image_weight=image_weight,
            tokenizer=tokenizer,
            bert_model=bert_model,
            clip_model=clip_model,
            clip_processor=clip_processor,
            text_scaler=text_scaler,
            image_scaler=image_scaler,
            scaled_text_features=scaled_text_features,
            scaled_image_features=scaled_image_features
        )

        # 转换结果为JSON格式
        results = recommendations.to_dict('records')
        return jsonify({
            'status': 'success',
            'recommendations': results
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500 