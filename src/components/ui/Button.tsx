import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200';

    const variantClasses = {
        primary: 'gradient-orange text-white hover:opacity-90 hover:shadow-lg',
        secondary: 'bg-[var(--color-bg-card)] text-white border border-[var(--color-border-glass)] hover:border-[var(--color-accent-orange)]',
        ghost: 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-card)]',
        danger: 'bg-[var(--color-accent-red)] text-white hover:opacity-90',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    const widthClasses = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${widthClasses} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
