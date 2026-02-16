'use client';

import { useEffect } from 'react';

export default function ScrollAnimation() {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optional: remove observer after animation
                    // observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        const elements = document.querySelectorAll('.animate-fadeIn, .animate-fadeInUp, .animate-scaleIn');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return null;
}
