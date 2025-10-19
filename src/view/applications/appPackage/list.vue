<template>
  <div>
    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button type="primary" icon="plus" @click="openDrawer">
          新增安装包
        </el-button>
        <el-button type="success" icon="check" @click="batchPublished" :disabled="!selectedApps.length">
          批量发布
        </el-button>
        <el-button type="success"  @click="configIosAccount" >
          配置IOS账号
        </el-button>
      </div>

      <!-- 搜索筛选区域 -->
      <div class="search-box mb-4">
        <el-row :gutter="20">
          <el-col :span="2">
            <el-input
                v-model="searchForm.app_id"
                placeholder="应用ID"
                clearable
                @clear="getTableData"
                @keyup.enter="getTableData"
            />
          </el-col>
          <el-col :span="4">
            <el-select
                v-model="searchForm.platform"
                placeholder="平台"
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
            <el-select
                v-model="searchForm.status"
                placeholder="状态"
                clearable
                @change="getTableData"
            >
              <el-option label="草稿" value="draft" />
              <el-option label="测试中" value="testing" />
              <el-option label="待审核" value="review_pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已发布" value="published" />
              <el-option label="已拒绝" value="rejected" />
              <el-option label="已暂停" value="suspended" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select
                v-model="searchForm.country_code"
                placeholder="国家代码"
                clearable
            >
              <el-option
                  v-for="country in countryList"
                  :key="country.country_code"
                  :label="country.country_name"
                  :value="country.country_code"
              />
            </el-select>
          </el-col>
          <el-col :span="6">
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
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column align="left" label="应用"  prop="app_name" show-overflow-tooltip />

        <el-table-column align="left" label="应用ID"  prop="app_id" />

        <el-table-column align="left" label="版本信息" width="120">
          <template #default="scope">
            <div>
              <div class="font-medium">{{ scope.row.version_name }}</div>
              <div class="text-xs text-gray-500">Code: {{ scope.row.version_code }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column align="center" label="平台" >
          <template #default="scope">
            <el-tag
                :type="getPlatformTagType(scope.row.platform)"
                size="small"
            >
              {{ getPlatformLabel(scope.row.platform) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column align="left" label="国家/地区"  prop="country_code" >
          <template #default="scope">
            <div>
              <el-text>{{ getCountryLabel(scope.row.country_code) }}</el-text>
            </div>

          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" >
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column align="left" label="发布时间" >
          <template #default="scope">
            <span v-if="scope.row.published_at">{{ formatDate(scope.row.published_at) }}</span>
            <span v-else class="text-gray-400">未发布</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="操作"  fixed="right">
          <template #default="scope">
            <el-button
                type="primary"
                link
                icon="view"
                @click="viewPackageFun(scope.row)"
            >
              详情
            </el-button>
            <el-button
                type="primary"
                link
                icon="edit"
                @click="updatePackageFun(scope.row)"
            >
              编辑
            </el-button>
            <el-button
                type="danger"
                link
                icon="delete"
                @click="deletePackageFun(scope.row)"
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
        :size="900"
        :show-close="false"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-lg">{{ type === 'update' ? '编辑安装包' : '新增安装包' }}</span>
          <div>
            <el-button @click="closeDrawer">取消</el-button>
            <el-button type="primary" @click="enterDrawer" :loading="submitLoading">确定</el-button>
          </div>
        </div>
      </template>

      <el-form :model="form" label-width="90px" :rules="rules" ref="formRef">
        <!-- 本地化信息 -->
        <div class="form-section">
          <el-form-item label="应用名称" prop="app_id">
            <el-select v-model="form.app_id" placeholder="选择应用" clearable>
              <el-option
                  v-for="country in appList"
                  :key="country.app_id"
                  :label="country.app_name"
                  :value="country.app_id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="支持平台" prop="platform">
            <el-select v-model="form.platform"  placeholder="请选择支持平台" clearable>
              <el-option label="Android" value="android" />
              <el-option label="iOS" value="ios" />
              <el-option label="HarmonyOS" value="harmony" />
              <el-option label="Windows" value="windows" />
            </el-select>
          </el-form-item>
          <el-form-item label="选择套餐" prop="plan_id">
              <el-checkbox-group v-model="form.planList">
                <el-checkbox
                    v-for="plan in filteredPlanList"
                    :key="plan.id"
                    :label="plan.plan_name"
                    :value="plan.id"
                />
              </el-checkbox-group>
         </el-form-item>
          <el-form-item label="版本名称" prop="version_name">
            <el-input
                v-model="form.version_name"
                placeholder="如：1.0.0"
            />
          </el-form-item>
          <el-form-item label="版本号" prop="version_code">
            <el-input-number
                v-model="form.version_code"
                :min="1"
                placeholder="数字版本号"
                style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="下载链接" prop="file_url">
            <el-input v-model="form.file_url"
                      type="textarea"
                      :rows="3"
            />
            <div class="text-xs text-gray-500 mt-1">安卓的是下载链接，IOS是账号和密码以及密保答案</div>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
                v-model="form.status"
                placeholder="状态"
                clearable
                @change="getTableData"
            >
              <el-option label="草稿" value="draft" />
              <el-option label="测试中" value="testing" />
              <el-option label="待审核" value="review_pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已发布" value="published" />
              <el-option label="已拒绝" value="rejected" />
              <el-option label="已暂停" value="suspended" />
            </el-select>
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
          <span class="text-lg">安装包详情</span>
          <el-button @click="viewDrawerVisible = false">关闭</el-button>
        </div>
      </template>

      <div v-if="viewData" class="package-detail">
        <!-- 详情内容会在这里显示 -->
        <div class="detail-section">
          <h4>基础信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="应用">{{ viewData.app_name }}</el-descriptions-item>
            <el-descriptions-item label="应用ID">{{ viewData.app_id }}</el-descriptions-item>
            <el-descriptions-item label="版本">{{ viewData.version_name }} ({{ viewData.version_code }})</el-descriptions-item>
            <el-descriptions-item label="平台">{{ getPlatformLabel(viewData.platform) }}</el-descriptions-item>
            <el-descriptions-item label="国家">{{ getCountryLabel(viewData.country_code) }}</el-descriptions-item>
            <el-descriptions-item label="状态">{{ getStatusLabel(viewData.status) }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-drawer>
    <el-dialog
        v-model="iosAccountVisible"
        title="IOS账号配置"
        width="800px"
        :before-close="closeIosAccountDialog"
    >
    <el-form :model="iosAccountForm" label-width="90px" :rules="iosAccountRules" ref="iosAccountFormRef">
      <!-- 动态账号列表 -->
      <!-- 动态账号列表 -->
      <div class="account-list">
        <el-form-item
            v-for="(account, index) in iosAccountForm.accounts"
            :key="index"
            :label="`账号${index + 1}`"
            :prop="`accounts.${index}`"
            class="account-item"
            :rules="[
            { required: true, message: '请输入账号', trigger: 'blur' },
          ]"
        >
          <div class="account-input-wrapper">
            <el-input
                v-model="iosAccountForm.accounts[index]"
                :placeholder="`请输入账号${index + 1}`"
                clearable
                class="account-input"
            />
            <el-button
                type="danger"
                icon="Delete"
                :disabled="iosAccountForm.accounts.length === 1"
                @click="removeAccount(index)"
                circle
                class="delete-btn"
            />
          </div>
        </el-form-item>
      </div>

      <!-- 添加账号按钮 -->
      <el-form-item>
        <el-button
            type="primary"
            icon="Plus"
            @click="addAccount"
            plain
        >
          添加账号
        </el-button>
        <span class="tip-text" >（当前共 {{ iosAccountForm.accounts.length }} 个账号）</span>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeIosAccountDialog">取消</el-button>
        <el-button type="primary" @click="saveIosAccount" :loading="iosAccountSubmitLoading">
          保存
        </el-button>
      </div>
    </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  createAppPackage,
  updateAppPackage,
  deleteAppPackage,
  getAppPackage,
  getAppPackageList, batchUpdateAppPackageStatus
} from '@/api/project/appPackage'
import {
  getCountryList
} from '@/api/project/country'
import {
  batchUpdateApplicationStatus,
  getApplicationList
} from '@/api/project/application'
import {ref, reactive, onMounted, computed,watch} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/format'
import {getMembershipPlanList} from "@/api/project/membershipPlan.js";
import {GetConfigByKey, setScopeConfig} from "@/api/system.js";

defineOptions({
  name: 'AppPackageManagement'
})

// 搜索表单
const searchForm = reactive({
  app_id: '',
  platform: '',
  status: '',
  country_code: ''
})

// 表单数据
const form = ref({
  app_id: '',
  plan_id: '',
  version_name: '',
  version_code: 1,
  platform: '',
  file_url: '',
  status: 'draft',
  planList:[],
})

// 表单验证规则
const rules = reactive({
  app_id: [
    { required: true, message: '请选择应用', trigger: 'blur' }
  ],
  package_name: [
    { required: true, message: '请输入包名', trigger: 'blur' }
  ],
  version_name: [
    { required: true, message: '请输入版本名称', trigger: 'blur' }
  ],
  version_code: [
    { required: true, message: '请输入版本号', trigger: 'blur' },
    { type: 'number', min: 1, message: '版本号必须大于0', trigger: 'blur' }
  ],
  platform: [
    { required: true, message: '请选择平台', trigger: 'change' }
  ],
})

// 分页数据
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])
const loading = ref(false)
const submitLoading = ref(false)
const selectedApps = ref([])

