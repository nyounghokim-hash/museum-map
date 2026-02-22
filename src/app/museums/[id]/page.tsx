'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GlassPanel } from '@/components/ui/glass';
import { buildMapLinks, isAppleDevice } from '@/lib/mapLinks';
import { useApp } from '@/components/AppContext';
import { useModal } from '@/components/ui/Modal';
import { t, translateCategory, translateDescription } from '@/lib/i18n';
import { useTranslatedText } from '@/hooks/useTranslation';

export default function MuseumDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const { locale } = useApp();
    const { showAlert } = useModal();
    const [loading, setLoading] = useState(true);

    // New live data states
    const [googleReviews, setGoogleReviews] = useState<any>(null);
    const [exhibitions, setExhibitions] = useState<any[]>([]);
    const [loadingLive, setLoadingLive] = useState(false);

    const translatedDesc = useTranslatedText(data?.description, locale);

    useEffect(() => {
        fetch(`/api/museums/${id}`)
            .then(r => r.json())
            .then(res => {
                setData(res.data);
                setLoading(false);
                if (res.data) fetchLiveData(res.data.name, res.data.city);
            })
            .catch(console.error);
    }, [id]);

    const fetchLiveData = async (name: string, city: string) => {
        setLoadingLive(true);
        try {
            const [revRes, exhRes] = await Promise.all([
                fetch(`/api/museums/${id}/reviews/google?name=${encodeURIComponent(name)}&city=${encodeURIComponent(city)}`).then(r => r.json()),
                fetch(`/api/museums/${id}/exhibitions?name=${encodeURIComponent(name)}`).then(r => r.json())
            ]);
            if (revRes.data) setGoogleReviews(revRes.data);
            if (exhRes.data) setExhibitions(exhRes.data);
        } catch (e) {
            console.error("Failed to fetch live extended data", e);
        } finally {
            setLoadingLive(false);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse">Loading Museum Details...</div>;
    if (!data) return <div className="p-20 text-center">Museum Not Found</div>;

    const mapLinks = buildMapLinks({ name: data.name, lat: data.latitude, lng: data.longitude });
    const appleFirst = typeof window !== 'undefined' && isAppleDevice();

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 mt-4 sm:mt-6">
            <button onClick={() => router.back()} className="text-gray-500 text-sm mb-6 inline-block hover:text-black font-medium transition-colors">
                {t('detail.backToMap', locale)}
            </button>

            {/* Hero Card with Cover Image */}
            <GlassPanel intensity="heavy" className="mb-8 relative overflow-hidden group">
                {/* Cover Image */}
                <div className="relative h-56 sm:h-72 w-full overflow-hidden">
                    <img
                        src={data.imageUrl || '/defaultimg.png'}
                        alt={data.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/defaultimg.png'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-6 right-6">
                        <p className="text-xs font-bold tracking-widest text-white/80 uppercase mb-1">{translateCategory(data.type, locale)} • {data.city}, {data.country}</p>
                        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">{data.name}</h1>
                    </div>
                </div>                {/* Info & Actions */}
                <div className="p-6 sm:p-8">
                    <p className="text-gray-700 leading-relaxed max-w-2xl mb-6">{translatedDesc || translateDescription(data.description, locale)}</p>

                    {/* Website Link */}
                    {data.website && (
                        <a
                            href={data.website}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:underline mb-6"
                        >
                            🌐 {t('detail.officialWebsite', locale)} →
                        </a>
                    )}

                    {/* Live Exhibitions & News */}
                    {loadingLive ? (
                        <div className="mb-6 animate-pulse flex gap-4 overflow-x-auto pb-4">
                            <div className="bg-gray-100 rounded-xl relative h-40 w-64 min-w-[16rem]"></div>
                            <div className="bg-gray-100 rounded-xl relative h-40 w-64 min-w-[16rem]"></div>
                        </div>
                    ) : (exhibitions && exhibitions.length > 0) ? (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 break-keep">📰 {t('detail.exhibitions', locale)} & News</h3>
                            <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                                {exhibitions.map((exh, i) => (
                                    <a key={i} href={exh.link || '#'} target="_blank" rel="noreferrer" className="block group relative bg-gray-900 rounded-xl overflow-hidden h-44 w-72 min-w-[18rem] snap-center shadow-md transform transition hover:-translate-y-1 hover:shadow-xl">
                                        <div className="absolute inset-0">
                                            <img
                                                src={exh.imageUrl || data.imageUrl || '/defaultimg.png'}
                                                alt={exh.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                                        </div>
                                        <div className="absolute inset-0 flex flex-col justify-end p-4">
                                            <h4 className="font-bold text-white leading-snug line-clamp-2 mb-1 group-hover:text-purple-300 transition-colors">{exh.title}</h4>
                                            {exh.description && <p className="text-xs text-gray-300 line-clamp-2">{exh.description}</p>}
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">

                        <button
                            onClick={async () => {
                                await fetch('/api/saves', { method: 'POST', body: JSON.stringify({ museumId: data.id }) });
                                showAlert(t('modal.picked', locale));
                            }}
                            className="bg-white border text-black px-5 py-3 rounded-xl font-bold hover:bg-gray-50 transition shadow-sm active:scale-95 text-sm"
                        >
                            {t('detail.pick', locale)}
                        </button>
                    </div>

                    {/* Opening Hours — from DB */}
                    {(() => {
                        const hours = data.openingHours as Record<string, string> | null;
                        const dayLabels: Record<string, string> = {
                            mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
                            thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday'
                        };
                        const dayOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

                        return (
                            <div className="mt-6 bg-gradient-to-br from-purple-50 to-white border border-purple-100/50 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-purple-600 text-lg">🕒</span>
                                    <h3 className="text-sm font-extrabold text-purple-900 uppercase tracking-widest">{t('detail.openingHours', locale)}</h3>
                                </div>

                                {(!hours || Object.keys(hours).length === 0) ? (
                                    <p className="text-sm text-gray-500 italic mb-1">{t('detail.hoursVary', locale)}</p>
                                ) : (
                                    <div className="text-sm text-gray-800 space-y-1.5 bg-white/50 rounded-xl p-3">
                                        {hours.info ? (
                                            <p className="font-medium text-gray-700 leading-relaxed">{hours.info}</p>
                                        ) : (
                                            dayOrder.filter(d => hours[d]).map(d => (
                                                <div key={d} className="flex justify-between items-center py-0.5 border-b border-gray-100 last:border-0 border-dashed">
                                                    <span className="text-gray-500 font-medium w-24">{dayLabels[d]}</span>
                                                    <span className="font-bold text-gray-900 text-right">{hours[d]}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                                <p className="text-[10px] text-purple-400 mt-3 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-purple-400 inline-block"></span> Hours may vary on public holidays.</p>
                            </div>
                        );
                    })()}

                    {/* Map Navigation */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-700 mb-3">{t('detail.getDirections', locale)}</h3>
                        <div className="flex flex-wrap gap-2">
                            <a
                                href={appleFirst ? mapLinks.appleDirections : mapLinks.googleDirections}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition active:scale-95 shadow-md"
                            >
                                🗺️ {appleFirst ? 'Apple Maps' : 'Google Maps'}
                            </a>
                            <a
                                href={appleFirst ? mapLinks.googleDirections : mapLinks.appleDirections}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 bg-white border text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition active:scale-95"
                            >
                                📍 {appleFirst ? 'Google Maps' : 'Apple Maps'}
                            </a>
                        </div>
                    </div>
                </div>
            </GlassPanel>

            {/* Google Places Reviews */}
            {googleReviews && (
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-2xl font-bold dark:text-white">Google Reviews</h2>
                        <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
                            ⭐ {googleReviews.rating || 'N/A'} <span className="text-yellow-600 font-normal text-xs ml-1">({googleReviews.totalRatings?.toLocaleString() || 0} reviews)</span>
                        </div>
                    </div>
                    {googleReviews.reviews && googleReviews.reviews.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {googleReviews.reviews.map((r: any, i: number) => (
                                <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-neutral-800">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                                            {r.author_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm dark:text-white truncate max-w-[120px]">{r.author_name}</p>
                                            <p className="text-[10px] text-gray-400">{r.relative_time_description}</p>
                                        </div>
                                        <div className="ml-auto text-yellow-400 text-sm">
                                            {'★'.repeat(Math.round(r.rating))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4 leading-relaxed">
                                        {r.text || "No text provided."}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No descriptive Google Reviews available at the moment.</p>
                    )}
                </div>
            )}


        </div>
    );
}
