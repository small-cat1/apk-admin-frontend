import service from '@/utils/request'

// 应用管理相关接口

/**
 * 获取应用列表
 * @param {{pageSize: number, page: number}} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.app_name - 应用名称
 * @param {string} params.app_id - 应用ID
 * @param {string} params.country_code - 国家代码
 * @param {string} params.category_id - 分类ID
 * @param {string} params.status - 应用状态
 * @param {string} params.content_rating - 内容分级
 * @returns {Promise}
 */
export const getApplicationList = (params) => {
    return service({
        url: '/application/list',
        method: 'get',
        params
    })
}

/**
 * 获取应用详情
 * @param {Object} data
 * @param {number} data.id - 应用ID
 * @returns {Promise}
 */
export const getApplication = (data) => {
    return service({
        url: '/application/detail',
        method: 'get',
        params: data
    })
}

/**
 * 创建应用
 * @param {Object} data - 应用信息
 * @param {string} data.app_id - 应用唯一标识符
 * @param {string} data.app_name - 应用名称
 * @param {string} data.country_code - 国家代码
 * @param {number} data.category_id - 分类ID
 * @param {number} data.subcategory_id - 子分类ID
 * @param {string} data.app_icon - 应用图标URL
 * @param {string} data.description - 应用描述
 * @param {string} data.website_url - 官方网站
 * @param {string} data.support_url - 支持页面
 * @param {string} data.privacy_policy_url - 隐私政策URL
 * @param {string} data.content_rating - 内容分级
 * @param {string} data.status - 应用状态
 * @returns {Promise}
 */
export const createApplication = (data) => {
    return service({
        url: '/application/create',
        method: 'post',
        data
    })
}

/**
 * 更新应用
 * @param {Object} data - 应用信息
 * @param {number} data.id - 应用ID
 * @param {string} data.app_id - 应用唯一标识符
 * @param {string} data.app_name - 应用名称
 * @param {string} data.country_code - 国家代码
 * @param {number} data.category_id - 分类ID
 * @param {number} data.subcategory_id - 子分类ID
 * @param {string} data.app_icon - 应用图标URL
 * @param {string} data.description - 应用描述
 * @param {string} data.website_url - 官方网站
 * @param {string} data.support_url - 支持页面
 * @param {string} data.privacy_policy_url - 隐私政策URL
 * @param {string} data.content_rating - 内容分级
 * @param {string} data.status - 应用状态
 * @returns {Promise}
 */
export const updateApplication = (data) => {
    return service({
        url: '/application/update',
        method: 'put',
        data
    })
}

/**
 * 删除应用
 * @param {Object} data
 * @param {number} data.id - 应用ID
 * @returns {Promise}
 */
export const deleteApplication = (data) => {
    return service({
        url: '/application/delete',
        method: 'delete',
        data
    })
}

/**
 * 批量删除应用
 * @param {Object} data
 * @param {Array<number>} data.ids - 应用ID数组
 * @returns {Promise}
 */
export const batchDeleteApplications = (data) => {
    return service({
        url: '/application/batch-delete',
        method: 'delete',
        data
    })
}

/**
 * 批量更新应用状态
 * @param {{ids: Identifier[], status: string}} data
 * @param {Array<number>} data.ids - 应用ID数组
 * @param {string} data.status - 目标状态 (active|suspended|deleted)
 * @returns {Promise}
 */
export const batchUpdateApplicationStatus = (data) => {
    return service({
        url: '/application/batch-update-status',
        method: 'put',
        data
    })
}

/**
 * 克隆应用
 * @param {{source_id}} data
 * @param {number} data.id - 源应用ID
 * @returns {Promise}
 */
export const cloneApplication = (data) => {
    return service({
        url: '/application/clone',
        method: 'post',
        data
    })
}


/**
 * 上传应用图标
 * @param {FormData} formData - 包含文件的表单数据
 * @returns {Promise}
 */
export const uploadApplicationIcon = (formData) => {
    return service({
        url: '/application/upload-icon',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

/**
 * 获取应用统计信息
 * @param {Object} params - 查询参数
 * @param {string} params.start_date - 开始日期
 * @param {string} params.end_date - 结束日期
 * @param {string} params.country_code - 国家代码
 * @param {number} params.category_id - 分类ID
 * @returns {Promise}
 */
export const getApplicationStatistics = (params) => {
    return service({
        url: '/application/statistics',
        method: 'get',
        params
    })
}

/**
 * 导出应用列表
 * @param {Object} params - 查询参数
 * @param {string} params.format - 导出格式 (xlsx|csv)
 * @param {string} params.app_name - 应用名称
 * @param {string} params.country_code - 国家代码
 * @param {string} params.category_id - 分类ID
 * @param {string} params.status - 应用状态
 * @returns {Promise}
 */
export const exportApplicationList = (params) => {
    return service({
        url: '/application/export',
        method: 'get',
        params,
        responseType: 'blob'
    })
}

/**
 * 获取应用版本历史
 * @param {Object} params
 * @param {number} params.app_id - 应用ID
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise}
 */
export const getApplicationVersions = (params) => {
    return service({
        url: '/application/versions',
        method: 'get',
        params
    })
}


