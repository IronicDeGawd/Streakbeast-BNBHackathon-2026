import { useState, useEffect, useCallback } from 'react'
import { connectAccount, parseCallback, type OAuthProvider, type LinkedAccount } from '../services/oauth'

const STORAGE_KEY = 'streakbeast_linked_accounts'

type AccountsMap = Record<OAuthProvider, LinkedAccount>

const DEFAULT_ACCOUNTS: AccountsMap = {
  github: { provider: 'github', connected: false },
  strava: { provider: 'strava', connected: false },
  duolingo: { provider: 'duolingo', connected: false },
}

function loadAccounts(): AccountsMap {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : DEFAULT_ACCOUNTS
  } catch {
    return DEFAULT_ACCOUNTS
  }
}

export function useLinkedAccounts() {
  const [accounts, setAccounts] = useState<AccountsMap>(loadAccounts)

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
  }, [accounts])

  // Listen for OAuth callbacks via IPC
  useEffect(() => {
    if (!window.api?.oauth?.onCallback) return

    const cleanup = window.api.oauth.onCallback((url: string) => {
      const result = parseCallback(url)
      if (!result) return

      const { provider, code } = result
      const key = provider as OAuthProvider
      if (!code || !['github', 'strava', 'duolingo'].includes(key)) return

      setAccounts(prev => ({
        ...prev,
        [key]: { ...prev[key], connected: true, token: code },
      }))
    })

    return cleanup
  }, [])

  const connect = useCallback(async (provider: OAuthProvider) => {
    await connectAccount(provider)
  }, [])

  const disconnect = useCallback((provider: OAuthProvider) => {
    setAccounts(prev => ({
      ...prev,
      [provider]: { provider, connected: false },
    }))
  }, [])

  const setDuolingoUsername = useCallback((username: string) => {
    setAccounts(prev => ({
      ...prev,
      duolingo: { provider: 'duolingo', connected: !!username, username },
    }))
  }, [])

  return { accounts, connect, disconnect, setDuolingoUsername }
}
