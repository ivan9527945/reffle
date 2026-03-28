import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import type { RaffleState } from '../types'
import { useBlockWatcher } from '../hooks/useBitcoin'
import { formatBlockETA } from '../lib/utils'
import { useLocale } from '../i18n'

interface WaitingViewProps {
  raffle: RaffleState
  onMined: (hash: string) => void
  onHeightUpdate: (h: number) => void
}

export function WaitingView({ raffle, onMined, onHeightUpdate }: WaitingViewProps) {
  const { t } = useLocale()
  const { height, lastUpdated } = useBlockWatcher(raffle.targetBlock, onMined)

  useEffect(() => {
    if (height) onHeightUpdate(height)
  }, [height, onHeightUpdate])

  const blocksLeft = raffle.targetBlock && height ? Math.max(0, raffle.targetBlock - height) : null
  const total      = raffle.targetBlock && raffle.startBlock ? raffle.targetBlock - raffle.startBlock : 1
  const done       = raffle.startBlock && height ? Math.max(0, height - raffle.startBlock) : 0
  const progress   = Math.min(100, (done / total) * 100)
  const maxIdx     = raffle.participants.length - 1

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">⛏️</div>
        <h2 className="text-2xl sm:text-3xl font-black mb-2">{t('waiting.title')}</h2>
        <p className="text-muted-foreground text-[15px]">
          {t('waiting.subtitle', {
            title: raffle.title,
            block: raffle.targetBlock?.toLocaleString() ?? '',
          })}
        </p>
      </div>

      {/* Countdown card */}
      <Card className="mb-5">
        <CardContent className="pt-6 text-center">
          <p className="label-caps mb-5">{t('waiting.countdown')}</p>

          <div className="flex justify-center items-center gap-10 sm:gap-16 mb-8">
            <div className="stat">
              <div className="stat__value">
                {blocksLeft !== null ? blocksLeft : '—'}
              </div>
              <div className="stat__label">{t('waiting.blocksLeft')}</div>
            </div>

            <span className="text-muted-foreground text-2xl">≈</span>

            <div className="stat">
              <div className="stat__value stat__value--neutral text-4xl sm:text-5xl">
                {blocksLeft !== null && blocksLeft > 0
                  ? formatBlockETA(blocksLeft)
                  : blocksLeft === 0
                  ? '🎉'
                  : '—'}
              </div>
              <div className="stat__label">{t('waiting.estimatedTime')}</div>
            </div>
          </div>

          <Progress value={progress} className="mb-4" />

          <div className="flex justify-between text-xs mono text-muted-foreground">
            <span>{t('waiting.locked', { block: raffle.startBlock?.toLocaleString() ?? '' })}</span>
            <span>{t('waiting.target', { block: raffle.targetBlock?.toLocaleString() ?? '' })}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        {/* Current block */}
        <Card>
          <CardContent className="pt-6">
            <p className="label-caps mb-3">{t('waiting.latestBlock')}</p>
            <div className="mono text-3xl font-bold mb-1">
              {height ? `#${height.toLocaleString()}` : '—'}
            </div>
            <div className="text-muted-foreground text-[13px] mb-4">
              {lastUpdated
                ? t('waiting.updatedAt', { time: lastUpdated.toLocaleTimeString() })
                : t('waiting.waiting')}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-[13px]">
              <span className="spinner">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f7931a" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
              </span>
              {t('waiting.websocket')}
            </div>
          </CardContent>
        </Card>

        {/* Participants */}
        <Card>
          <CardContent className="pt-6">
            <p className="label-caps mb-3">
              {t('waiting.lockedList')}{' '}
              <span className="text-btc">{t('waiting.people', { count: raffle.participants.length })}</span>
            </p>
            <div className="overflow-y-auto max-h-44">
              {raffle.participants.map((name, i) => (
                <div key={i} className="participant-row">
                  <span className="participant-row__index">#{i}</span>
                  <span className="text-sm">{name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verify formula */}
      <Card>
        <CardHeader>
          <CardTitle>{t('waiting.formula.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="code-block text-sm space-y-1.5 mb-3">
            <div className="text-muted-foreground text-xs mb-2">{t('waiting.formula.desc')}</div>
            <div>
              <span className="text-btc">{t('waiting.formula.step1.label')}</span>
              {'  '}{t('waiting.formula.step1.desc', { block: raffle.targetBlock?.toLocaleString() ?? '' })}
            </div>
            <div>
              <span className="text-btc">{t('waiting.formula.step2.label')}</span>
              {'  '}→ <span className="mono">BigInt("0x" + blockHash)</span>
            </div>
            <div>
              <span className="text-btc">{t('waiting.formula.step3.label')}</span>
              {'   '}→ <span className="mono">% BigInt(<span className="text-btc">{raffle.participants.length}</span>)</span>
              {' '}{t('waiting.formula.step3.suffix', { max: maxIdx })}
            </div>
            <div>
              <span className="text-btc">{t('waiting.formula.step4.label')}</span>
              {' '}→ <span className="mono">participants[{t('waiting.formula.indexVar')}]</span>
              {' '}{t('waiting.formula.step4.suffix')}
            </div>
          </div>
          <div className="code-block mono text-xs text-muted-foreground">
            {`winner = participants[ BigInt("0x" + blockHash) % BigInt(${raffle.participants.length}) ]`}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
