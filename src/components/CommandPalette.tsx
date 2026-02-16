'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    const menuItems = [
        { label: 'Dashboard', href: '/admin', icon: '📊' },
        { label: 'Orders', href: '/admin/orders', icon: '📦' },
        { label: 'Buat Order Baru', href: '/admin/orders?new=true', icon: '➕' },
        { label: 'Website Klien (Tenants)', href: '/admin/tenants', icon: '🌐' },
        { label: 'Pembayaran', href: '/admin/payments', icon: '💰' },
        { label: 'Analitik', href: '/admin/analytics', icon: '📈' },
        { label: 'Payment Gateway', href: '/admin/gateway', icon: '⚙️' },
        { label: 'Kembali ke Beranda', href: '/', icon: '🏠' },
    ];

    const filteredItems = menuItems.filter(item =>
        item.label.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setSearch('');
            setActiveIndex(0);
        }
    }, [isOpen]);

    const handleSelect = (href: string) => {
        router.push(href);
        setIsOpen(false);
    };

    const handleNavigation = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev + 1) % filteredItems.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredItems[activeIndex]) {
                handleSelect(filteredItems[activeIndex].href);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="command-palette-overlay" onClick={() => setIsOpen(false)}>
            <div className="command-palette-modal" onClick={e => e.stopPropagation()}>
                <div className="command-palette-header">
                    <span style={{ fontSize: '1.2rem', marginRight: '12px' }}>🔍</span>
                    <input
                        ref={inputRef}
                        type="text"
                        className="command-palette-input"
                        placeholder="Cari menu atau perintah..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setActiveIndex(0); }}
                        onKeyDown={handleNavigation}
                    />
                    <div className="command-esc">ESC</div>
                </div>
                <div className="command-palette-body">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item, i) => (
                            <div
                                key={item.href}
                                className={`command-item ${i === activeIndex ? 'active' : ''}`}
                                onClick={() => handleSelect(item.href)}
                                onMouseEnter={() => setActiveIndex(i)}
                            >
                                <span className="command-icon">{item.icon}</span>
                                <span>{item.label}</span>
                                {i === activeIndex && <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.7 }}>↵</span>}
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Tidak ada hasil ditemukan.
                        </div>
                    )}
                </div>
                <div className="command-palette-footer">
                    Navigasi dengan ↑ ↓ dan Enter
                </div>
            </div>
        </div>
    );
}
