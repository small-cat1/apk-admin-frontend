<template>
  <div>
    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button type="primary" icon="plus" @click="openDrawer">
          新增服务商
        </el-button>
      </div>

      <!-- 搜索筛选区域 -->
      <div class="search-box mb-4">
        <el-row :gutter="20">
          <el-col :span="4">
            <el-input
                v-model="searchForm.name"
                placeholder="服务商名称"
                clearable
                @clear="getTableData"
                @keyup.enter="getTableData"
            />
          </el-col>
          <el-col :span="4">
            <el-input
                v-model="searchForm.code"
                placeholder="服务商代码"
                clearable
                @clear="getTableData"
                @keyup.enter="getTableData"
            />
          </el-col>
          <el-col :span="3">
            <el-select
                v-model="searchForm.status"
                placeholder="状态"
                clearable
                @change="getTableData"
            >
              <el-option label="启用" value="active" />
              <el-option label="禁用" value="inactive" />
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
          tooltip-effect="dark"
          row-key="id"
          v-loading="loading"
      >

        <!-- 服务商信息 -->
        <el-table-column align="left" label="服务商信息"  fixed="left">
          <template #default="scope">
            <div class="provider-info">
              <div class="provider-details">
                <div class="provider-name">{{ scope.row.name }}</div>
                <div class="provider-code">代码: {{ scope.row.code }}</div>
                <div class="provider-description">{{ scope.row.description || '暂无描述' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column align="center" label="状态" >
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 排序 -->
        <el-table-column align="center" label="排序" >
          <template #default="scope">
            <el-input-number
                v-model="scope.row.sort_order"
                :min="0"
                :max="9999"
                size="small"
                @change="updateSortOrder(scope.row)"
            />
          </template>
        </el-table-column>

        <!-- 创建信息 -->
        <el-table-column align="center" label="创建信息" >
          <template #default="scope">
            <div>
              <div class="text-sm">{{ formatDate(scope.row.created_at) }}</div>
            </div>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column align="center" label="操作" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="view" @click="viewProviderFun(scope.row)">
              详情
            </el-button>
            <el-button type="primary" link icon="edit" @click="updateProviderFun(scope.row)">
              编辑
            </el-button>
            <el-dropdown @command="handleCommand($event, scope.row)">
              <el-button class="more-button" type="primary" link >
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="disable" v-if="scope.row.status === 'active'">禁用服务商</el-dropdown-item>
                  <el-dropdown-item command="enable" v-if="scope.row.status === 'inactive'">启用服务商</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除服务商</el-dropdown-item>
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
          <span class="text-lg">{{ type === 'update' ? '编辑服务商' : '新增服务商' }}</span>
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

          <el-form-item label="服务商代码" prop="code">
            <el-input
                v-model="form.code"
                placeholder="如: wechat, alipay, stripe, paypal"
                :disabled="type === 'update'"
            />
            <div class="form-tip">服务商唯一标识符，创建后不可修改</div>
          </el-form-item>

          <el-form-item label="服务商名称" prop="name">
            <el-input v-model="form.name" placeholder="服务商显示名称" />
          </el-form-item>
          <el-form-item label="服务商图标" prop="icon">
            <div style="width: 100%">
              <el-input
                  v-model="form.icon"
                  placeholder="请选择图标"
                  autocomplete="off"
                  readonly
              >
              </el-input>
              <el-button
                  type="primary"
                  size="small"
                  style="margin-top: 8px; width: 100%"
                  @click="showIconSelector = true"
              >
                选择图标
              </el-button>
              <IconSelector
                  v-model="form.icon"
                  v-model:visible="showIconSelector"
                  @change="handleIconChange"
              />
            </div>
          </el-form-item>

          <el-form-item label="服务商描述" prop="description">
            <el-input
                v-model="form.description"
                type="textarea"
                :rows="3"
                placeholder="服务商描述信息"
            />
          </el-form-item>

          <el-form-item label="排序" prop="sort_order">
            <el-input-number
                v-model="form.sort_order"
                :min="0"
                :max="9999"
                placeholder="数值越小越靠前"
            />
            <div class="form-tip">用于控制服务商在前端的显示顺序</div>
          </el-form-item>

          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="选择服务商状态">
              <el-option label="启用" value="active" />
              <el-option label="禁用" value="inactive" />
            </el-select>
          </el-form-item>
        </div>


      </el-form>
    </el-drawer>

    <!-- 详情查看抽屉 -->
    <el-drawer v-model="viewDrawerVisible" :size="800" :show-close="false">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-lg">服务商详情</span>
          <el-button @click="viewDrawerVisible = false">关闭</el-button>
        </div>
      </template>

      <div v-if="viewData" class="provider-detail">
        <div class="detail-section">
          <h4>基础信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="服务商代码">{{ viewData.code }}</el-descriptions-item>
            <el-descriptions-item label="服务商名称">{{ viewData.name }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusTagType(viewData.status)">
                {{ getStatusLabel(viewData.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="排序">{{ viewData.sort_order }}</el-descriptions-item>
            <el-descriptions-item label="服务商图标">{{ viewData.icon }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <h4>服务商描述</h4>
          <div class="description-content">
            {{ viewData.description || '暂无描述' }}
          </div>
        </div>


        <div class="detail-section">
          <h4>创建信息</h4>
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
  createPaymentProvider,
  updatePaymentProvider,
  deletePaymentProvider,
  getPaymentProvider,
  getPaymentProviderList,
  updateProviderSortOrder,
  batchUpdatePaymentProviderStatus
} from '@/api/project/payment/provider'
import IconSelector from '@/components/IconSelector/IconSelector.vue'
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/format'
defineOptions({
  name: 'PaymentProviderManagement'
})
// 图标选择器显示状态
const showIconSelector = ref(false)
// 搜索表单
const searchForm = reactive({
  name: '',
  code: '',
  status: ''
})

// 表单数据
const form = ref({
  code: '',
  name: '',
  description: '',
  status: 'active',
  icon: '',
  sort_order: 0
})



// 表单验证规则
const rules = reactive({
  code: [
    { required: true, message: '请输入服务商代码', trigger: 'blur' },
    { min: 2, max: 50, message: '服务商代码长度在 2 到 50 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_-]+$/, message: '服务商代码只能包含字母、数字、下划线和连字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入服务商名称', trigger: 'blur' },
    { min: 1, max: 100, message: '服务商名称长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  icon:[
    { required: true, message: '请选择服务商图标', trigger: 'blur' },
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



// 图标变化处理函数
const handleIconChange = (iconName) => {
  form.value.icon = iconName
}
// 工具方法
const getStatusLabel = (status) => {
  const labels = {
    active: '启用',
    inactive: '禁用'
  }
  return labels[status] || status
}

const getStatusTagType = (status) => {
  const types = {
    active: 'success',
    inactive: 'danger'
  }
  return types[status] || 'info'
}

// 更新排序
const updateSortOrder = async (row) => {
  try {
    const res = await updateProviderSortOrder({
      id: row.id,
      sort_order: row.sort_order
    })
    if (res.code === 0) {
      ElMessage.success('排序更新成功')
    }
  } catch (error) {
    ElMessage.error('排序更新失败')
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
    code: '',
    status: ''
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
    const table = await getPaymentProviderList(params)
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
const viewProviderFun = async (row) => {
  try {
    const res = await getPaymentProvider({ id: row.id })
    if (res.code === 0) {
      viewData.value = res.data
      viewDrawerVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
    console.error(error)
  }
}

// 编辑服务商
const updateProviderFun = async (row) => {
  try {
    const res = await getPaymentProvider({ id: row.id })
    type.value = 'update'
    if (res.code === 0) {
      form.value = { ...res.data }
      drawerFormVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取服务商信息失败')
    console.error(error)
  }
}

// 命令处理
const handleCommand = async (command, row) => {
  switch (command) {
    case 'disable':
      await updateProviderStatusFun(row, 'inactive')
      break
    case 'enable':
      await updateProviderStatusFun(row, 'active')
      break
    case 'delete':
      await deleteProviderFun(row)
      break
  }
}

// 更新服务商状态
const updateProviderStatusFun = async (row, status) => {
  try {
    const action = status === 'inactive' ? '禁用' : '启用'
    await ElMessageBox.confirm(`确定要${action}服务商 ${row.name} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await batchUpdatePaymentProviderStatus({ ids: [row.id], status })
    if (res.code === 0) {
      ElMessage.success(`${action}成功`)
      await getTableData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
      console.error(error)
    }
  }
}

// 删除服务商
const deleteProviderFun = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除服务商 ${row.name} 吗？删除后无法恢复！`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deletePaymentProvider({ id: row.id })
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
    code: '',
    name: '',
    description: '',
    status: 'active',
    icon: '',
    sort_order: 0
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

    // 清空非必要字段
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '') {
        if (['icon', 'description'].includes(key)) {
          submitData[key] = null
        }
      }
    })

    let res
    switch (type.value) {
      case 'create':
        res = await createPaymentProvider(submitData)
        break
      case 'update':
        res = await updatePaymentProvider(submitData)
        break
      default:
        res = await createPaymentProvider(submitData)
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

.provider-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.provider-details {
  flex: 1;
  min-width: 0;
}

.provider-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.provider-code {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.provider-description {
  font-size: 12px;
  color: #606266;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

.provider-detail {
  padding: 10px 0;
}

.description-content {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  min-height: 80px;
  line-height: 1.6;
}


.config-schema-content pre {
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

.upload-section {
  padding: 10px 0;
}

.upload-tip {
  margin-bottom: 16px;
}

.upload-area {
  margin-bottom: 16px;
}

.preview-area h4 {
  margin-bottom: 8px;
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

.mt-2 {
  margin-top: 8px;
}

.text-lg {
  font-size: 1.125rem;
}

.text-sm {
  font-size: 0.875rem;
}

.more-button {
  margin-left: 8px;
}
</style>