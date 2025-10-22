<template>
  <div>
    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button type="primary" icon="plus" @click="openDrawer">
          新增等级
        </el-button>
        <el-button type="danger" icon="delete" @click="batchDelete" :disabled="!selectedTiers.length">
          批量删除
        </el-button>
        <el-button type="warning" icon="sort" @click="showSortDialog = true">
          排序管理
        </el-button>
      </div>

      <!-- 搜索筛选区域 -->
      <div class="search-box mb-4">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
                v-model="searchForm.name"
                placeholder="等级名称"
                clearable
                @clear="getTableData"
                @keyup.enter="getTableData"
            />
          </el-col>
          <el-col :span="4">
            <el-select
                v-model="searchForm.status"
                placeholder="状态"
                clearable
                @change="getTableData"
            >
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
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
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column align="center" label="等级名称" width="180">
          <template #default="scope">
            <div class="tier-name-cell">
              <el-icon v-if="scope.row.icon" class="tier-icon" :style="{ color: scope.row.color }">
                <Medal />
              </el-icon>
              <span class="font-semibold" :style="{ color: scope.row.color }">
                {{ scope.row.name }}
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column align="center" label="最低下级人数" width="140">
          <template #default="scope">
            <el-tag type="info" size="large">
              {{ scope.row.minSubordinates }} 人
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column align="center" label="分佣比例" width="120">
          <template #default="scope">
            <el-tag type="success" size="large">
              {{ scope.row.rate }}%
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column align="center" label="等级颜色" width="120">
          <template #default="scope">
            <div class="color-display">
              <div class="color-block" :style="{ backgroundColor: scope.row.color }"></div>
              <span class="text-xs text-gray-500">{{ scope.row.color }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column align="center" label="排序" width="100">
          <template #default="scope">
            <el-tag type="warning" size="small">
              {{ scope.row.sort }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column align="center" label="状态" width="100">
          <template #default="scope">
            <el-switch
                v-model="scope.row.status"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>

        <el-table-column align="center" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column align="center" label="更新时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.updateTime) }}
          </template>
        </el-table-column>

        <el-table-column align="center" label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="view" @click="viewTierFun(scope.row)">
              详情
            </el-button>
            <el-button type="primary" link icon="edit" @click="updateTierFun(scope.row)">
              编辑
            </el-button>
            <el-button type="danger" link icon="delete" @click="deleteTierFun(scope.row)">
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
        :size="600"
        :show-close="false"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-lg">{{ type === 'update' ? '编辑等级' : '新增等级' }}</span>
          <div>
            <el-button @click="closeDrawer">取消</el-button>
            <el-button type="primary" @click="enterDrawer" :loading="submitLoading">确定</el-button>
          </div>
        </div>
      </template>

      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="等级名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：青铜推广员" />
        </el-form-item>

        <el-form-item label="最低下级人数" prop="minSubordinates">
          <el-input-number
              v-model="form.minSubordinates"
              :min="0"
              :max="10000"
              :step="1"
              placeholder="达到此人数可享受该比例"
              class="w-full"
          />
          <div class="text-sm text-gray-500 mt-1">
            用户的直属下级达到此人数时，可享受该等级分佣比例
          </div>
        </el-form-item>

        <el-form-item label="分佣比例" prop="rate">
          <el-input-number
              v-model="form.rate"
              :min="0"
              :max="100"
              :precision="2"
              :step="0.5"
              placeholder="分佣比例"
              class="w-full"
          />
          <template #append>%</template>
          <div class="text-sm text-gray-500 mt-1">
            该等级用户可获得的订单分佣比例
          </div>
        </el-form-item>

        <el-form-item label="等级颜色" prop="color">
          <el-color-picker v-model="form.color" show-alpha />
          <el-input v-model="form.color" placeholder="#cd7f32" class="ml-2" style="width: 200px" />
        </el-form-item>

        <el-form-item label="等级图标" prop="icon">
          <el-input v-model="form.icon" placeholder="图标URL或图标名称" />
          <div class="text-sm text-gray-500 mt-1">
            可以输入图标URL或Element Plus图标名称
          </div>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
              v-model="form.sort"
              :min="0"
              :max="999"
              :step="1"
              placeholder="数字越大等级越高"
              class="w-full"
          />
          <div class="text-sm text-gray-500 mt-1">
            排序值越大，等级越高，显示时越靠后
          </div>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-switch
              v-model="form.status"
              :active-value="1"
              :inactive-value="0"
              active-text="启用"
              inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
    </el-drawer>

    <!-- 详情查看抽屉 -->
    <el-drawer v-model="viewDrawerVisible" :size="600" :show-close="false">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-lg">等级详情</span>
          <el-button @click="viewDrawerVisible = false">关闭</el-button>
        </div>
      </template>

      <div v-if="viewData" class="tier-detail">
        <div class="detail-section">
          <h4>基础信息</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="等级ID">{{ viewData.id }}</el-descriptions-item>
            <el-descriptions-item label="等级名称">
              <span :style="{ color: viewData.color, fontWeight: 'bold' }">
                {{ viewData.name }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="最低下级人数">
              {{ viewData.minSubordinates }} 人
            </el-descriptions-item>
            <el-descriptions-item label="分佣比例">
              <el-tag type="success" size="large">{{ viewData.rate }}%</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="等级颜色">
              <div class="color-display">
                <div class="color-block" :style="{ backgroundColor: viewData.color }"></div>
                <span>{{ viewData.color }}</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="排序">{{ viewData.sort }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="viewData.status === 1 ? 'success' : 'danger'">
                {{ viewData.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDate(viewData.createTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ formatDate(viewData.updateTime) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-drawer>

    <!-- 排序管理对话框 -->
    <el-dialog v-model="showSortDialog" title="排序管理" width="600px">
      <div class="sort-list">
        <el-alert
            title="提示"
            type="info"
            :closable="false"
            class="mb-4"
        >
          拖动调整顺序，排序值越大等级越高
        </el-alert>
        <draggable
            v-model="sortList"
            item-key="id"
            handle=".drag-handle"
            @end="onSortEnd"
        >
          <template #item="{ element }">
            <div class="sort-item">
              <el-icon class="drag-handle">
                <Rank />
              </el-icon>
              <div class="tier-info">
                <span class="tier-name" :style="{ color: element.color }">
                  {{ element.name }}
                </span>
                <span class="tier-details">
                  下级≥{{ element.minSubordinates }}人 | 分佣{{ element.rate }}%
                </span>
              </div>
              <el-tag type="warning" size="small">
                排序: {{ element.sort }}
              </el-tag>
            </div>
          </template>
        </draggable>
      </div>
      <template #footer>
        <el-button @click="showSortDialog = false">取消</el-button>
        <el-button type="primary" @click="saveSortOrder" :loading="sortLoading">
          保存排序
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  createCommissionTier,
  updateCommissionTier,
  deleteCommissionTier,
  getCommissionTier,
  getCommissionTierList,
  updateCommissionTierStatus,
  updateCommissionTierSort
} from '@/api/project/commissionTier'
import { ref, reactive, onMounted,watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/format'
import draggable from 'vuedraggable'

defineOptions({
  name: 'CommissionTierManagement'
})

// 搜索表单
const searchForm = reactive({
  name: '',
  status: null
})

// 表单数据
const form = ref({
  name: '',
  minSubordinates: 0,
  rate: 10.00,
  color: '#cd7f32',
  icon: '',
  sort: 0,
  status: 1
})

// 表单验证规则
const rules = reactive({
  name: [
    { required: true, message: '请输入等级名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  minSubordinates: [
    { required: true, message: '请输入最低下级人数', trigger: 'blur' }
  ],
  rate: [
    { required: true, message: '请输入分佣比例', trigger: 'blur' }
  ],
  color: [
    { required: true, message: '请选择等级颜色', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ]
})

// 分页数据
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])
const loading = ref(false)
const submitLoading = ref(false)
const selectedTiers = ref([])

// 表单引用
const formRef = ref(null)

// 抽屉状态
const drawerFormVisible = ref(false)
const viewDrawerVisible = ref(false)
const type = ref('')
const viewData = ref(null)

// 排序对话框
const showSortDialog = ref(false)
const sortList = ref([])
const sortLoading = ref(false)

// 选择变更处理
const handleSelectionChange = (selection) => {
  selectedTiers.value = selection
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
    status: null
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
    const table = await getCommissionTierList(params)
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
const viewTierFun = async (row) => {
  try {
    const res = await getCommissionTier({ id: row.id })
    if (res.code === 0) {
      viewData.value = res.data.tier
      viewDrawerVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
    console.error(error)
  }
}

// 编辑等级
const updateTierFun = async (row) => {
  try {
    const res = await getCommissionTier({ id: row.id })
    type.value = 'update'
    if (res.code === 0) {
      form.value = { ...res.data.tier }
      drawerFormVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取等级信息失败')
    console.error(error)
  }
}

// 删除等级
const deleteTierFun = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除等级 ${row.name} 吗？删除后无法恢复！`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deleteCommissionTier({ ids:[row.id] })
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
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedTiers.value.length} 个等级吗？删除后无法恢复！`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const ids = selectedTiers.value.map(tier => tier.id)
    const res = await deleteCommissionTier({ ids })
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

// 状态变更
const handleStatusChange = async (row) => {
  try {
    const res = await updateCommissionTierStatus({
      id: row.id,
      status: row.status
    })
    if (res.code === 0) {
      ElMessage.success('状态更新成功')
      await getTableData()
    } else {
      // 恢复原状态
      row.status = row.status === 1 ? 0 : 1
    }
  } catch (error) {
    ElMessage.error('状态更新失败')
    // 恢复原状态
    row.status = row.status === 1 ? 0 : 1
    console.error(error)
  }
}

// 排序结束
const onSortEnd = () => {
  // 更新排序值
  sortList.value.forEach((item, index) => {
    item.sort = sortList.value.length - index
  })
}

// 保存排序
const saveSortOrder = async () => {
  try {
    sortLoading.value = true
    const sortData = sortList.value.map(item => ({
      id: item.id,
      sort: item.sort
    }))

    const res = await updateCommissionTierSort({ sorts: sortData })
    if (res.code === 0) {
      ElMessage.success('排序保存成功')
      showSortDialog.value = false
      await getTableData()
    }
  } catch (error) {
    ElMessage.error('排序保存失败')
    console.error(error)
  } finally {
    sortLoading.value = false
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
    minSubordinates: 0,
    rate: 10.00,
    color: '#cd7f32',
    icon: '',
    sort: 0,
    status: 1
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

    const submitData = { ...form.value }

    let res
    switch (type.value) {
      case 'create':
        res = await createCommissionTier(submitData)
        break
      case 'update':
        res = await updateCommissionTier(submitData)
        break
      default:
        res = await createCommissionTier(submitData)
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

// 监听排序对话框打开
watch(showSortDialog, (val) => {
  if (val) {
    sortList.value = [...tableData.value].sort((a, b) => b.sort - a.sort)
  }
})
</script>

<style scoped>
.gva-table-box {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
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

.tier-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.tier-icon {
  font-size: 20px;
}

.color-display {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.color-block {
  width: 30px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section h4 {
  margin: 0 0 15px 0;
  color: #409eff;
  font-weight: 600;
}

.tier-detail {
  padding: 10px 0;
}

.sort-list {
  max-height: 500px;
  overflow-y: auto;
}

.sort-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  cursor: move;
  transition: all 0.3s;
}

.sort-item:hover {
  background: #e9ecef;
}

.drag-handle {
  font-size: 20px;
  color: #999;
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}

.tier-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tier-name {
  font-weight: 600;
  font-size: 14px;
}

.tier-details {
  font-size: 12px;
  color: #666;
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

.font-semibold {
  font-weight: 600;
}

.w-full {
  width: 100%;
}
</style>