<template>
  <el-container class="login-container">
    <el-main>
      <el-row justify="center" align="middle" style="height: 100%">
        <el-col :span="20">
          <el-card class="login-box" :body-style="{ padding: 0 }">
            <el-row>
              <!-- 左侧图片 -->
              <el-col :span="14">
                <div class="login-left">
                  <el-image 
                    src="http://127.0.0.1:3000/yang/img/img/region_cover.jpg" 
                    fit="cover"
                    style="width: 100%; height: 100%"
                  />
                </div>
              </el-col>
              
              <!-- 右侧登录表单 -->
              <el-col :span="10">
                <div class="login-right">
                  <div class="login-form">
                    <h2>欢迎来到农乐购</h2>
                    <p class="subtitle">管理员登录</p>
                    
                    <div class="login-tabs">
                      <div 
                        class="tab-item" 
                        :class="{ active: loginType === 'account' }"
                        @click="loginType = 'account'"
                      >
                        <el-icon><User /></el-icon>
                        账号登录
                      </div>
                      <div 
                        class="tab-item" 
                        :class="{ active: loginType === 'email' }"
                        @click="loginType = 'email'"
                      >
                        <el-icon><Message /></el-icon>
                        邮箱登录
                      </div>
                    </div>
                    
                    <el-form 
                      ref="loginFormRef"
                      :model="loginForm"
                      :rules="rules"
                      label-position="top"
                    >
                      <el-form-item prop="username" v-if="loginType === 'account'">
                        <el-input
                          v-model="loginForm.username"
                          :placeholder="loginType === 'account' ? '请输入账号' : '请输入邮箱'"
                          size="large"
                        >
                          <template #prefix>
                            <el-icon><User /></el-icon>
                          </template>
                        </el-input>
                      </el-form-item>
                      
                      <el-form-item prop="email" v-if="loginType === 'email'">
                        <el-input
                          v-model="loginForm.email"
                          placeholder="请输入邮箱"
                          size="large"
                        >
                          <template #prefix>
                            <el-icon><Message /></el-icon>
                          </template>
                        </el-input>
                      </el-form-item>
                      
                      <el-form-item prop="verifyCode" v-if="loginType === 'email'">
                        <div class="verify-code-input">
                          <el-input
                            v-model="loginForm.verifyCode"
                            placeholder="请输入验证码"
                            size="large"
                          >
                            <template #prefix>
                              <el-icon><Key /></el-icon>
                            </template>
                          </el-input>
                          <el-button 
                            type="success" 
                            :disabled="isCountingDown"
                            @click="handleSendCode"
                          >
                            {{ countDownText }}
                          </el-button>
                        </div>
                      </el-form-item>
                      
                      <el-form-item prop="password" v-if="loginType === 'account'">
                        <el-input
                          v-model="loginForm.password"
                          type="password"
                          placeholder="请输入密码"
                          size="large"
                          show-password
                        >
                          <template #prefix>
                            <el-icon><Lock /></el-icon>
                          </template>
                        </el-input>
                      </el-form-item>
                      
                      <div class="remember-forgot">
                        <el-checkbox v-model="loginForm.remember" size="large">
                          记住我
                        </el-checkbox>
                        <el-link type="info" :underline="false" @click="handleForgotPassword">忘记密码？</el-link>
                      </div>
                      
                      <div class="agreement">
                        <el-checkbox v-model="loginForm.agreement" size="large">
                          我已阅读并同意
                        </el-checkbox>
                        <el-link 
                          type="success" 
                          :underline="false"
                          @click="showAgreement"
                        >
                          《使用需知》
                        </el-link>
                      </div>
                      
                      <el-button 
                        type="success" 
                        class="login-button" 
                        size="large"
                        @click="handleLogin"
                      >
                        登录
                      </el-button>
                    </el-form>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock, Message, Key } from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus'
import axios from 'axios'

const router = useRouter()

interface LoginForm {
  username: string
  email: string
  password: string
  verifyCode: string
  remember: boolean
  agreement: boolean
}

const loginForm = reactive<LoginForm>({
  username: '',
  email: '',
  password: '',
  verifyCode: '',
  remember: false,
  agreement: false
})

const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  verifyCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
})

const loginFormRef = ref<FormInstance>()

const loginType = ref('account')

const isCountingDown = ref(false)
const countdown = ref(60)
const countDownText = computed(() => {
  return isCountingDown.value ? `${countdown.value}s后重新获取` : '获取验证码'
})

const emailVerifyPassword = ref('')

