<template>
  <div>
    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-content">
        <!-- 关于我们部分 -->
        <div class="footer-section">
          <h4>关于我们</h4>
          <ul>
            <li><a href="#">公司简介</a></li>
            <li><a href="#">联系方式</a></li>
            <li><a href="#">招贤纳士</a></li>
          </ul>
        </div>
        <!-- 客户服务部分 -->
        <div class="footer-section">
          <h4>客户服务</h4>
          <ul>
            <li><a href="#">帮助中心</a></li>
            <li><a href="#">退货政策</a></li>
            <li><a href="#">配送信息</a></li>
          </ul>
        </div>
        <!-- 商家服务部分 -->
        <div class="footer-section">
          <h4>商家服务</h4>
          <ul>
            <li><a href="#">商家入驻</a></li>
            <li><a href="#">商家后台</a></li>
            <li><a href="#">商家学院</a></li>
          </ul>
        </div>
        <!-- 关注我们部分 -->
        <div class="footer-section">
          <h4>关注我们</h4>
          <div class="social-icons">
            <a href="#" class="social-icon"><i class="fab fa-weixin"></i></a>
            <a href="#" class="social-icon"><i class="fab fa-weibo"></i></a>
            <a href="#" class="social-icon"><i class="fab fa-tiktok"></i></a>
          </div>
        </div>
      </div>
      <!-- 页脚底部版权信息 -->
      <div class="footer-bottom">
        <p>&copy; {{ currentDateTime }} 农乐购 - 您身边的农产品电商平台</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const currentDateTime = ref('')

// 更新时间的函数，格式化为年月日时分秒
const updateDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  
  currentDateTime.value = `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`
}

let timer

onMounted(() => {
  // 立即更新一次时间
  updateDateTime()
  // 设置定时器，每秒更新一次时间
  timer = setInterval(updateDateTime, 1000)
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
/* 整体页脚样式 */
.footer {
  background-color: #f9f9f9; /* 调整背景色为浅灰色，使主题色更突出 */
  color: #333; /* 文字颜色 */
  padding: 40px 0 20px;
  margin-top: 50px;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
}

/* 页脚内容布局 */
.footer-content {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 0 auto;
  gap: 20px;
}

/* 每个页脚板块样式 */
.footer-section {
  flex: 1;
  min-width: 200px;
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

/* 鼠标悬停时板块的样式 */
.footer-section:hover {
  background-color: rgba(138, 205, 88, 0.1); /* 鼠标悬停背景色，与主题色相关 */
  transform: translateY(-5px);
}

/* 板块标题样式 */
.footer-section h4 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #8acd58; /* 标题颜色设置为主题色 */
  border-bottom: 2px solid #8acd58; /* 标题下边框颜色设置为主题色 */
  padding-bottom: 5px;
}

/* 列表样式 */
.footer-section ul {
  list-style: none;
  padding: 0;
}

/* 列表项样式 */
.footer-section ul li {
  margin-bottom: 8px;
}

/* 列表项链接样式 */
.footer-section ul li a {
  color: #666; /* 链接默认颜色 */
  text-decoration: none;
  transition: color 0.3s ease;
  display: inline-block;
  position: relative;
}

/* 列表项链接悬停样式 */
.footer-section ul li a:hover {
  color: #8acd58; /* 链接悬停颜色设置为主题色 */
  transform: translateX(5px);
}

/* 列表项链接下划线动画 */
.footer-section ul li a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: #8acd58; /* 下划线颜色设置为主题色 */
  transition: width 0.3s ease;
}

/* 列表项链接悬停时下划线动画 */
.footer-section ul li a:hover::after {
  width: 100%;
}

/* 社交图标布局 */
.social-icons {
  display: flex;
  gap: 15px;
}

/* 社交图标样式 */
.social-icon {
  font-size: 24px;
  color: #666; /* 社交图标默认颜色 */
  transition: color 0.3s ease, transform 0.3s ease;
}

/* 社交图标悬停样式 */
.social-icon:hover {
  color: #8acd58; /* 社交图标悬停颜色设置为主题色 */
  transform: scale(1.2);
}

/* 页脚底部样式 */
.footer-bottom {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #8acd58; /* 页脚底部上边框颜色设置为主题色 */
}

/* 页脚底部版权信息样式 */
.footer-bottom p {
  font-size: 14px;
  color: #666;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 响应式布局，适用于小屏幕设备 */
@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    align-items: center;
  }

  .footer-section {
    text-align: center;
    margin-bottom: 30px;
  }
}
</style>