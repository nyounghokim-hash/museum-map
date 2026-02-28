'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/components/AppContext';

const NAV_LABELS: Record<string, { map: string; trip: string; story: string }> = {
    ko: { map: '지도', trip: '내 여행', story: 'MM스토리' },
    en: { map: 'Map', trip: 'My Trip', story: 'MM Story' },
    ja: { map: '地図', trip: 'マイ旅行', story: 'MMストーリー' },
    de: { map: 'Karte', trip: 'Meine Reise', story: 'MM Story' },
    fr: { map: 'Carte', trip: 'Mon voyage', story: 'MM Story' },
    es: { map: 'Mapa', trip: 'Mi viaje', story: 'MM Story' },
    pt: { map: 'Mapa', trip: 'Minha viagem', story: 'MM Story' },
    'zh-CN': { map: '地图', trip: '我的旅行', story: 'MM故事' },
    'zh-TW': { map: '地圖', trip: '我的旅行', story: 'MM故事' },
    da: { map: 'Kort', trip: 'Min rejse', story: 'MM Story' },
    fi: { map: 'Kartta', trip: 'Matkani', story: 'MM Story' },
    sv: { map: 'Karta', trip: 'Min resa', story: 'MM Story' },
    et: { map: 'Kaart', trip: 'Minu reis', story: 'MM Story' },
};

export default function MobileBottomNav() {
    const pathname = usePathname();
    const { locale } = useApp();

    // Hide on admin, login, and detail pages
    if (pathname.startsWith('/admin') || pathname.startsWith('/login') || pathname.startsWith('/museum/')) return null;

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
            href: '/plans',
            label: labels.trip,
            icon: (active: boolean) => (
                <svg className={`w-7 h-7 ${active ? 'text-white' : 'text-gray-400 dark:text-neutral-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            isActive: pathname.startsWith('/plans'),
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
            {/* Glassmorphism floating bar - higher position, mega rounded */}
            <div className="mx-4 mb-6 rounded-[28px] overflow-hidden"
                style={{
                    background: 'rgba(255, 255, 255, 0.78)',
                    backdropFilter: 'blur(24px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(200%)',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08)',
                }}
            >
                {/* Dark mode overlay */}
                <div className="hidden dark:block absolute inset-0 rounded-[28px]"
                    style={{
                        background: 'rgba(23, 23, 23, 0.82)',
                        backdropFilter: 'blur(24px) saturate(200%)',
                        WebkitBackdropFilter: 'blur(24px) saturate(200%)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                />
                <div className="relative flex items-center justify-around py-2.5 px-3">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex flex-col items-center gap-1 px-5 py-2 rounded-[20px] transition-all duration-200 active:scale-90 ${tab.isActive
                                ? 'bg-purple-600 dark:bg-purple-500 shadow-lg shadow-purple-600/30'
                                : 'hover:bg-gray-100/60 dark:hover:bg-neutral-700/30'
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
            <div className="h-[env(safe-area-inset-bottom,0px)] bg-transparent" />
        </nav>
    );
}
