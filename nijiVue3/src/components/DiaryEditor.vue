<template>
  <div class="diary-editor" v-if="visible">
    <div class="editor-header">
      <div class="date-picker">
        <input 
          type="date" 
          v-model="date" 
          :max="today"
          :disabled="!!props.diary"
        >
      </div>
      <div class="actions">
        <button class="save-btn" @click="handleSave" :disabled="saving">
          {{ saving ? '保存中...' : '保存' }}
        </button>
        <button class="cancel-btn" @click="$emit('close')">取消</button>
      </div>
    </div>
    
    <div class="editor-body">
      <input 
        type="text" 
        class="title-input" 
        v-model="title" 
        placeholder="标题（选填）"
        maxlength="50"
      >
      <textarea 
        class="content-input" 
        v-model="content" 
        placeholder="写下今天的故事..."
        :style="{ height: textareaHeight }"
        @input="adjustHeight"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useUserStore } from '../stores/user'
import dayjs from 'dayjs'

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

const emit = defineEmits(['close', 'save'])

const userStore = useUserStore()
const title = ref('')
const content = ref('')
const date = ref(dayjs().format('YYYY-MM-DD'))
const saving = ref(false)
const textareaHeight = ref('300px')

const today = computed(() => dayjs().format('YYYY-MM-DD'))

// 重置表单
const resetForm = () => {
  title.value = ''
  content.value = ''
  date.value = dayjs().format('YYYY-MM-DD')
}

// 监听 diary 属性变化，加载日记内容
watch(() => props.diary, (newDiary) => {
  if (newDiary) {
    title.value = newDiary.title || ''
    content.value = newDiary.content || ''
    date.value = dayjs(newDiary.createddate).format('YYYY-MM-DD')
    // 自动调整文本框高度
    nextTick(() => {
      const textarea = document.querySelector('.content-input')
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + 'px'
        textareaHeight.value = textarea.style.height
      }
    })
  } else {
    resetForm()
  }
}, { immediate: true })

// 自动调整文本框高度
const adjustHeight = (e) => {
  const textarea = e.target
  textarea.style.height = 'auto'
  textarea.style.height = textarea.scrollHeight + 'px'
  textareaHeight.value = textarea.style.height
}

// 保存日记
const handleSave = async () => {
  if (!content.value.trim()) {
    alert('请输入日记内容')
    return
  }

  try {
    saving.value = true
    const result = await userStore.writeDiary(date.value, title.value.trim(), content.value.trim())
    if (result === 'Success') {
      // 先触发保存事件，让父组件同步数据
      emit('save')
      // 重置表单
      resetForm()
      // 最后关闭编辑器
      emit('close')
    } else {
      alert('保存失败，请重试')
    }
  } catch (error) {
    alert(error.message || '保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// 组件挂载时聚焦内容输入框
onMounted(() => {
  if (props.visible) {
    const textarea = document.querySelector('.content-input')
    if (textarea) textarea.focus()
  }
})
</script>

<style scoped>
.diary-editor {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 10;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.editor-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-picker input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 12px;
}

.actions button {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn {
  background: #4a90e2;
  color: white;
  border: none;
}

.save-btn:hover {
  background: #357abd;
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  background: white;
  border: 1px solid #ddd;
  color: #666;
}

.cancel-btn:hover {
  background: #f5f5f5;
}

.editor-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.title-input {
  width: 100%;
  padding: 12px;
  border: none;
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 20px;
}

.title-input:focus {
  outline: none;
}

.content-input {
  width: 100%;
  min-height: 300px;
  padding: 12px;
  border: none;
  font-size: 16px;
  line-height: 1.6;
  resize: none;
}

.content-input:focus {
  outline: none;
}
</style> 