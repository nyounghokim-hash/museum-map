'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const RouteMapViewer = dynamic(() => import('@/components/map/RouteMapViewer'), { ssr: false });

export default function PlanDetailPage() {
    const { id } = useParams();
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/plans/${id}`)
            .then(r => r.json())
            .then(res => {
                if (res.data) {
                    setPlan(res.data);
                } else {
                    setError(res.error?.message || 'Plan not found');
                }
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load plan');
                setLoading(false);
            });
    }, [id]);

    const routeStops = useMemo(() => {
        if (!plan?.stops) return [];
        return plan.stops
            .sort((a: any, b: any) => a.order - b.order)
            .filter((s: any) => s.museum?.latitude && s.museum?.longitude)
            .map((s: any) => ({
                name: s.museum.name,
                latitude: s.museum.latitude,
                longitude: s.museum.longitude,
                order: s.order,
            }));
    }, [plan]);

    if (loading) return <div className="p-20 text-center text-lg font-semibold animate-pulse">Loading plan...</div>;

    if (error) return (
        <div className="p-20 text-center">
            <p className="text-gray-500 mb-4">{error}</p>
            <Link href="/plans" className="text-blue-600 font-semibold hover:underline">← Back to My Plans</Link>
        </div>
    );

    const stops = plan?.stops?.sort((a: any, b: any) => a.order - b.order) || [];
    const dateStr = plan?.date ? new Date(plan.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '';
    const now = new Date();

    return (
        <div className="flex h-[calc(100vh-3.5rem)]">
            {/* Left Sidebar: Route List */}
            <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto p-6 flex flex-col shrink-0">
                <Link href="/plans" className="text-sm text-gray-500 hover:text-black mb-3 inline-flex items-center gap-1 transition-colors">
                    ← My Plans
                </Link>
                <h1 className="text-2xl font-bold mb-1">{plan?.title || 'AutoRoute'}</h1>
                {dateStr && <p className="text-sm text-gray-500 mb-6">📅 {dateStr}</p>}

                <div className="flex-1 space-y-4 relative">
                    {/* Vertical timeline line */}
                    <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200 z-0"></div>

                    {stops.map((stop: any, i: number) => {
                        const arrival = stop.expectedArrival
                            ? new Date(stop.expectedArrival)
                            : new Date(now.getTime() + i * 2 * 60 * 60 * 1000);
                        const timeStr = arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        return (
                            <div key={stop.id || i} className="relative z-10 flex gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">
                                    {i + 1}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-base truncate">{stop.museum?.name || `Stop ${i + 1}`}</h3>
                                    <p className="text-xs text-gray-500">
                                        {stop.museum?.city && `${stop.museum.city}, ${stop.museum.country} • `}
                                        Est. {timeStr}
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    {stops.length === 0 && (
                        <p className="text-sm text-gray-400 pl-12">No stops in this plan.</p>
                    )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                    <button className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-neutral-800 transition-colors active:scale-[0.98]">
                        Start Trip
                    </button>
                    <Link
                        href="/plans"
                        className="block w-full text-center bg-white text-black border border-gray-200 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                    >
                        Back to Plans
                    </Link>
                </div>
            </div>

            {/* Right Content: Route Map */}
            <div className="flex-1 relative">
                {routeStops.length > 0 ? (
                    <RouteMapViewer stops={routeStops} />
                ) : (
                    <div className="w-full h-full bg-zinc-200 flex items-center justify-center">
                        <span className="text-zinc-500 font-medium bg-white/50 px-4 py-2 rounded-full backdrop-blur-md">
                            No route data available
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
