<template>
  <div class="profile-container">
    <!-- 顶部个人信息卡片 -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-8">
      <!-- 顶部背景图 -->
      <div class="h-48 bg-blue-50 dark:bg-slate-600 relative">
        <div class="absolute inset-0 bg-pattern opacity-7"></div>
      </div>

      <!-- 个人信息区 -->
      <div class="px-8 -mt-20 pb-8">
        <div class="flex flex-col lg:flex-row items-start gap-8">
          <!-- 左侧头像 -->
          <div class="profile-avatar-wrapper flex-shrink-0 mx-auto lg:mx-0">
            <SelectImage
                v-model="userStore.userInfo.headerImg"
                file-type="image"
                rounded
            />
          </div>

          <!-- 右侧信息 -->
          <div class="flex-1 pt-12 lg:pt-20 w-full">
            <div
                class="flex flex-col lg:flex-row items-start lg:items-start justify-between gap-4"
            >
              <div class="lg:mt-4">
                <div class="flex items-center gap-4 mb-4">
                  <div
                      v-if="!editFlag"
                      class="text-2xl font-bold flex items-center gap-3 text-gray-800 dark:text-gray-100"
                  >
                    {{ userStore.userInfo.nickName }}
                    <el-icon
                        class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
                        @click="openEdit"
                    >
                      <edit />
                    </el-icon>
                  </div>
                  <div v-else class="flex items-center">
                    <el-input v-model="nickName" class="w-48 mr-4" />
                    <el-button type="primary" plain @click="enterEdit">
                      确认
                    </el-button>
                    <el-button type="danger" plain @click="closeEdit">
                      取消
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="grid lg:grid-cols-12 md:grid-cols-1 gap-8">
      <!-- 左侧信息栏 -->
      <div class="lg:col-span-4">
        <!-- 基本信息 -->
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6 profile-card">
          <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <el-icon class="text-blue-500"><info-filled /></el-icon>
            基本信息
          </h2>
          <div class="space-y-4">
            <div class="flex items-center gap-1 lg:gap-3 text-gray-600 dark:text-gray-300">
              <el-icon class="text-blue-500"><phone /></el-icon>
              <span class="font-medium">手机号码：</span>
              <span>{{ userStore.userInfo.phone || '未设置' }}</span>
            </div>
            <div class="flex items-center gap-1 lg:gap-3 text-gray-600 dark:text-gray-300">
              <el-icon class="text-green-500"><message /></el-icon>
              <span class="font-medium flex-shrink-0">邮箱地址：</span>
              <span>{{ userStore.userInfo.email || '未设置' }}</span>
            </div>
            <div class="flex items-center gap-1 lg:gap-3 text-gray-600 dark:text-gray-300">
              <el-icon class="text-purple-500"><lock /></el-icon>
              <span class="font-medium">账号密码：</span>
              <span>已设置</span>
              <el-button
                  link
                  type="primary"
                  class="ml-auto"
                  @click="showPassword = true"
              >
                修改
              </el-button>
            </div>
          </div>
        </div>

        <!-- 安全设置 - 谷歌验证器 -->
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 profile-card">
          <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <el-icon class="text-orange-500"><key /></el-icon>
            谷歌验证器
          </h2>

          <!-- 已绑定状态 -->
          <div v-if="userStore.userInfo.googleAuthStatus" class="text-center py-8">
            <div class="w-20 h-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <el-icon class="text-green-500 text-4xl"><circle-check /></el-icon>
            </div>
            <div class="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">已绑定谷歌验证器</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">您的账户已开启二次验证保护</div>
          </div>

          <!-- 未绑定状态 - 直接显示二维码 -->
          <div v-else class="bind-section">
            <el-alert
                title="提示"
                type="info"
                :closable="false"
                class="mb-4"
            >
              绑定谷歌验证器后，修改敏感配置时需要输入验证码
            </el-alert>

            <!-- 二维码区域 -->
            <div class="qrcode-area text-center mb-4">
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
                请使用谷歌验证器APP扫描下方二维码
              </p>
              <div class="qrcode-wrapper inline-block p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <el-image
                    v-if="qrcodeUrl"
                    :src="qrcodeUrl"
                    style="width: 180px; height: 180px"
                    fit="contain"
                />
                <el-skeleton v-else animated style="width: 180px; height: 180px" />
              </div>
            </div>

            <!-- 密钥 -->
            <div class="secret-area mb-4">
              <div class="text-sm text-gray-600 dark:text-gray-300 mb-2">
                或手动输入密钥：
              </div>
              <el-input v-model="secretKey" readonly size="small">
                <template #append>
                  <el-button @click="copySecret" size="small">
                    <el-icon><document-copy /></el-icon>
                  </el-button>
                </template>
              </el-input>
            </div>

            <!-- 绑定表单 -->
            <el-form :model="bindForm" ref="bindFormRef" :rules="bindRules">
              <el-form-item prop="code">
                <el-input
                    v-model="bindForm.code"
                    placeholder="请输入6位验证码"
                    maxlength="6"
                    size="large"
                >
                  <template #prefix>
                    <el-icon><lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item>
                <el-button
                    type="primary"
                    :loading="bindLoading"
                    @click="handleBindSubmit"
                    class="w-full"
                    size="large"
                >
                  立即绑定
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <el-dialog
        v-model="showPassword"
        title="修改密码"
        width="400px"
        class="custom-dialog"
        @close="clearPassword"
    >
      <el-form
          ref="modifyPwdForm"
          :model="pwdModify"
          :rules="rules"
          label-width="90px"
          class="py-4"
      >
        <el-form-item :minlength="6" label="原密码" prop="password">
          <el-input v-model="pwdModify.password" show-password />
        </el-form-item>
        <el-form-item :minlength="6" label="新密码" prop="newPassword">
          <el-input v-model="pwdModify.newPassword" show-password />
        </el-form-item>
        <el-form-item :minlength="6" label="确认密码" prop="confirmPassword">
          <el-input v-model="pwdModify.confirmPassword" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPassword = false">取 消</el-button>
          <el-button type="primary" @click="savePassword">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { setSelfInfo, changePassword } from '@/api/user.js'
