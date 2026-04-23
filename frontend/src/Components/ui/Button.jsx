import React from 'react';
import { motion } from 'framer-motion';
export function Button({ variant = 'primary', size = 'md', children, className = '', fullWidth = false, ...props }) {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
        primary: 'bg-gradient-to-r from-brand-500 to-brand-400 text-white hover:from-brand-600 hover:to-brand-500 focus:ring-brand-500 shadow-soft',
        secondary: 'bg-surface-0 text-surface-800 border-2 border-surface-200 hover:border-brand-500 hover:text-brand-600 focus:ring-surface-200',
        ghost: 'bg-transparent text-surface-600 hover:bg-surface-100 hover:text-surface-900 focus:ring-surface-200',
        success: 'bg-gradient-to-r from-success-500 to-success-400 text-white hover:from-success-600 hover:to-success-500 focus:ring-success-500 shadow-soft',
    };
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5 text-base',
        lg: 'px-8 py-3.5 text-lg',
    };
    const widthClass = fullWidth ? 'w-full' : '';
    return (<motion.button whileHover={{
            scale: props.disabled ? 1 : 1.02,
        }} whileTap={{
            scale: props.disabled ? 1 : 0.98,
        }} className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`} {...props}>
      {children}
    </motion.button>);
}
