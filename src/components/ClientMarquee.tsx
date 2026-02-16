'use client';

export default function ClientMarquee() {
    const clients = [
        'Bimbel Garuda Jaya', 'Patriot Academy', 'Taruna Nusantara',
        'Prajurit Unggul', 'Cendekia Polri', 'Bimbel TNI AD',
        'Akademi Militer', 'Focus Kedinasan', 'Bimbel Presisi'
    ];

    return (
        <div className="marquee-container">
            <div className="marquee-content">
                {[...clients, ...clients, ...clients].map((client, i) => (
                    <div key={i} className="marquee-item">
                        <div className="client-logo-placeholder">
                            {client.charAt(0)}
                        </div>
                        <span className="client-name">{client}</span>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .marquee-container {
                    width: 100%;
                    overflow: hidden;
                    padding: 40px 0;
                    background: var(--bg-secondary);
                    position: relative;
                }

                .marquee-container::before,
                .marquee-container::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 100px;
                    z-index: 2;
                    pointer-events: none;
                }

                .marquee-container::before {
                    left: 0;
                    background: linear-gradient(to right, var(--bg-secondary), transparent);
                }

                .marquee-container::after {
                    right: 0;
                    background: linear-gradient(to left, var(--bg-secondary), transparent);
                }

                .marquee-content {
                    display: flex;
                    gap: 60px;
                    animation: scroll 40s linear infinite;
                    width: max-content;
                }

                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }

                .marquee-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    opacity: 0.6;
                    transition: opacity 0.3s;
                    cursor: default;
                }

                .marquee-item:hover {
                    opacity: 1;
                }

                .client-logo-placeholder {
                    width: 32px;
                    height: 32px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .client-name {
                    font-weight: 600;
                    font-size: 1.1rem;
                    white-space: nowrap;
                    color: var(--text-secondary);
                }
            `}</style>
        </div>
    );
}
