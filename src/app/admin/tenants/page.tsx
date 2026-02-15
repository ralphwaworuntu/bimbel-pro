'use client';

import { useEffect, useState } from 'react';

export default function AdminTenantsPage() {
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTenants = () => {
        fetch('/api/tenants').then(r => r.json()).then(setTenants).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => { fetchTenants(); }, []);

    const toggleActive = async (id: string, isActive: boolean) => {
        await fetch(`/api/tenants/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: !isActive }),
        });
        fetchTenants();
    };

    if (loading) return <div className="loading-page" style={{ minHeight: '400px' }}><div className="spinner"></div></div>;

    return (
        <>
            <div className="admin-header">
                <div>
                    <h1 className="page-title">🌐 Website Klien</h1>
                    <p className="page-subtitle">{tenants.length} website terdaftar</p>
                </div>
            </div>

            {tenants.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🌐</div>
                    <h3>Belum Ada Website Klien</h3>
                    <p>Website klien akan muncul ketika order diaktifkan</p>
                </div>
            ) : (
                <div className="grid grid-2">
                    {tenants.map(t => (
                        <div key={t.id} className="card" style={{ position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{t.brandName}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.ownerName}</p>
                                </div>
                                <label className="toggle-switch">
                                    <input type="checkbox" checked={t.isActive} onChange={() => toggleActive(t.id, t.isActive)} />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div style={{ display: 'grid', gap: '10px', fontSize: '0.9rem', marginBottom: '16px' }}>
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>Subdomain: </span>
                                    <span style={{ fontWeight: 600 }}>{t.subdomain}.bimbelpro.com</span>
                                </div>
                                {t.domain && (
                                    <div>
                                        <span style={{ color: 'var(--text-muted)' }}>Domain: </span>
                                        <span style={{ fontWeight: 600 }}>{t.domain}</span>
                                    </div>
                                )}
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>Paket: </span>
                                    <span className={`badge ${t.order?.package?.tier === 'premium' ? 'badge-purple' : t.order?.package?.tier === 'pro' ? 'badge-info' : 'badge-warning'}`}>
                                        {t.order?.package?.name}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>Status: </span>
                                    <span className={`badge ${t.isActive ? 'badge-success' : 'badge-danger'}`}>
                                        {t.isActive ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => window.open(`https://${t.subdomain}.bimbelpro.com`, '_blank')}>
                                    🔗 Buka Website
                                </button>
                                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => window.open(`https://${t.subdomain}.bimbelpro.com/admin`, '_blank')}>
                                    ⚙️ Admin Panel
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
