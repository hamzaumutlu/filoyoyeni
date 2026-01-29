import { Bell, ChevronRight, Search, User, Zap } from 'lucide-react';

interface HeaderProps {
    breadcrumb?: string[];
}

export default function Header({ breadcrumb = ['Dashboard'] }: HeaderProps) {
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
            <div className="flex items-center gap-2 md:gap-4">
                {/* Search - Desktop only */}
                <div className="relative hidden lg:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                    <input
                        type="text"
                        placeholder="Ara..."
                        className="w-64 pl-10 pr-4 py-2 rounded-xl bg-[var(--color-bg-card)] text-white text-sm
              border border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)]
              transition-colors placeholder:text-[var(--color-text-muted)]"
                    />
                </div>

                {/* Search Icon - Mobile/Tablet */}
                <button className="lg:hidden w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-glass)]
          flex items-center justify-center text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-accent-orange)]
          transition-all duration-200">
                    <Search className="w-4 h-4 md:w-5 md:h-5" />
                </button>

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
                    <span className="text-sm font-medium text-white hidden sm:block">Admin</span>
                </button>

                {/* Share Button - Desktop only */}
                <button className="hidden md:flex px-4 py-2 rounded-xl gradient-orange text-white text-sm font-medium
          items-center gap-2 hover:opacity-90 transition-opacity">
                    Paylaş
                    <span className="text-lg">↗</span>
                </button>
            </div>
        </header>
    );
}

