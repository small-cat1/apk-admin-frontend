import './style/element_visiable.scss'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'uno.css';
import { createApp } from 'vue'
import ElementPlus from 'element-plus'

import 'element-plus/dist/index.css'
import './core/apk-admin'
import router from '@/router/index'
import '@/permission'
import run from '@/core/apk-admin.js'
import auth from '@/directive/auth'
import { store } from '@/pinia'
import App from './App.vue'

const app = createApp(App)
app.config.productionTip = false

app.use(run).use(ElementPlus).use(store).use(auth).use(router).mount('#app')
export default app