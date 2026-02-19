export type OAuthProvider = 'github' | 'strava' | 'duolingo'

export interface LinkedAccount {
  provider: OAuthProvider
  connected: boolean
  username?: string
  token?: string
}

const OAUTH_CONFIG: Record<OAuthProvider, { authUrl: string | null; clientId: string; scope: string }> = {
  github: {
    authUrl: 'https://github.com/login/oauth/authorize',
    clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
    scope: 'read:user',
  },
  strava: {
    authUrl: 'https://www.strava.com/oauth/authorize',
    clientId: import.meta.env.VITE_STRAVA_CLIENT_ID || '',
    scope: 'activity:read',
  },
  duolingo: {
    authUrl: null,
    clientId: '',
    scope: '',
  },
}

export function buildOAuthUrl(provider: OAuthProvider): string | null {
  const config = OAUTH_CONFIG[provider]
  if (!config.authUrl) return null

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: `streakbeast://oauth/callback?provider=${provider}`,
    scope: config.scope,
    response_type: 'code',
    state: crypto.randomUUID(),
  })

  return `${config.authUrl}?${params.toString()}`
}

export async function connectAccount(provider: OAuthProvider): Promise<void> {
  if (provider === 'duolingo') return

  const url = buildOAuthUrl(provider)
  if (!url) return

  await window.api.oauth.openUrl(url)
}

export function parseCallback(url: string): { provider: string; code: string; state: string } | null {
  try {
    const parsed = new URL(url)
    const provider = parsed.searchParams.get('provider') || ''
    const code = parsed.searchParams.get('code') || ''
    const state = parsed.searchParams.get('state') || ''
    if (!provider || !code) return null
    return { provider, code, state }
  } catch {
    return null
  }
}
