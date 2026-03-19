import { useEffect, useRef } from 'react'

const BTC = '#f7931a'
const HEX_CHARS = '0123456789abcdef'
function randHex(n: number) {
  return Array.from({ length: n }, () => HEX_CHARS[Math.floor(Math.random() * 16)]).join('')
}
function rand(a: number, b: number) { return a + Math.random() * (b - a) }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

// ─── Isometric helpers ────────────────────────────────────────────────────────
const TW = 110
const TH = TW * 0.5 * 0.5
const DEPTH = 36

function iso(col: number, row: number, z: number = 0): [number, number] {
  const sx = (col - row) * (TW / 2)
  const sy = (col + row) * TH - z * DEPTH
  return [sx, sy]
}

// ─── Draw one isometric cube ──────────────────────────────────────────────────
function drawCube(
  ctx: CanvasRenderingContext2D,
  col: number, row: number,
  ox: number, oy: number,
  label: string, sub: string,
  flash: number,
  alpha: number,
  ts: number,
  fillPct: number = 0.75,
  isPending: boolean = false,
) {
  const [cx, cy] = iso(col, row, 1)
  const x = cx + ox
  const y = cy + oy
  const hw = TW / 2
  const flashA = flash * 0.8
  const pulse = Math.sin(ts * 0.004) * 0.5 + 0.5

  ctx.save()
  ctx.globalAlpha = alpha

  // ── Top face ──────────────────────────────────────────────
  ctx.beginPath()
  ctx.moveTo(x,      y - TH * 2)
  ctx.lineTo(x + hw, y - TH)
  ctx.lineTo(x,      y)
  ctx.lineTo(x - hw, y - TH)
  ctx.closePath()

  if (isPending) {
    ctx.fillStyle = `rgba(35,22,5,0.45)`
    ctx.fill()
    ctx.strokeStyle = `rgba(247,147,26,${0.2 + pulse * 0.25})`
    ctx.lineWidth = 1.0
    ctx.setLineDash([3, 5])
    ctx.stroke()
    ctx.setLineDash([])
  } else {
    ctx.fillStyle = `rgba(35,22,5,${0.92 + flashA * 0.08})`
    ctx.fill()

    // Block fullness gradient on top face
    if (fillPct > 0) {
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(x, y - TH * 2)
      ctx.lineTo(x + hw, y - TH)
      ctx.lineTo(x, y)
      ctx.lineTo(x - hw, y - TH)
      ctx.closePath()
      ctx.clip()
      const g = ctx.createLinearGradient(x, y, x, y - TH * 2)
      g.addColorStop(0,       `rgba(247,147,26,${0.10 * fillPct})`)
      g.addColorStop(fillPct, `rgba(247,147,26,${0.06 * fillPct})`)
      g.addColorStop(fillPct, `rgba(247,147,26,0)`)
      g.addColorStop(1,       `rgba(247,147,26,0)`)
      ctx.fillStyle = g
      ctx.fill()
      ctx.restore()
    }

    ctx.strokeStyle = `rgba(247,147,26,${0.55 + flashA * 0.45})`
    ctx.lineWidth = flash > 0 ? 1.5 : 0.8
    if (flash > 0) { ctx.shadowColor = BTC; ctx.shadowBlur = 14 * flash }
    ctx.stroke()
    ctx.shadowBlur = 0
  }

  // ── Left face ─────────────────────────────────────────────
  ctx.beginPath()
  ctx.moveTo(x - hw, y - TH)
  ctx.lineTo(x,      y)
  ctx.lineTo(x,      y + DEPTH)
  ctx.lineTo(x - hw, y - TH + DEPTH)
  ctx.closePath()
  ctx.fillStyle = isPending ? `rgba(20,12,2,0.35)` : `rgba(20,12,2,0.95)`
  ctx.fill()
  if (!isPending) {
    ctx.strokeStyle = `rgba(247,147,26,${0.2 + flashA * 0.3})`
    ctx.lineWidth = 0.6
    ctx.stroke()
  }

  // ── Right face ────────────────────────────────────────────
  ctx.beginPath()
  ctx.moveTo(x,      y)
  ctx.lineTo(x + hw, y - TH)
  ctx.lineTo(x + hw, y - TH + DEPTH)
  ctx.lineTo(x,      y + DEPTH)
  ctx.closePath()
  ctx.fillStyle = isPending ? `rgba(28,16,3,0.35)` : `rgba(28,16,3,0.95)`
  ctx.fill()
  if (!isPending) {
    ctx.strokeStyle = `rgba(247,147,26,${0.2 + flashA * 0.3})`
    ctx.stroke()
  }

  // ── Text labels ───────────────────────────────────────────
  if (isPending) {
    ctx.save()
    ctx.translate(x - 2, y - TH - 2)
    ctx.transform(1, -0.28, 0.5, 0.5, 0, 0)
    ctx.font = `7px 'JetBrains Mono', monospace`
    ctx.fillStyle = `rgba(247,147,26,${0.25 + pulse * 0.25})`
    ctx.fillText('mining...', 0, 0)
    ctx.restore()
  } else {
    ctx.save()
    ctx.translate(x - 2, y - TH - 2)
    ctx.transform(1, -0.28, 0.5, 0.5, 0, 0)
    ctx.font = `bold 9px 'JetBrains Mono', monospace`
    ctx.fillStyle = flash > 0 ? BTC : `rgba(247,147,26,0.85)`
    ctx.fillText(label, 0, 0)
    ctx.font = `7px 'JetBrains Mono', monospace`
    ctx.fillStyle = `rgba(247,147,26,0.45)`
    ctx.fillText(sub, 0, 10)
    ctx.restore()

    // ₿ on right face
    ctx.translate(x + hw - 12, y - TH / 2 + DEPTH / 2 - 4)
    ctx.font = `bold 11px sans-serif`
    ctx.fillStyle = flash > 0 ? BTC : `rgba(247,147,26,0.3)`
    ctx.fillText('₿', 0, 0)
  }

  ctx.restore()
}

