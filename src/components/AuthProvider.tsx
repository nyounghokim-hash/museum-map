'use client';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';

function GuestSessionGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.name) {
            // Check if user is a generated guest
            if (session.user.name.startsWith('guest_')) {
                const isGuestValidated = sessionStorage.getItem('isGuest');
                if (!isGuestValidated) {
                    // This means the browser was closed or session storage cleared
                    signOut({ redirect: true, callbackUrl: '/login' });
                }
            }
        }
    }, [status, session]);

    return <>{children}</>;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <GuestSessionGuard>{children}</GuestSessionGuard>
        </SessionProvider>
    );
}
