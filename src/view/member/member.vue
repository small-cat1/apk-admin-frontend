<template>
  <div>
    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button type="primary" icon="plus" @click="openDrawer">
          新增用户
        </el-button>
        <el-button type="danger" icon="delete" @click="batchDelete" :disabled="!selectedUsers.length">
          批量删除
        </el-button>
        <el-button type="warning" icon="warning" @click="batchSuspend" :disabled="!selectedUsers.length">
          批量暂停
        </el-button>
      </div>

      <!-- 搜索筛选区域 -->
      <div class="search-box mb-4">
        <el-row :gutter="20">
          <el-col :span="4">
            <el-input
                v-model="searchForm.username"
                placeholder="用户名"
                clearable
                @clear="getTableData"
                @keyup.enter="getTableData"
            />
          </el-col>
          <el-col :span="4">
            <el-input
                v-model="searchForm.email"
                placeholder="邮箱"
                clearable
                @clear="getTableData"
                @keyup.enter="getTableData"
            />
          </el-col>
          <el-col :span="4">
            <el-input
                v-model="searchForm.phone"
                placeholder="手机号"
                clearable
                @clear="getTableData"
                @keyup.enter="getTableData"
            />
          </el-col>
          <el-col :span="3">
            <el-select
                v-model="searchForm.account_status"
                placeholder="账户状态"
                clearable
                @change="getTableData"
            >
              <el-option label="正常" :value="1" />
              <el-option label="已禁用（管理员操作）" :value="2" />
              <el-option label="临时锁定（登录失败过多）" :value="3" />
              <el-option label="待审核" :value="4" />
              <el-option label="暂停使用（违规等)" :value="5" />
              <el-option label="已删除" :value="9" />
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-select
                v-model="searchForm.country_code"
                placeholder="国家"
                clearable
                @change="getTableData"
            >
              <el-option label="中国" value="CN" />
              <el-option label="美国" value="US" />
              <el-option label="日本" value="JP" />
              <el-option label="英国" value="GB" />
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-select
                v-model="searchForm.has_membership"
                placeholder="会员状态"
                clearable
                @change="getTableData"
            >
              <el-option label="有会员" value="true" />
              <el-option label="无会员" value="false" />
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-button type="primary" @click="getTableData">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
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
        <el-table-column align="left" label="用户信息"  fixed="left">
          <template #default="scope">
            <div class="user-info">
              <div class="user-details">
                <div class="username">{{ scope.row.username }}</div>
                <div class="email">{{ scope.row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column align="center" label="手机号" width="120">
          <template #default="scope">
            <div v-if="scope.row.phone">
              {{ scope.row.phone }}
              <el-tag v-if="scope.row.phone_verified" type="success" size="small">已验证</el-tag>
            </div>
            <span v-else class="text-gray-400">未绑定</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="账户状态" >
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.account_status)" size="small">
              {{ getStatusLabel(scope.row.account_status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column align="center" label="验证状态" >
          <template #default="scope">
            <div class="verification-status">
              <el-tag v-if="scope.row.email_verified" type="success" size="small">邮箱</el-tag>
              <el-tag v-if="scope.row.phone_verified" type="success" size="small">手机</el-tag>
              <el-tag v-if="scope.row.two_factor_enabled" type="warning" size="small">2FA</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column align="center" label="会员信息" >
          <template #default="scope">
            <div v-if="scope.row.current_membership">
              <el-tag :type="getMembershipTagType(scope.row.current_membership.plan_type)" size="small">
                {{ scope.row.current_membership.plan_name }}
              </el-tag>
              <div class="text-xs text-gray-500">
                {{ scope.row.current_membership.end_date ? formatDate(scope.row.current_membership.end_date) : '终身' }}
              </div>
            </div>
            <span v-else class="text-gray-400">免费用户</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="统计信息" >
          <template #default="scope">
            <div v-if="scope.row.statistics">
              <div class="text-xs">下载: {{ scope.row.statistics.total_downloads }}</div>
              <div class="text-xs">消费: ${{ scope.row.statistics.total_spent }}</div>
              <div class="text-xs">推荐: {{ scope.row.statistics.successful_referrals }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column align="center" label="最后登录" >
          <template #default="scope">
            <div v-if="scope.row.last_login_at">
              <div>{{ formatDate(scope.row.last_login_at) }}</div>
              <div class="text-xs text-gray-500">{{ scope.row.last_login_ip }}</div>
            </div>
            <span v-else class="text-gray-400">从未登录</span>
          </template>
        </el-table-column>

        <el-table-column align="left" label="注册时间" >
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column align="center" label="操作"  >
          <template #default="scope">
            <el-button type="primary" link icon="view" @click="viewUserFun(scope.row)">
              详情
            </el-button>
            <el-button type="primary" link icon="edit" @click="updateUserFun(scope.row)">
              编辑
            </el-button>
            <el-dropdown @command="handleCommand($event, scope.row)">
              <el-button class="more-button" type="primary" link >
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="resetPassword">重置密码</el-dropdown-item>
                  <el-dropdown-item command="viewMemberships">会员记录</el-dropdown-item>
                  <el-dropdown-item command="viewOrders">订单记录</el-dropdown-item>
                  <el-dropdown-item command="suspend" v-if="scope.row.account_status === 1">暂停账户</el-dropdown-item>
                  <el-dropdown-item command="activate" v-if="scope.row.account_status === 2">激活账户</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除用户</el-dropdown-item>
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

    <!-- 新增/编辑抽屉 -->
    <el-drawer
        v-model="drawerFormVisible"
        :before-close="closeDrawer"
        :size="800"
        :show-close="false"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-lg">{{ type === 'update' ? '编辑用户' : '新增用户' }}</span>
          <div>
            <el-button @click="closeDrawer">取消</el-button>
            <el-button type="primary" @click="enterDrawer" :loading="submitLoading">确定</el-button>
          </div>
        </div>
      </template>

      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
        <!-- 基础信息 -->
        <div class="form-section">
          <h3 class="section-title">基础信息</h3>

          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="用户邮箱" />
          </el-form-item>

          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="用户手机号" />
          </el-form-item>

          <el-form-item label="密码" prop="password" v-if="type === 'create'">
            <el-input v-model="form.password" type="password" placeholder="登录密码" show-password />
          </el-form-item>
          <el-form-item label="账户状态" prop="account_status">
            <el-select v-model="form.account_status" placeholder="选择账户状态">
              <el-option label="正常" :value="1" />
              <el-option label="已禁用（管理员操作）" :value="2" />
              <el-option label="临时锁定（登录失败过多）" :value="3" />
              <el-option label="待审核" :value="4" />
              <el-option label="暂停使用（违规等)" :value="5" />
              <el-option label="已删除" :value="9" />
            </el-select>
          </el-form-item>

          <el-form-item label="邮箱验证" prop="email_verified">
            <el-switch
                v-model="form.email_verified"
                active-text="已验证"
                inactive-text="未验证"
            />
          </el-form-item>
          <el-form-item label="手机验证" prop="phone_verified" v-if="form.phone">
            <el-switch
                v-model="form.phone_verified"
                active-text="已验证"
                inactive-text="未验证"
            />
          </el-form-item>
        </div>

      </el-form>
    </el-drawer>

    <!-- 详情查看抽屉 -->
    <el-drawer v-model="viewDrawerVisible" :size="800" :show-close="false">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-lg">用户详情</span>
          <el-button @click="viewDrawerVisible = false">关闭</el-button>
        </div>
      </template>

      <div v-if="viewData" class="user-detail">
        <!-- 用户详情内容 -->
        <div class="detail-section">
          <h4>基础信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户名">{{ viewData.username }}</el-descriptions-item>
            <el-descriptions-item label="UUID">{{ viewData.uuid }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ viewData.email }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ viewData.phone || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="邀请码">{{ viewData.referral_code  }}</el-descriptions-item>
            <el-descriptions-item label="注册IP">{{ viewData.register_ip }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <h4>账户状态</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="账户状态">
              <el-tag :type="getStatusTagType(viewData.account_status)">
                {{ getStatusLabel(viewData.account_status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="验证状态">
              <div>
                <el-tag v-if="viewData.email_verified" type="success" size="small">邮箱已验证</el-tag>
                <el-tag v-if="viewData.phone_verified" type="success" size="small">手机已验证</el-tag>
                <el-tag v-if="viewData.two_factor_enabled" type="warning" size="small">2FA已启用</el-tag>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 会员信息 -->
        <div class="detail-section" v-if="viewData.current_membership">
          <h4>当前会员</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="套餐名称">{{ viewData.current_membership.plan_name }}</el-descriptions-item>
            <el-descriptions-item label="套餐类型">{{ viewData.current_membership.plan_type }}</el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ formatDate(viewData.current_membership.start_date) }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">
              {{ viewData.current_membership.end_date ? formatDate(viewData.current_membership.end_date) : '终身有效' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 统计信息 -->
        <div class="detail-section" v-if="viewData.statistics">
          <h4>统计信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="总下载次数">{{ viewData.statistics.total_downloads }}</el-descriptions-item>
            <el-descriptions-item label="总消费金额">${{ viewData.statistics.total_spent }}</el-descriptions-item>
            <el-descriptions-item label="总订单数">{{ viewData.statistics.total_orders }}</el-descriptions-item>
            <el-descriptions-item label="成功推荐数">{{ viewData.statistics.successful_referrals }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-drawer>

    <!-- 会员记录弹窗 -->
    <el-dialog v-model="membershipsDialogVisible" title="会员记录" width="90%" top="5vh">
      <div v-loading="membershipsLoading">
        <el-table :data="membershipsList" border>
          <el-table-column prop="plan_name" label="套餐名称" />
          <el-table-column prop="plan_code" label="套餐代码" />
          <el-table-column label="套餐类型" >
            <template #default="scope">
              <el-tag :type="getMembershipTagType(scope.row.plan_type)" size="small">
                {{ getMembershipTypeLabel(scope.row.plan_type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" >
            <template #default="scope">
              <el-tag :type="getMembershipStatusTagType(scope.row.status)" size="small">
                {{ getMembershipStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="start_date" label="开始时间" >
            <template #default="scope">
              {{ formatDate(scope.row.start_date) }}
            </template>
          </el-table-column>
          <el-table-column prop="end_date" label="结束时间" >
            <template #default="scope">
              {{ scope.row.end_date ? formatDate(scope.row.end_date) : '终身有效' }}
            </template>
          </el-table-column>
          <el-table-column label="自动续费" >
            <template #default="scope">
              <el-tag v-if="scope.row.auto_renew" type="success" size="small">是</el-tag>
              <el-tag v-else type="info" size="small">否</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="使用统计" >
            <template #default="scope">
              <div class="text-xs">
                <div>日下载: {{ scope.row.download_used_daily || 0 }}</div>
                <div>月下载: {{ scope.row.download_used_monthly || 0 }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="160">
            <template #default="scope">
              {{ formatDate(scope.row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button v-if="scope.row.order_id" type="primary" link size="small" @click="viewOrderDetail(scope.row.order_id)">
                查看订单
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 订单记录弹窗 -->
    <el-dialog v-model="ordersDialogVisible" title="订单记录" width="95%" top="5vh">
      <div v-loading="ordersLoading">
        <el-table :data="ordersList" border>
          <el-table-column prop="order_no" label="订单号"  />
          <el-table-column prop="plan_name" label="套餐名称"  />
          <el-table-column label="套餐类型" >
            <template #default="scope">
              <el-tag :type="getMembershipTagType(scope.row.plan_type)" size="small">
                {{ getMembershipTypeLabel(scope.row.plan_type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="订单类型" >
            <template #default="scope">
              <el-tag :type="getOrderTypeTagType(scope.row.order_type)" size="small">
                {{ getOrderTypeLabel(scope.row.order_type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="平台" >
            <template #default="scope">
              <el-tag type="info" size="small">{{ getPlatformLabel(scope.row.platform) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="金额信息" >
            <template #default="scope">
              <div class="text-xs">
                <div>原价: {{ scope.row.currency_code }} {{ scope.row.original_price }}</div>
                <div v-if="scope.row.discount_amount > 0">折扣: -{{ scope.row.currency_code }} {{ scope.row.discount_amount }}</div>
                <div v-if="scope.row.upgrade_credit > 0">抵扣: -{{ scope.row.currency_code }} {{ scope.row.upgrade_credit }}</div>
                <div class="font-bold">实付: {{ scope.row.currency_code }} {{ scope.row.final_amount }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="支付方式" >
            <template #default="scope">
              {{ scope.row.payment_method || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="状态" >
            <template #default="scope">
              <el-tag :type="getOrderStatusTagType(scope.row.status)" size="small">
                {{ getOrderStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="paid_at" label="支付时间" >
            <template #default="scope">
              {{ scope.row.paid_at ? formatDate(scope.row.paid_at) : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="expires_at" label="过期时间" >
            <template #default="scope">
              {{ formatDate(scope.row.expires_at) }}
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" >
            <template #default="scope">
              {{ formatDate(scope.row.created_at) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  createUser,
  updateUser,
  deleteUser,
  getUser,
  getUserList,
  batchDeleteUsers,
  batchUpdateUserStatus,
  resetUserPassword,
  getUserMemberships,
  getUserOrders
} from '@/api/project/user'
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/format'

defineOptions({
  name: 'UserManagement'
})

// 搜索表单
const searchForm = reactive({
  email: '',
  phone: '',
  account_status: null,
  country_code: '',
  has_membership: ''
})

// 表单数据
const form = ref({
  email: '',
  phone: '',
  password: '',
  account_status: 1,
  email_verified: false,
  phone_verified: false,
})

// 表单验证规则
const rules = reactive({
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
})

// 分页数据
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])
const loading = ref(false)
const submitLoading = ref(false)
const selectedUsers = ref([])

// 表单引用
const formRef = ref(null)

// 抽屉状态
const drawerFormVisible = ref(false)
const viewDrawerVisible = ref(false)
const type = ref('')
const viewData = ref(null)

// 会员记录弹窗相关
const membershipsDialogVisible = ref(false)
const membershipsList = ref([])
const membershipsLoading = ref(false)

// 订单记录弹窗相关
const ordersDialogVisible = ref(false)
const ordersList = ref([])
const ordersLoading = ref(false)

// 工具方法
const getStatusLabel = (status) => {
  const labels = {
    1: '正常',
    2: '已禁用（管理员操作）',
    3: '临时锁定（登录失败过多）',
    4: '待审核',
    5: '暂停使用（违规等）',
    9:"已删除（软删除）",
  }
  return labels[status] || status
}

const getStatusTagType = (status) => {
  const types = {
    1: 'success',
    2: 'warning',
    3: 'danger',
    4: 'info',
    5: 'danger',
    9: 'danger',
  }
  return types[status] || 'info'
}


const getMembershipTagType = (planType) => {
  const types = {
    monthly: 'primary',
    yearly: 'success',
    lifetime: 'warning'
  }
  return types[planType] || 'info'
}

// 会员相关标签方法
const getMembershipTypeLabel = (type) => {
  const labels = {
    monthly: '月付',
    yearly: '年付',
    lifetime: '终身'
  }
  return labels[type] || type
}

const getMembershipStatusLabel = (status) => {
  const labels = {
    active: '有效',
    expired: '已过期',
    cancelled: '已取消',
    suspended: '已暂停',
    replaced: '已替换'
  }
  return labels[status] || status
}

const getMembershipStatusTagType = (status) => {
  const types = {
    active: 'success',
    expired: 'danger',
    cancelled: 'info',
    suspended: 'warning',
    replaced: 'info'
  }
  return types[status] || 'info'
}

// 订单相关标签方法
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
  return types[type] || 'info'
}

const getPlatformLabel = (platform) => {
  const labels = {
    android: 'Android',
    ios: 'iOS',
    harmony: 'HarmonyOS',
    windows: 'Windows'
  }
  return labels[platform] || platform
}

const getOrderStatusLabel = (status) => {
  const labels = {
    pending: '待支付',
    paid: '已支付',
    failed: '支付失败',
    refunded: '已退款',
    cancelled: '已取消'
  }
  return labels[status] || status
}

const getOrderStatusTagType = (status) => {
  const types = {
    pending: 'warning',
    paid: 'success',
    failed: 'danger',
    refunded: 'info',
    cancelled: 'info'
  }
  return types[status] || 'info'
}

// 选择变更处理
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
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
    username: '',
    email: '',
    phone: '',
    account_status: null,
    country_code: '',
    has_membership: ''
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
    const table = await getUserList(params)
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
const viewUserFun = async (row) => {
  try {
    const res = await getUser({ id: row.id })
    if (res.code === 0) {
      viewData.value = res.data.user
      viewDrawerVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
    console.error(error)
  }
}

// 编辑用户
const updateUserFun = async (row) => {
  try {
    const res = await getUser({ id: row.id })
    type.value = 'update'
    if (res.code === 0) {
      form.value = { ...res.data.user }
      // 处理日期格式
      if (form.value.birth_date) {
        form.value.birth_date = new Date(form.value.birth_date)
      }
      drawerFormVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败')
    console.error(error)
  }
}

// 命令处理
const handleCommand = async (command, row) => {
  switch (command) {
    case 'resetPassword':
      await resetPasswordFun(row)
      break
    case 'viewMemberships':
      await viewMembershipsFun(row)
      break
    case 'viewOrders':
      await viewOrdersFun(row)
      break
    case 'suspend':
      await updateUserStatusFun(row, 2)
      break
    case 'activate':
      await updateUserStatusFun(row, 1)
      break
    case 'delete':
      await deleteUserFun(row)
      break
  }
}

// 重置密码
const resetPasswordFun = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要重置用户 ${row.username} 的密码吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await resetUserPassword({ id: row.id })
    if (res.code === 0) {
      ElMessage.success(`密码重置成功，新密码为：${res.data.newPassword}`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重置密码失败')
      console.error(error)
    }
  }
}

// 查看会员记录
const viewMembershipsFun = async (row) => {
  try {
    membershipsLoading.value = true
    membershipsDialogVisible.value = true

    const res = await getUserMemberships({ userId: row.id })
    if (res.code === 0) {
      membershipsList.value = res.data.memberships || []
    } else {
      ElMessage.error('获取会员记录失败')
    }
  } catch (error) {
    ElMessage.error('获取会员记录失败')
    console.error(error)
  } finally {
    membershipsLoading.value = false
  }
}

// 查看订单记录
const viewOrdersFun = async (row) => {
  try {
    ordersLoading.value = true
    ordersDialogVisible.value = true

    const res = await getUserOrders({ userId: row.id })
    if (res.code === 0) {
      ordersList.value = res.data.orders || []
    } else {
      ElMessage.error('获取订单记录失败')
    }
  } catch (error) {
    ElMessage.error('获取订单记录失败')
    console.error(error)
  } finally {
    ordersLoading.value = false
  }
}

// 查看订单详情（从会员记录中跳转）
const viewOrderDetail = (orderId) => {
  // 在订单列表中查找对应的订单
  const order = ordersList.value.find(o => o.id === orderId)
  if (order) {
    // 可以实现跳转到订单详情或高亮显示对应订单
    ElMessage.info(`订单ID: ${orderId} 详情功能可扩展`)
  } else {
    // 如果当前订单列表中没有，可以单独获取
    ElMessage.info('订单详情功能待实现')
  }
}

// 更新用户状态
const updateUserStatusFun = async (row, status) => {
  try {
    const action = status === 'suspended' ? '暂停' : '激活'
    await ElMessageBox.confirm(`确定要${action}用户 ${row.username} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await batchUpdateUserStatus({ ids: [row.id], account_status: status })
    if (res.code === 0) {
      ElMessage.success(`${action}成功`)
      getTableData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
      console.error(error)
    }
  }
}

// 删除用户
const deleteUserFun = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户 ${row.username} 吗？删除后无法恢复！`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deleteUser({ id: row.id })
    if (res.code === 0) {
      ElMessage.success('删除成功')
      if (tableData.value.length === 1 && page.value > 1) {
        page.value--
      }
      await getTableData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

// 批量删除
const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedUsers.value.length} 个用户吗？删除后无法恢复！`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const ids = selectedUsers.value.map(user => user.id)
    const res = await batchDeleteUsers({ ids })
    if (res.code === 0) {
      ElMessage.success('批量删除成功')
      await getTableData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error(error)
    }
  }
}

// 批量暂停
const batchSuspend = async () => {
  try {
    await ElMessageBox.confirm(`确定要暂停选中的 ${selectedUsers.value.length} 个用户吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const ids = selectedUsers.value.map(user => user.id)
    const res = await batchUpdateUserStatus({ ids, account_status: 2 })
    if (res.code === 0) {
      ElMessage.success('批量暂停成功')
      await getTableData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量暂停失败')
      console.error(error)
    }
  }
}

// 关闭抽屉
const closeDrawer = () => {
  drawerFormVisible.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  form.value = {
    username: '',
    email: '',
    phone: '',
    password: '',
    account_status: null,
    email_verified: false,
    phone_verified: false,
  }
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 提交表单
const enterDrawer = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    // 处理提交数据
    const submitData = { ...form.value }

    // 处理日期格式
    if (submitData.birth_date) {
      submitData.birth_date = submitData.birth_date.toISOString().split('T')[0]
    }

    // 清空不必要的字段
    if (!submitData.phone) {
      submitData.phone = null
      submitData.phone_verified = false
    }

    let res
    switch (type.value) {
      case 'create':
        res = await createUser(submitData)
        break
      case 'update':
        res = await updateUser(submitData)
        break
      default:
        res = await createUser(submitData)
        break
    }

    if (res.code === 0) {
      ElMessage({
        type: 'success',
        message: type.value === 'update' ? '更新成功' : '创建成功'
      })
      closeDrawer()
      await getTableData()
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitLoading.value = false
  }
}

// 打开新增抽屉
const openDrawer = () => {
  type.value = 'create'
  drawerFormVisible.value = true
}

// 初始化数据
onMounted(() => {
  getTableData()
})
</script>

<style scoped>
.gva-table-box {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.username {
  font-weight: 600;
  color: #303133;
}



.email {
  font-size: 12px;
  color: #606266;
}

.verification-status {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.verification-status .el-tag {
  align-self: flex-start;
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

.user-detail {
  padding: 10px 0;
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

.text-lg {
  font-size: 1.125rem;
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

.more-button {
  margin-top: 6px;
  margin-left: 6px;
}

.font-bold {
  font-weight: bold;
}
</style>