<!-- GoogleVerify.vue -->
<template>
  <el-dialog
      v-model="dialogVisible"
      :title="title"
      :width="width"
      :close-on-click-modal="false"
      :show-close="showClose"
      @close="handleClose"
  >
    <el-alert
        v-if="showAlert"
        :title="alertTitle"
        :type="alertType"
        :closable="false"
        class="mb-4"
    >
      {{ alertMessage }}
    </el-alert>

    <el-form
        :model="formData"
        ref="formRef"
        :rules="rules"
        label-width="100px"
    >
      <el-form-item label="谷歌验证码" prop="code">
        <el-input
            v-model="formData.code"
            placeholder="请输入6位谷歌验证码"
            maxlength="6"
            clearable
            class="verify-code-input"
            @keyup.enter="handleConfirm"
        >
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>
        <div class="text-sm text-gray-400 mt-1">
          请打开谷歌验证器APP获取验证码
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">{{ cancelText }}</el-button>
      <el-button
          type="primary"
          :loading="loading"
          @click="handleConfirm"
      >
        {{ confirmText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Lock } from '@element-plus/icons-vue'

const props = defineProps({
  // 控制弹窗显示
  modelValue: {
    type: Boolean,
    default: false
  },
  // 弹窗标题
  title: {
    type: String,
    default: '安全验证'
  },
  // 弹窗宽度
  width: {
    type: String,
    default: '450px'
  },
  // 是否显示关闭按钮
  showClose: {
    type: Boolean,
    default: false
  },
  // 是否显示警告提示
  showAlert: {
    type: Boolean,
    default: true
  },
  // 警告标题
  alertTitle: {
    type: String,
    default: '敏感操作'
  },
  // 警告类型
  alertType: {
    type: String,
    default: 'warning'
  },
  // 警告信息
  alertMessage: {
    type: String,
    default: '您正在执行敏感操作，请输入谷歌验证码以确认操作'
  },
  // 确认按钮文字
  confirmText: {
    type: String,
    default: '验证并确认'
  },
  // 取消按钮文字
  cancelText: {
    type: String,
    default: '取消'
  },
  // 是否在确认前自动验证格式
  autoValidate: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref(null)
const formData = ref({
  code: ''
})

const rules = {
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '请输入6位数字验证码', trigger: 'blur' }
  ]
}

// 监听 modelValue 变化
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val) {
    // 打开时重置表单
    formData.value.code = ''
    formRef.value?.clearValidate()
  }
})

// 监听 dialogVisible 变化，同步到父组件
watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 取消
const handleCancel = () => {
  dialogVisible.value = false
  emit('cancel')
}

// 关闭
const handleClose = () => {
  handleCancel()
}

// 确认
const handleConfirm = async () => {
  if (props.autoValidate) {
    // 自动验证表单
    await formRef.value.validate(async (valid) => {
      if (valid) {
        emit('confirm', formData.value.code, setLoading)
      }
    })
  } else {
    // 不验证，直接传递验证码
    emit('confirm', formData.value.code, setLoading)
  }
}

// 设置加载状态（供父组件调用）
const setLoading = (status) => {
  loading.value = status
}

// 关闭弹窗（供父组件调用）
const close = () => {
  dialogVisible.value = false
}

// 暴露方法给父组件
defineExpose({
  setLoading,
  close
})
</script>

<style scoped>
.verify-code-input :deep(.el-input__inner) {
  text-align: center;
  letter-spacing: 8px;
  font-size: 20px;
  font-weight: bold;
}
</style>