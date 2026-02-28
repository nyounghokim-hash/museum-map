'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/AppContext';
import { useModal } from '@/components/ui/Modal';
import { t, formatDate } from '@/lib/i18n';

export default function CollectionsPage() {
    const [tab, setTab] = useState<'my' | 'public'>('public');
    const [myCollections, setMyCollections] = useState<any[]>([]);
    const [publicCollections, setPublicCollections] = useState<any[]>([]);
    const [loadingMy, setLoadingMy] = useState(true);
    const [loadingPublic, setLoadingPublic] = useState(true);
    const { locale } = useApp();
    const { showConfirm, showAlert } = useModal();
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        fetch('/api/collections')
            .then(r => r.json())
            .then(res => { setMyCollections(res.data || []); setLoadingMy(false); })
            .catch(() => setLoadingMy(false));

        fetch('/api/collections?public=true')
            .then(r => r.json())
            .then(res => { setPublicCollections(res.data || []); setLoadingPublic(false); })
            .catch(() => setLoadingPublic(false));
    }, []);

    const handleDelete = (id: string) => {
        showConfirm(t('modal.deleteCollection', locale), async () => {
            await fetch(`/api/collections/${id}`, { method: 'DELETE' });
            setMyCollections(prev => prev.filter(c => c.id !== id));
        });
    };

    const collections = tab === 'my' ? myCollections : publicCollections;
    const loading = tab === 'my' ? loadingMy : loadingPublic;

    const tabLabel = (key: string) => {
        const labels: Record<string, Record<string, string>> = {
            my: { ko: '내 컬렉션', en: 'My Collections', ja: '私のコレクション', de: 'Meine Sammlungen', fr: 'Mes collections', es: 'Mis colecciones', pt: 'Minhas coleções' },
            public: { ko: '공용 컬렉션', en: 'Public Collections', ja: '公開コレクション', de: 'Öffentliche Sammlungen', fr: 'Collections publiques', es: 'Colecciones públicas', pt: 'Coleções públicas' },
        };
        const lang = locale.startsWith('ko') ? 'ko' : locale.startsWith('ja') ? 'ja' : locale.startsWith('de') ? 'de' : locale.startsWith('fr') ? 'fr' : locale.startsWith('es') ? 'es' : locale.startsWith('pt') ? 'pt' : 'en';
        return labels[key]?.[lang] || labels[key]?.['en'] || key;
    };

    return (
        <div className="w-full max-w-[1080px] mx-auto px-4 py-4 sm:px-6 sm:py-8 md:px-8 mt-4 sm:mt-8">
            <div className="mb-6 sm:mb-8">
                {loading ? (
                    <>
                        <div className="h-8 w-36 bg-gray-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
                        <div className="h-4 w-56 bg-gray-100 dark:bg-neutral-800/60 rounded mt-2 animate-pulse" />
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white">{t('collections.title', locale)}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{t('collections.subtitle', locale)}</p>
                    </>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-neutral-800 rounded-2xl p-1 mb-8">
                {(['public', 'my'] as const).map((key) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${tab === key
                            ? 'bg-white dark:bg-neutral-900 text-black dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        {tabLabel(key)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-5 animate-pulse">
                            <div className="h-6 bg-gray-200 dark:bg-neutral-800 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-1/4"></div>
                        </div>
                    ))}
                </div>
            ) : collections.length === 0 ? (
                <div className="py-20 text-center">
                    <div className="text-6xl mb-4">{tab === 'my' ? '📁' : '🌍'}</div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                        {tab === 'my' ? t('collections.empty', locale) : (locale === 'ko' ? '아직 공개된 컬렉션이 없습니다' : 'No public collections yet')}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {tab === 'my' ? t('collections.emptyDesc', locale) : (locale === 'ko' ? '컬렉션을 만들고 공개해보세요!' : 'Create and publish your collection!')}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {collections.map((col: any) => (
                        <Link key={col.id} href={`/collections/${col.id}`}>
                            <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-5 shadow-md hover:shadow-xl transition-all cursor-pointer group relative">
                                {tab === 'my' && (
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(col.id); }}
                                        className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                                <h3 className="text-lg font-bold group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400 transition-colors">{col.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {col._count?.items || 0} {t('collections.items', locale)}
                                    </span>
                                    {tab === 'public' && col.user?.name && (
                                        <>
                                            <span className="text-gray-300 dark:text-neutral-600">•</span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                                {col.user.name.startsWith('guest_') ? (locale === 'ko' ? '익명' : 'Anonymous') : col.user.name}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {tab === 'my' && !loadingMy && (
                <div
                    onClick={() => {
                        if (session?.user?.name?.startsWith('guest_')) {
                            showConfirm(t('auth.loginRequired', locale), () => {
                                router.push('/login');
                            });
                        } else {
                            router.push('/collections/new');
                        }
                    }}
                    className="block mt-4"
                >
                    <div className="border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all cursor-pointer group active:scale-[0.98]">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 group-hover:bg-black dark:group-hover:bg-white flex items-center justify-center transition-colors mb-2">
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-white dark:group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">{t('collections.newCollection', locale)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
