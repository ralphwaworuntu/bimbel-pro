'use client';

export default function LoadingSpinner({ text = 'Memuat...', fullScreen = false }) {
    if (fullScreen) {
        return (
            <div className="loading-overlay">
                <div className="loading-container">
                    <div className="spinner-brand">
                        <div className="spinner-ring"></div>
                        <div className="spinner-icon">🚀</div>
                    </div>
                    <p className="loading-text">{text}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="loading-container inline">
            <div className="spinner-brand sm">
                <div className="spinner-ring"></div>
                <div className="spinner-icon">🚀</div>
            </div>
            {text && <span className="loading-text-sm">{text}</span>}
        </div>
    );
}
