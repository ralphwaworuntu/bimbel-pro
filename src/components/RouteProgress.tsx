'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function RouteProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        const timeout = setTimeout(() => setIsLoading(false), 500); // Simulate loading duration
        return () => clearTimeout(timeout);
    }, [pathname, searchParams]);

    if (!isLoading) return null;

    return (
        <div className="route-progress-bar">
            <div className="route-progress-indicator"></div>
            <style jsx>{`
                .route-progress-bar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: transparent;
                    z-index: 9999;
                    pointer-events: none;
                }
                
                .route-progress-indicator {
                    height: 100%;
                    background: var(--accent);
                    width: 100%;
                    transform-origin: left;
                    animation: progress 1s ease-in-out infinite;
                    box-shadow: 0 0 10px var(--accent-glow);
                }

                @keyframes progress {
                    0% { transform: scaleX(0); }
                    50% { transform: scaleX(0.5); }
                    100% { transform: scaleX(1); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
