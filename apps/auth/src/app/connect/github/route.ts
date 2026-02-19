import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import crypto from 'crypto'

export async function GET() {
  const state = crypto.randomUUID()
  const appUrl = env.APP_URL()

  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID(),
    redirect_uri: `${appUrl}/api/callback/github`,
    scope: 'read:user',
    state,
  })

  const response = NextResponse.redirect(`https://github.com/login/oauth/authorize?${params}`)
  response.cookies.set('oauth_state_github', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  return response
}
