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
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const pathname = usePathname();
    const drawerRef = useRef<HTMLDivElement>(null);
    const langRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const { locale, setLocale, darkMode, setDarkMode } = useApp();

    const NAV_LINKS = [
        { href: '/', label: t('nav.mapExplore', locale) },
        { href: '/saved', label: t('nav.favorites', locale) },
        { href: '/plans', label: t('nav.myPlans', locale) },
        { href: '/collections', label: t('nav.myCollections', locale) },
        { href: '/blog', label: t('nav.mmStory', locale) },
        { href: '/feedback', label: t('nav.feedback', locale) || 'Feedback' },
    ];

    useEffect(() => { setMobileOpen(false); setLangOpen(false); setUserMenuOpen(false); setNotifOpen(false); }, [pathname]);

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

    useEffect(() => {
        if (!notifOpen) return;
        const handler = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [notifOpen]);

    // Fetch notifications (broadcast + user-specific, works for guests too)
    useEffect(() => {
        fetch('/api/notifications')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setNotifications(data);
                } else {
                    setNotifications([]);
                }
            })
            .catch(err => {
                console.error('Failed to fetch notifications:', err);
                setNotifications([]);
            });
    }, [session]);

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md">
                <div className="container mx-auto flex h-14 items-center gap-4 px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="font-bold text-lg flex items-center gap-2 mr-6 shrink-0 dark:text-white">
                        <img src="/logo.svg" alt="Museum Map" className="h-6 w-auto dark:invert" />
                        <span className="hidden sm:inline">Museum Map</span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
                        {NAV_LINKS.map(link => {
                            const isGuest = !session || session?.user?.name?.startsWith('guest_');
                            const isProtectedRoute = ['/saved', '/plans', '/collections'].includes(link.href);
                            const guardedHref = (isGuest && isProtectedRoute) ? `/login?callbackUrl=${encodeURIComponent(link.href)}` : link.href;

                            return (
                                <Link
                                    key={link.href}
                                    href={guardedHref}
                                    className={`transition-colors hover:text-black dark:hover:text-white ${pathname === link.href
                                        ? 'text-black dark:text-white'
                                        : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="ml-auto flex items-center space-x-2 sm:space-x-3">
                        {/* Dark mode toggle - desktop only */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors text-gray-500 dark:text-gray-400"
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

                        {/* Notification Dropdown */}
                        {/* Notification - desktop only */}
                        {(
                            <div className="relative hidden lg:block" ref={notifRef}>
                                <button
                                    onClick={() => setNotifOpen(!notifOpen)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors text-gray-500 dark:text-gray-400 relative"
                                    title={t('notif.title', locale)}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    {Array.isArray(notifications) && notifications.some(n => !n.isRead) && (
                                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-neutral-900" />
                                    )}
                                </button>
                                {notifOpen && (
                                    <div className="absolute right-[-8px] top-full mt-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl shadow-2xl py-0 min-w-[300px] max-w-[350px] z-50 overflow-hidden mx-4">
                                        <div className="px-4 py-3 border-b dark:border-neutral-800 flex items-center justify-between">
                                            <span className="text-sm font-bold dark:text-white">{t('notif.title', locale)}</span>
                                            {notifications.length > 0 && (
                                                <button
                                                    onClick={() => {
                                                        fetch('/api/notifications/read-all', { method: 'POST' })
                                                            .then(() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))));
                                                    }}
                                                    className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                                                >
                                                    {t('notif.markAllRead', locale)}
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="px-4 py-10 text-center">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('notif.noNew', locale)}</p>
                                                </div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div
                                                        key={n.id}
                                                        className={`px-4 py-3 border-b last:border-0 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer ${!n.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                                        onClick={() => {
                                                            if (!n.isRead) {
                                                                fetch(`/api/notifications/${n.id}/read`, { method: 'POST' });
                                                                setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, isRead: true } : notif));
                                                            }
                                                            setNotifOpen(false);
                                                            window.location.href = '/notifications';
                                                        }}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`w-2 h-2 shrink-0 rounded-full mt-1.5 ${!n.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">{locale !== 'ko' && n.titleEn ? n.titleEn : n.title}</p>
                                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{locale !== 'ko' && n.messageEn ? n.messageEn : n.message}</p>
                                                                <p className="text-[9px] text-gray-400 dark:text-neutral-600 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}



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
                            <div className="flex items-center gap-2">
                                {/* Admin button - left of profile */}
                                {(session.user as any)?.role === 'ADMIN' && (
                                    <Link
                                        href="/admin"
                                        className="p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-purple-600 dark:text-purple-400"
                                        title="Admin"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </Link>
                                )}
                                {/* Guest: just Login button / User: profile icon with menu */}
                                {session.user?.name?.startsWith('guest_') ? (
                                    <Link
                                        href="/login"
                                        className="px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
                                    >
                                        {t('login.title', locale) || 'Login'}
                                    </Link>
                                ) : (
                                    <div className="relative" ref={userMenuRef}>
                                        <button
                                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                                            className="flex items-center ring-2 ring-transparent hover:ring-purple-500 rounded-full transition-all"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-700 dark:text-purple-400 font-bold text-xs overflow-hidden">
                                                {session.user?.image ? (
                                                    <img src={session.user.image} alt={session.user.name || 'User'} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{session.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}</span>
                                                )}
                                            </div>
                                        </button>

                                        {userMenuOpen && (
                                            <div className="absolute right-0 top-full mt-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-xl py-2 min-w-[160px] z-50">
                                                <div className="px-4 py-2 border-b dark:border-neutral-800 mb-1">
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{session.user?.name}</p>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{session.user?.email}</p>
                                                </div>
                                                <Link href="/saved" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                                                    {t('nav.favorites', locale)}
                                                </Link>
                                                <Link href="/notifications" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                                                    {t('notif.title', locale)}
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        const { signOut } = require('next-auth/react');
                                                        signOut({ callbackUrl: '/' });
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    {t('auth.logout', locale)}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
                            >
                                {t('login.title', locale) || 'Login'}
                            </Link>
                        )}

                        <button
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
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
                <div className="fixed inset-0 z-[9999] lg:hidden">
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
                            {NAV_LINKS.map(link => {
                                const isGuest = session?.user?.name?.startsWith('guest_');
                                const isProtectedRoute = ['/saved', '/plans', '/collections'].includes(link.href);

                                return (
                                    <Link
                                        key={link.href}
                                        href={(isGuest && isProtectedRoute) ? '/login' : link.href}
                                        className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === link.href
                                            ? 'bg-black dark:bg-white text-white dark:text-black'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Mobile notification */}
                        <div className="px-4 py-2">
                            <Link
                                href="/notifications"
                                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all relative"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {t('notif.title', locale)}
                                {Array.isArray(notifications) && notifications.some(n => !n.isRead) && (
                                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                                )}
                            </Link>
                        </div>

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
                            {session?.user?.name?.startsWith('guest_') && (
                                <Link
                                    href="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="block w-full px-4 py-3 rounded-xl text-sm font-bold text-center text-white bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all mb-2"
                                >
                                    🔑 {t('login.title', locale) || 'Login'}
                                </Link>
                            )}
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className="block w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all text-left"
                            >
                                {darkMode ? '☀️ ' + t('theme.light', locale) : '🌙 ' + t('theme.dark', locale)}
                            </button>
                        </div>

                        <style jsx global>{`
                            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                            @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
                        `}</style>
                    </div>
                </div>
            )}
        </>
    );
}
