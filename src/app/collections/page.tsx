'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/AppContext';
import { useModal } from '@/components/ui/Modal';
import { t } from '@/lib/i18n';

export default function MyCollectionsPage() {
    const [collections, setCollections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { locale } = useApp();
    const { showConfirm } = useModal();

    useEffect(() => {
        fetch('/api/collections')
            .then(r => r.json())
            .then(res => { setCollections(res.data || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleDelete = (id: string) => {
        showConfirm(t('modal.deleteCollection', locale), async () => {
            await fetch(`/api/collections/${id}`, { method: 'DELETE' });
            setCollections(prev => prev.filter(c => c.id !== id));
        });
    };

    return (
        <div className="max-w-[1080px] mx-auto px-4 py-4 sm:p-8 sm:mt-10">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white">{t('collections.title', locale)}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{t('collections.subtitle', locale)}</p>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400 animate-pulse">{t('collections.loading', locale)}</div>
            ) : collections.length === 0 ? (
                <div className="py-20 text-center">
                    <div className="text-6xl mb-4">📁</div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t('collections.empty', locale)}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{t('collections.emptyDesc', locale)}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {collections.map((col: any) => (
                        <Link key={col.id} href={`/collections/${col.id}`}>
                            <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer group relative">
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(col.id); }}
                                    className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                                <h3 className="text-lg font-bold group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors">{col.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {col._count?.items || 0} {t('collections.items', locale)}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {!loading && (
                <Link href="/collections/new" className="block mt-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all cursor-pointer group active:scale-[0.98]">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 group-hover:bg-black dark:group-hover:bg-white flex items-center justify-center transition-colors mb-2">
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-white dark:group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">{t('collections.newCollection', locale)}</span>
                    </div>
                </Link>
            )}
        </div>
    );
}
