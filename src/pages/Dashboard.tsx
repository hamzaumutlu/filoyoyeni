import { useMemo, useState, useRef, useEffect } from 'react';
import {
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Vault,
    TrendingUp,
    TrendingDown,
    MoreHorizontal,
    Filter,
    Search,
    Layers,
    Loader2,
    Plus,
    Pencil,
    Trash2,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { MainLayout } from '../components/layout';
import { Card, Button, Modal, Input, Select } from '../components/ui';
import {
    useMethodsSupabase,
    useDataEntriesSupabase,
    useActivitiesSupabase,
    usePaymentsSupabase,
    type MethodData,
    type ActivityData,
} from '../hooks/useSupabase';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';

// Mock data for charts
const cashFlowData = [
    { name: 'Oca', value: 15000 },
    { name: 'Şub', value: 22000 },
    { name: 'Mar', value: 18000 },
    { name: 'Nis', value: 45000 },
    { name: 'May', value: 32000 },
    { name: 'Haz', value: 28000 },
    { name: 'Tem', value: 35000 },
];

// Activity form data
interface ActivityFormData {
    activity: string;
    orderId: string;
    type: string;
    note: string;
    date: string;
    time: string;
    amount: string;
    status: string;
}

const emptyForm: ActivityFormData = {
    activity: '',
    orderId: '',
    type: 'Gelir',
    note: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    amount: '',
    status: 'Beklemede',
};

// Status options for dropdown
const statusOptions = [
    { value: 'Beklemede', label: 'Beklemede' },
    { value: 'Tamamlandı', label: 'Tamamlandı' },
    { value: 'İptal', label: 'İptal' },
];

// Type options for dropdown
const typeOptions = [
    { value: 'Gelir', label: '↑ Gelir' },
    { value: 'Gider', label: '↓ Gider' },
];

export default function Dashboard() {
    const { showToast } = useToast();

    // Fetch methods from Supabase
    const { methods: rawMethods, loading: methodsLoading } = useMethodsSupabase();
    const activeMethods = useMemo(() => rawMethods.filter((m: MethodData) => m.status === 'active'), [rawMethods]);

    // Calculate total balance across all methods
    const totalMethodBalance = useMemo(() => {
        return activeMethods.reduce((sum, m: MethodData) => sum + m.openingBalance, 0);
    }, [activeMethods]);

    // Fetch payments for KPI
    const { payments } = usePaymentsSupabase();
    const totalPayments = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);

    // Fetch activities
    const {
        activities,
        loading: activitiesLoading,
        addActivity,
        updateActivity,
        deleteActivity,
    } = useActivitiesSupabase();

    // Calculate income/expense totals from activities
    const totalIncome = useMemo(() => {
        return activities
            .filter((a: ActivityData) => a.type === 'Gelir' && a.status !== 'İptal')
            .reduce((sum, a: ActivityData) => sum + a.amount, 0);
    }, [activities]);

    const totalExpense = useMemo(() => {
        return activities
            .filter((a: ActivityData) => a.type === 'Gider' && a.status !== 'İptal')
            .reduce((sum, a: ActivityData) => sum + a.amount, 0);
    }, [activities]);

    // Net balance = methods + income - expense - payments
    const netBalance = useMemo(() => {
        return totalMethodBalance + totalIncome - totalExpense - totalPayments;
    }, [totalMethodBalance, totalIncome, totalExpense, totalPayments]);

    // Month picker state
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    });
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const monthPickerRef = useRef<HTMLDivElement>(null);

    // Generate last 12 months
    const monthOptions = useMemo(() => {
        const months: { year: number; month: number; label: string }[] = [];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const label = d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
            months.push({ year: d.getFullYear(), month: d.getMonth(), label: label.charAt(0).toUpperCase() + label.slice(1) });
        }
        return months;
    }, []);

    // Current month label
    const currentMonthLabel = useMemo(() => {
        const now = new Date();
        if (selectedMonth.year === now.getFullYear() && selectedMonth.month === now.getMonth()) {
            return 'Bu Ay';
        }
        const d = new Date(selectedMonth.year, selectedMonth.month, 1);
        const label = d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
        return label.charAt(0).toUpperCase() + label.slice(1);
    }, [selectedMonth]);

    // Close month picker on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (monthPickerRef.current && !monthPickerRef.current.contains(e.target as Node)) {
                setShowMonthPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Reset handler — deletes selected month's data entries & payments
    const { activeCompanyId } = useAuth();
    const [resetting, setResetting] = useState(false);

    const handleReset = async () => {
        try {
            setResetting(true);
            const companyId = activeCompanyId;

            // Count records in all tables for this company
            const tables = [
                { key: 'data_entries', label: 'Veri Girişi' },
                { key: 'payments', label: 'Ödeme' },
                { key: 'advances', label: 'Avans' },
                { key: 'personnel', label: 'Personel' },
                { key: 'methods', label: 'Yöntem' },
                { key: 'activities', label: 'Aktivite' },
            ];

            const counts: Record<string, number> = {};
            for (const t of tables) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { count } = await (supabase as any)
                    .from(t.key)
                    .select('*', { count: 'exact', head: true })
                    .eq('company_id', companyId);
                counts[t.key] = count || 0;
            }

            const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

            if (totalCount === 0) {
                alert('ℹ️ Bu firmaya ait silinecek kayıt bulunamadı.');
                setResetting(false);
                return;
            }

            // Build detailed confirmation message
            const details = tables
                .filter(t => counts[t.key] > 0)
                .map(t => `  • ${counts[t.key]} adet ${t.label}`)
                .join('\n');

            const confirmed = confirm(
                `⚠️ Bu firmaya ait TÜM veriler silinecektir:\n\n` +
                `${details}\n` +
                `📋 Toplam: ${totalCount} kayıt\n\n` +
                `Bu işlem geri alınamaz. Devam etmek istiyor musunuz?`
            );

            if (!confirmed) {
                setResetting(false);
                return;
            }

            // Delete in order: child tables first (FK constraints)
            for (const t of tables) {
                if (counts[t.key] > 0) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { error } = await (supabase as any)
                        .from(t.key)
                        .delete()
                        .eq('company_id', companyId);
                    if (error) throw new Error(`${t.label} silinirken hata: ${error.message}`);
                }
            }

            const deletedDetails = tables
                .filter(t => counts[t.key] > 0)
                .map(t => `🗑️ ${counts[t.key]} ${t.label} silindi`)
                .join('\n');

            alert(`✅ Firma verileri başarıyla sıfırlandı!\n\n${deletedDetails}`);
            window.location.reload();
        } catch (err) {
            console.error('[Dashboard] Reset error:', err);
            alert('Silme işlemi sırasında bir hata oluştu: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setResetting(false);
        }
    };

    // Search and filter state for activities
    const [activitySearch, setActivitySearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'Tamamlandı' | 'Beklemede' | 'İptal'>('all');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    // Filtered activities
    const filteredActivities = useMemo(() => {
        return activities.filter((act: ActivityData) => {
            const searchLower = activitySearch.toLowerCase();
            const matchesSearch = activitySearch === '' ||
                act.activity.toLowerCase().includes(searchLower) ||
                (act.orderId || '').toLowerCase().includes(searchLower) ||
                act.date.toLowerCase().includes(searchLower) ||
                String(act.amount).includes(searchLower);

            const matchesStatus = statusFilter === 'all' || act.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [activities, activitySearch, statusFilter]);

    // Activity modal state
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [editingActivity, setEditingActivity] = useState<ActivityData | null>(null);
    const [activityForm, setActivityForm] = useState<ActivityFormData>(emptyForm);
    const [submitting, setSubmitting] = useState(false);

    // Action dropdown state (per row)
    const [openActionId, setOpenActionId] = useState<string | null>(null);
    const actionRef = useRef<HTMLDivElement>(null);

    // Close action dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (actionRef.current && !actionRef.current.contains(e.target as Node)) {
                setOpenActionId(null);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const openAddModal = () => {
        setEditingActivity(null);
        setActivityForm(emptyForm);
        setShowActivityModal(true);
    };

    const openEditModal = (act: ActivityData) => {
        setEditingActivity(act);
        setActivityForm({
            activity: act.activity,
            orderId: act.orderId || '',
            type: act.type || 'Gelir',
            note: act.note || '',
            date: act.date,
            time: act.time?.slice(0, 5) || '12:00',
            amount: String(act.amount),
            status: act.status,
        });
        setShowActivityModal(true);
        setOpenActionId(null);
    };

    const handleDeleteActivity = async (id: string) => {
        setOpenActionId(null);
        const confirmed = confirm('Bu aktiviteyi silmek istediğinize emin misiniz?');
        if (!confirmed) return;

        try {
            await deleteActivity(id);
            showToast('success', 'Aktivite silindi');
        } catch (err) {
            showToast('error', 'Silme hatası', err instanceof Error ? err.message : 'Bilinmeyen hata');
        }
    };

    const handleActivitySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activityForm.activity || !activityForm.amount) {
            showToast('warning', 'Lütfen zorunlu alanları doldurun');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                activity: activityForm.activity,
                orderId: activityForm.orderId || undefined,
                type: activityForm.type as 'Gelir' | 'Gider',
                note: activityForm.note || undefined,
                date: activityForm.date,
                time: activityForm.time + ':00',
                amount: parseFloat(activityForm.amount),
                status: activityForm.status as 'Tamamlandı' | 'Beklemede' | 'İptal',
            };

            if (editingActivity) {
                await updateActivity(editingActivity.id, payload);
                showToast('success', 'Aktivite güncellendi');
            } else {
                await addActivity(payload);
                showToast('success', 'Aktivite eklendi');
            }

            setShowActivityModal(false);
            setEditingActivity(null);
            setActivityForm(emptyForm);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
            showToast('error', 'İşlem hatası', `${msg} (companyId: ${activeCompanyId})`);
            console.error('[Activity Error]', err, 'activeCompanyId:', activeCompanyId);
        } finally {
            setSubmitting(false);
        }
    };

    // Format helpers
    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    const formatCurrency = (amount: number) => {
        return `₺${amount.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    };

    return (
        <MainLayout breadcrumb={['Dashboard']}>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white">Genel Bakış</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1 text-sm">Tüm verilerinizin özeti aşağıda</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Month Picker */}
                    <div className="relative" ref={monthPickerRef}>
                        <button
                            onClick={() => setShowMonthPicker(!showMonthPicker)}
                            className={`px-3 sm:px-4 py-2 rounded-xl border text-sm transition-all flex items-center gap-2 ${showMonthPicker
                                ? 'bg-[var(--color-accent-orange)]/10 border-[var(--color-accent-orange)] text-[var(--color-accent-orange)]'
                                : 'bg-[var(--color-bg-card)] border-[var(--color-border-glass)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-orange)]'
                                }`}
                        >
                            {currentMonthLabel}
                            <span className={`text-xs transition-transform ${showMonthPicker ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                        {showMonthPicker && (
                            <div className="absolute left-0 top-full mt-2 w-56 bg-[var(--color-bg-card)] border border-[var(--color-border-glass)] rounded-xl shadow-2xl z-50 overflow-hidden">
                                <div className="p-2 border-b border-[var(--color-border-glass)]">
                                    <p className="text-xs text-[var(--color-text-muted)] px-2 py-1">Dönem Seçin</p>
                                </div>
                                <div className="max-h-64 overflow-y-auto p-1">
                                    {monthOptions.map((opt, i) => {
                                        const isActive = opt.year === selectedMonth.year && opt.month === selectedMonth.month;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setSelectedMonth({ year: opt.year, month: opt.month });
                                                    setShowMonthPicker(false);
                                                }}
                                                className={`w-full px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${isActive
                                                    ? 'bg-[var(--color-accent-orange)]/10 text-[var(--color-accent-orange)] font-medium'
                                                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-white'
                                                    }`}
                                            >
                                                {opt.label}
                                                {i === 0 && <span className="ml-2 text-xs text-[var(--color-text-muted)]">(Şu an)</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Reset Button */}
                    <button
                        onClick={handleReset}
                        disabled={resetting}
                        className={`px-3 sm:px-4 py-2 rounded-xl border text-sm transition-colors flex items-center gap-2 ${resetting
                            ? 'bg-red-500/10 border-red-500/50 text-red-400 cursor-wait'
                            : 'bg-[var(--color-bg-card)] border-[var(--color-border-glass)] text-[var(--color-text-secondary)] hover:border-red-500 hover:text-red-400'
                            }`}
                    >
                        {resetting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Siliniyor...</>
                        ) : (
                            '↻ Sıfırla'
                        )}
                    </button>
                </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Net Balance Card */}
                <Card variant="gradient-orange" className="relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm">Net Bakiye</p>
                            <p className="text-white/60 text-xs">Kasa + Gelir - Gider - Ödemeler</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl sm:text-3xl font-bold text-white break-all">
                            ₺{netBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-white/60 text-xs mt-1">Kasa: ₺{totalMethodBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                    </div>
                </Card>

                {/* Total Income Card */}
                <Card variant="default" hover className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">Toplam Gelir</p>
                            <p className="text-[var(--color-text-muted)] text-xs">{activities.filter(a => a.type === 'Gelir' && a.status !== 'İptal').length} işlem</p>
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold text-emerald-400">
                            +₺{totalIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </p>
                        <span className="flex items-center gap-0.5 text-emerald-400 text-sm">
                            <ArrowUpRight className="w-4 h-4" />
                        </span>
                    </div>
                </Card>

                {/* Total Expense Card */}
                <Card variant="default" hover className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">Toplam Gider</p>
                            <p className="text-[var(--color-text-muted)] text-xs">{activities.filter(a => a.type === 'Gider' && a.status !== 'İptal').length} işlem</p>
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold text-red-400">
                            -₺{totalExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </p>
                        <span className="flex items-center gap-0.5 text-red-400 text-sm">
                            <ArrowDownRight className="w-4 h-4" />
                        </span>
                    </div>
                </Card>
            </div>

            {/* Payments Card - full width */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card variant="default" hover className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-secondary)] flex items-center justify-center">
                            <Vault className="w-5 h-5 text-[var(--color-accent-orange)]" />
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">Toplam Ödemeler</p>
                            <p className="text-[var(--color-text-muted)] text-xs">Bakiyeyi azaltır</p>
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold text-[var(--color-accent-orange)]">
                            -₺{totalPayments.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </p>
                        <span className="flex items-center gap-0.5 text-[var(--color-text-secondary)] text-sm">
                            {payments.length} kayıt
                        </span>
                    </div>
                </Card>
                <Card variant="default" hover className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-secondary)] flex items-center justify-center">
                            <Layers className="w-5 h-5 text-[var(--color-accent-orange)]" />
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">Aktivite Özeti</p>
                            <p className="text-[var(--color-text-muted)] text-xs">Toplam {activities.length} işlem</p>
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold text-white">{activities.filter(a => a.status === 'Tamamlandı').length} / {activities.length}</p>
                        <span className="flex items-center gap-0.5 text-[var(--color-accent-green)] text-sm">
                            tamamlandı
                        </span>
                    </div>
                </Card>
            </div>

            {/* Method Balances Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Method Kasaları */}
                <Card variant="default">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <div>
                            <h3 className="text-base sm:text-lg font-semibold text-white">Yöntem Kasaları</h3>
                            <p className="text-[var(--color-text-muted)] text-sm">Tüm yöntemlerin güncel bakiyeleri</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-[var(--color-text-muted)] text-xs">Toplam Kasa</p>
                            <p className="text-lg sm:text-xl font-bold text-[var(--color-accent-green)] break-all">
                                ₺{totalMethodBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    {methodsLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-[var(--color-accent-orange)] animate-spin" />
                        </div>
                    ) : activeMethods.length === 0 ? (
                        <div className="text-center py-8">
                            <Layers className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-4" />
                            <p className="text-[var(--color-text-secondary)]">Henüz yöntem eklenmemiş</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {activeMethods.map((method: MethodData) => (
                                <MethodBalanceCard key={method.id} method={method} />
                            ))}
                        </div>
                    )}
                </Card>

                {/* Cash Flow Chart */}
                <Card variant="default">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base sm:text-lg font-semibold text-white">Nakit Akışı</h3>
                            <p className="text-xl sm:text-3xl font-bold text-white mt-1 break-all">
                                ₺{totalMethodBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] text-sm">
                                Aylık
                            </button>
                            <button className="px-3 py-1.5 rounded-lg gradient-orange text-white text-sm">
                                Yıllık
                            </button>
                        </div>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={cashFlowData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FF5722" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FF5722" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                                <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#2A2A2A',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                    }}
                                    formatter={(value) => [`₺${(value as number)?.toLocaleString() ?? 0}`, 'Nakit Akışı']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#FF5722"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Recent Activities Table */}
            <Card variant="default">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-white">Son Aktiviteler</h3>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                            <input
                                type="text"
                                placeholder="Ara..."
                                value={activitySearch}
                                onChange={(e) => setActivitySearch(e.target.value)}
                                className="w-full sm:w-48 pl-10 pr-4 py-2 rounded-xl bg-[var(--color-bg-secondary)] text-white text-sm border border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)] transition-colors placeholder:text-[var(--color-text-muted)]"
                            />
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                className={`px-3 py-2 rounded-xl bg-[var(--color-bg-secondary)] border text-sm transition-colors flex items-center gap-2 ${statusFilter !== 'all'
                                    ? 'border-[var(--color-accent-orange)] text-[var(--color-accent-orange)]'
                                    : 'border-[var(--color-border-glass)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-orange)]'
                                    }`}
                            >
                                <Filter className="w-4 h-4" />
                                {statusFilter === 'all' ? 'Filtre' : statusFilter}
                            </button>
                            {showFilterDropdown && (
                                <div className="absolute right-0 mt-2 w-40 bg-[var(--color-bg-card)] border border-[var(--color-border-glass)] rounded-xl shadow-xl z-10 overflow-hidden">
                                    <button
                                        onClick={() => { setStatusFilter('all'); setShowFilterDropdown(false); }}
                                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${statusFilter === 'all' ? 'bg-[var(--color-accent-orange)]/10 text-[var(--color-accent-orange)]' : 'text-white hover:bg-[var(--color-bg-secondary)]'
                                            }`}
                                    >
                                        Tümü
                                    </button>
                                    <button
                                        onClick={() => { setStatusFilter('Tamamlandı'); setShowFilterDropdown(false); }}
                                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${statusFilter === 'Tamamlandı' ? 'bg-[var(--color-accent-green)]/10 text-[var(--color-accent-green)]' : 'text-white hover:bg-[var(--color-bg-secondary)]'
                                            }`}
                                    >
                                        ✓ Tamamlandı
                                    </button>
                                    <button
                                        onClick={() => { setStatusFilter('Beklemede'); setShowFilterDropdown(false); }}
                                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${statusFilter === 'Beklemede' ? 'bg-[var(--color-accent-orange)]/10 text-[var(--color-accent-orange)]' : 'text-white hover:bg-[var(--color-bg-secondary)]'
                                            }`}
                                    >
                                        ● Beklemede
                                    </button>
                                    <button
                                        onClick={() => { setStatusFilter('İptal'); setShowFilterDropdown(false); }}
                                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${statusFilter === 'İptal' ? 'bg-red-500/10 text-red-400' : 'text-white hover:bg-[var(--color-bg-secondary)]'
                                            }`}
                                    >
                                        ✕ İptal
                                    </button>
                                </div>
                            )}
                        </div>
                        <Button variant="primary" size="sm" onClick={openAddModal}>
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Ekle</span>
                        </Button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--color-border-glass)]">
                                <th className="text-left py-3 px-4 text-[var(--color-text-muted)] text-sm font-medium">Aktivite</th>
                                <th className="text-left py-3 px-4 text-[var(--color-text-muted)] text-sm font-medium">Tür</th>
                                <th className="text-left py-3 px-4 text-[var(--color-text-muted)] text-sm font-medium">Tarih</th>
                                <th className="text-left py-3 px-4 text-[var(--color-text-muted)] text-sm font-medium">Tutar</th>
                                <th className="text-left py-3 px-4 text-[var(--color-text-muted)] text-sm font-medium">Not</th>
                                <th className="text-left py-3 px-4 text-[var(--color-text-muted)] text-sm font-medium">Durum</th>
                                <th className="text-left py-3 px-4 text-[var(--color-text-muted)] text-sm font-medium"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {activitiesLoading ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center">
                                        <Loader2 className="w-6 h-6 text-[var(--color-accent-orange)] animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredActivities.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-[var(--color-text-muted)]">
                                        {activitySearch || statusFilter !== 'all'
                                            ? 'Arama kriterlerine uygun aktivite bulunamadı'
                                            : 'Henüz aktivite yok. "Ekle" butonuyla yeni aktivite ekleyebilirsiniz.'
                                        }
                                    </td>
                                </tr>
                            ) : filteredActivities.map((act) => (
                                <tr key={act.id} className="border-b border-[var(--color-border-glass)] hover:bg-[var(--color-bg-secondary)] transition-colors">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg ${act.type === 'Gelir' ? 'bg-emerald-500/20' : 'bg-red-500/20'} flex items-center justify-center`}>
                                                {act.type === 'Gelir'
                                                    ? <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                                                    : <ArrowDownRight className="w-4 h-4 text-red-400" />
                                                }
                                            </div>
                                            <span className="text-white font-medium">{act.activity}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${act.type === 'Gelir'
                                            ? 'text-emerald-400 bg-emerald-500/10'
                                            : 'text-red-400 bg-red-500/10'
                                            }`}>
                                            {act.type === 'Gelir' ? '↑ Gelir' : '↓ Gider'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-[var(--color-text-secondary)]">{formatDate(act.date)}</td>
                                    <td className={`py-4 px-4 font-medium ${act.type === 'Gelir' ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {act.type === 'Gelir' ? '+' : '-'}{formatCurrency(act.amount)}
                                    </td>
                                    <td className="py-4 px-4 text-[var(--color-text-secondary)] max-w-[200px] truncate" title={act.note || ''}>
                                        {act.note || '—'}
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${act.status === 'Tamamlandı'
                                            ? 'text-[var(--color-accent-green)] bg-[var(--color-accent-green)]/10'
                                            : act.status === 'İptal'
                                                ? 'text-red-400 bg-red-500/10'
                                                : 'text-[var(--color-accent-orange)] bg-[var(--color-accent-orange)]/10'
                                            }`}>
                                            • {act.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="relative" ref={openActionId === act.id ? actionRef : undefined}>
                                            <button
                                                onClick={() => setOpenActionId(openActionId === act.id ? null : act.id)}
                                                className="text-[var(--color-text-muted)] hover:text-white p-1 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
                                            >
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                            {openActionId === act.id && (
                                                <div className="absolute right-0 mt-1 w-36 bg-[var(--color-bg-card)] border border-[var(--color-border-glass)] rounded-xl shadow-xl z-20 overflow-hidden">
                                                    <button
                                                        onClick={() => openEditModal(act)}
                                                        className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[var(--color-bg-secondary)] transition-colors flex items-center gap-2"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" /> Düzenle
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteActivity(act.id)}
                                                        className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" /> Sil
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Activity Add/Edit Modal */}
            <Modal
                isOpen={showActivityModal}
                onClose={() => { setShowActivityModal(false); setEditingActivity(null); }}
                title={editingActivity ? 'Aktivite Düzenle' : 'Yeni Aktivite Ekle'}
            >
                <form onSubmit={handleActivitySubmit} className="space-y-4">
                    <Input
                        label="Aktivite Adı *"
                        placeholder="Örn: Araç Kiralama"
                        value={activityForm.activity}
                        onChange={(e) => setActivityForm({ ...activityForm, activity: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Tür *"
                            options={typeOptions}
                            value={activityForm.type}
                            onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                        />
                        <Input
                            label="Sipariş ID"
                            placeholder="Örn: ORD_001234"
                            value={activityForm.orderId}
                            onChange={(e) => setActivityForm({ ...activityForm, orderId: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Tarih *"
                            type="date"
                            value={activityForm.date}
                            onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                        />
                        <Input
                            label="Saat *"
                            type="time"
                            value={activityForm.time}
                            onChange={(e) => setActivityForm({ ...activityForm, time: e.target.value })}
                        />
                    </div>
                    <Input
                        label="Tutar (₺) *"
                        type="number"
                        placeholder="0.00"
                        value={activityForm.amount}
                        onChange={(e) => setActivityForm({ ...activityForm, amount: e.target.value })}
                    />
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Not</label>
                        <textarea
                            placeholder="Aktivite hakkında not ekleyin..."
                            value={activityForm.note}
                            onChange={(e) => setActivityForm({ ...activityForm, note: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] text-white text-sm border border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)] transition-colors placeholder:text-[var(--color-text-muted)] resize-none"
                        />
                    </div>
                    <Select
                        label="Durum"
                        options={statusOptions}
                        value={activityForm.status}
                        onChange={(e) => setActivityForm({ ...activityForm, status: e.target.value })}
                    />
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => { setShowActivityModal(false); setEditingActivity(null); }}
                        >
                            İptal
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1" disabled={submitting}>
                            {submitting ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Kaydediliyor...</>
                            ) : editingActivity ? (
                                'Güncelle'
                            ) : (
                                'Ekle'
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>
        </MainLayout>
    );
}

// Method Balance Card Component
function MethodBalanceCard({ method }: { method: MethodData }) {
    // Fetch data entries for this method to calculate current balance
    const { dataEntries, loading } = useDataEntriesSupabase(method.id);

    // Calculate current balance from entries
    const currentBalance = useMemo(() => {
        if (!dataEntries || dataEntries.length === 0) {
            return method.openingBalance;
        }

        // Sort entries by date
        const sorted = [...dataEntries].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Calculate running balance
        let balance = method.openingBalance;
        for (const entry of sorted) {
            const commission = (
                (entry.entry * method.entryCommission) / 100 +
                (entry.exit * method.exitCommission) / 100 +
                (entry.delivery * method.deliveryCommission) / 100
            );
            balance = balance + entry.supplement + entry.entry - commission - entry.payment - entry.delivery;
        }

        return balance;
    }, [dataEntries, method]);

    // Get color based on balance
    const getBalanceColor = (balance: number) => {
        if (balance >= 0) return 'text-[var(--color-accent-green)]';
        return 'text-[var(--color-accent-red)]';
    };

    // Generate color for method icon background
    const colors = [
        'bg-[var(--color-accent-orange)]/20',
        'bg-blue-500/20',
        'bg-purple-500/20',
        'bg-emerald-500/20',
        'bg-pink-500/20',
        'bg-cyan-500/20',
    ];
    const iconColors = [
        'text-[var(--color-accent-orange)]',
        'text-blue-400',
        'text-purple-400',
        'text-emerald-400',
        'text-pink-400',
        'text-cyan-400',
    ];
    const colorIndex = method.name.charCodeAt(0) % colors.length;

    return (
        <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] hover:border-[var(--color-accent-orange)]/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${colors[colorIndex]} flex items-center justify-center`}>
                    <Layers className={`w-5 h-5 ${iconColors[colorIndex]}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{method.name}</p>
                    <p className="text-[var(--color-text-muted)] text-xs">
                        %{method.entryCommission} / %{method.exitCommission} / %{method.deliveryCommission}
                    </p>
                </div>
            </div>
            {loading ? (
                <div className="flex items-center justify-center py-2">
                    <Loader2 className="w-4 h-4 text-[var(--color-accent-orange)] animate-spin" />
                </div>
            ) : (
                <div>
                    <p className={`text-lg sm:text-xl font-bold ${getBalanceColor(currentBalance)} break-all`}>
                        ₺{currentBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-[var(--color-text-muted)] text-xs mt-1">
                        Devir: ₺{method.openingBalance.toLocaleString('tr-TR')}
                    </p>
                </div>
            )}
        </div>
    );
}
