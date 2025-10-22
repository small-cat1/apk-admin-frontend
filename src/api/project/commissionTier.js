import service from '@/utils/request'

export function getCommissionTierList(params) {
    return service({
        url: '/commissionTier/list',
        method: 'get',
        params
    })
}

export function getCommissionTier(params) {
    return service({
        url: '/commissionTier/detail',
        method: 'get',
        params
    })
}

export function createCommissionTier(data) {
    return service({
        url: '/commissionTier',
        method: 'post',
        data
    })
}

export function updateCommissionTier(data) {
    return service({
        url: '/commissionTier',
        method: 'put',
        data
    })
}

export function deleteCommissionTier(data) {
    return service({
        url: '/commissionTier',
        method: 'delete',
        data
    })
}



export function updateCommissionTierStatus(data) {
    return service({
        url: '/commissionTier/updateStatus',
        method: 'put',
        data
    })
}

export function updateCommissionTierSort(data) {
    return service({
        url: '/commissionTier/updateSort',
        method: 'put',
        data
    })
}