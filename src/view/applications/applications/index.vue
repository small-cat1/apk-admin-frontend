<template>
  <div class="application-management">
    <div class="gva-table-box">
      <!-- 操作按钮区 -->
      <div class="gva-btn-list">
        <el-button type="primary" icon="plus" @click="openDrawer">
          新增应用
        </el-button>
        <el-button
            type="danger"
            icon="delete"
            @click="batchDelete"
            :disabled="!selectedApps.length"
        >
          批量删除
        </el-button>
        <el-button
            type="warning"
            icon="warning"
            @click="batchSuspend"
            :disabled="!selectedApps.length"
        >
          批量暂停
        </el-button>
        <el-button
            type="success"
            icon="check"
            @click="batchActivate"
            :disabled="!selectedApps.length"
        >
          批量激活
        </el-button>
      </div>

      <!-- 搜索筛选区域 -->
      <div class="search-box">
        <el-form :model="searchForm" label-width="0">
          <el-row :gutter="16">
            <el-col :span="5">
              <el-input
                  v-model="searchForm.app_name"
                  placeholder="应用名称"
                  clearable
                  @clear="handleSearch"
                  @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :span="4">
              <el-select
                  v-model="searchForm.category_id"
                  placeholder="应用分类"
                  clearable
                  @change="handleSearch"
              >
                <el-option
                    v-for="category in categoriesList"
                    :key="category.id"
                    :label="category.category_name"
                    :value="category.id"
                />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select
                  v-model="searchForm.country_code"
                  placeholder="国家/地区"
                  clearable
                  @change="handleSearch"
              >
                <el-option
                    v-for="country in countriesList"
                    :key="country.country_code"
                    :label="country.country_name"
                    :value="country.country_code"
                />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select
                  v-model="searchForm.status"
                  placeholder="应用状态"
                  clearable
                  @change="handleSearch"
              >
                <el-option label="正常" value="active" />
                <el-option label="暂停" value="suspended" />
                <el-option label="已删除" value="deleted" />
              </el-select>
            </el-col>
            <el-col :span="7">
              <el-button type="primary" icon="search" @click="handleSearch">
                搜索
              </el-button>
              <el-button icon="refresh" @click="resetSearch">
                重置
              </el-button>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 数据表格 -->
      <el-table
          ref="multipleTable"
          :data="tableData"
          v-loading="loading"
          row-key="id"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" fixed="left" />

        <!-- 应用信息 -->
        <el-table-column label="应用信息" min-width="200" fixed="left">
          <template #default="{ row }">
            <div class="app-info">
              <div class="app-icon">
                <CustomPic
                    pic-type="file"
                    :pic-src="row.app_icon"
                    preview
                />
              </div>
              <div class="app-details">
                <div class="app-name">{{ row.app_name }}</div>
                <div class="app-meta">
                  <el-tag
                      :type="getCountryTagType(row.country_code)"
                      size="small"
                  >
                    {{ getCountryLabel(row.country_code) }}
                  </el-tag>
                  <span class="app-category">
                    {{ getCategoryLabel(row.category_id) }}-{{ getCategoryLabel(row.subcategory_id) }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 价格 -->
        <el-table-column label="账号价格" align="center" >
          <template #default="{ row }">
            <div class="price-cell">
              <span class="price-value">¥{{ row.account_price }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 标签 -->
        <el-table-column label="标签" align="center" >
          <template #default="{ row }">
            <div class="tags-cell">
              <el-tag
                  v-if="row.is_hot"
                  type="danger"
                  size="small"
                  effect="dark"
              >
                热门
              </el-tag>
              <el-tag
                  v-if="row.is_recommend"
                  type="warning"
                  size="small"
              >
                推荐
              </el-tag>
              <el-tag
                  v-if="row.is_free"
                  type="success"
                  size="small"
              >
                免费下载
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <!-- 排序 -->
        <el-table-column
            label="排序"
            prop="sort_order"
            align="center"
            width="80"
        />

        <!-- 状态 -->
        <el-table-column label="状态" align="center" >
          <template #default="{ row }">
            <el-tag
                :type="getStatusTagType(row.status)"
                size="small"
            >
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 创建时间 -->
        <el-table-column label="创建时间" align="center" >
          <template #default="{ row }">
            <div class="time-cell">
              <div>{{ formatDate(row.created_at) }}</div>
              <div class="creator">创建者: {{ row.created_by }}</div>
            </div>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" align="center" width="260" fixed="right">
          <template #default="{ row }">
            <el-button
                type="primary"
                link
                icon="view"
                @click="viewAppFun(row)"
            >
              详情
            </el-button>
            <el-button
                type="primary"
                link
                icon="edit"
                @click="updateAppFun(row)"
            >
              编辑
            </el-button>
            <el-dropdown @command="handleCommand($event, row)" style="margin-top: 7px;padding-left: 8px">
              <el-button type="primary" link>
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                      command="suspend"
                      v-if="row.status === 'active'"
                  >
                    <el-icon><VideoPause /></el-icon>
                    暂停应用
                  </el-dropdown-item>
                  <el-dropdown-item
                      command="activate"
                      v-if="row.status === 'suspended'"
                  >
                    <el-icon><VideoPlay /></el-icon>
                    激活应用
                  </el-dropdown-item>
                  <el-dropdown-item command="clone">
                    <el-icon><CopyDocument /></el-icon>
                    克隆应用
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    <el-icon><Delete /></el-icon>
                    删除应用
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="gva-pagination">
        <el-pagination
            :current-page="page"
            :page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
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
        :title="type === 'update' ? '编辑应用' : '新增应用'"
        :size="800"
        :before-close="closeDrawer"
    >
      <el-form
          :model="form"
          :rules="rules"
          ref="formRef"
          label-width="120px"
      >
        <!-- 基础信息 -->
        <el-divider content-position="left">基础信息</el-divider>

        <el-form-item label="应用名称" prop="app_name">
          <el-input
              v-model="form.app_name"
              placeholder="请输入应用名称"
              maxlength="200"
              show-word-limit
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="20">
            <el-form-item label="应用分类" prop="category_id">
              <el-tree-select
                  v-model="form.category_id"
                  :data="categoryTreeData"
                  :props="{ value: 'id', label: 'category_name', children: 'children' }"
                  placeholder="请选择分类"
                  clearable
                  check-strictly
                  style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="国家/地区" prop="country_code">
              <el-select
                  v-model="form.country_code"
                  placeholder="选择国家/地区"
                  style="width: 100%"
              >
                <el-option
                    v-for="country in countriesList"
                    :key="country.country_code"
                    :label="country.country_name"
                    :value="country.country_code"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="账号价格" prop="account_price">
              <el-input-number
                  v-model="form.account_price"
                  placeholder="请输入账号价格"
                  :min="0.01"
                  :max="999999.99"
                  :precision="2"
                  :step="1"
                  style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="应用图标" prop="app_icon">
          <div class="upload-wrapper">
            <div v-if="form.app_icon" class="icon-preview">
              <CustomPic
                  pic-type="file"
                  :pic-src="form.app_icon"
                  preview
              />
              <el-button
                  type="danger"
                  size="small"
                  icon="delete"
                  circle
                  class="delete-icon"
                  @click="form.app_icon = ''"
              />
            </div>
            <el-button
                v-else
                type="primary"
                icon="upload"
                @click="showIconUpload = true"
            >
              上传图标
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="应用描述" prop="description">
          <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              placeholder="请输入应用描述信息"
              maxlength="1000"
              show-word-limit
          />
        </el-form-item>

        <!-- 设置选项 -->
        <el-divider content-position="left">设置选项</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="应用状态" prop="status">
              <el-select
                  v-model="form.status"
                  placeholder="选择应用状态"
                  style="width: 100%"
              >
                <el-option label="正常" value="active" />
                <el-option label="暂停" value="suspended" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序权重" prop="sort_order">
              <el-input-number
                  v-model="form.sort_order"
                  :min="0"
                  :max="9999"
                  placeholder="数值越大排序越靠前"
                  style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="热门" prop="is_hot">
              <el-switch
                  v-model="form.is_hot"
                  :active-value="1"
                  :inactive-value="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="推荐" prop="is_recommend">
              <el-switch
                  v-model="form.is_recommend"
                  :active-value="1"
                  :inactive-value="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="下载是否免费" prop="is_free">
              <el-switch
                  v-model="form.is_free"
                  :active-value="true"
                  :inactive-value="false"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="closeDrawer">取消</el-button>
          <el-button
              type="primary"
              @click="enterDrawer"
              :loading="submitLoading"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 详情查看抽屉 -->
    <el-drawer
        v-model="viewDrawerVisible"
        title="应用详情"
        :size="800"
    >
      <div v-if="viewData" class="app-detail">
        <!-- 应用头部 -->
        <div class="detail-header">
          <div class="header-icon">
            <CustomPic
                pic-type="file"
                :pic-src="viewData.app_icon"
                preview
            />
          </div>
          <div class="header-info">
            <h2>{{ viewData.app_name }}</h2>
            <div class="header-tags">
              <el-tag
                  :type="getStatusTagType(viewData.status)"
                  size="large"
              >
                {{ getStatusLabel(viewData.status) }}
              </el-tag>
              <el-tag
                  v-if="viewData.is_hot"
                  type="danger"
                  size="large"
              >
                热门
              </el-tag>
              <el-tag
                  v-if="viewData.is_recommend"
                  type="warning"
                  size="large"
              >
                推荐
              </el-tag>
              <el-tag
                  v-if="viewData.is_free"
                  type="success"
                  size="large"
              >
                免费下载
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 基础信息 -->
        <el-divider content-position="left">基础信息</el-divider>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="应用ID">
            {{ viewData.app_id }}
          </el-descriptions-item>
          <el-descriptions-item label="应用名称">
            {{ viewData.app_name }}
          </el-descriptions-item>
          <el-descriptions-item label="主分类">
            {{ getCategoryLabel(viewData.category_id) }}
          </el-descriptions-item>
          <el-descriptions-item label="子分类">
            {{ getCategoryLabel(viewData.subcategory_id) }}
          </el-descriptions-item>
          <el-descriptions-item label="国家/地区">
            {{ getCountryLabel(viewData.country_code) }}
          </el-descriptions-item>
          <el-descriptions-item label="账号价格">
            <span class="price-highlight">¥{{ viewData.account_price }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="排序权重">
            {{ viewData.sort_order }}
          </el-descriptions-item>
          <el-descriptions-item label="应用状态">
            <el-tag :type="getStatusTagType(viewData.status)">
              {{ getStatusLabel(viewData.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 应用描述 -->
        <el-divider content-position="left">应用描述</el-divider>
        <div class="description-content">
          {{ viewData.description || '暂无描述' }}
        </div>

        <!-- 创建信息 -->
        <el-divider content-position="left">创建信息</el-divider>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="创建时间">
            {{ formatDate(viewData.created_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDate(viewData.updated_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="创建者ID">
            {{ viewData.created_by }}
          </el-descriptions-item>
          <el-descriptions-item label="更新者ID">
            {{ viewData.updated_by || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>

    <!-- 图标上传对话框 -->
    <el-dialog
        v-model="showIconUpload"
        title="上传应用图标"
        width="500px"
    >
      <el-alert
          title="图片要求"
          type="info"
          :closable="false"
          description="建议上传正方形图片,支持 jpg、png、svg、webp 格式，文件大小不超过 500KB"
          style="margin-bottom: 20px"
      />
      <upload-common
          :classId="0"
          @on-success="onIconUploadSuccess"
      />
      <template #footer>
        <el-button @click="showIconUpload = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  createApplication,
  updateApplication,
  deleteApplication,
  getApplication,
  getApplicationList,
  batchDeleteApplications,
  batchUpdateApplicationStatus,
  cloneApplication
} from '@/api/project/application'
import { getCountryList } from '@/api/project/country'
import {getCategoryList, getSelectCategory} from '@/api/project/category'
import UploadCommon from '@/components/upload/common.vue'
import CustomPic from '@/components/customPic/index.vue'
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/format'

defineOptions({
  name: 'ApplicationManagement'
})

// ========== 响应式数据 ==========
const formRef = ref(null)
const multipleTable = ref(null)

// 分页
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)

// 加载状态
const loading = ref(false)
const submitLoading = ref(false)

// 抽屉状态
const drawerFormVisible = ref(false)
const viewDrawerVisible = ref(false)
const showIconUpload = ref(false)

// 表单类型
const type = ref('')

// 表格数据
const tableData = ref([])
const selectedApps = ref([])
const viewData = ref(null)

// 基础数据
const categoryTreeData = ref([])
const categoriesList = ref([])
const countriesList = ref([])

// 搜索表单
const searchForm = reactive({
  app_name: '',
  country_code: '',
  category_id: '',
  status: ''
})

// 表单数据
const form = ref({
  app_name: '',
  country_code: '',
  category_id: '',
  subcategory_id: null,
  app_icon: '',
  description: '',
  status: 'active',
  is_hot: 0,
  is_recommend: 0,
  is_free: false,
  sort_order: 0,
  account_price: 0.0
})

// ========== 表单验证规则 ==========
const rules = reactive({
  app_name: [
    { required: true, message: '请输入应用名称', trigger: 'blur' },
    { min: 1, max: 200, message: '应用名称长度在 1 到 200 个字符', trigger: 'blur' }
  ],
  app_icon: [
    { required: true, message: '请上传应用Logo缩略图', trigger: 'blur' }
  ],
  country_code: [
    { required: true, message: '请选择国家/地区', trigger: 'change' }
  ],
  category_id: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  account_price: [
    { required: true, message: '请输入账号价格', trigger: 'blur' },
    { type: 'number', message: '价格必须是数字', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value <= 0) {
          callback(new Error('价格必须大于0'))
        } else if (value > 999999.99) {
          callback(new Error('价格不能超过999999.99'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// ========== 工具方法 ==========
const getStatusLabel = (status) => {
  const map = {
    active: '正常',
    suspended: '暂停',
    deleted: '已删除'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    active: 'success',
    suspended: 'warning',
    deleted: 'danger'
  }
  return map[status] || 'info'
}

const getCountryLabel = (code) => {
  const country = countriesList.value.find(c => c.country_code === code)
  return country ? country.country_name : code
}

const getCountryTagType = (code) => {
  const map = {
    CN: 'danger',
    US: 'primary',
    JP: 'warning',
    GB: 'info'
  }
  return map[code] || 'info'
}

const getCategoryLabel = (id) => {
  if (!id) return ''
  const category = categoriesList.value.find(c => c.id === id)
  return category ? category.category_name : '未分类'
}
// 构建树形结构
const buildTree = (data, parentId = 0) => {
  const tree = []
  data.forEach(item => {
    if (item.parent_id === parentId) {
      const children = buildTree(data, item.id)
      if (children.length > 0) {
        item.children = children
      }
      tree.push(item)
    }
  })
  return tree
}

// ========== 数据加载 ==========
// 获取基础数据
const getBasicData = async () => {
  try {
    const [categoriesRes, countriesRes] = await Promise.all([
      getSelectCategory(),
      getCountryList({ page: 1, pageSize: 100 })
    ])

    if (categoriesRes.code === 0) {
      categoryTreeData.value = buildTree(categoriesRes.data)
      categoriesList.value = categoriesRes.data|| []
    }
    if (countriesRes.code === 0) {
      countriesList.value = countriesRes.data.list || []
    }
  } catch (error) {
    console.error('获取基础数据失败:', error)
    ElMessage.error('获取基础数据失败')
  }
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
    const res = await getApplicationList(params)
    if (res.code === 0) {
      tableData.value = res.data.list || []
      total.value = res.data.total || 0
      page.value = res.data.page || 1
      pageSize.value = res.data.pageSize || 10
    }
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// ========== 事件处理 ==========
// 搜索
const handleSearch = () => {
  page.value = 1
  getTableData()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    app_name: '',
    country_code: '',
    category_id: '',
    status: ''
  })
  handleSearch()
}

// 选择变更
const handleSelectionChange = (selection) => {
  selectedApps.value = selection
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  page.value = 1
  getTableData()
}

const handleCurrentChange = (val) => {
  page.value = val
  getTableData()
}


// 图标上传成功
const onIconUploadSuccess = (url) => {
  form.value.app_icon = url
  ElMessage.success('图标上传成功')
  setTimeout(() => {
    showIconUpload.value = false
  }, 800)
}

// ========== CRUD 操作 ==========
// 打开新增抽屉
const openDrawer = () => {
  type.value = 'create'
  resetForm()
  drawerFormVisible.value = true
}

// 查看详情
const viewAppFun = async (row) => {
  try {
    const res = await getApplication({ id: row.id })
    if (res.code === 0) {
      viewData.value = res.data
      viewDrawerVisible.value = true
    }
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败')
  }
}

// 编辑应用
const updateAppFun = async (row) => {
  try {
    const res = await getApplication({ id: row.id })
    if (res.code === 0) {
      type.value = 'update'
      form.value = { ...res.data }
      drawerFormVisible.value = true
    }
  } catch (error) {
    console.error('获取应用信息失败:', error)
    ElMessage.error('获取应用信息失败')
  }
}

// 命令处理
const handleCommand = async (command, row) => {
  const handlers = {
    suspend: () => updateAppStatusFun(row, 'suspended'),
    activate: () => updateAppStatusFun(row, 'active'),
    clone: () => cloneAppFun(row),
    delete: () => deleteAppFun(row)
  }

  const handler = handlers[command]
  if (handler) {
    await handler()
  }
}

// 更新应用状态
const updateAppStatusFun = async (row, status) => {
  const actionText = status === 'suspended' ? '暂停' : '激活'
  try {
    await ElMessageBox.confirm(
        `确定要${actionText}应用 ${row.app_name} 吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    const res = await batchUpdateApplicationStatus({
      ids: [row.id],
      status
    })

    if (res.code === 0) {
      ElMessage.success(`${actionText}成功`)
      await getTableData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 克隆应用
const cloneAppFun = async (row) => {
  try {
    await ElMessageBox.confirm(
        `确定要克隆应用 ${row.app_name} 吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
    )

    const res = await cloneApplication({ source_id: row.id })
    if (res.code === 0) {
      ElMessage.success('克隆成功')
      await getTableData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('克隆失败:', error)
      ElMessage.error('克隆失败')
    }
  }
}

// 删除应用
const deleteAppFun = async (row) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除应用 ${row.app_name} 吗？删除后无法恢复！`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }
    )

    const res = await deleteApplication({ id: row.id })
    if (res.code === 0) {
      ElMessage.success('删除成功')
      // 如果当前页只有一条数据且不是第一页，返回上一页
      if (tableData.value.length === 1 && page.value > 1) {
        page.value--
      }
      await getTableData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedApps.value.length} 个应用吗？删除后无法恢复！`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }
    )

    const ids = selectedApps.value.map(app => app.id)
    const res = await batchDeleteApplications({ ids })

    if (res.code === 0) {
      ElMessage.success('批量删除成功')
      await getTableData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 批量暂停
const batchSuspend = async () => {
  try {
    await ElMessageBox.confirm(
        `确定要暂停选中的 ${selectedApps.value.length} 个应用吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    const ids = selectedApps.value.map(app => app.id)
    const res = await batchUpdateApplicationStatus({
      ids,
      status: 'suspended'
    })

    if (res.code === 0) {
      ElMessage.success('批量暂停成功')
      await getTableData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量暂停失败:', error)
      ElMessage.error('批量暂停失败')
    }
  }
}

// 批量激活
const batchActivate = async () => {
  try {
    await ElMessageBox.confirm(
        `确定要激活选中的 ${selectedApps.value.length} 个应用吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
    )

    const ids = selectedApps.value.map(app => app.id)
    const res = await batchUpdateApplicationStatus({
      ids,
      status: 'active'
    })

    if (res.code === 0) {
      ElMessage.success('批量激活成功')
      await getTableData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量激活失败:', error)
      ElMessage.error('批量激活失败')
    }
  }
}

// ========== 表单操作 ==========
// 关闭抽屉
const closeDrawer = () => {
  drawerFormVisible.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  form.value = {
    app_name: '',
    country_code: '',
    category_id: '',
    subcategory_id: null,
    app_icon: '',
    description: '',
    status: 'active',
    is_hot: 0,
    is_recommend: 0,
    is_free: false,
    sort_order: 0,
    account_price: 0.0
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
        const optionalFields = [
          'app_icon',
          'description',
          'subcategory_id'
        ]
        if (optionalFields.includes(key)) {
          submitData[key] = null
        }
      }
    })

    // 根据类型调用不同接口
    const apiMap = {
      create: createApplication,
      update: updateApplication
    }

    const api = apiMap[type.value] || createApplication
    const res = await api(submitData)

    if (res.code === 0) {
      const successText = type.value === 'update' ? '更新成功' : '创建成功'
      ElMessage.success(successText)
      closeDrawer()
      await getTableData()
    }
  } catch (error) {
    console.error('表单提交失败:', error)
  } finally {
    submitLoading.value = false
  }
}

// ========== 生命周期 ==========
onMounted(async () => {
  await getBasicData()
  await getTableData()
})
</script>

<style scoped lang="scss">
.application-management {
  padding: 20px;
}

.gva-table-box {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 20px;
}

.gva-btn-list {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
}

.search-box {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.gva-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* ========== 表格样式 ========== */
.app-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .app-icon {
    flex-shrink: 0;
    //width: 60px;
    //height: 60px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e4e7ed;
  }

  .app-details {
    flex: 1;
    min-width: 0;

    .app-name {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .app-meta {
      display: flex;
      align-items: center;
      gap: 8px;

      .app-category {
        font-size: 13px;
        color: #909399;
      }
    }
  }
}

.price-cell {
  .price-value {
    font-size: 16px;
    font-weight: 600;
    color: #f56c6c;
  }
}

.tags-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

.time-cell {
  font-size: 13px;
  color: #606266;

  .creator {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
  }
}

/* ========== 抽屉样式 ========== */
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.upload-wrapper {
  .icon-preview {
    position: relative;
    display: inline-block;
    width: 120px;
    height: 120px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e4e7ed;

    .delete-icon {
      position: absolute;
      top: 5px;
      right: 5px;
    }
  }
}

/* ========== 详情样式 ========== */
.app-detail {
  .detail-header {
    display: flex;
    gap: 20px;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 24px;

    .header-icon {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      overflow: hidden;
      border: 3px solid rgba(255, 255, 255, 0.3);
      flex-shrink: 0;
    }

    .header-info {
      flex: 1;

      h2 {
        margin: 0 0 12px 0;
        font-size: 24px;
        font-weight: 600;
      }

      .header-tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
    }
  }

  .description-content {
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    min-height: 100px;
    line-height: 1.8;
    color: #606266;
    margin-bottom: 24px;
  }

  .price-highlight {
    font-size: 18px;
    font-weight: 600;
    color: #f56c6c;
  }
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .search-box {
    :deep(.el-col) {
      margin-bottom: 12px;
    }
  }

  .app-info {
    .app-icon {
      width: 48px;
      height: 48px;
    }

    .app-details {
      .app-name {
        font-size: 14px;
      }
    }
  }
}

/* ========== Element Plus 覆盖 ========== */
:deep(.el-table) {
  .el-table__header {
    th {
      background: #f5f7fa;
      color: #606266;
      font-weight: 600;
    }
  }

  .el-table__row {
    &:hover {
      background: #f5f7fa;
    }
  }
}

:deep(.el-drawer__header) {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-divider--horizontal) {
  margin: 24px 0;
}

:deep(.el-descriptions) {
  margin-bottom: 24px;
}
</style>