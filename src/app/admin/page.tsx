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
    const [tab, setTab] = useState<'dashboard' | 'users' | 'blog' | 'museums' | 'exhibitions' | 'notifications'>('dashboard');
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
        } else if (tab === 'users') {
            endpoints = ['/api/users?pw=admin0724', '/api/feedback?pw=admin0724'];
        } else if (tab === 'blog') {
            endpoints = ['/api/blog?includeDrafts=true'];
        } else if (tab === 'museums') {
            endpoints = [`/api/admin/museums?query=${museumQuery}&page=${museumPage}`];
        } else if (tab === 'exhibitions') {
            endpoints = ['/api/admin/exhibitions'];
        }

        Promise.all(endpoints.map(e => fetch(e).then(r => r.json())))
            .then((results) => {
                if (tab === 'dashboard') {
                    setDashboardData(results[0]?.data);
                } else if (tab === 'users') {
                    setUsers(Array.isArray(results[0]?.data) ? results[0].data : []);
                    setFeedbacks(Array.isArray(results[1]?.data) ? results[1].data : Array.isArray(results[1]) ? results[1] : []);
                } else if (tab === 'blog') {
                    setPosts(Array.isArray(results[0]?.data) ? results[0].data : []);
                } else if (tab === 'museums') {
                    setMuseums(results[0]?.data?.data || []);
                    setMuseumTotal(results[0]?.data?.total || 0);
                } else if (tab === 'exhibitions') {
                    setExhibitionStats(results[0]?.data || []);
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
                            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${tab === 'dashboard' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg' : 'bg-gray-100 text-gray-400 dark:bg-neutral-800 dark:text-gray-500 hover:bg-gray-200'}`}
                        >
                            대시보드
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
                            onClick={() => setTab('exhibitions')}
                            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${tab === 'exhibitions' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg' : 'bg-gray-100 text-gray-400 dark:bg-neutral-800 dark:text-gray-500 hover:bg-gray-200'}`}
                        >
                            전시회 동기화
                        </button>
                        <button
                            onClick={() => setTab('notifications')}
                            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${tab === 'notifications' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg' : 'bg-gray-100 text-gray-400 dark:bg-neutral-800 dark:text-gray-500 hover:bg-gray-200'}`}
                        >
                            알림 전송
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
                    <div className="mb-6 text-sm font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                        총 {users.filter(u => u.username !== 'admin').length}명의 사용자 가입
                    </div>

                    <div className="overflow-x-auto mb-16 border border-gray-100 dark:border-neutral-800 rounded-3xl bg-white dark:bg-neutral-900 shadow-sm">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="text-[10px] text-gray-400 uppercase bg-gray-50 dark:bg-neutral-800/50 dark:text-neutral-500 font-black tracking-widest">
                                <tr>
                                    <th scope="col" className="px-8 py-5">익명 ID</th>
                                    <th scope="col" className="px-8 py-5">권한</th>
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
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                {u.role}
                                            </span>
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
                                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                                        사용자: {f.userId ? f.userId.slice(0, 8) : '익명'}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-300 dark:text-neutral-600">
                                        {new Date(f.createdAt).toLocaleDateString('ko-KR')}
                                    </span>
                                </div>
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
            ) : tab === 'exhibitions' ? (
                <div className="animate-fadeIn">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">전시회 동기화 현황</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">최대 7일간의 외부 API 캐시 정보를 관리합니다.</p>
                        </div>
                        <button
                            onClick={() => handleClearExhibitionCache()}
                            className="px-6 py-3 rounded-2xl border border-red-100 dark:border-red-900/20 text-red-500 text-[11px] font-black hover:bg-red-50 dark:hover:bg-red-900/10 transition-all active:scale-95 shadow-sm uppercase tracking-widest"
                        >
                            전체 캐시 삭제
                        </button>
                    </div>

                    <div className="overflow-x-auto border border-gray-100 dark:border-neutral-800 rounded-3xl bg-white dark:bg-neutral-900 shadow-sm mb-10">
                        <table className="w-full min-w-[800px] text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="text-[10px] text-gray-400 uppercase bg-gray-50 dark:bg-neutral-800/50 dark:text-neutral-500 font-black tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">미술관/박물관명</th>
                                    <th className="px-8 py-5">동기화된 전시회 수</th>
                                    <th className="px-8 py-5">마지막 동기화</th>
                                    <th className="px-8 py-5">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
                                {exhibitionStats.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-8 py-5 font-black text-gray-900 dark:text-white">{item.name}</td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-black text-purple-600 dark:text-purple-400">{item._count.exhibitions}개</span>
                                        </td>
                                        <td className="px-8 py-5 text-xs font-bold text-gray-400">
                                            {item.lastExhibitionSync ? new Date(item.lastExhibitionSync).toLocaleString('ko-KR') : '동기화 이력 없음'}
                                        </td>
                                        <td className="px-8 py-5">
                                            <button
                                                onClick={() => handleClearExhibitionCache(item.id)}
                                                className="px-4 py-2 bg-gray-50 dark:bg-neutral-800 rounded-xl text-[10px] font-black text-gray-400 hover:text-red-500 transition-colors tracking-widest uppercase"
                                            >
                                                캐시 삭제
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
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
            )
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
        website: museum?.website || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-scaleUp flex flex-col">
                <div className="px-8 py-6 border-b dark:border-neutral-800 flex justify-between items-center bg-gray-50/50 dark:bg-neutral-800/50">
                    <div>
                        <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">
                            {museum ? '미술관/박물관 정보 수정' : '새 미술관/박물관 추가'}
                        </h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">데이터베이스 엔트리</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">미술관/박물관 명칭</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white font-bold"
                                placeholder="국립현대미술관"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">설명</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white min-h-[120px] leading-relaxed"
                                placeholder="미술관에 대한 간략한 설명을 입력하세요..."
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">국가</label>
                            <input
                                required
                                value={formData.country}
                                onChange={e => setFormData({ ...formData, country: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white font-bold"
                                placeholder="대한민국"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">도시</label>
                            <input
                                required
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white font-bold"
                                placeholder="서울"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">위도 (Latitude)</label>
                            <input
                                type="number" step="any" required
                                value={formData.latitude}
                                onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                                className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">경도 (Longitude)</label>
                            <input
                                type="number" step="any" required
                                value={formData.longitude}
                                onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                                className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white font-bold"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">대표 이미지 URL</label>
                            <input
                                value={formData.imageUrl}
                                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white font-mono"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </form>

                <div className="p-8 border-t dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 px-6 rounded-2xl font-bold text-gray-500 bg-white dark:bg-neutral-900 dark:text-gray-400 border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 transition-all active:scale-95 shadow-sm"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 py-4 px-6 rounded-2xl font-black bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-gray-200 transition-all active:scale-95 shadow-xl"
                    >
                        저장하기
                    </button>
                </div>
            </div>
            <style jsx>{`
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

