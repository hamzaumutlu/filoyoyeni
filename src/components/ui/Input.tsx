import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export default function Input({
    label,
    error,
    icon,
    className = '',
    ...props
}: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                        {icon}
                    </div>
                )}
                <input
                    className={`
                        w-full px-4 py-3 rounded-xl
                        bg-[var(--color-bg-secondary)] 
                        border border-[var(--color-border-glass)]
                        text-white text-sm
                        placeholder:text-[var(--color-text-muted)]
                        focus:border-[var(--color-accent-orange)] focus:outline-none
                        transition-colors
                        ${icon ? 'pl-10' : ''}
                        ${error ? 'border-[var(--color-accent-red)]' : ''}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-[var(--color-accent-red)]">{error}</p>
            )}
        </div>
    );
}
