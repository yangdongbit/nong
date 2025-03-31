<template>
  <div>
    <router-link to="/ShopHomePage" class="back-home">
      <span class="back-icon">←</span>
      <span class="back-text">返回首页</span>
    </router-link>

    <!-- 添加欢迎语 -->
    <div class="welcome-text">欢迎来到农乐购</div>

    <!-- 原有的消息容器 -->
    <div
      class="message-container"
      v-if="Object.values(errors).some((error) => error) || successMessage"
    >
      <div
        class="error-message"
        v-if="Object.values(errors).some((error) => error)"
      >{{ Object.values(errors).find((error) => error) }}</div>
      <div class="success-message" v-if="successMessage">{{ successMessage }}</div>
    </div>
    <div class="container">
      <div class="form-container" :class="{ active: !isLogin }">
        <!-- 将 logo 移动到 form-container 内部 -->
        <img src="http://127.0.0.1:3000/yang/img/img/logo.png" alt="logo" class="logo-image" />
        <!-- 注册表单 -->
        <div class="form-box register-form">
          <div class="form-content">
            <h1>注册账号</h1>
            <div class="input-group">
              <input
                type="text"
                class="input-field"
                placeholder="用户名"
                v-model="registerForm.username"
              />
            </div>
            <div class="input-group">
              <input type="email" class="input-field" placeholder="邮箱" v-model="registerForm.email" />
            </div>
            <div class="input-group">
              <input
                type="password"
                class="input-field"
                placeholder="密码"
                v-model="registerForm.password"
              />
            </div>
            <div class="input-group">
              <input
                type="password"
                class="input-field"
                placeholder="确认密码"
                v-model="registerForm.confirmPassword"
              />
            </div>
            <a href="#" class="submit-btn" @click.prevent="handleRegister">注册</a>
          </div>
        </div>
        <!-- 背景图片 -->
        <div class="img-box"></div>
        <!-- 登录表单 -->
        <div class="form-box login-form">
          <div class="form-content">
            <h1>登录账号</h1>
            <input type="text" class="input-field" placeholder="账号" v-model="loginForm.username" />
            <input
              type="password"
              class="input-field"
              placeholder="密码"
              v-model="loginForm.password"
            />
            <div class="agreement-container">
              <label class="agreement-label">
                <input type="checkbox" v-model="loginForm.agreement" class="agreement-checkbox" />
                <div class="agreement-content">
                  <span class="agreement-text">我已阅读并同意</span>
                  <a href="#" @click.prevent="showTerms" class="terms-link">《用户协议》</a>
                </div>
              </label>
            </div>
            <router-link class="forgot-pass" to="FindPassword">忘记密码?</router-link>
            <a href="#" class="submit-btn" @click.prevent="handleLogin">登录</a>
          </div>
        </div>
      </div>
      <button class="toggle-btn" @click="toggleForm">{{ isLogin ? "切换注册" : "切换登录" }}</button>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, reactive } from "vue";
import { useLoginStore } from "../nweStore/logins";
import { useRouter } from "vue-router";

const router = useRouter(); // 路由跳转

const isLogin = ref(true);
const successMessage = ref("");
const errors = reactive({
  username: "",
  email: "",
  password: "",
  confirmPassword: ""
});

const loginForm = reactive({
  username: "",
  password: "",
  agreement: false
});

const registerForm = reactive({
  username: "",
  email: "",
  password: "",
  confirmPassword: ""
});

// 验证函数
const validateForm = () => {
  let isValid = true;
  // 重置错误信息
  Object.keys(errors).forEach(key => (errors[key] = ""));

  // 验证用户名
  if (!registerForm.username.trim()) {
    showTemporaryMessage('username', "用户名不能为空");
    isValid = false;
  }

  // 验证邮箱
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(registerForm.email)) {
    showTemporaryMessage('email', "请输入有效的邮箱地址");
    isValid = false;
  }

  // 验证密码
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  if (!passwordRegex.test(registerForm.password)) {
    showTemporaryMessage('password', "密码必须包含大小写字母和数字，且长度至少8位");
    isValid = false;
  }

  // 验证确认密码
  if (registerForm.password !== registerForm.confirmPassword) {
    showTemporaryMessage('confirmPassword', "两次输入的密码不一致");
    isValid = false;
  }

  return isValid;
};

