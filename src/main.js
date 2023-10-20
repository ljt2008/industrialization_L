import {createApp, reactive, computed} from 'vue'
import App from './App.vue'
import store from "@/store";
import Router from './router'
import {http, urlConfig} from "@/utils/request"
// import '@/doc' // 文档教程 不需要请注释掉
import 'ant-design-vue/dist/reset.css'
import Antd, {message, notification} from 'ant-design-vue'
import IvzComponents from '@/components'
import Authority from '@/components/directive/authority'
import {createFromIconfontCN} from '@ant-design/icons-vue';

// 项目中使用到的图标
const UIcon = createFromIconfontCN({
    extraCommonProps: {style: {fontSize: '15px'}},
    scriptUrl: '/icon/iconfont.js',
    // scriptUrl: '//at.alicdn.com/t/c/font_1174643_b18422r6b47.js',
});

let app = createApp(App).use(Router).use(Antd).use(store)
    .use(IvzComponents).component("UIcon", UIcon)
    .directive('auth', Authority)


app.config.globalProperties.$http = http
app.config.globalProperties.$env=urlConfig
app.config.globalProperties.$msg = message
app.config.globalProperties.$notify = notification
app.config.globalProperties.$apiUrl=urlConfig.httpUrl

app.mount('#app')
