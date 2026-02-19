'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect')

  useEffect(() => {
    if (redirectUrl?.startsWith('streakbeast://')) {
      window.location.href = redirectUrl
    }
  }, [redirectUrl])

  return (
    <div className="text-center">
      <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 max-w-md">
        <div className="text-4xl mb-4">&#10003;</div>
        <h1 className="text-xl font-bold mb-2">Account Connected!</h1>
        <p className="text-sm text-white/50">Redirecting to StreakBeast...</p>
        <p className="text-xs text-white/30 mt-4">
          If the app didn&apos;t open,{' '}
          <a href={redirectUrl || '#'} className="text-purple-400 underline">
            click here
          </a>
          .
        </p>
      </div>
    </div>
  )
}

export default function Success() {
  return (
    <Suspense fallback={<div className="text-white/50">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
