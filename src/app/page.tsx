'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import TestimonialCard from '@/components/TestimonialCard';
import AnimatedCounter from '@/components/AnimatedCounter';
import SkeletonLoader from '@/components/SkeletonLoader';
import ScrollReveal from '@/components/ScrollReveal';
import PortfolioModal, { Project } from '@/components/PortfolioModal';
import TypingEffect from '@/components/TypingEffect';
import ClientMarquee from '@/components/ClientMarquee';
import { useToast } from '@/components/ToastProvider';
import BackgroundParticles from '@/components/BackgroundParticles';
import Spotlight from '@/components/Spotlight';
import GradientBorder from '@/components/GradientBorder';

interface Package {
    id: string;
    name: string;
    tier: string;
    price: number;
    monthlyFee: number;
    description: string;
    features: string[];
    badge?: string;
}

function formatRp(n: number) {
    return new Intl.NumberFormat('id-ID').format(n);
}

export default function Home() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [activeFaq, setActiveFaq] = useState<number | null>(null);
    const [isAnnual, setIsAnnual] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        fetch('/api/packages').then(r => r.json()).then(setPackages).catch(() => { });
    }, []);

    const toggleFaq = (index: number) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const handlePortfolioClick = (project: Project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    return (
        <>
            <Navbar />

            {/* HERO SECTION */}
            <section className="hero">
                <div className="hero-bg">
                    <BackgroundParticles />
                </div>
                <div className="container">
                    <ScrollReveal>
                        <div className="hero-content">
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
                                    <AnimatedCounter end={50} suffix="+" label="Website Aktif" />
                                </div>
                                <div>
                                    <AnimatedCounter end={10000} suffix="+" label="Siswa Terdaftar" />
                                </div>
                                <div>
                                    <AnimatedCounter end={99} suffix="%" label="Uptime Server" />
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
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
                            <ScrollReveal key={i} delay={i * 0.1}>
                                <Spotlight className="h-full" color="rgba(249, 115, 22, 0.15)">
                                    <div className={`feature-card card-tilt hover-lift`} style={{ height: '100%', background: 'var(--bg-card)' }}>
                                        <div className="feature-icon" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(236,72,153,0.1))', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', marginBottom: '24px', fontSize: '2rem' }}>
                                            {f.icon}
                                        </div>
                                        <h3>{f.title}</h3>
                                        <p>{f.desc}</p>
                                    </div>
                                </Spotlight>
                            </ScrollReveal>
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
                            <ScrollReveal key={i} delay={i * 0.2} direction="up">
                                <div className="card hover-scale" style={{ position: 'relative', padding: '40px 24px' }}>
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
                            </ScrollReveal>
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
                            {
                                icon: '🎖️',
                                name: 'Bimbel Garuda Jaya',
                                desc: 'Website bimbel TNI lengkap dengan tryout online dan manajemen 500+ siswa.',
                                descriptionDetail: 'Bimbel Garuda Jaya adalah platform bimbel premier untuk persiapan masuk TNI. Dilengkapi dengan sistem tryout CAT yang mirip dengan tes asli, serta manajemen siswa yang komprehensif.',
                                tags: ['TNI', 'Tryout', 'Premium'],
                                images: ['https://placehold.co/800x400/1e293b/ffffff?text=Garuda+Jaya+Home', 'https://placehold.co/800x400/1e293b/ffffff?text=Tryout+System', 'https://placehold.co/800x400/1e293b/ffffff?text=Student+Dashboard'],
                                stats: [{ label: 'Siswa Lolos', value: '450+' }, { label: 'Bank Soal', value: '2.500+' }]
                            },
                            {
                                icon: '⭐',
                                name: 'Bimbel Patriot Academy',
                                desc: 'Platform bimbel POLRI dengan bank soal 5000+ dan analitik performa.',
                                descriptionDetail: 'Patriot Academy fokus pada persiapan calon anggota POLRI. Fitur unggulannya adalah analisis performa mendalam yang membantu siswa mengetahui kelemahan mereka.',
                                tags: ['POLRI', 'Bank Soal', 'Pro'],
                                images: ['https://placehold.co/800x400/1e293b/ffffff?text=Patriot+Academy', 'https://placehold.co/800x400/1e293b/ffffff?text=Analitik+Siswa'],
                                stats: [{ label: 'Pengguna Aktif', value: '1.200+' }, { label: 'Soal Latihan', value: '5.000+' }]
                            },
                            {
                                icon: '🏆',
                                name: 'Bimbel Prajurit Unggul',
                                desc: 'Bimbel TNI & POLRI terintegrasi dengan sistem pembayaran otomatis.',
                                descriptionDetail: 'Solusi all-in-one untuk bimbel TNI/POLRI dengan integrasi payment gateway, memudahkan pendaftaran dan pembayaran siswa secara otomatis 24/7.',
                                tags: ['TNI & POLRI', 'Payment', 'Premium'],
                                images: ['https://placehold.co/800x400/1e293b/ffffff?text=Prajurit+Unggul', 'https://placehold.co/800x400/1e293b/ffffff?text=Payment+Flow'],
                                stats: [{ label: 'Transaksi', value: '500/bln' }, { label: 'Otomatisasi', value: '100%' }]
                            },
                            {
                                icon: '🎯',
                                name: 'Bimbel Cendekia Nusantara',
                                desc: 'Website bimbel multi-cabang dengan dashboard owner terpusat.',
                                descriptionDetail: 'Sistem manajemen untuk bimbel dengan banyak cabang. Owner dapat memantau performa tiap cabang, keuangan, dan jumlah siswa dari satu dashboard pusat.',
                                tags: ['Multi-Cabang', 'Dashboard', 'Pro'],
                                images: ['https://placehold.co/800x400/1e293b/ffffff?text=Cendekia+Pusat', 'https://placehold.co/800x400/1e293b/ffffff?text=Cabang+Management'],
                                stats: [{ label: 'Cabang', value: '12' }, { label: 'Total Siswa', value: '2.000+' }]
                            },
                        ].map((p, i) => (
                            <ScrollReveal key={i} delay={i * 0.1}>
                                <div className={`card portfolio-card hover-glow`} style={{ padding: '0', cursor: 'pointer' }} onClick={() => handlePortfolioClick(p as Project)}>
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
                            </ScrollReveal>
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
                            // Fallback / Loading state using Skeleton if needed, or static data
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
                    <ScrollReveal>
                        <div className="cta-card">
                            <h2>Siap Memulai Bisnis Bimbel Online?</h2>
                            <p>Bergabung dengan 50+ pengusaha bimbel yang sudah mempercayakan website mereka kepada kami</p>
                            <Link href="/order" className="btn btn-primary btn-lg" style={{ position: 'relative' }}>
                                🚀 Mulai Sekarang
                            </Link>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            <Footer />
            <ScrollToTop />
            <PortfolioModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                project={selectedProject}
            />
        </>
    );
}

