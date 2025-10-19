<template>
  <div>
    <div class="gva-search-box">
      <el-form
          ref="elSearchFormRef"
          :inline="true"
          :model="searchInfo"
          class="demo-form-inline"
          :rules="searchRule"
          @keyup.enter="onSubmit"
      >
        <el-form-item label="公告标题" prop="title">
          <el-input
              v-model="searchInfo.title"
              placeholder="请输入公告标题"
              clearable
          />
        </el-form-item>

        <el-form-item label="公告类型" prop="type">
          <el-select
              v-model="searchInfo.type"
              placeholder="请选择公告类型"
              clearable
          >
            <el-option label="紧急" :value="1" />
            <el-option label="重要" :value="2" />
            <el-option label="普通" :value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select
              v-model="searchInfo.status"
              placeholder="请选择状态"
              clearable
          >
            <el-option label="草稿" :value="0" />
            <el-option label="已发布" :value="1" />
          </el-select>
        </el-form-item>

        <el-form-item label="创建日期" prop="createdAt">
          <template #label>
            <span>
              创建日期
              <el-tooltip content="搜索范围是开始日期（包含）至结束日期（不包含）">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-date-picker
              v-model="searchInfo.startCreatedAt"
              type="datetime"
              placeholder="开始日期"
              :disabled-date="
              (time) =>
                searchInfo.endCreatedAt
                  ? time.getTime() > searchInfo.endCreatedAt.getTime()
                  : false
            "
          />
          —
          <el-date-picker
              v-model="searchInfo.endCreatedAt"
              type="datetime"
              placeholder="结束日期"
              :disabled-date="
              (time) =>
                searchInfo.startCreatedAt
                  ? time.getTime() < searchInfo.startCreatedAt.getTime()
                  : false
            "
          />
        </el-form-item>

        <template v-if="showAllQuery">
          <el-form-item label="展示类型" prop="display_type">
            <el-select
                v-model="searchInfo.display_type"
                placeholder="请选择展示类型"
                clearable
            >
              <el-option label="横幅" :value="1" />
              <el-option label="弹窗" :value="2" />
              <el-option label="卡片" :value="3" />
              <el-option label="仅消息中心" :value="4" />
            </el-select>
          </el-form-item>

          <el-form-item label="目标用户" prop="targetUsers">
            <el-select
                v-model="searchInfo.targetUsers"
                placeholder="请选择目标用户"
                clearable
            >
              <el-option label="全部用户" value="all" />
              <el-option label="VIP用户" value="vip" />
              <el-option label="新用户" value="new" />
            </el-select>
          </el-form-item>
        </template>

        <el-form-item>
          <el-button type="primary" icon="search" @click="onSubmit">
            查询
          </el-button>
          <el-button icon="refresh" @click="onReset"> 重置 </el-button>
          <el-button
              v-if="!showAllQuery"
              link
              type="primary"
              icon="arrow-down"
              @click="showAllQuery = true"
          >
            展开
          </el-button>
          <el-button
              v-else
              link
              type="primary"
              icon="arrow-up"
              @click="showAllQuery = false"
          >
            收起
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button type="primary" icon="plus" @click="openDialog">
          新增
        </el-button>
        <el-button
            icon="delete"
            style="margin-left: 10px"
            :disabled="!multipleSelection.length"
            @click="onDelete"
        >
          删除
        </el-button>
      </div>

      <el-table
          ref="multipleTable"
          style="width: 100%"
          tooltip-effect="dark"
          :data="tableData"
          row-key="ID"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column align="left" label="标题" prop="title" width="200" show-overflow-tooltip />

        <el-table-column align="center" label="类型" prop="type" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.type === 1" type="danger" effect="dark">紧急</el-tag>
            <el-tag v-else-if="scope.row.type === 2" type="warning">重要</el-tag>
            <el-tag v-else type="info">普通</el-tag>
          </template>
        </el-table-column>

        <el-table-column align="center" label="展示类型" prop="displayType" width="120">
          <template #default="scope">
            <span v-if="scope.row.display_type === 1">横幅</span>
            <span v-else-if="scope.row.display_type === 2">弹窗</span>
            <span v-else-if="scope.row.display_type === 3">卡片</span>
            <span v-else-if="scope.row.display_type === 4">仅消息中心</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="目标用户" prop="target_users" width="100">
          <template #default="scope">
            <span v-if="scope.row.target_users === 'all'">全部</span>
            <span v-else-if="scope.row.target_users === 'vip'">VIP</span>
            <span v-else-if="scope.row.target_users === 'new'">新用户</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="状态" prop="status" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="info">草稿</el-tag>
            <el-tag v-else type="success">已发布</el-tag>
          </template>
        </el-table-column>

        <el-table-column align="center" label="显示时间" width="180">
          <template #default="scope">
            <div v-if="scope.row.start_time">
              {{ formatDate(scope.row.start_time) }}
            </div>
            <div v-if="scope.row.end_time">
              至 {{ formatDate(scope.row.end_time) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column align="center" label="可关闭" prop="is_closable" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.is_closable === 1" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>

        <el-table-column align="left" label="创建时间" prop="createdAt" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column align="left" label="操作" fixed="right" min-width="240">
          <template #default="scope">
            <el-button
                type="primary"
                link
                icon="view"
                class="table-button"
                @click="viewAnnouncement(scope.row)"
            >
              查看
            </el-button>
            <el-button
                type="primary"
                link
                icon="edit"
                class="table-button"
                @click="updateAnnouncementFunc(scope.row)"
            >
              编辑
            </el-button>
            <el-button
                type="primary"
                link
                icon="delete"
                @click="deleteRow(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="gva-pagination">
        <el-pagination
            layout="total, sizes, prev, pager, next, jumper"
            :current-page="page"
            :page-size="pageSize"
            :page-sizes="[10, 30, 50, 100]"
            :total="total"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 编辑/新增弹窗 -->
    <el-drawer
        v-model="dialogFormVisible"
        destroy-on-close
        size="900"
        :show-close="false"
        :before-close="closeDialog"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-lg">{{ type === 'create' ? '添加公告' : type === 'update' ? '修改公告' : '查看公告' }}</span>
          <div>
            <el-button v-if="type !== 'view'" type="primary" @click="enterDialog"> 确定 </el-button>
            <el-button @click="closeDialog"> {{ type === 'view' ? '关闭' : '取消' }} </el-button>
          </div>
        </div>
      </template>

      <el-form
          ref="elFormRef"
          :model="formData"
          label-position="top"
          :rules="rule"
          label-width="100px"
          :disabled="type === 'view'"
      >
        <el-form-item label="公告标题" prop="title">
          <el-input
              v-model="formData.title"
              :clearable="true"
              placeholder="请输入公告标题"
              maxlength="200"
              show-word-limit
          />
        </el-form-item>

        <el-form-item label="公告内容" prop="content">
          <RichEdit v-model="formData.content" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="公告类型" prop="type">
              <el-select
                  v-model="formData.type"
                  placeholder="请选择公告类型"
                  style="width: 100%"
              >
                <el-option label="紧急" :value="1" />
                <el-option label="重要" :value="2" />
                <el-option label="普通" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="展示类型" prop="display_type">
              <el-select
                  v-model="formData.display_type"
                  placeholder="请选择展示类型"
                  style="width: 100%"
              >
                <el-option label="横幅" :value="1" />
                <el-option label="弹窗" :value="2" />
                <el-option label="卡片" :value="3" />
                <el-option label="仅消息中心" :value="4" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目标用户" prop="target_users">
              <el-select
                  v-model="formData.target_users"
                  placeholder="请选择目标用户"
                  style="width: 100%"
              >
                <el-option label="全部用户" value="all" />
                <el-option label="VIP用户" value="vip" />
                <el-option label="新用户" value="new" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="是否可关闭" prop="isClosable">
              <el-radio-group v-model="formData.is_closable">
                <el-radio :value="1">是</el-radio>
                <el-radio :value="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始显示时间" prop="start_time">
              <el-date-picker
                  v-model="formData.start_time"
                  type="datetime"
                  placeholder="请选择开始时间"
                  style="width: 100%"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="结束显示时间" prop="end_time">
              <el-date-picker
                  v-model="formData.end_time"
                  type="datetime"
                  placeholder="请选择结束时间"
                  style="width: 100%"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="跳转链接" prop="link_url">
          <el-input
              v-model="formData.link_url"
              :clearable="true"
              placeholder="请输入跳转链接（选填）"
              maxlength="500"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="0">草稿</el-radio>
            <el-radio :value="1">发布</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup>
import {
  getAnnouncementList,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  findAnnouncement
} from '@/api/project/announcement'

// 富文本组件
import RichEdit from '@/components/richtext/rich-edit.vue'

// 全量引入格式化工具 请按需保留
import { formatDate } from '@/utils/format'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, reactive } from 'vue'

defineOptions({
  name: 'SystemAnnouncement'
})

// 控制更多查询条件显示/隐藏状态
const showAllQuery = ref(false)

// 表单数据
const formData = ref({
  title: '',
  content: '',
  type: 3,
  display_type: 1,
  target_users: 'all',
  link_url: '',
  start_time: null,
  end_time: null,
  is_closable: 1,
  status: 0
})

// 验证规则
const rule = reactive({
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }],
  type: [{ required: true, message: '请选择公告类型', trigger: 'change' }],
  display_type: [{ required: true, message: '请选择展示类型', trigger: 'change' }],
  target_users: [{ required: true, message: '请选择目标用户', trigger: 'change' }]
})