const toggleForm = () => {
  isLogin.value = !isLogin.value;
  // 切换表单时清除错误和成功信息
  Object.keys(errors).forEach(key => (errors[key] = ""));
  successMessage.value = "";
};

// 这是pinia数据库
const loginStore = useLoginStore();
// console.log(loginStore.Loginuser);  直接使用这个数据库的常量

// 登录的逻辑
const handleLogin = () => {
  // 清除之前的错误信息
  Object.keys(errors).forEach(key => (errors[key] = ""));

  // 验证表单
  if (!loginForm.username.trim()) {
    showTemporaryMessage('username', "请输入账号");
    return;
  }
  if (!loginForm.password.trim()) {
    showTemporaryMessage('username', "请输入密码");
    return;
  }
  if (!loginForm.agreement) {
    showTemporaryMessage('username', "请阅读并同意用户服务协议");
    return;
  }

  axios({
    url: "/api/logins",
    method: "POST",
    data: {
      name: loginForm.username,
      password: loginForm.password
    }
  })
    .then(result => {
      if (Object.keys(result.data).length === 0) {
        showTemporaryMessage('username', "账号或密码错误");
      } else {
        showTemporaryMessage('success', "登录成功！");
        loginStore.Loginuser = result.data;
        router.push("/ShopHomePage");
      }
    })
    .catch(error => {
      showTemporaryMessage('username', "登录失败，请稍后重试");
    });
};

const handleRegister = () => {
  // 先验证表单
  if (!validateForm()) {
    return;
  }

  axios({
    url: "/api/yang/add",
    method: "POST",
    data: {
      name: registerForm.username,
      password: registerForm.password,
      email: registerForm.email
    }
  })
    .then(result => {
      if (result.data === "注册成功！！！") {
        // 清空表单
        registerForm.username = "";
        registerForm.password = "";
        registerForm.email = "";
        registerForm.confirmPassword = "";
        // 显示成功信息
        showTemporaryMessage('success', "注册成功！");
        // 延迟后切换到登录界面
        setTimeout(() => {
          isLogin.value = true;
        }, 2000);
      } else {
        showTemporaryMessage('username', result.data);
      }
    })
    .catch(error => {
      showTemporaryMessage('username', "注册失败，请稍后重试");
    });
};

