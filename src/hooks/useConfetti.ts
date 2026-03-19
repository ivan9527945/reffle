import { useCallback } from 'react'

const COLORS = ['#f7931a', '#ffb347', '#ffffff', '#22c55e', '#3b82f6', '#a855f7']

export function useConfetti() {
  const launch = useCallback(() => {
    for (let i = 0; i < 80; i++) {
      setTimeout(() => {
        const el = document.createElement('div')
        const size = 6 + Math.random() * 10
        Object.assign(el.style, {
          position: 'fixed',
          width: size + 'px',
          height: size + 'px',
          top: '-10px',
          left: Math.random() * 100 + 'vw',
          background: COLORS[Math.floor(Math.random() * COLORS.length)],
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          zIndex: '1000',
          pointerEvents: 'none',
          animation: `confetti-fall ${2 + Math.random() * 3}s linear forwards`,
        })
        document.body.appendChild(el)
        setTimeout(() => el.remove(), 5000)
      }, i * 30)
    }
  }, [])

  return { launch }
}
