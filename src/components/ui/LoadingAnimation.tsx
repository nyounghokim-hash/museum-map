"use client";
import { useEffect, useState } from "react";
import Lottie from "lottie-react";

interface LoadingAnimationProps {
    size?: number;
    className?: string;
}

const LoadingAnimation = ({ size = 160, className = "" }: LoadingAnimationProps) => {
    const [animationData, setAnimationData] = useState<object | null>(null);
    const displaySize = size * 1.5;

    useEffect(() => {
        fetch('/loading.json')
            .then(r => r.json())
            .then(setAnimationData)
            .catch(() => setAnimationData(null));
    }, []);

    return (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm ${className}`}>
            <div style={{ width: displaySize, height: displaySize }} className="flex items-center justify-center">
                {animationData ? (
                    <Lottie
                        animationData={animationData}
                        loop
                        autoplay
                        style={{ width: displaySize, height: displaySize }}
                    />
                ) : (
                    <div
                        className="rounded-full border-4 border-purple-200 border-t-purple-600 dark:border-neutral-700 dark:border-t-purple-400 animate-spin"
                        style={{ width: size * 0.3, height: size * 0.3 }}
                    />
                )}
            </div>
        </div>
    );
};

export default LoadingAnimation;
