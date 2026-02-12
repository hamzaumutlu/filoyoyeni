import { useMemo, useState } from 'react';
import {
    ArrowUpRight,
    Wallet,
    Vault,
    TrendingUp,
    MoreHorizontal,
    Filter,
    Search,
    Layers,
    Loader2,
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
import { Card } from '../components/ui';
import { useMethodsSupabase, useDataEntriesSupabase, type MethodData } from '../hooks/useSupabase';

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

// Mock data for recent activities
const recentActivities = [
    { id: 1, activity: 'Araç Kiralama', orderId: 'ORD_001234', date: '17 Nis, 2026', time: '14:45', price: '₺2,500', status: 'Tamamlandı' },
    { id: 2, activity: 'Yolcu360 Komisyon', orderId: 'COM_005678', date: '17 Nis, 2026', time: '12:30', price: '₺450', status: 'Beklemede' },
    { id: 3, activity: 'Personel Avans', orderId: 'ADV_009012', date: '16 Nis, 2026', time: '09:15', price: '₺1,200', status: 'Tamamlandı' },
    { id: 4, activity: 'Araç Bakım', orderId: 'MNT_003456', date: '15 Nis, 2026', time: '16:00', price: '₺3,800', status: 'Tamamlandı' },
];

export default function Dashboard() {
    // Fetch methods from Supabase
    const { methods: rawMethods, loading: methodsLoading } = useMethodsSupabase();
    const activeMethods = useMemo(() => rawMethods.filter((m: MethodData) => m.status === 'active'), [rawMethods]);

    // Calculate total balance across all methods
    const totalMethodBalance = useMemo(() => {
        return activeMethods.reduce((sum, m: MethodData) => sum + m.openingBalance, 0);
    }, [activeMethods]);

    // Search and filter state for activities
    const [activitySearch, setActivitySearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'Tamamlandı' | 'Beklemede'>('all');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    // Filtered activities
    const filteredActivities = useMemo(() => {
        return recentActivities.filter(activity => {
            // Search filter
            const searchLower = activitySearch.toLowerCase();
            const matchesSearch = activitySearch === '' ||
                activity.activity.toLowerCase().includes(searchLower) ||
                activity.orderId.toLowerCase().includes(searchLower) ||
                activity.date.toLowerCase().includes(searchLower) ||
                activity.price.toLowerCase().includes(searchLower);

            // Status filter
            const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [activitySearch, statusFilter]);

    return (
        <MainLayout breadcrumb={['Dashboard']}>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Genel Bakış</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1">Tüm verilerinizin özeti aşağıda</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-glass)] text-[var(--color-text-secondary)] text-sm hover:border-[var(--color-accent-orange)] transition-colors flex items-center gap-2">
                        Bu Ay
                        <span className="text-xs">▼</span>
                    </button>
                    <button className="px-4 py-2 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-glass)] text-[var(--color-text-secondary)] text-sm hover:border-[var(--color-accent-orange)] transition-colors">
                        ↻ Sıfırla
                    </button>
                </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* My Balance Card */}
                <Card variant="gradient-orange" className="relative overflow-hidden">
                    <div className="absolute top-4 right-4">
                        <button className="text-white/70 hover:text-white">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm">Bakiyem</p>
                            <p className="text-white/60 text-xs">Cüzdan Özeti</p>
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-3xl font-bold text-white">₺128,520.30</p>
                            <p className="text-white/80 text-sm mt-1 flex items-center gap-1">
                                <span className="flex items-center gap-0.5 text-white bg-white/20 px-1.5 py-0.5 rounded text-xs">
                                    +1.5% <ArrowUpRight className="w-3 h-3" />
                                </span>
                            </p>
                        </div>
                    </div>
                    <button className="mt-4 text-white/90 text-sm flex items-center gap-2 hover:text-white">
                        Detayları Gör <ArrowUpRight className="w-4 h-4" />
                    </button>
                </Card>

                {/* Savings Account Card */}
                <Card variant="default" hover className="relative">
                    <div className="absolute top-4 right-4">
                        <button className="text-[var(--color-text-muted)] hover:text-white">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-secondary)] flex items-center justify-center">
                            <Vault className="w-5 h-5 text-[var(--color-accent-orange)]" />
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">Birikim Hesabı</p>
                            <p className="text-[var(--color-text-muted)] text-xs">Düzenli Büyüme</p>
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold text-white">₺24,800.45</p>
                        <span className="flex items-center gap-0.5 text-[var(--color-accent-green)] text-sm">
                            +1.2% <ArrowUpRight className="w-3 h-3" />
                        </span>
                    </div>
                    <button className="mt-4 text-[var(--color-text-secondary)] text-sm flex items-center gap-2 hover:text-[var(--color-accent-orange)]">
                        Özet Görüntüle <ArrowUpRight className="w-4 h-4" />
                    </button>
                </Card>

                {/* Investment Portfolio Card */}
                <Card variant="default" hover className="relative">
                    <div className="absolute top-4 right-4">
                        <button className="text-[var(--color-text-muted)] hover:text-white">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-secondary)] flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-[var(--color-accent-orange)]" />
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">Yatırım Portföyü</p>
                            <p className="text-[var(--color-text-muted)] text-xs">Varlık Takibi</p>
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold text-white">₺70,120.78</p>
                        <span className="flex items-center gap-0.5 text-[var(--color-accent-green)] text-sm">
                            +4.7% <ArrowUpRight className="w-3 h-3" />
                        </span>
                    </div>
                    <button className="mt-4 text-[var(--color-text-secondary)] text-sm flex items-center gap-2 hover:text-[var(--color-accent-orange)]">
                        Performansı Analiz Et <ArrowUpRight className="w-4 h-4" />
                    </button>
                </Card>
            </div>

            {/* Method Balances Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Method Kasaları */}
                <Card variant="default">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Yöntem Kasaları</h3>
                            <p className="text-[var(--color-text-muted)] text-sm">Tüm yöntemlerin güncel bakiyeleri</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[var(--color-text-muted)] text-xs">Toplam Kasa</p>
                            <p className="text-xl font-bold text-[var(--color-accent-green)]">
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
                        <div className="grid grid-cols-2 gap-3">
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
                            <h3 className="text-lg font-semibold text-white">Nakit Akışı</h3>
                            <p className="text-3xl font-bold text-white mt-1">₺540,323.45</p>
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
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Son Aktiviteler</h3>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                            <input
                                type="text"
                                placeholder="Ara..."
                                value={activitySearch}
                                onChange={(e) => setActivitySearch(e.target.value)}
                                className="w-48 pl-10 pr-4 py-2 rounded-xl bg-[var(--color-bg-secondary)] text-white text-sm border border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)] transition-colors placeholder:text-[var(--color-text-muted)]"
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
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--color-border-glass)]">
                                <th className="text-left py-3 px-4 text-[var(--color-text-muted)] text-sm font-medium">
                                    <input type="checkbox" className="rounded" />
                                </th>
                                <th className="text-left py-3 px-4 text-[var(--color-text-muted)] text-sm font-medium">Aktivite</th>
                                <th className="text-left py-3 px-4 text-[var(--color-text-muted)] text-sm font-medium">Sipariş ID</th>
                                <th className="text-left py-3 px-4 text-[var(--color-text-muted)] text-sm font-medium">Tarih</th>
                                <th className="text-left py-3 px-4 text-[var(--color-text-muted)] text-sm font-medium">Saat</th>
                                <th className="text-left py-3 px-4 text-[var(--color-text-muted)] text-sm font-medium">Tutar</th>
                                <th className="text-left py-3 px-4 text-[var(--color-text-muted)] text-sm font-medium">Durum</th>
                                <th className="text-left py-3 px-4 text-[var(--color-text-muted)] text-sm font-medium"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredActivities.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-8 text-center text-[var(--color-text-muted)]">
                                        {activitySearch || statusFilter !== 'all'
                                            ? 'Arama kriterlerine uygun aktivite bulunamadı'
                                            : 'Henüz aktivite yok'
                                        }
                                    </td>
                                </tr>
                            ) : filteredActivities.map((activity) => (
                                <tr key={activity.id} className="border-b border-[var(--color-border-glass)] hover:bg-[var(--color-bg-secondary)] transition-colors">
                                    <td className="py-4 px-4">
                                        <input type="checkbox" className="rounded" />
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg gradient-orange flex items-center justify-center">
                                                <Wallet className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-white font-medium">{activity.activity}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-[var(--color-text-secondary)]">{activity.orderId}</td>
                                    <td className="py-4 px-4 text-[var(--color-text-secondary)]">{activity.date}</td>
                                    <td className="py-4 px-4 text-[var(--color-text-secondary)]">{activity.time}</td>
                                    <td className="py-4 px-4 text-white font-medium">{activity.price}</td>
                                    <td className="py-4 px-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${activity.status === 'Tamamlandı'
                                            ? 'text-[var(--color-accent-green)] bg-[var(--color-accent-green)]/10'
                                            : 'text-[var(--color-accent-orange)] bg-[var(--color-accent-orange)]/10'
                                            }`}>
                                            • {activity.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <button className="text-[var(--color-text-muted)] hover:text-white">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
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
                    <p className={`text-xl font-bold ${getBalanceColor(currentBalance)}`}>
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
