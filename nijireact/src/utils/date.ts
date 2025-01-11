import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

// 将数字转换为中文数字
const toChineseNum = (num: number): string => {
  const chineseNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  if (num <= 10) return chineseNums[num]
  if (num < 20) return '十' + (num % 10 === 0 ? '' : chineseNums[num % 10])
  return (
    chineseNums[Math.floor(num / 10)] +
    '十' +
    (num % 10 === 0 ? '' : chineseNums[num % 10])
  )
}

// 格式化日期标题
export const formatDateTitle = (date: string | Date): string => {
  const d = dayjs(date)
  return `${d.year()}年${toChineseNum(d.month() + 1)}月${toChineseNum(d.date())}日`
}

// 格式化日期
export const formatDate = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM-DD')
}

// 格式化时间
export const formatTime = (date: string | Date): string => {
  return dayjs(date).format('HH:mm')
}

// 格式化星期
export const formatWeek = (date: string | Date): string => {
  return dayjs(date).format('dddd')
}

// 格式化内容预览
export const formatPreview = (content: string, length: number = 100): string => {
  return content.length > length ? content.slice(0, length) + '...' : content
} 