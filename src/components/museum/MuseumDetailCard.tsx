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
import ReportModal from '@/components/ui/ReportModal';

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
    const [reportOpen, setReportOpen] = useState(false);

    const translatedDesc = useTranslatedText(data?.description, locale);
    // Museum names should always display in their original language

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

            {/* Hero Card with Cover Image */}
            <GlassPanel intensity="heavy" className="mb-8 relative overflow-hidden group border-0 sm:border !rounded-none sm:!rounded-3xl">
                {/* Cover Image */}
                <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-gray-900">
                    {/* Back button - always top-left on image */}
                    {onClose && (
                        <button onClick={onClose} className="absolute top-4 left-4 z-20 w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-md text-white rounded-full shadow-lg active:scale-95 transition-all hover:bg-black/60">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                    <img
                        src={data.imageUrl || '/defaultimg.png'}
                        alt={data.name}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90
                            ${''}`}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/defaultimg.png';
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
                                // Optimistic unsave
                                const prevSaveId = saveId;
                                setIsPicked(false);
                                setSaveId(null);
                                fetch(`/api/me/saves/${prevSaveId}`, { method: 'DELETE' })
                                    .catch(() => { setIsPicked(true); setSaveId(prevSaveId); });
                            } else {
                                // Optimistic save
                                setIsPicked(true);
                                fetch('/api/saves', { method: 'POST', body: JSON.stringify({ museumId: data.id }) })
                                    .then(r => r.json())
                                    .then(res => {
                                        if (res.data) {
                                            setSaveId(res.data.id || res.data._id);
                                            gtag.event('save_museum', {
                                                category: 'museum',
                                                label: data.name,
                                                value: 1
                                            });
                                        } else {
                                            setIsPicked(false);
                                        }
                                    })
                                    .catch(() => { setIsPicked(false); });
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
                    {/* Description */}
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm mb-5">{translatedDesc || translateDescription(data.description, locale)}</p>

                    {/* Map-style Info List */}
                    <div className="border-t border-gray-100 dark:border-neutral-800">
                        {/* Website */}
                        {data.website && (
                            <a href={data.website} target="_blank" rel="noreferrer"
                                className="flex items-center gap-4 py-3.5 border-b border-gray-50 dark:border-neutral-800/50 hover:bg-gray-50 dark:hover:bg-neutral-800/30 -mx-2 px-2 rounded-lg transition-colors group">
                                <span className="text-base w-6 text-center flex-shrink-0">🌐</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-400 dark:text-neutral-500 font-bold">{locale === 'ko' ? '웹사이트' : 'Website'}</p>
                                    <p className="text-sm text-blue-600 dark:text-blue-400 font-bold group-hover:underline">{locale === 'ko' ? '공식 웹사이트 바로가기' : 'Visit official website'}</p>
                                </div>
                                <svg className="w-4 h-4 text-gray-300 dark:text-neutral-600 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </a>
                        )}

                        {/* Visitor Info Items */}
                        {data.visitorInfo && Array.isArray(data.visitorInfo) && data.visitorInfo.map((item: any, i: number) => (
                            <div key={i} className="flex items-start gap-4 py-3.5 border-b border-gray-50 dark:border-neutral-800/50 -mx-2 px-2">
                                <span className="text-base w-6 text-center flex-shrink-0 mt-0.5">{item.icon || '📌'}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-400 dark:text-neutral-500 font-bold">{item.label}</p>
                                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Featured Artworks */}
                    {data.artworks && data.artworks.length > 0 && (
                        <div className="mt-6 pt-4">
                            <h3 className="text-xs font-extrabold text-gray-500 dark:text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                🖼️ {locale === 'ko' ? '대표 작품' : 'Featured Works'}
                            </h3>
                            <div className="flex gap-3 overflow-x-auto pb-3 -mx-2 px-2 snap-x snap-mandatory scrollbar-hide">
                                {data.artworks.map((work: any, i: number) => (
                                    <div key={i} className="min-w-[200px] max-w-[220px] flex-shrink-0 snap-start rounded-2xl overflow-hidden bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 group">
                                        <div className="h-[140px] overflow-hidden bg-gray-100 dark:bg-neutral-700">
                                            <img
                                                src={work.image}
                                                alt={work.title || ''}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                        </div>
                                        <div className="p-3">
                                            <p className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">{work.artist}</p>
                                            <h4 className="font-bold text-xs dark:text-white leading-tight mt-0.5 line-clamp-1">{work.title}</h4>
                                            {work.description && (
                                                <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-1 line-clamp-2 leading-relaxed">{work.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Map Navigation */}
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-neutral-800">
                        <div className="flex flex-wrap gap-2">
                            <a
                                href={appleFirst ? mapLinks.appleDirections : mapLinks.googleDirections}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => { gtag.event('get_directions', { category: 'navigation', label: appleFirst ? 'Apple Maps' : 'Google Maps', value: 1 }); }}
                                className="inline-flex flex-1 sm:flex-none justify-center items-center gap-2 bg-blue-600 text-white px-4 py-3 sm:py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition active:scale-95 shadow-md"
                            >
                                🗺️ {appleFirst ? t('map.appleMaps', locale) : t('map.googleMaps', locale)}
                            </a>
                            <a
                                href={appleFirst ? mapLinks.googleDirections : mapLinks.appleDirections}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => { gtag.event('get_directions', { category: 'navigation', label: appleFirst ? 'Google Maps' : 'Apple Maps', value: 1 }); }}
                                className="inline-flex flex-1 sm:flex-none justify-center items-center gap-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 px-4 py-3 sm:py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-neutral-700 transition active:scale-95"
                            >
                                📍 {appleFirst ? t('map.googleMaps', locale) : t('map.appleMaps', locale)}
                            </a>
                        </div>
                        <div className="pb-14 lg:pb-0"></div>

                        {/* Report Info Update Button */}
                        <button
                            onClick={() => setReportOpen(true)}
                            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50 text-gray-400 dark:text-gray-500 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/10 dark:hover:border-purple-800 text-xs font-bold transition-all active:scale-95"
                        >
                            <span className="text-sm">✏️</span>
                            {locale === 'ko' ? '정보 수정 요청' : 'Request info update'}
                        </button>
                        <ReportModal
                            isOpen={reportOpen}
                            onClose={() => setReportOpen(false)}
                            locale={locale}
                            targetName={data.name}
                            onSubmit={async (msg) => {
                                await fetch('/api/feedback', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        content: msg,
                                        type: 'report',
                                        category: 'museum_info',
                                        targetId: data.id,
                                        targetName: data.name,
                                    })
                                });
                                showAlert(
                                    locale === 'ko' ? '감사합니다!' : 'Thank you!',
                                    locale === 'ko' ? '수정 요청이 접수되었어요. 빠르게 반영하겠습니다 🙏' : 'Your request has been received. We will review it shortly 🙏'
                                );
                            }}
                        />
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
            {/* Mobile bottom spacer */}
            <div className="h-32 lg:h-8" />
        </div >
    );
}
