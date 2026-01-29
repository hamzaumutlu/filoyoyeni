import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    variant?: 'default' | 'gradient-orange' | 'gradient-dark';
    className?: string;
    hover?: boolean;
}

export default function Card({
    children,
    variant = 'default',
    className = '',
    hover = false,
}: CardProps) {
    const baseClasses = 'rounded-2xl p-6 transition-all duration-200';

    const variantClasses = {
        default: 'bg-[var(--color-bg-card)] border border-[var(--color-border-glass)]',
        'gradient-orange': 'gradient-orange text-white',
        'gradient-dark': 'gradient-dark border border-[var(--color-border-glass)]',
    };

    const hoverClasses = hover
        ? 'hover:border-[var(--color-border-glass-hover)] hover:shadow-lg hover:-translate-y-1'
        : '';

    return (
        <div className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}>
            {children}
        </div>
    );
}
