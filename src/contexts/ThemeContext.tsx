import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// ============================================
// Types
// ============================================
type Theme = 'dark' | 'light';

export interface SystemSettings {
    currency: string;
    dateFormat: string;
    timezone: string;
    language: string;
    autoBackup: boolean;
    darkMode: boolean;
}

export interface NotificationSettings {
    notificationEmail: string;
    emailNotifications: boolean;
    advanceAlerts: boolean;
    paymentReminders: boolean;
    monthlyReports: boolean;
    lowBalanceAlert: boolean;
    personnelChanges: boolean;
}

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    systemSettings: SystemSettings;
    updateSystemSettings: (updates: Partial<SystemSettings>) => void;
    notificationSettings: NotificationSettings;
    updateNotificationSettings: (updates: Partial<NotificationSettings>) => void;
}

const SYSTEM_STORAGE_KEY = 'filoyo_system_settings';
const NOTIF_STORAGE_KEY = 'filoyo_notification_settings';

const DEFAULT_SYSTEM: SystemSettings = {
    currency: 'TRY',
    dateFormat: 'DD.MM.YYYY',
    timezone: 'Europe/Istanbul',
    language: 'tr',
    autoBackup: true,
    darkMode: false,
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
    notificationEmail: '',
    emailNotifications: true,
    advanceAlerts: true,
    paymentReminders: true,
    monthlyReports: false,
    lowBalanceAlert: true,
    personnelChanges: true,
};

const ThemeContext = createContext<ThemeContextType | null>(null);

// ============================================
// Provider
// ============================================
export function ThemeProvider({ children }: { children: ReactNode }) {
    // System Settings — auto-loaded from localStorage
    const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
        try {
            const stored = localStorage.getItem(SYSTEM_STORAGE_KEY);
            if (stored) return { ...DEFAULT_SYSTEM, ...JSON.parse(stored) };
        } catch { /* ignore */ }
        return DEFAULT_SYSTEM;
    });

    // Notification Settings — auto-loaded from localStorage
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
        try {
            const stored = localStorage.getItem(NOTIF_STORAGE_KEY);
            if (stored) return { ...DEFAULT_NOTIFICATIONS, ...JSON.parse(stored) };
        } catch { /* ignore */ }
        return DEFAULT_NOTIFICATIONS;
    });

    const theme: Theme = systemSettings.darkMode ? 'dark' : 'light';

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Persist system settings on every change
    useEffect(() => {
        localStorage.setItem(SYSTEM_STORAGE_KEY, JSON.stringify(systemSettings));
    }, [systemSettings]);

    // Persist notification settings on every change
    useEffect(() => {
        localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notificationSettings));
    }, [notificationSettings]);

    const setTheme = (newTheme: Theme) => {
        setSystemSettings(prev => ({ ...prev, darkMode: newTheme === 'dark' }));
    };

    const updateSystemSettings = (updates: Partial<SystemSettings>) => {
        setSystemSettings(prev => ({ ...prev, ...updates }));
    };

    const updateNotificationSettings = (updates: Partial<NotificationSettings>) => {
        setNotificationSettings(prev => ({ ...prev, ...updates }));
    };

    return (
        <ThemeContext.Provider value={{
            theme, setTheme,
            systemSettings, updateSystemSettings,
            notificationSettings, updateNotificationSettings,
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

// ============================================
// Hook
// ============================================
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
