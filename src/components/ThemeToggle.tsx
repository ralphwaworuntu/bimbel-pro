'use client';

import { useTheme } from './ThemeProvider';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Render a placeholder to match hydration
        return <div style={{ width: '36px', height: '36px' }} />;
    }

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? '🌙' : '☀️'}
            <style jsx>{`
                .theme-toggle-btn {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    color: var(--text-primary);
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 1.2rem;
                    transition: all 0.2s ease;
                }
                .theme-toggle-btn:hover {
                    background: var(--bg-hover);
                    transform: scale(1.1);
                    border-color: var(--accent);
                }
            `}</style>
        </button>
    );
}
