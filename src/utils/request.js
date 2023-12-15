import Qs from 'qs'
import axios from 'axios'
import router from '@/router'
import CoreConsts from '@/components/CoreConsts'
// 当前环境
//作用是判断目前环境是开发环境还是生产环境
//在本地用npm run dev 运行的话，env === true
/*
  后端端口信息：
  1. （TCP服务端调试）用于实现对tcp服务组件的调试    6158
  2. （ModbusTcpForDtu）使用Dtu连网且设备基于标准 MOdbus Rtu协议的iot服务端实现    7058
  3. （ModbusTcpForDtu）使用Dtu连网且设备基于标准 MOdbus Rtu协议的iot服务端实现    7068
  4. （通用DTU服务）支持DYTU+任意设备协议
  5. （WebsocketServer）websocket服务端默认实现    8087
  6. （mian）http                                 8085
 * 
*/
let env = import.meta.env.DEV ? 'dev' : 'prod'

//创建一个包含HTTP、WebSocket、和其他API地址的配置对象
function UrlConfig(httpUrl, websocketUrl, apiUrl) {
  this.httpUrl = httpUrl
  this.apiUrl = apiUrl || httpUrl
  this.websocketUrl = websocketUrl

  this.getApiUrl = function () {
    return this.apiUrl
  }

  this.getBaseURI = function () {
    console.log(this.httpUrl)
    return this.httpUrl
  }

  this.getFullURL = function (url) {
    return this.getBaseURI() + url || ''
  }

  this.getWsBaseURI = function () {
    return this.websocketUrl
  }

  this.getFullWsURL = function (url) {
    return this.getWsBaseURI() + url || ''
  }
}

// //配置

let baseConfig = {
  dev: new UrlConfig('/api', 'ws://localhost:8087', 'http://localhost:8085'),
  // prod: new UrlConfig("http://iot.iteaj.com/api", 'ws://iot.iteaj.com'),
  prod: new UrlConfig('/api', 'ws://localhost'),
  // 成功响应码
  success: 200,
  //消息框消失时间
  duration: 3000,
  //超时时间
  timeout: 20000,
}

/**
 * @type UrlConfig
 */
//根据环境来配置       这里我暂时先默认为生产环境了，因为开发环境API地址都是localhost
let urlConfig = baseConfig['dev']
let baseURL = urlConfig.getBaseURI()
// console.log('base', baseURL);

/**
 * @description 处理code异常
 * @param {*} data
 * @param {*} config
 */

//相应拦截器函数
const handleResponse = (data) => {
  let { code, message } = data
  switch (code) {
    case 401: // 未授权
      router.push({ path: '/login' }).finally(() => {})
      return Promise.reject('')
    case 404:
      return Promise.reject(data)
    default:
      return data
  }
}

//创建axios实例
const instance = axios.create({
  baseURL: baseURL,
  timeout: baseConfig.timeout,
  headers: {
    'x-requested-with': 'XMLHttpRequest', // 声明是ajax请求
    'Content-Type': 'application/json; charset=UTF-8',
  },
  paramsSerializer: (params) => {
    return Qs.stringify(params, { arrayFormat: 'indices', allowDots: true })
  },
})

//请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 如果Storage存在token值, 则将token放到请求头里面
    let item = localStorage.getItem(CoreConsts.AccessToken)
    if (item) {
      config.headers[CoreConsts.AccessToken] = item
    }
    console.log('请求体：')
    console.log(config)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
//响应拦截器
instance.interceptors.response.use(
  (response) => {
    const { data, config, headers } = response
    if (config[CoreConsts.CancelRespResolver]) {
      return response
    }
    console.log('响应体')
    console.log(response)
    return handleResponse(data)
  },
  (error) => {
    const { response, message } = error
    if (response && response.data) {
      const { status, data, config } = response
      return handleResponse({ code: status, message })
    } else {
      let { message } = error
      if (message === 'Network Error') {
        message = '网络连接异常'
      } else if (message.includes('timeout')) {
        message = '接口请求超时'
      } else if (message.includes('Request failed with status code')) {
        const code = message.substr(message.length - 3)
        message = `后端接口[${code}]异常`
      }

      console.error(message || `后端接口异常`)
      return Promise.reject(error)
    }
  }
)

let GET = (url, data, config) => {
  if (config) {
    config['params'] = data
  } else {
    config = { params: data }
  }

  return instance.get(url, config)
}
let PUT = instance.put
let POST = instance.post
let PATCH = instance.patch
let DELETE = instance.delete
export { GET, PUT, POST, PATCH, DELETE, baseURL, instance as http, urlConfig }
