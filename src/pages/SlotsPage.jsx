import React, { useState, useEffect, useRef, useCallback } from 'react'
import api from '../utils/api'
import { useAuthStore } from '../context/authStore'
import toast from 'react-hot-toast'

// ===== AUDIO ENGINE =====
function createAudio() {
  let ctx = null
  const get = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx }

  const playTone = (freq, type, duration, vol = 0.3, delay = 0) => {
    try {
      const c = get()
      const o = c.createOscillator()
      const g = c.createGain()
      o.connect(g); g.connect(c.destination)
      o.type = type; o.frequency.value = freq
      g.gain.setValueAtTime(0, c.currentTime + delay)
      g.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.01)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration)
      o.start(c.currentTime + delay)
      o.stop(c.currentTime + delay + duration + 0.05)
    } catch {}
  }

  return {
    spin: () => {
      for (let i = 0; i < 8; i++) playTone(100 + i * 30, 'square', 0.08, 0.15, i * 0.06)
    },
    reelStop: (idx) => {
      playTone(200 + idx * 80, 'square', 0.12, 0.25, 0)
      playTone(150 + idx * 60, 'square', 0.08, 0.15, 0.05)
    },
    smallWin: () => {
      [523, 659, 784].forEach((f, i) => playTone(f, 'square', 0.15, 0.3, i * 0.1))
    },
    bigWin: () => {
      [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) =>
        playTone(f, 'square', 0.2, 0.4, i * 0.12))
    },
    jackpot: () => {
      const melody = [523,659,784,1047,1319,1047,784,1319,1047,784,659,523]
      melody.forEach((f, i) => playTone(f, 'square', 0.25, 0.5, i * 0.1))
    },
    lose: () => {
      playTone(200, 'sawtooth', 0.2, 0.2)
      playTone(150, 'sawtooth', 0.15, 0.15, 0.15)
    },
  }
}

const audio = createAudio()

// ===== 8-BIT PIXEL SYMBOLS =====
const SYM_CONFIG = {
  dragon: { color: '#ff4444', bg: '#1a0000', glow: '#ff444488', label: 'DRAGON' },
  gem:    { color: '#44ffff', bg: '#001a1a', glow: '#44ffff88', label: 'GEM'    },
  fire:   { color: '#ff8800', bg: '#1a0800', glow: '#ff880088', label: 'FIRE'   },
  coin:   { color: '#ffdd00', bg: '#1a1400', glow: '#ffdd0088', label: 'COIN'   },
  sword:  { color: '#aaaaff', bg: '#00001a', glow: '#aaaaff88', label: 'SWORD'  },
  shield: { color: '#88ff88', bg: '#001a00', glow: '#88ff8888', label: 'SHIELD' },
  skull:  { color: '#888888', bg: '#0a0a0a', glow: '#88888844', label: 'SKULL'  },
}

