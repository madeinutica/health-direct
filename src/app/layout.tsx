import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HealthDirect - Oneida County Healthcare Directory',
  description: 'Find trusted healthcare providers, read reviews, and connect with our community in Oneida County, NY',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <Navigation />
        <main className="min-h-screen pb-safe pt-[30px]">
          <div className="mx-auto max-w-screen-2xl">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}