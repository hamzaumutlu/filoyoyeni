import { useState } from 'react';
import {
    Layers,
    Plus,
    Search,
    Pencil,
    Trash2,
    Link2,
    Percent,
} from 'lucide-react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    flexRender,
    type ColumnDef,
} from '@tanstack/react-table';
import { MainLayout } from '../components/layout';
import { Card, Button, Modal, Input } from '../components/ui';
import type { Method } from '../types';

// Mock data
const mockMethods: Method[] = [
    {
        id: '1',
        name: 'Yolcu360',
        entryCommission: 2.5,
        exitCommission: 1.5,
        deliveryCommission: 3.0,
        openingBalance: 50000,
        groupChatLink: 'https://wa.me/905551234567',
        status: 'active',
    },
    {
        id: '2',
        name: 'Enuygun',
        entryCommission: 2.0,
        exitCommission: 1.0,
        deliveryCommission: 2.5,
        openingBalance: 35000,
        groupChatLink: 'https://wa.me/905559876543',
        status: 'active',
    },
    {
        id: '3',
        name: 'BiTaksi',
        entryCommission: 3.0,
        exitCommission: 2.0,
        deliveryCommission: 2.0,
        openingBalance: 20000,
        status: 'inactive',
    },
];

interface FormData {
    name: string;
    entryCommission: string;
    exitCommission: string;
    deliveryCommission: string;
    openingBalance: string;
    groupChatLink: string;
}

