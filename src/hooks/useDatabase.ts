import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Company, Personnel, Advance, Method, DataEntry, Payment } from '../lib/database.types';

// ============================================
// Generic Hook for Supabase Data
// ============================================
function useSupabaseData<T>(
    tableName: string,
    initialData: T[]
) {
    const [data, setData] = useState<T[]>(initialData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!isSupabaseConfigured()) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data: result, error: fetchError } = await supabase
                .from(tableName)
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setData((result as T[]) || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [tableName]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, setData, loading, error, refetch: fetchData };
}

// ============================================
// Companies Hook
// ============================================
export function useCompanies(mockData: Company[] = []) {
    const { data, setData, loading, error, refetch } = useSupabaseData<Company>('companies', mockData);

    const addCompany = async (company: Omit<Company, 'id' | 'created_at'>) => {
        if (!isSupabaseConfigured()) {
            const newCompany: Company = {
                id: Date.now().toString(),
                ...company,
                created_at: new Date().toISOString(),
            };
            setData((prev) => [newCompany, ...prev]);
            return newCompany;
        }

        const { data: result, error } = await supabase
            .from('companies')
            .insert(company)
            .select()
            .single();

        if (error) throw error;
        await refetch();
        return result;
    };

    const updateCompany = async (id: string, updates: Partial<Company>) => {
        if (!isSupabaseConfigured()) {
            setData((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
            return;
        }

        const { error } = await supabase.from('companies').update(updates).eq('id', id);
        if (error) throw error;
        await refetch();
    };

    const deleteCompany = async (id: string) => {
        if (!isSupabaseConfigured()) {
            setData((prev) => prev.filter((c) => c.id !== id));
            return;
        }

        const { error } = await supabase.from('companies').delete().eq('id', id);
        if (error) throw error;
        await refetch();
    };

    return { companies: data, loading, error, addCompany, updateCompany, deleteCompany, refetch };
}

// ============================================
// Personnel Hook
// ============================================
export function usePersonnel(mockData: Personnel[] = []) {
    const { data, setData, loading, error, refetch } = useSupabaseData<Personnel>('personnel', mockData);

    const addPersonnel = async (personnel: Omit<Personnel, 'id' | 'created_at'>) => {
        if (!isSupabaseConfigured()) {
            const newPersonnel: Personnel = {
                id: Date.now().toString(),
                ...personnel,
                created_at: new Date().toISOString(),
            };
            setData((prev) => [newPersonnel, ...prev]);
            return newPersonnel;
        }

        const { data: result, error } = await supabase
            .from('personnel')
            .insert(personnel)
            .select()
            .single();

        if (error) throw error;
        await refetch();
        return result;
    };

    const updatePersonnel = async (id: string, updates: Partial<Personnel>) => {
        if (!isSupabaseConfigured()) {
            setData((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
            return;
        }

        const { error } = await supabase.from('personnel').update(updates).eq('id', id);
        if (error) throw error;
        await refetch();
    };

    const deletePersonnel = async (id: string) => {
        if (!isSupabaseConfigured()) {
            setData((prev) => prev.filter((p) => p.id !== id));
            return;
        }

        const { error } = await supabase.from('personnel').delete().eq('id', id);
        if (error) throw error;
        await refetch();
    };

    return { personnel: data, loading, error, addPersonnel, updatePersonnel, deletePersonnel, refetch };
}

// ============================================
// Advances Hook
// ============================================
export function useAdvances(mockData: Advance[] = []) {
    const { data, setData, loading, error, refetch } = useSupabaseData<Advance>('advances', mockData);

    const addAdvance = async (advance: Omit<Advance, 'id' | 'created_at'>) => {
        if (!isSupabaseConfigured()) {
            const newAdvance: Advance = {
                id: Date.now().toString(),
                ...advance,
                created_at: new Date().toISOString(),
            };
            setData((prev) => [newAdvance, ...prev]);
            return newAdvance;
        }

        const { data: result, error } = await supabase
            .from('advances')
            .insert(advance)
            .select()
            .single();

        if (error) throw error;
        await refetch();
        return result;
    };

    const deleteAdvance = async (id: string) => {
        if (!isSupabaseConfigured()) {
            setData((prev) => prev.filter((a) => a.id !== id));
            return;
        }

        const { error } = await supabase.from('advances').delete().eq('id', id);
        if (error) throw error;
        await refetch();
    };

    return { advances: data, loading, error, addAdvance, deleteAdvance, refetch };
}

// ============================================
// Methods Hook
// ============================================
export function useMethods(mockData: Method[] = []) {
    const { data, setData, loading, error, refetch } = useSupabaseData<Method>('methods', mockData);

    const addMethod = async (method: Omit<Method, 'id' | 'created_at'>) => {
        if (!isSupabaseConfigured()) {
            const newMethod: Method = {
                id: Date.now().toString(),
                ...method,
                created_at: new Date().toISOString(),
            };
            setData((prev) => [newMethod, ...prev]);
            return newMethod;
        }

        const { data: result, error } = await supabase
            .from('methods')
            .insert(method)
            .select()
            .single();

        if (error) throw error;
        await refetch();
        return result;
    };

    const updateMethod = async (id: string, updates: Partial<Method>) => {
        if (!isSupabaseConfigured()) {
            setData((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
            return;
        }

        const { error } = await supabase.from('methods').update(updates).eq('id', id);
        if (error) throw error;
        await refetch();
    };

    const deleteMethod = async (id: string) => {
        if (!isSupabaseConfigured()) {
            setData((prev) => prev.filter((m) => m.id !== id));
            return;
        }

        const { error } = await supabase.from('methods').delete().eq('id', id);
        if (error) throw error;
        await refetch();
    };

    return { methods: data, loading, error, addMethod, updateMethod, deleteMethod, refetch };
}

// ============================================
// Data Entries Hook
// ============================================
export function useDataEntries(methodId: string | null, mockData: DataEntry[] = []) {
    const [data, setData] = useState<DataEntry[]>(mockData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!isSupabaseConfigured() || !methodId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data: result, error: fetchError } = await supabase
                .from('data_entries')
                .select('*')
                .eq('method_id', methodId)
                .order('date', { ascending: false });

            if (fetchError) throw fetchError;
            setData(result || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [methodId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addEntry = async (entry: Omit<DataEntry, 'id' | 'created_at' | 'updated_at'>) => {
        if (!isSupabaseConfigured()) {
            const newEntry: DataEntry = {
                id: Date.now().toString(),
                ...entry,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            setData((prev) => [newEntry, ...prev]);
            return newEntry;
        }

        const { data: result, error } = await supabase
            .from('data_entries')
            .insert(entry)
            .select()
            .single();

        if (error) throw error;
        await fetchData();
        return result;
    };

    const updateEntry = async (id: string, updates: Partial<DataEntry>) => {
        if (!isSupabaseConfigured()) {
            setData((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
            return;
        }

        const { error } = await supabase.from('data_entries').update(updates).eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const deleteEntry = async (id: string) => {
        if (!isSupabaseConfigured()) {
            setData((prev) => prev.filter((e) => e.id !== id));
            return;
        }

        const { error } = await supabase.from('data_entries').delete().eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    return { entries: data, setEntries: setData, loading, error, addEntry, updateEntry, deleteEntry, refetch: fetchData };
}

// ============================================
// Payments Hook
// ============================================
export function usePayments(mockData: Payment[] = []) {
    const { data, setData, loading, error, refetch } = useSupabaseData<Payment>('payments', mockData);

    const addPayment = async (payment: Omit<Payment, 'id' | 'created_at'>) => {
        if (!isSupabaseConfigured()) {
            const newPayment: Payment = {
                id: Date.now().toString(),
                ...payment,
                created_at: new Date().toISOString(),
            };
            setData((prev) => [newPayment, ...prev]);
            return newPayment;
        }

        const { data: result, error } = await supabase
            .from('payments')
            .insert(payment)
            .select()
            .single();

        if (error) throw error;
        await refetch();
        return result;
    };

    const updatePayment = async (id: string, updates: Partial<Payment>) => {
        if (!isSupabaseConfigured()) {
            setData((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
            return;
        }

        const { error } = await supabase.from('payments').update(updates).eq('id', id);
        if (error) throw error;
        await refetch();
    };

    const deletePayment = async (id: string) => {
        if (!isSupabaseConfigured()) {
            setData((prev) => prev.filter((p) => p.id !== id));
            return;
        }

        const { error } = await supabase.from('payments').delete().eq('id', id);
        if (error) throw error;
        await refetch();
    };

    return { payments: data, loading, error, addPayment, updatePayment, deletePayment, refetch };
}
