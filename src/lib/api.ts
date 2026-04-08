export type LeaderboardEntry = { username: string; score: number }

const DEFAULT_BASE_URL = 'http://localhost:8000'

export function getApiBaseUrl(): string {
  const v = import.meta.env.VITE_API_BASE_URL as string | undefined
  const raw = (v && v.trim()) || DEFAULT_BASE_URL
  return raw.replace(/\/+$/, '')
}

export async function fetchLeaderboard(signal?: AbortSignal): Promise<LeaderboardEntry[]> {
  const base = getApiBaseUrl()
  const res = await fetch(`${base}/leaderboard`, { method: 'GET', signal })
  if (!res.ok) {
    throw new Error(`Failed to fetch leaderboard (${res.status})`)
  }
  const data = (await res.json()) as { top?: LeaderboardEntry[] }
  return Array.isArray(data.top) ? data.top : []
}

export function buildWsUrl(username: string): string {
  const base = new URL(getApiBaseUrl())
  base.pathname = '/ws'
  base.search = `?username=${encodeURIComponent(username)}`
  if (base.protocol === 'https:') base.protocol = 'wss:'
  else base.protocol = 'ws:'
  return base.toString()
}

