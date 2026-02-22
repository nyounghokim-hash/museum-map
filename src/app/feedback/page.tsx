'use client';

import { useState } from 'react';
import { useApp } from '@/components/AppContext';
import { GlassPanel } from '@/components/ui/glass';
import { t } from '@/lib/i18n';
import LoadingAnimation from '@/components/ui/LoadingAnimation';

export default function FeedbackPage() {
    const { locale } = useApp();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!message) return;
        setLoading(true);
        try {
            await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: message })
            });
            setSuccess(true);
        } catch (err) {
            alert(t('feedback.error', locale) || 'Error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-[calc(100vh-56px)] bg-gray-50 dark:bg-black py-8 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto">
                <GlassPanel className="p-6 md:p-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-6">
                        {t('feedback.title', locale)}
                    </h1>
                    {success ? (
                        <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl text-center">
                            {t('feedback.success', locale)}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                rows={6}
                                className="w-full rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white p-4 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white resize-none"
                                placeholder={t('feedback.subtitle', locale)}
                            />
                            <button
                                type="submit"
                                disabled={loading || !message}
                                className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading && <LoadingAnimation size={24} className="brightness-150 dark:brightness-0" />}
                                {loading ? t('feedback.sending', locale) : t('feedback.send', locale)}
                            </button>
                        </form>
                    )}
                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-neutral-800 flex flex-wrap gap-4 text-xs text-gray-400 dark:text-neutral-500 font-medium">
                        <a href="/terms" className="hover:text-black dark:hover:text-white transition-colors underline decoration-gray-200 dark:decoration-neutral-800 underline-offset-4">
                            서비스 이용약관
                        </a>
                        <a href="/privacy" className="hover:text-black dark:hover:text-white transition-colors underline decoration-gray-200 dark:decoration-neutral-800 underline-offset-4">
                            개인정보 처리방침
                        </a>
                    </div>
                </GlassPanel>

                <div className="mt-12 flex flex-col items-center justify-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                    <p className="text-[10px] sm:text-xs font-bold tracking-widest text-gray-400 dark:text-neutral-600 uppercase">
                        made by Haerangsa
                    </p>
                    <a
                        href="https://www.instagram.com/haerang4a_archive"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 shadow-sm hover:scale-110 active:scale-95 transition-all text-gray-500 dark:text-neutral-400 hover:text-purple-500"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.31.976.975 1.247 2.242 1.31 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.31 3.608-.975.976-2.242 1.247-3.608 1.31-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.31-.976-.975-1.247-2.242-1.31-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.334-2.633 1.31-3.608.975-.976 2.242-1.247 3.608-1.31 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.28.058-2.56.31-3.487 1.237-.927.927-1.179 2.207-1.237 3.487-.058 1.279-.072 1.688-.072 4.947s.014 3.668.072 4.948c.058 1.279.31 2.559 1.237 3.486.927.927 2.207 1.179 3.487 1.237 1.279.058 1.688.072 4.947.072s3.668-.014 4.948-.072c1.279-.058 2.559-.31 3.486-1.237.927-.927 1.179-2.207 1.237-3.487.058-1.28.072-1.688.072-4.948s-.014-3.668-.072-4.947c-.058-1.279-.31-2.559-1.237-3.487-.927-.927-2.207-1.179-3.487-1.237-1.279-.058-1.688-.072-4.948-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                    </a>
                </div>
            </div>
        </main>
    );
}
