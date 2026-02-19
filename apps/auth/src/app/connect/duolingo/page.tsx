'use client'

import { useState } from 'react'

export default function DuolingoConnect() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) return

    setLoading(true)
    setError(null)

    // Redirect to the API route which validates and redirects to streakbeast://
    window.location.href = `/api/callback/duolingo?username=${encodeURIComponent(username.trim())}`
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8">
        <div className="text-center mb-6">
          <span className="text-4xl mb-2 block">🦉</span>
          <h1 className="text-xl font-bold">Connect Duolingo</h1>
          <p className="text-sm text-white/50 mt-2">Enter your Duolingo username to link your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Your Duolingo username"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10
                       text-white placeholder:text-white/30
                       focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500
                       transition-colors"
            disabled={loading}
            autoFocus
          />

          {error && (
            <p className="text-sm text-[var(--color-error)]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full py-3 rounded-xl font-semibold transition-all
                       bg-purple-600 hover:bg-purple-500 disabled:bg-white/10 disabled:text-white/30
                       disabled:cursor-not-allowed"
          >
            {loading ? 'Validating...' : 'Connect'}
          </button>
        </form>
      </div>
    </div>
  )
}