import { getGoogleAuthQrcode, bindGoogleAuth } from '@/api/googleVerify.js'
import { reactive, ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/pinia/modules/user'
import SelectImage from '@/components/selectImage/selectImage.vue'
import QRCode from 'qrcode'

defineOptions({
  name: 'Person'
})

const userStore = useUserStore()
const modifyPwdForm = ref(null)
const showPassword = ref(false)
const pwdModify = ref({})
const nickName = ref('')
const editFlag = ref(false)

// 谷歌验证器相关
const qrcodeUrl = ref('')
const secretKey = ref('')
const bindLoading = ref(false)

const bindForm = ref({ code: '' })
const bindFormRef = ref(null)

const bindRules = {
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '请输入6位数字验证码', trigger: 'blur' }
  ]
}

const rules = reactive({
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '最少6个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '最少6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请输入确认密码', trigger: 'blur' },
    { min: 6, message: '最少6个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== pwdModify.value.newPassword) {
          callback(new Error('两次密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 获取谷歌验证器二维码
const fetchGoogleQrcode = async () => {
  // 如果已绑定，不需要获取二维码
  if (userStore.userInfo.googleAuthStatus) {
    return
  }
  try {
    const res = await getGoogleAuthQrcode()
    if (res.code === 0) {
      const {isBound,qrcode,secret} = res.data
      if(isBound === true){
        return
      }
      // 使用 qrcode 库转换成 Base64 图片
      QRCode.toDataURL(qrcode, {
        width: 200,      // 二维码宽度
        margin: 1,       // 边距
        color: {
          dark: '#000000',   // 前景色
          light: '#FFFFFF'   // 背景色
        }
      }).then(url => {
        qrcodeUrl.value = url  // 这是 data:image/png;base64,... 格式
      })
      secretKey.value = secret
    } else {
      ElMessage.error(res.msg || '获取二维码失败')
    }
  } catch (error) {
    console.error('获取二维码失败', error)
  }
}

// 复制密钥
const copySecret = () => {
  navigator.clipboard.writeText(secretKey.value)
  ElMessage.success('密钥已复制到剪贴板')
}

// 绑定谷歌验证器
const handleBindSubmit = async () => {
  await bindFormRef.value.validate(async (valid) => {
    if (valid) {
      bindLoading.value = true
      try {
        const res = await bindGoogleAuth({
          secret: secretKey.value,
          code: bindForm.value.code
        })

        if (res.code === 0) {
          ElMessage.success('绑定成功')
          // 更新用户信息中的谷歌验证器状态
          userStore.ResetUserInfo({ googleAuthStatus: true })
          bindForm.value.code = ''
        } else {
          ElMessage.error(res.msg || '绑定失败，请检查验证码是否正确')
        }
      } catch (error) {
        ElMessage.error('绑定失败')
      } finally {
        bindLoading.value = false
      }
    }
  })
}

const savePassword = async () => {
  modifyPwdForm.value.validate((valid) => {
    if (valid) {
      changePassword({
        password: pwdModify.value.password,
        newPassword: pwdModify.value.newPassword
      }).then((res) => {
        if (res.code === 0) {
          ElMessage.success('修改密码成功！')
        }
        showPassword.value = false
      })
    }
  })
}

const clearPassword = () => {
  pwdModify.value = {
    password: '',
    newPassword: '',
    confirmPassword: ''
  }
  modifyPwdForm.value?.clearValidate()
}

const openEdit = () => {
  nickName.value = userStore.userInfo.nickName
  editFlag.value = true
}

const closeEdit = () => {
  nickName.value = ''
  editFlag.value = false
}

const enterEdit = async () => {
  const res = await setSelfInfo({
    nickName: nickName.value
  })
  if (res.code === 0) {
    userStore.ResetUserInfo({ nickName: nickName.value })
    ElMessage.success('修改成功')
  }
  nickName.value = ''
  editFlag.value = false
}

watch(() => userStore.userInfo.headerImg, async(val) => {
  const res = await setSelfInfo({ headerImg: val })
  if (res.code === 0) {
    userStore.ResetUserInfo({ headerImg: val })
    ElMessage({
      type: 'success',
      message: '设置成功',
    })
  }
})

// 页面加载时获取二维码（如果未绑定）
onMounted(() => {
  fetchGoogleQrcode()
})
</script>

<style lang="scss" scoped>
.profile-container {
  @apply p-4 lg:p-6 min-h-screen bg-gray-50 dark:bg-slate-900;

  .bg-pattern {
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }

  .profile-card {
    @apply shadow-sm hover:shadow-md transition-shadow duration-300;
  }

  .custom-dialog {
    :deep(.el-dialog__header) {
      @apply mb-0 pb-4 border-b border-gray-100 dark:border-gray-700;
    }
    :deep(.el-dialog__footer) {
      @apply mt-0 pt-4 border-t border-gray-100 dark:border-gray-700;
    }
    :deep(.el-input__wrapper) {
      @apply shadow-none;
    }
    :deep(.el-input__prefix) {
      @apply mr-2;
    }
  }

  .bind-section {
    .qrcode-wrapper {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>