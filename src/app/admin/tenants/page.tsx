'use client';

import { useState, useEffect } from 'react';
import Pagination from '@/components/Pagination';

interface TenantData {
    id: string;
    subdomain: string;
    domain: string;
    brandName: string;
    ownerName: string;
    contactInfo: string;
    logoUrl: string;
    config: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    order?: {
        id: string;
        orderNumber: string;
        clientName: string;
        brandName: string;
        email: string;
        phone: string;
        status: string;
        package?: {
            id: string;
            name: string;
            tier: string;
            price: number;
        };
    };
}

function formatRp(n: number) {
    return new Intl.NumberFormat('id-ID').format(n);
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
}

function getContactInfo(contactStr: string): { email?: string; phone?: string } {
    try {
        return JSON.parse(contactStr);
    } catch {
        return {};
    }
}

export default function AdminTenantsPage() {
    const [tenants, setTenants] = useState<TenantData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [page, setPage] = useState(1);
    const [detailTenant, setDetailTenant] = useState<TenantData | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ tenant: TenantData; type: 'toggle' } | null>(null);
    const [saving, setSaving] = useState(false);
    const itemsPerPage = 8;

    const fetchTenants = async () => {
        try {
            const res = await fetch('/api/tenants');
            if (res.ok) {
                const data = await res.json();
                setTenants(data);
            }
        } catch (err) {
            console.error('Failed to fetch tenants:', err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchTenants(); }, []);

    // --- Filters ---
    const filteredTenants = tenants.filter(t => {
        const matchSearch =
            t.brandName.toLowerCase().includes(search.toLowerCase()) ||
            t.subdomain.toLowerCase().includes(search.toLowerCase()) ||
            t.domain.toLowerCase().includes(search.toLowerCase()) ||
            t.ownerName.toLowerCase().includes(search.toLowerCase());
        const matchStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && t.isActive) ||
            (statusFilter === 'inactive' && !t.isActive);
        return matchSearch && matchStatus;
    });

    const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);
    const paginatedTenants = filteredTenants.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    // Reset page when filter changes
    useEffect(() => { setPage(1); }, [search, statusFilter]);

    // --- Toggle Active ---
    const handleToggleConfirm = async () => {
        if (!confirmAction) return;
        setSaving(true);
        try {
            await fetch(`/api/tenants/${confirmAction.tenant.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !confirmAction.tenant.isActive }),
            });
            setConfirmAction(null);
            fetchTenants();
        } catch (err) {
            console.error('Toggle failed:', err);
        }
        setSaving(false);
    };

    // --- Stats ---
    const activeCount = tenants.filter(t => t.isActive).length;
    const inactiveCount = tenants.filter(t => !t.isActive).length;

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <>
            {/* ──── HEADER ──── */}
            <div className="tn-page-header">
                <div>
                    <h1 className="tn-page-title">🌐 Website Klien (Tenants)</h1>
                    <p className="tn-page-subtitle">Kelola dan pantau semua website klien bimbel Anda</p>
                </div>
            </div>

            {/* ──── STATS BANNER ──── */}
            <div className="tn-stats-banner">
                <div className="tn-stat-item">
                    <div className="tn-stat-icon tn-stat-icon-total">📦</div>
                    <div className="tn-stat-data">
                        <span className="tn-stat-number">{tenants.length}</span>
                        <span className="tn-stat-label">Total Tenant</span>
                    </div>
                </div>
                <div className="tn-stat-divider"></div>
                <div className="tn-stat-item">
                    <div className="tn-stat-icon tn-stat-icon-active">✅</div>
                    <div className="tn-stat-data">
                        <span className="tn-stat-number">{activeCount}</span>
                        <span className="tn-stat-label">Aktif</span>
                    </div>
                </div>
                <div className="tn-stat-divider"></div>
                <div className="tn-stat-item">
                    <div className="tn-stat-icon tn-stat-icon-inactive">⏸️</div>
                    <div className="tn-stat-data">
                        <span className="tn-stat-number">{inactiveCount}</span>
                        <span className="tn-stat-label">Non-Aktif</span>
                    </div>
                </div>
            </div>

            {/* ──── TOOLBAR: Search + Filter + View ──── */}
            <div className="tn-toolbar">
                <div className="tn-toolbar-left">
                    <div className="tn-search-box">
                        <span className="tn-search-icon">🔍</span>
                        <input
                            type="text"
                            className="tn-search-input"
                            placeholder="Cari nama, subdomain, atau domain..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button className="tn-search-clear" onClick={() => setSearch('')}>✕</button>
                        )}
                    </div>
                    <div className="tn-filter-pills">
                        {(['all', 'active', 'inactive'] as const).map(f => (
                            <button
                                key={f}
                                className={`tn-pill ${statusFilter === f ? 'active' : ''}`}
                                onClick={() => setStatusFilter(f)}
                            >
                                {f === 'all' ? 'Semua' : f === 'active' ? '🟢 Aktif' : '🔴 Non-Aktif'}
                                <span className="tn-pill-count">
                                    {f === 'all' ? tenants.length : f === 'active' ? activeCount : inactiveCount}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="tn-view-toggle">
                    <button className={`tn-view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid View">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" /><rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>
                        <span>Grid</span>
                    </button>
                    <button className={`tn-view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List View">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="2.5" rx="1" /><rect x="1" y="6.75" width="14" height="2.5" rx="1" /><rect x="1" y="11.5" width="14" height="2.5" rx="1" /></svg>
                        <span>List</span>
                    </button>
                </div>
            </div>

            {/* ──── GRID VIEW ──── */}
            {viewMode === 'grid' && filteredTenants.length > 0 && (
                <div className="tn-grid">
                    {paginatedTenants.map(tenant => (
                        <div key={tenant.id} className={`tn-card ${!tenant.isActive ? 'tn-card-inactive' : ''}`}>
                            {/* Card Header */}
                            <div className="tn-card-top">
                                <div className="tn-card-avatar">
                                    {tenant.logoUrl ? (
                                        <img src={tenant.logoUrl} alt={tenant.brandName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                                    ) : (
                                        <span>🏫</span>
                                    )}
                                </div>
                                <div className="tn-card-badges">
                                    {tenant.order?.package && (
                                        <span className={`tn-badge tn-badge-tier-${tenant.order.package.tier}`}>
                                            {tenant.order.package.name}
                                        </span>
                                    )}
                                    <span className={`tn-badge ${tenant.isActive ? 'tn-badge-active' : 'tn-badge-off'}`}>
                                        {tenant.isActive ? 'AKTIF' : 'OFF'}
                                    </span>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="tn-card-body">
                                <h3 className="tn-card-brand">{tenant.brandName}</h3>
                                <a
                                    href={tenant.domain ? `https://${tenant.domain}` : `https://${tenant.subdomain}.bimbelpro.com`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="tn-card-domain"
                                >
                                    {tenant.domain || `${tenant.subdomain}.bimbelpro.com`} ↗
                                </a>

                                <div className="tn-card-meta">
                                    <div className="tn-meta-row">
                                        <span className="tn-meta-icon">👤</span>
                                        <span>{tenant.ownerName}</span>
                                    </div>
                                    {tenant.order?.package && (
                                        <div className="tn-meta-row">
                                            <span className="tn-meta-icon">💰</span>
                                            <span>Rp {formatRp(tenant.order.package.price)}</span>
                                        </div>
                                    )}
                                    <div className="tn-meta-row">
                                        <span className="tn-meta-icon">📅</span>
                                        <span>{formatDate(tenant.createdAt)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Actions */}
                            <div className="tn-card-actions">
                                <button
                                    className={`tn-toggle-btn ${tenant.isActive ? 'tn-toggle-on' : 'tn-toggle-off'}`}
                                    onClick={() => setConfirmAction({ tenant, type: 'toggle' })}
                                >
                                    <span className={`tn-dot ${tenant.isActive ? 'on' : 'off'}`}></span>
                                    {tenant.isActive ? 'Aktif' : 'Non-Aktif'}
                                </button>
                                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => setDetailTenant(tenant)}>
                                    Detail
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ──── LIST VIEW ──── */}
            {viewMode === 'list' && filteredTenants.length > 0 && (
                <div className="tn-list">
                    <div className="tn-list-header">
                        <span>Website</span>
                        <span>Owner</span>
                        <span>Paket</span>
                        <span>Status</span>
                        <span>Aksi</span>
                    </div>
                    {paginatedTenants.map(tenant => (
                        <div key={tenant.id} className={`tn-list-row ${!tenant.isActive ? 'tn-list-row-inactive' : ''}`}>
                            <div className="tn-list-site">
                                <div className="tn-list-avatar">
                                    {tenant.logoUrl ? (
                                        <img src={tenant.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                    ) : '🏫'}
                                </div>
                                <div>
                                    <div className="tn-list-brand">{tenant.brandName}</div>
                                    <a
                                        href={tenant.domain ? `https://${tenant.domain}` : `https://${tenant.subdomain}.bimbelpro.com`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="tn-list-domain"
                                    >
                                        {tenant.domain || `${tenant.subdomain}.bimbelpro.com`}
                                    </a>
                                </div>
                            </div>
                            <div className="tn-list-owner">{tenant.ownerName}</div>
                            <div className="tn-list-package">
                                {tenant.order?.package ? (
                                    <span className={`tn-badge tn-badge-tier-${tenant.order.package.tier}`}>
                                        {tenant.order.package.name}
                                    </span>
                                ) : (
                                    <span className="tn-badge tn-badge-off">-</span>
                                )}
                            </div>
                            <div>
                                <span className={`tn-badge ${tenant.isActive ? 'tn-badge-active' : 'tn-badge-off'}`}>
                                    {tenant.isActive ? 'AKTIF' : 'OFF'}
                                </span>
                            </div>
                            <div className="tn-list-actions">
                                <button
                                    className={`tn-mini-toggle ${tenant.isActive ? 'on' : 'off'}`}
                                    onClick={() => setConfirmAction({ tenant, type: 'toggle' })}
                                    title={tenant.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                >
                                    {tenant.isActive ? '✅' : '⏸️'}
                                </button>
                                <button
                                    className="tn-mini-toggle neutral"
                                    onClick={() => setDetailTenant(tenant)}
                                    title="Detail"
                                >
                                    👁️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ──── EMPTY STATE ──── */}
            {filteredTenants.length === 0 && (
                <div className="tn-empty">
                    <div className="tn-empty-icon">🌐</div>
                    <h3>{tenants.length === 0 ? 'Belum Ada Tenant' : 'Tidak Ditemukan'}</h3>
                    <p>{tenants.length === 0
                        ? 'Tenant akan muncul secara otomatis saat order website klien disetujui dan diaktifkan.'
                        : 'Coba ubah kata kunci pencarian atau filter status Anda.'
                    }</p>
                </div>
            )}

            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

            {/* ──── CONFIRM TOGGLE MODAL ──── */}
            {confirmAction && (
                <div className="tn-overlay" onClick={() => setConfirmAction(null)}>
                    <div className="tn-modal" onClick={e => e.stopPropagation()}>
                        <div className="tn-modal-icon">
                            {confirmAction.tenant.isActive ? '⏸️' : '✅'}
                        </div>
                        <h3 className="tn-modal-title">
                            {confirmAction.tenant.isActive ? 'Nonaktifkan' : 'Aktifkan'} Website?
                        </h3>
                        <p className="tn-modal-desc">
                            Website <strong>{confirmAction.tenant.brandName}</strong> ({confirmAction.tenant.subdomain}.bimbelpro.com)
                            {confirmAction.tenant.isActive
                                ? ' akan dinonaktifkan dan tidak bisa diakses oleh publik.'
                                : ' akan diaktifkan kembali dan bisa diakses oleh publik.'}
                        </p>
                        <div className="tn-modal-actions">
                            <button className="btn btn-secondary" onClick={() => setConfirmAction(null)}>Batal</button>
                            <button
                                className={`btn ${confirmAction.tenant.isActive ? 'btn-danger' : 'btn-primary'}`}
                                onClick={handleToggleConfirm}
                                disabled={saving}
                            >
                                {saving ? 'Memproses...' : confirmAction.tenant.isActive ? '⏸️ Nonaktifkan' : '✅ Aktifkan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ──── DETAIL MODAL ──── */}
            {detailTenant && (
                <div className="tn-overlay" onClick={() => setDetailTenant(null)}>
                    <div className="tn-modal tn-modal-wide" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div className="tn-detail-avatar">
                                    {detailTenant.logoUrl ? (
                                        <img src={detailTenant.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }} />
                                    ) : '🏫'}
                                </div>
                                <div>
                                    <h3 className="tn-modal-title" style={{ textAlign: 'left', marginBottom: '4px' }}>{detailTenant.brandName}</h3>
                                    <span className={`tn-badge ${detailTenant.isActive ? 'tn-badge-active' : 'tn-badge-off'}`}>
                                        {detailTenant.isActive ? 'AKTIF' : 'NON-AKTIF'}
                                    </span>
                                </div>
                            </div>
                            <button className="tn-close-btn" onClick={() => setDetailTenant(null)}>✕</button>
                        </div>

                        {/* Info Grid */}
                        <div className="tn-detail-grid">
                            <div className="tn-detail-section">
                                <h4 className="tn-detail-heading">Informasi Website</h4>
                                <div className="tn-detail-rows">
                                    <div className="tn-detail-row">
                                        <span className="tn-detail-label">Subdomain</span>
                                        <span className="tn-detail-value">
                                            <a href={`https://${detailTenant.subdomain}.bimbelpro.com`} target="_blank" rel="noopener noreferrer" className="tn-link">
                                                {detailTenant.subdomain}.bimbelpro.com ↗
                                            </a>
                                        </span>
                                    </div>
                                    {detailTenant.domain && (
                                        <div className="tn-detail-row">
                                            <span className="tn-detail-label">Custom Domain</span>
                                            <span className="tn-detail-value">
                                                <a href={`https://${detailTenant.domain}`} target="_blank" rel="noopener noreferrer" className="tn-link">
                                                    {detailTenant.domain} ↗
                                                </a>
                                            </span>
                                        </div>
                                    )}
                                    <div className="tn-detail-row">
                                        <span className="tn-detail-label">Dibuat</span>
                                        <span className="tn-detail-value">{formatDate(detailTenant.createdAt)}</span>
                                    </div>
                                    <div className="tn-detail-row">
                                        <span className="tn-detail-label">Terakhir Diubah</span>
                                        <span className="tn-detail-value">{formatDate(detailTenant.updatedAt)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="tn-detail-section">
                                <h4 className="tn-detail-heading">Pemilik</h4>
                                <div className="tn-detail-rows">
                                    <div className="tn-detail-row">
                                        <span className="tn-detail-label">Nama</span>
                                        <span className="tn-detail-value">{detailTenant.ownerName}</span>
                                    </div>
                                    {detailTenant.order?.email && (
                                        <div className="tn-detail-row">
                                            <span className="tn-detail-label">Email</span>
                                            <span className="tn-detail-value">{detailTenant.order.email}</span>
                                        </div>
                                    )}
                                    {detailTenant.order?.phone && (
                                        <div className="tn-detail-row">
                                            <span className="tn-detail-label">Telepon</span>
                                            <span className="tn-detail-value">{detailTenant.order.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Info */}
                        {detailTenant.order && (
                            <div className="tn-detail-section" style={{ marginTop: '16px' }}>
                                <h4 className="tn-detail-heading">Informasi Order</h4>
                                <div className="tn-detail-rows">
                                    <div className="tn-detail-row">
                                        <span className="tn-detail-label">No. Order</span>
                                        <span className="tn-detail-value" style={{ fontFamily: 'monospace' }}>{detailTenant.order.orderNumber}</span>
                                    </div>
                                    <div className="tn-detail-row">
                                        <span className="tn-detail-label">Status Order</span>
                                        <span className="tn-detail-value">
                                            <span className={`tn-badge ${detailTenant.order.status === 'active' ? 'tn-badge-active' :
                                                detailTenant.order.status === 'processing' ? 'tn-badge-processing' :
                                                    detailTenant.order.status === 'pending' ? 'tn-badge-pending' : 'tn-badge-off'
                                                }`}>
                                                {detailTenant.order.status}
                                            </span>
                                        </span>
                                    </div>
                                    {detailTenant.order.package && (
                                        <>
                                            <div className="tn-detail-row">
                                                <span className="tn-detail-label">Paket</span>
                                                <span className="tn-detail-value">{detailTenant.order.package.name} ({detailTenant.order.package.tier})</span>
                                            </div>
                                            <div className="tn-detail-row">
                                                <span className="tn-detail-label">Harga</span>
                                                <span className="tn-detail-value" style={{ fontWeight: 700, color: 'var(--accent)' }}>Rp {formatRp(detailTenant.order.package.price)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Modal Footer */}
                        <div className="tn-modal-footer">
                            <button
                                className={`btn ${detailTenant.isActive ? 'btn-danger' : 'btn-primary'}`}
                                style={{ flex: 1 }}
                                onClick={() => {
                                    const t = detailTenant;
                                    setDetailTenant(null);
                                    setConfirmAction({ tenant: t, type: 'toggle' });
                                }}
                            >
                                {detailTenant.isActive ? '⏸️ Nonaktifkan Website' : '✅ Aktifkan Website'}
                            </button>
                            <a
                                href={detailTenant.domain ? `https://${detailTenant.domain}` : `https://${detailTenant.subdomain}.bimbelpro.com`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                                style={{ flex: 1, textAlign: 'center' }}
                            >
                                🌐 Buka Website
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════ STYLES ══════════ */}
            <style jsx>{`
                /* ──── Page Header ──── */
                .tn-page-header {
                    margin-bottom: 24px;
                }
                .tn-page-title {
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin: 0 0 4px;
                    color: var(--text-primary);
                }
                .tn-page-subtitle {
                    font-size: 0.88rem;
                    color: var(--text-muted);
                    margin: 0;
                }

                /* ──── Stats Banner ──── */
                .tn-stats-banner {
                    display: flex;
                    align-items: center;
                    background: linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(59,130,246,0.06) 100%);
                    border: 1px solid rgba(249,115,22,0.15);
                    border-radius: 16px;
                    padding: 20px 28px;
                    margin-bottom: 24px;
                }
                .tn-stat-item {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    flex: 1;
                    justify-content: center;
                }
                .tn-stat-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    flex-shrink: 0;
                }
                .tn-stat-icon-total { background: rgba(99,102,241,0.12); }
                .tn-stat-icon-active { background: rgba(16,185,129,0.12); }
                .tn-stat-icon-inactive { background: rgba(156,163,175,0.12); }
                .tn-stat-data { display: flex; flex-direction: column; }
                .tn-stat-number { font-size: 1.5rem; font-weight: 800; line-height: 1.1; color: var(--text-primary); }
                .tn-stat-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; margin-top: 2px; }
                .tn-stat-divider { width: 1px; height: 40px; background: var(--border); margin: 0 8px; }

                /* ──── Toolbar ──── */
                .tn-toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }
                .tn-toolbar-left {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                    flex: 1;
                    flex-wrap: wrap;
                }
                .tn-search-box {
                    position: relative;
                    flex: 1;
                    min-width: 240px;
                    max-width: 400px;
                }
                .tn-search-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 0.9rem;
                    pointer-events: none;
                }
                .tn-search-input {
                    width: 100%;
                    padding: 10px 36px 10px 40px;
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    background: var(--bg-card);
                    color: var(--text-primary);
                    font-size: 0.88rem;
                    font-family: inherit;
                    transition: border-color 0.2s;
                }
                .tn-search-input:focus {
                    outline: none;
                    border-color: var(--accent);
                    box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
                }
                .tn-search-input::placeholder { color: var(--text-muted); }
                .tn-search-clear {
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    border: none;
                    background: var(--bg-secondary);
                    color: var(--text-muted);
                    font-size: 0.7rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: inherit;
                }
                .tn-search-clear:hover { background: rgba(239,68,68,0.1); color: var(--danger); }
                .tn-filter-pills { display: flex; gap: 6px; }
                .tn-pill {
                    padding: 7px 14px;
                    border-radius: 20px;
                    border: 1px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-family: inherit;
                    white-space: nowrap;
                }
                .tn-pill:hover { border-color: var(--accent); color: var(--text-primary); }
                .tn-pill.active {
                    background: var(--accent);
                    border-color: var(--accent);
                    color: white;
                }
                .tn-pill-count {
                    background: rgba(255,255,255,0.15);
                    padding: 1px 7px;
                    border-radius: 10px;
                    font-size: 0.7rem;
                    font-weight: 700;
                }
                .tn-pill:not(.active) .tn-pill-count {
                    background: var(--bg-secondary);
                }

                /* View Toggle */
                .tn-view-toggle {
                    display: flex;
                    gap: 0;
                    background: var(--bg-secondary);
                    border-radius: 10px;
                    padding: 3px;
                    border: 1px solid var(--border);
                }
                .tn-view-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 7px 14px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: var(--text-muted);
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: inherit;
                }
                .tn-view-btn.active {
                    background: var(--accent);
                    color: #fff;
                    box-shadow: 0 2px 8px rgba(249,115,22,0.25);
                }
                .tn-view-btn:not(.active):hover {
                    color: var(--text-primary);
                    background: rgba(255,255,255,0.05);
                }

                /* ──── Grid View ──── */
                .tn-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 16px;
                }
                .tn-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.2s;
                }
                .tn-card:hover { border-color: rgba(249,115,22,0.25); box-shadow: 0 4px 24px rgba(0,0,0,0.12); }
                .tn-card-inactive { opacity: 0.55; }
                .tn-card-inactive:hover { opacity: 0.8; }
                .tn-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
                .tn-card-avatar {
                    width: 48px; height: 48px;
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.5rem; flex-shrink: 0;
                }
                .tn-card-badges { display: flex; gap: 5px; flex-wrap: wrap; }

                /* Badges */
                .tn-badge {
                    font-size: 0.6rem;
                    padding: 3px 9px;
                    border-radius: 20px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }
                .tn-badge-active { background: rgba(16,185,129,0.12); color: #10b981; }
                .tn-badge-off { background: rgba(156,163,175,0.12); color: var(--text-muted); }
                .tn-badge-pending { background: rgba(234,179,8,0.12); color: #eab308; }
                .tn-badge-processing { background: rgba(59,130,246,0.12); color: #3b82f6; }
                .tn-badge-tier-basic { background: rgba(156,163,175,0.12); color: #9ca3af; }
                .tn-badge-tier-pro { background: rgba(59,130,246,0.12); color: #60a5fa; }
                .tn-badge-tier-premium { background: rgba(249,115,22,0.12); color: #f97316; }

                /* Card Body */
                .tn-card-body { flex: 1; margin-bottom: 14px; }
                .tn-card-brand { font-size: 1.1rem; font-weight: 700; margin: 0 0 4px; color: var(--text-primary); }
                .tn-card-domain {
                    display: inline-block;
                    font-size: 0.82rem;
                    color: var(--accent);
                    text-decoration: none;
                    margin-bottom: 14px;
                    transition: color 0.2s;
                }
                .tn-card-domain:hover { text-decoration: underline; }
                .tn-card-meta { display: flex; flex-direction: column; gap: 6px; }
                .tn-meta-row { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--text-secondary); }
                .tn-meta-icon { font-size: 0.85rem; min-width: 18px; }

                /* Card Actions */
                .tn-card-actions { display: flex; gap: 8px; align-items: center; }
                .tn-toggle-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 9px 14px;
                    border-radius: 8px;
                    border: 1.5px solid;
                    cursor: pointer;
                    font-family: inherit;
                    font-size: 0.8rem;
                    font-weight: 600;
                    transition: all 0.2s;
                    background: transparent;
                    white-space: nowrap;
                }
                .tn-toggle-on { border-color: rgba(16,185,129,0.25); background: rgba(16,185,129,0.05); color: #10b981; }
                .tn-toggle-on:hover { border-color: rgba(16,185,129,0.45); background: rgba(16,185,129,0.1); }
                .tn-toggle-off { border-color: var(--border); background: var(--bg-secondary); color: var(--text-muted); }
                .tn-toggle-off:hover { border-color: rgba(249,115,22,0.3); color: var(--text-secondary); }
                .tn-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
                .tn-dot.on { background: #10b981; box-shadow: 0 0 6px rgba(16,185,129,0.5); }
                .tn-dot.off { background: var(--text-muted); }

                /* ──── List View ──── */
                .tn-list {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    overflow: hidden;
                }
                .tn-list-header {
                    display: grid;
                    grid-template-columns: 2fr 1fr 100px 80px 100px;
                    padding: 12px 20px;
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 1px solid var(--border);
                    background: var(--bg-secondary);
                }
                .tn-list-row {
                    display: grid;
                    grid-template-columns: 2fr 1fr 100px 80px 100px;
                    align-items: center;
                    padding: 14px 20px;
                    gap: 12px;
                    border-bottom: 1px solid var(--border);
                    transition: background 0.15s;
                }
                .tn-list-row:last-child { border-bottom: none; }
                .tn-list-row:hover { background: rgba(249,115,22,0.03); }
                .tn-list-row-inactive { opacity: 0.45; }
                .tn-list-row-inactive:hover { opacity: 0.65; }
                .tn-list-site { display: flex; align-items: center; gap: 12px; }
                .tn-list-avatar {
                    width: 36px; height: 36px;
                    background: var(--bg-secondary);
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1rem; flex-shrink: 0;
                }
                .tn-list-brand { font-weight: 600; font-size: 0.9rem; color: var(--text-primary); }
                .tn-list-domain {
                    font-size: 0.75rem;
                    color: var(--accent);
                    text-decoration: none;
                    display: block;
                    margin-top: 2px;
                }
                .tn-list-domain:hover { text-decoration: underline; }
                .tn-list-owner { font-size: 0.85rem; color: var(--text-secondary); }
                .tn-list-actions { display: flex; gap: 6px; }
                .tn-mini-toggle {
                    width: 32px; height: 32px;
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    border: 1.5px solid;
                    cursor: pointer;
                    font-size: 0.8rem;
                    transition: all 0.2s;
                    background: transparent;
                    font-family: inherit;
                }
                .tn-mini-toggle.on { border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.06); }
                .tn-mini-toggle.on:hover { background: rgba(16,185,129,0.15); }
                .tn-mini-toggle.off { border-color: var(--border); background: var(--bg-secondary); }
                .tn-mini-toggle.off:hover { border-color: rgba(249,115,22,0.3); }
                .tn-mini-toggle.neutral { border-color: var(--border); background: var(--bg-secondary); }
                .tn-mini-toggle.neutral:hover { border-color: rgba(59,130,246,0.3); background: rgba(59,130,246,0.06); }

                /* ──── Empty State ──── */
                .tn-empty {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    text-align: center;
                    padding: 60px 20px;
                }
                .tn-empty-icon { font-size: 3rem; margin-bottom: 16px; }
                .tn-empty h3 { margin: 0 0 8px; font-size: 1.1rem; }
                .tn-empty p { color: var(--text-muted); margin: 0; font-size: 0.9rem; max-width: 400px; margin: 0 auto; line-height: 1.5; }

                /* ──── Modals ──── */
                .tn-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(4px);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    animation: tnFadeIn 0.2s ease;
                }
                .tn-modal {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    padding: 32px;
                    max-width: 420px;
                    width: 100%;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                    animation: tnSlideUp 0.3s ease;
                }
                .tn-modal-wide { max-width: 600px; text-align: left; }
                .tn-modal-icon { font-size: 2.5rem; margin-bottom: 16px; }
                .tn-modal-title { font-size: 1.15rem; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); }
                .tn-modal-desc { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 24px; line-height: 1.5; }
                .tn-modal-actions { display: flex; gap: 12px; justify-content: center; }
                .tn-modal-actions .btn { min-width: 120px; }
                .tn-modal-footer { display: flex; gap: 12px; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border); }
                .tn-close-btn {
                    width: 36px; height: 36px;
                    border-radius: 10px;
                    border: 1px solid var(--border);
                    background: var(--bg-secondary);
                    color: var(--text-muted);
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                    font-family: inherit;
                }
                .tn-close-btn:hover { background: rgba(239,68,68,0.1); color: var(--danger); border-color: rgba(239,68,68,0.3); }

                /* Detail Modal */
                .tn-detail-avatar {
                    width: 56px; height: 56px;
                    background: var(--bg-secondary);
                    border-radius: 14px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.8rem; flex-shrink: 0;
                }
                .tn-detail-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                .tn-detail-section {
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    padding: 16px;
                }
                .tn-detail-heading {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin: 0 0 12px;
                }
                .tn-detail-rows { display: flex; flex-direction: column; gap: 10px; }
                .tn-detail-row { display: flex; justify-content: space-between; align-items: center; }
                .tn-detail-label { font-size: 0.82rem; color: var(--text-muted); }
                .tn-detail-value { font-size: 0.82rem; font-weight: 600; color: var(--text-primary); text-align: right; }
                .tn-link { color: var(--accent); text-decoration: none; font-weight: 600; }
                .tn-link:hover { text-decoration: underline; }

                @keyframes tnFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes tnSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

                /* ──── Responsive ──── */
                @media (max-width: 900px) {
                    .tn-stats-banner { flex-wrap: wrap; gap: 12px; }
                    .tn-stat-divider { display: none; }
                    .tn-stat-item { flex-basis: 45%; justify-content: flex-start; }
                    .tn-grid { grid-template-columns: 1fr; }
                    .tn-list-header { display: none; }
                    .tn-list-row { grid-template-columns: 1fr; gap: 8px; }
                    .tn-detail-grid { grid-template-columns: 1fr; }
                    .tn-modal-footer { flex-direction: column; }
                }
                @media (max-width: 640px) {
                    .tn-toolbar { flex-direction: column; align-items: stretch; }
                    .tn-toolbar-left { flex-direction: column; }
                    .tn-search-box { max-width: none; }
                    .tn-filter-pills { overflow-x: auto; }
                    .tn-stats-banner { padding: 16px; }
                    .tn-stat-item { flex-basis: 100%; }
                }
            `}</style>
        </>
    );
}
