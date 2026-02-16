'use client';

import React, { useState, useRef, ReactNode } from 'react';

interface SpotlightProps {
    children: ReactNode;
    className?: string;
    color?: string;
}

const Spotlight: React.FC<SpotlightProps> = ({
    children,
    className = '',
    color = 'rgba(255, 255, 255, 0.1)',
}) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;

        const rect = divRef.current.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const handleMouseEnter = () => setOpacity(1);
    const handleMouseLeave = () => setOpacity(0);

    return (
        <div
            ref={divRef}
            className={`spotlight-wrapper ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ position: 'relative', overflow: 'hidden' }}
        >
            <div
                className="spotlight-overlay"
                style={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    inset: 0,
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${color}, transparent 40%)`,
                    transition: 'opacity 0.3s',
                    zIndex: 10,
                }}
            />
            {children}
        </div>
    );
};

export default Spotlight;
