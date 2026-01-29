import type { SelectHTMLAttributes } from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
}

export default function Select({
    label,
    error,
    options,
    placeholder,
    className = '',
    ...props
}: SelectProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    {label}
                </label>
            )}
            <select
                className={`
                    w-full px-4 py-3 rounded-xl
                    bg-[var(--color-bg-secondary)] 
                    border border-[var(--color-border-glass)]
                    text-white text-sm
                    focus:border-[var(--color-accent-orange)] focus:outline-none
                    transition-colors
                    appearance-none
                    cursor-pointer
                    ${error ? 'border-[var(--color-accent-red)]' : ''}
                    ${className}
                `}
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '20px',
                }}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[var(--color-bg-secondary)]">
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1 text-sm text-[var(--color-accent-red)]">{error}</p>
            )}
        </div>
    );
}
