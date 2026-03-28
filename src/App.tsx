import { useCallback } from 'react'
import { Header } from './components/Header'
import { SetupView } from './components/SetupView'
import { WaitingView } from './components/WaitingView'
import { ResultView } from './components/ResultView'
import { Toast } from './components/Toast'
import { CryptoBackground } from './components/CryptoBackground'
import { useRaffle } from './hooks/useRaffle'
import { useCurrentHeight } from './hooks/useBitcoin'
import { LocaleProvider } from './i18n'
import './styles/globals.scss'

export default function App() {
  const { view, raffle, lockRaffle, revealResult, reset } = useRaffle()
  const { height, poll } = useCurrentHeight()

  const handleHeightRefresh = useCallback(async () => {
    return poll()
  }, [poll])

  return (
    <LocaleProvider>
    <div style={{ position: 'relative', zIndex: 1 }}>
      <CryptoBackground />

      <Header view={view} currentHeight={height} onReset={reset} />

      <main className="container px-4 py-6 sm:px-8 sm:py-10">
        {view === 'setup' && (
          <SetupView
            onLock={lockRaffle}
            currentHeight={height}
            onHeightRefresh={handleHeightRefresh}
          />
        )}

        {view === 'waiting' && (
          <WaitingView
            raffle={raffle}
            onMined={revealResult}
            onHeightUpdate={() => {}}
          />
        )}

        {view === 'result' && (
          <ResultView raffle={raffle} onReset={reset} />
        )}
      </main>

      <Toast />
    </div>
    </LocaleProvider>
  )
}
