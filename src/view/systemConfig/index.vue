<template>
  <div class="system">
    <el-tabs v-model="activeScope" @tab-change="handleTabChange">
      <!-- 站点配置 -->
      <el-tab-pane label="站点配置" name="website">
        <el-form ref="websiteFormRef" :model="websiteConfig" :rules="websiteRules" label-width="240px" class="mt-3.5">
          <el-form-item label="站点名称" prop="website_name">
            <el-input
                v-model="websiteConfig.website_name"
                placeholder="请输入站点名称"
                clearable
            />
          </el-form-item>
          <el-form-item label="站点域名" prop="website_domain">
            <el-input
                v-model="websiteConfig.website_domain"
                placeholder="请输入站点域名，例如：https://www.example.com"
                clearable
            />
          </el-form-item>
          <el-form-item label="站点Logo" prop="website_logo">
            <el-input
                v-model="websiteConfig.website_logo"
                placeholder="请输入Logo URL"
                clearable
            />
            <div v-if="websiteConfig.website_logo" class="mt-2">
              <el-image
                  :src="websiteConfig.website_logo"
                  style="width: 100px; height: 100px"
                  fit="contain"
              />
            </div>
          </el-form-item>
          <el-form-item label="站点描述" prop="website_description">
            <el-input
                v-model="websiteConfig.website_description"
                type="textarea"
                :rows="3"
                placeholder="请输入站点描述"
                maxlength="200"
                show-word-limit
            />
          </el-form-item>
          <el-form-item label="站点关键词" prop="website_keywords">
            <el-input
                v-model="websiteConfig.website_keywords"
                placeholder="请输入站点关键词，多个关键词用逗号分隔"
                clearable
            />
          </el-form-item>
          <el-form-item label="网站开关" prop="website_switch">
            <el-switch
                v-model="websiteConfig.website_switch"
                active-text="开启"
                inactive-text="关闭"
            />
            <div class="text-sm text-gray-500 mt-1">
              关闭后前台将无法访问
            </div>
          </el-form-item>
          <el-form-item label="关闭提示" prop="website_close_tip" v-if="!websiteConfig.website_switch">
            <el-input
                v-model="websiteConfig.website_close_tip"
                type="textarea"
                :rows="2"
                placeholder="网站关闭时显示的提示信息"
            />
          </el-form-item>
          <el-form-item label="ICP备案号" prop="website_icp">
            <el-input
                v-model="websiteConfig.website_icp"
                placeholder="请输入ICP备案号"
                clearable
            />
          </el-form-item>
          <el-form-item label="版权信息" prop="copyright">
            <el-input
                v-model="websiteConfig.copyright"
                placeholder="例如：© 2025 Your Company. All rights reserved."
                clearable
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 客服配置 -->
      <el-tab-pane label="客服配置" name="service">
        <el-form ref="serviceFormRef" :model="serviceConfig" :rules="serviceRules" label-width="240px" class="mt-3.5">
          <el-form-item label="客服开关" prop="enabled">
            <el-switch
                v-model="serviceConfig.enabled"
                active-text="开启"
                inactive-text="关闭"
            />
          </el-form-item>
          <el-form-item label="QQ客服" prop="qq">
            <el-input
                v-model.trim="serviceConfig.qq"
                placeholder="请输入QQ号"
                clearable
            />
          </el-form-item>
          <el-form-item label="微信客服" prop="wechat">
            <el-input
                v-model.trim="serviceConfig.wechat"
                placeholder="请输入微信号"
                clearable />

          </el-form-item>
          <el-form-item label="微信二维码" prop="wechat_qrcode">
            <el-input
                v-model.trim="serviceConfig.wechat_qrcode"
                placeholder="请输入微信二维码图片URL"
                clearable
            >
              <template #append>
                <el-button icon="upload" @click="showIconUpload = true">上传</el-button>
              </template>
            </el-input>
            <div v-if="serviceConfig.wechat_qrcode" class="mt-2">
              <CustomPic pic-type="file" :pic-src="serviceConfig.wechat_qrcode" preview style="width: 150px; height: 150px"/>
            </div>
          </el-form-item>
          <el-form-item label="电话客服" prop="phone">
            <el-input
                v-model.trim="serviceConfig.phone"
                placeholder="请输入客服电话"
                clearable
            />
          </el-form-item>
          <el-form-item label="邮箱客服" prop="email">
            <el-input
                v-model.trim="serviceConfig.email"
                placeholder="请输入客服邮箱"
                clearable
            />
          </el-form-item>
          <el-form-item label="是否开启第三方IM" prop="im_switch">
            <el-switch
                v-model="serviceConfig.im_switch"
                active-text="开启"
                inactive-text="关闭"
            />
          </el-form-item>
          <el-form-item label="在线客服" prop="im_link">
            <el-input
                v-model.trim="serviceConfig.im_link"
                placeholder="请输入在线客服IM链接"
                clearable
            />
          </el-form-item>
          <el-form-item label="工作时间" prop="work_time">
            <el-input
                v-model.trim="serviceConfig.work_time"
                placeholder="例如：周一至周五 9:00-18:00"
                clearable
            />
          </el-form-item>
          <el-form-item label="客服通知" prop="notice">
            <el-input
                v-model.trim="serviceConfig.notice"
                placeholder="例如：非工作时间留言，我们会尽快回复"
                clearable
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 提现规则配置 -->
      <el-tab-pane label="用户提现规则" name="commission">
        <el-form ref="commissionFormRef" :model="commissionConfig" :rules="commissionRules" label-width="240px" class="mt-3.5">
          <el-form-item label="最低提现金额" prop="minWithdraw">
            <el-input-number
                v-model="commissionConfig.minWithdraw"
                :min="1"
                :max="10000"
                :precision="2"
                :step="10"
                placeholder="请输入最低提现金额"
                class="w-full"
            />
            <div class="text-sm text-gray-500 mt-1">
              用户可提现的最低金额限制（元）
            </div>
          </el-form-item>

          <el-form-item label="单次最高提现" prop="maxWithdraw">
            <el-input-number
                v-model="commissionConfig.maxWithdraw"
                :min="100"
                :max="100000"
                :precision="2"
                :step="100"
                placeholder="请输入单次最高提现金额"
                class="w-full"
            />
            <div class="text-sm text-gray-500 mt-1">
              单次提现的最高金额限制（元）
            </div>
          </el-form-item>

          <el-form-item label="每日提现次数" prop="dailyWithdrawCount">
            <el-input-number
                v-model="commissionConfig.dailyWithdrawCount"
                :min="1"
                :max="10"
                :step="1"
                placeholder="请输入每日提现次数"
                class="w-full"
            />
            <div class="text-sm text-gray-500 mt-1">
              每个用户每天可以提现的次数
            </div>
          </el-form-item>

          <el-form-item label="结算周期" prop="settlementCycle">
            <el-input
                v-model="commissionConfig.settlementCycle"
                placeholder="例如：订单完成后立即结算"
                clearable
            />
            <div class="text-sm text-gray-500 mt-1">
              佣金结算到账的周期说明
            </div>
          </el-form-item>

          <el-form-item label="提现手续费" prop="withdrawFee">
            <el-input-number
                v-model="commissionConfig.withdrawFee"
                :min="0"
                :max="10"
                :precision="2"
                :step="0.1"
                placeholder="请输入提现手续费比例"
                class="w-full"
            />
            <span class="ml-2">%</span>
            <div class="text-sm text-gray-500 mt-1">
              提现时收取的手续费比例，0表示不收取手续费
            </div>
          </el-form-item>

          <el-form-item label="提现到账时间" prop="withdrawProcessDays">
            <el-input
                v-model="commissionConfig.withdrawProcessDays"
                placeholder="例如：1-3个工作日"
                clearable
            />
            <div class="text-sm text-gray-500 mt-1">
              提现申请审核通过后到账的时间说明
            </div>
          </el-form-item>

          <el-divider content-position="left">规则说明</el-divider>

          <el-descriptions :column="1" border>
            <el-descriptions-item label="当前最低提现">
              ¥{{ commissionConfig.minWithdraw }}
            </el-descriptions-item>
            <el-descriptions-item label="当前最高提现">
              ¥{{ commissionConfig.maxWithdraw }}
            </el-descriptions-item>
            <el-descriptions-item label="每日提现次数">
              {{ commissionConfig.dailyWithdrawCount }}次
            </el-descriptions-item>
            <el-descriptions-item label="手续费率">
              {{ commissionConfig.withdrawFee }}%
            </el-descriptions-item>
            <el-descriptions-item label="结算周期">
              {{ commissionConfig.settlementCycle }}
            </el-descriptions-item>
            <el-descriptions-item label="到账时间">
              {{ commissionConfig.withdrawProcessDays }}
            </el-descriptions-item>
          </el-descriptions>
        </el-form>
      </el-tab-pane>

      <!-- SEO配置 -->
      <el-tab-pane label="SEO配置" name="seo">
        <el-form ref="seoFormRef" :model="seoConfig" :rules="seoRules" label-width="240px" class="mt-3.5">
          <el-form-item label="默认标题" prop="seo_title">
            <el-input
                v-model="seoConfig.seo_title"
                placeholder="请输入默认页面标题"
                clearable
            />
          </el-form-item>
          <el-form-item label="默认描述" prop="seo_description">
            <el-input
                v-model="seoConfig.seo_description"
                type="textarea"
                :rows="3"
                placeholder="请输入默认页面描述"
                maxlength="200"
                show-word-limit
            />
          </el-form-item>
          <el-form-item label="默认关键词" prop="seo_keywords">
            <el-input
                v-model="seoConfig.seo_keywords"
                placeholder="请输入默认关键词，多个用逗号分隔"
                clearable
            />
          </el-form-item>
          <el-form-item label="百度统计代码" prop="baidu_analytics">
            <el-input
                v-model="seoConfig.baidu_analytics"
                type="textarea"
                :rows="3"
                placeholder="请输入百度统计代码"
            />
          </el-form-item>
          <el-form-item label="Google Analytics" prop="google_analytics">
            <el-input
                v-model="seoConfig.google_analytics"
                placeholder="请输入Google Analytics ID，例如：G-XXXXXXXXXX"
                clearable
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <div class="mt-4 flex gap-3">
      <el-button type="primary" :loading="loading" @click="handleSave">
        <el-icon class="mr-1"><Check /></el-icon>
        保存配置
      </el-button>
      <el-button @click="handleReset">
        <el-icon class="mr-1"><Refresh /></el-icon>
        重置
      </el-button>
    </div>

    <!-- 图标上传弹窗 -->
    <el-dialog v-model="showIconUpload" title="上传应用图标" width="500px" :show-close="false">
      <div class="upload-section">
        <div class="upload-tip">
          <el-alert
              title="图片要求"
              type="info"
              :closable="false"
              description="建议上传正方形图片，支持 jpg、png、svg、webp 格式，文件大小不超过 500KB"
          />
        </div>
        <div class="upload-area">
          <upload-common
              :classId="0"
              @on-success="onIconUploadSuccess"
          />
        </div>
        <div v-if="serviceConfig.wechat_qrcode" class="preview-area">
          <h4>当前图标预览：</h4>
          <CustomPic pic-type="file" :pic-src="serviceConfig.wechat_qrcode" preview/>
        </div>
      </div>
      <template #footer>
        <el-button @click="showIconUpload = false">取消</el-button>
        <el-button type="primary" @click="showIconUpload = false" :disabled="!serviceConfig.wechat_qrcode">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 谷歌验证码组件 -->
    <GoogleVerify
        v-model="showVerifyDialog"
        title="安全验证"
        alert-message="您正在修改提现规则配置，请输入谷歌验证码以确认操作"
        confirm-text="验证并保存"
        @confirm="handleVerifyConfirm"
        @cancel="handleVerifyCancel"
    />
  </div>
