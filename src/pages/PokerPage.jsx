import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../context/authStore'
import toast from 'react-hot-toast'

function Card({ card, hidden }) {
  if (hidden) return (
    <div className="w-14 h-20 bg-zinc-700 rounded-xl border border-zinc-600 flex items-center justify-center text-2xl">🂠</div>
  )
  if (!card) return null
  const isRed = card.suit === '♥' || card.suit === '♦'
  return (
    <div className={`w-14 h-20 bg-white rounded-xl border-2 border-zinc-200 flex flex-col items-center justify-center shadow-lg ${isRed ? 'text-red-600' : 'text-zinc-900'}`}>
      <div className="text-sm font-bold leading-none">{card.rank}</div>
      <div className="text-lg leading-none">{card.suit}</div>
    </div>
  )
}

function PlayerSeat({ player, isCurrentTurn }) {
  return (
    <div className={`card-felt p-3 min-w-[120px] ${isCurrentTurn && !player.folded ? 'border-gold-500 ring-2 ring-gold-500/20' : ''} ${player.folded ? 'opacity-40' : ''}`}>
      <div className="font-semibold text-sm mb-1 flex items-center gap-1">
        {player.isMe && <span className="text-gold-400">★</span>}
        {player.username}
        {isCurrentTurn && !player.folded && <span className="text-gold-400 ml-1">●</span>}
      </div>
      <div className="text-gold-400 text-sm">{player.balance?.toLocaleString()}</div>
      {player.bet > 0 && <div className="text-zinc-400 text-xs">วางเดิมพัน: {player.bet}</div>}
      <div className="flex gap-1 mt-2">
        {player.hole?.map((card, i) => (
          card?.hidden
            ? <div key={i} className="w-8 h-12 bg-zinc-700 rounded border border-zinc-600 flex items-center justify-center text-sm">🂠</div>
            : <div key={i} className={`w-8 h-12 bg-white rounded border border-zinc-200 flex flex-col items-center justify-center text-xs ${card?.suit === '♥' || card?.suit === '♦' ? 'text-red-600' : 'text-zinc-900'}`}>
                <div className="font-bold leading-none">{card?.rank}</div>
                <div className="leading-none">{card?.suit}</div>
              </div>
        ))}
      </div>
      {player.folded && <div className="text-red-400 text-xs mt-1">Fold</div>}
    </div>
  )
}

