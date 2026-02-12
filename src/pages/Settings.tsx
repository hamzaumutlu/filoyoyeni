import { useState, useEffect, useCallback } from 'react';
import {
    Building2,
    Bell,
    Shield,
    Globe,
    Save,
    Loader2,
    Check,
    UserCircle,
    Mail,
    Phone,
    MapPin,
    Palette,
    Clock,
    Calendar,
    DollarSign,
    ToggleLeft,
    ToggleRight,
    Lock,
    Eye,
    EyeOff,
} from 'lucide-react';
import { MainLayout } from '../components/layout';
import { Card, Button } from '../components/ui';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ============================================
// Types
// ============================================
interface CompanySettings {
    companyName: string;
    authorizedEmail: string;
    phone: string;
    address: string;
    taxId: string;
    website: string;
}

interface SystemSettings {
    currency: string;
    dateFormat: string;
    timezone: string;
    language: string;
    autoBackup: boolean;
    darkMode: boolean;
}

interface NotificationSettings {
    emailNotifications: boolean;
    advanceAlerts: boolean;
    paymentReminders: boolean;
    monthlyReports: boolean;
    lowBalanceAlert: boolean;
    personnelChanges: boolean;
}

interface SecuritySettings {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// ============================================
// Default Values
// ============================================
const DEFAULT_COMPANY: CompanySettings = {
    companyName: 'Filoyo',
    authorizedEmail: '',
    phone: '',
    address: '',
    taxId: '',
    website: '',
};

const DEFAULT_SYSTEM: SystemSettings = {
    currency: 'TRY',
    dateFormat: 'DD.MM.YYYY',
    timezone: 'Europe/Istanbul',
    language: 'tr',
    autoBackup: true,
    darkMode: true,
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
    emailNotifications: true,
    advanceAlerts: true,
    paymentReminders: true,
    monthlyReports: false,
    lowBalanceAlert: true,
    personnelChanges: true,
};

// ============================================
// Storage keys & persistence helpers
// ============================================
const DEMO_COMPANY_ID = '00000000-0000-0000-0000-000000000001';
const SETTINGS_TABLE = 'settings';

async function loadSettings(category: string): Promise<Record<string, unknown> | null> {
    if (!isSupabaseConfigured()) {
        const stored = localStorage.getItem(`filoyo_settings_${category}`);
        return stored ? JSON.parse(stored) : null;
    }

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from(SETTINGS_TABLE)
            .select('data')
            .eq('company_id', DEMO_COMPANY_ID)
            .eq('category', category)
            .maybeSingle();

        if (error) throw error;
        return data?.data || null;
    } catch (err) {
        console.error('Load settings error:', err);
        // Fallback to localStorage if table doesn't exist yet
        const stored = localStorage.getItem(`filoyo_settings_${category}`);
        return stored ? JSON.parse(stored) : null;
    }
}

async function saveSettings(category: string, data: Record<string, unknown>): Promise<void> {
    // Always save to localStorage as a backup
    localStorage.setItem(`filoyo_settings_${category}`, JSON.stringify(data));

    if (!isSupabaseConfigured()) return;

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existing, error: lookupErr } = await (supabase as any)
            .from(SETTINGS_TABLE)
            .select('id')
            .eq('company_id', DEMO_COMPANY_ID)
            .eq('category', category)
            .maybeSingle();

        if (lookupErr) throw lookupErr;

        if (existing) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
                .from(SETTINGS_TABLE)
                .update({ data, updated_at: new Date().toISOString() })
                .eq('id', existing.id);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
                .from(SETTINGS_TABLE)
                .insert({
                    company_id: DEMO_COMPANY_ID,
                    category,
                    data,
                });
        }
    } catch (err) {
        console.error('Save settings error:', err);
        // Already saved to localStorage above as fallback
    }
}

// ============================================
// Toggle Component
// ============================================
function Toggle({ enabled, onChange, label, description }: {
    enabled: boolean;
    onChange: (val: boolean) => void;
    label: string;
    description?: string;
}) {
    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <span className="text-white font-medium">{label}</span>
                {description && (
                    <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{description}</p>
                )}
            </div>
            <button
                onClick={() => onChange(!enabled)}
                className="transition-colors"
            >
                {enabled ? (
                    <ToggleRight className="w-10 h-10 text-[var(--color-accent-green)]" />
                ) : (
                    <ToggleLeft className="w-10 h-10 text-[var(--color-text-muted)]" />
                )}
            </button>
        </div>
    );
}

