// /api/project/user.js
import service from '@/utils/request'

// 获取用户列表
export const getUserList = (params) => {
    return service({
        url: '/user/getUserList',
        method: 'get',
        params
    })
}

// 获取用户详情
export const getUser = (data) => {
    return service({
        url: `/user/getUser/${data.id}`,
        method: 'get',
    })
}

// 创建用户
export const createUser = (data) => {
    return service({
        url: '/user/createUser',
        method: 'post',
        data
    })
}

// 更新用户
export const updateUser = (data) => {
    return service({
        url: '/user/updateUser',
        method: 'put',
        data
    })
}

// 删除用户
export const deleteUser = (data) => {
    return service({
        url: `/user/removeUser`,
        method: 'delete',
        data
    })
}

// 批量删除用户
export const batchDeleteUsers = (data) => {
    return service({
        url: '/user/batchDeleteUsers',
        method: 'post',
        data
    })
}

// 批量更新用户状态
export const batchUpdateUserStatus = (data) => {
    return service({
        url: '/user/batchUpdateUserStatus',
        method: 'post',
        data
    })
}

// 重置用户密码
export const resetUserPassword = (data) => {
    return service({
        url: '/user/resetUserPassword',
        method: 'post',
        data
    })
}

// 获取用户会员记录
export const getUserMemberships = (data) => {
    return service({
        url: `/user/getUserMemberships/${data.userId}`,
        method: 'get'
    })
}

// 获取用户订单记录
export const getUserOrders = (data) => {
    return service({
        url: `/user/getUserOrders/${data.userId}`,
        method: 'get'
    })
}

// 获取用户统计信息
export const getUserStats = (params) => {
    return service({
        url: '/user/getUserStats',
        method: 'get',
        params
    })
}

// 验证用户名是否可用
export const checkUsernameAvailable = (data) => {
    return service({
        url: '/user/checkUsernameAvailable',
        method: 'post',
        data
    })
}

// 验证邮箱是否可用
export const checkEmailAvailable = (data) => {
    return service({
        url: '/user/checkEmailAvailable',
        method: 'post',
        data
    })
}

// 发送邮箱验证码
export const sendEmailVerification = (data) => {
    return service({
        url: '/user/sendEmailVerification',
        method: 'post',
        data
    })
}

// 发送手机验证码
export const sendPhoneVerification = (data) => {
    return service({
        url: '/user/sendPhoneVerification',
        method: 'post',
        data
    })
}

// 验证邮箱验证码
export const verifyEmail = (data) => {
    return service({
        url: '/user/verifyEmail',
        method: 'post',
        data
    })
}

// 验证手机验证码
export const verifyPhone = (data) => {
    return service({
        url: '/user/verifyPhone',
        method: 'post',
        data
    })
}

// 获取用户活动日志
export const getUserActivityLog = (data) => {
    return service({
        url: `/user/getUserActivityLog/${data.userId}`,
        method: 'get',
        params: data.params
    })
}

// 锁定用户账户
export const lockUserAccount = (data) => {
    return service({
        url: '/user/lockUserAccount',
        method: 'post',
        data
    })
}

// 解锁用户账户
export const unlockUserAccount = (data) => {
    return service({
        url: '/user/unlockUserAccount',
        method: 'post',
        data
    })
}

// 强制用户下线
export const forceUserOffline = (data) => {
    return service({
        url: '/user/forceUserOffline',
        method: 'post',
        data
    })
}

// 导出用户数据
export const exportUserData = (params) => {
    return service({
        url: '/user/exportUserData',
        method: 'get',
        params,
        responseType: 'blob'
    })
}

// 导入用户数据
export const importUserData = (data) => {
    return service({
        url: '/user/importUserData',
        method: 'post',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

// 获取用户设备列表
export const getUserDevices = (data) => {
    return service({
        url: `/user/getUserDevices/${data.userId}`,
        method: 'get'
    })
}

// 踢出用户设备
export const kickUserDevice = (data) => {
    return service({
        url: '/user/kickUserDevice',
        method: 'post',
        data
    })
}

// 获取用户推荐记录
export const getUserReferrals = (data) => {
    return service({
        url: `/user/getUserReferrals/${data.userId}`,
        method: 'get',
        params: data.params
    })
}

// 生成用户推荐码
export const generateReferralCode = (data) => {
    return service({
        url: '/user/generateReferralCode',
        method: 'post',
        data
    })
}

// 设置用户权限
export const setUserPermissions = (data) => {
    return service({
        url: '/user/setUserPermissions',
        method: 'post',
        data
    })
}

// 获取用户权限
export const getUserPermissions = (data) => {
    return service({
        url: `/user/getUserPermissions/${data.userId}`,
        method: 'get'
    })
}

// 用户数据迁移
export const migrateUserData = (data) => {
    return service({
        url: '/user/migrateUserData',
        method: 'post',
        data
    })
}

// 合并用户账户
export const mergeUserAccounts = (data) => {
    return service({
        url: '/user/mergeUserAccounts',
        method: 'post',
        data
    })
}

// 恢复已删除用户
export const restoreDeletedUser = (data) => {
    return service({
        url: '/user/restoreDeletedUser',
        method: 'post',
        data
    })
}

// 彻底删除用户
export const permanentDeleteUser = (data) => {
    return service({
        url: '/user/permanentDeleteUser',
        method: 'delete',
        data
    })
}

// 用户数据分析
export const analyzeUserData = (params) => {
    return service({
        url: '/user/analyzeUserData',
        method: 'get',
        params
    })
}

// 获取用户行为分析
export const getUserBehaviorAnalysis = (data) => {
    return service({
        url: `/user/getUserBehaviorAnalysis/${data.userId}`,
        method: 'get',
        params: data.params
    })
}

// 用户标签管理
export const addUserTag = (data) => {
    return service({
        url: '/user/addUserTag',
        method: 'post',
        data
    })
}

export const removeUserTag = (data) => {
    return service({
        url: '/user/removeUserTag',
        method: 'post',
        data
    })
}

export const getUserTags = (data) => {
    return service({
        url: `/user/getUserTags/${data.userId}`,
        method: 'get'
    })
}

// 用户搜索建议
export const getUserSearchSuggestions = (params) => {
    return service({
        url: '/user/getUserSearchSuggestions',
        method: 'get',
        params
    })
}

// 高级搜索
export const advancedUserSearch = (data) => {
    return service({
        url: '/user/advancedUserSearch',
        method: 'post',
        data
    })
}

// 用户关系管理
export const getUserRelationships = (data) => {
    return service({
        url: `/user/getUserRelationships/${data.userId}`,
        method: 'get'
    })
}

// 获取用户等级信息
export const getUserLevel = (data) => {
    return service({
        url: `/user/getUserLevel/${data.userId}`,
        method: 'get'
    })
}

// 更新用户等级
export const updateUserLevel = (data) => {
    return service({
        url: '/user/updateUserLevel',
        method: 'post',
        data
    })
}