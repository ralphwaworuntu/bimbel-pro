'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FloatingWhatsApp() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Hide on admin pages
        if (pathname?.startsWith('/admin')) {
            setIsVisible(false);
        } else {
            // Show after a slight delay
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [pathname]);

    if (!isVisible) return null;

    const phoneNumber = '6281234567890'; // Replace with actual number
    const message = 'Halo, saya tertarik dengan jasa pembuatan website bimbel.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="floating-wa"
            aria-label="Chat via WhatsApp"
        >
            <span className="wa-icon">💬</span>
            <span className="wa-tooltip">Butuh Bantuan?</span>

            <style jsx>{`
                .floating-wa {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    width: 60px;
                    height: 60px;
                    background: #25D366;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
                    z-index: 999;
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    cursor: pointer;
                    animation: wa-bounce 2s infinite;
                }

                .floating-wa:hover {
                    transform: scale(1.1);
                }

                .wa-icon {
                    font-size: 32px;
                    color: white;
                }

                .wa-tooltip {
                    position: absolute;
                    right: 70px;
                    background: white;
                    color: #333;
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    white-space: nowrap;
                    opacity: 0;
                    transform: translateX(10px);
                    transition: all 0.3s;
                    pointer-events: none;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }

                .floating-wa:hover .wa-tooltip {
                    opacity: 1;
                    transform: translateX(0);
                }

                @keyframes wa-bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
            `}</style>
        </a>
    );
}
