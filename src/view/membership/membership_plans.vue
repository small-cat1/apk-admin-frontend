<template>
  <div>
    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button type="primary" icon="plus" @click="openDrawer">
          新增会员套餐
        </el-button>
      </div>

      <!-- 搜索筛选区域 -->
      <div class="search-box mb-4">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
                v-model="searchForm.plan_code"
                placeholder="套餐代码"
                clearable
                @clear="getTableData"
                @keyup.enter="getTableData"
            />
          </el-col>
          <el-col :span="6">
            <el-input
                v-model="searchForm.plan_name"
                placeholder="套餐名称"
                clearable
                @clear="getTableData"
                @keyup.enter="getTableData"
            />
          </el-col>
          <el-col :span="4">
            <el-select
                v-model="searchForm.plan_type"
                placeholder="套餐类型"
                clearable
                @change="getTableData"
            >
              <el-option label="月套餐" value="monthly" />
              <el-option label="年套餐" value="yearly" />
              <el-option label="终身套餐" value="lifetime" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select
                v-model="searchForm.platform"
                placeholder="支持平台"
                clearable
                @change="getTableData"
            >
              <el-option label="Android" value="android" />
              <el-option label="iOS" value="ios" />
              <el-option label="HarmonyOS" value="harmony" />
              <el-option label="Windows" value="windows" />
            </el-select>
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
          style="width: 100%"
          tooltip-effect="dark"
          row-key="id"
          v-loading="loading"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column align="left" label="套餐代码"  prop="plan_code" />

        <el-table-column align="left" label="套餐名称"  prop="plan_name" show-overflow-tooltip />

        <el-table-column align="center" label="套餐类型" width="100">
          <template #default="scope">
            <el-tag
                :type="getPlanTypeTagType(scope.row.plan_type)"
                size="small"
            >
              {{ getPlanTypeLabel(scope.row.plan_type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column align="center" label="支持平台" >
          <template #default="scope">
            <div class="platform-tags">
              <el-tag
                  v-for="platform in getPlatformArray(scope.row.platform)"
                  :key="platform"
                  :type="getPlatformTagType(platform)"
                  size="small"
                  class="platform-tag"
              >
                {{ getPlatformLabel(platform) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column align="center" label="有效期" width="100">
          <template #default="scope">
            <span v-if="scope.row.plan_type === 'lifetime'" class="text-orange-500 font-medium">
              终身
            </span>
            <span v-else>
              {{ scope.row.duration_days }} 天
            </span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="价格信息" >
          <template #default="scope">
            <div>
              <div v-if="scope.row.discount_percentage > 0" class="text-xs text-gray-400 line-through">
                原价: {{ scope.row.base_price }} {{ scope.row.currency_code }}
              </div>
              <div class="font-medium text-red-500">
                {{ scope.row.final_price }} {{ scope.row.currency_code }}
              </div>
              <div v-if="scope.row.discount_percentage > 0" class="text-xs text-green-500">
                {{ scope.row.discount_percentage }}% OFF
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column align="center" label="下载限制" >
          <template #default="scope">
            <div>
              <div v-if="scope.row.download_limit_daily" class="text-xs">
                日限: {{ scope.row.download_limit_daily }}
              </div>
              <div v-if="scope.row.download_limit_monthly" class="text-xs">
                月限: {{ scope.row.download_limit_monthly }}
              </div>
              <span v-if="!scope.row.download_limit_daily && !scope.row.download_limit_monthly" class="text-green-500">
                无限制
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column align="center" label="状态" >
          <template #default="scope">
            <el-tag :type="scope.row.is_active ? 'success' : 'danger'" size="small">
              {{ scope.row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column align="center" label="推荐" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.is_featured ? 'warning' : 'info'" size="small">
              {{ scope.row.is_featured ? '推荐' : '普通' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column align="center" label="排序"  prop="sort_order" />

        <el-table-column align="left" label="创建时间" >
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column align="center" label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
                type="primary"
                link
                icon="view"
                @click="viewPlanFun(scope.row)"
            >
              详情
            </el-button>
            <el-button
                type="primary"
                link
                icon="edit"
                @click="updatePlanFun(scope.row)"
            >
              编辑
            </el-button>
            <el-button
                type="danger"
                link
                icon="delete"
                @click="deletePlanFun(scope.row)"
            >
              删除
            </el-button>
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
          <span class="text-lg">{{ type === 'update' ? '编辑会员套餐' : '新增会员套餐' }}</span>
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



          <el-form-item label="套餐代码" prop="plan_code">
            <el-input v-model="form.plan_code" placeholder="唯一套餐代码，如：premium_monthly" />
            <div class="text-xs text-gray-500 mt-1">套餐的唯一标识符，创建后不可修改</div>
          </el-form-item>

          <el-form-item label="套餐名称" prop="plan_name">
            <el-input v-model="form.plan_name" placeholder="套餐显示名称" />
          </el-form-item>

          <el-form-item label="支持平台" prop="platform">
            <el-select v-model="form.platform" multiple placeholder="请选择支持平台">
              <el-option label="Android" value="android" />
              <el-option label="iOS" value="ios" />
              <el-option label="HarmonyOS" value="harmony" />
              <el-option label="Windows" value="windows" />
            </el-select>
            <div class="text-xs text-gray-500 mt-1">可多选</div>
          </el-form-item>

          <el-form-item label="套餐类型" prop="plan_type">
            <el-select v-model="form.plan_type" placeholder="请选择套餐类型" @change="onPlanTypeChange">
              <el-option label="月套餐" value="monthly" />
              <el-option label="年套餐" value="yearly" />
              <el-option label="终身套餐" value="lifetime" />
            </el-select>
          </el-form-item>


          <el-form-item label="有效天数" prop="duration_days" v-if="form.plan_type !== 'lifetime'">
            <el-input-number
                v-model="form.duration_days"
                :min="1"
                placeholder="套餐有效天数"
                style="width: 100%"
            />
            <div class="text-xs text-gray-500 mt-1">终身套餐无需设置此项</div>
          </el-form-item>
        </div>

        <!-- 价格信息 -->
        <div class="form-section">
          <h3 class="section-title">价格信息</h3>

          <el-form-item label="基础价格" prop="base_price">
            <el-input-number
                v-model="form.base_price"
                :min="0"
                :precision="2"
                placeholder="基础价格"
                style="width: 100%"
                @change="calculateFinalPrice"
            />
          </el-form-item>

          <el-form-item label="货币代码" prop="currency_code">
            <el-select v-model="form.currency_code" placeholder="选择货币">
              <el-option label="美元 (USD)" value="USD" />
              <el-option label="人民币 (CNY)" value="CNY" />
              <el-option label="欧元 (EUR)" value="EUR" />
              <el-option label="日元 (JPY)" value="JPY" />
              <el-option label="英镑 (GBP)" value="GBP" />
            </el-select>
          </el-form-item>

          <el-form-item label="折扣百分比" prop="discount_percentage">
            <el-input-number
                v-model="form.discount_percentage"
                :min="0"
                :max="100"
                :precision="2"
                placeholder="折扣百分比"
                style="width: 100%"
                @change="calculateFinalPrice"
            />
            <div class="text-xs text-gray-500 mt-1">0-100，0表示无折扣</div>
          </el-form-item>

          <el-form-item label="最终价格" prop="final_price">
            <el-input-number
                v-model="form.final_price"
                :min="0"
                :precision="2"
                placeholder="最终价格"
                style="width: 100%"
            />
            <div class="text-xs text-gray-500 mt-1">用户实际支付的价格</div>
          </el-form-item>
        </div>

        <!-- 限制设置 -->
        <div class="form-section">
          <h3 class="section-title">下载限制</h3>

          <el-form-item label="每日下载限制" prop="download_limit_daily">
            <el-input-number
                v-model="form.download_limit_daily"
                :min="0"
                placeholder="每日下载限制"
                style="width: 100%"
            />
            <div class="text-xs text-gray-500 mt-1">0或留空表示无限制</div>
          </el-form-item>

          <el-form-item label="每月下载限制" prop="download_limit_monthly">
            <el-input-number
                v-model="form.download_limit_monthly"
                :min="0"
                placeholder="每月下载限制"
                style="width: 100%"
            />
            <div class="text-xs text-gray-500 mt-1">0或留空表示无限制</div>
          </el-form-item>
        </div>

        <!-- 其他设置 -->
        <div class="form-section">
          <h3 class="section-title">其他设置</h3>

          <el-form-item label="是否启用" prop="is_active">
            <el-switch
                v-model="form.is_active"
                :active-value="true"
                :inactive-value="false"
                active-text="启用"
                inactive-text="禁用"
            />
          </el-form-item>

          <el-form-item label="是否推荐" prop="is_featured">
            <el-switch
                v-model="form.is_featured"
                :active-value="true"
                :inactive-value="false"
                active-text="推荐"
                inactive-text="普通"
            />
          </el-form-item>

          <el-form-item label="排序权重" prop="sort_order">
            <el-input-number
                v-model="form.sort_order"
                :min="0"
                placeholder="排序权重"
                style="width: 100%"
            />
            <div class="text-xs text-gray-500 mt-1">数值越小排序越靠前</div>
          </el-form-item>

          <el-form-item label="套餐描述" prop="description">
            <el-input
                v-model="form.description"
                type="textarea"
                :rows="4"
                placeholder="套餐详细描述"
            />
          </el-form-item>
        </div>
      </el-form>
    </el-drawer>

    <!-- 详情查看抽屉 -->
    <el-drawer
        v-model="viewDrawerVisible"
        :size="600"
        :show-close="false"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-lg">会员套餐详情</span>
          <el-button @click="viewDrawerVisible = false">关闭</el-button>
        </div>
      </template>

      <div v-if="viewData" class="plan-detail">
        <div class="detail-section">
          <h4>基础信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="套餐代码">{{ viewData.plan_code }}</el-descriptions-item>
            <el-descriptions-item label="套餐名称">{{ viewData.plan_name }}</el-descriptions-item>
            <el-descriptions-item label="套餐类型">{{ getPlanTypeLabel(viewData.plan_type) }}</el-descriptions-item>
            <!-- 详情页面的平台显示 -->
            <el-descriptions-item label="支持平台">
              <div class="platform-tags">
                <el-tag
                    v-for="platform in getPlatformArray(viewData.platform)"
                    :key="platform"
                    :type="getPlatformTagType(platform)"
                    size="small"
                    class="platform-tag"
                >
                  {{ getPlatformLabel(platform) }}
                </el-tag>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="有效期">
              {{ viewData.plan_type === 'lifetime' ? '终身' : viewData.duration_days + ' 天' }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="viewData.is_active ? 'success' : 'danger'" size="small">
                {{ viewData.is_active ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <h4>价格信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="基础价格">{{ viewData.base_price }} {{ viewData.currency_code }}</el-descriptions-item>
            <el-descriptions-item label="折扣">{{ viewData.discount_percentage }}%</el-descriptions-item>
            <el-descriptions-item label="最终价格">
              <span class="font-medium text-red-500">{{ viewData.final_price }} {{ viewData.currency_code }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="货币">{{ viewData.currency_code }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <h4>下载限制</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="每日限制">
              {{ viewData.download_limit_daily || '无限制' }}
            </el-descriptions-item>
            <el-descriptions-item label="每月限制">
              {{ viewData.download_limit_monthly || '无限制' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section" v-if="viewData.description">
          <h4>套餐描述</h4>
          <div class="description-content">{{ viewData.description }}</div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import {
  createMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
  getMembershipPlan,
  getMembershipPlanList
} from '@/api/project/membershipPlan'
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/format'

defineOptions({
  name: 'MembershipPlanManagement'
})

// 搜索表单
const searchForm = reactive({
  plan_code: '',
  plan_name: '',
  plan_type: '',
  platform: ''
})

// 表单数据
const form = ref({
  plan_code: '',
  plan_name: '',
  plan_type: '',
  platform: '',
  duration_days: null,
  base_price: 0,
  currency_code: 'CNY',
  discount_percentage: 0,
  final_price: 0,
  download_limit_daily: null,
  download_limit_monthly: null,
  is_active: true,
  is_featured: false,
  sort_order: 0,
  description: ''
})

// 表单验证规则
const rules = reactive({
  plan_code: [
    { required: true, message: '请输入套餐代码', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '套餐代码只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  plan_name: [
    { required: true, message: '请输入套餐名称', trigger: 'blur' }
  ],
  plan_type: [
    { required: true, message: '请选择套餐类型', trigger: 'change' }
  ],
  platform: [
    { required: true, message: '请选择平台', trigger: 'change' }
  ],
  base_price: [
    { required: true, message: '请输入基础价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格不能小于0', trigger: 'blur' }
  ],
  currency_code: [
    { required: true, message: '请选择货币代码', trigger: 'change' }
  ],
  final_price: [
    { required: true, message: '请输入最终价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格不能小于0', trigger: 'blur' }
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

// 优化后的工具方法
const getPlatformArray = (platform) => {
  // 处理平台数据，兼容字符串和数组格式
  if (!platform) return []

  // 如果是字符串，尝试解析为JSON
  if (typeof platform === 'string') {
    try {
      const parsed = JSON.parse(platform)
      return Array.isArray(parsed) ? parsed : [platform]
    } catch {
      // 解析失败，当作单个平台处理
      return [platform]
    }
  }

  // 如果已经是数组，直接返回
  return Array.isArray(platform) ? platform : []
}

// 工具方法
const getPlatformLabel = (platform) => {
  const labels = {
    android: 'Android',
    ios: 'iOS',
    harmony: 'HarmonyOS',
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
  return types[platform] || 'info'
}

const getPlanTypeLabel = (planType) => {
  const labels = {
    monthly: '月套餐',
    yearly: '年套餐',
    lifetime: '终身套餐'
  }
  return labels[planType] || planType
}

const getPlanTypeTagType = (planType) => {
  const types = {
    monthly: 'primary',
    yearly: 'success',
    lifetime: 'warning'
  }
  return types[planType] || 'info'
}

// 套餐类型变化处理
const onPlanTypeChange = (value) => {
  if (value === 'lifetime') {
    form.value.duration_days = null
  } else if (value === 'monthly') {
    form.value.duration_days = 30
  } else if (value === 'yearly') {
    form.value.duration_days = 365
  }
  calculateFinalPrice()
}

// 计算最终价格
const calculateFinalPrice = () => {
  if (form.value.base_price && form.value.discount_percentage >= 0) {
    const discountAmount = form.value.base_price * (form.value.discount_percentage / 100)
    form.value.final_price = parseFloat((form.value.base_price - discountAmount).toFixed(2))
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
    plan_code: '',
    plan_name: '',
    plan_type: '',
    platform: ''
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
    console.log(params)
    const table = await getMembershipPlanList(params)
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
const viewPlanFun = async (row) => {
  try {
    const res = await getMembershipPlan({ id: row.id })
    if (res.code === 0) {
      viewData.value = res.data
      viewDrawerVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
    console.error(error)
  }
}

// 编辑
const updatePlanFun = async (row) => {
  try {
    const res = await getMembershipPlan({ id: row.id })
    type.value = 'update'
    if (res.code === 0) {
      form.value = { ...res.data }
      drawerFormVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取套餐信息失败')
    console.error(error)
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
    plan_code: '',
    plan_name: '',
    plan_type: '',
    platform: '',
    duration_days: null,
    base_price: 0,
    currency_code: 'USD',
    discount_percentage: 0,
    final_price: 0,
    download_limit_daily: null,
    download_limit_monthly: null,
    is_active: true,
    is_featured: false,
    sort_order: 0,
    description: ''
  }
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 删除
const deletePlanFun = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个会员套餐吗？删除后无法恢复！', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deleteMembershipPlan({ id: row.id })
    if (res.code === 0) {
      ElMessage({
        type: 'success',
        message: '删除成功'
      })
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

// 提交表单
const enterDrawer = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    // 处理空值转换
    const submitData = { ...form.value }
    if (!submitData.download_limit_daily) {
      submitData.download_limit_daily = null
    }
    if (!submitData.download_limit_monthly) {
      submitData.download_limit_monthly = null
    }
    if (submitData.plan_type === 'lifetime') {
      submitData.duration_days = null
    }

    let res
    switch (type.value) {
      case 'create':
        res = await createMembershipPlan(submitData)
        break
      case 'update':
        res = await updateMembershipPlan(submitData)
        break
      default:
        res = await createMembershipPlan(submitData)
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
  padding: 20px;
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

.plan-detail {
  padding: 10px 0;
}

.description-content {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #409eff;
  line-height: 1.6;
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
  margin-top: 0.25rem;
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

.text-orange-500 {
  color: #f97316;
}

.text-red-500 {
  color: #ef4444;
}

.text-green-500 {
  color: #22c55e;
}

.font-medium {
  font-weight: 500;
}

.line-through {
  text-decoration: line-through;
}
</style>