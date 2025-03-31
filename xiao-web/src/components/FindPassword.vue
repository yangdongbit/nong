<template>
  <div class="message-container" v-if="errors || successMessage">
    <div class="error-message" v-if="errors">{{ errors }}</div>
    <div class="success-message" v-if="successMessage">{{ successMessage }}</div>
  </div>

  <div class="app">
    <header>
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <img src="http://127.0.0.1:3000/yang/img/img/logo.png" alt="Logo" />
            <span>农乐购</span>
          </div>
          <nav>
            <ul>
              <li>
                <a href="#">欢迎来到农乐购</a>
              </li>
              <li>
                <router-link to="logins">免费注册登录</router-link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
    <main>
      <div class="container" v-if="convert">
        <div class="form-container">
          <h1>找回密码</h1>
          <form>
            <div class="input-box">
              <i class="fas fa-envelope"></i>
              <input type="email" placeholder="请输入邮箱" required v-model="emalin" />
            </div>
            <div class="input-box verification-box">
              <i class="fas fa-key"></i>
              <input type="text" placeholder="请输入验证码" required v-model="usePassword" />
              <button
                type="button"
                @click="getPassword"
                :disabled="isButtonDisabled"
                class="verify-btn"
              >{{ myPassword }}</button>
            </div>
            <button type="submit" class="submit-btn" @click="nextStep">下一步</button>
          </form>
        </div>
      </div>
      <div class="container" v-else>
        <div class="form-container">
          <h1>重置密码</h1>
          <form>
            <div class="input-box password-box">
              <i class="fas fa-lock"></i>
              <input
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入新密码"
                required
                v-model="newPassword"
              />
              <i
                class="password-toggle"
                :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                @click="showPassword = !showPassword"
              ></i>
            </div>
            <button type="submit" class="submit-btn" @click="submiting">确认修改</button>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>
  
  <script setup>
import axios from "axios";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// 响应式数据
const emalin = ref("");
const password = ref("");
const usePassword = ref("");
const myPassword = ref("获取验证码");
const isButtonDisabled = ref(false);
const convert = ref(true); // 跳转到更改密码
const newPassword = ref("");
const errors = ref(""); // 添加错误信息
const successMessage = ref(""); // 添加成功信息

// 添加密码显示/隐藏控制
const showPassword = ref(false);

// 添加一个定时器清理函数
const clearMessage = () => {
  setTimeout(() => {
    errors.value = "";
    successMessage.value = "";
  }, 5000); // 5秒后清除消息
};

// 验证邮箱格式
const validateEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const getPassword = async () => {
  // 先验证邮箱格式
  if (!validateEmail(emalin.value)) {
    errors.value = "请输入正确的邮箱格式";
    clearMessage(); // 添加清理定时器
    return;
  }

  // 先查询是否存在该邮账号
  try {
    const checkResult = await axios({
      url: "/api/yang/check-email",
      method: "POST",
      data: {
        email: emalin.value
      }
    });

    if (checkResult.data === "这个邮箱还没有注册") {
      errors.value = "该邮箱未注册";
      clearMessage(); // 添加清理定时器
      return;
    }

    // 发送验证码
    const result = await axios({
      url: "/api/yang/mailbox",
      method: "POST",
      data: {
        qq: emalin.value
      }
    });

    password.value = result.data;
    successMessage.value = "验证码已发送";
    errors.value = "";
    clearMessage(); // 添加清理定时器

    // 定时器
    let i = 59;
    isButtonDisabled.value = true;
    const intervalId = setInterval(() => {
      i--;
      myPassword.value = `${i}秒后重试`;
      if (i === 0) {
        clearInterval(intervalId);
        isButtonDisabled.value = false;
        myPassword.value = "获取验证码";
      }
    }, 1000);
  } catch (error) {
    errors.value = "发送验证码失败，请稍后重试";
    clearMessage(); // 添加清理定时器
  }
};

const nextStep = e => {
  e.preventDefault(); // 阻止表单默认提交
  if (!usePassword.value) {
    errors.value = "请输入验证码";
    clearMessage(); // 添加清理定时器
    return;
  }
  if (password.value === +usePassword.value) {
    convert.value = false;
    errors.value = "";
    successMessage.value = "验证成功";
    clearMessage(); // 添加清理定时器
  } else {
    errors.value = "验证码错误";
    clearMessage(); // 添加清理定时器
  }
};

