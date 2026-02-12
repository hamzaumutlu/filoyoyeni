import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// ============================================
// Types
// ============================================
type Theme = 'dark' | 'light';

interface SystemSettings {
    currency: string;
    dateFormat: string;
    timezone: string;
    language: string;
    autoBackup: boolean;
    darkMode: boolean;
}

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    systemSettings: SystemSettings;
    updateSystemSettings: (updates: Partial<SystemSettings>) => void;
}

const STORAGE_KEY = 'filoyo_system_settings';

const DEFAULT_SYSTEM: SystemSettings = {
    currency: 'TRY',
    dateFormat: 'DD.MM.YYYY',
    timezone: 'Europe/Istanbul',
    language: 'tr',
    autoBackup: true,
    darkMode: false, // Default to light theme
};

const ThemeContext = createContext<ThemeContextType | null>(null);

// ============================================
// Provider
// ============================================
export function ThemeProvider({ children }: { children: ReactNode }) {
    const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return { ...DEFAULT_SYSTEM, ...JSON.parse(stored) };
            }
        } catch {
            // ignore
        }
        return DEFAULT_SYSTEM;
    });

    const theme: Theme = systemSettings.darkMode ? 'dark' : 'light';

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Persist settings on change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(systemSettings));
    }, [systemSettings]);

    const setTheme = (newTheme: Theme) => {
        setSystemSettings(prev => ({ ...prev, darkMode: newTheme === 'dark' }));
    };

    const updateSystemSettings = (updates: Partial<SystemSettings>) => {
        setSystemSettings(prev => {
            const next = { ...prev, ...updates };
            return next;
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, systemSettings, updateSystemSettings }}>
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
