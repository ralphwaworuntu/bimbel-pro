'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ToastProvider';

// --- STYLED COMPONENTS (Internal) ---

const SectionTitle = ({ title, description }: { title: string, description?: string }) => (
    <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {title}
        </h3>
        {description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>{description}</p>}
    </div>
);

const InputGroup = ({ label, children, description }: any) => (
    <div className="form-group" style={{ marginBottom: '24px' }}>
        <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', display: 'block' }}>{label}</label>
        {children}
        {description && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>{description}</p>}
    </div>
);

const ActionBar = ({ children }: { children: React.ReactNode }) => (
    <div className="action-bar-wrapper">
        <div className="action-bar">
            {children}
        </div>
        <style jsx>{`
            .action-bar-wrapper {
                position: sticky;
                bottom: 24px;
                z-index: 50;
                margin-top: 40px;
                pointer-events: none; /* Let clicks pass through empty space */
            }
            .action-bar {
                background: rgba(26, 31, 53, 0.9);
                backdrop-filter: blur(16px);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 16px;
                padding: 16px 24px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                pointer-events: auto; /* Re-enable clicks on bar */
                transform: translateY(0);
                transition: transform 0.3s ease;
            }
            .action-bar:hover {
                transform: translateY(-2px);
                border-color: rgba(255,255,255,0.2);
            }
        `}</style>
    </div>
);


// --- HELPER: Auto-resize image to max 512px (maintain aspect ratio) ---
const resizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.src = url;
        img.onload = () => {
            URL.revokeObjectURL(url);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas context failed'));

            const maxSize = 512;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxSize) {
                    height *= maxSize / width;
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width *= maxSize / height;
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;

            // Clear (transparent)
            ctx.clearRect(0, 0, width, height);

            // Draw
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(blob => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas conversion failed'));
            }, file.type, 0.9);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Image load failed'));
        };
    });
};

// --- TABS COMPONENTS ---

