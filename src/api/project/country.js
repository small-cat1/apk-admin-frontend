import service from '@/utils/request'


export const createCountry = (data) => {
    return service({
        url: '/country/country',
        method: 'post',
        data
    })
}


export const updateCountry = (data) => {
    return service({
        url: '/country/country',
        method: 'put',
        data
    })
}

export const deleteCountry = (data) => {
    return service({
        url: '/country/country',
        method: 'delete',
        data
    })
}
export const getCountry = (params) => {
    return service({
        url: '/country/country',
        method: 'get',
        params
    })
}

export const getCountryList = (params) => {
    return service({
        url: '/country/countryList',
        method: 'get',
        params
    })
}