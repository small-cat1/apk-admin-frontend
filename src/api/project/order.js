// 获取账号详情
import service from "@/utils/request.js";

export const getAppAccountOrder = (params) => {
    return service({
        url: '/appAccount/order',
        method: 'get',
        params
    })
}