export default function Methods() {
    const [methods, setMethods] = useState<Method[]>(mockMethods);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState<Method | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [formData, setFormData] = useState<FormData>({
        name: '',
        entryCommission: '',
        exitCommission: '',
        deliveryCommission: '',
        openingBalance: '',
        groupChatLink: '',
    });

    const columns: ColumnDef<Method>[] = [
        {
            accessorKey: 'name',
            header: 'Yöntem Adı',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent-orange)] to-[var(--color-accent-orange-light)] flex items-center justify-center">
                        <Layers className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-white">{row.original.name}</span>
                </div>
            ),
        },
        {
            accessorKey: 'entryCommission',
            header: 'Giriş %',
            cell: ({ getValue }) => (
                <span className="text-[var(--color-accent-green)] font-medium">
                    %{getValue() as number}
                </span>
            ),
        },
        {
            accessorKey: 'exitCommission',
            header: 'Çıkış %',
            cell: ({ getValue }) => (
                <span className="text-[var(--color-accent-orange)] font-medium">
                    %{getValue() as number}
                </span>
            ),
        },
        {
            accessorKey: 'deliveryCommission',
            header: 'Teslim %',
            cell: ({ getValue }) => (
                <span className="text-blue-400 font-medium">
                    %{getValue() as number}
                </span>
            ),
        },
        {
            accessorKey: 'openingBalance',
            header: 'Devir',
            cell: ({ getValue }) => (
                <span className="text-white font-medium">
                    ₺{(getValue() as number).toLocaleString('tr-TR')}
                </span>
            ),
        },
        {
            accessorKey: 'groupChatLink',
            header: 'Grup Linki',
            cell: ({ getValue }) => {
                const link = getValue() as string | undefined;
                return link ? (
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-accent-orange)] hover:underline flex items-center gap-1"
                    >
                        <Link2 className="w-4 h-4" />
                        Aç
                    </a>
                ) : (
                    <span className="text-[var(--color-text-muted)]">-</span>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Durum',
            cell: ({ getValue }) => {
                const status = getValue() as string;
                const isActive = status === 'active';
                return (
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${isActive
                            ? 'text-[var(--color-accent-green)] bg-[var(--color-accent-green)]/10'
                            : 'text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)]'
                            }`}
                    >
                        • {isActive ? 'Aktif' : 'Pasif'}
                    </span>
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
        data: methods,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
    });

    const handleEdit = (method: Method) => {
        setEditingMethod(method);
        setFormData({
            name: method.name,
            entryCommission: method.entryCommission.toString(),
            exitCommission: method.exitCommission.toString(),
            deliveryCommission: method.deliveryCommission.toString(),
            openingBalance: method.openingBalance.toString(),
            groupChatLink: method.groupChatLink || '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setMethods(methods.filter((m) => m.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingMethod) {
            // Update existing
            setMethods(
                methods.map((m) =>
                    m.id === editingMethod.id
                        ? {
                            ...m,
                            name: formData.name,
                            entryCommission: parseFloat(formData.entryCommission),
                            exitCommission: parseFloat(formData.exitCommission),
                            deliveryCommission: parseFloat(formData.deliveryCommission),
                            openingBalance: parseFloat(formData.openingBalance),
                            groupChatLink: formData.groupChatLink || undefined,
                        }
                        : m
                )
            );
        } else {
            // Add new
            const newMethod: Method = {
                id: Date.now().toString(),
                name: formData.name,
                entryCommission: parseFloat(formData.entryCommission),
                exitCommission: parseFloat(formData.exitCommission),
                deliveryCommission: parseFloat(formData.deliveryCommission),
                openingBalance: parseFloat(formData.openingBalance),
                groupChatLink: formData.groupChatLink || undefined,
                status: 'active',
            };
            setMethods([...methods, newMethod]);
        }

        resetForm();
    };

    const resetForm = () => {
        setFormData({
            name: '',
            entryCommission: '',
            exitCommission: '',
            deliveryCommission: '',
            openingBalance: '',
            groupChatLink: '',
        });
        setEditingMethod(null);
        setIsModalOpen(false);
    };

    return (
        <MainLayout breadcrumb={['Yöntemler']}>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Yöntemler</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                        Kanalları ve komisyon oranlarını yönetin
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Yöntem Ekle
                </Button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-[var(--color-accent-green)]/20 to-[var(--color-accent-green)]/5 border-[var(--color-accent-green)]/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-green)]/20 flex items-center justify-center">
                            <Percent className="w-5 h-5 text-[var(--color-accent-green)]" />
                        </div>
                        <div>
                            <p className="text-[var(--color-text-secondary)] text-sm">Ortalama Giriş</p>
                            <p className="text-xl font-bold text-white">%2.5</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-[var(--color-accent-orange)]/20 to-[var(--color-accent-orange)]/5 border-[var(--color-accent-orange)]/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-orange)]/20 flex items-center justify-center">
                            <Percent className="w-5 h-5 text-[var(--color-accent-orange)]" />
                        </div>
                        <div>
                            <p className="text-[var(--color-text-secondary)] text-sm">Ortalama Çıkış</p>
                            <p className="text-xl font-bold text-white">%1.5</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Layers className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[var(--color-text-secondary)] text-sm">Aktif Yöntem</p>
                            <p className="text-xl font-bold text-white">{methods.filter((m) => m.status === 'active').length}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Methods Table */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Tüm Yöntemler</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                        <input
                            type="text"
                            placeholder="Yöntem ara..."
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
                        <Layers className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-4" />
                        <p className="text-[var(--color-text-secondary)]">Henüz yöntem eklenmemiş</p>
                    </div>
                )}
            </Card>

            {/* Add/Edit Method Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={resetForm}
                title={editingMethod ? 'Yöntem Düzenle' : 'Yeni Yöntem Ekle'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Yöntem Adı"
                        placeholder="Örn: Yolcu360"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-3 gap-4">
                        <Input
                            label="Giriş Komisyonu %"
                            type="number"
                            step="0.1"
                            placeholder="2.5"
                            value={formData.entryCommission}
                            onChange={(e) => setFormData({ ...formData, entryCommission: e.target.value })}
                            required
                        />
                        <Input
                            label="Çıkış Komisyonu %"
                            type="number"
                            step="0.1"
                            placeholder="1.5"
                            value={formData.exitCommission}
                            onChange={(e) => setFormData({ ...formData, exitCommission: e.target.value })}
                            required
                        />
                        <Input
                            label="Teslim Komisyonu %"
                            type="number"
                            step="0.1"
                            placeholder="3.0"
                            value={formData.deliveryCommission}
                            onChange={(e) => setFormData({ ...formData, deliveryCommission: e.target.value })}
                            required
                        />
                    </div>

                    <Input
                        label="Devir (Açılış Bakiyesi)"
                        type="number"
                        placeholder="50000"
                        value={formData.openingBalance}
                        onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                        required
                    />

                    <Input
                        label="Grup Chat Linki (Opsiyonel)"
                        type="url"
                        placeholder="https://wa.me/905551234567"
                        value={formData.groupChatLink}
                        onChange={(e) => setFormData({ ...formData, groupChatLink: e.target.value })}
                        icon={<Link2 className="w-4 h-4" />}
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-glass)]">
                        <Button variant="ghost" type="button" onClick={resetForm}>
                            İptal
                        </Button>
                        <Button type="submit">
                            {editingMethod ? (
                                <>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Güncelle
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Ekle
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>
        </MainLayout>
    );
}
