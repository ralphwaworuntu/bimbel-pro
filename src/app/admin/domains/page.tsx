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
            const res = await fetch('/api/domains');
            setDomains(await res.json());
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchDomains(); }, []);

    const handleToggleActive = async (d: DomainPrice) => {
        await fetch(`/api/domains/${d.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: !d.isActive }),
        });
        fetchDomains();
    };

    const handleTogglePromo = async (d: DomainPrice) => {
        await fetch(`/api/domains/${d.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ promoActive: !d.promoActive }),
        });
        fetchDomains();
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

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menghapus ekstensi domain ini?')) return;
        await fetch(`/api/domains/${id}`, { method: 'DELETE' });
        fetchDomains();
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

            {/* Summary */}
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

            {/* Domain Table */}
            <div className="card">
                <div style={{ overflowX: 'auto' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Ekstensi</th>
                                <th>Harga Asli</th>
                                <th>Harga Promo</th>
                                <th>Promo</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {domains.map(d => (
                                <tr key={d.id}>
                                    <td>
                                        <div>
                                            <span style={{ fontWeight: 700, fontSize: '1rem' }}>{d.extension}</span>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{d.label}</div>
                                        </div>
                                    </td>
                                    <td>
                                        {editId === d.id ? (
                                            <input className="form-input" type="number" style={{ width: '120px' }}
                                                value={editData.price || ''} onChange={e => setEditData({ ...editData, price: Number(e.target.value) })} />
                                        ) : (
                                            <span style={{ fontWeight: 600 }}>Rp {formatRp(d.price)}</span>
                                        )}
                                    </td>
                                    <td>
                                        {editId === d.id ? (
                                            <input className="form-input" type="number" style={{ width: '120px' }}
                                                value={editData.promoPrice ?? ''} onChange={e => setEditData({ ...editData, promoPrice: e.target.value ? Number(e.target.value) : null })} />
                                        ) : (
                                            d.promoPrice ? (
                                                <span style={{ fontWeight: 600, color: 'var(--success)' }}>Rp {formatRp(d.promoPrice)}</span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)' }}>—</span>
                                            )
                                        )}
                                    </td>
                                    <td>
                                        <label className="toggle-switch">
                                            <input type="checkbox" checked={d.promoActive} onChange={() => handleTogglePromo(d)} disabled={!d.promoPrice} />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </td>
                                    <td>
                                        <label className="toggle-switch">
                                            <input type="checkbox" checked={d.isActive} onChange={() => handleToggleActive(d)} />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {editId === d.id ? (
                                                <>
                                                    <button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={saving}>
                                                        {saving ? '...' : '💾'}
                                                    </button>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => setEditId(null)}>✕</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => startEdit(d)}>✏️</button>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(d.id)}
                                                        style={{ color: 'var(--danger)' }}>🗑️</button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
