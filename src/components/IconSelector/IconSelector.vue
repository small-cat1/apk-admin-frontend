<template>
  <el-dialog
      v-model="dialogVisible"
      title="选择图标"
      width="800px"
      :before-close="handleClose"
  >
    <div class="icon-selector">
      <!-- 搜索框 -->
      <el-input
          v-model="searchKeyword"
          placeholder="搜索图标名称..."
          clearable
          prefix-icon="Search"
          class="search-input"
      />

      <!-- 当前选中 -->
      <div v-if="tempSelectedIcon" class="current-selection">
        <span class="label">当前选中：</span>
        <el-tag type="success" closable @close="clearSelection">
          <van-icon :name="tempSelectedIcon" class="mr-1" />
          {{ tempSelectedIcon }}
        </el-tag>
      </div>

      <!-- 图标分类标签 -->
      <el-tabs v-model="activeCategory" class="icon-tabs">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="常用" name="common" />
        <el-tab-pane label="箭头" name="arrow" />
        <el-tab-pane label="文件" name="file" />
        <el-tab-pane label="操作" name="action" />
        <el-tab-pane label="商业" name="business" />
        <el-tab-pane label="通讯" name="communication" />
        <el-tab-pane label="其他" name="other" />
      </el-tabs>

      <!-- 图标网格 -->
      <div class="icon-grid">
        <div
            v-for="icon in filteredIcons"
            :key="icon"
            class="icon-item"
            :class="{ active: tempSelectedIcon === icon }"
            @click="selectIcon(icon)"
        >
          <van-icon :name="icon" size="24" />
          <span class="icon-name">{{ icon }}</span>
        </div>

        <el-empty
            v-if="filteredIcons.length === 0"
            description="未找到匹配的图标"
            :image-size="100"
        />
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Icon as VanIcon } from 'vant'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'update:visible', 'change'])

// 对话框显示状态
const dialogVisible = ref(props.visible)

// 搜索关键词
const searchKeyword = ref('')

// 当前激活的分类
const activeCategory = ref('all')

// 临时选中的图标（确认前）
const tempSelectedIcon = ref(props.modelValue)

