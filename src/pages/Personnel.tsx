import { useState, useMemo } from 'react';
import {
    Users,
    Plus,
    Search,
    Pencil,
    Trash2,
    Wallet,
    FileText,
    Calendar,
} from 'lucide-react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    flexRender,
    type ColumnDef,
} from '@tanstack/react-table';
import { MainLayout } from '../components/layout';
import { Card, Button, Modal, Input, Select } from '../components/ui';
import type { Personnel, Advance } from '../types';

// Departments
const departments = [
    { value: 'operasyon', label: 'Operasyon' },
    { value: 'muhasebe', label: 'Muhasebe' },
    { value: 'satis', label: 'Satış' },
    { value: 'teknik', label: 'Teknik Servis' },
    { value: 'yonetim', label: 'Yönetim' },
];

// Mock data
const mockPersonnel: Personnel[] = [
    {
        id: '1',
        name: 'Ahmet Yılmaz',
        department: 'operasyon',
        baseSalary: 45000,
        startDate: new Date('2023-06-15'),
        note: 'Kıdemli çalışan, araç teslim sorumlusu',
    },
    {
        id: '2',
        name: 'Fatma Demir',
        department: 'muhasebe',
        baseSalary: 38000,
        startDate: new Date('2024-01-10'),
        note: 'Mali işler uzmanı',
    },
    {
        id: '3',
        name: 'Mehmet Kaya',
        department: 'satis',
        baseSalary: 42000,
        startDate: new Date('2023-09-01'),
    },
];

const mockAdvances: Advance[] = [
    { id: '1', personnelId: '1', amount: 5000, date: new Date('2026-01-05'), description: 'Kira ödemesi' },
    { id: '2', personnelId: '1', amount: 3000, date: new Date('2026-01-15'), description: 'Acil ihtiyaç' },
    { id: '3', personnelId: '2', amount: 2000, date: new Date('2026-01-10') },
];

interface PersonnelFormData {
    name: string;
    department: string;
    baseSalary: string;
    startDate: string;
    note: string;
}

interface AdvanceFormData {
    personnelId: string;
    amount: string;
    date: string;
    description: string;
}

