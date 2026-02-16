'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ParallaxSectionProps {
    children: React.ReactNode;
    bgImage?: string;
    speed?: number; // 0.1 to 1.0 (slower to faster)
    className?: string;
    overlayColor?: string;
    overlayOpacity?: number;
}

const ParallaxSection: React.FC<ParallaxSectionProps> = ({
    children,
    bgImage,
    speed = 0.5,
    className = '',
    overlayColor = '#000',
    overlayOpacity = 0.5,
}) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current) return;
            const rect = sectionRef.current.getBoundingClientRect();
            const scrollStart = window.scrollY + rect.top;
            const scrollDistance = window.scrollY - scrollStart;

            // Only update if section is visible in viewport approx
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                setOffset(scrollDistance * speed);
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Initial calculation
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);

    return (
        <section
            ref={sectionRef}
            className={`parallax-section ${className}`}
            style={{ position: 'relative', overflow: 'hidden' }}
        >
            {bgImage && (
                <div
                    className="parallax-bg"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0, // Make it taller than container
                        height: '120%', // Extra height for parallax movement
                        transform: `translateY(${offset}px)`,
                        backgroundImage: `url(${bgImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        zIndex: 0,
                        pointerEvents: 'none',
                    }}
                />
            )}

            {/* Overlay */}
            <div
                className="parallax-overlay"
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: overlayColor,
                    opacity: overlayOpacity,
                    zIndex: 1,
                    pointerEvents: 'none',
                }}
            />

            {/* Content */}
            <div className="parallax-content" style={{ position: 'relative', zIndex: 2 }}>
                {children}
            </div>
        </section>
    );
};

export default ParallaxSection;
