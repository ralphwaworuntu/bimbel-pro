'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Navbar from '@/components/Navbar';

function SandboxContent() {
    const searchParams = useSearchParams();
    const ref = searchParams.get('ref') || '';
    const amount = searchParams.get('amount') || '0';
    const orderNum = searchParams.get('order') || '';
    const [processing, setProcessing] = useState(false);
    const [done, setDone] = useState(false);

    const handlePay = async () => {
        setProcessing(true);
        try {
            await fetch('/api/payments/callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gatewayRef: ref, status: 'paid', method: 'sandbox' }),
            });
            setDone(true);
        } catch {
            alert('Error processing payment');
        }
        setProcessing(false);
    };

    return (
        <div className="payment-sandbox">
            <div className="card animate-fadeInUp">
                {!done ? (
                    <>
                        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>💳</div>
                        <h2 style={{ marginBottom: '8px' }}>Sandbox Payment</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            Ini adalah halaman pembayaran simulasi (sandbox). Klik tombol di bawah untuk mensimulasikan pembayaran berhasil.
                        </p>
                        <div style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Order: </span>
                                <span style={{ fontWeight: 700 }}>{orderNum}</span>
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Ref: </span>
                                <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{ref}</span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>Jumlah: </span>
                                <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.2rem' }}>
                                    Rp {new Intl.NumberFormat('id-ID').format(Number(amount))}
                                </span>
                            </div>
                        </div>
                        <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handlePay} disabled={processing}>
                            {processing ? 'Memproses...' : '✅ Bayar Sekarang (Simulasi)'}
                        </button>
                    </>
                ) : (
                    <>
                        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
                        <h2 style={{ color: 'var(--success)', marginBottom: '8px' }}>Pembayaran Berhasil!</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            Pembayaran sandbox Anda telah berhasil diproses. Order Anda sedang diproses.
                        </p>
                        <a href="/" className="btn btn-secondary" style={{ width: '100%' }}>
                            Kembali ke Beranda
                        </a>
                    </>
                )}
            </div>
        </div>
    );
}

export default function SandboxPaymentPage() {
    return (
        <>
            <Navbar />
            <Suspense fallback={<div className="loading-page"><div className="spinner"></div></div>}>
                <SandboxContent />
            </Suspense>
        </>
    );
}