export default function PersonnelPage() {
    const [personnel, setPersonnel] = useState<Personnel[]>(mockPersonnel);
    const [advances, setAdvances] = useState<Advance[]>(mockAdvances);
    const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
    const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
    const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');

    const [personnelForm, setPersonnelForm] = useState<PersonnelFormData>({
        name: '',
        department: '',
        baseSalary: '',
        startDate: '',
        note: '',
    });

    const [advanceForm, setAdvanceForm] = useState<AdvanceFormData>({
        personnelId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
    });

    // Calculate monthly advances for current month
    const getMonthlyAdvances = (personnelId: string) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return advances
            .filter((a) => {
                const advanceDate = new Date(a.date);
                return (
                    a.personnelId === personnelId &&
                    advanceDate.getMonth() === currentMonth &&
                    advanceDate.getFullYear() === currentYear
                );
            })
            .reduce((sum, a) => sum + a.amount, 0);
    };

    // Enhanced personnel data with calculations
    const enhancedPersonnel = useMemo(() => {
        return personnel.map((p) => {
            const monthlyAdvances = getMonthlyAdvances(p.id);
            const remainingSalary = p.baseSalary - monthlyAdvances;
            return {
                ...p,
                monthlyAdvances,
                remainingSalary,
            };
        });
    }, [personnel, advances]);

    const columns: ColumnDef<typeof enhancedPersonnel[0]>[] = [
        {
            accessorKey: 'name',
            header: 'Personel',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent-orange)] to-[var(--color-accent-orange-light)] flex items-center justify-center text-white font-bold">
                        {row.original.name.charAt(0)}
                    </div>
                    <div>
                        <span className="font-medium text-white block">{row.original.name}</span>
                        <span className="text-xs text-[var(--color-text-muted)]">
                            {departments.find((d) => d.value === row.original.department)?.label}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'startDate',
            header: 'Başlangıç',
            cell: ({ getValue }) => (
                <span className="text-[var(--color-text-secondary)]">
                    {(getValue() as Date).toLocaleDateString('tr-TR')}
                </span>
            ),
        },
        {
            accessorKey: 'baseSalary',
            header: 'Maaş',
            cell: ({ getValue }) => (
                <span className="text-white font-medium">
                    ₺{(getValue() as number).toLocaleString('tr-TR')}
                </span>
            ),
        },
        {
            accessorKey: 'monthlyAdvances',
            header: 'Avans (Bu Ay)',
            cell: ({ getValue }) => {
                const amount = getValue() as number;
                return (
                    <span className={`font-medium ${amount > 0 ? 'text-[var(--color-accent-orange)]' : 'text-[var(--color-text-muted)]'}`}>
                        {amount > 0 ? `₺${amount.toLocaleString('tr-TR')}` : '-'}
                    </span>
                );
            },
        },
        {
            accessorKey: 'remainingSalary',
            header: 'Kalan Maaş',
            cell: ({ getValue }) => {
                const amount = getValue() as number;
                return (
                    <span className={`font-semibold ${amount >= 0 ? 'text-[var(--color-accent-green)]' : 'text-[var(--color-accent-red)]'}`}>
                        ₺{amount.toLocaleString('tr-TR')}
                    </span>
                );
            },
        },
        {
            accessorKey: 'note',
            header: 'Not',
            cell: ({ getValue }) => {
                const note = getValue() as string | undefined;
                return note ? (
                    <div className="group relative">
                        <FileText className="w-4 h-4 text-[var(--color-text-muted)] cursor-help" />
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-glass)] rounded-lg px-3 py-2 text-sm text-white max-w-xs shadow-lg">
                                {note}
                            </div>
                        </div>
                    </div>
                ) : (
                    <span className="text-[var(--color-text-muted)]">-</span>
                );
            },
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => openAdvanceModal(row.original.id)}
                        className="p-2 rounded-lg hover:bg-[var(--color-accent-orange)]/10 transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-accent-orange)]"
                        title="Avans Ekle"
                    >
                        <Wallet className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleEdit(row.original)}
                        className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors text-[var(--color-text-muted)] hover:text-white"
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
        data: enhancedPersonnel,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
    });

    const handleEdit = (p: Personnel) => {
        setEditingPersonnel(p);
        setPersonnelForm({
            name: p.name,
            department: p.department,
            baseSalary: p.baseSalary.toString(),
            startDate: new Date(p.startDate).toISOString().split('T')[0],
            note: p.note || '',
        });
        setIsPersonnelModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setPersonnel(personnel.filter((p) => p.id !== id));
        setAdvances(advances.filter((a) => a.personnelId !== id));
    };

    const openAdvanceModal = (personnelId: string) => {
        setAdvanceForm({
            personnelId,
            amount: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
        });
        setIsAdvanceModalOpen(true);
    };

    const handlePersonnelSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingPersonnel) {
            setPersonnel(
                personnel.map((p) =>
                    p.id === editingPersonnel.id
                        ? {
                            ...p,
                            name: personnelForm.name,
                            department: personnelForm.department,
                            baseSalary: parseFloat(personnelForm.baseSalary),
                            startDate: new Date(personnelForm.startDate),
                            note: personnelForm.note || undefined,
                        }
                        : p
                )
            );
        } else {
            const newPersonnel: Personnel = {
                id: Date.now().toString(),
                name: personnelForm.name,
                department: personnelForm.department,
                baseSalary: parseFloat(personnelForm.baseSalary),
                startDate: new Date(personnelForm.startDate),
                note: personnelForm.note || undefined,
            };
            setPersonnel([...personnel, newPersonnel]);
        }

        resetPersonnelForm();
    };

    const handleAdvanceSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newAdvance: Advance = {
            id: Date.now().toString(),
            personnelId: advanceForm.personnelId,
            amount: parseFloat(advanceForm.amount),
            date: new Date(advanceForm.date),
            description: advanceForm.description || undefined,
        };

        setAdvances([...advances, newAdvance]);
        setIsAdvanceModalOpen(false);
    };

    const resetPersonnelForm = () => {
        setPersonnelForm({
            name: '',
            department: '',
            baseSalary: '',
            startDate: '',
            note: '',
        });
        setEditingPersonnel(null);
        setIsPersonnelModalOpen(false);
    };

    // Stats
    const totalSalary = personnel.reduce((sum, p) => sum + p.baseSalary, 0);
    const totalAdvances = advances
        .filter((a) => {
            const now = new Date();
            const d = new Date(a.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((sum, a) => sum + a.amount, 0);

    return (
        <MainLayout breadcrumb={['Personel']}>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Personel Yönetimi</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                        Çalışan bilgilerini ve avans ödemelerini yönetin
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={() => setIsAdvanceModalOpen(true)}>
                        <Wallet className="w-4 h-4 mr-2" />
                        Avans Ekle
                    </Button>
                    <Button onClick={() => setIsPersonnelModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Personel Ekle
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="relative overflow-hidden">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-orange)]/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-[var(--color-accent-orange)]" />
                        </div>
                        <div>
                            <p className="text-[var(--color-text-secondary)] text-sm">Toplam Personel</p>
                            <p className="text-2xl font-bold text-white">{personnel.length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="relative overflow-hidden">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-green)]/20 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-[var(--color-accent-green)]" />
                        </div>
                        <div>
                            <p className="text-[var(--color-text-secondary)] text-sm">Toplam Maaş</p>
                            <p className="text-2xl font-bold text-white">₺{totalSalary.toLocaleString('tr-TR')}</p>
                        </div>
                    </div>
                </Card>
                <Card className="relative overflow-hidden">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-red)]/20 flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-[var(--color-accent-red)]" />
                        </div>
                        <div>
                            <p className="text-[var(--color-text-secondary)] text-sm">Bu Ay Avans</p>
                            <p className="text-2xl font-bold text-white">₺{totalAdvances.toLocaleString('tr-TR')}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Personnel Table */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Personel Listesi</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                        <input
                            type="text"
                            placeholder="Personel ara..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="w-64 pl-10 pr-4 py-2 rounded-xl bg-[var(--color-bg-secondary)] text-white text-sm border border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)] transition-colors placeholder:text-[var(--color-text-muted)]"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="border-b border-[var(--color-border-glass)]">
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className="text-left py-3 px-4 text-[var(--color-text-muted)] text-sm font-medium"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
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

                {table.getRowModel().rows.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-4" />
                        <p className="text-[var(--color-text-secondary)]">Henüz personel eklenmemiş</p>
                    </div>
                )}
            </Card>

            {/* Add/Edit Personnel Modal */}
            <Modal
                isOpen={isPersonnelModalOpen}
                onClose={resetPersonnelForm}
                title={editingPersonnel ? 'Personeli Düzenle' : 'Yeni Personel Ekle'}
                size="lg"
            >
                <form onSubmit={handlePersonnelSubmit} className="space-y-4">
                    <Input
                        label="Ad Soyad"
                        placeholder="Personel adını girin"
                        value={personnelForm.name}
                        onChange={(e) => setPersonnelForm({ ...personnelForm, name: e.target.value })}
                        required
                    />

                    <Select
                        label="Departman"
                        options={departments}
                        placeholder="Departman seçin"
                        value={personnelForm.department}
                        onChange={(e) => setPersonnelForm({ ...personnelForm, department: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Temel Maaş (₺)"
                            type="number"
                            placeholder="45000"
                            value={personnelForm.baseSalary}
                            onChange={(e) => setPersonnelForm({ ...personnelForm, baseSalary: e.target.value })}
                            required
                        />
                        <Input
                            label="İşe Başlama Tarihi"
                            type="date"
                            value={personnelForm.startDate}
                            onChange={(e) => setPersonnelForm({ ...personnelForm, startDate: e.target.value })}
                            required
                        />
                    </div>

                    <div className="w-full">
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                            Not (Opsiyonel)
                        </label>
                        <textarea
                            placeholder="Personel hakkında notlar..."
                            value={personnelForm.note}
                            onChange={(e) => setPersonnelForm({ ...personnelForm, note: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-glass)]">
                        <Button variant="ghost" type="button" onClick={resetPersonnelForm}>
                            İptal
                        </Button>
                        <Button type="submit">
                            {editingPersonnel ? 'Güncelle' : 'Ekle'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Add Advance Modal */}
            <Modal
                isOpen={isAdvanceModalOpen}
                onClose={() => setIsAdvanceModalOpen(false)}
                title="Avans Ekle"
                size="md"
            >
                <form onSubmit={handleAdvanceSubmit} className="space-y-4">
                    <Select
                        label="Personel"
                        options={personnel.map((p) => ({ value: p.id, label: p.name }))}
                        placeholder="Personel seçin"
                        value={advanceForm.personnelId}
                        onChange={(e) => setAdvanceForm({ ...advanceForm, personnelId: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Tutar (₺)"
                            type="number"
                            placeholder="5000"
                            value={advanceForm.amount}
                            onChange={(e) => setAdvanceForm({ ...advanceForm, amount: e.target.value })}
                            required
                        />
                        <Input
                            label="Tarih"
                            type="date"
                            value={advanceForm.date}
                            onChange={(e) => setAdvanceForm({ ...advanceForm, date: e.target.value })}
                            required
                        />
                    </div>

                    <Input
                        label="Açıklama (Opsiyonel)"
                        placeholder="Avans açıklaması..."
                        value={advanceForm.description}
                        onChange={(e) => setAdvanceForm({ ...advanceForm, description: e.target.value })}
                    />

                    {/* Show person's current advance status */}
                    {advanceForm.personnelId && (
                        <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)]">
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--color-text-secondary)]">Bu Ay Avans:</span>
                                <span className="text-[var(--color-accent-orange)] font-medium">
                                    ₺{getMonthlyAdvances(advanceForm.personnelId).toLocaleString('tr-TR')}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm mt-2">
                                <span className="text-[var(--color-text-secondary)]">Kalan Maaş:</span>
                                <span className="text-[var(--color-accent-green)] font-medium">
                                    ₺{(
                                        (personnel.find((p) => p.id === advanceForm.personnelId)?.baseSalary || 0) -
                                        getMonthlyAdvances(advanceForm.personnelId)
                                    ).toLocaleString('tr-TR')}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-glass)]">
                        <Button variant="ghost" type="button" onClick={() => setIsAdvanceModalOpen(false)}>
                            İptal
                        </Button>
                        <Button type="submit">
                            <Wallet className="w-4 h-4 mr-2" />
                            Avans Ekle
                        </Button>
                    </div>
                </form>
            </Modal>
        </MainLayout>
    );
}
