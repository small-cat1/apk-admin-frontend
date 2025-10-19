import service from '@/utils/request'

// 获取公告列表
export const getAnnouncementList = (params) => {
    return service({
        url: '/announcement/getAnnouncementList',
        method: 'get',
        params
    })
}

// 创建公告
export const createAnnouncement = (data) => {
    return service({
        url: '/announcement/createAnnouncement',
        method: 'post',
        data
    })
}

// 更新公告
export const updateAnnouncement = (data) => {
    return service({
        url: '/announcement/updateAnnouncement',
        method: 'put',
        data
    })
}

// 删除公告
export const deleteAnnouncement = (data) => {
    return service({
        url: '/announcement/deleteAnnouncement',
        method: 'delete',
        data
    })
}



// 查询公告详情
export const findAnnouncement = (params) => {
    return service({
        url: '/announcement/findAnnouncement',
        method: 'get',
        params
    })
}