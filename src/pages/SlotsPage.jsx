import React, { useState, useEffect, useRef, useCallback } from 'react'
import api from '../utils/api'
import { useAuthStore } from '../context/authStore'
import toast from 'react-hot-toast'

// ─── Audio ────────────────────────────────────────────────────
function mkAudio() {
  let ctx = null
  const g = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx }
  const t = (f, type, d, v = 0.3, delay = 0) => {
    try {
      const c = g(), o = c.createOscillator(), gn = c.createGain()
      o.connect(gn); gn.connect(c.destination); o.type = type; o.frequency.value = f
      gn.gain.setValueAtTime(0, c.currentTime + delay)
      gn.gain.linearRampToValueAtTime(v, c.currentTime + delay + 0.01)
      gn.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + d)
      o.start(c.currentTime + delay); o.stop(c.currentTime + delay + d + 0.05)
    } catch {}
  }
  return {
    spin:    () => [80,120,160,200,120,80].forEach((f,i) => t(f,'square',0.08,0.12,i*0.05)),
    stop:    (i) => { t(200+i*50,'square',0.1,0.2); t(150+i*40,'square',0.07,0.15,0.06) },
    win:     () => [523,659,784].forEach((f,i) => t(f,'square',0.15,0.3,i*0.1)),
    bigwin:  () => [523,659,784,1047,1319,1047,784,1319].forEach((f,i) => t(f,'square',0.2,0.4,i*0.1)),
    jackpot: () => [523,659,784,1047,1319,1568,1319,1047,784,659,523,659,784,1047,1319,1568].forEach((f,i) => t(f,'square',0.25,0.5,i*0.09)),
    fs:      () => [400,500,600,800,1000,1200,1000,800].forEach((f,i) => t(f,'sine',0.3,0.45,i*0.1)),
    egg:     () => [800,1000,1200,1600,2000].forEach((f,i) => t(f,'sine',0.2,0.5,i*0.07)),
    lose:    () => { t(220,'sawtooth',0.2,0.2); t(160,'sawtooth',0.15,0.15,0.18) },
  }
}
const SFX = mkAudio()

// ─── Symbol Definitions ───────────────────────────────────────
const SYM = {
  dragon:      { color:'#ff4444', bg:'#1a0000', label:'DRAGON'  },
  gem:         { color:'#44ffff', bg:'#001a1a', label:'GEM'     },
  fire:        { color:'#ff8800', bg:'#1a0800', label:'FIRE'    },
  coin:        { color:'#ffdd00', bg:'#1a1400', label:'COIN'    },
  sword:       { color:'#aaaaff', bg:'#00001a', label:'SWORD'   },
  shield:      { color:'#88ff88', bg:'#001a00', label:'SHIELD'  },
  skull:       { color:'#888888', bg:'#0a0a0a', label:'SKULL'   },
  scatter:     { color:'#ff44ff', bg:'#1a001a', label:'SCATTER' },
  egg_red:     { color:'#ff8888', bg:'#1a0505', label:'×2',   mult:2    },
  egg_gold:    { color:'#ffcc00', bg:'#1a1200', label:'×5',   mult:5    },
  egg_silver:  { color:'#cccccc', bg:'#111',    label:'×10',  mult:10   },
  egg_emerald: { color:'#44ff88', bg:'#001a08', label:'×50',  mult:50   },
  egg_dragon:  { color:'#ff44ff', bg:'#1a001a', label:'×1000',mult:1000 },
}

const SPIN_POOL = ['skull','shield','sword','coin','fire','gem','dragon']

