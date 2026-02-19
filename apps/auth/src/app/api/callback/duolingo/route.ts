import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const username = new URL(request.url).searchParams.get('username')

  if (!username) {
    return NextResponse.redirect(new URL('/error?reason=missing_username', request.url))
  }

  try {
    const res = await fetch(
      `https://www.duolingo.com/2017-06-30/users?username=${encodeURIComponent(username)}`,
      { headers: { 'User-Agent': 'StreakBeast/1.0' } }
    )

    const data = await res.json()

    if (!data.users || data.users.length === 0) {
      return NextResponse.redirect(
        new URL(`/connect/duolingo?error=${encodeURIComponent('Username not found on Duolingo')}`, request.url)
      )
    }

    const callbackParams = new URLSearchParams({
      provider: 'duolingo',
      username: data.users[0].username || username,
    })
    const deepLink = `streakbeast://oauth/callback?${callbackParams}`

    return NextResponse.redirect(
      new URL(`/success?redirect=${encodeURIComponent(deepLink)}`, request.url)
    )
  } catch (err) {
    console.error('Duolingo validation error:', err)
    return NextResponse.redirect(new URL('/error?reason=server_error', request.url))
  }
}
