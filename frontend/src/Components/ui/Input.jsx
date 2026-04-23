import React, { forwardRef } from 'react';
export const Input = forwardRef(({ label, error, icon: Icon, fullWidth = true, className = '', ...props }, ref) => {
    const widthClass = fullWidth ? 'w-full' : '';
    const errorClass = error
        ? 'border-red-500 focus:ring-red-500'
        : 'border-surface-200 focus:ring-brand-400 focus:border-brand-400';
    const iconPadding = Icon ? 'pl-11' : 'pl-4';
    return (<div className={`${widthClass} flex flex-col gap-1.5`}>
        {label && (<label className="text-sm font-medium text-surface-700">
            {label}
          </label>)}
        <div className="relative">
          {Icon && (<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400">
              <Icon size={18}/>
            </div>)}
          <input ref={ref} className={`
              ${widthClass} ${iconPadding} pr-4 py-2.5 
              bg-surface-50 border rounded-xl text-surface-900 
              placeholder:text-surface-400
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:bg-surface-0
              disabled:opacity-50 disabled:bg-surface-100
              ${errorClass} ${className}
            `} {...props}/>
        </div>
        {error && <span className="text-sm text-red-500 mt-0.5">{error}</span>}
      </div>);
});
Input.displayName = 'Input';
