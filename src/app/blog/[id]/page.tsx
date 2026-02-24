import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { t } from '@/lib/i18n';
import Link from 'next/link';
import { headers } from 'next/headers';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const post = await (prisma as any).story.findUnique({
        where: { id: resolvedParams.id },
        select: { title: true, titleEn: true, content: true, contentEn: true, description: true, previewImage: true }
    });

    if (!post) {
        return { title: 'Post Not Found - Museum Map' };
    }

    const headerList = headers();
    const acceptLanguage = (await headerList).get('accept-language') || 'en';
    const isKo = acceptLanguage.includes('ko');

    const displayTitle = isKo ? post.title : (post.titleEn || post.title);
    const displayContent = isKo ? post.content : (post.contentEn || post.content);
    const description = post.description || displayContent.replace(/<[^>]*>/g, '').substring(0, 160) + '...';

    return {
        title: `${displayTitle} - Museum Map MM Story`,
        description,
        openGraph: {
            title: displayTitle,
            description,
            images: post.previewImage ? [{ url: post.previewImage }] : [],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: displayTitle,
            description,
            images: post.previewImage ? [post.previewImage] : [],
        },
    };
}

export default async function BlogPostDetail({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const post = await (prisma as any).story.findUnique({
        where: { id: resolvedParams.id }
    });

    const headerList = headers();
    const acceptLanguage = (await headerList).get('accept-language') || 'en';
    const isKo = acceptLanguage.includes('ko');
    const locale = isKo ? 'ko' : 'en';

    const displayTitle = isKo ? post?.title : (post?.titleEn || post?.title);
    const displayContent = isKo ? post?.content : (post?.contentEn || post?.content);

    if (!post) {
        return (
            <div className="w-full max-w-[1080px] mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold dark:text-white">Story not found</h1>
                <Link href="/blog" className="text-purple-600 dark:text-purple-400 mt-4 inline-block hover:underline">
                    {t('blog.backToList', locale)}
                </Link>
            </div>
        );
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": displayTitle,
        "image": post.previewImage || "https://global-museums.vercel.app/logo.png",
        "datePublished": post.createdAt.toISOString(),
        "dateModified": post.updatedAt?.toISOString() || post.createdAt.toISOString(),
        "author": {
            "@type": "Person",
            "name": post.author || "Editorial"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Museum Map",
            "logo": {
                "@type": "ImageObject",
                "url": "https://global-museums.vercel.app/logo.png"
            }
        },
        "description": post.description || post.content.replace(/<[^>]*>/g, '').substring(0, 160)
    };

    return (
        <article className="w-full max-w-[1080px] mx-auto px-4 py-4 sm:px-6 sm:py-8 md:px-8 mt-4 sm:mt-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors mb-6 sm:mb-8 group"
            >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                {t('blog.backToList', locale)}
            </Link>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-neutral-800 shadow-xl sm:shadow-2xl">
                {post.previewImage && (
                    <div className="rounded-t-3xl overflow-hidden border-b border-gray-200 dark:border-neutral-800">
                        <img
                            src={post.previewImage}
                            alt={post.title}
                            className="w-full h-[250px] sm:h-[300px] object-cover object-center"
                        />
                    </div>
                )}

                <div className="p-6 sm:p-10 md:p-12">
                    {/* Author & Date — matching blog list style */}
                    <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                        <span>{post.author || 'Editorial'}</span>
                        <span className="text-gray-300 dark:text-neutral-700">•</span>
                        <span className="text-gray-400 font-medium">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight">
                        {displayTitle}
                    </h1>

                    <div
                        className="ql-snow"
                    >
                        <div
                            className="ql-editor prose prose-lg dark:prose-invert max-w-none prose-purple prose-headings:font-bold prose-a:text-purple-600"
                            dangerouslySetInnerHTML={{ __html: displayContent }}
                            style={{ padding: 0 }}
                        />
                    </div>
                </div>
            </div>
        </article>
    );
}
