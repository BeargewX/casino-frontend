import React, { useEffect, useState } from 'react'
import api from '../utils/api'
import { useAuthStore } from '../context/authStore'
import toast from 'react-hot-toast'
import { WC_GROUPS, TEAM_FLAGS, TEAM_COLORS } from '../utils/wcData'

function formatTime(iso) {
  return new Date(iso).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
}

function OddsButton({ label, odds, selected, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
        selected ? 'border-gold-500 bg-gold-500/10 text-gold-400' : 'border-zinc-700 hover:border-zinc-500 text-zinc-300'
      }`}>
      <span className="text-xs text-zinc-400 mb-1">{label}</span>
      <span className="font-semibold text-lg">{odds?.toFixed(2) ?? '-'}</span>
    </button>
  )
}

// Map API-Football position string → short code for display
const POS_MAP = {
  Goalkeeper: 'GK',
  Defender: 'DEF',
  Midfielder: 'MID',
  Attacker: 'ATT',
}

// Coordinates by position group on pitch
const POS_COORDS = {
  GK:  { x: 50, y: 88 },
  DEF: [{ x: 15, y: 70 }, { x: 37, y: 70 }, { x: 63, y: 70 }, { x: 85, y: 70 }],
  MID: [{ x: 20, y: 50 }, { x: 50, y: 50 }, { x: 80, y: 50 }],
  ATT: [{ x: 25, y: 28 }, { x: 50, y: 22 }, { x: 75, y: 28 }],
}

function getCoord(posGroup, indexInGroup) {
  if (posGroup === 'GK') return POS_COORDS.GK
  const coords = POS_COORDS[posGroup]
  return coords[indexInGroup % coords.length]
}

function PitchView({ team, onClose }) {
  const [squad, setSquad] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pitch') // pitch | list
  const colors = TEAM_COLORS[team] || TEAM_COLORS.default
  const flag = TEAM_FLAGS[team] || '🏳'

  useEffect(() => {
    api.get(`/football/squad/${encodeURIComponent(team)}`)
      .then(r => setSquad(r.data))
      .catch(() => toast.error('โหลดข้อมูลทีมไม่ได้'))
      .finally(() => setLoading(false))
  }, [team])

  // Group players by position
  const grouped = { GK: [], DEF: [], MID: [], ATT: [] }
  if (squad) {
    squad.players.forEach(p => {
      const g = POS_MAP[p.position] || 'MID'
      grouped[g].push(p)
    })
  }

  // Build exactly 11 starters — detect formation from squad numbers
  const defCount = 4
  const midCount = 3
  const attCount = 3
  const starters = [
    ...grouped.GK.slice(0, 1),
    ...grouped.DEF.slice(0, defCount),
    ...grouped.MID.slice(0, midCount),
    ...grouped.ATT.slice(0, attCount),
  ].slice(0, 11)
  const bench = squad?.players.filter(p => !starters.find(s => s.id === p.id)) || []

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-900 rounded-2xl w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={`bg-gradient-to-r ${colors.bg} p-4 flex items-center justify-between flex-shrink-0`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{flag}</span>
            <div>
              <h3 className="font-display text-xl text-white">{team}</h3>
              {squad && <div className="text-xs opacity-70 text-white">{squad.players.length} ผู้เล่น</div>}
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex bg-zinc-800 flex-shrink-0">
          {[['pitch', '⚽ แผนสนาม'], ['list', '📋 รายชื่อทั้งหมด']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === key ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1">
          {loading && (
            <div className="flex items-center justify-center h-40 text-zinc-400">
              <div className="text-center">
                <div className="text-2xl mb-2 animate-spin">⚽</div>
                <div>กำลังโหลดข้อมูลจาก API...</div>
              </div>
            </div>
          )}

          {!loading && !squad && (
            <div className="text-center text-zinc-400 py-10">โหลดข้อมูลไม่ได้ค่ะ</div>
          )}

          {!loading && squad && tab === 'pitch' && (
            <div>
              {/* Pitch */}
              <div className="relative mx-3 my-3 rounded-xl overflow-hidden"
                style={{ paddingBottom: '125%', background: 'linear-gradient(180deg, #1a5c2a 0%, #1e6b30 33%, #1a5c2a 66%, #1e6b30 100%)' }}>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 125" preserveAspectRatio="none">
                  <rect x="5" y="4" width="90" height="117" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5"/>
                  <line x1="5" y1="63" x2="95" y2="63" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5"/>
                  <circle cx="50" cy="63" r="10" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5"/>
                  <circle cx="50" cy="63" r="0.7" fill="rgba(255,255,255,0.4)"/>
                  <rect x="25" y="4" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5"/>
                  <rect x="25" y="103" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5"/>
                  <rect x="38" y="2" width="24" height="4" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5"/>
                  <circle cx="50" cy="18" r="0.7" fill="rgba(255,255,255,0.4)"/>
                </svg>

                {/* Starting 11 */}
                {(() => {
                  const posCount = { GK: 0, DEF: 0, MID: 0, ATT: 0 }
                  return starters.map((player, idx) => {
                    const posGroup = POS_MAP[player.position] || 'MID'
                    const coord = getCoord(posGroup, posCount[posGroup])
                    posCount[posGroup]++
                    return (
                      <div key={player.id} className="absolute flex flex-col items-center"
                        style={{ left: `${coord.x}%`, top: `${coord.y}%`, transform: 'translate(-50%,-50%)' }}>
                        {player.photo
                          ? <img src={player.photo} alt={player.name}
                              className="w-9 h-9 rounded-full border-2 border-gold-400 shadow-lg object-cover bg-zinc-700"
                              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}/>
                          : null
                        }
                        <div className={`w-9 h-9 rounded-full bg-white/90 border-2 border-gold-400 items-center justify-center text-zinc-900 font-bold text-xs shadow-lg ${player.photo ? 'hidden' : 'flex'}`}>
                          {player.number || '?'}
                        </div>
                        <div className="mt-0.5 bg-black/70 rounded px-1.5 py-0.5 text-white text-center whitespace-nowrap" style={{ fontSize: '8px' }}>
                          {player.name?.split(' ').pop()}
                        </div>
                        <div className="bg-gold-500/80 rounded px-1 text-zinc-900 font-bold" style={{ fontSize: '7px' }}>
                          {posGroup}
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>

              {/* Bench */}
              {bench.length > 0 && (
                <div className="px-3 pb-3">
                  <div className="text-zinc-500 text-xs mb-2">ผู้เล่นสำรอง ({bench.length} คน)</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {bench.map(p => (
                      <div key={p.id} className="bg-zinc-800 rounded-lg p-2 flex items-center gap-2">
                        {p.photo
                          ? <img src={p.photo} alt={p.name} className="w-7 h-7 rounded-full object-cover bg-zinc-700 flex-shrink-0"/>
                          : <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-gold-400 flex-shrink-0">{p.number || '?'}</div>
                        }
                        <div className="min-w-0">
                          <div className="text-white truncate" style={{ fontSize: '9px' }}>{p.name?.split(' ').pop()}</div>
                          <div className="text-zinc-500" style={{ fontSize: '8px' }}>{POS_MAP[p.position] || p.position}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && squad && tab === 'list' && (
            <div className="p-3">
              {['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'].map(pos => {
                const posPlayers = squad.players.filter(p => p.position === pos)
                if (!posPlayers.length) return null
                const posLabel = { Goalkeeper: '🧤 ผู้รักษาประตู', Defender: '🛡️ กองหลัง', Midfielder: '⚙️ กองกลาง', Attacker: '⚡ กองหน้า' }[pos]
                return (
                  <div key={pos} className="mb-4">
                    <div className="text-gold-400 text-xs font-semibold mb-2">{posLabel}</div>
                    <div className="space-y-1">
                      {posPlayers.map(p => (
                        <div key={p.id} className="flex items-center gap-3 bg-zinc-800 rounded-lg px-3 py-2">
                          {p.photo
                            ? <img src={p.photo} alt={p.name} className="w-8 h-8 rounded-full object-cover bg-zinc-700 flex-shrink-0"/>
                            : <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-gold-400 flex-shrink-0">{p.number || '?'}</div>
                          }
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm truncate">{p.name}</div>
                            <div className="text-zinc-500 text-xs">#{p.number} · อายุ {p.age} ปี</div>
                          </div>
                          <span className="text-xs bg-zinc-700 text-zinc-400 rounded px-2 py-0.5">{POS_MAP[p.position]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TeamCard({ team, onSelect }) {
  const flag = TEAM_FLAGS[team] || '🏳'
  return (
    <button onClick={() => onSelect(team)}
      className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-700 hover:border-gold-500 bg-zinc-800/50 hover:bg-zinc-800 transition-all text-left">
      <span className="text-2xl">{flag}</span>
      <span className="text-sm font-medium text-white truncate">{team}</span>
    </button>
  )
}

export default function FootballPage() {
  const [tab, setTab] = useState('teams')
  const [matches, setMatches] = useState([])
  const [loadingMatches, setLoadingMatches] = useState(true)
  const [selected, setSelected] = useState(null)
  const [amount, setAmount] = useState(100)
  const [bets, setBets] = useState([])
  const [pitchTeam, setPitchTeam] = useState(null)
  const { balance, setBalance } = useAuthStore()

  useEffect(() => {
    api.get('/football/matches').then(r => setMatches(r.data)).finally(() => setLoadingMatches(false))
    api.get('/bets/my').then(r => setBets(r.data))
  }, [])

  const getMarket = (match, key) => match.bookmakers?.[0]?.markets?.find(m => m.key === key)

  const handleSelect = (matchId, market, outcome, odds, match) => {
    setSelected(prev =>
      prev?.matchId === matchId && prev?.outcome === outcome ? null : { matchId, market, outcome, odds, match }
    )
  }

  const placeBet = async () => {
    if (!selected) return
    if (amount < 10) return toast.error('เดิมพันขั้นต่ำ 10 เหรียญ')
    if (amount > balance) return toast.error('ยอดเงินไม่พอ')
    try {
      const { data } = await api.post('/bets/place', {
        match_id: selected.matchId, market: selected.market,
        selection: selected.outcome, odds: selected.odds, amount,
      })
      setBalance(data.balance)
      setBets(prev => [data.bet, ...prev])
      setSelected(null)
      toast.success(`วางเดิมพันสำเร็จ! ชนะได้ ${data.bet.potential_win.toLocaleString()} เหรียญ`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'เกิดข้อผิดพลาด')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="font-display text-3xl text-gold-400 mb-6">⚽ บอลโลก 2026</h2>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[['teams', '🌍 ทีม & นักเตะ'], ['betting', '💰 วางเดิมพัน'], ['mybets', '📋 การเดิมพันของฉัน']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === key ? 'bg-gold-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'teams' && (
        <div className="space-y-4">
          <p className="text-zinc-400 text-sm">กดที่ทีมเพื่อดูรายชื่อนักเตะจริงจาก API พร้อมรูปและตำแหน่งในสนาม</p>
          {Object.entries(WC_GROUPS).map(([group, teams]) => (
            <div key={group} className="card-felt p-5">
              <h3 className="text-gold-400 font-semibold mb-3">กลุ่ม {group}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {teams.map(team => <TeamCard key={team} team={team} onSelect={setPitchTeam} />)}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'betting' && (
        <div className="space-y-4">
          {loadingMatches && <div className="text-center text-zinc-400 py-10">กำลังโหลดราคาน้ำ...</div>}
          {!loadingMatches && matches.length === 0 && (
            <div className="card-felt p-8 text-center text-zinc-400">
              <div className="text-4xl mb-3">📭</div>
              <div>ยังไม่มีแมตช์ที่เปิดรับเดิมพัน</div>
              <div className="text-sm text-zinc-600 mt-1">ใส่ ODDS_API_KEY ใน .env เพื่อดึงราคาจริง</div>
            </div>
          )}
          {matches.map(match => {
            const h2h = getMarket(match, 'h2h')
            const totals = getMarket(match, 'totals')
            const spreads = getMarket(match, 'spreads')
            const homeFlag = TEAM_FLAGS[match.home_team] || '🏳'
            const awayFlag = TEAM_FLAGS[match.away_team] || '🏳'
            return (
              <div key={match.id} className="card-felt p-5">
                <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                  <div>
                    <div className="font-display text-xl text-white flex items-center gap-2 flex-wrap">
                      <span>{homeFlag} {match.home_team}</span>
                      <span className="text-zinc-500">vs</span>
                      <span>{match.away_team} {awayFlag}</span>
                    </div>
                    <div className="text-zinc-500 text-sm mt-1">{formatTime(match.commence_time)}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setPitchTeam(match.home_team)} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg px-2 py-1">{homeFlag} ทีม</button>
                    <button onClick={() => setPitchTeam(match.away_team)} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg px-2 py-1">{awayFlag} ทีม</button>
                  </div>
                </div>
                <div className="space-y-3">
                  {h2h && (
                    <div>
                      <div className="text-xs text-zinc-500 mb-2">1X2</div>
                      <div className="grid grid-cols-3 gap-2">
                        {h2h.outcomes.map(o => (
                          <OddsButton key={o.name} label={o.name === 'Draw' ? 'เสมอ' : `${TEAM_FLAGS[o.name] || ''} ${o.name}`} odds={o.price}
                            selected={selected?.matchId === match.id && selected?.outcome === o.name}
                            onClick={() => handleSelect(match.id, 'h2h', o.name, o.price, match)} />
                        ))}
                      </div>
                    </div>
                  )}
                  {totals && (
                    <div>
                      <div className="text-xs text-zinc-500 mb-2">โอเวอร์/อันเดอร์ {totals.outcomes[0]?.point}</div>
                      <div className="grid grid-cols-2 gap-2">
                        {totals.outcomes.map(o => (
                          <OddsButton key={o.name} label={o.name === 'Over' ? `สูงกว่า ${o.point}` : `ต่ำกว่า ${o.point}`} odds={o.price}
                            selected={selected?.matchId === match.id && selected?.outcome === o.name}
                            onClick={() => handleSelect(match.id, 'totals', o.name, o.price, match)} />
                        ))}
                      </div>
                    </div>
                  )}
                  {spreads && (
                    <div>
                      <div className="text-xs text-zinc-500 mb-2">แฮนดิแคป</div>
                      <div className="grid grid-cols-2 gap-2">
                        {spreads.outcomes.map(o => (
                          <OddsButton key={o.name} label={`${TEAM_FLAGS[o.name] || ''} ${o.name} (${o.point > 0 ? '+' : ''}${o.point})`} odds={o.price}
                            selected={selected?.matchId === match.id && selected?.outcome === `${o.name}${o.point}`}
                            onClick={() => handleSelect(match.id, 'spreads', `${o.name}${o.point}`, o.price, match)} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'mybets' && (
        <div className="card-felt">
          {bets.length === 0
            ? <div className="text-center text-zinc-500 py-10">ยังไม่มีการเดิมพัน</div>
            : <div className="divide-y divide-zinc-800">
                {bets.map(bet => (
                  <div key={bet.id} className="flex justify-between items-center p-4">
                    <div>
                      <div className="text-white text-sm font-medium">{bet.selection}</div>
                      <div className="text-zinc-500 text-xs">x{Number(bet.odds).toFixed(2)} · {new Date(bet.created_at).toLocaleString('th-TH')}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gold-400 font-semibold">{bet.amount?.toLocaleString()}</div>
                      <span className={`text-xs rounded-full px-2 py-0.5 ${bet.status === 'won' ? 'bg-green-500/20 text-green-400' : bet.status === 'lost' ? 'bg-red-500/20 text-red-400' : 'bg-zinc-700 text-zinc-400'}`}>
                        {bet.status === 'pending' ? 'รอผล' : bet.status === 'won' ? `ชนะ +${bet.potential_win?.toLocaleString()}` : 'แพ้'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {selected && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40">
          <div className="card-felt border border-gold-500/30 p-5 shadow-2xl">
            <div className="text-gold-400 font-semibold mb-1">{selected.outcome}</div>
            <div className="text-zinc-400 text-sm mb-4">{selected.match?.home_team} vs {selected.match?.away_team} · x{selected.odds.toFixed(2)}</div>
            <div className="flex gap-3">
              <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500" min={10} />
              <button onClick={placeBet} className="btn-gold">วางเดิมพัน<br/><span className="text-xs">ชนะ {(amount * selected.odds).toFixed(0)}</span></button>
              <button onClick={() => setSelected(null)} className="btn-ghost px-4">✕</button>
            </div>
            <div className="flex gap-2 mt-2">
              {[100, 500, 1000, 5000].map(v => (
                <button key={v} onClick={() => setAmount(v)} className="text-xs text-zinc-400 hover:text-white bg-zinc-800 rounded-lg px-3 py-1">{v.toLocaleString()}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {pitchTeam && <PitchView team={pitchTeam} onClose={() => setPitchTeam(null)} />}
    </div>
  )
}
