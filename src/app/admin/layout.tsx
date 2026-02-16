'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import CommandPalette from '@/components/CommandPalette';

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
    const { data: session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    // Close notification dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Generate breadcrumbs
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs = pathSegments.map((segment, index) => {
        const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
        const label = segment.charAt(0).toUpperCase() + segment.slice(1);
        return { href, label };
    });

    const notifications = [
        { id: 1, text: 'Order baru #ORD-2602-005 perlu diproses', time: 'Baru saja', unread: true },
        { id: 2, text: 'Pembayaran diterima dari Bimbel Garuda', time: '10 menit lalu', unread: true },
        { id: 3, text: 'Server maintenance dijadwalkan nanti malam', time: '2 jam lalu', unread: false },
    ];

    return (
        <div className={`admin-layout ${collapsed ? 'collapsed' : ''}`}>
            <CommandPalette />

            {/* Mobile Header */}
            <div className="admin-mobile-header">
                <button className="admin-mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    ☰
                </button>
                <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>
                    Bimbel<span style={{ color: 'var(--accent)' }}>Pro</span>
                </div>
                <div className="admin-avatar-sm" style={{ width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                    {session?.user?.name?.charAt(0) || 'A'}
                </div>
            </div>

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
                <div className="admin-sidebar-header">
                    <div className="admin-sidebar-logo">
                        <span className="logo-icon">🚀</span>
                        {!collapsed && <span>Bimbel<span style={{ color: 'var(--accent)' }}>Pro</span></span>}
                    </div>
                    <button
                        className="sidebar-collapse-btn"
                        onClick={() => setCollapsed(!collapsed)}
                        title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {collapsed ? '→' : '←'}
                    </button>
                </div>

                <div className="admin-user-profile">
                    <div className="user-avatar">
                        {session?.user?.name?.charAt(0) || 'A'}
                    </div>
                    {!collapsed && (
                        <div className="user-info">
                            <div className="user-name">{session?.user?.name || 'Admin'}</div>
                            <div className="user-role">Super Admin</div>
                        </div>
                    )}
                </div>

                <ul className="admin-nav">
                    {navItems.map(item => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={pathname === item.href ? 'active' : ''}
                                onClick={() => setSidebarOpen(false)}
                                title={collapsed ? item.label : ''}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {!collapsed && <span className="nav-label">{item.label}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="admin-sidebar-footer">
                    <Link href="/" className="sidebar-footer-link" title={collapsed ? "Lihat Website" : ""}>
                        <span className="nav-icon">🏠</span>
                        {!collapsed && <span>Lihat Website</span>}
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="sidebar-footer-link logout"
                        title={collapsed ? "Logout" : ""}
                    >
                        <span className="nav-icon">🚪</span>
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-content">
                {/* Header */}
                <header className="admin-content-header">
                    <div>
                        <div className="breadcrumbs">
                            {breadcrumbs.map((crumb, index) => (
                                <span key={crumb.href} className="breadcrumb-item">
                                    {index > 0 && <span className="breadcrumb-separator"> / </span>}
                                    <Link href={crumb.href}>{crumb.label}</Link>
                                </span>
                            ))}
                        </div>
                        <h2 className="admin-page-title">
                            {navItems.find(i => i.href === pathname)?.label || 'Dashboard'}
                        </h2>
                    </div>
                    <div className="admin-header-actions" ref={notificationRef}>
                        <div style={{ position: 'relative' }}>
                            <button
                                className="btn btn-secondary btn-sm icon-only"
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{ position: 'relative' }}
                            >
                                🔔
                                <span className="notification-badge-dot"></span>
                            </button>

                            {showNotifications && (
                                <div className="notification-dropdown">
                                    <div className="notification-header">
                                        Notifikasi <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>2 Baru</span>
                                    </div>
                                    <div className="notification-list">
                                        {notifications.map(n => (
                                            <div key={n.id} className={`notification-item ${n.unread ? 'unread' : ''}`}>
                                                <div className="notification-content">
                                                    <p>{n.text}</p>
                                                    <div className="notification-time">{n.time}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="notification-footer" style={{ padding: '8px', textAlign: 'center', borderTop: '1px solid var(--border)', fontSize: '0.8rem' }}>
                                        <Link href="#" className="text-accent">Lihat Semua</Link>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button className="btn btn-secondary btn-sm icon-only" title="Settings (Ctrl+K)">⚙️</button>
                    </div>
                </header>

                <div className="admin-content-body animate-fadeIn">
                    {children}
                </div>
            </main>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="mobile-overlay"
                />
            )}

            <style jsx>{`
                .admin-layout {
                    display: flex;
                    min-height: 100vh;
                    background: var(--bg-primary);
                }

                .admin-sidebar {
                    width: 260px;
                    background: var(--bg-secondary);
                    border-right: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    z-index: 50;
                    transition: width 0.3s ease;
                }

                .admin-sidebar.collapsed {
                    width: 80px;
                }

                .admin-sidebar-header {
                    height: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 20px;
                    border-bottom: 1px solid var(--border);
                }

                .admin-sidebar.collapsed .admin-sidebar-header {
                    justify-content: center;
                    padding: 0;
                }
                
                .admin-sidebar.collapsed .admin-sidebar-logo {
                    display: none;
                }
                
                .admin-sidebar.collapsed .sidebar-collapse-btn {
                    display: flex;
                    margin: 0 auto;
                }

                .admin-sidebar-logo {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: white;
                }

                .sidebar-collapse-btn {
                    background: none;
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                    width: 24px;
                    height: 24px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 0.8rem;
                }
                
                .sidebar-collapse-btn:hover {
                    background: var(--bg-card);
                    color: white;
                }

                .admin-user-profile {
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border-bottom: 1px solid var(--border);
                }

                .admin-sidebar.collapsed .admin-user-profile {
                    justify-content: center;
                    padding: 20px 0;
                }

                .user-avatar {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, var(--accent), var(--accent-dark));
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    font-size: 1.1rem;
                    flex-shrink: 0;
                }

                .user-info {
                    overflow: hidden;
                }

                .user-name {
                    font-weight: 600;
                    font-size: 0.9rem;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }

                .user-role {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }

                .admin-nav {
                    flex: 1;
                    list-style: none;
                    padding: 16px 0;
                    overflow-y: auto;
                }

                .admin-nav a {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 20px;
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                    font-weight: 500;
                    border-left: 3px solid transparent;
                    transition: all 0.2s;
                    text-decoration: none;
                }

                .admin-sidebar.collapsed .admin-nav a {
                    justify-content: center;
                    padding: 16px 0;
                }

                .admin-nav a:hover {
                    background: rgba(255, 255, 255, 0.03);
                    color: var(--text-primary);
                }

                .admin-nav a.active {
                    background: rgba(249, 115, 22, 0.1);
                    color: var(--accent);
                    border-left-color: var(--accent);
                }

                .admin-sidebar.collapsed .admin-nav a.active {
                    border-left-color: transparent;
                    background: transparent;
                    color: var(--accent);
                    position: relative;
                }
                
                .admin-sidebar.collapsed .admin-nav a.active::after {
                    content: '';
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 4px;
                    height: 24px;
                    background: var(--accent);
                    border-top-left-radius: 4px;
                    border-bottom-left-radius: 4px;
                }

                .nav-icon {
                    font-size: 1.2rem;
                    min-width: 24px;
                    text-align: center;
                }

                .admin-sidebar-footer {
                    padding: 16px;
                    border-top: 1px solid var(--border);
                }

                .sidebar-footer-link {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px;
                    width: 100%;
                    border: none;
                    background: none;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    cursor: pointer;
                    border-radius: var(--radius-sm);
                    text-decoration: none;
                }

                .admin-sidebar.collapsed .sidebar-footer-link {
                    justify-content: center;
                }

                .sidebar-footer-link:hover {
                    background: var(--bg-card);
                    color: var(--text-primary);
                }

                .sidebar-footer-link.logout:hover {
                    background: var(--danger-bg);
                    color: var(--danger);
                }

                .admin-content {
                    flex: 1;
                    margin-left: 260px;
                    transition: margin-left 0.3s ease;
                    display: flex;
                    flex-direction: column;
                }

                .admin-layout.collapsed .admin-content {
                    margin-left: 80px;
                }

                .admin-content-header {
                    height: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 32px;
                    background: rgba(10, 14, 26, 0.8);
                    backdrop-filter: blur(10px);
                    position: sticky;
                    top: 0;
                    z-index: 40;
                    border-bottom: 1px solid var(--border);
                }

                .admin-page-title {
                    font-size: 1.2rem;
                    font-weight: 700;
                    margin: 0;
                }
                
                .admin-header-actions {
                    display: flex;
                    gap: 12px;
                }
                
                .btn.icon-only {
                    padding: 8px;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                .notification-badge-dot {
                    position: absolute;
                    top: 6px;
                    right: 6px;
                    width: 8px;
                    height: 8px;
                    background: var(--accent);
                    border-radius: 50%;
                    border: 1px solid var(--bg-card);
                }

                .admin-content-body {
                    padding: 32px;
                    flex: 1;
                }

                .admin-mobile-header {
                    display: none;
                    height: 60px;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 16px;
                    background: var(--bg-secondary);
                    border-bottom: 1px solid var(--border);
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 60;
                }

                .admin-mobile-toggle {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: var(--text-primary);
                    cursor: pointer;
                }

                .mobile-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 49;
                    backdrop-filter: blur(4px);
                }

                @media (max-width: 1024px) {
                    .admin-sidebar {
                        transform: translateX(-100%);
                        width: 260px !important;
                    }
                    
                    .admin-sidebar.open {
                        transform: translateX(0);
                    }

                    .admin-content {
                        margin-left: 0 !important;
                        padding-top: 60px;
                    }

                    .admin-mobile-header {
                        display: flex;
                    }

                    .admin-content-header {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}
