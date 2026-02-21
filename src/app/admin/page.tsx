'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
    const [authenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleLogin = () => {
        if (password === 'admin0724') {
            setAuthenticated(true);
            setError('');
        } else {
            setError('Wrong password');
        }
    };

    useEffect(() => {
        if (!authenticated) return;
        setLoading(true);
        fetch('/api/reviews')
            .then(r => r.json())
            .then(res => {
                setReviews(res.data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [authenticated]);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this review?')) return;
        await fetch(`/api/reviews/${id}`, {
            method: 'DELETE',
            headers: { 'x-admin-password': 'admin0724' },
        });
        setReviews(prev => prev.filter(r => r.id !== id));
    };

    // Password gate
    if (!authenticated) {
        return (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl mx-4">
                    <h2 className="text-xl font-bold mb-2">Admin Access</h2>
                    <p className="text-sm text-gray-500 mb-6">Enter the admin password to continue.</p>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        placeholder="Password"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        autoFocus
                    />
                    {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
                    <button
                        onClick={handleLogin}
                        className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-neutral-800 transition-colors active:scale-95"
                    >
                        Enter
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-8 mt-4 sm:mt-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold">Admin Panel</h1>
                    <p className="text-sm text-gray-500 mt-1">Review management</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">Authenticated</span>
            </div>

            <div className="mb-4 text-sm text-gray-500">{reviews.length} reviews total</div>

            {loading ? (
                <div className="py-20 text-center text-gray-400 animate-pulse">Loading reviews...</div>
            ) : reviews.length === 0 ? (
                <div className="py-20 text-center text-gray-400">No reviews yet</div>
            ) : (
                <div className="space-y-3">
                    {reviews.map((r) => (
                        <div key={r.id} className="border border-gray-200 rounded-xl p-4 bg-white flex items-start gap-4 group">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{r.flag}</span>
                                    <span className="text-sm font-bold text-gray-800">{r.nickname}</span>
                                    <span className="text-[10px] text-gray-400">
                                        {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.content}</p>
                                <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                                    <span>Museum: {r.museum?.name || 'Unknown'}</span>
                                    <span>IP: {r.ipAddress || 'N/A'}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(r.id)}
                                className="shrink-0 p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                title="Delete review"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
