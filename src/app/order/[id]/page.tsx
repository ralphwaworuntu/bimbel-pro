'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

function formatRp(n: number) {
    return new Intl.NumberFormat('id-ID').format(n);
}

const statusSteps = [
    { key: 'pending', label: 'Menunggu Pembayaran', desc: 'Silakan selesaikan pembayaran Anda', icon: '💳' },
    { key: 'processing', label: 'Dalam Pengerjaan', desc: 'Tim kami sedang menyiapkan website Anda', icon: '⚙️' },
    { key: 'ready', label: 'Siap Digunakan', desc: 'Website Anda sudah siap, menunggu aktivasi', icon: '✅' },
    { key: 'active', label: 'Aktif', desc: 'Website Anda sudah live dan bisa diakses', icon: '🚀' },
];

export default function OrderDetailPage() {
    const params = useParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchId, setSearchId] = useState('');

    const fetchOrder = async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/orders/${id}`);
            if (res.ok) {
                setOrder(await res.json());
            } else {
                setOrder(null);
            }
        } catch {
            setOrder(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (params.id) fetchOrder(params.id as string);
    }, [params.id]);

    const currentIdx = statusSteps.findIndex(s => s.key === order?.status);

    return (
        <>
            <Navbar />
            <div className="order-track">
                {/* Search bar */}
                <div style={{ marginBottom: '32px' }}>
                    <h1 className="page-title" style={{ textAlign: 'center', marginBottom: '16px' }}>📋 Status Order</h1>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            className="form-input"
                            placeholder="Masukkan No. Order (contoh: ORD-2601-XXXX)"
                            value={searchId}
                            onChange={e => setSearchId(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={() => fetchOrder(searchId)}>Cek</button>
                    </div>
                </div>

                {loading && (
                    <div className="loading-page" style={{ minHeight: '200px' }}>
                        <div className="spinner"></div>
                    </div>
                )}

                {!loading && !order && (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <h3>Order Tidak Ditemukan</h3>
                        <p>Pastikan No. Order atau ID yang Anda masukkan benar</p>
                    </div>
                )}

                {!loading && order && (
                    <div className="animate-fadeInUp">
                        {/* Order Info */}
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No. Order</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)' }}>{order.orderNumber}</div>
                                </div>
                                <span className={`badge ${order.status === 'active' ? 'badge-success' :
                                        order.status === 'processing' ? 'badge-info' :
                                            order.status === 'pending' ? 'badge-warning' : 'badge-danger'
                                    }`}>
                                    {statusSteps.find(s => s.key === order.status)?.label || order.status}
                                </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.9rem' }}>
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>Brand: </span>
                                    <span style={{ fontWeight: 600 }}>{order.brandName}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>Paket: </span>
                                    <span style={{ fontWeight: 600 }}>{order.package?.name}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>Pemilik: </span>
                                    <span>{order.clientName}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>Harga: </span>
                                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Rp {formatRp(order.package?.price || 0)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="card">
                            <h3 style={{ marginBottom: '24px', fontWeight: 700 }}>Progress Order</h3>
                            <div className="order-status-timeline">
                                {statusSteps.map((s, i) => (
                                    <div key={s.key} className={`timeline-item ${i < currentIdx ? 'completed' : ''} ${i === currentIdx ? 'active' : ''}`}>
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-title">{s.icon} {s.label}</div>
                                        <div className="timeline-desc">{s.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Action */}
                        {order.status === 'pending' && order.payments?.[0]?.paymentUrl && (
                            <div style={{ marginTop: '24px' }}>
                                <a href={order.payments[0].paymentUrl} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                                    💳 Lanjut Bayar
                                </a>
                            </div>
                        )}
                    </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <Link href="/" className="btn btn-secondary">← Kembali ke Beranda</Link>
                </div>
            </div>
        </>
    );
}
