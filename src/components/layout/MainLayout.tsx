import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileBottomNav from './MobileBottomNav';

interface MainLayoutProps {
    children: React.ReactNode;
    breadcrumb?: string[];
}

export default function MainLayout({ children, breadcrumb }: MainLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)]">
            {/* Sidebar - Hidden on mobile */}
            <div className="hidden md:block">
                <Sidebar
                    isCollapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
            </div>

            {/* Main Content */}
            <div
                className={`
          min-h-screen transition-all duration-300
          ${sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[280px]'}
          pb-20 md:pb-0
        `}
            >
                {/* Header */}
                <Header breadcrumb={breadcrumb} />

                {/* Page Content */}
                <main className="p-4 md:p-6">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation - Instagram style */}
            <MobileBottomNav />
        </div>
    );
}

