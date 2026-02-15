'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Filler, Legend);

function formatRp(n: number) {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(n);
}

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard')
            .then(r => r.json())
            .then(setData)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="loading-page" style={{ minHeight: '400px' }}><div className="spinner"></div></div>;
    }

    if (!data) return <p>Error loading dashboard</p>;

    const { stats, recentOrders, trafficByDate } = data;

    // Traffic chart
    const trafficDates = Object.keys(trafficByDate).slice(-14);
    const trafficChartData = {
        labels: trafficDates.map(d => d.slice(5)),
        datasets: [
            {
                label: 'Page Views',
                data: trafficDates.map(d => trafficByDate[d]?.pageViews || 0),
                borderColor: '#f97316',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
            },
            {
                label: 'Visitors',
                data: trafficDates.map(d => trafficByDate[d]?.visitors || 0),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
            },
        ],
    };

    const chartOptions: any = {
        responsive: true,
        plugins: {
            legend: { labels: { color: '#94a3b8' } },
        },
        scales: {
            x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        },
    };

    const statCards = [
        { label: 'Total Order', value: stats.totalOrders, icon: '📦', color: 'var(--accent)', bgColor: 'rgba(249,115,22,0.15)', sub: `${stats.ordersThisWeek} minggu ini` },
        { label: 'Website Aktif', value: stats.activeTenants, icon: '🌐', color: 'var(--success)', bgColor: 'var(--success-bg)', sub: `${stats.inactiveTenants} nonaktif` },
        { label: 'Pending', value: stats.pendingOrders, icon: '⏳', color: 'var(--warning)', bgColor: 'var(--warning-bg)', sub: 'menunggu proses' },
        { label: 'Total Revenue', value: formatRp(stats.totalRevenue), icon: '💰', color: 'var(--purple)', bgColor: 'var(--purple-bg)', sub: `${stats.ordersThisMonth} order bulan ini` },
    ];

    return (
        <>
            <div className="admin-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Selamat datang di Bimbel Pro Admin Panel</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-4" style={{ marginBottom: '32px' }}>
                {statCards.map((s, i) => (
                    <div key={i} className="stat-card animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="stat-card-header">
                            <span className="stat-card-label">{s.label}</span>
                            <div className="stat-card-icon" style={{ background: s.bgColor, color: s.color }}>{s.icon}</div>
                        </div>
                        <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
                        <div className="stat-card-change">{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-2" style={{ marginBottom: '32px' }}>
                <div className="chart-container">
                    <div className="chart-title">📈 Traffic (14 Hari Terakhir)</div>
                    <Line data={trafficChartData} options={chartOptions} />
                </div>
                <div className="chart-container">
                    <div className="chart-title">📊 Page Views per Hari</div>
                    <Bar
                        data={{
                            labels: trafficDates.slice(-7).map(d => d.slice(5)),
                            datasets: [{
                                label: 'Page Views',
                                data: trafficDates.slice(-7).map(d => trafficByDate[d]?.pageViews || 0),
                                backgroundColor: 'rgba(249, 115, 22, 0.6)',
                                borderRadius: 6,
                            }],
                        }}
                        options={chartOptions}
                    />
                </div>
            </div>

            {/* Recent Orders */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontWeight: 700 }}>📦 Order Terbaru</h3>
                    <Link href="/admin/orders" className="btn btn-secondary btn-sm">Lihat Semua →</Link>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>No. Order</th>
                                <th>Brand</th>
                                <th>Paket</th>
                                <th>Status</th>
                                <th>Tanggal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((o: any) => (
                                <tr key={o.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>
                                        <Link href={`/admin/orders/${o.id}`}>{o.orderNumber}</Link>
                                    </td>
                                    <td>{o.brandName}</td>
                                    <td>{o.package?.name}</td>
                                    <td>
                                        <span className={`badge ${o.status === 'active' ? 'badge-success' :
                                                o.status === 'processing' ? 'badge-info' :
                                                    o.status === 'pending' ? 'badge-warning' :
                                                        o.status === 'ready' ? 'badge-purple' : 'badge-danger'
                                            }`}>
                                            {o.status}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)' }}>
                                        {new Date(o.createdAt).toLocaleDateString('id-ID')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