</template>

<script setup>
import { getScopeConfig, setScopeConfig } from '@/api/system'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Refresh } from '@element-plus/icons-vue'
import UploadCommon from '@/components/upload/common.vue'
import CustomPic from '@/components/customPic/index.vue'
import GoogleVerify from '@/components/GoogleVerify/index.vue'

defineOptions({
  name: 'SystemConfig'
})

const activeScope = ref('website')
const loading = ref(false)
const showIconUpload = ref(false)
const showVerifyDialog = ref(false)

// 各个scope的form ref
const websiteFormRef = ref(null)
const serviceFormRef = ref(null)
const commissionFormRef = ref(null)
const seoFormRef = ref(null)

// 站点配置
const websiteConfig = ref({
  website_name: '',
  website_domain: '',
  website_logo: '',
  website_description: '',
  website_keywords: '',
  website_switch: true,
  website_close_tip: '网站维护中，请稍后访问',
  website_icp: '',
  copyright: ''
})

// 客服配置
const serviceConfig = ref({
  enabled: true,
  qq: '',
  wechat: '',
  wechat_qrcode: '',
  phone: '',
  email: '',
  im_switch: false,
  im_type: '',
  im_link: '',
  work_time: '',
  notice: ''
})

// 提现规则配置
const commissionConfig = ref({
  minWithdraw: 10,
  maxWithdraw: 5000,
  dailyWithdrawCount: 3,
  settlementCycle: '订单完成后立即结算',
  withdrawFee: 0,
  withdrawProcessDays: '1-3个工作日'
})

