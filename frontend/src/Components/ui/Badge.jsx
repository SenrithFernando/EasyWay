import React from 'react';
export function Badge({ variant = 'neutral', children, className = '', icon, }) {
    const variants = {
        success: 'bg-success-100 text-success-700 border-success-200',
        warning: 'bg-warm-100 text-warm-700 border-warm-200',
        error: 'bg-red-100 text-red-700 border-red-200',
        info: 'bg-blue-100 text-blue-700 border-blue-200',
        neutral: 'bg-surface-100 text-surface-700 border-surface-200',
        brand: 'bg-brand-100 text-brand-700 border-brand-200',
        warm: 'bg-warm-100 text-warm-700 border-warm-200',
    };
    return (<span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>);
}
