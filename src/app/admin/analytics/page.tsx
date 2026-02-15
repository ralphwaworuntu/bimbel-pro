'use client';

import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

export default function AdminAnalyticsPage() {
    const [analytics, setAnalytics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<string>('');

    useEffect(() => {
        fetch('/api/analytics').then(r => r.json()).then((d) => {
            setAnalytics(d);
            if (d.length > 0) setSelected(d[0].tenantId);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const selectedTenant = analytics.find(a => a.tenantId === selected);

    const chartOptions: any = {
        responsive: true,
        plugins: { legend: { labels: { color: '#94a3b8' } } },
        scales: {
            x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        },
    };

    if (loading) return <div className="loading-page" style={{ minHeight: '400px' }}><div className="spinner"></div></div>;

    return (
        <>
            <div className="admin-header">
                <div>
                    <h1 className="page-title">📈 Analitik Traffic</h1>
                    <p className="page-subtitle">Monitor performa website klien</p>
                </div>
            </div>

            {analytics.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📈</div>
                    <h3>Belum Ada Data</h3>
                    <p>Data analitik akan muncul ketika ada website klien yang aktif</p>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-3" style={{ marginBottom: '24px' }}>
                        {analytics.map(a => (
                            <div
                                key={a.tenantId}
                                className="stat-card"
                                style={{ cursor: 'pointer', borderColor: selected === a.tenantId ? 'var(--accent)' : undefined }}
                                onClick={() => setSelected(a.tenantId)}
                            >
                                <div className="stat-card-header">
                                    <span className="stat-card-label">{a.brandName}</span>
                                    <span className={`badge ${a.isActive ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.75rem' }}>
                                        {a.isActive ? 'aktif' : 'off'}
                                    </span>
                                </div>
                                <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>
                                    {a.totalPageViews.toLocaleString()}
                                </div>
                                <div className="stat-card-change">
                                    {a.totalVisitors.toLocaleString()} visitors • {a.packageName}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Detail Chart */}
                    {selectedTenant && (
                        <div className="chart-container animate-fadeIn">
                            <div className="chart-title">
                                📊 Traffic: {selectedTenant.brandName}
                                <span style={{ marginLeft: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    ({selectedTenant.subdomain}.bimbelpro.com)
                                </span>
                            </div>
                            <Line
                                data={{
                                    labels: selectedTenant.dailyLogs.map((l: any) =>
                                        new Date(l.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                                    ).reverse(),
                                    datasets: [
                                        {
                                            label: 'Page Views',
                                            data: [...selectedTenant.dailyLogs].reverse().map((l: any) => l.pageViews),
                                            borderColor: '#f97316',
                                            backgroundColor: 'rgba(249, 115, 22, 0.1)',
                                            fill: true,
                                            tension: 0.4,
                                        },
                                        {
                                            label: 'Visitors',
                                            data: [...selectedTenant.dailyLogs].reverse().map((l: any) => l.visitors),
                                            borderColor: '#3b82f6',
                                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                            fill: true,
                                            tension: 0.4,
                                        },
                                    ],
                                }}
                                options={chartOptions}
                            />
                        </div>
                    )}
                </>
            )}
        </>
    );
}
