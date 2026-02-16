'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import StatsCounter from '@/components/StatsCounter';
import Link from 'next/link';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function formatRp(n: number) {
    return new Intl.NumberFormat('id-ID').format(n);
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 18) return 'Selamat Siang';
    return 'Selamat Malam';
}

function Skeleton({ width, height, style }: { width?: string; height?: string; style?: React.CSSProperties }) {
    return (
        <div
            className="skeleton-loader"
            style={{ width: width || '100%', height: height || '20px', ...style }}
        ></div>
    );
}

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch data immediately but don't block UI
        fetch('/api/dashboard')
            .then((res) => {
                if (!res.ok) throw new Error('Gagal memuat data');
                return res.json();
            })
            .then((data) => {
                setStats(data.stats || {});
                setData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError('Gagal memuat data dashboard. Silakan refresh.');
                setLoading(false);
            });
    }, []);

    const lineChartData = {
        labels: data.trafficByDate ? Object.keys(data.trafficByDate) : [],
        datasets: [
            {
                label: 'Pengunjung',
                data: data.trafficByDate ? Object.values(data.trafficByDate).map((d: any) => d?.visitors || 0) : [],
                borderColor: '#f97316',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const barChartData = {
        labels: ['Basic', 'Pro', 'Premium'],
        datasets: [
            {
                label: 'Penjualan Paket',
                data: [12, 19, 5], // Placeholder, replace with API data if available
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                ],
                borderRadius: 4,
            },
        ],
    };

    const cardStyle = {
        background: 'var(--bg-card)',
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        display: 'flex' as const,
        flexDirection: 'column' as const,
        height: '100%',
    };

    // Replace strict loading screen with just an overlay or partial loading
    // We now Render the dashboard structure immediately

    return (
        <div className="dashboard-container">
            {/* WELCOME BANNER */}
            <div className="welcome-banner animate-fadeInUp">
                <div>
                    <h1>{getGreeting()}, {session?.user?.name || 'Admin'}! 👋</h1>
                    <p>Berikut adalah ringkasan performa bisnis bimbel Anda hari ini.</p>
                </div>
                <div className="banner-date">
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {error && (
                <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* QUICK ACTIONS */}
            <div className="quick-actions animate-fadeInUp stagger-1">
                <Link href="/admin/orders?new=true" className="btn btn-secondary btn-sm action-btn">
                    ➕ Buat Order
                </Link>
                <Link href="/admin/tenants" className="btn btn-secondary btn-sm action-btn">
                    🌐 Cek Website
                </Link>
                <button className="btn btn-secondary btn-sm action-btn">
                    📥 Export Laporan
                </button>
                <button className="btn btn-secondary btn-sm action-btn">
                    ⚙️ Pengaturan
                </button>
            </div>

            {/* STATS GRID */}
            <div className="stats-grid animate-fadeInUp stagger-2">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>📦</div>
                    <div>
                        <div className="stat-label">Total Order</div>
                        <div className="stat-value">
                            {loading ? <Skeleton width="60px" height="32px" /> : <StatsCounter end={stats?.totalOrders || 0} />}
                        </div>
                        <div className="stat-desc">
                            {loading ? <Skeleton width="80px" height="14px" /> : <><span className="text-success">+{stats?.ordersThisMonth || 0}</span> bulan ini</>}
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>💰</div>
                    <div>
                        <div className="stat-label">Pendapatan</div>
                        <div className="stat-value text-accent">
                            {loading ? <Skeleton width="100px" height="32px" /> : <>Rp <StatsCounter end={stats?.totalRevenue || 0} /></>}
                        </div>
                        <div className="stat-desc">Total revenue masuk</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>🌐</div>
                    <div>
                        <div className="stat-label">Website Aktif</div>
                        <div className="stat-value">
                            {loading ? <Skeleton width="60px" height="32px" /> : <StatsCounter end={stats?.activeTenants || 0} />}
                        </div>
                        <div className="stat-desc">
                            {loading ? <Skeleton width="120px" height="14px" /> : <>{stats?.totalTenants || 0} total tenant terdaftar</>}
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>⏳</div>
                    <div>
                        <div className="stat-label">Pending Order</div>
                        <div className="stat-value text-warning">
                            {loading ? <Skeleton width="40px" height="32px" /> : <StatsCounter end={stats?.pendingOrders || 0} />}
                        </div>
                        <div className="stat-desc">Perlu diproses segera</div>
                    </div>
                </div>
            </div>

            {/* CHARTS SECTION */}
            <div className="charts-grid">
                <div className="chart-card animate-fadeInUp stagger-3" style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '1.1rem' }}>Traffic Overview</h3>
                        <select className="chart-filter">
                            <option>7 Hari Terakhir</option>
                            <option>30 Hari Terakhir</option>
                        </select>
                    </div>
                    <div style={{ flex: 1, minHeight: '250px', position: 'relative' }}>
                        {loading && (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.5)', zIndex: 10 }}>
                                <div className="spinner"></div>
                            </div>
                        )}
                        <Line data={lineChartData} options={{ maintainAspectRatio: false, responsive: true, plugins: { legend: { display: false } } }} />
                    </div>
                </div>
                <div className="chart-card animate-fadeInUp stagger-4" style={cardStyle}>
                    <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Paket Terlaris</h3>
                    <div style={{ flex: 1, minHeight: '250px', position: 'relative' }}>
                        {loading && (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.5)', zIndex: 10 }}>
                                <div className="spinner"></div>
                            </div>
                        )}
                        <Bar data={barChartData} options={{ maintainAspectRatio: false, responsive: true }} />
                    </div>
                </div>
            </div>

            {/* RECENT ACTIVITY & ORDERS */}
            <div className="bottom-grid">
                <div className="recent-orders animate-fadeInUp stagger-5" style={{ ...cardStyle, padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.1rem' }}>Order Terbaru</h3>
                        <Link href="/admin/orders" style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>Lihat Semua →</Link>
                    </div>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID Order</th>
                                    <th>Klien</th>
                                    <th>Paket</th>
                                    <th>Status</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan={5}><Skeleton height="24px" /></td>
                                        </tr>
                                    ))
                                ) : (
                                    data.recentOrders?.map((order: any) => (
                                        <tr key={order.id} className="hover-row">
                                            <td style={{ fontFamily: 'monospace' }}>{order.orderNumber}</td>
                                            <td>{order.clientName}</td>
                                            <td>{order.package?.name}</td>
                                            <td>
                                                <span className={`badge ${order.status === 'active' ? 'badge-success' :
                                                    order.status === 'processing' ? 'badge-info' :
                                                        order.status === 'pending' ? 'badge-warning' : 'badge-danger'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>Rp {formatRp(order.package?.price || 0)}</td>
                                        </tr>
                                    ))
                                )}
                                {!loading && (!data.recentOrders || data.recentOrders.length === 0) && (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada data order.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="activity-feed animate-fadeInUp stagger-6" style={cardStyle}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Aktivitas Terkini</h3>
                    <div className="feed-list">
                        {[
                            { icon: '💰', text: 'Pembayaran diterima dari Bimbel Garuda', time: '5 menit lalu', color: 'success' },
                            { icon: '📦', text: 'Order baru #ORD-2602-001 masuk', time: '1 jam lalu', color: 'info' },
                            { icon: '👤', text: 'Admin login dari IP baru', time: '2 jam lalu', color: 'warning' },
                            { icon: '🚀', text: 'Website Bimbel Polri X aktif', time: '5 jam lalu', color: 'accent' },
                        ].map((item, i) => (
                            <div key={i} className="feed-item">
                                <span className={`feed-icon bg-${item.color}-soft`}>{item.icon}</span>
                                <div>
                                    <div className="feed-text">{item.text}</div>
                                    <div className="feed-time">{item.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .skeleton-loader {
                    background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--border) 50%, var(--bg-secondary) 75%);
                    background-size: 200% 100%;
                    animation: skeleton-loading 1.5s infinite;
                    border-radius: 4px;
                }

                @keyframes skeleton-loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                .dashboard-container {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .welcome-banner {
                    background: linear-gradient(135deg, var(--accent-dark), var(--bg-card));
                    padding: 32px;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    position: relative;
                    overflow: hidden;
                }
                
                .welcome-banner::after {
                    content: '';
                    position: absolute;
                    top: 0; right: 0; bottom: 0; width: 300px;
                    background: radial-gradient(circle at center, rgba(249,115,22,0.1), transparent 70%);
                    pointer-events: none;
                }

                .welcome-banner h1 { margin-bottom: 8px; font-size: 1.8rem; }
                .welcome-banner p { color: rgba(255,255,255,0.7); margin: 0; }
                .banner-date { font-size: 0.9rem; opacity: 0.8; font-weight: 500; }

                .quick-actions {
                    display: flex;
                    gap: 12px;
                    overflow-x: auto;
                    padding-bottom: 4px;
                }
                
                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    white-space: nowrap;
                    border: 1px solid var(--border);
                    background: var(--bg-card);
                }
                .action-btn:hover {
                    border-color: var(--accent);
                    box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.15);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 24px;
                }

                .stat-card {
                    background: var(--bg-card);
                    padding: 24px;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border);
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    transition: var(--transition);
                }
                
                .stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-lg);
                    border-color: var(--accent);
                }

                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }

                .stat-label { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 4px; }
                .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
                .stat-desc { font-size: 0.8rem; color: var(--text-muted); }

                .charts-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 24px;
                }

                .bottom-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 24px;
                }

                .chart-filter {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.85rem;
                }

                .feed-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .feed-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .feed-item:last-child {
                    border-bottom: none;
                }

                .feed-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1rem;
                    flex-shrink: 0;
                }

                .feed-text { font-size: 0.9rem; margin-bottom: 4px; line-height: 1.4; }
                .feed-time { font-size: 0.75rem; color: var(--text-muted); }
                
                .bg-success-soft { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
                .bg-info-soft { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .bg-warning-soft { background: rgba(234, 179, 8, 0.1); color: #eab308; }
                .bg-accent-soft { background: rgba(249, 115, 22, 0.1); color: #f97316; }

                @media (max-width: 1024px) {
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                    .charts-grid, .bottom-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 640px) {
                    .stats-grid { grid-template-columns: 1fr; }
                    .welcome-banner { flex-direction: column; align-items: flex-start; gap: 16px; }
                }
            `}</style>
        </div>
    );
}
