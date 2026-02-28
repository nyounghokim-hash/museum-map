'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { useModal } from '@/components/ui/Modal';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import LoadingAnimation from '@/components/ui/LoadingAnimation';

export default function AdminPage() {
    const router = useRouter();
    const { data: session, status: authStatus } = useSession();
    const { showConfirm, showAlert } = useModal();
    const [authenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [museums, setMuseums] = useState<any[]>([]);
    const [museumTotal, setMuseumTotal] = useState(0);
    const [museumQuery, setMuseumQuery] = useState('');
    const [museumPage, setMuseumPage] = useState(1);
    const [isMuseumModalOpen, setIsMuseumModalOpen] = useState(false);
    const [editingMuseum, setEditingMuseum] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [exhibitionStats, setExhibitionStats] = useState<any[]>([]);
    const [aiUsage, setAiUsage] = useState<any>(null);
    const [gaData, setGaData] = useState<any>(null);
    const [gaLoading, setGaLoading] = useState(false);
    const [tab, setTab] = useState<'dashboard' | 'users' | 'blog' | 'museums' | 'notifications' | 'ai' | 'analytics'>('dashboard');
    const [notifForm, setNotifForm] = useState({ title: '', message: '', link: '', targetUserId: '' });
    const [sortCol, setSortCol] = useState<string>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const toggleSort = (col: string) => {
        if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortCol(col); setSortDir('asc'); }
    };
    const sortArrow = (col: string) => sortCol === col ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

    const sortedMuseums = [...museums].sort((a, b) => {
        let va: any, vb: any;
        if (sortCol === 'name') { va = a.name?.toLowerCase(); vb = b.name?.toLowerCase(); }
        else if (sortCol === 'city') { va = a.city?.toLowerCase(); vb = b.city?.toLowerCase(); }
        else if (sortCol === 'type') { va = a.type?.toLowerCase(); vb = b.type?.toLowerCase(); }
        else if (sortCol === 'popularity') { va = a.popularityScore || 0; vb = b.popularityScore || 0; }
        else { va = a.name?.toLowerCase(); vb = b.name?.toLowerCase(); }
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });
    const [sortBy, setSortBy] = useState<'views' | 'date'>('views');
    const { locale } = useApp();

    const handleLogin = async () => {
        setLoading(true);
        const res = await signIn('credentials', {
            username: 'admin',
            password: password,
            redirect: false
        });

        if (res?.ok) {
            setAuthenticated(true);
            setError('');
        } else {
            setError(t('admin.wrongPassword', locale) || 'Invalid password');
        }
        setLoading(false);
    };

    const fetchAdminData = () => {
        setLoading(true);
        let endpoints: string[] = [];

        if (tab === 'dashboard') {
            endpoints = ['/api/admin/dashboard'];
            // Fetch GA & AI data in parallel for dashboard summary
            fetch('/api/admin/analytics').then(r => r.json()).then(res => setGaData(res.data)).catch(() => { });
            fetch('/api/admin/ai-usage').then(r => r.json()).then(res => setAiUsage(res.data)).catch(() => { });
        } else if (tab === 'users') {
            endpoints = ['/api/users?pw=admin0724', '/api/feedback?pw=admin0724'];
        } else if (tab === 'blog') {
            endpoints = ['/api/blog?includeDrafts=true'];
        } else if (tab === 'museums') {
            endpoints = [`/api/admin/museums?query=${museumQuery}&page=${museumPage}`];
        } else if (tab === 'ai') {
            endpoints = ['/api/admin/ai-usage'];
        } else if (tab === 'analytics') {
            setGaLoading(true);
            fetch('/api/admin/analytics').then(r => r.json()).then(res => { setGaData(res.data); setGaLoading(false); setLoading(false); }).catch(() => { setGaLoading(false); setLoading(false); });
            return;
        }

        Promise.all(endpoints.map(e => fetch(e).then(r => r.json())))
            .then((results) => {
                if (tab === 'dashboard') {
                    setDashboardData(results[0]?.data);
                } else if (tab === 'users') {
                    const allUsers = Array.isArray(results[0]?.data) ? results[0].data : [];
                    setUsers(allUsers.filter((u: any) => u.role !== 'ADMIN'));
                    setFeedbacks(Array.isArray(results[1]?.data) ? results[1].data : Array.isArray(results[1]) ? results[1] : []);
                } else if (tab === 'blog') {
                    setPosts(Array.isArray(results[0]?.data) ? results[0].data : []);
                } else if (tab === 'museums') {
                    setMuseums(results[0]?.data?.data || []);
                    setMuseumTotal(results[0]?.data?.total || 0);
                } else if (tab === 'ai') {
                    setAiUsage(results[0]?.data || null);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error('Admin fetch error:', err);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (session?.user && (session.user as any).role === 'ADMIN') {
            setAuthenticated(true);
        }
    }, [session]);

    useEffect(() => {
        if (authenticated) {
            fetchAdminData();
        }
    }, [authenticated, tab, museumPage, museumQuery]);

    const handleMuseumSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setMuseumPage(1);
        fetchAdminData();
    };

    const handleSaveMuseum = async (museumData: any) => {
        try {
            const method = museumData.id ? 'PUT' : 'POST';
            const res = await fetch('/api/admin/museums', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(museumData)
            });
            if (res.ok) {
                setIsMuseumModalOpen(false);
                setEditingMuseum(null);
                fetchAdminData();
            } else {
                const err = await res.json();
                showAlert(err.message || (locale === 'ko' ? '미술관 저장에 실패했습니다.' : 'Failed to save museum'));
            }
        } catch (err) {
            console.error('Save museum error:', err);
        }
    };

    const handleDeleteMuseum = (id: string) => {
        showConfirm('이 미술관을 영구적으로 삭제하시겠습니까?', async () => {
            const res = await fetch(`/api/admin/museums?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchAdminData();
        });
    };

    const handleClearExhibitionCache = async (museumId?: string) => {
        const msg = museumId ? '이 미술관의 전시회 캐시를 비우시겠습니까?' : '모든 전시회 캐시를 비우시겠습니까?';
        showConfirm(msg, async () => {
            const url = museumId ? `/api/admin/exhibitions?museumId=${museumId}` : '/api/admin/exhibitions';
            const res = await fetch(url, { method: 'DELETE' });
            if (res.ok) fetchAdminData();
        });
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await fetch(`/api/blog/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            fetchAdminData();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleDeletePost = (id: string) => {
        showConfirm('이 게시물을 영구적으로 삭제하시겠습니까?', async () => {
            await fetch(`/api/blog/${id}`, { method: 'DELETE' });
            fetchAdminData();
        });
    };

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/admin/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notifForm)
            });
            if (res.ok) {
                showAlert('알림이 성공적으로 전송되었습니다.');
                setNotifForm({ title: '', message: '', link: '', targetUserId: '' });
            } else {
                const err = await res.json();
                showAlert(err.error || (locale === 'ko' ? '알림 전송 실패' : 'Failed to send notification'));
            }
        } catch (err) {
            console.error('Send notification error:', err);
        }
        setLoading(false);
    };

    if (!authenticated) {
        return (
            <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 w-full max-w-sm shadow-2xl relative">
                    <button
                        onClick={() => router.push('/')}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h2 className="text-xl font-bold mb-2 dark:text-white">관리자 인증</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">대시보드 접속을 위해 비밀번호를 입력해주세요.</p>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        placeholder="비밀번호"
                        className="w-full border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm dark:text-white"
                        autoFocus
                    />
                    {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
                    <button
                        onClick={handleLogin}
                        className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl font-bold hover:bg-neutral-800 dark:hover:bg-gray-200 transition-colors active:scale-95"
                    >
                        입장하기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1080px] w-full mx-auto p-4 sm:p-8 sm:mt-10 min-h-[800px]">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-black dark:text-white tracking-tight uppercase">관리자 센터</h1>
                    <div className="flex flex-wrap gap-2 sm:gap-3 mt-6">
                        <button
                            onClick={() => setTab('dashboard')}
                            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${tab === 'dashboard' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-gray-100 text-gray-400 dark:bg-neutral-800 dark:text-gray-500 hover:bg-gray-200'}`}
                        >
                            대시보드
                        </button>
                        <button
                            onClick={() => setTab('analytics')}
                            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${tab === 'analytics' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg' : 'bg-gray-100 text-gray-400 dark:bg-neutral-800 dark:text-gray-500 hover:bg-gray-200'}`}
                        >
                            구글 애널리틱스
                        </button>
                        <button
                            onClick={() => setTab('users')}
                            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${tab === 'users' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg' : 'bg-gray-100 text-gray-400 dark:bg-neutral-800 dark:text-gray-500 hover:bg-gray-200'}`}
                        >
                            사용자 & 피드백
                        </button>
                        <button
                            onClick={() => setTab('blog')}
                            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${tab === 'blog' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg' : 'bg-gray-100 text-gray-400 dark:bg-neutral-800 dark:text-gray-500 hover:bg-gray-200'}`}
                        >
                            스토리 관리
                        </button>
                        <button
                            onClick={() => setTab('museums')}
                            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${tab === 'museums' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg' : 'bg-gray-100 text-gray-400 dark:bg-neutral-800 dark:text-gray-500 hover:bg-gray-200'}`}
                        >
                            미술관/박물관 관리
                        </button>

                        <button
                            onClick={() => setTab('notifications')}
                            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${tab === 'notifications' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg' : 'bg-gray-100 text-gray-400 dark:bg-neutral-800 dark:text-gray-500 hover:bg-gray-200'}`}
                        >
                            알림 전송
                        </button>
                        <button
                            onClick={() => setTab('ai')}
                            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${tab === 'ai' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg' : 'bg-gray-100 text-gray-400 dark:bg-neutral-800 dark:text-gray-500 hover:bg-gray-200'}`}
                        >
                            AI 사용량
                        </button>

                    </div>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-2xl border border-green-100 dark:border-green-800/30">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-black text-green-700 dark:text-green-400 uppercase tracking-widest">인증됨: {session?.user?.name || '관리자'}</span>
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 dark:text-neutral-600 uppercase tracking-tight">System Role: {(session?.user as any)?.role}</span>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
                    <LoadingAnimation size={120} />
                    <p className="mt-4 text-sm font-medium text-gray-500 dark:text-neutral-400 animate-pulse">
                        데이터를 불러오는 중입니다...
                    </p>
                </div>
            ) : tab === 'dashboard' ? (
                <div className="animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">가입 사용자</h3>
                            <div className="text-3xl font-black dark:text-white">{Math.max((dashboardData?.stats?.users || 0) - 1, 0)}</div>
                        </div>
                        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">작성된 스토리</h3>
                            <div className="text-3xl font-black dark:text-white">{dashboardData?.stats?.stories || 0}</div>
                        </div>
                        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">등록된 미술관/박물관</h3>
                            <div className="text-3xl font-black dark:text-white">{dashboardData?.stats?.museums || 0}</div>
                        </div>
                    </div>

                    {/* GA4 & AI Key Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-5 rounded-3xl shadow-lg text-white">
                            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-80">실시간 사용자</h3>
                            <div className="text-2xl font-black mt-1">{gaData?.realtime ?? '-'}</div>
                            <p className="text-[9px] font-bold opacity-60 mt-0.5">Google Analytics</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-5 rounded-3xl shadow-lg text-white">
                            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-80">30일 페이지뷰</h3>
                            <div className="text-2xl font-black mt-1">{gaData?.totals30d?.pageViews?.toLocaleString() ?? '-'}</div>
                            <p className="text-[9px] font-bold opacity-60 mt-0.5">Google Analytics</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-5 rounded-3xl shadow-lg text-white">
                            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-80">오늘 AI 호출</h3>
                            <div className="text-2xl font-black mt-1">{aiUsage?.today?.requests ?? '-'}</div>
                            <p className="text-[9px] font-bold opacity-60 mt-0.5">Gemini API</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-5 rounded-3xl shadow-lg text-white">
                            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-80">이번 달 AI</h3>
                            <div className="text-2xl font-black mt-1">{aiUsage?.month?.requests ?? '-'}</div>
                            <p className="text-[9px] font-bold opacity-60 mt-0.5">Gemini API</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                                인기 스토리 TOP 5
                            </h2>
                            <div className="space-y-4">
                                {dashboardData?.popularStories?.map((s: any) => (
                                    <div key={s.id} className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-gray-100 dark:border-neutral-800 flex justify-between items-center shadow-sm">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <h4 className="font-black text-sm dark:text-white truncate">{s.title}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold mt-1">{s.author || '관리자'}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-black text-purple-600 dark:text-purple-400">{s.views} views</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                최근 접수된 피드백
                            </h2>
                            <div className="space-y-4">
                                {dashboardData?.recentFeedback?.map((f: any) => (
                                    <div key={f.id} className="bg-indigo-50/30 dark:bg-indigo-900/10 p-5 rounded-3xl border border-indigo-50 dark:border-indigo-900/20">
                                        <p className="text-sm text-gray-700 dark:text-neutral-300 font-medium line-clamp-2 mb-2 italic">"{f.content}"</p>
                                        <div className="flex justify-between items-center text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3">
                                            <span>USER: {f.user?.username || '익명'}</span>
                                            <span>{new Date(f.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {f.reply ? (
                                            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-3 mt-2 border border-indigo-100 dark:border-neutral-700">
                                                <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">관리자 답변</p>
                                                <p className="text-xs text-gray-600 dark:text-neutral-400">{f.reply}</p>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 mt-2">
                                                <input
                                                    type="text"
                                                    placeholder="답장 입력..."
                                                    className="flex-1 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-purple-500 dark:text-white"
                                                    id={`reply-${f.id}`}
                                                />
                                                <button
                                                    onClick={async () => {
                                                        const input = document.getElementById(`reply-${f.id}`) as HTMLInputElement;
                                                        if (!input?.value) return;
                                                        try {
                                                            await fetch(`/api/admin/feedback/${f.id}`, {
                                                                method: 'PUT',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ reply: input.value })
                                                            });
                                                            window.location.reload();
                                                        } catch (err) { console.error(err); }
                                                    }}
                                                    className="px-4 py-2 bg-purple-600 text-white text-[10px] font-black rounded-xl hover:bg-purple-700 transition-colors uppercase tracking-widest"
                                                >
                                                    답장
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* System Tools */}
                        <div className="mt-10">
                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                시스템 관리 도구
                            </h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('activeTrip');
                                        alert('진행중 경로 캐시가 삭제되었습니다.');
                                    }}
                                    className="w-full flex items-center gap-3 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/20 transition-colors group"
                                >
                                    <span className="text-lg">🗑️</span>
                                    <div className="text-left">
                                        <p className="text-sm font-black text-red-700 dark:text-red-400">진행중 경로 캐시 삭제</p>
                                        <p className="text-[10px] text-red-500/70 dark:text-red-400/50 font-medium">localStorage의 activeTrip 데이터를 완전히 삭제합니다</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : tab === 'users' ? (
                <div className="animate-fadeIn">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">총 사용자</div>
                            <div className="text-2xl font-black dark:text-white">{users.length}</div>
                        </div>
                        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">회원</div>
                            <div className="text-2xl font-black text-purple-600">{users.filter(u => u.role === 'USER').length}</div>
                        </div>
                        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">비회원</div>
                            <div className="text-2xl font-black text-blue-500">{users.filter(u => u.role === 'GUEST').length}</div>
                        </div>
                        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">피드백</div>
                            <div className="text-2xl font-black text-indigo-500">{feedbacks.length}</div>
                        </div>
                    </div>

                    <div className="overflow-x-auto mb-16 border border-gray-100 dark:border-neutral-800 rounded-3xl bg-white dark:bg-neutral-900 shadow-sm">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="text-[10px] text-gray-400 uppercase bg-gray-50 dark:bg-neutral-800/50 dark:text-neutral-500 font-black tracking-widest">
                                <tr>
                                    <th scope="col" className="px-8 py-5">익명 ID</th>
                                    <th scope="col" className="px-8 py-5">유형</th>
                                    <th scope="col" className="px-8 py-5">국가/언어</th>
                                    <th scope="col" className="px-8 py-5">가입일시</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
                                {users.map((u) => (
                                    <tr key={u.id} className="bg-white hover:bg-gray-50/50 dark:bg-neutral-900 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-8 py-5 font-mono text-xs text-gray-900 dark:text-neutral-300">
                                            {u.id}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${u.role === 'GUEST' ? 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                                                {u.role === 'GUEST' ? '비회원' : '회원'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-xs font-bold text-gray-500">
                                            {u.preferences && typeof u.preferences === 'object' && (u.preferences as any).locale
                                                ? <span className="px-2 py-0.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[10px] font-black uppercase">{(u.preferences as any).locale}</span>
                                                : <span className="text-gray-300 dark:text-neutral-600">—</span>}
                                        </td>
                                        <td className="px-8 py-5 text-xs font-bold text-gray-400">
                                            {new Date(u.createdAt).toLocaleString('ko-KR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mb-6 text-sm font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                        {feedbacks.length}개의 사용자 피드백 접수
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {feedbacks.map((f: any) => (
                            <div key={f.id} className="border border-indigo-50 dark:border-indigo-900/20 rounded-3xl p-6 bg-white dark:bg-neutral-900 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                                            사용자: {f.userId ? f.userId.slice(0, 8) : '익명'}
                                        </span>
                                        {f.type === 'report' && (
                                            <span className="text-[9px] font-black bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full uppercase">
                                                🚨 정보수정
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-300 dark:text-neutral-600">
                                        {new Date(f.createdAt).toLocaleDateString('ko-KR')}
                                    </span>
                                </div>
                                {f.targetName && (
                                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 px-3 py-1.5 rounded-lg">
                                        📍 {f.targetName} ({f.category === 'museum_info' ? '박물관' : '스토리'})
                                    </p>
                                )}
                                <p className="text-sm text-gray-700 dark:text-neutral-300 leading-relaxed font-medium">{f.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : tab === 'blog' ? (
                <div className="animate-fadeIn">
                    <div className="flex justify-between items-center mb-8">
                        <div className="text-sm font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                            총 {posts.length}개의 스토리 목록
                        </div>
                        <div className="flex items-center gap-4">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="bg-gray-50 dark:bg-neutral-800 border-none rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                            >
                                <option value="views">조회수순</option>
                                <option value="date">최신순</option>
                            </select>
                            <button onClick={() => router.push('/blog/new')} className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-2xl text-xs font-black shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">스토리 작성</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {[...posts].sort((a, b) => {
                            if (sortBy === 'views') return b.views - a.views;
                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                        }).map((post) => (
                            <div key={post.id} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-3xl p-6 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
                                <div className="flex-1 pr-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                            {post.status === 'PUBLISHED' ? '발행됨' : '초안'}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-300 dark:text-neutral-600 font-mono">{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                                        <span className="px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-neutral-800 text-[10px] font-black text-purple-600 uppercase tracking-tight">{post.views} views</span>
                                    </div>
                                    <h3 className="font-black text-lg dark:text-white leading-tight">{post.title}</h3>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">작성자: {post.author || '관리자'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => router.push(`/blog/edit/${post.id}`)} className="px-5 py-2.5 bg-gray-50 dark:bg-neutral-800 rounded-xl text-[11px] font-black text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors uppercase tracking-widest">수정</button>
                                    <button onClick={() => handleDeletePost(post.id)} className="px-5 py-2.5 bg-red-50 dark:bg-red-900/10 rounded-xl text-[11px] font-black text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors uppercase tracking-widest">삭제</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : tab === 'museums' ? (
                <div className="animate-fadeIn">
                    <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <form onSubmit={handleMuseumSearch} className="relative w-full sm:max-w-md">
                            <input
                                type="text"
                                value={museumQuery}
                                onChange={(e) => setMuseumQuery(e.target.value)}
                                placeholder="미술관명, 도시 또는 국가로 검색..."
                                className="w-full bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white shadow-sm"
                            />
                            <button type="submit" className="absolute right-4 top-4 text-gray-400">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </button>
                        </form>
                        <button
                            onClick={() => {
                                setEditingMuseum(null);
                                setIsMuseumModalOpen(true);
                            }}
                            className="bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-2xl text-sm font-black shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                        >
                            미술관/박물관 추가
                        </button>
                    </div>

                    <div className="overflow-x-auto border border-gray-100 dark:border-neutral-800 rounded-3xl bg-white dark:bg-neutral-900 shadow-sm mb-10">
                        <table className="w-full min-w-[800px] text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="text-[10px] text-gray-400 uppercase bg-gray-50 dark:bg-neutral-800/50 dark:text-neutral-500 font-black tracking-widest">
                                <tr>
                                    <th className="px-8 py-5 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors select-none" onClick={() => toggleSort('name')}>미술관/박물관명{sortArrow('name')}</th>
                                    <th className="px-8 py-5 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors select-none" onClick={() => toggleSort('city')}>위치{sortArrow('city')}</th>
                                    <th className="px-8 py-5 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors select-none" onClick={() => toggleSort('type')}>유형{sortArrow('type')}</th>
                                    <th className="px-8 py-5 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors select-none" onClick={() => toggleSort('popularity')}>인기상태{sortArrow('popularity')}</th>
                                    <th className="px-8 py-5">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
                                {sortedMuseums.map((m) => (
                                    <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-8 py-5 font-black text-gray-900 dark:text-white">{m.name}</td>
                                        <td className="px-8 py-5 text-[11px] font-bold text-gray-400">{m.city}, {m.country}</td>
                                        <td className="px-8 py-5 text-[10px] tracking-widest uppercase font-black text-purple-600 dark:text-purple-400">{m.type}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-yellow-400" style={{ width: `${Math.min(m.popularityScore * 20, 100)}%` }} />
                                                </div>
                                                <span className="text-[10px] font-black">{m.popularityScore.toFixed(1)}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => {
                                                        setEditingMuseum(m);
                                                        setIsMuseumModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button onClick={() => handleDeleteMuseum(m.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-center items-center gap-6 mb-12">
                        <button
                            disabled={museumPage === 1}
                            onClick={() => setMuseumPage(p => p - 1)}
                            className="px-6 py-3 border border-gray-100 dark:border-neutral-800 rounded-2xl text-[11px] font-black text-gray-400 uppercase tracking-widest disabled:opacity-20 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all shadow-sm"
                        >
                            이전
                        </button>
                        <div className="text-[11px] font-black dark:text-neutral-500 uppercase tracking-widest">
                            페이지 {museumPage} / {Math.max(1, Math.ceil(museumTotal / 20))}
                        </div>
                        <button
                            disabled={museumPage >= Math.ceil(museumTotal / 20)}
                            onClick={() => setMuseumPage(p => p + 1)}
                            className="px-6 py-3 border border-gray-100 dark:border-neutral-800 rounded-2xl text-[11px] font-black text-gray-400 uppercase tracking-widest disabled:opacity-20 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all shadow-sm"
                        >
                            다음
                        </button>
                    </div>
                </div>
            ) : tab === 'ai' ? (
                <div className="animate-fadeIn">
                    <div className="mb-8">
                        <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">AI 토큰 사용 현황</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Gemini API 호출 및 토큰 소모량을 실시간으로 모니터링합니다.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        {[{ label: '오늘', d: aiUsage?.today }, { label: '이번 주', d: aiUsage?.week }, { label: '이번 달', d: aiUsage?.month }, { label: '전체', d: aiUsage?.total }].map(({ label, d }) => (
                            <div key={label} className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</h3>
                                <div className="text-2xl font-black dark:text-white">{d?.requests || 0}</div>
                                <p className="text-[10px] text-purple-500 font-bold mt-1">~{((d?.tokens || 0) / 1000).toFixed(1)}K tokens</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm mb-8">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">최근 7일 사용량</h3>
                        <div className="flex items-end gap-2 h-32">
                            {aiUsage?.dailyBreakdown?.map((d: any) => {
                                const maxReq = Math.max(...(aiUsage?.dailyBreakdown?.map((x: any) => x.requests) || [1]), 1);
                                const h = Math.max((d.requests / maxReq) * 100, 4);
                                return (
                                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                                        <span className="text-[9px] font-black text-purple-600 dark:text-purple-400">{d.requests}</span>
                                        <div className="w-full bg-purple-100 dark:bg-purple-900/30 rounded-t-lg relative" style={{ height: `${h}%` }}>
                                            <div className="absolute inset-0 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg opacity-80" />
                                        </div>
                                        <span className="text-[8px] font-bold text-gray-300 dark:text-neutral-600">{d.date.slice(5)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b dark:border-neutral-800">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">최근 AI 요청 로그</h3>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                            {aiUsage?.recentLogs?.length ? aiUsage.recentLogs.map((l: any) => (
                                <div key={l.id} className="px-6 py-3 border-b dark:border-neutral-800 last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-gray-700 dark:text-neutral-300">{l.action}</span>
                                        <span className="text-[9px] font-bold text-gray-300 dark:text-neutral-600">{new Date(l.createdAt).toLocaleString('ko-KR')}</span>
                                    </div>
                                    {l.detail && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{l.detail}</p>}
                                </div>
                            )) : (
                                <div className="px-6 py-10 text-center text-sm text-gray-400">AI 사용 로그가 없습니다</div>
                            )}
                        </div>
                    </div>
                </div>
            ) : tab === 'notifications' ? (
                <div className="animate-fadeIn">
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-8">
                            <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">알림 전송</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">모든 사용자 또는 특정 사용자에게 알림을 보냅니다.</p>
                        </div>

                        <form onSubmit={handleSendNotification} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-3xl p-8 shadow-sm space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">알림 제목</label>
                                <input
                                    required
                                    value={notifForm.title}
                                    onChange={e => setNotifForm({ ...notifForm, title: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white font-bold"
                                    placeholder="새로운 전시 소식이 있습니다!"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">내용</label>
                                <textarea
                                    required
                                    value={notifForm.message}
                                    onChange={e => setNotifForm({ ...notifForm, message: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white min-h-[120px] leading-relaxed"
                                    placeholder="전시회 내용을 입력하세요..."
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">연결 링크 (선택사항)</label>
                                <input
                                    value={notifForm.link}
                                    onChange={e => setNotifForm({ ...notifForm, link: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white font-mono"
                                    placeholder="/blog/1230"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">대상 사용자 ID (비워두면 전체 전송)</label>
                                <input
                                    value={notifForm.targetUserId}
                                    onChange={e => setNotifForm({ ...notifForm, targetUserId: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white font-mono"
                                    placeholder="user-cuid-..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
                            >
                                알림 보내기
                            </button>
                        </form>
                    </div>
                </div>
            ) : tab === 'analytics' ? (
                <div className="animate-fadeIn">
                    <div className="mb-8">
                        <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">Google Analytics</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">GA4 실시간 트래픽 및 사용자 분석</p>
                    </div>
                    {gaLoading ? (
                        <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
                    ) : !gaData ? (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-2xl p-6">
                            <p className="text-sm font-bold text-yellow-800 dark:text-yellow-300">GA4 환경변수 설정 필요</p>
                            <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">Vercel에 <code className="bg-yellow-100 dark:bg-yellow-800/30 px-1 rounded">GA4_PROPERTY_ID</code>와 <code className="bg-yellow-100 dark:bg-yellow-800/30 px-1 rounded">GOOGLE_SERVICE_ACCOUNT_JSON</code>을 환경변수로 설정해주세요.</p>
                        </div>
                    ) : (
                        <div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
                                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-5 rounded-3xl shadow-lg text-white">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-80">실시간</h3>
                                    <div className="text-3xl font-black mt-1">{gaData.realtime || 0}</div>
                                    <p className="text-[10px] font-bold opacity-70 mt-1">활성 사용자</p>
                                </div>
                                {gaData.totals30d && [{ l: '30일 사용자', v: gaData.totals30d.users }, { l: '30일 세션', v: gaData.totals30d.sessions }, { l: '30일 페이지뷰', v: gaData.totals30d.pageViews }, { l: '이탈률', v: (gaData.totals30d.bounceRate * 100).toFixed(1) + '%' }].map(({ l, v }) => (
                                    <div key={l} className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{l}</h3>
                                        <div className="text-2xl font-black dark:text-white mt-1">{typeof v === 'number' ? v.toLocaleString() : v}</div>
                                    </div>
                                ))}
                            </div>
                            {gaData.daily?.length > 0 && (() => {
                                const maxPv = Math.max(...gaData.daily.map((x: any) => x.pageViews || 1));
                                const maxUsers = Math.max(...gaData.daily.map((x: any) => x.users || 1));
                                return (
                                    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-neutral-800 p-6 mb-8 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-black dark:text-white uppercase tracking-tight">일별 트래픽 (7일)</h3>
                                            <div className="flex gap-3 text-[10px] font-bold">
                                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" />페이지뷰</span>
                                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />사용자</span>
                                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />세션</span>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <div className="flex items-end gap-3" style={{ height: '180px' }}>
                                                {gaData.daily.map((d: any, i: number) => {
                                                    const pvH = Math.max(6, (d.pageViews / maxPv) * 100);
                                                    const uH = Math.max(6, (d.users / maxUsers) * 100);
                                                    const sH = Math.max(6, (d.sessions / Math.max(...gaData.daily.map((x: any) => x.sessions || 1))) * 100);
                                                    const dateStr = d.date ? `${d.date.slice(4, 6)}/${d.date.slice(6)}` : '';
                                                    return (
                                                        <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                                                            <div className="text-[9px] font-bold text-purple-500">{d.pageViews}</div>
                                                            <div className="w-full flex items-end justify-center gap-[2px]" style={{ height: '140px' }}>
                                                                <div className="flex-1 rounded-t-md bg-gradient-to-t from-blue-500 to-blue-400 transition-all" style={{ height: `${uH}%` }} title={`사용자: ${d.users}`} />
                                                                <div className="flex-1 rounded-t-md bg-gradient-to-t from-purple-600 to-purple-400 transition-all" style={{ height: `${pvH}%` }} title={`페이지뷰: ${d.pageViews}`} />
                                                                <div className="flex-1 rounded-t-md bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all" style={{ height: `${sH}%` }} title={`세션: ${d.sessions}`} />
                                                            </div>
                                                            <div className="text-[10px] font-bold text-gray-400 mt-1">{dateStr}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {gaData.topPages?.length > 0 && (
                                    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-neutral-800 p-6 shadow-sm">
                                        <h3 className="text-sm font-black dark:text-white uppercase tracking-tight mb-4">인기 페이지 (7일)</h3>
                                        <div className="space-y-2">{gaData.topPages.map((p: any, i: number) => (<div key={i} className="flex items-center justify-between text-xs"><span className="text-gray-600 dark:text-gray-400 truncate max-w-[70%] font-mono">{p.path}</span><span className="font-black dark:text-white">{p.views.toLocaleString()}</span></div>))}</div>
                                    </div>
                                )}
                                {gaData.countries?.length > 0 && (
                                    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-neutral-800 p-6 shadow-sm">
                                        <h3 className="text-sm font-black dark:text-white uppercase tracking-tight mb-4">국가별 사용자 (7일)</h3>
                                        <div className="space-y-2">{gaData.countries.map((c: any, i: number) => (<div key={i} className="flex items-center justify-between text-xs"><span className="text-gray-600 dark:text-gray-400">{c.country}</span><span className="font-black dark:text-white">{c.users.toLocaleString()}</span></div>))}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ) : null
            }

            {
                isMuseumModalOpen && (
                    <MuseumEditModal
                        museum={editingMuseum}
                        onClose={() => setIsMuseumModalOpen(false)}
                        onSave={handleSaveMuseum}
                    />
                )
            }
        </div >
    );
}

function MuseumEditModal({ museum, onClose, onSave }: { museum: any, onClose: () => void, onSave: (data: any) => void }) {
    const [formData, setFormData] = useState({
        id: museum?.id || '',
        name: museum?.name || '',
        description: museum?.description || '',
        country: museum?.country || '',
        city: museum?.city || '',
        type: museum?.type || 'MUSEUM',
        latitude: museum?.latitude || 0,
        longitude: museum?.longitude || 0,
        imageUrl: museum?.imageUrl || '',
        website: museum?.website || '',
        visitorInfo: museum?.visitorInfo || [],
    });
    const [loading, setLoading] = useState(!!museum?.id);

    useEffect(() => {
        if (!museum?.id) { setLoading(false); return; }
        fetch(`/api/museums/${museum.id}`)
            .then(r => r.json())
            .then(res => {
                const d = res.data;
                if (d) setFormData(prev => ({ ...prev, visitorInfo: d.visitorInfo || [], description: d.description || prev.description }));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [museum?.id]);

    const handleSubmit = (e?: any) => { if (e?.preventDefault) e.preventDefault(); onSave(formData); };

    const addVisitorInfo = () => setFormData({ ...formData, visitorInfo: [...formData.visitorInfo, { label: '', value: '', icon: '📌' }] });
    const updateVi = (i: number, f: string, v: string) => { const u = [...formData.visitorInfo]; u[i] = { ...u[i], [f]: v }; setFormData({ ...formData, visitorInfo: u }); };
    const removeVi = (i: number) => setFormData({ ...formData, visitorInfo: formData.visitorInfo.filter((_: any, j: number) => j !== i) });

    const ICONS = ['🎫', '🕐', '📍', '🚇', '⏱️', '📌', '🌐', '🎨'];
    const LABELS = ['입장료', '운영시간', '위치', '교통', '관람시간', '가는 길'];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-scaleUp flex flex-col">
                <div className="px-8 py-6 border-b dark:border-neutral-800 flex justify-between items-center bg-gray-50/50 dark:bg-neutral-800/50">
                    <div>
                        <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">{museum ? '정보 수정' : '새로 추가'}</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">미술관/박물관</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                    <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 custom-scrollbar">
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">명칭</label>
                                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white font-bold" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">설명</label>
                                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white min-h-[100px] leading-relaxed" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">국가 코드</label>
                                    <input required value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm outline-none dark:text-white font-bold" placeholder="KR" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">도시</label>
                                    <input required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm outline-none dark:text-white font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">위도</label>
                                    <input type="number" step="any" required value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                                        className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm outline-none dark:text-white font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">경도</label>
                                    <input type="number" step="any" required value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                                        className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm outline-none dark:text-white font-bold" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">웹사이트</label>
                                    <input value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm outline-none dark:text-white" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">이미지 URL</label>
                                    <input value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm outline-none dark:text-white font-mono" placeholder="https://..." />
                                </div>
                            </div>

                            {/* Visitor Info */}
                            <div className="border-t dark:border-neutral-800 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-black dark:text-white uppercase tracking-tight">방문 정보</h3>
                                    <button type="button" onClick={addVisitorInfo} className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 active:scale-95 transition-all">+ 추가</button>
                                </div>
                                <div className="space-y-3">
                                    {formData.visitorInfo.map((item: any, idx: number) => (
                                        <div key={idx} className="flex gap-2 items-start bg-gray-50 dark:bg-neutral-800 rounded-2xl p-3">
                                            <select value={item.icon || '📌'} onChange={e => updateVi(idx, 'icon', e.target.value)}
                                                className="bg-white dark:bg-neutral-700 border-none rounded-xl px-2 py-2 text-base outline-none cursor-pointer">
                                                {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                                            </select>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex gap-2">
                                                    <select value={LABELS.includes(item.label) ? item.label : '__custom'} onChange={e => { if (e.target.value !== '__custom') updateVi(idx, 'label', e.target.value); }}
                                                        className="bg-white dark:bg-neutral-700 border-none rounded-xl px-3 py-2 text-xs font-bold outline-none dark:text-white">
                                                        {LABELS.map(l => <option key={l} value={l}>{l}</option>)}
                                                        <option value="__custom">직접 입력</option>
                                                    </select>
                                                    <input value={item.label} onChange={e => updateVi(idx, 'label', e.target.value)} placeholder="라벨"
                                                        className="flex-1 bg-white dark:bg-neutral-700 border-none rounded-xl px-3 py-2 text-xs outline-none dark:text-white font-bold" />
                                                </div>
                                                <textarea value={item.value} onChange={e => updateVi(idx, 'value', e.target.value)} placeholder="값 (예: 무료, 화~일 10:00-18:00)"
                                                    className="w-full bg-white dark:bg-neutral-700 border-none rounded-xl px-3 py-2 text-xs outline-none dark:text-white min-h-[50px]" />
                                            </div>
                                            <button type="button" onClick={() => removeVi(idx)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                    {formData.visitorInfo.length === 0 && (
                                        <p className="text-xs text-gray-400 text-center py-4">방문 정보 없음. &quot;추가&quot;를 클릭하세요.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/50 flex gap-3 sticky bottom-0">
                            <button type="button" onClick={onClose}
                                className="flex-1 py-4 px-6 rounded-2xl font-bold text-gray-500 bg-white dark:bg-neutral-900 dark:text-gray-400 border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 transition-all active:scale-95 shadow-sm">취소</button>
                            <button type="submit"
                                className="flex-1 py-4 px-6 rounded-2xl font-black bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-gray-200 transition-all active:scale-95 shadow-xl">저장하기</button>
                        </div>
                    </form>
                )}
            </div>
            <style jsx global>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 200ms ease-out; }
                .animate-scaleUp { animation: scaleUp 200ms ease-out forwards; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #262626; }
            `}</style>
        </div>
    );
}
