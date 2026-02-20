import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NavHeader from '@/components/layout/NavHeader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Global Contemporary Museums Map',
  description: 'Discover and plan visits to contemporary museums around the globe.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-neutral-50 flex flex-col`}>
        <NavHeader />
        <main className="flex-1 flex flex-col relative w-full h-full">
          {children}
        </main>
      </body>
    </html>
  )
}
