import axios from 'axios'

// 创建axios实例并设置默认配置
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'OhApp/3.0 Platform/Android'
  },
  withCredentials: false
})

// 将对象转换为x-www-form-urlencoded格式
export function toFormData(obj: Record<string, any>) {
  const params = new URLSearchParams()
  for (const key in obj) {
    if (obj[key] !== undefined && obj[key] !== null) {
      params.append(key, obj[key])
    }
  }
  return params
}

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['auth'] = 'token ' + token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 添加响应拦截器，用于调试
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response)
    return response
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default api 