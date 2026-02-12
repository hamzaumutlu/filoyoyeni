import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ============================================
// Types matching frontend conventions (camelCase)
// ============================================
export interface MethodData {
    id: string;
    companyId: string;
    name: string;
    entryCommission: number;
    exitCommission: number;
    deliveryCommission: number;
    openingBalance: number;
    groupChatLink?: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

export interface PaymentData {
    id: string;
    companyId: string;
    methodId?: string;
    date: string;
    description: string;
    amount: number;
    createdAt: string;
}

export interface PersonnelData {
    id: string;
    companyId: string;
    name: string;
    department: string;
    baseSalary: number;
    startDate: string;
    note?: string;
    createdAt: string;
}

export interface AdvanceData {
    id: string;
    personnelId: string;
    companyId: string;
    methodId?: string;
    amount: number;
    date: string;
    description?: string;
    createdAt: string;
}

// ============================================
// Mappers: Database (snake_case) <-> Frontend (camelCase)
// ============================================
const mapMethodFromDb = (row: Record<string, unknown>): MethodData => ({
    id: row.id as string,
    companyId: row.company_id as string,
    name: row.name as string,
    entryCommission: row.entry_commission as number,
    exitCommission: row.exit_commission as number,
    deliveryCommission: row.delivery_commission as number,
    openingBalance: row.opening_balance as number,
    groupChatLink: row.group_chat_link as string | undefined,
    status: row.status as 'active' | 'inactive',
    createdAt: row.created_at as string,
});

const mapMethodToDb = (data: Partial<MethodData>) => ({
    ...(data.companyId && { company_id: data.companyId }),
    ...(data.name && { name: data.name }),
    ...(data.entryCommission !== undefined && { entry_commission: data.entryCommission }),
    ...(data.exitCommission !== undefined && { exit_commission: data.exitCommission }),
    ...(data.deliveryCommission !== undefined && { delivery_commission: data.deliveryCommission }),
    ...(data.openingBalance !== undefined && { opening_balance: data.openingBalance }),
    ...(data.groupChatLink !== undefined && { group_chat_link: data.groupChatLink || null }),
    ...(data.status && { status: data.status }),
});

const mapPaymentFromDb = (row: Record<string, unknown>): PaymentData => ({
    id: row.id as string,
    companyId: row.company_id as string,
    methodId: row.method_id as string | undefined,
    date: row.date as string,
    description: row.description as string,
    amount: row.amount as number,
    createdAt: row.created_at as string,
});

const mapPaymentToDb = (data: Partial<PaymentData>) => ({
    ...(data.companyId && { company_id: data.companyId }),
    ...(data.methodId !== undefined && { method_id: data.methodId || null }),
    ...(data.date && { date: data.date }),
    ...(data.description && { description: data.description }),
    ...(data.amount !== undefined && { amount: data.amount }),
});

const mapPersonnelFromDb = (row: Record<string, unknown>): PersonnelData => ({
    id: row.id as string,
    companyId: row.company_id as string,
    name: row.name as string,
    department: row.department as string,
    baseSalary: row.base_salary as number,
    startDate: row.start_date as string,
    note: row.note as string | undefined,
    createdAt: row.created_at as string,
});

const mapPersonnelToDb = (data: Partial<PersonnelData>) => ({
    ...(data.companyId && { company_id: data.companyId }),
    ...(data.name && { name: data.name }),
    ...(data.department && { department: data.department }),
    ...(data.baseSalary !== undefined && { base_salary: data.baseSalary }),
    ...(data.startDate && { start_date: data.startDate }),
    ...(data.note !== undefined && { note: data.note || null }),
});

const mapAdvanceFromDb = (row: Record<string, unknown>): AdvanceData => ({
    id: row.id as string,
    personnelId: row.personnel_id as string,
    companyId: row.company_id as string,
    methodId: row.method_id as string | undefined,
    amount: row.amount as number,
    date: row.date as string,
    description: row.description as string | undefined,
    createdAt: row.created_at as string,
});

const mapAdvanceToDb = (data: Partial<AdvanceData>) => ({
    ...(data.personnelId && { personnel_id: data.personnelId }),
    ...(data.companyId && { company_id: data.companyId }),
    ...(data.methodId !== undefined && { method_id: data.methodId || null }),
    ...(data.amount !== undefined && { amount: data.amount }),
    ...(data.date && { date: data.date }),
    ...(data.description !== undefined && { description: data.description || null }),
});

// ============================================
// Demo Company ID (for development)
// ============================================
const DEMO_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

// ============================================
// Timeout Helper - prevents queries from hanging
// ============================================
const QUERY_TIMEOUT_MS = 8000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withTimeout(promise: Promise<any>, ms: number = QUERY_TIMEOUT_MS): Promise<any> {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Sorgu zaman aşımına uğradı')), ms)
        ),
    ]);
}

