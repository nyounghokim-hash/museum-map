import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { t } from '@/lib/i18n';
import Link from 'next/link';
import { headers } from 'next/headers';
import BlogContentClient from './BlogContentClient';

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

    const displayTitle = isKo ? post.title : (post.titleEn || post.title);

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

    const serializedPost = {
        ...post,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt?.toISOString() || null,
    };

    return (
        <article className="w-full max-w-[1080px] mx-auto px-4 py-4 sm:px-6 sm:py-8 md:px-8 mt-4 sm:mt-8 relative">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Floating back button on mobile, inline on desktop */}
            <Link
                href="/blog"
                className="lg:inline-flex lg:items-center lg:gap-2 lg:text-sm lg:font-medium lg:text-gray-500 lg:dark:text-gray-400 lg:hover:text-purple-600 lg:dark:hover:text-purple-400 lg:transition-colors lg:mb-8 lg:static lg:bg-transparent lg:shadow-none lg:backdrop-blur-none lg:rounded-none lg:w-auto lg:h-auto lg:p-0 fixed top-20 left-4 z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md shadow-lg flex items-center justify-center text-white hover:bg-black/60 transition-all active:scale-95 group"
            >
                <svg className="w-5 h-5 lg:w-4 lg:h-4 lg:group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden lg:inline">{t('blog.backToList', locale)}</span>
            </Link>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-neutral-800 shadow-xl sm:shadow-2xl lg:mt-0 mt-8">
                {post.previewImage && (
                    <div className="rounded-t-3xl overflow-hidden border-b border-gray-200 dark:border-neutral-800">
                        <img
                            src={post.previewImage}
                            alt={post.title}
                            className="w-full h-[250px] sm:h-[300px] object-cover object-center"
                        />
                    </div>
                )}

                <BlogContentClient post={serializedPost} serverLocale={locale} />
            </div>
        </article>
    );
}
