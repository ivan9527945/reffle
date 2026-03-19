import { useCallback } from 'react'
import { Header } from './components/Header'
import { SetupView } from './components/SetupView'
import { WaitingView } from './components/WaitingView'
import { ResultView } from './components/ResultView'
import { Toast } from './components/Toast'
import { useRaffle } from './hooks/useRaffle'
import { useCurrentHeight } from './hooks/useBitcoin'
import './styles/globals.scss'

export default function App() {
  const { view, raffle, lockRaffle, revealResult, reset } = useRaffle()
  const { height, poll } = useCurrentHeight(60_000)

  const handleHeightRefresh = useCallback(async () => {
    return poll()
  }, [poll])

  return (
    <>
      <Header view={view} currentHeight={height} />

      <main className="container py-10">
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
    </>
  )
}
