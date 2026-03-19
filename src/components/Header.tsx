import type { View } from '../types'

interface StepNavProps {
  view: View
}

function StepNav({ view }: StepNavProps) {
  const steps: { key: View; label: string }[] = [
    { key: 'setup', label: '設定抽獎' },
    { key: 'waiting', label: '等待出礦' },
    { key: 'result', label: '揭曉結果' },
  ]

  const order: View[] = ['setup', 'waiting', 'result']
  const currentIdx = order.indexOf(view)

  return (
    <nav className="hidden sm:flex items-center gap-3">
      {steps.map((step, i) => {
        const isDone = i < currentIdx
        const isActive = i === currentIdx
        return (
          <div key={step.key} className="flex items-center gap-3">
            <div
              className={`step-nav ${isActive ? 'step-nav--active' : ''} ${isDone ? 'step-nav--done' : ''}`}
            >
              <div className="step-nav__dot" />
              <span>{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <span className="step-nav__divider">──</span>
            )}
          </div>
        )
      })}
    </nav>
  )
}

interface HeaderProps {
  view: View
  currentHeight: number | null
  onReset: () => void
}

export function Header({ view, currentHeight, onReset }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__brand">
          <div className="header__logo">₿</div>
          <div>
            <div className="header__name">BTC Raffle</div>
            <div className="header__sub">比特幣區塊公平抽獎</div>
          </div>
        </div>

        <StepNav view={view} />

        <div className="flex items-center gap-3">
          <div className="header__live">
            <div className="header__live-dot" />
            <span className="mono">
              {currentHeight ? `BTC #${currentHeight.toLocaleString()}` : 'BTC # —'}
            </span>
          </div>
          <button
            onClick={onReset}
            title="清除資料"
            className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded hover:bg-destructive/10"
          >
            重新開始
          </button>
        </div>
      </div>
    </header>
  )
}