// ============================================
// Section Header Component
// ============================================
function SectionHeader({ icon: Icon, title, description }: {
    icon: React.ElementType;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-orange)]/20 flex items-center justify-center">
                <Icon className="w-6 h-6 text-[var(--color-accent-orange)]" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">{description}</p>
            </div>
        </div>
    );
}

// ============================================
// Main Settings Page
// ============================================
export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'company' | 'system' | 'notifications' | 'security'>('company');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form States
    const [company, setCompany] = useState<CompanySettings>(DEFAULT_COMPANY);
    const [system, setSystem] = useState<SystemSettings>(DEFAULT_SYSTEM);
    const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
    const [security, setSecurity] = useState<SecuritySettings>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Load settings on mount
    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const [companyData, systemData, notifData] = await Promise.all([
                    loadSettings('company'),
                    loadSettings('system'),
                    loadSettings('notifications'),
                ]);

                if (companyData) setCompany({ ...DEFAULT_COMPANY, ...companyData } as CompanySettings);
                if (systemData) setSystem({ ...DEFAULT_SYSTEM, ...systemData } as SystemSettings);
                if (notifData) setNotifications({ ...DEFAULT_NOTIFICATIONS, ...notifData } as NotificationSettings);
            } catch (err) {
                console.error('Load error:', err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Save handler
    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            if (activeTab === 'company') {
                await saveSettings('company', company as unknown as Record<string, unknown>);
            } else if (activeTab === 'system') {
                await saveSettings('system', system as unknown as Record<string, unknown>);
            } else if (activeTab === 'notifications') {
                await saveSettings('notifications', notifications as unknown as Record<string, unknown>);
            } else if (activeTab === 'security') {
                if (security.newPassword !== security.confirmPassword) {
                    alert('Yeni şifreler eşleşmiyor!');
                    setSaving(false);
                    return;
                }
                if (security.newPassword && security.newPassword.length < 6) {
                    alert('Şifre en az 6 karakter olmalıdır!');
                    setSaving(false);
                    return;
                }
                // Password change would be handled by Supabase Auth if configured
                setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            console.error('Save error:', err);
            alert('Kayıt başarısız: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
        } finally {
            setSaving(false);
        }
    }, [activeTab, company, system, notifications, security]);

    const tabs = [
        { id: 'company' as const, label: 'Firma Bilgileri', icon: Building2 },
        { id: 'system' as const, label: 'Sistem Ayarları', icon: Globe },
        { id: 'notifications' as const, label: 'Bildirimler', icon: Bell },
        { id: 'security' as const, label: 'Güvenlik', icon: Shield },
    ];

    return (
        <MainLayout breadcrumb={['Ayarlar']}>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Ayarlar</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                        Sistem ve firma ayarlarını yönetin
                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving || activeTab === 'security'}>
                    {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : saved ? (
                        <Check className="w-4 h-4 mr-2 text-[var(--color-accent-green)]" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    {saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi!' : 'Kaydet'}
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 p-2 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-glass)] mb-6 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-[var(--color-accent-orange)] text-white shadow-lg shadow-[var(--color-accent-orange)]/30'
                            : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)] hover:text-white'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="font-medium">{tab.label}</span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[var(--color-accent-orange)] animate-spin" />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* =============================== */}
                    {/* COMPANY INFO TAB */}
                    {/* =============================== */}
                    {activeTab === 'company' && (
                        <Card>
                            <SectionHeader
                                icon={Building2}
                                title="Firma Bilgileri"
                                description="Firmanızın genel bilgilerini güncelleyin"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        <UserCircle className="w-4 h-4 inline mr-2 -mt-0.5" />
                                        Firma Adı
                                    </label>
                                    <input
                                        type="text"
                                        value={company.companyName}
                                        onChange={(e) => setCompany({ ...company, companyName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                        placeholder="Firma adınız"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        <Mail className="w-4 h-4 inline mr-2 -mt-0.5" />
                                        Yetkili E-posta
                                    </label>
                                    <input
                                        type="email"
                                        value={company.authorizedEmail}
                                        onChange={(e) => setCompany({ ...company, authorizedEmail: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                        placeholder="yetkili@firma.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        <Phone className="w-4 h-4 inline mr-2 -mt-0.5" />
                                        Telefon
                                    </label>
                                    <input
                                        type="tel"
                                        value={company.phone}
                                        onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                        placeholder="+90 555 123 4567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        <Globe className="w-4 h-4 inline mr-2 -mt-0.5" />
                                        Website
                                    </label>
                                    <input
                                        type="url"
                                        value={company.website}
                                        onChange={(e) => setCompany({ ...company, website: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                        placeholder="https://firma.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        <MapPin className="w-4 h-4 inline mr-2 -mt-0.5" />
                                        Adres
                                    </label>
                                    <textarea
                                        value={company.address}
                                        onChange={(e) => setCompany({ ...company, address: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors resize-none"
                                        rows={3}
                                        placeholder="Firma adresi"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        Vergi No / TCKN
                                    </label>
                                    <input
                                        type="text"
                                        value={company.taxId}
                                        onChange={(e) => setCompany({ ...company, taxId: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                        placeholder="1234567890"
                                    />
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* =============================== */}
                    {/* SYSTEM SETTINGS TAB */}
                    {/* =============================== */}
                    {activeTab === 'system' && (
                        <Card>
                            <SectionHeader
                                icon={Globe}
                                title="Sistem Ayarları"
                                description="Genel sistem tercihlerini yapılandırın"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        <DollarSign className="w-4 h-4 inline mr-2 -mt-0.5" />
                                        Para Birimi
                                    </label>
                                    <select
                                        value={system.currency}
                                        onChange={(e) => setSystem({ ...system, currency: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                    >
                                        <option value="TRY">₺ Türk Lirası (TRY)</option>
                                        <option value="USD">$ Amerikan Doları (USD)</option>
                                        <option value="EUR">€ Euro (EUR)</option>
                                        <option value="GBP">£ İngiliz Sterlini (GBP)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        <Clock className="w-4 h-4 inline mr-2 -mt-0.5" />
                                        Saat Dilimi
                                    </label>
                                    <select
                                        value={system.timezone}
                                        onChange={(e) => setSystem({ ...system, timezone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                    >
                                        <option value="Europe/Istanbul">İstanbul (UTC+3)</option>
                                        <option value="Europe/London">Londra (UTC+0)</option>
                                        <option value="America/New_York">New York (UTC-5)</option>
                                        <option value="Asia/Dubai">Dubai (UTC+4)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        <Calendar className="w-4 h-4 inline mr-2 -mt-0.5" />
                                        Tarih Formatı
                                    </label>
                                    <select
                                        value={system.dateFormat}
                                        onChange={(e) => setSystem({ ...system, dateFormat: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                    >
                                        <option value="DD.MM.YYYY">DD.MM.YYYY (13.02.2026)</option>
                                        <option value="DD/MM/YYYY">DD/MM/YYYY (13/02/2026)</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD (2026-02-13)</option>
                                        <option value="MM/DD/YYYY">MM/DD/YYYY (02/13/2026)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        <Palette className="w-4 h-4 inline mr-2 -mt-0.5" />
                                        Dil
                                    </label>
                                    <select
                                        value={system.language}
                                        onChange={(e) => setSystem({ ...system, language: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                    >
                                        <option value="tr">🇹🇷 Türkçe</option>
                                        <option value="en">🇬🇧 English</option>
                                    </select>
                                </div>
                            </div>

                            <div className="border-t border-[var(--color-border-glass)] pt-4 space-y-1">
                                <Toggle
                                    enabled={system.autoBackup}
                                    onChange={(val) => setSystem({ ...system, autoBackup: val })}
                                    label="Otomatik Yedekleme"
                                    description="Verileriniz otomatik olarak yedeklensin"
                                />
                                <Toggle
                                    enabled={system.darkMode}
                                    onChange={(val) => setSystem({ ...system, darkMode: val })}
                                    label="Koyu Tema"
                                    description="Karanlık mod arayüzü kullanılsın"
                                />
                            </div>
                        </Card>
                    )}

                    {/* =============================== */}
                    {/* NOTIFICATIONS TAB */}
                    {/* =============================== */}
                    {activeTab === 'notifications' && (
                        <Card>
                            <SectionHeader
                                icon={Bell}
                                title="Bildirim Ayarları"
                                description="Hangi bildirimlerden haberdar olmak istediğinizi seçin"
                            />

                            <div className="space-y-1 divide-y divide-[var(--color-border-glass)]">
                                <Toggle
                                    enabled={notifications.emailNotifications}
                                    onChange={(val) => setNotifications({ ...notifications, emailNotifications: val })}
                                    label="E-posta Bildirimleri"
                                    description="Genel e-posta bildirimlerini etkinleştirin"
                                />
                                <Toggle
                                    enabled={notifications.advanceAlerts}
                                    onChange={(val) => setNotifications({ ...notifications, advanceAlerts: val })}
                                    label="Avans Uyarıları"
                                    description="Personel avans talep ettiğinde bildirim alın"
                                />
                                <Toggle
                                    enabled={notifications.paymentReminders}
                                    onChange={(val) => setNotifications({ ...notifications, paymentReminders: val })}
                                    label="Ödeme Hatırlatıcıları"
                                    description="Yaklaşan veya geciken ödemeler için hatırlatma"
                                />
                                <Toggle
                                    enabled={notifications.monthlyReports}
                                    onChange={(val) => setNotifications({ ...notifications, monthlyReports: val })}
                                    label="Aylık Raporlar"
                                    description="Her ay özet raporu e-posta ile gönderilsin"
                                />
                                <Toggle
                                    enabled={notifications.lowBalanceAlert}
                                    onChange={(val) => setNotifications({ ...notifications, lowBalanceAlert: val })}
                                    label="Düşük Bakiye Uyarısı"
                                    description="Kasa bakiyesi düşükken uyarı alın"
                                />
                                <Toggle
                                    enabled={notifications.personnelChanges}
                                    onChange={(val) => setNotifications({ ...notifications, personnelChanges: val })}
                                    label="Personel Değişiklikleri"
                                    description="Personel ekleme/çıkarma işlemlerinde bildirim"
                                />
                            </div>
                        </Card>
                    )}

                    {/* =============================== */}
                    {/* SECURITY TAB */}
                    {/* =============================== */}
                    {activeTab === 'security' && (
                        <Card>
                            <SectionHeader
                                icon={Shield}
                                title="Güvenlik"
                                description="Şifrenizi değiştirin ve hesabınızı koruyun"
                            />

                            <div className="max-w-md space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        <Lock className="w-4 h-4 inline mr-2 -mt-0.5" />
                                        Mevcut Şifre
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={security.currentPassword}
                                            onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                                            className="w-full px-4 py-3 pr-12 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                            placeholder="Mevcut şifreniz"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-white"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        Yeni Şifre
                                    </label>
                                    <input
                                        type="password"
                                        value={security.newPassword}
                                        onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                        placeholder="En az 6 karakter"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        Yeni Şifre (Tekrar)
                                    </label>
                                    <input
                                        type="password"
                                        value={security.confirmPassword}
                                        onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                        placeholder="Yeni şifreyi tekrar girin"
                                    />
                                    {security.newPassword && security.confirmPassword && security.newPassword !== security.confirmPassword && (
                                        <p className="text-xs text-[var(--color-accent-red)] mt-1">Şifreler eşleşmiyor</p>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-[var(--color-border-glass)]">
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving || !security.currentPassword || !security.newPassword || security.newPassword !== security.confirmPassword}
                                    >
                                        {saving ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Shield className="w-4 h-4 mr-2" />
                                        )}
                                        Şifreyi Değiştir
                                    </Button>
                                </div>
                            </div>

                            {/* Session Info */}
                            <div className="mt-8 p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)]">
                                <h3 className="text-white font-medium mb-3">Oturum Bilgisi</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-[var(--color-text-muted)]">Son Giriş</span>
                                        <p className="text-white mt-1">{new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <div>
                                        <span className="text-[var(--color-text-muted)]">IP Adresi</span>
                                        <p className="text-white mt-1">••••••••</p>
                                    </div>
                                    <div>
                                        <span className="text-[var(--color-text-muted)]">Tarayıcı</span>
                                        <p className="text-white mt-1">{navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Tarayıcı'}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </MainLayout>
    );
}
