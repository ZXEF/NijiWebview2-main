import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../hooks/useAppSelector'
import { useAppDispatch } from '../hooks/useAppDispatch'
import { getDiaryDetail, logout } from '../store/userSlice'
import DiaryEditor from './DiaryEditor'
import DiaryDetail from '../components/DiaryDetail'
import './Home.css'

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

interface MonthGroup {
  month: string
  title: string
  diaries: Array<Diary & {
    day: string
    week: string
    time: string
  }>
}

interface DiaryCardProps {
  day: string
  week: string
  time: string
  title: string
  content: string
  space: string
  onClick: () => void
}

const DiaryCard: React.FC<DiaryCardProps> = ({
  day,
  week,
  time,
  title,
  content,
  space,
  onClick
}) => {
  // 限制预览文本长度为30个字符
  const previewContent = content.length > 30 ? content.slice(0, 30) + '...' : content;
  
  return (
    <div 
      className={`diary-card card-${space}`}
      onClick={onClick}
    >
      <div className="card-header">
        <div className="date">
          <span className="day">{day}</span>
          <span className="week">{week}</span>
        </div>
        <div className="time">{time}</div>
      </div>
      <div className="card-content">
        <h3 className="title">{title || '无标题'}</h3>
        <p className="preview">{previewContent}</p>
      </div>
    </div>
  )
}

const Home: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { diaries, pairedDiaries, userInfo, loading, error } = useAppSelector((state) => state.user)
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // 合并所有日记并按时间排序
  const allDiaries = [
    ...(diaries || []),
    ...(pairedDiaries || [])
  ].sort((a, b) => {
    // 首先按日期排序
    const dateCompare = new Date(b.createddate).getTime() - new Date(a.createddate).getTime()
    if (dateCompare !== 0) {
      return dateCompare
    }
    // 日期相同时按时间排序
    return b.createdtime - a.createdtime
  }).filter((diary, index, self) => 
    // 去重：如果日记在两个数组中都存在，只保留一个
    index === self.findIndex((d) => d.id === diary.id)
  )

  // 创建预览版本的日记（裁剪内容）
  const previewDiaries = allDiaries.map(diary => ({
    ...diary,
    content: diary.content.length > 30 ? diary.content.slice(0, 30) + '...' : diary.content
  }))

  // 处理日记选择
  const handleDiarySelect = async (diary: Diary) => {
    try {
      // 设置加载状态，但保持当前选中的日记
      setLoadingDetail(true)
      // 获取完整内容
      const result = await dispatch(getDiaryDetail({
        ownerID: diary.user,
        diaryID: diary.id
      })).unwrap()
      
      console.log('获取到的日记详情:', result)
      // 确保返回的日记数据存在
      if (result.diaries && result.diaries.length > 0) {
        const fullDiary = result.diaries[0]
        console.log('更新为完整内容:', fullDiary)
        // 直接使用 API 返回的完整日记数据
        setSelectedDiary(fullDiary)
      } else {
        console.log('未找到日记详情数据')
        // 如果获取失败，至少显示预览版本
        setSelectedDiary(diary)
      }
    } catch (error) {
      console.error('获取日记详情失败:', error)
      // 如果出错，至少显示预览版本
      setSelectedDiary(diary)
    } finally {
      setLoadingDetail(false)
    }
  }

  // 按月份分组（使用预览版本的日记）
  const monthGroups = previewDiaries.reduce<MonthGroup[]>((groups, diary) => {
    const [year, month] = diary.createddate.split('-')
    const monthKey = `${year}-${month}`
    
    let monthGroup = groups.find(g => g.month === monthKey)
    if (!monthGroup) {
      monthGroup = {
        month: monthKey,
        title: `${parseInt(month)}月`,
        diaries: []
      }
      groups.push(monthGroup)
    }

    const day = diary.createddate.split('-')[2]
    const week = new Date(diary.createddate).toLocaleDateString('zh-CN', { weekday: 'long' })
    const time = new Date(diary.createdtime * 1000).toTimeString().slice(0, 5)

    monthGroup.diaries.push({
      ...diary,
      day,
      week,
      time
    })

    return groups
  }, []).sort((a, b) => b.month.localeCompare(a.month))

  const handleWriteClick = () => {
    setShowEditor(true)
  }

  const handleEditClick = (diary: Diary) => {
    setSelectedDiary(diary)
    setShowEditor(true)
  }

  const handleEditorClose = () => {
    setShowEditor(false)
    setSelectedDiary(null)
  }

  const handleEditorSave = () => {
    setShowEditor(false)
    setSelectedDiary(null)
  }

  // 处理退出登录
  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <div>加载中...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  console.log('Home render:', {
    diariesLength: diaries?.length,
    pairedDiariesLength: pairedDiaries?.length,
    allDiariesLength: allDiaries.length,
    userInfo,
    diariesSample: diaries?.slice(0, 2),
    pairedDiariesSample: pairedDiaries?.slice(0, 2),
    allDiariesSample: allDiaries.slice(0, 2)
  })

  return (
    <div className="home">
      <div className="diary-container">
        {/* 左侧日记列表 */}
        <div className="diary-list">
          <div className="list-header">
            <button className="write-btn" onClick={handleWriteClick}>
              写日记
            </button>
          </div>
          <div className="diary-scroll">
            {monthGroups.map((month) => (
              <div key={month.month}>
                <div className="month-title">{month.title}</div>
                {month.diaries.map((diary) => (
                  <DiaryCard
                    key={diary.id}
                    day={diary.day}
                    week={diary.week}
                    time={diary.time}
                    title={diary.title}
                    content={diary.content}
                    space={diary.space}
                    onClick={() => handleDiarySelect(diary)}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="list-footer">
            <button className="logout-btn" onClick={handleLogout}>
              退出登录
            </button>
          </div>
        </div>
        
        {/* 右侧日记详情 */}
        <div className="diary-detail">
          <DiaryDetail
            diary={selectedDiary}
            userInfo={userInfo}
            onEdit={() => handleEditClick(selectedDiary!)}
          />
        </div>
      </div>

      {showEditor && (
        <DiaryEditor
          visible={showEditor}
          diary={selectedDiary}
          onClose={handleEditorClose}
          onSave={handleEditorSave}
        />
      )}
    </div>
  )
}

export default Home 