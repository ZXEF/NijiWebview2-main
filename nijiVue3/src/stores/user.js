import { defineStore } from 'pinia'
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
function toFormData(obj) {
  const params = new URLSearchParams()
  for (const key in obj) {
    if (obj[key] !== undefined && obj[key] !== null) {
      params.append(key, obj[key])
    }
  }
  return params
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: null,
    userInfo: null,
    pairedInfo: null,
    diaries: [],
    pairedDiaries: [],
    userId: null,
    pairedId: null
  }),

  actions: {
    // 登录方法
    async login(email, password) {
      try {
        const formData = toFormData({ email, password })
        const response = await api.post('/login/', formData)
        console.log('Login response:', response.data)

        if (response.data && response.data.token && response.data.error === 0) {
          this.token = response.data.token
          this.userId = response.data.userid
          this.userInfo = response.data.user_config
          this.pairedInfo = response.data.user_config.paired_user_config || null
          
          // 设置全局请求头
          api.defaults.headers.common['auth'] = 'token ' + this.token
          api.defaults.headers.common['User-Agent'] = 'OhApp/3.0 Platform/Android'
          
          // 登录成功后同步数据
          await this.syncData()
          return true
        }
        return false
      } catch (error) {
        console.error('Login failed:', error)
        return false
      }
    },

    // 同步数据
    async syncData() {
      try {
        const formData = toFormData({
          user_config_ts: 0,
          diaries_ts: 0,
          readmark_ts: 0,
          images_ts: 0
        })
        const response = await api.post('/v2/sync/', formData)

        if (response.data && response.data.error === 0) {
          this.userInfo = response.data.user_config
          this.pairedInfo = response.data.user_config.paired_user_config || null
          this.diaries = response.data.diaries || []
          this.pairedDiaries = response.data.diaries_paired || []
          this.userId = response.data.user_config.userid
          this.pairedId = response.data.user_config.paired_user_config?.userid
          return true
        }
        return false
      } catch (error) {
        console.error('Sync failed:', error)
        return false
      }
    },

    // 写日记
    async writeDiary(date, title, content) {
      try {
        const formData = toFormData({
          date,
          title,
          content
        })
        const response = await api.post('/write/', formData)
        
        if (response.data && response.data.error === 0) {
          await this.syncData()
          return 'Success'
        }
        return 'error'
      } catch (error) {
        console.error('Write diary failed:', error)
        return 'error'
      }
    },

    // 获取日记详情
    async getDiary(ownerID, diaryID) {
      try {
        const formData = toFormData({ diary_ids: diaryID })
        const response = await api.post(`/diary/all_by_ids/${ownerID}/`, formData)
        
        if (response.data && response.data.error === 0 && response.data.diaries?.[0]) {
          return response.data.diaries[0]
        }
        return 'error'
      } catch (error) {
        console.error('Get diary failed:', error)
        return 'error'
      }
    }
  }
}) 