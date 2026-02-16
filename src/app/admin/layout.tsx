'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/orders', label: 'Pesanan', icon: '📦' },
    { href: '/admin/tenants', label: 'Website Klien', icon: '🌐' },
    { href: '/admin/payments', label: 'Pembayaran', icon: '💳' },
    { href: '/admin/analytics', label: 'Analitik', icon: '📈' },
    { href: '/admin/domains', label: 'Domain & Harga', icon: '🔗' },
    { href: '/admin/gateway', label: 'Payment Gateway', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="admin-layout">
            {/* Mobile Header */}
            <div className="admin-mobile-header">
                <button className="admin-mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    ☰
                </button>
                <span style={{ fontWeight: 700 }}>Bimbel<span style={{ color: 'var(--accent)' }}>Pro</span></span>
                <div style={{ width: '24px' }}></div>
            </div>

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-logo">
                    <span className="logo-dot">🚀</span>
                    Bimbel<span style={{ color: 'var(--accent)' }}>Pro</span>
                </div>

                <ul className="admin-nav">
                    {navItems.map(item => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={pathname === item.href ? 'active' : ''}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        🏠 Lihat Website
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '0.9rem', color: 'var(--danger)', background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}
                    >
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-content">
                {children}
            </main>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 49 }}
                />
            )}
        </div>
    );
}
