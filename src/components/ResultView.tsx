import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import type { RaffleState } from '../types'
import { determineWinner, isValidHash, copyToClipboard } from '../lib/utils'
import { mempoolBlockUrl } from '../lib/bitcoin'
import { useConfetti } from '../hooks/useConfetti'
import { useToast } from './Toast'
import { useLocale, type TFunc } from '../i18n'

interface ResultViewProps {
  raffle: RaffleState
  onReset: () => void
}

function buildCalcSteps(
  hash: string, count: number, index: number, winner: string, t: TFunc,
): string {
  const hashBig = BigInt('0x' + hash)
  return [
    `// ${t('calc.step1Comment')}`,
    `blockHash = "${hash.slice(0, 16)}..."`,
    ``,
    `// ${t('calc.step2Comment')}`,
    `hashBigInt = BigInt("0x" + blockHash)`,
    `           = ${hashBig.toString().slice(0, 36)}...`,
    ``,
    `// ${t('calc.step3Comment')}`,
    `${t('calc.index')} = hashBigInt % ${count}`,
    `      = ${index}`,
    ``,
    `// ${t('calc.step4Comment')}`,
    `${t('calc.winner')} = participants[${index}]`,
    `       = "${winner}"`,
  ].join('\n')
}

// ─── Interactive Verifier ────────────────────────────────────────────────────
interface VerifierProps {
  raffle: RaffleState
}

interface VerdictState {
  status: 'success' | 'warning' | 'error'
  message: string
  steps: string
  winner: string
  index: number
}

