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
      const headers: Record<string, string> = {}
      if (OPENCLAW_TOKEN) headers['Authorization'] = `Bearer ${OPENCLAW_TOKEN}`
      const resp = await fetch(`${OPENCLAW_URL}/v1/models`, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(3000),
      })
      const ok = resp.ok
      setIsConnected(ok)
      return ok
    } catch {
      setIsConnected(false)
      return false
    }
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const userMsg: OpenClawMessage = { role: 'user', content }

    setMessages(prev => {
      const allMessages = [...prev, userMsg]

      // Build request messages
      const requestMessages = options.systemPrompt
        ? [{ role: 'system' as const, content: options.systemPrompt }, ...allMessages]
        : allMessages

      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (OPENCLAW_TOKEN) headers['Authorization'] = `Bearer ${OPENCLAW_TOKEN}`

      setIsStreaming(true)
      setError(null)

      fetch(`${OPENCLAW_URL}/v1/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: options.model || 'agent:streakbeast',
          messages: requestMessages,
          stream: true,
          ...(options.userId ? { user: options.userId } : {}),
        }),
        signal: controller.signal,
      })
        .then(async (resp) => {
          if (!resp.ok) throw new Error(`OpenClaw error: ${resp.status}`)

          const reader = resp.body?.getReader()
          const decoder = new TextDecoder()
          let assistantContent = ''

          if (reader) {
            let buffer = ''
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              buffer += decoder.decode(value, { stream: true })
              const lines = buffer.split('\n')
              buffer = lines.pop() || ''

              for (const line of lines) {
                if (!line.startsWith('data: ')) continue
                const data = line.slice(6).trim()
                if (data === '[DONE]') break

                try {
                  const parsed = JSON.parse(data)
                  const delta = parsed.choices?.[0]?.delta?.content || ''
                  assistantContent += delta

                  setMessages(curr => {
                    const updated = [...curr]
                    const last = updated[updated.length - 1]
                    if (last?.role === 'assistant') {
                      return [...updated.slice(0, -1), { ...last, content: assistantContent }]
                    }
                    return [...updated, { role: 'assistant', content: assistantContent }]
                  })
                } catch {
                  // skip malformed chunks
                }
              }
            }
          }

          // If no streaming content came through, try non-streaming response
          if (!assistantContent) {
            try {
              const text = await resp.text()
              const json = JSON.parse(text)
              const content = json.choices?.[0]?.message?.content || ''
              if (content) {
                setMessages(curr => [...curr, { role: 'assistant', content }])
              }
            } catch {
              // already consumed
            }
          }
        })
        .catch((err) => {
          if ((err as Error).name !== 'AbortError') {
            setError((err as Error).message)
          }
        })
        .finally(() => {
          setIsStreaming(false)
        })

      return allMessages
    })
  }, [options.model, options.systemPrompt, options.userId])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { sendMessage, messages, isStreaming, error, clearMessages, isConnected, checkConnection }
}
