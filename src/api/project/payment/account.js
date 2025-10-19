import service from '@/utils/request'

// 获取支付账号列表
export const getPaymentAccountList = (params) => {
    return service({
        url: '/paymentAccounts',
        method: 'get',
        params
    })
}

// 获取单个支付账号详情
export const getPaymentAccount = (params) => {
    return service({
        url: '/paymentAccounts/detail',
        method: 'get',
        params
    })
}

// 创建支付账号
export const createPaymentAccount = (data) => {
    return service({
        url: '/paymentAccounts',
        method: 'post',
        data
    })
}

// 更新支付账号
export const updatePaymentAccount = (data) => {
    return service({
        url: '/paymentAccounts',
        method: 'put',
        data
    })
}

// 删除支付账号
export const deletePaymentAccount = (data) => {
    return service({
        url: '/paymentAccounts',
        method: 'delete',
        data
    })
}


// 更新账号权重
export const updateAccountWeight = (data) => {
    return service({
        url: '/paymentAccounts/weight',
        method: 'put',
        data
    })
}



// 重置日交易金额
export const resetDailyAmount = (data) => {
    return service({
        url: '/paymentAccounts/reset-daily',
        method: 'put',
        data
    })
}

// 获取账号交易统计
export const getAccountStatistics = (params) => {
    return service({
        url: '/paymentAccounts/statistics',
        method: 'get',
        params
    })
}

// 获取账号交易记录
export const getAccountTransactions = (params) => {
    return service({
        url: '/paymentAccounts/transactions',
        method: 'get',
        params
    })
}

// 测试账号连接
export const testAccountConnection = (data) => {
    return service({
        url: '/paymentAccounts/test-connection',
        method: 'post',
        data
    })
}

// 同步账号余额
export const syncAccountBalance = (data) => {
    return service({
        url: '/paymentAccounts/sync-balance',
        method: 'post',
        data
    })
}

// 获取账号配置模板
export const getAccountConfigTemplate = (params) => {
    return service({
        url: '/paymentAccounts/config-template',
        method: 'get',
        params
    })
}

// 验证账号配置
export const validateAccountConfig = (data) => {
    return service({
        url: '/paymentAccounts/validate-config',
        method: 'post',
        data
    })
}

// 获取账号可用性状态
export const getAccountAvailability = (params) => {
    return service({
        url: '/paymentAccounts/availability',
        method: 'get',
        params
    })
}

// 设置账号维护模式
export const setAccountMaintenance = (data) => {
    return service({
        url: '/paymentAccounts/maintenance',
        method: 'put',
        data
    })
}

// 获取账号操作日志
export const getAccountOperationLogs = (params) => {
    return service({
        url: '/paymentAccounts/operation-logs',
        method: 'get',
        params
    })
}

// 导出账号数据
export const exportAccountData = (params) => {
    return service({
        url: '/paymentAccounts/export',
        method: 'get',
        params,
        responseType: 'blob'
    })
}

// 导入账号数据
export const importAccountData = (data) => {
    return service({
        url: '/paymentAccounts/import',
        method: 'post',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

// 获取账号分组列表
export const getAccountGroups = () => {
    return service({
        url: '/paymentAccounts/groups',
        method: 'get'
    })
}

// 创建账号分组
export const createAccountGroup = (data) => {
    return service({
        url: '/paymentAccounts/groups',
        method: 'post',
        data
    })
}

// 更新账号分组
export const updateAccountGroup = (data) => {
    return service({
        url: '/paymentAccounts/groups',
        method: 'put',
        data
    })
}

// 删除账号分组
export const deleteAccountGroup = (data) => {
    return service({
        url: '/paymentAccounts/groups',
        method: 'delete',
        data
    })
}

// 批量分配账号到分组
export const batchAssignAccountsToGroup = (data) => {
    return service({
        url: '/paymentAccounts/batch-assign-group',
        method: 'put',
        data
    })
}

// 获取账号标签列表
export const getAccountTags = () => {
    return service({
        url: '/paymentAccounts/tags',
        method: 'get'
    })
}

// 批量添加标签
export const batchAddAccountTags = (data) => {
    return service({
        url: '/paymentAccounts/batch-add-tags',
        method: 'put',
        data
    })
}

// 批量移除标签
export const batchRemoveAccountTags = (data) => {
    return service({
        url: '/paymentAccounts/batch-remove-tags',
        method: 'put',
        data
    })
}

// 获取账号健康状态
export const getAccountHealthStatus = (params) => {
    return service({
        url: '/paymentAccounts/health-status',
        method: 'get',
        params
    })
}

// 执行账号健康检查
export const performAccountHealthCheck = (data) => {
    return service({
        url: '/paymentAccounts/health-check',
        method: 'post',
        data
    })
}

// 获取账号使用率统计
export const getAccountUsageStatistics = (params) => {
    return service({
        url: '/paymentAccounts/usage-statistics',
        method: 'get',
        params
    })
}

// 获取热门支付方式统计
export const getPopularPaymentMethods = (params) => {
    return service({
        url: '/paymentAccounts/popular-methods',
        method: 'get',
        params
    })
}

// 获取地区分布统计
export const getRegionDistribution = (params) => {
    return service({
        url: '/paymentAccounts/region-distribution',
        method: 'get',
        params
    })
}

// 获取账号性能指标
export const getAccountPerformanceMetrics = (params) => {
    return service({
        url: '/paymentAccounts/performance-metrics',
        method: 'get',
        params
    })
}

// 设置账号告警规则
export const setAccountAlertRules = (data) => {
    return service({
        url: '/paymentAccounts/alert-rules',
        method: 'put',
        data
    })
}

// 获取账号告警规则
export const getAccountAlertRules = (params) => {
    return service({
        url: '/paymentAccounts/alert-rules',
        method: 'get',
        params
    })
}

// 获取账号告警记录
export const getAccountAlerts = (params) => {
    return service({
        url: '/paymentAccounts/alerts',
        method: 'get',
        params
    })
}

// 确认告警
export const acknowledgeAccountAlert = (data) => {
    return service({
        url: '/paymentAccounts/alerts/acknowledge',
        method: 'put',
        data
    })
}

// 获取账号备份列表
export const getAccountBackups = (params) => {
    return service({
        url: '/paymentAccounts/backups',
        method: 'get',
        params
    })
}

// 创建账号备份
export const createAccountBackup = (data) => {
    return service({
        url: '/paymentAccounts/backups',
        method: 'post',
        data
    })
}

// 恢复账号备份
export const restoreAccountBackup = (data) => {
    return service({
        url: '/paymentAccounts/backups/restore',
        method: 'post',
        data
    })
}

// 删除账号备份
export const deleteAccountBackup = (data) => {
    return service({
        url: '/paymentAccounts/backups',
        method: 'delete',
        data
    })
}