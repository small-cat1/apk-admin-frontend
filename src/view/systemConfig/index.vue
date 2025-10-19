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
          <el-form-item label="是否开三方IM" prop="im_switch">
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

      <!-- 支付配置 -->
      <el-tab-pane label="支付配置" name="pay">
        <el-form ref="payFormRef" :model="payConfig"  label-width="240px" class="mt-3.5">
          <el-form-item label="支付开关" prop="pay_switch">
            <el-switch
                v-model="payConfig.pay_switch"
                active-text="开启"
                inactive-text="关闭"
            />
          </el-form-item>
          <el-form-item label="微信支付" prop="wechat_pay_enabled">
            <el-switch
                v-model="payConfig.wechat_pay_enabled"
                active-text="启用"
                inactive-text="禁用"
            />
          </el-form-item>
          <el-form-item label="支付宝支付" prop="alipay_enabled">
            <el-switch
                v-model="payConfig.alipay_enabled"
                active-text="启用"
                inactive-text="禁用"
            />
          </el-form-item>
          <el-form-item label="支付回调地址" prop="pay_callback_url">
            <el-input
                v-model="payConfig.pay_callback_url"
                placeholder="请输入支付回调地址"
                clearable
            />
          </el-form-item>
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
  </div>
</template>

<script setup>
import { getScopeConfig, setScopeConfig } from '@/api/system'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Refresh } from '@element-plus/icons-vue'
import UploadCommon from '@/components/upload/common.vue'
import CustomPic from '@/components/customPic/index.vue'
defineOptions({
  name: 'SystemConfig'
})

const activeScope = ref('website')
const loading = ref(false)
// 图标上传控制
const showIconUpload = ref(false)
// 各个scope的form ref
const websiteFormRef = ref(null)
const serviceFormRef = ref(null)
const payFormRef = ref(null)
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
  enabled:true,
  qq: '',
  wechat: '',
  wechat_qrcode: '',
  phone: '',
  email: '',
  im_switch:false,
  im_type:'',
  im_link: '',
  work_time: '',
  notice:''
})

// 支付配置
const payConfig = ref({
  pay_switch: true,
  wechat_pay_enabled: false,
  alipay_enabled: false,
  pay_callback_url: ''
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
    pay: payConfig.value,
    seo: seoConfig.value
  }
  return configMap[activeScope.value]
})

// 获取当前激活的form ref
const currentFormRef = computed(() => {
  const formRefMap = {
    website: websiteFormRef.value,
    service: serviceFormRef.value,
    pay: payFormRef.value,
    seo: seoFormRef.value
  }
  return formRefMap[activeScope.value]
})

// 加载配置
const loadConfig = async (scope) => {
  loading.value = true
  try {
    const res = await getScopeConfig({ scope })
    if (res.code === 0) {
      const configMap = {
        website: websiteConfig,
        service: serviceConfig,
        pay: payConfig,
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
      loading.value = true
      try {
        const res = await setScopeConfig({
          scope: activeScope.value,
          config: currentConfig.value
        })
        if (res.code === 0) {
          ElMessage.success('配置保存成功')
          await loadConfig(activeScope.value)
        }
      } catch (error) {
        ElMessage.error('配置保存失败')
      } finally {
        loading.value = false
      }
    } else {
      ElMessage.warning('请检查表单填写是否正确')
    }
  })
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
}
</style>