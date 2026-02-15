'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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

function formatRp(n: number) {
    return new Intl.NumberFormat('id-ID').format(n);
}

export default function Home() {
    const [packages, setPackages] = useState<Package[]>([]);

    useEffect(() => {
        fetch('/api/packages').then(r => r.json()).then(setPackages).catch(() => { });
    }, []);

    return (
        <>
            <Navbar />

            {/* HERO */}
            <section className="hero">
                <div className="hero-bg"></div>
                <div className="container">
                    <div className="hero-content animate-fadeInUp">
                        <div className="hero-badge">🔥 Platform #1 Website Bimbel</div>
                        <h1>
                            Bangun Website<br />
                            Bimbel Anda<br />
                            <span className="text-gradient">Dalam Hitungan Hari</span>
                        </h1>
                        <p>
                            Solusi website bimbel white-label terlengkap untuk para pengusaha bimbel TNI & POLRI.
                            Fitur tryout online, bank soal, manajemen siswa — semua sudah siap pakai!
                        </p>
                        <div className="hero-actions">
                            <Link href="/order" className="btn btn-primary btn-lg">
                                🚀 Pesan Sekarang
                            </Link>
                            <a href="#portfolio" className="btn btn-secondary btn-lg">
                                Lihat Portfolio
                            </a>
                        </div>
                        <div className="hero-stats">
                            <div>
                                <div className="hero-stat-number">50+</div>
                                <div className="hero-stat-label">Website Aktif</div>
                            </div>
                            <div>
                                <div className="hero-stat-number">10K+</div>
                                <div className="hero-stat-label">Siswa Terdaftar</div>
                            </div>
                            <div>
                                <div className="hero-stat-number">99.9%</div>
                                <div className="hero-stat-label">Uptime</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="section" id="features">
                <div className="container">
                    <div className="section-header">
                        <h2>Fitur Unggulan</h2>
                        <p>Semua yang dibutuhkan bisnis bimbel Anda dalam satu platform</p>
                    </div>
                    <div className="features-grid">
                        {[
                            { icon: '📝', title: 'Tryout Online', desc: 'Sistem ujian online dengan timer, auto-grading, dan analisis performa siswa secara real-time.' },
                            { icon: '📚', title: 'Bank Soal', desc: 'Ribuan soal siap pakai untuk TNI & POLRI, bisa ditambah sesuai kebutuhan Anda.' },
                            { icon: '👥', title: 'Manajemen Siswa', desc: 'Kelola data siswa, hasil ujian, dan progress belajar dari satu dashboard.' },
                            { icon: '💳', title: 'Pembayaran Online', desc: 'Terintegrasi dengan payment gateway untuk menerima pembayaran dari siswa.' },
                            { icon: '📊', title: 'Analitik & Laporan', desc: 'Dashboard analitik lengkap untuk memantau performa bisnis bimbel Anda.' },
                            { icon: '📱', title: 'Mobile Friendly', desc: 'Website responsif yang nyaman diakses dari smartphone, tablet, dan desktop.' },
                        ].map((f, i) => (
                            <div key={i} className={`feature-card animate-fadeInUp stagger-${i + 1}`}>
                                <div className="feature-icon">{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PORTFOLIO */}
            <section className="section" id="portfolio" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <div className="section-header">
                        <h2>Portfolio</h2>
                        <p>Contoh website bimbel yang sudah kami bangun dan beroperasi</p>
                    </div>
                    <div className="portfolio-grid">
                        {[
                            { icon: '🎖️', name: 'Bimbel Garuda Jaya', desc: 'Website bimbel TNI lengkap dengan tryout online dan manajemen 500+ siswa.', tags: ['TNI', 'Tryout', 'Premium'] },
                            { icon: '⭐', name: 'Bimbel Patriot Academy', desc: 'Platform bimbel POLRI dengan bank soal 5000+ dan analitik performa.', tags: ['POLRI', 'Bank Soal', 'Pro'] },
                            { icon: '🏆', name: 'Bimbel Prajurit Unggul', desc: 'Bimbel TNI & POLRI terintegrasi dengan sistem pembayaran otomatis.', tags: ['TNI & POLRI', 'Payment', 'Premium'] },
                            { icon: '🎯', name: 'Bimbel Cendekia Nusantara', desc: 'Website bimbel multi-cabang dengan dashboard owner terpusat.', tags: ['Multi-Cabang', 'Dashboard', 'Pro'] },
                        ].map((p, i) => (
                            <div key={i} className={`portfolio-card animate-fadeInUp stagger-${i + 1}`}>
                                <div className="portfolio-thumb">{p.icon}</div>
                                <div className="portfolio-info">
                                    <h3>{p.name}</h3>
                                    <p>{p.desc}</p>
                                    <div className="portfolio-tags">
                                        {p.tags.map(t => <span key={t} className="portfolio-tag">{t}</span>)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRICING */}
            <section className="section" id="pricing">
                <div className="container">
                    <div className="section-header">
                        <h2>Pilih Paket</h2>
                        <p>Paket fleksibel sesuai kebutuhan dan skala bisnis bimbel Anda</p>
                    </div>
                    <div className="pricing-grid">
                        {packages.length > 0 ? packages.map((pkg, i) => (
                            <div key={pkg.id} className={`pricing-card ${pkg.tier === 'pro' ? 'popular' : ''} animate-fadeInUp stagger-${i + 1}`}>
                                {pkg.tier === 'pro' && <span className="pricing-popular-badge">Paling Populer</span>}
                                <div className="pricing-tier">{pkg.tier}</div>
                                <div className="pricing-name">{pkg.name}</div>
                                <div className="pricing-desc">{pkg.description}</div>
                                <div className="pricing-price">
                                    <span className="currency">Rp</span> {formatRp(pkg.price)}
                                </div>
                                <div className="pricing-monthly">+ Rp {formatRp(pkg.monthlyFee)}/bulan</div>
                                <ul className="pricing-features">
                                    {pkg.features.map((f, j) => <li key={j}>{f}</li>)}
                                </ul>
                                <Link href={`/order?package=${pkg.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                                    Pilih {pkg.name}
                                </Link>
                            </div>
                        )) : (
                            <>
                                {[
                                    { tier: 'basic', name: 'Basic', price: 2500000, monthly: 150000, features: ['Website bimbel responsive', 'Pendaftaran siswa online', 'Bank soal (max 500)', 'Tryout online (max 10)', 'Subdomain gratis'] },
                                    { tier: 'pro', name: 'Professional', price: 5000000, monthly: 300000, features: ['Semua fitur Basic', 'Siswa & soal unlimited', 'Analitik performa', 'Pembayaran online', 'Custom domain', 'Branding kustom'] },
                                    { tier: 'premium', name: 'Premium', price: 10000000, monthly: 500000, features: ['Semua fitur Pro', 'Multi-cabang', 'Live class', 'API integration', 'Dedicated manager', 'SLA 99.9%'] },
                                ].map((pkg, i) => (
                                    <div key={pkg.tier} className={`pricing-card ${pkg.tier === 'pro' ? 'popular' : ''} animate-fadeInUp stagger-${i + 1}`}>
                                        {pkg.tier === 'pro' && <span className="pricing-popular-badge">Paling Populer</span>}
                                        <div className="pricing-tier">{pkg.tier}</div>
                                        <div className="pricing-name">{pkg.name}</div>
                                        <div className="pricing-price"><span className="currency">Rp</span> {formatRp(pkg.price)}</div>
                                        <div className="pricing-monthly">+ Rp {formatRp(pkg.monthly)}/bulan</div>
                                        <ul className="pricing-features">
                                            {pkg.features.map((f, j) => <li key={j}>{f}</li>)}
                                        </ul>
                                        <Link href={`/order?package=${pkg.tier}`} className="btn btn-primary" style={{ width: '100%' }}>
                                            Pilih {pkg.name}
                                        </Link>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card animate-fadeInUp">
                        <h2>Siap Memulai Bisnis Bimbel Online?</h2>
                        <p>Bergabung dengan 50+ pengusaha bimbel yang sudah mempercayakan website mereka kepada kami</p>
                        <Link href="/order" className="btn btn-primary btn-lg" style={{ position: 'relative' }}>
                            🚀 Mulai Sekarang
                        </Link>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="footer">
                <div className="container">
                    <p>© {new Date().getFullYear()} Bimbel Pro. All rights reserved.</p>
                </div>
            </footer>
        </>
    );
}
