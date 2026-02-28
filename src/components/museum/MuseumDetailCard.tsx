'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { GlassPanel } from '@/components/ui/glass';
import { buildMapLinks, isAppleDevice } from '@/lib/mapLinks';
import { useApp } from '@/components/AppContext';
import { useModal } from '@/components/ui/Modal';
import { t, translateCategory, translateDescription, getLocaleFromCountry, Locale } from '@/lib/i18n';
import { useTranslatedText } from '@/hooks/useTranslation';
import * as gtag from '@/lib/gtag';
import { getCountryName, getCityName } from '@/lib/countries';
import ReportModal from '@/components/ui/ReportModal';
import { translateViLabel, translateViValue, getWebsiteLabels, getFeaturedWorksTitle, getReportLabels, getCopyToast, getTapCopyHint } from '@/lib/visitorInfoI18n';

import LoadingAnimation from '@/components/ui/LoadingAnimation';

// Sub-component for sentence-level translation using Gemini API
// Falls back to regex-based translateViValue while API loads
function TranslatedViText({ text, targetLocale }: { text: string; targetLocale: string }) {
    const regexFallback = translateViValue(text, targetLocale);
    const translated = useTranslatedText(text, targetLocale as Locale);
    // If API hasn't returned yet (translated === original text), show regex fallback
    return <>{translated === text ? regexFallback : translated}</>;
}

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
    const [copyToast, setCopyToast] = useState(false);

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

    const handleCopyAddress = (address: string) => {
        navigator.clipboard.writeText(address).then(() => {
            setCopyToast(true);
            setTimeout(() => setCopyToast(false), 2000);
        }).catch(() => {/* ignore */ });
    };

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
                        className={`absolute top-4 right-4 z-20 w-12 h-12 flex items-center justify-center rounded-full shadow-lg active:scale-90 transition-all duration-300 ${isPicked
                            ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-purple-500/30'
                            : 'bg-black/40 backdrop-blur-md text-white/80 hover:bg-black/60'
                            }`}
                    >
                        <svg className="w-6 h-6" fill={isPicked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v18l7-5 7 5V3H5z" />
                        </svg>
                    </button>
                </div>

                <div className="p-5 sm:p-8 bg-white/50 dark:bg-neutral-900/50">
                    {/* Description */}
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm mb-5">{translatedDesc || translateDescription(data.description, locale)}</p>

                    {/* Updated date chip */}
                    {data.updatedAt && (
                        <div className="mb-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 dark:bg-neutral-800/60 text-[10px] font-bold text-gray-400 dark:text-neutral-500">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {locale === 'ko' ? '정보 업데이트' : 'Updated'} {new Date(data.updatedAt).toLocaleDateString(locale === 'ko' ? 'ko-KR' : locale === 'ja' ? 'ja-JP' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    )}

                    {/* Map-style Info List */}
                    <div className="border-t border-gray-100 dark:border-neutral-800">
                        {/* Website */}
                        {data.website && (
                            <a href={data.website} target="_blank" rel="noreferrer"
                                className="flex items-center gap-4 py-3.5 border-b border-gray-50 dark:border-neutral-800/50 hover:bg-gray-50 dark:hover:bg-neutral-800/30 -mx-2 px-2 rounded-lg transition-colors group">
                                <span className="text-base w-6 text-center flex-shrink-0">🌐</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-400 dark:text-neutral-500 font-bold">{getWebsiteLabels(locale).label}</p>
                                    <p className="text-sm text-blue-600 dark:text-blue-400 font-bold group-hover:underline">{getWebsiteLabels(locale).cta}</p>
                                </div>
                                <svg className="w-4 h-4 text-gray-300 dark:text-neutral-600 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </a>
                        )}

                        {/* Visitor Info Items */}
                        {data.visitorInfo && Array.isArray(data.visitorInfo) && data.visitorInfo.map((item: any, i: number) => {
                            const displayLabel = translateViLabel(item.label, locale);
                            const isLocation = item.label === '위치';
                            const isAccess = item.label === '교통' || item.label === '가는 길';
                            // 위치: museum's country locale (or English if not in 13)
                            // 교통/가는길: user's selected locale (full sentence)
                            // others: regex-based translateViValue
                            const museumLocale = getLocaleFromCountry(data.country);
                            return (
                                <div key={i}>
                                    <div
                                        className={`flex items-start gap-4 py-3.5 ${!isLocation ? 'border-b border-gray-50 dark:border-neutral-800/50' : ''} -mx-2 px-2 ${isLocation ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/30 rounded-lg transition-colors active:scale-[0.99]' : ''}`}
                                        onClick={isLocation ? () => handleCopyAddress(item.value) : undefined}
                                    >
                                        <span className="text-base w-6 text-center flex-shrink-0 mt-0.5">{item.icon || '📌'}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-400 dark:text-neutral-500 font-bold">{displayLabel}</p>
                                            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                                                {isLocation
                                                    ? (museumLocale === 'ko' ? item.value : <TranslatedViText text={item.value} targetLocale={museumLocale} />)
                                                    : isAccess
                                                        ? (locale === 'ko' ? item.value : <TranslatedViText text={item.value} targetLocale={locale} />)
                                                        : translateViValue(item.value, locale)}
                                            </p>
                                            {isLocation && (
                                                <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-0.5">
                                                    {getTapCopyHint(locale)}
                                                </p>
                                            )}
                                        </div>
                                        {isLocation && (
                                            <svg className="w-4 h-4 text-gray-300 dark:text-neutral-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </div>
                                    {/* Map links below location, divider after buttons */}
                                    {isLocation && (
                                        <div className="border-b border-gray-50 dark:border-neutral-800/50 pb-3">
                                            <div className="flex gap-2 ml-10 mt-1">
                                                <a
                                                    href={mapLinks.appleDirections}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={() => { gtag.event('get_directions', { category: 'navigation', label: 'Apple Maps', value: 1 }); }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 transition active:scale-95"
                                                >
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C7.589 2 4 5.589 4 9.995 4 16.44 12 22 12 22s8-5.56 8-12.005C20 5.589 16.411 2 12 2zm0 12a4 4 0 110-8 4 4 0 010 8z" /></svg>
                                                    Apple Maps
                                                </a>
                                                <a
                                                    href={mapLinks.googleDirections}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={() => { gtag.event('get_directions', { category: 'navigation', label: 'Google Maps', value: 1 }); }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 transition active:scale-95"
                                                >
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M12 11.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /><path fill="#EA4335" d="M12 2C8.13 2 5 5.13 5 9c0 3.54 2.98 7.8 6.09 11.57.4.48 1.42.48 1.82 0C16.02 16.8 19 12.54 19 9c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" /></svg>
                                                    Google Maps
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Featured Artworks */}
                    {data.artworks && data.artworks.length > 0 && (
                        <div className="mt-6 pt-4">
                            <h3 className="text-xs font-extrabold text-gray-500 dark:text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                🖼️ {getFeaturedWorksTitle(locale)}
                            </h3>
                            <div className="flex gap-3 overflow-x-auto pb-3 -mx-2 px-2 snap-x snap-mandatory scrollbar-hide max-h-[35vh]">
                                {data.artworks.map((work: any, i: number) => (
                                    <div key={i} className="min-w-[160px] max-w-[180px] sm:min-w-[200px] sm:max-w-[220px] flex-shrink-0 snap-start rounded-2xl overflow-hidden bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 group">
                                        <div className="h-[100px] sm:h-[140px] overflow-hidden bg-gray-100 dark:bg-neutral-700">
                                            <img
                                                src={work.image}
                                                alt={work.title || ''}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                        </div>
                                        <div className="p-2.5 sm:p-3">
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

                    {/* Copy Toast */}
                    {copyToast && (
                        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-black/80 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg backdrop-blur-md animate-fadeInUp">
                            ✅ {getCopyToast(locale)}
                        </div>
                    )}
                    <div className="pb-14 lg:pb-0"></div>

                    {/* Report Info Update Button */}
                    <button
                        onClick={() => setReportOpen(true)}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50 text-gray-400 dark:text-gray-500 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/10 dark:hover:border-purple-800 text-xs font-bold transition-all active:scale-95"
                    >
                        <span className="text-sm">✏️</span>
                        {getReportLabels(locale).button}
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
                                getReportLabels(locale).thanks,
                                getReportLabels(locale).thanksDesc
                            );
                        }}
                    />
                </div>
            </GlassPanel>

            {/* Google Places Reviews */}
            {googleReviews && (
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
            )}
            {/* Mobile bottom spacer */}
            <div className="h-32 lg:h-8" />
        </div>
    );
}