const PIXELS = {
  dragon: [
    [0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0],
    [0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,1,1,1,2,1,1,1,1,1,1,2,1,1,0,0],
    [1,1,1,1,1,2,2,1,1,2,2,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,1,1,1,3,1,1,1,1,1,1,3,1,1,1,0],
    [0,0,1,1,1,3,3,1,1,3,3,1,1,1,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,0,1,1,1,1,0,1,1,1,0,0],
    [0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  ],
  gem: [
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,1,2,2,3,3,2,2,2,2,1,0,0,0],
    [0,0,1,2,2,3,2,2,2,2,2,2,2,1,0,0],
    [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,2,2,2,2,2,2,2,2,2,2,2,2,1,1],
    [0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0],
    [0,0,1,1,2,2,2,2,2,2,2,2,1,1,0,0],
    [0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0],
    [0,0,0,0,1,1,2,2,2,2,1,1,0,0,0,0],
    [0,0,0,0,0,1,1,2,2,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  fire: [
    [0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,2,2,1,1,0,0,0,0,0,0],
    [0,0,0,1,1,2,2,2,2,1,1,0,0,1,0,0],
    [0,0,1,1,2,2,2,2,2,2,1,1,0,1,1,0],
    [0,1,1,2,2,2,2,2,2,2,2,2,1,1,1,0],
    [1,1,2,2,2,2,3,3,3,2,2,2,2,1,1,0],
    [1,2,2,2,2,3,3,3,3,3,2,2,2,2,1,0],
    [1,2,2,2,3,3,2,2,2,3,3,2,2,2,1,0],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
    [1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,0],
    [0,1,1,2,2,2,2,2,2,2,2,2,1,1,0,0],
    [0,0,1,1,2,2,2,2,2,2,2,1,1,0,0,0],
    [0,0,0,1,1,1,2,2,2,1,1,1,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
  ],
  coin: [
    [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,1,1,2,2,2,2,2,2,2,1,1,0,0,0],
    [0,1,1,2,2,2,2,2,2,2,2,2,1,1,0,0],
    [1,1,2,2,2,1,1,1,1,1,2,2,2,1,1,0],
    [1,2,2,2,1,1,2,2,2,1,1,2,2,2,1,0],
    [1,2,2,1,1,2,2,2,2,2,1,1,2,2,1,0],
    [1,2,2,1,2,2,2,2,2,2,2,1,2,2,1,0],
    [1,2,2,1,2,2,2,2,2,2,2,1,2,2,1,0],
    [1,2,2,1,1,2,2,2,2,2,1,1,2,2,1,0],
    [1,2,2,2,1,1,2,2,2,1,1,2,2,2,1,0],
    [1,1,2,2,2,1,1,1,1,1,2,2,2,1,1,0],
    [0,1,1,2,2,2,2,2,2,2,2,2,1,1,0,0],
    [0,0,1,1,2,2,2,2,2,2,2,1,1,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  sword: [
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,2,2,1,0,0],
    [0,0,0,0,0,0,0,0,0,1,2,2,1,0,0,0],
    [0,0,0,0,0,0,0,0,1,2,2,1,0,0,0,0],
    [0,0,0,0,0,0,0,1,2,2,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,2,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,2,2,1,0,0,0,0,0,0,0,0],
    [0,0,0,1,2,2,1,0,0,0,0,0,0,0,0,0],
    [0,0,1,2,2,1,0,0,0,0,0,0,0,0,0,0],
    [0,1,2,2,1,0,0,0,0,0,0,0,0,0,0,0],
    [1,3,3,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [1,3,1,0,1,3,1,0,0,0,0,0,0,0,0,0],
    [0,1,0,0,0,1,3,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  shield: [
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0],
    [1,1,2,2,2,2,2,2,2,2,2,2,2,2,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,2,2,3,2,2,2,2,2,2,3,2,2,2,1],
    [1,2,2,2,2,3,2,2,2,2,3,2,2,2,2,1],
    [1,2,2,2,2,2,3,2,2,3,2,2,2,2,2,1],
    [1,2,2,2,2,2,2,3,3,2,2,2,2,2,2,1],
    [0,1,2,2,2,2,3,2,2,3,2,2,2,2,1,0],
    [0,0,1,2,2,3,2,2,2,2,3,2,2,1,0,0],
    [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,0,0,0,1,1,2,2,2,2,1,1,0,0,0,0],
    [0,0,0,0,0,1,1,2,2,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  ],
  skull: [
    [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [1,1,2,2,2,1,1,1,1,1,2,2,2,1,1,0],
    [1,2,2,2,2,2,1,1,1,2,2,2,2,2,1,0],
    [1,2,2,2,2,2,1,1,1,2,2,2,2,2,1,0],
    [1,2,2,2,2,2,1,1,1,2,2,2,2,2,1,0],
    [1,1,2,2,2,1,1,1,1,1,2,2,2,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,2,1,1,2,1,1,2,1,1,2,1,1,0],
    [0,1,2,2,2,2,2,1,2,2,2,2,2,1,1,0],
    [0,1,1,2,2,2,1,1,1,2,2,2,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
  ],
}

function SymbolSVG({ name, size = 56, highlight = false, dim = false }) {
  const cfg = SYM_CONFIG[name] || SYM_CONFIG.skull
  const px = size / 16
  const grid = PIXELS[name] || PIXELS.skull
  const colorMap = { 1: cfg.color, 2: cfg.color + 'bb', 3: '#ffffff' }

  return (
    <div style={{
      opacity: dim ? 0.3 : 1,
      filter: highlight ? `drop-shadow(0 0 8px ${cfg.glow}) drop-shadow(0 0 16px ${cfg.glow})` : 'none',
      transition: 'all 0.3s',
    }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ imageRendering: 'pixelated', display: 'block' }}>
        <rect width={size} height={size} fill={cfg.bg} rx="6"/>
        {grid.map((row, y) => row.map((cell, x) =>
          cell !== 0 ? (
            <rect key={`${x}-${y}`} x={x*px} y={y*px} width={px} height={px} fill={colorMap[cell] || cfg.color}/>
          ) : null
        ))}
        {highlight && (
          <rect width={size} height={size} fill="none" rx="6"
            stroke={cfg.color} strokeWidth="2"
            style={{ animation: 'pulse 0.5s ease-in-out infinite alternate' }}/>
        )}
      </svg>
    </div>
  )
}

// Single reel with scroll animation
function Reel({ colIdx, spinning, finalCol, onStop }) {
  const [displayCol, setDisplayCol] = useState([randSym(), randSym(), randSym()])
  const intervalRef = useRef(null)
  const frameRef = useRef(0)

  function randSym() {
    const pool = ['skull','skull','skull','skull','skull','skull','skull','skull','skull','skull','skull','skull','shield','shield','shield','shield','shield','shield','shield','shield','sword','sword','sword','sword','sword','sword','coin','coin','coin','coin','coin','fire','fire','fire','fire','gem','gem','gem','dragon','dragon']
    return pool[Math.floor(Math.random() * pool.length)]
  }

  useEffect(() => {
    if (spinning) {
      let speed = 60
      const accelerate = setInterval(() => {
        if (speed > 40) speed -= 5
      }, 200)

      intervalRef.current = setInterval(() => {
        setDisplayCol([randSym(), randSym(), randSym()])
        frameRef.current++
      }, speed)

      return () => {
        clearInterval(intervalRef.current)
        clearInterval(accelerate)
      }
    } else {
      clearInterval(intervalRef.current)
      if (finalCol) {
        setDisplayCol(finalCol)
        onStop && onStop(colIdx)
      }
    }
  }, [spinning, finalCol])

  return (
    <div className="flex flex-col gap-1 items-center" style={{
      background: '#0a0500',
      borderRadius: 8,
      padding: '8px 4px',
      border: `1px solid ${spinning ? '#ff4444' : '#2a1500'}`,
      boxShadow: spinning ? '0 0 12px #ff444444' : 'none',
      transition: 'border-color 0.3s, box-shadow 0.3s',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Scan line effect */}
      {spinning && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)',
        }}/>
      )}
      {displayCol.map((sym, rowIdx) => (
        <div key={rowIdx} style={{
          transform: spinning ? `translateY(${Math.sin(Date.now() / 60 + rowIdx) * 3}px)` : 'translateY(0)',
          transition: spinning ? 'none' : 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          opacity: rowIdx === 1 ? 1 : 0.65,
          filter: rowIdx === 1 ? 'none' : 'blur(0.5px)',
        }}>
          <SymbolSVG name={sym} size={rowIdx === 1 ? 64 : 52}/>
        </div>
      ))}
    </div>
  )
}

// Win particles effect
function WinParticles({ active, big }) {
  if (!active) return null
  const colors = big
    ? ['#ff4444','#ffdd00','#ff8800','#ff44ff','#44ffff']
    : ['#ffdd00','#88ff88','#44ffff']

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 10 }}>
      {Array.from({ length: big ? 30 : 15 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${Math.random() * 100}%`,
          top: '-10%',
          width: big ? 10 : 6,
          height: big ? 10 : 6,
          background: colors[i % colors.length],
          borderRadius: Math.random() > 0.5 ? '50%' : '0',
          animation: `fall ${0.8 + Math.random() * 1.2}s linear ${Math.random() * 0.5}s forwards`,
          transform: `rotate(${Math.random() * 360}deg)`,
        }}/>
      ))}
      <style>{`
        @keyframes fall {
          to { transform: translateY(120vh) rotate(720deg); opacity: 0; }
        }
        @keyframes pulse {
          from { opacity: 0.5; }
          to { opacity: 1; }
        }
        @keyframes jackpotFlash {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}

// Payline indicators
const PAYLINE_ROWS = [
  [0,0,0,0,0], // top
  [1,1,1,1,1], // middle
  [2,2,2,2,2], // bottom
  [0,1,2,1,0], // V
  [2,1,0,1,2], // ^
]
const PAYLINE_COLORS = ['#ff8800','#ffdd00','#44ffff','#ff44ff','#88ff88']

const PAYOUTS_DISPLAY = [
  { sym: 'dragon', label: 'DRAGON', m3: 50,  m4: 200, m5: 1000 },
  { sym: 'gem',    label: 'GEM',    m3: 20,  m4: 80,  m5: 300  },
  { sym: 'fire',   label: 'FIRE',   m3: 10,  m4: 40,  m5: 150  },
  { sym: 'coin',   label: 'COIN',   m3: 5,   m4: 20,  m5: 75   },
  { sym: 'sword',  label: 'SWORD',  m3: 3,   m4: 10,  m5: 40   },
  { sym: 'shield', label: 'SHIELD', m3: 2,   m4: 6,   m5: 20   },
  { sym: 'skull',  label: 'SKULL',  m3: 1,   m4: 3,   m5: 10   },
]

export default function SlotsPage() {
  const [grid, setGrid] = useState(null)
  const [spinning, setSpinning] = useState([false,false,false,false,false])
  const [finalGrid, setFinalGrid] = useState(null)
  const [amount, setAmount] = useState(100)
  const [lastWins, setLastWins] = useState([])
  const [totalWin, setTotalWin] = useState(0)
  const [particles, setParticles] = useState(false)
  const [bigWin, setBigWin] = useState(false)
  const [jackpot, setJackpot] = useState(false)
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState({ spins: 0, won: 0, lost: 0 })
  const [tab, setTab] = useState('game')
  const stoppedCount = useRef(0)
  const { balance, setBalance } = useAuthStore()

  const isSpinning = spinning.some(Boolean)

  const handleReelStop = useCallback((colIdx) => {
    stoppedCount.current++
    audio.reelStop(colIdx)
  }, [])

  const spin = async () => {
    if (isSpinning) return
    if (amount < 10) return toast.error('เดิมพันขั้นต่ำ 10 เหรียญ')
    if (amount > balance) return toast.error('ยอดเงินไม่พอ')

    setLastWins([])
    setTotalWin(0)
    setParticles(false)
    setBigWin(false)
    setJackpot(false)
    setFinalGrid(null)
    stoppedCount.current = 0

    setSpinning([true,true,true,true,true])
    audio.spin()

    try {
      const { data } = await api.post('/slots/spin', { amount })

      // Stop reels one by one
      for (let i = 0; i < 5; i++) {
        await new Promise(r => setTimeout(r, 500 + i * 400))
        setFinalGrid(data.grid)
        setSpinning(prev => { const n = [...prev]; n[i] = false; return n })
      }

      await new Promise(r => setTimeout(r, 300))

      setGrid(data.grid)
      setLastWins(data.wins || [])
      setTotalWin(data.totalWin)
      setBalance(data.balance)

      const isJackpot = data.wins?.some(w => w.sym === 'dragon' && w.count === 5)
      const isBig = data.totalWin >= amount * 10

      setStats(s => ({
        spins: s.spins + 1,
        won: s.won + (data.totalWin > 0 ? data.totalWin : 0),
        lost: s.lost + (data.totalWin === 0 ? amount : 0),
      }))

      if (isJackpot) {
        setJackpot(true)
        setParticles(true)
        setBigWin(true)
        audio.jackpot()
        toast.success(`🐉 JACKPOT! +${data.totalWin.toLocaleString()} เหรียญ!!`, { duration: 6000 })
      } else if (isBig) {
        setParticles(true)
        setBigWin(true)
        audio.bigWin()
        toast.success(`💰 BIG WIN! +${data.totalWin.toLocaleString()} เหรียญ!`, { duration: 4000 })
      } else if (data.totalWin > 0) {
        setParticles(true)
        audio.smallWin()
      } else {
        audio.lose()
      }

      setHistory(prev => [{ grid: data.grid, wins: data.wins, total: data.totalWin, amount }, ...prev.slice(0, 9)])

      setTimeout(() => setParticles(false), 3000)
    } catch (err) {
      toast.error(err.response?.data?.error || 'เกิดข้อผิดพลาด')
      setSpinning([false,false,false,false,false])
    }
  }

  const displayGrid = finalGrid || grid || Array.from({ length: 5 }, () => ['coin','dragon','shield'])

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="font-display text-4xl mb-1" style={{
          color: '#ff4444',
          textShadow: '0 0 20px #ff444488, 0 0 40px #ff444444',
          animation: jackpot ? 'jackpotFlash 0.3s ease-in-out infinite' : 'none',
        }}>
          🐉 DRAGON SLOTS 🐉
        </h2>
        <p className="text-zinc-600 text-xs">5 REELS • 5 PAYLINES • MAX WIN 1000x</p>
      </div>

      <div className="flex gap-2 mb-4 justify-center">
        {['game','paytable','stats'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: tab === t ? '#ff4444' : '#1a0800', color: tab === t ? '#fff' : '#888', border: '1px solid #ff440033' }}>
            {t === 'game' ? '🎰 เล่น' : t === 'paytable' ? '💰 รางวัล' : '📊 สถิติ'}
          </button>
        ))}
      </div>

      {tab === 'game' && (
        <>
          {/* Machine */}
          <div className="relative rounded-2xl p-4 mb-4" style={{
            background: 'linear-gradient(180deg, #1a0800 0%, #0d0400 100%)',
            border: '2px solid #ff440033',
            boxShadow: '0 0 30px #ff440022',
          }}>
            <WinParticles active={particles} big={bigWin}/>

            {/* Win display */}
            <div className="text-center mb-3 h-8 flex items-center justify-center">
              {jackpot ? (
                <div className="font-display text-2xl" style={{ color: '#ffdd00', textShadow: '0 0 20px #ffdd00' }}>
                  🐉 JACKPOT! +{totalWin.toLocaleString()} 🐉
                </div>
              ) : totalWin > 0 ? (
                <div className="font-display text-xl animate-bounce" style={{ color: '#ffdd00' }}>
                  WIN! +{totalWin.toLocaleString()} เหรียญ
                </div>
              ) : isSpinning ? (
                <div className="text-zinc-600 text-sm animate-pulse">SPINNING...</div>
              ) : (
                <div className="text-zinc-800 text-sm">PRESS SPIN</div>
              )}
            </div>

            {/* Payline indicators left */}
            <div className="flex gap-2">
              <div className="flex flex-col justify-around py-2" style={{ width: 16 }}>
                {PAYLINE_COLORS.map((c, i) => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: lastWins.some(w => w.line === i) ? c : '#333',
                    boxShadow: lastWins.some(w => w.line === i) ? `0 0 6px ${c}` : 'none',
                    transition: 'all 0.3s',
                  }}/>
                ))}
              </div>

              {/* Reels */}
              <div className="flex-1 flex gap-2 justify-center">
                {[0,1,2,3,4].map(colIdx => (
                  <div key={colIdx} style={{ flex: 1 }}>
                    <Reel
                      colIdx={colIdx}
                      spinning={spinning[colIdx]}
                      finalCol={finalGrid?.[colIdx]}
                      onStop={handleReelStop}
                    />
                  </div>
                ))}
              </div>

              {/* Right indicators */}
              <div className="flex flex-col justify-around py-2" style={{ width: 16 }}>
                {PAYLINE_COLORS.map((c, i) => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: lastWins.some(w => w.line === i) ? c : '#333',
                    boxShadow: lastWins.some(w => w.line === i) ? `0 0 6px ${c}` : 'none',
                    transition: 'all 0.3s',
                  }}/>
                ))}
              </div>
            </div>

            {/* Win lines info */}
            {lastWins.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1 justify-center">
                {lastWins.map((w, i) => (
                  <div key={i} className="text-xs rounded-full px-3 py-1" style={{
                    background: PAYLINE_COLORS[w.line] + '33',
                    border: `1px solid ${PAYLINE_COLORS[w.line]}`,
                    color: PAYLINE_COLORS[w.line],
                  }}>
                    Line {w.line+1}: {w.sym.toUpperCase()} x{w.count} = +{w.win.toLocaleString()}
                  </div>
                ))}
              </div>
            )}

            {/* Controls */}
            <div className="mt-4 flex gap-3 items-center">
              <div className="flex-1">
                <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))}
                  className="w-full rounded-xl px-4 py-3 text-center font-bold focus:outline-none"
                  style={{ background: '#0a0500', border: '1px solid #ff440066', color: '#ffdd00', fontSize: 18 }}
                  min={10}/>
                <div className="flex gap-1 mt-2 justify-center flex-wrap">
                  {[50,100,500,1000,5000].map(v => (
                    <button key={v} onClick={() => setAmount(v)}
                      className="text-xs rounded-lg px-2 py-1"
                      style={{ background: amount === v ? '#ff4444' : '#1a0800', color: amount === v ? '#fff' : '#666', border: '1px solid #ff440022' }}>
                      {v >= 1000 ? `${v/1000}K` : v}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={spin} disabled={isSpinning}
                className="font-display text-2xl font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-40"
                style={{
                  background: isSpinning ? '#1a0800' : 'linear-gradient(180deg, #ff6644 0%, #cc2200 100%)',
                  color: '#fff', padding: '16px 32px',
                  boxShadow: isSpinning ? 'none' : '0 0 25px #ff444466, 0 4px 0 #881100',
                  border: '2px solid #ff4444',
                  transform: isSpinning ? 'translateY(2px)' : 'none',
                }}>
                {isSpinning ? '⏳' : 'SPIN'}
              </button>
            </div>

            {/* Balance */}
            <div className="mt-2 text-center text-sm font-semibold" style={{ color: '#ffdd00' }}>
              💰 {balance?.toLocaleString()} เหรียญ
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="card-felt p-3">
              <div className="text-zinc-500 text-xs mb-2">ประวัติล่าสุด</div>
              <div className="space-y-1">
                {history.slice(0,5).map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-zinc-800 last:border-0">
                    <div className="flex gap-1">
                      {h.grid?.map((col, j) => <SymbolSVG key={j} name={col[1]} size={24}/>)}
                    </div>
                    <span className={h.total > 0 ? 'text-green-400 font-semibold' : 'text-red-400'}>
                      {h.total > 0 ? `+${h.total.toLocaleString()}` : `-${h.amount.toLocaleString()}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'paytable' && (
        <div className="card-felt p-4">
          <div className="text-zinc-400 text-xs mb-4 text-center">รางวัลคำนวณจากเงินเดิมพัน × ตัวคูณ</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 text-xs">
                  <th className="text-left pb-2">สัญลักษณ์</th>
                  <th className="text-center pb-2">3 แถว</th>
                  <th className="text-center pb-2">4 แถว</th>
                  <th className="text-center pb-2">5 แถว</th>
                </tr>
              </thead>
              <tbody>
                {PAYOUTS_DISPLAY.map(p => (
                  <tr key={p.sym} className="border-t border-zinc-800">
                    <td className="py-2 flex items-center gap-2">
                      <SymbolSVG name={p.sym} size={32}/>
                      <span className="text-white">{p.label}</span>
                    </td>
                    <td className="text-center py-2" style={{ color: '#ffdd00' }}>{p.m3}x</td>
                    <td className="text-center py-2" style={{ color: '#ff8800' }}>{p.m4}x</td>
                    <td className="text-center py-2" style={{ color: '#ff4444' }}>{p.m5}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-xs text-zinc-600 space-y-1">
            <div>• DRAGON คือ Wild แทนสัญลักษณ์อื่นได้</div>
            <div>• 5 Paylines: บน กลาง ล่าง V-shape ^-shape</div>
            <div>• RTP ~70% → บ้านได้กำไร 30% ในระยะยาว</div>
          </div>
        </div>
      )}

      {tab === 'stats' && (
        <div className="card-felt p-4 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-zinc-800 rounded-xl p-3">
              <div className="text-zinc-500 text-xs mb-1">หมุนทั้งหมด</div>
              <div className="text-white font-bold text-xl">{stats.spins}</div>
            </div>
            <div className="bg-zinc-800 rounded-xl p-3">
              <div className="text-zinc-500 text-xs mb-1">ได้รับ</div>
              <div className="text-green-400 font-bold text-xl">+{stats.won.toLocaleString()}</div>
            </div>
            <div className="bg-zinc-800 rounded-xl p-3">
              <div className="text-zinc-500 text-xs mb-1">เสียไป</div>
              <div className="text-red-400 font-bold text-xl">-{stats.lost.toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-zinc-800 rounded-xl p-4 text-center">
            <div className="text-zinc-500 text-xs mb-1">กำไร/ขาดทุนสุทธิ</div>
            <div className={`font-display text-3xl font-bold ${stats.won - stats.lost >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.won - stats.lost >= 0 ? '+' : ''}{(stats.won - stats.lost).toLocaleString()}
            </div>
            {stats.spins > 10 && (
              <div className="text-zinc-600 text-xs mt-2">
                ยิ่งเล่นนาน ยิ่งใกล้ขาดทุน 30% ของเงินที่เล่นทั้งหมด
              </div>
            )}
          </div>

          {stats.spins > 0 && (
            <div className="bg-zinc-800 rounded-xl p-3">
              <div className="text-zinc-500 text-xs mb-2">อัตราชนะ vs ที่ควรจะเป็น</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-zinc-700 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full transition-all" style={{
                    width: `${Math.min(100, (stats.won / Math.max(1, stats.won + stats.lost)) * 100)}%`
                  }}/>
                </div>
                <span className="text-white text-sm">{((stats.won / Math.max(1, stats.won + stats.lost)) * 100).toFixed(1)}%</span>
              </div>
              <div className="text-zinc-600 text-xs mt-1">ค่าเฉลี่ยระยะยาว: ~70% (บ้านได้ 30%)</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
