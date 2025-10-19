import service from '@/utils/request'

// 获取账号列表
export const getAppAccountList = (params) => {
    return service({
        url: '/appAccount/list',
        method: 'get',
        params
    })
}

// 获取账号详情
export const getAppAccount = (params) => {
    return service({
        url: '/appAccount/detail',
        method: 'get',
        params
    })
}

// 创建账号
export const createAppAccount = (data) => {
    return service({
        url: '/appAccount',
        method: 'post',
        data
    })
}

// 更新账号
export const updateAppAccount = (data) => {
    return service({
        url: '/appAccount',
        method: 'put',
        data
    })
}

// 删除账号
export const deleteAppAccount = (params) => {
    return service({
        url: '/appAccount',
        method: 'delete',
        params
    })
}

// 批量删除账号
export const batchDeleteAppAccounts = (data) => {
    return service({
        url: '/appAccount/batchDelete',
        method: 'delete',
        data
    })
}

export const batchImportAppAccounts = (data) => {
    return service({
        url: '/appAccount/batchImportAppAccounts',
        method: 'post',
        data,
        timeout: 60000 // 导入可能耗时较长，设置60秒超时
    })
}



// 批量更新账号状态
export const batchUpdateAppAccountStatus = (data) => {
    return service({
        url: '/appAccount/batchUpdateStatus',
        method: 'put',
        data
    })
}