import { useState, useCallback } from 'react'
import type { KeyboardEvent } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Badge } from './ui/badge'
import { fetchCurrentHeight } from '../lib/bitcoin'
import { formatBlockETA } from '../lib/utils'
import { useToast } from './Toast'

interface SetupViewProps {
  onLock: (title: string, participants: string[], targetBlock: number, startBlock: number) => void
  currentHeight: number | null
  onHeightRefresh: () => Promise<number | null>
}

export function SetupView({ onLock, currentHeight, onHeightRefresh }: SetupViewProps) {
  const { show } = useToast()
  const [title, setTitle] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [batchInput, setBatchInput] = useState('')
  const [participants, setParticipants] = useState<string[]>([])
  const [targetBlock, setTargetBlock] = useState<string>('')
  const [blockETA, setBlockETA] = useState<{ text: string; valid: boolean } | null>(null)
  const [locking, setLocking] = useState(false)

  // ── Participants
  const addOne = useCallback(() => {
    const name = nameInput.trim()
    if (!name) return
    if (participants.includes(name)) { show(`"${name}" 已在名單中`); return }
    setParticipants(p => [...p, name])
    setNameInput('')
  }, [nameInput, participants, show])

  const addBatch = useCallback(() => {
    const names = batchInput
      .split(/[\n,]/)
      .map(n => n.trim())
      .filter(n => n.length > 0 && !participants.includes(n))
    setParticipants(p => [...p, ...names])
    setBatchInput('')
    show(`已加入 ${names.length} 人`)
  }, [batchInput, participants, show])

  const remove = useCallback((i: number) => {
    setParticipants(p => p.filter((_, idx) => idx !== i))
  }, [])

  const handleNameKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addOne()
  }

  // ── Block ETA
  const updateETA = useCallback((val: string, height: number | null) => {
    const n = parseInt(val)
    if (!n || !height) { setBlockETA(null); return }
    if (n <= height) {
      setBlockETA({ text: '⚠️ 此區塊已出礦，請選擇更高的區塊', valid: false })
    } else {
      const left = n - height
      setBlockETA({ text: `⏱ ${left} 個區塊後開獎，預計 ${formatBlockETA(left)} 後`, valid: true })
    }
  }, [])

  const handleBlockInput = (val: string) => {
    setTargetBlock(val)
    updateETA(val, currentHeight)
  }

  const suggestBlock = async () => {
    const h = await onHeightRefresh()
    if (!h) { show('無法連線到比特幣網路'); return }
    const suggested = String(h + 6)
    setTargetBlock(suggested)
    updateETA(suggested, h)
  }

  // ── Lock
  const canLock =
    title.trim().length > 0 &&
    participants.length >= 2 &&
    blockETA?.valid === true

  const handleLock = async () => {
    setLocking(true)
    try {
      const h = await fetchCurrentHeight()
      const target = parseInt(targetBlock)
      if (target <= h) { show('目標區塊已出礦，請重新選擇'); return }
      onLock(title.trim(), participants, target, h)
    } catch {
      show('無法連線到比特幣網路')
    } finally {
      setLocking(false)
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="text-6xl mb-5 animate-float inline-block">⛏️</div>
        <h1 className="text-3xl sm:text-4xl font-black mb-3">
          公平抽獎，<span className="text-btc">由比特幣決定</span>
        </h1>
        <p className="text-muted-foreground mx-auto max-w-lg leading-relaxed text-[15px]">
          指定未來一個比特幣區塊，當礦工出礦時，用區塊 hash 決定得獎者。
          結果完全公開、可驗證，任何人都能自行計算確認。
        </p>
      </div>

      {/* How it works */}
      <div className="flex flex-wrap gap-3 justify-center mb-10">
        {['📝 輸入參與名單', '⛏️ 指定開獎區塊', '🔗 等待出礦', '🏆 Hash 決定贏家'].map((s, i, arr) => (
          <div key={s} className="flex items-center gap-3">
            <Badge>{s}</Badge>
            {i < arr.length - 1 && <span className="text-muted-foreground text-sm">→</span>}
          </div>
        ))}
      </div>

      {/* Form card */}
      <Card className="mb-5">
        <CardContent className="space-y-6 pt-6">

          {/* Title */}
          <div>
            <label className="label-caps block mb-2">抽獎名稱</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例：2024 年度員工抽獎"
            />
          </div>

          {/* Participants */}
          <div>
            <label className="label-caps block mb-2">
              參與者名單{' '}
              <span className="text-btc">（{participants.length} 人）</span>
            </label>

            <Tabs defaultValue="single">
              <TabsList>
                <TabsTrigger value="single">逐一輸入</TabsTrigger>
                <TabsTrigger value="batch">批量貼上</TabsTrigger>
              </TabsList>

              <TabsContent value="single">
                <div className="flex gap-2">
                  <Input
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    onKeyDown={handleNameKey}
                    placeholder="輸入名字後按 Enter 或點加入"
                  />
                  <Button onClick={addOne} className="shrink-0">加入</Button>
                </div>
              </TabsContent>

              <TabsContent value="batch">
                <textarea
                  className="input-field"
                  rows={5}
                  value={batchInput}
                  onChange={e => setBatchInput(e.target.value)}
                  placeholder={'每行一個名字，或用逗號分隔：\nAlice\nBob\nCharlie\n\n或：Alice, Bob, Charlie'}
                />
                <Button variant="outline" size="sm" onClick={addBatch} className="mt-2">
                  匯入名單
                </Button>
              </TabsContent>
            </Tabs>

            {/* Chips */}
            <div className="flex flex-wrap gap-2 mt-4 min-h-[40px]">
              {participants.length === 0 ? (
                <span className="text-muted-foreground text-sm">尚未加入任何參與者</span>
              ) : (
                participants.map((name, i) => (
                  <div key={i} className="chip">
                    <span className="chip__index">#{i + 1}</span>
                    <span>{name}</span>
                    <button className="chip__remove" onClick={() => remove(i)}>×</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Target block */}
          <div>
            <label className="label-caps block mb-2">開獎區塊高度</label>
            <div className="flex gap-2">
              <Input
                type="number"
                className="mono flex-1"
                value={targetBlock}
                onChange={e => handleBlockInput(e.target.value)}
                placeholder="輸入區塊高度..."
              />
              <Button variant="outline" onClick={suggestBlock} className="shrink-0">
                推薦下一個 ⚡
              </Button>
            </div>
            {blockETA && (
              <p className={`text-sm mt-2 ${blockETA.valid ? 'text-btc' : 'text-destructive'}`}>
                {blockETA.text}
              </p>
            )}
            <p className="text-muted-foreground text-xs mt-2 flex items-center gap-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
              比特幣平均每 10 分鐘出一個區塊。建議選未來 6 個以上確保安全。
            </p>
          </div>

          {/* Lock button */}
          <Button
            size="lg"
            className="w-full text-base"
            disabled={!canLock || locking}
            onClick={handleLock}
          >
            {locking ? '連線中...' : '🔒 鎖定名單，開始等待出礦'}
          </Button>
        </CardContent>
      </Card>

      {/* Why fair */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ 為什麼這樣設計是公平的？</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: '🎲',
                title: '無法預測',
                body: '比特幣區塊 hash 由全球礦工競爭產出，任何人（包含主辦方）都無法提前知道結果。',
              },
              {
                icon: '🔍',
                title: '可公開驗證',
                body: '任何人都可以在 mempool.space 查到區塊 hash，自行計算 hash mod 人數確認結果正確。',
              },
              {
                icon: '🚫',
                title: '不可竄改',
                body: '名單鎖定後不可更動，配合區塊 hash，主辦方無法干預或造假結果。',
              },
            ].map(item => (
              <div key={item.title}>
                <div className="font-semibold text-sm mb-1.5">{item.icon} {item.title}</div>
                <div className="text-muted-foreground text-[13px] leading-relaxed">{item.body}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
