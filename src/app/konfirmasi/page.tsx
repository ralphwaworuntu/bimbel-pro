'use client';

import { Suspense, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';

function PaymentConfirmationContent() {
    const searchParams = useSearchParams();
    const initialOrderNumber = searchParams.get('order') || '';
    const { showToast } = useToast();

    const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (selectedFile: File) => {
        if (selectedFile.size > 5 * 1024 * 1024) {
            showToast('Ukuran file maksimal 5MB', 'error');
            return;
        }
        if (!selectedFile.type.startsWith('image/')) {
            showToast('File harus berupa gambar', 'error');
            return;
        }
        setFile(selectedFile);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderNumber || !file) {
            showToast('Mohon lengkapi semua data', 'warning');
            return;
        }

        setLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append('orderNumber', orderNumber);
        formData.append('proof', file);

        try {
            const res = await fetch('/api/payment/confirm', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (res.ok) {
                setResult({ success: true, message: 'Bukti pembayaran berhasil dikirim! Kami akan segera memverifikasi pesanan Anda.' });
                setFile(null);
                setOrderNumber('');
                showToast('Konfirmasi berhasil! 🎉', 'success');
            } else {
                setResult({ success: false, message: data.error || 'Gagal mengirim bukti pembayaran' });
                showToast(data.error || 'Gagal mengirim bukti pembayaran', 'error');
            }
        } catch (err) {
            setResult({ success: false, message: 'Terjadi kesalahan jaringan' });
            showToast('Terjadi kesalahan jaringan', 'error');
        }
        setLoading(false);
    };

    return (
        <div className="order-track">
            <div className="animate-fadeInUp" style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📤</div>
                <h1 className="page-title">Konfirmasi Pembayaran</h1>
                <p className="page-subtitle">Silakan upload bukti transfer Anda untuk mempercepat proses verifikasi</p>
            </div>

            <div className="card animate-fadeInUp" style={{ maxWidth: '600px', margin: '0 auto' }}>
                {result?.success ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>Terima Kasih!</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>{result.message}</p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <Link href="/cek-order" className="btn btn-primary">
                                Cek Status Order
                            </Link>
                            <button onClick={() => setResult(null)} className="btn btn-secondary">
                                Konfirmasi Lainnya
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Nomor Order</label>
                            <input
                                className="form-input"
                                placeholder="Contoh: ORD-2601-XXXX"
                                value={orderNumber}
                                onChange={e => setOrderNumber(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Bukti Transfer</label>
                            <div
                                className={`upload-zone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    id="proof-upload"
                                />
                                <label htmlFor="proof-upload" style={{ cursor: 'pointer', display: 'block', width: '100%', height: '100%' }}>
                                    {file ? (
                                        <div className="file-info">
                                            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📄</div>
                                            <div style={{ fontWeight: 600, color: 'var(--accent)' }}>{file.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                                            <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Klik atau drag file lain untuk mengganti</div>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder">
                                            <div style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.5 }}>📷</div>
                                            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Klik atau Drag & Drop file di sini</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Format: JPG, PNG (Max 5MB)</div>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', marginTop: '16px' }}
                        >
                            {loading ? (
                                <>
                                    <span className="domain-check-spinner" style={{ marginRight: '8px' }}></span>
                                    Mengirim...
                                </>
                            ) : (
                                <>Kirim Bukti Pembayaran <span style={{ marginLeft: '8px' }}>→</span></>
                            )}
                        </button>
                    </form>
                )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '48px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Butuh bantuan? <a href="https://wa.me/6281234567890" style={{ color: 'var(--accent)', fontWeight: 600 }}>Hubungi CS WhatsApp</a>
                </p>
                <div style={{ marginTop: '24px' }}>
                    <Link href="/" className="btn btn-secondary">← Kembali ke Beranda</Link>
                </div>
            </div>

            <style jsx>{`
                .upload-zone {
                    border: 2px dashed var(--border);
                    border-radius: var(--radius-lg);
                    padding: 32px;
                    text-align: center;
                    transition: all 0.2s;
                    background: var(--bg-input);
                    position: relative;
                    overflow: hidden;
                }
                .upload-zone:hover, .upload-zone.active {
                    border-color: var(--accent);
                    background: rgba(249, 115, 22, 0.05);
                }
                .upload-zone.has-file {
                    border-style: solid;
                    border-color: var(--accent);
                    background: rgba(249, 115, 22, 0.05);
                }
                .file-info {
                    animation: fadeIn 0.3s ease;
                }
            `}</style>
        </div>
    );
}

export default function PaymentConfirmationPage() {
    return (
        <div className="min-h-screen">
            <Navbar />
            <Suspense fallback={<div className="pt-32 text-center text-gray-500">Loading...</div>}>
                <PaymentConfirmationContent />
            </Suspense>
        </div>
    );
}
