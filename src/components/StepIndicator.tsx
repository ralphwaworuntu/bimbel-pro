import React from 'react';

interface Step {
    num: number;
    label: string;
}

interface StepIndicatorProps {
    currentStep: number;
    steps: Step[];
    className?: string;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
    currentStep,
    steps,
    className = '',
}) => {
    return (
        <div className={`step-indicator-container ${className}`}>
            {/* Progress Bar Background */}
            <div className="wizard-progress-track" style={{
                height: '4px', background: 'var(--border)', borderRadius: '4px', marginBottom: '32px', position: 'relative', overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0, background: 'var(--accent)',
                    width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`, transition: 'width 0.4s ease'
                }}></div>
            </div>

            {/* Steps Nodes */}
            <div className="wizard-progress">
                {steps.map((s) => (
                    <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className={`wizard-step ${currentStep === s.num ? 'active' : ''} ${currentStep > s.num ? 'completed' : ''}`}>
                            <div className="wizard-step-num">
                                {currentStep > s.num ? '✓' : s.num}
                            </div>
                        </div>
                        <span style={{
                            fontSize: '0.8rem', marginTop: '8px', fontWeight: 600,
                            color: currentStep === s.num ? 'var(--accent)' : currentStep > s.num ? 'var(--success)' : 'var(--text-muted)',
                            transition: 'color 0.3s'
                        }}>
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StepIndicator;
