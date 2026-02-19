function required(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error(`Missing required env var: ${name}`)
  return val
}

export const env = {
  GITHUB_CLIENT_ID: () => required('GITHUB_CLIENT_ID'),
  GITHUB_CLIENT_SECRET: () => required('GITHUB_CLIENT_SECRET'),
  STRAVA_CLIENT_ID: () => required('STRAVA_CLIENT_ID'),
  STRAVA_CLIENT_SECRET: () => required('STRAVA_CLIENT_SECRET'),
  APP_URL: () => process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002',
}
