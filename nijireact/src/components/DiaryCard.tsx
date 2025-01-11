import React from 'react'
import { formatDateTitle, formatWeek, formatTime, formatPreview } from '../utils/date'
import './DiaryCard.css'

interface DiaryCardProps {
  diary: {
    id: number
    title: string
    content: string
    created_at: string
    user_id: number
  }
  onClick: (diary: DiaryCardProps['diary']) => void
}

const DiaryCard: React.FC<DiaryCardProps> = ({ diary, onClick }) => {
  const { title, content, created_at } = diary

  return (
    <div className="diary-card" onClick={() => onClick(diary)}>
      <div className="diary-card-header">
        <div className="diary-card-date">
          <div className="diary-card-day">{formatDateTitle(created_at)}</div>
          <div className="diary-card-week">{formatWeek(created_at)}</div>
        </div>
        <div className="diary-card-time">{formatTime(created_at)}</div>
      </div>
      <div className="diary-card-content">
        <h3 className="diary-card-title">{title || '无标题'}</h3>
        <p className="diary-card-preview">{formatPreview(content)}</p>
      </div>
    </div>
  )
}

export default DiaryCard 