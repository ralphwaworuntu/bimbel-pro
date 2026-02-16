'use client';

import Link from 'next/link';

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="footer" style={{ position: 'relative' }}>
            <div className="footer-gradient-top"></div>
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <Link href="/" className="footer-logo">
                            <span className="logo-icon">🚀</span>
                            Bimbel<span style={{ color: 'var(--accent)' }}>Pro</span>
                        </Link>
                        <p className="footer-desc">
                            Platform pembuatan website bimbel white-label #1 untuk TNI & POLRI.
                            Solusi lengkap, cepat, dan profesional.
                        </p>
                        <div className="social-links">
                            <a href="#" className="social-link animate-bounce-hover">📸 Instagram</a>
                            <a href="#" className="social-link animate-bounce-hover">👔 LinkedIn</a>
                            <a href="#" className="social-link animate-bounce-hover">🐦 Twitter</a>
                        </div>
                    </div>

                    <div className="footer-links">
                        <h4>Produk</h4>
                        <ul>
                            <li><a href="#features">Fitur</a></li>
                            <li><a href="#portfolio">Portfolio</a></li>
                            <li><a href="#pricing">Harga</a></li>
                            <li><Link href="/cek-order">Cek Order</Link></li>
                        </ul>
                    </div>

                    <div className="footer-links">
                        <h4>Berlangganan</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                            Dapatkan info promo dan fitur terbaru.
                        </p>
                        <div className="newsletter-form" style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="email"
                                placeholder="Email Anda..."
                                className="form-input"
                                style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                            />
                            <button className="btn btn-primary btn-sm">Join</button>
                        </div>
                    </div>

                    <div className="footer-links">
                        <h4>Legal</h4>
                        <ul>
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} Bimbel Pro. All rights reserved.</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <p className="footer-made-with">
                            Dibuat dengan <span style={{ color: 'var(--danger)' }}>❤</span> untuk Pendidikan Indonesia
                        </p>
                        <button
                            onClick={scrollToTop}
                            className="back-to-top"
                            aria-label="Back to top"
                        >
                            ⬆️
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .back-to-top {
                    background: var(--bg-hover);
                    border: 1px solid var(--border);
                    color: var(--text-primary);
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                }
                .back-to-top:hover {
                    background: var(--accent);
                    color: white;
                    transform: translateY(-3px);
                }
                .animate-bounce-hover:hover {
                    animation: bounce 0.5s;
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
            `}</style>
        </footer>
    );
}
