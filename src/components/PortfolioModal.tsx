'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export interface Project {
    name: string;
    desc: string;
    descriptionDetail?: string;
    tags: string[];
    icon?: string;
    images?: string[];
    link?: string;
    stats?: { label: string; value: string }[];
}

interface PortfolioModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project | null;
}

const PortfolioModal: React.FC<PortfolioModalProps> = ({ isOpen, onClose, project }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen || !project) return null;

    const nextImage = () => {
        if (project.images && project.images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % project.images!.length);
        }
    };

    const prevImage = () => {
        if (project.images && project.images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + project.images!.length) % project.images!.length);
        }
    };

    return (
        <div className="modal-backdrop animate-fadeIn" style={{
            position: 'fixed', inset: 0, zIndex: 1050,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} onClick={onClose}>
            <div className="modal-content animate-scaleUp" style={{
                background: 'var(--bg-primary)', width: '100%', maxWidth: '900px',
                borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-xl)', maxHeight: '90vh', display: 'flex', flexDirection: 'column'
            }} onClick={e => e.stopPropagation()}>

                {/* Header with Carousel Placeholder or Image */}
                <div style={{ position: 'relative', height: '400px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {project.images && project.images.length > 0 ? (
                        <>
                            <img
                                src={project.images[currentImageIndex]}
                                alt={`${project.name} screenshot ${currentImageIndex + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            {project.images.length > 1 && (
                                <>
                                    <button onClick={prevImage} style={{ position: 'absolute', left: '16px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: '12px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem' }}>←</button>
                                    <button onClick={nextImage} style={{ position: 'absolute', right: '16px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: '12px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem' }}>→</button>
                                    <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
                                        {project.images.map((_, idx) => (
                                            <div key={idx} style={{ width: '8px', height: '8px', borderRadius: '50%', background: idx === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)', transition: 'all 0.3s' }} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div style={{ fontSize: '6rem' }}>{project.icon || '🖼️'}</div>
                    )}

                    <button onClick={onClose} style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white',
                        width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>✕</button>
                </div>

                {/* Content */}
                <div style={{ padding: '32px', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
                        <div>
                            <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>{project.name}</h2>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {project.tags.map(t => (
                                    <span key={t} className="badge badge-info">{t}</span>
                                ))}
                            </div>
                        </div>
                        {project.link && (
                            <a href={project.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                Kunjungi Website ↗
                            </a>
                        )}
                    </div>

                    <div className="grid grid-2" style={{ gap: '40px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--accent)' }}>Tentang Project</h3>
                            <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                                {project.descriptionDetail || project.desc}
                            </p>
                            <p style={{ marginTop: '16px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                                Website ini dirancang khusus untuk memenuhi kebutuhan operasional bimbel dengan fitur-fitur unggulan yang terintegrasi.
                            </p>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--accent)' }}>Statistik Utama</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {project.stats ? project.stats.map((s, i) => (
                                    <div key={i} style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{s.value}</div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{s.label}</div>
                                    </div>
                                )) : (
                                    <>
                                        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>100%</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Uptime</div>
                                        </div>
                                        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Completed</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Status</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortfolioModal;
