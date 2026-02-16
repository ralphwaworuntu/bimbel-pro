'use client';

import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="not-found-container">
            <div className="animation-container">
                <div className="astronaut">👨‍🚀</div>
                <div className="planet">🌍</div>
            </div>

            <h1>404</h1>
            <h2>Halaman Tidak Ditemukan</h2>
            <p>Maaf, halaman yang Anda cari mungkin telah dipindahkan atau tidak tersedia.</p>

            <div className="actions">
                <Link href="/" className="btn btn-primary">
                    Kembali ke Beranda
                </Link>
                <Link href="/cek-order" className="btn btn-secondary">
                    Cek Status Order
                </Link>
            </div>

            <style jsx>{`
                .not-found-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 24px;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    position: relative;
                    overflow: hidden;
                }

                .not-found-container::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);
                    background-size: 50px 50px;
                    opacity: 0.5;
                    pointer-events: none;
                }

                h1 {
                    font-size: 6rem;
                    font-weight: 800;
                    margin: 0;
                    background: linear-gradient(135deg, var(--accent), var(--purple));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    line-height: 1;
                }

                h2 {
                    font-size: 2rem;
                    margin-bottom: 16px;
                }

                p {
                    color: var(--text-secondary);
                    margin-bottom: 32px;
                    max-width: 500px;
                }

                .actions {
                    display: flex;
                    gap: 16px;
                    z-index: 10;
                }

                .animation-container {
                    position: relative;
                    height: 150px;
                    width: 300px;
                    margin-bottom: 20px;
                }

                .astronaut {
                    font-size: 4rem;
                    position: absolute;
                    left: 20%;
                    top: 20%;
                    animation: float 6s ease-in-out infinite;
                }

                .planet {
                    font-size: 3rem;
                    position: absolute;
                    right: 20%;
                    bottom: 20%;
                    opacity: 0.8;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(10deg); }
                }
            `}</style>
        </div>
    );
}
