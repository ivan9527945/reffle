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
import { useLocale } from '../i18n'

interface SetupViewProps {
  onLock: (title: string, participants: string[], targetBlock: number, startBlock: number) => void
  currentHeight: number | null
  onHeightRefresh: () => Promise<number | null>
}

export function SetupView({ onLock, currentHeight, onHeightRefresh }: SetupViewProps) {
  const { show } = useToast()
  const { t } = useLocale()

  const [title, setTitle]             = useState('')
  const [nameInput, setNameInput]     = useState('')
  const [batchInput, setBatchInput]   = useState('')
  const [participants, setParticipants] = useState<string[]>([])
  const [targetBlock, setTargetBlock] = useState<string>('')
  // Store raw blockETA data; display text is derived on render so locale changes auto-update it
  const [blockETA, setBlockETA]       = useState<{ left: number; valid: boolean } | null>(null)
  const [locking, setLocking]         = useState(false)

  // ── Participants ───────────────────────────────────────────────────────────
  const addOne = useCallback(() => {
    const name = nameInput.trim()
    if (!name) return
    if (participants.includes(name)) { show(t('toast.alreadyInList', { name })); return }
    setParticipants(p => [...p, name])
    setNameInput('')
  }, [nameInput, participants, show, t])

  const addBatch = useCallback(() => {
    const names = batchInput
      .split(/[\n,]/)
      .map(n => n.trim())
      .filter(n => n.length > 0 && !participants.includes(n))
    setParticipants(p => [...p, ...names])
    setBatchInput('')
    show(t('toast.added', { count: names.length }))
  }, [batchInput, participants, show, t])

  const remove = useCallback((i: number) => {
    setParticipants(p => p.filter((_, idx) => idx !== i))
  }, [])

  const handleNameKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addOne()
  }

  // ── Block ETA ──────────────────────────────────────────────────────────────
  const updateETA = useCallback((val: string, height: number | null) => {
    const n = parseInt(val)
    if (!n || !height) { setBlockETA(null); return }
    if (n <= height) {
      setBlockETA({ left: 0, valid: false })
    } else {
      setBlockETA({ left: n - height, valid: true })
    }
  }, [])

  const handleBlockInput = (val: string) => {
    setTargetBlock(val)
    updateETA(val, currentHeight)
  }

  const suggestBlock = async () => {
    const h = await onHeightRefresh()
    if (!h) { show(t('toast.noConnection')); return }
    const suggested = String(h + 1)
    setTargetBlock(suggested)
    updateETA(suggested, h)
  }

  // ── Lock ───────────────────────────────────────────────────────────────────
  const canLock = title.trim().length > 0 && participants.length >= 2 && blockETA?.valid === true

  const handleLock = async () => {
    setLocking(true)
    try {
      const h = await fetchCurrentHeight()
      const target = parseInt(targetBlock)
      if (target <= h) { show(t('toast.blockMined')); return }
      onLock(title.trim(), participants, target, h)
    } catch {
      show(t('toast.noConnection'))
    } finally {
      setLocking(false)
    }
  }

  const fairPoints = [
    { icon: '🎲', titleKey: 'setup.whyFair.unpredictable.title', bodyKey: 'setup.whyFair.unpredictable.body' },
    { icon: '🔍', titleKey: 'setup.whyFair.verifiable.title',    bodyKey: 'setup.whyFair.verifiable.body' },
    { icon: '🚫', titleKey: 'setup.whyFair.tamperProof.title',   bodyKey: 'setup.whyFair.tamperProof.body' },
  ]

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="text-6xl mb-5 animate-float inline-block">⛏️</div>
        <h1 className="text-3xl sm:text-4xl font-black mb-3">
          {t('setup.hero.titleStart')}<span className="text-btc">{t('setup.hero.titleHighlight')}</span>
        </h1>
        <p className="text-muted-foreground mx-auto leading-relaxed text-[15px] whitespace-nowrap overflow-hidden text-ellipsis">
          {t('setup.hero.desc')}
        </p>
      </div>

      {/* How it works */}
      <div className="flex flex-wrap gap-3 justify-center mb-10">
        {([0, 1, 2] as const).map((idx) => (
          <div key={idx} className="flex items-center gap-3">
            <Badge>{t(`setup.steps.${idx}`)}</Badge>
            {idx < 2 && <span className="text-muted-foreground text-sm">→</span>}
          </div>
        ))}
      </div>

      {/* Form card */}
      <Card className="mb-5">
        <CardContent className="space-y-6 pt-6">

          {/* Title */}
          <div>
            <label className="label-caps block mb-2">{t('setup.raffleName')}</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('setup.raffleNamePlaceholder')}
            />
          </div>

          {/* Participants */}
          <div>
            <label className="label-caps block mb-2">
              {t('setup.participants')}{' '}
              <span className="text-btc">{t('setup.participantCount', { count: participants.length })}</span>
            </label>

            <Tabs defaultValue="single">
              <TabsList>
                <TabsTrigger value="single">{t('setup.addOne')}</TabsTrigger>
                <TabsTrigger value="batch">{t('setup.batchPaste')}</TabsTrigger>
              </TabsList>

              <TabsContent value="single">
                <div className="flex gap-2">
                  <Input
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    onKeyDown={handleNameKey}
                    placeholder={t('setup.namePlaceholder')}
                  />
                  <Button onClick={addOne} className="shrink-0">{t('setup.add')}</Button>
                </div>
              </TabsContent>

              <TabsContent value="batch">
                <textarea
                  className="input-field"
                  rows={5}
                  value={batchInput}
                  onChange={e => setBatchInput(e.target.value)}
                  placeholder={t('setup.batchPlaceholder')}
                />
                <Button variant="outline" size="sm" onClick={addBatch} className="mt-2">
                  {t('setup.importList')}
                </Button>
              </TabsContent>
            </Tabs>

            {/* Chips */}
            <div className="flex flex-wrap gap-2 mt-4 min-h-[40px]">
              {participants.length === 0 ? (
                <span className="text-muted-foreground text-sm">{t('setup.noParticipants')}</span>
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
            <label className="label-caps block mb-2">{t('setup.targetBlock')}</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="number"
                className="mono flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={targetBlock}
                onChange={e => handleBlockInput(e.target.value)}
                placeholder={t('setup.blockPlaceholder')}
              />
              <Button variant="outline" onClick={suggestBlock} className="shrink-0 sm:w-auto w-full">
                {t('setup.suggestNext')}
              </Button>
            </div>
            {blockETA && (
              <p className={`text-sm mt-2 ${blockETA.valid ? 'text-btc' : 'text-destructive'}`}>
                {blockETA.valid
                  ? t('setup.blockETA', { left: blockETA.left, eta: formatBlockETA(blockETA.left) })
                  : t('setup.blockMinedWarning')}
              </p>
            )}
            <p className="text-muted-foreground text-xs mt-2 flex items-center gap-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
              {t('setup.btcInfo')}
            </p>
          </div>

          {/* Lock button */}
          <Button
            size="lg"
            className="w-full text-base"
            disabled={!canLock || locking}
            onClick={handleLock}
          >
            {locking ? t('setup.connecting') : t('setup.lockBtn')}
          </Button>
        </CardContent>
      </Card>

      {/* Why fair */}
      <Card>
        <CardHeader>
          <CardTitle>{t('setup.whyFair.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-5 mb-6">
            {fairPoints.map(item => (
              <div key={item.titleKey}>
                <div className="font-semibold text-sm mb-1.5">{item.icon} {t(item.titleKey)}</div>
                <div className="text-muted-foreground text-[13px] leading-relaxed">{t(item.bodyKey)}</div>
              </div>
            ))}
          </div>

          {/* Formula */}
          <div className="border-t pt-5">
            <p className="label-caps mb-3">{t('setup.formula.title')}</p>
            <div className="code-block text-sm space-y-1.5">
              <div className="text-muted-foreground text-xs mb-2">{t('setup.formula.desc')}</div>
              <div>
                <span className="text-btc">{t('setup.formula.step1.label')}</span>
                {'  '}{t('setup.formula.step1.desc')}
              </div>
              <div>
                <span className="text-btc">{t('setup.formula.step2.label')}</span>
                {'  '}→ <span className="mono">BigInt("0x" + blockHash)</span>
              </div>
              <div>
                <span className="text-btc">{t('setup.formula.step3.label')}</span>
                {'   '}→ <span className="mono">% BigInt({t('setup.formula.countVar')})</span>
                {' '}{t('setup.formula.step3.suffix')}
              </div>
              <div>
                <span className="text-btc">{t('setup.formula.step4.label')}</span>
                {' '}→ <span className="mono">participants[{t('setup.formula.indexVar')}]</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
