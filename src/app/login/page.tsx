'use client';
import { useState, useRef, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GlassPanel } from '@/components/ui/glass';
import { useModal } from '@/components/ui/Modal';
import { useApp } from '@/components/AppContext';
import LoadingAnimation from '@/components/ui/LoadingAnimation';
import { t } from '@/lib/i18n';
import * as gtag from '@/lib/gtag';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { showAlert, showConfirm } = useModal();
    const { darkMode, locale } = useApp();

    // Typewriter effect
    const TITLE = 'Museum\nMap';
    const [titleText, setTitleText] = useState('');
    const typoPhase = useRef<'typing' | 'waiting' | 'erasing' | 'pause'>('typing');
    const typoIdx = useRef(0);
    const typoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        function tick() {
            const phase = typoPhase.current;
            const idx = typoIdx.current;
            if (phase === 'typing') {
                if (idx <= TITLE.length) {
                    setTitleText(TITLE.slice(0, idx));
                    typoIdx.current = idx + 1;
                    typoTimer.current = setTimeout(tick, 80);
                } else {
                    typoPhase.current = 'waiting';
                    typoTimer.current = setTimeout(tick, 3000);
                }
            } else if (phase === 'waiting') {
                typoPhase.current = 'erasing';
                typoIdx.current = TITLE.length;
                tick();
            } else if (phase === 'erasing') {
                if (idx > 0) {
                    typoIdx.current = idx - 1;
                    setTitleText(TITLE.slice(0, idx - 1));
                    typoTimer.current = setTimeout(tick, 50);
                } else {
                    typoPhase.current = 'pause';
                    typoTimer.current = setTimeout(tick, 1000);
                }
            } else if (phase === 'pause') {
                typoPhase.current = 'typing';
                typoIdx.current = 0;
                tick();
            }
        }
        tick();
        return () => { if (typoTimer.current) clearTimeout(typoTimer.current); };
    }, []);


    const handleGuestLogin = async () => {
        setLoading(true);
        const guestId = `guest_${Date.now()}`;

        // Clear all cached data from previous sessions
        sessionStorage.clear();
        localStorage.removeItem('savedMuseums');
        localStorage.removeItem('travelPlans');
        localStorage.removeItem('recentSearches');

        sessionStorage.setItem('isGuest', 'true');

        try {
            const res = await signIn('credentials', {
                redirect: false,
                username: guestId,
                password: guestId
            });

            if (res?.ok) {
                gtag.event('login', {
                    category: 'auth',
                    label: 'guest',
                    value: 1
                });
                router.push('/');
                router.refresh();
            } else {
                showAlert(t('auth.error.guest', locale));
            }
        } catch (e) {
            showAlert(t('auth.error.server', locale));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password) {
            showAlert(t('auth.error.input', locale));
            return;
        }

        if (!isLogin && (!agreeTerms || !agreePrivacy)) {
            showAlert(t('auth.error.agreement', locale));
            return;
        }

        setLoading(true);

        try {
            if (isLogin) {
                const res = await signIn('credentials', {
                    redirect: false,
                    username,
                    password
                });

                if (res?.error) {
                    showAlert(t('auth.error.invalid', locale));
                } else {
                    gtag.event('login', {
                        category: 'auth',
                        label: 'credentials',
                        value: 1
                    });
                    router.push('/');
                    router.refresh();
                }
            } else {
                // Register
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await res.json();

                if (!res.ok) {
                    showAlert(data.message || t('auth.error.register', locale));
                } else {
                    // Auto login after register
                    const signInRes = await signIn('credentials', {
                        redirect: false,
                        username,
                        password
                    });

                    if (signInRes?.ok) {
                        gtag.event('sign_up', {
                            category: 'auth',
                            label: 'credentials',
                            value: 1
                        });
                        router.push('/');
                        router.refresh();
                    }
                }
            }
        } catch (error) {
            console.error('Auth error', error);
            showAlert(t('auth.error.server', locale));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-white'} flex flex-col items-center pt-32 sm:pt-48 px-4 pb-24 selection:bg-purple-300 selection:text-black transition-colors duration-300 overflow-y-auto relative`}>

            {/* Logo & Title */}
            <div className="flex flex-col items-center mb-20 text-center max-w-2xl mx-auto z-10">
                <div className="relative w-full h-[12rem] sm:h-[18rem]">
                    <h1
                        className="text-7xl sm:text-9xl font-black tracking-tighter dark:text-white select-none leading-[0.95] whitespace-pre-line text-center"
                    >
                        {titleText.split('\n').map((line, i, arr) => (
                            <span key={i}>
                                {line}
                                {i === arr.length - 1 && (
                                    <span className="inline-block w-[4px] h-[0.85em] bg-current opacity-80 ml-1 align-middle" style={{ animation: 'blink 600ms ease-in-out infinite' }} />
                                )}
                                {i < arr.length - 1 && <br />}
                            </span>
                        ))}
                    </h1>
                    <p className="text-xl sm:text-2xl text-gray-400 dark:text-neutral-500 font-bold leading-tight break-keep px-4 tracking-tight whitespace-pre-line absolute bottom-0 left-0 right-0">
                        {t('login.description', locale)}
                    </p>
                </div>
                <style jsx>{`
                    @keyframes blink {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0; }
                    }
                `}</style>
            </div>

            <div className="w-full max-w-md w-full relative z-10">
                <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-3xl border border-gray-100 dark:border-neutral-800 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-purple-500/5">

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{t('login.idLabel', locale)}</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                placeholder={t('login.idPlaceholder', locale)}
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{t('login.pwLabel', locale)}</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                placeholder={t('login.pwPlaceholder', locale)}
                            />
                        </div>

                        {!isLogin && (
                            <div className="flex flex-col gap-3 mt-2">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="relative flex items-center justify-center mt-1">
                                        <input
                                            type="checkbox"
                                            checked={agreeTerms}
                                            onChange={(e) => setAgreeTerms(e.target.checked)}
                                            className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded checked:bg-purple-600 checked:border-purple-600 transition-all cursor-pointer"
                                        />
                                        <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="1.5 6 4.5 9 12.5 1"></polyline>
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors">{t('login.agreeTerms', locale)}</span>
                                            <Link href="/terms" target="_blank" className="text-[10px] text-purple-500 hover:underline ml-1">{t('login.viewDetail', locale)}</Link>
                                        </div>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed bg-gray-50 dark:bg-black p-2 rounded-lg border border-gray-100 dark:border-neutral-800">
                                            {t('login.termsSummary', locale)}
                                        </p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="relative flex items-center justify-center mt-1">
                                        <input
                                            type="checkbox"
                                            checked={agreePrivacy}
                                            onChange={(e) => setAgreePrivacy(e.target.checked)}
                                            className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded checked:bg-purple-600 checked:border-purple-600 transition-all cursor-pointer"
                                        />
                                        <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="1.5 6 4.5 9 12.5 1"></polyline>
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors">{t('login.agreePrivacy', locale)}</span>
                                            <Link href="/privacy" target="_blank" className="text-[10px] text-purple-500 hover:underline ml-1">{t('login.viewDetail', locale)}</Link>
                                        </div>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed bg-gray-50 dark:bg-black p-2 rounded-lg border border-gray-100 dark:border-neutral-800">
                                            {t('login.privacySummary', locale)}
                                        </p>
                                    </div>
                                </label>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all mt-2 
                                ${loading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 active:scale-[0.98]'} flex items-center justify-center gap-2`}
                        >
                            {loading ? t('login.processing', locale) : (isLogin ? t('login.title', locale) : t('login.registerButton', locale))}
                        </button>
                    </form>

                    <div className="mt-4 text-center flex flex-col gap-3">
                        <button
                            type="button"
                            disabled={loading}
                            onClick={handleGuestLogin}
                            className={`w-full py-3.5 rounded-xl font-bold transition-all border-2 
                                ${loading ? 'bg-purple-50 text-purple-300 border-purple-100 dark:bg-purple-900/10 dark:text-purple-700 dark:border-purple-900/30 cursor-not-allowed' : 'bg-transparent text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 active:scale-[0.98]'} flex items-center justify-center gap-2`}
                        >
                            {t('login.guestButton', locale)}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setUsername('');
                                setPassword('');
                                setAgreeTerms(false);
                                setAgreePrivacy(false);
                            }}
                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
                        >
                            {isLogin ? t('login.noAccount', locale) : t('login.hasAccount', locale)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
