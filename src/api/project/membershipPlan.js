import service from '@/utils/request'

// 获取会员套餐列表
export const getMembershipPlanList = (params) => {
    return service({
        url: '/membershipPlan/getMembershipPlanList',
        method: 'get',
        params
    })
}

// 创建会员套餐
export const createMembershipPlan = (data) => {
    return service({
        url: '/membershipPlan/createMembershipPlan',
        method: 'post',
        data
    })
}

// 根据ID获取会员套餐详情
export const getMembershipPlan = (params) => {
    return service({
        url: '/membershipPlan/findMembershipPlan',
        method: 'get',
        params
    })
}

// 更新会员套餐
export const updateMembershipPlan = (data) => {
    return service({
        url: '/membershipPlan/updateMembershipPlan',
        method: 'put',
        data
    })
}

// 删除会员套餐
export const deleteMembershipPlan = (data) => {
    return service({
        url: '/membershipPlan/deleteMembershipPlan',
        method: 'delete',
        data
    })
}

// 批量删除会员套餐
export const deleteMembershipPlanByIds = (data) => {
    return service({
        url: '/membershipPlan/deleteMembershipPlanByIds',
        method: 'delete',
        data
    })
}

// 获取启用的会员套餐列表（供前端选择使用）
export const getActiveMembershipPlans = (params) => {
    return service({
        url: '/membershipPlan/getActiveMembershipPlans',
        method: 'get',
        params
    })
}

// 根据平台获取会员套餐
export const getMembershipPlansByPlatform = (params) => {
    return service({
        url: '/membershipPlan/getMembershipPlansByPlatform',
        method: 'get',
        params
    })
}

// 切换套餐状态（启用/禁用）
export const toggleMembershipPlanStatus = (data) => {
    return service({
        url: '/membershipPlan/toggleStatus',
        method: 'patch',
        data
    })
}

// 设置推荐状态
export const setMembershipPlanFeatured = (data) => {
    return service({
        url: '/membershipPlan/setFeatured',
        method: 'patch',
        data
    })
}

// 更新排序
export const updateMembershipPlanSort = (data) => {
    return service({
        url: '/membershipPlan/updateSort',
        method: 'patch',
        data
    })
}