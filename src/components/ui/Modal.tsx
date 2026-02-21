'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ModalState {
    type: 'alert' | 'confirm';
    title?: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface ModalContextType {
    showAlert: (message: string, title?: string) => void;
    showConfirm: (message: string, onConfirm: () => void, title?: string) => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function useModal() {
    const ctx = useContext(ModalContext);
    if (!ctx) throw new Error('useModal must be inside ModalProvider');
    return ctx;
}

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modal, setModal] = useState<ModalState | null>(null);

    const showAlert = useCallback((message: string, title?: string) => {
        setModal({ type: 'alert', message, title });
    }, []);

    const showConfirm = useCallback((message: string, onConfirm: () => void, title?: string) => {
        setModal({ type: 'confirm', message, title, onConfirm });
    }, []);

    const close = () => setModal(null);

    return (
        <ModalContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            {modal && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={close}>
                    <div
                        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-scaleUp"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header with X */}
                        <div className="flex items-center justify-between px-5 pt-4 pb-0">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">{modal.title || (modal.type === 'confirm' ? 'Confirm' : 'Notice')}</h3>
                            <button onClick={close} className="p-2 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors">
                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {/* Body */}
                        <div className="px-5 py-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300">{modal.message}</p>
                        </div>
                        {/* Actions */}
                        <div className="flex gap-2 px-5 pb-5">
                            {modal.type === 'confirm' && (
                                <button
                                    onClick={close}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={() => { modal.onConfirm?.(); close(); }}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-gray-200 transition-colors active:scale-95"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style jsx global>{`
                @keyframes scaleUp {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scaleUp { animation: scaleUp 150ms ease-out; }
            `}</style>
        </ModalContext.Provider>
    );
}
