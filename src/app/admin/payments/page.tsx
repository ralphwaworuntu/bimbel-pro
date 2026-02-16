'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Pagination from '@/components/Pagination';

function formatRp(n: number) {
    return new Intl.NumberFormat('id-ID').format(n);
}

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setLoading(true);
        // Mock data
        const mockPayments = Array.from({ length: 25 }, (_, i) => ({
            id: i + 1,
            invoiceId: `INV-2602-${(i + 100).toString().padStart(3, '0')}`,
            clientName: `Klien ${i + 1}`,
            amount: [2500000, 5000000, 10000000][i % 3],
            date: new Date(Date.now() - i * 86400000 * 0.5).toISOString(),
            status: ['paid', 'pending', 'failed'][i % 5 === 0 ? 1 : i % 7 === 0 ? 2 : 0],
            method: ['Bank Transfer', 'E-Wallet', 'Credit Card'][i % 3],
        }));

        setTimeout(() => {
            setPayments(mockPayments);
            setLoading(false);
        }, 500);
    }, []);

    const filteredPayments = payments.filter(p => statusFilter === 'all' || p.status === statusFilter);
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const paginatedPayments = filteredPayments.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const totalRevenue = filteredPayments.reduce((sum, p) => p.status === 'paid' ? sum + p.amount : sum, 0);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="admin-page-title">Riwayat Pembayaran</h2>
                <div style={{ background: 'var(--bg-card)', padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-secondary)', marginRight: '8px', fontSize: '0.9rem' }}>Total Pendapatan:</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>Rp {formatRp(totalRevenue)}</span>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <select
                        className="form-select"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{ maxWidth: '200px' }}
                    >
                        <option value="all">Semua Status</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                    <button className="btn btn-secondary">📥 Export CSV</button>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Invoice ID</th>
                                <th>Tanggal</th>
                                <th>Klien</th>
                                <th>Metode</th>
                                <th>Jumlah</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}><div className="spinner"></div></td></tr>
                            ) : paginatedPayments.length > 0 ? (
                                paginatedPayments.map(p => (
                                    <tr key={p.id} className="hover-row">
                                        <td style={{ fontFamily: 'monospace' }}>{p.invoiceId}</td>
                                        <td>{new Date(p.date).toLocaleDateString('id-ID')}</td>
                                        <td>{p.clientName}</td>
                                        <td>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {p.method === 'Bank Transfer' ? '🏦' : p.method === 'E-Wallet' ? '📱' : '💳'} {p.method}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>Rp {formatRp(p.amount)}</td>
                                        <td>
                                            <span className={`badge ${p.status === 'paid' ? 'badge-success' :
                                                    p.status === 'pending' ? 'badge-warning' : 'badge-danger'
                                                }`}>
                                                {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-secondary btn-sm">Struk</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Tidak ada data pembayaran.</td></tr>
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
