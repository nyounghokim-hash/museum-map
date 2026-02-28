'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/components/AppContext';
import { useSession } from 'next-auth/react';

const NAV_LABELS: Record<string, { map: string; saved: string; story: string }> = {
    ko: { map: '지도', saved: '즐겨찾기', story: 'MM스토리' },
    en: { map: 'Map', saved: 'Saved', story: 'MM Story' },
    ja: { map: '地図', saved: 'お気に入り', story: 'MMストーリー' },
    de: { map: 'Karte', saved: 'Gespeichert', story: 'MM Story' },
    fr: { map: 'Carte', saved: 'Favoris', story: 'MM Story' },
    es: { map: 'Mapa', saved: 'Guardados', story: 'MM Story' },
    pt: { map: 'Mapa', saved: 'Salvos', story: 'MM Story' },
    'zh-CN': { map: '地图', saved: '收藏', story: 'MM故事' },
    'zh-TW': { map: '地圖', saved: '收藏', story: 'MM故事' },
    da: { map: 'Kort', saved: 'Gemt', story: 'MM Story' },
    fi: { map: 'Kartta', saved: 'Tallennettu', story: 'MM Story' },
    sv: { map: 'Karta', saved: 'Sparade', story: 'MM Story' },
    et: { map: 'Kaart', saved: 'Salvestatud', story: 'MM Story' },
};

export default function MobileBottomNav() {
    const pathname = usePathname();
    const { locale } = useApp();
    const { data: session } = useSession();
    const isGuest = !session || session.user?.name?.startsWith('guest_');

    // Hide on admin, login, and detail pages
    if (pathname.startsWith('/admin') || pathname.startsWith('/login') || pathname.startsWith('/museum/') || pathname.startsWith('/museums/') || /^\/blog\/.+/.test(pathname)) return null;

    const labels = NAV_LABELS[locale] || NAV_LABELS.en;

    const tabs = [
        {
            href: '/',
            label: labels.map,
            icon: (active: boolean) => (
                <svg className={`w-7 h-7 ${active ? 'text-white' : 'text-gray-400 dark:text-neutral-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
            ),
            isActive: pathname === '/',
        },
        {
            href: isGuest ? '/login' : '/saved',
            label: labels.saved,
            icon: (active: boolean) => (
                <svg className={`w-7 h-7 ${active ? 'text-white' : 'text-gray-400 dark:text-neutral-500'}`} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
            ),
            isActive: pathname.startsWith('/saved'),
        },
        {
            href: '/blog',
            label: labels.story,
            icon: (active: boolean) => (
                <svg className={`w-7 h-7 ${active ? 'text-white' : 'text-gray-400 dark:text-neutral-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
            ),
            isActive: pathname.startsWith('/blog'),
        },
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
            <div className="w-full overflow-hidden"
                style={{
                    background: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(24px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(200%)',
                    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                }}
            >
                {/* Dark mode overlay */}
                <div className="hidden dark:block absolute inset-0"
                    style={{
                        background: 'rgba(23, 23, 23, 0.92)',
                        backdropFilter: 'blur(24px) saturate(200%)',
                        WebkitBackdropFilter: 'blur(24px) saturate(200%)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                />
                <div className="relative flex items-stretch">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all duration-200 active:scale-95 ${tab.isActive
                                ? 'bg-purple-600 dark:bg-purple-500'
                                : ''
                                }`}
                        >
                            {tab.icon(tab.isActive)}
                            <span className={`text-[10px] font-extrabold tracking-tight ${tab.isActive
                                ? 'text-white'
                                : 'text-gray-400 dark:text-neutral-500'
                                }`}>
                                {tab.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
            {/* Safe area spacer */}
            <div className="h-[env(safe-area-inset-bottom,0px)]"
                style={{ background: 'rgba(255, 255, 255, 0.92)' }}
            />
        </nav>
    );
}
