'use client';
import { usePathname } from 'next/navigation';

/** Wraps page content with bottom padding only on pages where MobileBottomNav is visible */
export default function MainContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Mirror the hide logic from MobileBottomNav
    const navHidden =
        pathname.startsWith('/admin') ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/museum/') ||
        pathname.startsWith('/museums/') ||
        /^\/blog\/.+/.test(pathname);

    return (
        <main className={`flex-1 flex flex-col relative w-full h-full ${navHidden ? '' : 'pb-[56px]'} lg:pb-0`}>
            {children}
        </main>
    );
}