// ============================================
// Methods Hook
// ============================================
export function useMethodsSupabase() {
    const [methods, setMethods] = useState<MethodData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMethods = useCallback(async () => {
        if (!isSupabaseConfigured()) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error: fetchError } = await withTimeout((supabase as any)
                .from('methods')
                .select('*')
                .order('created_at', { ascending: false }));

            if (fetchError) throw fetchError;
            setMethods((data || []).map(mapMethodFromDb));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMethods();
    }, [fetchMethods]);

    const addMethod = async (method: Omit<MethodData, 'id' | 'createdAt' | 'companyId'>) => {
        if (!isSupabaseConfigured()) {
            const newMethod: MethodData = {
                id: Date.now().toString(),
                companyId: DEMO_COMPANY_ID,
                ...method,
                createdAt: new Date().toISOString(),
            };
            setMethods((prev) => [newMethod, ...prev]);
            return newMethod;
        }

        const dbData = mapMethodToDb({ ...method, companyId: DEMO_COMPANY_ID });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('methods')
            .insert(dbData)
            .select()
            .single();

        if (error) throw error;
        await fetchMethods();
        return mapMethodFromDb(data);
    };

    const updateMethod = async (id: string, updates: Partial<MethodData>) => {
        if (!isSupabaseConfigured()) {
            setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
            return;
        }

        const dbData = mapMethodToDb(updates);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('methods')
            .update(dbData)
            .eq('id', id);

        if (error) throw error;
        await fetchMethods();
    };

    const deleteMethod = async (id: string) => {
        if (!isSupabaseConfigured()) {
            setMethods((prev) => prev.filter((m) => m.id !== id));
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('methods')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await fetchMethods();
    };

    return { methods, loading, error, addMethod, updateMethod, deleteMethod, refetch: fetchMethods };
}

// ============================================
// Payment → Data Entry Sync Helper
// When a payment is linked to a method, sync the
// total payments for that method+date into data_entries
// ============================================
async function syncPaymentToDataEntry(methodId: string, date: string) {
    if (!isSupabaseConfigured() || !methodId) return;

    try {
        // 1. Sum all payments for this method + date
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: allPayments, error: fetchErr } = await (supabase as any)
            .from('payments')
            .select('amount')
            .eq('method_id', methodId)
            .eq('date', date);

        if (fetchErr) {
            console.error('Sync fetch error:', fetchErr);
            return;
        }

        const totalPayment = (allPayments || []).reduce(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0
        );

        // 2. Find or create the data_entries row for this method + date
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existing, error: lookupErr } = await (supabase as any)
            .from('data_entries')
            .select('id')
            .eq('method_id', methodId)
            .eq('date', date)
            .maybeSingle();

        if (lookupErr) {
            console.error('Sync lookup error:', lookupErr);
            return;
        }

        if (existing) {
            // Update existing row's payment field
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
                .from('data_entries')
                .update({ payment: totalPayment, updated_at: new Date().toISOString() })
                .eq('id', existing.id);
        } else {
            // Create new row if it doesn't exist yet
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
                .from('data_entries')
                .insert({
                    method_id: methodId,
                    company_id: DEMO_COMPANY_ID,
                    date,
                    supplement: 0,
                    entry: 0,
                    exit: 0,
                    commission: 0,
                    payment: totalPayment,
                    delivery: 0,
                    description: null,
                    balance: 0,
                    locked: false,
                });
        }
    } catch (err) {
        console.error('Sync payment to data entry error:', err);
    }
}