export default function PokerPage() {
  const { token, balance, setBalance } = useAuthStore()
  const [socket, setSocket] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [roomId, setRoomId] = useState('room1')
  const [joined, setJoined] = useState(false)
  const [buyIn, setBuyIn] = useState(1000)
  const [raiseAmount, setRaiseAmount] = useState(200)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) return
    console.log('[Poker] connecting with token:', token.substring(0, 20) + '...')

    const s = io('http://localhost:3001/poker', {
      auth: { token },
      transports: ['websocket', 'polling'],
      forceNew: true,
    })

    s.on('connect', () => {
      console.log('[Poker] connected!')
      setConnected(true)
      setError(null)
    })

    s.on('connect_error', (err) => {
      console.log('[Poker] connect_error:', err.message)
      setError(err.message)
      setConnected(false)
    })

    s.on('disconnect', (reason) => {
      console.log('[Poker] disconnected:', reason)
      setConnected(false)
    })

    s.on('game:state', (state) => {
      setGameState(state)
      if (state.lastWinner) {
        const me = state.players.find(p => p.isMe)
        if (me && state.lastWinner === me.username) {
          toast.success(`คุณชนะ ${state.lastPot?.toLocaleString()} เหรียญ! 🎉`)
          setBalance(me.balance)
        }
      }
    })

    s.on('error', msg => toast.error(msg))
    setSocket(s)

    return () => {
      console.log('[Poker] cleanup, disconnecting')
      s.disconnect()
    }
  }, [token])

  const joinRoom = () => {
    if (!socket || !connected) return
    socket.emit('room:join', { roomId, buyIn })
    setJoined(true)
  }

  const action = (type, amount) => {
    if (!socket) return
    socket.emit('game:action', { action: type, amount })
  }

  const myPlayer = gameState?.players?.find(p => p.isMe)
  const isMyTurn = gameState?.currentTurn !== undefined &&
    gameState?.players?.[gameState.currentTurn]?.isMe
  const canCheck = isMyTurn && myPlayer && myPlayer.bet >= (gameState?.currentBet || 0)

  if (!token) {
    return <div className="text-center text-zinc-400 mt-20">กรุณาเข้าสู่ระบบก่อนค่ะ</div>
  }

  if (!joined) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <h2 className="font-display text-3xl text-gold-400 mb-8 text-center">🃏 Texas Hold'em</h2>
        <div className="card-felt p-8 space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">เลือกห้อง</label>
            <select value={roomId} onChange={e => setRoomId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none">
              <option value="room1">ห้อง 1 (blind 50/100)</option>
              <option value="room2">ห้อง 2 (blind 50/100)</option>
              <option value="room3">ห้อง 3 (blind 50/100)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">ซื้อชิป (Buy-in)</label>
            <input type="number" value={buyIn} onChange={e => setBuyIn(Number(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none"
              min={100} />
          </div>
          <div className="text-zinc-500 text-sm">ยอดเงินของคุณ: {balance?.toLocaleString()} เหรียญ</div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-xl px-4 py-2 text-red-400 text-sm">
              เชื่อมต่อไม่ได้: {error}
            </div>
          )}

          <button onClick={joinRoom} className="btn-gold w-full" disabled={!connected}>
            {connected ? 'เข้าร่วมห้อง' : error ? 'เชื่อมต่อไม่ได้ ❌' : 'กำลังเชื่อมต่อ...'}
          </button>

          <div className="text-center">
            <span className={`inline-flex items-center gap-2 text-xs ${connected ? 'text-green-400' : 'text-zinc-500'}`}>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-zinc-600'}`}></span>
              {connected ? 'เชื่อมต่อแล้ว' : 'ยังไม่ได้เชื่อมต่อ'}
            </span>
          </div>
        </div>
        <p className="text-center text-zinc-600 text-sm mt-4">แชร์ URL ให้เพื่อนเพื่อเล่นด้วยกัน</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-gold-400">🃏 ห้อง: {roomId}</h2>
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></span>
          {gameState?.phase && (
            <span className="bg-zinc-800 px-3 py-1 rounded-full">
              {gameState.phase === 'waiting' ? 'รอผู้เล่น' :
               gameState.phase === 'preflop' ? 'Pre-flop' :
               gameState.phase === 'flop' ? 'Flop' :
               gameState.phase === 'turn' ? 'Turn' :
               gameState.phase === 'river' ? 'River' :
               gameState.phase === 'showdown' ? 'Showdown' : gameState.phase}
            </span>
          )}
        </div>
      </div>

      {gameState?.lastWinner && gameState?.phase === 'waiting' && (
        <div className="bg-gold-500/10 border border-gold-500/30 rounded-2xl p-4 mb-6 text-center text-gold-400">
          🏆 {gameState.lastWinner} ชนะ {gameState.lastPot?.toLocaleString()} เหรียญ!
        </div>
      )}

      <div className="felt-bg rounded-3xl p-8 mb-6 min-h-[200px]">
        <div className="text-center mb-4">
          {gameState?.pot > 0 && (
            <div className="inline-block bg-black/30 rounded-full px-6 py-2 text-gold-400 font-semibold">
              กองกลาง: {gameState.pot?.toLocaleString()} เหรียญ
            </div>
          )}
        </div>
        <div className="flex justify-center gap-3 mb-4">
          {gameState?.phase === 'waiting'
            ? <div className="text-zinc-400 text-center">{(gameState?.players?.length || 0) < 2 ? 'รอผู้เล่นอีก 1 คน...' : 'เริ่มเกมได้เลย...'}</div>
            : gameState?.community?.map((card, i) => <Card key={i} card={card} />)
          }
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {gameState?.players?.map((player, i) => (
          <PlayerSeat key={i} player={player} isCurrentTurn={gameState.currentTurn === i} />
        ))}
        {!gameState?.players?.length && (
          <div className="col-span-4 text-center text-zinc-500 py-4">รอผู้เล่น...</div>
        )}
      </div>

      {isMyTurn && gameState?.phase !== 'waiting' && gameState?.phase !== 'showdown' && (
        <div className="card-felt p-5">
          <div className="text-gold-400 font-semibold mb-3 text-center">ถึงตาคุณแล้ว!</div>
          <div className="flex flex-wrap gap-3 justify-center mb-3">
            <button onClick={() => action('fold')} className="bg-red-900 hover:bg-red-800 text-white rounded-xl px-5 py-2.5 font-medium">Fold</button>
            {canCheck
              ? <button onClick={() => action('check')} className="bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl px-5 py-2.5 font-medium">Check</button>
              : <button onClick={() => action('call')} className="bg-blue-900 hover:bg-blue-800 text-white rounded-xl px-5 py-2.5 font-medium">
                  Call {(gameState.currentBet - (myPlayer?.bet || 0)).toLocaleString()}
                </button>
            }
            <div className="flex gap-2 items-center">
              <input type="number" value={raiseAmount} onChange={e => setRaiseAmount(Number(e.target.value))}
                className="w-24 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none" />
              <button onClick={() => action('raise', raiseAmount)} className="btn-gold py-2.5">Raise</button>
            </div>
            <button onClick={() => action('allin')} className="bg-gold-600 hover:bg-gold-500 text-zinc-900 rounded-xl px-5 py-2.5 font-bold">All-In!</button>
          </div>
        </div>
      )}

      {gameState?.phase === 'waiting' && (gameState?.players?.length || 0) < 2 && (
        <div className="card-felt p-5 text-center">
          <p className="text-zinc-400 mb-2">แชร์ URL ให้เพื่อนมาเล่น:</p>
          <div className="bg-zinc-800 rounded-xl px-4 py-2 text-zinc-300 text-sm break-all">
            {window.location.origin}/poker
          </div>
        </div>
      )}
    </div>
  )
}
