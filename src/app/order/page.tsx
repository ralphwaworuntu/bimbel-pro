'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import Confetti from '@/components/Confetti';
import { useToast } from '@/components/ToastProvider';
import FormField from '@/components/FormField';

const Map = dynamic(() => import('@/components/Map'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center text-slate-400">Loading Map...</div>
});

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
    { num: 1, label: 'Paket', icon: '📦' },
    { num: 2, label: 'Data', icon: '👤' },
    { num: 3, label: 'Domain', icon: '🌐' },
    { num: 4, label: 'Review', icon: '📋' },
    { num: 5, label: 'Selesai', icon: '🎉' },
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
    const { showToast } = useToast();

    const [isClient, setIsClient] = useState(false);
    const [step, setStep] = useState(1);
    const [packages, setPackages] = useState<Package[]>([]);
    const [domainPrices, setDomainPrices] = useState<DomainPriceItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [orderResult, setOrderResult] = useState<any>(null);
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const [form, setForm] = useState({
        packageId: preselected || '',
        clientName: '',
        brandName: '',
        email: '',
        phone: '',
        address: '',
        village: '',        // Kelurahan
        district: '',       // Kecamatan
        city: '',           // Kota/Kabupaten
        province: '',       // Provinsi
        postalCode: '',     // Kode Pos
        domainRequested: '',
        subdomainRequested: '',
        paymentType: 'full',
    });

    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

    // ... (existing code) ...

    // Use effect to load initial data

    const [domainName, setDomainName] = useState('');
    const [selectedExt, setSelectedExt] = useState('.com');
    const [domainCheckResult, setDomainCheckResult] = useState<{ available: boolean; message: string } | null>(null);
    const [checkingDomain, setCheckingDomain] = useState(false);
    const [domainMode, setDomainMode] = useState<'subdomain' | 'custom'>('subdomain');

    // Regional Data State
    const [provinces, setProvinces] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [villages, setVillages] = useState<any[]>([]);

    useEffect(() => {
        setIsClient(true);
        // Fetch Provinces
        fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
            .then(response => response.json())
            .then(data => setProvinces(data))
            .catch(error => console.error('Error fetching provinces:', error));

        const savedStep = localStorage.getItem('order_step');
        if (savedStep) setStep(parseInt(savedStep));

        // Load saved form if exists
        const savedForm = localStorage.getItem('order_form');
        if (savedForm) {
            try {
                setForm(JSON.parse(savedForm));
            } catch (e) {
                console.error("Failed to parse saved form", e);
            }
        }

        fetch('/api/packages').then(r => r.json()).then(setPackages).catch(() => { });
        fetch('/api/domains').then(r => r.json()).then(setDomainPrices).catch(() => { });
    }, []);

    useEffect(() => {
        if (isClient && step < 5) {
            localStorage.setItem('order_form', JSON.stringify(form));
            localStorage.setItem('order_step', step.toString());
        }
    }, [form, step, isClient]);

    const clearStorage = () => {
        localStorage.removeItem('order_form');
        localStorage.removeItem('order_step');
    };

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (step > 1 && step < 5) { e.preventDefault(); e.returnValue = ''; }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [step]);

    // Fetch Cities when Province changes
    useEffect(() => {
        if (form.province) {
            const selectedProv = provinces.find(p => p.name === form.province);
            if (selectedProv) {
                fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProv.id}.json`)
                    .then(response => response.json())
                    .then(data => setCities(data))
                    .catch(error => console.error('Error fetching cities:', error));
            }
        }
    }, [form.province, provinces]);

    // Fetch Districts when City changes
    useEffect(() => {
        if (form.city) {
            const selectedCity = cities.find(c => c.name === form.city);
            if (selectedCity) {
                fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedCity.id}.json`)
                    .then(response => response.json())
                    .then(data => setDistricts(data))
                    .catch(error => console.error('Error fetching districts:', error));
            }
        }
    }, [form.city, cities]);

    // Fetch Villages when District changes
    useEffect(() => {
        if (form.district) {
            const selectedDistrict = districts.find(d => d.name === form.district);
            if (selectedDistrict) {
                fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${selectedDistrict.id}.json`)
                    .then(response => response.json())
                    .then(data => setVillages(data))
                    .catch(error => console.error('Error fetching villages:', error));
            }
        }
    }, [form.district, districts]);

    useEffect(() => {
        if (preselected && !form.packageId) {
            setForm(f => ({ ...f, packageId: preselected }));
        }
    }, [preselected]);

    const selectedPkg = packages.find(p => p.id === form.packageId);

    const getDomainPrice = () => {
        if (!form.domainRequested) return 0;
        const ext = form.domainRequested.split('.').pop();
        const domainItem = domainPrices.find(d => d.extension === ext || d.extension === `.${ext}`);
        return domainItem ? (domainItem.promoActive && domainItem.promoPrice ? domainItem.promoPrice : domainItem.price) : 0;
    };

    // Combine logic: try to use getDomainPrice, but also support checking logic
    const selectedDomainPrice = domainPrices.find(d => d.extension === selectedExt);
    const domainDisplayPrice = getDomainPrice() || (selectedDomainPrice
        ? (selectedDomainPrice.promoActive && selectedDomainPrice.promoPrice != null ? selectedDomainPrice.promoPrice : selectedDomainPrice.price)
        : 0);

    const checkDomain = async () => {
        if (!domainName.trim()) return;
        setCheckingDomain(true);
        setDomainCheckResult(null);
        const fullDomain = `${domainName.trim()}${selectedExt}`;
        try {
            const res = await fetch(`/api/domains/check?domain=${encodeURIComponent(fullDomain)}`);
            const data = await res.json();
            setDomainCheckResult({ available: data.available, message: data.message });
            if (data.available) setForm(f => ({ ...f, domainRequested: fullDomain }));
        } catch {
            setDomainCheckResult({ available: false, message: 'Gagal memeriksa domain. Coba lagi.' });
        }
        setCheckingDomain(false);
    };

    const validate = () => {
        const errors: any = {};
        if (!form.clientName) errors.clientName = 'Nama wajib diisi';
        if (!form.brandName) errors.brandName = 'Nama brand wajib diisi';
        if (!form.email) errors.email = 'Email wajib diisi';
        if (!form.phone) errors.phone = 'No. WA wajib diisi';

        if (!form.address) errors.address = 'Alamat wajib diisi';
        if (!form.city) errors.city = 'Kota wajib diisi';
        if (!form.province) errors.province = 'Provinsi wajib diisi';

        if (domainMode === 'subdomain' && !form.subdomainRequested) errors.domain = 'Pilih subdomain';
        if (domainMode === 'custom' && !form.domainRequested) errors.domain = 'Pilih domain';
        return errors;
    };

    const errors = validate();

    const canNext = () => {
        switch (step) {
            case 1: return !!form.packageId;
            case 2: return !errors.clientName && !errors.brandName && !errors.email && !errors.phone && !errors.address && !errors.city && !errors.province;
            case 3: return !errors.domain;
            case 4: return !!form.paymentType;
            default: return true;
        }
    };

    const handleNext = () => {
        if (canNext()) {
            setStep(s => s + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            if (step === 2) {
                setTouched({
                    clientName: true,
                    brandName: true,
                    email: true,
                    phone: true,
                    address: true,
                    city: true,
                    province: true
                });
                showToast('Mohon lengkapi data yang wajib diisi', 'warning');
            }
            if (step === 3 && !form.subdomainRequested && !form.domainRequested) {
                showToast('Pilih salah satu domain', 'warning');
            }
        }
    };

    const handleBack = () => {
        setStep(s => s - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                clearStorage();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                showToast('Order berhasil dibuat! 🎉', 'success');
            } else {
                showToast(data.error || 'Terjadi kesalahan', 'error');
            }
        } catch {
            showToast('Terjadi kesalahan jaringan', 'error');
        }
        setLoading(false);
    };

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const totalPrice = (selectedPkg?.price || 0) + (domainMode === 'custom' ? domainDisplayPrice : 0);

    if (!isClient) {
        return <div style={{ padding: '80px 20px', textAlign: 'center' }}><LoadingSpinner /></div>;
    }

    return (
        <div className="order-page">
            <Navbar />

            {/* Background Decoration */}
            <div className="order-bg">
                <div className="order-bg-orb order-bg-orb-1"></div>
                <div className="order-bg-orb order-bg-orb-2"></div>
            </div>

            <div className="order-wrapper">
                {step === 5 && <Confetti />}

                {/* Header */}
                <div className="order-header">
                    <h1 className="order-page-title">Order Website Bimbel</h1>
                    <p className="order-page-subtitle">Selesaikan pesanan Anda dalam beberapa langkah mudah</p>
                </div>

                {/* Step Indicator */}
                <div className="step-bar">
                    <div className="step-bar-track">
                        <div className="step-bar-fill" style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}></div>
                    </div>
                    <div className="step-nodes">
                        {STEPS.map(s => (
                            <div key={s.num} className={`step-node ${step === s.num ? 'active' : ''} ${step > s.num ? 'done' : ''}`}>
                                <div className="step-node-circle">
                                    {step > s.num ? '✓' : s.icon}
                                </div>
                                <span className="step-node-label">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Card */}
                <div className="order-card" key={step}>

                    {/* ==================== STEP 1: PAKET ==================== */}
                    {step === 1 && (
                        <div className="step-content fade-in">
                            <div className="step-header">
                                <span className="step-badge">Langkah 1 dari 4</span>
                                <h2 className="step-title">Pilih Paket Website</h2>
                                <p className="step-desc">Pilih paket yang sesuai dengan kebutuhan bisnis bimbel Anda</p>
                            </div>

                            {packages.length === 0 ? (
                                <div style={{ padding: '60px 0', textAlign: 'center' }}><LoadingSpinner /></div>
                            ) : (
                                <div className="pkg-list">
                                    {packages.map((pkg, i) => (
                                        <div
                                            key={pkg.id}
                                            className={`pkg-card ${form.packageId === pkg.id ? 'selected' : ''}`}
                                            onClick={() => setForm({ ...form, packageId: pkg.id })}
                                            style={{ animationDelay: `${i * 0.08}s` }}
                                        >
                                            <div className="pkg-radio">
                                                <div className="pkg-radio-dot"></div>
                                            </div>
                                            <div className="pkg-info">
                                                <div className="pkg-top">
                                                    <div>
                                                        <div className="pkg-name">{pkg.name}</div>
                                                        <div className="pkg-desc">{pkg.description}</div>
                                                    </div>
                                                    <div className="pkg-price">
                                                        <span className="pkg-price-label">Rp</span>
                                                        <span className="pkg-price-value">{formatRp(pkg.price)}</span>
                                                    </div>
                                                </div>
                                                {pkg.features && pkg.features.length > 0 && (
                                                    <div className="pkg-features">
                                                        {pkg.features.slice(0, 3).map((f, fi) => (
                                                            <span key={fi} className="pkg-feature-tag">✓ {f}</span>
                                                        ))}
                                                        {pkg.features.length > 3 && (
                                                            <span className="pkg-feature-more">+{pkg.features.length - 3} lainnya</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ==================== STEP 2: DATA BISNIS ==================== */}
                    {step === 2 && (
                        <div className="step-content fade-in">
                            <div className="step-header">
                                <span className="step-badge">Langkah 2 dari 4</span>
                                <h2 className="step-title">Data Bisnis Anda</h2>
                                <p className="step-desc">Isi data pemilik dan brand bimbel Anda</p>
                            </div>

                            <div className="form-grid">
                                <div className="form-col-full slide-up" style={{ animationDelay: '0s' }}>
                                    <FormField label="Nama Pemilik" placeholder="Nama lengkap Anda" value={form.clientName}
                                        onChange={e => setForm({ ...form, clientName: e.target.value })}
                                        onBlur={() => handleBlur('clientName')}
                                        error={touched.clientName && !form.clientName ? 'Wajib diisi' : undefined}
                                        touched={touched.clientName} required />
                                </div>
                                <div className="form-col-full slide-up" style={{ animationDelay: '0.05s' }}>
                                    <FormField label="Nama Brand Bimbel" placeholder='Contoh: "Bimbel Garuda Jaya"' value={form.brandName}
                                        onChange={e => setForm({ ...form, brandName: e.target.value })}
                                        onBlur={() => handleBlur('brandName')}
                                        error={touched.brandName && !form.brandName ? 'Wajib diisi' : undefined}
                                        touched={touched.brandName} required />
                                </div>
                                <div className="form-col-half slide-up" style={{ animationDelay: '0.1s' }}>
                                    <FormField label="Email" type="email" placeholder="email@example.com" value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        onBlur={() => handleBlur('email')}
                                        error={touched.email && !form.email ? 'Wajib diisi' : undefined}
                                        touched={touched.email} required />
                                </div>
                                <div className="form-col-half slide-up" style={{ animationDelay: '0.15s' }}>
                                    <FormField label="WhatsApp" placeholder="08xxxxxxxxxx" value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value })}
                                        onBlur={() => handleBlur('phone')}
                                        error={touched.phone && !form.phone ? 'Wajib diisi' : undefined}
                                        touched={touched.phone} required />
                                </div>
                                <div className="form-col-full slide-up" style={{ animationDelay: '0.2s' }}>
                                    <FormField label="Alamat Lengkap" as="textarea" placeholder="Nomer jalan, RT/RW, Patokan" value={form.address}
                                        onChange={e => setForm({ ...form, address: e.target.value })}
                                        onBlur={() => handleBlur('address')}
                                        error={touched.address && !form.address ? 'Wajib diisi' : undefined}
                                        touched={touched.address} required />
                                </div>

                                {/* New Address Details Fields */}
                                <div className="form-col-half slide-up" style={{ animationDelay: '0.22s' }}>
                                    <FormField label="Provinsi" as="select" value={form.province}
                                        onChange={e => {
                                            setForm({ ...form, province: e.target.value, city: '', district: '', village: '' });
                                        }}
                                        onBlur={() => handleBlur('province')}
                                        error={touched.province && !form.province ? 'Wajib diisi' : undefined}
                                        touched={touched.province} required
                                    >
                                        <option value="">Pilih Provinsi</option>
                                        {provinces.map(p => (
                                            <option key={p.id} value={p.name}>{p.name}</option>
                                        ))}
                                    </FormField>
                                </div>
                                <div className="form-col-half slide-up" style={{ animationDelay: '0.22s' }}>
                                    <FormField label="Kota/Kabupaten" as="select" value={form.city}
                                        onChange={e => {
                                            setForm({ ...form, city: e.target.value, district: '', village: '' });
                                        }}
                                        disabled={!cities.length}
                                        onBlur={() => handleBlur('city')}
                                        error={touched.city && !form.city ? 'Wajib diisi' : undefined}
                                        touched={touched.city} required
                                    >
                                        <option value="">Pilih Kota/Kabupaten</option>
                                        {cities.map(c => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                    </FormField>
                                </div>
                                <div className="form-col-half slide-up" style={{ animationDelay: '0.24s' }}>
                                    <FormField label="Kecamatan" as="select" value={form.district}
                                        onChange={e => {
                                            setForm({ ...form, district: e.target.value, village: '' });
                                        }}
                                        disabled={!districts.length}
                                    >
                                        <option value="">Pilih Kecamatan</option>
                                        {districts.map(d => (
                                            <option key={d.id} value={d.name}>{d.name}</option>
                                        ))}
                                    </FormField>
                                </div>
                                <div className="form-col-half slide-up" style={{ animationDelay: '0.24s' }}>
                                    <FormField label="Kelurahan" as="select" value={form.village}
                                        onChange={e => setForm({ ...form, village: e.target.value })}
                                        disabled={!villages.length}
                                    >
                                        <option value="">Pilih Kelurahan</option>
                                        {villages.map(v => (
                                            <option key={v.id} value={v.name}>{v.name}</option>
                                        ))}
                                    </FormField>
                                </div>
                                <div className="form-col-full slide-up" style={{ animationDelay: '0.26s' }}>
                                    <FormField label="Kode Pos" placeholder="Contoh: 85228" value={form.postalCode}
                                        onChange={e => setForm({ ...form, postalCode: e.target.value })} />
                                </div>

                                <div className="form-col-full slide-up" style={{ animationDelay: '0.3s' }}>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Lokasi Peta (Opsional)</label>
                                    <Map onLocationSelect={(lat, lng) => {
                                        setLocation({ lat, lng });
                                        // Map sync removed as requested
                                    }} />
                                    <p className="text-xs text-slate-500 mt-2">Geser pin untuk menandai lokasi tepat (tidak mempengaruhi alamat di atas).</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==================== STEP 3: DOMAIN ==================== */}
                    {step === 3 && (
                        <div className="step-content fade-in">
                            <div className="step-header">
                                <span className="step-badge">Langkah 3 dari 4</span>
                                <h2 className="step-title">Pilih Domain</h2>
                                <p className="step-desc">Tentukan alamat website bimbel Anda</p>
                            </div>

                            {/* Domain Mode Toggle */}
                            <div className="domain-toggle slide-up">
                                <button
                                    className={`domain-toggle-btn ${domainMode === 'subdomain' ? 'active' : ''}`}
                                    onClick={() => { setDomainMode('subdomain'); setDomainCheckResult(null); }}
                                >
                                    <span className="domain-toggle-icon">🆓</span>
                                    <span className="domain-toggle-label">Subdomain Gratis</span>
                                    <span className="domain-toggle-badge free">GRATIS</span>
                                </button>
                                <button
                                    className={`domain-toggle-btn ${domainMode === 'custom' ? 'active' : ''}`}
                                    onClick={() => { setDomainMode('custom'); setDomainCheckResult(null); }}
                                >
                                    <span className="domain-toggle-icon">🌐</span>
                                    <span className="domain-toggle-label">Custom Domain</span>
                                    <span className="domain-toggle-badge premium">PREMIUM</span>
                                </button>
                            </div>

                            {/* Subdomain Mode */}
                            {domainMode === 'subdomain' && (
                                <div className="domain-box slide-up" style={{ animationDelay: '0.1s' }}>
                                    <label className="domain-label">Subdomain Gratis</label>
                                    <div className="domain-input-row">
                                        <input className="domain-input" placeholder="namabimbel" value={form.subdomainRequested}
                                            onChange={e => setForm({ ...form, subdomainRequested: e.target.value, domainRequested: '' })} />
                                        <span className="domain-suffix">.bimbelpro.com</span>
                                    </div>
                                    {form.subdomainRequested && (
                                        <div className="domain-preview">
                                            🔗 <strong>{form.subdomainRequested}.bimbelpro.com</strong>
                                        </div>
                                    )}
                                    <div className="domain-hint">✅ Gratis selamanya, langsung aktif setelah pembayaran.</div>
                                </div>
                            )}

                            {/* Custom Domain Mode */}
                            {domainMode === 'custom' && (
                                <>
                                    <div className="domain-box slide-up" style={{ animationDelay: '0.1s' }}>
                                        <label className="domain-label">Cek Ketersediaan Domain</label>
                                        <div className="domain-check-row">
                                            <input
                                                className="domain-input"
                                                placeholder="namadomain"
                                                value={domainName}
                                                onChange={e => { setDomainName(e.target.value); setDomainCheckResult(null); }}
                                                onKeyDown={e => e.key === 'Enter' && checkDomain()}
                                            />
                                            <select
                                                className="domain-ext-select"
                                                value={selectedExt}
                                                onChange={e => { setSelectedExt(e.target.value); setDomainCheckResult(null); }}
                                            >
                                                {domainPrices.map((dp: DomainPriceItem) => (
                                                    <option key={dp.extension} value={dp.extension}>{dp.extension}</option>
                                                ))}
                                            </select>
                                            <button
                                                className="domain-check-btn"
                                                onClick={checkDomain}
                                                disabled={checkingDomain || !domainName.trim()}
                                            >
                                                {checkingDomain ? (
                                                    <span className="domain-check-spinner"></span>
                                                ) : '🔍 Cek'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Domain Check Result */}
                                    {domainCheckResult && (
                                        <div className={`domain-result ${domainCheckResult.available ? 'available' : 'taken'} slide-up`}>
                                            <span className="domain-result-icon">{domainCheckResult.available ? '✅' : '❌'}</span>
                                            <div className="domain-result-info">
                                                <div className="domain-result-name">{domainName}{selectedExt}</div>
                                                <div className="domain-result-msg">{domainCheckResult.message}</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Domain Price */}
                                    {selectedDomainPrice && (
                                        <div className="domain-price-card slide-up" style={{ animationDelay: '0.15s' }}>
                                            <div className="domain-price-left">
                                                <div className="domain-price-name">{selectedDomainPrice.label}</div>
                                                <div className="domain-price-desc">{selectedDomainPrice.description}</div>
                                            </div>
                                            <div className="domain-price-right">
                                                {selectedDomainPrice.promoActive && selectedDomainPrice.promoPrice != null ? (
                                                    <>
                                                        <div className="domain-original-price">Rp {formatRp(selectedDomainPrice.price)}</div>
                                                        <div className="domain-promo-price">Rp {formatRp(selectedDomainPrice.promoPrice)}</div>
                                                        <span className="domain-promo-badge">PROMO</span>
                                                    </>
                                                ) : (
                                                    <div className="domain-final-price">Rp {formatRp(selectedDomainPrice.price)}</div>
                                                )}
                                                <div className="domain-price-period">/tahun</div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="domain-hint" style={{ marginTop: '16px' }}>
                                        💡 Domain custom tersedia untuk semua paket. Biaya domain per tahun.
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ==================== STEP 4: REVIEW ==================== */}
                    {step === 4 && (
                        <div className="step-content fade-in">
                            <div className="step-header">
                                <span className="step-badge">Langkah 4 dari 4</span>
                                <h2 className="step-title">Review & Pembayaran</h2>
                                <p className="step-desc">Cek kembali pesanan Anda sebelum checkout</p>
                            </div>

                            {/* Order Summary */}
                            <div className="review-summary slide-up">
                                <h3 className="review-summary-title">🧾 Ringkasan Pesanan</h3>
                                <div className="review-grid">
                                    <div className="review-item">
                                        <div className="review-label">Paket Website</div>
                                        <div className="review-value">{selectedPkg?.name}</div>
                                    </div>
                                    <div className="review-item">
                                        <div className="review-label">Domain</div>
                                        <div className="review-value">
                                            {form.subdomainRequested
                                                ? `${form.subdomainRequested}.bimbelpro.com`
                                                : form.domainRequested || `${domainName}${selectedExt}`}
                                        </div>
                                    </div>
                                    <div className="review-item">
                                        <div className="review-label">Pemesan</div>
                                        <div className="review-value">{form.clientName}</div>
                                        <div className="review-sub">{form.email}</div>
                                    </div>
                                    <div className="review-item">
                                        <div className="review-label">WhatsApp</div>
                                        <div className="review-value">{form.phone}</div>
                                    </div>
                                </div>

                                {/* Price Breakdown */}
                                <div className="review-price-break">
                                    <div className="review-price-row">
                                        <span>Harga Paket</span>
                                        <span className="review-price-val">Rp {formatRp(selectedPkg?.price || 0)}</span>
                                    </div>
                                    {domainMode === 'custom' && selectedDomainPrice && (
                                        <div className="review-price-row">
                                            <span>Domain ({domainName}{selectedExt})</span>
                                            <span className="review-price-val accent">Rp {formatRp(domainDisplayPrice)}/thn</span>
                                        </div>
                                    )}
                                    <div className="review-price-total">
                                        <span>Total</span>
                                        <span>Rp {formatRp(totalPrice)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <h3 className="payment-title slide-up" style={{ animationDelay: '0.1s' }}>Pilih Metode Pembayaran</h3>

                            <div
                                className={`pay-option slide-up ${form.paymentType === 'full' ? 'selected' : ''}`}
                                style={{ animationDelay: '0.15s' }}
                                onClick={() => setForm({ ...form, paymentType: 'full' })}
                            >
                                <div className="pay-radio"><div className="pay-radio-dot"></div></div>
                                <div className="pay-info">
                                    <div className="pay-info-top">
                                        <div className="pay-name">💳 Pembayaran Penuh</div>
                                        <div className="pay-amount">Rp {formatRp(totalPrice)}</div>
                                    </div>
                                    <div className="pay-desc">Bayar lunas sekarang dan dapatkan prioritas pengerjaan</div>
                                </div>
                            </div>

                            <div
                                className={`pay-option slide-up ${form.paymentType === 'dp' ? 'selected' : ''}`}
                                style={{ animationDelay: '0.2s' }}
                                onClick={() => setForm({ ...form, paymentType: 'dp' })}
                            >
                                <div className="pay-radio"><div className="pay-radio-dot"></div></div>
                                <div className="pay-info">
                                    <div className="pay-info-top">
                                        <div className="pay-name">🏦 Down Payment (50%)</div>
                                        <div className="pay-amount">Rp {formatRp(Math.floor(totalPrice * 0.5))}</div>
                                    </div>
                                    <div className="pay-desc">Bayar DP dulu, sisanya setelah website selesai</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==================== STEP 5: SELESAI ==================== */}
                    {step === 5 && orderResult && (
                        <div className="step-content fade-in" style={{ textAlign: 'center', padding: '48px 24px' }}>
                            <div className="success-icon">🎉</div>
                            <h2 className="step-title" style={{ marginBottom: '8px' }}>Order Berhasil Dibuat!</h2>
                            <p className="step-desc" style={{ marginBottom: '32px' }}>Terima kasih telah mempercayakan website bimbel Anda kepada kami.</p>

                            <div className="success-card">
                                <div className="success-card-accent"></div>
                                <div className="success-row">
                                    <span className="success-label">Nomor Order</span>
                                    <span className="success-order-num">{orderResult.order.orderNumber}</span>
                                </div>
                                <div className="success-row">
                                    <span className="success-label">Status</span>
                                    <span className="badge badge-warning">Menunggu Pembayaran</span>
                                </div>
                                <div className="success-note">
                                    Silakan selesaikan pembayaran agar kami dapat segera memproses website Anda.
                                </div>
                            </div>

                            <div className="success-actions">
                                {orderResult.paymentUrl && (
                                    <a href={orderResult.paymentUrl} className="btn btn-primary btn-lg success-pay-btn">
                                        💳 Bayar Sekarang
                                    </a>
                                )}
                                <Link href="/cek-order" className="btn btn-secondary">Cek Status Order</Link>
                            </div>
                        </div>
                    )}

                    {/* ==================== NAVIGATION ==================== */}
                    {step < 5 && (
                        <div className="order-nav">
                            {step > 1 ? (
                                <button className="btn btn-secondary" onClick={handleBack}>← Kembali</button>
                            ) : (
                                <Link href="/" className="btn btn-secondary">← Beranda</Link>
                            )}
                            <div style={{ flex: 1 }}></div>
                            {step < 4 ? (
                                <button className="btn btn-primary" onClick={handleNext} disabled={!canNext()}>
                                    Lanjut →
                                </button>
                            ) : (
                                <button className="btn btn-primary btn-lg" disabled={!canNext() || loading} onClick={handleSubmit}>
                                    {loading && <span className="domain-check-spinner" style={{ marginRight: '8px' }}></span>}
                                    {loading ? 'Memproses...' : '🚀 Submit Order'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                /* ============ PAGE LAYOUT ============ */
                .order-page {
                    min-height: 100vh;
                    position: relative;
                    overflow: hidden;
                }
                .order-bg {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: 0;
                }
                .order-bg-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(120px);
                    opacity: 0.15;
                }
                .order-bg-orb-1 {
                    width: 600px; height: 600px;
                    top: -200px; right: -100px;
                    background: var(--accent);
                }
                .order-bg-orb-2 {
                    width: 400px; height: 400px;
                    bottom: -100px; left: -100px;
                    background: #8b5cf6;
                }
                .order-wrapper {
                    position: relative;
                    z-index: 1;
                    max-width: 780px;
                    margin: 0 auto;
                    padding: 100px 20px 60px;
                }

                /* ============ HEADER ============ */
                .order-header {
                    text-align: center;
                    margin-bottom: 40px;
                }
                .order-page-title {
                    font-size: 2rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, var(--text-primary), var(--accent));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 8px;
                }
                .order-page-subtitle {
                    color: var(--text-secondary);
                    font-size: 1rem;
                }

                /* ============ STEP BAR ============ */
                .step-bar {
                    margin-bottom: 32px;
                }
                .step-bar-track {
                    height: 4px;
                    background: var(--border);
                    border-radius: 4px;
                    position: relative;
                    overflow: hidden;
                    margin-bottom: 20px;
                }
                .step-bar-fill {
                    position: absolute;
                    top: 0; left: 0; bottom: 0;
                    background: linear-gradient(90deg, var(--accent), #fb923c);
                    border-radius: 4px;
                    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .step-nodes {
                    display: flex;
                    justify-content: space-between;
                }
                .step-node {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }
                .step-node-circle {
                    width: 44px; height: 44px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.1rem;
                    background: var(--bg-card);
                    border: 2px solid var(--border);
                    transition: all 0.3s;
                    color: var(--text-muted);
                }
                .step-node.active .step-node-circle {
                    border-color: var(--accent);
                    background: var(--accent);
                    color: white;
                    box-shadow: 0 0 20px var(--accent-glow);
                    transform: scale(1.1);
                }
                .step-node.done .step-node-circle {
                    border-color: var(--success);
                    background: var(--success);
                    color: white;
                }
                .step-node-label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    transition: color 0.3s;
                }
                .step-node.active .step-node-label { color: var(--accent); }
                .step-node.done .step-node-label { color: var(--success); }

                /* ============ MAIN CARD ============ */
                .order-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    padding: 40px;
                    min-height: 420px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                    backdrop-filter: blur(12px);
                }

                /* ============ STEP CONTENT ============ */
                .step-content { }
                .step-header {
                    text-align: center;
                    margin-bottom: 32px;
                }
                .step-badge {
                    display: inline-block;
                    padding: 4px 14px;
                    background: var(--accent-glow);
                    color: var(--accent);
                    font-size: 0.78rem;
                    font-weight: 700;
                    border-radius: 20px;
                    margin-bottom: 12px;
                    letter-spacing: 0.5px;
                }
                .step-title {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin-bottom: 6px;
                }
                .step-desc {
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                }

                /* ============ PACKAGE LIST ============ */
                .pkg-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .pkg-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 20px;
                    border-radius: 14px;
                    border: 2px solid var(--border);
                    cursor: pointer;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    background: var(--bg-secondary);
                    animation: slideUp 0.4s ease-out both;
                }
                .pkg-card:hover {
                    border-color: rgba(249, 115, 22, 0.3);
                    background: rgba(249, 115, 22, 0.03);
                    transform: translateY(-2px);
                }
                .pkg-card.selected {
                    border-color: var(--accent);
                    background: rgba(249, 115, 22, 0.06);
                    box-shadow: 0 0 0 3px var(--accent-glow), 0 4px 16px rgba(249,115,22,0.12);
                }
                .pkg-radio {
                    width: 22px; height: 22px;
                    border-radius: 50%;
                    border: 2px solid var(--text-muted);
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 2px;
                    transition: all 0.2s;
                }
                .pkg-card.selected .pkg-radio {
                    border-color: var(--accent);
                }
                .pkg-radio-dot {
                    width: 12px; height: 12px;
                    border-radius: 50%;
                    background: var(--accent);
                    transform: scale(0);
                    transition: transform 0.2s;
                }
                .pkg-card.selected .pkg-radio-dot {
                    transform: scale(1);
                }
                .pkg-info { flex: 1; min-width: 0; }
                .pkg-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 16px;
                    margin-bottom: 8px;
                }
                .pkg-name {
                    font-weight: 700;
                    font-size: 1.05rem;
                    color: var(--text-primary);
                }
                .pkg-desc {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin-top: 2px;
                }
                .pkg-price {
                    text-align: right;
                    flex-shrink: 0;
                }
                .pkg-price-label {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    font-weight: 600;
                }
                .pkg-price-value {
                    font-size: 1.15rem;
                    font-weight: 800;
                    color: var(--accent);
                }
                .pkg-features {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    margin-top: 4px;
                }
                .pkg-feature-tag {
                    font-size: 0.75rem;
                    padding: 2px 10px;
                    background: var(--bg-card);
                    border-radius: 20px;
                    color: var(--text-secondary);
                    border: 1px solid var(--border);
                }
                .pkg-feature-more {
                    font-size: 0.75rem;
                    padding: 2px 10px;
                    color: var(--accent);
                    font-weight: 600;
                }

                /* ============ FORM GRID ============ */
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0 20px;
                }
                .form-col-full { grid-column: 1 / -1; }
                .form-col-half { }

                /* ============ DOMAIN SECTION ============ */
                .domain-toggle {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 24px;
                }
                .domain-toggle-btn {
                    padding: 16px;
                    border: 2px solid var(--border);
                    border-radius: 14px;
                    background: var(--bg-secondary);
                    cursor: pointer;
                    transition: all 0.25s;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    color: var(--text-primary);
                    font-family: inherit;
                }
                .domain-toggle-btn:hover {
                    border-color: rgba(249, 115, 22, 0.3);
                }
                .domain-toggle-btn.active {
                    border-color: var(--accent);
                    background: rgba(249, 115, 22, 0.06);
                    box-shadow: 0 0 0 3px var(--accent-glow);
                }
                .domain-toggle-icon { font-size: 1.5rem; }
                .domain-toggle-label { font-weight: 700; font-size: 0.9rem; }
                .domain-toggle-badge {
                    font-size: 0.65rem;
                    padding: 2px 10px;
                    border-radius: 20px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }
                .domain-toggle-badge.free {
                    background: rgba(16, 185, 129, 0.15);
                    color: var(--success);
                }
                .domain-toggle-badge.premium {
                    background: var(--accent-glow);
                    color: var(--accent);
                }
                .domain-box {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 14px;
                    padding: 20px;
                }
                .domain-label {
                    display: block;
                    font-weight: 600;
                    font-size: 0.9rem;
                    margin-bottom: 10px;
                    color: var(--text-primary);
                }
                .domain-input-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .domain-input {
                    flex: 1;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    padding: 12px 16px;
                    color: var(--text-primary);
                    font-size: 0.95rem;
                    font-family: inherit;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .domain-input:focus {
                    border-color: var(--accent);
                    box-shadow: 0 0 0 3px var(--accent-glow);
                }
                .domain-suffix {
                    font-weight: 700;
                    color: var(--text-secondary);
                    white-space: nowrap;
                    font-size: 0.95rem;
                }
                .domain-preview {
                    margin-top: 12px;
                    padding: 10px 16px;
                    background: var(--bg-card);
                    border-radius: 8px;
                    font-size: 0.9rem;
                    color: var(--accent);
                }
                .domain-hint {
                    font-size: 0.82rem;
                    color: var(--text-muted);
                    margin-top: 10px;
                }
                .domain-check-row {
                    display: flex;
                    gap: 8px;
                }
                .domain-ext-select {
                    width: 120px;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    padding: 10px 12px;
                    color: var(--text-primary);
                    font-family: inherit;
                    font-size: 0.9rem;
                    cursor: pointer;
                    outline: none;
                }
                .domain-ext-select option {
                    background: var(--bg-secondary);
                }
                .domain-check-btn {
                    padding: 10px 20px;
                    background: var(--accent);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 700;
                    font-family: inherit;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s;
                    font-size: 0.9rem;
                }
                .domain-check-btn:hover:not(:disabled) {
                    background: var(--accent-hover);
                    transform: translateY(-1px);
                }
                .domain-check-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .domain-check-spinner {
                    display: inline-block;
                    width: 16px; height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                }

                /* Domain Result */
                .domain-result {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 20px;
                    border-radius: 12px;
                    margin-top: 16px;
                    border: 2px solid;
                }
                .domain-result.available {
                    border-color: var(--success);
                    background: rgba(16, 185, 129, 0.06);
                }
                .domain-result.taken {
                    border-color: var(--danger);
                    background: rgba(239, 68, 68, 0.06);
                }
                .domain-result-icon { font-size: 1.4rem; }
                .domain-result-name { font-weight: 700; font-size: 1rem; }
                .domain-result-msg {
                    font-size: 0.85rem;
                    margin-top: 2px;
                }
                .domain-result.available .domain-result-msg { color: var(--success); }
                .domain-result.taken .domain-result-msg { color: var(--danger); }

                /* Domain Price Card */
                .domain-price-card {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 14px;
                    margin-top: 16px;
                }
                .domain-price-name { font-weight: 700; margin-bottom: 4px; }
                .domain-price-desc { font-size: 0.82rem; color: var(--text-muted); }
                .domain-price-right { text-align: right; }
                .domain-original-price {
                    text-decoration: line-through;
                    color: var(--text-muted);
                    font-size: 0.82rem;
                }
                .domain-promo-price {
                    font-weight: 800;
                    color: var(--success);
                    font-size: 1.25rem;
                }
                .domain-promo-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    background: rgba(16, 185, 129, 0.15);
                    color: var(--success);
                    font-size: 0.65rem;
                    font-weight: 700;
                    border-radius: 20px;
                }
                .domain-final-price {
                    font-weight: 800;
                    color: var(--accent);
                    font-size: 1.25rem;
                }
                .domain-price-period {
                    font-size: 0.78rem;
                    color: var(--text-muted);
                }

                /* ============ REVIEW ============ */
                .review-summary {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 14px;
                    padding: 24px;
                    margin-bottom: 28px;
                }
                .review-summary-title {
                    font-size: 1rem;
                    font-weight: 700;
                    padding-bottom: 16px;
                    margin-bottom: 16px;
                    border-bottom: 1px solid var(--border);
                }
                .review-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 20px;
                }
                .review-label {
                    font-size: 0.78rem;
                    color: var(--text-muted);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                }
                .review-value {
                    font-weight: 700;
                    font-size: 0.95rem;
                    color: var(--text-primary);
                }
                .review-sub {
                    font-size: 0.82rem;
                    color: var(--text-muted);
                    margin-top: 2px;
                }
                .review-price-break {
                    border-top: 1px solid var(--border);
                    padding-top: 16px;
                }
                .review-price-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 6px 0;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                }
                .review-price-val { font-weight: 700; color: var(--text-primary); }
                .review-price-val.accent { color: var(--accent); }
                .review-price-total {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 0 0;
                    margin-top: 8px;
                    border-top: 1px dashed var(--border);
                    font-weight: 800;
                    font-size: 1.15rem;
                    color: var(--accent);
                }

                /* Payment Options */
                .payment-title {
                    font-size: 1.05rem;
                    font-weight: 700;
                    margin-bottom: 14px;
                    color: var(--text-primary);
                }
                .pay-option {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 20px;
                    border: 2px solid var(--border);
                    border-radius: 14px;
                    cursor: pointer;
                    transition: all 0.25s;
                    margin-bottom: 12px;
                    background: var(--bg-secondary);
                }
                .pay-option:hover {
                    border-color: rgba(249, 115, 22, 0.3);
                }
                .pay-option.selected {
                    border-color: var(--accent);
                    background: rgba(249, 115, 22, 0.06);
                    box-shadow: 0 0 0 3px var(--accent-glow);
                }
                .pay-radio {
                    width: 22px; height: 22px;
                    border-radius: 50%;
                    border: 2px solid var(--text-muted);
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: border-color 0.2s;
                }
                .pay-option.selected .pay-radio { border-color: var(--accent); }
                .pay-radio-dot {
                    width: 12px; height: 12px;
                    border-radius: 50%;
                    background: var(--accent);
                    transform: scale(0);
                    transition: transform 0.2s;
                }
                .pay-option.selected .pay-radio-dot { transform: scale(1); }
                .pay-info { flex: 1; }
                .pay-info-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4px;
                }
                .pay-name { font-weight: 700; font-size: 0.95rem; }
                .pay-amount { font-weight: 800; color: var(--accent); white-space: nowrap; }
                .pay-desc { font-size: 0.85rem; color: var(--text-secondary); }

                /* ============ SUCCESS ============ */
                .success-icon {
                    font-size: 4rem;
                    margin-bottom: 16px;
                    animation: bounce 1s ease-in-out;
                }
                .success-card {
                    max-width: 440px;
                    margin: 0 auto 28px;
                    text-align: left;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 14px;
                    padding: 24px;
                    position: relative;
                    overflow: hidden;
                }
                .success-card-accent {
                    position: absolute;
                    top: 0; left: 0;
                    width: 4px; height: 100%;
                    background: var(--success);
                }
                .success-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                .success-label {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }
                .success-order-num {
                    font-size: 1.3rem;
                    font-weight: 800;
                    color: var(--accent);
                    letter-spacing: 1px;
                }
                .success-note {
                    background: var(--bg-card);
                    padding: 14px 16px;
                    border-radius: 10px;
                    font-size: 0.88rem;
                    color: var(--text-secondary);
                    margin-top: 8px;
                }
                .success-actions {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }
                .success-pay-btn {
                    min-width: 250px;
                    animation: pulse 2s infinite;
                }

                /* ============ NAVIGATION ============ */
                .order-nav {
                    display: flex;
                    align-items: center;
                    margin-top: 32px;
                    padding-top: 24px;
                    border-top: 1px solid var(--border);
                }

                /* ============ ANIMATIONS ============ */
                .fade-in {
                    animation: fadeIn 0.5s ease-out;
                }
                .slide-up {
                    animation: slideUp 0.4s ease-out both;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes pulse {
                    0%, 100% { box-shadow: 0 0 0 0 var(--accent-glow); }
                    50% { box-shadow: 0 0 0 12px transparent; }
                }

                /* ============ RESPONSIVE ============ */
                @media (max-width: 640px) {
                    .order-wrapper { padding: 80px 16px 40px; }
                    .order-card { padding: 24px 18px; border-radius: 16px; }
                    .order-page-title { font-size: 1.5rem; }
                    .step-node-circle { width: 36px; height: 36px; font-size: 0.9rem; }
                    .step-node-label { font-size: 0.65rem; }
                    .form-grid { grid-template-columns: 1fr; }
                    .form-col-half { grid-column: 1; }
                    .domain-toggle { grid-template-columns: 1fr; }
                    .domain-check-row { flex-direction: column; }
                    .domain-ext-select { width: 100%; }
                    .pkg-top { flex-direction: column; gap: 8px; }
                    .pkg-price { text-align: left; }
                    .review-grid { grid-template-columns: 1fr; }
                    .pay-info-top { flex-direction: column; align-items: flex-start; gap: 4px; }
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
