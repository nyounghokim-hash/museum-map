import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'
import NavHeader from '@/components/layout/NavHeader'
import { AppProvider } from '@/components/AppContext'
import { ModalProvider } from '@/components/ui/Modal'
import { GoogleAnalytics } from '@next/third-parties/google'

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
    keywords: isKorean
      ? ['미술관', '박물관', '여행', '현대미술', '전시회', '뮤지엄맵', '아트투어', '미술관 지도']
      : ['museum', 'art gallery', 'travel', 'contemporary art', 'exhibitions', 'museum map', 'art tour', 'itinerary'],
    icons: {
      icon: [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-icon-180x180.png', sizes: '180x180' },
        { url: '/apple-icon-152x152.png', sizes: '152x152' },
        { url: '/apple-icon-144x144.png', sizes: '144x144' },
        { url: '/apple-icon-120x120.png', sizes: '120x120' },
      ],
    },
    manifest: '/manifest.json',
    metadataBase: new URL('https://global-museums.vercel.app'),
    alternates: {
      canonical: '/',
      languages: {
        'ko-KR': '/',
        'en-US': '/',
        'ja-JP': '/',
        'zh-CN': '/',
        'de-DE': '/',
        'fr-FR': '/',
        'es-ES': '/',
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      siteName: 'Museum Map',
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
import SplashScreen from '@/components/ui/SplashScreen'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col transition-colors`}>
        <SplashScreen />
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
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || 'G-8XMCJMKLSF'} />
      </body>
    </html>
  )
}
