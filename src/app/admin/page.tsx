'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { useModal } from '@/components/ui/Modal';
import { t } from '@/lib/i18n';

export default function AdminPage() {
    const [authenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [reviews, setReviews] = useState<any[]>([]);
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { locale } = useApp();
    const { showConfirm } = useModal();

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
            fetch('/api/reviews').then(r => r.json()),
            fetch('/api/feedback?pw=admin0724').then(r => r.json())
        ])
            .then(([revRes, feedRes]) => {
                setReviews(revRes.data || []);
                setFeedbacks(feedRes || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [authenticated]);

    const handleDelete = (id: string) => {
        showConfirm(t('modal.deleteReview', locale), async () => {
            await fetch(`/api/reviews/${id}`, {
                method: 'DELETE',
                headers: { 'x-admin-password': 'admin0724' },
            });
            setReviews(prev => prev.filter(r => r.id !== id));
        });
    };

    if (!authenticated) {
        return (
            <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 w-full max-w-sm shadow-2xl mx-4">
                    <h2 className="text-xl font-bold mb-2 dark:text-white">Admin Access</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter the admin password to continue.</p>
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
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('admin.reviewManagement', locale)}</p>
                </div>
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-medium">{t('admin.authenticated', locale)}</span>
            </div>

            {/* Reviews Section */}
            <div className="mb-4 text-sm font-bold text-gray-500 dark:text-gray-400">
                {reviews.length} {t('admin.totalReviews', locale)}
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400 animate-pulse">Loading reviews...</div>
            ) : reviews.length === 0 ? (
                <div className="py-20 text-center text-gray-400 dark:text-gray-500 mb-8">No reviews yet</div>
            ) : (
                <div className="space-y-3 mb-10">
                    {reviews.map((r) => (
                        <div key={r.id} className="border border-gray-200 dark:border-neutral-800 rounded-xl p-4 bg-white dark:bg-neutral-900 flex items-start gap-4 group">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{r.flag}</span>
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{r.nickname}</span>
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                        {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{r.content}</p>
                                <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400 dark:text-gray-500">
                                    <span>Museum: {r.museum?.name || 'Unknown'}</span>
                                    <span>IP: {r.ipAddress || 'N/A'}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(r.id)}
                                className="shrink-0 p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                                title="Delete"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <hr className="my-10 border-gray-200 dark:border-neutral-800" />

            {/* Feedback Section */}
            <div className="mb-4 text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center justify-between">
                <span>{feedbacks.length} Feedback Submissions</span>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400 animate-pulse">Loading feedback...</div>
            ) : feedbacks.length === 0 ? (
                <div className="py-20 text-center text-gray-400 dark:text-gray-500">No feedback yet</div>
            ) : (
                <div className="space-y-3">
                    {feedbacks.map((f: any) => (
                        <div key={f.id} className="border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-4 bg-indigo-50/50 dark:bg-indigo-900/10 flex items-start gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                                        USER ID: {f.userId ? f.userId.slice(0, 8) + '...' : 'Anonymous'}
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
