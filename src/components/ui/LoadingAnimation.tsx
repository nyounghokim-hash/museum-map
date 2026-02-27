"use client";

interface LoadingAnimationProps {
    size?: number;
    className?: string;
}

const LoadingAnimation = ({ size = 160, className = "" }: LoadingAnimationProps) => {
    const scale = size / 160;

    return (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm ${className}`}>
            <div style={{ width: size, height: size }} className="relative">
                {/* Core pulsing nucleus */}
                <div
                    className="absolute rounded-full"
                    style={{
                        width: 18 * scale,
                        height: 18 * scale,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'radial-gradient(circle, #9333ea, #7c3aed)',
                        boxShadow: '0 0 20px rgba(147,51,234,0.4)',
                        animation: 'pulse-nucleus 1.8s ease-in-out infinite',
                    }}
                />

                {/* Orbiting particles */}
                {[
                    { delay: '0s', duration: '2.4s', radius: 28, dotSize: 10, color: '#a855f7', opacity: 0.9 },
                    { delay: '-0.6s', duration: '3.2s', radius: 42, dotSize: 8, color: '#333333', opacity: 0.7 },
                    { delay: '-1.2s', duration: '2.8s', radius: 36, dotSize: 7, color: '#c084fc', opacity: 0.6 },
                    { delay: '-0.3s', duration: '3.6s', radius: 54, dotSize: 6, color: '#1a1a1a', opacity: 0.5 },
                    { delay: '-1.8s', duration: '4.0s', radius: 62, dotSize: 5, color: '#d8b4fe', opacity: 0.45 },
                    { delay: '-2.1s', duration: '2.0s', radius: 20, dotSize: 5, color: '#7c3aed', opacity: 0.8 },
                ].map((p, i) => (
                    <div
                        key={i}
                        className="absolute"
                        style={{
                            width: '100%',
                            height: '100%',
                            animation: `orbit-spin ${p.duration} linear infinite`,
                            animationDelay: p.delay,
                        }}
                    >
                        <div
                            className="absolute rounded-full"
                            style={{
                                width: p.dotSize * scale,
                                height: p.dotSize * scale,
                                top: `calc(50% - ${p.radius * scale}px)`,
                                left: `calc(50% - ${(p.dotSize * scale) / 2}px)`,
                                backgroundColor: p.color,
                                opacity: p.opacity,
                                boxShadow: `0 0 ${6 * scale}px ${p.color}44`,
                                animation: `float-particle ${p.duration} ease-in-out infinite`,
                                animationDelay: p.delay,
                            }}
                        />
                    </div>
                ))}

                {/* Organic orbital rings */}
                {[
                    { radius: 34, color: '#9333ea', width: 1.2, opacity: 0.2, duration: '6s', delay: '0s' },
                    { radius: 50, color: '#555', width: 0.8, opacity: 0.12, duration: '8s', delay: '-2s' },
                    { radius: 66, color: '#a855f7', width: 0.6, opacity: 0.08, duration: '10s', delay: '-4s' },
                ].map((ring, i) => (
                    <div
                        key={`ring-${i}`}
                        className="absolute rounded-full border"
                        style={{
                            width: ring.radius * 2 * scale,
                            height: ring.radius * 2 * scale,
                            top: `calc(50% - ${ring.radius * scale}px)`,
                            left: `calc(50% - ${ring.radius * scale}px)`,
                            borderColor: ring.color,
                            borderWidth: ring.width * scale,
                            opacity: ring.opacity,
                            animation: `ring-breathe ${ring.duration} ease-in-out infinite`,
                            animationDelay: ring.delay,
                        }}
                    />
                ))}

                <style>{`
                    @keyframes pulse-nucleus {
                        0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                        50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.8; }
                    }
                    @keyframes orbit-spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    @keyframes float-particle {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.4); }
                    }
                    @keyframes ring-breathe {
                        0%, 100% { transform: scale(1) rotate(0deg); opacity: inherit; }
                        50% { transform: scale(1.08) rotate(180deg); opacity: 0.05; }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default LoadingAnimation;
