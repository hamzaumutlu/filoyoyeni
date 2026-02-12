import { useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { translations, type Language } from './translations';

/**
 * Hook to get translation function based on current language setting.
 * Usage: const { t } = useTranslation();
 *        t('nav.dashboard') → "Dashboard" or "Dashboard"
 *        t('company.totalRecords', { count: 5 }) → "Toplam 5 firma kaydı bulunuyor"
 */
export function useTranslation() {
    const { systemSettings } = useTheme();
    const lang = (systemSettings.language || 'tr') as Language;
    const dict = translations[lang] || translations.tr;

    const t = useCallback(
        (key: string, params?: Record<string, string | number>): string => {
            let text = dict[key] || translations.tr[key] || key;
            if (params) {
                Object.entries(params).forEach(([k, v]) => {
                    text = text.replace(`{${k}}`, String(v));
                });
            }
            return text;
        },
        [dict]
    );

    return { t, language: lang };
}
