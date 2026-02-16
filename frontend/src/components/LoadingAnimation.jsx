import React, { useState, useEffect } from 'react';

const LoadingAnimation = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);
    const [lettersAssembled, setLettersAssembled] = useState(false);
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        // Letters assemble first
        setTimeout(() => setLettersAssembled(true), 100);

        // Then progress bar starts
        const startDelay = setTimeout(() => {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        // Generate particles for explosion effect
                        const particleArray = Array.from({ length: 150 }, (_, i) => ({
                            id: i,
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            vx: (Math.random() - 0.5) * 20,
                            vy: (Math.random() - 0.5) * 20,
                            size: Math.random() * 8 + 2,
                            color: ['#06b6d4', '#3b82f6', '#8b5cf6', '#6366f1'][Math.floor(Math.random() * 4)]
                        }));
                        setParticles(particleArray);
                        setFadeOut(true);
                        setTimeout(() => onComplete?.(), 1500);
                        return 100;
                    }
                    return prev + 2;
                });
            }, 30);

            return () => clearInterval(interval);
        }, 1500);

        return () => clearTimeout(startDelay);
    }, [onComplete]);

    // Split text into individual letters
    const campusText = "Campus";
    const pulseText = "Pulse";

    return (
        <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
            {/* Particle Explosion Effect */}
            {fadeOut && (
                <div className="absolute inset-0 overflow-hidden">
                    {particles.map((particle) => (
                        <div
                            key={particle.id}
                            className="absolute rounded-full animate-particle-explode"
                            style={{
                                left: `${particle.x}px`,
                                top: `${particle.y}px`,
                                width: `${particle.size}px`,
                                height: `${particle.size}px`,
                                backgroundColor: particle.color,
                                boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                                '--tx': `${particle.vx * 100}px`,
                                '--ty': `${particle.vy * 100}px`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Main Content with Dissolve Effect */}
            <div
                className="absolute inset-0 flex items-center justify-center transition-all duration-1500"
                style={{
                    opacity: fadeOut ? 0 : 1,
                    transform: fadeOut ? 'scale(1.3) rotate(5deg)' : 'scale(1) rotate(0deg)',
                    filter: fadeOut ? 'blur(30px)' : 'blur(0px)'
                }}
            >
                {/* Animated Background Particles */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-float-particle"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${3 + Math.random() * 4}s`
                            }}
                        />
                    ))}
                </div>

                {/* Rotating Gradient Rings */}
                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                    <div className="absolute w-96 h-96 border-2 border-cyan-500/30 rounded-full animate-spin-slow" />
                    <div className="absolute w-80 h-80 border-2 border-purple-500/30 rounded-full animate-spin-reverse" />
                    <div className="absolute w-64 h-64 border-2 border-blue-500/30 rounded-full animate-spin-slow" style={{ animationDuration: '25s' }} />
                </div>

                {/* Main Content Container */}
                <div className="relative z-10 flex flex-col items-center">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 flex items-center justify-center -z-10">
                        <div className="w-[500px] h-[300px] bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-600/30 rounded-full blur-3xl animate-pulse-glow" />
                    </div>

                    {/* Scattered Text Animation */}
                    <div className="mb-8">
                        {/* Campus */}
                        <div className="flex justify-center mb-2">
                            {campusText.split('').map((letter, i) => (
                                <span
                                    key={`campus-${i}`}
                                    className={`text-7xl md:text-8xl font-black bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 bg-clip-text text-transparent inline-block transition-all duration-1000 ease-out ${lettersAssembled ? 'opacity-100 translate-x-0 translate-y-0 rotate-0' : 'opacity-0'
                                        }`}
                                    style={{
                                        transitionDelay: `${i * 0.08}s`,
                                        transform: lettersAssembled ? 'translate(0, 0) rotate(0deg)' : `translate(${(Math.random() - 0.5) * 400}px, ${(Math.random() - 0.5) * 400}px) rotate(${(Math.random() - 0.5) * 720}deg)`
                                    }}
                                >
                                    {letter}
                                </span>
                            ))}
                        </div>

                        {/* Pulse */}
                        <div className="flex justify-center">
                            {pulseText.split('').map((letter, i) => (
                                <span
                                    key={`pulse-${i}`}
                                    className={`text-7xl md:text-8xl font-black bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 bg-clip-text text-transparent inline-block transition-all duration-1000 ease-out ${lettersAssembled ? 'opacity-100 translate-x-0 translate-y-0 rotate-0' : 'opacity-0'
                                        }`}
                                    style={{
                                        transitionDelay: `${(i + campusText.length) * 0.08}s`,
                                        transform: lettersAssembled ? 'translate(0, 0) rotate(0deg)' : `translate(${(Math.random() - 0.5) * 400}px, ${(Math.random() - 0.5) * 400}px) rotate(${(Math.random() - 0.5) * 720}deg)`
                                    }}
                                >
                                    {letter}
                                </span>
                            ))}
                        </div>

                        {/* Graduation Cap - Appears after text assembles */}
                        <div
                            className="absolute -top-12 left-1/2 -translate-x-1/2 transition-all duration-700 ease-out"
                            style={{
                                opacity: lettersAssembled ? 1 : 0,
                                transform: lettersAssembled ? 'translateX(-50%) translateY(0) scale(1)' : 'translateX(-50%) translateY(-50px) scale(0)',
                                transitionDelay: '0.8s'
                            }}
                        >
                            <svg className="w-20 h-20 animate-bounce-gentle" viewBox="0 0 100 100">
                                <defs>
                                    <linearGradient id="capGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#a855f7" />
                                    </linearGradient>
                                </defs>
                                <path d="M 20 50 L 50 35 L 80 50 L 50 65 Z" fill="url(#capGradient)" />
                                <ellipse cx="50" cy="50" rx="30" ry="8" fill="url(#capGradient)" opacity="0.7" />
                                <line x1="80" y1="50" x2="85" y2="70" stroke="#a855f7" strokeWidth="2" className="animate-swing" />
                                <circle cx="85" cy="70" r="3" fill="#a855f7" className="animate-swing" />
                            </svg>
                        </div>
                    </div>

                    {/* Tagline */}
                    <div
                        className="text-slate-300 text-xl mb-8 transition-all duration-700"
                        style={{
                            opacity: lettersAssembled ? 1 : 0,
                            transform: lettersAssembled ? 'translateY(0)' : 'translateY(20px)',
                            transitionDelay: '1s'
                        }}
                    >
                        The heartbeat of campus life
                    </div>

                    {/* Loading Section */}
                    <div
                        className="mt-8 text-center space-y-4 transition-all duration-700"
                        style={{
                            opacity: lettersAssembled ? 1 : 0,
                            transitionDelay: '1.2s'
                        }}
                    >
                        <div className="text-cyan-400 font-medium text-lg animate-pulse">
                            {progress < 100 ? 'Initializing...' : 'Ready!'}
                        </div>

                        {/* Progress Bar */}
                        <div className="w-72 h-2 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                            </div>
                        </div>

                        <div className="text-slate-400 text-sm font-mono">{progress}%</div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float-particle {
                    0%, 100% { 
                        transform: translateY(0) translateX(0) scale(1);
                        opacity: 0;
                    }
                    10% { opacity: 1; }
                    50% { 
                        transform: translateY(-100px) translateX(50px) scale(1.5);
                        opacity: 0.8;
                    }
                    90% { opacity: 1; }
                    100% { 
                        transform: translateY(-200px) translateX(0) scale(0.5);
                        opacity: 0;
                    }
                }

                @keyframes particle-explode {
                    0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(var(--tx), var(--ty)) scale(0);
                        opacity: 0;
                    }
                }

                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes spin-reverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }

                @keyframes pulse-glow {
                    0%, 100% { 
                        transform: scale(1);
                        opacity: 0.5;
                    }
                    50% { 
                        transform: scale(1.2);
                        opacity: 0.8;
                    }
                }

                @keyframes bounce-gentle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes swing {
                    0%, 100% { transform: rotate(-5deg); }
                    50% { transform: rotate(5deg); }
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .animate-float-particle {
                    animation: float-particle linear infinite;
                }

                .animate-particle-explode {
                    animation: particle-explode 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                .animate-spin-slow {
                    animation: spin-slow 20s linear infinite;
                }

                .animate-spin-reverse {
                    animation: spin-reverse 15s linear infinite;
                }

                .animate-pulse-glow {
                    animation: pulse-glow 3s ease-in-out infinite;
                }

                .animate-bounce-gentle {
                    animation: bounce-gentle 2s ease-in-out infinite;
                    animation-delay: 1.5s;
                }

                .animate-swing {
                    animation: swing 1.5s ease-in-out infinite;
                    transform-origin: top;
                }

                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
};

export default LoadingAnimation;
