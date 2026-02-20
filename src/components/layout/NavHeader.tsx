'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
    { href: '/', label: 'Map Explore' },
    { href: '/collections', label: 'My Collections' },
    { href: '/saved', label: 'Saved & Folders' },
    { href: '/plans', label: 'My Plans' },
    { href: '/challenges', label: 'Challenges' },
];

export default function NavHeader() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const drawerRef = useRef<HTMLDivElement>(null);

    // Close on route change
    useEffect(() => { setMobileOpen(false); }, [pathname]);

    // Close on outside click
    useEffect(() => {
        if (!mobileOpen) return;
        const handler = (e: MouseEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
                setMobileOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [mobileOpen]);

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b bg-white/70 backdrop-blur-md">
                <div className="container mx-auto flex h-14 items-center gap-4 px-4 sm:px-6 lg:px-8">
                    {/* Logo */}
                    <Link href="/" className="font-bold text-lg mr-6 shrink-0">
                        Museum Map
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        {NAV_LINKS.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`transition-colors hover:text-black ${pathname === link.href
                                    ? 'text-black'
                                    : 'text-gray-500'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="ml-auto flex items-center space-x-4">
                        <Link href="/admin" className="hidden md:inline text-sm font-medium text-gray-500 hover:text-black transition-colors">
                            Admin
                        </Link>

                        {/* Hamburger button — mobile only */}
                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setMobileOpen(prev => !prev)}
                            aria-label="Toggle menu"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                {mobileOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Side Drawer Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-[9999] md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        style={{ animation: 'fadeIn 200ms ease-out' }}
                    />

                    {/* Drawer */}
                    <div
                        ref={drawerRef}
                        className="absolute top-0 right-0 h-full w-72 bg-white shadow-2xl flex flex-col"
                        style={{ animation: 'slideInRight 250ms ease-out' }}
                    >
                        {/* Close button */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <span className="font-bold text-lg">Menu</span>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Nav links */}
                        <nav className="flex-1 p-4 space-y-1">
                            {NAV_LINKS.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === link.href
                                        ? 'bg-black text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Footer */}
                        <div className="p-4 border-t">
                            <Link
                                href="/admin"
                                className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-all"
                            >
                                Admin
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Animations CSS */}
            <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
        </>
    );
}
