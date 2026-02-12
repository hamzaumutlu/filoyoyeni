import { useState, useMemo, useCallback, useEffect } from 'react';
import {
    Layers,
    Calculator,
    Calendar,
    ChevronRight,
    ChevronLeft,
    Loader2,
    Lock,
    Unlock,
    Info,
} from 'lucide-react';
import { MainLayout } from '../components/layout';
import { Card, Button } from '../components/ui';
import { useMethodsSupabase, useDataEntriesSupabase, type MethodData, type DataEntryData } from '../hooks/useSupabase';

// Get days in a month
const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
};

// Format date as YYYY-MM-DD
const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// Month names in Turkish
const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export default function DataEntryPage() {
    // Current month state
    const now = new Date();
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
    const [showCommissionInfo, setShowCommissionInfo] = useState(false);

    // Use Supabase hooks
    const { methods: rawMethods, loading: methodsLoading } = useMethodsSupabase();

    // Filter active methods
    const methods = useMemo(() =>
        rawMethods.filter((m: MethodData) => m.status === 'active'), [rawMethods]);

    const [selectedMethodId, setSelectedMethodId] = useState<string>('');
    const [isInitializing, setIsInitializing] = useState(false);

    // Set default method when loaded
    useMemo(() => {
        if (methods.length > 0 && !selectedMethodId) {
            setSelectedMethodId(methods[0].id);
        }
    }, [methods, selectedMethodId]);

    // Get data entries for selected method
    const {
        dataEntries: rawDataEntries,
        loading: entriesLoading,
        addDataEntry,
        updateDataEntry,
    } = useDataEntriesSupabase(selectedMethodId);

    const selectedMethod = methods.find((m: MethodData) => m.id === selectedMethodId);

    // Calculate commission based on method rates
    const calculateCommission = useCallback(
        (entry: number, exit: number, delivery: number, method: MethodData) => {
            return (
                (entry * method.entryCommission) / 100 +
                (exit * method.exitCommission) / 100 +
                (delivery * method.deliveryCommission) / 100
            );
        },
        []
    );

    // Get days for selected month
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const monthDays = useMemo(() => {
        const days = [];
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                date: formatDate(selectedYear, selectedMonth, i),
            });
        }
        return days;
    }, [selectedYear, selectedMonth, daysInMonth]);

    // Initialize entries for the month if they don't exist
    const initializeMonthEntries = useCallback(async () => {
        if (!selectedMethod || isInitializing || entriesLoading) return;

        const existingDates = new Set(rawDataEntries.map(e => e.date));
        const missingDays = monthDays.filter(d => !existingDates.has(d.date));

        if (missingDays.length > 0) {
            setIsInitializing(true);
            try {
                for (const day of missingDays) {
                    await addDataEntry({
                        methodId: selectedMethodId,
                        date: day.date,
                        supplement: 0,
                        entry: 0,
                        exit: 0,
                        commission: 0,
                        payment: 0,
                        delivery: 0,
                        description: '',
                        balance: 0,
                        locked: false,
                    });
                }
            } catch (err) {
                console.error('Error initializing month entries:', err);
            } finally {
                setIsInitializing(false);
            }
        }
    }, [selectedMethod, selectedMethodId, rawDataEntries, monthDays, isInitializing, entriesLoading, addDataEntry]);

    // Auto-initialize entries when method or month changes
    useEffect(() => {
        if (selectedMethod && !entriesLoading && rawDataEntries !== undefined) {
            initializeMonthEntries();
        }
    }, [selectedMethod, selectedMonth, selectedYear, entriesLoading]);

    // Filter and calculate entries for current month
    const currentEntries = useMemo(() => {
        const entries = rawDataEntries || [];
        const method = methods.find((m: MethodData) => m.id === selectedMethodId);
        if (!method) return [];

        const monthStart = formatDate(selectedYear, selectedMonth, 1);
        const monthEnd = formatDate(selectedYear, selectedMonth, daysInMonth);
        const monthEntries = entries.filter(e => e.date >= monthStart && e.date <= monthEnd);

        const sortedByDateAsc = [...monthEntries].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        let runningBalance = method.openingBalance;
        const calculated = sortedByDateAsc.map((entry) => {
            const commission = calculateCommission(entry.entry, entry.exit, entry.delivery, method);
            runningBalance = runningBalance + entry.supplement + entry.entry - commission - entry.payment - entry.delivery;
            return {
                ...entry,
                commission,
                balance: runningBalance,
            };
        });

        return calculated;
    }, [rawDataEntries, selectedMethodId, methods, calculateCommission, selectedYear, selectedMonth, daysInMonth]);

    // Handle cell edit
    const handleCellEdit = async (entryId: string, field: keyof DataEntryData, value: string | number) => {
        const entry = currentEntries.find(e => e.id === entryId);
        if (entry?.locked) return;

        const numericValue = typeof value === 'string' && field !== 'description' ? parseFloat(value) || 0 : value;

        try {
            await updateDataEntry(entryId, { [field]: numericValue });
        } catch (err) {
            console.error('Update error:', err);
        }
    };

    // Toggle lock status
    const handleToggleLock = async (entryId: string, currentLocked: boolean) => {
        try {
            await updateDataEntry(entryId, { locked: !currentLocked });
        } catch (err) {
            console.error('Lock toggle error:', err);
        }
    };

    // Navigate months
    const goToPreviousMonth = () => {
        if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    // Calculate totals
    const totals = useMemo(() => {
        return currentEntries.reduce(
            (acc, entry) => ({
                supplement: acc.supplement + entry.supplement,
                entry: acc.entry + entry.entry,
                exit: acc.exit + entry.exit,
                commission: acc.commission + entry.commission,
                payment: acc.payment + entry.payment,
                delivery: acc.delivery + entry.delivery,
            }),
            { supplement: 0, entry: 0, exit: 0, commission: 0, payment: 0, delivery: 0 }
        );
    }, [currentEntries]);

    const isLoading = methodsLoading || entriesLoading || isInitializing;

    return (
        <MainLayout breadcrumb={['Veri Girişi']}>
            {/* Page Header with Month Navigation */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Veri Girişi</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                        Yöntem bazlı gelir-gider takibi
                    </p>
                </div>
                {/* Month Navigation */}
                <div className="flex items-center gap-2 bg-[var(--color-bg-card)] rounded-xl p-2 border border-[var(--color-border-glass)]">
                    <Button variant="ghost" onClick={goToPreviousMonth} className="!p-2">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <span className="text-white font-medium min-w-[140px] text-center">
                        {monthNames[selectedMonth]} {selectedYear}
                    </span>
                    <Button variant="ghost" onClick={goToNextMonth} className="!p-2">
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Horizontal Methods Tabs */}
            <div className="mb-4">
                <div className="flex items-center gap-2 p-2 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-glass)] overflow-x-auto">
                    {methodsLoading ? (
                        <div className="flex items-center gap-2 px-4 py-2">
                            <Loader2 className="w-4 h-4 text-[var(--color-accent-orange)] animate-spin" />
                            <span className="text-[var(--color-text-muted)] text-sm">Yöntemler yükleniyor...</span>
                        </div>
                    ) : (
                        <>
                            {methods.map((method: MethodData) => (
                                <button
                                    key={method.id}
                                    onClick={() => setSelectedMethodId(method.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap ${selectedMethodId === method.id
                                        ? 'bg-[var(--color-accent-orange)] text-white shadow-lg shadow-[var(--color-accent-orange)]/30'
                                        : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)] hover:text-white'
                                        }`}
                                >
                                    <Layers className="w-4 h-4" />
                                    <span className="font-medium">{method.name}</span>
                                </button>
                            ))}
                            {methods.length === 0 && (
                                <p className="text-[var(--color-text-muted)] text-sm px-4 py-2">
                                    Aktif yöntem bulunamadı
                                </p>
                            )}
                            {/* Commission Info Toggle */}
                            {selectedMethod && (
                                <button
                                    onClick={() => setShowCommissionInfo(!showCommissionInfo)}
                                    className={`ml-auto flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${showCommissionInfo
                                        ? 'bg-[var(--color-accent-orange)]/20 text-[var(--color-accent-orange)]'
                                        : 'text-[var(--color-text-muted)] hover:text-white'
                                        }`}
                                    title="Komisyon Oranları"
                                >
                                    <Info className="w-4 h-4" />
                                    <span className="text-sm hidden sm:inline">Oranlar</span>
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Commission Info Panel (Collapsible) */}
                {showCommissionInfo && selectedMethod && (
                    <div className="mt-2 p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-glass)] animate-fadeIn">
                        <div className="flex flex-wrap gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-[var(--color-text-muted)]">Giriş Komisyonu:</span>
                                <span className="text-[var(--color-accent-green)] font-medium">%{selectedMethod.entryCommission}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[var(--color-text-muted)]">Çıkış Komisyonu:</span>
                                <span className="text-[var(--color-accent-orange)] font-medium">%{selectedMethod.exitCommission}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[var(--color-text-muted)]">Teslim Komisyonu:</span>
                                <span className="text-blue-400 font-medium">%{selectedMethod.deliveryCommission}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[var(--color-text-muted)]">Devir Bakiye:</span>
                                <span className="text-white font-medium">₺{selectedMethod.openingBalance.toLocaleString('tr-TR')}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Data Grid - Full Width */}
            <Card className="overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-glass)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-orange)]/20 flex items-center justify-center">
                            <Calculator className="w-5 h-5 text-[var(--color-accent-orange)]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">{selectedMethod?.name || 'Yöntem Seçin'}</h3>
                            <p className="text-sm text-[var(--color-text-muted)]">
                                {monthNames[selectedMonth]} {selectedYear} • {daysInMonth} gün
                            </p>
                        </div>
                    </div>
                    {isInitializing && (
                        <div className="flex items-center gap-2 text-[var(--color-accent-orange)]">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Günler oluşturuluyor...</span>
                        </div>
                    )}
                </div>

                {isLoading && !isInitializing ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-[var(--color-accent-orange)] animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[var(--color-bg-secondary)]">
                                    <th className="text-left py-3 px-3 text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider w-24">Tarih</th>
                                    <th className="text-right py-3 px-3 text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider w-24">Takviye</th>
                                    <th className="text-right py-3 px-3 text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider w-24">Giriş</th>
                                    <th className="text-right py-3 px-3 text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider w-24">Çıkış</th>
                                    <th className="text-right py-3 px-3 text-[var(--color-accent-orange)] text-xs font-medium uppercase tracking-wider bg-[var(--color-accent-orange)]/5 w-28">Komisyon</th>
                                    <th className="text-right py-3 px-3 text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider w-24">Ödeme</th>
                                    <th className="text-right py-3 px-3 text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider w-24">Teslim</th>
                                    <th className="text-left py-3 px-3 text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider">Açıklama</th>
                                    <th className="text-right py-3 px-3 text-[var(--color-accent-green)] text-xs font-medium uppercase tracking-wider bg-[var(--color-accent-green)]/5 w-32">Kasa</th>
                                    <th className="text-center py-3 px-3 text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider w-14">🔒</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentEntries.map((entry) => (
                                    <tr key={entry.id} className={`border-b border-[var(--color-border-glass)] transition-colors ${entry.locked ? 'bg-[var(--color-bg-secondary)]/30' : 'hover:bg-[var(--color-bg-secondary)]/50'}`}>
                                        <td className="py-2 px-3">
                                            <div className="flex items-center gap-2 text-white text-sm">
                                                <Calendar className="w-3 h-3 text-[var(--color-text-muted)]" />
                                                {new Date(entry.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                                            </div>
                                        </td>
                                        <td className="py-2 px-3">
                                            <input
                                                type="number"
                                                defaultValue={entry.supplement || ''}
                                                onBlur={(e) => handleCellEdit(entry.id, 'supplement', e.target.value)}
                                                disabled={entry.locked}
                                                className={`w-full text-right bg-transparent text-white text-sm px-2 py-1 rounded border border-transparent hover:border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors ${entry.locked ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="py-2 px-3">
                                            <input
                                                type="number"
                                                defaultValue={entry.entry || ''}
                                                onBlur={(e) => handleCellEdit(entry.id, 'entry', e.target.value)}
                                                disabled={entry.locked}
                                                className={`w-full text-right bg-transparent text-[var(--color-accent-green)] font-medium text-sm px-2 py-1 rounded border border-transparent hover:border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors ${entry.locked ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="py-2 px-3">
                                            <input
                                                type="number"
                                                defaultValue={entry.exit || ''}
                                                onBlur={(e) => handleCellEdit(entry.id, 'exit', e.target.value)}
                                                disabled={entry.locked}
                                                className={`w-full text-right bg-transparent text-white text-sm px-2 py-1 rounded border border-transparent hover:border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors ${entry.locked ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="py-2 px-3 bg-[var(--color-accent-orange)]/5">
                                            <div className="text-right text-[var(--color-accent-orange)] font-medium text-sm">
                                                {entry.commission.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        </td>
                                        <td className="py-2 px-3">
                                            <input
                                                type="number"
                                                defaultValue={entry.payment || ''}
                                                onBlur={(e) => handleCellEdit(entry.id, 'payment', e.target.value)}
                                                disabled={entry.locked}
                                                className={`w-full text-right bg-transparent text-[var(--color-accent-red)] text-sm px-2 py-1 rounded border border-transparent hover:border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors ${entry.locked ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="py-2 px-3">
                                            <input
                                                type="number"
                                                defaultValue={entry.delivery || ''}
                                                onBlur={(e) => handleCellEdit(entry.id, 'delivery', e.target.value)}
                                                disabled={entry.locked}
                                                className={`w-full text-right bg-transparent text-blue-400 text-sm px-2 py-1 rounded border border-transparent hover:border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors ${entry.locked ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="py-2 px-3">
                                            <input
                                                type="text"
                                                defaultValue={entry.description || ''}
                                                onBlur={(e) => handleCellEdit(entry.id, 'description', e.target.value)}
                                                disabled={entry.locked}
                                                className={`w-full text-left bg-transparent text-[var(--color-text-secondary)] text-sm px-2 py-1 rounded border border-transparent hover:border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors ${entry.locked ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                placeholder="-"
                                            />
                                        </td>
                                        <td className="py-2 px-3 bg-[var(--color-accent-green)]/5">
                                            <div className={`text-right font-semibold text-sm ${entry.balance >= 0 ? 'text-[var(--color-accent-green)]' : 'text-[var(--color-accent-red)]'}`}>
                                                ₺{entry.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        </td>
                                        <td className="py-2 px-3 text-center">
                                            <button
                                                onClick={() => handleToggleLock(entry.id, entry.locked)}
                                                className={`p-1.5 rounded-lg transition-all ${entry.locked
                                                    ? 'bg-[var(--color-accent-green)]/20 text-[var(--color-accent-green)]'
                                                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-white'
                                                    }`}
                                                title={entry.locked ? 'Kilidi Aç' : 'Kilitle'}
                                            >
                                                {entry.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {currentEntries.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan={10} className="py-12 text-center">
                                            <Calculator className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-4" />
                                            <p className="text-[var(--color-text-secondary)]">
                                                {selectedMethod ? 'Ayın günleri yükleniyor...' : 'Lütfen bir yöntem seçin'}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                            {/* Totals Footer */}
                            {currentEntries.length > 0 && (
                                <tfoot>
                                    <tr className="bg-[var(--color-bg-secondary)] border-t-2 border-[var(--color-accent-orange)]/30">
                                        <td className="py-3 px-3 text-white font-semibold text-sm">TOPLAM</td>
                                        <td className="py-3 px-3 text-right text-white font-medium text-sm">
                                            {totals.supplement.toLocaleString('tr-TR')}
                                        </td>
                                        <td className="py-3 px-3 text-right text-[var(--color-accent-green)] font-semibold text-sm">
                                            {totals.entry.toLocaleString('tr-TR')}
                                        </td>
                                        <td className="py-3 px-3 text-right text-white font-medium text-sm">
                                            {totals.exit.toLocaleString('tr-TR')}
                                        </td>
                                        <td className="py-3 px-3 text-right text-[var(--color-accent-orange)] font-semibold text-sm bg-[var(--color-accent-orange)]/5">
                                            {totals.commission.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-3 px-3 text-right text-[var(--color-accent-red)] font-medium text-sm">
                                            {totals.payment.toLocaleString('tr-TR')}
                                        </td>
                                        <td className="py-3 px-3 text-right text-blue-400 font-medium text-sm">
                                            {totals.delivery.toLocaleString('tr-TR')}
                                        </td>
                                        <td></td>
                                        <td className="py-3 px-3 text-right font-bold text-sm bg-[var(--color-accent-green)]/5">
                                            <span className={currentEntries[currentEntries.length - 1]?.balance >= 0 ? 'text-[var(--color-accent-green)]' : 'text-[var(--color-accent-red)]'}>
                                                ₺{(currentEntries[currentEntries.length - 1]?.balance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                )}
            </Card>

            {/* Formula Info - More Compact */}
            <div className="mt-4 p-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-glass)]">
                <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                    <Calculator className="w-4 h-4 text-[var(--color-accent-orange)]" />
                    <span><span className="text-[var(--color-accent-orange)]">Komisyon</span> = (Giriş × %{selectedMethod?.entryCommission || 0}) + (Çıkış × %{selectedMethod?.exitCommission || 0}) + (Teslim × %{selectedMethod?.deliveryCommission || 0})</span>
                    <span className="mx-2">|</span>
                    <span><span className="text-[var(--color-accent-green)]">Kasa</span> = Önceki + Takviye + Giriş - Komisyon - Ödeme - Teslim</span>
                </div>
            </div>
        </MainLayout>
    );
}
