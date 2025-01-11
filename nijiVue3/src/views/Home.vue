<template>
  <div class="home">
    <div class="diary-container">
      <!-- 左侧日记列表 -->
      <div class="diary-list">
        <div class="list-header">
          <button class="write-btn" @click="handleWriteClick">
            写日记
          </button>
        </div>
        <div class="diary-scroll">
          <template v-for="(month, index) in monthGroups" :key="index">
            <div class="month-title">{{ month.title }}</div>
            <DiaryCard
              v-for="diary in month.diaries"
              :key="diary.id"
              :day="diary.day"
              :week="diary.week"
              :writeTime="diary.time"
              :title="diary.title"
              :simple="diary.simple"
              :cardClass="diary.cardClass"
              @click="viewDiary(diary)"
            />
          </template>
        </div>
      </div>

      <!-- 右侧日记详情 -->
      <div class="diary-detail-container">
        <DiaryDetail
          :visible="showDetail"
          :diary="currentDiary"
          @close="closeDetail"
          @edit="handleEdit"
        />
        <DiaryEditor
          :visible="showEditor"
          :diary="currentDiary"
          @close="showEditor = false"
          @save="handleSave"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import DiaryCard from '../components/DiaryCard.vue'
import DiaryDetail from '../components/DiaryDetail.vue'
import DiaryEditor from '../components/DiaryEditor.vue'
import { formatDate, formatTitle, formatContent, toChineseNum } from '../utils/date'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()
const monthGroups = ref([])
const showDetail = ref(false)
const showEditor = ref(false)
const currentDiary = ref(null)

// 检查今天是否已经写了日记
const todayDiary = computed(() => {
  const today = dayjs().format('YYYY-MM-DD')
  return userStore.diaries?.find(diary => 
    dayjs(diary.createddate).format('YYYY-MM-DD') === today
  )
})

// 处理写日记按钮点击
const handleWriteClick = async () => {
  if (todayDiary.value) {
    // 如果今天已经写了日记，直接打开编辑器并加载内容
    currentDiary.value = todayDiary.value
    showEditor.value = true
  } else {
    // 如果今天还没写，显示空白编辑器
    currentDiary.value = null
    showEditor.value = true
  }
}

// 处理日记数据，按月份分组
const processDiaries = () => {
  const groups = []
  let currentMonth = null
  
  // 合并并排序所有日记
  const allDiaries = [
    ...(userStore.diaries || []).map(d => ({ ...d, owner: 'self' })),
    ...(userStore.pairedDiaries || []).map(d => ({ ...d, owner: 'paired' }))
  ].sort((a, b) => new Date(b.createddate) - new Date(a.createddate))

  allDiaries.forEach(diary => {
    const date = formatDate(diary.createddate)
    
    if (currentMonth !== date.month) {
      currentMonth = date.month
      groups.push({
        title: toChineseNum(date.month) + '月',
        diaries: []
      })
    }

    groups[groups.length - 1].diaries.push({
      id: diary.id,
      day: date.day,
      week: date.week,
      time: date.time,
      title: formatTitle(diary.title, diary.createddate),
      simple: formatContent(diary.content),
      cardClass: diary.space === 'girl' ? 'card-girl' : 'card-boy',
      owner: diary.owner,
      fullData: diary
    })
  })

  monthGroups.value = groups
}

// 查看日记详情
const viewDiary = async (diary) => {
  try {
    showDetail.value = true
    currentDiary.value = null // 清空当前日记，显示加载状态
    
    const userId = diary.owner === 'self' ? userStore.userInfo?.userid : userStore.pairedInfo?.userid
    if (!userId) {
      console.error('User ID not found')
      return
    }
    
    const fullDiary = await userStore.getDiary(userId, diary.id)
    console.log('Full diary data:', fullDiary)
    if (fullDiary) {
      currentDiary.value = {
        ...fullDiary,
        userid: userId,
        space: diary.owner === 'self' ? userStore.userInfo?.role : userStore.pairedInfo?.role
      }
      console.log('Current diary set to:', currentDiary.value)
    }
  } catch (error) {
    console.error('Failed to load diary:', error)
    currentDiary.value = null
    showDetail.value = false
  }
}

// 关闭日记详情
const closeDetail = () => {
  showDetail.value = false
  currentDiary.value = null
}

// 检查登录状态
const checkAuth = async () => {
  if (!userStore.token) {
    router.push('/login')
    return false
  }
  return true
}

// 处理编辑日记
const handleEdit = async () => {
  if (currentDiary.value) {
    showDetail.value = false
    showEditor.value = true
  }
}

// 处理保存日记后的操作
const handleSave = async () => {
  await userStore.syncData()
  processDiaries()
  
  // 保存成功后，自动打开当天的日记
  if (todayDiary.value) {
    showEditor.value = false
    const diary = {
      id: todayDiary.value.id,
      owner: 'self',
      fullData: todayDiary.value
    }
    await viewDiary(diary)
  }
}

onMounted(async () => {
  try {
    if (await checkAuth()) {
      await userStore.syncData()
      processDiaries()
    }
  } catch (error) {
    console.error('Failed to initialize home page:', error)
    router.push('/login')
  }
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.diary-container {
  max-width: 1800px;
  margin: 0 auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: 260px minmax(1000px, 1fr);
  min-height: calc(100vh - 40px);
}

.diary-list {
  position: relative;
  height: calc(100vh - 40px);
  min-width: 260px;
  max-width: 260px;
  display: flex;
  flex-direction: column;
}

.list-header {
  position: sticky;
  top: 0;
  padding: 15px;
  background-color: white;
  border-bottom: 1px solid #eee;
  z-index: 2;
}

.diary-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  border-right: 1px solid #eee;
}

.write-btn {
  width: 100%;
  padding: 12px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.write-btn:hover {
  background: #357abd;
  transform: translateY(-1px);
}

.diary-detail-container {
  overflow: hidden;
  position: relative;
  height: calc(100vh - 40px);
  min-width: 1000px;
  flex: 1;
}

.month-title {
  font-size: 18px;
  font-weight: bold;
  margin: 15px 0 8px;
  padding-bottom: 5px;
  border-bottom: 2px solid #eee;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}
</style> 