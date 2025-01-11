import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector } from './hooks/useAppSelector'
import { useAppDispatch } from './hooks/useAppDispatch'
import { syncData } from './store/userSlice'
import Login from './views/Login'
import Home from './views/Home'

const App: React.FC = () => {
  const dispatch = useAppDispatch()
  const { token, loading, diaries } = useAppSelector((state) => state.user)

  useEffect(() => {
    if (token && (!diaries || diaries.length === 0)) {
      console.log('App: Syncing data...')
      dispatch(syncData())
    }
  }, [token, diaries, dispatch])

  if (loading) {
    console.log('App: Loading...')
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <div>加载中...</div>
        </div>
      </div>
    )
  }

  console.log('App: Rendering routes, token:', token)
  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/home" element={token ? <Home /> : <Navigate to="/login" replace />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
      </Routes>
    </div>
  )
}

export default App
