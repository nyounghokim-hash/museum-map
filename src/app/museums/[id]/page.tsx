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

                    {/* Live Exhibitions (Crawler) */}
                    {loadingLive ? (
                        <div className="mb-6 animate-pulse bg-gray-100 rounded-xl h-24"></div>
                    ) : (exhibitions && exhibitions.length > 0) ? (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 break-keep">🎨 Current Exhibitions (Live)</h3>
                            <div className="space-y-3">
                                {exhibitions.map((exh, i) => (
                                    <a key={i} href={exh.link} target="_blank" rel="noreferrer" className="block group bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition border border-transparent hover:border-gray-200">
                                        <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition text-sm mb-1">{exh.title}</h4>
                                        <p className="text-xs text-gray-500 line-clamp-2">{exh.snippet}</p>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => router.push(`/review/new?museumId=${data.id}`)}
                            className="bg-black text-white px-5 py-3 rounded-xl font-bold hover:bg-neutral-800 transition shadow-lg active:scale-95 text-sm"
                        >
                            {t('detail.review', locale)}
                        </button>
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
                        if (!hours || Object.keys(hours).length === 0) return null;
                        return (
                            <div className="mt-6 bg-gray-50 rounded-xl p-4">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('detail.openingHours', locale)}</h3>
                                <div className="text-sm text-gray-700 space-y-1">
                                    {hours.info ? (
                                        <p>{hours.info}</p>
                                    ) : (
                                        dayOrder.filter(d => hours[d]).map(d => (
                                            <div key={d} className="flex justify-between">
                                                <span>{dayLabels[d]}</span>
                                                <span className="font-medium">{hours[d]}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 italic">{t('detail.hoursVary', locale)}</p>
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

            {/* Guest Book Reviews */}
            <div>
                <h2 className="text-2xl font-bold mb-6">{t('detail.guestbook', locale)}</h2>
                {data.reviews && data.reviews.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {data.reviews.map((r: any, i: number) => {
                            const pastels = ['bg-amber-50', 'bg-blue-50', 'bg-pink-50', 'bg-green-50', 'bg-purple-50', 'bg-yellow-50'];
                            const rotations = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-0', 'rotate-2', '-rotate-1'];
                            const bg = pastels[i % pastels.length];
                            const rot = rotations[i % rotations.length];

                            // Generate nickname from IP
                            const ip = r.ipAddress || r.id;
                            let hash = 5381;
                            for (let j = 0; j < ip.length; j++) hash = ((hash << 5) + hash + ip.charCodeAt(j)) & 0xffffffff;
                            hash = Math.abs(hash);
                            const colors = ['Red', 'Blue', 'Green', 'Gold', 'Pink', 'Violet', 'Coral', 'Amber', 'Teal', 'Lime', 'Ivory', 'Azure', 'Jade', 'Ruby', 'Aqua', 'Peach', 'Mint', 'Rose', 'Sky', 'Sunny'];
                            const animals = ['Fox', 'Owl', 'Bear', 'Wolf', 'Deer', 'Panda', 'Koala', 'Otter', 'Whale', 'Crane', 'Eagle', 'Tiger', 'Bunny', 'Seal', 'Swan', 'Hawk', 'Robin', 'Cat', 'Dog', 'Penguin'];
                            const nickname = `${colors[hash % 20]}${animals[Math.floor(hash / 20) % 20]}${String(hash % 100).padStart(2, '0')}`;

                            const cc = r.country || 'XX';
                            const flag = cc.length === 2 && cc !== 'XX'
                                ? String.fromCodePoint(cc.toUpperCase().charCodeAt(0) - 65 + 0x1f1e6) + String.fromCodePoint(cc.toUpperCase().charCodeAt(1) - 65 + 0x1f1e6)
                                : '🌍';

                            return (
                                <div
                                    key={r.id}
                                    className={`${bg} ${rot} rounded-lg p-5 shadow-md hover:shadow-xl hover:rotate-0 transition-all duration-300 relative border border-gray-100/50`}
                                >
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-4 bg-yellow-200/80 rounded-sm shadow-sm" />
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap mt-2 mb-4" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                                        &ldquo;{r.content}&rdquo;
                                    </p>
                                    <div className="flex justify-between items-end pt-2 border-t border-gray-200/50">
                                        <span className="text-xs font-semibold text-gray-600">
                                            {flag} {nickname}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-amber-50 rounded-lg p-8 text-center shadow-sm border border-amber-100/50 -rotate-1">
                        <p className="text-lg mb-1" style={{ fontFamily: "'Georgia', serif" }}>📝</p>
                        <p className="text-gray-600 italic text-sm" style={{ fontFamily: "'Georgia', serif" }}>
                            {t('detail.noNotes', locale)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
