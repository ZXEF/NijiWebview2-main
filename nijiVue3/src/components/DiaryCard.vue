<template>
  <div :class="['diary-card', cardClass]" @click="$emit('click')">
    <div class="card-header">
      <div class="date">
        <span class="day">{{ day }}</span>
        <span class="week">{{ week }}</span>
      </div>
      <div class="time">{{ writeTime }}</div>
    </div>
    <div class="card-content">
      <h3 class="title">{{ title }}</h3>
      <p class="preview">{{ simple }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  day: {
    type: [String, Number],
    required: true
  },
  week: {
    type: String,
    required: true
  },
  writeTime: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  simple: {
    type: String,
    required: true
  },
  cardClass: {
    type: String,
    default: 'card-boy'
  }
})

defineEmits(['click'])
</script>

<style scoped>
.diary-card {
  margin: 8px 0;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 230px;
}

.card-boy {
  background-color: #e8f4f8;
  border: 1px solid #e0f0f8;
}

.card-girl {
  background-color: #fce8ef;
  border: 1px solid #fce0e8;
}

.diary-card:hover {
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.date {
  display: flex;
  align-items: center;
  gap: 6px;
}

.day {
  font-size: 20px;
  font-weight: bold;
}

.week {
  font-size: 13px;
  color: #666;
}

.time {
  font-size: 13px;
  color: #666;
}

.title {
  margin: 0 0 6px 0;
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.preview {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style> 