const searchRule = reactive({
  createdAt: [
    {
      validator: (rule, value, callback) => {
        if (searchInfo.value.startCreatedAt && !searchInfo.value.endCreatedAt) {
          callback(new Error('请填写结束日期'))
        } else if (!searchInfo.value.startCreatedAt && searchInfo.value.endCreatedAt) {
          callback(new Error('请填写开始日期'))
        } else if (
            searchInfo.value.startCreatedAt &&
            searchInfo.value.endCreatedAt &&
            (searchInfo.value.startCreatedAt.getTime() === searchInfo.value.endCreatedAt.getTime() ||
                searchInfo.value.startCreatedAt.getTime() > searchInfo.value.endCreatedAt.getTime())
        ) {
          callback(new Error('开始日期应当早于结束日期'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
})

const elFormRef = ref()
const elSearchFormRef = ref()

// =========== 表格控制部分 ===========
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])
const searchInfo = ref({})

// 重置
const onReset = () => {
  searchInfo.value = {}
  getTableData()
}

// 搜索
const onSubmit = () => {
  elSearchFormRef.value?.validate(async (valid) => {
    if (!valid) return
    page.value = 1
    getTableData()
  })
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  getTableData()
}

// 修改页面容量
const handleCurrentChange = (val) => {
  page.value = val
  getTableData()
}

// 查询
const getTableData = async () => {
  const table = await getAnnouncementList({
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
}

getTableData()

// 多选数据
const multipleSelection = ref([])
// 多选
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 删除行
const deleteRow = (row) => {
  ElMessageBox.confirm('确定要删除吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteAnnouncementFunc(row)
  })
}

// 多选删除
const onDelete = async () => {
  ElMessageBox.confirm('确定要删除吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const IDs = []
    if (multipleSelection.value.length === 0) {
      ElMessage({
        type: 'warning',
        message: '请选择要删除的数据'
      })
      return
    }
    multipleSelection.value &&
    multipleSelection.value.map((item) => {
      IDs.push(item.ID)
    })
    const res = await deleteAnnouncement({ IDs })
    if (res.code === 0) {
      ElMessage({
        type: 'success',
        message: '删除成功'
      })
      if (tableData.value.length === IDs.length && page.value > 1) {
        page.value--
      }
      getTableData()
    }
  })
}

// 行为控制标记（弹窗内部需要增还是改）
const type = ref('')

// 查看公告
const viewAnnouncement = async (row) => {
  const res = await findAnnouncement({ id: row.id })
  type.value = 'view'
  if (res.code === 0) {
    formData.value = res.data
    dialogFormVisible.value = true
  }
}

// 更新行
const updateAnnouncementFunc = async (row) => {
  const res = await findAnnouncement({ id: row.id })
  type.value = 'update'
  if (res.code === 0) {
    formData.value = res.data
    dialogFormVisible.value = true
  }
}

// 删除行
const deleteAnnouncementFunc = async (row) => {
  const IDs = []
  IDs.push(row.id)
  const res = await deleteAnnouncement({ IDs })
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
}

// 弹窗控制标记
const dialogFormVisible = ref(false)

// 打开弹窗
const openDialog = () => {
  type.value = 'create'
  dialogFormVisible.value = true
}

// 关闭弹窗
const closeDialog = () => {
  dialogFormVisible.value = false
  formData.value = {
    title: '',
    content: '',
    type: 3,
    display_type: 1,
    target_users: 'all',
    link_url: '',
    start_time: null,
    end_time: null,
    is_closable: 1,
    status: 0
  }
}

// 弹窗确定
const enterDialog = async () => {
  elFormRef.value?.validate(async (valid) => {
    if (!valid) return
    let res
    switch (type.value) {
      case 'create':
        res = await createAnnouncement(formData.value)
        break
      case 'update':
        res = await updateAnnouncement(formData.value)
        break
      default:
        res = await createAnnouncement(formData.value)
        break
    }
    if (res.code === 0) {
      ElMessage({
        type: 'success',
        message: '创建/更改成功'
      })
      closeDialog()
      getTableData()
    }
  })
}
</script>

<style scoped>
.file-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>