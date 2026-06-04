import React, { useEffect, useState } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

function StatCard({ label, value, color = 'text-gold-400' }) {
  return (
    <div className="card-felt p-5">
      <div className="text-zinc-500 text-sm mb-1">{label}</div>
      <div className={`text-3xl font-display ${color}`}>{value}</div>
    </div>
  )
}

export default function AdminPage() {
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [bets, setBets] = useState([])
  const [stats, setStats] = useState({})
  const [addAmount, setAddAmount] = useState({})
  const [note, setNote] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    try {
      const [u, b, s] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/bets'),
        api.get('/admin/stats'),
      ])
      setUsers(u.data)
      setBets(b.data)
      setStats(s.data)
    } catch {
      toast.error('ไม่มีสิทธิ์ Admin')
    }
  }

  const handleAddBalance = async (userId) => {
    const amount = parseInt(addAmount[userId] || 0)
    if (!amount) return toast.error('ใส่จำนวนเงิน')
    try {
      const { data } = await api.post(`/admin/users/${userId}/balance`, { amount, note: note[userId] })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, balance: data.balance } : u))
      setAddAmount(prev => ({ ...prev, [userId]: '' }))
      toast.success(`${amount > 0 ? 'เติม' : 'หัก'} ${Math.abs(amount).toLocaleString()} เหรียญสำเร็จ`)
    } catch { toast.error('เกิดข้อผิดพลาด') }
  }

  const handleReset = async (userId, username) => {
    if (!confirm(`รีเซ็ตเงิน ${username} เป็น 10,000 เหรียญ?`)) return
    try {
      const { data } = await api.post(`/admin/users/${userId}/reset`)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, balance: data.balance } : u))
      toast.success('รีเซ็ตสำเร็จ')
    } catch { toast.error('เกิดข้อผิดพลาด') }
  }

  const handleToggleAdmin = async (userId, username) => {
    if (!confirm(`เปลี่ยนสิทธิ์ Admin ของ ${username}?`)) return
    try {
      const { data } = await api.post(`/admin/users/${userId}/toggle-admin`)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: data.is_admin } : u))
      toast.success('เปลี่ยนสิทธิ์สำเร็จ')
    } catch { toast.error('เกิดข้อผิดพลาด') }
  }

  const handleSettle = async (betId, result) => {
    try {
      await api.post(`/admin/bets/${betId}/settle`, { result })
      setBets(prev => prev.map(b => b.id === betId ? { ...b, status: result } : b))
      toast.success(result === 'won' ? '✅ ตัดสิน: ชนะ' : '❌ ตัดสิน: แพ้')
    } catch (err) { toast.error(err.response?.data?.error || 'เกิดข้อผิดพลาด') }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">👑</span>
        <h2 className="font-display text-3xl text-gold-400">Admin Panel</h2>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="ผู้เล่นทั้งหมด" value={stats.userCount ?? '...'} />
        <StatCard label="เดิมพันทั้งหมด" value={stats.betCount ?? '...'} />
        <StatCard label="เงินที่ชนะไป" value={stats.totalWon ? stats.totalWon.toLocaleString() : '...'} color="text-green-400" />
      </div>

      <div className="flex gap-2 mb-6">
        {[['users', '👥 ผู้เล่น'], ['bets', '🎯 เดิมพัน']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${tab === key ? 'bg-gold-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="card-felt p-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {user.username}
                      {user.is_admin && <span className="text-xs bg-gold-500/20 text-gold-400 rounded-full px-2 py-0.5">Admin</span>}
                    </div>
                    <div className="text-gold-400 font-semibold">{user.balance?.toLocaleString()} เหรียญ</div>
                    <div className="text-zinc-600 text-xs">{new Date(user.created_at).toLocaleDateString('th-TH')}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="number"
                    placeholder="จำนวน (ลบ=หัก)"
                    value={addAmount[user.id] || ''}
                    onChange={e => setAddAmount(prev => ({ ...prev, [user.id]: e.target.value }))}
                    className="w-36 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-500"
                  />
                  <input
                    type="text"
                    placeholder="หมายเหตุ"
                    value={note[user.id] || ''}
                    onChange={e => setNote(prev => ({ ...prev, [user.id]: e.target.value }))}
                    className="w-28 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-500"
                  />
                  <button onClick={() => handleAddBalance(user.id)} className="btn-gold py-2 px-4 text-sm">เติม/หัก</button>
                  <button onClick={() => handleReset(user.id, user.username)} className="bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl px-4 py-2 text-sm transition-colors">รีเซ็ต</button>
                  <button onClick={() => handleToggleAdmin(user.id, user.username)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl px-4 py-2 text-sm transition-colors">
                    {user.is_admin ? 'ถอด Admin' : 'แต่งตั้ง Admin'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'bets' && (
        <div className="card-felt overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left p-4 text-zinc-500 font-medium">ผู้เล่น</th>
                <th className="text-left p-4 text-zinc-500 font-medium">เลือก</th>
                <th className="text-left p-4 text-zinc-500 font-medium">ราคา</th>
                <th className="text-left p-4 text-zinc-500 font-medium">วางเดิมพัน</th>
                <th className="text-left p-4 text-zinc-500 font-medium">ชนะได้</th>
                <th className="text-left p-4 text-zinc-500 font-medium">สถานะ</th>
                <th className="text-left p-4 text-zinc-500 font-medium">ตัดสิน</th>
              </tr>
            </thead>
            <tbody>
              {bets.map(bet => (
                <tr key={bet.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/30">
                  <td className="p-4 font-medium">{bet.users?.username}</td>
                  <td className="p-4 text-zinc-300">{bet.selection}</td>
                  <td className="p-4 text-gold-400">x{Number(bet.odds).toFixed(2)}</td>
                  <td className="p-4">{bet.amount?.toLocaleString()}</td>
                  <td className="p-4 text-green-400">{bet.potential_win?.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`text-xs rounded-full px-2 py-1 ${
                      bet.status === 'won' ? 'bg-green-500/20 text-green-400' :
                      bet.status === 'lost' ? 'bg-red-500/20 text-red-400' :
                      'bg-zinc-700 text-zinc-400'
                    }`}>
                      {bet.status === 'pending' ? 'รอผล' : bet.status === 'won' ? 'ชนะ' : 'แพ้'}
                    </span>
                  </td>
                  <td className="p-4">
                    {bet.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleSettle(bet.id, 'won')} className="text-xs bg-green-900 hover:bg-green-800 text-white rounded-lg px-3 py-1.5 transition-colors">ชนะ</button>
                        <button onClick={() => handleSettle(bet.id, 'lost')} className="text-xs bg-red-900 hover:bg-red-800 text-white rounded-lg px-3 py-1.5 transition-colors">แพ้</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bets.length === 0 && <div className="text-center text-zinc-500 py-8">ยังไม่มีการเดิมพัน</div>}
        </div>
      )}
    </div>
  )
}
