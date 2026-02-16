'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [activeSection, setActiveSection] = useState('');
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);

            // Calculate scroll progress
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            setScrollProgress(scrolled);

            // Active section detection
            const sections = ['features', 'portfolio', 'pricing'];
            let current = '';
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element && window.scrollY >= (element.offsetTop - 150)) {
                    current = section;
                }
            }
            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path: string) => pathname === path;
    const isSectionActive = (section: string) => activeSection === section;

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`}>
            <div className="navbar-inner">
                <Link href="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
                    <span className="logo-icon">🚀</span>
                    Bimbel<span style={{ color: 'var(--accent)' }}>Pro</span>
                </Link>

                <button
                    className={`navbar-mobile-btn ${menuOpen ? 'active' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    <li>
                        <a
                            href="/#features"
                            className={isSectionActive('features') ? 'active' : ''}
                            onClick={() => setMenuOpen(false)}
                        >
                            Fitur
                        </a>
                    </li>
                    <li>
                        <a
                            href="/#portfolio"
                            className={isSectionActive('portfolio') ? 'active' : ''}
                            onClick={() => setMenuOpen(false)}
                        >
                            Portfolio
                        </a>
                    </li>
                    <li>
                        <a
                            href="/#pricing"
                            className={isSectionActive('pricing') ? 'active' : ''}
                            onClick={() => setMenuOpen(false)}
                        >
                            Harga
                        </a>
                    </li>
                    <li>
                        <Link
                            href="/cek-order"
                            className={isActive('/cek-order') ? 'active' : ''}
                            onClick={() => setMenuOpen(false)}
                        >
                            Cek Order
                        </Link>
                    </li>
                    <li>
                        <ThemeToggle />
                    </li>
                    <li>
                        <Link
                            href="/order"
                            className="btn btn-primary btn-sm"
                            onClick={() => setMenuOpen(false)}
                        >
                            Pesan Sekarang
                        </Link>
                    </li>
                </ul>
            </div>

            {/* Scroll Progress Bar */}
            <div className="scroll-progress-container">
                <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }}></div>
            </div>

            {/* Mobile Menu Backdrop */}
            {menuOpen && (
                <div
                    className="mobile-backdrop"
                    onClick={() => setMenuOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        top: '70px',
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 99,
                        backdropFilter: 'blur(4px)'
                    }}
                />
            )}

            <style jsx>{`
                .scroll-progress-container {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: transparent;
                    z-index: 1001;
                }
                .scroll-progress-bar {
                    height: 100%;
                    background: var(--accent);
                    transition: width 0.1s;
                    box-shadow: 0 0 10px var(--accent);
                }
                .navbar.scrolled {
                    padding: 0.8rem 0; /* Shrink effect */
                }
                .navbar-links a.active {
                    color: var(--accent);
                    font-weight: 600;
                }
            `}</style>
        </nav>
    );
}
