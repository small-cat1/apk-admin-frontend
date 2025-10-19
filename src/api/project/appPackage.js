import service from '@/utils/request'

// 获取应用安装包列表
export const getAppPackageList = (params) => {
  return service({
    url: '/appPackage/list',
    method: 'get',
    params
  })
}

// 获取单个应用安装包详情
export const getAppPackage = (params) => {
  return service({
    url: '/appPackage/detail',
    method: 'get',
    params
  })
}

// 创建应用安装包
export const createAppPackage = (data) => {
  return service({
    url: '/appPackage/create',
    method: 'post',
    data
  })
}

// 更新应用安装包
export const updateAppPackage = (data) => {
  return service({
    url: '/appPackage/update',
    method: 'put',
    data
  })
}

// 删除应用安装包
export const deleteAppPackage = (data) => {
  return service({
    url: '/appPackage/delete',
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
export const batchUpdateAppPackageStatus = (data) => {
  return service({
    url: '/appPackage/batch-update-status',
    method: 'put',
    data
  })
}

// 暂停应用包
export const suspendPackage = (data) => {
  return service({
    url: '/appPackage/suspend',
    method: 'post',
    data
  })
}


// 获取应用包统计数据
export const getPackageStats = (params) => {
  return service({
    url: '/appPackage/stats',
    method: 'get',
    params
  })
}


// 获取应用包下载链接
export const getDownloadUrl = (params) => {
  return service({
    url: '/appPackage/downloadUrl',
    method: 'get',
    params
  })
}