// 表单引用
const formRef = ref(null)

// 抽屉状态
const drawerFormVisible = ref(false)
const viewDrawerVisible = ref(false)
const type = ref('')
const viewData = ref(null)
// 在现有的 ref 声明处添加
const iosAccountVisible = ref(false)
const iosAccountSubmitLoading = ref(false)
const iosAccountFormRef = ref(null)


const appList = ref([])
const planList = ref([])
const countryList = ref([])

// 表单验证规则
const iosAccountRules = reactive({
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
})
// IOS账号表单数据
const iosAccountForm = ref({
  accounts: [''], // 默认一个空账号
})

// 添加账号
const addAccount = () => {
  // 限制最多10个账号
  if (iosAccountForm.value.accounts.length >= 10) {
    ElMessage.warning('最多只能添加10个账号')
    return
  }
  iosAccountForm.value.accounts.push('')
}

// 删除账号
const removeAccount = async (index) => {
  // 至少保留一个账号
  if (iosAccountForm.value.accounts.length === 1) {
    ElMessage.warning('至少保留一个账号')
    return
  }

  // 如果账号不为空，弹出确认提示
  if (iosAccountForm.value.accounts[index].trim() !== '') {
    try {
      await ElMessageBox.confirm('确定要删除这个账号吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      iosAccountForm.value.accounts.splice(index, 1)
      ElMessage.success('删除成功')
    } catch {
      // 用户取消删除
    }
  } else {
    // 空账号直接删除
    iosAccountForm.value.accounts.splice(index, 1)
  }
}
// 重置IOS账号表单
const resetIosAccountForm = () => {
  iosAccountForm.value = {
    accounts: [''],
  }
  if (iosAccountFormRef.value) {
    iosAccountFormRef.value.resetFields()
  }
}
// 配置IOS账号的功能
const configIosAccount = async ()=>{
  // 如果需要编辑现有账号，可以先获取账号信息
  let resp =  await GetConfigByKey({scope: "website", "key": "ios_account"})
  if (resp.code === 0){
    if(Array.isArray(resp.data) && resp.data.length > 0){
      iosAccountForm.value.accounts = resp.data
    }else{
      resetIosAccountForm()
    }
    iosAccountVisible.value = true
  }
}
// 关闭弹窗
const closeIosAccountDialog = () => {
  iosAccountVisible.value = false
  resetIosAccountForm()
}
// 保存账号
const saveIosAccount = async () => {
  if (!iosAccountFormRef.value) return
  try {
    await iosAccountFormRef.value.validate()
    iosAccountSubmitLoading.value = true
    console.log(iosAccountForm.value)
    // 过滤掉空账号
    const validAccounts = iosAccountForm.value.accounts.filter(
        account => account.trim() !== ''
    )
    // 检查是否至少有一个有效账号
    if (validAccounts.length === 0) {
      ElMessage.warning('请至少填写一个账号')
      iosAccountSubmitLoading.value = false
      return
    }
    const submitData = {
      config:{
        ios_account: validAccounts
      },
      scope:"website"
    }
    // 调用API - 根据你的实际API进行调整
    const res = await setScopeConfig(submitData)
    if (res.code === 0) {
      ElMessage.success('保存成功')
      closeIosAccountDialog()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('保存失败:', error)
      ElMessage.error('保存失败')
    }
  } finally {
    iosAccountSubmitLoading.value = false
  }
}
// 选择变更处理
const handleSelectionChange = (selection) => {
  selectedApps.value = selection
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
// 获取基础数据
const getBasicData = async () => {
  try {
    const params = {
      page: 1,
      pageSize: 100,
    }
    const countryRes = await getCountryList(params)
    if (countryRes.code === 0) {
      countryList.value = countryRes.data.list || []
    }
    // 获取应用列表
    const appRes = await getApplicationList(params)
    if (appRes.code === 0) {
      appList.value = appRes.data.list || []
    }
    const planRes = await getMembershipPlanList(params)
    if (planRes.code === 0) {
      planList.value = planRes.data.list || []
    }
  } catch (error) {
    console.error('获取基础数据失败:', error)
  }
}
// 工具方法
// 在现有的响应式数据后添加计算属性
const filteredPlanList = computed(() => {
  if (!form.value.platform) {
    // 如果没有选择平台，返回所有套餐
    return planList.value
  }

  // 根据选择的平台过滤套餐
  return planList.value.filter(plan => {
    // 检查套餐的平台数组是否包含当前选择的平台
    return plan.platform && plan.platform.includes(form.value.platform)
  })
})


// 批量发布
const batchPublished = async () => {
  try {
    await ElMessageBox.confirm(`确定要发布选中的 ${selectedApps.value.length} 个安装包吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    const ids = selectedApps.value.map(app => app.id)
    const res = await batchUpdateAppPackageStatus({ ids,status: 'published' })
    if (res.code === 0) {
      ElMessage.success('批量发布成功')
      await getTableData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量发布失败')
      console.error(error)
    }
  }
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


const getCountryLabel = (country_code) => {
  const country = countryList.value.find(item => item.country_code === country_code);
  return country ? country.country_name : country_code;
}

const getStatusLabel = (status) => {
  const labels = {
    draft: '草稿',
    testing: '测试中',
    review_pending: '待审核',
    approved: '已通过',
    published: '已发布',
    rejected: '已拒绝',
    suspended: '已暂停',
    archived: '已归档'
  }
  return labels[status] || status
}

const getStatusTagType = (status) => {
  const types = {
    draft: 'info',
    testing: 'warning',
    review_pending: 'primary',
    approved: 'success',
    published: 'success',
    rejected: 'danger',
    suspended: 'danger',
    archived: 'info'
  }
  return types[status] || 'info'
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
    app_id: '',
    platform: '',
    status: '',
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
    const table = await getAppPackageList(params)
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
const viewPackageFun = async (row) => {
  try {
    const res = await getAppPackage({ id: row.id })
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
const updatePackageFun = async (row) => {
  try {
    const res = await getAppPackage({ id: row.id })
    type.value = 'update'
    if (res.code === 0) {
      // 处理套餐数据，将套餐对象数组转换为 ID 数组
      const packageData = { ...res.data }
      if (packageData.membership_plans && packageData.membership_plans.length > 0) {
        packageData.planList = packageData.membership_plans.map(plan => plan.id)
      } else {
        packageData.planList = []
      }
      form.value = packageData
      drawerFormVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取应用包信息失败')
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
    app_id: '',
    package_name: '',
    version_name: '',
    version_code: 1,
    platform: '',
    file_url: '',
    status: 'draft',
  }
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 删除
const deletePackageFun = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个安装包吗？删除后无法恢复！', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deleteAppPackage({ id: row.id })
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

    let res
    switch (type.value) {
      case 'create':
        res = await createAppPackage(form.value)
        break
      case 'update':
        res = await updateAppPackage(form.value)
        break
      default:
        res = await createAppPackage(form.value)
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

// 监听平台变化，清空已选择的套餐（如果需要的话）
watch(() => form.value.platform, (newPlatform, oldPlatform) => {
  if (newPlatform !== oldPlatform && form.value.planList?.length > 0) {
    // 检查当前已选的套餐是否还适用于新平台
    const validPlanIds = filteredPlanList.value.map(plan => plan.id)
    form.value.planList = form.value.planList.filter(planId =>
        validPlanIds.includes(planId)
    )
  }
}, { immediate: false })
// 初始化数据
onMounted(() => {
   getBasicData()
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


.detail-section {
  margin-bottom: 30px;
}

.detail-section h4 {
  margin: 0 0 15px 0;
  color: #409eff;
  font-weight: 600;
}

.package-detail {
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

.font-medium {
  font-weight: 500;
}

.account-list {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 10px;
}

.account-list::-webkit-scrollbar {
  width: 6px;
}

.account-list::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.account-list::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}

/* 关键样式：让输入区域占满剩余空间 */
.account-item {
  margin-bottom: 18px;
}

.account-input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.account-input {
  flex: 1; /* 让输入框占据所有剩余空间 */
}

.delete-btn {
  flex-shrink: 0; /* 按钮不缩放 */
}

.tip-text {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

</style>