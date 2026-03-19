import { useState, useCallback } from 'react'
import type { RaffleState, View } from '../types'
import { determineWinner } from '../lib/utils'

const STORAGE_KEY = 'btc-raffle-v2'

function loadFromStorage(): (RaffleState & { view: View }) | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveToStorage(state: RaffleState, view: View) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, view }))
}

const initialState: RaffleState = {
  title: '',
  participants: [],
  targetBlock: null,
  startBlock: null,
  resultHash: null,
  winnerIndex: null,
  lockedAt: null,
}

export function useRaffle() {
  const saved = loadFromStorage()

  const [view, setView] = useState<View>(saved?.view ?? 'setup')
  const [raffle, setRaffle] = useState<RaffleState>(saved ?? initialState)

  const updateRaffle = useCallback((patch: Partial<RaffleState>) => {
    setRaffle(prev => {
      const next = { ...prev, ...patch }
      return next
    })
  }, [])

  const lockRaffle = useCallback(
    (title: string, participants: string[], targetBlock: number, startBlock: number) => {
      const next: RaffleState = {
        ...initialState,
        title,
        participants,
        targetBlock,
        startBlock,
        lockedAt: Date.now(),
      }
      setRaffle(next)
      setView('waiting')
      saveToStorage(next, 'waiting')
    },
    []
  )

  const revealResult = useCallback(
    (blockHash: string) => {
      setRaffle(prev => {
        const winnerIndex = determineWinner(blockHash, prev.participants)
        const next = { ...prev, resultHash: blockHash, winnerIndex }
        saveToStorage(next, 'result')
        return next
      })
      setView('result')
    },
    []
  )

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setRaffle(initialState)
    setView('setup')
  }, [])

  return { view, raffle, lockRaffle, revealResult, reset, updateRaffle }
}
