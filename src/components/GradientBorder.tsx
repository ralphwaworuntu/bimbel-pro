import React, { ReactNode } from 'react';

interface GradientBorderProps {
    children: ReactNode;
    className?: string;
    colors?: [string, string];
    width?: string;
    radius?: string;
}

const GradientBorder: React.FC<GradientBorderProps> = ({
    children,
    className = '',
    colors = ['#f97316', '#ec4899'], // Orange to Pink
    width = '2px',
    radius = '16px',
}) => {
    return (
        <div className={`gradient-border-wrapper ${className}`} style={{
            position: 'relative',
            borderRadius: radius,
            background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
            padding: width,
        }}>
            <div style={{
                background: 'var(--bg-card)',
                borderRadius: `calc(${radius} - ${width})`,
                height: '100%',
                width: '100%',
                // overflow: 'hidden'
            }}>
                {children}
            </div>
        </div>
    );
};

export default GradientBorder;
