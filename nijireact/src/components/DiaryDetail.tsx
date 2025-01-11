import React from 'react'
import { useAppSelector } from '../hooks/useAppSelector'
import './DiaryDetail.css'

interface DiaryDetailProps {
  diary: {
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
  } | null
  userInfo: {
    userid: number
  } | null
  onEdit: () => void
}

const DiaryDetail: React.FC<DiaryDetailProps> = ({
  diary,
  userInfo,
  onEdit
}) => {
  const { detailLoading } = useAppSelector(state => state.user)

  if (detailLoading) {
    return (
      <div className="detail-placeholder">
        <div className="loading-spinner"></div>
        <div>加载中...</div>
      </div>
    )
  }

  if (!diary) {
    return (
      <div className="detail-placeholder">
        选择一篇日记查看详情
      </div>
    )
  }

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toTimeString().slice(0, 5)
  }

  return (
    <div className={`detail-content ${diary.space}`}>
      <div className="detail-header">
        <h2>{diary.title || '无标题'}</h2>
        <div className="detail-meta">
          <span>{diary.createddate}</span>
          <span>{formatTime(diary.createdtime)}</span>
          {diary.mood && <span>心情：{diary.mood}</span>}
          {diary.weather && <span>天气：{diary.weather}</span>}
        </div>
      </div>
      <div className="detail-body">
        {diary.content}
      </div>
      {diary.user === userInfo?.userid && (
        <button 
          className="edit-btn"
          onClick={onEdit}
        >
          编辑日记
        </button>
      )}
    </div>
  )
}

export default DiaryDetail 