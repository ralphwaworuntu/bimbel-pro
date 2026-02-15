'use client';

import { useEffect, useState } from 'react';

export default function AdminGatewayPage() {
    const [configs, setConfigs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState('');
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
            fetchConfigs();
        } catch { }
        setSaving('');
    };

    const deactivateAll = async () => {
        setSaving('deactivate');
        for (const gw of ['midtrans', 'xendit']) {
            const cfg = configs.find(c => c.gateway === gw);
            if (cfg?.isActive) {
                await fetch('/api/gateway-config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gateway: gw, config: cfg.config, isActive: false }),
                });
            }
        }
        fetchConfigs();
        setSaving('');
    };

    const midtransConfig = configs.find(c => c.gateway === 'midtrans');
    const xenditConfig = configs.find(c => c.gateway === 'xendit');

    if (loading) return <div className="loading-page" style={{ minHeight: '400px' }}><div className="spinner"></div></div>;

    return (
        <>
            <div className="admin-header">
                <div>
                    <h1 className="page-title">⚙️ Payment Gateway</h1>
                    <p className="page-subtitle">Konfigurasi API payment gateway Anda</p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))', borderColor: 'rgba(59,130,246,0.2)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                    💡 <strong>Cara Penggunaan:</strong> Masukkan API key dari payment gateway pilihan Anda,
                    lalu klik <strong>"Simpan & Aktifkan"</strong>. Hanya <strong>satu gateway</strong> yang bisa aktif pada satu waktu.
                    Jika tidak ada yang diaktifkan, sistem akan menggunakan sandbox (simulasi).
                </p>
            </div>

            {/* Current Active */}
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Gateway Aktif:</span>
                {midtransConfig?.isActive ? (
                    <span className="badge badge-success">✅ Midtrans</span>
                ) : xenditConfig?.isActive ? (
                    <span className="badge badge-success">✅ Xendit</span>
                ) : (
                    <span className="badge badge-warning">🧪 Sandbox (Simulasi)</span>
                )}
                {(midtransConfig?.isActive || xenditConfig?.isActive) && (
                    <button className="btn btn-secondary btn-sm" onClick={deactivateAll} disabled={saving === 'deactivate'}>
                        Gunakan Sandbox
                    </button>
                )}
            </div>

            {/* Midtrans */}
            <div className={`gateway-card ${midtransConfig?.isActive ? 'active-gw' : ''}`}>
                <div className="gateway-header">
                    <div className="gateway-name">
                        💳 Midtrans
                        {midtransConfig?.isActive && <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>AKTIF</span>}
                    </div>
                </div>

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
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label className="toggle-switch">
                        <input type="checkbox" checked={midtransForm.isProduction} onChange={e => setMidtransForm({ ...midtransForm, isProduction: e.target.checked })} />
                        <span className="toggle-slider"></span>
                    </label>
                    <span style={{ fontSize: '0.9rem' }}>Mode Production</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => saveGateway('midtrans', midtransForm, false)} disabled={!!saving}>
                        {saving === 'midtrans' ? 'Menyimpan...' : '💾 Simpan'}
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => saveGateway('midtrans', midtransForm, true)} disabled={!!saving}>
                        ✅ Simpan & Aktifkan
                    </button>
                </div>
            </div>

            {/* Xendit */}
            <div className={`gateway-card ${xenditConfig?.isActive ? 'active-gw' : ''}`}>
                <div className="gateway-header">
                    <div className="gateway-name">
                        🔮 Xendit
                        {xenditConfig?.isActive && <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>AKTIF</span>}
                    </div>
                </div>

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
                    <label className="form-label">Public Key (Opsional)</label>
                    <input
                        className="form-input"
                        type="password"
                        placeholder="xnd_public_development_xxxxxxx"
                        value={xenditForm.publicKey}
                        onChange={e => setXenditForm({ ...xenditForm, publicKey: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Webhook Verification Token (Opsional)</label>
                    <input
                        className="form-input"
                        type="password"
                        placeholder="Token untuk verifikasi webhook"
                        value={xenditForm.webhookToken}
                        onChange={e => setXenditForm({ ...xenditForm, webhookToken: e.target.value })}
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => saveGateway('xendit', xenditForm, false)} disabled={!!saving}>
                        {saving === 'xendit' ? 'Menyimpan...' : '💾 Simpan'}
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => saveGateway('xendit', xenditForm, true)} disabled={!!saving}>
                        ✅ Simpan & Aktifkan
                    </button>
                </div>
            </div>
        </>
    );
}
