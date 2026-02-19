import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const OPENCLAW_URL = import.meta.env.VITE_OPENCLAW_URL || 'http://localhost:18789'
const OPENCLAW_TOKEN = import.meta.env.VITE_OPENCLAW_TOKEN || ''

interface OpenClawContextType {
  isConnected: boolean
  isChecking: boolean
  checkStatus: () => Promise<boolean>
  daemonUrl: string
}

const OpenClawContext = createContext<OpenClawContextType>({
  isConnected: false,
  isChecking: false,
  checkStatus: async () => false,
  daemonUrl: OPENCLAW_URL,
})

export function OpenClawProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const checkStatus = useCallback(async (): Promise<boolean> => {
    setIsChecking(true)
    try {
      const headers: Record<string, string> = {}
      if (OPENCLAW_TOKEN) headers['Authorization'] = `Bearer ${OPENCLAW_TOKEN}`
      const resp = await fetch(`${OPENCLAW_URL}/v1/models`, {
        signal: AbortSignal.timeout(3000),
        headers,
      })
      setIsConnected(resp.ok)
      return resp.ok
    } catch {
      setIsConnected(false)
      return false
    } finally {
      setIsChecking(false)
    }
  }, [])

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 30_000)
    return () => clearInterval(interval)
  }, [checkStatus])

  return (
    <OpenClawContext.Provider value={{ isConnected, isChecking, checkStatus, daemonUrl: OPENCLAW_URL }}>
      {children}
    </OpenClawContext.Provider>
  )
}

export function useOpenClawStatus() {
  return useContext(OpenClawContext)
}
