import type { View } from '../types'
import { useLocale, type Locale } from '../i18n'

interface StepNavProps {
  view: View
}

function StepNav({ view }: StepNavProps) {
  const { t } = useLocale()
  const steps: { key: View; label: string }[] = [
    { key: 'setup',   label: t('nav.setup') },
    { key: 'waiting', label: t('nav.waiting') },
    { key: 'result',  label: t('nav.result') },
  ]

  const order: View[] = ['setup', 'waiting', 'result']
  const currentIdx = order.indexOf(view)

  return (
    <nav className="hidden sm:flex items-center gap-3">
      {steps.map((step, i) => {
        const isDone   = i < currentIdx
        const isActive = i === currentIdx
        return (
          <div key={step.key} className="flex items-center gap-3">
            <div className={`step-nav ${isActive ? 'step-nav--active' : ''} ${isDone ? 'step-nav--done' : ''}`}>
              <div className="step-nav__dot" />
              <span>{step.label}</span>
            </div>
            {i < steps.length - 1 && <span className="step-nav__divider">──</span>}
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
  const { locale, setLocale, t } = useLocale()

  const toggleLocale = () => setLocale(locale === 'en' ? 'zh-TW' : 'en')
  const localeLabel: Record<Locale, string> = { 'en': '繁中', 'zh-TW': 'EN' }

  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__brand">
          <div className="header__logo">₿</div>
          <div>
            <div className="header__name">BTC Raffle</div>
            <div className="header__sub">{t('header.subtitle')}</div>
          </div>
        </div>

        <StepNav view={view} />

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="header__live hidden sm:flex">
            <div className="header__live-dot" />
            <span className="mono">
              {currentHeight ? `BTC #${currentHeight.toLocaleString()}` : 'BTC # —'}
            </span>
          </div>
          <div className="header__live flex sm:hidden">
            <div className="header__live-dot" />
            <span className="mono text-xs">
              {currentHeight ? `#${currentHeight.toLocaleString()}` : '# —'}
            </span>
          </div>

          <button
            onClick={toggleLocale}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted whitespace-nowrap border border-border"
          >
            {localeLabel[locale]}
          </button>

          <button
            onClick={onReset}
            title={t('header.resetTitle')}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded hover:bg-destructive/10 whitespace-nowrap"
          >
            {t('header.restart')}
          </button>
        </div>
      </div>
    </header>
  )
}
