const API = 'https://mempool.space/api'

export async function fetchCurrentHeight(): Promise<number> {
  const res = await fetch(`${API}/blocks/tip/height`)
  if (!res.ok) throw new Error('Failed to fetch block height')
  return res.json()
}

export async function fetchBlockHash(height: number): Promise<string> {
  const res = await fetch(`${API}/block-height/${height}`)
  if (!res.ok) throw new Error(`Failed to fetch block hash for height ${height}`)
  return res.text()
}

export function mempoolBlockUrl(hashOrHeight: string | number): string {
  return `https://mempool.space/block/${hashOrHeight}`
}
