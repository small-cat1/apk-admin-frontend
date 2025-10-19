import './style/element_visiable.scss'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'uno.css';
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import { Icon } from 'vant'
// 修改这行：只导入 Icon 组件的样式，而不是全部样式
import 'vant/es/icon/style'

import 'element-plus/dist/index.css'
import './core/gin-vue-admin'
import router from '@/router/index'
import '@/permission'
import run from '@/core/gin-vue-admin.js'
import auth from '@/directive/auth'
import { store } from '@/pinia'
import App from './App.vue'

const app = createApp(App)
app.config.productionTip = false

app.use(run).use(Icon).use(ElementPlus).use(store).use(auth).use(router).mount('#app')
export default app