'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Package {
    id: string;
    name: string;
    tier: string;
    price: number;
    monthlyFee: number;
    description: string;
    features: string[];
}

interface DomainPriceItem {
    id: string;
    extension: string;
    label: string;
    description: string;
    price: number;
    promoPrice: number | null;
    promoActive: boolean;
}

function formatRp(n: number) {
    return new Intl.NumberFormat('id-ID').format(n);
}

const STEPS = [
    { num: 1, label: 'Paket' },
    { num: 2, label: 'Data' },
    { num: 3, label: 'Domain' },
    { num: 4, label: 'Bayar' },
    { num: 5, label: 'Selesai' },
];

function OrderWizard() {
    const searchParams = useSearchParams();
    const preselected = searchParams.get('package');

    const [step, setStep] = useState(1);
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(false);
    const [orderResult, setOrderResult] = useState<any>(null);

    // Domain check state
    const [domainPrices, setDomainPrices] = useState<DomainPriceItem[]>([]);
    const [domainName, setDomainName] = useState('');
    const [selectedExt, setSelectedExt] = useState('.com');
    const [domainCheckResult, setDomainCheckResult] = useState<{ available: boolean; message: string } | null>(null);
    const [checkingDomain, setCheckingDomain] = useState(false);
    const [domainMode, setDomainMode] = useState<'subdomain' | 'custom'>('subdomain');

    const [form, setForm] = useState({
        packageId: preselected || '',
        clientName: '',
        brandName: '',
        email: '',
        phone: '',
        address: '',
        domainRequested: '',
        subdomainRequested: '',
        paymentType: 'full',
    });

    useEffect(() => {
        fetch('/api/packages').then(r => r.json()).then(setPackages).catch(() => { });
        fetch('/api/domains').then(r => r.json()).then(setDomainPrices).catch(() => { });
    }, []);

    useEffect(() => {
        if (preselected) setForm(f => ({ ...f, packageId: preselected }));
    }, [preselected]);

    const selectedPkg = packages.find(p => p.id === form.packageId);
    const selectedDomainPrice = domainPrices.find(d => d.extension === selectedExt);
    const domainDisplayPrice = selectedDomainPrice
        ? (selectedDomainPrice.promoActive && selectedDomainPrice.promoPrice != null ? selectedDomainPrice.promoPrice : selectedDomainPrice.price)
        : 0;

    const checkDomain = async () => {
        if (!domainName.trim()) return;
        setCheckingDomain(true);
        setDomainCheckResult(null);
        const fullDomain = `${domainName.trim()}${selectedExt}`;
        try {
            const res = await fetch(`/api/domains/check?domain=${encodeURIComponent(fullDomain)}`);
            const data = await res.json();
            setDomainCheckResult({ available: data.available, message: data.message });
            if (data.available) {
                setForm(f => ({ ...f, domainRequested: fullDomain }));
            }
        } catch {
            setDomainCheckResult({ available: false, message: 'Gagal memeriksa domain. Coba lagi.' });
        }
        setCheckingDomain(false);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                setOrderResult(data);
                setStep(5);
            } else {
                alert(data.error || 'Terjadi kesalahan');
            }
        } catch {
            alert('Terjadi kesalahan jaringan');
        }
        setLoading(false);
    };

    const canNext = () => {
        switch (step) {
            case 1: return !!form.packageId;
            case 2: return form.clientName && form.brandName && form.email && form.phone;
            case 3: return true;
            case 4: return !!form.paymentType;
            default: return true;
        }
    };

    return (
        <div className="wizard-container">
            {/* Progress */}
            <div className="wizard-progress">
                {STEPS.map((s, i) => (
                    <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
                        <div className={`wizard-step ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
                            <div className="wizard-step-num">
                                {step > s.num ? '✓' : s.num}
                            </div>
                            <span className="wizard-step-label" style={{ display: 'none' }}>{s.label}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`wizard-line ${step > s.num ? 'completed' : ''}`}></div>
                        )}
                    </div>
                ))}
            </div>

            <div className="wizard-card animate-fadeIn" key={step}>
                {/* Step 1: Pilih Paket */}
                {step === 1 && (
                    <>
                        <h2 className="wizard-title">Pilih Paket Website</h2>
                        <p className="wizard-subtitle">Pilih paket yang sesuai dengan kebutuhan bisnis bimbel Anda</p>
                        {packages.map(pkg => (
                            <div
                                key={pkg.id}
                                className={`package-option ${form.packageId === pkg.id ? 'selected' : ''}`}
                                onClick={() => setForm({ ...form, packageId: pkg.id })}
                            >
                                <div className="package-option-header">
                                    <span className="package-option-name">{pkg.name}</span>
                                    <span className="package-option-price">Rp {formatRp(pkg.price)}</span>
                                </div>
                                <p className="package-option-desc">{pkg.description}</p>
                            </div>
                        ))}
                    </>
                )}

                {/* Step 2: Data Bisnis */}
                {step === 2 && (
                    <>
                        <h2 className="wizard-title">Data Bisnis Anda</h2>
                        <p className="wizard-subtitle">Isi data pemilik dan brand bimbel Anda</p>
                        <div className="form-group">
                            <label className="form-label">Nama Pemilik *</label>
                            <input className="form-input" placeholder="Nama lengkap Anda" value={form.clientName}
                                onChange={e => setForm({ ...form, clientName: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nama Brand Bimbel *</label>
                            <input className="form-input" placeholder='Contoh: "Bimbel Garuda Jaya"' value={form.brandName}
                                onChange={e => setForm({ ...form, brandName: e.target.value })} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input className="form-input" type="email" placeholder="email@example.com" value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">WhatsApp *</label>
                                <input className="form-input" placeholder="08xxxxxxxxxx" value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Alamat</label>
                            <textarea className="form-textarea" placeholder="Alamat bisnis bimbel Anda" value={form.address}
                                onChange={e => setForm({ ...form, address: e.target.value })} style={{ minHeight: '80px' }} />
                        </div>
                    </>
                )}

                {/* Step 3: Domain */}
                {step === 3 && (
                    <>
                        <h2 className="wizard-title">Pilih Domain</h2>
                        <p className="wizard-subtitle">Tentukan alamat website bimbel Anda</p>

                        {/* Domain mode toggle */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                            <button
                                className={`btn ${domainMode === 'subdomain' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => { setDomainMode('subdomain'); setDomainCheckResult(null); }}
                                style={{ flex: 1 }}
                            >
                                🆓 Subdomain Gratis
                            </button>
                            <button
                                className={`btn ${domainMode === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => { setDomainMode('custom'); setDomainCheckResult(null); }}
                                style={{ flex: 1 }}
                            >
                                🌐 Custom Domain
                            </button>
                        </div>

                        {/* Subdomain Mode */}
                        {domainMode === 'subdomain' && (
                            <div className="form-group">
                                <label className="form-label">Subdomain Gratis</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input className="form-input" placeholder="namabimbel" value={form.subdomainRequested}
                                        onChange={e => setForm({ ...form, subdomainRequested: e.target.value, domainRequested: '' })}
                                        style={{ flex: 1 }} />
                                    <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontWeight: 600 }}>.bimbelpro.com</span>
                                </div>
                                <small style={{ color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                                    ✅ Gratis selamanya, langsung aktif setelah pembayaran.
                                </small>
                            </div>
                        )}

                        {/* Custom Domain Mode */}
                        {domainMode === 'custom' && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Cek Ketersediaan Domain</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            className="form-input"
                                            placeholder="namadomain"
                                            value={domainName}
                                            onChange={e => { setDomainName(e.target.value); setDomainCheckResult(null); }}
                                            onKeyDown={e => e.key === 'Enter' && checkDomain()}
                                            style={{ flex: 1 }}
                                        />
                                        <select
                                            className="form-input"
                                            value={selectedExt}
                                            onChange={e => { setSelectedExt(e.target.value); setDomainCheckResult(null); }}
                                            style={{ width: '140px', flexShrink: 0 }}
                                        >
                                            {domainPrices.map(dp => (
                                                <option key={dp.extension} value={dp.extension}>
                                                    {dp.extension}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            className="btn btn-primary"
                                            onClick={checkDomain}
                                            disabled={checkingDomain || !domainName.trim()}
                                            style={{ whiteSpace: 'nowrap' }}
                                        >
                                            {checkingDomain ? '⏳' : '🔍 Cek'}
                                        </button>
                                    </div>
                                </div>

                                {/* Domain Check Result */}
                                {domainCheckResult && (
                                    <div
                                        className="animate-fadeIn"
                                        style={{
                                            padding: '16px 20px',
                                            borderRadius: 'var(--radius-md)',
                                            marginBottom: '20px',
                                            border: `2px solid ${domainCheckResult.available ? 'var(--success)' : 'var(--danger)'}`,
                                            background: domainCheckResult.available ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '1.3rem' }}>{domainCheckResult.available ? '✅' : '❌'}</span>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>
                                                    {domainName}{selectedExt}
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: domainCheckResult.available ? 'var(--success)' : 'var(--danger)' }}>
                                                    {domainCheckResult.message}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Domain Price Display */}
                                {selectedDomainPrice && (
                                    <div style={{
                                        background: 'var(--bg-input)',
                                        padding: '20px',
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: '16px',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 700, marginBottom: '4px' }}>{selectedDomainPrice.label}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedDomainPrice.description}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                {selectedDomainPrice.promoActive && selectedDomainPrice.promoPrice != null ? (
                                                    <>
                                                        <div style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                            Rp {formatRp(selectedDomainPrice.price)}
                                                        </div>
                                                        <div style={{ fontWeight: 800, color: 'var(--success)', fontSize: '1.2rem' }}>
                                                            Rp {formatRp(selectedDomainPrice.promoPrice)}
                                                        </div>
                                                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>PROMO</span>
                                                    </>
                                                ) : (
                                                    <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.2rem' }}>
                                                        Rp {formatRp(selectedDomainPrice.price)}
                                                    </div>
                                                )}
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/tahun</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <small style={{ color: 'var(--text-muted)', display: 'block' }}>
                                    💡 Tersedia untuk paket Pro dan Premium. Biaya domain per tahun ditanggung klien.
                                </small>
                            </>
                        )}
                    </>
                )}

                {/* Step 4: Pembayaran */}
                {step === 4 && (
                    <>
                        <h2 className="wizard-title">Metode Pembayaran</h2>
                        <p className="wizard-subtitle">Pilih skema pembayaran yang Anda inginkan</p>

                        {selectedPkg && (
                            <div style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Paket</span>
                                    <span style={{ fontWeight: 700 }}>{selectedPkg.name}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: form.domainRequested ? '8px' : '0' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Harga Paket</span>
                                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Rp {formatRp(selectedPkg.price)}</span>
                                </div>
                                {form.domainRequested && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Domain ({form.domainRequested})</span>
                                        <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Rp {formatRp(domainDisplayPrice)}/tahun</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div
                            className={`payment-type-option ${form.paymentType === 'full' ? 'selected' : ''}`}
                            onClick={() => setForm({ ...form, paymentType: 'full' })}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>💰 Pembayaran Penuh</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Bayar lunas sekarang dan dapatkan prioritas pengerjaan</div>
                                </div>
                                {selectedPkg && (
                                    <span style={{ fontWeight: 800, color: 'var(--accent)', whiteSpace: 'nowrap' }}>Rp {formatRp(selectedPkg.price)}</span>
                                )}
                            </div>
                        </div>

                        <div
                            className={`payment-type-option ${form.paymentType === 'dp' ? 'selected' : ''}`}
                            onClick={() => setForm({ ...form, paymentType: 'dp' })}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>🏷️ Down Payment (50%)</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Bayar DP dulu, sisanya setelah website selesai</div>
                                </div>
                                {selectedPkg && (
                                    <span style={{ fontWeight: 800, color: 'var(--accent)', whiteSpace: 'nowrap' }}>Rp {formatRp(Math.floor(selectedPkg.price * 0.5))}</span>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Step 5: Selesai */}
                {step === 5 && orderResult && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
                        <h2 className="wizard-title">Order Berhasil!</h2>
                        <p className="wizard-subtitle">Terima kasih, pesanan Anda sudah kami terima</p>

                        <div style={{ background: 'var(--bg-input)', padding: '24px', borderRadius: 'var(--radius-md)', marginBottom: '24px', textAlign: 'left' }}>
                            <div style={{ marginBottom: '12px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>No. Order: </span>
                                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{orderResult.order.orderNumber}</span>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Brand: </span>
                                <span style={{ fontWeight: 600 }}>{orderResult.order.brandName}</span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-secondary)' }}>Status: </span>
                                <span className="badge badge-warning">Menunggu Pembayaran</span>
                            </div>
                        </div>

                        {orderResult.paymentUrl && (
                            <a href={orderResult.paymentUrl} className="btn btn-primary btn-lg" style={{ width: '100%', marginBottom: '12px' }}>
                                💳 Lanjut ke Pembayaran
                            </a>
                        )}
                        <Link href={`/order/${orderResult.order.id}`} className="btn btn-secondary" style={{ width: '100%' }}>
                            Cek Status Order
                        </Link>
                    </div>
                )}

                {/* Navigation */}
                {step < 5 && (
                    <div className="wizard-actions">
                        {step > 1 ? (
                            <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
                                ← Kembali
                            </button>
                        ) : (
                            <Link href="/" className="btn btn-secondary">← Beranda</Link>
                        )}

                        {step < 4 ? (
                            <button className="btn btn-primary" disabled={!canNext()} onClick={() => setStep(step + 1)}>
                                Lanjut →
                            </button>
                        ) : (
                            <button className="btn btn-primary" disabled={!canNext() || loading} onClick={handleSubmit}>
                                {loading ? 'Memproses...' : '🚀 Submit Order'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function OrderPage() {
    return (
        <>
            <Navbar />
            <Suspense fallback={<div className="loading-page"><div className="spinner"></div></div>}>
                <OrderWizard />
            </Suspense>
        </>
    );
}
