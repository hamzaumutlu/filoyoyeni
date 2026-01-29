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
    amount: row.amount as number,
    date: row.date as string,
    description: row.description as string | undefined,
    createdAt: row.created_at as string,
});

const mapAdvanceToDb = (data: Partial<AdvanceData>) => ({
    ...(data.personnelId && { personnel_id: data.personnelId }),
    ...(data.companyId && { company_id: data.companyId }),
    ...(data.amount !== undefined && { amount: data.amount }),
    ...(data.date && { date: data.date }),
    ...(data.description !== undefined && { description: data.description || null }),
});

// ============================================
// Demo Company ID (for development)
// ============================================
const DEMO_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

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
            const { data, error: fetchError } = await (supabase as any)
                .from('methods')
                .select('*')
                .order('created_at', { ascending: false });

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
            const { data, error: fetchError } = await (supabase as any)
                .from('payments')
                .select('*')
                .order('date', { ascending: false });

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
        return mapPaymentFromDb(data);
    };

    const updatePayment = async (id: string, updates: Partial<PaymentData>) => {
        if (!isSupabaseConfigured()) {
            setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
            return;
        }

        const dbData = mapPaymentToDb(updates);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('payments')
            .update(dbData)
            .eq('id', id);

        if (error) throw error;
        await fetchPayments();
    };

    const deletePayment = async (id: string) => {
        if (!isSupabaseConfigured()) {
            setPayments((prev) => prev.filter((p) => p.id !== id));
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('payments')
            .delete()
            .eq('id', id);

        if (error) throw error;
        await fetchPayments();
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
            const { data, error: fetchError } = await (supabase as any)
                .from('personnel')
                .select('*')
                .order('created_at', { ascending: false });

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
            const { data, error: fetchError } = await (supabase as any)
                .from('advances')
                .select('*')
                .order('date', { ascending: false });

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
