import React, { useState, useEffect, useRef } from 'react'
import { formatDateTitle } from '../utils/date'
import './DiaryEditor.css'

interface DiaryEditorProps {
  diary?: {
    id?: number
    title: string
    content: string
    created_at: string
  }
  onSave: (diary: { title: string; content: string }) => void
  onClose: () => void
}

const DiaryEditor: React.FC<DiaryEditorProps> = ({ diary, onSave, onClose }) => {
  const [title, setTitle] = useState(diary?.title || '')
  const [content, setContent] = useState(diary?.content || '')
  const contentRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto'
      contentRef.current.style.height = contentRef.current.scrollHeight + 'px'
    }
  }, [content])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title: title.trim(),
      content: content.trim()
    })
  }

  return (
    <div className="diary-editor">
      <div className="diary-editor-header">
        <h2>{diary ? formatDateTitle(diary.created_at) : formatDateTitle(new Date())}</h2>
        <button className="close-button" onClick={onClose}>
          关闭
        </button>
      </div>
      <form className="diary-editor-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="标题（选填）"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="diary-editor-title"
        />
        <textarea
          ref={contentRef}
          placeholder="写下今天的故事..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="diary-editor-content"
          required
        />
        <div className="diary-editor-footer">
          <button type="submit" className="save-button">
            保存
          </button>
        </div>
      </form>
    </div>
  )
}

export default DiaryEditor 