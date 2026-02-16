import React from 'react';

type SkeletonType = 'text' | 'title' | 'avatar' | 'card' | 'thumbnail' | 'button';

interface SkeletonLoaderProps {
    type?: SkeletonType;
    width?: string | number;
    height?: string | number;
    className?: string;
    lines?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
    type = 'text',
    width,
    height,
    className = '',
    lines = 1,
}) => {
    // Determine styles based on type
    const getStyles = () => {
        const baseStyle: React.CSSProperties = {
            width: width,
            height: height,
        };

        switch (type) {
            case 'text':
                return { ...baseStyle, height: height || '1em', borderRadius: '4px', width: width || '100%' };
            case 'title':
                return { ...baseStyle, height: height || '2em', borderRadius: '6px', width: width || '70%' };
            case 'avatar':
                return { ...baseStyle, width: width || '48px', height: height || '48px', borderRadius: '50%' };
            case 'thumbnail':
                return { ...baseStyle, width: width || '100%', height: height || '200px', borderRadius: '12px' };
            case 'button':
                return { ...baseStyle, width: width || '120px', height: height || '40px', borderRadius: '8px' };
            case 'card':
                return { ...baseStyle, width: width || '100%', height: height || '300px', borderRadius: '16px' };
            default:
                return baseStyle;
        }
    };

    const renderLines = () => {
        if (lines === 1) {
            return (
                <div
                    className={`skeleton-item ${type} ${className}`}
                    style={getStyles()}
                />
            );
        }

        return (
            <div className={`skeleton-group ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Array.from({ length: lines }).map((_, index) => (
                    <div
                        key={index}
                        className={`skeleton-item ${type}`}
                        style={{
                            ...getStyles(),
                            width: index === lines - 1 && lines > 1 ? '70%' : getStyles().width, // Last line shorter
                        }}
                    />
                ))}
            </div>
        );
    };

    return renderLines();
};

export default SkeletonLoader;