function Verifier({ raffle }: VerifierProps) {
  const { t } = useLocale()
  const [hash, setHash]       = useState(raffle.resultHash ?? '')
  const [names, setNames]     = useState(raffle.participants.join('\n'))
  const [verdict, setVerdict] = useState<VerdictState | null>(null)

  useEffect(() => {
    if (raffle.resultHash) setHash(raffle.resultHash)
    setNames(raffle.participants.join('\n'))
  }, [raffle.resultHash, raffle.participants])

  const run = () => {
    const h = hash.trim()
    const nameList = names
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0)

    if (!isValidHash(h)) {
      setVerdict({ status: 'error', message: t('result.verifier.invalidHash'), steps: '', winner: '', index: -1 })
      return
    }
    if (nameList.length < 2) {
      setVerdict({ status: 'error', message: t('result.verifier.tooFew'), steps: '', winner: '', index: -1 })
      return
    }

    const index  = determineWinner(h, nameList)
    const winner = nameList[index]
    const steps  = buildCalcSteps(h, nameList.length, index, winner, t)

    const actualHash   = raffle.resultHash?.toLowerCase()
    const actualWinner = raffle.winnerIndex !== null ? raffle.participants[raffle.winnerIndex] : null

    let status: VerdictState['status'] = 'warning'
    let message = t('result.verifier.done', { winner, index })

    if (actualHash) {
      if (h.toLowerCase() === actualHash && winner === actualWinner) {
        status  = 'success'
        message = t('result.verifier.match', { winner })
      } else if (h.toLowerCase() !== actualHash) {
        status  = 'warning'
        message = t('result.verifier.diffHash', { winner })
      } else {
        status  = 'error'
        message = t('result.verifier.mismatch', { calc: winner, actual: actualWinner ?? '' })
      }
    }

    setVerdict({ status, message, steps, winner, index })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('result.verifier.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-[13px] leading-relaxed -mt-2">
          {t('result.verifier.desc')}
        </p>

        <div>
          <label className="label-caps block mb-1.5">{t('result.verifier.hashLabel')}</label>
          <input
            className="input-field mono"
            value={hash}
            onChange={e => setHash(e.target.value)}
            placeholder="000000000000000000024b4f8e8d1f..."
          />
        </div>

        <div>
          <label className="label-caps block mb-1.5">{t('result.verifier.listLabel')}</label>
          <textarea
            className="input-field mono"
            rows={6}
            value={names}
            onChange={e => setNames(e.target.value)}
          />
        </div>

        <Button variant="verify" onClick={run}>{t('result.verifier.run')}</Button>

        {verdict && verdict.steps && (
          <>
            <div className="border-t border-border pt-4">
              <label className="label-caps block mb-2">{t('result.verifier.calcSteps')}</label>
              <pre className="code-block">{verdict.steps}</pre>
            </div>
            <div className={`verdict verdict--${verdict.status}`}>{verdict.message}</div>
          </>
        )}
        {verdict && !verdict.steps && (
          <div className={`verdict verdict--${verdict.status}`}>{verdict.message}</div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Main Result View ────────────────────────────────────────────────────────
export function ResultView({ raffle, onReset }: ResultViewProps) {
  const { launch } = useConfetti()
  const { show }   = useToast()
  const { t }      = useLocale()

  useEffect(() => { launch() }, [launch])

  if (raffle.winnerIndex === null || !raffle.resultHash) return null

  const winner    = raffle.participants[raffle.winnerIndex]
  const hash      = raffle.resultHash
  const count     = raffle.participants.length
  const index     = raffle.winnerIndex
  const calcSteps = buildCalcSteps(hash, count, index, winner, t)

  const handleCopy = async () => {
    const text = [
      t('copy.header'),
      `${t('copy.raffleName')} ${raffle.title}`,
      `${t('copy.drawBlock')} #${raffle.targetBlock}`,
      `${t('copy.blockHash')} ${hash}`,
      `${t('copy.participantCount')} ${count}`,
      t('copy.winner', { winner, index }),
      '',
      t('copy.verifyMethod'),
      t('copy.verifyStep1', { url: mempoolBlockUrl(hash) }),
      t('copy.verifyStep2', { count }),
      t('copy.verifyStep3', { index, winner }),
      '',
      t('copy.participantList'),
      ...raffle.participants.map((n, i) => `${i}. ${n}`),
    ].join('\n')
    await copyToClipboard(text)
    show(t('toast.copied'))
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl sm:text-4xl font-black mb-2">{t('result.mined')}</h2>
        <p className="text-muted-foreground">{t('result.decided')}</p>
      </div>

      {/* Winner card */}
      <Card className="card--winner text-center mb-5">
        <CardContent className="py-10">
          <p className="label-caps text-btc mb-3">{t('result.winner')}</p>
          <div className="text-5xl sm:text-6xl font-black break-all leading-tight">{winner}</div>
          <p className="text-muted-foreground text-sm mt-4">
            {t('result.from', { count, block: raffle.targetBlock?.toLocaleString() ?? '' })}
          </p>
        </CardContent>
      </Card>

      {/* Proof */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle>{t('result.proof.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="label-caps block mb-1.5">{t('result.proof.drawBlock')}</label>
            <div className="mono font-bold text-btc text-lg">#{raffle.targetBlock?.toLocaleString()}</div>
          </div>
          <div>
            <label className="label-caps block mb-1.5">{t('result.proof.blockHash')}</label>
            <div className="hash-display">{hash}</div>
          </div>
          <div>
            <label className="label-caps block mb-1.5">{t('result.proof.calcProcess')}</label>
            <pre className="code-block">{calcSteps}</pre>
          </div>
        </CardContent>
      </Card>

      {/* All participants */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle className="text-foreground">{t('result.allParticipants')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1">
            {raffle.participants.map((name, i) => {
              const isWinner = i === raffle.winnerIndex
              return (
                <div key={i} className={`participant-row ${isWinner ? 'participant-row--winner' : ''}`}>
                  <span className="participant-row__index">#{i}</span>
                  <span className={`flex-1 text-sm ${isWinner ? 'font-bold text-base' : ''}`}>{name}</span>
                  {isWinner && <span className="text-lg">🏆</span>}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Verifier */}
      <div className="mb-5">
        <Verifier raffle={raffle} />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" className="flex-1 min-w-[140px]" onClick={handleCopy}>
          {t('result.copy')}
        </Button>
        <Button
          variant="outline"
          className="flex-1 min-w-[140px]"
          onClick={() => window.open(mempoolBlockUrl(hash), '_blank')}
        >
          {t('result.verify')}
        </Button>
        <Button className="flex-1 min-w-[140px]" onClick={onReset}>
          {t('result.newRaffle')}
        </Button>
      </div>
    </div>
  )
}
