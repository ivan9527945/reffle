import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchCurrentHeight, fetchBlockHash } from '../lib/bitcoin'

const WS_URL = 'wss://mempool.space/api/v1/ws'

function useBlockWebSocket(onBlock: (height: number) => void) {
  const onBlockRef = useRef(onBlock)
  onBlockRef.current = onBlock

  useEffect(() => {
    let ws: WebSocket
    let reconnectTimer: ReturnType<typeof setTimeout>
    let destroyed = false

    function connect() {
      ws = new WebSocket(WS_URL)

      ws.onopen = () => {
        ws.send(JSON.stringify({ action: 'want', data: ['blocks'] }))
      }

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data as string)
          if (typeof data.block?.height === 'number') {
            onBlockRef.current(data.block.height)
          }
        } catch {
          // ignore malformed messages
        }
      }

      ws.onerror = () => ws.close()

      ws.onclose = () => {
        if (!destroyed) reconnectTimer = setTimeout(connect, 5_000)
      }
    }

    connect()

    return () => {
      destroyed = true
      clearTimeout(reconnectTimer)
      ws?.close()
    }
  }, [])
}

export function useCurrentHeight() {
  const [height, setHeight] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const updateHeight = useCallback((h: number) => {
    setHeight(prev => (prev === h ? prev : h))
    setLastUpdated(new Date())
  }, [])

  // Initial fetch so we have a height immediately
  useEffect(() => {
    fetchCurrentHeight().then(updateHeight).catch(() => {})
  }, [updateHeight])

  // Real-time updates via WebSocket
  useBlockWebSocket(updateHeight)

  const poll = useCallback(async () => {
    try {
      const h = await fetchCurrentHeight()
      updateHeight(h)
      return h
    } catch {
      return null
    }
  }, [updateHeight])

  return { height, lastUpdated, poll }
}

export function useBlockWatcher(
  targetBlock: number | null,
  onMined: (hash: string) => void
) {
  const { height, lastUpdated, poll } = useCurrentHeight()
  const calledRef = useRef(false)

  useEffect(() => {
    if (!targetBlock || !height || calledRef.current) return
    if (height >= targetBlock) {
      calledRef.current = true
      fetchBlockHash(targetBlock)
        .then(hash => onMined(hash))
        .catch(() => {
          // retry after 30s if block not yet indexed
          setTimeout(() => { calledRef.current = false }, 30_000)
        })
    }
  }, [height, targetBlock, onMined])

  return { height, lastUpdated, poll }
}
