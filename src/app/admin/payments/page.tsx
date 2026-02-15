'use client';

import { useEffect, useState } from 'react';

function formatRp(n: number) {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(n);
}

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetch('/api/payments').then(r => r.json()).then(setPayments).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter);

    const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

    if (loading) return <div className="loading-page" style={{ minHeight: '400px' }}><div className="spinner"></div></div>;

    return (
        <>
            <div className="admin-header">
                <div>
                    <h1 className="page-title">💳 Pembayaran</h1>
                    <p className="page-subtitle">{payments.length} total transaksi</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-3" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Total Diterima</span>
                        <div className="stat-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>💰</div>
                    </div>
                    <div className="stat-card-value" style={{ color: 'var(--success)' }}>{formatRp(totalPaid)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Pending</span>
                        <div className="stat-card-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>⏳</div>
                    </div>
                    <div className="stat-card-value" style={{ color: 'var(--warning)' }}>{formatRp(totalPending)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Transaksi Sukses</span>
                        <div className="stat-card-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>📊</div>
                    </div>
                    <div className="stat-card-value" style={{ color: 'var(--info)' }}>{payments.filter(p => p.status === 'paid').length}</div>
                </div>
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {['all', 'paid', 'pending', 'failed', 'expired'].map(f => (
                    <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
                        {f === 'all' ? 'Semua' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Brand</th>
                            <th>Jumlah</th>
                            <th>Metode</th>
                            <th>Gateway</th>
                            <th>Status</th>
                            <th>Tanggal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(p => (
                            <tr key={p.id}>
                                <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{p.order?.orderNumber}</td>
                                <td>{p.order?.brandName}</td>
                                <td style={{ fontWeight: 700 }}>{formatRp(p.amount)}</td>
                                <td>{p.method || '-'}</td>
                                <td>
                                    <span className="badge badge-info">{p.gatewayName || 'sandbox'}</span>
                                </td>
                                <td>
                                    <span className={`badge ${p.status === 'paid' ? 'badge-success' : p.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    {new Date(p.createdAt).toLocaleString('id-ID')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
