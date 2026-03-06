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
                        <div className="social-links" style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <a href="#" className="social-link animate-bounce-hover" aria-label="Instagram">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                            </a>
                            <a href="#" className="social-link animate-bounce-hover" aria-label="LinkedIn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                            </a>
                            <a href="#" className="social-link animate-bounce-hover" aria-label="Twitter">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                            </a>
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
