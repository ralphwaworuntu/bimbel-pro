'use client';

import Modal from './Modal';
import { useRef, useEffect } from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'info',
    isLoading = false
}: ConfirmDialogProps) {
    const cancelRef = useRef<HTMLButtonElement>(null);

    // Auto-focus cancel button for safety
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => cancelRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const variantStyles = {
        danger: 'btn-danger',
        warning: 'btn-warning',
        info: 'btn-primary'
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm" title={title}>
            <div className="confirm-dialog-content">
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
                    {message}
                </p>
                <div className="confirm-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                        ref={cancelRef}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        className={`btn ${variantStyles[variant]}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="spinner-sm"></span> Processing...
                            </span>
                        ) : confirmLabel}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .confirm-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }
                
                .spinner-sm {
                    width: 14px;
                    height: 14px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </Modal>
    );
}
