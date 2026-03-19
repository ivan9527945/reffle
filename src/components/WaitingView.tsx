import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import type { RaffleState } from '../types'
import { useBlockWatcher } from '../hooks/useBitcoin'
import { formatBlockETA } from '../lib/utils'

interface WaitingViewProps {
  raffle: RaffleState
  onMined: (hash: string) => void
  onHeightUpdate: (h: number) => void
}

export function WaitingView({ raffle, onMined, onHeightUpdate }: WaitingViewProps) {
  const { height, lastUpdated } = useBlockWatcher(raffle.targetBlock, onMined)

  useEffect(() => {
    if (height) onHeightUpdate(height)
  }, [height, onHeightUpdate])

  const blocksLeft = raffle.targetBlock && height ? Math.max(0, raffle.targetBlock - height) : null
  const total = raffle.targetBlock && raffle.startBlock ? raffle.targetBlock - raffle.startBlock : 1
  const done = raffle.startBlock && height ? Math.max(0, height - raffle.startBlock) : 0
  const progress = Math.min(100, (done / total) * 100)

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">⛏️</div>
        <h2 className="text-2xl sm:text-3xl font-black mb-2">等待礦工出礦</h2>
        <p className="text-muted-foreground text-[15px]">
          「{raffle.title}」— 等待區塊 #{raffle.targetBlock?.toLocaleString()} 出礦
        </p>
      </div>

      {/* Countdown card */}
      <Card className="mb-5">
        <CardContent className="pt-6 text-center">
          <p className="label-caps mb-5">開獎倒數</p>

          <div className="flex justify-center items-center gap-10 sm:gap-16 mb-8">
            <div className="stat">
              <div className="stat__value">
                {blocksLeft !== null ? blocksLeft : '—'}
              </div>
              <div className="stat__label">區塊剩餘</div>
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
              <div className="stat__label">預計時間</div>
            </div>
          </div>

          <Progress value={progress} className="mb-4" />

          <div className="flex justify-between text-xs mono text-muted-foreground">
            <span>鎖定 #{raffle.startBlock?.toLocaleString()}</span>
            <span>目標 #{raffle.targetBlock?.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        {/* Current block */}
        <Card>
          <CardContent className="pt-6">
            <p className="label-caps mb-3">最新區塊</p>
            <div className="mono text-3xl font-bold mb-1">
              {height ? `#${height.toLocaleString()}` : '—'}
            </div>
            <div className="text-muted-foreground text-[13px] mb-4">
              {lastUpdated
                ? `更新於 ${lastUpdated.toLocaleTimeString()}`
                : '等待中...'}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-[13px]">
              <span className="spinner">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f7931a" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
              </span>
              WebSocket 即時更新
            </div>
          </CardContent>
        </Card>

        {/* Participants */}
        <Card>
          <CardContent className="pt-6">
            <p className="label-caps mb-3">
              已鎖定名單{' '}
              <span className="text-btc">{raffle.participants.length} 人</span>
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
          <CardTitle>📐 開獎計算公式</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="code-block text-sm space-y-1.5 mb-3">
            <div className="text-muted-foreground text-xs mb-2">出礦後，任何人都可以用以下步驟自行驗算：</div>
            <div>
              <span className="text-btc">① 取得 hash</span>
              {'  '}→ 至 <span className="mono">mempool.space</span> 查詢區塊 <span className="mono text-btc">#{raffle.targetBlock?.toLocaleString()}</span> 的 Block Hash
            </div>
            <div>
              <span className="text-btc">② 轉為數字</span>
              {'  '}→ <span className="mono">BigInt("0x" + blockHash)</span>
            </div>
            <div>
              <span className="text-btc">③ 取餘數</span>
              {'   '}→ <span className="mono">% BigInt(<span className="text-btc">{raffle.participants.length}</span>)</span>{' '}← 得到索引 0 ～ {raffle.participants.length - 1}
            </div>
            <div>
              <span className="text-btc">④ 對應得獎者</span>
              {' '}→ <span className="mono">participants[索引]</span>{' '}← 名單第 1 位索引為 0
            </div>
          </div>
          <div className="code-block mono text-xs text-muted-foreground">
            {`得獎者 = participants[ BigInt("0x" + blockHash) % BigInt(${raffle.participants.length}) ]`}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
