import dayjs from 'dayjs'

const weekMap = ['日', '一', '二', '三', '四', '五', '六']

export function formatDate(date) {
  const d = dayjs(date)
  return {
    day: d.date(),
    week: `星期${weekMap[d.day()]}`,
    time: d.format('HH:mm'),
    month: d.month() + 1
  }
}

export function formatTitle(title, date) {
  if (!title) {
    return dayjs(date).format('YYYY-MM-DD')
  }
  return title.length > 10 ? title.slice(0, 10) + '...' : title
}

export function formatContent(content) {
  if (!content) return ''
  const trimmed = content.trim()
  return trimmed.length > 10 ? 
    trimmed.slice(0, 10).replace(/\n/g, '') + '...' : 
    trimmed.replace(/\n/g, '')
}

export function toChineseNum(num) {
  const chineseNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  if (num <= 10) return chineseNums[num]
  if (num < 20) return '十' + (num % 10 === 0 ? '' : chineseNums[num % 10])
  return chineseNums[Math.floor(num / 10)] + '十' + (num % 10 === 0 ? '' : chineseNums[num % 10])
} 