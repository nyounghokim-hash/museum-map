'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, getLocaleFromCountry, t } from '@/lib/i18n';
import { useSession, signOut } from 'next-auth/react';

interface AppContextType {
    locale: Locale;
    setLocale: (l: Locale) => void;
    darkMode: boolean;
    setDarkMode: (d: boolean) => void;
    t: (key: string, loc?: Locale) => string;
}

const AppContext = createContext<AppContextType>({
    locale: 'en',
    setLocale: () => { },
    darkMode: false,
    setDarkMode: () => { },
    t: (key: string) => key,
});

export function useApp() {
    return useContext(AppContext);
}

export function AppProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession();
    const [locale, setLocaleState] = useState<Locale>('en');
    const [darkMode, setDarkModeState] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // Guest Session Guard: Log out if isGuest but sessionStorage is empty (new tab/restart)
    useEffect(() => {
        if (session?.user?.name?.startsWith('guest_')) {
            const isGuestFlag = sessionStorage.getItem('isGuest');
            if (!isGuestFlag) {
                signOut({ redirect: false });
            }
        }
    }, [session]);

    // Load from localStorage
    useEffect(() => {
        const savedLocale = localStorage.getItem('locale') as Locale | null;
        const savedDark = localStorage.getItem('darkMode');

        if (savedLocale) {
            setLocaleState(savedLocale);
        } else {
            // Auto-detect from IP
            fetch('http://ip-api.com/json/?fields=countryCode', { signal: AbortSignal.timeout(3000) })
                .then(r => r.json())
                .then(data => {
                    if (data.countryCode) {
                        const detected = getLocaleFromCountry(data.countryCode);
                        setLocaleState(detected);
                        localStorage.setItem('locale', detected);
                    }
                })
                .catch(() => { });
        }

        if (savedDark === 'true') {
            setDarkModeState(true);
            document.documentElement.classList.add('dark');
        }
        setInitialized(true);
    }, []);

    const setLocale = (l: Locale) => {
        setLocaleState(l);
        localStorage.setItem('locale', l);
    };

    const setDarkMode = (d: boolean) => {
        setDarkModeState(d);
        localStorage.setItem('darkMode', String(d));
        if (d) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    if (!initialized) return null;

    return (
        <AppContext.Provider value={{ locale, setLocale, darkMode, setDarkMode, t: (key, loc) => t(key as any, loc || locale) }}>
            {children}
        </AppContext.Provider>
    );
}
