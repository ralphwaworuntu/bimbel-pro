'use client';

import { useState } from 'react';
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
    ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import StatsCounter from '@/components/StatsCounter';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
);

export default function AdminAnalyticsPage() {
    const [period, setPeriod] = useState('30d');

    const lineChartWithOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' as const },
        },
        scales: {
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
            x: { grid: { display: false } }
        }
    };

    // Dummy Data based on period
    const labels = period === '7d'
        ? ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
        : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

    const trafficData = {
        labels,
        datasets: [
            {
                label: 'Pengunjung',
                data: period === '7d' ? [120, 190, 300, 500, 200, 300, 450] : [2000, 3500, 4000, 5500],
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Unique Visitors',
                data: period === '7d' ? [80, 120, 200, 350, 150, 220, 300] : [1500, 2500, 3000, 4000],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const packageData = {
        labels: ['Basic', 'Pro', 'Premium'],
        datasets: [
            {
                label: '# of Votes',
                data: [12, 19, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const revenueData = {
        labels,
        datasets: [
            {
                label: 'Revenue (Juta Rp)',
                data: period === '7d' ? [5, 10, 8, 15, 12, 20, 25] : [50, 75, 60, 90],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 className="admin-page-title">Analitik Bisnis</h2>
                <div style={{ display: 'flex', background: 'var(--bg-card)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    {['7d', '30d', '90d'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                background: period === p ? 'var(--accent)' : 'transparent',
                                color: period === p ? 'white' : 'var(--text-secondary)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            {p.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-4" style={{ marginBottom: '32px' }}>
                {[
                    { label: 'Total Visits', value: 12543, trend: '+12%', color: 'info' },
                    { label: 'Avg. Duration', value: '4m 32s', trend: '+5%', color: 'success' },
                    { label: 'Bounce Rate', value: '42.5%', trend: '-2%', color: 'warning' }, // Lower is better
                    { label: 'Conversion', value: '3.2%', trend: '+0.5%', color: 'accent' },
                ].map((kpi, i) => (
                    <div key={i} className="card animate-fadeInUp" style={{ padding: '24px' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>{kpi.label}</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>
                            {typeof kpi.value === 'number' ? <StatsCounter end={kpi.value} /> : kpi.value}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: kpi.trend.startsWith('+') ? 'var(--success)' : 'var(--danger)' }}>
                            {kpi.trend.startsWith('+') ? '▲' : '▼'} {kpi.trend} vs last period
                        </div>
                    </div>
                ))}
            </div>

            <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div className="card animate-fadeInUp stagger-1" style={{ height: '400px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Traffic Growth</h3>
                    <div style={{ height: '320px' }}>
                        <Line data={trafficData} options={lineChartWithOptions} />
                    </div>
                </div>
                <div className="card animate-fadeInUp stagger-2" style={{ height: '400px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Revenue Trend</h3>
                    <div style={{ height: '320px' }}>
                        <Bar data={revenueData} options={lineChartWithOptions} />
                    </div>
                </div>
            </div>

            <div className="grid grid-2" style={{ gap: '24px' }}>
                <div className="card animate-fadeInUp stagger-3" style={{ height: '350px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Package Distribution</h3>
                    <div style={{ height: '270px', display: 'flex', justifyContent: 'center' }}>
                        <Doughnut data={packageData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                </div>
                <div className="card animate-fadeInUp stagger-4">
                    <h3 style={{ marginBottom: '20px' }}>Top Referrals</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Source</th>
                                <th>Visits</th>
                                <th>Conv.</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Google / Organic</td><td>4,231</td><td>2.1%</td></tr>
                            <tr><td>Facebook Ads</td><td>3,102</td><td>4.5%</td></tr>
                            <tr><td>Direct</td><td>1,540</td><td>1.8%</td></tr>
                            <tr><td>TikTok</td><td>980</td><td>3.2%</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
