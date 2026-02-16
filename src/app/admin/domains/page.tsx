'use client';

import { useState, useEffect } from 'react';

interface DomainPrice {
    id: string;
    extension: string;
    label: string;
    description: string;
    price: number;
    promoPrice: number | null;
    promoActive: boolean;
    isActive: boolean;
    sortOrder: number;
}

function formatRp(n: number) {
    return new Intl.NumberFormat('id-ID').format(n);
}

export default function AdminDomainsPage() {
    const [domains, setDomains] = useState<DomainPrice[]>([]);
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<DomainPrice>>({});
    const [showAdd, setShowAdd] = useState(false);
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [confirmAction, setConfirmAction] = useState<{ id: string; type: 'promo' | 'status' | 'delete'; domain: DomainPrice } | null>(null);
    const [newDomain, setNewDomain] = useState({
        extension: '',
        label: '',
        description: '',
        price: '',
        promoPrice: '',
        promoActive: false,
    });

    const fetchDomains = async () => {
        try {
            const res = await fetch('/api/domains?all=true');
            setDomains(await res.json());
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchDomains(); }, []);

    const handleToggleWithConfirm = (d: DomainPrice, type: 'promo' | 'status') => {
        setConfirmAction({ id: d.id, type, domain: d });
    };

    const executeConfirmedAction = async () => {
        if (!confirmAction) return;
        const { domain, type } = confirmAction;
        if (type === 'promo') {
            await fetch(`/api/domains/${domain.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ promoActive: !domain.promoActive }),
            });
        } else if (type === 'status') {
            await fetch(`/api/domains/${domain.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !domain.isActive }),
            });
        } else if (type === 'delete') {
            await fetch(`/api/domains/${domain.id}`, { method: 'DELETE' });
        }
        setConfirmAction(null);
        fetchDomains();
    };

    const handleDelete = (d: DomainPrice) => {
        setConfirmAction({ id: d.id, type: 'delete', domain: d });
    };

    const startEdit = (d: DomainPrice) => {
        setEditId(d.id);
        setEditData({ price: d.price, promoPrice: d.promoPrice, label: d.label, description: d.description });
    };

    const saveEdit = async () => {
        if (!editId) return;
        setSaving(true);
        await fetch(`/api/domains/${editId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editData),
        });
        setEditId(null);
        setSaving(false);
        fetchDomains();
    };

    const handleAdd = async () => {
        if (!newDomain.extension || !newDomain.label || !newDomain.price) {
            alert('Extension, label, dan harga wajib diisi');
            return;
        }
        setSaving(true);
        const res = await fetch('/api/domains', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...newDomain,
                price: Number(newDomain.price),
                promoPrice: newDomain.promoPrice ? Number(newDomain.promoPrice) : null,
            }),
        });
        if (res.ok) {
            setShowAdd(false);
            setNewDomain({ extension: '', label: '', description: '', price: '', promoPrice: '', promoActive: false });
            fetchDomains();
        } else {
            const data = await res.json();
            alert(data.error || 'Gagal menambahkan domain');
        }
        setSaving(false);
    };

    if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

    const activeCount = domains.filter(d => d.isActive).length;
    const promoCount = domains.filter(d => d.promoActive).length;
    const inactiveCount = domains.filter(d => !d.isActive).length;

    return (
        <>
            {/* Page Header */}
            <div className="admin-header">
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h1 className="page-title">🌐 Domain & Harga</h1>
                    <p className="page-subtitle">Kelola harga dan promo ekstensi domain</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                    + Tambah Domain
                </button>
            </div>

            {/* ──── Stats Banner ──── */}
            <div className="dp-stats-banner">
                <div className="dp-stat-item">
                    <div className="dp-stat-icon dp-stat-icon-total">📦</div>
                    <div className="dp-stat-data">
                        <span className="dp-stat-number">{domains.length}</span>
                        <span className="dp-stat-label">Total Ekstensi</span>
                    </div>
                </div>
                <div className="dp-stat-divider"></div>
                <div className="dp-stat-item">
                    <div className="dp-stat-icon dp-stat-icon-active">✅</div>
                    <div className="dp-stat-data">
                        <span className="dp-stat-number">{activeCount}</span>
                        <span className="dp-stat-label">Aktif</span>
                    </div>
                </div>
                <div className="dp-stat-divider"></div>
                <div className="dp-stat-item">
                    <div className="dp-stat-icon dp-stat-icon-promo">🏷️</div>
                    <div className="dp-stat-data">
                        <span className="dp-stat-number">{promoCount}</span>
                        <span className="dp-stat-label">Promo Aktif</span>
                    </div>
                </div>
                <div className="dp-stat-divider"></div>
                <div className="dp-stat-item">
                    <div className="dp-stat-icon dp-stat-icon-inactive">⏸️</div>
                    <div className="dp-stat-data">
                        <span className="dp-stat-number">{inactiveCount}</span>
                        <span className="dp-stat-label">Non-Aktif</span>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {confirmAction && (
                <div className="dm-overlay" onClick={() => setConfirmAction(null)}>
                    <div className="dm-modal" onClick={e => e.stopPropagation()}>
                        <div className="dm-modal-icon">
                            {confirmAction.type === 'delete' ? '🗑️' : confirmAction.type === 'promo' ? '🏷️' : '⚡'}
                        </div>
                        <h3 className="dm-modal-title">
                            {confirmAction.type === 'delete'
                                ? `Hapus ${confirmAction.domain.extension}?`
                                : confirmAction.type === 'promo'
                                    ? `${confirmAction.domain.promoActive ? 'Nonaktifkan' : 'Aktifkan'} Promo ${confirmAction.domain.extension}?`
                                    : `${confirmAction.domain.isActive ? 'Nonaktifkan' : 'Aktifkan'} ${confirmAction.domain.extension}?`}
                        </h3>
                        <p className="dm-modal-desc">
                            {confirmAction.type === 'delete'
                                ? 'Ekstensi domain ini akan dihapus permanen dan tidak bisa dikembalikan.'
                                : confirmAction.type === 'promo'
                                    ? confirmAction.domain.promoActive
                                        ? 'Harga promo akan dinonaktifkan. Pelanggan akan melihat harga normal.'
                                        : `Harga promo Rp ${formatRp(confirmAction.domain.promoPrice || 0)}/tahun akan ditampilkan ke pelanggan.`
                                    : confirmAction.domain.isActive
                                        ? 'Domain ini tidak akan muncul di halaman order.'
                                        : 'Domain ini akan ditampilkan kembali di halaman order.'}
                        </p>
                        <div className="dm-modal-actions">
                            <button className="btn btn-secondary" onClick={() => setConfirmAction(null)}>Batal</button>
                            <button className={`btn ${confirmAction.type === 'delete' ? 'btn-danger' : 'btn-primary'}`} onClick={executeConfirmedAction}>
                                {confirmAction.type === 'delete' ? '🗑️ Ya, Hapus'
                                    : confirmAction.type === 'promo'
                                        ? confirmAction.domain.promoActive ? '⏸️ Nonaktifkan' : '✅ Aktifkan'
                                        : confirmAction.domain.isActive ? '⏸️ Nonaktifkan' : '✅ Aktifkan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add New Domain Modal */}
            {showAdd && (
                <div className="dm-overlay" onClick={() => setShowAdd(false)}>
                    <div className="dm-modal dm-modal-wide" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <div className="dm-modal-icon" style={{ textAlign: 'left', marginBottom: '4px', fontSize: '1.8rem' }}>🌐</div>
                                <h3 className="dm-modal-title" style={{ textAlign: 'left' }}>Tambah Ekstensi Domain Baru</h3>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>Isi form di bawah untuk menambahkan domain baru</p>
                            </div>
                            <button className="dp-close-btn" onClick={() => setShowAdd(false)}>✕</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Extension *</label>
                                <input className="form-input" placeholder=".com" value={newDomain.extension}
                                    onChange={e => setNewDomain({ ...newDomain, extension: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Label *</label>
                                <input className="form-input" placeholder="Domain .com" value={newDomain.label}
                                    onChange={e => setNewDomain({ ...newDomain, label: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Harga Asli (Rp/tahun) *</label>
                                <input className="form-input" type="number" placeholder="199000" value={newDomain.price}
                                    onChange={e => setNewDomain({ ...newDomain, price: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Harga Promo (Rp/tahun)</label>
                                <input className="form-input" type="number" placeholder="Kosongkan jika tidak ada promo" value={newDomain.promoPrice}
                                    onChange={e => setNewDomain({ ...newDomain, promoPrice: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '4px' }}>
                            <label className="form-label">Deskripsi</label>
                            <input className="form-input" placeholder="Deskripsi singkat domain" value={newDomain.description}
                                onChange={e => setNewDomain({ ...newDomain, description: e.target.value })} />
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Batal</button>
                            <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>
                                {saving ? 'Menyimpan...' : '💾 Simpan Domain'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ──── View Toggle Bar ──── */}
            <div className="dp-toolbar">
                <span className="dp-toolbar-label">Menampilkan {domains.length} domain</span>
                <div className="dp-view-toggle">
                    <button
                        className={`dp-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                        title="Grid View"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" /><rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>
                        <span>Grid</span>
                    </button>
                    <button
                        className={`dp-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                        title="List View"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="2.5" rx="1" /><rect x="1" y="6.75" width="14" height="2.5" rx="1" /><rect x="1" y="11.5" width="14" height="2.5" rx="1" /></svg>
                        <span>List</span>
                    </button>
                </div>
            </div>

            {/* ──── GRID VIEW ──── */}
            {viewMode === 'grid' && (
                <div className="dp-grid">
                    {domains.map(d => (
                        <div key={d.id} className={`dp-card ${!d.isActive ? 'dp-card-inactive' : ''}`}>
                            <div className="dp-card-top">
                                <div className="dp-ext">{d.extension}</div>
                                <div className="dp-badges">
                                    {d.promoActive && d.promoPrice && <span className="dp-badge dp-badge-promo">PROMO</span>}
                                    <span className={`dp-badge ${d.isActive ? 'dp-badge-active' : 'dp-badge-off'}`}>
                                        {d.isActive ? 'AKTIF' : 'OFF'}
                                    </span>
                                </div>
                            </div>
                            <div className="dp-card-body">
                                <div className="dp-card-label">{d.label}</div>
                                <div className="dp-card-desc">{d.description}</div>
                            </div>

                            {editId === d.id ? (
                                <div className="dp-edit-form">
                                    <div className="form-group" style={{ marginBottom: '10px' }}>
                                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Label</label>
                                        <input className="form-input" value={editData.label || ''} onChange={e => setEditData({ ...editData, label: e.target.value })} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '10px' }}>
                                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Deskripsi</label>
                                        <input className="form-input" value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Harga (Rp)</label>
                                            <input className="form-input" type="number" value={editData.price || ''} onChange={e => setEditData({ ...editData, price: Number(e.target.value) })} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Promo (Rp)</label>
                                            <input className="form-input" type="number" value={editData.promoPrice ?? ''} onChange={e => setEditData({ ...editData, promoPrice: e.target.value ? Number(e.target.value) : null })} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={saveEdit} disabled={saving}>{saving ? '...' : '💾 Simpan'}</button>
                                        <button className="btn btn-secondary btn-sm" onClick={() => setEditId(null)}>Batal</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="dp-pricing">
                                        <div className="dp-price-line">
                                            <span className="dp-price-label">Harga</span>
                                            <span className={`dp-price-val ${d.promoActive && d.promoPrice ? 'dp-strike' : ''}`}>Rp {formatRp(d.price)}/thn</span>
                                        </div>
                                        {d.promoPrice != null && (
                                            <div className="dp-price-line">
                                                <span className="dp-price-label">Promo</span>
                                                <span className="dp-price-val dp-price-green">Rp {formatRp(d.promoPrice)}/thn</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="dp-card-actions">
                                        <button className={`dp-toggle-btn ${d.promoActive ? 'dp-toggle-on' : 'dp-toggle-off'}`} onClick={() => handleToggleWithConfirm(d, 'promo')} disabled={!d.promoPrice}>
                                            <span className={`dp-dot ${d.promoActive ? 'on' : 'off'}`}></span>
                                            Promo {d.promoActive ? 'ON' : 'OFF'}
                                        </button>
                                        <button className={`dp-toggle-btn ${d.isActive ? 'dp-toggle-on' : 'dp-toggle-off'}`} onClick={() => handleToggleWithConfirm(d, 'status')}>
                                            <span className={`dp-dot ${d.isActive ? 'on' : 'off'}`}></span>
                                            {d.isActive ? 'Aktif' : 'Non-Aktif'}
                                        </button>
                                        <div className="dp-bottom-row">
                                            <button className="btn btn-secondary btn-sm" onClick={() => startEdit(d)}>✏️ Edit</button>
                                            <button className="dp-del-btn" onClick={() => handleDelete(d)}>🗑️</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ──── LIST VIEW ──── */}
            {viewMode === 'list' && (
                <div className="dp-list">
                    {domains.map(d => (
                        <div key={d.id} className={`dp-list-row ${!d.isActive ? 'dp-list-row-inactive' : ''}`}>
                            {/* Col 1: Extension */}
                            <div className="dp-list-ext">
                                <span className="dp-list-ext-name">{d.extension}</span>
                                <span className="dp-list-ext-label">{d.label}</span>
                            </div>

                            {/* Col 2: Description */}
                            <div className="dp-list-desc">{d.description}</div>

                            {/* Col 3: Pricing */}
                            <div className="dp-list-prices">
                                {editId === d.id ? (
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                        <input className="form-input" type="number" style={{ width: '100px', padding: '6px 8px', fontSize: '0.82rem' }} value={editData.price || ''} onChange={e => setEditData({ ...editData, price: Number(e.target.value) })} />
                                        <input className="form-input" type="number" style={{ width: '100px', padding: '6px 8px', fontSize: '0.82rem' }} placeholder="Promo" value={editData.promoPrice ?? ''} onChange={e => setEditData({ ...editData, promoPrice: e.target.value ? Number(e.target.value) : null })} />
                                        <button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={saving}>{saving ? '...' : '💾'}</button>
                                        <button className="btn btn-secondary btn-sm" onClick={() => setEditId(null)}>✕</button>
                                    </div>
                                ) : (
                                    <>
                                        <span className={`dp-list-price ${d.promoActive && d.promoPrice ? 'dp-strike' : ''}`}>Rp {formatRp(d.price)}</span>
                                        {d.promoPrice != null && (
                                            <span className="dp-list-promo">Rp {formatRp(d.promoPrice)}</span>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Col 4: Badges */}
                            <div className="dp-list-badges">
                                {d.promoActive && d.promoPrice && <span className="dp-badge dp-badge-promo">PROMO</span>}
                                <span className={`dp-badge ${d.isActive ? 'dp-badge-active' : 'dp-badge-off'}`}>
                                    {d.isActive ? 'AKTIF' : 'OFF'}
                                </span>
                            </div>

                            {/* Col 5: Actions */}
                            <div className="dp-list-actions">
                                <button className={`dp-mini-toggle ${d.promoActive ? 'on' : 'off'}`} onClick={() => handleToggleWithConfirm(d, 'promo')} disabled={!d.promoPrice} title="Toggle Promo">
                                    🏷️
                                </button>
                                <button className={`dp-mini-toggle ${d.isActive ? 'on' : 'off'}`} onClick={() => handleToggleWithConfirm(d, 'status')} title="Toggle Status">
                                    {d.isActive ? '✅' : '⏸️'}
                                </button>
                                {editId !== d.id && (
                                    <button className="dp-mini-toggle neutral" onClick={() => startEdit(d)} title="Edit">✏️</button>
                                )}
                                <button className="dp-mini-toggle danger" onClick={() => handleDelete(d)} title="Hapus">🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {domains.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌐</div>
                    <h3 style={{ marginBottom: '8px' }}>Belum Ada Domain</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Tambahkan ekstensi domain untuk ditampilkan di halaman order</p>
                    <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Tambah Domain</button>
                </div>
            )}

            <style jsx>{`
                /* ──────── STATS BANNER ──────── */
                .dp-stats-banner {
                    display: flex;
                    align-items: center;
                    gap: 0;
                    background: linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(59,130,246,0.06) 100%);
                    border: 1px solid rgba(249,115,22,0.15);
                    border-radius: 16px;
                    padding: 20px 28px;
                    margin-bottom: 24px;
                }
                .dp-stat-item {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    flex: 1;
                    justify-content: center;
                }
                .dp-stat-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    flex-shrink: 0;
                }
                .dp-stat-icon-total { background: rgba(99,102,241,0.12); }
                .dp-stat-icon-active { background: rgba(16,185,129,0.12); }
                .dp-stat-icon-promo { background: rgba(249,115,22,0.12); }
                .dp-stat-icon-inactive { background: rgba(156,163,175,0.12); }
                .dp-stat-data {
                    display: flex;
                    flex-direction: column;
                }
                .dp-stat-number {
                    font-size: 1.5rem;
                    font-weight: 800;
                    line-height: 1.1;
                    color: var(--text-primary);
                }
                .dp-stat-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-weight: 500;
                    margin-top: 2px;
                }
                .dp-stat-divider {
                    width: 1px;
                    height: 40px;
                    background: var(--border);
                    margin: 0 8px;
                }

                /* ──────── TOOLBAR ──────── */
                .dp-toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                }
                .dp-toolbar-label {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }
                .dp-view-toggle {
                    display: flex;
                    gap: 0;
                    background: var(--bg-secondary);
                    border-radius: 10px;
                    padding: 3px;
                    border: 1px solid var(--border);
                }
                .dp-view-btn {
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
                .dp-view-btn.active {
                    background: var(--accent);
                    color: #fff;
                    box-shadow: 0 2px 8px rgba(249,115,22,0.25);
                }
                .dp-view-btn:not(.active):hover {
                    color: var(--text-primary);
                    background: rgba(255,255,255,0.05);
                }

                /* ──────── GRID VIEW ──────── */
                .dp-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 16px;
                }
                .dp-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 14px;
                    padding: 20px;
                    transition: all 0.2s;
                    display: flex;
                    flex-direction: column;
                }
                .dp-card:hover { border-color: rgba(249,115,22,0.25); box-shadow: 0 4px 20px rgba(0,0,0,0.12); }
                .dp-card-inactive { opacity: 0.5; }
                .dp-card-inactive:hover { opacity: 0.75; }
                .dp-card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                .dp-ext {
                    font-size: 1.35rem;
                    font-weight: 800;
                    color: var(--accent);
                    letter-spacing: -0.5px;
                }
                .dp-badges { display: flex; gap: 5px; }
                .dp-badge {
                    font-size: 0.58rem;
                    padding: 2px 8px;
                    border-radius: 20px;
                    font-weight: 700;
                    letter-spacing: 0.6px;
                }
                .dp-badge-promo { background: rgba(16,185,129,0.12); color: var(--success); }
                .dp-badge-active { background: rgba(59,130,246,0.12); color: #60a5fa; }
                .dp-badge-off { background: rgba(156,163,175,0.12); color: var(--text-muted); }
                .dp-card-body { margin-bottom: 14px; flex: 1; }
                .dp-card-label { font-weight: 600; font-size: 0.88rem; margin-bottom: 3px; }
                .dp-card-desc { font-size: 0.78rem; color: var(--text-muted); line-height: 1.4; }

                /* Pricing block in grid card */
                .dp-pricing {
                    background: var(--bg-secondary);
                    border-radius: 10px;
                    padding: 10px 14px;
                    margin-bottom: 14px;
                }
                .dp-price-line {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 3px 0;
                }
                .dp-price-label { font-size: 0.78rem; color: var(--text-muted); }
                .dp-price-val { font-weight: 700; font-size: 0.88rem; }
                .dp-strike { text-decoration: line-through; color: var(--text-muted); font-weight: 500; }
                .dp-price-green { color: var(--success); font-weight: 800; }
                .dp-edit-form {
                    background: var(--bg-secondary);
                    border-radius: 10px;
                    padding: 14px;
                    margin-top: auto;
                }

                /* Card Action Toggles */
                .dp-card-actions { display: flex; flex-direction: column; gap: 6px; }
                .dp-toggle-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    padding: 9px 12px;
                    border-radius: 8px;
                    border: 1.5px solid;
                    cursor: pointer;
                    font-family: inherit;
                    font-size: 0.8rem;
                    font-weight: 600;
                    transition: all 0.2s;
                    background: transparent;
                }
                .dp-toggle-btn:disabled { opacity: 0.3; cursor: not-allowed; }
                .dp-toggle-btn.dp-toggle-on {
                    border-color: rgba(16,185,129,0.25);
                    background: rgba(16,185,129,0.05);
                    color: var(--success);
                }
                .dp-toggle-btn.dp-toggle-on:hover:not(:disabled) { border-color: rgba(16,185,129,0.45); background: rgba(16,185,129,0.1); }
                .dp-toggle-btn.dp-toggle-off {
                    border-color: var(--border);
                    background: var(--bg-secondary);
                    color: var(--text-muted);
                }
                .dp-toggle-btn.dp-toggle-off:hover:not(:disabled) { border-color: rgba(249,115,22,0.3); color: var(--text-secondary); }
                .dp-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }
                .dp-dot.on { background: var(--success); box-shadow: 0 0 6px rgba(16,185,129,0.5); }
                .dp-dot.off { background: var(--text-muted); }
                .dp-bottom-row { display: flex; gap: 6px; margin-top: 2px; }
                .dp-del-btn {
                    padding: 5px 10px;
                    border-radius: 6px;
                    border: 1px solid rgba(239,68,68,0.2);
                    background: rgba(239,68,68,0.04);
                    color: var(--danger);
                    cursor: pointer;
                    font-size: 0.82rem;
                    transition: all 0.2s;
                    font-family: inherit;
                }
                .dp-del-btn:hover { background: rgba(239,68,68,0.12); border-color: var(--danger); }

                /* ──────── LIST VIEW ──────── */
                .dp-list {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 14px;
                    overflow: hidden;
                }
                .dp-list-row {
                    display: grid;
                    grid-template-columns: 140px 1fr 200px 110px 140px;
                    align-items: center;
                    padding: 14px 20px;
                    gap: 16px;
                    border-bottom: 1px solid var(--border);
                    transition: background 0.15s;
                }
                .dp-list-row:last-child { border-bottom: none; }
                .dp-list-row:hover { background: rgba(249,115,22,0.03); }
                .dp-list-row-inactive { opacity: 0.45; }
                .dp-list-row-inactive:hover { opacity: 0.65; }
                .dp-list-ext { display: flex; flex-direction: column; }
                .dp-list-ext-name { font-weight: 800; font-size: 1.05rem; color: var(--accent); }
                .dp-list-ext-label { font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; }
                .dp-list-desc {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    line-height: 1.4;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }
                .dp-list-prices {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .dp-list-price { font-weight: 600; font-size: 0.85rem; }
                .dp-list-promo { font-weight: 800; font-size: 0.85rem; color: var(--success); }
                .dp-list-badges { display: flex; gap: 4px; flex-wrap: wrap; }
                .dp-list-actions { display: flex; gap: 4px; }
                .dp-mini-toggle {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1.5px solid;
                    cursor: pointer;
                    font-size: 0.8rem;
                    transition: all 0.2s;
                    background: transparent;
                    font-family: inherit;
                }
                .dp-mini-toggle:disabled { opacity: 0.3; cursor: not-allowed; }
                .dp-mini-toggle.on { border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.06); }
                .dp-mini-toggle.on:hover:not(:disabled) { background: rgba(16,185,129,0.15); }
                .dp-mini-toggle.off { border-color: var(--border); background: var(--bg-secondary); }
                .dp-mini-toggle.off:hover:not(:disabled) { border-color: rgba(249,115,22,0.3); }
                .dp-mini-toggle.neutral { border-color: var(--border); background: var(--bg-secondary); }
                .dp-mini-toggle.neutral:hover { border-color: rgba(59,130,246,0.3); background: rgba(59,130,246,0.06); }
                .dp-mini-toggle.danger { border-color: rgba(239,68,68,0.2); background: rgba(239,68,68,0.04); }
                .dp-mini-toggle.danger:hover { border-color: var(--danger); background: rgba(239,68,68,0.12); }

                /* ──────── MODAL ──────── */
                .dm-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(4px);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    animation: fadeIn 0.2s ease;
                }
                .dm-modal {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    padding: 32px;
                    max-width: 420px;
                    width: 100%;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                    animation: slideUp 0.3s ease;
                }
                .dm-modal-icon { font-size: 2.5rem; margin-bottom: 16px; }
                .dm-modal-title { font-size: 1.15rem; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); }
                .dm-modal-desc { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 24px; line-height: 1.5; }
                .dm-modal-actions { display: flex; gap: 12px; justify-content: center; }
                .dm-modal-actions .btn { min-width: 120px; }
                .dm-modal-wide { max-width: 560px; text-align: left; }
                .dp-close-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    border: 1px solid var(--border);
                    background: var(--bg-secondary);
                    color: var(--text-muted);
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    font-family: inherit;
                }
                .dp-close-btn:hover {
                    background: rgba(239,68,68,0.1);
                    color: var(--danger);
                    border-color: rgba(239,68,68,0.3);
                }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 900px) {
                    .dp-stats-banner { flex-wrap: wrap; gap: 12px; }
                    .dp-stat-divider { display: none; }
                    .dp-stat-item { flex-basis: 45%; justify-content: flex-start; }
                    .dp-list-row { grid-template-columns: 1fr; gap: 8px; }
                    .dp-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 640px) {
                    .dp-stats-banner { padding: 16px; }
                    .dp-stat-item { flex-basis: 100%; }
                }
            `}</style>
        </>
    );
}
