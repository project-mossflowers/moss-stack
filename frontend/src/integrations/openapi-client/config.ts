import { client } from '../../api/client.gen'

/**
 * 安全地获取存储的访问令牌
 */
function getStoredToken(): string | null {
  try {
    return localStorage.getItem('access_token')
  } catch (error) {
    console.warn('Failed to access localStorage:', error)
    return null
  }
}

/**
 * 配置 API 客户端
 */
export function configureApiClient() {
  const BASE_URL = import.meta.env.VITE_API_URL

  // 设置基础配置
  client.setConfig({
    baseURL: BASE_URL,
  })

  // 配置请求拦截器处理认证
  client.instance.interceptors.request.use(
    (config) => {
      const token = getStoredToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      } else {
        delete config.headers.Authorization
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  // 可选：配置响应拦截器处理认证错误
  client.instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // 处理认证失败，清除无效token
        localStorage.removeItem('access_token')
        // 可以在这里触发重定向到登录页
      }
      return Promise.reject(error)
    },
  )
}