const handleSendCode = async () => {
  if (!loginForm.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }
  
  try {
    const checkResult = await axios({
      url: "/api/yang/check-email",
      method: "POST",
      data: {
        email: loginForm.email
      }
    });

    if (checkResult.data === "这个邮箱还没有注册") {
      ElMessage.error('邮箱未注册')
      return
    }

    const result = await axios({
      url: "/api/yang/mailbox",
      method: "POST",
      data: {
        qq: loginForm.email
      }
    });

    emailVerifyPassword.value = result.data
    ElMessage.success('验证码已发送，请注意查收')
    
    isCountingDown.value = true
    countdown.value = 60
    
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
        isCountingDown.value = false
        countdown.value = 60
      }
    }, 1000)
    
  } catch (error) {
    console.error('发送验证码失败:', error)
    ElMessage.error('发送验证码失败，请稍后重试')
  }
}

const showAgreement = () => {
  ElMessageBox.alert(
    `
    1. 本系统仅供农乐购管理员使用，请妥善保管您的账号密码。
    2. 管理员需要对发布的商品信息真实性负责。
    3. 请及时处理用户反馈和订单信息。
    4. 定期更新商品信息，确保库存信息准确。
    5. 遵守相关法律法规，不得发布违规商品信息。
    `,
    '使用需知',
    {
      confirmButtonText: '我知道了',
      customClass: 'agreement-dialog'
    }
  )
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  if (!loginForm.agreement) {
    ElMessage.warning('请阅读并同意使用需知')
    return
  }
  
  try {
    await loginFormRef.value.validate()
    
    if (loginType.value === 'account') {
      axios({
        url: '/api/logins',
        method: 'POST',
        data: {
          name: loginForm.username,
          password: loginForm.password
        }
      }).then(result => {
        if (Object.keys(result.data).length === 0) {
          ElMessage.error('账号密码错误')
        } else {
          ElMessage.success('登录成功')
          // 存储用户信息到本地
          localStorage.setItem('userInfo', JSON.stringify(result.data))
          console.log(result.data.administrator);   // 判断是不是管理员
          router.push('/admin')
        }
      })
      
    } else {
      if (!loginForm.verifyCode) {
        ElMessage.warning('请输入验证码')
        return
      }

      if (Number(loginForm.verifyCode) === Number(emailVerifyPassword.value)) {
        const loginResult = await axios({
          url: '/api/yang/emailLogin',
          method: 'POST',
          data: {
            email: loginForm.email
          }
        })

        if (loginResult.data.length > 0) {
          ElMessage.success('登录成功')
          // 存储用户信息到本地
          localStorage.setItem('userInfo', JSON.stringify(loginResult.data))
          router.push('/admin')
        } else {
          ElMessage.error('登录失败')
        }
      } else {
        ElMessage.error('验证码错误')
        return
      }
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请检查输入信息')
  }
}

const handleForgotPassword = () => {
  ElMessageBox.alert(
    '请联系管理员或前往前台处理忘记密码事宜。',
    '忘记密码',
    {
      confirmButtonText: '我知道了',
      type: 'info'
    }
  )
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  background-color: #f5f7fa;
}

.login-box {
  height: 600px;
  border-radius: 20px;
  overflow: hidden;
}

.login-left {
  height: 600px;
  overflow: hidden;
}

.login-right {
  margin-top: -50px;
  padding: 50px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-form {
  width: 100%;
  max-width: 380px;
  margin: 0 auto;
}

h2 {
  color: var(--el-color-success);
  text-align: center;
  margin-bottom: 15px;
  font-size: 32px;
}

.subtitle {
  color: var(--el-text-color-secondary);
  text-align: center;
  margin-bottom: 35px;
  font-size: 18px;
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 25px 0;
  padding: 0 2px;
}

.agreement {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.login-button {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
}

:deep(.el-form-item__content) {
  line-height: normal;
}

:deep(.agreement-dialog) {
  .el-message-box__content {
    padding: 20px;
    line-height: 1.8;
    white-space: pre-line;
  }
}

.login-tabs {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 15px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.tab-item:hover {
  color: var(--el-color-success);
}

.tab-item.active {
  color: var(--el-color-success);
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 20%;
  width: 60%;
  height: 2px;
  background-color: var(--el-color-success);
  transition: all 0.3s;
}

.verify-code-input {
  display: flex;
  gap: 12px;
}

.verify-code-input .el-input {
  flex: 1;
}

.verify-code-input .el-button {
  width: 120px;
  white-space: nowrap;
}
</style>
  
  