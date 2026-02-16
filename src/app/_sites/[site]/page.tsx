import { notFound } from 'next/navigation';
import { getTenant } from '@/lib/tenant';

interface Props {
    params: {
        site: string; // This corresponds to the subdomain
    };
}

export default async function TenantHomePage({ params }: Props) {
    const tenant = await getTenant(params.site);

    if (!tenant) {
        return notFound();
    }

    // Parse config if it exists
    const config = tenant.config ? JSON.parse(tenant.config) : {};

    return (
        <div className="tenant-page">
            {/* Simple Dynamic Navbar */}
            <header className="navbar">
                <div className="container nav-container">
                    <div className="brand">
                        {tenant.logoUrl ? (
                            <img src={tenant.logoUrl} alt={tenant.brandName} className="logo-img" />
                        ) : (
                            <div className="logo-placeholder">
                                {tenant.brandName.charAt(0)}
                            </div>
                        )}
                        <h1 className="brand-name">{tenant.brandName}</h1>
                    </div>
                    <nav className="nav-links">
                        <a href="#" className="nav-link">Program</a>
                        <a href="#about" className="nav-link">Tentang Kami</a>
                        <a href="#" className="btn btn-primary">Daftar Sekarang</a>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="main-content">
                <section className="hero-section">
                    <div className="container">
                        <div className="hero-content">
                            <h1 className="hero-title">
                                <span className="block">Bimbingan Belajar</span>{' '}
                                <span className="block text-primary">{tenant.brandName}</span>
                            </h1>
                            <p className="hero-text">
                                {config.heroText || `Bergabunglah bersama kami untuk meraih impian Anda menjadi abdi negara. ${tenant.brandName} siap membimbing Anda dengan materi terupdate dan mentor berpengalaman.`}
                            </p>
                            <div className="hero-buttons">
                                <a href="#" className="btn btn-primary btn-lg w-full">
                                    Mulai Belajar
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section className="section bg-white" id="about">
                    <div className="container">
                        <div className="grid-2">
                            <div className="about-text">
                                <h2 className="section-title">Tentang {tenant.brandName}</h2>
                                <p className="section-desc">
                                    Kami berdedikasi untuk mencetak generasi penerus bangsa yang berkualitas. Dengan metode pembelajaran teruji dan mentor berpengalaman dari kalangan TNI & POLRI.
                                </p>
                                <ul className="feature-list">
                                    {['Mentor Berpengalaman', 'Fasilitas Lengkap', 'Kurikulum Terupdate', 'Bimbingan Fisik & Mental'].map((item, i) => (
                                        <li key={i} className="feature-item">
                                            <svg className="icon-check" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="about-image-wrapper">
                                <div className="aspect-ratio">
                                    <img
                                        src="https://placehold.co/800x600/e2e8f0/1e293b?text=Tentang+Kami"
                                        alt="Tentang Kami"
                                        className="about-img"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Programs Section */}
                <section className="section bg-gray" id="programs">
                    <div className="container">
                        <div className="section-header text-center">
                            <h2 className="section-title">Program Unggulan</h2>
                            <p className="section-subtitle">Pilih program yang sesuai dengan target Anda</p>
                        </div>
                        <div className="grid-3">
                            {[
                                { title: 'Reguler TNI', price: 'Rp 5.000.000', features: ['3x Pertemuan/minggu', 'Modul Lengkap', 'Tryout CAT'] },
                                { title: 'Intensif POLRI', price: 'Rp 7.500.000', features: ['Setiap Hari', 'Asrama', 'Bimbingan Fisik'] },
                                { title: 'Privat', price: 'Hubungi Kami', features: ['Jadwal Fleksibel', '1 on 1 Mentoring', 'Konsultasi Full'] }
                            ].map((prog, i) => (
                                <div key={i} className="card">
                                    <div className="card-body">
                                        <h3 className="card-title">{prog.title}</h3>
                                        <div className="card-price">{prog.price}</div>
                                        <ul className="card-features">
                                            {prog.features.map((f, j) => (
                                                <li key={j} className="card-feature-item">
                                                    <span className="dot"></span>
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                        <button className="btn btn-outline w-full">
                                            Detail Program
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="section bg-white" id="testimonials">
                    <div className="container">
                        <div className="section-header text-center">
                            <h2 className="section-title">Apa Kata Mereka?</h2>
                        </div>
                        <div className="grid-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="testimonial-card">
                                    <div className="testimonial-header">
                                        <div className="avatar">
                                            S{i}
                                        </div>
                                        <div className="user-info">
                                            <div className="user-name">Siswa {i}</div>
                                            <div className="user-role">Lolos TNI AD 2025</div>
                                        </div>
                                    </div>
                                    <p className="testimonial-text">"Terima kasih {tenant.brandName}, berkat bimbingannya saya bisa lulus murni. Materinya sangat akurat!"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

            </main>

            {/* Contact/CTA Section (Footer replacement) */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-col-main">
                            <h3 className="footer-brand">{tenant.brandName}</h3>
                            <p className="footer-desc">
                                Partner terbaik Anda untuk persiapan seleksi TNI & POLRI. Bergabunglah sekarang dan wujudkan cita-cita Anda.
                            </p>
                        </div>
                        <div className="footer-col">
                            <h4 className="footer-heading">Kontak</h4>
                            <ul className="footer-links">
                                <li>WhatsApp: {config.contactInfo || '0812-3456-7890'}</li>
                                <li>Email: {config.email || 'info@' + tenant.brandName.toLowerCase().replace(/\s/g, '') + '.com'}</li>
                                <li>Alamat: {config.address || 'Jl. Raya No. 1, Jakarta'}</li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4 className="footer-heading">Menu</h4>
                            <ul className="footer-links">
                                <li><a href="#">Beranda</a></li>
                                <li><a href="#about">Tentang Kami</a></li>
                                <li><a href="#programs">Program</a></li>
                                <li><a href="/login">Login Siswa</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-copy">
                        &copy; {new Date().getFullYear()} {tenant.brandName}. All rights reserved. Powered by BimbelPro.
                    </div>
                </div>
            </footer>

            <style jsx>{`
                /* Resets & Base for Tenant Page Scope */
                .tenant-page {
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    background-color: #f9fafb; /* bg-gray-50 */
                    color: #1f2937; /* text-gray-900 */
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                }

                /* Utilities */
                .container {
                    width: 100%;
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 0 1rem;
                }
                @media (min-width: 640px) { .container { padding: 0 1.5rem; } }
                @media (min-width: 1024px) { .container { padding: 0 2rem; } }

                .text-center { text-align: center; }
                .text-primary { color: #2563eb; } /* blue-600 */
                .w-full { width: 100%; }
                .block { display: block; }
                
                .section { padding: 4rem 0; }
                .bg-white { background-color: #ffffff; }
                .bg-gray { background-color: #f9fafb; }

                /* Buttons */
                .btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.5rem 1rem;
                    border-radius: 0.375rem;
                    font-weight: 500;
                    transition: all 0.2s;
                    text-decoration: none;
                    cursor: pointer;
                    border: 1px solid transparent;
                    box-shadow: none; /* Reset global shadow */
                    text-transform: none; /* Reset global transform if any */
                }
                .btn-primary {
                    background-color: #2563eb;
                    color: white;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* Local shadow */
                    border-color: transparent;
                }
                .btn-primary:hover { 
                    background-color: #1d4ed8; 
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); 
                }
                
                .btn-outline {
                    border-color: #2563eb;
                    color: #2563eb;
                    background-color: transparent;
                    box-shadow: none;
                }
                .btn-outline:hover { background-color: #eff6ff; }
                
                .btn-lg {
                    padding: 0.75rem 2rem;
                    font-size: 1.125rem;
                }

                /* Navbar */
                .navbar {
                    background-color: white;
                    border-bottom: 1px solid #e5e7eb;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    position: sticky;
                    top: 0;
                    z-index: 50;
                }
                .nav-container {
                    height: 4rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .brand { display: flex; align-items: center; gap: 0.5rem; }
                .logo-img { height: 2rem; width: auto; }
                .logo-placeholder {
                    background-color: #2563eb;
                    color: white;
                    width: 2rem;
                    height: 2rem;
                    border-radius: 9999px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                }
                .brand-name { font-size: 1.25rem; font-weight: 700; color: #111827; margin: 0; }
                .nav-links { display: none; gap: 1rem; align-items: center; }
                .nav-link { color: #4b5563; text-decoration: none; font-weight: 500; }
                .nav-link:hover { color: #111827; }
                @media (min-width: 768px) { .nav-links { display: flex; } }

                /* Hero */
                .hero-section {
                    position: relative;
                    background-color: white;
                    padding-bottom: 2rem;
                    overflow: hidden;
                }
                .hero-content {
                    margin-top: 2.5rem;
                    text-align: center;
                }
                @media (min-width: 1024px) { 
                    .hero-content { text-align: left; margin-top: 5rem; } 
                }
                .hero-title {
                    font-size: 2.25rem;
                    font-weight: 800;
                    line-height: 1.2;
                    color: #111827;
                    margin-bottom: 1rem;
                }
                @media (min-width: 640px) { .hero-title { font-size: 3rem; } }
                @media (min-width: 768px) { .hero-title { font-size: 3.75rem; } }

                .hero-text {
                    margin-top: 1rem;
                    font-size: 1rem;
                    color: #6b7280;
                    max-width: 36rem;
                    margin-left: auto;
                    margin-right: auto;
                }
                @media (min-width: 1024px) { .hero-text { margin-left: 0; } }
                
                .hero-buttons {
                    margin-top: 2rem;
                    display: flex;
                    justify-content: center;
                }
                @media (min-width: 1024px) { .hero-buttons { justify-content: flex-start; } }

                /* Grid Layouts */
                .grid-2 { display: grid; gap: 2rem; }
                @media (min-width: 1024px) { .grid-2 { grid-template-columns: repeat(2, 1fr); gap: 4rem; align-items: center; } }
                
                .grid-3 { display: grid; gap: 2rem; }
                @media (min-width: 768px) { .grid-3 { grid-template-columns: repeat(2, 1fr); } }
                @media (min-width: 1024px) { .grid-3 { grid-template-columns: repeat(3, 1fr); } }

                /* Section Headers */
                .section-header { margin-bottom: 3rem; }
                .section-title { font-size: 1.875rem; font-weight: 800; color: #111827; margin-bottom: 1rem; }
                .section-subtitle { font-size: 1.25rem; color: #6b7280; margin-top: 1rem; }
                .section-desc { font-size: 1.125rem; color: #6b7280; margin-bottom: 1.5rem; }

                /* Feature List */
                .feature-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1rem; }
                .feature-item { display: flex; align-items: center; color: #374151; }
                .icon-check { height: 1.5rem; width: 1.5rem; color: #10b981; margin-right: 0.5rem; }

                /* About Image */
                .about-image-wrapper { margin-top: 2.5rem; position: relative; }
                @media (min-width: 1024px) { .about-image-wrapper { margin-top: 0; } }
                .aspect-ratio { position: relative; padding-bottom: 56.25%; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
                .about-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }

                /* Cards (Programs) */
                .card {
                    background-color: white;
                    border-radius: 0.75rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    transition: box-shadow 0.3s;
                }
                .card:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
                .card-body { padding: 2rem; }
                .card-title { font-size: 1.25rem; font-weight: 700; color: #111827; margin-bottom: 0.5rem; margin-top: 0; }
                .card-price { font-size: 1.5rem; font-weight: 700; color: #2563eb; margin-bottom: 1.5rem; }
                .card-features { list-style: none; padding: 0; margin-bottom: 2rem; display: flex; flex-direction: column; gap: 0.75rem; }
                .card-feature-item { display: flex; align-items: center; font-size: 0.875rem; color: #4b5563; }
                .dot { width: 0.5rem; height: 0.5rem; background-color: #3b82f6; border-radius: 9999px; margin-right: 0.5rem; }

                /* Testimonials */
                .testimonial-card {
                    background-color: #f9fafb;
                    padding: 1.5rem;
                    border-radius: 0.75rem;
                    border: 1px solid #f3f4f6;
                }
                .testimonial-header { display: flex; align-items: center; margin-bottom: 1rem; }
                .avatar {
                    height: 2.5rem; width: 2.5rem;
                    border-radius: 9999px;
                    background-color: #d1d5db;
                    display: flex; align-items: center; justify-content: center;
                    color: #4b5563; font-weight: 700; font-size: 0.875rem;
                }
                .user-info { margin-left: 0.75rem; }
                .user-name { font-weight: 700; color: #111827; font-size: 0.875rem; }
                .user-role { font-size: 0.75rem; color: #6b7280; }
                .testimonial-text { color: #4b5563; font-style: italic; font-size: 0.875rem; line-height: 1.5; }

                /* Footer */
                .footer { background-color: #111827; color: white; padding: 4rem 0 2rem; }
                .footer-grid { display: grid; gap: 2rem; margin-bottom: 3rem; }
                @media (min-width: 768px) { .footer-grid { grid-template-columns: repeat(4, 1fr); } }
                .footer-col-main { grid-column: span 1; }
                @media (min-width: 768px) { .footer-col-main { grid-column: span 2; } }
                .footer-brand { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; margin-top: 0; }
                .footer-desc { color: #9ca3af; max-width: 20rem; line-height: 1.5; }
                .footer-heading { font-weight: 700; font-size: 1.125rem; margin-bottom: 1rem; }
                .footer-links { list-style: none; padding: 0; color: #9ca3af; display: flex; flex-direction: column; gap: 0.5rem; }
                .footer-links a { color: inherit; text-decoration: none; }
                .footer-links a:hover { color: white; }
                .footer-copy {
                    border-top: 1px solid #374151;
                    padding-top: 2rem;
                    text-align: center;
                    color: #6b7280;
                    font-size: 0.875rem;
                }
            `}</style>
        </div>
    );
}
