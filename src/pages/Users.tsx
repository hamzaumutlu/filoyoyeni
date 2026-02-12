import { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Search,
    Trash2,
    Shield,
    ShieldCheck,
    User,
    Loader2,
    Building2,
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
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface UserData {
    id: string;
    email: string;
    role: 'super_admin' | 'admin' | 'user';
    companyId: string;
    companyName?: string;
    createdAt: string;
}

interface CompanyData {
    id: string;
    name: string;
}

interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
    role: 'admin' | 'user';
    companyId: string;
}

export default function UsersPage() {
    const { user: currentUser, createUser, isSuperAdmin } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [companies, setCompanies] = useState<CompanyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        companyId: '',
    });

    // Fetch users and companies
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        if (!isSupabaseConfigured()) {
            // Demo data
            setUsers([
                {
                    id: '1',
                    email: 'admin@filoyo.com',
                    role: 'super_admin',
                    companyId: '1',
                    companyName: 'Filoyo Demo',
                    createdAt: '2026-01-01',
                },
                {
                    id: '2',
                    email: 'user@firma.com',
                    role: 'admin',
                    companyId: '1',
                    companyName: 'Filoyo Demo',
                    createdAt: '2026-01-15',
                },
            ]);
            setCompanies([
                { id: '1', name: 'Filoyo Demo' },
                { id: '2', name: 'ABC Rent-a-Car' },
            ]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Fetch users with company names
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: usersData } = await (supabase as any)
                .from('users')
                .select('*, companies(name)')
                .order('created_at', { ascending: false });

            if (usersData) {
                setUsers(
                    usersData.map((u: Record<string, unknown>) => ({
                        id: u.id as string,
                        email: u.email as string,
                        role: u.role as 'super_admin' | 'admin' | 'user',
                        companyId: u.company_id as string,
                        companyName: (u.companies as { name: string } | null)?.name,
                        createdAt: u.created_at as string,
                    }))
                );
            }

            // Fetch companies
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: companiesData } = await (supabase as any)
                .from('companies')
                .select('id, name')
                .order('name');

            if (companiesData) {
                setCompanies(companiesData);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnDef<UserData>[] = [
        {
            accessorKey: 'email',
            header: 'E-posta',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent-orange)] to-[var(--color-accent-orange-light)] flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="font-medium text-white">{row.original.email}</span>
                        {row.original.id === currentUser?.id && (
                            <span className="ml-2 text-xs text-[var(--color-accent-orange)]">(Siz)</span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'role',
            header: 'Rol',
            cell: ({ getValue }) => {
                const role = getValue() as string;
                const config = {
                    super_admin: { label: 'Süper Admin', icon: ShieldCheck, color: 'text-[var(--color-accent-orange)]', bg: 'bg-[var(--color-accent-orange)]/10' },
                    admin: { label: 'Admin', icon: Shield, color: 'text-[var(--color-accent-green)]', bg: 'bg-[var(--color-accent-green)]/10' },
                    user: { label: 'Kullanıcı', icon: User, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                }[role] || { label: role, icon: User, color: 'text-gray-400', bg: 'bg-gray-500/10' };

                const Icon = config.icon;
                return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
                        <Icon className="w-3 h-3" />
                        {config.label}
                    </span>
                );
            },
        },
        {
            accessorKey: 'companyName',
            header: 'Firma',
            cell: ({ getValue }) => (
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                    <Building2 className="w-4 h-4" />
                    {getValue() as string || '-'}
                </div>
            ),
        },
        {
            accessorKey: 'createdAt',
            header: 'Kayıt Tarihi',
            cell: ({ getValue }) => (
                <span className="text-[var(--color-text-secondary)]">
                    {new Date(getValue() as string).toLocaleDateString('tr-TR')}
                </span>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                // Can't delete yourself or super_admin (unless you're super_admin)
                const canDelete =
                    row.original.id !== currentUser?.id &&
                    (isSuperAdmin || row.original.role !== 'super_admin');

                return canDelete ? (
                    <button
                        onClick={() => handleDelete(row.original.id)}
                        className="p-2 rounded-lg hover:bg-[var(--color-accent-red)]/10 transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)]"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                ) : null;
            },
        },
    ];

    const table = useReactTable({
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
    });

    const handleDelete = async (id: string) => {
        if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;

        try {
            if (isSupabaseConfigured()) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase as any).from('users').delete().eq('id', id);
            }
            setUsers(users.filter((u) => u.id !== id));
        } catch (err) {
            alert('Silme işlemi başarısız');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Şifreler eşleşmiyor');
            return;
        }

        if (formData.password.length < 6) {
            setError('Şifre en az 6 karakter olmalı');
            return;
        }

        setIsSubmitting(true);

        try {
            await createUser(
                formData.email,
                formData.password,
                formData.role,
                formData.companyId || currentUser?.companyId || ''
            );

            // Refresh list
            await fetchData();
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kullanıcı oluşturulamadı');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            role: 'user',
            companyId: '',
        });
        setError('');
        setIsModalOpen(false);
    };

    return (
        <MainLayout breadcrumb={['Kullanıcılar']}>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Kullanıcılar</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                        Sistem kullanıcılarını yönetin
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Kullanıcı Ekle
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-[var(--color-accent-orange)]/20 to-[var(--color-accent-orange)]/5 border-[var(--color-accent-orange)]/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-orange)]/20 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-[var(--color-accent-orange)]" />
                        </div>
                        <div>
                            <p className="text-[var(--color-text-secondary)] text-sm">Süper Admin</p>
                            <p className="text-xl font-bold text-white">
                                {users.filter((u) => u.role === 'super_admin').length}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-[var(--color-accent-green)]/20 to-[var(--color-accent-green)]/5 border-[var(--color-accent-green)]/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-green)]/20 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-[var(--color-accent-green)]" />
                        </div>
                        <div>
                            <p className="text-[var(--color-text-secondary)] text-sm">Admin</p>
                            <p className="text-xl font-bold text-white">
                                {users.filter((u) => u.role === 'admin').length}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[var(--color-text-secondary)] text-sm">Toplam</p>
                            <p className="text-xl font-bold text-white">{users.length}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Users Table */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Tüm Kullanıcılar</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                        <input
                            type="text"
                            placeholder="Kullanıcı ara..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="w-64 pl-10 pr-4 py-2 rounded-xl bg-[var(--color-bg-secondary)] text-white text-sm border border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)] transition-colors placeholder:text-[var(--color-text-muted)]"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-[var(--color-accent-orange)] animate-spin" />
                        <span className="ml-3 text-[var(--color-text-secondary)]">Yükleniyor...</span>
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

                {!loading && users.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-4" />
                        <p className="text-[var(--color-text-secondary)]">Henüz kullanıcı eklenmemiş</p>
                    </div>
                )}
            </Card>

            {/* Add User Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={resetForm}
                title="Yeni Kullanıcı Ekle"
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-xl bg-[var(--color-accent-red)]/10 border border-[var(--color-accent-red)]/30 text-[var(--color-accent-red)] text-sm">
                            {error}
                        </div>
                    )}

                    <Input
                        label="E-posta"
                        type="email"
                        placeholder="ornek@firma.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />

                    <Input
                        label="Şifre"
                        type="password"
                        placeholder="En az 6 karakter"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />

                    <Input
                        label="Şifre Tekrar"
                        type="password"
                        placeholder="Şifreyi tekrar girin"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                    />

                    <Select
                        label="Rol"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                        options={[
                            { value: 'user', label: 'Kullanıcı' },
                            { value: 'admin', label: 'Admin' },
                        ]}
                    />

                    {isSuperAdmin && companies.length > 0 && (
                        <Select
                            label="Firma"
                            value={formData.companyId}
                            onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                            options={[
                                { value: '', label: 'Firma Seçin' },
                                ...companies.map((c) => ({ value: c.id, label: c.name })),
                            ]}
                        />
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-glass)]">
                        <Button variant="ghost" type="button" onClick={resetForm}>
                            İptal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Oluşturuluyor...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Kullanıcı Ekle
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>
        </MainLayout>
    );
}
