import { useState, useMemo, useCallback } from 'react';
import {
    Layers,
    Plus,
    Save,
    Calculator,
    Calendar,
    ChevronRight,
    Trash2,
} from 'lucide-react';
import { MainLayout } from '../components/layout';
import { Card, Button, Modal, Input } from '../components/ui';
import type { Method, DataEntry, Payment } from '../types';

// Mock methods
const mockMethods: Method[] = [
    { id: '1', name: 'Yolcu360', entryCommission: 2.5, exitCommission: 1.5, deliveryCommission: 3.0, openingBalance: 50000, status: 'active' },
    { id: '2', name: 'Enuygun', entryCommission: 2.0, exitCommission: 1.0, deliveryCommission: 2.5, openingBalance: 35000, status: 'active' },
    { id: '3', name: 'BiTaksi', entryCommission: 3.0, exitCommission: 2.0, deliveryCommission: 2.0, openingBalance: 20000, status: 'active' },
];

// Mock payments (synced from Payments page)
const mockPayments: Payment[] = [
    { id: '1', date: new Date('2026-01-28'), description: 'Araç Sigorta Ödemesi', amount: 8500, methodId: '1' },
    { id: '3', date: new Date('2026-01-25'), description: 'Benzin Gideri', amount: 3200, methodId: '2' },
    { id: '4', date: new Date('2026-01-24'), description: 'Araç Bakım', amount: 4800, methodId: '1' },
];

// Mock data entries
const mockDataEntries: { [methodId: string]: DataEntry[] } = {
    '1': [
        { id: '1', methodId: '1', date: new Date('2026-01-28'), supplement: 0, entry: 15000, exit: 5000, commission: 0, payment: 8500, delivery: 2000, description: 'Günlük işlemler', balance: 0 },
        { id: '2', methodId: '1', date: new Date('2026-01-27'), supplement: 5000, entry: 12000, exit: 3000, commission: 0, payment: 4800, delivery: 1500, description: '', balance: 0 },
        { id: '3', methodId: '1', date: new Date('2026-01-26'), supplement: 0, entry: 8000, exit: 4000, commission: 0, payment: 0, delivery: 3000, description: 'Hafta sonu', balance: 0 },
    ],
    '2': [
        { id: '4', methodId: '2', date: new Date('2026-01-28'), supplement: 0, entry: 10000, exit: 3000, commission: 0, payment: 3200, delivery: 1000, description: '', balance: 0 },
        { id: '5', methodId: '2', date: new Date('2026-01-27'), supplement: 2000, entry: 8000, exit: 2000, commission: 0, payment: 0, delivery: 500, description: '', balance: 0 },
    ],
    '3': [],
};

