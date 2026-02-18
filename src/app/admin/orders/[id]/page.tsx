'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function formatRp(n: number) {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(n);
}

const STATUSES = [
    { value: 'pending', label: 'Pending', color: 'badge-warning' },
    { value: 'processing', label: 'Dalam Proses', color: 'badge-info' },
    { value: 'ready', label: 'Ready', color: 'badge-purple' },
    { value: 'active', label: 'Aktif', color: 'badge-success' },
    { value: 'inactive', label: 'Nonaktif', color: 'badge-danger' },
];

export default function AdminOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchOrder = () => {
        fetch(`/api/orders/${params.id}`)
            .then(r => r.json())
            .then(setOrder)
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchOrder(); }, [params.id]);

    const updateStatus = async (newStatus: string) => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/orders/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                fetchOrder();
            }
        } catch { }
        setUpdating(false);
    };

    if (loading) return <div className="loading-page" style={{ minHeight: '400px' }}><div className="spinner"></div></div>;
    if (!order) return <p>Order tidak ditemukan</p>;

    return (
        <>
            <div className="admin-header" style={{ marginBottom: '24px' }}>
                <div>
                    <Link href="/admin/orders" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>← Kembali</Link>
                    <h1 className="page-title" style={{ marginTop: '8px' }}>Detail Order</h1>
                </div>
                <span className={`badge ${STATUSES.find(s => s.value === order.status)?.color || 'badge-warning'}`} style={{ fontSize: '0.9rem', padding: '6px 16px' }}>
                    {STATUSES.find(s => s.value === order.status)?.label || order.status}
                </span>
            </div>

            <div className="grid grid-2" style={{ marginBottom: '24px' }}>
                {/* Order Info */}
                <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>📋 Informasi Order</h3>
                    <div style={{ display: 'grid', gap: '14px', fontSize: '0.92rem' }}>
                        {[
                            ['No. Order', order.orderNumber],
                            ['Brand', order.brandName],
                            ['Pemilik', order.clientName],
                            ['Email', order.email],
                            ['WhatsApp', order.phone],
                            ['Alamat', order.address || '-'],
                            ['Paket', order.package?.name],
                            ['Harga', formatRp(order.package?.price || 0)],
                            ['Tipe Bayar', order.paymentType === 'full' ? 'Full Payment' : 'Down Payment'],
                            ['Domain', order.domainRequested || '-'],
                            ['Subdomain', order.subdomainRequested ? `${order.subdomainRequested}.bimbelpro.com` : '-'],
                            ['Dibuat', new Date(order.createdAt).toLocaleString('id-ID')],
                        ].map(([label, value]) => (
                            <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                                <span style={{ fontWeight: 600, textAlign: 'right' }}>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status & Actions */}
                <div>
                    <div className="card" style={{ marginBottom: '16px' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>⚡ Update Status</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {STATUSES.map(s => (
                                <button
                                    key={s.value}
                                    className={`btn ${order.status === s.value ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                                    onClick={() => updateStatus(s.value)}
                                    disabled={updating || order.status === s.value}
                                    style={{ justifyContent: 'flex-start' }}
                                >
                                    {order.status === s.value ? '● ' : '○ '}{s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Payments */}
                    <div className="card">
                        <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>💳 Pembayaran</h3>
                        {order.payments?.length > 0 ? order.payments.map((p: any) => (
                            <div key={p.id} style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontWeight: 700 }}>{formatRp(p.amount)}</span>
                                    <span className={`badge ${p.status === 'paid' ? 'badge-success' : p.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>{p.status}</span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {p.gatewayName} • {p.method || 'n/a'} • {p.gatewayRef?.slice(0, 20)}
                                </div>
                                {p.proofFile && (
                                    <div style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Bukti Pembayaran:</p>
                                        <a href={p.proofFile} target="_blank" rel="noopener noreferrer" style={{ display: 'block', maxWidth: '200px' }}>
                                            <img src={p.proofFile} alt="Bukti Transfer" style={{ width: '100%', borderRadius: '4px', border: '1px solid var(--border)' }} />
                                            <span style={{ fontSize: '0.8rem', display: 'block', marginTop: '4px', textDecoration: 'underline' }}>Lihat Ukuran Penuh</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <p style={{ color: 'var(--text-muted)' }}>Belum ada pembayaran</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Tenant Info */}
            {order.tenant && (
                <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>🌐 Website Klien</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.92rem' }}>
                        <div><span style={{ color: 'var(--text-muted)' }}>Subdomain: </span><span style={{ fontWeight: 600 }}>{order.tenant.subdomain}.bimbelpro.com</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Domain: </span><span style={{ fontWeight: 600 }}>{order.tenant.domain || '-'}</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Status: </span><span className={`badge ${order.tenant.isActive ? 'badge-success' : 'badge-danger'}`}>{order.tenant.isActive ? 'Aktif' : 'Nonaktif'}</span></div>
                    </div>
                </div>
            )}
        </>
    );
}
