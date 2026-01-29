import { Bell, ChevronRight, Search, User } from 'lucide-react';

interface HeaderProps {
    breadcrumb?: string[];
}

export default function Header({ breadcrumb = ['Dashboard'] }: HeaderProps) {
    return (
        <header className="h-16 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-glass)] flex items-center justify-between px-6">
            {/* Left: Breadcrumb */}
            <div className="flex items-center gap-2">
                <nav className="flex items-center gap-2 text-sm">
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
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                    <input
                        type="text"
                        placeholder="Ara..."
                        className="w-64 pl-10 pr-4 py-2 rounded-xl bg-[var(--color-bg-card)] text-white text-sm
              border border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)]
              transition-colors placeholder:text-[var(--color-text-muted)]"
                    />
                </div>

                {/* Notifications */}
                <button className="relative w-10 h-10 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-glass)]
          flex items-center justify-center text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-accent-orange)]
          transition-all duration-200">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--color-accent-orange)] text-white text-[10px] flex items-center justify-center font-medium">
                        3
                    </span>
                </button>

                {/* User Profile */}
                <button className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-glass)]
          hover:border-[var(--color-accent-orange)] transition-all duration-200">
                    <div className="w-8 h-8 rounded-full gradient-orange flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white hidden sm:block">Admin</span>
                </button>

                {/* Share Button */}
                <button className="px-4 py-2 rounded-xl gradient-orange text-white text-sm font-medium
          flex items-center gap-2 hover:opacity-90 transition-opacity">
                    Paylaş
                    <span className="text-lg">↗</span>
                </button>
            </div>
        </header>
    );
}
