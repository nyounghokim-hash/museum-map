'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GlassPanel } from '@/components/ui/glass';
import { useApp } from '@/components/AppContext';
import { useModal } from '@/components/ui/Modal';
import { t } from '@/lib/i18n';

export default function MyPlansPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { locale } = useApp();
    const { showAlert, showConfirm } = useModal();

    useEffect(() => {
        fetch('/api/plans')
            .then(r => r.json())
            .then(res => { setPlans(res.data || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        showConfirm(t('modal.deletePlan', locale), async () => {
            await fetch(`/api/plans/${id}`, { method: 'DELETE' });
            setPlans(prev => prev.filter(p => p.id !== id));
        });
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-4 sm:p-6 sm:mt-6 overflow-hidden">
            <div className="mb-5 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight dark:text-white">{t('plans.title', locale)}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 sm:mt-2 text-sm">{t('plans.subtitle', locale)}</p>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400 animate-pulse">{t('plans.loading', locale)}</div>
            ) : plans.length === 0 ? (
                <div className="py-16 sm:py-20 text-center">
                    <div className="text-5xl sm:text-6xl mb-4">🗺️</div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t('plans.empty', locale)}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-6">{t('plans.emptyDesc', locale)}</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3 sm:gap-4">
                    {plans.map((plan) => {
                        const stopCount = plan.stops?.length || 0;
                        const museumNames = plan.stops?.map((s: any) => s.museum?.name).filter(Boolean).slice(0, 3) || [];
                        const dateStr = plan.date ? new Date(plan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date set';

                        return (
                            <Link key={plan.id} href={`/plans/${plan.id}`}>
                                <GlassPanel className="p-4 sm:p-5 hover:shadow-lg transition-all cursor-pointer group overflow-hidden relative active:scale-[0.98]">
                                    <button
                                        onClick={(e) => handleDelete(plan.id, e)}
                                        className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-2 sm:p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 sm:opacity-0 sm:group-hover:opacity-100 transition-all z-10"
                                        title="Delete"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                    <div className="min-w-0 pr-8 sm:pr-10">
                                        <h3 className="text-base sm:text-lg font-bold group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors truncate">
                                            {plan.title || 'Untitled Plan'}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full whitespace-nowrap">📅 {dateStr}</span>
                                            <span className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                📍 {stopCount} {stopCount === 1 ? t('plans.stop', locale) : t('plans.stops', locale)}
                                            </span>
                                        </div>
                                        {museumNames.length > 0 && (
                                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 truncate">
                                                {museumNames.join(' → ')}{stopCount > 3 && ` +${stopCount - 3}`}
                                            </p>
                                        )}
                                    </div>
                                    <div className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </GlassPanel>
                            </Link>
                        );
                    })}
                </div>
            )}

            {!loading && (
                <Link href="/plans/new" className="block mt-3 sm:mt-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all cursor-pointer group active:scale-[0.98]">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 group-hover:bg-black dark:group-hover:bg-white flex items-center justify-center transition-colors mb-2">
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-white dark:group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">{t('plans.newPlan', locale)}</span>
                    </div>
                </Link>
            )}
        </div>
    );
}
