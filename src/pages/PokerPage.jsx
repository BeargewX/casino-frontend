import React, { useEffect, useState, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../context/authStore'
import toast from 'react-hot-toast'

// ─── Card Component ───────────────────────────────────────────
function Card({ card, hidden, highlight, delay = 0 }) {
  const [visible, setVisible] = useState(delay === 0)

  useEffect(() => {
    if (delay > 0) {
      const t = setTimeout(() => setVisible(true), delay)
      return () => clearTimeout(t)
    }
  }, [delay])

  if (!visible) return (
    <div className="w-14 h-20 rounded-xl bg-zinc-800 border border-zinc-700"/>
  )

  if (hidden) return (
    <div className="w-14 h-20 bg-zinc-700 rounded-xl border border-zinc-600 flex items-center justify-center text-2xl
      transition-all duration-300">🂠</div>
  )

  if (!card) return null
  const isRed = card.suit === '♥' || card.suit === '♦'

  return (
    <div className={`w-14 h-20 bg-white rounded-xl border-2 flex flex-col items-center justify-center shadow-lg
      transition-all duration-300 ${isRed ? 'text-red-600' : 'text-zinc-900'}
      ${highlight ? 'border-gold-400 shadow-gold-400/50 shadow-lg scale-105' : 'border-zinc-200'}`}
      style={{ animation: delay > 0 ? 'cardFlip 0.3s ease-out' : 'none' }}
    >
      <div className="text-sm font-bold leading-none">{card.rank}</div>
      <div className="text-xl leading-none">{card.suit}</div>
      <style>{`
        @keyframes cardFlip {
          from { transform: rotateY(90deg) scale(0.8); opacity: 0; }
          to   { transform: rotateY(0deg) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ─── Mini Card (in player seat) ───────────────────────────────
function MiniCard({ card, hidden }) {
  if (hidden) return (
    <div className="w-8 h-12 bg-zinc-700 rounded border border-zinc-600 flex items-center justify-center text-sm">🂠</div>
  )
  if (!card) return null
  const isRed = card.suit === '♥' || card.suit === '♦'
  return (
    <div className={`w-8 h-12 bg-white rounded border border-zinc-200 flex flex-col items-center justify-center text-xs
      ${isRed ? 'text-red-600' : 'text-zinc-900'}`}>
      <div className="font-bold leading-none">{card.rank}</div>
      <div className="leading-none">{card.suit}</div>
    </div>
  )
}

// ─── Timer Bar ────────────────────────────────────────────────
function TimerBar({ seconds, total = 30, isMyTurn }) {
  if (seconds === null) return null
  const pct = (seconds / total) * 100
  const color = seconds > 15 ? '#22c55e' : seconds > 8 ? '#f59e0b' : '#ef4444'
  return (
    <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${pct}%`, background: color, boxShadow: isMyTurn ? `0 0 6px ${color}` : 'none' }}
      />
    </div>
  )
}

