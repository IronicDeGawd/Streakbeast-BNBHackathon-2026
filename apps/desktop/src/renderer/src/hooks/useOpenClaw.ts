import { useState, useCallback, useRef } from 'react'

const OPENCLAW_URL = import.meta.env.VITE_OPENCLAW_URL || 'http://localhost:18789'
const OPENCLAW_TOKEN = import.meta.env.VITE_OPENCLAW_TOKEN || ''

export interface OpenClawMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface UseOpenClawOptions {
  model?: string
  systemPrompt?: string
  userId?: string
}

interface UseOpenClawReturn {
  sendMessage: (content: string) => Promise<void>
  messages: OpenClawMessage[]
  isStreaming: boolean
  error: string | null
  clearMessages: () => void
  isConnected: boolean
  checkConnection: () => Promise<boolean>
}

export function useOpenClaw(options: UseOpenClawOptions = {}): UseOpenClawReturn {
  const [messages, setMessages] = useState<OpenClawMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const resp = await window.api?.openclawFetch(`${OPENCLAW_URL}/tools/invoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'sessions_list', action: 'json', args: {} }),
      })
      const ok = resp?.ok ?? false
      setIsConnected(ok)
      return ok
    } catch {
      setIsConnected(false)
      return false
    }
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: OpenClawMessage = { role: 'user', content }
    setMessages(prev => [...prev, userMsg])

    setIsStreaming(true)
    setError(null)

    // Send only system + current user message (agent keeps its own session history)
    const requestMessages: OpenClawMessage[] = []
    if (options.systemPrompt) requestMessages.push({ role: 'system', content: options.systemPrompt })
    requestMessages.push(userMsg)

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (OPENCLAW_TOKEN) headers['Authorization'] = `Bearer ${OPENCLAW_TOKEN}`

    const body = JSON.stringify({
      model: options.model || 'agent:streakbeast',
      messages: requestMessages,
      stream: false,
      ...(options.userId ? { user: options.userId } : {}),
    })

    try {
      const resp = await window.api?.openclawFetch(`${OPENCLAW_URL}/v1/chat/completions`, { method: 'POST', headers, body })
      if (!resp || !resp.ok) throw new Error(`OpenClaw error: ${resp?.status || 'no response'}`)
      const json = JSON.parse(resp.text)
      const assistantContent = json.choices?.[0]?.message?.content || ''
      if (assistantContent) {
        setMessages(curr => [...curr, { role: 'assistant', content: assistantContent }])
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsStreaming(false)
    }
  }, [options.model, options.systemPrompt, options.userId])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { sendMessage, messages, isStreaming, error, clearMessages, isConnected, checkConnection }
}
