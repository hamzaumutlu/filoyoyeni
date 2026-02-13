import { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Users,
    FileSpreadsheet,
    Settings2,
    CreditCard,
    UserCog,
    Settings,
    LogOut,
    MoreHorizontal,
    X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../i18n';

interface NavItem {
    icon: React.ElementType;
    labelKey: string;
    path: string;
    adminOnly?: boolean;
}

// Primary items shown directly in the bottom bar
const primaryNavItems: NavItem[] = [
    { icon: LayoutDashboard, labelKey: 'nav.dashboard', path: '/' },
    { icon: Building2, labelKey: 'nav.companies', path: '/companies' },
    { icon: Users, labelKey: 'nav.personnel', path: '/personnel' },
    { icon: FileSpreadsheet, labelKey: 'nav.dataEntry', path: '/data-entry' },
];

// Items shown inside the "More" overlay
const moreNavItems: NavItem[] = [
    { icon: Settings2, labelKey: 'nav.methods', path: '/methods' },
    { icon: CreditCard, labelKey: 'nav.payments', path: '/payments' },
    { icon: UserCog, labelKey: 'nav.users', path: '/users', adminOnly: true },
    { icon: Settings, labelKey: 'nav.settings', path: '/settings' },
];

export default function MobileBottomNav() {
    const { t } = useTranslation();
    const { logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [moreOpen, setMoreOpen] = useState(false);

    // Close menu on route change
    useEffect(() => {
        setMoreOpen(false);
    }, [location.pathname]);

    // Close menu on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMoreOpen(false);
        };
        if (moreOpen) {
            document.addEventListener('keydown', handleEsc);
            return () => document.removeEventListener('keydown', handleEsc);
        }
    }, [moreOpen]);

    const handleLogout = useCallback(async () => {
        setMoreOpen(false);
        await logout();
        navigate('/login');
    }, [logout, navigate]);

    const filteredMoreItems = moreNavItems.filter(
        (item) => !item.adminOnly || isAdmin
    );

    // Check if any "more" item is currently active
    const isMoreActive = filteredMoreItems.some(
        (item) => location.pathname === item.path
    );

    return (
        <>
            {/* More Overlay */}
            {moreOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMoreOpen(false)}
                    />

                    {/* Menu Panel */}
                    <div
                        className="absolute bottom-0 left-0 right-0 animate-slide-up"
                        style={{
                            animation: 'slideUp 0.25s ease-out forwards',
                        }}
                    >
                        <div className="mx-3 mb-20 rounded-2xl glass-dark border border-[var(--color-border-glass)] overflow-hidden shadow-2xl">
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border-glass)]">
                                <span className="text-sm font-semibold text-white">
                                    {t('nav.menu') || 'Menü'}
                                </span>
                                <button
                                    onClick={() => setMoreOpen(false)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-bg-card)] transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Nav Items */}
                            <div className="py-2 px-2">
                                {filteredMoreItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) => `
                                            flex items-center gap-3 px-4 py-3 rounded-xl
                                            transition-all duration-200
                                            ${isActive
                                                ? 'bg-[var(--color-accent-orange)] text-white'
                                                : 'text-[var(--color-text-secondary)] active:bg-[var(--color-bg-card)]'
                                            }
                                        `}
                                    >
                                        <item.icon className="w-5 h-5 flex-shrink-0" />
                                        <span className="text-sm font-medium">
                                            {t(item.labelKey)}
                                        </span>
                                    </NavLink>
                                ))}
                            </div>

                            {/* Logout */}
                            <div className="px-2 pb-3 pt-1 border-t border-[var(--color-border-glass)]">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                        text-[var(--color-accent-red)] hover:bg-[var(--color-accent-red)]/10
                                        transition-all duration-200 active:scale-[0.98]"
                                >
                                    <LogOut className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm font-medium">
                                        {t('nav.logout')}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Nav Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
                <div className="glass-dark border-t border-[var(--color-border-glass)] safe-area-bottom">
                    <div className="flex items-center justify-around px-2 py-2">
                        {primaryNavItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                                    flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl
                                    transition-all duration-200 min-w-[60px]
                                    ${isActive
                                        ? 'text-[var(--color-accent-orange)]'
                                        : 'text-[var(--color-text-muted)] active:scale-95'
                                    }
                                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div
                                            className={`
                                            p-2 rounded-xl transition-all duration-200
                                            ${isActive
                                                    ? 'bg-[var(--color-accent-orange)]/20'
                                                    : ''
                                                }
                                        `}
                                        >
                                            <item.icon
                                                className={`w-5 h-5 ${isActive ? 'text-[var(--color-accent-orange)]' : ''}`}
                                            />
                                        </div>
                                        <span
                                            className={`text-[10px] font-medium ${isActive ? 'text-[var(--color-accent-orange)]' : ''}`}
                                        >
                                            {t(item.labelKey)}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        ))}

                        {/* More Button */}
                        <button
                            onClick={() => setMoreOpen((v) => !v)}
                            className={`
                                flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl
                                transition-all duration-200 min-w-[60px]
                                ${moreOpen || isMoreActive
                                    ? 'text-[var(--color-accent-orange)]'
                                    : 'text-[var(--color-text-muted)] active:scale-95'
                                }
                            `}
                        >
                            <div
                                className={`
                                p-2 rounded-xl transition-all duration-200
                                ${moreOpen || isMoreActive
                                        ? 'bg-[var(--color-accent-orange)]/20'
                                        : ''
                                    }
                            `}
                            >
                                <MoreHorizontal
                                    className={`w-5 h-5 ${moreOpen || isMoreActive ? 'text-[var(--color-accent-orange)]' : ''}`}
                                />
                            </div>
                            <span
                                className={`text-[10px] font-medium ${moreOpen || isMoreActive ? 'text-[var(--color-accent-orange)]' : ''}`}
                            >
                                {t('nav.more') || 'Daha Fazla'}
                            </span>
                        </button>
                    </div>
                </div>
            </nav>
        </>
    );
}
