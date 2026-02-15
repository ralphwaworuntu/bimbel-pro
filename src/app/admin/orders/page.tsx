'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetch('/api/orders').then(r => r.json()).then(setOrders).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    const statusCounts: Record<string, number> = {};
    orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

    if (loading) return <div className="loading-page" style={{ minHeight: '400px' }}><div className="spinner"></div></div>;

    return (
        <>
            <div className="admin-header">
                <div>
                    <h1 className="page-title">📦 Daftar Pesanan</h1>
                    <p className="page-subtitle">{orders.length} total pesanan</p>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {[
                    { key: 'all', label: 'Semua', count: orders.length },
                    { key: 'pending', label: 'Pending', count: statusCounts.pending || 0 },
                    { key: 'processing', label: 'Proses', count: statusCounts.processing || 0 },
                    { key: 'ready', label: 'Ready', count: statusCounts.ready || 0 },
                    { key: 'active', label: 'Aktif', count: statusCounts.active || 0 },
                    { key: 'inactive', label: 'Nonaktif', count: statusCounts.inactive || 0 },
                ].map(f => (
                    <button
                        key={f.key}
                        className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter(f.key)}
                    >
                        {f.label} ({f.count})
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <h3>Belum Ada Pesanan</h3>
                    <p>Pesanan akan muncul di sini ketika ada klien yang melakukan order</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>No. Order</th>
                                <th>Brand</th>
                                <th>Pemilik</th>
                                <th>Paket</th>
                                <th>Tipe Bayar</th>
                                <th>Status</th>
                                <th>Tanggal</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(o => (
                                <tr key={o.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{o.orderNumber}</td>
                                    <td style={{ fontWeight: 600 }}>{o.brandName}</td>
                                    <td>{o.clientName}</td>
                                    <td>
                                        <span className={`badge ${o.package?.tier === 'premium' ? 'badge-purple' : o.package?.tier === 'pro' ? 'badge-info' : 'badge-warning'}`}>
                                            {o.package?.name}
                                        </span>
                                    </td>
                                    <td>{o.paymentType === 'full' ? 'Full' : 'DP'}</td>
                                    <td>
                                        <span className={`badge ${o.status === 'active' ? 'badge-success' :
                                                o.status === 'processing' ? 'badge-info' :
                                                    o.status === 'pending' ? 'badge-warning' :
                                                        o.status === 'ready' ? 'badge-purple' : 'badge-danger'
                                            }`}>
                                            {o.status}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        {new Date(o.createdAt).toLocaleDateString('id-ID')}
                                    </td>
                                    <td>
                                        <Link href={`/admin/orders/${o.id}`} className="btn btn-secondary btn-sm">
                                            Detail
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