// ─── Player Seat ──────────────────────────────────────────────
function PlayerSeat({ player, isCurrentTurn, timeLeft, dealerIdx, myIdx, totalPlayers }) {
  const isMe = player.isMe
  const isDimmed = player.folded && !player.won

  return (
    <div className={`relative card-felt p-3 transition-all duration-300 ${
      isCurrentTurn && !player.folded
        ? 'border-gold-400 ring-2 ring-gold-400/30 shadow-gold-400/20 shadow-lg'
        : ''
    } ${isDimmed ? 'opacity-40' : ''} ${player.won ? 'border-green-400 ring-2 ring-green-400/30' : ''}`}>

      {/* Badges */}
      <div className="absolute -top-2 left-1 flex gap-1">
        {player.isDealer && (
          <span className="bg-white text-zinc-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">D</span>
        )}
        {player.isSB && (
          <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">S</span>
        )}
        {player.isBB && (
          <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">B</span>
        )}
        {player.allIn && (
          <span className="bg-gold-500 text-zinc-900 text-xs font-bold rounded-full px-1.5 h-5 flex items-center">ALL-IN</span>
        )}
      </div>

      {/* Turn indicator */}
      {isCurrentTurn && !player.folded && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gold-400 rounded-full animate-pulse"/>
      )}

      <div className="font-semibold text-sm mb-0.5 flex items-center gap-1 mt-1">
        {isMe && <span className="text-gold-400">★</span>}
        <span className="truncate max-w-[80px]">{player.username}</span>
      </div>

      <div className="text-gold-400 text-sm font-semibold">{player.balance?.toLocaleString()}</div>

      {player.bet > 0 && (
        <div className="text-zinc-400 text-xs mt-0.5">
          วางไว้: <span className="text-white">{player.bet.toLocaleString()}</span>
        </div>
      )}

      {/* Hand name (own cards only) */}
      {player.handName && !player.folded && (
        <div className="text-xs text-gold-400/80 mt-0.5 truncate">{player.handName}</div>
      )}

      {/* Showdown hand name */}
      {player.won !== null && player.won !== undefined && (
        <div className={`text-xs font-bold mt-0.5 ${player.won ? 'text-green-400' : 'text-zinc-500'}`}>
          {player.won ? '🏆 ชนะ!' : 'แพ้'}
        </div>
      )}

      {/* Cards */}
      <div className="flex gap-1 mt-2">
        {player.hole?.map((card, i) => (
          <MiniCard key={i} card={card.hidden ? null : card} hidden={card?.hidden}/>
        ))}
      </div>

      {player.folded && !player.won && (
        <div className="text-red-400 text-xs mt-1">Folded</div>
      )}

      {/* Timer bar (only for current turn player) */}
      {isCurrentTurn && !player.folded && (
        <div className="mt-2">
          <TimerBar seconds={timeLeft} isMyTurn={isMe}/>
          {timeLeft !== null && (
            <div className={`text-xs text-center mt-0.5 ${timeLeft <= 8 ? 'text-red-400 animate-pulse' : 'text-zinc-500'}`}>
              {timeLeft}s
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function PokerPage() {
  const { token, balance, setBalance } = useAuthStore()
  const [socket, setSocket] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [roomId, setRoomId] = useState('room1')
  const [joined, setJoined] = useState(false)
  const [buyIn, setBuyIn] = useState(1000)
  const [raiseAmount, setRaiseAmount] = useState(0)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const [prevCommunity, setPrevCommunity] = useState([])
  const prevPhase = useRef(null)

  useEffect(() => {
    if (!token) return
    const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    const s = io(BACKEND + '/poker', {
      auth: { token },
      transports: ['websocket', 'polling'],
      forceNew: true,
    })

    s.on('connect', () => { setConnected(true); setError(null) })
    s.on('connect_error', err => { setError(err.message); setConnected(false) })
    s.on('disconnect', () => setConnected(false))

    s.on('game:state', (state) => {
      setGameState(prev => {
        // Detect new community cards for animation
        if (prev?.community?.length !== state.community?.length) {
          setPrevCommunity(prev?.community || [])
        }
        return state
      })

      // Notify winner
      if (state.phase === 'showdown' && state.lastWinner) {
        const me = state.players?.find(p => p.isMe)
        if (me?.won) {
          toast.success(`🏆 คุณชนะ ${state.lastPot?.toLocaleString()} เหรียญ!`, { duration: 4000 })
          setBalance(me.balance)
        }
      }

      // Notify whose turn
      if (state.phase !== prevPhase.current) {
        prevPhase.current = state.phase
      }
      const me = state.players?.find(p => p.isMe)
      if (me && state.currentTurn !== undefined && state.players?.[state.currentTurn]?.isMe) {
        if (!['waiting','showdown'].includes(state.phase)) {
          toast('⚡ ถึงตาคุณแล้ว!', { duration: 2000, icon: '🎯' })
        }
      }
    })

    s.on('info', msg => toast(msg, { icon: 'ℹ️' }))
    s.on('error', msg => toast.error(msg))
    setSocket(s)

    return () => s.disconnect()
  }, [token])

  const joinRoom = () => {
    if (!socket || !connected) return
    socket.emit('room:join', { roomId, buyIn })
    setJoined(true)
  }

  const act = useCallback((action, amount) => {
    if (!socket) return
    socket.emit('game:action', { action, amount })
  }, [socket])

  const myPlayer = gameState?.players?.find(p => p.isMe)
  const isMyTurn = gameState?.currentTurn !== undefined &&
    gameState?.players?.[gameState.currentTurn]?.isMe &&
    !['waiting','showdown'].includes(gameState?.phase)
  const canCheck = isMyTurn && myPlayer && myPlayer.bet >= (gameState?.currentBet || 0)
  const toCall = isMyTurn ? Math.min(
    (gameState?.currentBet || 0) - (myPlayer?.bet || 0),
    myPlayer?.balance || 0
  ) : 0
  const minRaise = gameState?.minRaise || gameState?.bigBlind || 100

  // Set default raise amount
  useEffect(() => {
    if (isMyTurn && gameState) {
      setRaiseAmount((gameState.currentBet || 0) + (gameState.minRaise || 100))
    }
  }, [isMyTurn, gameState?.currentTurn])

  // Phase label
  const phaseLabel = {
    waiting: 'รอผู้เล่น', preflop: 'Pre-flop',
    flop: 'Flop', turn: 'Turn', river: 'River', showdown: 'Showdown'
  }

  if (!token) return <div className="text-center text-zinc-400 mt-20">กรุณาเข้าสู่ระบบก่อนค่ะ</div>

  if (!joined) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <h2 className="font-display text-3xl text-gold-400 mb-8 text-center">🃏 Texas Hold'em</h2>
        <div className="card-felt p-8 space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">เลือกห้อง</label>
            <select value={roomId} onChange={e => setRoomId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none">
              <option value="room1">ห้อง 1 — Blind 50/100</option>
              <option value="room2">ห้อง 2 — Blind 50/100</option>
              <option value="room3">ห้อง 3 — Blind 100/200</option>
              <option value="room4">ห้อง 4 — Blind 200/400</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">ซื้อชิป (Buy-in)</label>
            <input type="number" value={buyIn} onChange={e => setBuyIn(Number(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none"
              min={100} step={100}/>
            <div className="flex gap-2 mt-2">
              {[500, 1000, 5000, 10000].map(v => (
                <button key={v} onClick={() => setBuyIn(v)}
                  className={`flex-1 text-sm rounded-lg py-1 transition-colors ${buyIn === v ? 'bg-gold-500 text-zinc-900' : 'bg-zinc-700 text-zinc-400'}`}>
                  {v >= 1000 ? `${v/1000}K` : v}
                </button>
              ))}
            </div>
          </div>
          <div className="text-zinc-500 text-sm">ยอดเงิน: {balance?.toLocaleString()} เหรียญ</div>
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-xl px-4 py-2 text-red-400 text-sm">
              ❌ {error}
            </div>
          )}
          <button onClick={joinRoom} className="btn-gold w-full" disabled={!connected}>
            {connected ? 'เข้าร่วมห้อง' : 'กำลังเชื่อมต่อ...'}
          </button>
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-zinc-600'}`}/>
            <span className="text-zinc-500">{connected ? 'เชื่อมต่อแล้ว' : 'กำลังเชื่อมต่อ...'}</span>
          </div>
        </div>
        <p className="text-center text-zinc-600 text-xs mt-4">แชร์ URL ให้เพื่อนมาเล่น</p>
      </div>
    )
  }

  const phase = gameState?.phase
  const community = gameState?.community || []

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl text-gold-400">🃏 {roomId}</h2>
          {gameState?.handNum > 0 && (
            <span className="text-zinc-600 text-sm">Hand #{gameState.handNum}</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}/>
          {phase && (
            <span className="bg-zinc-800 px-3 py-1 rounded-full text-zinc-300">
              {phaseLabel[phase] || phase}
            </span>
          )}
        </div>
      </div>

      {/* Winner banner */}
      {phase === 'showdown' && gameState?.lastWinner && (
        <div className="bg-gold-500/10 border border-gold-500/30 rounded-2xl p-4 mb-4 text-center">
          <div className="text-gold-400 font-display text-xl">
            🏆 {gameState.lastWinner} ชนะ {gameState.lastPot?.toLocaleString()} เหรียญ!
          </div>
          {gameState.lastHandResults?.filter(r => r.won).map(r => (
            <div key={r.username} className="text-zinc-400 text-sm mt-1">{r.handName}</div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="felt-bg rounded-3xl p-6 mb-4 relative min-h-[220px]">
        {/* Pot */}
        <div className="text-center mb-4">
          {(gameState?.pot || 0) > 0 && (
            <div className="inline-flex items-center gap-2 bg-black/40 rounded-full px-5 py-2">
              <span className="text-zinc-400 text-sm">กอง:</span>
              <span className="text-gold-400 font-display text-xl font-bold">
                {gameState.pot.toLocaleString()}
              </span>
              {gameState?.currentBet > 0 && (
                <span className="text-zinc-500 text-sm">| เรียก: {gameState.currentBet.toLocaleString()}</span>
              )}
            </div>
          )}
        </div>

        {/* Community Cards */}
        <div className="flex justify-center gap-3">
          {phase === 'waiting' ? (
            <div className="text-zinc-500 text-center py-4">
              {(gameState?.players?.length || 0) < 2 ? 'รอผู้เล่นอีกอย่างน้อย 1 คน...' : 'กำลังเริ่มเกม...'}
            </div>
          ) : (
            <>
              {/* Show all 5 slots, reveal with delay */}
              {Array.from({ length: 5 }).map((_, i) => {
                const card = community[i]
                const isNew = i >= prevCommunity.length && card
                const delay = isNew ? (i - prevCommunity.length) * 300 : 0
                return (
                  <div key={i}>
                    {card
                      ? <Card card={card} delay={delay} highlight={isNew}/>
                      : <div className="w-14 h-20 rounded-xl border-2 border-dashed border-zinc-700/50"/>
                    }
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Showdown reveal */}
        {phase === 'showdown' && gameState?.lastHandResults?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            {gameState.lastHandResults.map((r, i) => (
              <div key={i} className={`text-center p-2 rounded-xl ${r.won ? 'bg-green-900/30 border border-green-700' : 'bg-zinc-800/50'}`}>
                <div className="text-sm font-medium text-white mb-1">{r.username}</div>
                <div className="flex gap-1 justify-center mb-1">
                  {r.hole?.map((card, j) => (
                    <Card key={j} card={card} delay={i * 200 + j * 100}/>
                  ))}
                </div>
                <div className={`text-xs ${r.won ? 'text-green-400 font-bold' : 'text-zinc-500'}`}>
                  {r.handName}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Players */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {gameState?.players?.map((player, i) => (
          <PlayerSeat
            key={i}
            player={player}
            isCurrentTurn={gameState.currentTurn === i}
            timeLeft={gameState.currentTurn === i ? gameState.timeLeft : null}
          />
        ))}
        {!gameState?.players?.length && (
          <div className="col-span-4 text-center text-zinc-500 py-4">รอผู้เล่น...</div>
        )}
      </div>

      {/* Action Panel */}
      {isMyTurn && (
        <div className="card-felt p-5 border border-gold-500/20">
          <div className="text-center text-gold-400 font-semibold mb-4 flex items-center justify-center gap-2">
            <span className="animate-pulse">⚡</span>
            ถึงตาคุณแล้ว!
            {gameState?.timeLeft !== null && (
              <span className={`text-sm ${gameState.timeLeft <= 8 ? 'text-red-400 animate-pulse font-bold' : 'text-zinc-400'}`}>
                ({gameState.timeLeft}s)
              </span>
            )}
          </div>

          {/* Timer bar */}
          <TimerBar seconds={gameState?.timeLeft} isMyTurn={true}/>

          {/* My hand name */}
          {myPlayer?.handName && (
            <div className="text-center text-sm text-zinc-400 mt-2 mb-3">
              มือของคุณ: <span className="text-gold-400 font-semibold">{myPlayer.handName}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 justify-center mt-3">
            <button onClick={() => act('fold')}
              className="bg-red-900 hover:bg-red-800 active:bg-red-700 text-white rounded-xl px-5 py-2.5 font-medium transition-all">
              Fold
            </button>

            {canCheck ? (
              <button onClick={() => act('check')}
                className="bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl px-5 py-2.5 font-medium transition-all">
                Check
              </button>
            ) : (
              <button onClick={() => act('call')}
                className="bg-blue-800 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 font-medium transition-all">
                Call {toCall.toLocaleString()}
              </button>
            )}

            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <input
                  type="number"
                  value={raiseAmount}
                  onChange={e => setRaiseAmount(Number(e.target.value))}
                  min={(gameState?.currentBet || 0) + minRaise}
                  max={myPlayer?.balance || 0}
                  step={minRaise}
                  className="w-28 bg-zinc-800 border border-zinc-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-500"
                />
                <div className="flex gap-1 mt-1">
                  {[0.5, 1, 2].map(mult => {
                    const v = Math.floor((gameState?.pot || 0) * mult)
                    return (
                      <button key={mult} onClick={() => setRaiseAmount(Math.min(v, myPlayer?.balance || 0))}
                        className="flex-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-400 rounded py-0.5 transition-colors">
                        {mult === 0.5 ? '½' : mult === 1 ? '1x' : '2x'}
                      </button>
                    )
                  })}
                </div>
              </div>
              <button onClick={() => act('raise', raiseAmount)}
                disabled={raiseAmount < (gameState?.currentBet || 0) + minRaise}
                className="btn-gold py-2.5 px-4 disabled:opacity-40">
                Raise
              </button>
            </div>

            <button onClick={() => act('allin')}
              className="bg-gold-600 hover:bg-gold-500 text-zinc-900 rounded-xl px-5 py-2.5 font-bold transition-all">
              All-In! ({myPlayer?.balance?.toLocaleString()})
            </button>
          </div>
        </div>
      )}

      {/* Waiting / share URL */}
      {phase === 'waiting' && (gameState?.players?.length || 0) < 2 && (
        <div className="card-felt p-4 text-center mt-4">
          <p className="text-zinc-400 mb-2 text-sm">แชร์ URL ให้เพื่อนมาเล่น:</p>
          <div className="bg-zinc-800 rounded-xl px-4 py-2 text-zinc-300 text-sm break-all">
            {window.location.origin}/poker
          </div>
        </div>
      )}
    </div>
  )
}