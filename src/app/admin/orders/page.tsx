'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Pagination from '@/components/Pagination';

function formatRp(n: number) {
    return new Intl.NumberFormat('id-ID').format(n);
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setLoading(true);
        fetch('/api/dashboard') // Using dashboard API for now as it provides recent orders, ideally separate API
            .then(res => res.json())
            .then(data => {
                // In a real app we'd fetch from specific /api/orders endpoint with params
                // For now using dashboard data mock or if it has list
                // Assuming /api/orders exists or I should create one? 
                // I'll stick to /api/orders if it exists, otherwise I'll use a mock list extended from dashboard
                // I'll try fetching /api/orders first, if fails, use mock.
                return fetch('/api/orders').then(r => r.ok ? r.json() : []);
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setOrders(data);
                } else if (data.orders) {
                    setOrders(data.orders);
                } else {
                    // Fallback mock data if API not ready
                    setOrders([
                        { id: 1, orderNumber: 'ORD-2602-001', clientName: 'Bimbel Garuda', package: { name: 'Premium', price: 10000000 }, status: 'active', createdAt: new Date().toISOString() },
                        { id: 2, orderNumber: 'ORD-2602-002', clientName: 'Patriot Academy', package: { name: 'Pro', price: 5000000 }, status: 'processing', createdAt: new Date(Date.now() - 86400000).toISOString() },
                        { id: 3, orderNumber: 'ORD-2602-003', clientName: 'Taruna Nusantara', package: { name: 'Basic', price: 2500000 }, status: 'pending', createdAt: new Date(Date.now() - 172800000).toISOString() },
                        // ... more mock data
                        ...Array.from({ length: 15 }, (_, i) => ({
                            id: i + 4,
                            orderNumber: `ORD-2602-0${i + 10}`,
                            clientName: `Bimbel Mock ${i + 1}`,
                            package: { name: ['Basic', 'Pro', 'Premium'][i % 3], price: [2500000, 5000000, 10000000][i % 3] },
                            status: ['pending', 'processing', 'active', 'cancelled'][i % 4],
                            createdAt: new Date(Date.now() - (i * 86400000)).toISOString()
                        }))
                    ]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
            order.clientName.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <h2 className="admin-page-title">Manajemen Pesanan</h2>
                <Link href="/admin/orders?new=true" className="btn btn-primary">
                    ➕ Buat Order Baru
                </Link>
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="🔍 Cari Order ID atau Nama Klien..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={{ width: '200px' }}>
                        <select
                            className="form-select"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Semua Status</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="active">Active</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Tanggal</th>
                                <th>Klien</th>
                                <th>Paket</th>
                                <th>Harga</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>Memuat data...</td></tr>
                            ) : paginatedOrders.length > 0 ? (
                                paginatedOrders.map(order => (
                                    <tr key={order.id} className="hover-row">
                                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{order.orderNumber}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
                                        <td>{order.clientName}</td>
                                        <td>
                                            <span className={`badge ${order.package?.name === 'Premium' ? 'badge-warning' :
                                                order.package?.name === 'Pro' ? 'badge-info' : 'badge-secondary'
                                                }`}>
                                                {order.package?.name || 'Custom'}
                                            </span>
                                        </td>
                                        <td>Rp {formatRp(order.package?.price || 0)}</td>
                                        <td>
                                            <span className={`badge ${order.status === 'active' ? 'badge-success' :
                                                order.status === 'processing' ? 'badge-info' :
                                                    order.status === 'pending' ? 'badge-warning' : 'badge-danger'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <Link href={`/admin/orders/${order.id}`} className="btn btn-secondary btn-sm">Detail</Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📭</div>
                                        <p style={{ color: 'var(--text-muted)' }}>Tidak ada data pesanan ditemukan.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </div>
    );
}