// 修改 showTerms 函数
const showTerms = () => {
  const termsContent = `
    <div class="terms-header">
      <h1>农乐购用户服务协议</h1>
      <p class="terms-subtitle">请仔细阅读以下条款</p>
    </div>

    <div class="terms-section">
      <h2>1. 服务条款</h2>
      <div class="terms-item">
        <p>1.1 欢迎使用农乐购平台服务！</p>
        <p>1.2 您在使用本平台服务之前，应当仔细阅读本协议的全部内容。</p>
      </div>
    </div>

    <div class="terms-section">
      <h2>2. 账号注册与安全</h2>
      <div class="terms-item">
        <p>2.1 您承诺注册信息的真实性和有效性</p>
        <p>2.2 您必须保护好自己的账号和密码安全</p>
        <p>2.3 未经允许，不得将账号转让或出借给他人使用</p>
      </div>
    </div>

    <div class="terms-section">
      <h2>3. 用户隐私保护</h2>
      <div class="terms-item">
        <p>3.1 我们将严格保护您的个人隐私信息</p>
        <p>3.2 未经您的同意，我们不会向第三方披露您的个人信息</p>
      </div>
    </div>

    <div class="terms-section">
      <h2>4. 交易规则</h2>
      <div class="terms-item">
        <p>4.1 本平台仅提供农产品交易服务</p>
        <p>4.2 用户应当遵守诚实信用原则</p>
        <p>4.3 禁止任何虚假交易和欺诈行为</p>
      </div>
    </div>

    <div class="terms-section">
      <h2>5. 免责声明</h2>
      <div class="terms-item">
        <p>5.1 因不可抗力导致的服务中断，本平台不承担责任</p>
        <p>5.2 用户因违反本协议造成的损失由用户自行承担</p>
      </div>
    </div>

    <div class="terms-section">
      <h2>6. 协议修改</h2>
      <div class="terms-item">
        <p>6.1 本平台保留修改本协议的权利</p>
        <p>6.2 修改后的协议将在平台上公布</p>
      </div>
    </div>

    <div class="terms-section">
      <h2>7. 适用法律</h2>
      <div class="terms-item">
        <p>7.1 本协议受中华人民共和国法律管辖</p>
        <p>7.2 因本协议产生的争议，由平台所在地法院管辖</p>
      </div>
    </div>
  `;

  const dialogDiv = document.createElement('div');
  dialogDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    max-width: 800px;
    max-height: 80vh;
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 0 30px rgba(0,0,0,0.2);
    z-index: 1000;
    overflow-y: auto;
    font-family: "Microsoft YaHei", sans-serif;
  `;
  
  // 添加内部样式
  const style = document.createElement('style');
  style.textContent = `
    .terms-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #5eb69c;
    }
    .terms-header h1 {
      color: #5eb69c;
      font-size: 24px;
      margin-bottom: 10px;
    }
    .terms-subtitle {
      color: #666;
      font-size: 14px;
    }
    .terms-section {
      margin-bottom: 25px;
    }
    .terms-section h2 {
      color: #333;
      font-size: 18px;
      margin-bottom: 15px;
      padding-left: 15px;
      border-left: 4px solid #5eb69c;
    }
    .terms-item {
      padding-left: 20px;
    }
    .terms-item p {
      color: #666;
      line-height: 1.8;
      margin: 8px 0;
      font-size: 14px;
    }
  `;
  
  // 添加关闭按钮
  const closeButton = document.createElement('button');
  closeButton.textContent = '我已阅读并同意';
  closeButton.style.cssText = `
    position: sticky;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 30px;
    background: linear-gradient(45deg, #5eb69c, #7ed957);
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    margin-top: 30px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(94, 182, 156, 0.3);
  `;

  closeButton.onmouseover = () => {
    closeButton.style.transform = 'translateX(-50%) translateY(-2px)';
    closeButton.style.boxShadow = '0 6px 20px rgba(94, 182, 156, 0.4)';
  };

  closeButton.onmouseout = () => {
    closeButton.style.transform = 'translateX(-50%)';
    closeButton.style.boxShadow = '0 4px 15px rgba(94, 182, 156, 0.3)';
  };
  
  dialogDiv.innerHTML = termsContent;
  dialogDiv.appendChild(style);
  dialogDiv.appendChild(closeButton);
  
  // 添加遮罩层
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(3px);
    z-index: 999;
  `;
  
  document.body.appendChild(overlay);
  document.body.appendChild(dialogDiv);
  
  closeButton.onclick = () => {
    document.body.removeChild(dialogDiv);
    document.body.removeChild(overlay);
    loginForm.agreement = true;
  };
  
  overlay.onclick = () => {
    document.body.removeChild(dialogDiv);
    document.body.removeChild(overlay);
  };
};

console.log(loginStore.Loginuser);

// 在 script setup 部分，添加一个通用的显示消息函数
const showTemporaryMessage = (type, message) => {
  if (type === 'success') {
    successMessage.value = message;
    setTimeout(() => {
      successMessage.value = '';
    }, 5000);
  } else {
    // 处理所有错误类型
    errors[type] = message;
    setTimeout(() => {
      errors[type] = '';
    }, 5000);
  }
};
</script>

<style scoped>
body {
  margin: 0;
}

.container {
  position: relative;
  top: 50px;
  width: 1100px;
  height: 550px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  overflow: hidden;
  margin: 0 auto;
  /* 使用更柔和的绿色系渐变 */
  background: linear-gradient(
    45deg,
    #9ee084,
    #7ed957,
    #5eb69c,
    #a8e6cf,
    #dcedc1
  );
  background-size: 300% 300%;
  animation: gradientBG 15s ease infinite;
}

