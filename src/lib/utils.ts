import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function determineWinner(blockHash: string, participants: string[]): number {
  const hashBig = BigInt('0x' + blockHash)
  return Number(hashBig % BigInt(participants.length))
}

export function formatBlockETA(blocksLeft: number): string {
  const mins = blocksLeft * 10
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return hrs > 0 ? `${hrs}h ${rem}m` : `${mins}m`
}

export function isValidHash(hash: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(hash)
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}
