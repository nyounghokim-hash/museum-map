'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/components/AppContext';
import { t } from '@/lib/i18n';

export default function MobileBottomNav() {
    const pathname = usePathname();
    const { locale } = useApp();

    // Hide on admin and certain pages
    if (pathname.startsWith('/admin') || pathname.startsWith('/login')) return null;

    const tabs = [
        {
            href: '/',
            label: 'Map',
            icon: (active: boolean) => (
                <svg className={`w-5 h-5 ${active ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-neutral-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
            ),
            isActive: pathname === '/',
        },
        {
            href: '/plans',
            label: locale === 'ko' ? '내 여행' : t('plans.title', locale) || 'My Trip',
            icon: (active: boolean) => (
                <svg className={`w-5 h-5 ${active ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-neutral-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            isActive: pathname.startsWith('/plans'),
        },
        {
            href: '/blog',
            label: 'MM Story',
            icon: (active: boolean) => (
                <svg className={`w-5 h-5 ${active ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-neutral-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
            ),
            isActive: pathname.startsWith('/blog'),
        },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
            {/* Glassmorphism bar */}
            <div className="mx-3 mb-3 rounded-2xl overflow-hidden"
                style={{
                    background: 'rgba(255, 255, 255, 0.72)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
                }}
            >
                {/* Dark mode override */}
                <div className="hidden dark:block absolute inset-0 rounded-2xl"
                    style={{
                        background: 'rgba(23, 23, 23, 0.78)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                />
                <div className="relative flex items-center justify-around py-2 px-2">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 active:scale-90 ${tab.isActive
                                    ? 'bg-purple-50/80 dark:bg-purple-900/20'
                                    : 'hover:bg-gray-100/50 dark:hover:bg-neutral-800/30'
                                }`}
                        >
                            {tab.icon(tab.isActive)}
                            <span className={`text-[10px] font-bold tracking-tight ${tab.isActive
                                    ? 'text-purple-600 dark:text-purple-400'
                                    : 'text-gray-400 dark:text-neutral-500'
                                }`}>
                                {tab.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Safe area spacer for devices with home indicator */}
            <div className="h-[env(safe-area-inset-bottom,0px)] bg-transparent" />
        </nav>
    );
}
