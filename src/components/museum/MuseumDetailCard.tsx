'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { GlassPanel } from '@/components/ui/glass';
import { buildMapLinks, isAppleDevice } from '@/lib/mapLinks';
import { useApp } from '@/components/AppContext';
import { useModal } from '@/components/ui/Modal';
import { t, translateCategory, translateDescription } from '@/lib/i18n';
import { useTranslatedText } from '@/hooks/useTranslation';
import * as gtag from '@/lib/gtag';
import { getCountryName, getCityName } from '@/lib/countries';

import LoadingAnimation from '@/components/ui/LoadingAnimation';

export default function MuseumDetailCard({ museumId, onClose, isMapContext }: { museumId: string; onClose?: () => void; isMapContext?: boolean }) {
    const [data, setData] = useState<any>(null);
    const { locale } = useApp();
    const { showAlert } = useModal();
    const [loading, setLoading] = useState(true);
    const [isPicked, setIsPicked] = useState(false);
    const [saveId, setSaveId] = useState<string | null>(null);
    const { data: session, status } = useSession();
    const router = useRouter();

    // Live data states
    const [googleReviews, setGoogleReviews] = useState<any>(null);
    const [exhibitions, setExhibitions] = useState<any[]>([]);
    const [loadingLive, setLoadingLive] = useState(false);

    const translatedDesc = useTranslatedText(data?.description, locale);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/museums/${museumId}`)
            .then(r => r.json())
            .then(res => {
                setData(res.data);
                setLoading(false);
                if (res.data) {
                    fetchLiveData(res.data.name, res.data.city);
                    gtag.event('view_museum_detail', {
                        category: 'museum',
                        label: res.data.name,
                        value: 1
                    });
                }
            })
            .catch(console.error);

        fetch('/api/me/saves')
            .then(r => r.json())
            .then(res => {
                if (res.data) {
                    const save = res.data.find((s: any) => s.museumId === museumId || s.museum?.id === museumId);
                    if (save) {
                        setIsPicked(true);
                        setSaveId(save.id);
                    } else {
                        setIsPicked(false);
                        setSaveId(null);
                    }
                }
            })
            .catch(console.error);
    }, [museumId]);

    const fetchLiveData = async (name: string, city: string) => {
        setLoadingLive(true);
        try {
            const [revRes, exhRes] = await Promise.all([
                fetch(`/api/museums/${museumId}/reviews/google?name=${encodeURIComponent(name)}&city=${encodeURIComponent(city)}`).then(r => r.json()),
                fetch(`/api/museums/${museumId}/exhibitions?name=${encodeURIComponent(name)}`).then(r => r.json())
            ]);
            if (revRes.data) setGoogleReviews(revRes.data);
            if (exhRes.data) setExhibitions(exhRes.data);
        } catch (e) {
            console.error("Failed to fetch live extended data", e);
        } finally {
            setLoadingLive(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 min-h-[400px]">
            <LoadingAnimation size={120} />
        </div>
    );
    if (!data) return <div className="p-20 text-center dark:text-gray-300">Museum Not Found</div>;

    const mapLinks = buildMapLinks({ name: data.name, lat: data.latitude, lng: data.longitude });
    const appleFirst = typeof window !== 'undefined' && isAppleDevice();

    return (
        <div className="w-full flex flex-col pt-2 sm:pt-4">
            {onClose && (
                <button onClick={onClose} className={`w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-full mb-4 transition-colors shadow-sm active:scale-95 ml-4 sm:ml-0 z-10 shrink-0 ${isMapContext ? 'md:hidden' : ''}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}

            {/* Hero Card with Cover Image */}
            <GlassPanel intensity="heavy" className="mb-8 relative overflow-hidden group border-0 sm:border !rounded-none sm:!rounded-3xl">
                {/* Cover Image */}
                <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-gray-900">
                    <img
                        src={data.imageUrl || '/defaultimg.png'}
                        alt={data.name}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90
                            ${''}`}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/defaultimg.png';
                            target.classList.add('dark:invert', 'dark:sepia', 'dark:hue-rotate-[260deg]', 'dark:brightness-[0.7]', 'dark:contrast-[1.2]');
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6">
                        <p className="text-xs font-bold tracking-widest text-white/80 uppercase mb-1">{translateCategory(data.type, locale)} • {getCityName(data.city, locale)}, {getCountryName(data.country, locale)}</p>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">{data.name}</h1>
                    </div>

                    {/* Pick Button */}
                    <button
                        onClick={async (e) => {
                            e.preventDefault();
                            if (status === 'unauthenticated') {
                                router.push('/login');
                                return;
                            }

                            if (isPicked && saveId) {
                                await fetch(`/api/me/saves/${saveId}`, { method: 'DELETE' });
                                setIsPicked(false);
                                setSaveId(null);
                            } else {
                                const res = await fetch('/api/saves', { method: 'POST', body: JSON.stringify({ museumId: data.id }) }).then(r => r.json());
                                if (res.data) {
                                    setIsPicked(true);
                                    setSaveId(res.data.id || res.data._id);
                                    gtag.event('save_museum', {
                                        category: 'museum',
                                        label: data.name,
                                        value: 1
                                    });
                                }
                            }
                        }}
                        className={`absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer z-10 ${isPicked ? 'bg-yellow-400 border border-yellow-300 text-white' : 'bg-black/40 border border-white/30 text-white hover:bg-black/60 hover:border-white/60'}`}
                    >
                        <svg className={`w-5 h-5 transition-transform ${isPicked ? 'scale-110 drop-shadow-sm' : 'scale-100 opacity-90'}`} fill={isPicked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isPicked ? 0 : 2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                    </button>
                </div>

                <div className="p-5 sm:p-8 bg-white/50 dark:bg-neutral-900/50">
                    {/* Visitor Information Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                        <div className="space-y-6">
                            {/* Detailed Description */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-2">{t('detail.about', locale) || 'About'}</h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{translatedDesc || translateDescription(data.description, locale)}</p>
                            </div>

                            {/* Website Link */}
                            {data.website && (
                                <a
                                    href={data.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group inline-flex items-center gap-2 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 border border-gray-100 dark:border-neutral-700 hover:border-blue-200 px-4 py-3 rounded-xl transition-all shadow-sm w-full sm:w-auto"
                                >
                                    <span className="text-blue-600 text-lg group-hover:scale-110 transition-transform">🌐</span>
                                    <div className="text-left">
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tighter leading-none mb-0.5">Official Website</p>
                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-bold leading-tight">{t('detail.visitWebsite', locale) || 'Visit Site'} →</p>
                                    </div>
                                </a>
                            )}
                        </div>

                        {/* Opening Hours */}
                        {(() => {
                            const hours = data.openingHours as Record<string, string> | null;
                            const dayLabels: Record<string, string> = {
                                mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
                                thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday'
                            };
                            const dayOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

                            return (
                                <div className="bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-900/10 dark:to-neutral-900 border border-purple-100/50 dark:border-purple-900/30 rounded-2xl p-5 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 text-sm">🕒</div>
                                        <h3 className="text-xs font-extrabold text-purple-900 dark:text-purple-300 uppercase tracking-widest">{t('detail.openingHours', locale)}</h3>
                                    </div>

                                    {(!hours || Object.keys(hours).length === 0) ? (
                                        <div className="py-4 text-center">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">{t('detail.hoursVary', locale)}</p>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                                            {hours.info ? (
                                                <p className="font-medium text-gray-700 dark:text-gray-300 leading-relaxed bg-white/50 dark:bg-neutral-800/50 rounded-xl p-3 border border-dashed border-purple-100 dark:border-purple-900/30">{hours.info}</p>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-1">
                                                    {dayOrder.filter(d => hours[d]).map(d => (
                                                        <div key={d} className="flex justify-between items-center px-2 py-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-neutral-800/50 transition-colors">
                                                            <span className="text-gray-500 dark:text-gray-400 font-medium text-xs">{dayLabels[d]}</span>
                                                            <span className="font-bold text-gray-900 dark:text-white text-xs">{hours[d]}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="text-[10px] text-purple-500 dark:text-purple-400 mt-3 pt-3 border-t border-purple-100/30 dark:border-purple-900/30 flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-purple-400"></span>
                                                Hours may vary on public holidays.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Live Exhibitions & News */}
                    <div className="mt-8">
                        {loadingLive ? (
                            <div className="mb-6 animate-pulse flex gap-4 overflow-x-auto pb-4">
                                <div className="bg-gray-100 dark:bg-neutral-800 rounded-xl relative h-40 w-64 min-w-[16rem]"></div>
                                <div className="bg-gray-100 dark:bg-neutral-800 rounded-xl relative h-40 w-64 min-w-[16rem]"></div>
                            </div>
                        ) : (exhibitions && exhibitions.length > 0) ? (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-3 break-keep">📰 {t('detail.exhibitions', locale)} & News</h3>
                                <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                                    {exhibitions.map((exh, i) => (
                                        <a key={i} href={exh.link || '#'} target="_blank" rel="noreferrer" className="block group relative bg-gray-900 rounded-xl overflow-hidden h-44 w-72 min-w-[18rem] snap-center shadow-md transform transition hover:-translate-y-1 hover:shadow-xl shrink-0">
                                            <div className="absolute inset-0">
                                                <img
                                                    src={exh.imageUrl || data.imageUrl || '/defaultimg.png'}
                                                    alt={exh.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = '/defaultimg.png'; }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                                            </div>
                                            <div className="absolute inset-0 flex flex-col justify-end p-4">
                                                <h4 className="font-bold text-white leading-snug line-clamp-2 mb-1 group-hover:text-purple-300 transition-colors uppercase text-xs tracking-tight">{exh.title}</h4>
                                                {exh.description && <p className="text-[10px] text-gray-300 line-clamp-2 leading-tight">{exh.description}</p>}
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Map Navigation */}
                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-neutral-800">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">{t('detail.getDirections', locale)}</h3>
                        <div className="flex flex-wrap gap-2">
                            <a
                                href={appleFirst ? mapLinks.appleDirections : mapLinks.googleDirections}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => {
                                    gtag.event('get_directions', {
                                        category: 'navigation',
                                        label: appleFirst ? 'Apple Maps' : 'Google Maps',
                                        value: 1
                                    });
                                }}
                                className="inline-flex flex-1 sm:flex-none justify-center items-center gap-2 bg-blue-600 text-white px-4 py-3 sm:py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition active:scale-95 shadow-md"
                            >
                                🗺️ {appleFirst ? t('map.appleMaps', locale) : t('map.googleMaps', locale)}
                            </a>
                            <a
                                href={appleFirst ? mapLinks.googleDirections : mapLinks.appleDirections}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => {
                                    gtag.event('get_directions', {
                                        category: 'navigation',
                                        label: appleFirst ? 'Google Maps' : 'Apple Maps',
                                        value: 1
                                    });
                                }}
                                className="inline-flex flex-1 sm:flex-none justify-center items-center gap-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 px-4 py-3 sm:py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-neutral-700 transition active:scale-95"
                            >
                                📍 {appleFirst ? t('map.googleMaps', locale) : t('map.appleMaps', locale)}
                            </a>
                        </div>
                    </div>
                </div>
            </GlassPanel >

            {/* Google Places Reviews */}
            {
                googleReviews && (
                    <div className="mb-12 mt-8 px-4 sm:px-0">
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold dark:text-white">Google Reviews</h2>
                            <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold">
                                ⭐ {googleReviews.rating || 'N/A'} <span className="text-yellow-600 font-normal ml-1">({googleReviews.totalRatings?.toLocaleString() || 0} reviews)</span>
                            </div>
                        </div>
                        {googleReviews.reviews && googleReviews.reviews.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                                {googleReviews.reviews.map((r: any, i: number) => (
                                    <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-neutral-800">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 shrink-0">
                                                {r.author_name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm dark:text-white truncate">{r.author_name}</p>
                                                <p className="text-[10px] text-gray-400 truncate">{r.relative_time_description}</p>
                                            </div>
                                            <div className="ml-auto text-yellow-400 text-xs sm:text-sm shrink-0">
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
                            <p className="text-sm text-gray-500 dark:text-gray-400">No descriptive Google Reviews available at the moment.</p>
                        )}
                    </div>
                )
            }
        </div >
    );
}
