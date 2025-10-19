<template>
  <div>
    <div class="gva-search-box">
      <el-form ref="elSearchFormRef" :inline="true" :model="searchInfo" class="demo-form-inline"
               @keyup.enter="onSubmit">
        <el-form-item label="创建日期" prop="createdAtRange">
          <template #label>
            <span>
              创建日期
              <el-tooltip content="搜索范围是开始日期（包含）至结束日期（不包含）">
                <el-icon>
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>

          <el-date-picker v-model="searchInfo.createdAtRange" class="w-[380px]" type="datetimerange" range-separator="至"
                          start-placeholder="开始时间" end-placeholder="结束时间" />
        </el-form-item>
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="searchInfo.categoryName" placeholder="搜索条件" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="onSubmit">查询</el-button>
          <el-button icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button type="primary" icon="plus" @click="openDrawer">
          新增分类
        </el-button>
      </div>
      <el-table
          ref="multipleTable"
          :data="tableData"
          style="width: 100%"
          tooltip-effect="dark"
          row-key="id"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column align="center" label="排序" prop="sort_order" width="55" />

        <el-table-column align="center" label="分类代码" prop="category_code" />

        <el-table-column align="left" label="分类名称" >
          <template #default="scope">
            <div class="flex items-center">
              <span>{{ scope.row.category_name }}</span>
            </div>
          </template>
        </el-table-column>


        <el-table-column align="center" label="幻灯片" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.is_banner ? 'success' : 'info'">
              {{ scope.row.is_banner ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column align="center" label="是否热门" prop="trending_tag"  >
          <template #default="scope">
            <el-tag :type="scope.row.trending_tag ? 'danger' : 'info'">
              {{ scope.row.trending_tag ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="应用页面状态" >
          <template #default="scope">
            <el-tag :type="scope.row.is_active ? 'success' : 'danger'">
              {{ scope.row.is_active ? '展示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="账号页面状态" >
          <template #default="scope">
            <el-tag :type="scope.row.account_status ? 'success' : 'danger'">
              {{ scope.row.account_status ? '展示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" >
          <template #default="scope">
            <span>{{ formatDate(scope.row.created_at) }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="操作" width="240" fixed="right">
          <template #default="scope">
            <el-button
                type="primary"
                link
                icon="edit"
                @click="updateCategoryFun(scope.row)"
            >
              编辑
            </el-button>
            <el-button
                type="success"
                link
                icon="plus"
                @click="addSubCategory(scope.row)"
            >
              添加子分类
            </el-button>
            <el-button
                type="danger"
                link
                icon="delete"
                @click="deleteCategoryFun(scope.row)"
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

    <el-drawer
        v-model="drawerFormVisible"
        :before-close="closeDrawer"
        :size="600"
        :show-close="false"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-lg">{{ type === 'update' ? '编辑分类' : '新增分类' }}</span>
          <div>
            <el-button @click="closeDrawer">取消</el-button>
            <el-button type="primary" @click="enterDrawer">确定</el-button>
          </div>
        </div>
      </template>

      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="上级分类" prop="parent_id">
          <el-tree-select
              v-model="form.parent_id"
              :data="categoryTreeData"
              :props="{ value: 'id', label: 'category_name', children: 'children' }"
              placeholder="请选择上级分类"
              clearable
              check-strictly
              style="width: 100%"
          />
          <div class="text-xs text-gray-500 mt-1">
            选择"顶级分类"或不选择表示创建顶级分类
          </div>
        </el-form-item>

        <el-form-item label="分类代码" prop="category_code">
          <el-input
              v-model="form.category_code"
              placeholder="请输入唯一的分类代码"
              autocomplete="off"
          />
        </el-form-item>

        <el-form-item label="分类名称" prop="category_name">
          <el-input
              v-model="form.category_name"
              placeholder="请输入分类名称"
              autocomplete="off"
          />
        </el-form-item>

        <el-form-item label="Emoji图标" prop="emoji_icon">
          <EmojiSelector v-model="form.emoji_icon" />
        </el-form-item>

        <el-form-item label="分类图标" prop="icon">
          <div style="width: 100%">
            <el-input
                v-model="form.icon"
                placeholder="请输入图标"
                autocomplete="off"
                readonly
            >
            </el-input>
          </div>
        </el-form-item>

        <el-form-item label="排序权重" prop="sort_order">
          <el-input-number
              v-model="form.sort_order"
              :min="0"
              :max="9999"
              placeholder="数值越大排序越靠前"
              style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="应用页面展示" prop="is_active">
          <el-switch
              v-model="form.is_active"
              :active-value="1"
              :inactive-value="0"
              active-text="展示"
              inactive-text="隐藏"
          />
          <div class="text-xs text-gray-500 mt-1">
            启用后该分类将显示在移动端应用分类列表页面
          </div>
        </el-form-item>
        <el-form-item label="账号页面展示" prop="account_status">
          <el-switch
              v-model="form.account_status"
              :active-value="1"
              :inactive-value="0"
              active-text="展示"
              inactive-text="隐藏"
          />
          <div class="text-xs text-gray-500 mt-1">
            启用后该分类将显示在移动端账号列表页面
          </div>
        </el-form-item>

        <el-form-item label="是否热门" prop="trending_tag">
          <el-switch
              v-model="form.trending_tag"
              :active-value="1"
              :inactive-value="0"
              active-text="是"
              inactive-text="否"
          />
        </el-form-item>

        <el-divider content-position="left">移动端幻灯片设置</el-divider>

        <el-form-item label="显示在幻灯片" prop="is_banner">
          <el-switch
              v-model="form.is_banner"
              :active-value="1"
              :inactive-value="0"
              active-text="是"
              inactive-text="否"
          />
          <div class="text-xs text-gray-500 mt-1">
            启用后该分类将显示在移动端首页幻灯片轮播中
          </div>
        </el-form-item>

        <el-form-item
            v-if="form.is_banner === 1"
            label="幻灯片图片"
            prop="banner_url"
        >
          <div style="width: 100%">
            <!-- 图片预览 -->
            <div v-if="form.banner_url" class="banner-preview">
              <CustomPic pic-type="file" :pic-src="form.banner_url" preview />
            </div>

            <!-- 上传按钮 -->
            <div class="upload-actions">
              <UploadCommon :classId="1" @on-success="handleBannerSuccess" />
            </div>
            <div class="banner-tips">
              <el-alert
                  title="图片要求"
                  type="info"
                  :closable="false"
                  style="margin-top: 8px"
              >
                <template #default>
                  <ul class="tips-list">
                    <li>建议尺寸：750x320px（移动端最佳显示比例）</li>
                    <li>支持格式：JPG、PNG</li>
                    <li>文件大小：不超过 2MB</li>
                    <li>图片将在移动端首页轮播展示</li>
                  </ul>
                </template>
              </el-alert>
            </div>
            <el-button
                v-if="form.banner_url"
                type="danger"
                size="small"
                plain
                style="margin-top: 8px; width: 100%"
                @click="removeBannerImage"
            >
              删除图片
            </el-button>
          </div>
        </el-form-item>



        <el-form-item label="分类描述" prop="description">
          <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              placeholder="请输入分类描述"
              autocomplete="off"
          />
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup>
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getCategoryList, getSelectCategory
} from '@/api/project/category'
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/format'
import UploadCommon from '@/components/upload/common.vue'
import CustomPic from '@/components/customPic/index.vue'
import EmojiSelector from '@/components/EmojiSelector/index.vue'
import {useUserStore} from "@/pinia/index.js";
const userStore = useUserStore()

defineOptions({
  name: 'CategoryManagement'
})



// 图标选择器显示状态

// 表单数据
const form = ref({
  id: null,
  parent_id: 0,
  category_code: '',
  category_name: '',
  emoji_icon: '',
  icon: '',
  description: '',
  sort_order: 0,
  is_active: 1,
  account_status:1,
  trending_tag:0,
  is_banner: 0,
  banner_url: '',
})

const searchInfo = ref({})

// 重置
const onReset = () => {
  searchInfo.value = {}
  getTableData()
}

// 表单验证规则
const rules = reactive({
  category_code: [
    { required: true, message: '请输入分类代码', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  category_name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  banner_url: [
    {
      validator: (rule, value, callback) => {
        if (form.value.is_banner === 1 && !value) {
          callback(new Error('启用幻灯片时必须上传图片'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
})

// 分页数据
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])
const categoryTreeData = ref([])

// 表单引用
const formRef = ref(null)

// 抽屉状态
const drawerFormVisible = ref(false)
const type = ref('')
const elSearchFormRef = ref()

// 搜索
const onSubmit = () => {
  elSearchFormRef.value?.validate(async (valid) => {
    if (!valid) return
    page.value = 1
    await getTableData()
  })
}


// 图标变化处理函数
const handleIconChange = (iconName) => {
  form.value.icon = iconName
}

// 幻灯片图片上传成功
const handleBannerSuccess = (url) => {
  form.value.banner_url = url
  ElMessage.success('图片上传成功')
}

// 删除幻灯片图片
const removeBannerImage = () => {
  ElMessageBox.confirm('确定要删除幻灯片图片吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    form.value.banner_url = ''
    ElMessage.success('已删除')
  }).catch(() => {})
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

// 获取分类列表数据
const getTableData = async () => {
  try {
    const table = await getCategoryList({
      page: page.value,
      pageSize: pageSize.value,
      ...searchInfo.value
    })
    if (table.code === 0) {
      tableData.value = table.data.list
      total.value = table.data.total
      page.value = table.data.page
      pageSize.value = table.data.pageSize
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
    console.error(error)
  }
}

// 获取分类树形数据（用于上级分类选择）
const getCategoryTreeData = async () => {
  try {
    const res = await getSelectCategory()
    if (res.code === 0) {
      const treeData = buildTree(res.data)
      categoryTreeData.value = [
        {
          id: 0,
          category_name: '顶级分类',
          children: treeData
        }
      ]
    }
  } catch (error) {
    console.error('获取分类树数据失败:', error)
  }
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

// 编辑分类
const updateCategoryFun = async (row) => {
  try {
    const res = await getCategory({ id: row.id })
    type.value = 'update'
    if (res.code === 0) {
      form.value = { ...res.data }
      drawerFormVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取分类信息失败')
    console.error(error)
  }
}

// 添加子分类
const addSubCategory = (row) => {
  type.value = 'create'
  form.value = {
    id: null,
    parent_id: row.id,
    category_code: '',
    category_name: '',
    emoji_icon: '',
    icon: '',
    description: '',
    sort_order: 0,
    is_active: 1,
    account_status:1,
    trending_tag:0,
    is_banner: 0,
    banner_url: '',
  }
  drawerFormVisible.value = true
}

// 关闭抽屉
const closeDrawer = () => {
  drawerFormVisible.value = false
  form.value = {
    id: null,
    parent_id: 0,
    category_code: '',
    category_name: '',
    emoji_icon: '',
    icon: '',
    description: '',
    sort_order: 0,
    is_active: 1,
    account_status:1,
    trending_tag:0,
    is_banner: 0,
    banner_url: '',
  }
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 删除分类
const deleteCategoryFun = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个分类吗？删除后子分类也会一并删除！', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deleteCategory({ id: row.id })
    if (res.code === 0) {
      ElMessage({
        type: 'success',
        message: '删除成功'
      })
      if (tableData.value.length === 1 && page.value > 1) {
        page.value--
      }
      getTableData()
      getCategoryTreeData()
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

    let res
    switch (type.value) {
      case 'create':
        res = await createCategory(form.value)
        break
      case 'update':
        res = await updateCategory(form.value)
        break
      default:
        res = await createCategory(form.value)
        break
    }

    if (res.code === 0) {
      ElMessage({
        type: 'success',
        message: type.value === 'update' ? '更新成功' : '创建成功'
      })
      closeDrawer()
      getTableData()
      getCategoryTreeData()
    }
  } catch (error) {
    console.error('表单验证失败:', error)
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
  getCategoryTreeData()
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

.gva-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
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

.mr-2 {
  margin-right: 8px;
}

.text-lg {
  font-size: 1.125rem;
}

.text-xs {
  font-size: 0.75rem;
}

.text-gray-500 {
  color: #6b7280;
}

.mt-1 {
  margin-top: 0.25rem;
}



.banner-uploader :deep(.el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 100%;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}

.banner-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}


.banner-preview {
  width: 100%;
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 12px;
}

.banner-preview :deep(.el-image) {
  width: 100% !important;
  height: auto !important;
  max-width: 375px;
  border-radius: 8px;
  display: block;
  margin: 0 auto;
}

.banner-preview :deep(.el-image__inner) {
  width: 100% !important;
  height: auto !important;
  object-fit: contain;
}

.upload-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.banner-tips {
  margin-top: 8px;
}

.tips-list {
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
  line-height: 1.8;
  color: #606266;
}


.tips-list li {
  list-style-type: disc;
}

</style>