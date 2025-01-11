import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppSelector } from '../hooks/useAppSelector'
import { useAppDispatch } from '../hooks/useAppDispatch'
import { writeDiary } from '../store/userSlice'
import dayjs from 'dayjs'
import './DiaryEditor.css'

interface DiaryEditorProps {
  visible: boolean
  onClose: () => void
  onSave: () => void
  diary?: {
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
}

const DiaryEditor: React.FC<DiaryEditorProps> = ({ 
  visible, 
  onClose, 
  onSave,
  diary 
}) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { diaries } = useAppSelector((state) => state.user)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [saving, setSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const today = dayjs().format('YYYY-MM-DD')

  // 重置表单
  const resetForm = () => {
    setTitle('')
    setContent('')
    setDate(dayjs().format('YYYY-MM-DD'))
  }

  // 自动调整文本框高度
  const adjustHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }

  // 保存日记
  const handleSave = async () => {
    if (!content.trim()) {
      alert('请输入日记内容')
      return
    }

    try {
      setSaving(true)
      const result = await dispatch(writeDiary({
        date: date,
        title: title.trim(),
        content: content.trim(),
        diary_id: diary?.id // 如果是编辑已有日记，传入日记ID
      })).unwrap()

      if (result === 'Success') {
        onSave()
        resetForm()
        onClose()
        navigate('/')
      } else {
        alert('保存失败，请重试')
      }
    } catch (error: any) {
      alert(error.message || '保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  // 加载日记内容
  useEffect(() => {
    if (diary) {
      // 编辑已有日记
      setTitle(diary.title || '')
      setContent(diary.content || '')
      setDate(dayjs(diary.createddate).format('YYYY-MM-DD'))
    } else {
      // 检查当天是否已有日记
      const todayDiary = diaries.find(d => d.createddate === today)
      if (todayDiary) {
        setTitle(todayDiary.title || '')
        setContent(todayDiary.content || '')
        setDate(today)
      } else {
        resetForm()
      }
    }
  }, [diary, diaries, today])

  // 组件挂载时聚焦内容输入框
  useEffect(() => {
    if (visible && textareaRef.current) {
      textareaRef.current.focus()
      adjustHeight({ target: textareaRef.current } as React.ChangeEvent<HTMLTextAreaElement>)
    }
  }, [visible])

  // 插入时间戳
  const insertTimestamp = () => {
    const now = new Date()
    const timestamp = `\n[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]\n`
    
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart
      const end = textareaRef.current.selectionEnd
      
      // 检查光标前是否已经有换行
      const hasNewlineBefore = start === 0 || content[start - 1] === '\n'
      // 根据是否已有换行来决定前缀
      const prefix = hasNewlineBefore ? '' : '\n'
      
      const newContent = content.substring(0, start) + prefix + timestamp + content.substring(end)
      setContent(newContent)
      
      // 设置光标位置到时间戳后面
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = start + prefix.length + timestamp.length
          textareaRef.current.selectionStart = newPosition
          textareaRef.current.selectionEnd = newPosition
          textareaRef.current.focus()
        }
      }, 0)
    }
  }

  if (!visible) return null

  return (
    <div className="diary-editor">
      <div className="editor-header">
        <div className="date-picker">
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={today}
            disabled={!!diary}
          />
        </div>
        <div className="actions">
          <button 
            className="timestamp-btn"
            onClick={insertTimestamp}
            type="button"
          >
            插入时间
          </button>
          <button 
            className="save-btn" 
            onClick={handleSave} 
            disabled={saving}
          >
            {saving ? '保存中...' : '保存'}
          </button>
          <button 
            className="cancel-btn" 
            onClick={onClose}
          >
            取消
          </button>
        </div>
      </div>
      
      <div className="editor-body">
        <input 
          type="text" 
          className="title-input" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="标题（选填）"
          maxLength={50}
        />
        <textarea 
          ref={textareaRef}
          className="content-input" 
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            adjustHeight(e)
          }}
          placeholder="写下今天的故事..."
        />
      </div>
    </div>
  )
}

export default DiaryEditor 