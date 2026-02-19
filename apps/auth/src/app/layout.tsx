import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StreakBeast - Connect Account',
  description: 'Link your accounts to StreakBeast',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--color-bg)] text-white antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
