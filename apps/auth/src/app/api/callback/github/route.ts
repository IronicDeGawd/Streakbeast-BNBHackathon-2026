import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const storedState = request.cookies.get('oauth_state_github')?.value

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL('/error?reason=invalid_state', request.url))
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID(),
        client_secret: env.GITHUB_CLIENT_SECRET(),
        code,
      }),
    })

    const tokenData = await tokenRes.json()
    if (tokenData.error || !tokenData.access_token) {
      return NextResponse.redirect(new URL('/error?reason=token_exchange_failed', request.url))
    }

    // Fetch GitHub username
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    const userData = await userRes.json()
    if (!userData.login) {
      return NextResponse.redirect(new URL('/error?reason=user_fetch_failed', request.url))
    }

    // Redirect via success page → streakbeast:// deep link
    const callbackParams = new URLSearchParams({
      provider: 'github',
      username: userData.login,
    })
    const deepLink = `streakbeast://oauth/callback?${callbackParams}`

    const response = NextResponse.redirect(
      new URL(`/success?redirect=${encodeURIComponent(deepLink)}`, request.url)
    )
    response.cookies.delete('oauth_state_github')
    return response
  } catch (err) {
    console.error('GitHub OAuth error:', err)
    return NextResponse.redirect(new URL('/error?reason=server_error', request.url))
  }
}
