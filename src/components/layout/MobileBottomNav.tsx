import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Users,
    FileSpreadsheet,
    Settings,
} from 'lucide-react';
import { useTranslation } from '../../i18n';

interface NavItem {
    icon: React.ElementType;
    labelKey: string;
    path: string;
}

const mobileNavItems: NavItem[] = [
    { icon: LayoutDashboard, labelKey: 'nav.dashboard', path: '/' },
    { icon: Building2, labelKey: 'nav.companies', path: '/companies' },
    { icon: Users, labelKey: 'nav.personnel', path: '/personnel' },
    { icon: FileSpreadsheet, labelKey: 'nav.dataEntry', path: '/data-entry' },
    { icon: Settings, labelKey: 'nav.settings', path: '/settings' },
];

export default function MobileBottomNav() {
    const { t } = useTranslation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            {/* Glassmorphism background */}
            <div className="glass-dark border-t border-[var(--color-border-glass)] safe-area-bottom">
                <div className="flex items-center justify-around px-2 py-2">
                    {mobileNavItems.map((item) => (
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
                                    <div className={`
                                        p-2 rounded-xl transition-all duration-200
                                        ${isActive
                                            ? 'bg-[var(--color-accent-orange)]/20'
                                            : ''
                                        }
                                    `}>
                                        <item.icon className={`w-5 h-5 ${isActive ? 'text-[var(--color-accent-orange)]' : ''}`} />
                                    </div>
                                    <span className={`text-[10px] font-medium ${isActive ? 'text-[var(--color-accent-orange)]' : ''}`}>
                                        {t(item.labelKey)}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
        </nav>
    );
}
