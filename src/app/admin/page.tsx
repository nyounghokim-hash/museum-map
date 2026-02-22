'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { useModal } from '@/components/ui/Modal';
import { t } from '@/lib/i18n';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const router = useRouter();
    const [authenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { locale } = useApp();

    const handleLogin = () => {
        if (password === 'admin0724') {
            setAuthenticated(true);
            setError('');
        } else {
            setError(t('admin.wrongPassword', locale));
        }
    };

    useEffect(() => {
        if (!authenticated) return;
        setLoading(true);
        Promise.all([
            fetch('/api/users?pw=admin0724').then(r => r.json()),
            fetch('/api/feedback?pw=admin0724').then(r => r.json())
        ])
            .then(([usersRes, feedRes]) => {
                setUsers(Array.isArray(usersRes?.data) ? usersRes.data : []);
                setFeedbacks(Array.isArray(feedRes?.data) ? feedRes.data : Array.isArray(feedRes) ? feedRes : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Admin fetch error:', err);
                setLoading(false);
            });
    }, [authenticated]);

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
                    <h2 className="text-xl font-bold mb-2 dark:text-white">{t('admin.access', locale) || 'Access Required'}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('admin.accessDesc', locale) || 'Admin dashboard'}</p>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        placeholder={t('admin.password', locale)}
                        className="w-full border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm dark:text-white"
                        autoFocus
                    />
                    {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
                    <button
                        onClick={handleLogin}
                        className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl font-bold hover:bg-neutral-800 dark:hover:bg-gray-200 transition-colors active:scale-95"
                    >
                        {t('admin.enter', locale)}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-8 mt-4 sm:mt-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white">{t('admin.title', locale)}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Users & Feedback Management</p>
                </div>
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-medium">{t('admin.authenticated', locale)}</span>
            </div>

            {/* Users Section */}
            <div className="mb-4 text-sm font-bold text-gray-500 dark:text-gray-400">
                {users.length} Total Users Sign-ups
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400 animate-pulse">Loading users...</div>
            ) : users.length === 0 ? (
                <div className="py-20 text-center text-gray-400 dark:text-gray-500 mb-8">No users found.</div>
            ) : (
                <div className="overflow-x-auto mb-10 border border-gray-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900">
                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-neutral-800 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Anonymous ID</th>
                                <th scope="col" className="px-6 py-3">Role</th>
                                <th scope="col" className="px-6 py-3">Registered At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className="bg-white border-b dark:bg-neutral-900 dark:border-neutral-800">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {u.id}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(u.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <hr className="my-10 border-gray-200 dark:border-neutral-800" />

            {/* Feedback Section */}
            <div className="mb-4 text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center justify-between">
                <span>{feedbacks.length} {t('admin.feedbackSubmissions', locale)}</span>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400 animate-pulse">{t('admin.loadingFeedback', locale)}</div>
            ) : feedbacks.length === 0 ? (
                <div className="py-20 text-center text-gray-400 dark:text-gray-500">{t('admin.noFeedback', locale)}</div>
            ) : (
                <div className="space-y-3">
                    {feedbacks.map((f: any) => (
                        <div key={f.id} className="border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-4 bg-indigo-50/50 dark:bg-indigo-900/10 flex items-start gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                                        USER ID: {f.userId ? f.userId.slice(0, 8) + '...' : t('global.anonymous', locale)}
                                    </span>
                                    {f.user?.email && (
                                        <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                                            {f.user.email}
                                        </span>
                                    )}
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                        {new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap mt-2 leading-relaxed">{f.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}
