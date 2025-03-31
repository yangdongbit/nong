<template>
  <div class="reviews-container">
    <div class="rating-overview">
      <div class="rating-score">
        <span class="score">4.8</span>
        <span class="total">/5</span>
      </div>
      <div class="rating-stars">★★★★★</div>
      <div class="rating-count">
        共 {{ evaluations.length }} 条评价
      </div>
    </div>
    <div class="rating-tags">
      <span class="tag active">全部(238)</span>
      <span class="tag">好评(220)</span>
      <span class="tag">中评(12)</span>
      <span class="tag">差评(6)</span>
      <span class="tag">有图(86)</span>
    </div>

    <div class="reviews-list">
      <div
        class="review-item"
        v-for="item in evaluations"
        :key="item.id"
      >
        <div class="review-user">
          <img
            :src="`http://127.0.0.1:3000/${item.avatar_img}`"
            alt="用户头像"
            class="user-avatar"
          />
          <span class="user-name">{{ item.author }}</span>
        </div>
        <div class="review-content">
          <div class="review-rating">
            <span class="stars">
              <span v-for="(star, index) in item.rating" :key="index">
                ★
              </span>
            </span>
            <span class="date">{{ item.date.slice(0, 10) }}</span>
          </div>
          <p class="review-text">
            {{ item.content }}
          </p>
          <div class="review-images">
            <img
              :src="`http://127.0.0.1:3000/${item.avatar_img}`"
              alt="评价图片"
            />
            <img :src="currentImage" alt="评价图片" />
          </div>
          <div class="review-tags">
            <span class="spec-tag">规格：5斤装</span>
          </div>
        </div>
      </div>

      <!-- 添加评论表单 -->
      <div class="add-review-section">
        <h3>发表评价</h3>
        <div class="review-form">
          <div class="rating-select">
            <span>评分：</span>
            <div class="star-rating">
              <span
                v-for="n in 5"
                :key="n"
                class="star"
                :class="{ active: n <= newReview.rating }"
                @click="newReview.rating = n"
              >★</span>
            </div>
          </div>

          <div class="review-input">
            <textarea
              v-model="newReview.content"
              placeholder="请分享您的使用体验..."
              rows="4"
            ></textarea>
          </div>

          <div class="review-images-upload">
            <div
              class="upload-preview"
              v-if="newReview.images.length"
            >
              <div
                v-for="(img, index) in newReview.images"
                :key="index"
                class="preview-item"
              >
                <img :src="img" alt="预览图" />
                <button
                  class="remove-img"
                  @click="removeImage(index)"
                >
                  ×
                </button>
              </div>
            </div>
            <label
              class="upload-btn"
              v-if="newReview.images.length < 4"
            >
              <input
                type="file"
                accept="image/*"
                multiple
                @change="handleImageUpload"
                hidden
              />
              <i class="upload-icon">+</i>
              <span>上传图片</span>
            </label>
            <p class="upload-tip">最多可上传4张图片</p>
          </div>

          <button class="submit-review" @click="submitReview">
            发表评价
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
  evaluations: {
    type: Array,
    required: true
  },
  currentImage: {
    type: String,
    required: true
  }
});

const route = useRoute();

const newReview = ref({
  rating: 5,
  content: "",
  images: [],
});

const handleImageUpload = (event) => {
  const files = event.target.files;
  if (files) {
    Array.from(files).forEach((file) => {
      if (newReview.value.images.length >= 4) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        newReview.value.images.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }
};

const removeImage = (index) => {
  newReview.value.images.splice(index, 1);
};

const submitReview = () => {
  if (!newReview.value.content.trim()) {
    alert("请输入评价内容");
    return;
  }

  console.log("提交评论:", {
    rating: newReview.value.rating,
    content: newReview.value.content,
    images: newReview.value.images,
    productId: route.params.id,
    date: new Date().toISOString(),
  });

  newReview.value = {
    rating: 5,
    content: "",
    images: [],
  };

  alert("评价提交成功！");
};
</script>

<style scoped>
.reviews-container {
  padding: 20px 0;
}

.rating-overview {
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 20px 0;
  padding: 20px;
  background: #f8f8f8;
  border-radius: 10px;
}

.rating-score {
  display: flex;
  align-items: baseline;
}

.score {
  font-size: 36px;
  font-weight: bold;
  color: #2ecc71;
}

.total {
  font-size: 16px;
  color: #999;
  margin-left: 4px;
}

.rating-stars {
  color: #ffb800;
  font-size: 20px;
  letter-spacing: 2px;
}

.rating-count {
  color: #666;
  font-size: 14px;
}

.rating-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 15px 0;
}

.tag {
  padding: 6px 12px;
  border-radius: 15px;
  background: #f5f5f5;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag:hover {
  background: #e8f5e9;
  color: #2ecc71;
}

.tag.active {
  background: #2ecc71;
  color: white;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  display: flex;
  gap: 15px;
  padding: 20px;
  border-bottom: 1px solid #eee;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.review-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.review-user {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: 14px;
  color: #666;
}

.review-content {
  flex: 1;
}

.review-rating {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.stars {
  color: #ffb800;
  letter-spacing: 2px;
}

.date {
  color: #999;
  font-size: 14px;
}

.review-text {
  color: #333;
  line-height: 1.6;
  margin-bottom: 15px;
}

.review-images {
  display: flex;
  gap: 10px;
  margin: 15px 0;
}

.review-images img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.review-images img:hover {
  transform: scale(1.05);
}

.review-tags {
  display: flex;
  gap: 10px;
}

.spec-tag {
  padding: 4px 8px;
  background: #f8f8f8;
  color: #666;
  font-size: 12px;
  border-radius: 4px;
}

.add-review-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.add-review-section h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.rating-select {
  display: flex;
  align-items: center;
  gap: 10px;
}

.star-rating {
  display: flex;
  gap: 5px;
}

.star {
  font-size: 24px;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s;
}

.star:hover,
.star.active {
  color: #ffb800;
}

.review-input textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  min-height: 100px;
}

.review-images-upload {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-preview {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.preview-item {
  position: relative;
  width: 80px;
  height: 80px;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.remove-img {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px dashed #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-btn:hover {
  background: #e8f5e9;
  border-color: #2ecc71;
}

.upload-icon {
  font-size: 20px;
  color: #666;
}

.upload-tip {
  font-size: 12px;
  color: #999;
}

.submit-review {
  padding: 12px;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
}

.submit-review:hover {
  background: #27ae60;
}
</style> 