'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-inner">
                <Link href="/" className="navbar-logo">
                    <span className="logo-icon">🚀</span>
                    Bimbel<span style={{ color: 'var(--accent)' }}>Pro</span>
                </Link>

                <button className="navbar-mobile-btn" onClick={() => setMenuOpen(!menuOpen)}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    <li><a href="#features" onClick={() => setMenuOpen(false)}>Fitur</a></li>
                    <li><a href="#portfolio" onClick={() => setMenuOpen(false)}>Portfolio</a></li>
                    <li><a href="#pricing" onClick={() => setMenuOpen(false)}>Harga</a></li>
                    <li><Link href="/cek-order" onClick={() => setMenuOpen(false)}>Cek Order</Link></li>
                    <li>
                        <Link href="/order" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                            Pesan Sekarang
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}
