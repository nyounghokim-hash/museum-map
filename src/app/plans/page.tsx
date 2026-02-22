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
    const [activeTripId, setActiveTripId] = useState<string | null>(null);

    useEffect(() => {
        // Hydrate active trip
        const stored = localStorage.getItem('activeTrip');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed?.planId) setActiveTripId(parsed.planId);
            } catch (e) {
                console.error('Failed to parse active trip', e);
            }
        }

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
            if (activeTripId === id) {
                localStorage.removeItem('activeTrip');
                setActiveTripId(null);
            }
        });
    };

    const handleEndTrip = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        showConfirm(t('plans.confirmEndTrip', locale) || '정말로 투어를 종료하시겠습니까?', () => {
            localStorage.removeItem('activeTrip');
            setActiveTripId(null);
            showAlert(t('plans.tripEnded', locale) || '투어가 종료되었습니다.');
        });
    };

    return (
        <div className="w-full max-w-[1080px] mx-auto px-4 py-4 sm:px-6 sm:py-8 md:px-8 mt-4 sm:mt-8 overflow-hidden">
            <div className="mb-5 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight dark:text-white">{t('plans.title', locale)}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 sm:mt-2 text-sm">{t('plans.subtitle', locale)}</p>
            </div>

            {loading ? (
                <div className="flex flex-col gap-3 sm:gap-4 animate-pulse">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <GlassPanel key={i} className="p-4 sm:p-5 relative overflow-hidden">
                            <div className="min-w-0 pr-8 sm:pr-10">
                                <div className="h-6 bg-gray-200 dark:bg-neutral-800 rounded w-1/3 mb-3"></div>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <div className="h-5 bg-gray-200 dark:bg-neutral-800 rounded w-20"></div>
                                    <div className="h-5 bg-gray-200 dark:bg-neutral-800 rounded w-20"></div>
                                </div>
                                <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-3/4 mt-3"></div>
                            </div>
                        </GlassPanel>
                    ))}
                </div>
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
                                    {activeTripId === plan.id && (
                                        <div className="absolute bottom-4 right-4 sm:bottom-1/2 sm:translate-y-1/2 sm:right-12 z-20">
                                            <button
                                                onClick={handleEndTrip}
                                                className="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors shadow-sm"
                                            >
                                                🛑 {t('plans.endTrip', locale) || '투어 종료'}
                                            </button>
                                        </div>
                                    )}
                                </GlassPanel>
                            </Link>
                        );
                    })}
                </div>
            )}

            {!loading && (
                <div className="mt-6 sm:mt-8 p-6 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 text-center">
                    <p className="text-gray-600 dark:text-gray-300 font-medium">{t('plans.createFromMyPick', locale) || '새로운 여행은 "마이 픽" 메뉴에서 생성할 수 있습니다.'}</p>
                    <Link href="/saved" className="inline-block mt-3 text-sm text-blue-600 dark:text-blue-400 font-bold hover:underline">
                        {t('plans.goToMyPick', locale) || '마이 픽 가기 →'}
                    </Link>
                </div>
            )}
        </div>
    );
}
