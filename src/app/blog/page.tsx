'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/AppContext';
import { t, formatDate } from '@/lib/i18n';
import LoadingAnimation from '@/components/ui/LoadingAnimation';

export default function BlogListPage() {
    const { locale } = useApp();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/blog')
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setPosts(data.data.filter((p: any) => p.status === 'PUBLISHED'));
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingAnimation size={160} />
        </div>
    );

    return (
        <div className="w-full max-w-[1080px] mx-auto px-4 py-8 sm:px-6 md:px-8 mt-4 sm:mt-8">
            <div className="mb-10 sm:mb-12">
                <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white mb-2">
                    {t('blog.title', locale)}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                    {t('blog.subtitle', locale)}
                </p>
            </div>

            {posts.length === 0 ? (
                <div className="py-20 sm:py-32 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 dark:bg-neutral-800/50 rounded-full flex items-center justify-center mb-8">
                        <span className="text-5xl sm:text-6xl">📖</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-4 text-center">
                        {t('blog.empty', locale)}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-md text-center mb-10 leading-relaxed">
                        {t('blog.emptyDesc', locale)}
                    </p>
                    <Link
                        href="/"
                        className="px-8 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
                    >
                        {t('global.goHome', locale)}
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-6 sm:gap-8">
                    {posts.map((post: any) => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.id}`}
                            className="group flex flex-col sm:flex-row bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-neutral-800 hover:shadow-xl transition-all duration-300 shadow-sm active:scale-[0.99] min-h-auto sm:min-h-[180px]"
                        >
                            {/* Horizontal Thumbnail */}
                            <div className="w-full sm:w-[280px] h-[180px] sm:h-auto shrink-0 overflow-hidden bg-gray-50 dark:bg-neutral-800 relative">
                                {post.previewImage ? (
                                    <img
                                        src={post.previewImage}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-200 dark:text-neutral-700">
                                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Content Side */}
                            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-center min-w-0">
                                <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                                    <span>{post.author || 'Editorial'}</span>
                                    <span className="text-gray-300 dark:text-neutral-700">•</span>
                                    <span className="text-gray-400 font-medium">{formatDate(post.createdAt, locale)}</span>
                                </div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                                    {locale !== 'ko' && post.titleEn ? post.titleEn : post.title}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                    {((locale !== 'ko' && post.contentEn ? post.contentEn : post.content) || '').replace(/<[^>]*>/g, '').substring(0, 200)}
                                </p>
                                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                    {locale === 'ko' ? '더 보기' : 'Read More'}
                                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
