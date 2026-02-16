'use client';

import { useEffect, useState } from 'react';

export default function Confetti() {
    const [isActive, setIsActive] = useState(true);
    const [particles, setParticles] = useState<any[]>([]);

    useEffect(() => {
        const colors = ['#f97316', '#8b5cf6', '#10b981', '#3b82f6', '#f59e0b'];
        const newParticles = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: -10,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 2 + 1,
            rotation: Math.random() * 360,
            delay: Math.random() * 2
        }));
        setParticles(newParticles);

        const timer = setTimeout(() => setIsActive(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    if (!isActive) return null;

    return (
        <div className="confetti-container">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="confetti-particle"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        backgroundColor: p.color,
                        animation: `fall ${p.speed + 2}s linear ${p.delay}s forwards`,
                        transform: `rotate(${p.rotation}deg)`
                    }}
                />
            ))}
            <style jsx>{`
                .confetti-container {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: 9999;
                    overflow: hidden;
                }
                .confetti-particle {
                    position: absolute;
                    border-radius: 4px;
                }
                @keyframes fall {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