// ============================================
// Payments Hook
// ============================================
export function usePaymentsSupabase() {
    const [payments, setPayments] = useState<PaymentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPayments = useCallback(async () => {
        if (!isSupabaseConfigured()) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error: fetchError } = await withTimeout((supabase as any)
                .from('payments')
                .select('*')
                .order('date', { ascending: false }));

            if (fetchError) throw fetchError;
            setPayments((data || []).map(mapPaymentFromDb));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const addPayment = async (payment: Omit<PaymentData, 'id' | 'createdAt' | 'companyId'>) => {
        if (!isSupabaseConfigured()) {
            const newPayment: PaymentData = {
                id: Date.now().toString(),
                companyId: DEMO_COMPANY_ID,
                ...payment,
                createdAt: new Date().toISOString(),
            };
            setPayments((prev) => [newPayment, ...prev]);
            return newPayment;
        }

        const dbData = mapPaymentToDb({ ...payment, companyId: DEMO_COMPANY_ID });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('payments')
            .insert(dbData)
            .select()
            .single();

        if (error) throw error;
        await fetchPayments();

        // Sync to data_entries if linked to a method
        if (payment.methodId) {
            await syncPaymentToDataEntry(payment.methodId, payment.date);
        }

        return mapPaymentFromDb(data);
    };

    const updatePayment = async (id: string, updates: Partial<PaymentData>) => {
        if (!isSupabaseConfigured()) {
            setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
            return;
        }

        // Get old payment data before update (to sync old method+date too)
        const oldPayment = payments.find(p => p.id === id);

        const dbData = mapPaymentToDb(updates);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('payments')
            .update(dbData)
            .eq('id', id);

        if (error) throw error;
        await fetchPayments();

        // Sync old method+date (to subtract removed payment)
        if (oldPayment?.methodId && oldPayment?.date) {
            await syncPaymentToDataEntry(oldPayment.methodId, oldPayment.date);
        }
        // Sync new method+date
        const newMethodId = updates.methodId ?? oldPayment?.methodId;
        const newDate = updates.date ?? oldPayment?.date;
        if (newMethodId && newDate && (newMethodId !== oldPayment?.methodId || newDate !== oldPayment?.date)) {
            await syncPaymentToDataEntry(newMethodId, newDate);
        }
    };

    const deletePayment = async (id: string) => {
        if (!isSupabaseConfigured()) {
            setPayments((prev) => prev.filter((p) => p.id !== id));
            return;
        }

        // Get payment data before delete (to sync)
        const deletedPayment = payments.find(p => p.id === id);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('payments')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await fetchPayments();

        // Sync to data_entries after deletion
        if (deletedPayment?.methodId && deletedPayment?.date) {
            await syncPaymentToDataEntry(deletedPayment.methodId, deletedPayment.date);
        }
    };

    return { payments, loading, error, addPayment, updatePayment, deletePayment, refetch: fetchPayments };
}

// ============================================
// Personnel Hook
// ============================================
export function usePersonnelSupabase() {
    const [personnel, setPersonnel] = useState<PersonnelData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPersonnel = useCallback(async () => {
        if (!isSupabaseConfigured()) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error: fetchError } = await withTimeout((supabase as any)
                .from('personnel')
                .select('*')
                .order('created_at', { ascending: false }));

            if (fetchError) throw fetchError;
            setPersonnel((data || []).map(mapPersonnelFromDb));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPersonnel();
    }, [fetchPersonnel]);

    const addPersonnel = async (person: Omit<PersonnelData, 'id' | 'createdAt' | 'companyId'>) => {
        if (!isSupabaseConfigured()) {
            const newPerson: PersonnelData = {
                id: Date.now().toString(),
                companyId: DEMO_COMPANY_ID,
                ...person,
                createdAt: new Date().toISOString(),
            };
            setPersonnel((prev) => [newPerson, ...prev]);
            return newPerson;
        }

        const dbData = mapPersonnelToDb({ ...person, companyId: DEMO_COMPANY_ID });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('personnel')
            .insert(dbData)
            .select()
            .single();

        if (error) throw error;
        await fetchPersonnel();
        return mapPersonnelFromDb(data);
    };

    const updatePersonnel = async (id: string, updates: Partial<PersonnelData>) => {
        if (!isSupabaseConfigured()) {
            setPersonnel((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
            return;
        }

        const dbData = mapPersonnelToDb(updates);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('personnel')
            .update(dbData)
            .eq('id', id);

        if (error) throw error;
        await fetchPersonnel();
    };

    const deletePersonnel = async (id: string) => {
        if (!isSupabaseConfigured()) {
            setPersonnel((prev) => prev.filter((p) => p.id !== id));
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('personnel')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await fetchPersonnel();
    };

    return { personnel, loading, error, addPersonnel, updatePersonnel, deletePersonnel, refetch: fetchPersonnel };
}

// ============================================
// Advances Hook
// ============================================
export function useAdvancesSupabase() {
    const [advances, setAdvances] = useState<AdvanceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAdvances = useCallback(async () => {
        if (!isSupabaseConfigured()) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error: fetchError } = await withTimeout((supabase as any)
                .from('advances')
                .select('*')
                .order('date', { ascending: false }));

            if (fetchError) throw fetchError;
            setAdvances((data || []).map(mapAdvanceFromDb));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdvances();
    }, [fetchAdvances]);

    const addAdvance = async (advance: Omit<AdvanceData, 'id' | 'createdAt' | 'companyId'>) => {
        if (!isSupabaseConfigured()) {
            const newAdvance: AdvanceData = {
                id: Date.now().toString(),
                companyId: DEMO_COMPANY_ID,
                ...advance,
                createdAt: new Date().toISOString(),
            };
            setAdvances((prev) => [newAdvance, ...prev]);
            return newAdvance;
        }

        const dbData = mapAdvanceToDb({ ...advance, companyId: DEMO_COMPANY_ID });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('advances')
            .insert(dbData)
            .select()
            .single();

        if (error) throw error;
        await fetchAdvances();
        return mapAdvanceFromDb(data);
    };

    const deleteAdvance = async (id: string) => {
        if (!isSupabaseConfigured()) {
            setAdvances((prev) => prev.filter((a) => a.id !== id));
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('advances')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await fetchAdvances();
    };

    return { advances, loading, error, addAdvance, deleteAdvance, refetch: fetchAdvances };
}

// ============================================
// Data Entry Type and Hook
// ============================================
export interface DataEntryData {
    id: string;
    methodId: string;
    companyId: string;
    date: string;
    supplement: number;
    entry: number;
    exit: number;
    commission: number;
    payment: number;
    delivery: number;
    description?: string;
    balance: number;
    locked: boolean;
    createdAt: string;
    updatedAt: string;
}

const mapDataEntryFromDb = (row: Record<string, unknown>): DataEntryData => ({
    id: row.id as string,
    methodId: row.method_id as string,
    companyId: row.company_id as string,
    date: row.date as string,
    supplement: (row.supplement as number) || 0,
    entry: (row.entry as number) || 0,
    exit: (row.exit as number) || 0,
    commission: (row.commission as number) || 0,
    payment: (row.payment as number) || 0,
    delivery: (row.delivery as number) || 0,
    description: row.description as string | undefined,
    balance: (row.balance as number) || 0,
    locked: (row.locked as boolean) || false,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
});

const mapDataEntryToDb = (data: Partial<DataEntryData>) => ({
    ...(data.methodId && { method_id: data.methodId }),
    ...(data.companyId && { company_id: data.companyId }),
    ...(data.date && { date: data.date }),
    ...(data.supplement !== undefined && { supplement: data.supplement }),
    ...(data.entry !== undefined && { entry: data.entry }),
    ...(data.exit !== undefined && { exit: data.exit }),
    ...(data.commission !== undefined && { commission: data.commission }),
    ...(data.payment !== undefined && { payment: data.payment }),
    ...(data.delivery !== undefined && { delivery: data.delivery }),
    ...(data.description !== undefined && { description: data.description || null }),
    ...(data.balance !== undefined && { balance: data.balance }),
    ...(data.locked !== undefined && { locked: data.locked }),
});

export function useDataEntriesSupabase(methodId?: string) {
    const [dataEntries, setDataEntries] = useState<DataEntryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDataEntries = useCallback(async () => {
        if (!isSupabaseConfigured()) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let query = (supabase as any)
                .from('data_entries')
                .select('*')
                .order('date', { ascending: false });

            if (methodId) {
                query = query.eq('method_id', methodId);
            }

            const { data, error: fetchError } = await withTimeout(query);

            if (fetchError) throw fetchError;
            setDataEntries((data || []).map(mapDataEntryFromDb));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    }, [methodId]);

    useEffect(() => {
        fetchDataEntries();
    }, [fetchDataEntries]);

    const addDataEntry = async (entry: Omit<DataEntryData, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>) => {
        if (!isSupabaseConfigured()) {
            const newEntry: DataEntryData = {
                id: Date.now().toString(),
                companyId: DEMO_COMPANY_ID,
                ...entry,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            setDataEntries((prev) => [newEntry, ...prev]);
            return newEntry;
        }

        const dbData = mapDataEntryToDb({ ...entry, companyId: DEMO_COMPANY_ID });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('data_entries')
            .insert(dbData)
            .select()
            .single();

        if (error) throw error;
        await fetchDataEntries();
        return mapDataEntryFromDb(data);
    };

    const updateDataEntry = async (id: string, updates: Partial<DataEntryData>) => {
        if (!isSupabaseConfigured()) {
            setDataEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
            return;
        }

        const dbData = { ...mapDataEntryToDb(updates), updated_at: new Date().toISOString() };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('data_entries')
            .update(dbData)
            .eq('id', id);

        if (error) throw error;
        await fetchDataEntries();
    };

    const deleteDataEntry = async (id: string) => {
        if (!isSupabaseConfigured()) {
            setDataEntries((prev) => prev.filter((e) => e.id !== id));
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('data_entries')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await fetchDataEntries();
    };

    return { dataEntries, loading, error, addDataEntry, updateDataEntry, deleteDataEntry, refetch: fetchDataEntries };
}

// ============================================
// Companies Type and Hook
// ============================================
export interface CompanyData {
    id: string;
    name: string;
    logoUrl?: string;
    authorizedEmail: string;
    phone?: string;
    address?: string;
    taxId?: string;
    website?: string;
    status: 'active' | 'inactive' | 'pending';
    createdAt: string;
}

const mapCompanyFromDb = (row: Record<string, unknown>): CompanyData => ({
    id: row.id as string,
    name: row.name as string,
    logoUrl: row.logo_url as string | undefined,
    authorizedEmail: (row.authorized_email as string) || '',
    phone: row.phone as string | undefined,
    address: row.address as string | undefined,
    taxId: row.tax_id as string | undefined,
    website: row.website as string | undefined,
    status: row.status as 'active' | 'inactive' | 'pending',
    createdAt: row.created_at as string,
});

const mapCompanyToDb = (data: Partial<CompanyData>) => ({
    ...(data.name && { name: data.name }),
    ...(data.logoUrl !== undefined && { logo_url: data.logoUrl || null }),
    ...(data.authorizedEmail !== undefined && { authorized_email: data.authorizedEmail || '' }),
    ...(data.phone !== undefined && { phone: data.phone || null }),
    ...(data.address !== undefined && { address: data.address || null }),
    ...(data.taxId !== undefined && { tax_id: data.taxId || null }),
    ...(data.website !== undefined && { website: data.website || null }),
    ...(data.status && { status: data.status }),
});

export function useCompaniesSupabase() {
    const [companies, setCompanies] = useState<CompanyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCompanies = useCallback(async () => {
        if (!isSupabaseConfigured()) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error: fetchError } = await withTimeout((supabase as any)
                .from('companies')
                .select('*')
                .order('created_at', { ascending: false }));

            if (fetchError) throw fetchError;
            setCompanies((data || []).map(mapCompanyFromDb));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const addCompany = async (company: Omit<CompanyData, 'id' | 'createdAt'>) => {
        if (!isSupabaseConfigured()) {
            const newCompany: CompanyData = {
                id: Date.now().toString(),
                ...company,
                createdAt: new Date().toISOString(),
            };
            setCompanies((prev) => [newCompany, ...prev]);
            return newCompany;
        }

        const dbData = mapCompanyToDb(company);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('companies')
            .insert(dbData)
            .select()
            .single();

        if (error) throw error;
        await fetchCompanies();
        return mapCompanyFromDb(data);
    };

    const updateCompany = async (id: string, updates: Partial<CompanyData>) => {
        if (!isSupabaseConfigured()) {
            setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
            return;
        }

        const dbData = mapCompanyToDb(updates);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('companies')
            .update(dbData)
            .eq('id', id);

        if (error) throw error;
        await fetchCompanies();
    };

    const deleteCompany = async (id: string) => {
        if (!isSupabaseConfigured()) {
            setCompanies((prev) => prev.filter((c) => c.id !== id));
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('companies')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await fetchCompanies();
    };

    return { companies, loading, error, addCompany, updateCompany, deleteCompany, refetch: fetchCompanies };
}
