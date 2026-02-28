'use client';
import { useState } from 'react';
import { useTranslatedText } from '@/hooks/useTranslation';
import { useApp } from '@/components/AppContext';
import { formatDate, type Locale } from '@/lib/i18n';
import Link from 'next/link';
import ReportModal from '@/components/ui/ReportModal';

function InfoTable({ data, locale }: { data: any[]; locale: string }) {
    if (!data || data.length === 0) return null;
    return (
        <div className="mt-10">
            <h2 className="text-xl font-extrabold dark:text-white mb-4 flex items-center gap-2">
                📋 <span>{locale === 'ko' ? '방문 정보' : 'Visitor Info'}</span>
            </h2>
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-neutral-800">
                <table className="w-full text-sm">
                    <tbody>
                        {data.map((row: any, i: number) => (
                            <tr key={i} className={`${i % 2 === 0 ? 'bg-gray-50 dark:bg-neutral-800/50' : 'bg-white dark:bg-neutral-900'}`}>
                                <td className="px-5 py-3.5 font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap w-[140px] border-r border-gray-100 dark:border-neutral-800">
                                    {row.label}
                                </td>
                                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">
                                    {row.value}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function SafeImage({ src, alt, className, fallbackIcon }: { src: string; alt: string; className: string; fallbackIcon?: string }) {
    const [error, setError] = useState(false);
    if (error || !src) {
        return (
            <div className={`${className} bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 flex items-center justify-center`}>
                <span className="text-2xl">{fallbackIcon || '🖼️'}</span>
            </div>
        );
    }
    return <img src={src} alt={alt} className={className} onError={() => setError(true)} loading="lazy" />;
}

function ArtworkCards({ data, locale }: { data: any[]; locale: string }) {
    if (!data || data.length === 0) return null;
    return (
        <div className="mt-10">
            <h2 className="text-xl font-extrabold dark:text-white mb-4 flex items-center gap-2">
                🖼️ <span>{locale === 'ko' ? '주요 작품' : 'Featured Works'}</span>
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory scrollbar-hide">
                {data.map((work: any, i: number) => (
                    <div key={i} className="min-w-[260px] max-w-[280px] flex-shrink-0 snap-start bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                        <div className="h-[180px] overflow-hidden bg-gray-100 dark:bg-neutral-800">
                            <SafeImage
                                src={work.image}
                                alt={work.title || ''}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                fallbackIcon="🎨"
                            />
                        </div>
                        <div className="p-4">
                            <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">
                                {work.artist}
                            </p>
                            <h3 className="font-bold text-sm dark:text-white leading-tight mb-2">
                                {work.title}
                            </h3>
                            {work.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                                    {work.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function RelatedMuseums({ museums, locale }: { museums: any[]; locale: string }) {
    if (!museums || museums.length === 0) return null;
    return (
        <div className="mb-6">
            <div className="flex flex-wrap gap-2">
                {museums.map((m: any) => (
                    <Link
                        key={m.id}
                        href={`/museums/${m.id}`}
                        className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-purple-50 dark:bg-purple-900/15 border border-purple-100 dark:border-purple-800/30 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:border-purple-200 dark:hover:border-purple-700 transition-all group"
                    >
                        {m.imageUrl ? (
                            <SafeImage
                                src={m.imageUrl}
                                alt={m.name}
                                className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                                fallbackIcon="🏛️"
                            />
                        ) : (
                            <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm">🏛️</span>
                            </div>
                        )}
                        <span className="font-bold text-xs text-purple-700 dark:text-purple-300 group-hover:text-purple-900 dark:group-hover:text-purple-100 transition-colors">
                            {m.name}
                        </span>
                        <svg className="w-3 h-3 text-purple-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default function BlogContentClient({ post, serverLocale }: { post: any; serverLocale: string }) {
    const { locale } = useApp();
    const effectiveLocale = locale || serverLocale;

    // Use English version if available, otherwise translate Korean
    const hasEnglish = !!post.titleEn;
    const rawTitle = effectiveLocale !== 'ko' && hasEnglish ? post.titleEn : post.title;
    const rawContent = effectiveLocale !== 'ko' && hasEnglish
        ? (post.contentEn || post.content)
        : post.content;

    // If no English version and not Korean, translate
    const needsTranslation = effectiveLocale !== 'ko' && !hasEnglish;
    const translatedTitle = useTranslatedText(needsTranslation ? post.title : null, effectiveLocale as Locale);
    const translatedContent = useTranslatedText(needsTranslation ? post.content?.replace(/<[^>]*>/g, '') : null, effectiveLocale as Locale);

    const displayTitle = needsTranslation && translatedTitle ? translatedTitle : rawTitle;
    const [reportOpen, setReportOpen] = useState(false);

    return (
        <div className="p-6 sm:p-10 md:p-12">
            {/* Author & Date */}
            <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                <span>{post.author || 'Editorial'}</span>
                <span className="text-gray-300 dark:text-neutral-700">•</span>
                <span className="text-gray-400 font-medium">{formatDate(post.createdAt, effectiveLocale)}</span>
                {post.views > 0 && (
                    <>
                        <span className="text-gray-300 dark:text-neutral-700">•</span>
                        <span className="text-gray-400 font-medium normal-case">👁 {post.views.toLocaleString()}</span>
                    </>
                )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">
                {displayTitle}
            </h1>

            {/* Related Museums — right below title */}
            <RelatedMuseums museums={post.museums} locale={effectiveLocale} />

            {needsTranslation && translatedContent ? (
                <div className="prose prose-lg dark:prose-invert max-w-none prose-purple prose-headings:font-bold prose-a:text-purple-600">
                    <p style={{ whiteSpace: 'pre-wrap' }}>{translatedContent}</p>
                </div>
            ) : (
                <div className="ql-snow">
                    <div
                        className="ql-editor prose prose-lg dark:prose-invert max-w-none prose-purple prose-headings:font-bold prose-a:text-purple-600"
                        dangerouslySetInnerHTML={{ __html: rawContent }}
                        style={{ padding: 0 }}
                    />
                </div>
            )}

            {/* Info Table */}
            <InfoTable data={post.infoTable} locale={effectiveLocale} />

            {/* Artwork Cards */}
            <ArtworkCards data={post.artworks} locale={effectiveLocale} />

            {/* Report Info Update */}
            <div className="mt-10 pt-6 border-t border-gray-100 dark:border-neutral-800">
                <button
                    onClick={() => setReportOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50 text-gray-400 dark:text-gray-500 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/10 dark:hover:border-purple-800 text-xs font-bold transition-all active:scale-95"
                >
                    <span className="text-sm">✏️</span>
                    {effectiveLocale === 'ko' ? '정보 수정 요청' : 'Request info update'}
                </button>
            </div>
            <ReportModal
                isOpen={reportOpen}
                onClose={() => setReportOpen(false)}
                locale={effectiveLocale}
                targetName={post.title}
                onSubmit={async (msg) => {
                    await fetch('/api/feedback', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            content: msg,
                            type: 'report',
                            category: 'story_info',
                            targetId: post.id,
                            targetName: post.title,
                        })
                    });
                    alert(effectiveLocale === 'ko' ? '감사합니다! 수정 요청이 접수되었어요 🙏' : 'Thank you! Your request has been received 🙏');
                }}
            />
        </div>
    );
}
