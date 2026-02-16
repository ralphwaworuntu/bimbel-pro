'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'info' | 'success' | 'warning' | 'error';
}

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: '1', title: 'Selamat Datang!', message: 'Terima kasih telah mengunjungi BimbelPro.', time: 'Baru saja', read: false, type: 'info' },
        { id: '2', title: 'Promo Spesial', message: 'Dapatkan diskon 20% untuk paket tahunan hari ini.', time: '1 jam lalu', read: false, type: 'success' },
    ]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef} style={{ position: 'relative', marginRight: '16px' }}>
            <button
                className={`notification-btn ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    position: 'relative', padding: '8px', borderRadius: '50%',
                    transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >
                <span style={{ fontSize: '1.2rem' }}>🔔</span>
                {unreadCount > 0 && (
                    <span className="badge-notification animate-bounce" style={{
                        position: 'absolute', top: '0', right: '0',
                        background: 'var(--danger)', color: 'white',
                        fontSize: '0.6rem', padding: '2px 5px', borderRadius: '10px',
                        border: '2px solid var(--bg-primary)', fontWeight: 'bold'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown animate-fadeIn" style={{
                    position: 'absolute', top: '40px', right: '-10px',
                    width: '320px', background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)', borderRadius: '12px',
                    boxShadow: 'var(--shadow-lg)', zIndex: 1000, overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '12px 16px', borderBottom: '1px solid var(--border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Notifikasi</h4>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} style={{
                                background: 'none', border: 'none', color: 'var(--accent)',
                                fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500
                            }}>
                                Tandai sudah dibaca
                            </button>
                        )}
                    </div>

                    <div className="notification-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                Tidak ada notifikasi
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    className={`notification-item ${!n.read ? 'unread' : ''}`}
                                    onClick={() => markAsRead(n.id)}
                                    style={{
                                        padding: '12px 16px', borderBottom: '1px solid var(--border)',
                                        background: n.read ? 'transparent' : 'rgba(var(--accent-rgb), 0.05)',
                                        cursor: 'pointer', transition: 'background 0.2s',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{n.title}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.time}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{n.message}</p>
                                    {!n.read && (
                                        <div style={{
                                            position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)',
                                            width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)'
                                        }}></div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
