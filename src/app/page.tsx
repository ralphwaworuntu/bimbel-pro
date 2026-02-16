'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import TestimonialCard from '@/components/TestimonialCard';
import StatsCounter from '@/components/StatsCounter';
import TypingEffect from '@/components/TypingEffect';
import ClientMarquee from '@/components/ClientMarquee';
import { useToast } from '@/components/ToastProvider';

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
    const [activeFaq, setActiveFaq] = useState<number | null>(null);
    const [isAnnual, setIsAnnual] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        fetch('/api/packages').then(r => r.json()).then(setPackages).catch(() => { });
    }, []);

    const toggleFaq = (index: number) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const handlePortfolioClick = (name: string) => {
        showToast(`Membuka portfolio: ${name}`, 'info');
    };

    return (
        <>
            <Navbar />

            {/* HERO SECTION */}
            <section className="hero">
                <div className="hero-bg">
                    {/* CSS-based particle effect simulation */}
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                </div>
                <div className="container">
                    <div className="hero-content animate-fadeInUp">
                        <div className="hero-badge animate-glow">🔥 Platform #1 Website Bimbel</div>
                        <h1>
                            Bangun Website<br />
                            Bimbel Anda<br />
                            <span className="text-gradient">
                                <TypingEffect
                                    words={['Dalam Hitungan Hari', 'Dalam Hitungan Jam', 'Tanpa Ribet Coding']}
                                    className="text-gradient-animated"
                                />
                            </span>
                        </h1>
                        <p>
                            Solusi website bimbel white-label terlengkap untuk para pengusaha bimbel TNI & POLRI.
                            Fitur tryout online, bank soal, dan manajemen siswa — semua sudah siap pakai!
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
                                <StatsCounter end={50} suffix="+" label="Website Aktif" />
                            </div>
                            <div>
                                <StatsCounter end={10000} suffix="+" label="Siswa Terdaftar" />
                            </div>
                            <div>
                                <StatsCounter end={99} suffix="%" label="Uptime Server" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CLIENT MARQUEE */}
            <ClientMarquee />

            {/* TRUST BADGES */}
            <div className="section-strip" style={{ borderBottom: '1px solid var(--border)', padding: '24px 0', background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap', opacity: 0.6, filter: 'grayscale(100%)' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>VERIFIED</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>SECURE</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>PREMIUM</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>SUPPORT 24/7</span>
                    </div>
                </div>
            </div>

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
                            <div key={i} className={`feature-card animate-fadeInUp stagger-${(i % 3) + 1}`}>
                                <div className="feature-icon" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(236,72,153,0.1))', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', marginBottom: '24px', fontSize: '2rem' }}>
                                    {f.icon}
                                </div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="section" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <div className="section-header">
                        <h2>Cara Kerja</h2>
                        <p>Hanya 3 langkah mudah untuk memulai bisnis bimbel online Anda</p>
                    </div>
                    <div className="grid grid-3" style={{ textAlign: 'center' }}>
                        {[
                            { step: '1', title: 'Pilih Paket', desc: 'Pilih paket yang sesuai dengan kebutuhan bisnis bimbel Anda.', icon: '📦' },
                            { step: '2', title: 'Isi Data & Domain', desc: 'Tentukan nama bimbel dan domain (.com/.id) yang Anda inginkan.', icon: '✍️' },
                            { step: '3', title: 'Terima Beres', desc: 'Tim kami akan setup website Anda. Dalam 1-3 hari, website siap digunakan!', icon: '🚀' },
                        ].map((s, i) => (
                            <div key={i} className="card animate-fadeInUp" style={{ position: 'relative', padding: '40px 24px' }}>
                                <div style={{
                                    width: '64px', height: '64px', background: 'var(--bg-primary)',
                                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)',
                                    margin: '0 auto 24px', border: '2px solid var(--accent)'
                                }}>
                                    {s.step}
                                </div>
                                <h3>{s.title}</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PORTFOLIO */}
            <section className="section" id="portfolio">
                <div className="container">
                    <div className="section-header">
                        <h2>Portfolio</h2>
                        <p>Contoh website bimbel yang sudah kami bangun dan beroperasi</p>
                    </div>
                    <div className="portfolio-grid grid grid-2">
                        {[
                            { icon: '🎖️', name: 'Bimbel Garuda Jaya', desc: 'Website bimbel TNI lengkap dengan tryout online dan manajemen 500+ siswa.', tags: ['TNI', 'Tryout', 'Premium'] },
                            { icon: '⭐', name: 'Bimbel Patriot Academy', desc: 'Platform bimbel POLRI dengan bank soal 5000+ dan analitik performa.', tags: ['POLRI', 'Bank Soal', 'Pro'] },
                            { icon: '🏆', name: 'Bimbel Prajurit Unggul', desc: 'Bimbel TNI & POLRI terintegrasi dengan sistem pembayaran otomatis.', tags: ['TNI & POLRI', 'Payment', 'Premium'] },
                            { icon: '🎯', name: 'Bimbel Cendekia Nusantara', desc: 'Website bimbel multi-cabang dengan dashboard owner terpusat.', tags: ['Multi-Cabang', 'Dashboard', 'Pro'] },
                        ].map((p, i) => (
                            <div key={i} className={`card portfolio-card animate-fadeInUp stagger-${(i % 2) + 1}`} style={{ padding: '0', cursor: 'pointer' }} onClick={() => handlePortfolioClick(p.name)}>
                                <div style={{ height: '240px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', position: 'relative' }}>
                                    {p.icon}
                                    <div className="portfolio-overlay">
                                        <button className="btn btn-primary btn-sm">Lihat Detail</button>
                                    </div>
                                </div>
                                <div style={{ padding: '24px' }}>
                                    <h3 style={{ marginBottom: '8px' }}>{p.name}</h3>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{p.desc}</p>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {p.tags.map(t => (
                                            <span key={t} className="badge badge-info">{t}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="section" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <div className="section-header">
                        <h2>Kata Mereka</h2>
                        <p>Testimoni dari pemilik bimbel yang telah sukses bersama kami</p>
                    </div>
                    <div className="grid grid-3">
                        <TestimonialCard
                            name="Budi Santoso"
                            role="Owner Bimbel Garuda"
                            content="Website bimbel saya jadi sangat profesional. Siswa suka fitur tryout onlinenya, sangat membantu persiapan mereka masuk TNI."
                            rating={5}
                        />
                        <TestimonialCard
                            name="Siti Aminah"
                            role="CEO Patriot Academy"
                            content="Pelayanan sangat cepat. Order hari Senin, Rabu website sudah live dengan domain pilihan saya. Recommended!"
                            rating={5}
                        />
                        <TestimonialCard
                            name="Mayor Purn. Hartono"
                            role="Pendiri Bimbel Taruna"
                            content="Sistem manajemen siswanya sangat memudahkan. Saya bisa pantau progress ratusan siswa dari satu dashboard."
                            rating={5}
                        />
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

                    <div className="toggle-switch-container">
                        <span className={`toggle-label ${!isAnnual ? 'active' : 'text-muted'}`} onClick={() => setIsAnnual(false)}>Bulanan</span>
                        <div className={`toggle-switch ${isAnnual ? 'active' : ''}`} onClick={() => setIsAnnual(!isAnnual)}>
                            <div className="toggle-slider"></div>
                        </div>
                        <span className={`toggle-label ${isAnnual ? 'active' : 'text-muted'}`} onClick={() => setIsAnnual(true)}>
                            Tahunan <span className="badge-save">Hemat 20%</span>
                        </span>
                    </div>

                    <div className="pricing-grid">
                        {packages.length > 0 ? packages.map((pkg, i) => (
                            <PricingCard key={pkg.id} pkg={pkg} index={i} isAnnual={isAnnual} />
                        )) : (
                            // Fallback if API hasn't loaded or failed
                            <>
                                {[
                                    { tier: 'basic', name: 'Basic', price: 2500000, monthlyFee: 150000, features: ['Website bimbel responsive', 'Pendaftaran siswa online', 'Bank soal (max 500)', 'Tryout online (max 10)', 'Subdomain gratis'] },
                                    { tier: 'pro', name: 'Professional', price: 5000000, monthlyFee: 300000, features: ['Semua fitur Basic', 'Siswa & soal unlimited', 'Analitik performa', 'Pembayaran online', 'Custom domain', 'Branding kustom'] },
                                    { tier: 'premium', name: 'Premium', price: 10000000, monthlyFee: 500000, features: ['Semua fitur Pro', 'Multi-cabang', 'Live class', 'API integration', 'Dedicated manager', 'SLA 99.9%'] },
                                ].map((pkg, i) => (
                                    <PricingCard key={pkg.tier} pkg={pkg as any} index={i} isAnnual={isAnnual} />
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* FAQ SECTION */}
            <section className="section" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container" style={{ maxWidth: '800px' }}>
                    <div className="section-header">
                        <h2>Pertanyaan Umum</h2>
                        <p>Jawaban untuk hal-hal yang sering ditanyakan</p>
                    </div>
                    <div className="faq-list">
                        {[
                            { q: 'Apakah saya perlu mengerti teknis/coding?', a: 'Sama sekali tidak. Kami yang akan mengurus semua hal teknis mulai dari server, domain, hingga maintenance rutin. Anda cukup fokus mengelola bisnis bimbel Anda.' },
                            { q: 'Berapa lama website akan jadi?', a: 'Untuk paket Basic dan Pro, website biasanya siap dalam 1-3 hari kerja setelah data lengkap kami terima. Paket Premium mungkin membutuhkan waktu lebih lama tergantung kustomisasi.' },
                            { q: 'Apakah bisa upgrade paket nanti?', a: 'Tentu saja. Anda bisa melakukan upgrade paket kapan saja seiring pertumbuhan jumlah siswa bimbel Anda. Kami akan membantu proses migrasinya.' },
                            { q: 'Bagaimana sistem pembayarannya?', a: 'Kami menerapkan sistem DP 50% di awal dan pelunasan setelah website jadi. Kami menerima pembayaran via transfer bank dan e-wallet.' },
                        ].map((item, i) => (
                            <div key={i} className="card faq-item" style={{ marginBottom: '16px', padding: '0', overflow: 'hidden' }}>
                                <button
                                    onClick={() => toggleFaq(i)}
                                    style={{
                                        width: '100%', textAlign: 'left', padding: '20px 24px',
                                        background: 'none', border: 'none', color: 'var(--text-primary)',
                                        fontSize: '1rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'center', cursor: 'pointer'
                                    }}
                                >
                                    {item.q}
                                    <span style={{ transform: activeFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}>▼</span>
                                </button>
                                {activeFaq === i && (
                                    <div style={{ padding: '0 24px 24px', color: 'var(--text-secondary)', lineHeight: '1.6', borderTop: '1px solid var(--border)' }}>
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        ))}
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

            <Footer />
            <ScrollToTop />
        </>
    );
}

function PricingCard({ pkg, index, isAnnual }: { pkg: Package, index: number, isAnnual: boolean }) {
    const monthlyFee = isAnnual ? pkg.monthlyFee * 12 * 0.8 : pkg.monthlyFee;

    return (
        <div className={`pricing-card ${pkg.tier === 'pro' ? 'popular' : ''} animate-fadeInUp stagger-${index + 1}`}>
            {pkg.tier === 'pro' && <span className="pricing-popular-badge">Paling Populer</span>}
            <div className="pricing-tier">{pkg.tier}</div>
            <div className="pricing-name">{pkg.name}</div>
            <div className="pricing-desc">{pkg.description || 'Paket terbaik untuk memulai'}</div>
            <div className="pricing-price">
                <span className="currency">Rp</span> {formatRp(pkg.price)}
            </div>
            <div className="pricing-monthly">
                + Rp {formatRp(monthlyFee)}/{isAnnual ? 'tahun' : 'bulan'}
            </div>
            <ul className="pricing-features">
                {pkg.features.map((f, j) => <li key={j}>{f}</li>)}
            </ul>
            <Link href={`/order?package=${pkg.id || pkg.tier}`} className="btn btn-primary" style={{ width: '100%' }}>
                Pilih {pkg.name}
            </Link>
        </div>
    );
}
