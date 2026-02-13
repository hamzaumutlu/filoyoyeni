import { useState, useRef, useEffect } from 'react';
import { Bell, Building2, ChevronDown, ChevronRight, Check, Search, User, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../i18n';

interface HeaderProps {
    breadcrumb?: string[];
}

export default function Header({ breadcrumb = ['Dashboard'] }: HeaderProps) {
    const { t } = useTranslation();
    const { activeCompanyId, activeCompanyName, companies, switchCompany, isSuperAdmin } = useAuth();
    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowCompanyDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <header className="h-14 md:h-16 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-glass)] flex items-center justify-between px-4 md:px-6">
            {/* Left: Logo (mobile) or Breadcrumb (desktop) */}
            <div className="flex items-center gap-2">
                {/* Mobile: Show Logo */}
                <div className="flex md:hidden items-center gap-2">
                    <div className="w-8 h-8 rounded-lg gradient-orange flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold text-white">Filoyo</span>
                </div>

                {/* Desktop: Show Breadcrumb */}
                <nav className="hidden md:flex items-center gap-2 text-sm">
                    <span className="text-[var(--color-text-muted)]">Filoyo</span>
                    {breadcrumb.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                            <span className={index === breadcrumb.length - 1 ? 'text-white font-medium' : 'text-[var(--color-text-muted)]'}>
                                {item}
                            </span>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 md:gap-3">
                {/* Company Selector */}
                {companies.length > 0 && (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => isSuperAdmin && setShowCompanyDropdown(!showCompanyDropdown)}
                            className={`flex items-center gap-2 px-2.5 md:px-3 py-1.5 md:py-2 rounded-xl border transition-all duration-200 ${showCompanyDropdown
                                    ? 'bg-[var(--color-accent-orange)]/10 border-[var(--color-accent-orange)] text-[var(--color-accent-orange)]'
                                    : 'bg-[var(--color-bg-card)] border-[var(--color-border-glass)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-orange)] hover:text-white'
                                } ${isSuperAdmin ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                            <Building2 className="w-4 h-4" />
                            <span className="text-sm font-medium max-w-[120px] truncate hidden sm:block">
                                {activeCompanyName || 'Firma Seç'}
                            </span>
                            {isSuperAdmin && companies.length > 1 && (
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCompanyDropdown ? 'rotate-180' : ''}`} />
                            )}
                        </button>

                        {/* Dropdown */}
                        {showCompanyDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--color-bg-card)] border border-[var(--color-border-glass)] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-2 border-b border-[var(--color-border-glass)]">
                                    <p className="text-xs text-[var(--color-text-muted)] px-2 py-1">Firma Değiştir</p>
                                </div>
                                <div className="max-h-64 overflow-y-auto p-1">
                                    {companies.map((company) => (
                                        <button
                                            key={company.id}
                                            onClick={() => {
                                                switchCompany(company.id);
                                                setShowCompanyDropdown(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${company.id === activeCompanyId
                                                    ? 'bg-[var(--color-accent-orange)]/10 text-[var(--color-accent-orange)]'
                                                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-white'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${company.id === activeCompanyId
                                                    ? 'gradient-orange'
                                                    : 'bg-[var(--color-bg-secondary)]'
                                                }`}>
                                                <Building2 className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-sm font-medium flex-1 truncate">{company.name}</span>
                                            {company.id === activeCompanyId && (
                                                <Check className="w-4 h-4 text-[var(--color-accent-orange)]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Search - Desktop only */}
                <div className="relative hidden lg:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                    <input
                        type="text"
                        placeholder={t('header.search')}
                        className="w-64 pl-10 pr-4 py-2 rounded-xl bg-[var(--color-bg-card)] text-white text-sm
              border border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)]
              transition-colors placeholder:text-[var(--color-text-muted)]"
                    />
                </div>

                {/* Notifications */}
                <button className="relative w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-glass)]
          flex items-center justify-center text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-accent-orange)]
          transition-all duration-200">
                    <Bell className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--color-accent-orange)] text-white text-[10px] flex items-center justify-center font-medium">
                        3
                    </span>
                </button>

                {/* User Profile */}
                <button className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 md:py-2 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-glass)]
          hover:border-[var(--color-accent-orange)] transition-all duration-200">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full gradient-orange flex items-center justify-center">
                        <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white hidden sm:block">{t('header.admin')}</span>
                </button>
            </div>
        </header>
    );
}

