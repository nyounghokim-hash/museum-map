'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useApp } from '@/components/AppContext';
import { t, LOCALE_NAMES, Locale } from '@/lib/i18n';
import { useModal } from '@/components/ui/Modal';

export default function NavHeader() {
    const { data: session } = useSession();
    const { showAlert } = useModal();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const pathname = usePathname();
    const drawerRef = useRef<HTMLDivElement>(null);
    const langRef = useRef<HTMLDivElement>(null);
    const { locale, setLocale, darkMode, setDarkMode } = useApp();

    const NAV_LINKS = [
        { href: '/', label: t('nav.mapExplore', locale) },
        { href: '/collections', label: t('nav.myCollections', locale) },
        { href: '/saved', label: t('nav.myPick', locale) },
        { href: '/plans', label: t('nav.myPlans', locale) },
        { href: '/feedback', label: t('nav.feedback', locale) || 'Feedback' },
    ];

    useEffect(() => { setMobileOpen(false); setLangOpen(false); }, [pathname]);

    useEffect(() => {
        if (!mobileOpen) return;
        const handler = (e: MouseEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) setMobileOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [mobileOpen]);

    useEffect(() => {
        if (!langOpen) return;
        const handler = (e: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [langOpen]);

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md">
                <div className="container mx-auto flex h-14 items-center gap-4 px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="font-bold text-lg flex items-center gap-2 mr-6 shrink-0 dark:text-white">
                        <img src="/logo.svg" alt="Museum Map" className="h-6 w-auto dark:invert" />
                        <span className="hidden sm:inline">Museum Map</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        {NAV_LINKS.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`transition-colors hover:text-black dark:hover:text-white ${pathname === link.href
                                    ? 'text-black dark:text-white'
                                    : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="ml-auto flex items-center space-x-2 sm:space-x-3">
                        {/* Dark mode toggle */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors text-gray-500 dark:text-gray-400"
                            title={darkMode ? t('theme.light', locale) : t('theme.dark', locale)}
                        >
                            {darkMode ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>

                        {/* Language dropdown */}
                        <div className="relative" ref={langRef}>
                            <button
                                onClick={() => setLangOpen(!langOpen)}
                                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                            >
                                {LOCALE_NAMES[locale]}
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {langOpen && (
                                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-xl py-1 min-w-[140px] z-50">
                                    {(Object.keys(LOCALE_NAMES) as Locale[]).map(l => (
                                        <button
                                            key={l}
                                            onClick={() => { setLocale(l); setLangOpen(false); }}
                                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors ${l === locale ? 'font-bold text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
                                        >
                                            {LOCALE_NAMES[l]}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Auth UI */}
                        {session ? (
                            <Link href="/saved" className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-700 dark:text-purple-400 font-bold text-xs ring-2 ring-transparent hover:ring-purple-500 transition-all overflow-hidden">
                                    {session.user?.image ? (
                                        <img src={session.user.image} alt={session.user.name || 'User'} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{session.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}</span>
                                    )}
                                </div>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
                            >
                                {t('login.title', locale) || 'Login'}
                            </Link>
                        )}

                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                            onClick={() => setMobileOpen(prev => !prev)}
                            aria-label="Toggle menu"
                        >
                            <svg className="w-6 h-6 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                {mobileOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-[9999] md:hidden">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" style={{ animation: 'fadeIn 200ms ease-out' }} />
                    <div
                        ref={drawerRef}
                        className="absolute top-0 right-0 h-full w-72 bg-white dark:bg-neutral-900 shadow-2xl flex flex-col"
                        style={{ animation: 'slideInRight 250ms ease-out' }}
                    >
                        <div className="flex items-center justify-between p-4 border-b dark:border-neutral-800">
                            <span className="font-bold text-lg dark:text-white">{t('nav.menu', locale)}</span>
                            <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                                <svg className="w-5 h-5 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <nav className="flex-1 p-4 space-y-1">
                            {NAV_LINKS.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === link.href
                                        ? 'bg-black dark:bg-white text-white dark:text-black'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Mobile language selector */}
                        <div className="px-4 pb-2">
                            <select
                                value={locale}
                                onChange={e => setLocale(e.target.value as Locale)}
                                className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300"
                            >
                                {(Object.keys(LOCALE_NAMES) as Locale[]).map(l => (
                                    <option key={l} value={l}>{LOCALE_NAMES[l]}</option>
                                ))}
                            </select>
                        </div>

                        <div className="p-4 border-t dark:border-neutral-800 space-y-1">
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className="block w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all text-left"
                            >
                                {darkMode ? '☀️ ' + t('theme.light', locale) : '🌙 ' + t('theme.dark', locale)}
                            </button>
                            <Link
                                href="/admin"
                                className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all"
                            >
                                {t('nav.admin', locale)}
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
            `}</style>
        </>
    );
}
