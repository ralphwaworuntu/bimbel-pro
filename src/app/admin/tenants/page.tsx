'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Pagination from '@/components/Pagination';

export default function AdminTenantsPage() {
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        setLoading(true);
        // Mock data for now as API might not be fully populated
        const mockTenants = Array.from({ length: 12 }, (_, i) => ({
            id: i + 1,
            name: `Bimbel ${['Garuda', 'Patriot', 'Jaya', 'Nusantara', 'Sakti'][i % 5]} ${i + 1}`,
            domain: `bimbel-${i + 1}.bimbelpro.com`,
            owner: `Owner ${i + 1}`,
            status: i % 5 === 0 ? 'inactive' : 'active',
            plan: ['Basic', 'Pro', 'Premium'][i % 3],
            expiryDate: new Date(Date.now() + 30 * 86400000 * (i + 1)).toLocaleDateString('id-ID'),
        }));

        // Simulating API call
        setTimeout(() => {
            setTenants(mockTenants);
            setLoading(false);
        }, 500);
    }, []);

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.domain.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);
    const paginatedTenants = filteredTenants.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="admin-page-title">Website Klien (Tenants)</h2>
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
                <input
                    type="text"
                    className="form-input"
                    placeholder="🔍 Cari nama bimbel atau domain..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner"></div></div>
            ) : filteredTenants.length > 0 ? (
                <div className="grid grid-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                    {paginatedTenants.map(tenant => (
                        <div key={tenant.id} className="card animate-fadeInUp" style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                                <span className={`badge ${tenant.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                    {tenant.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div style={{ width: '48px', height: '48px', background: 'var(--bg-secondary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '16px' }}>
                                🏫
                            </div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{tenant.name}</h3>
                            <a href={`https://${tenant.domain}`} target="_blank" className="text-accent hover:underline" style={{ fontSize: '0.9rem', display: 'block', marginBottom: '16px' }}>
                                {tenant.domain} ↗
                            </a>

                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                👤 {tenant.owner}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                📦 Paket {tenant.plan}
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>Manage</button>
                                <button className="btn btn-secondary btn-sm">⚙️</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card empty-state">
                    <p>Tidak ada tenant ditemukan.</p>
                </div>
            )}

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </div>
    );
}