// SEO配置
const seoConfig = ref({
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  baidu_analytics: '',
  google_analytics: ''
})

// 验证规则
const websiteRules = {
  website_name: [
    { required: true, message: '请输入站点名称', trigger: 'blur' }
  ],
  website_domain: [
    { pattern: /^https?:\/\/.*/, message: '请输入完整的URL', trigger: 'blur' }
  ]
}

const serviceRules = {
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const commissionRules = {
  minWithdraw: [
    { required: true, message: '请输入最低提现金额', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value >= commissionConfig.value.maxWithdraw) {
          callback(new Error('最低提现金额必须小于最高提现金额'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  maxWithdraw: [
    { required: true, message: '请输入单次最高提现金额', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value <= commissionConfig.value.minWithdraw) {
          callback(new Error('最高提现金额必须大于最低提现金额'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  dailyWithdrawCount: [
    { required: true, message: '请输入每日提现次数', trigger: 'blur' }
  ],
  settlementCycle: [
    { required: true, message: '请输入结算周期', trigger: 'blur' }
  ],
  withdrawProcessDays: [
    { required: true, message: '请输入提现到账时间', trigger: 'blur' }
  ]
}

const seoRules = {}

// 图标上传成功回调
const onIconUploadSuccess = (url) => {
  serviceConfig.value.wechat_qrcode = url
  ElMessage.success('图标上传成功')
  showIconUpload.value = false
}

// 获取当前激活的配置对象
const currentConfig = computed(() => {
  const configMap = {
    website: websiteConfig.value,
    service: serviceConfig.value,
    commission: commissionConfig.value,
    seo: seoConfig.value
  }
  return configMap[activeScope.value]
})

// 获取当前激活的form ref
const currentFormRef = computed(() => {
  const formRefMap = {
    website: websiteFormRef.value,
    service: serviceFormRef.value,
    commission: commissionFormRef.value,
    seo: seoFormRef.value
  }
  return formRefMap[activeScope.value]
})

// 判断是否为敏感配置（需要谷歌验证码）
const isSensitiveScope = (scope) => {
  return scope === 'commission'
}

// 加载配置
const loadConfig = async (scope) => {
  loading.value = true
  try {
    const res = await getScopeConfig({ scope })
    if (res.code === 0) {
      const configMap = {
        website: websiteConfig,
        service: serviceConfig,
        commission: commissionConfig,
        seo: seoConfig
      }
      // 合并配置，保留默认值
      configMap[scope].value = { ...configMap[scope].value, ...res.data.config }
    }
  } catch (error) {
    ElMessage.error(`获取${scope}配置失败`)
  } finally {
    loading.value = false
  }
}

// Tab切换
const handleTabChange = (name) => {
  loadConfig(name)
}

// 保存配置
const handleSave = async () => {
  if (!currentFormRef.value) return

  await currentFormRef.value.validate(async (valid) => {
    if (valid) {
      // 如果是敏感配置（提现规则），需要谷歌验证码
      if (isSensitiveScope(activeScope.value)) {
        showVerifyDialog.value = true
        return
      }

      // 非敏感配置直接保存
      await saveConfig()
    } else {
      ElMessage.warning('请检查表单填写是否正确')
    }
  })
}

// 谷歌验证确认回调
const handleVerifyConfirm = async (code, setLoading) => {
  await saveConfig(code, setLoading)
}

// 谷歌验证取消回调
const handleVerifyCancel = () => {
  console.log('用户取消了验证')
}

// 实际保存配置的方法
const saveConfig = async (googleCode = '', setLoading = null) => {
  // 如果有 setLoading 函数，使用组件的 loading 状态
  if (setLoading) {
    setLoading(true)
  } else {
    loading.value = true
  }

  try {
    const res = await setScopeConfig({
      scope: activeScope.value,
      config: currentConfig.value,
      googleCode: googleCode || undefined
    })

    if (res.code === 0) {
      ElMessage.success('配置保存成功')
      showVerifyDialog.value = false
      await loadConfig(activeScope.value)
    } else {
      ElMessage.error(res.msg || '配置保存失败')
    }
  } catch (error) {
    ElMessage.error(error.msg || '配置保存失败')
  } finally {
    if (setLoading) {
      setLoading(false)
    } else {
      loading.value = false
    }
  }
}

// 重置表单
const handleReset = () => {
  currentFormRef.value?.resetFields()
  loadConfig(activeScope.value)
}

// 初始化加载第一个tab的配置
loadConfig(activeScope.value)
</script>

<style lang="scss" scoped>
.system {
  @apply bg-white p-9 rounded dark:bg-slate-900;

  :deep(.el-form-item__label) {
    font-weight: 500;
  }

  :deep(.el-tabs__item) {
    font-size: 15px;
  }

  :deep(.el-input-number) {
    width: 100%;
  }
}

.upload-section {
  .upload-tip {
    margin-bottom: 16px;
  }

  .upload-area {
    margin-bottom: 16px;
  }

  .preview-area {
    h4 {
      margin-bottom: 12px;
      font-size: 14px;
      color: #606266;
    }
  }
}
</style>