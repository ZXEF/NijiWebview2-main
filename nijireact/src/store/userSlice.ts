import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api, { toFormData } from '../utils/api'

interface Diary {
  id: number
  title: string
  content: string
  createddate: string
  createdtime: number
  user: number
  space: string
  ts: number
  mood?: string
  weather?: string
  is_simple?: number
}

interface UserState {
  token: string | null
  userInfo: {
    userid: number
    role: string
    paired_user_config?: {
      userid: number
      role: string
    }
  } | null
  pairedInfo: {
    userid: number
    role: string
  } | null
  diaries: Diary[]
  pairedDiaries: Diary[]
  userId: number | null
  pairedId: number | null
  loading: boolean
  detailLoading: boolean
  error: string | null
}

const initialState: UserState = {
  token: localStorage.getItem('token'),
  userInfo: null,
  pairedInfo: null,
  diaries: [],
  pairedDiaries: [],
  userId: null,
  pairedId: null,
  loading: false,
  detailLoading: false,
  error: null
}

// 登录
export const login = createAsyncThunk(
  'user/login',
  async (credentials: { email: string; password: string }, { dispatch }) => {
    try {
      const formData = toFormData({ email: credentials.email, password: credentials.password })
      const response = await api.post('/login/', formData)

      if (response.data && response.data.token && response.data.error === 0) {
        const { token, userid, user_config } = response.data
        
        // 保存 token 到 localStorage
        localStorage.setItem('token', token)
        
        // 设置请求头
        api.defaults.headers.common['auth'] = 'token ' + token
        api.defaults.headers.common['User-Agent'] = 'OhApp/3.0 Platform/Android'
        
        // 登录成功后同步数据
        await dispatch(syncData())
        
        return {
          token,
          userId: userid,
          userInfo: user_config,
          pairedInfo: user_config.paired_user_config || null,
          pairedId: user_config.paired_user_config?.userid || null
        }
      }
      throw new Error('登录失败')
    } catch (error: any) {
      console.error('Login failed:', error)
      throw error
    }
  }
)

// 同步数据
export const syncData = createAsyncThunk(
  'user/syncData',
  async () => {
    try {
      const formData = toFormData({
        user_config_ts: 0,
        diaries_ts: 0,
        readmark_ts: 0,
        images_ts: 0
      })
      const response = await api.post('/v2/sync/', formData)

      if (response.data && response.data.error === 0) {
        return {
          userInfo: response.data.user_config,
          pairedInfo: response.data.user_config.paired_user_config || null,
          diaries: response.data.diaries || [],
          pairedDiaries: response.data.diaries_paired || [],
          userId: response.data.user_config.userid,
          pairedId: response.data.user_config.paired_user_config?.userid || null
        }
      }
      throw new Error('同步失败')
    } catch (error: any) {
      console.error('Sync failed:', error)
      throw error
    }
  }
)

// 写日记
export const writeDiary = createAsyncThunk(
  'user/writeDiary',
  async (diary: { 
    date: string
    title: string
    content: string
    diary_id?: number // 添加可选的diary_id参数
  }, { dispatch }) => {
    try {
      const formData = toFormData({
        ...diary,
        diary_id: diary.diary_id || undefined // 如果有diary_id，则传入
      })
      const response = await api.post('/write/', formData)
      
      if (response.data && response.data.error === 0) {
        // 写日记成功后同步数据
        await dispatch(syncData())
        return 'Success'
      }
      throw new Error('写日记失败')
    } catch (error: any) {
      console.error('Write diary failed:', error)
      throw error
    }
  }
)

// 获取日记详情
export const getDiaryDetail = createAsyncThunk(
  'user/getDiaryDetail',
  async ({ ownerID, diaryID }: { ownerID: number; diaryID: number }) => {
    try {
      const formData = toFormData({ diary_ids: diaryID })
      const response = await api.post(`/diary/all_by_ids/${ownerID}/`, formData)
      
      if (response.data && response.data.error === 0) {
        return response.data
      }
      throw new Error('获取日记详情失败')
    } catch (error: any) {
      console.error('Get diary failed:', error)
      throw error
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null
      state.userInfo = null
      state.pairedInfo = null
      state.diaries = []
      state.pairedDiaries = []
      state.userId = null
      state.pairedId = null
      // 清除 localStorage 中的 token
      localStorage.removeItem('token')
      // 清除请求头
      delete api.defaults.headers.common['auth']
      delete api.defaults.headers.common['User-Agent']
    }
  },
  extraReducers: (builder) => {
    builder
      // 登录
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.userId = action.payload.userId
        state.userInfo = action.payload.userInfo
        state.pairedInfo = action.payload.pairedInfo
        state.pairedId = action.payload.pairedId
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || '登录失败'
      })
      // 同步数据
      .addCase(syncData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(syncData.fulfilled, (state, action) => {
        state.loading = false
        state.userInfo = action.payload.userInfo
        state.pairedInfo = action.payload.pairedInfo
        state.diaries = action.payload.diaries
        state.pairedDiaries = action.payload.pairedDiaries
        state.userId = action.payload.userId
        state.pairedId = action.payload.pairedId
      })
      .addCase(syncData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || '同步失败'
      })
      // 写日记
      .addCase(writeDiary.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(writeDiary.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(writeDiary.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || '写日记失败'
      })
      // 获取日记详情
      .addCase(getDiaryDetail.pending, (state) => {
        state.detailLoading = true
        state.error = null
      })
      .addCase(getDiaryDetail.fulfilled, (state, action) => {
        state.detailLoading = false
        // 更新日记详情
        if (action.payload.diaries && action.payload.diaries.length > 0) {
          const fullDiary = action.payload.diaries[0]
          // 更新用户自己的日记
          const userDiaryIndex = state.diaries.findIndex(d => d.id === fullDiary.id)
          if (userDiaryIndex !== -1) {
            state.diaries[userDiaryIndex] = {
              ...state.diaries[userDiaryIndex],
              ...fullDiary
            }
          }
          // 更新配对用户的日记
          const pairedDiaryIndex = state.pairedDiaries.findIndex(d => d.id === fullDiary.id)
          if (pairedDiaryIndex !== -1) {
            state.pairedDiaries[pairedDiaryIndex] = {
              ...state.pairedDiaries[pairedDiaryIndex],
              ...fullDiary
            }
          }
        }
      })
      .addCase(getDiaryDetail.rejected, (state, action) => {
        state.detailLoading = false
        state.error = action.error.message || '获取日记详情失败'
      })
  }
})

export const { logout } = userSlice.actions
export default userSlice.reducer 