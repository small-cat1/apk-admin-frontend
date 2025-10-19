<template>
  <div>
    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button type="primary" icon="plus" @click="openDrawer">
          新增国家或地区代码
        </el-button>
      </div>
      <el-table
          ref="multipleTable"
          :data="tableData"
          style="width: 100%"
          tooltip-effect="dark"
          row-key="id"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column align="left" label="国家或地区代码" width="100" prop="country_code" />

        <el-table-column align="left" label="国家名称" width="150" prop="country_name" />

        <el-table-column align="left" label="英文名称" width="150" prop="country_name_en" />

        <el-table-column align="left" label="所属地区" width="120" prop="region" />

        <el-table-column align="left" label="货币代码" width="100" prop="currency_code" />

        <el-table-column align="left" label="官方语言" width="150">
          <template #default="scope">
            <el-tag
                v-for="lang in scope.row.language_codes"
                :key="lang"
                size="small"
                class="mr-1"
            >
              {{ lang }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column align="left" label="内容分级系统" width="140" prop="content_rating_system" />

        <el-table-column align="center" label="是否支持" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.is_supported ? 'success' : 'danger'">
              {{ scope.row.is_supported ? '支持' : '不支持' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column align="left" label="创建时间" width="180">
          <template #default="scope">
            <span>{{ formatDate(scope.row.created_at) }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
                type="primary"
                link
                icon="edit"
                @click="updateCountryFun(scope.row)"
            >
              编辑
            </el-button>
            <el-button
                type="danger"
                link
                icon="delete"
                @click="deleteCountryFun(scope.row)"
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
          <span class="text-lg">{{ type === 'update' ? '编辑国家或地区代码' : '新增国家或地区代码' }}</span>
          <div>
            <el-button @click="closeDrawer">取消</el-button>
            <el-button type="primary" @click="enterDrawer">确定</el-button>
          </div>
        </div>
      </template>

      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="国家或地区代码" prop="country_code">
          <el-input
              v-model="form.country_code"
              placeholder="请输入国家或地区代码（如CHN）"
              maxlength="2"
              :disabled="type === 'update'"
          />
          <div class="text-xs text-gray-500 mt-1">ISO 3166-1 标准代码</div>
        </el-form-item>

        <el-form-item label="国家名称" prop="country_name">
          <el-input v-model="form.country_name" placeholder="请输入国家中文名称" />
        </el-form-item>

        <el-form-item label="英文名称" prop="country_name_en">
          <el-input v-model="form.country_name_en" placeholder="请输入国家英文名称" />
        </el-form-item>

        <el-form-item label="所属地区" prop="region">
          <el-select v-model="form.region" placeholder="请选择所属地区">
            <el-option label="亚洲 (Asia)" value="Asia" />
            <el-option label="欧洲 (Europe)" value="Europe" />
            <el-option label="北美洲 (North America)" value="North America" />
            <el-option label="南美洲 (South America)" value="South America" />
            <el-option label="非洲 (Africa)" value="Africa" />
            <el-option label="大洋洲 (Oceania)" value="Oceania" />
          </el-select>
        </el-form-item>

        <el-form-item label="货币代码" prop="currency_code">
          <el-input
              v-model="form.currency_code"
              placeholder="请输入3位货币代码（如USD）"
              maxlength="3"
          />
          <div class="text-xs text-gray-500 mt-1">ISO 4217 标准代码</div>
        </el-form-item>

        <el-form-item label="官方语言" prop="language_codes">
          <el-select
              v-model="form.language_codes"
              placeholder="请选择官方语言"
              multiple
              filterable
              allow-create
          >
            <el-option label="中文 (zh)" value="zh" />
            <el-option label="英语 (en)" value="en" />
            <el-option label="日语 (ja)" value="ja" />
            <el-option label="韩语 (ko)" value="ko" />
            <el-option label="法语 (fr)" value="fr" />
            <el-option label="德语 (de)" value="de" />
            <el-option label="西班牙语 (es)" value="es" />
            <el-option label="俄语 (ru)" value="ru" />
            <el-option label="阿拉伯语 (ar)" value="ar" />
            <el-option label="葡萄牙语 (pt)" value="pt" />
          </el-select>
          <div class="text-xs text-gray-500 mt-1">ISO 639-1 标准代码</div>
        </el-form-item>

        <el-form-item label="内容分级系统" prop="content_rating_system">
          <el-select v-model="form.content_rating_system" placeholder="请选择内容分级系统">
            <el-option label="ESRB (北美)" value="ESRB" />
            <el-option label="PEGI (欧洲)" value="PEGI" />
            <el-option label="CERO (日本)" value="CERO" />
            <el-option label="GRAC (韩国)" value="GRAC" />
            <el-option label="OFLC (澳大利亚)" value="OFLC" />
            <el-option label="USK (德国)" value="USK" />
            <el-option label="BBFC (英国)" value="BBFC" />
          </el-select>
        </el-form-item>

        <el-form-item label="是否支持分发" prop="is_supported">
          <el-switch
              v-model="form.is_supported"
              :active-value="1"
              :inactive-value="0"
              active-text="支持"
              inactive-text="不支持"
          />
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup>
import {
  createCountry,
  updateCountry,
  deleteCountry,
  getCountry,
  getCountryList
} from '@/api/project/country'
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/format'

defineOptions({
  name: 'CountryManagement'
})

// 表单数据
const form = ref({
  country_code: '',
  country_name: '',
  country_name_en: '',
  region: '',
  currency_code: '',
  language_codes: [],
  content_rating_system: '',
  is_supported: 1
})

// 表单验证规则
const rules = reactive({
  country_code: [
    { required: true, message: '请输入国家或地区代码', trigger: 'blur' },
    { min: 2, max: 4, message: '国家或地区代码必须为2-4位字符', trigger: 'blur' },
    { pattern: /^[A-Z]{2}$/, message: '国家或地区代码必须为2位大写字母', trigger: 'blur' }
  ],
  country_name: [
    { required: true, message: '请输入国家中文名称', trigger: 'blur' },
    { max: 100, message: '国家名称不能超过100个字符', trigger: 'blur' }
  ],
  country_name_en: [
    { required: true, message: '请输入国家英文名称', trigger: 'blur' },
    { max: 100, message: '英文名称不能超过100个字符', trigger: 'blur' }
  ],
  currency_code: [
    { pattern: /^[A-Z]{3}$/, message: '货币代码必须为3位大写字母', trigger: 'blur' }
  ]
})

// 分页数据
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

// 表单引用
const formRef = ref(null)

// 抽屉状态
const drawerFormVisible = ref(false)
const type = ref('')

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
    const table = await getCountryList({
      page: page.value,
      pageSize: pageSize.value
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

const updateCountryFun = async (row) => {
  try {
    const res = await getCountry({ id: row.id })
    type.value = 'update'
    if (res.code === 0) {
      form.value = {
        ...res.data,
        language_codes: Array.isArray(res.data.language_codes) ? res.data.language_codes : []
      }
      drawerFormVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取分类信息失败')
    console.error(error)
  }
}

// 关闭抽屉
const closeDrawer = () => {
  drawerFormVisible.value = false
  form.value = {
    country_code: '',
    country_name: '',
    country_name_en: '',
    region: '',
    currency_code: '',
    language_codes: [],
    content_rating_system: '',
    is_supported: 1
  }
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 删除分类
const deleteCountryFun = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个国家或地区代码吗？删除后相关数据也会受影响！', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deleteCountry({ id: row.id })
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

    // 确保country_code是大写
    form.value.country_code = form.value.country_code.toUpperCase()
    if (form.value.currency_code) {
      form.value.currency_code = form.value.currency_code.toUpperCase()
    }

    let res
    switch (type.value) {
      case 'create':
        res = await createCountry(form.value)
        break
      case 'update':
        res = await updateCountry(form.value)
        break
      default:
        res = await createCountry(form.value)
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

.mr-1 {
  margin-right: 4px;
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
</style>