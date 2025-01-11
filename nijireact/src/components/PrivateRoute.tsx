import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'

interface PrivateRouteProps {
  children: React.ReactNode
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { token, loading } = useSelector((state: RootState) => state.user)

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">加载中...</div>
      </div>
    )
  }

  // 如果没有token，重定向到登录页
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // 如果有token，显示受保护的内容
  return <>{children}</>
}

export default PrivateRoute 