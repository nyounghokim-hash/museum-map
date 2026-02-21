import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NavHeader from '@/components/layout/NavHeader'
import { AppProvider } from '@/components/AppContext'
import { ModalProvider } from '@/components/ui/Modal'

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col transition-colors`}>
        <AppProvider>
          <ModalProvider>
            <NavHeader />
            <main className="flex-1 flex flex-col relative w-full h-full">
              {children}
            </main>
          </ModalProvider>
        </AppProvider>
      </body>
    </html>
  )
}