// ─── Connector line ───────────────────────────────────────────────────────────
function drawLink(
  ctx: CanvasRenderingContext2D,
  c1: number, r1: number,
  c2: number, r2: number,
  ox: number, oy: number,
  alpha: number,
  ts: number,
  animated = false,
) {
  const [x1, y1] = iso(c1, r1, 0)
  const [x2, y2] = iso(c2, r2, 0)
  ctx.strokeStyle = `rgba(247,147,26,${alpha})`
  ctx.lineWidth = animated ? 1.1 : 0.8
  ctx.setLineDash([4, 6])
  ctx.lineDashOffset = animated ? -(ts * 0.025) % 10 : 0
  ctx.beginPath()
  ctx.moveTo(x1 + ox, y1 + oy)
  ctx.lineTo(x2 + ox, y2 + oy)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.lineDashOffset = 0
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface IsoBlock {
  col: number
  height: number
  hash: string
  birth: number
  dropZ: number
  fillPct: number
  txCount: number
}

interface Particle {
  x: number; y: number
  vx: number; vy: number
  life: number
}


interface Wave {
  x: number; y: number
  r: number; maxR: number
  alpha: number
}

interface NetNode {
  x: number; y: number
  pulsePhase: number
  connections: number[]
}

interface RainDrop {
  x: number; y: number
  speed: number
  chars: string[]
  alpha: number
  len: number
}

// ─── Component ────────────────────────────────────────────────────────────────
export function CryptoBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const ox = () => canvas.width / 2
    const oy = () => canvas.height * 0.62

    let baseH = 880000 + Math.floor(Math.random() * 5000)
    let blocks: IsoBlock[] = []
    let particles: Particle[] = []
    let waves: Wave[] = []
    let lastSpawn = -9999

    // ── Seed initial blocks ──────────────────────────────────────────────────
    const visibleCols = Math.ceil(canvas.width / (TW / 2)) + 4
    for (let i = 0; i < visibleCols; i++) {
      blocks.push({
        col: -Math.floor(visibleCols / 2) + i,
        height: baseH + i,
        hash: randHex(64),
        birth: -9999,
        dropZ: 0,
        fillPct: rand(0.5, 0.98),
        txCount: Math.floor(rand(800, 4500)),
      })
    }

    // ── Background hash rain ─────────────────────────────────────────────────
    const rainDrops: RainDrop[] = []
    const RAIN_SPACING = 7  // px between columns — smaller = denser
    const initRain = () => {
      rainDrops.length = 0
      const cols = Math.floor(canvas.width / RAIN_SPACING) + 2
      for (let i = 0; i < cols; i++) {
        const len = Math.floor(rand(14, 40))
        rainDrops.push({
          x: i * RAIN_SPACING + RAIN_SPACING / 2,
          y: rand(-canvas.height * 1.5, 0),
          speed: rand(0.6, 2.8),
          chars: Array.from({ length: len }, () => HEX_CHARS[Math.floor(Math.random() * 16)]),
          alpha: rand(0.10, 0.32),
          len,
        })
      }
    }
    initRain()

    // ── Background P2P network nodes ─────────────────────────────────────────
    const netNodes: NetNode[] = []
    const nodeCount = 18
    for (let i = 0; i < nodeCount; i++) {
      netNodes.push({
        x: rand(0, canvas.width),
        y: rand(0, canvas.height),
        pulsePhase: rand(0, Math.PI * 2),
        connections: [],
      })
    }
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = netNodes[i].x - netNodes[j].x
        const dy = netNodes[i].y - netNodes[j].y
        if (Math.sqrt(dx * dx + dy * dy) < canvas.width * 0.28) {
          netNodes[i].connections.push(j)
        }
      }
    }

    const spawnParticles = (sx: number, sy: number) => {
      for (let i = 0; i < 22; i++) {
        const a = Math.random() * Math.PI * 2
        const s = rand(0.4, 3.5)
        particles.push({ x: sx, y: sy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1 })
      }
    }

    let camCol = 0
    let animId: number

    const draw = (ts: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // ── 1. P2P network nodes (background) ───────────────────────────────────
      for (let i = 0; i < netNodes.length; i++) {
        const n = netNodes[i]
        const pulse = Math.sin(ts * 0.0009 + n.pulsePhase) * 0.5 + 0.5
        for (const j of n.connections) {
          const n2 = netNodes[j]
          ctx.strokeStyle = `rgba(247,147,26,${0.025 + pulse * 0.015})`
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(n.x, n.y)
          ctx.lineTo(n2.x, n2.y)
          ctx.stroke()
        }
        ctx.globalAlpha = 0.12 + pulse * 0.1
        ctx.fillStyle = BTC
        ctx.shadowColor = BTC
        ctx.shadowBlur = 5 * pulse
        ctx.beginPath()
        ctx.arc(n.x, n.y, 2 + pulse * 1.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
      }

      // ── 2. Hash rain ─────────────────────────────────────────────────────────
      ctx.font = `13px 'JetBrains Mono', monospace`
      for (const drop of rainDrops) {
        drop.y += drop.speed
        if (drop.y > canvas.height + drop.len * 15) {
          drop.y = rand(-canvas.height * 0.5, -20)
          drop.len = Math.floor(rand(14, 40))
          drop.speed = rand(0.6, 2.8)
          drop.alpha = rand(0.10, 0.32)
          drop.chars = Array.from({ length: drop.len }, () => HEX_CHARS[Math.floor(Math.random() * 16)])
        }
        if (Math.random() < 0.04) {
          drop.chars[Math.floor(Math.random() * drop.chars.length)] = HEX_CHARS[Math.floor(Math.random() * 16)]
        }
        for (let i = 0; i < drop.chars.length; i++) {
          const yy = drop.y - i * 15
          if (yy < 0 || yy > canvas.height) continue
          const headBoost = i === 0 ? 2.4 : i === 1 ? 1.6 : 1
          const a = drop.alpha * headBoost * (1 - i / drop.chars.length * 0.8)
          ctx.fillStyle = i === 0
            ? `rgba(255,210,120,${Math.min(a, 0.65)})`
            : `rgba(247,147,26,${Math.min(a, 0.42)})`
          ctx.fillText(drop.chars[i], drop.x, yy)
        }
      }

      // ── 3. Propagation waves ─────────────────────────────────────────────────
      waves = waves.filter(w => w.alpha > 0.008)
      for (const w of waves) {
        w.r = lerp(w.r, w.maxR, 0.04) + 1.2
        w.alpha *= 0.962
        ctx.strokeStyle = `rgba(247,147,26,${w.alpha})`
        ctx.lineWidth = 1.5
        ctx.shadowColor = BTC
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2)
        ctx.stroke()
        // Inner ring
        if (w.r > 30) {
          ctx.strokeStyle = `rgba(247,147,26,${w.alpha * 0.4})`
          ctx.lineWidth = 0.8
          ctx.beginPath()
          ctx.arc(w.x, w.y, w.r * 0.6, 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.shadowBlur = 0
      }

      // ── 5. Camera + new block spawning ───────────────────────────────────────
      camCol += 0.003
      blocks = blocks.filter(b => (b.col - camCol) > -Math.ceil(canvas.width / TW) - 2)

      const maxCol = blocks.reduce((m, b) => Math.max(m, b.col), -Infinity)
      if (ts - lastSpawn > 1000) {
        baseH++
        const nb: IsoBlock = {
          col: maxCol + 1,
          height: baseH,
          hash: randHex(64),
          birth: ts,
          dropZ: 6,
          fillPct: rand(0.45, 0.98),
          txCount: Math.floor(rand(800, 4500)),
        }
        blocks.push(nb)
        const [sx, sy] = iso(nb.col - camCol, 0, 1)
        const bx = sx + ox()
        const by = sy + oy() - DEPTH
        spawnParticles(bx, by)
        waves.push({ x: bx, y: by, r: 8, maxR: 220, alpha: 0.65 })
        lastSpawn = ts
      }

      // ── 6. Pending block (being mined) ───────────────────────────────────────
      const pendingScreenCol = maxCol + 1 - camCol
      const pendingScreenX = pendingScreenCol * (TW / 2) + ox()
      if (pendingScreenX > 0 && pendingScreenX < canvas.width * 0.95) {
        drawCube(
          ctx, pendingScreenCol, 0, ox(), oy(),
          `#${(baseH + 1).toLocaleString()}`, 'pending...',
          0, 0.28, ts, 0, true,
        )
      }

      // ── 7. Chain links ───────────────────────────────────────────────────────
      const sorted = [...blocks].sort((a, b) => a.col - b.col)
      for (let i = 0; i < sorted.length - 1; i++) {
        const b1 = sorted[i]; const b2 = sorted[i + 1]
        const screenX = (b1.col - camCol) * (TW / 2) + ox()
        const dist = Math.abs(screenX - canvas.width / 2)
        const alpha = dist > canvas.width * 0.68 ? 0 : 0.18
        const isNewest = i === sorted.length - 2
        drawLink(ctx, b1.col - camCol, 0, b2.col - camCol, 0, ox(), oy(), alpha, ts, isNewest)
      }
      // Link from last confirmed block to pending
      if (sorted.length > 0) {
        const last = sorted[sorted.length - 1]
        const lastScreenX = (last.col - camCol) * (TW / 2) + ox()
        const dist = Math.abs(lastScreenX - canvas.width / 2)
        if (dist < canvas.width * 0.68) {
          drawLink(ctx, last.col - camCol, 0, pendingScreenCol, 0, ox(), oy(), 0.10, ts, true)
        }
      }

      // ── 8. Draw confirmed blocks ─────────────────────────────────────────────
      for (const b of sorted) {
        if (b.dropZ > 0) b.dropZ = Math.max(0, b.dropZ - 0.12)

        const screenCol = b.col - camCol
        const screenX = screenCol * (TW / 2) + ox()
        const edgeFade = Math.max(0, 1 - Math.abs(screenX - canvas.width / 2) / (canvas.width * 0.55))
        if (edgeFade < 0.01) continue

        const flash = Math.max(0, 1 - (ts - b.birth) / 900)
        const subLabel = `${b.txCount.toLocaleString()}tx  ${b.hash.slice(0, 8)}…`

        drawCube(
          ctx, screenCol, 0,
          ox(), oy() - b.dropZ * DEPTH,
          `#${b.height.toLocaleString()}`,
          subLabel,
          flash,
          edgeFade * 0.88,
          ts,
          b.fillPct,
          false,
        )
      }

      // ── 9. Explosion particles ───────────────────────────────────────────────
      particles = particles.filter(p => p.life > 0)
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.055; p.life -= 0.02
        ctx.globalAlpha = p.life * 0.85
        ctx.fillStyle = BTC
        ctx.shadowColor = BTC; ctx.shadowBlur = 6
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill()
        ctx.shadowBlur = 0
      }
      ctx.globalAlpha = 1

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none',
        opacity: 0.7,
      }}
    />
  )
}
