<template>
  <div v-if="diary" :class="['diary-detail', cardClass, { visible }]">
    <div class="detail-header">
      <div class="date-info">
        <span class="day">{{ day }}</span>
        <span class="week">{{ week }}</span>
        <span class="time">{{ time }}</span>
      </div>
      <button v-if="visible" class="close-button" @click="$emit('close')">&times;</button>
    </div>
    
    <div class="detail-content">
      <h2 class="title">{{ title }}</h2>
      <div class="content">{{ content }}</div>
    </div>

    <!-- 右下角编辑按钮 -->
    <button 
      v-if="canEdit" 
      class="floating-edit-button" 
      @click="$emit('edit')"
    >
      编辑日记
    </button>
  </div>

  <div v-else class="diary-detail empty-state">
    <div class="placeholder-text">
      点击左侧日记查看详情
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate } from '../utils/date'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  diary: {
    type: Object,
    default: null
  }
})

defineEmits(['close', 'edit'])

// 判断是否可以编辑（只能编辑自己的日记）
const canEdit = computed(() => {
  console.log('Current diary:', props.diary)
  console.log('User info:', userStore.userInfo)
  if (!props.diary) return false
  // 检查是否是自己的日记
  const isSelfDiary = props.diary.userid === userStore.userInfo?.userid
  console.log('Can edit:', isSelfDiary)
  return isSelfDiary
})

// 格式化日期
const dateInfo = computed(() => {
  if (!props.diary?.createddate) return {}
  return formatDate(props.diary.createddate)
})

const day = computed(() => dateInfo.value.day || '')
const week = computed(() => dateInfo.value.week || '')
const time = computed(() => dateInfo.value.time || '')
const title = computed(() => props.diary?.title || props.diary?.createddate || '')
const content = computed(() => props.diary?.content || '')
const cardClass = computed(() => props.diary?.space === 'girl' ? 'card-girl' : 'card-boy')

const handleOverlayClick = (e) => {
  if (e.target === e.currentTarget) {
    e.stopPropagation()
    e.preventDefault()
    props.onClose?.()
  }
}
</script>

<style scoped>
.diary-detail {
  height: 100%;
  width: 100%;
  padding: 30px;
  position: relative;
  overflow-y: auto;
  transition: all 0.3s ease;
  opacity: 0.5;
  background-color: #fff;
}

.diary-detail.visible {
  opacity: 1;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
}

.card-boy {
  background-color: #e8f4f8;
}

.card-girl {
  background-color: #fce8ef;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: sticky;
  top: 0;
  padding: 10px 0;
  background: inherit;
  z-index: 10;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.day {
  font-size: 36px;
  font-weight: bold;
  color: #333;
}

.week {
  font-size: 18px;
  color: #444;
}

.time {
  font-size: 16px;
  color: #444;
  margin-left: 4px;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 8px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
  z-index: 10;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.detail-content {
  padding: 20px 0;
}

.title {
  font-size: 24px;
  margin: 0 0 20px 0;
  font-weight: bold;
  color: #333;
}

.content {
  font-size: 16px;
  line-height: 1.8;
  white-space: pre-wrap;
  color: #333;
}

.placeholder-text {
  color: #999;
  font-size: 18px;
  text-align: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10;
}

.edit-button {
  display: none;
}

.floating-edit-button {
  position: fixed;
  bottom: 40px;
  right: 40px;
  background: #4a90e2;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.floating-edit-button:hover {
  background: #357abd;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.floating-edit-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style> 