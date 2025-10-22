import service from '@/utils/request'

/**
 * 获取谷歌验证器二维码
 * @returns {Promise}
 */
export function getGoogleAuthQrcode() {
    return service({
        url: '/google-auth/qrcode',
        method: 'get'
    })
}

/**
 * 绑定谷歌验证器
 * @param {Object} data
 * @param {string} data.secret - 密钥
 * @param {string} data.code - 验证码
 * @returns {Promise}
 */
export function bindGoogleAuth(data) {
    return service({
        url: '/google-auth/bind',
        method: 'post',
        data
    })
}

