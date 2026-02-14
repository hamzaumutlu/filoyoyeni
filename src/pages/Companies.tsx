import { useState, useMemo } from 'react';
import {
    Building2,
    Plus,
    Search,
    Mail,
    Eye,
    EyeOff,
    Loader2,
    Trash2,
    Pencil,
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
import { useCompaniesSupabase, type CompanyData } from '../hooks/useSupabase';
import { useAuth } from '../contexts/AuthContext';

interface FormData {
    name: string;
    email: string;
    password: string;
}

export default function Companies() {
    // Use Supabase hook
    const { companies: rawCompanies, loading, addCompany, updateCompany, deleteCompany } = useCompaniesSupabase();
    const { refreshCompanies } = useAuth();

    // Transform to UI format
    const companies = useMemo(() =>
        rawCompanies.map((c: CompanyData) => ({
            ...c,
            createdAt: new Date(c.createdAt),
        })), [rawCompanies]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
    });

    const columns: ColumnDef<typeof companies[0]>[] = [
        {
            accessorKey: 'name',
            header: 'Firma Adı',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-secondary)] flex items-center justify-center text-xl">
                        {row.original.logoUrl ? (
                            <img src={row.original.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                            <Building2 className="w-5 h-5 text-[var(--color-accent-orange)]" />
                        )}
                    </div>
                    <span className="font-medium text-white">{row.original.name}</span>
                </div>
            ),
        },
        {
            accessorKey: 'authorizedEmail',
            header: 'Yetkili E-posta',
            cell: ({ getValue }) => (
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                    <Mail className="w-4 h-4" />
                    {getValue() as string}
                </div>
            ),
        },
        {
            accessorKey: 'createdAt',
            header: 'Kayıt Tarihi',
            cell: ({ getValue }) => (
                <span className="text-[var(--color-text-secondary)]">
                    {(getValue() as Date).toLocaleDateString('tr-TR')}
                </span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Durum',
            cell: ({ getValue }) => {
                const status = getValue() as string;
                const statusConfig = {
                    active: { label: 'Aktif', class: 'text-[var(--color-accent-green)] bg-[var(--color-accent-green)]/10' },
                    inactive: { label: 'Pasif', class: 'text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)]' },
                    pending: { label: 'Beklemede', class: 'text-[var(--color-accent-orange)] bg-[var(--color-accent-orange)]/10' },
                };
                const config = statusConfig[status as keyof typeof statusConfig];
                return (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.class}`}>
                        • {config.label}
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
        data: companies,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
    });

    const handleEdit = (company: typeof companies[0]) => {
        setEditingCompanyId(company.id);
        setFormData({
            name: company.name,
            email: company.authorizedEmail,
            password: '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('⚠️ DİKKAT: Bu firmayı silmek istediğinize emin misiniz?\n\nFirmaya bağlı veriler varsa (yöntemler, ödemeler, personel vb.) silme işlemi engellenecektir. Önce bağlı verileri silmeniz gerekir.')) return;
        try {
            await deleteCompany(id);
            await refreshCompanies();
        } catch (err: unknown) {
            console.error('[Companies] Delete error:', err);
            const msg = err instanceof Error ? err.message : (err as Record<string, string>)?.message || JSON.stringify(err);
            if (msg.includes('violates foreign key constraint') || msg.includes('RESTRICT')) {
                alert('Bu firma silinemez çünkü firmaya bağlı kayıtlar (yöntemler, ödemeler, personel vb.) mevcut. Önce bu kayıtları silmeniz veya başka bir firmaya taşımanız gerekir.');
            } else {
                alert('Silme işlemi başarısız oldu: ' + msg);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingCompanyId) {
                await updateCompany(editingCompanyId, {
                    name: formData.name,
                    authorizedEmail: formData.email,
                });
            } else {
                await addCompany({
                    name: formData.name,
                    authorizedEmail: formData.email,
                    status: 'active',
                });
            }
            await refreshCompanies();
            resetForm();
        } catch (err) {
            console.error('Submit error:', err);
            alert('İşlem başarısız oldu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', password: '' });
        setEditingCompanyId(null);
        setShowPassword(false);
        setIsModalOpen(false);
    };

    return (
        <MainLayout breadcrumb={['Firmalar']}>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Firmalar</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                        Kayıtlı firma ve şirketleri yönetin
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Firma Ekle
                </Button>
            </div>

            {/* Companies Table */}
            <Card>
                <div className="flex items-center justify-between gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-white whitespace-nowrap">Tüm Firmalar</h3>
                    <div className="relative flex-1 max-w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                        <input
                            type="text"
                            placeholder="Firma ara..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--color-bg-secondary)] text-white text-sm border border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)] transition-colors placeholder:text-[var(--color-text-muted)]"
                        />
                    </div>
                </div>

                {loading ? (
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
                )}

                {!loading && table.getRowModel().rows.length === 0 && (
                    <div className="text-center py-12">
                        <Building2 className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-4" />
                        <p className="text-[var(--color-text-secondary)]">Henüz firma eklenmemiş</p>
                    </div>
                )}
            </Card>

            {/* Add/Edit Company Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={resetForm}
                title={editingCompanyId ? 'Firma Düzenle' : 'Yeni Firma Ekle'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Firma Adı"
                        placeholder="Firma adını girin"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <Input
                        label="Yetkili E-posta"
                        type="email"
                        placeholder="yetkili@firma.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        icon={<Mail className="w-4 h-4" />}
                        required
                    />

                    {!editingCompanyId && (
                        <div className="w-full">
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                Şifre
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-glass)] text-white text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-orange)] focus:outline-none transition-colors pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                Bu şifre ile firma yetkilisi sisteme giriş yapacak
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
                            ) : (
                                <Plus className="w-4 h-4 mr-2" />
                            )}
                            {editingCompanyId ? 'Güncelle' : 'Firma Ekle'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </MainLayout>
    );
}
