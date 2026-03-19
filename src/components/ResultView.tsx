import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import type { RaffleState } from '../types'
import { determineWinner, isValidHash, copyToClipboard } from '../lib/utils'
import { mempoolBlockUrl } from '../lib/bitcoin'
import { useConfetti } from '../hooks/useConfetti'
import { useToast } from './Toast'

interface ResultViewProps {
  raffle: RaffleState
  onReset: () => void
}

function buildCalcSteps(hash: string, count: number, index: number, winner: string): string {
  const hashBig = BigInt('0x' + hash)
  return [
    `// 1. 取得區塊 hash（十六進位）`,
    `blockHash = "${hash.slice(0, 16)}..."`,
    ``,
    `// 2. 轉換為大整數`,
    `hashBigInt = BigInt("0x" + blockHash)`,
    `           = ${hashBig.toString().slice(0, 36)}...`,
    ``,
    `// 3. 取模（除以參與人數取餘數）`,
    `index = hashBigInt % ${count}`,
    `      = ${index}`,
    ``,
    `// 4. 得出得獎者（從 0 開始計算）`,
    `winner = participants[${index}]`,
    `       = "${winner}"`,
  ].join('\n')
}

// ─── Interactive Verifier ───────────────────────────────────────────
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
  const [hash, setHash] = useState(raffle.resultHash ?? '')
  const [names, setNames] = useState(raffle.participants.join('\n'))
  const [verdict, setVerdict] = useState<VerdictState | null>(null)

  // Auto-fill when raffle result arrives
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
      setVerdict({
        status: 'error',
        message: '❌ 無效的 hash 格式。Bitcoin 區塊 hash 為 64 位十六進位字元。',
        steps: '', winner: '', index: -1,
      })
      return
    }
    if (nameList.length < 2) {
      setVerdict({
        status: 'error',
        message: '❌ 請輸入至少 2 個名字。',
        steps: '', winner: '', index: -1,
      })
      return
    }

    const index = determineWinner(h, nameList)
    const winner = nameList[index]
    const steps = buildCalcSteps(h, nameList.length, index, winner)

    // Compare with actual result
    const actualHash = raffle.resultHash?.toLowerCase()
    const actualWinner = raffle.winnerIndex !== null ? raffle.participants[raffle.winnerIndex] : null

    let status: VerdictState['status'] = 'warning'
    let message = `計算完成。得獎者：${winner}（第 ${index} 位）`

    if (actualHash) {
      if (h.toLowerCase() === actualHash && winner === actualWinner) {
        status = 'success'
        message = `✅ 驗算結果與本次抽獎完全吻合！得獎者：${winner}`
      } else if (h.toLowerCase() !== actualHash) {
        status = 'warning'
        message = `⚠️ 此 hash 與本次開獎區塊不同，但計算正確。得獎者：${winner}`
      } else {
        status = 'error'
        message = `❌ 結果不符！可能是名單順序有誤。計算出：${winner}，本次記錄：${actualWinner}`
      }
    }

    setVerdict({ status, message, steps, winner, index })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🧮 自行驗算工具</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-[13px] leading-relaxed -mt-2">
          任何人都可以貼上區塊 hash 與名單，在此頁面獨立驗算結果是否相符。不需要信任任何人。
        </p>

        <div>
          <label className="label-caps block mb-1.5">區塊 Hash（從 mempool.space 取得）</label>
          <input
            className="input-field mono"
            value={hash}
            onChange={e => setHash(e.target.value)}
            placeholder="000000000000000000024b4f8e8d1f..."
          />
        </div>

        <div>
          <label className="label-caps block mb-1.5">名單（每行一個，順序需與原始名單一致）</label>
          <textarea
            className="input-field mono"
            rows={6}
            value={names}
            onChange={e => setNames(e.target.value)}
          />
        </div>

        <Button variant="verify" onClick={run}>▶ 執行驗算</Button>

        {verdict && verdict.steps && (
          <>
            <div className="border-t border-border pt-4">
              <label className="label-caps block mb-2">計算步驟</label>
              <pre className="code-block">{verdict.steps}</pre>
            </div>
            <div className={`verdict verdict--${verdict.status}`}>
              {verdict.message}
            </div>
          </>
        )}
        {verdict && !verdict.steps && (
          <div className={`verdict verdict--${verdict.status}`}>
            {verdict.message}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Main Result View ───────────────────────────────────────────────
export function ResultView({ raffle, onReset }: ResultViewProps) {
  const { launch } = useConfetti()
  const { show } = useToast()

  useEffect(() => { launch() }, [launch])

  if (raffle.winnerIndex === null || !raffle.resultHash) return null

  const winner = raffle.participants[raffle.winnerIndex]
  const hash = raffle.resultHash
  const count = raffle.participants.length
  const index = raffle.winnerIndex
  const calcSteps = buildCalcSteps(hash, count, index, winner)

  const handleCopy = async () => {
    const text = [
      '【BTC Raffle 公平抽獎驗證】',
      `抽獎名稱: ${raffle.title}`,
      `開獎區塊: #${raffle.targetBlock}`,
      `區塊 Hash: ${hash}`,
      `參與人數: ${count}`,
      `得獎者: ${winner}（第 ${index} 位，從 0 計算）`,
      '',
      '驗算方式:',
      `1. 到 ${mempoolBlockUrl(hash)} 確認區塊`,
      `2. 執行: BigInt("0x" + blockHash) % ${count}n`,
      `3. 結果為 ${index}，對應名單第 ${index} 位：${winner}`,
      '',
      '參與名單（依序）:',
      ...raffle.participants.map((n, i) => `${i}. ${n}`),
    ].join('\n')
    await copyToClipboard(text)
    show('✅ 已複製驗證資訊')
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl sm:text-4xl font-black mb-2">區塊出礦！</h2>
        <p className="text-muted-foreground">比特幣網路已決定得獎者</p>
      </div>

      {/* Winner card */}
      <Card className="card--winner text-center mb-5">
        <CardContent className="py-10">
          <p className="label-caps text-btc mb-3">得獎者</p>
          <div className="text-5xl sm:text-6xl font-black break-all leading-tight">{winner}</div>
          <p className="text-muted-foreground text-sm mt-4">
            從 {count} 位參與者中，由比特幣區塊 #{raffle.targetBlock?.toLocaleString()} 決出
          </p>
        </CardContent>
      </Card>

      {/* Proof */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle>🔍 可驗證計算過程</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="label-caps block mb-1.5">開獎區塊</label>
            <div className="mono font-bold text-btc text-lg">#{raffle.targetBlock?.toLocaleString()}</div>
          </div>
          <div>
            <label className="label-caps block mb-1.5">區塊 Hash</label>
            <div className="hash-display">{hash}</div>
          </div>
          <div>
            <label className="label-caps block mb-1.5">計算過程</label>
            <pre className="code-block">{calcSteps}</pre>
          </div>
        </CardContent>
      </Card>

      {/* All participants */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle className="text-foreground">所有參與者（依抽籤順序）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1">
            {raffle.participants.map((name, i) => {
              const isWinner = i === raffle.winnerIndex
              return (
                <div
                  key={i}
                  className={`participant-row ${isWinner ? 'participant-row--winner' : ''}`}
                >
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
          📋 複製驗證資訊
        </Button>
        <Button
          variant="outline"
          className="flex-1 min-w-[140px]"
          onClick={() => window.open(mempoolBlockUrl(hash), '_blank')}
        >
          🔗 在 mempool.space 驗證
        </Button>
        <Button className="flex-1 min-w-[140px]" onClick={onReset}>
          ₿ 新建一次抽獎
        </Button>
      </div>
    </div>
  )
}
