'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/components/AppContext';
import { t, formatDate } from '@/lib/i18n';
import LoadingAnimation from '@/components/ui/LoadingAnimation';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { locale } = useApp();

    useEffect(() => {
        fetch('/api/notifications')
            .then(r => r.json())
            .then(data => {
                setNotifications(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const markAllRead = () => {
        fetch('/api/notifications/read-all', { method: 'POST' })
            .then(() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))));
    };

    const markRead = (id: string) => {
        fetch(`/api/notifications/${id}/read`, { method: 'POST' });
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingAnimation size={160} />
        </div>
    );

    return (
        <div className="w-full max-w-[1080px] mx-auto px-4 py-4 sm:px-6 sm:py-8 md:px-8 mt-4 sm:mt-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white">
                        {locale === 'ko' ? '알림' : 'Notifications'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                        {unreadCount > 0
                            ? (locale === 'ko' ? `읽지 않은 알림 ${unreadCount}개` : `${unreadCount} unread`)
                            : (locale === 'ko' ? '모든 알림을 확인했습니다' : 'All caught up')}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        className="px-4 py-2 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    >
                        {locale === 'ko' ? '모두 읽음' : 'Mark all read'}
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="py-20 text-center">
                    <div className="text-6xl mb-4">🔔</div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                        {locale === 'ko' ? '알림이 없습니다' : 'No notifications'}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {locale === 'ko' ? '새로운 소식이 있으면 여기에 표시됩니다' : 'New updates will appear here'}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {notifications.map(n => (
                        <Link
                            key={n.id}
                            href={`/notifications/${n.id}`}
                            onClick={() => { if (!n.isRead) markRead(n.id); }}
                            className={`block rounded-2xl border transition-all hover:shadow-md active:scale-[0.99] ${!n.isRead
                                    ? 'bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-800/30'
                                    : 'bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-800'
                                }`}
                        >
                            <div className="p-4 sm:p-5 flex items-start gap-3">
                                <div className={`w-2.5 h-2.5 shrink-0 rounded-full mt-1.5 ${!n.isRead ? 'bg-purple-500' : 'bg-transparent'}`} />
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1" style={{ wordBreak: 'break-word' }}>
                                        {locale !== 'ko' && n.titleEn ? n.titleEn : n.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed" style={{ wordBreak: 'break-word' }}>
                                        {locale !== 'ko' && n.messageEn ? n.messageEn : n.message}
                                    </p>
                                    <span className="text-[10px] text-gray-400 dark:text-neutral-600 mt-2 block font-medium">
                                        {formatDate(n.createdAt, locale)}
                                    </span>
                                </div>
                                <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
