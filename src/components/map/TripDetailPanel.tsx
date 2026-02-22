'use client';
import { GlassPanel } from '@/components/ui/glass';
import { t } from '@/lib/i18n';
import { useApp } from '@/components/AppContext';

interface TripStop {
    museumId: string;
    name: string;
    latitude: number;
    longitude: number;
    order: number;
}

interface TripData {
    planId: string;
    title: string;
    stops: TripStop[];
}

export default function TripDetailPanel({
    trip,
    onClose,
    onMuseumClick
}: {
    trip: TripData;
    onClose: () => void;
    onMuseumClick: (id: string) => void;
}) {
    const { locale } = useApp();

    return (
        <div className="w-full flex flex-col pt-2 sm:pt-4">
            {/* Close Button Mobile */}
            <button
                onClick={onClose}
                className="md:hidden w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-full mb-4 transition-colors shadow-sm active:scale-95 ml-4 sm:ml-0 z-10 shrink-0"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <GlassPanel intensity="heavy" className="mb-8 relative overflow-hidden border-0 sm:border !rounded-none sm:!rounded-3xl shadow-xl">
                <div className="p-6 sm:p-8 bg-gradient-to-br from-blue-600/10 to-transparent dark:from-blue-900/20">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl animate-pulse">🚀</span>
                        <p className="text-xs font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">Active Route</p>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight mb-6">
                        {trip.title}
                    </h1>

                    <div className="space-y-4 relative">
                        {/* Timeline Line */}
                        <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-100 dark:bg-neutral-800" />

                        {trip.stops.map((stop, i) => (
                            <button
                                key={stop.museumId + i}
                                onClick={() => onMuseumClick(stop.museumId)}
                                className="w-full flex gap-4 text-left group relative z-10 transition-transform active:scale-[0.98]"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:bg-blue-700 transition-colors shrink-0">
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm group-hover:border-blue-200 dark:group-hover:border-blue-900/50 group-hover:shadow-md transition-all">
                                    <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                        {stop.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Click to view details →
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <p className="mt-8 text-xs text-center text-gray-400 dark:text-neutral-500 font-medium italic">
                        {t('plans.dragReorder', locale) || 'Enjoy your journey!'}
                    </p>
                </div>
            </GlassPanel>
        </div>
    );
}
