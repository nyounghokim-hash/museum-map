'use client';

import { useState } from 'react';
import { useApp } from '@/components/AppContext';
import { GlassPanel } from '@/components/ui/glass';
import { t } from '@/lib/i18n';

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
                                className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                {loading ? t('feedback.sending', locale) : t('feedback.send', locale)}
                            </button>
                        </form>
                    )}
                </GlassPanel>
            </div>
        </main>
    );
}
