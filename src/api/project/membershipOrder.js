import service from '@/utils/request'

// @Tags MembershipOrder
// @Summary 分页获取会员订单列表
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query request.PageInfo true "分页获取会员订单列表"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /membershipOrder/getMembershipOrderList [get]
export const getMembershipOrderList = (data) => {
    return service({
        url: '/membershipOrder/getMembershipOrderList',
        method: 'get',
        params: data
    })
}

// @Tags MembershipOrder
// @Summary 用id查询会员订单
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query project.MembershipOrder true "用id查询会员订单"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"查询成功"}"
// @Router /membershipOrder/findMembershipOrder [get]
export const getMembershipOrder = (params) => {
    return service({
        url: '/membershipOrder/findMembershipOrder',
        method: 'get',
        params
    })
}

// @Tags MembershipOrder
// @Summary 根据订单号查询会员订单
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param orderNo query string true "订单号"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"查询成功"}"
// @Router /membershipOrder/findMembershipOrderByOrderNo [get]
export const getMembershipOrderByOrderNo = (params) => {
    return service({
        url: '/membershipOrder/findMembershipOrderByOrderNo',
        method: 'get',
        params
    })
}

// @Tags MembershipOrder
// @Summary 更新会员订单备注/标记
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.UpdateOrderRemarkReq true "更新会员订单备注"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"更新成功"}"
// @Router /membershipOrder/updateMembershipOrderRemark [put]
export const updateMembershipOrderRemark = (data) => {
    return service({
        url: '/membershipOrder/updateMembershipOrderRemark',
        method: 'put',
        data
    })
}

// @Tags MembershipOrder
// @Summary 取消会员订单
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.CancelOrderReq true "取消会员订单"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"取消成功"}"
// @Router /membershipOrder/cancelMembershipOrder [put]
export const cancelMembershipOrder = (data) => {
    return service({
        url: '/membershipOrder/cancelMembershipOrder',
        method: 'put',
        data
    })
}

// @Tags MembershipOrder
// @Summary 批量取消会员订单
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.IdsReq true "批量取消会员订单"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"取消成功"}"
// @Router /membershipOrder/batchCancelMembershipOrders [put]
export const batchCancelMembershipOrders = (data) => {
    return service({
        url: '/membershipOrder/batchCancelMembershipOrders',
        method: 'put',
        data
    })
}

// @Tags MembershipOrder
// @Summary 申请退款会员订单
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.RefundOrderReq true "申请退款会员订单"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"退款申请提交成功"}"
// @Router /membershipOrder/refundMembershipOrder [put]
export const refundMembershipOrder = (data) => {
    return service({
        url: '/membershipOrder/refundMembershipOrder',
        method: 'put',
        data
    })
}

// @Tags MembershipOrder
// @Summary 手动确认支付
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.ConfirmPaymentReq true "手动确认支付"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"支付确认成功"}"
// @Router /membershipOrder/confirmPayment [put]
export const confirmPayment = (data) => {
    return service({
        url: '/membershipOrder/confirmPayment',
        method: 'put',
        data
    })
}

// @Tags MembershipOrder
// @Summary 处理支付回调
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.PaymentCallbackReq true "处理支付回调"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"回调处理成功"}"
// @Router /membershipOrder/handlePaymentCallback [post]
export const handlePaymentCallback = (data) => {
    return service({
        url: '/membershipOrder/handlePaymentCallback',
        method: 'post',
        data
    })
}

// @Tags MembershipOrder
// @Summary 获取订单统计信息
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query request.OrderStatsReq true "获取订单统计信息"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /membershipOrder/getOrderStats [get]
export const getOrderStats = (params) => {
    return service({
        url: '/membershipOrder/getOrderStats',
        method: 'get',
        params
    })
}

// @Tags MembershipOrder
// @Summary 获取用户订单历史
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query request.UserOrderHistoryReq true "获取用户订单历史"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /membershipOrder/getUserOrderHistory [get]
export const getUserOrderHistory = (params) => {
    return service({
        url: '/membershipOrder/getUserOrderHistory',
        method: 'get',
        params
    })
}

// @Tags MembershipOrder
// @Summary 导出订单数据
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query request.ExportOrderReq true "导出订单数据"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"导出成功"}"
// @Router /membershipOrder/exportOrders [get]
export const exportOrders = (params) => {
    return service({
        url: '/membershipOrder/exportOrders',
        method: 'get',
        params,
        responseType: 'blob'
    })
}

// @Tags MembershipOrder
// @Summary 验证订单有效性
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.ValidateOrderReq true "验证订单有效性"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"验证成功"}"
// @Router /membershipOrder/validateOrder [post]
export const validateOrder = (data) => {
    return service({
        url: '/membershipOrder/validateOrder',
        method: 'post',
        data
    })
}

// @Tags MembershipOrder
// @Summary 获取支付方式列表
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Success 200 {string} string "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /membershipOrder/getPaymentMethods [get]
export const getPaymentMethods = () => {
    return service({
        url: '/membershipOrder/getPaymentMethods',
        method: 'get'
    })
}

// @Tags MembershipOrder
// @Summary 获取订单操作日志
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query request.OrderLogReq true "获取订单操作日志"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /membershipOrder/getOrderLogs [get]
export const getOrderLogs = (params) => {
    return service({
        url: '/membershipOrder/getOrderLogs',
        method: 'get',
        params
    })
}

// @Tags MembershipOrder
// @Summary 手动处理异常订单
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.ManualProcessOrderReq true "手动处理异常订单"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"处理成功"}"
// @Router /membershipOrder/manualProcessOrder [post]
export const manualProcessOrder = (data) => {
    return service({
        url: '/membershipOrder/manualProcessOrder',
        method: 'post',
        data
    })
}

// @Tags MembershipOrder
// @Summary 获取退款详情
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query request.RefundDetailReq true "获取退款详情"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /membershipOrder/getRefundDetail [get]
export const getRefundDetail = (params) => {
    return service({
        url: '/membershipOrder/getRefundDetail',
        method: 'get',
        params
    })
}

// @Tags MembershipOrder
// @Summary 查询第三方支付状态
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.QueryPaymentStatusReq true "查询第三方支付状态"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"查询成功"}"
// @Router /membershipOrder/syncPaymentStatus [post]
export const syncPaymentStatus = (data) => {
    return service({
        url: '/membershipOrder/syncPaymentStatus',
        method: 'post',
        data
    })
}

// @Tags MembershipOrder
// @Summary 获取订单收据
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data query request.OrderReceiptReq true "获取订单收据"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"获取成功"}"
// @Router /membershipOrder/getOrderReceipt [get]
export const getOrderReceipt = (params) => {
    return service({
        url: '/membershipOrder/getOrderReceipt',
        method: 'get',
        params
    })
}

// @Tags MembershipOrder
// @Summary 发送订单通知
// @Security ApiKeyAuth
// @accept application/json
// @Produce application/json
// @Param data body request.SendOrderNotificationReq true "发送订单通知"
// @Success 200 {string} string "{"success":true,"data":{},"msg":"通知发送成功"}"
// @Router /membershipOrder/sendOrderNotification [post]
export const sendOrderNotification = (data) => {
    return service({
        url: '/membershipOrder/sendOrderNotification',
        method: 'post',
        data
    })
}