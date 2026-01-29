import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
    children: React.ReactNode;
    breadcrumb?: string[];
}

export default function MainLayout({ children, breadcrumb }: MainLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)]">
            {/* Sidebar */}
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content */}
            <div
                className={`
          min-h-screen transition-all duration-300
          ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[280px]'}
        `}
            >
                {/* Header */}
                <Header breadcrumb={breadcrumb} />

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
