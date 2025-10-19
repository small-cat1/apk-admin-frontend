import service from '@/utils/request'

// 获取支付服务商列表
export const getPaymentProviderList = (data) => {
    return service({
        url: '/paymentProvider/getPaymentProviderList',
        method: 'get',
        params: data
    })
}

// 获取单个支付服务商详情
export const getPaymentProvider = (params) => {
    return service({
        url: `/paymentProvider/getPaymentProvider`,
        method: 'get',
        params
    })
}

// 创建支付服务商
export const createPaymentProvider = (data) => {
    return service({
        url: '/paymentProvider/createPaymentProvider',
        method: 'post',
        data
    })
}

// 更新支付服务商
export const updatePaymentProvider = (data) => {
    return service({
        url: `/paymentProvider/updatePaymentProvider`,
        method: 'put',
        data
    })
}



// 删除支付服务商
export const deletePaymentProvider = (data) => {
    return service({
        url: `/paymentProvider/deletePaymentProvider`,
        method: 'delete',
        data
    })
}


// 批量更新支付服务商状态
export const batchUpdatePaymentProviderStatus = (data) => {
    return service({
        url: '/paymentProvider/batch-status',
        method: 'post',
        data
    })
}




// 更新服务商排序
export const updateProviderSortOrder = (data) => {
    return service({
        url: `/paymentProvider/updateProviderSortOrder`,
        method: 'put',
        data
    })
}