// ─── Pixel Art ────────────────────────────────────────────────
const PX = {
  dragon:[
    [0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0],[0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0],[0,1,1,1,2,1,1,1,1,1,1,2,1,1,0,0],
    [1,1,1,1,1,2,2,1,1,2,2,1,1,1,1,0],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[0,1,1,1,3,1,1,1,1,1,1,3,1,1,1,0],
    [0,0,1,1,1,3,3,1,1,3,3,1,1,1,0,0],[0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,0,1,1,1,1,0,1,1,1,0,0],[0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  ],
  gem:[
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,1,2,2,3,3,2,2,2,2,1,0,0,0],[0,0,1,2,2,3,2,2,2,2,2,2,2,1,0,0],
    [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],[1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],[1,1,2,2,2,2,2,2,2,2,2,2,2,2,1,1],
    [0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0],[0,0,1,1,2,2,2,2,2,2,2,2,1,1,0,0],
    [0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0],[0,0,0,0,1,1,2,2,2,2,1,1,0,0,0,0],
    [0,0,0,0,0,1,1,2,2,1,1,0,0,0,0,0],[0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  fire:[
    [0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0],[0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,2,2,1,1,0,0,0,0,0,0],[0,0,0,1,1,2,2,2,2,1,1,0,0,1,0,0],
    [0,0,1,1,2,2,2,2,2,2,1,1,0,1,1,0],[0,1,1,2,2,2,2,2,2,2,2,2,1,1,1,0],
    [1,1,2,2,2,2,3,3,3,2,2,2,2,1,1,0],[1,2,2,2,2,3,3,3,3,3,2,2,2,2,1,0],
    [1,2,2,2,3,3,2,2,2,3,3,2,2,2,1,0],[1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
    [1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,0],[0,1,1,2,2,2,2,2,2,2,2,2,1,1,0,0],
    [0,0,1,1,2,2,2,2,2,2,2,1,1,0,0,0],[0,0,0,1,1,1,2,2,2,1,1,1,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
  ],
  coin:[
    [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],[0,0,1,1,2,2,2,2,2,2,2,1,1,0,0,0],
    [0,1,1,2,2,2,2,2,2,2,2,2,1,1,0,0],[1,1,2,2,2,1,1,1,1,1,2,2,2,1,1,0],
    [1,2,2,2,1,1,2,2,2,1,1,2,2,2,1,0],[1,2,2,1,1,2,2,2,2,2,1,1,2,2,1,0],
    [1,2,2,1,2,2,2,2,2,2,2,1,2,2,1,0],[1,2,2,1,2,2,2,2,2,2,2,1,2,2,1,0],
    [1,2,2,1,1,2,2,2,2,2,1,1,2,2,1,0],[1,2,2,2,1,1,2,2,2,1,1,2,2,2,1,0],
    [1,1,2,2,2,1,1,1,1,1,2,2,2,1,1,0],[0,1,1,2,2,2,2,2,2,2,2,2,1,1,0,0],
    [0,0,1,1,2,2,2,2,2,2,2,1,1,0,0,0],[0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  sword:[
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,2,2,1,0,0],
    [0,0,0,0,0,0,0,0,0,1,2,2,1,0,0,0],[0,0,0,0,0,0,0,0,1,2,2,1,0,0,0,0],
    [0,0,0,0,0,0,0,1,2,2,1,0,0,0,0,0],[0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,2,1,0,0,0,0,0,0,0],[0,0,0,0,1,2,2,1,0,0,0,0,0,0,0,0],
    [0,0,0,1,2,2,1,0,0,0,0,0,0,0,0,0],[0,0,1,2,2,1,0,0,0,0,0,0,0,0,0,0],
    [0,1,2,2,1,0,0,0,0,0,0,0,0,0,0,0],[1,3,3,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [1,3,1,0,1,3,1,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,1,3,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  shield:[
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0],[1,1,2,2,2,2,2,2,2,2,2,2,2,2,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],[1,2,2,2,3,2,2,2,2,2,2,3,2,2,2,1],
    [1,2,2,2,2,3,2,2,2,2,3,2,2,2,2,1],[1,2,2,2,2,2,3,2,2,3,2,2,2,2,2,1],
    [1,2,2,2,2,2,2,3,3,2,2,2,2,2,2,1],[0,1,2,2,2,2,3,2,2,3,2,2,2,2,1,0],
    [0,0,1,2,2,3,2,2,2,2,3,2,2,1,0,0],[0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,0,0,0,1,1,2,2,2,2,1,1,0,0,0,0],[0,0,0,0,0,1,1,2,2,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  ],
  skull:[
    [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [1,1,2,2,2,1,1,1,1,1,2,2,2,1,1,0],[1,2,2,2,2,2,1,1,1,2,2,2,2,2,1,0],
    [1,2,2,2,2,2,1,1,1,2,2,2,2,2,1,0],[1,2,2,2,2,2,1,1,1,2,2,2,2,2,1,0],
    [1,1,2,2,2,1,1,1,1,1,2,2,2,1,1,0],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],[0,1,1,2,1,1,2,1,1,2,1,1,2,1,1,0],
    [0,1,2,2,2,2,2,1,2,2,2,2,2,1,1,0],[0,1,1,2,2,2,1,1,1,2,2,2,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0],[0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
  ],
}

// ─── SVG Components ───────────────────────────────────────────
function PixelSVG({ sym, size }) {
  const cfg = SYM[sym] || SYM.skull
  const grid = PX[sym] || PX.skull
  const px = size / 16
  const cm = { 1: cfg.color, 2: cfg.color + 'bb', 3: '#fff' }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ imageRendering:'pixelated', display:'block' }}>
      <rect width={size} height={size} fill={cfg.bg} rx="4"/>
      {grid.map((row, y) => row.map((v, x) => v ? <rect key={`${x}${y}`} x={x*px} y={y*px} width={px} height={px} fill={cm[v]}/> : null))}
    </svg>
  )
}

function ScatterSVG({ size }) {
  const c = size/2, r = size*0.42
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="#1a001a" rx="4"/>
      <circle cx={c} cy={c} r={r} fill="#6600aa" opacity="0.8"/>
      <circle cx={c} cy={c} r={r*.65} fill="#aa00ff" opacity="0.7"/>
      <circle cx={c} cy={c} r={r*.35} fill="#ff44ff"/>
      <circle cx={c*.72} cy={c*.72} r={r*.13} fill="white" opacity="0.8"/>
      <text x={c} y={c*1.38} textAnchor="middle" fontSize={size*.19} fill="#ffaaff" fontWeight="bold" fontFamily="monospace">SC</text>
    </svg>
  )
}

function EggSVG({ sym, size }) {
  const cfg = SYM[sym] || SYM.egg_red
  const c = size/2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill={cfg.bg} rx="4"/>
      <ellipse cx={c} cy={c*1.1} rx={size*.3} ry={size*.36} fill={cfg.color} opacity="0.85"/>
      <ellipse cx={c*.78} cy={c*.75} rx={size*.09} ry={size*.11} fill="white" opacity="0.45"/>
      <path d={`M${c-3} ${c} l3-5 l3 5 l-2 4`} fill="none" stroke="#000" strokeWidth="1.2" opacity="0.5"/>
      <text x={c} y={size*.87} textAnchor="middle" fontSize={size*.19} fill={cfg.color} fontWeight="bold" fontFamily="monospace">{cfg.label}</text>
    </svg>
  )
}

function SymIcon({ sym, size = 52, win = false, dim = false }) {
  const cfg = SYM[sym] || SYM.skull
  const content = sym === 'scatter' ? <ScatterSVG size={size}/> :
                  sym?.startsWith('egg_') ? <EggSVG sym={sym} size={size}/> :
                  <PixelSVG sym={sym} size={size}/>
  return (
    <div style={{
      opacity: dim ? 0.35 : 1,
      filter: win ? `drop-shadow(0 0 6px ${cfg.color}) drop-shadow(0 0 12px ${cfg.color})` : 'none',
      transform: win ? 'scale(1.08)' : 'scale(1)',
      transition: 'all 0.25s',
    }}>
      {content}
    </div>
  )
}

// ─── Reel Column (spinning animation) ────────────────────────
function ReelCol({ colData, spinning, colIdx, winCells, isFreeSpins }) {
  const [display, setDisplay] = useState(colData || Array(5).fill({ sym:'skull' }))
  const timerRef = useRef(null)
  const frameRef = useRef(0)

  useEffect(() => {
    if (spinning) {
      timerRef.current = setInterval(() => {
        frameRef.current++
        setDisplay(Array(5).fill(null).map(() => ({ sym: SPIN_POOL[Math.floor(Math.random() * SPIN_POOL.length)] })))
      }, 55)
    } else {
      clearInterval(timerRef.current)
      if (colData) {
        // Stagger reveal by column
        setTimeout(() => setDisplay(colData), colIdx * 120)
      }
    }
    return () => clearInterval(timerRef.current)
  }, [spinning, colData])

  return (
    <div
      className="flex flex-col gap-1 rounded-xl overflow-hidden p-1"
      style={{
        background: '#0a0500',
        border: `1.5px solid ${spinning ? '#ff4444' : isFreeSpins ? '#ff440066' : '#1a0a00'}`,
        boxShadow: spinning ? '0 0 10px #ff444433' : 'none',
        transition: 'border-color 0.3s',
        minWidth: 0,
      }}
    >
      {display.map((cell, rowIdx) => {
        const sym = cell?.sym || 'skull'
        const key = `${colIdx},${rowIdx}`
        const isWin = winCells?.includes(key)
        return (
          <div key={rowIdx}
            className="flex items-center justify-center rounded"
            style={{
              background: isWin ? '#1a0a00' : 'transparent',
              outline: isWin ? `1.5px solid ${SYM[sym]?.color || '#ff8800'}` : 'none',
              padding: 2,
            }}
          >
            {spinning
              ? <PixelSVG sym={sym} size={46}/>
              : <SymIcon sym={sym} size={46} win={isWin}/>
            }
          </div>
        )
      })}
    </div>
  )
}

// ─── Particles ────────────────────────────────────────────────
function Particles({ on, big }) {
  if (!on) return null
  const cols = big ? ['#ff4444','#ffdd00','#ff8800','#ff44ff','#44ffff','#fff'] : ['#ffdd00','#ff8800','#88ff88']
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:100, overflow:'hidden' }}>
      {Array.from({ length: big?55:22 }).map((_,i) => (
        <div key={i} style={{
          position:'absolute', left:`${Math.random()*100}%`, top:'-5%',
          width: big?11:6, height: big?11:6, background: cols[i%cols.length],
          borderRadius: Math.random()>.5?'50%':'2px',
          animation:`pfx ${.8+Math.random()*1.5}s linear ${Math.random()*.8}s forwards`,
        }}/>
      ))}
      <style>{`@keyframes pfx{to{transform:translateY(110vh) rotate(720deg);opacity:0}}`}</style>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────
export default function SlotsPage() {
  const { balance, setBalance } = useAuthStore()
  const [grid, setGrid]           = useState(null)
  const [spinning, setSpinning]   = useState(false)
  const [amount, setAmount]       = useState(100)
  const [wins, setWins]           = useState([])
  const [winCells, setWinCells]   = useState([])
  const [totalWin, setTotalWin]   = useState(null)
  const [particles, setParticles] = useState(false)
  const [bigWin, setBigWin]       = useState(false)
  const [jackpot, setJackpot]     = useState(false)
  const [eggs, setEggs]           = useState([])
  const [eggMultDisplay, setEggMultDisplay] = useState(1)

  // Free spins
  const [fsCount, setFsCount]   = useState(0)
  const [fsMode, setFsMode]     = useState(false)
  const [fsMult, setFsMult]     = useState(2)
  const [totalEggMult, setTotalEggMult] = useState(1)
  const fsRef       = useRef(0)
  const fsMultRef   = useRef(2)
  const eggsRef     = useRef(1)

  const [stats, setStats]     = useState({ spins:0, won:0, lost:0 })
  const [history, setHistory] = useState([])
  const [tab, setTab]         = useState('game')

  // Auto spin
  const [autoCount, setAutoCount]   = useState(0)   // remaiming auto spins
  const [autoTotal, setAutoTotal]   = useState(10)  // selected total
  const [autoRunning, setAutoRunning] = useState(false)
  const [autoStopWin, setAutoStopWin] = useState(0) // stop if win >= this (0=disabled)
  const autoRunRef = useRef(false)

  const spinningRef = useRef(false)
  const amountRef   = useRef(amount)
  const balanceRef  = useRef(balance)
  useEffect(() => { amountRef.current = amount }, [amount])
  useEffect(() => { balanceRef.current = balance }, [balance])

  const doSpin = useCallback(async (isFS = false) => {
    if (spinningRef.current) return
    if (!isFS && amountRef.current < 10) return toast.error('เดิมพันขั้นต่ำ 10 เหรียญ')
    if (!isFS && amountRef.current > balanceRef.current) return toast.error('ยอดเงินไม่พอ')
    spinningRef.current = true

    setSpinning(true); setWins([]); setWinCells([])
    setTotalWin(null); setParticles(false); setBigWin(false)
    setJackpot(false); setEggs([])
    SFX.spin()

    try {
      const ep  = isFS ? '/slots/freespin' : '/slots/spin'
      const amt = amountRef.current
      const pay = isFS ? { amount: amt, freeMult: fsMultRef.current } : { amount: amt }
      const { data } = await api.post(ep, pay)

      await new Promise(r => setTimeout(r, 700))
      setGrid(data.grid)
      setSpinning(false)
      await new Promise(r => setTimeout(r, 750))

      setWins(data.wins || [])
      setWinCells(data.winCells || [])
      setTotalWin(data.totalWin)
      setBalance(data.balance)

      // Eggs
      if (data.eggs?.length) {
        setEggs(data.eggs)
        setEggMultDisplay(data.eggMult)
        eggsRef.current *= data.eggMult
        setTotalEggMult(eggsRef.current)
        SFX.egg()
        toast(`🥚 Dragon Egg ×${data.eggMult}! รวม ×${eggsRef.current}`, { icon:'🐉', duration:3000 })
      }

      const isJP  = data.wins?.some(w => w.sym==='dragon' && w.count===5)
      const isBig = data.totalWin >= amt * 15
      setStats(s => ({ spins:s.spins+1, won:s.won+(data.totalWin||0), lost:s.lost+(!isFS&&!data.totalWin?amt:0) }))

      if (isJP)       { setJackpot(true);setBigWin(true);setParticles(true); SFX.jackpot(); toast.success(`🐉 DRAGON JACKPOT! +${data.totalWin.toLocaleString()}`,{duration:6000}) }
      else if (isBig) { setBigWin(true);setParticles(true); SFX.bigwin(); toast.success(`💰 BIG WIN +${data.totalWin.toLocaleString()}`,{duration:4000}) }
      else if (data.totalWin > 0) { setParticles(true); SFX.win() }
      else if (!isFS) SFX.lose()

      setHistory(p => [{ wins:data.wins, total:data.totalWin, amount:amt, isFS }, ...p.slice(0,9)])
      setTimeout(() => setParticles(false), 3500)

      // Trigger free spins
      if (!isFS && data.freeSpinsAwarded > 0) {
        await new Promise(r => setTimeout(r, 1500))
        SFX.fs()
        toast.success(`🌀 FREE SPINS! +${data.freeSpinsAwarded} รอบ ×2!`, {duration:4000})
        fsRef.current = data.freeSpinsAwarded
        fsMultRef.current = 2; eggsRef.current = 1
        setFsCount(data.freeSpinsAwarded); setFsMult(2)
        setTotalEggMult(1); setFsMode(true)
        spinningRef.current = false
        await new Promise(r => setTimeout(r, 1500))
        doSpin(true)
      }

      // Retrigger
      if (isFS && data.retrigger > 0) {
        fsRef.current += data.retrigger
        const nm = Math.min(fsMultRef.current + 1, 10)
        fsMultRef.current = nm
        setFsCount(fsRef.current); setFsMult(nm)
        toast(`🔄 Retrigger! +${data.retrigger} รอบ ×${nm}`, {icon:'⚡', duration:3000})
      }

      // Continue free spins
      if (isFS) {
        fsRef.current -= 1
        setFsCount(fsRef.current)
        if (fsRef.current <= 0) {
          setFsMode(false); setFsMult(2)
          if (eggsRef.current > 1) toast.success(`🥚 Egg Bonus รวม ×${eggsRef.current}!`, {duration:4000})
          eggsRef.current = 1; setTotalEggMult(1)
          spinningRef.current = false
        } else {
          spinningRef.current = false
          await new Promise(r => setTimeout(r, 900))
          doSpin(true)
        }
      } else {
        spinningRef.current = false
      }
    } catch(e) {
      toast.error(e.response?.data?.error || 'เกิดข้อผิดพลาด')
      spinningRef.current = false
      setSpinning(false)
    }
  }, [])

  const displayGrid = grid || Array.from({length:5}, () => Array(5).fill({sym:'skull'}))
  const PAY_TABLE = [
    {sym:'dragon',m3:75,m4:300,m5:1000,special:'WILD'},
    {sym:'gem',   m3:25,m4:100,m5:400},
    {sym:'fire',  m3:15,m4:60, m5:200},
    {sym:'coin',  m3:8, m4:30, m5:100},
    {sym:'sword', m3:5, m4:15, m5:50},
    {sym:'shield',m3:3, m4:10, m5:30},
    {sym:'skull', m3:2, m4:6,  m5:15},
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <style>{`
        @keyframes fireFlick{0%,100%{opacity:1}50%{opacity:.85}}
        @keyframes jpPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
      `}</style>
      <Particles on={particles} big={bigWin}/>

      {/* Title */}
      <div className="text-center mb-3">
        <h2 className="font-display text-4xl" style={{
          color: fsMode ? '#ff3333' : '#ff6633',
          textShadow: fsMode ? '0 0 30px #ff333388,0 0 60px #ff333344' : '0 0 20px #ff663344',
          animation: jackpot ? 'jpPulse .4s infinite' : fsMode ? 'fireFlick .5s infinite' : 'none',
        }}>🐉 DRAGON SLOTS 🐉</h2>
        <p className="text-zinc-600 text-xs mt-1">5×5 • 20 PAYLINES • SCATTER • DRAGON EGGS</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-3 justify-center">
        {[['game','🎰 เล่น'],['paytable','💰 รางวัล'],['stats','📊 สถิติ']].map(([k,l]) => (
          <button key={k} onClick={()=>setTab(k)} className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{background:tab===k?'#ff4444':'#1a0800',color:tab===k?'#fff':'#888',border:'1px solid #ff440033'}}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'game' && (
        <>
          <div className="relative rounded-2xl p-4 mb-3" style={{
            background: fsMode ? 'linear-gradient(180deg,#2a0000,#1a0000)' : 'linear-gradient(180deg,#1a0800,#0d0400)',
            border: `2px solid ${fsMode?'#ff4444':'#ff440033'}`,
            boxShadow: fsMode ? '0 0 40px #ff444433,0 0 80px #ff444411' : '0 0 20px #ff440011',
            transition: 'all .5s',
          }}>
            {/* Fire bg */}
            {fsMode && (
              <div style={{position:'absolute',inset:0,borderRadius:14,pointerEvents:'none',zIndex:0,
                background:'radial-gradient(ellipse at bottom,#ff220022 0%,transparent 65%)',
                animation:'fireFlick .3s infinite'}}/>
            )}

            <div style={{position:'relative',zIndex:1}}>
              {/* Free spins HUD */}
              {fsMode && (
                <div className="mb-3 rounded-xl p-2.5 flex items-center justify-center gap-6 text-center"
                  style={{background:'#1a0000',border:'1px solid #ff4444'}}>
                  <div>
                    <div className="text-xl font-display text-red-400">🆓 FREE SPINS</div>
                    <div className="text-3xl font-bold text-yellow-400">{fsCount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400">Multiplier</div>
                    <div className="text-2xl font-bold text-orange-400">×{fsMult}</div>
                  </div>
                  {totalEggMult > 1 && (
                    <div className="animate-bounce">
                      <div className="text-xs text-zinc-400">🥚 Egg</div>
                      <div className="text-2xl font-bold text-pink-400">×{totalEggMult}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Win display */}
              <div className="text-center mb-2 h-8 flex items-center justify-center">
                {jackpot ? (
                  <div className="font-display text-xl animate-bounce" style={{color:'#ffdd00',textShadow:'0 0 15px #ffdd00'}}>
                    🐉 JACKPOT! +{totalWin?.toLocaleString()}
                  </div>
                ) : totalWin > 0 ? (
                  <div className="font-display text-lg animate-bounce" style={{color:'#ffdd00'}}>
                    {fsMode?'🆓 ':''}WIN! +{totalWin.toLocaleString()}
                    {eggMultDisplay > 1 && ` (🥚×${eggMultDisplay})`}
                  </div>
                ) : spinning ? (
                  <div className="text-zinc-600 text-sm animate-pulse">SPINNING...</div>
                ) : (
                  <div className="text-zinc-800 text-sm">{fsMode?'🔥 FREE SPINS MODE':'PRESS SPIN'}</div>
                )}
              </div>

              {/* 5×5 Grid */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6,marginBottom:12}}>
                {displayGrid.map((col, ci) => (
                  <ReelCol
                    key={ci}
                    colData={col}
                    spinning={spinning}
                    colIdx={ci}
                    winCells={winCells}
                    isFreeSpins={fsMode}
                  />
                ))}
              </div>

              {/* Win lines */}
              {wins.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center mb-2">
                  {wins.slice(0,8).map((w,i) => (
                    <div key={i} className="text-xs rounded-full px-2.5 py-0.5"
                      style={{background:'#ff880022',border:'1px solid #ff880066',color:'#ff8800'}}>
                      {w.sym.toUpperCase()} ×{w.count} = +{w.win.toLocaleString()}
                    </div>
                  ))}
                  {wins.length > 8 && <div className="text-xs text-zinc-600">+{wins.length-8} more</div>}
                </div>
              )}

              {/* Eggs */}
              {eggs.length > 0 && (
                <div className="flex gap-2 justify-center mb-2 animate-bounce">
                  {eggs.map((e,i) => (
                    <div key={i} className="flex flex-col items-center">
                      <SymIcon sym={e.sym} size={38} win/>
                      <div className="text-xs mt-0.5" style={{color:SYM[e.sym]?.color}}>×{e.mult}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Scatter counter */}
              {!spinning && grid && (() => {
                let sc = 0; grid.forEach(col => col.forEach(cell => { if(cell?.sym==='scatter') sc++ }))
                return sc > 0 ? (
                  <div className="text-center mb-2 text-sm" style={{color:'#ff44ff'}}>
                    🔮 Scatter: {sc} ตัว {sc >= 3 ? `→ ${sc>=5?25:sc>=4?15:10} Free Spins!` : `(ต้องการอีก ${3-sc} ตัว)`}
                  </div>
                ) : null
              })()}

              {/* Controls */}
              <div className="flex gap-3 items-center mt-2">
                <div className="flex-1">
                  <input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))}
                    disabled={fsMode}
                    className="w-full rounded-xl px-4 py-2.5 text-center font-bold focus:outline-none disabled:opacity-40"
                    style={{background:'#0a0500',border:'1px solid #ff440066',color:'#ffdd00',fontSize:17}}
                    min={10}/>
                  <div className="flex gap-1 mt-1.5 justify-center">
                    {[50,100,500,1000,5000].map(v => (
                      <button key={v} onClick={()=>!fsMode&&setAmount(v)} disabled={fsMode}
                        className="text-xs rounded-lg px-2 py-0.5 disabled:opacity-30 transition-colors"
                        style={{background:amount===v?'#ff4444':'#1a0800',color:amount===v?'#fff':'#666',border:'1px solid #ff440022'}}>
                        {v>=1000?`${v/1000}K`:v}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={()=>doSpin(fsMode)} disabled={spinning||fsMode||autoRunning}
                    className="font-display text-2xl font-bold rounded-2xl active:scale-95 disabled:opacity-40"
                    style={{
                      background:spinning||fsMode||autoRunning?'#1a0800':'linear-gradient(180deg,#ff6644,#cc2200)',
                      color:'#fff', padding:'14px 26px',
                      boxShadow:spinning||fsMode||autoRunning?'none':'0 0 25px #ff444466,0 4px 0 #881100',
                      border:'2px solid #ff4444', minWidth:100,
                    }}>
                    {fsMode?'🔥 AUTO':spinning?'⏳':'SPIN'}
                  </button>

                  {/* Auto Spin Button */}
                  {!fsMode && (
                    autoRunning ? (
                      <button onClick={stopAuto}
                        className="rounded-xl font-bold text-sm active:scale-95 animate-pulse"
                        style={{background:'#aa2200',color:'#fff',padding:'8px 16px',border:'1px solid #ff4444'}}>
                        ⏹ STOP ({autoCount})
                      </button>
                    ) : (
                      <div className="flex gap-1">
                        <select value={autoTotal} onChange={e=>setAutoTotal(Number(e.target.value))}
                          className="flex-1 rounded-lg text-xs text-center focus:outline-none"
                          style={{background:'#1a0800',color:'#aaa',border:'1px solid #ff440033',padding:'6px 2px'}}>
                          {[10,25,50,100].map(v=><option key={v} value={v}>{v}x</option>)}
                        </select>
                        <button onClick={startAuto} disabled={spinning}
                          className="flex-1 rounded-lg font-bold text-xs disabled:opacity-40 active:scale-95"
                          style={{background:'#1a3300',color:'#88ff44',padding:'6px 8px',border:'1px solid #44ff4433'}}>
                          ▶ AUTO
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="mt-2 text-center text-sm font-semibold" style={{color:'#ffdd00'}}>
                💰 {balance?.toLocaleString()} เหรียญ
              </div>
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="card-felt p-3">
              <div className="text-zinc-500 text-xs mb-1.5">ประวัติล่าสุด</div>
              {history.slice(0,5).map((h,i) => (
                <div key={i} className="flex justify-between items-center py-1 border-b border-zinc-800 last:border-0 text-sm">
                  <div className="flex items-center gap-1.5">
                    {h.isFS && <span className="text-xs bg-red-900/60 text-red-300 rounded px-1">FREE</span>}
                    <span className="text-zinc-600 text-xs">{h.wins?.length>0?h.wins.slice(0,3).map(w=>w.sym).join(', '):'no win'}</span>
                  </div>
                  <span className={h.total>0?'text-green-400 font-semibold':'text-red-400'}>
                    {h.total>0?`+${h.total.toLocaleString()}`:`-${h.amount.toLocaleString()}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'paytable' && (
        <div className="card-felt p-4 space-y-4">
          <div>
            <div className="text-gold-400 font-semibold mb-2 text-sm">สัญลักษณ์ปกติ — 3/4/5 เรียงใน payline</div>
            <div className="space-y-1.5">
              {PAY_TABLE.map(p => (
                <div key={p.sym} className="flex items-center gap-3 bg-zinc-800/80 rounded-lg px-3 py-1.5">
                  <SymIcon sym={p.sym} size={34}/>
                  <span className="text-white flex-1 text-sm">{SYM[p.sym]?.label}</span>
                  {p.special && <span className="text-xs text-gold-400 bg-gold-400/10 rounded px-1.5 py-0.5">{p.special}</span>}
                  <div className="text-right text-xs text-zinc-400">
                    <span className="text-white">{p.m3}x</span> / <span className="text-orange-400">{p.m4}x</span> / <span className="text-red-400">{p.m5}x</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-gold-400 font-semibold mb-2 text-sm">🔮 Scatter — ออกที่ไหนก็ได้</div>
            <div className="bg-zinc-800/80 rounded-lg px-3 py-2 flex items-center gap-3">
              <ScatterSVG size={34}/>
              <div className="text-xs text-zinc-300">3 ตัว = 10 FS | 4 ตัว = 15 FS | 5 ตัว = 25 FS<br/>Retrigger ได้ระหว่าง Free Spins | Multiplier เพิ่มทุก Retrigger</div>
            </div>
          </div>
          <div>
            <div className="text-gold-400 font-semibold mb-2 text-sm">🥚 Dragon Eggs — เฉพาะ Free Spins</div>
            <div className="space-y-1">
              {Object.entries(SYM).filter(([k])=>k.startsWith('egg_')).map(([sym,cfg]) => (
                <div key={sym} className="flex items-center gap-3 bg-zinc-800/80 rounded-lg px-3 py-1.5">
                  <EggSVG sym={sym} size={34}/>
                  <div className="flex-1">
                    <div className="text-sm font-bold" style={{color:cfg.color}}>{cfg.label}</div>
                    <div className="text-xs text-zinc-600">คูณรวมกับ Egg อื่นในรอบเดียวกัน</div>
                  </div>
                </div>
              ))}
              <div className="text-xs text-zinc-600 mt-1">ตัวอย่าง: ×5 + ×10 = win ทั้งหมด ×50</div>
            </div>
          </div>
          <div className="text-xs text-zinc-600">20 paylines: แนวนอน 5 เส้น + แนวทแยง + V/W/Zigzag shapes<br/>RTP ~70% | บ้านได้กำไร ~30% ระยะยาว</div>
        </div>
      )}

      {tab === 'stats' && (
        <div className="card-felt p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-zinc-800 rounded-xl p-3"><div className="text-zinc-500 text-xs mb-1">หมุนทั้งหมด</div><div className="text-white font-bold text-xl">{stats.spins}</div></div>
            <div className="bg-zinc-800 rounded-xl p-3"><div className="text-zinc-500 text-xs mb-1">ได้รับ</div><div className="text-green-400 font-bold text-xl">+{stats.won.toLocaleString()}</div></div>
            <div className="bg-zinc-800 rounded-xl p-3"><div className="text-zinc-500 text-xs mb-1">เสียไป</div><div className="text-red-400 font-bold text-xl">-{stats.lost.toLocaleString()}</div></div>
          </div>
          <div className="bg-zinc-800 rounded-xl p-4 text-center">
            <div className="text-zinc-500 text-xs mb-1">กำไร/ขาดทุนสุทธิ</div>
            <div className={`font-display text-3xl font-bold ${stats.won-stats.lost>=0?'text-green-400':'text-red-400'}`}>
              {stats.won-stats.lost>=0?'+':''}{(stats.won-stats.lost).toLocaleString()}
            </div>
            {stats.spins > 5 && <div className="text-zinc-600 text-xs mt-1">ยิ่งเล่นนาน ยิ่งใกล้ขาดทุน 30%</div>}
          </div>
        </div>
      )}
    </div>
  )
}