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
            // Fetch ALL domains including inactive for admin
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
        setEditData({
            price: d.price,
            promoPrice: d.promoPrice,
            label: d.label,
            description: d.description,
        });
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

    return (
        <>
            <div className="admin-header">
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h1 className="page-title">🌐 Domain & Harga</h1>
                    <p className="page-subtitle">Kelola harga dan promo ekstensi domain</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
                    {showAdd ? '✕ Tutup' : '+ Tambah Domain'}
                </button>
            </div>

            {/* Confirmation Modal */}
            {confirmAction && (
                <div className="dm-overlay" onClick={() => setConfirmAction(null)}>
                    <div className="dm-modal" onClick={e => e.stopPropagation()}>
                        <div className="dm-modal-icon">
                            {confirmAction.type === 'delete' ? '🗑️' :
                                confirmAction.type === 'promo' ? '🏷️' : '⚡'}
                        </div>
                        <h3 className="dm-modal-title">
                            {confirmAction.type === 'delete'
                                ? `Hapus ${confirmAction.domain.extension}?`
                                : confirmAction.type === 'promo'
                                    ? `${confirmAction.domain.promoActive ? 'Nonaktifkan' : 'Aktifkan'} Promo ${confirmAction.domain.extension}?`
                                    : `${confirmAction.domain.isActive ? 'Nonaktifkan' : 'Aktifkan'} ${confirmAction.domain.extension}?`
                            }
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
                                        : 'Domain ini akan ditampilkan kembali di halaman order.'
                            }
                        </p>
                        <div className="dm-modal-actions">
                            <button className="btn btn-secondary" onClick={() => setConfirmAction(null)}>Batal</button>
                            <button
                                className={`btn ${confirmAction.type === 'delete' ? 'btn-danger' : 'btn-primary'}`}
                                onClick={executeConfirmedAction}
                            >
                                {confirmAction.type === 'delete'
                                    ? '🗑️ Ya, Hapus'
                                    : confirmAction.type === 'promo'
                                        ? confirmAction.domain.promoActive ? '⏸️ Nonaktifkan' : '✅ Aktifkan'
                                        : confirmAction.domain.isActive ? '⏸️ Nonaktifkan' : '✅ Aktifkan'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add New Domain Form */}
            {showAdd && (
                <div className="card animate-fadeIn" style={{ marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '20px', fontWeight: 700 }}>Tambah Ekstensi Domain Baru</h3>
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
                    <div className="form-group">
                        <label className="form-label">Deskripsi</label>
                        <input className="form-input" placeholder="Deskripsi singkat domain" value={newDomain.description}
                            onChange={e => setNewDomain({ ...newDomain, description: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                        <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>
                            {saving ? 'Menyimpan...' : '💾 Simpan'}
                        </button>
                        <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Batal</button>
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-3" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                    <div className="stat-card-label">Total Ekstensi</div>
                    <div className="stat-card-value">{domains.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-label">Promo Aktif</div>
                    <div className="stat-card-value" style={{ color: 'var(--success)' }}>
                        {domains.filter(d => d.promoActive).length}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-label">Non-Aktif</div>
                    <div className="stat-card-value" style={{ color: 'var(--text-muted)' }}>
                        {domains.filter(d => !d.isActive).length}
                    </div>
                </div>
            </div>

            {/* Domain Cards */}
            <div className="dm-grid">
                {domains.map(d => (
                    <div key={d.id} className={`dm-card ${!d.isActive ? 'dm-card-inactive' : ''}`}>
                        {/* Header */}
                        <div className="dm-card-header">
                            <div className="dm-ext">{d.extension}</div>
                            <div className="dm-card-badges">
                                {d.promoActive && d.promoPrice && <span className="dm-badge dm-badge-promo">PROMO</span>}
                                <span className={`dm-badge ${d.isActive ? 'dm-badge-active' : 'dm-badge-inactive'}`}>
                                    {d.isActive ? 'AKTIF' : 'NON-AKTIF'}
                                </span>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="dm-card-info">
                            <div className="dm-label">{d.label}</div>
                            <div className="dm-desc">{d.description}</div>
                        </div>

                        {/* Pricing */}
                        {editId === d.id ? (
                            <div className="dm-card-edit">
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Label</label>
                                    <input className="form-input" value={editData.label || ''}
                                        onChange={e => setEditData({ ...editData, label: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Deskripsi</label>
                                    <input className="form-input" value={editData.description || ''}
                                        onChange={e => setEditData({ ...editData, description: e.target.value })} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label" style={{ fontSize: '0.78rem' }}>Harga (Rp)</label>
                                        <input className="form-input" type="number" value={editData.price || ''}
                                            onChange={e => setEditData({ ...editData, price: Number(e.target.value) })} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label" style={{ fontSize: '0.78rem' }}>Promo (Rp)</label>
                                        <input className="form-input" type="number" value={editData.promoPrice ?? ''}
                                            onChange={e => setEditData({ ...editData, promoPrice: e.target.value ? Number(e.target.value) : null })} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={saving} style={{ flex: 1 }}>
                                        {saving ? '...' : '💾 Simpan'}
                                    </button>
                                    <button className="btn btn-secondary btn-sm" onClick={() => setEditId(null)}>Batal</button>
                                </div>
                            </div>
                        ) : (
                            <div className="dm-card-pricing">
                                <div className="dm-price-row">
                                    <span className="dm-price-label">Harga</span>
                                    <span className={`dm-price-value ${d.promoActive && d.promoPrice ? 'dm-price-strikethrough' : ''}`}>
                                        Rp {formatRp(d.price)}/thn
                                    </span>
                                </div>
                                {d.promoPrice != null && (
                                    <div className="dm-price-row">
                                        <span className="dm-price-label">Promo</span>
                                        <span className="dm-price-value dm-price-promo">
                                            Rp {formatRp(d.promoPrice)}/thn
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions - only show when not editing */}
                        {editId !== d.id && (
                            <div className="dm-card-actions">
                                {/* Promo Toggle Button */}
                                <button
                                    className={`dm-action-btn ${d.promoActive ? 'dm-action-on' : 'dm-action-off'}`}
                                    onClick={() => handleToggleWithConfirm(d, 'promo')}
                                    disabled={!d.promoPrice}
                                    title={!d.promoPrice ? 'Set harga promo dulu' : ''}
                                >
                                    <span className="dm-action-icon">{d.promoActive ? '🏷️' : '🏷️'}</span>
                                    <span className="dm-action-text">
                                        Promo {d.promoActive ? 'ON' : 'OFF'}
                                    </span>
                                    <span className={`dm-action-dot ${d.promoActive ? 'on' : 'off'}`}></span>
                                </button>

                                {/* Status Toggle Button */}
                                <button
                                    className={`dm-action-btn ${d.isActive ? 'dm-action-on' : 'dm-action-off'}`}
                                    onClick={() => handleToggleWithConfirm(d, 'status')}
                                >
                                    <span className="dm-action-icon">{d.isActive ? '✅' : '⏸️'}</span>
                                    <span className="dm-action-text">
                                        {d.isActive ? 'Aktif' : 'Non-Aktif'}
                                    </span>
                                    <span className={`dm-action-dot ${d.isActive ? 'on' : 'off'}`}></span>
                                </button>

                                {/* Edit & Delete */}
                                <div className="dm-card-btns">
                                    <button className="btn btn-secondary btn-sm" onClick={() => startEdit(d)} title="Edit">✏️ Edit</button>
                                    <button className="dm-delete-btn" onClick={() => handleDelete(d)} title="Hapus">🗑️</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {domains.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌐</div>
                    <h3 style={{ marginBottom: '8px' }}>Belum Ada Domain</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Tambahkan ekstensi domain untuk ditampilkan di halaman order</p>
                    <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Tambah Domain</button>
                </div>
            )}

            <style jsx>{`
                .dm-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
                    gap: 20px;
                }
                .dm-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 24px;
                    transition: all 0.25s;
                }
                .dm-card:hover {
                    border-color: rgba(249, 115, 22, 0.2);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                }
                .dm-card-inactive {
                    opacity: 0.55;
                }
                .dm-card-inactive:hover {
                    opacity: 0.8;
                }

                /* Header */
                .dm-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                .dm-ext {
                    font-size: 1.4rem;
                    font-weight: 800;
                    color: var(--accent);
                    letter-spacing: -0.5px;
                }
                .dm-card-badges {
                    display: flex;
                    gap: 6px;
                }
                .dm-badge {
                    font-size: 0.6rem;
                    padding: 3px 10px;
                    border-radius: 20px;
                    font-weight: 700;
                    letter-spacing: 0.8px;
                    text-transform: uppercase;
                }
                .dm-badge-promo {
                    background: rgba(16, 185, 129, 0.15);
                    color: var(--success);
                }
                .dm-badge-active {
                    background: rgba(59, 130, 246, 0.15);
                    color: #60a5fa;
                }
                .dm-badge-inactive {
                    background: rgba(156, 163, 175, 0.15);
                    color: var(--text-muted);
                }

                /* Info */
                .dm-card-info {
                    margin-bottom: 16px;
                }
                .dm-label {
                    font-weight: 600;
                    margin-bottom: 4px;
                    color: var(--text-primary);
                }
                .dm-desc {
                    font-size: 0.82rem;
                    color: var(--text-muted);
                }

                /* Pricing */
                .dm-card-pricing {
                    background: var(--bg-secondary);
                    border-radius: 10px;
                    padding: 12px 16px;
                    margin-bottom: 16px;
                }
                .dm-price-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 4px 0;
                }
                .dm-price-label {
                    font-size: 0.82rem;
                    color: var(--text-muted);
                }
                .dm-price-value {
                    font-weight: 700;
                    font-size: 0.95rem;
                }
                .dm-price-strikethrough {
                    text-decoration: line-through;
                    color: var(--text-muted);
                    font-weight: 500;
                }
                .dm-price-promo {
                    color: var(--success);
                    font-weight: 800;
                }

                /* Edit form */
                .dm-card-edit {
                    background: var(--bg-secondary);
                    border-radius: 10px;
                    padding: 16px;
                    margin-bottom: 16px;
                }

                /* Actions */
                .dm-card-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                /* Action Buttons (Toggle replacement) */
                .dm-action-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    width: 100%;
                    padding: 10px 14px;
                    border-radius: 10px;
                    border: 2px solid;
                    cursor: pointer;
                    font-family: inherit;
                    font-size: 0.85rem;
                    font-weight: 600;
                    transition: all 0.2s;
                    background: transparent;
                }
                .dm-action-btn:disabled {
                    opacity: 0.35;
                    cursor: not-allowed;
                }
                .dm-action-btn.dm-action-on {
                    border-color: rgba(16, 185, 129, 0.3);
                    background: rgba(16, 185, 129, 0.06);
                    color: var(--success);
                }
                .dm-action-btn.dm-action-on:hover:not(:disabled) {
                    border-color: rgba(16, 185, 129, 0.5);
                    background: rgba(16, 185, 129, 0.12);
                }
                .dm-action-btn.dm-action-off {
                    border-color: var(--border);
                    background: var(--bg-secondary);
                    color: var(--text-muted);
                }
                .dm-action-btn.dm-action-off:hover:not(:disabled) {
                    border-color: rgba(249, 115, 22, 0.3);
                    color: var(--text-secondary);
                }
                .dm-action-icon {
                    font-size: 1rem;
                }
                .dm-action-text {
                    flex: 1;
                    text-align: left;
                }
                .dm-action-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }
                .dm-action-dot.on {
                    background: var(--success);
                    box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
                }
                .dm-action-dot.off {
                    background: var(--text-muted);
                }

                /* Edit & Delete Buttons */
                .dm-card-btns {
                    display: flex;
                    gap: 8px;
                    margin-top: 4px;
                }
                .dm-delete-btn {
                    padding: 6px 12px;
                    border-radius: 8px;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    background: rgba(239, 68, 68, 0.06);
                    color: var(--danger);
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: all 0.2s;
                    font-family: inherit;
                }
                .dm-delete-btn:hover {
                    background: rgba(239, 68, 68, 0.15);
                    border-color: var(--danger);
                }

                /* Confirmation Modal */
                .dm-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
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
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                    animation: slideUp 0.3s ease;
                }
                .dm-modal-icon {
                    font-size: 2.5rem;
                    margin-bottom: 16px;
                }
                .dm-modal-title {
                    font-size: 1.15rem;
                    font-weight: 700;
                    margin-bottom: 8px;
                    color: var(--text-primary);
                }
                .dm-modal-desc {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    margin-bottom: 24px;
                    line-height: 1.5;
                }
                .dm-modal-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }
                .dm-modal-actions .btn {
                    min-width: 120px;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 640px) {
                    .dm-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </>
    );
}