export default function DataEntryPage() {
    const [methods] = useState<Method[]>(mockMethods.filter((m) => m.status === 'active'));
    const [selectedMethodId, setSelectedMethodId] = useState<string>(methods[0]?.id || '');
    const [dataEntries, setDataEntries] = useState<{ [methodId: string]: DataEntry[] }>(mockDataEntries);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newEntryDate, setNewEntryDate] = useState(new Date().toISOString().split('T')[0]);

    const selectedMethod = methods.find((m) => m.id === selectedMethodId);

    // Calculate commission based on method rates
    const calculateCommission = useCallback(
        (entry: number, exit: number, delivery: number, method: Method) => {
            return (
                (entry * method.entryCommission) / 100 +
                (exit * method.exitCommission) / 100 +
                (delivery * method.deliveryCommission) / 100
            );
        },
        []
    );

    // Get entries for selected method with calculated values
    const currentEntries = useMemo(() => {
        const entries = dataEntries[selectedMethodId] || [];
        const method = methods.find((m) => m.id === selectedMethodId);
        if (!method) return [];

        // Sort by date descending
        const sortedEntries = [...entries].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Calculate commission and running balance
        let runningBalance = method.openingBalance;
        const calculated = sortedEntries.reverse().map((entry) => {
            const commission = calculateCommission(entry.entry, entry.exit, entry.delivery, method);
            // Balance = Previous Balance + Supplement + Entry - Commission - Payment - Delivery
            runningBalance = runningBalance + entry.supplement + entry.entry - commission - entry.payment - entry.delivery;
            return {
                ...entry,
                commission,
                balance: runningBalance,
            };
        });

        return calculated.reverse();
    }, [dataEntries, selectedMethodId, methods, calculateCommission]);

    // Inline edit handler
    const handleCellEdit = (entryId: string, field: keyof DataEntry, value: string | number) => {
        setDataEntries((prev) => ({
            ...prev,
            [selectedMethodId]: prev[selectedMethodId].map((entry) =>
                entry.id === entryId
                    ? { ...entry, [field]: typeof value === 'string' && field !== 'description' ? parseFloat(value) || 0 : value }
                    : entry
            ),
        }));
    };

    // Add new row
    const handleAddRow = () => {
        if (!selectedMethod) return;

        const newEntry: DataEntry = {
            id: Date.now().toString(),
            methodId: selectedMethodId,
            date: new Date(newEntryDate),
            supplement: 0,
            entry: 0,
            exit: 0,
            commission: 0,
            payment: 0,
            delivery: 0,
            description: '',
            balance: 0,
        };

        setDataEntries((prev) => ({
            ...prev,
            [selectedMethodId]: [newEntry, ...(prev[selectedMethodId] || [])],
        }));

        setIsAddModalOpen(false);
    };

    // Delete row
    const handleDeleteRow = (entryId: string) => {
        setDataEntries((prev) => ({
            ...prev,
            [selectedMethodId]: prev[selectedMethodId].filter((e) => e.id !== entryId),
        }));
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

    return (
        <MainLayout breadcrumb={['Veri Girişi']}>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Veri Girişi</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                        Yöntem bazlı gelir-gider takibi yapın
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary">
                        <Save className="w-4 h-4 mr-2" />
                        Kaydet
                    </Button>
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Satır
                    </Button>
                </div>
            </div>

            <div className="flex gap-6">
                {/* Methods Sidebar */}
                <div className="w-64 flex-shrink-0">
                    <Card className="p-4">
                        <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
                            Yöntemler
                        </h3>
                        <div className="space-y-2">
                            {methods.map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setSelectedMethodId(method.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedMethodId === method.id
                                        ? 'bg-[var(--color-accent-orange)] text-white'
                                        : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)] hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Layers className="w-4 h-4" />
                                        <span className="font-medium">{method.name}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            ))}
                        </div>

                        {/* Method Info */}
                        {selectedMethod && (
                            <div className="mt-6 p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)]">
                                <h4 className="text-white font-medium mb-3">Komisyon Oranları</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-[var(--color-text-muted)]">Giriş:</span>
                                        <span className="text-[var(--color-accent-green)]">%{selectedMethod.entryCommission}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--color-text-muted)]">Çıkış:</span>
                                        <span className="text-[var(--color-accent-orange)]">%{selectedMethod.exitCommission}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--color-text-muted)]">Teslim:</span>
                                        <span className="text-blue-400">%{selectedMethod.deliveryCommission}</span>
                                    </div>
                                    <div className="pt-2 mt-2 border-t border-[var(--color-border-glass)] flex justify-between">
                                        <span className="text-[var(--color-text-muted)]">Devir:</span>
                                        <span className="text-white font-medium">₺{selectedMethod.openingBalance.toLocaleString('tr-TR')}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Data Grid */}
                <div className="flex-1">
                    <Card className="overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-glass)]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-orange)]/20 flex items-center justify-center">
                                    <Calculator className="w-5 h-5 text-[var(--color-accent-orange)]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{selectedMethod?.name || 'Yöntem Seçin'}</h3>
                                    <p className="text-sm text-[var(--color-text-muted)]">
                                        {currentEntries.length} kayıt
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead>
                                    <tr className="bg-[var(--color-bg-secondary)]">
                                        <th className="text-left py-3 px-3 text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider w-28">Tarih</th>
                                        <th className="text-right py-3 px-3 text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider">Takviye</th>
                                        <th className="text-right py-3 px-3 text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider">Giriş</th>
                                        <th className="text-right py-3 px-3 text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider">Çıkış</th>
                                        <th className="text-right py-3 px-3 text-[var(--color-accent-orange)] text-xs font-medium uppercase tracking-wider bg-[var(--color-accent-orange)]/5">Komisyon</th>
                                        <th className="text-right py-3 px-3 text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider">Ödeme</th>
                                        <th className="text-right py-3 px-3 text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider">Teslim</th>
                                        <th className="text-left py-3 px-3 text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider w-32">Açıklama</th>
                                        <th className="text-right py-3 px-3 text-[var(--color-accent-green)] text-xs font-medium uppercase tracking-wider bg-[var(--color-accent-green)]/5">Kasa</th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentEntries.map((entry) => (
                                        <tr key={entry.id} className="border-b border-[var(--color-border-glass)] hover:bg-[var(--color-bg-secondary)]/50 transition-colors group">
                                            <td className="py-2 px-3">
                                                <div className="flex items-center gap-2 text-white text-sm">
                                                    <Calendar className="w-3 h-3 text-[var(--color-text-muted)]" />
                                                    {new Date(entry.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                                                </div>
                                            </td>
                                            <td className="py-2 px-3">
                                                <input
                                                    type="number"
                                                    value={entry.supplement || ''}
                                                    onChange={(e) => handleCellEdit(entry.id, 'supplement', e.target.value)}
                                                    className="w-full text-right bg-transparent text-white text-sm px-2 py-1 rounded border border-transparent hover:border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="py-2 px-3">
                                                <input
                                                    type="number"
                                                    value={entry.entry || ''}
                                                    onChange={(e) => handleCellEdit(entry.id, 'entry', e.target.value)}
                                                    className="w-full text-right bg-transparent text-[var(--color-accent-green)] font-medium text-sm px-2 py-1 rounded border border-transparent hover:border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="py-2 px-3">
                                                <input
                                                    type="number"
                                                    value={entry.exit || ''}
                                                    onChange={(e) => handleCellEdit(entry.id, 'exit', e.target.value)}
                                                    className="w-full text-right bg-transparent text-white text-sm px-2 py-1 rounded border border-transparent hover:border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
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
                                                    value={entry.payment || ''}
                                                    onChange={(e) => handleCellEdit(entry.id, 'payment', e.target.value)}
                                                    className="w-full text-right bg-transparent text-[var(--color-accent-red)] text-sm px-2 py-1 rounded border border-transparent hover:border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="py-2 px-3">
                                                <input
                                                    type="number"
                                                    value={entry.delivery || ''}
                                                    onChange={(e) => handleCellEdit(entry.id, 'delivery', e.target.value)}
                                                    className="w-full text-right bg-transparent text-blue-400 text-sm px-2 py-1 rounded border border-transparent hover:border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="py-2 px-3">
                                                <input
                                                    type="text"
                                                    value={entry.description || ''}
                                                    onChange={(e) => handleCellEdit(entry.id, 'description', e.target.value)}
                                                    className="w-full text-left bg-transparent text-[var(--color-text-secondary)] text-sm px-2 py-1 rounded border border-transparent hover:border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors"
                                                    placeholder="-"
                                                />
                                            </td>
                                            <td className="py-2 px-3 bg-[var(--color-accent-green)]/5">
                                                <div className={`text-right font-semibold text-sm ${entry.balance >= 0 ? 'text-[var(--color-accent-green)]' : 'text-[var(--color-accent-red)]'}`}>
                                                    ₺{entry.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="py-2 px-1">
                                                <button
                                                    onClick={() => handleDeleteRow(entry.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-[var(--color-accent-red)]/10 text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)] transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {currentEntries.length === 0 && (
                                        <tr>
                                            <td colSpan={10} className="py-12 text-center">
                                                <Calculator className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-4" />
                                                <p className="text-[var(--color-text-secondary)]">Henüz veri girişi yapılmamış</p>
                                                <Button onClick={() => setIsAddModalOpen(true)} className="mt-4">
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    İlk Satırı Ekle
                                                </Button>
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
                                                <span className={currentEntries[0]?.balance >= 0 ? 'text-[var(--color-accent-green)]' : 'text-[var(--color-accent-red)]'}>
                                                    ₺{(currentEntries[0]?.balance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </Card>

                    {/* Formula Info */}
                    <div className="mt-4 p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-glass)]">
                        <div className="flex items-start gap-3">
                            <Calculator className="w-5 h-5 text-[var(--color-accent-orange)] mt-0.5" />
                            <div>
                                <p className="text-white font-medium">Otomatik Hesaplama Formülleri</p>
                                <div className="mt-2 space-y-1 text-sm text-[var(--color-text-secondary)]">
                                    <p><span className="text-[var(--color-accent-orange)]">Komisyon</span> = (Giriş × %{selectedMethod?.entryCommission || 0}) + (Çıkış × %{selectedMethod?.exitCommission || 0}) + (Teslim × %{selectedMethod?.deliveryCommission || 0})</p>
                                    <p><span className="text-[var(--color-accent-green)]">Kasa</span> = Önceki Bakiye + Takviye + Giriş - Komisyon - Ödeme - Teslim</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Row Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Yeni Satır Ekle" size="sm">
                <div className="space-y-4">
                    <Input
                        label="Tarih"
                        type="date"
                        value={newEntryDate}
                        onChange={(e) => setNewEntryDate(e.target.value)}
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-glass)]">
                        <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                            İptal
                        </Button>
                        <Button onClick={handleAddRow}>
                            <Plus className="w-4 h-4 mr-2" />
                            Ekle
                        </Button>
                    </div>
                </div>
            </Modal>
        </MainLayout>
    );
}