const submiting = async e => {
  e.preventDefault(); // 阻止表单默认提交

  if (!newPassword.value) {
    errors.value = "请输入新密码";
    clearMessage(); // 添加清理定时器
    return;
  }

  // 验证密码强度
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  if (!passwordRegex.test(newPassword.value)) {
    errors.value = "密码必须包含大小写字母和数字，且长度至少8位";
    clearMessage(); // 添加清理定时器
    return;
  }

  try {
    const result = await axios({
      url: "/api/yang/resetpassword",
      method: "POST",
      data: {
        email: emalin.value,
        password: newPassword.value
      }
    });

    if (result.data === "修改密码成功！！！") {
      successMessage.value = "密码重置成功";
      errors.value = "";
      clearMessage(); // 添加清理定时器
      // 延迟跳转到登录页
      setTimeout(() => {
        router.push("/logins");
      }, 2000);
    } else {
      errors.value = "密码重置失败";
      clearMessage(); // 添加清理定时器
    }
  } catch (error) {
    errors.value = "系统错误，请稍后重试";
    clearMessage(); // 添加清理定时器
  }
};
</script>
  
  <style scoped>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
}

.app {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #f5f7fa 0%,
    #c3cfe2 100%
  ); /* 使用柔和的渐变背景 */
  position: relative;
}

/* 移除之前的遮罩层样式 */
.app::before {
  display: none;
}

/* 调整表单容器样式 */
.form-container {
  background: white; /* 改为纯白色背景 */
  background-image: url("http://127.0.0.1:3000/yang/img/img/201515-158211451517f1.jpg");
  max-width: 450px;
  margin: 0 auto;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

@keyframes gradientBackground {
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

header {
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 10px 0;
}

.container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  width: 90px;
  margin-right: 10px;
}

.logo span {
  font-size: 20px;
  font-weight: bold;
  color: #4caf50;
}

nav ul {
  list-style-type: none;
  padding: 0;
  display: flex;
}

nav ul li {
  margin-left: 20px;
}

nav ul li a {
  text-decoration: none;
  color: #333;
  font-size: 14px;
}

nav ul li a.active {
  color: #4caf50;
  font-weight: bold;
}

main {
  padding: 40px 0;
}

h1 {
  text-align: center;
  color: #2c3e50;
  font-size: 28px;
  margin-bottom: 30px;
  font-weight: 600;
}

.input-box {
  position: relative;
  margin-bottom: 25px;
}

.input-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
  font-size: 18px;
}

.input-box input {
  width: 100%;
  padding: 15px 15px 15px 45px;
  border: none;
  background: rgba(236, 240, 241, 0.6);
  border-radius: 8px;
  font-size: 16px;
  color: #2c3e50;
  transition: all 0.3s ease;
}

.input-box input:focus {
  background: rgba(236, 240, 241, 0.9);
  box-shadow: 0 0 8px rgba(52, 152, 219, 0.3);
  outline: none;
}

.verification-box {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

.verification-box input {
  flex: 1;
}

.verify-btn {
  min-width: 120px;
  padding: 0 15px;
  border: none;
  border-radius: 8px;
  background: #3498db;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.verify-btn:hover:not(:disabled) {
  background: #2980b9;
}

.verify-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
}

.password-box {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  z-index: 2;
}

.password-toggle:hover {
  color: #2c3e50;
}

.password-box input {
  padding-right: 45px !important;
}

/* 添加动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-container {
  animation: fadeIn 0.5s ease-out;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-container {
    max-width: 90%;
    margin: 20px;
  }
}

.message-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  text-align: center;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translate(-50%, -100%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

.error-message {
  background-color: rgba(255, 68, 68, 0.1);
  color: #ff4444;
  padding: 12px 20px;
  border-radius: 4px;
  border: 1px solid rgba(255, 68, 68, 0.2);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  margin-bottom: 10px;
}

.success-message {
  background-color: rgba(0, 200, 81, 0.1);
  color: #00c851;
  padding: 12px 20px;
  border-radius: 4px;
  border: 1px solid rgba(0, 200, 81, 0.2);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
}
</style>