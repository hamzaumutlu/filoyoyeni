import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Users,
    Settings2,
    FileSpreadsheet,
    CreditCard,
    Settings,
    ChevronLeft,
    ChevronRight,
    Zap,
    Search,
    LogOut,
    UserCog,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
    icon: React.ElementType;
    label: string;
    path: string;
    badge?: number;
    adminOnly?: boolean;
}

const mainNavItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Building2, label: 'Firmalar', path: '/companies' },
    { icon: Users, label: 'Personel', path: '/personnel' },
    { icon: Settings2, label: 'Yöntemler', path: '/methods' },
    { icon: FileSpreadsheet, label: 'Veri Girişi', path: '/data-entry' },
    { icon: CreditCard, label: 'Ödemeler', path: '/payments' },
    { icon: UserCog, label: 'Kullanıcılar', path: '/users', adminOnly: true },
];

const bottomNavItems: NavItem[] = [
    { icon: Settings, label: 'Ayarlar', path: '/settings' },
];

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Filter nav items based on user role
    const filteredNavItems = mainNavItems.filter(item => !item.adminOnly || isAdmin);

    return (
        <aside
            className={`
        fixed left-0 top-0 h-screen z-40
        glass-dark flex flex-col
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-[72px]' : 'w-[280px]'}
      `}
        >
            {/* Logo Area */}
            <div className="h-16 flex items-center px-4 border-b border-[var(--color-border-glass)]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-orange flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    {!isCollapsed && (
                        <span className="text-xl font-bold text-white">Filoyo</span>
                    )}
                </div>
            </div>

            {/* Search */}
            {!isCollapsed && (
                <div className="px-4 py-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                        <input
                            type="text"
                            placeholder="Ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-bg-card)] text-white text-sm
                border border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)]
                transition-colors placeholder:text-[var(--color-text-muted)]"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                            <kbd className="px-1.5 py-0.5 text-[10px] bg-[var(--color-bg-secondary)] rounded text-[var(--color-text-muted)]">⌘</kbd>
                            <kbd className="px-1.5 py-0.5 text-[10px] bg-[var(--color-bg-secondary)] rounded text-[var(--color-text-muted)]">K</kbd>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Navigation */}
            <nav className="flex-1 px-3 py-2 overflow-y-auto">
                <ul className="space-y-1">
                    {filteredNavItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200
                  ${isActive
                                        ? 'bg-[var(--color-accent-orange)] text-white shadow-lg'
                                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-white'
                                    }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && (
                                    <>
                                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                                        {item.badge && (
                                            <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--color-accent-orange)] text-white">
                                                {item.badge}
                                            </span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Bottom Navigation */}
            <div className="px-3 py-2 border-t border-[var(--color-border-glass)]">
                <ul className="space-y-1">
                    {bottomNavItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200
                  ${isActive
                                        ? 'bg-[var(--color-bg-card)] text-white'
                                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-white'
                                    }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && (
                                    <span className="text-sm font-medium">{item.label}</span>
                                )}
                            </NavLink>
                        </li>
                    ))}
                    {/* Logout Button */}
                    <li>
                        <button
                            onClick={handleLogout}
                            className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200
                  text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-red)]/10 hover:text-[var(--color-accent-red)]
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                        >
                            <LogOut className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && (
                                <span className="text-sm font-medium">Çıkış</span>
                            )}
                        </button>
                    </li>
                </ul>
            </div>

            {/* User Info */}
            {!isCollapsed && user && (
                <div className="px-4 py-3 border-t border-[var(--color-border-glass)]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl gradient-orange flex items-center justify-center text-white font-semibold text-sm">
                            {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user.email}</p>
                            <p className="text-xs text-[var(--color-text-muted)] capitalize">
                                {user.role === 'super_admin' ? 'Süper Admin' : user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Collapse Toggle */}
            <button
                onClick={onToggle}
                className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border-glass)]
          flex items-center justify-center text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-accent-orange)]
          transition-all duration-200"
            >
                {isCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                ) : (
                    <ChevronLeft className="w-4 h-4" />
                )}
            </button>
        </aside>
    );
}
