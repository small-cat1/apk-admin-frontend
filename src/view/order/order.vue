<template>
  <div>
    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button type="warning" icon="warning" @click="batchCancel" :disabled="!selectedOrders.length">
          批量取消
        </el-button>
        <el-button type="success" icon="download" @click="exportOrders">
          导出订单
        </el-button>
      </div>

      <!-- 搜索筛选区域 -->
      <div class="search-box mb-4">
        <el-row :gutter="20">
          <el-col :span="4">
            <el-input
                v-model="searchForm.order_no"
                placeholder="订单号"
                clearable
                @clear="getTableData"
                @keyup.enter="getTableData"
            />
          </el-col>
          <el-col :span="4">
            <el-input
                v-model="searchForm.user_id"
                placeholder="用户ID"
                clearable
                @clear="getTableData"
                @keyup.enter="getTableData"
            />
          </el-col>
          <el-col :span="3">
            <el-select
                v-model="searchForm.plan_type"
                placeholder="套餐类型"
                clearable
                @change="getTableData"
            >
              <el-option label="月套餐" value="monthly" />
              <el-option label="年套餐" value="yearly" />
              <el-option label="终身" value="lifetime" />
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-select
                v-model="searchForm.order_type"
                placeholder="订单类型"
                clearable
                @change="getTableData"
            >
              <el-option label="新购" value="new" />
              <el-option label="续费" value="renew" />
              <el-option label="升级" value="upgrade" />
              <el-option label="降级" value="downgrade" />
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-select
                v-model="searchForm.status"
                placeholder="订单状态"
                clearable
                @change="getTableData"
            >
              <el-option label="待支付" value="pending" />
              <el-option label="已支付" value="paid" />
              <el-option label="支付失败" value="failed" />
              <el-option label="已退款" value="refunded" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-select
                v-model="searchForm.platform"
                placeholder="购买平台"
                clearable
                @change="getTableData"
            >
              <el-option label="Android" value="android" />
              <el-option label="iOS" value="ios" />
              <el-option label="鸿蒙" value="harmony" />
              <el-option label="Windows" value="windows" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="getTableData">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-col>
        </el-row>

        <!-- 时间范围筛选 -->
        <el-row :gutter="20" class="mt-2">
          <el-col :span="6">
            <el-date-picker
                v-model="searchForm.date_range"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                @change="getTableData"
            />
          </el-col>
          <el-col :span="4">
            <el-input
                v-model="searchForm.plan_name"
                placeholder="套餐名称"
                clearable
                @clear="getTableData"
                @keyup.enter="getTableData"
            />
          </el-col>
          <el-col :span="4">
            <el-input
                v-model="searchForm.payment_method"
                placeholder="支付方式"
                clearable
                @clear="getTableData"
                @keyup.enter="getTableData"
            />
          </el-col>
        </el-row>
      </div>

      <el-table
          ref="multipleTable"
          :data="tableData"
          tooltip-effect="dark"
          row-key="id"
          v-loading="loading"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />

        <!-- 订单信息 -->
        <el-table-column align="left" label="订单信息" fixed="left" min-width="200">
          <template #default="scope">
            <div class="order-info">
              <div class="order-no">{{ scope.row.order_no }}</div>
              <div class="order-meta">
                <div class="user-info">用户: {{ scope.row.user_id }}</div>
                <div class="plan-info">{{ scope.row.plan_name }}</div>
                <div class="order-time">{{ formatDate(scope.row.created_at) }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 套餐信息 -->
        <el-table-column align="center" label="套餐信息" min-width="150">
          <template #default="scope">
            <div>
              <el-tag :type="getPlanTypeTagType(scope.row.plan_type)" size="small">
                {{ getPlanTypeLabel(scope.row.plan_type) }}
              </el-tag>
              <div class="text-xs text-gray-500 mt-1">
                {{ scope.row.plan_code }}
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 订单类型 -->
        <el-table-column align="center" label="订单类型" min-width="100">
          <template #default="scope">
            <el-tag :type="getOrderTypeTagType(scope.row.order_type)" size="small">
              {{ getOrderTypeLabel(scope.row.order_type) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 购买平台 -->
        <el-table-column align="center" label="平台" min-width="80">
          <template #default="scope">
            <el-tag :type="getPlatformTagType(scope.row.platform)" size="small">
              {{ getPlatformLabel(scope.row.platform) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 金额信息 -->
        <el-table-column align="center" label="金额信息" min-width="160">
          <template #default="scope">
            <div class="amount-info">
              <div class="final-amount">${{ scope.row.final_amount }}</div>
              <div class="original-amount" v-if="scope.row.discount_amount > 0">
                原价: ${{ scope.row.original_price }}
              </div>
              <div class="discount-info" v-if="scope.row.discount_amount > 0">
                <span class="discount">折扣: -${{ scope.row.discount_amount }}</span>
              </div>
              <div class="upgrade-credit" v-if="scope.row.upgrade_credit > 0">
                抵扣: -${{ scope.row.upgrade_credit }}
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 支付信息 -->
        <el-table-column align="center" label="支付信息" min-width="120">
          <template #default="scope">
            <div v-if="scope.row.payment_method">
              <div class="payment-method">{{ scope.row.payment_method }}</div>
              <div class="payment-time text-xs text-gray-500" v-if="scope.row.paid_at">
                {{ formatDate(scope.row.paid_at) }}
              </div>
            </div>
            <span v-else class="text-gray-400">未支付</span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column align="center" label="状态" min-width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 过期时间 -->
        <el-table-column align="center" label="过期时间" min-width="130">
          <template #default="scope">
            <div class="expire-info">
              {{ formatDate(scope.row.expires_at) }}
              <div v-if="isExpiringSoon(scope.row.expires_at) && scope.row.status === 'pending'"
                   class="text-xs text-red-500">
                即将过期
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column align="center" label="操作" fixed="right" min-width="150">
          <template #default="scope">
            <el-button type="primary" link icon="view" @click="viewOrderFun(scope.row)">
              详情
            </el-button>
            <el-button type="primary" link icon="edit" @click="addRemarkFun(scope.row)">
              备注
            </el-button>
            <el-dropdown @command="handleCommand($event, scope.row)">
              <el-button class="more-button" type="primary" link>
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="cancel" v-if="scope.row.status === 'pending'">
                    取消订单
                  </el-dropdown-item>
                  <el-dropdown-item command="refund" v-if="scope.row.status === 'paid'">
                    申请退款
                  </el-dropdown-item>
                  <el-dropdown-item command="confirm" v-if="scope.row.status === 'pending'">
                    手动确认支付
                  </el-dropdown-item>
                  <el-dropdown-item command="query" divided>
                    查询支付状态
                  </el-dropdown-item>
                  <el-dropdown-item command="logs">
                    查看操作日志
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <div class="gva-pagination">
        <el-pagination
            :current-page="page"
            :page-size="pageSize"
            :page-sizes="[10, 30, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 谷歌验证器弹窗 -->
    <el-dialog
        v-model="googleAuthVisible"
        title="安全验证"
        width="400px"
        :close-on-click-modal="false"
        :show-close="false"
    >
      <div class="google-auth-container">
        <div class="auth-icon">
          <el-icon :size="48" color="#409eff">
            <Lock />
          </el-icon>
        </div>
        <div class="auth-title">请输入谷歌验证器代码</div>
        <div class="auth-desc">为了保障财务安全，请输入您的谷歌验证器6位数字代码</div>

        <el-form :model="googleAuthForm" ref="googleAuthFormRef" :rules="googleAuthRules">
          <el-form-item prop="code">
            <el-input
                v-model="googleAuthForm.code"
                placeholder="请输入6位验证码"
                maxlength="6"
                style="text-align: center; font-size: 20px; letter-spacing: 3px;"
                @input="handleAuthCodeInput"
                @keyup.enter="confirmGoogleAuth"
            >
              <template #prefix>
                <el-icon><Key /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-form>

        <div class="auth-tips">
          <el-alert
              title="验证码每30秒刷新一次"
              type="info"
              :closable="false"
              show-icon
          />
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelGoogleAuth">取消</el-button>
          <el-button
              type="primary"
              @click="confirmGoogleAuth"
              :loading="googleAuthLoading"
              :disabled="!googleAuthForm.code || googleAuthForm.code.length !== 6"
          >
            验证并继续
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-drawer
        v-model="remarkDrawerVisible"
        :size="500"
        :show-close="false"
        title="添加订单备注"
    >
      <el-form :model="remarkForm" label-width="80px" ref="remarkFormRef">
        <el-form-item label="订单号">
          <el-input v-model="remarkForm.order_no" readonly />
        </el-form-item>
        <el-form-item label="备注内容" prop="remark">
          <el-input
              v-model="remarkForm.remark"
              type="textarea"
              :rows="4"
              placeholder="请输入备注内容"
              maxlength="500"
              show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="remarkDrawerVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRemark" :loading="remarkLoading">保存</el-button>
      </template>
    </el-drawer>

    <!-- 详情查看抽屉 -->
    <el-drawer v-model="viewDrawerVisible" :size="800" :show-close="false">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-lg">订单详情</span>
          <el-button @click="viewDrawerVisible = false">关闭</el-button>
        </div>
      </template>

      <div v-if="viewData" class="order-detail">
        <!-- 订单基础信息 -->
        <div class="detail-section">
          <h4>基础信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">{{ viewData.order_no }}</el-descriptions-item>
            <el-descriptions-item label="用户ID">{{ viewData.user_id }}</el-descriptions-item>
            <el-descriptions-item label="套餐ID">{{ viewData.plan_id }}</el-descriptions-item>
            <el-descriptions-item label="套餐代码">{{ viewData.plan_code }}</el-descriptions-item>
            <el-descriptions-item label="套餐名称">{{ viewData.plan_name }}</el-descriptions-item>
            <el-descriptions-item label="套餐类型">
              <el-tag :type="getPlanTypeTagType(viewData.plan_type)">
                {{ getPlanTypeLabel(viewData.plan_type) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 订单配置 -->
        <div class="detail-section">
          <h4>订单配置</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="购买平台">
              <el-tag :type="getPlatformTagType(viewData.platform)">
                {{ getPlatformLabel(viewData.platform) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="订单类型">
              <el-tag :type="getOrderTypeTagType(viewData.order_type)">
                {{ getOrderTypeLabel(viewData.order_type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <el-tag :type="getStatusTagType(viewData.status)">
                {{ getStatusLabel(viewData.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="货币代码">{{ viewData.currency_code }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 价格信息 -->
        <div class="detail-section">
          <h4>价格信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="原价">${{ viewData.original_price }}</el-descriptions-item>
            <el-descriptions-item label="折扣金额">${{ viewData.discount_amount }}</el-descriptions-item>
            <el-descriptions-item label="升级抵扣">${{ viewData.upgrade_credit }}</el-descriptions-item>
            <el-descriptions-item label="实际支付">${{ viewData.final_amount }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 支付信息 -->
        <div class="detail-section">
          <h4>支付信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="支付方式">
              {{ viewData.payment_method || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="支付ID">
              {{ viewData.payment_id || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="支付时间">
              {{ viewData.paid_at ? formatDate(viewData.paid_at) : '未支付' }}
            </el-descriptions-item>
            <el-descriptions-item label="过期时间">
              {{ formatDate(viewData.expires_at) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 关联信息 -->
        <div class="detail-section" v-if="viewData.previous_membership_id">
          <h4>关联信息</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="升级前会员ID">
              {{ viewData.previous_membership_id }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 额外数据 -->
        <div class="detail-section" v-if="viewData.metadata">
          <h4>额外数据</h4>
          <div class="metadata-content">
            <pre>{{ formatMetadata(viewData.metadata) }}</pre>
          </div>
        </div>

        <!-- 时间信息 -->
        <div class="detail-section">
          <h4>时间信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="创建时间">{{ formatDate(viewData.created_at) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDate(viewData.updated_at) }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import {
  getMembershipOrder,
  getMembershipOrderList,
  batchCancelMembershipOrders,
  refundMembershipOrder,
  updateMembershipOrderRemark,
  confirmPayment,
  syncPaymentStatus,
  getOrderLogs
} from '@/api/project/membershipOrder'

import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Lock, Key } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format'

defineOptions({
  name: 'MembershipOrderManagement'
})

// 搜索表单
const searchForm = reactive({
  order_no: '',
  user_id: '',
  plan_type: '',
  order_type: '',
  status: '',
  platform: '',
  plan_name: '',
  payment_method: '',
  date_range: []
})

// 备注表单数据
const remarkForm = ref({
  id: '',
  order_no: '',
  remark: ''
})

// 表单验证规则（保留用于备注表单）
const remarkRules = reactive({
  remark: [
    { required: true, message: '请输入备注内容', trigger: 'blur' },
    { max: 500, message: '备注内容不能超过500字符', trigger: 'blur' }
  ]
})

// 分页数据
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])
const loading = ref(false)
const submitLoading = ref(false)
const selectedOrders = ref([])

// 表单引用
const remarkFormRef = ref(null)

// 抽屉状态
const remarkDrawerVisible = ref(false)
const viewDrawerVisible = ref(false)
const remarkLoading = ref(false)
const viewData = ref(null)

// 谷歌验证器相关数据
const googleAuthVisible = ref(false)
const googleAuthLoading = ref(false)
const googleAuthForm = ref({
  code: ''
})
const googleAuthFormRef = ref(null)
const pendingAction = ref(null) // 存储待执行的操作

// 谷歌验证器验证规则
const googleAuthRules = reactive({
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '请输入6位数字验证码', trigger: 'blur' }
  ]
})

// 工具方法
const getStatusLabel = (status) => {
  const labels = {
    pending: '待支付',
    paid: '已支付',
    failed: '支付失败',
    refunded: '已退款',
    cancelled: '已取消'
  }
  return labels[status] || status
}

const getStatusTagType = (status) => {
  const types = {
    pending: 'warning',
    paid: 'success',
    failed: 'danger',
    refunded: 'info',
    cancelled: 'default'
  }
  return types[status] || 'info'
}

const getPlanTypeLabel = (type) => {
  const labels = {
    monthly: '月套餐',
    yearly: '年套餐',
    lifetime: '终身'
  }
  return labels[type] || type
}

const getPlanTypeTagType = (type) => {
  const types = {
    monthly: 'primary',
    yearly: 'success',
    lifetime: 'warning'
  }
  return types[type] || 'info'
}

const getOrderTypeLabel = (type) => {
  const labels = {
    new: '新购',
    renew: '续费',
    upgrade: '升级',
    downgrade: '降级'
  }
  return labels[type] || type
}

const getOrderTypeTagType = (type) => {
  const types = {
    new: 'success',
    renew: 'primary',
    upgrade: 'warning',
    downgrade: 'info'
  }
  return types[type] || 'default'
}

const getPlatformLabel = (platform) => {
  const labels = {
    android: 'Android',
    ios: 'iOS',
    harmony: '鸿蒙',
    windows: 'Windows'
  }
  return labels[platform] || platform
}

const getPlatformTagType = (platform) => {
  const types = {
    android: 'success',
    ios: 'primary',
    harmony: 'warning',
    windows: 'info'
  }
  return types[platform] || 'default'
}

const isExpiringSoon = (expiresAt) => {
  if (!expiresAt) return false
  const expires = new Date(expiresAt)
  const now = new Date()
  const diffHours = (expires - now) / (1000 * 60 * 60)
  return diffHours <= 24 && diffHours > 0
}

const formatMetadata = (metadata) => {
  if (!metadata) return '无'
  try {
    return JSON.stringify(JSON.parse(metadata), null, 2)
  } catch {
    return metadata
  }
}

// 谷歌验证器相关方法
const showGoogleAuth = (action) => {
  pendingAction.value = action
  googleAuthForm.value.code = ''
  googleAuthVisible.value = true
  // 延迟聚焦，确保弹窗已经显示
  setTimeout(() => {
    const input = document.querySelector('.google-auth-container input')
    if (input) input.focus()
  }, 100)
}

const handleAuthCodeInput = (value) => {
  // 只允许输入数字
  googleAuthForm.value.code = value.replace(/\D/g, '')
}

const cancelGoogleAuth = () => {
  googleAuthVisible.value = false
  pendingAction.value = null
  googleAuthForm.value.code = ''
}

const confirmGoogleAuth = async () => {
  if (!googleAuthFormRef.value) return

  try {
    await googleAuthFormRef.value.validate()
    googleAuthLoading.value = true

    // 直接执行带验证码的业务操作
    if (pendingAction.value) {
      await pendingAction.value(googleAuthForm.value.code)
      ElMessage.success('操作成功')
      googleAuthVisible.value = false
      pendingAction.value = null
      googleAuthForm.value.code = ''
    }
  } catch (error) {
    if (error.response?.data?.msg?.includes('验证码')) {
      ElMessage.error('谷歌验证码错误，请重新输入')
    } else {
      ElMessage.error(error.response?.data?.msg || '操作失败')
    }
    console.error(error)
  } finally {
    googleAuthLoading.value = false
  }
}

// 选择变更处理
const handleSelectionChange = (selection) => {
  selectedOrders.value = selection
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getTableData()
}

const handleCurrentChange = (val) => {
  page.value = val
  getTableData()
}

// 搜索重置
const resetSearch = () => {
  Object.assign(searchForm, {
    order_no: '',
    user_id: '',
    plan_type: '',
    order_type: '',
    status: '',
    platform: '',
    plan_name: '',
    payment_method: '',
    date_range: []
  })
  getTableData()
}

// 获取表格数据
const getTableData = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      ...searchForm
    }

    if (searchForm.date_range && searchForm.date_range.length === 2) {
      params.start_time = searchForm.date_range[0]
      params.end_time = searchForm.date_range[1]
    }

    const table = await getMembershipOrderList(params)
    if (table.code === 0) {
      tableData.value = table.data.list
      total.value = table.data.total
      page.value = table.data.page
      pageSize.value = table.data.pageSize
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 查看详情
const viewOrderFun = async (row) => {
  try {
    const res = await getMembershipOrder({ id: row.id })
    if (res.code === 0) {
      viewData.value = res.data
      viewDrawerVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
    console.error(error)
  }
}

// 添加备注
const addRemarkFun = async (row) => {
  remarkForm.value = {
    id: row.id,
    order_no: row.order_no,
    remark: row.remark || ''
  }
  remarkDrawerVisible.value = true
}

// 命令处理
const handleCommand = async (command, row) => {
  switch (command) {
    case 'cancel':
      await cancelOrderFun(row)
      break
    case 'refund':
      await refundOrderFun(row)
      break
    case 'confirm':
      await confirmPaymentFun(row)
      break
    case 'query':
      await queryPaymentStatusFun(row)
      break
    case 'logs':
      await viewOrderLogsFun(row)
      break
  }
}

// 取消订单
const cancelOrderFun = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要取消订单 ${row.order_no} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await batchCancelMembershipOrders({ ids: [row.id] })
    if (res.code === 0) {
      ElMessage.success('取消成功')
      getTableData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
      console.error(error)
    }
  }
}

// 退款订单
const refundOrderFun = async (row) => {
  // 先显示谷歌验证器
  showGoogleAuth((googleCode) => executeRefundOrder(row, googleCode))
}

// 执行退款订单（内部方法）
const executeRefundOrder = async (row, googleCode) => {
  await ElMessageBox.confirm(
      `确定要申请退款订单 ${row.order_no} 吗？\n\n注意：退款是不可逆操作，请谨慎处理！`,
      '退款确认',
      {
        confirmButtonText: '确认退款',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: false
      }
  )

  // 要求管理员输入退款原因
  const { value: reason } = await ElMessageBox.prompt(
      '请输入退款原因（必填）：',
      '退款原因',
      {
        confirmButtonText: '提交退款申请',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputValidator: (value) => {
          if (!value || value.trim().length < 5) {
            return '退款原因至少需要5个字符'
          }
          return true
        }
      }
  )

  const res = await refundMembershipOrder({
    id: row.id,
    refund_reason: reason.trim(),
    google_auth_code: googleCode
  })

  if (res.code === 0) {
    getTableData()
  }
}

// 手动确认支付
const confirmPaymentFun = async (row) => {
  // 先显示谷歌验证器
  showGoogleAuth((googleCode) => executeConfirmPayment(row, googleCode))
}

// 执行确认支付（内部方法）
const executeConfirmPayment = async (row, googleCode) => {
  await ElMessageBox.confirm(`确定要手动确认支付订单 ${row.order_no} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })

  const res = await confirmPayment({
    id: row.id,
    google_auth_code: googleCode
  })

  if (res.code === 0) {
    getTableData()
  }
}

// 查询支付状态
const queryPaymentStatusFun = async (row) => {
  try {
    ElMessage.info('正在查询支付状态...')

    const res = await syncPaymentStatus({ id: row.id })
    if (res.code === 0) {
      ElMessage.success('支付状态查询完成')
      // 显示查询结果
      ElMessageBox.alert(
          `订单: ${row.order_no}\n当前状态: ${getStatusLabel(res.data.status)}\n第三方支付状态: ${res.data.payment_status || '未知'}`,
          '支付状态查询结果',
          {
            confirmButtonText: '确定',
            type: 'info'
          }
      )
      getTableData()
    }
  } catch (error) {
    ElMessage.error('查询失败')
    console.error(error)
  }
}

// 查看订单日志
const viewOrderLogsFun = async (row) => {
  try {
    const res = await getOrderLogs({ order_id: row.id })
    if (res.code === 0) {
      // 这里可以打开一个新的抽屉或弹窗显示日志
      ElMessage.info('日志查看功能开发中...')
    }
  } catch (error) {
    ElMessage.error('获取日志失败')
    console.error(error)
  }
}

// 批量取消
const batchCancel = async () => {
  try {
    await ElMessageBox.confirm(`确定要取消选中的 ${selectedOrders.value.length} 个订单吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const ids = selectedOrders.value.map(order => order.id)
    const res = await batchCancelMembershipOrders({ ids })
    if (res.code === 0) {
      ElMessage.success('批量取消成功')
      getTableData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量取消失败')
      console.error(error)
    }
  }
}

// 导出订单
const exportOrders = async () => {
  try {
    ElMessage.info('导出功能开发中...')
  } catch (error) {
    ElMessage.error('导出失败')
    console.error(error)
  }
}

// 保存备注
const saveRemark = async () => {
  if (!remarkFormRef.value) return

  try {
    await remarkFormRef.value.validate()
    remarkLoading.value = true

    const res = await updateMembershipOrderRemark({
      id: remarkForm.value.id,
      remark: remarkForm.value.remark
    })

    if (res.code === 0) {
      ElMessage.success('备注保存成功')
      remarkDrawerVisible.value = false
      await getTableData()
    }
  } catch (error) {
    console.error('保存备注失败:', error)
  } finally {
    remarkLoading.value = false
  }
}

// 初始化数据
onMounted(async () => {
  await getTableData()
})
</script>

<style scoped>
.gva-table-box {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.gva-btn-list {
  margin-bottom: 20px;
}

.search-box {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.gva-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-no {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.order-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-info, .plan-info, .order-time {
  font-size: 12px;
  color: #909399;
}

.plan-info {
  color: #606266;
  font-weight: 500;
}

.amount-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
}

.final-amount {
  font-weight: 600;
  color: #409eff;
  font-size: 14px;
}

.original-amount {
  font-size: 12px;
  color: #909399;
  text-decoration: line-through;
}

.discount {
  color: #e6a23c;
  font-size: 12px;
}

.upgrade-credit {
  color: #67c23a;
  font-size: 12px;
}

.payment-method {
  font-weight: 500;
  color: #606266;
}

.payment-time {
  margin-top: 2px;
}

.expire-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
}

.form-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.form-section:last-child {
  border-bottom: none;
}

.section-title {
  margin: 0 0 20px 0;
  padding: 0 0 10px 0;
  border-bottom: 2px solid #409eff;
  color: #409eff;
  font-weight: 600;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section h4 {
  margin: 0 0 15px 0;
  color: #409eff;
  font-weight: 600;
}

.order-detail {
  padding: 10px 0;
}

.metadata-content {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  min-height: 80px;
}

.metadata-content pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: #606266;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-1 {
  margin-top: 4px;
}

.mt-2 {
  margin-top: 8px;
}

.text-lg {
  font-size: 1.125rem;
}

.text-sm {
  font-size: 0.875rem;
}

.text-xs {
  font-size: 0.75rem;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-500 {
  color: #6b7280;
}

.text-red-500 {
  color: #f56565;
}

.more-button {
  margin-left: 8px;
}

/* 谷歌验证器样式 */
.google-auth-container {
  text-align: center;
  padding: 20px 0;
}

.auth-icon {
  margin-bottom: 16px;
}

.auth-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.auth-desc {
  font-size: 14px;
  color: #606266;
  margin-bottom: 24px;
  line-height: 1.5;
}

.auth-tips {
  margin-top: 16px;
}

.google-auth-container .el-input__inner {
  text-align: center;
  font-size: 20px;
  letter-spacing: 3px;
  font-weight: 600;
}

.google-auth-container .el-form-item {
  margin-bottom: 0;
}

.dialog-footer {
  text-align: center;
}

.dialog-footer .el-button {
  margin: 0 8px;
}
</style>