// Vant 4 所有可用的图标
const allIcons = [
  // 基础图标
  'add-o', 'add', 'add-square', 'after-sale', 'aim', 'alipay', 'apps-o',
  'arrow', 'arrow-down', 'arrow-left', 'arrow-up', 'ascending', 'audio',

  // 操作相关
  'back-top', 'balance-list-o', 'balance-o', 'balance-pay', 'bar-chart-o',
  'bars', 'bell', 'billing-o', 'birthday-cake-o', 'bookmark-o', 'bookmark',
  'bag-o', 'bag',

  // 购物相关
  'cart-o', 'cart', 'cart-circle-o', 'cart-circle', 'cash-back-record',
  'cash-on-deliver', 'certificate', 'chat-o', 'chat', 'checked',

  // 时间日期
  'clock-o', 'clock', 'close', 'closed-eye', 'cloud-o', 'cloud-upload',
  'column', 'comment-o', 'comment', 'comment-circle-o', 'comment-circle',
  'completed', 'contact', 'coupon-o', 'coupon', 'credit-pay',

  // 编辑操作
  'delete-o', 'delete', 'desktop-o', 'descending', 'debit-pay', 'diamond-o',
  'diamond', 'discount', 'down', 'download', 'edit',

  // 表情
  'ellipsis', 'emoji-o', 'empty', 'enlarge', 'envelop-o', 'exchange',
  'expand-o', 'expand', 'eye-o', 'eye', 'fail', 'failure',

  // 过滤排序
  'filter-o', 'fire-o', 'fire', 'flag-o', 'flower-o', 'font-o', 'font',
  'friends-o', 'friends', 'gem-o', 'gem', 'gift-card-o', 'gift-card',
  'gift-o', 'gift', 'gold-coin-o', 'gold-coin', 'good-job-o', 'good-job',
  'goods-collect-o', 'goods-collect',

  // 图表统计
  'graphic', 'grid-o', 'home-o', 'hotel-o', 'idcard', 'info-o', 'info',
  'invition', 'label-o', 'label', 'like-o', 'like', 'list-switch',
  'live', 'location-o', 'location', 'lock', 'logistics',

  // 地图定位
  'manager-o', 'manager', 'map-marked', 'medal-o', 'medal', 'more-o', 'more',
  'music-o', 'music', 'new-arrival-o', 'new-arrival', 'new-o', 'new',
  'newspaper-o', 'notes-o',

  // 操作图标
  'orders-o', 'other-pay', 'paid', 'pal-o', 'pause-circle-o', 'pause-circle',
  'pause', 'peer-pay', 'pending-payment', 'phone-o', 'phone', 'phone-circle-o',
  'phone-circle', 'photo-o', 'photo', 'photograph',

  // 播放控制
  'play-circle-o', 'play-circle', 'play', 'plus', 'point-gift-o', 'point-gift',
  'points', 'printer', 'qr-invalid', 'qr', 'question-o', 'question',
  'records', 'refund-o', 'replay', 'revoke',

  // 扫描搜索
  'scan', 'search', 'send-gift-o', 'service-o', 'service', 'setting-o', 'setting',
  'share-o', 'share', 'shield-o', 'shop-collect-o', 'shop-collect', 'shop-o', 'shop',
  'shopping-cart-o', 'shopping-cart', 'shrink',

  // 签到分享
  'sign', 'smile-comment-o', 'smile-comment', 'smile-o', 'smile', 'sort',
  'star-o', 'star', 'stop-circle-o', 'stop-circle', 'stop', 'success',

  // 标签文本
  'label', 'tag-o', 'tags-o', 'thumb-circle-o', 'thumb-circle', 'todo-list-o',
  'todo-list', 'tosend', 'tv-o', 'umbrella-circle', 'underway-o', 'underway',
  'upgrade', 'user-circle-o', 'user-o',

  // 视频语音
  'video-o', 'video', 'vip-card-o', 'vip-card', 'volume-o', 'volume',
  'wap-home-o', 'wap-home', 'wap-nav', 'warn-o', 'warning-o', 'warning',
  'weapp-nav', 'wechat-pay', 'wechat',

  // 其他
  'youzan-shield', 'replay', 'idcard', 'invitation', 'passed', 'pending',
  'points-mall-o', 'qrcode', 'hot-o', 'hot', 'hot-sale-o', 'hot-sale'
]

// 图标分类
const iconCategories = {
  common: [
    'home-o', 'star', 'star-o', 'like', 'like-o', 'search', 'setting', 'setting-o',
    'user-o', 'user-circle-o', 'location', 'location-o', 'phone', 'phone-o',
    'shop', 'shop-o', 'cart', 'cart-o', 'chat', 'chat-o', 'bell',
    'more', 'more-o', 'friends', 'friends-o', 'goods-collect', 'goods-collect-o'
  ],
  arrow: [
    'arrow', 'arrow-left', 'arrow-down', 'arrow-up', 'back-top',
    'ascending', 'descending', 'down', 'expand', 'expand-o',
    'enlarge', 'shrink', 'column'
  ],
  file: [
    'newspaper-o', 'notes-o', 'records', 'certificate', 'idcard',
    'orders-o', 'balance-list-o', 'todo-list', 'todo-list-o',
    'contact', 'label', 'label-o', 'bookmark', 'bookmark-o'
  ],
  action: [
    'add', 'add-o', 'add-square', 'delete', 'delete-o', 'edit',
    'close', 'checked', 'success', 'fail', 'failure', 'completed',
    'plus', 'bars', 'filter-o', 'revoke', 'upgrade', 'sort',
    'scan', 'qr', 'qrcode', 'exchange', 'share', 'share-o',
    'send-gift-o', 'printer', 'download', 'upload', 'cloud-upload'
  ],
  business: [
    'shop', 'shop-o', 'shop-collect', 'shop-collect-o', 'cart', 'cart-o',
    'cart-circle', 'cart-circle-o', 'shopping-cart', 'shopping-cart-o',
    'gold-coin', 'gold-coin-o', 'gem', 'gem-o', 'gift', 'gift-o',
    'gift-card', 'gift-card-o', 'point-gift', 'point-gift-o', 'points',
    'coupon', 'coupon-o', 'discount', 'diamond', 'diamond-o',
    'bag', 'bag-o', 'credit-pay', 'debit-pay', 'balance-pay',
    'paid', 'pending-payment', 'cash-on-deliver', 'wechat-pay', 'alipay',
    'peer-pay', 'other-pay', 'refund-o', 'vip-card', 'vip-card-o',
    'after-sale', 'tosend', 'logistics'
  ],
  communication: [
    'chat', 'chat-o', 'comment', 'comment-o', 'comment-circle', 'comment-circle-o',
    'smile', 'smile-o', 'smile-comment', 'smile-comment-o', 'emoji-o',
    'phone', 'phone-o', 'phone-circle', 'phone-circle-o', 'envelop-o',
    'wechat', 'service', 'service-o', 'manager', 'manager-o',
    'bell', 'volume', 'volume-o', 'audio', 'video', 'video-o'
  ],
  other: [
    'eye', 'eye-o', 'closed-eye', 'fire', 'fire-o', 'hot', 'hot-o',
    'hot-sale', 'hot-sale-o', 'new', 'new-o', 'new-arrival', 'new-arrival-o',
    'good-job', 'good-job-o', 'medal', 'medal-o', 'trophy', 'flag-o',
    'flower-o', 'birthday-cake-o', 'music', 'music-o', 'photo', 'photo-o',
    'photograph', 'live', 'tv-o', 'clock', 'clock-o', 'hotel-o',
    'desktop-o', 'graphic', 'bar-chart-o', 'umbrella-circle', 'shield-o',
    'youzan-shield', 'warn-o', 'warning', 'warning-o', 'info', 'info-o',
    'question', 'question-o', 'apps-o', 'wap-home', 'wap-home-o',
    'wap-nav', 'weapp-nav', 'grid-o', 'list-switch', 'aim',
    'sign', 'lock', 'font', 'font-o', 'invitation', 'invition',
    'passed', 'pending', 'underway', 'underway-o', 'stopped', 'stop',
    'play', 'pause', 'replay', 'points-mall-o', 'map-marked'
  ]
}

