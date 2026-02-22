'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { useModal } from '@/components/ui/Modal';
import { t, Locale } from '@/lib/i18n';
import Image from 'next/image';

// Format IP address helper
function formatAnonymousUser(ip: string | null | undefined, locale: Locale) {
    if (!ip) return `${t('collections.curatedBy', locale)} ${t('global.anonymous', locale)} ${t('collections.anonymousVisitor', locale)}`;
    // Optionally mask IP if privacy requires, e.g., 192.168.1.***
    const parts = ip.split('.');
    let displayIp = ip;
    if (parts.length === 4) {
        displayIp = `${parts[0]}.${parts[1]}.${parts[2]}.***`;
    }
    return `${t('collections.curatedBy', locale)} ${t('global.anonymous', locale)} ${t('collections.anonymousVisitor', locale)} (${displayIp})`;
}

export default function CollectionDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { locale } = useApp();
    const { showAlert } = useModal();
    const [collection, setCollection] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/collections/${id}`)
            .then(r => r.json())
            .then(res => {
                setCollection(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const handleCreateAutoRoute = () => {
        if (!collection?.items || collection.items.length === 0) {
            showAlert(t('collections.emptyFolder', locale));
            return;
        }
        const museumIds = collection.items.map((i: any) => i.museumId).join(',');
        router.push(`/plans/new?museums=${museumIds}`);
    };

    const handleShareCollection = () => {
        navigator.clipboard.writeText(window.location.href);
        showAlert(t('collections.shareSuccess', locale));
    };

    if (loading) return <div className="p-20 text-center animate-pulse dark:text-gray-300">{t('collections.loadingDetail', locale)}</div>;
    if (!collection) return <div className="p-20 text-center dark:text-gray-300">{t('collections.notFound', locale)}</div>;

    const itemsCount = collection.items?.length || 0;
    const authorText = formatAnonymousUser(collection.user?.ipAddress, locale);

    return (
        <div className="w-full max-w-[1080px] mx-auto px-4 py-4 sm:px-6 sm:py-8 md:px-8 mt-4 sm:mt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold dark:text-white">{collection.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                        {authorText}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {itemsCount} {t('collections.items', locale)} {collection.isPublic && `• ${t('collections.public', locale)}`}
                    </p>
                </div>
                <button
                    onClick={handleShareCollection}
                    className="border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors shrink-0 flex items-center gap-2 shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    {t('collections.share', locale)}
                </button>
            </div>

            {itemsCount === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-2xl mb-10">
                    <div className="text-4xl mb-4">🖼️</div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">{t('collections.thisEmpty', locale)}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
                    {collection.items.map((item: any) => (
                        <div key={item.id} onClick={() => router.push(`/museums/${item.museum.id}`)} className="border border-gray-200 dark:border-neutral-800 p-4 rounded-xl bg-white dark:bg-neutral-900 shadow-sm hover:shadow-lg transition-all cursor-pointer group">
                            <div className="h-40 bg-gray-100 dark:bg-neutral-800 rounded-lg mb-4 flex items-center justify-center text-gray-400 overflow-hidden relative">
                                <Image src={item.museum.imageUrl || '/defaultimg.png'} alt={item.museum.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.museum.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{item.museum.city}, {item.museum.country}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* AutoRoute Action Trigger */}
            {itemsCount > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl p-8 sm:p-10 text-center flex flex-col items-center shadow-inner">
                    <h2 className="text-2xl font-extrabold text-blue-900 dark:text-blue-300 mb-2">{t('collections.planTrip', locale)}</h2>
                    <p className="text-blue-700 dark:text-blue-400 mb-8 max-w-lg mx-auto leading-relaxed">{t('collections.autoRouteDesc', locale)}</p>
                    <button
                        onClick={handleCreateAutoRoute}
                        className="bg-blue-600 dark:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/30 dark:shadow-blue-500/20 hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-95 transition-all text-sm sm:text-base flex items-center gap-2"
                    >
                        <span className="animate-pulse">🗺️</span>
                        {t('collections.generateAutoRoute', locale)}
                    </button>
                </div>
            )}
        </div>
    );
}
