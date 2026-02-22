"use client";

import Lottie from "lottie-react";
import loadingData from "./loading.json";

interface LoadingAnimationProps {
    size?: number;
    className?: string;
}

const LoadingAnimation = ({ size = 200, className = "" }: LoadingAnimationProps) => {
    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div style={{ width: size, height: size }}>
                <Lottie
                    animationData={loadingData}
                    loop={true}
                    autoplay={true}
                />
            </div>
        </div>
    );
};

export default LoadingAnimation;
