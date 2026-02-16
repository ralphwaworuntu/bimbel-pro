'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError('Email atau password salah');
            setLoading(false);
        } else {
            router.push('/admin');
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg">
                <div className="login-bg-shape shape-1"></div>
                <div className="login-bg-shape shape-2"></div>
                <div className="login-bg-shape shape-3"></div>
            </div>

            <div className="login-card animate-fadeInUp">
                <div className="login-header">
                    <Link href="/" className="login-logo-link">
                        <div className="login-logo-icon">🚀</div>
                        <span className="login-logo-text">Bimbel<span style={{ color: 'var(--accent)' }}>Pro</span></span>
                    </Link>
                    <p className="login-subtitle">Masuk untuk mengelola website bimbel Anda</p>
                </div>

                {error && (
                    <div className="login-error animate-fadeIn">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div className="input-with-icon">
                            <span className="input-icon">✉️</span>
                            <input
                                className="form-input pl-10"
                                type="email"
                                placeholder="admin@bimbelpro.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-with-icon">
                            <span className="input-icon">🔒</span>
                            <input
                                className="form-input pl-10"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '👁️' : '🙈'}
                            </button>
                        </div>
                    </div>
                    <div className="form-footer">
                        <label className="checkbox-container">
                            <input type="checkbox" />
                            <span className="checkmark"></span>
                            Ingat saya
                        </label>
                        <a href="#" className="forgot-password">Lupa password?</a>
                    </div>

                    <button className="btn btn-primary btn-lg btn-block pulse-effect-hover" disabled={loading}>
                        {loading ? (
                            <>
                                <div className="spinner-brand sm" style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', marginRight: '8px' }}></div>
                                Memproses...
                            </>
                        ) : '🔐 Masuk Dashboard'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Belum punya akun? <Link href="/order" className="text-accent">Daftar Sekarang</Link></p>
                    <div className="demo-credentials">
                        <small>Demo: admin@bimbelpro.com / admin123</small>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .login-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    position: relative;
                    overflow: hidden;
                    background: var(--bg-primary);
                }

                .login-bg {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                }

                .login-bg-shape {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.4;
                    animation: float 10s infinite ease-in-out;
                }

                .shape-1 { width: 400px; height: 400px; background: var(--accent); top: -100px; right: -100px; }
                .shape-2 { width: 300px; height: 300px; background: var(--info); bottom: -50px; left: -50px; animation-delay: -2s; }
                .shape-3 { width: 200px; height: 200px; background: var(--purple); top: 40%; left: 40%; opacity: 0.2; animation-delay: -5s; }

                .login-card {
                    background: var(--bg-card);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-xl);
                    padding: 48px;
                    width: 100%;
                    max-width: 440px;
                    position: relative;
                    z-index: 10;
                    box-shadow: var(--shadow-xl);
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .login-logo-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    text-decoration: none;
                    margin-bottom: 16px;
                }

                .login-logo-icon {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, var(--accent), var(--accent-dark));
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    box-shadow: 0 4px 12px var(--accent-glow);
                }

                .login-logo-text {
                    font-size: 1.8rem;
                    font-weight: 800;
                    color: white;
                }

                .login-subtitle {
                    color: var(--text-secondary);
                }

                .input-with-icon {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-icon {
                    position: absolute;
                    left: 16px;
                    color: var(--text-muted);
                    z-index: 2;
                }

                .form-input.pl-10 {
                    padding-left: 44px;
                }

                .password-toggle {
                    position: absolute;
                    right: 16px;
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    font-size: 1.1rem;
                    z-index: 2;
                }

                .password-toggle:hover { color: var(--text-primary); }

                .form-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    font-size: 0.9rem;
                }

                .checkbox-container {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    color: var(--text-secondary);
                }

                .forgot-password {
                    color: var(--accent);
                    font-weight: 500;
                }

                .btn-block { width: 100%; }

                .login-footer {
                    text-align: center;
                    margin-top: 32px;
                    padding-top: 24px;
                    border-top: 1px solid var(--border);
                    color: var(--text-secondary);
                }

                .text-accent { color: var(--accent); font-weight: 600; }

                .demo-credentials {
                    margin-top: 16px;
                    padding: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: var(--radius-sm);
                    display: inline-block;
                    color: var(--text-muted);
                }

                .login-error {
                    background: var(--danger-bg);
                    color: var(--danger);
                    padding: 12px;
                    border-radius: var(--radius-md);
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}
