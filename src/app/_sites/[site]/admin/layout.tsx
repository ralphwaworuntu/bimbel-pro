'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';

// Tenant specific navigation items
const tenantNavItems = (subdomain: string) => [
    { href: `/_sites/${subdomain}/admin`, label: 'Dashboard', icon: '📊' },
    { href: `/_sites/${subdomain}/admin/students`, label: 'Siswa', icon: '👥' },
    { href: `/_sites/${subdomain}/admin/programs`, label: 'Program', icon: '📚' },
    { href: `/_sites/${subdomain}/admin/schedule`, label: 'Jadwal', icon: '📅' },
    { href: `/_sites/${subdomain}/admin/settings`, label: 'Pengaturan', icon: '⚙️' },
];

export default function TenantAdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const params = useParams();
    const subdomain = params.site as string;

    const { data: session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    // Generate breadcrumbs
    const pathSegments = pathname.split('/').filter(Boolean);
    // Remove _sites and subdomain from visual breadcrumbs for cleaner look
    const visualSegments = pathSegments.filter(s => s !== '_sites' && s !== subdomain);

    const breadcrumbs = visualSegments.map((segment, index) => {
        // Reconstruct actual path
        // This is a simplification; for deep nesting might need more logic
        const label = segment.charAt(0).toUpperCase() + segment.slice(1);
        return { label };
    });

    const navItems = tenantNavItems(subdomain);

    return (
        <div className={`admin-layout ${collapsed ? 'collapsed' : ''}`}>

            {/* Mobile Header */}
            <div className="admin-mobile-header">
                <button className="admin-mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    ☰
                </button>
                <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>
                    Tenant<span style={{ color: 'var(--accent)' }}>Admin</span>
                </div>
                <div className="admin-avatar-sm">
                    {session?.user?.name?.charAt(0) || 'T'}
                </div>
            </div>

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
                <div className="admin-sidebar-header">
                    <div className="admin-sidebar-logo">
                        <span className="logo-icon">🏫</span>
                        {!collapsed && <span>Tenant<span style={{ color: 'var(--accent)' }}>Panel</span></span>}
                    </div>
                    <button
                        className="sidebar-collapse-btn"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        {collapsed ? '→' : '←'}
                    </button>
                </div>

                <div className="admin-user-profile">
                    <div className="user-avatar">
                        {session?.user?.name?.charAt(0) || 'T'}
                    </div>
                    {!collapsed && (
                        <div className="user-info">
                            <div className="user-name">{session?.user?.name || 'Tenant Admin'}</div>
                            <div className="user-role">Administrator</div>
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
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {!collapsed && <span className="nav-label">{item.label}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="admin-sidebar-footer">
                    <Link href={`/_sites/${subdomain}`} className="sidebar-footer-link" target="_blank">
                        <span className="nav-icon">👁️</span>
                        {!collapsed && <span>Lihat Website</span>}
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="sidebar-footer-link logout"
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
                            <span className="breadcrumb-item">Admin</span>
                            {breadcrumbs.map((crumb, index) => (
                                <span key={index} className="breadcrumb-item">
                                    <span className="breadcrumb-separator"> / </span>
                                    {crumb.label}
                                </span>
                            ))}
                        </div>
                        <h2 className="admin-page-title">
                            {navItems.find(i => i.href === pathname)?.label || 'Dashboard'}
                        </h2>
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
                    color: var(--text-primary);
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
                    color: var(--text-primary);
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
                    color: var(--text-primary);
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
                
                .admin-avatar-sm {
                   width: 32px;
                   height: 32px;
                   background: var(--accent);
                   border-radius: 50%;
                   display: flex;
                   align-items: center;
                   justify-content: center;
                   color: white;
                   font-weight: 700;
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
                    background: rgba(255, 255, 255, 0.8);
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

                .admin-content-body {
                    padding: 32px;
                    flex: 1;
                    background: var(--bg-primary);
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
                    .admin-content-header {
                        display: none;
                    }
                }

                /* Breadcrumbs */
                .breadcrumbs {
                    display: flex;
                    align-items: center;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin-bottom: 4px;
                }

                .breadcrumb-item {
                    display: flex;
                    align-items: center;
                }

                .breadcrumb-item:last-child {
                    color: var(--text-primary);
                    font-weight: 500;
                }

                .breadcrumb-separator {
                    margin: 0 8px;
                    color: var(--text-muted);
                }
            `}</style>
        </div>
    );
}