function PricingCard({ pkg, index, isAnnual }: { pkg: Package, index: number, isAnnual: boolean }) {
    const mainPrice = isAnnual ? pkg.price : pkg.monthlyFee;
    const subText = isAnnual
        ? `Sama dengan Rp ${formatRp(Math.round(pkg.price / 12))} / bulan`
        : null;

    const CardContent = (
        <div className={`pricing-card ${pkg.badge ? 'popular' : ''}`} style={{ height: '100%' }}>
            {pkg.badge && <span className="pricing-popular-badge">{pkg.badge}</span>}
            <div className="pricing-tier">{pkg.tier}</div>
            <div className="pricing-name">{pkg.name}</div>
            <div className="pricing-desc">{pkg.description || 'Paket terbaik untuk memulai'}</div>
            <div className="pricing-price">
                <span className="currency">Rp</span> {formatRp(mainPrice)}
                {!isAnnual && <span style={{ fontSize: '0.4em', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '4px' }}>/ bulan</span>}
            </div>
            <div className="pricing-monthly" style={{ visibility: subText ? 'visible' : 'hidden', minHeight: '1.2em' }}>
                {subText}
            </div>
            <ul className="pricing-features">
                {pkg.features.map((f, j) => <li key={j}>{f}</li>)}
            </ul>
            <Link href={`/order?package=${pkg.id || pkg.tier}`} className="btn btn-primary" style={{ width: '100%' }}>
                Pilih {pkg.name}
            </Link>
        </div>
    );

    return (
        <ScrollReveal className={`pricing-card-wrapper`} delay={index * 0.1}>
            {pkg.badge ? (
                <GradientBorder width="2px" radius="16px">
                    {CardContent}
                </GradientBorder>
            ) : (
                CardContent
            )}
        </ScrollReveal>
    );
}
