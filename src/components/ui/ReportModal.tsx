'use client';
import { useState } from 'react';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (message: string) => void;
    locale: string;
    targetName?: string;
}

export default function ReportModal({ isOpen, onClose, onSubmit, locale, targetName }: ReportModalProps) {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!message.trim()) return;
        setSending(true);
        await onSubmit(message.trim());
        setSending(false);
        setMessage('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full sm:w-[440px] bg-white dark:bg-neutral-900 sm:rounded-3xl rounded-t-3xl p-6 sm:p-8 shadow-2xl animate-slideUp"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <span className="text-lg">✏️</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-extrabold dark:text-white">
                                {locale === 'ko' ? '정보 수정 요청' : 'Request Info Update'}
                            </h3>
                            {targetName && (
                                <p className="text-[10px] text-gray-400 font-bold mt-0.5 truncate max-w-[250px]">{targetName}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Textarea */}
                <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={locale === 'ko'
                        ? '어떤 정보가 실제와 다른가요?\n예: 입장료가 변경되었어요, 운영시간이 달라요 등'
                        : 'What information is inaccurate?\ne.g. Admission fee has changed, hours are different, etc.'}
                    className="w-full h-28 p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-neutral-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-700 transition-all"
                    autoFocus
                />

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={!message.trim() || sending}
                    className="mt-4 w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 dark:disabled:bg-neutral-700 text-white disabled:text-gray-400 dark:disabled:text-neutral-500 text-sm font-bold transition-all active:scale-[0.98] shadow-lg shadow-purple-600/20 disabled:shadow-none"
                >
                    {sending
                        ? (locale === 'ko' ? '전송 중...' : 'Sending...')
                        : (locale === 'ko' ? '수정 요청 보내기' : 'Submit Request')}
                </button>

                <p className="text-[10px] text-gray-300 dark:text-neutral-600 text-center mt-3">
                    {locale === 'ko' ? '보내주신 내용은 관리자가 확인 후 반영합니다' : 'Your request will be reviewed by our team'}
                </p>
            </div>

            <style jsx>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slideUp {
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </div>
    );
}
