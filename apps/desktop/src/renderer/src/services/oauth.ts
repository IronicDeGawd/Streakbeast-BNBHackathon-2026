export type OAuthProvider = 'github' | 'strava' | 'duolingo'

export interface LinkedAccount {
  provider: OAuthProvider
  connected: boolean
  username?: string
  refreshToken?: string
}

const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'https://auth-streakbeast.vercel.app'

export async function connectAccount(provider: OAuthProvider): Promise<void> {
  await window.api.oauth.openUrl(`${AUTH_URL}/connect/${provider}`)
}

export function parseCallback(url: string): {
  provider: string
  username: string
  refreshToken?: string
} | null {
  try {
    const parsed = new URL(url)
    const provider = parsed.searchParams.get('provider') || ''
    const username = parsed.searchParams.get('username') || ''
    if (!provider || !username) return null

    return {
      provider,
      username,
      refreshToken: parsed.searchParams.get('refresh_token') || undefined,
    }
  } catch {
    return null
  }
}
