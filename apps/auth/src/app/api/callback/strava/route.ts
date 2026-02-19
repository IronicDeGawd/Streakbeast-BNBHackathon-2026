import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const storedState = request.cookies.get('oauth_state_strava')?.value

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL('/error?reason=invalid_state', request.url))
  }

  try {
    // Exchange code for tokens — Strava returns athlete data with the token response
    const tokenRes = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.STRAVA_CLIENT_ID(),
        client_secret: env.STRAVA_CLIENT_SECRET(),
        code,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenRes.json()
    if (!tokenData.athlete || !tokenData.refresh_token) {
      return NextResponse.redirect(new URL('/error?reason=token_exchange_failed', request.url))
    }

    const athleteName = [tokenData.athlete.firstname, tokenData.athlete.lastname]
      .filter(Boolean)
      .join(' ') || tokenData.athlete.username || 'Athlete'

    const callbackParams = new URLSearchParams({
      provider: 'strava',
      username: athleteName,
      refresh_token: tokenData.refresh_token,
    })
    const deepLink = `streakbeast://oauth/callback?${callbackParams}`

    const response = NextResponse.redirect(
      new URL(`/success?redirect=${encodeURIComponent(deepLink)}`, request.url)
    )
    response.cookies.delete('oauth_state_strava')
    return response
  } catch (err) {
    console.error('Strava OAuth error:', err)
    return NextResponse.redirect(new URL('/error?reason=server_error', request.url))
  }
}
