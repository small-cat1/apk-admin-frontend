<template>
  <div>
    <div class="emoji-selector-wrapper">
      <!-- 当前选中的 Emoji 显示 -->
      <div class="current-emoji-display">
        <span v-if="modelValue" class="emoji-display">{{ modelValue }}</span>
        <span v-else class="emoji-placeholder">未选择</span>
      </div>

      <!-- 选择按钮 -->
      <el-button
          type="primary"
          @click="showEmojiPicker = !showEmojiPicker"
      >
        {{ showEmojiPicker ? '收起选择器' : '选择 Emoji' }}
      </el-button>

      <!-- 清除按钮 -->
      <el-button
          v-if="modelValue"
          type="danger"
          plain
          @click="clearEmoji"
      >
        清除
      </el-button>
    </div>

    <!-- Emoji 选择器（折叠显示） -->
    <el-collapse-transition>
      <div v-show="showEmojiPicker" class="emoji-picker-container">
        <div ref="emojiPickerElement"></div>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import 'emoji-picker-element'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const showEmojiPicker = ref(false)
const emojiPickerElement = ref(null)
let picker = null

const handleEmojiClick = (event) => {
  emit('update:modelValue', event.detail.unicode)
  // 选择后自动收起
  showEmojiPicker.value = false
}

const clearEmoji = () => {
  emit('update:modelValue', '')
}

onMounted(() => {
  if (emojiPickerElement.value) {
    picker = document.createElement('emoji-picker')
    picker.addEventListener('emoji-click', handleEmojiClick)
    emojiPickerElement.value.appendChild(picker)
  }
})

onUnmounted(() => {
  if (picker) {
    picker.removeEventListener('emoji-click', handleEmojiClick)
  }
})
</script>

<style scoped>
.emoji-selector-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-bottom: 8px;
}

.current-emoji-display {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  height: 60px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.emoji-display {
  font-size: 36px;
  line-height: 1;
}

.emoji-placeholder {
  color: #9ca3af;
  font-size: 14px;
}

.emoji-picker-container {
  margin-top: 12px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.emoji-picker-container :deep(emoji-picker) {
  width: 100%;
  height: 400px;
  border: none;
}
</style>