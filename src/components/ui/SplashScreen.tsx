'use client';
import { useState, useEffect } from 'react';

const SUBTITLES: Record<string, string> = {
    ko: '나만의 미술관 여행을 시작하세요',
    en: 'Discover Museums Around the World',
    ja: '世界中の美術館を探索しよう',
    zh: '探索世界各地的博物馆',
    de: 'Entdecke Museen auf der ganzen Welt',
    fr: 'Découvrez les musées du monde entier',
    es: 'Descubre museos de todo el mundo',
    pt: 'Descubra museus ao redor do mundo',
    sv: 'Upptäck museer runt om i världen',
    fi: 'Tutustu museoihin ympäri maailmaa',
    da: 'Oplev museer rundt om i verden',
    et: 'Avasta muuseume üle maailma',
};

function getDeviceLang(): string {
    if (typeof navigator === 'undefined') return 'en';
    const lang = navigator.language || (navigator as any).userLanguage || 'en';
    const short = lang.split('-')[0].toLowerCase();
    return SUBTITLES[short] ? short : 'en';
}

export default function SplashScreen() {
    const [visible, setVisible] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const [lang, setLang] = useState('en');

    useEffect(() => {
        setLang(getDeviceLang());
        const timer = setTimeout(() => setFadeOut(true), 1800);
        const hide = setTimeout(() => setVisible(false), 2400);
        return () => { clearTimeout(timer); clearTimeout(hide); };
    }, []);

    if (!visible) return null;

    return (
        <div
            className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
            style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)' }}
        >
            {/* Center: Logo + Title */}
            <div className="flex flex-col items-center gap-3 animate-fadeInUp -mt-16">
                {/* SVG Logo */}
                <div className="w-20 h-20 sm:w-24 sm:h-24">
                    <svg viewBox="0 0 512 512" className="w-full h-full drop-shadow-2xl">
                        <path fill="white" d="M57.89,345.96v-48.12c0-7.33,4.96-13.71,12.05-15.53l42.3-10.86c16.08-4.13,16.06-26.97-.03-31.07l-42.25-10.76c-7.11-1.81-12.08-8.21-12.08-15.54v-48.04c0-8.86,7.18-16.03,16.03-16.03h157.09c8.86,0,16.03,7.18,16.03,16.03v15.63c0,8.86-7.18,16.03-16.03,16.03h-.31c-18.87,0-22.24,26.92-3.96,31.58l8.23,2.1c7.11,1.81,12.08,8.21,12.08,15.54v18.24c0,7.34-4.98,13.73-12.09,15.54l-7.98,2.03c-18.3,4.65-14.93,31.58,3.96,31.58h.08c8.86,0,16.03,7.18,16.03,16.03v15.63c0,8.86-7.18,16.03-16.03,16.03H73.93c-8.86,0-16.03-7.18-16.03-16.03h0Z" />
                        <path fill="white" d="M454.11,166.01v48.13c0,7.32-4.95,13.7-12.04,15.53l-42.12,10.86c-16.06,4.14-16.04,26.96.03,31.07l42.07,10.76c7.1,1.82,12.07,8.22,12.07,15.54v48.06c0,8.86-7.18,16.03-16.03,16.03h-156.37c-8.86,0-16.03-7.18-16.03-16.03v-15.63c0-8.86,7.18-16.03,16.03-16.03h.24c18.86,0,22.25-26.9,3.98-31.57l-8.18-2.09c-7.1-1.82-12.07-8.22-12.07-15.54v-18.27c0-7.33,4.97-13.72,12.07-15.54l7.93-2.03c18.28-4.67,14.9-31.57-3.97-31.57h0c-8.86,0-16.03-7.18-16.03-16.03v-15.63c0-8.86,7.18-16.03,16.03-16.03h156.37c8.86,0,16.03,7.18,16.03,16.03v-.02Z" />
                    </svg>
                </div>

                {/* Title */}
                <div className="text-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        Museum Map
                    </h1>
                    <p className="text-sm sm:text-base text-white/60 mt-2 font-medium tracking-wide">
                        {SUBTITLES[lang]}
                    </p>
                </div>
            </div>

            {/* Bottom: Made by */}
            <div className="absolute bottom-10 sm:bottom-12 text-center">
                <p className="text-xs text-white/30 font-medium tracking-widest uppercase">
                    Made by Haerangsa
                </p>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeInUp {
                    animation: fadeInUp 800ms ease-out forwards;
                }
            `}</style>
        </div>
    );
}