function GeneralSettings() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const [form, setForm] = useState({
        appName: '',
        appLogo: '',
        companyName: '',
        address: '',
        contactEmail: '',
        contactPhone: '',
        updatedAt: ''
    });

    useEffect(() => {
        fetch('/api/config/app')
            .then(res => res.json())
            .then(data => {
                if (!data.error) setForm(data);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch('/api/config/app', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            showToast('Pengaturan umum berhasil disimpan', 'success');
        } catch {
            showToast('Terjadi kesalahan', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleFile = async (file: File) => {
        setUploading(true);

        try {
            // Auto-resize before upload
            let fileToUpload: Blob = file;
            try {
                fileToUpload = await resizeImage(file);
            } catch (err) {
                console.warn('Resize failed, using original', err);
            }

            const formData = new FormData();
            formData.append('file', fileToUpload, file.name);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setForm(prev => ({ ...prev, appLogo: data.url }));
                showToast('Logo berhasil diupload & otomatis disesuaikan (512px)', 'success');
            } else {
                showToast('Gagal upload: ' + data.message, 'error');
            }
        } catch {
            showToast('Gagal mengupload file', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = useCallback((e: any) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e: any) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    if (loading) return <div className="p-8 text-center text-muted">Memuat pengaturan...</div>;

    return (
        <div className="animate-fadeIn pb-12">
            <SectionTitle
                title="Identitas Aplikasi"
                description="Informasi ini akan digunakan pada Header Website, Invoice, dan Email Notifikasi."
            />

            <div className="card-glass" style={{ marginBottom: '30px', display: 'block' }}>
                <div className="grid grid-2 gap-lg mb-6">
                    <InputGroup label="Nama Aplikasi">
                        <input className="form-input" value={form.appName} onChange={e => setForm({ ...form, appName: e.target.value })} placeholder="Bimbel Pro" />
                    </InputGroup>
                    <InputGroup label="Nama Perusahaan (Invoice)">
                        <input className="form-input" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} placeholder="PT Bimbel Pro Indonesia" />
                    </InputGroup>
                </div>

                <InputGroup label="Logo Aplikasi" description="Format: PNG, JPG, atau WEBP. Disarankan persegi/landscape, background transparan.">
                    <div
                        className={`upload-zone ${dragActive ? 'active' : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input type="file" id="logo-upload" className="hidden-input" onChange={handleChange} accept="image/*" />

                        {form.appLogo ? (
                            <div className="preview-container w-full flex flex-col items-center">
                                <div className="preview-image-wrapper">
                                    <img src={form.appLogo} alt="Logo Preview" />
                                </div>
                                <div className="preview-actions text-center mt-4">
                                    <div className="flex items-center justify-center gap-2 mb-3 text-green-400 font-medium">
                                        <span>✅ Logo Terpasang</span>
                                    </div>
                                    <label htmlFor="logo-upload" className="btn btn-secondary btn-sm cursor-pointer hover:bg-white/10 transition-colors">
                                        {uploading ? 'Mengupload...' : 'Ganti Logo'}
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state text-center">
                                <div className="text-5xl opacity-30 mb-4">📷</div>
                                <div>
                                    <p className="font-semibold text-lg mb-1">Drag & drop logo disini</p>
                                    <p className="text-sm text-gray-400">atau <label htmlFor="logo-upload" className="text-orange-500 hover:text-orange-400 cursor-pointer underline">pilih file</label> dari komputer</p>
                                </div>
                                {uploading && <p className="text-orange-500 mt-3 text-sm animate-pulse">Sedang mengupload...</p>}
                            </div>
                        )}
                    </div>
                </InputGroup>

                <div className="mt-4 opacity-60 hover:opacity-100 transition-opacity">
                    <label className="text-xs text-muted mb-1 block">Atau gunakan URL eksternal:</label>
                    <input className="form-input text-sm bg-black/20" value={form.appLogo} onChange={e => setForm({ ...form, appLogo: e.target.value })} placeholder="https://example.com/logo.png" />
                </div>
            </div>

            <SectionTitle title="Kontak & Alamat" description="Informasi kontak yang akan ditampilkan di footer website dan invoice." />

            <div className="card mb-8">
                <div className="grid grid-2 gap-lg">
                    <InputGroup label="Email Resmi">
                        <input className="form-input" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} placeholder="support@bimbelpro.com" />
                    </InputGroup>
                    <InputGroup label="Nomor WhatsApp">
                        <input className="form-input" value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} placeholder="0812-3456-7890" />
                    </InputGroup>
                </div>
                <InputGroup label="Alamat Lengkap">
                    <textarea className="form-textarea" rows={3} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Jl. Raya Contoh No. 123, Jakarta Selatan..." />
                </InputGroup>
            </div>

            <ActionBar>
                <div className="text-sm text-gray-400 hidden md:block">
                    Pastikan data identitas sudah benar sebelum menyimpan.
                </div>
                <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
                    {saving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
                </button>
            </ActionBar>

            <style jsx>{`
                .upload-zone {
                    border: 2px dashed var(--border);
                    border-radius: 16px;
                    padding: 40px;
                    text-align: center;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    background: rgba(255,255,255,0.02);
                    min-height: 280px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                }
                .upload-zone:hover {
                    border-color: var(--border-light);
                    background: rgba(255,255,255,0.04);
                }
                .upload-zone.active {
                    border-color: var(--accent);
                    background: rgba(249, 115, 22, 0.08);
                    transform: scale(1.01);
                }
                .hidden-input {
                    display: none;
                }
                .preview-image-wrapper {
                    width: 100%;
                    max-width: 300px;
                    height: 140px;
                    background-image: linear-gradient(45deg, #1a1f35 25%, transparent 25%), linear-gradient(-45deg, #1a1f35 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1f35 75%), linear-gradient(-45deg, transparent 75%, #1a1f35 75%);
                    background-size: 20px 20px;
                    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                    background-color: #111827;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid var(--border);
                    overflow: hidden;
                    padding: 16px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                .preview-image-wrapper img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
                }
            `}</style>
        </div>
    );
}

function EmailSettings() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        host: '',
        port: 587,
        secure: false,
        user: '',
        password: '',
        fromName: '',
        fromEmail: ''
    });

    useEffect(() => {
        fetch('/api/config/email')
            .then(res => res.json())
            .then(data => {
                if (!data.error) setForm({ ...data, password: data.password || '' });
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch('/api/config/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            showToast('Konfigurasi email berhasil disimpan', 'success');
        } catch {
            showToast('Terjadi kesalahan', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-fadeIn pb-12">
            <SectionTitle
                title="SMTP Server Config"
                description="Konfigurasi server email untuk pengiriman notifikasi otomatis (Invoice, Akun Baru, dll)."
            />

            <div className="card-glass" style={{ marginBottom: '30px', display: 'block' }}>
                <div className="grid grid-2 gap-lg">
                    <InputGroup label="SMTP Host">
                        <input className="form-input" value={form.host} onChange={e => setForm({ ...form, host: e.target.value })} placeholder="smtp.gmail.com" />
                    </InputGroup>
                    <div className="grid grid-2 gap-md">
                        <InputGroup label="Port">
                            <input type="number" className="form-input" value={form.port} onChange={e => setForm({ ...form, port: parseInt(e.target.value) })} placeholder="587" />
                        </InputGroup>
                        <InputGroup label="Encryption">
                            <div className="flex items-center h-full pt-4">
                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <input type="checkbox" checked={form.secure} onChange={e => setForm({ ...form, secure: e.target.checked })} className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500" />
                                    <span className="text-sm font-medium">Secure (SSL/TLS)</span>
                                </label>
                            </div>
                        </InputGroup>
                    </div>
                </div>

                <div className="grid grid-2 gap-lg mt-4">
                    <InputGroup label="SMTP Username">
                        <input className="form-input" value={form.user} onChange={e => setForm({ ...form, user: e.target.value })} placeholder="user@gmail.com" />
                    </InputGroup>
                    <InputGroup label="SMTP Password" description="Biarkan kosong jika tidak ingin mengubah password.">
                        <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                    </InputGroup>
                </div>
            </div>

            <SectionTitle title="Identitas Pengirim" description="Nama dan email yang akan muncul di inbox penerima." />

            <div className="card mb-8">
                <div className="grid grid-2 gap-lg">
                    <InputGroup label="Nama Pengirim">
                        <input className="form-input" value={form.fromName} onChange={e => setForm({ ...form, fromName: e.target.value })} placeholder="Bimbel Pro Admin" />
                    </InputGroup>
                    <InputGroup label="Email Pengirim (Reply-To)">
                        <input className="form-input" value={form.fromEmail} onChange={e => setForm({ ...form, fromEmail: e.target.value })} placeholder="noreply@bimbelpro.com" />
                    </InputGroup>
                </div>
            </div>

            <ActionBar>
                <button className="btn btn-secondary" disabled>📨 Test Email (Soon)</button>
                <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
                    {saving ? 'Menyimpan...' : '💾 Simpan Konfigurasi'}
                </button>
            </ActionBar>
        </div>
    );
}

const ModernToggle = ({ checked, onChange, disabled }: { checked: boolean, onChange: (checked: boolean) => void, disabled?: boolean }) => (
    <div
        onClick={() => !disabled && onChange(!checked)}
        className={`modern-toggle ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}`}
    >
        <div className="knob">
            {checked && <span className="check-icon">✓</span>}
        </div>
        <style jsx>{`
            .modern-toggle {
                width: 52px;
                height: 28px;
                background: #374151;
                border-radius: 99px;
                position: relative;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border: 1px solid rgba(255,255,255,0.1);
            }
            .modern-toggle.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .modern-toggle:hover:not(.disabled) {
                background: #4b5563;
            }
            .modern-toggle.checked {
                background: var(--success);
                box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
                border-color: transparent;
            }
            .knob {
                width: 22px;
                height: 22px;
                background: white;
                border-radius: 50%;
                position: absolute;
                top: 2px;
                left: 3px;
                transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .modern-toggle.checked .knob {
                left: calc(100% - 25px);
                transform: rotate(360deg);
            }
            .check-icon {
                font-size: 14px;
                color: var(--success);
                font-weight: bold;
            }
        `}</style>
    </div>
);

function PaymentSettings() {
    const [configs, setConfigs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState('');
    const { showToast } = useToast();

    const [midtransForm, setMidtransForm] = useState({ serverKey: '', clientKey: '', isProduction: false });
    const [xenditForm, setXenditForm] = useState({ secretKey: '', publicKey: '', webhookToken: '' });

    const fetchConfigs = () => {
        fetch('/api/gateway-config')
            .then(r => r.json())
            .then((data) => {
                setConfigs(data);
                const mt = data.find((c: any) => c.gateway === 'midtrans');
                const xn = data.find((c: any) => c.gateway === 'xendit');
                if (mt?.config) setMidtransForm(mt.config);
                if (xn?.config) setXenditForm(xn.config);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchConfigs(); }, []);

    const saveGateway = async (gateway: string, config: any, activate: boolean) => {
        setSaving(gateway);
        try {
            await fetch('/api/gateway-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gateway, config, isActive: activate }),
            });
            await fetchConfigs();
            showToast(`${gateway} settings saved`, 'success');
        } catch {
            showToast('Save failed', 'error');
        }
        setSaving('');
    };

    const toggleGateway = async (gateway: string, currentStatus: boolean) => {
        const config = gateway === 'midtrans' ? midtransForm : xenditForm;
        await saveGateway(gateway, config, !currentStatus);
    };

    const midtransConfig = configs.find(c => c.gateway === 'midtrans');
    const xenditConfig = configs.find(c => c.gateway === 'xendit');

    return (
        <div className="animate-fadeIn pb-12">
            <SectionTitle title="Payment Gateway Info" description="Aktifkan salah satu gateway untuk menerima pembayaran otomatis." />

            <div className="grid grid-1 gap-xl">
                {/* Midtrans */}
                <div className={`card ${midtransConfig?.isActive ? 'border-accent' : ''} transition-all hover-glow`}>
                    <div className="payment-header mb-6">
                        {/* 1. Toggle Left */}
                        <div className="header-left">
                            <ModernToggle
                                checked={midtransConfig?.isActive || false}
                                onChange={() => toggleGateway('midtrans', midtransConfig?.isActive)}
                                disabled={saving === 'midtrans'}
                            />
                        </div>

                        {/* 2. Brand Center (Absolute) */}
                        <div className="header-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-900/40 flex items-center justify-center text-xl shadow-lg border border-blue-500/20">💳</div>
                                <h3 className="font-bold text-xl tracking-wide">Midtrans</h3>
                            </div>
                        </div>

                        {/* 3. Status Right */}
                        <div className="header-right">
                            <div className={`status-badge ${midtransConfig?.isActive ? 'active' : ''}`}>
                                <span className="dot"></span>
                                <span className="status-text">{midtransConfig?.isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-2 gap-lg mt-8">
                        <InputGroup label="Server Key">
                            <input className="form-input" type="password" value={midtransForm.serverKey} onChange={e => setMidtransForm({ ...midtransForm, serverKey: e.target.value })} placeholder="SB-Mid-server-..." />
                        </InputGroup>
                        <InputGroup label="Client Key">
                            <input className="form-input" type="password" value={midtransForm.clientKey} onChange={e => setMidtransForm({ ...midtransForm, clientKey: e.target.value })} placeholder="SB-Mid-client-..." />
                        </InputGroup>
                    </div>
                    <div className="mt-8 text-right border-t border-white/10 pt-6">
                        <button className="btn btn-primary btn-sm" onClick={() => saveGateway('midtrans', midtransForm, midtransConfig?.isActive)} disabled={saving === 'midtrans'}>
                            {saving === 'midtrans' ? 'Saving...' : '💾 Save Midtrans'}
                        </button>
                    </div>
                </div>

                {/* Xendit */}
                <div className={`card ${xenditConfig?.isActive ? 'border-accent' : ''} transition-all hover-glow`}>
                    <div className="payment-header mb-6">
                        {/* 1. Toggle Left */}
                        <div className="header-left">
                            <ModernToggle
                                checked={xenditConfig?.isActive || false}
                                onChange={() => toggleGateway('xendit', xenditConfig?.isActive)}
                                disabled={saving === 'xendit'}
                            />
                        </div>

                        {/* 2. Brand Center */}
                        <div className="header-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-900/40 flex items-center justify-center text-xl shadow-lg border border-purple-500/20">🔮</div>
                                <h3 className="font-bold text-xl tracking-wide">Xendit</h3>
                            </div>
                        </div>

                        {/* 3. Status Right */}
                        <div className="header-right">
                            <div className={`status-badge ${xenditConfig?.isActive ? 'active' : ''}`}>
                                <span className="dot"></span>
                                <span className="status-text">{xenditConfig?.isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-2 gap-lg mt-8">
                        <InputGroup label="Secret Key">
                            <input className="form-input" type="password" value={xenditForm.secretKey} onChange={e => setXenditForm({ ...xenditForm, secretKey: e.target.value })} />
                        </InputGroup>
                        <InputGroup label="Public Key">
                            <input className="form-input" type="password" value={xenditForm.publicKey} onChange={e => setXenditForm({ ...xenditForm, publicKey: e.target.value })} />
                        </InputGroup>
                    </div>
                    <div className="mt-8 text-right border-t border-white/10 pt-6">
                        <button className="btn btn-primary btn-sm" onClick={() => saveGateway('xendit', xenditForm, xenditConfig?.isActive)} disabled={saving === 'xendit'}>
                            {saving === 'xendit' ? 'Saving...' : '💾 Save Xendit'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center text-sm text-muted">
                <p>Data credentials dienkripsi dan disimpan aman di database.</p>
            </div>
            <style jsx>{`
                .gap-xl {
                    gap: 32px;
                }
                .payment-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    position: relative;
                    height: 50px;
                }
                .header-left {
                    z-index: 10;
                    display: flex;
                    align-items: center;
                }
                .header-center {
                    position: absolute;
                    left: 0;
                    right: 0;
                    display: flex;
                    justify-content: center;
                    pointer-events: none; /* Let clicks pass through */
                }
                .header-right {
                    z-index: 10;
                    display: flex;
                    align-items: center;
                }
                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 12px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 99px;
                    border: 1px solid rgba(255,255,255,0.1);
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    transition: all 0.3s ease;
                }
                .status-badge.active {
                    background: rgba(16, 185, 129, 0.1);
                    border-color: rgba(16, 185, 129, 0.3);
                    color: var(--success);
                }
                .dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #6b7280;
                    box-shadow: 0 0 5px rgba(0,0,0,0.2);
                }
                .status-badge.active .dot {
                    background: var(--success);
                    box-shadow: 0 0 8px var(--success);
                }
            `}</style>
        </div>
    );
}

// --- MAIN LAYOUT PAGE ---

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');

    const menuItems = [
        { id: 'general', label: '🏢 Umum & Invoice', desc: 'Identitas brand & kontak' },
        { id: 'email', label: '📧 Email Notifikasi', desc: 'SMTP & template email' },
        { id: 'payment', label: '💳 Payment Gateway', desc: 'Midtrans & Xendit' },
    ];

    return (
        <div className="animate-fadeIn">
            <div className="admin-header mb-8">
                <h1 className="page-title">⚙️ Pengaturan Sistem</h1>
                <p className="page-subtitle">Pusat kendali konfigurasi aplikasi Bimbel Pro</p>
            </div>

            <div className="settings-layout">
                {/* Sidebar Navigation */}
                <aside className="settings-sidebar">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`settings-nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <span className="nav-label">{item.label}</span>
                            <span className="nav-desc">{item.desc}</span>
                        </button>
                    ))}
                </aside>

                {/* Content Area */}
                <main className="settings-content">
                    {activeTab === 'general' && <GeneralSettings />}
                    {activeTab === 'email' && <EmailSettings />}
                    {activeTab === 'payment' && <PaymentSettings />}
                </main>
            </div>

            <style jsx>{`
                .settings-layout {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 40px;
                    align-items: start;
                }

                .settings-sidebar {
                    position: sticky;
                    top: 100px;
                }

                .settings-nav-item {
                    display: block;
                    width: 100%;
                    text-align: left;
                    padding: 16px 20px;
                    background: transparent;
                    border: 1px solid transparent;
                    border-radius: 12px;
                    margin-bottom: 8px;
                    transition: all 0.2s ease;
                }

                .settings-nav-item:hover {
                    background: rgba(255, 255, 255, 0.03);
                }

                .settings-nav-item.active {
                    background: rgba(249, 115, 22, 0.1); 
                    border: 1px solid rgba(249, 115, 22, 0.2);
                    box-shadow: 0 0 20px rgba(0,0,0,0.2);
                }

                .settings-nav-item .nav-label {
                    display: block;
                    font-weight: 600;
                    color: var(--text-secondary);
                    font-size: 1rem;
                    margin-bottom: 4px;
                }

                .settings-nav-item.active .nav-label {
                    color: var(--accent);
                }

                .settings-nav-item .nav-desc {
                    display: block;
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                .settings-content {
                    min-height: 500px;
                }
                
                .border-accent {
                    border-color: var(--accent) !important;
                    box-shadow: 0 0 0 1px var(--accent);
                }

                @media (max-width: 768px) {
                    .settings-layout {
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }
                    .settings-sidebar {
                        display: flex;
                        overflow-x: auto;
                        gap: 12px;
                        padding-bottom: 12px;
                        position: static;
                    }
                    .settings-nav-item {
                        min-width: 200px;
                        margin-bottom: 0;
                    }
                }
                
                .gap-xl {
                    gap: 32px;
                }
            `}</style>
        </div>
    );
}
