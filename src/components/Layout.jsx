import React, { useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'

export default function Layout() {
  const { user, balance, logout, refreshBalance } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => { refreshBalance() }, [])

  const handleLogout = () => { logout(); navigate('/auth') }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <span className="font-display text-xl text-gold-400">World Cup Casino</span>
        </div>
        <div className="flex items-center gap-1">
          {[
            { to: '/', label: '🏠 Lobby' },
            { to: '/football', label: '⚽ บอล' },
            { to: '/slots', label: '🎰 สล็อต' },
            { to: '/poker', label: '🃏 โป๊กเกอร์' },
            ...(user?.is_admin ? [{ to: '/admin', label: '👑 Admin' }] : []),
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-zinc-800 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-gold-400">💰</span>
            <span className="font-semibold text-gold-400">{balance.toLocaleString()}</span>
            <span className="text-zinc-500 text-sm">เหรียญ</span>
          </div>
          <div className="text-zinc-400 text-sm">{user?.username}</div>
          <button onClick={handleLogout} className="text-zinc-500 hover:text-red-400 text-sm transition-colors">
            ออก
          </button>
        </div>
      </nav>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
