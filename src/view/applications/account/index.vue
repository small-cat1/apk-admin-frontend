<template>
  <div class="account-management">
    <div class="gva-table-box">
      <!-- 操作按钮区 -->
      <div class="gva-btn-list">
        <el-button type="primary" icon="plus" @click="openDrawer">
          新增账号
        </el-button>
        <el-button
            type="success"
            icon="upload"
            @click="openImportDialog"
        >
          批量导入
        </el-button>
        <el-button
            type="danger"
            icon="delete"
            @click="batchDelete"
            :disabled="!selectedAccounts.length"
        >
          批量删除
        </el-button>
        <el-button
            type="warning"
            icon="warning"
            @click="openBatchStatusDialog(2)"
            :disabled="!selectedAccounts.length"
        >
          批量封禁
        </el-button>
        <el-button
            type="success"
            icon="check"
            @click="openBatchStatusDialog(1)"
            :disabled="!selectedAccounts.length"
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
                  v-model="searchForm.account_no"
                  placeholder="账号编号"
                  clearable
                  @clear="handleSearch"
                  @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :span="5">
              <el-select
                  v-model="searchForm.app_id"
                  placeholder="选择应用"
                  clearable
                  filterable
                  @change="handleSearch"
              >
                <el-option
                    v-for="app in applicationsList"
                    :key="app.app_id"
                    :label="app.app_name"
                    :value="app.app_id"
                />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select
                  v-model="searchForm.category_id"
                  placeholder="账号应用分类"
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
                  v-model="searchForm.account_status"
                  placeholder="账号状态"
                  clearable
                  @change="handleSearch"
              >
                <el-option
                    v-for="status in accountStatusList"
                    :key="status.value"
                    :label="status.label"
                    :value="status.value"
                />
              </el-select>
            </el-col>
            <el-col :span="6">
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

        <!-- 账号编号 -->
        <el-table-column label="账号编号" width="180" fixed="left">
          <template #default="{ row }">
            <div class="account-no">
              <el-tag>{{ row.account_no }}</el-tag>
            </div>
          </template>
        </el-table-column>

        <!-- 应用信息 -->
        <el-table-column label="所属应用" >
          <template #default="{ row }">
            <div class="app-info">
              <div v-if="row.app_icon" class="app-icon">
                <CustomPic
                    pic-type="file"
                    :pic-src="row.app_icon"
                    preview
                />
              </div>
              <div class="app-details">
                <div class="app-name">{{ row.app_name || row.app_id }}</div>
                <div class="app-category">
                  <el-tag size="small" type="info">
                    {{ getCategoryLabel(row.category_id) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 额外信息 -->
        <el-table-column label="额外信息">
          <template #default="{ row }">
            <div class="extra-info-cell">
              <div v-if="row.extra_info">
                <el-tag
                    v-if="row.extra_info.vip_level"
                    type="warning"
                    size="small"
                >
                  VIP{{ row.extra_info.vip_level }}
                </el-tag>
                <div v-if="row.extra_info.expire_time" class="expire-time">
                  到期: {{ formatDate(row.extra_info.expire_time) }}
                </div>
              </div>
              <span v-else class="text-gray">暂无</span>
            </div>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="账号状态" align="center" >
          <template #default="{ row }">
            <el-tag
                :type="getStatusType(row.account_status)"
                size="small"
            >
              {{ getStatusLabel(row.account_status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 创建时间 -->
        <el-table-column label="创建时间" align="center" >
          <template #default="{ row }">
            <div class="time-cell">
              <div>{{ formatDate(row.created_at) }}</div>
              <div class="creator">创建者: {{ row.creator_name }}</div>
            </div>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作"  align="center" width="240" fixed="right">
          <template #default="{ row }">
            <el-button
                type="primary"
                link
                icon="view"
                @click="viewAccountFun(row)"
            >
              详情
            </el-button>
            <!-- 只有非售出状态才显示编辑和更多操作 -->
            <template v-if="!isAccountSold(row.account_status)">
              <el-button
                  type="primary"
                  link
                  icon="edit"
                  @click="updateAccountFun(row)"
              >
                编辑
              </el-button>
              <el-dropdown @command="handleCommand($event, row)" style="margin-top: 7px;margin-left: 7px">
                <el-button type="primary" link>
                  更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                        command="ban"
                        v-if="row.account_status === 1"
                    >
                      <el-icon><Lock /></el-icon>
                      禁用账户
                    </el-dropdown-item>
                    <el-dropdown-item
                        command="activate"
                        v-if="row.account_status !== 1"
                    >
                      <el-icon><Unlock /></el-icon>
                      激活账户
                    </el-dropdown-item>
                    <el-dropdown-item command="setExpired">
                      <el-icon><Clock /></el-icon>
                      设为过期
                    </el-dropdown-item>
                    <el-dropdown-item command="setRisk">
                      <el-icon><Warning /></el-icon>
                      标记风险
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" divided>
                      <el-icon><Delete /></el-icon>
                      删除账户
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
            <!-- 售出状态显示特殊标记 -->
            <template v-else>
              <el-button
                  type="primary"
                  link
                  size="small"
                  @click="viewOrderDetails(row.id)"
                  style="margin-left: 8px"
              >
                查看订单
              </el-button>
            </template>
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

    <!-- 批量状态更新对话框 -->
    <el-dialog
        v-model="batchStatusDialogVisible"
        :title="batchStatusTitle"
        width="500px"
    >
      <el-form :model="batchStatusForm" label-width="80px">
        <el-form-item label="操作原因" required>
          <el-input
              v-model="batchStatusForm.reason"
              type="textarea"
              :rows="4"
              placeholder="请输入操作原因"
              maxlength="200"
              show-word-limit
          />
        </el-form-item>
        <el-alert
            :title="`将对 ${selectedAccounts.length} 个账号执行${batchStatusTitle}操作`"
            type="warning"
            :closable="false"
            style="margin-top: 12px"
        />
      </el-form>
      <template #footer>
        <el-button @click="batchStatusDialogVisible = false">取消</el-button>
        <el-button
            type="primary"
            @click="confirmBatchStatus"
            :loading="submitLoading"
            :disabled="!batchStatusForm.reason.trim()"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog
        v-model="importDialogVisible"
        title="批量导入账号"
        width="700px"
        :close-on-click-modal="false"
    >
      <el-steps :active="importStep" finish-status="success" align-center>
        <el-step title="下载模板" />
        <el-step title="上传文件" />
        <el-step title="导入结果" />
      </el-steps>

      <!-- 步骤1: 下载模板 -->
      <div v-if="importStep === 0" class="import-step">
        <el-alert
            title="导入说明"
            type="info"
            :closable="false"
            style="margin-bottom: 20px"
        >
          <template #default>
            <div class="import-tips">
              <p>1. 请先下载导入模板，按照模板格式填写账号信息</p>
              <p>2. 支持的文件格式：.xlsx、.xls</p>
              <p>3. 必填字段：应用ID、账号详情</p>
              <p>4. 单次最多导入 500 条账号记录</p>
              <p>5. account_status: 1-正常, 2-封禁, 3-过期, 4-风险</p>
            </div>
          </template>
        </el-alert>

        <div class="template-download">
          <el-button type="primary" icon="download" @click="downloadTemplate">
            下载导入模板
          </el-button>
        </div>
      </div>

      <!-- 步骤2: 上传文件 -->
      <div v-if="importStep === 1" class="import-step">
        <el-upload
            ref="uploadRef"
            class="upload-demo"
            drag
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
            accept=".xlsx,.xls"
            :file-list="fileList"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              只能上传 xlsx/xls 文件，且不超过 5MB
            </div>
          </template>
        </el-upload>

        <div v-if="importPreviewData.length > 0" class="preview-data">
          <el-divider>预览数据（前10条）</el-divider>
          <el-table :data="importPreviewData" border max-height="300">
            <el-table-column prop="app_id" label="应用ID" width="120" />
            <el-table-column prop="category_id" label="分类ID" width="100" />
            <el-table-column prop="account_detail" label="账号详情" show-overflow-tooltip />
            <el-table-column prop="account_status" label="状态" width="80" />
            <el-table-column label="验证" width="80">
              <template #default="{ row }">
                <el-tag v-if="row._valid" type="success" size="small">有效</el-tag>
                <el-tag v-else type="danger" size="small">无效</el-tag>
              </template>
            </el-table-column>
          </el-table>
          <el-alert
              v-if="importValidCount > 0"
              :title="`共 ${importTotalCount} 条数据，有效 ${importValidCount} 条，无效 ${importTotalCount - importValidCount} 条`"
              :type="importValidCount === importTotalCount ? 'success' : 'warning'"
              :closable="false"
              style="margin-top: 12px"
          />
        </div>
      </div>

      <!-- 步骤3: 导入结果 -->
      <div v-if="importStep === 2" class="import-step">
        <el-result
            :icon="importResult.success ? 'success' : 'warning'"
            :title="importResult.title"
        >
          <template #sub-title>
            <div class="import-result-detail">
              <p>成功导入: {{ importResult.successCount }} 条</p>
              <p v-if="importResult.failCount > 0">
                失败: {{ importResult.failCount }} 条
              </p>
            </div>
          </template>
          <template #extra>
            <div v-if="importResult.errors.length > 0" class="error-list">
              <el-divider>失败记录</el-divider>
              <el-table :data="importResult.errors" border max-height="200">
                <el-table-column prop="row" label="行号" width="80" />
                <el-table-column prop="reason" label="失败原因" />
              </el-table>
            </div>
          </template>
        </el-result>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeImportDialog">
            {{ importStep === 2 ? '关闭' : '取消' }}
          </el-button>
          <el-button
              v-if="importStep === 0"
              type="primary"
              @click="importStep = 1"
          >
            下一步
          </el-button>
          <el-button
              v-if="importStep === 1"
              @click="importStep = 0"
          >
            上一步
          </el-button>
          <el-button
              v-if="importStep === 1"
              type="primary"
              @click="startImport"
              :loading="importLoading"
              :disabled="importValidCount === 0"
          >
            开始导入
          </el-button>
          <el-button
              v-if="importStep === 2 && importResult.success"
              type="primary"
              @click="finishImport"
          >
            完成
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增/编辑抽屉 -->
    <el-drawer
        v-model="drawerFormVisible"
        :title="type === 'update' ? '编辑账号' : '新增账号'"
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
        <el-form-item label="所属应用" prop="app_id">
          <el-select
              v-model="form.app_id"
              placeholder="选择应用"
              filterable
              style="width: 100%"
          >
            <el-option
                v-for="app in applicationsList"
                :key="app.app_id"
                :label="app.app_name"
                :value="app.app_id"
            >
              <div class="app-option">
                <span>{{ app.app_name }}</span>
                <span class="app-id">{{ app.app_id }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="账号详情" prop="account_detail">
          <el-input
              v-model="form.account_detail"
              type="textarea"
              :rows="6"
              placeholder="请输入账号详情信息(如用户名、密码等敏感信息将加密存储)"
              maxlength="5000"
              show-word-limit
          />
          <div class="form-tip">
            <el-alert
                title="提示"
                type="info"
                :closable="false"
                description="账号详情将加密存储,建议格式:用户名:xxx | 密码:xxx | 邮箱:xxx"
            />
          </div>
        </el-form-item>

        <!-- 额外信息 -->
        <el-divider content-position="left">额外信息</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="VIP等级">
              <el-input-number
                  v-model="extraInfo.vip_level"
                  :min="0"
                  :max="10"
                  style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="到期时间">
              <el-date-picker
                  v-model="extraInfo.expire_time"
                  type="datetime"
                  placeholder="选择到期时间"
                  style="width: 100%"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="绑定邮箱">
          <el-input
              v-model="extraInfo.email"
              placeholder="请输入绑定邮箱"
          />
        </el-form-item>

        <el-form-item label="绑定手机">
          <el-input
              v-model="extraInfo.phone"
              placeholder="请输入绑定手机号"
          />
        </el-form-item>

        <el-form-item label="备注信息">
          <el-input
              v-model="extraInfo.remarks"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
              maxlength="500"
              show-word-limit
          />
        </el-form-item>

        <!-- 状态设置 -->
        <el-divider content-position="left">状态设置</el-divider>

        <el-form-item label="账号状态" prop="account_status">
          <el-select
              v-model="form.account_status"
              placeholder="选择账号状态"
              style="width: 100%"
          >
            <el-option
                v-for="status in accountStatusList"
                :key="status.value"
                :label="status.label"
                :value="status.value"
            >
              <el-tag :type="status.type" size="small">
                {{ status.label }}
              </el-tag>
            </el-option>
          </el-select>
        </el-form-item>
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
        title="账号详情"
        :size="800"
    >
      <div v-if="viewData" class="account-detail">
        <!-- 账号头部 -->
        <div class="detail-header">
          <div class="header-info">
            <h2>{{ viewData.account_no }}</h2>
            <div class="header-tags">
              <el-tag
                  :type="getStatusType(viewData.account_status)"
                  size="large"
              >
                {{ getStatusLabel(viewData.account_status) }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 基础信息 -->
        <el-divider content-position="left">基础信息</el-divider>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="账号编号">
            {{ viewData.account_no }}
          </el-descriptions-item>
          <el-descriptions-item label="所属应用">
            {{ viewData.app_name || viewData.app_id }}
          </el-descriptions-item>
          <el-descriptions-item label="账号应用分类">
            {{ getCategoryLabel(viewData.category_id) }}
          </el-descriptions-item>
          <el-descriptions-item label="账号状态">
            <el-tag :type="getStatusType(viewData.account_status)">
              {{ getStatusLabel(viewData.account_status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 账号详情(需要权限查看)-->
        <el-divider content-position="left">账号详情</el-divider>
        <div class="account-detail-content">
          <el-input
              v-model="viewData.account_detail"
              type="textarea"
              :rows="6"
              readonly
          />
          <div class="copy-btn-wrapper">
            <el-button
                type="primary"
                icon="CopyDocument"
                @click="copyAccountDetail"
            >
              复制账号详情
            </el-button>
          </div>
        </div>

        <!-- 额外信息 -->
        <el-divider content-position="left">额外信息</el-divider>
        <el-descriptions :column="2" border>
          <el-descriptions-item
              label="VIP等级"
              v-if="viewData.extra_info?.vip_level"
          >
            VIP {{ viewData.extra_info.vip_level }}
          </el-descriptions-item>
          <el-descriptions-item
              label="到期时间"
              v-if="viewData.extra_info?.expire_time"
          >
            {{ formatDate(viewData.extra_info.expire_time) }}
          </el-descriptions-item>
          <el-descriptions-item
              label="绑定邮箱"
              v-if="viewData.extra_info?.email"
          >
            {{ viewData.extra_info.email }}
          </el-descriptions-item>
          <el-descriptions-item
              label="绑定手机"
              v-if="viewData.extra_info?.phone"
          >
            {{ viewData.extra_info.phone }}
          </el-descriptions-item>

          <el-descriptions-item
              label="备注信息"
              :span="2"
              v-if="viewData.extra_info?.remarks"
          >
            {{ viewData.extra_info.remarks }}
          </el-descriptions-item>
        </el-descriptions>

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
            {{ viewData.creator_name }}
          </el-descriptions-item>
          <el-descriptions-item label="更新者ID">
            {{ viewData.updated_by || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>



    <el-dialog
        v-model="singleStatusDialogVisible"
        title="禁用账户"
        width="500px"
    >
      <el-form :model="singleStatusForm" label-width="80px">
        <el-form-item label="操作原因" required>
          <el-input
              v-model="singleStatusForm.reason"
              type="textarea"
              :rows="4"
              placeholder="请输入操作原因"
              maxlength="200"
              show-word-limit
          />
        </el-form-item>
        <el-alert
            :title="`将禁用账户 ${singleStatusForm.currentRow?.account_no}`"
            type="warning"
            :closable="false"
            style="margin-top: 12px"
        />
      </el-form>
      <template #footer>
        <el-button @click="singleStatusDialogVisible = false">取消</el-button>
        <el-button
            type="primary"
            @click="confirmSingleStatus"
            :loading="submitLoading"
            :disabled="!singleStatusForm.reason.trim()"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  createAppAccount,
  updateAppAccount,
  deleteAppAccount,
  getAppAccount,
  getAppAccountList,
  batchDeleteAppAccounts,
  batchUpdateAppAccountStatus,
  batchImportAppAccounts // 新增批量导入API
} from '@/api/project/appAccount'
import { getApplicationList } from '@/api/project/application'
import { getCategoryList, getSelectCategory } from '@/api/project/category'
import CustomPic from '@/components/customPic/index.vue'
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/format'
import { useClipboard } from '@vueuse/core'
import * as XLSX from 'xlsx'
import {getAppAccountOrder} from "@/api/project/order.js";

defineOptions({
  name: 'AppAccountManagement'
})

// ========== 响应式数据 ==========
const formRef = ref(null)
const multipleTable = ref(null)
const uploadRef = ref(null)

// 分页
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)

// 加载状态
const loading = ref(false)
const submitLoading = ref(false)
const importLoading = ref(false)

// 抽屉/弹窗状态
const drawerFormVisible = ref(false)
const viewDrawerVisible = ref(false)
const importDialogVisible = ref(false)
const batchStatusDialogVisible = ref(false)
const singleStatusDialogVisible = ref(false)
const orderDialogVisible = ref(false)
const currentAccountOrder = ref(null)

// 表单类型
const type = ref('')

// 表格数据
const tableData = ref([])
const selectedAccounts = ref([])
const viewData = ref(null)
const currentAccountDetail = ref('')

// 基础数据
const applicationsList = ref([])
const categoriesList = ref([])


// 新增：单个状态更新对话框
const singleStatusForm = reactive({
  status: 1,
  reason: '',
  currentRow: null
})

// 打开单个状态对话框
const openSingleStatusDialog = (row, status) => {
  singleStatusForm.status = status
  singleStatusForm.reason = ''
  singleStatusForm.currentRow = row
  singleStatusDialogVisible.value = true
}

// 确认单个状态更新
const confirmSingleStatus = async () => {
  if (!singleStatusForm.reason.trim()) {
    ElMessage.warning('请输入操作原因')
    return
  }

  submitLoading.value = true
  try {
    const res = await batchUpdateAppAccountStatus({
      ids: [singleStatusForm.currentRow.id],
      status: singleStatusForm.status,
      reason: singleStatusForm.reason
    })

    if (res.code === 0) {
      ElMessage.success('操作成功')
      singleStatusDialogVisible.value = false
      await getTableData()
    }
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  } finally {
    submitLoading.value = false
  }
}
// 批量状态更新
const batchStatusForm = reactive({
  status: 1,
  reason: ''
})
const batchStatusTitle = ref('')

// 导入相关
const importStep = ref(0)
const fileList = ref([])
const importPreviewData = ref([])
const importTotalCount = ref(0)
const importValidCount = ref(0)
const importResult = reactive({
  success: false,
  title: '',
  successCount: 0,
  failCount: 0,
  errors: []
})

// 账号状态列表
const accountStatusList = [
  { value: 1, label: '正常', type: 'primary' },
  { value: 2, label: '封禁', type: 'danger' },
  { value: 3, label: '过期', type: 'warning' },
  { value: 4, label: '风险', type: 'info' },
  { value: 5, label: '已售出', type: 'success' }
]

// 搜索表单
const searchForm = reactive({
  account_no: '',
  app_id: '',
  category_id: '',
  account_status: ''
})

// 额外信息
const extraInfo = ref({
  vip_level: 0,
  expire_time: '',
  email: '',
  phone: '',
  remarks: ''
})

// 表单数据
const form = ref({
  app_id: '',
  account_detail: '',
  account_status: 1
})

// ========== 表单验证规则 ==========
const rules = reactive({
  app_id: [
    { required: true, message: '请选择所属应用', trigger: 'change' }
  ],
  account_detail: [
    { required: true, message: '请输入账号详情', trigger: 'blur' },
    { min: 10, message: '账号详情至少10个字符', trigger: 'blur' }
  ],
  account_status: [
    { required: true, message: '请选择账号状态', trigger: 'change' }
  ]
})

// ========== 工具方法 ==========
// 检查账户是否已售出
const isAccountSold = (status) => {
  return status === 5
}

// 获取账户详情（包含订单信息）
const viewAccountFun = async (row) => {
  try {
    const res = await getAppAccount({ id: row.id })
    if (res.code === 0) {
      viewData.value = res.data
      viewData.value.extra_info = JSON.parse(res.data.extra_info || '{}')
      viewDrawerVisible.value = true
    }
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败')
  }
}

// 获取账户关联的订单信息
const getAccountOrderInfo = async (accountId) => {
  try {
    // 调用获取订单的API
    const res = await getAppAccountOrder({ account_id: accountId })
    if (res.code === 0) {
      currentAccountOrder.value = res.data
    }
  } catch (error) {
    console.error('获取订单信息失败:', error)
  }
}

// 查看订单详情
const viewOrderDetails = async(accountId) => {
  await getAccountOrderInfo(accountId)
  if (currentAccountOrder.value) {
    orderDialogVisible.value = true
  }
}

const getStatusLabel = (status) => {
  const item = accountStatusList.find(s => s.value === status)
  return item ? item.label : '未知'
}

const getStatusType = (status) => {
  const item = accountStatusList.find(s => s.value === status)
  return item ? item.type : 'info'
}

const getCategoryLabel = (id) => {
  if (!id) return '未分类'
  const category = categoriesList.value.find(c => c.id === id)
  return category ? category.category_name : '未分类'
}

// 复制账号详情
const { copy } = useClipboard()
const copyAccountDetail = () => {
  const text = currentAccountDetail.value || viewData.value?.account_detail || ''
  copy(text).then(() => {
    ElMessage.success('复制成功')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

// ========== 数据加载 ==========
// 获取基础数据
const getBasicData = async () => {
  try {
    const [appsRes, categoriesRes] = await Promise.all([
      getApplicationList({ page: 1, pageSize: 1000 }),
      getSelectCategory({ account_status: 1 })
    ])
    if (appsRes.code === 0) {
      applicationsList.value = appsRes.data.list || []
    }
    if (categoriesRes.code === 0) {
      categoriesList.value = categoriesRes.data || []
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
    const res = await getAppAccountList(params)
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
    account_no: '',
    app_id: '',
    category_id: '',
    account_status: ''
  })
  handleSearch()
}

// 选择变更
const handleSelectionChange = (selection) => {
  selectedAccounts.value = selection
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

// ========== 批量状态更新 ==========
// 打开批量状态对话框
const openBatchStatusDialog = (status) => {
  batchStatusForm.status = status
  batchStatusForm.reason = ''
  batchStatusTitle.value = getStatusLabel(status)
  batchStatusDialogVisible.value = true
}

// 确认批量更新状态
const confirmBatchStatus = async () => {
  // 检查是否有已售出的账户
  const soldAccounts = selectedAccounts.value.filter(acc =>
      isAccountSold(acc.account_status)
  )
  if (soldAccounts.length > 0) {
    ElMessage.warning(`已售出的账户不能修改状态，共 ${soldAccounts.length} 个`)
    return
  }
  if (!batchStatusForm.reason.trim()) {
    ElMessage.warning('请输入操作原因')
    return
  }

  submitLoading.value = true
  try {
    const ids = selectedAccounts.value.map(acc => acc.id)
    const res = await batchUpdateAppAccountStatus({
      ids,
      status: batchStatusForm.status,
      reason: batchStatusForm.reason
    })

    if (res.code === 0) {
      ElMessage.success('批量更新成功')
      batchStatusDialogVisible.value = false
      await getTableData()
    }
  } catch (error) {
    console.error('批量更新失败:', error)
    ElMessage.error('批量更新失败')
  } finally {
    submitLoading.value = false
  }
}

// ========== 批量导入功能 ==========
// 打开导入对话框
const openImportDialog = () => {
  importStep.value = 0
  fileList.value = []
  importPreviewData.value = []
  importTotalCount.value = 0
  importValidCount.value = 0
  Object.assign(importResult, {
    success: false,
    title: '',
    successCount: 0,
    failCount: 0,
    errors: []
  })
  importDialogVisible.value = true
}

// 关闭导入对话框
const closeImportDialog = () => {
  importDialogVisible.value = false
  if (importResult.successCount > 0) {
    getTableData()
  }
}

// 下载模板
const downloadTemplate = () => {
  const templateData = [
    {
      'app_id': 'app_example_001',
      'account_detail': '用户名:test@example.com | 密码:Test123456',
      'account_status': '1',
      'vip_level': '3',
      'expire_time': '2025-12-31 23:59:59',
      'email': 'test@example.com',
      'phone': '13800138000',
      'remarks': '测试账号备注'
    }
  ]

  const ws = XLSX.utils.json_to_sheet(templateData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '账号导入模板')

  // 设置列宽
  ws['!cols'] = [
    { wch: 20 }, // app_id
    { wch: 40 }, // account_detail
    { wch: 15 }, // account_status
    { wch: 12 }, // vip_level
    { wch: 20 }, // expire_time
    { wch: 25 }, // email
    { wch: 15 }, // phone
    { wch: 30 }  // remarks
  ]

  XLSX.writeFile(wb, '账号批量导入模板.xlsx')
  ElMessage.success('模板下载成功')
}

// 文件变更
const handleFileChange = (file) => {
  const isExcel = file.raw.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.raw.type === 'application/vnd.ms-excel'
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件!')
    fileList.value = []
    return false
  }
  if (!isLt5M) {
    ElMessage.error('文件大小不能超过 5MB!')
    fileList.value = []
    return false
  }

  fileList.value = [file]
  parseExcelFile(file.raw)
}

// 解析Excel文件
const parseExcelFile = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(firstSheet)

      if (jsonData.length === 0) {
        ElMessage.warning('Excel文件中没有数据')
        return
      }

      if (jsonData.length > 500) {
        ElMessage.warning('单次最多导入500条数据')
        return
      }

      // 验证数据
      const validatedData = jsonData.map((row, index) => {
        const isValid = validateImportRow(row)
        return {
          ...row,
          _rowIndex: index + 2, // Excel行号(包含表头)
          _valid: isValid
        }
      })

      importPreviewData.value = validatedData.slice(0, 10)
      importTotalCount.value = validatedData.length
      importValidCount.value = validatedData.filter(r => r._valid).length

      // 保存所有数据用于导入
      importPreviewData.value._allData = validatedData

    } catch (error) {
      console.error('解析文件失败:', error)
      ElMessage.error('文件解析失败,请检查文件格式')
    }
  }
  reader.readAsArrayBuffer(file)
}

// 验证导入行数据
const validateImportRow = (row) => {
  // 必填字段验证
  if (!row.app_id || !row.account_detail) {
    return false
  }

  // 账号详情长度验证
  if (row.account_detail.length < 10) {
    return false
  }

  // 状态值验证
  if (row.account_status && ![1, 2, 3, 4].includes(Number(row.account_status))) {
    return false
  }

  return true
}

// 开始导入
const startImport = async () => {
  const allData = importPreviewData.value._allData
  const validData = allData.filter(r => r._valid)

  if (validData.length === 0) {
    ElMessage.warning('没有有效数据可以导入')
    return
  }

  importLoading.value = true
  try {
    // 格式化导入数据
    const importList = validData.map(row => {
      const extraInfo = {
        vip_level: row.vip_level || 0,
        expire_time: row.expire_time || '',
        email: row.email || '',
        phone: row.phone || '',
        remarks: row.remarks || ''
      }

      return {
        app_id: row.app_id,
        account_detail: row.account_detail,
        account_status: Number(row.account_status) || 1,
        extra_info: JSON.stringify(extraInfo)
      }
    })

    // 调用批量导入API
    const res = await batchImportAppAccounts({ accounts: importList })

    if (res.code === 0) {
      importResult.success = true
      importResult.title = '导入完成'
      importResult.successCount = res.data.successCount || validData.length
      importResult.failCount = res.data.failCount || 0
      importResult.errors = res.data.errors || []
    } else {
      importResult.success = false
      importResult.title = '导入失败'
      importResult.failCount = validData.length
    }

    importStep.value = 2
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败')
    importResult.success = false
    importResult.title = '导入失败'
    importResult.failCount = validData.length
    importStep.value = 2
  } finally {
    importLoading.value = false
  }
}

// 完成导入
const finishImport = () => {
  closeImportDialog()
}

// ========== CRUD操作 ==========
// 打开新增抽屉
const openDrawer = () => {
  type.value = 'create'
  resetForm()
  drawerFormVisible.value = true
}


// 编辑账号
const updateAccountFun = async (row) => {
  if (isAccountSold(row.account_status)) {
    ElMessage.warning('已售出的账户不能编辑')
    return
  }
  try {
    const res = await getAppAccount({ id: row.id })
    if (res.code === 0) {
      type.value = 'update'
      form.value = {
        id: res.data.id,
        app_id: res.data.app_id,
        account_detail: res.data.account_detail,
        account_status: res.data.account_status
      }
      // 填充额外信息
      if (res.data.extra_info) {
        extraInfo.value = JSON.parse(res.data.extra_info)
      }
      drawerFormVisible.value = true
    }
  } catch (error) {
    console.error('获取账号信息失败:', error)
    ElMessage.error('获取账号信息失败')
  }
}

// 命令处理
const handleCommand = async (command, row) => {
  // 售出的账户不允许任何操作
  if (isAccountSold(row.account_status)) {
    ElMessage.warning('已售出的账户不允许进行此操作')
    return
  }
  // 禁用操作需要输入原因
  if (command === 'ban') {
    openSingleStatusDialog(row, 2)
    return
  }
  if (command === 'setExpired') {
    openSingleStatusDialog(row, 3)
    return
  }
  if (command === 'setRisk') {
    openSingleStatusDialog(row, 4)
    return
  }
  const handlers = {
    ban: () => updateAccountStatusFun(row, 2),
    activate: () => updateAccountStatusFun(row, 1),
    setExpired: () => updateAccountStatusFun(row, 3),
    setRisk: () => updateAccountStatusFun(row, 4),
    delete: () => deleteAccountFun(row)
  }

  const handler = handlers[command]
  if (handler) {
    await handler()
  }
}

// 更新账号状态
const updateAccountStatusFun = async (row, status) => {
  const statusText = getStatusLabel(status)
  try {
    await ElMessageBox.confirm(
        `确定要将账号 ${row.account_no} 设置为"${statusText}"状态吗?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    const res = await batchUpdateAppAccountStatus({
      ids: [row.id],
      status
    })

    if (res.code === 0) {
      ElMessage.success(`设置成功`)
      await getTableData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 删除账号
const deleteAccountFun = async (row) => {

  try {
    await ElMessageBox.confirm(
        `确定要删除账号 ${row.account_no} 吗?删除后无法恢复!`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }
    )
    const res = await deleteAppAccount({ id: row.id })
    if (res.code === 0) {
      ElMessage.success('删除成功')
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
  // 检查是否有已售出的账户
  const soldAccounts = selectedAccounts.value.filter(acc =>
      isAccountSold(acc.account_status)
  )
  if (soldAccounts.length > 0) {
    ElMessage.warning(`已售出的账户不能删除，共 ${soldAccounts.length} 个`)
    return
  }
  try {
    await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedAccounts.value.length} 个账号吗?删除后无法恢复!`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }
    )

    const ids = selectedAccounts.value.map(acc => acc.id)
    const res = await batchDeleteAppAccounts({ ids })

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

// ========== 表单操作 ==========
// 关闭抽屉
const closeDrawer = () => {
  drawerFormVisible.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  form.value = {
    app_id: '',
    account_detail: '',
    account_status: 1
  }

  // 重置额外信息
  Object.assign(extraInfo, {
    vip_level: 0,
    expire_time: '',
    email: '',
    phone: '',
    remarks: ''
  })

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

    const submitData = {
      ...form.value,
      extra_info: JSON.stringify(extraInfo.value)
    }

    const apiMap = {
      create: createAppAccount,
      update: updateAppAccount
    }

    const api = apiMap[type.value] || createAppAccount
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
.account-management {
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
  flex-wrap: wrap;
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
.account-no {
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

.app-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .app-icon {
    flex-shrink: 0;
    width: 50px;
    height: 50px;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #e4e7ed;
  }

  .app-details {
    flex: 1;
    min-width: 0;

    .app-name {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .app-category {
      font-size: 12px;
    }
  }
}

.extra-info-cell {
  font-size: 13px;

  .expire-time {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
  }
}

.text-gray {
  color: #909399;
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

/* ========== 导入样式 ========== */
.import-step {
  padding: 30px 20px;
  min-height: 300px;
}

.import-tips {
  p {
    margin: 8px 0;
    line-height: 1.6;
  }
}

.template-download {
  text-align: center;
  margin-top: 30px;
}

.upload-demo {
  margin: 20px 0;
}

.preview-data {
  margin-top: 24px;
}

.import-result-detail {
  font-size: 16px;

  p {
    margin: 8px 0;
  }
}

.error-list {
  margin-top: 20px;
}

/* ========== 表单样式 ========== */
.app-option {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .app-id {
    font-size: 12px;
    color: #909399;
    margin-left: 12px;
  }
}

.form-tip {
  margin-top: 8px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* ========== 详情样式 ========== */
.account-detail {
  .detail-header {
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    margin-bottom: 24px;

    .header-info {
      color: #fff;

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

  .account-detail-content {
    margin-bottom: 24px;

    .copy-btn-wrapper {
      margin-top: 12px;
      text-align: right;
    }
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
      width: 40px;
      height: 40px;
    }
  }

  .gva-btn-list {
    flex-direction: column;

    .el-button {
      width: 100%;
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

:deep(.el-step__title) {
  font-size: 14px;
}

:deep(.el-upload-dragger) {
  padding: 40px;
}
</style>