// 监听 visible 变化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
  if (newVal) {
    // 打开对话框时，同步当前值到临时选中
    tempSelectedIcon.value = props.modelValue
  }
})

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  tempSelectedIcon.value = newVal
})

// 监听 dialogVisible 变化
watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal)
  if (!newVal) {
    // 关闭时清空搜索
    searchKeyword.value = ''
    activeCategory.value = 'all'
  }
})

// 过滤后的图标列表
const filteredIcons = computed(() => {
  let icons = allIcons

  // 根据分类过滤
  if (activeCategory.value !== 'all') {
    icons = iconCategories[activeCategory.value] || []
  }

  // 根据搜索关键词过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    icons = icons.filter(icon =>
        icon.toLowerCase().includes(keyword)
    )
  }

  return icons
})

// 选择图标
const selectIcon = (icon) => {
  tempSelectedIcon.value = icon
}

// 清空选择
const clearSelection = () => {
  tempSelectedIcon.value = ''
  emit('update:modelValue', '')
  emit('change', '')
}

// 确认选择
const handleConfirm = () => {
  emit('update:modelValue', tempSelectedIcon.value)
  emit('change', tempSelectedIcon.value)
  handleClose()
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
}
</script>

<style scoped>
.icon-selector {
  min-height: 500px;
}

.search-input {
  margin-bottom: 20px;
}

.current-selection {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.current-selection .label {
  margin-right: 10px;
  color: #606266;
  font-weight: 500;
}

.current-selection .el-tag {
  display: inline-flex;
  align-items: center;
}

.mr-1 {
  margin-right: 8px;
}

.icon-tabs {
  margin-bottom: 20px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  max-height: 450px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fff;
}

.icon-item:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
}

.icon-item.active {
  border-color: #409eff;
  background-color: #409eff;
  color: #fff;
}

.icon-item.active .icon-name {
  color: #fff;
}

.icon-item :deep(.van-icon) {
  margin-bottom: 8px;
  font-size: 24px;
}

.icon-name {
  font-size: 12px;
  color: #606266;
  text-align: center;
  word-break: break-all;
  line-height: 1.4;
}

/* 滚动条样式 */
.icon-grid::-webkit-scrollbar {
  width: 8px;
}

.icon-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.icon-grid::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.icon-grid::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>