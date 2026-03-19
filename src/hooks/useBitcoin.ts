import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchCurrentHeight, fetchBlockHash } from '../lib/bitcoin'

export function useCurrentHeight(pollMs = 30_000) {
  const [height, setHeight] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const poll = useCallback(async () => {
    try {
      const h = await fetchCurrentHeight()
      setHeight(h)
      setLastUpdated(new Date())
      return h
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    poll()
    const id = setInterval(poll, pollMs)
    return () => clearInterval(id)
  }, [poll, pollMs])

  return { height, lastUpdated, poll }
}

export function useBlockWatcher(
  targetBlock: number | null,
  onMined: (hash: string) => void
) {
  const { height, lastUpdated, poll } = useCurrentHeight(30_000)
  const calledRef = useRef(false)

  useEffect(() => {
    if (!targetBlock || !height || calledRef.current) return
    if (height >= targetBlock) {
      calledRef.current = true
      fetchBlockHash(targetBlock)
        .then(hash => onMined(hash))
        .catch(() => {
          // retry after 30s if block not yet indexed
          setTimeout(() => {
            calledRef.current = false
          }, 30_000)
        })
    }
  }, [height, targetBlock, onMined])

  return { height, lastUpdated, poll }
}
