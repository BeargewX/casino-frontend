import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './context/authStore'
import AuthPage from './pages/AuthPage'
import LobbyPage from './pages/LobbyPage'
import FootballPage from './pages/FootballPage'
import SlotsPage from './pages/SlotsPage'
import PokerPage from './pages/PokerPage'
import AdminPage from './pages/AdminPage'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const token = useAuthStore(s => s.token)
  return token ? children : <Navigate to="/auth" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<LobbyPage />} />
        <Route path="football" element={<FootballPage />} />
        <Route path="slots" element={<SlotsPage />} />
        <Route path="poker" element={<PokerPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
    </Routes>
  )
}
