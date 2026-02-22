import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'
import NavHeader from '@/components/layout/NavHeader'
import { AppProvider } from '@/components/AppContext'
import { ModalProvider } from '@/components/ui/Modal'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const isKorean = acceptLanguage.toLowerCase().includes('ko');

  const title = isKorean ? 'Global Museum Map - 나만의 미술관/박물관 여행 계획' : 'Global Museum Map - Plan Your Art & History Journey';
  const description = isKorean
    ? '전 세계 주요 현대미술관과 박물관을 탐험하고, 나만의 특별한 여행 경로를 만들어보세요.'
    : 'Discover contemporary art museums and historical museums around the globe, and create your personalized itinerary.';

  return {
    title,
    description,
    icons: {
      icon: '/defaultimg.png',
    },
    openGraph: {
      title,
      description,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Global Museum Map Preview',
        },
      ],
      locale: isKorean ? 'ko_KR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
  };
}

import AuthProvider from '@/components/AuthProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col transition-colors`}>
        <AuthProvider>
          <AppProvider>
            <ModalProvider>
              <NavHeader />
              <main className="flex-1 flex flex-col relative w-full h-full">
                {children}
              </main>
            </ModalProvider>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
