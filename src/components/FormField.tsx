import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    touched?: boolean;
    as?: 'input' | 'textarea';
    rows?: number;
    className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
    label,
    error,
    touched,
    as = 'input',
    className = '',
    required,
    ...props
}) => {
    const hasError = touched && error;

    return (
        <div className={`form-group ${className} ${hasError ? 'has-error' : ''}`} style={{ position: 'relative', marginBottom: '24px' }}>
            <label className="form-label" style={{
                marginBottom: '8px', display: 'block', fontWeight: 500, fontSize: '0.9rem',
                color: hasError ? 'var(--danger)' : 'var(--text-primary)'
            }}>
                {label} {required && <span className="text-danger">*</span>}
            </label>

            {as === 'textarea' ? (
                <textarea
                    className={`form-input ${hasError ? 'error' : ''}`}
                    style={{
                        width: '100%', padding: '12px 16px', borderRadius: '8px',
                        border: `1px solid ${hasError ? 'var(--danger)' : 'var(--border)'}`,
                        background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                        transition: 'all 0.2s', minHeight: '100px', fontFamily: 'inherit'
                    }}
                    {...(props as any)}
                />
            ) : (
                <input
                    className={`form-input ${hasError ? 'error' : ''}`}
                    style={{
                        width: '100%', padding: '12px 16px', borderRadius: '8px',
                        border: `1px solid ${hasError ? 'var(--danger)' : 'var(--border)'}`,
                        background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                        transition: 'all 0.2s'
                    }}
                    {...(props as any)}
                />
            )}

            {hasError && (
                <small className="text-danger animate-shake" style={{
                    display: 'block', marginTop: '6px', color: 'var(--danger)', fontSize: '0.8rem'
                }}>
                    {error}
                </small>
            )}
        </div>
    );
};

export default FormField;
