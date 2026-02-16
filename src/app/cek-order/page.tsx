'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/ToastProvider';

function formatRp(n: number) {
    return new Intl.NumberFormat('id-ID').format(n);
}

const statusSteps = [
    { key: 'pending', label: 'Menunggu Pembayaran', desc: 'Silakan selesaikan pembayaran Anda', icon: '💳' },
    { key: 'processing', label: 'Dalam Pengerjaan', desc: 'Tim kami sedang menyiapkan website Anda', icon: '⚙️' },
    { key: 'ready', label: 'Siap Digunakan', desc: 'Website Anda sudah siap, menunggu aktivasi', icon: '✅' },
    { key: 'active', label: 'Aktif', desc: 'Website Anda sudah live dan bisa diakses', icon: '🚀' },
];

export default function CekOrderPage() {
    const [searchId, setSearchId] = useState('');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const { showToast } = useToast();

    const handleSearch = async () => {
        if (!searchId.trim()) return;
        setLoading(true);
        setSearched(true);
        try {
            // Simulate delay for skeleton demo
            await new Promise(resolve => setTimeout(resolve, 800));
            const res = await fetch(`/api/orders/${searchId.trim()}`);
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

    const copyOrderNumber = () => {
        if (order) {
            navigator.clipboard.writeText(order.orderNumber);
            showToast('Nomor order disalin!', 'success');
        }
    };

    const shareStatus = () => {
        if (order) {
            const text = `Cek status order website BimbelPro saya: ${order.orderNumber}. Status: ${order.status}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
    };

    const currentIdx = statusSteps.findIndex(s => s.key === order?.status);

    return (
        <>
            <Navbar />
            <div className="order-track">
                <div className="animate-fadeInUp" style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
                    <h1 className="page-title">Cek Status Order</h1>
                    <p className="page-subtitle">Masukkan nomor order untuk melihat progress website Anda</p>
                </div>

                {/* Search */}
                <div className="card animate-fadeInUp" style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            className="form-input"
                            placeholder="Masukkan No. Order (contoh: ORD-2601-XXXX)"
                            value={searchId}
                            onChange={e => setSearchId(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                        <button className="btn btn-primary" onClick={handleSearch} disabled={loading} style={{ whiteSpace: 'nowrap' }}>
                            {loading ? 'Memuat...' : '🔍 Cek'}
                        </button>
                    </div>
                </div>

                {/* Loading Skeleton */}
                {loading && (
                    <div className="card animate-fadeIn">
                        <div className="skeleton" style={{ height: '30px', width: '40%', marginBottom: '20px' }}></div>
                        <div className="skeleton" style={{ height: '20px', width: '60%', marginBottom: '40px' }}></div>
                        <div className="grid grid-2">
                            <div className="skeleton" style={{ height: '100px' }}></div>
                            <div className="skeleton" style={{ height: '100px' }}></div>
                        </div>
                    </div>
                )}

                {/* Not Found */}
                {!loading && searched && !order && (
                    <div className="empty-state animate-fadeIn">
                        <div className="empty-state-icon">😕</div>
                        <h3>Order Tidak Ditemukan</h3>
                        <p>Pastikan No. Order yang Anda masukkan benar. Cek kembali email konfirmasi Anda.</p>
                        <button className="btn btn-secondary btn-sm" style={{ marginTop: '16px' }} onClick={() => setSearchId('')}>
                            Coba Lagi
                        </button>
                    </div>
                )}

                {/* Order Found */}
                {!loading && order && (
                    <div className="animate-fadeInUp">
                        {/* Order Info */}
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No. Order</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)' }}>{order.orderNumber}</div>
                                        <button onClick={copyOrderNumber} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Salin">📋</button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={shareStatus} className="btn btn-secondary btn-sm">
                                        📲 Share
                                    </button>
                                    <span className={`badge ${order.status === 'active' ? 'badge-success' :
                                        order.status === 'processing' ? 'badge-info' :
                                            order.status === 'pending' ? 'badge-warning' : 'badge-danger'
                                        }`}>
                                        {statusSteps.find(s => s.key === order.status)?.label || order.status}
                                    </span>
                                </div>
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
                            <h3 style={{ marginBottom: '24px', fontWeight: 700 }}>📋 Progress Order</h3>
                            <div className="order-status-timeline">
                                {statusSteps.map((s, i) => (
                                    <div key={s.key} className={`timeline-item ${i < currentIdx ? 'completed' : ''} ${i === currentIdx ? 'active' : ''} stagger-${i + 1}`}>
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-content">
                                            <div className="timeline-title">{s.icon} {s.label}</div>
                                            <div className="timeline-desc">{s.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Action */}
                        {order.status === 'pending' && order.payments?.[0]?.paymentUrl && (
                            <div style={{ marginTop: '24px' }}>
                                <a href={order.payments[0].paymentUrl} className="btn btn-primary btn-lg pulse-effect" style={{ width: '100%', textAlign: 'center' }}>
                                    💳 Lanjut Bayar Sekarang
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
