import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'

const GAMES = [
  { path: '/football', emoji: '⚽', title: 'บอลโลก', desc: 'เดิมพัน 1X2 · แฮนดิแคป · โอเวอร์/อันเดอร์', color: 'from-green-900 to-green-950', border: 'border-green-800' },
  { path: '/slots', emoji: '🎰', title: 'สล็อตแมชชีน', desc: '3 วงล้อ · แจ็คพอต x100', color: 'from-purple-900 to-purple-950', border: 'border-purple-800' },
  { path: '/poker', emoji: '🃏', title: 'Texas Hold\'em', desc: 'Multiplayer Real-time · สูงสุด 8 คน', color: 'from-red-900 to-red-950', border: 'border-red-800' },
]

export default function LobbyPage() {
  const { user, balance } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl text-gold-400 mb-2">ยินดีต้อนรับ, {user?.username}!</h2>
        <p className="text-zinc-400">เลือกเกมที่อยากเล่น</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {GAMES.map(g => (
          <button
            key={g.path}
            onClick={() => navigate(g.path)}
            className={`card-felt bg-gradient-to-br ${g.color} border ${g.border} p-6 text-left hover:scale-105 transition-all duration-200 group`}
          >
            <div className="text-5xl mb-4">{g.emoji}</div>
            <h3 className="font-display text-xl text-white mb-2 group-hover:text-gold-400 transition-colors">{g.title}</h3>
            <p className="text-zinc-400 text-sm">{g.desc}</p>
          </button>
        ))}
      </div>

      <div className="card-felt p-6">
        <h3 className="text-gold-400 font-semibold mb-4">ยอดเงินเสมือนของคุณ</h3>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-display text-white">{balance.toLocaleString()}</div>
          <div className="text-zinc-400">เหรียญ</div>
        </div>
        <p className="text-zinc-600 text-sm mt-2">เหรียญเสมือน · ไม่ใช่เงินจริง</p>
      </div>
    </div>
  )
}
