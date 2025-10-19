import service from '@/utils/request'


export const createCategory = (data) => {
    return service({
        url: '/category/category',
        method: 'post',
        data
    })
}
    

export const updateCategory = (data) => {
    return service({
        url: '/category/category',
        method: 'put',
        data
    })
}

export const deleteCategory = (data) => {
  return service({
    url: '/category/category',
    method: 'delete',
    data
  })
}
export const getCategory = (params) => {
    return service({
        url: '/category/category',
        method: 'get',
        params
    })
}

export const getCategoryList = (params) => {
    return service({
        url: '/category/categoryList',
        method: 'get',
        params
    })
}

export const getSelectCategory = (params) => {
    return service({
        url: '/category/selectCategory',
        method: 'get',
        params
    })
}


