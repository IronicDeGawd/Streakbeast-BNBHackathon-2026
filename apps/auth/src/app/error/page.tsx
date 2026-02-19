'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const REASONS: Record<string, string> = {
  invalid_state: 'The authentication request was invalid or expired. Please try again from the app.',
  token_exchange_failed: 'Failed to complete authentication with the provider.',
  user_fetch_failed: 'Could not retrieve your account information.',
  missing_username: 'No username was provided.',
  server_error: 'An unexpected error occurred. Please try again.',
}

function ErrorContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason') || 'server_error'
  const message = REASONS[reason] || REASONS.server_error

  return (
    <div className="text-center">
      <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 max-w-md">
        <div className="text-4xl mb-4">&#x26A0;</div>
        <h1 className="text-xl font-bold mb-2 text-[var(--color-error)]">Connection Failed</h1>
        <p className="text-sm text-white/50">{message}</p>
        <p className="text-xs text-white/30 mt-4">
          Please close this tab and try again from the StreakBeast app.
        </p>
      </div>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div className="text-white/50">Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
