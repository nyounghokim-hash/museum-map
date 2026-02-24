'use client';
import { useTranslatedText } from '@/hooks/useTranslation';
import { useApp } from '@/components/AppContext';
import { formatDate, type Locale } from '@/lib/i18n';

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

    return (
        <div className="p-6 sm:p-10 md:p-12">
            {/* Author & Date */}
            <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                <span>{post.author || 'Editorial'}</span>
                <span className="text-gray-300 dark:text-neutral-700">•</span>
                <span className="text-gray-400 font-medium">{formatDate(post.createdAt, effectiveLocale)}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight">
                {displayTitle}
            </h1>

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
        </div>
    );
}
