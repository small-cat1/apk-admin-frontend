<template>
  <div>
    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button type="primary" icon="plus" @click="openDrawer">
          新增支付账号
        </el-button>
      </div>

      <!-- 搜索筛选区域 -->
      <div class="search-box mb-4">
        <el-row :gutter="20">
          <el-col :span="4">
            <el-input
                v-model="searchForm.name"
                placeholder="账号名称"
                clearable
                @clear="getTableData"
                @keyup.enter="getTableData"
            />
          </el-col>
          <el-col :span="4">
            <el-select
                v-model="searchForm.provider_code"
                placeholder="支付服务商"
                clearable
                @change="getTableData"
            >
              <el-option
                  v-for="provider in providerOptions"
                  :key="provider.code"
                  :label="provider.name"
                  :value="provider.code"
              />
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-select
                v-model="searchForm.account_type"
                placeholder="账号类型"
                clearable
                @change="getTableData"
            >
              <el-option label="个人" value="personal" />
              <el-option label="企业" value="enterprise" />
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-select
                v-model="searchForm.status"
                placeholder="状态"
                clearable
                @change="getTableData"
            >
              <el-option label="正常" value="active" />
              <el-option label="禁用" value="inactive" />
              <el-option label="维护中" value="maintenance" />
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-input
                v-model="searchForm.group"
                placeholder="分组"
                clearable
                @clear="getTableData"
                @keyup.enter="getTableData"
            />
          </el-col>
          <el-col :span="4">
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
      >

        <!-- 账号信息 -->
        <el-table-column align="left" label="账号信息" width="250" fixed="left">
          <template #default="scope">
            <div class="account-info">
              <div class="account-name">{{ scope.row.name }}</div>
              <div class="provider-info">
                <el-tag type="info" size="small">{{ getProviderName(scope.row.provider_code) }}</el-tag>
              </div>
              <div class="account-type">
                <el-tag :type="scope.row.account_type === 'enterprise' ? 'warning' : 'primary'" size="small">
                  {{ scope.row.account_type === 'enterprise' ? '企业' : '个人' }}
                </el-tag>
                <span v-if="scope.row.group" class="group-tag">{{ scope.row.group }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column align="center" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 权重 -->
        <el-table-column align="center" label="权重" >
          <template #default="scope">
            <el-input-number
                v-model="scope.row.weight"
                :min="1"
                :max="100"
                size="small"
                @change="updateWeight(scope.row)"
            />
          </template>
        </el-table-column>

        <!-- 交易统计 -->
        <el-table-column align="center" label="交易统计" >
          <template #default="scope">
            <div class="trade-stats">
              <div class="amount-info">
                <span class="label">日交易:</span>
                <span class="value">¥{{ formatMoney(scope.row.daily_amount) }}</span>
              </div>
              <div class="amount-info">
                <span class="label">总交易:</span>
                <span class="value">¥{{ formatMoney(scope.row.total_amount) }}</span>
              </div>
              <div class="order-info">
                <span class="label">总订单:</span>
                <span class="value">{{ scope.row.total_orders }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 限额设置 -->
        <el-table-column align="center" label="日限额" >
          <template #default="scope">
            <div class="limit-info">
              <div class="limit-amount">¥{{ formatMoney(scope.row.max_daily_amount) }}</div>
              <el-progress
                  :percentage="getDailyUsagePercent(scope.row)"
                  :color="getProgressColor(scope.row)"
                  :stroke-width="4"
                  text-inside
              />
            </div>
          </template>
        </el-table-column>

        <!-- 地区/标签 -->
        <el-table-column align="center" label="地区/标签" width="150">
          <template #default="scope">
            <div class="region-tags">
              <div v-if="scope.row.region" class="region">
                <el-tag type="success" size="small">{{ scope.row.region }}</el-tag>
              </div>
              <div v-if="scope.row.tags" class="tags">
                <el-tag
                    v-for="tag in scope.row.tags.split(',')"
                    :key="tag"
                    size="small"
                    effect="plain"
                >
                  {{ tag.trim() }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 最后使用时间 -->
        <el-table-column align="center" label="最后使用" >
          <template #default="scope">
            <div class="last-used">
              {{ scope.row.last_used_at ? formatDate(scope.row.last_used_at) : '从未使用' }}
            </div>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column align="center" label="操作" fixed="right" >
          <template #default="scope">
            <el-button type="primary" link icon="view" @click="viewAccountFun(scope.row)">
              详情
            </el-button>
            <el-button type="primary" link icon="edit" @click="updateAccountFun(scope.row)">
              编辑
            </el-button>
            <el-dropdown @command="handleCommand($event, scope.row)">
              <el-button class="more-button" type="primary" link >
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="resetDaily" divided>重置日交易</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除账号</el-dropdown-item>
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
          <span class="text-lg">{{ type === 'update' ? '编辑支付账号' : '新增支付账号' }}</span>
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

          <el-form-item label="账号名称" prop="name">
            <el-input v-model="form.name" placeholder="支付账号显示名称" />
          </el-form-item>

          <el-form-item label="支付服务商" prop="provider_code">
            <el-select v-model="form.provider_code" placeholder="选择支付服务商" @change="onProviderChange">
              <el-option
                  v-for="provider in providerOptions"
                  :key="provider.code"
                  :label="provider.name"
                  :value="provider.code"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="账号类型" prop="account_type">
            <el-select v-model="form.account_type" placeholder="选择账号类型">
              <el-option label="个人账号" value="personal" />
              <el-option label="企业账号" value="enterprise" />
            </el-select>
          </el-form-item>

          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="选择账号状态">
              <el-option label="正常" value="active" />
              <el-option label="禁用" value="inactive" />
              <el-option label="维护中" value="maintenance" />
            </el-select>
          </el-form-item>

          <el-form-item label="权重" prop="weight">
            <el-input-number
                v-model="form.weight"
                :min="1"
                :max="100"
                placeholder="权重值，越高优先级越高"
            />
            <div class="form-tip">用于控制账号在支付时的选择优先级,数字越大权重越高，权重是0-100的数字</div>
          </el-form-item>

          <el-form-item label="日限额" prop="max_daily_amount">
            <el-input-number
                v-model="form.max_daily_amount"
                :min="0"
                :precision="2"
                placeholder="日最大交易金额"
            />
            <div class="form-tip">单位：元，0表示无限制</div>
          </el-form-item>
        </div>

        <!-- 分组标签 -->
        <div class="form-section">
          <h3 class="section-title">分组标签</h3>

          <el-form-item label="分组" prop="group">
            <el-input v-model="form.group" placeholder="账号分组" />
            <div class="form-tip">用于对账号进行分组管理</div>
          </el-form-item>

          <el-form-item label="地区" prop="region">
            <el-input v-model="form.region" placeholder="服务地区" />
          </el-form-item>

          <el-form-item label="标签" prop="tags">
            <el-input
                v-model="form.tags"
                placeholder="多个标签用逗号分隔"
            />
            <div class="form-tip">例如：高优先级,主账号,测试</div>
          </el-form-item>

          <el-form-item label="备注" prop="remark">
            <el-input
                v-model="form.remark"
                type="textarea"
                :rows="3"
                placeholder="账号备注信息"
            />
          </el-form-item>
        </div>

        <!-- 配置信息 -->
        <div class="form-section">
          <h3 class="section-title">配置参数</h3>

          <el-form-item label="配置参数" prop="config">
            <el-input
                v-model="configText"
                type="textarea"
                :rows="8"
                placeholder="JSON 格式的配置参数"
                @blur="validateConfig"
            />
            <div class="form-tip">
              根据所选支付服务商填写对应的配置参数
            </div>
            <div v-if="configError" class="error-tip">
              {{ configError }}
            </div>
          </el-form-item>

          <el-collapse v-model="activeConfigHelp">
            <el-collapse-item title="配置参数示例" name="help">
              <pre class="config-example">{{ getConfigExample() }}</pre>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-form>
    </el-drawer>

    <!-- 详情查看抽屉 -->
    <el-drawer v-model="viewDrawerVisible" :size="800" :show-close="false">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-lg">支付账号详情</span>
          <el-button @click="viewDrawerVisible = false">关闭</el-button>
        </div>
      </template>

      <div v-if="viewData" class="account-detail">
        <div class="detail-section">
          <h4>基础信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="账号名称">{{ viewData.name }}</el-descriptions-item>
            <el-descriptions-item label="支付服务商">{{ getProviderName(viewData.provider_code) }}</el-descriptions-item>
            <el-descriptions-item label="账号类型">
              <el-tag :type="viewData.account_type === 'enterprise' ? 'warning' : 'primary'">
                {{ viewData.account_type === 'enterprise' ? '企业' : '个人' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusTagType(viewData.status)">
                {{ getStatusLabel(viewData.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="权重">{{ viewData.weight }}</el-descriptions-item>
            <el-descriptions-item label="分组">{{ viewData.group || '无' }}</el-descriptions-item>
            <el-descriptions-item label="地区">{{ viewData.region || '无' }}</el-descriptions-item>
            <el-descriptions-item label="标签">{{ viewData.tags || '无' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <h4>交易统计</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="日限额">¥{{ formatMoney(viewData.max_daily_amount) }}</el-descriptions-item>
            <el-descriptions-item label="日交易金额">¥{{ formatMoney(viewData.daily_amount) }}</el-descriptions-item>
            <el-descriptions-item label="总交易金额">¥{{ formatMoney(viewData.total_amount) }}</el-descriptions-item>
            <el-descriptions-item label="总订单数">{{ viewData.total_orders }}</el-descriptions-item>
            <el-descriptions-item label="最后使用时间" :span="2">
              {{ viewData.last_used_at ? formatDate(viewData.last_used_at) : '从未使用' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <h4>备注信息</h4>
          <div class="remark-content">
            {{ viewData.remark || '暂无备注' }}
          </div>
        </div>

        <div class="detail-section">
          <h4>配置参数</h4>
          <div class="config-content">
            <pre v-if="viewData.config">{{ formatConfigJson(viewData.config) }}</pre>
            <div v-else class="no-config">暂未配置</div>
          </div>
        </div>

        <div class="detail-section">
          <h4>创建信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="创建时间">{{ formatDate(viewData.CreatedAt) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDate(viewData.UpdatedAt) }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import {
  createPaymentAccount,
  updatePaymentAccount,
  deletePaymentAccount,
  getPaymentAccount,
  getPaymentAccountList,
  updateAccountWeight,
  resetDailyAmount,
} from '@/api/project/payment/account'
import { getPaymentProviderList } from '@/api/project/payment/provider'
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/format'

defineOptions({
  name: 'PaymentAccountManagement'
})

// 搜索表单
const searchForm = reactive({
  name: '',
  provider_code: '',
  account_type: '',
  status: '',
  group: ''
})

// 表单数据
const form = ref({
  name: '',
  provider_code: '',
  account_type: 'personal',
  status: 'active',
  weight: 1,
  max_daily_amount: 0,
  config: {},
  group: '',
  region: '',
  tags: '',
  remark: ''
})

// 配置参数文本
const configText = ref('')
const configError = ref('')
const activeConfigHelp = ref([])

// 支付服务商选项
const providerOptions = ref([])

// 表单验证规则
const rules = reactive({
  name: [
    { required: true, message: '请输入账号名称', trigger: 'blur' },
    { min: 1, max: 100, message: '账号名称长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  provider_code: [
    { required: true, message: '请选择支付服务商', trigger: 'change' }
  ],
  account_type: [
    { required: true, message: '请选择账号类型', trigger: 'change' }
  ],
  config: [
    { required: true, message: '请填写配置参数', trigger: 'blur' }
  ]
})

// 分页数据
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])
const loading = ref(false)
const submitLoading = ref(false)

// 表单引用
const formRef = ref(null)

// 抽屉状态
const drawerFormVisible = ref(false)
const viewDrawerVisible = ref(false)
const type = ref('')
const viewData = ref(null)

// 格式化金额
const formatMoney = (amount) => {
  return parseFloat(amount || 0).toFixed(2)
}

// 获取日使用率百分比
const getDailyUsagePercent = (row) => {
  if (!row.max_daily_amount || row.max_daily_amount === 0) return 0
  return Math.min((row.daily_amount / row.max_daily_amount * 100), 100)
}

// 获取进度条颜色
const getProgressColor = (row) => {
  const percent = getDailyUsagePercent(row)
  if (percent >= 90) return '#f56c6c'
  if (percent >= 70) return '#e6a23c'
  return '#67c23a'
}

// 获取支付服务商名称
const getProviderName = (code) => {
  const provider = providerOptions.value.find(p => p.code === code)
  return provider ? provider.name : code
}

// 验证配置参数
const validateConfig = () => {
  configError.value = ''
  if (configText.value.trim()) {
    try {
      const parsed = JSON.parse(configText.value)
      form.value.config = parsed
    } catch (error) {
      configError.value = 'JSON 格式错误: ' + error.message
    }
  } else {
    form.value.config = {}
  }
}

// 获取配置示例
const getConfigExample = () => {
  const provider = providerOptions.value.find(p => p.code === form.value.provider_code)
  if (provider && provider.config_schema) {
    // 这里可以根据schema生成示例
    return `{
  "app_id": "your_app_id",
  "app_secret": "your_app_secret",
  "callback_url": "https://your-domain.com/callback"
}`
  }
  return `{
  "app_id": "your_app_id",
  "app_secret": "your_app_secret",
  "callback_url": "https://your-domain.com/callback"
}`
}

// 支付服务商变更处理
const onProviderChange = () => {
  // 清空配置
  configText.value = ''
  form.value.config = {}
}

// 格式化配置JSON
const formatConfigJson = (config) => {
  try {
    return JSON.stringify(config, null, 2)
  } catch (error) {
    return JSON.stringify(config)
  }
}

// 工具方法
const getStatusLabel = (status) => {
  const labels = {
    active: '正常',
    inactive: '禁用',
    maintenance: '维护中'
  }
  return labels[status] || status
}

const getStatusTagType = (status) => {
  const types = {
    active: 'success',
    inactive: 'danger',
    maintenance: 'warning'
  }
  return types[status] || 'info'
}

// 更新权重
const updateWeight = async (row) => {
  try {
    const res = await updateAccountWeight({
      id: row.ID,
      weight: row.weight
    })
    if (res.code === 0) {
      ElMessage.success('权重更新成功')
    }
  } catch (error) {
    ElMessage.error('权重更新失败')
    console.error(error)
  }
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
    name: '',
    provider_code: '',
    account_type: '',
    status: '',
    group: ''
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
    const table = await getPaymentAccountList(params)
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

// 获取支付服务商列表
const getProviderOptions = async () => {
  try {
    const res = await getPaymentProviderList({ page:1,pageSize: 100 })
    if (res.code === 0) {
      providerOptions.value = res.data.list
    }
  } catch (error) {
    console.error('获取支付服务商列表失败:', error)
  }
}

// 查看详情
const viewAccountFun = async (row) => {
  try {
    const res = await getPaymentAccount({ id: row.ID })
    if (res.code === 0) {
      viewData.value = res.data
      viewDrawerVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
    console.error(error)
  }
}

// 编辑账号
const updateAccountFun = async (row) => {
  try {
    const res = await getPaymentAccount({ id: row.ID })
    type.value = 'update'
    if (res.code === 0) {
      form.value = { ...res.data }
      configText.value = res.data.config
      drawerFormVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取账号信息失败')
    console.error(error)
  }
}

// 命令处理
const handleCommand = async (command, row) => {
  switch (command) {
    case 'resetDaily':
      await resetDailyAmountFun(row)
      break
    case 'delete':
      await deleteAccountFun(row)
      break
  }
}


// 重置日交易金额
const resetDailyAmountFun = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要重置账号 ${row.name} 的日交易金额吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await resetDailyAmount({ id: row.ID })
    if (res.code === 0) {
      ElMessage.success('重置成功')
      await getTableData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重置失败')
      console.error(error)
    }
  }
}

// 删除账号
const deleteAccountFun = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除账号 ${row.name} 吗？删除后无法恢复！`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deletePaymentAccount({ id: row.ID })
    if (res.code === 0) {
      ElMessage.success('删除成功')
      if (tableData.value.length === 1 && page.value > 1) {
        page.value--
      }
      getTableData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
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
    name: '',
    provider_code: '',
    account_type: 'personal',
    status: 'active',
    weight: 1,
    max_daily_amount: 0,
    config: {},
    group: '',
    region: '',
    tags: '',
    remark: ''
  }
  configText.value = ''
  configError.value = ''
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 提交表单
const enterDrawer = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    // 验证配置参数
    validateConfig()
    if (configError.value) {
      ElMessage.error('配置参数格式错误，请检查')
      return
    }

    submitLoading.value = true

    // 处理提交数据
    const submitData = { ...form.value }

    // 清空非必要字段
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '') {
        if (['group', 'region', 'tags', 'remark'].includes(key)) {
          submitData[key] = null
        }
      }
    })

    let res
    switch (type.value) {
      case 'create':
        res = await createPaymentAccount(submitData)
        break
      case 'update':
        res = await updatePaymentAccount(submitData)
        break
      default:
        res = await createPaymentAccount(submitData)
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
onMounted(async () => {
  await getProviderOptions()
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

.account-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.account-name {
  font-weight: 600;
  color: #303133;
}

.provider-info {
  display: flex;
  gap: 8px;
  align-items: center;
}

.account-type {
  display: flex;
  gap: 8px;
  align-items: center;
}

.group-tag {
  font-size: 12px;
  color: #909399;
  background: #f4f4f5;
  padding: 2px 6px;
  border-radius: 4px;
}

.trade-stats {
  font-size: 12px;
}

.amount-info, .order-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}

.label {
  color: #909399;
}

.value {
  color: #303133;
  font-weight: 500;
}

.limit-info {
  text-align: center;
}

.limit-amount {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.region-tags {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.last-used {
  font-size: 12px;
  color: #606266;
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

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.error-tip {
  font-size: 12px;
  color: #f56c6c;
  margin-top: 4px;
}

.config-example {
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  line-height: 1.4;
  overflow-x: auto;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section h4 {
  margin: 0 0 15px 0;
  color: #409eff;
  font-weight: 600;
}

.account-detail {
  padding: 10px 0;
}

.remark-content {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  min-height: 80px;
  line-height: 1.6;
}

.config-content {
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
}

.config-content pre {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.no-config {
  color: #909399;
  font-style: italic;
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

.more-button {
  margin-left: 8px;
}
</style>