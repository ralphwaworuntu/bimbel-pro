'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import Confetti from '@/components/Confetti';
import { useToast } from '@/components/ToastProvider';
import StepIndicator from '@/components/StepIndicator';
import FormField from '@/components/FormField';

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
    { num: 4, label: 'Review' },
    { num: 5, label: 'Selesai' },
];

interface OrderFormState {
    packageId: string;
    clientName: string;
    brandName: string;
    email: string;
    phone: string;
    address: string;
    domainRequested: string;
    subdomainRequested: string;
    paymentType: string;
}

function OrderWizardContent() {
    const searchParams = useSearchParams();
    const preselected = searchParams.get('package');

    const [step, setStep] = useState(1);
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(false);
    const [orderResult, setOrderResult] = useState<any>(null);

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
        setIsClient(true);
        const savedStep = localStorage.getItem('order_step');
        if (savedStep) setStep(parseInt(savedStep));

        fetch('/api/packages').then(r => r.json()).then(setPackages).catch(() => { });
        fetch('/api/domains').then(r => r.json()).then(setDomainPrices).catch(() => { });
    }, []);

    // Auto-save effect
    useEffect(() => {
        if (isClient && step < 5) {
            localStorage.setItem('order_form', JSON.stringify(form));
            localStorage.setItem('order_step', step.toString());
        }
    }, [form, step, isClient]);

    // Clear storage on successful order
    const clearStorage = () => {
        localStorage.removeItem('order_form');
        localStorage.removeItem('order_step');
    };

    // Warning before unload if form is dirty
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (step > 1 && step < 5) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [step]);

    useEffect(() => {
        if (preselected && !form.packageId) {
            setForm((f: OrderFormState) => ({ ...f, packageId: preselected }));
        }
    }, [preselected]);

    const selectedPkg = packages.find(p => p.id === form.packageId);

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
                clearStorage();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                showToast('Order berhasil dibuat!', 'success');
            } else {
                showToast(data.error || 'Terjadi kesalahan', 'error');
            }
        } catch {
            showToast('Terjadi kesalahan jaringan', 'error');
        }
        setLoading(false);
    };

    const validate = () => {
        const errors: any = {};
        if (!form.clientName) errors.clientName = 'Nama wajib diisi';
        if (!form.brandName) errors.brandName = 'Nama brand wajib diisi';
        if (!form.email) errors.email = 'Email wajib diisi';
        if (!form.phone) errors.phone = 'No. WA wajib diisi';
        if (!form.subdomainRequested && !form.domainRequested) errors.domain = 'Pilih salah satu domain';
        return errors;
    };

    const errors = validate();

    const canNext = () => {
        switch (step) {
            case 1: return !!form.packageId;
            case 2: return !errors.clientName && !errors.brandName && !errors.email && !errors.phone;
            case 3: return !errors.domain;
            case 4: return !!form.paymentType;
            default: return true;
        }
    };

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    if (!isClient) {
        return <div style={{ padding: '40px', textAlign: 'center' }}><LoadingSpinner /></div>;
    }

    return (
        <div className="wizard-container">
            <Navbar />
            <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', minHeight: '80vh' }}>
                {step === 5 && <Confetti />}

                {/* Progress Bar Animated */}
                <StepIndicator currentStep={step} steps={STEPS} />

                <div className="wizard-card animate-fadeInUp" key={step} style={{ minHeight: '400px' }}>
                    {/* Step 1: Pilih Paket */}
                    {step === 1 && (
                        <>
                            <h2 className="wizard-title text-center">Pilih Paket Website</h2>
                            <p className="wizard-subtitle text-center">Pilih paket yang sesuai dengan kebutuhan bisnis bimbel Anda</p>

                            {packages.length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center' }}><LoadingSpinner /></div>
                            ) : (
                                <div className="grid grid-1 gap-md">
                                    {packages.map(pkg => (
                                        <div
                                            key={pkg.id}
                                            className={`package-option ${form.packageId === pkg.id ? 'selected' : ''}`}
                                            onClick={() => setForm({ ...form, packageId: pkg.id })}
                                        >
                                            <div className="radio-circle"></div>
                                            <div style={{ flex: 1 }}>
                                                <div className="package-option-header">
                                                    <span className="package-option-name">{pkg.name}</span>
                                                    <span className="package-option-price">Rp {formatRp(pkg.price)}</span>
                                                </div>
                                                <p className="package-option-desc">{pkg.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Step 2: Data Bisnis */}
                    {step === 2 && (
                        <>
                            <h2 className="wizard-title text-center">Data Bisnis Anda</h2>
                            <p className="wizard-subtitle text-center">Isi data pemilik dan brand bimbel Anda</p>
                            <div className="form-group slide-in">
                                <FormField
                                    label="Nama Pemilik"
                                    placeholder="Nama lengkap Anda"
                                    value={form.clientName}
                                    onChange={e => setForm({ ...form, clientName: e.target.value })}
                                    onBlur={() => handleBlur('clientName')}
                                    error={touched.clientName && !form.clientName ? 'Wajib diisi' : undefined}
                                    touched={touched.clientName}
                                    required
                                />
                            </div>
                            <div className="form-group slide-in" style={{ animationDelay: '0.1s' }}>
                                <FormField
                                    label="Nama Brand Bimbel"
                                    placeholder='Contoh: "Bimbel Garuda Jaya"'
                                    value={form.brandName}
                                    onChange={e => setForm({ ...form, brandName: e.target.value })}
                                    onBlur={() => handleBlur('brandName')}
                                    error={touched.brandName && !form.brandName ? 'Wajib diisi' : undefined}
                                    touched={touched.brandName}
                                    required
                                />
                            </div>
                            <div className="grid grid-2">
                                <div className="form-group slide-in" style={{ animationDelay: '0.2s' }}>
                                    <FormField
                                        label="Email"
                                        type="email"
                                        placeholder="email@example.com"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        onBlur={() => handleBlur('email')}
                                        error={touched.email && !form.email ? 'Wajib diisi' : undefined}
                                        touched={touched.email}
                                        required
                                    />
                                </div>
                                <div className="form-group slide-in" style={{ animationDelay: '0.3s' }}>
                                    <FormField
                                        label="WhatsApp"
                                        placeholder="08xxxxxxxxxx"
                                        value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value })}
                                        onBlur={() => handleBlur('phone')}
                                        error={touched.phone && !form.phone ? 'Wajib diisi' : undefined}
                                        touched={touched.phone}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group slide-in" style={{ animationDelay: '0.4s' }}>
                                <FormField
                                    label="Alamat"
                                    as="textarea"
                                    placeholder="Alamat bisnis bimbel Anda"
                                    value={form.address}
                                    onChange={e => setForm({ ...form, address: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    {/* Step 3: Domain */}
                    {step === 3 && (
                        <>
                            <h2 className="wizard-title">Pilih Domain</h2>
                            <p className="wizard-subtitle">Tentukan alamat website bimbel Anda</p>
                            <div className="form-group">
                                <label className="form-label">Subdomain Gratis</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input className="form-input" placeholder="namabimbel" value={form.subdomainRequested}
                                        onChange={e => setForm({ ...form, subdomainRequested: e.target.value })}
                                        style={{ flex: 1 }} />
                                    <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>.bimbelpro.com</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>atau</div>
                            <div className="form-group">
                                <label className="form-label">Custom Domain (Opsional)</label>
                                <input className="form-input" placeholder="www.domainanda.com" value={form.domainRequested}
                                    onChange={e => setForm({ ...form, domainRequested: e.target.value })} />
                                <small style={{ color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                                    Tersedia untuk paket Pro dan Premium. Biaya domain ditanggung klien.
                                </small>
                            </div>
                        </>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <>
                            <h2 className="wizard-title text-center">Review & Pembayaran</h2>
                            <p className="wizard-subtitle text-center">Cek kembali pesanan Anda sebelum checkout</p>

                            {selectedPkg && (
                            <div style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Paket</span>
                                    <span style={{ fontWeight: 700 }}>{selectedPkg.name}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Harga</span>
                                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Rp {formatRp(selectedPkg.price)}</span>
                                </div>
                                {form.domainRequested && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Domain ({form.domainRequested})</span>
                                        <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Rp {formatRp(domainDisplayPrice)}/tahun</span>
                                    </div>
                                )}
                            </div>

                            <h3 className="slide-in" style={{ fontSize: '1.1rem', marginBottom: '16px', animationDelay: '0.1s' }}>Pilih Metode Pembayaran</h3>

                            <div
                                className={`payment-type-option slide-in ${form.paymentType === 'full' ? 'selected' : ''}`}
                                style={{ animationDelay: '0.2s' }}
                                onClick={() => setForm({ ...form, paymentType: 'full' })}
                            >
                                <div className="radio-circle"></div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontWeight: 700 }}>Pembayaran Penuh</div>
                                        {selectedPkg && (
                                            <span style={{ fontWeight: 800, color: 'var(--accent)', whiteSpace: 'nowrap' }}>Rp {formatRp(selectedPkg.price)}</span>
                                        )}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Bayar lunas sekarang dan dapatkan prioritas pengerjaan</div>
                                </div>
                            </div>

                            <div
                                className={`payment-type-option slide-in ${form.paymentType === 'dp' ? 'selected' : ''}`}
                                style={{ animationDelay: '0.3s' }}
                                onClick={() => setForm({ ...form, paymentType: 'dp' })}
                            >
                                <div className="radio-circle"></div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontWeight: 700 }}>Down Payment (50%)</div>
                                        {selectedPkg && (
                                            <span style={{ fontWeight: 800, color: 'var(--accent)', whiteSpace: 'nowrap' }}>Rp {formatRp(Math.floor(selectedPkg.price * 0.5))}</span>
                                        )}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Bayar DP dulu, sisanya setelah website selesai</div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Step 5: Selesai */}
                    {step === 5 && orderResult && (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div className="animate-bounce" style={{ fontSize: '5rem', marginBottom: '24px' }}>🎉</div>
                            <h2 className="wizard-title">Order Berhasil Dibuat!</h2>
                            <p className="wizard-subtitle">Terima kasih telah mempercayakan website bimbel Anda kepada kami.</p>

                            <div className="card" style={{ maxWidth: '500px', margin: '0 auto 32px', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--success)' }}></div>
                                <div style={{ marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nomor Order</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '1px' }}>{orderResult.order.orderNumber}</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                                    <span className="badge badge-warning">Menunggu Pembayaran</span>
                                </div>
                                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                                    Silakan selesaikan pembayaran agar kami dapat segera memproses website Anda.
                                </div>
                            </div>

                            {orderResult.paymentUrl && (
                                <a href={orderResult.paymentUrl} className="btn btn-primary btn-lg pulse-effect" style={{ minWidth: '250px', marginBottom: '16px' }}>
                                    💳 Bayar Sekarang
                                </a>
                            )}
                            <br />
                            <Link href={`/cek-order`} className="btn btn-secondary">
                                Cek Status Order
                            </Link>
                        </div>
                    )}

                    {/* Navigation Actions */}
                    {step < 5 && (
                        <div className="wizard-actions" style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                            {step > 1 ? (
                                <button className="btn btn-secondary" onClick={handleBack}>
                                    ← Kembali
                                </button>
                            ) : (
                                <Link href="/" className="btn btn-secondary">← Beranda</Link>
                            )}

                            <div style={{ flex: 1 }}></div>

                            {step < 4 ? (
                                <button className="btn btn-primary" onClick={handleNext}>
                                    Lanjut →
                                </button>
                            ) : (
                                <button className="btn btn-primary btn-lg" disabled={!canNext() || loading} onClick={handleSubmit}>
                                    {loading && <div className="spinner-brand sm" style={{ width: '16px', height: '16px', marginRight: '8px' }}><div className="spinner-ring"></div></div>}
                                    {loading ? 'Memproses...' : '🚀 Submit Order'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .slide-in {
                    animation: slideIn 0.4s ease-out forwards;
                    opacity: 0;
                    transform: translateX(10px);
                }
                @keyframes slideIn {
                    to { opacity: 1; transform: translateX(0); }
                }

                .text-center { text-align: center; }
                .text-danger { color: var(--danger); font-size: 0.85rem; }
                .text-muted { color: var(--text-muted); }
                .text-accent { color: var(--accent); }
                .font-bold { font-weight: 700; }
                .block { display: block; }
                .mb-1 { margin-bottom: 4px; }
                .border-accent { border-color: var(--accent) !important; box-shadow: 0 0 0 2px var(--accent-glow); }

                .radio-circle {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 2px solid var(--text-muted);
                    margin-right: 12px;
                    position: relative;
                    flex-shrink: 0;
                }

                .selected .radio-circle, .checked.radio-circle {
                    border-color: var(--accent);
                }

                .selected .radio-circle::after, .checked.radio-circle::after {
                    content: '';
                    position: absolute;
                    inset: 3px;
                    background: var(--accent);
                    border-radius: 50%;
                }

                .package-option {
                    display: flex; 
                    align-items: center;
                    padding: 24px;
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: var(--transition);
                }

                .package-option:hover {
                    background: var(--bg-secondary);
                }

                .package-option.selected {
                    background: rgba(249, 115, 22, 0.05);
                    border-color: var(--accent);
                }

                .payment-type-option {
                    display: flex;
                    align-items: center;
                    padding: 24px;
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: var(--transition);
                    margin-bottom: 16px;
                }

                .payment-type-option.selected {
                    background: rgba(249, 115, 22, 0.05);
                    border-color: var(--accent);
                }

                .pulse-effect {
                    animation: pulse 2s infinite;
                }
            `}</style>
        </div>
    );
}

export default function OrderWizard() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <OrderWizardContent />
        </Suspense>
    );
}
