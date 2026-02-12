import { useState, useCallback } from 'react';
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
    Plus,
    Pencil,
    Trash2,
    X,
} from 'lucide-react';
import { MainLayout } from '../components/layout';
import { Card, Button } from '../components/ui';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useCompaniesSupabase, type CompanyData } from '../hooks/useSupabase';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../i18n';
import { useToast } from '../components/ui/Toast';

// ============================================
// Types
// ============================================

interface SecuritySettings {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface CompanyFormData {
    name: string;
    authorizedEmail: string;
    phone: string;
    address: string;
    taxId: string;
    website: string;
}

const EMPTY_COMPANY_FORM: CompanyFormData = {
    name: '',
    authorizedEmail: '',
    phone: '',
    address: '',
    taxId: '',
    website: '',
};

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
// Company Card Component
// ============================================
function CompanyCard({ company, onEdit, onDelete, t }: {
    company: CompanyData;
    onEdit: () => void;
    onDelete: () => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}) {
    return (
        <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] hover:border-[var(--color-accent-orange)]/40 transition-all group">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-orange)]/15 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-[var(--color-accent-orange)]" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">{company.name}</h3>
                        {company.authorizedEmail && (
                            <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3" /> {company.authorizedEmail}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onEdit}
                        className="p-2 rounded-lg hover:bg-[var(--color-bg-card)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-accent-orange)]"
                        title={t('common.edit')}
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 rounded-lg hover:bg-[var(--color-accent-red)]/10 transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)]"
                        title={t('common.delete')}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {company.phone && (
                    <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                        <Phone className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                        <span>{company.phone}</span>
                    </div>
                )}
                {company.website && (
                    <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                        <Globe className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                        <span>{company.website}</span>
                    </div>
                )}
                {company.taxId && (
                    <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                        <DollarSign className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                        <span>{t('company.taxIdLabel')}: {company.taxId}</span>
                    </div>
                )}
                {company.address && (
                    <div className="flex items-center gap-2 text-[var(--color-text-secondary)] sm:col-span-2">
                        <MapPin className="w-3.5 h-3.5 text-[var(--color-text-muted)] flex-shrink-0" />
                        <span className="line-clamp-1">{company.address}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// Main Settings Page
// ============================================
export default function SettingsPage() {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const { user: authUser } = useAuth();

    const [activeTab, setActiveTab] = useState<'company' | 'system' | 'notifications' | 'security'>('company');
    const [showPassword, setShowPassword] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    // Company CRUD via Supabase hook
    const {
        companies,
        loading: companiesLoading,
        addCompany,
        updateCompany,
        deleteCompany,
    } = useCompaniesSupabase();

    // Company form state
    const [showCompanyForm, setShowCompanyForm] = useState(false);
    const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
    const [companyForm, setCompanyForm] = useState<CompanyFormData>(EMPTY_COMPANY_FORM);
    const [companySubmitting, setCompanySubmitting] = useState(false);

    // System & Notification settings via ThemeContext (auto-persisted)
    const { systemSettings: system, updateSystemSettings, notificationSettings: notifications, updateNotificationSettings } = useTheme();

    // Security form state (not persisted — password fields)
    const [security, setSecurity] = useState<SecuritySettings>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Real password change via Supabase Auth
    const handlePasswordChange = useCallback(async () => {
        if (security.newPassword !== security.confirmPassword) {
            showToast('error', t('security.passwordsMismatchAlert'));
            return;
        }
        if (security.newPassword.length < 6) {
            showToast('error', t('security.passwordMinLength'));
            return;
        }

        setChangingPassword(true);
        try {
            if (isSupabaseConfigured() && supabase && authUser?.email) {
                // Re-authenticate with current password
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: authUser.email,
                    password: security.currentPassword,
                });

                if (signInError) {
                    showToast('error', t('security.currentPasswordWrong'));
                    setChangingPassword(false);
                    return;
                }

                // Update password
                const { error: updateError } = await supabase.auth.updateUser({
                    password: security.newPassword,
                });

                if (updateError) throw updateError;

                showToast('success', t('security.passwordChanged'));
                setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                // Demo mode
                showToast('info', 'Demo modunda şifre değiştirme simüle edildi');
                setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (err) {
            console.error('Password change error:', err);
            showToast('error', err instanceof Error ? err.message : t('common.unknownError'));
        } finally {
            setChangingPassword(false);
        }
    }, [security, t, showToast, authUser]);

    // Company form handlers
    const openAddCompany = () => {
        setEditingCompanyId(null);
        setCompanyForm(EMPTY_COMPANY_FORM);
        setShowCompanyForm(true);
    };

    const openEditCompany = (c: CompanyData) => {
        setEditingCompanyId(c.id);
        setCompanyForm({
            name: c.name || '',
            authorizedEmail: c.authorizedEmail || '',
            phone: c.phone || '',
            address: c.address || '',
            taxId: c.taxId || '',
            website: c.website || '',
        });
        setShowCompanyForm(true);
    };

    const cancelCompanyForm = () => {
        setShowCompanyForm(false);
        setEditingCompanyId(null);
        setCompanyForm(EMPTY_COMPANY_FORM);
    };

    const handleCompanySubmit = async () => {
        if (!companyForm.name.trim()) {
            alert(t('company.nameRequired'));
            return;
        }

        setCompanySubmitting(true);
        try {
            if (editingCompanyId) {
                await updateCompany(editingCompanyId, {
                    name: companyForm.name,
                    authorizedEmail: companyForm.authorizedEmail,
                    phone: companyForm.phone,
                    address: companyForm.address,
                    taxId: companyForm.taxId,
                    website: companyForm.website,
                });
            } else {
                await addCompany({
                    name: companyForm.name,
                    authorizedEmail: companyForm.authorizedEmail,
                    phone: companyForm.phone,
                    address: companyForm.address,
                    taxId: companyForm.taxId,
                    website: companyForm.website,
                    status: 'active',
                });
            }
            cancelCompanyForm();
        } catch (err) {
            console.error('Company save error:', err);
            alert(t('company.saveFailed') + ': ' + (err instanceof Error ? err.message : t('common.unknownError')));
        } finally {
            setCompanySubmitting(false);
        }
    };

    const handleDeleteCompany = async (id: string) => {
        if (!confirm(t('company.deleteConfirm'))) return;
        try {
            await deleteCompany(id);
        } catch (err) {
            console.error('Delete error:', err);
            alert(t('company.deleteFailed'));
        }
    };

    const tabs = [
        { id: 'company' as const, label: t('settings.tab.company'), icon: Building2 },
        { id: 'system' as const, label: t('settings.tab.system'), icon: Globe },
        { id: 'notifications' as const, label: t('settings.tab.notifications'), icon: Bell },
        { id: 'security' as const, label: t('settings.tab.security'), icon: Shield },
    ];

    const isLoading = activeTab === 'company' ? companiesLoading : false;

    return (
        <MainLayout breadcrumb={[t('nav.settings')]}>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">{t('settings.title')}</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                        {t('settings.subtitle')}
                    </p>
                </div>
                {activeTab === 'company' ? (
                    <Button onClick={openAddCompany}>
                        <Plus className="w-4 h-4 mr-2" />
                        {t('company.add')}
                    </Button>
                ) : (activeTab === 'system' || activeTab === 'notifications') ? (
                    <div className="flex items-center gap-2 text-sm text-[var(--color-accent-green)]">
                        <Check className="w-4 h-4" />
                        <span>{t('settings.autoSaving')}</span>
                    </div>
                ) : null}
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

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[var(--color-accent-orange)] animate-spin" />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* =============================== */}
                    {/* COMPANY INFO TAB */}
                    {/* =============================== */}
                    {activeTab === 'company' && (
                        <>
                            {/* Add / Edit Form */}
                            {showCompanyForm && (
                                <Card>
                                    <div className="flex items-center justify-between mb-4">
                                        <SectionHeader
                                            icon={Building2}
                                            title={editingCompanyId ? t('company.edit') : t('company.addNew')}
                                            description={editingCompanyId ? t('company.editDescription') : t('company.addDescription')}
                                        />
                                        <button
                                            onClick={cancelCompanyForm}
                                            className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors text-[var(--color-text-muted)] hover:text-white"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                                <UserCircle className="w-4 h-4 inline mr-2 -mt-0.5" />
                                                {t('company.name')} <span className="text-[var(--color-accent-red)]">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={companyForm.name}
                                                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                                placeholder={t('company.namePlaceholder')}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                                <Mail className="w-4 h-4 inline mr-2 -mt-0.5" />
                                                {t('company.email')}
                                            </label>
                                            <input
                                                type="email"
                                                value={companyForm.authorizedEmail}
                                                onChange={(e) => setCompanyForm({ ...companyForm, authorizedEmail: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                                placeholder={t('company.emailPlaceholder')}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                                <Phone className="w-4 h-4 inline mr-2 -mt-0.5" />
                                                {t('company.phone')}
                                            </label>
                                            <input
                                                type="tel"
                                                value={companyForm.phone}
                                                onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                                placeholder={t('company.phonePlaceholder')}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                                <Globe className="w-4 h-4 inline mr-2 -mt-0.5" />
                                                {t('company.website')}
                                            </label>
                                            <input
                                                type="url"
                                                value={companyForm.website}
                                                onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                                placeholder={t('company.websitePlaceholder')}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                                <MapPin className="w-4 h-4 inline mr-2 -mt-0.5" />
                                                {t('company.address')}
                                            </label>
                                            <textarea
                                                value={companyForm.address}
                                                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors resize-none"
                                                rows={3}
                                                placeholder={t('company.addressPlaceholder')}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                                {t('company.taxId')}
                                            </label>
                                            <input
                                                type="text"
                                                value={companyForm.taxId}
                                                onChange={(e) => setCompanyForm({ ...companyForm, taxId: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                                placeholder={t('company.taxIdPlaceholder')}
                                            />
                                        </div>
                                    </div>

                                    {/* Save / Cancel */}
                                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--color-border-glass)]">
                                        <Button variant="ghost" onClick={cancelCompanyForm}>
                                            {t('settings.cancel')}
                                        </Button>
                                        <Button onClick={handleCompanySubmit} disabled={companySubmitting}>
                                            {companySubmitting ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4 mr-2" />
                                            )}
                                            {editingCompanyId ? t('settings.update') : t('settings.save')}
                                        </Button>
                                    </div>
                                </Card>
                            )}

                            {/* Saved Companies List */}
                            <Card>
                                <SectionHeader
                                    icon={Building2}
                                    title={t('company.savedCompanies')}
                                    description={t('company.totalRecords', { count: companies.length })}
                                />

                                {companies.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Building2 className="w-16 h-16 mx-auto text-[var(--color-text-muted)] mb-4 opacity-40" />
                                        <p className="text-[var(--color-text-secondary)] mb-2">{t('company.noRecords')}</p>
                                        <p className="text-sm text-[var(--color-text-muted)]">
                                            {t('company.noRecordsHint')}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {companies.map((c) => (
                                            <CompanyCard
                                                key={c.id}
                                                company={c}
                                                onEdit={() => openEditCompany(c)}
                                                onDelete={() => handleDeleteCompany(c.id)}
                                                t={t}
                                            />
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </>
                    )}

                    {/* =============================== */}
                    {/* SYSTEM SETTINGS TAB */}
                    {/* =============================== */}
                    {activeTab === 'system' && (
                        <Card>
                            <SectionHeader
                                icon={Globe}
                                title={t('system.title')}
                                description={t('system.description')}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        <DollarSign className="w-4 h-4 inline mr-2 -mt-0.5" />
                                        {t('system.currency')}
                                    </label>
                                    <select
                                        value={system.currency}
                                        onChange={(e) => updateSystemSettings({ currency: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                    >
                                        <option value="TRY">{t('system.currency.try')}</option>
                                        <option value="USD">{t('system.currency.usd')}</option>
                                        <option value="EUR">{t('system.currency.eur')}</option>
                                        <option value="GBP">{t('system.currency.gbp')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        <Clock className="w-4 h-4 inline mr-2 -mt-0.5" />
                                        {t('system.timezone')}
                                    </label>
                                    <select
                                        value={system.timezone}
                                        onChange={(e) => updateSystemSettings({ timezone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                    >
                                        <option value="Europe/Istanbul">{t('system.timezone.istanbul')}</option>
                                        <option value="Europe/London">{t('system.timezone.london')}</option>
                                        <option value="America/New_York">{t('system.timezone.newyork')}</option>
                                        <option value="Asia/Dubai">{t('system.timezone.dubai')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        <Calendar className="w-4 h-4 inline mr-2 -mt-0.5" />
                                        {t('system.dateFormat')}
                                    </label>
                                    <select
                                        value={system.dateFormat}
                                        onChange={(e) => updateSystemSettings({ dateFormat: e.target.value })}
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
                                        {t('system.language')}
                                    </label>
                                    <select
                                        value={system.language}
                                        onChange={(e) => updateSystemSettings({ language: e.target.value })}
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
                                    onChange={(val) => updateSystemSettings({ autoBackup: val })}
                                    label={t('system.autoBackup')}
                                    description={t('system.autoBackupDesc')}
                                />
                                <Toggle
                                    enabled={system.darkMode}
                                    onChange={(val) => updateSystemSettings({ darkMode: val })}
                                    label={t('system.darkMode')}
                                    description={t('system.darkModeDesc')}
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
                                title={t('notifications.title')}
                                description={t('notifications.description')}
                            />

                            {/* Notification Email Address */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                    <Mail className="w-4 h-4 inline mr-2 -mt-0.5" />
                                    {t('notifications.emailAddress')}
                                </label>
                                <input
                                    type="email"
                                    value={notifications.notificationEmail}
                                    onChange={(e) => updateNotificationSettings({ notificationEmail: e.target.value })}
                                    className="w-full max-w-md px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                    placeholder={t('notifications.emailAddressPlaceholder')}
                                />
                                <p className="text-xs text-[var(--color-text-muted)] mt-1.5">{t('notifications.emailAddressDesc')}</p>
                            </div>

                            <div className="space-y-1 divide-y divide-[var(--color-border-glass)]">
                                <Toggle
                                    enabled={notifications.emailNotifications}
                                    onChange={(val) => updateNotificationSettings({ emailNotifications: val })}
                                    label={t('notifications.email')}
                                    description={t('notifications.emailDesc')}
                                />
                                <Toggle
                                    enabled={notifications.advanceAlerts}
                                    onChange={(val) => updateNotificationSettings({ advanceAlerts: val })}
                                    label={t('notifications.advance')}
                                    description={t('notifications.advanceDesc')}
                                />
                                <Toggle
                                    enabled={notifications.paymentReminders}
                                    onChange={(val) => updateNotificationSettings({ paymentReminders: val })}
                                    label={t('notifications.payment')}
                                    description={t('notifications.paymentDesc')}
                                />
                                <Toggle
                                    enabled={notifications.monthlyReports}
                                    onChange={(val) => updateNotificationSettings({ monthlyReports: val })}
                                    label={t('notifications.monthly')}
                                    description={t('notifications.monthlyDesc')}
                                />
                                <Toggle
                                    enabled={notifications.lowBalanceAlert}
                                    onChange={(val) => updateNotificationSettings({ lowBalanceAlert: val })}
                                    label={t('notifications.lowBalance')}
                                    description={t('notifications.lowBalanceDesc')}
                                />
                                <Toggle
                                    enabled={notifications.personnelChanges}
                                    onChange={(val) => updateNotificationSettings({ personnelChanges: val })}
                                    label={t('notifications.personnel')}
                                    description={t('notifications.personnelDesc')}
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
                                title={t('security.title')}
                                description={t('security.description')}
                            />

                            <div className="max-w-md space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        <Lock className="w-4 h-4 inline mr-2 -mt-0.5" />
                                        {t('security.currentPassword')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={security.currentPassword}
                                            onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                                            className="w-full px-4 py-3 pr-12 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                            placeholder={t('security.currentPasswordPlaceholder')}
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
                                        {t('security.newPassword')}
                                    </label>
                                    <input
                                        type="password"
                                        value={security.newPassword}
                                        onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                        placeholder={t('security.newPasswordPlaceholder')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        {t('security.confirmPassword')}
                                    </label>
                                    <input
                                        type="password"
                                        value={security.confirmPassword}
                                        onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                        placeholder={t('security.confirmPasswordPlaceholder')}
                                    />
                                    {security.newPassword && security.confirmPassword && security.newPassword !== security.confirmPassword && (
                                        <p className="text-xs text-[var(--color-accent-red)] mt-1">{t('security.passwordMismatch')}</p>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-[var(--color-border-glass)]">
                                    <Button
                                        onClick={handlePasswordChange}
                                        disabled={changingPassword || !security.currentPassword || !security.newPassword || security.newPassword !== security.confirmPassword}
                                    >
                                        {changingPassword ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Shield className="w-4 h-4 mr-2" />
                                        )}
                                        {t('security.changePassword')}
                                    </Button>
                                </div>
                            </div>

                            {/* Session Info */}
                            <div className="mt-8 p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)]">
                                <h3 className="text-white font-medium mb-3">{t('security.sessionInfo')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-[var(--color-text-muted)]">{t('security.lastLogin')}</span>
                                        <p className="text-white mt-1">{new Date().toLocaleDateString(system.language === 'en' ? 'en-US' : 'tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <div>
                                        <span className="text-[var(--color-text-muted)]">{t('security.ipAddress')}</span>
                                        <p className="text-white mt-1">••••••••</p>
                                    </div>
                                    <div>
                                        <span className="text-[var(--color-text-muted)]">{t('security.browser')}</span>
                                        <p className="text-white mt-1">{navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Browser'}</p>
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
