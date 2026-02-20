'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GlassPanel } from '@/components/ui/glass';

export default function MyPlansPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/plans')
            .then(r => r.json())
            .then(res => {
                setPlans(res.data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-4xl mx-auto px-4 py-4 sm:p-6 sm:mt-6 overflow-hidden">
            <div className="flex justify-between items-end mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">My Plans</h1>
                    <p className="text-gray-500 mt-2 text-sm">Your saved AutoRoute trip plans.</p>
                </div>
                <Link
                    href="/plans/new"
                    className="bg-black text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors active:scale-95 shadow-lg"
                >
                    + New Plan
                </Link>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400 animate-pulse">Loading plans...</div>
            ) : plans.length === 0 ? (
                <div className="py-20 text-center">
                    <div className="text-6xl mb-4">🗺️</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No plans yet</h2>
                    <p className="text-gray-500 mb-6">Save museums from the map, then create an AutoRoute plan!</p>
                    <Link
                        href="/plans/new"
                        className="inline-block bg-black text-white font-bold px-6 py-3 rounded-xl hover:bg-neutral-800 transition active:scale-95"
                    >
                        Create Your First Plan
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {plans.map((plan) => {
                        const stopCount = plan.stops?.length || 0;
                        const museumNames = plan.stops?.map((s: any) => s.museum?.name).filter(Boolean).slice(0, 3) || [];
                        const dateStr = plan.date ? new Date(plan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date set';

                        const handleDelete = async (e: React.MouseEvent) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!confirm('Delete this plan?')) return;
                            await fetch(`/api/plans/${plan.id}`, { method: 'DELETE' });
                            setPlans(prev => prev.filter(p => p.id !== plan.id));
                        };

                        return (
                            <Link key={plan.id} href={`/plans/${plan.id}`}>
                                <GlassPanel className="p-4 sm:p-5 hover:shadow-lg transition-all cursor-pointer group overflow-hidden relative">
                                    {/* Delete button */}
                                    <button
                                        onClick={handleDelete}
                                        className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all z-10"
                                        title="Delete plan"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>

                                    <div className="flex items-center justify-between overflow-hidden">
                                        <div className="flex-1 min-w-0 overflow-hidden">
                                            <h3 className="text-lg font-bold group-hover:text-blue-600 transition-colors truncate pr-8">
                                                {plan.title || 'Untitled Plan'}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5">
                                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                    📅 {dateStr}
                                                </span>
                                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                    📍 {stopCount} {stopCount === 1 ? 'stop' : 'stops'}
                                                </span>
                                            </div>
                                            {museumNames.length > 0 && (
                                                <p className="text-sm text-gray-500 mt-2 truncate max-w-full">
                                                    {museumNames.join(' → ')}
                                                    {stopCount > 3 && ` +${stopCount - 3}`}
                                                </p>
                                            )}
                                        </div>
                                        <div className="ml-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </GlassPanel>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
