'use client';

import React, { useEffect, useRef, useState } from 'react';

type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface ScrollRevealProps {
    children: React.ReactNode;
    direction?: RevealDirection;
    delay?: number; // seconds
    duration?: number; // seconds
    distance?: string;
    threshold?: number;
    className?: string;
    once?: boolean;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
    children,
    direction = 'up',
    delay = 0,
    duration = 0.6,
    distance = '30px',
    threshold = 0.1,
    className = '',
    once = true,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasRevealed, setHasRevealed] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once) {
                        setHasRevealed(true);
                        observer.unobserve(element);
                    }
                } else {
                    if (!once) {
                        setIsVisible(false);
                    }
                }
            },
            { threshold }
        );

        observer.observe(element);

        return () => {
            if (element) observer.unobserve(element);
        };
    }, [once, threshold]);

    const getTransform = () => {
        if (isVisible || hasRevealed) return 'translate3d(0, 0, 0)';

        switch (direction) {
            case 'up': return `translate3d(0, ${distance}, 0)`;
            case 'down': return `translate3d(0, -${distance}, 0)`;
            case 'left': return `translate3d(${distance}, 0, 0)`;
            case 'right': return `translate3d(-${distance}, 0, 0)`;
            default: return 'translate3d(0, 0, 0)';
        }
    };

    const style: React.CSSProperties = {
        opacity: isVisible || hasRevealed ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}s cubic-bezier(0.5, 0, 0, 1), transform ${duration}s cubic-bezier(0.5, 0, 0, 1)`,
        transitionDelay: `${delay}s`,
        willChange: 'opacity, transform',
    };

    return (
        <div ref={ref} className={`scroll-reveal ${className}`} style={style}>
            {children}
        </div>
    );
};

export default ScrollReveal;
