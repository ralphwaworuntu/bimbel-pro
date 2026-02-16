'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ToastProvider';

export default function AdminGatewayPage() {
    const [configs, setConfigs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState('');
    const [testing, setTesting] = useState('');
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
            .catch(() => { })
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
            showToast(`Konfigurasi ${gateway} berhasil disimpan`, 'success');
        } catch {
            showToast('Gagal menyimpan konfigurasi', 'error');
        }
        setSaving('');
    };

    const toggleGateway = async (gateway: string, currentStatus: boolean) => {
        // If turning on, we need to save with isActive=true
        // If turning off, we need to save with isActive=false
        const config = gateway === 'midtrans' ? midtransForm : xenditForm;
        await saveGateway(gateway, config, !currentStatus);
    };

    const testConnection = (gateway: string) => {
        setTesting(gateway);
        // Simulation of API check
        setTimeout(() => {
            setTesting('');
            const isConfigured = gateway === 'midtrans'
                ? midtransForm.serverKey.length > 5
                : xenditForm.secretKey.length > 5;

            if (isConfigured) {
                showToast(`Koneksi ke API ${gateway} BERHASIL!`, 'success');
            } else {
                showToast(`Koneksi ke API ${gateway} GAGAL. Cek credential Anda.`, 'error');
            }
        }, 1500);
    };

    const midtransConfig = configs.find(c => c.gateway === 'midtrans');
    const xenditConfig = configs.find(c => c.gateway === 'xendit');

    if (loading) return <div className="loading-page" style={{ minHeight: '400px' }}><div className="loading-spinner"></div></div>;

    return (
        <div className="animate-fadeIn">
            <div className="admin-header">
                <div>
                    <h1 className="page-title">⚙️ Payment Gateway</h1>
                    <p className="page-subtitle">Kelola metode pembayaran otomatis untuk website Anda</p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="card" style={{ marginBottom: '32px', borderLeft: '4px solid var(--accent)', background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ fontSize: '1.5rem' }}>💡</div>
                    <div>
                        <h4 style={{ margin: '0 0 8px 0' }}>Panduan Integrasi</h4>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>
                            Masukkan API Key dari dashboard payment gateway pilihan Anda.
                            Pastikan untuk mengaktifkan mode <strong>Production</strong> saat website siap menerima pembayaran riil.
                            Sistem secara default menggunakan mode <strong>Sandbox</strong> jika tidak ada gateway yang aktif.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-1 gap-lg">
                {/* Midtrans Card */}
                <div className={`card ${midtransConfig?.isActive ? 'border-success' : ''}`} style={{ transition: 'all 0.3s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '48px', height: '48px', background: '#eef2ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                💳
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Midtrans</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                    <div className={`status-dot ${midtransConfig?.isActive ? 'online' : 'offline'}`}></div>
                                    <span style={{ fontSize: '0.85rem', color: midtransConfig?.isActive ? 'var(--success)' : 'var(--text-muted)' }}>
                                        {midtransConfig?.isActive ? 'Aktif' : 'Tidak Aktif'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={midtransConfig?.isActive || false}
                                onChange={() => toggleGateway('midtrans', midtransConfig?.isActive)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="grid grid-2 gap-md">
                        <div className="form-group">
                            <label className="form-label">Server Key</label>
                            <input
                                className="form-input"
                                type="password"
                                placeholder="SB-Mid-server-xxxxxxx"
                                value={midtransForm.serverKey}
                                onChange={e => setMidtransForm({ ...midtransForm, serverKey: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Client Key</label>
                            <input
                                className="form-input"
                                type="password"
                                placeholder="SB-Mid-client-xxxxxxx"
                                value={midtransForm.clientKey}
                                onChange={e => setMidtransForm({ ...midtransForm, clientKey: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ margin: '16px 0 24px' }}>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={midtransForm.isProduction}
                                onChange={e => setMidtransForm({ ...midtransForm, isProduction: e.target.checked })}
                            />
                            <span>Mode Production (Real Transactions)</span>
                        </label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => testConnection('midtrans')}
                            disabled={testing === 'midtrans'}
                        >
                            {testing === 'midtrans' ? 'Tes Koneksi...' : '🔌 Tes Koneksi'}
                        </button>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => saveGateway('midtrans', midtransForm, midtransConfig?.isActive)}
                            disabled={saving === 'midtrans'}
                        >
                            {saving === 'midtrans' ? 'Menyimpan...' : '💾 Simpan Perubahan'}
                        </button>
                    </div>
                </div>

                {/* Xendit Card */}
                <div className={`card ${xenditConfig?.isActive ? 'border-success' : ''}`} style={{ transition: 'all 0.3s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '48px', height: '48px', background: '#f5f3ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                🔮
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Xendit</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                    <div className={`status-dot ${xenditConfig?.isActive ? 'online' : 'offline'}`}></div>
                                    <span style={{ fontSize: '0.85rem', color: xenditConfig?.isActive ? 'var(--success)' : 'var(--text-muted)' }}>
                                        {xenditConfig?.isActive ? 'Aktif' : 'Tidak Aktif'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={xenditConfig?.isActive || false}
                                onChange={() => toggleGateway('xendit', xenditConfig?.isActive)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="grid grid-2 gap-md">
                        <div className="form-group">
                            <label className="form-label">Secret Key</label>
                            <input
                                className="form-input"
                                type="password"
                                placeholder="xnd_development_xxxxxxx"
                                value={xenditForm.secretKey}
                                onChange={e => setXenditForm({ ...xenditForm, secretKey: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Public Key</label>
                            <input
                                className="form-input"
                                type="password"
                                placeholder="xnd_public_development_xxxxxxx"
                                value={xenditForm.publicKey}
                                onChange={e => setXenditForm({ ...xenditForm, publicKey: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Webhook Verification Token</label>
                        <input
                            className="form-input"
                            type="password"
                            placeholder="Token untuk verifikasi integritas webhook"
                            value={xenditForm.webhookToken}
                            onChange={e => setXenditForm({ ...xenditForm, webhookToken: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '16px' }}>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => testConnection('xendit')}
                            disabled={testing === 'xendit'}
                        >
                            {testing === 'xendit' ? 'Tes Koneksi...' : '🔌 Tes Koneksi'}
                        </button>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => saveGateway('xendit', xenditForm, xenditConfig?.isActive)}
                            disabled={saving === 'xendit'}
                        >
                            {saving === 'xendit' ? 'Menyimpan...' : '💾 Simpan Perubahan'}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .border-success {
                    border: 1px solid var(--success) !important;
                    box-shadow: 0 0 0 1px var(--success);
                }
                .status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }
                .status-dot.online {
                    background: var(--success);
                    box-shadow: 0 0 8px var(--success);
                }
                .status-dot.offline {
                    background: var(--text-muted);
                }
                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    user-select: none;
                }
            `}</style>
        </div>
    );
}
