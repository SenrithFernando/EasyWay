import React from 'react';
export function Avatar({ src, alt, fallback, size = 'md', className = '', }) {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
    };
    return (<div className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-brand-100 text-brand-700 font-semibold border-2 border-surface-0 shadow-sm ${sizes[size]} ${className}`}>
      {src ? (<img src={src} alt={alt || fallback} className="w-full h-full object-cover" onError={(e) => {
                ;
                e.target.style.display = 'none';
            }}/>) : (<span>{fallback.substring(0, 2).toUpperCase()}</span>)}
    </div>);
}
