'use client';

import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
    start?: number;
    end: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
    label?: string;
    className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    start = 0,
    end,
    duration = 2000,
    suffix = '',
    prefix = '',
    label,
    className = '',
}) => {
    const [count, setCount] = useState(start);
    const elementRef = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    animateCount();
                }
            },
            { threshold: 0.2 }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [end, duration]);

    const animateCount = () => {
        let startTime: number | null = null;
        const startValue = start;
        const endValue = end;

        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Ease out quart
            const easeProgress = 1 - Math.pow(1 - progress, 4);

            const currentCount = Math.floor(startValue + (endValue - startValue) * easeProgress);
            setCount(currentCount);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    return (
        <div ref={elementRef} className={`animated-stat ${className}`} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1.2, marginBottom: '8px' }}>
                {prefix}{formatNumber(count)}{suffix}
            </div>
            {label && (
                <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {label}
                </div>
            )}
        </div>
    );
};

export default AnimatedCounter;
