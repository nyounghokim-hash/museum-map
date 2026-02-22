'use client';
import { useState, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { GlassPanel } from '@/components/ui/glass';
import { useModal } from '@/components/ui/Modal';
import { useApp } from '@/components/AppContext';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { showAlert, showConfirm } = useModal();
    const { darkMode } = useApp();
    const clickCount = useRef(0);
    const lastClickTime = useRef(0);

    const handleLogoClick = () => {
        const now = Date.now();
        if (now - lastClickTime.current < 500) {
            clickCount.current += 1;
        } else {
            clickCount.current = 1;
        }
        lastClickTime.current = now;

        if (clickCount.current >= 8) {
            router.push('/admin');
            clickCount.current = 0;
        }
    };

    const handleGuestLogin = async () => {
        setLoading(true);
        const guestId = `guest_${Date.now()}`;
        sessionStorage.setItem('isGuest', 'true');

        try {
            const res = await signIn('credentials', {
                redirect: false,
                username: guestId,
                password: guestId
            });

            if (res?.ok) {
                router.push('/');
                router.refresh();
            } else {
                showAlert('게스트 접속 중 오류가 발생했습니다.');
            }
        } catch (e) {
            showAlert('서버와의 통신 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password) {
            showAlert('아이디와 비밀번호를 모두 입력해주세요.');
            return;
        }

        if (!isLogin && (!agreeTerms || !agreePrivacy)) {
            showAlert('모든 약관에 동의해주셔야 회원가입이 가능합니다.');
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
                    showAlert('아이디 또는 비밀번호가 올바르지 않습니다.');
                } else {
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
                    showAlert(data.message || '회원가입 중 오류가 발생했습니다.');
                } else {
                    // Auto login after register
                    const signInRes = await signIn('credentials', {
                        redirect: false,
                        username,
                        password
                    });

                    if (signInRes?.ok) {
                        router.push('/');
                        router.refresh();
                    }
                }
            }
        } catch (error) {
            console.error('Auth error', error);
            showAlert('서버와의 통신 중 에러가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-[calc(100vh-56px)] ${darkMode ? 'bg-black' : 'bg-white'} flex flex-col items-center justify-center p-4 selection:bg-purple-300 selection:text-black transition-colors duration-300 overflow-y-auto`}>

            {/* Logo & Title */}
            <div className="flex flex-col items-center mb-12 text-center max-w-2xl mx-auto">
                <h1
                    onClick={handleLogoClick}
                    className="text-6xl sm:text-8xl font-black tracking-tighter dark:text-white mb-6 cursor-pointer select-none hover:scale-[1.02] transition-transform active:scale-95"
                >
                    Museum Map
                </h1>
                <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed break-keep px-4">
                    전 세계 미술관을 당신의 손안에! <br className="hidden sm:block" />
                    나만의 전시 컬렉션을 수집하고, 여행 동선을 최적화하는 <br className="hidden sm:block" />
                    스마트 아트 트립 플래너.
                </p>
            </div>

            <div className="w-full max-w-md w-full relative z-10">
                {/* Intro Card */}
                {isLogin && (
                    <div className="p-5 mb-6 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-2xl text-center shadow-sm">
                        <h2 className="text-lg font-bold text-purple-700 dark:text-purple-400 mb-2">
                            전 세계 미술관을 당신의 손안에
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            나만의 전시 컬렉션을 수집하고, 여행 동선을 최적화하는 스마트 아트 트립 플래너.
                        </p>
                    </div>
                )}

                <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-gray-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                        {isLogin ? '로그인' : '회원가입'}
                    </h2>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">아이디</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                placeholder="아이디를 입력하세요"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">비밀번호</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                placeholder="비밀번호를 입력하세요"
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
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors">[필수] 서비스 이용약관 동의</span>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed bg-gray-50 dark:bg-black p-2 rounded-lg border border-gray-100 dark:border-neutral-800">
                                            제 1조 (목적) 본 약관은 Museum Map에서 제공하는 아트 트립 및 컬렉션 저장 서비스의 이용 조건 및 관리 절차를 규정합니다. 회원은 본 문서의 조항에 따라 적법하게 서비스를 이용합니다.
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
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors">[필수] 개인정보 처리방침 동의</span>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed bg-gray-50 dark:bg-black p-2 rounded-lg border border-gray-100 dark:border-neutral-800">
                                            Museum Map은 서비스 운영을 위해 수집된 아이디(username)와 암호화된 비밀번호 등 최소한의 개인정보를 수집하며, 회원의 승인 없이 외부에 제 3자 제공하지 않습니다.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all mt-2 
                                ${loading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 active:scale-[0.98]'}`}
                        >
                            {loading ? '처리중...' : (isLogin ? '로그인' : '가입하기')}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-neutral-800 text-center flex flex-col gap-3">
                        <button
                            type="button"
                            disabled={loading}
                            onClick={handleGuestLogin}
                            className={`w-full py-3.5 rounded-xl font-bold transition-all border-2 
                                ${loading ? 'bg-purple-50 text-purple-300 border-purple-100 dark:bg-purple-900/10 dark:text-purple-700 dark:border-purple-900/30 cursor-not-allowed' : 'bg-transparent text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 active:scale-[0.98]'}`}
                        >
                            비회원으로 이용할래요
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
                            {isLogin ? '아직 계정이 없으신가요? 회원가입 하기' : '이미 계정이 있으신가요? 로그인 하기'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
