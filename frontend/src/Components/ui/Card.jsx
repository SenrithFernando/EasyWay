import React from 'react';
import { motion } from 'framer-motion';
export function Card({ variant = 'default', padding = 'md', children, className = '', hoverable = false, ...props }) {
    const baseStyles = 'bg-surface-0 rounded-2xl overflow-hidden';
    const variants = {
        default: 'shadow-card border border-surface-100',
        elevated: 'shadow-elevated border border-surface-100',
        outlined: 'border-2 border-surface-200 shadow-none',
    };
    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };
    const hoverStyles = hoverable
        ? 'transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 cursor-pointer'
        : '';
    return (<motion.div className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${hoverStyles} ${className}`} {...props}>
      {children}
    </motion.div>);
}