@keyframes gradientBG {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.form-container {
  position: relative;
  width: 1100px;
  height: 100%;
  display: flex;
  transition: all 0.6s ease-in-out;
}

.img-box {
  position: absolute;
  width: 800px;
  height: 100%;
  background-image: url("http://127.0.0.1:3000/yang/img/img/region_cover.jpg");
  background-size: cover;
  background-position: center;
  transition: all 0.6s ease-in-out;
  left: 0;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
}

.form-box {
  width: 300px;
  height: 550px;
  background-color: rgba(255, 255, 255, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(5px);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
}

.form-content {
  width: 250px;
  height: 500px;
  position: relative;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.form-content h1 {
  font: 900 30px "";
}

.input-field {
  width: 230px;
  margin: 12px 0;
  padding: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-bottom: 2px solid rgba(94, 182, 156, 0.5);
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.input-field:focus {
  border-bottom-color: #5eb69c;
  box-shadow: 0 2px 8px rgba(94, 182, 156, 0.2);
}

.forgot-pass {
  float: right;
  margin: 10px 0;
}

.submit-btn {
  width: 200px;
  height: 50px;
  font-size: 20px;
  font-weight: 600;
  text-decoration: none;
  line-height: 50px;
  border-radius: 25px;
  background: linear-gradient(45deg, #5eb69c, #9ee084);
  border: none;
  text-align: center;
  color: white;
  box-shadow: 0 4px 15px rgba(94, 182, 156, 0.3);
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(94, 182, 156, 0.4);
}

.toggle-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 10px 25px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 20px;
  color: #5eb69c;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.login-form {
  position: absolute;
  right: 0;
  width: 300px;
}

.register-form {
  position: absolute;
  left: 0;
  width: 300px;
  opacity: 0;
  pointer-events: none;
}

.form-container.active .img-box {
  left: 300px;
}

.form-container.active .login-form {
  opacity: 0;
  pointer-events: none;
}

.form-container.active .register-form {
  opacity: 1;
  pointer-events: auto;
}

/* 添加背景渐 */
:deep(body) {
  background-image: linear-gradient(to left, #ffeb88, #9ee084);
  display: flex;
  justify-content: center;
  min-height: 100vh;
}

/* 添加新的样式 */
.input-group {
  position: relative;
  margin-bottom: 15px;
}

.message-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  min-width: 300px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.error-message {
  color: #ff4444;
  font-size: 14px;
  padding: 12px 20px;
  background-color: rgba(255, 68, 68, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(255, 68, 68, 0.2);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
}

.success-message {
  color: #00c851;
  font-size: 14px;
  padding: 12px 20px;
  background-color: rgba(0, 200, 81, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(0, 200, 81, 0.2);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
}

.agreement-container {
  margin: 15px 0;
  padding: 10px;
  border-radius: 8px;
  /* background: rgba(94, 182, 156, 0.05); */
}

.agreement-label {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  white-space: nowrap; /* 防止文字换行 */
}

.agreement-content {
  display: flex;
  align-items: center;
  flex-wrap: nowrap; /* 防止内容换行 */
}

.agreement-checkbox {
  flex-shrink: 0; /* 防止复选框缩小 */
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #5eb69c;
  border-radius: 4px;
  margin-right: 8px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.agreement-checkbox:checked {
  background-color: #5eb69c;
}

.agreement-checkbox:checked::after {
  content: "✓";
  position: absolute;
  color: white;
  font-size: 12px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.agreement-checkbox:hover {
  border-color: #7ed957;
}

.agreement-text {
  color: #666;
  margin-right: 4px;
}

.terms-link {
  color: #5eb69c;
  text-decoration: none;
  font-weight: 500;
  position: relative;
  transition: all 0.3s ease;
}

.terms-link:hover {
  color: #7ed957;
}

.terms-link::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: currentColor;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.terms-link:hover::after {
  transform: scaleX(1);
}

/* 修改 logo 样式 */
.logo-image {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 100px;
  height: auto;
  z-index: 10;
  opacity: 0.9;
  transition: all 0.6s ease-in-out;
}

/* 修改 logo 的移动效果 */
.form-container.active .logo-image {
  left: 320px;
}

/* 添加欢迎语样式 */
.welcome-text {
  text-align: center;
  font-size: 28px;
  font-weight: bold;
  color: #5eb69c;
  padding: 20px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 2px;
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.back-home {
  position: fixed;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background: rgba(94, 182, 156, 0.1);
  border: 2px solid #5eb69c;
  border-radius: 25px;
  color: #5eb69c;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  z-index: 1000;
}

.back-icon {
  font-size: 20px;
  margin-right: 8px;
  transition: transform 0.3s ease;
}

.back-text {
  font-size: 16px;
}

.back-home:hover {
  background: #5eb69c;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(94, 182, 156, 0.2);
}

.back-home:hover .back-icon {
  transform: translateX(-3px);
}
</style>
