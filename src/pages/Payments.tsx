import { useState, useMemo } from 'react';
import {
    CreditCard,
    Plus,
    Search,
    Pencil,
    Trash2,
    Calendar,
    TrendingDown,
    Layers,
    Loader2,
} from 'lucide-react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';
import { MainLayout } from '../components/layout';
import { Card, Button, Modal, Input, Select } from '../components/ui';
import { usePaymentsSupabase, useMethodsSupabase, type PaymentData, type MethodData } from '../hooks/useSupabase';

interface FormData {
    date: string;
    description: string;
    amount: string;
    methodId: string;
}

export default function Payments() {
    // Use Supabase hooks
    const { payments: rawPayments, loading: paymentsLoading, addPayment, updatePayment, deletePayment } = usePaymentsSupabase();
    const { methods: rawMethods, loading: methodsLoading } = useMethodsSupabase();

    // Transform to UI format with Date objects for sorting
    const payments = useMemo(() =>
        rawPayments.map((p: PaymentData) => ({
            ...p,
            date: new Date(p.date),
        })), [rawPayments]);

    const methods = useMemo(() =>
        rawMethods.filter((m: MethodData) => m.status === 'active'), [rawMethods]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        methodId: '',
    });

    const columns: ColumnDef<typeof payments[0]>[] = [
        {
            accessorKey: 'date',
            header: 'Tarih',
            cell: ({ getValue }) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-secondary)] flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </div>
                    <span className="text-white">
                        {(getValue() as Date).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </span>
                </div>
            ),
            sortingFn: 'datetime',
        },
        {
            accessorKey: 'description',
            header: 'Açıklama',
            cell: ({ getValue }) => (
                <span className="text-white font-medium">{getValue() as string}</span>
            ),
        },
        {
            accessorKey: 'amount',
            header: 'Tutar',
            cell: ({ getValue }) => (
                <span className="text-[var(--color-accent-red)] font-semibold">
                    -₺{(getValue() as number).toLocaleString('tr-TR')}
                </span>
            ),
        },
        {
            accessorKey: 'methodId',
            header: 'İlgili Yöntem',
            cell: ({ getValue }) => {
                const methodId = getValue() as string | undefined;
                const method = rawMethods.find((m: MethodData) => m.id === methodId);
                return method ? (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[var(--color-accent-orange)]/20 flex items-center justify-center">
                            <Layers className="w-3 h-3 text-[var(--color-accent-orange)]" />
                        </div>
                        <span className="text-[var(--color-accent-orange)]">{method.name}</span>
                    </div>
                ) : (
                    <span className="text-[var(--color-text-muted)]">Genel Gider</span>
                );
            },
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleEdit(row.original)}
                        className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-accent-orange)]"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.original.id)}
                        className="p-2 rounded-lg hover:bg-[var(--color-accent-red)]/10 transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)]"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data: payments,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: { globalFilter, sorting },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
    });

    const handleEdit = (payment: typeof payments[0]) => {
        setEditingPaymentId(payment.id);
        setFormData({
            date: new Date(payment.date).toISOString().split('T')[0],
            description: payment.description,
            amount: payment.amount.toString(),
            methodId: payment.methodId || '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu ödemeyi silmek istediğinize emin misiniz?')) return;
        try {
            await deletePayment(id);
        } catch (err) {
            console.error('Delete error:', err);
            alert('Silme işlemi başarısız oldu');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingPaymentId) {
                await updatePayment(editingPaymentId, {
                    date: formData.date,
                    description: formData.description,
                    amount: parseFloat(formData.amount),
                    methodId: formData.methodId || undefined,
                });
            } else {
                await addPayment({
                    date: formData.date,
                    description: formData.description,
                    amount: parseFloat(formData.amount),
                    methodId: formData.methodId || undefined,
                });
            }
            resetForm();
        } catch (err: unknown) {
            console.error('[Payments] Submit error:', err);
            const msg = err instanceof Error ? err.message : (err as Record<string, string>)?.message || JSON.stringify(err);
            alert('İşlem başarısız oldu: ' + msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            description: '',
            amount: '',
            methodId: '',
        });
        setEditingPaymentId(null);
        setIsModalOpen(false);
    };

    // Calculate stats
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
    const methodPayments = payments.filter((p) => p.methodId).reduce((sum, p) => sum + p.amount, 0);
    const generalPayments = payments.filter((p) => !p.methodId).reduce((sum, p) => sum + p.amount, 0);

    const isLoading = paymentsLoading || methodsLoading;

    return (
        <MainLayout breadcrumb={['Ödemeler']}>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Ödemeler & Giderler</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                        Tüm gider ve ödemeleri takip edin
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ödeme Ekle
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-[var(--color-accent-red)]/20 to-[var(--color-accent-red)]/5 border-[var(--color-accent-red)]/20">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-red)]/20 flex items-center justify-center">
                            <TrendingDown className="w-6 h-6 text-[var(--color-accent-red)]" />
                        </div>
                        <div>
                            <p className="text-[var(--color-text-secondary)] text-sm">Toplam Gider</p>
                            <p className="text-2xl font-bold text-white">₺{totalPayments.toLocaleString('tr-TR')}</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-[var(--color-accent-orange)]/20 to-[var(--color-accent-orange)]/5 border-[var(--color-accent-orange)]/20">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-orange)]/20 flex items-center justify-center">
                            <Layers className="w-6 h-6 text-[var(--color-accent-orange)]" />
                        </div>
                        <div>
                            <p className="text-[var(--color-text-secondary)] text-sm">Yöntem Giderleri</p>
                            <p className="text-2xl font-bold text-white">₺{methodPayments.toLocaleString('tr-TR')}</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-[var(--color-text-muted)]/20 to-[var(--color-text-muted)]/5 border-[var(--color-text-muted)]/20">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-text-muted)]/20 flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-[var(--color-text-muted)]" />
                        </div>
                        <div>
                            <p className="text-[var(--color-text-secondary)] text-sm">Genel Giderler</p>
                            <p className="text-2xl font-bold text-white">₺{generalPayments.toLocaleString('tr-TR')}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Sync Info */}
            <div className="mb-6 p-4 rounded-xl bg-[var(--color-accent-orange)]/10 border border-[var(--color-accent-orange)]/20">
                <div className="flex items-start gap-3">
                    <Layers className="w-5 h-5 text-[var(--color-accent-orange)] mt-0.5" />
                    <div>
                        <p className="text-white font-medium">Otomatik Senkronizasyon</p>
                        <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                            Bir yöntem seçtiğinizde, bu ödeme otomatik olarak "Veri Girişi" sayfasındaki ilgili yöntemin tablosuna yansıyacaktır.
                        </p>
                    </div>
                </div>
            </div>

            {/* Payments Table */}
            <Card>
                <div className="flex items-center justify-between gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-white whitespace-nowrap">Tüm Ödemeler</h3>
                    <div className="relative flex-1 max-w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                        <input
                            type="text"
                            placeholder="Ödeme ara..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--color-bg-secondary)] text-white text-sm border border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)] transition-colors placeholder:text-[var(--color-text-muted)]"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-[var(--color-accent-orange)] animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id} className="border-b border-[var(--color-border-glass)]">
                                        {headerGroup.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                className="text-left py-3 px-4 text-[var(--color-text-muted)] text-sm font-medium cursor-pointer hover:text-white"
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                <div className="flex items-center gap-1">
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                                    {header.column.getIsSorted() && (
                                                        <span>{header.column.getIsSorted() === 'desc' ? '↓' : '↑'}</span>
                                                    )}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="border-b border-[var(--color-border-glass)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="py-4 px-4">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!isLoading && table.getRowModel().rows.length === 0 && (
                    <div className="text-center py-12">
                        <CreditCard className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-4" />
                        <p className="text-[var(--color-text-secondary)]">Henüz ödeme eklenmemiş</p>
                    </div>
                )}
            </Card>

            {/* Add/Edit Payment Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={resetForm}
                title={editingPaymentId ? 'Ödemeyi Düzenle' : 'Yeni Ödeme Ekle'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Tarih"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                    />

                    <Input
                        label="Açıklama"
                        placeholder="Ödeme açıklaması"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />

                    <Input
                        label="Tutar (₺)"
                        type="number"
                        placeholder="1000"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                    />

                    <Select
                        label="İlgili Yöntem (Opsiyonel)"
                        options={[
                            { value: '', label: 'Genel Gider (Yöntem Yok)' },
                            ...methods.map((m: MethodData) => ({ value: m.id, label: m.name })),
                        ]}
                        value={formData.methodId}
                        onChange={(e) => setFormData({ ...formData, methodId: e.target.value })}
                    />

                    {formData.methodId && (
                        <div className="p-3 rounded-lg bg-[var(--color-accent-orange)]/10 border border-[var(--color-accent-orange)]/20">
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                <span className="text-[var(--color-accent-orange)]">●</span> Bu ödeme, "{methods.find((m: MethodData) => m.id === formData.methodId)?.name}" yönteminin veri giriş tablosuna otomatik eklenecektir.
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-glass)]">
                        <Button variant="ghost" type="button" onClick={resetForm}>
                            İptal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : null}
                            {editingPaymentId ? 'Güncelle' : 'Ekle'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </MainLayout>
    );
}
