export type View = 'setup' | 'waiting' | 'result'

export interface RaffleState {
  title: string
  participants: string[]
  targetBlock: number | null
  startBlock: number | null
  resultHash: string | null
  winnerIndex: number | null
  lockedAt: number | null
}

export interface VerifyResult {
  hash: string
  names: string[]
  index: number
  winner: string
  steps: string
}
