// ============================================
// Supabase Database Types
// Generated based on schema design
// ============================================

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            companies: {
                Row: {
                    id: string;
                    name: string;
                    logo_url: string | null;
                    status: 'active' | 'inactive' | 'pending';
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    logo_url?: string | null;
                    status?: 'active' | 'inactive' | 'pending';
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    logo_url?: string | null;
                    status?: 'active' | 'inactive' | 'pending';
                    created_at?: string;
                };
            };
            users: {
                Row: {
                    id: string;
                    company_id: string;
                    email: string;
                    role: 'super_admin' | 'admin' | 'user';
                    created_at: string;
                };
                Insert: {
                    id: string;
                    company_id: string;
                    email: string;
                    role?: 'super_admin' | 'admin' | 'user';
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    company_id?: string;
                    email?: string;
                    role?: 'super_admin' | 'admin' | 'user';
                    created_at?: string;
                };
            };
            personnel: {
                Row: {
                    id: string;
                    company_id: string;
                    name: string;
                    department: string;
                    base_salary: number;
                    start_date: string;
                    note: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    company_id: string;
                    name: string;
                    department: string;
                    base_salary: number;
                    start_date: string;
                    note?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    company_id?: string;
                    name?: string;
                    department?: string;
                    base_salary?: number;
                    start_date?: string;
                    note?: string | null;
                    created_at?: string;
                };
            };
            advances: {
                Row: {
                    id: string;
                    personnel_id: string;
                    company_id: string;
                    amount: number;
                    date: string;
                    description: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    personnel_id: string;
                    company_id: string;
                    amount: number;
                    date: string;
                    description?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    personnel_id?: string;
                    company_id?: string;
                    amount?: number;
                    date?: string;
                    description?: string | null;
                    created_at?: string;
                };
            };
            methods: {
                Row: {
                    id: string;
                    company_id: string;
                    name: string;
                    entry_commission: number;
                    exit_commission: number;
                    delivery_commission: number;
                    opening_balance: number;
                    group_chat_link: string | null;
                    status: 'active' | 'inactive';
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    company_id: string;
                    name: string;
                    entry_commission?: number;
                    exit_commission?: number;
                    delivery_commission?: number;
                    opening_balance?: number;
                    group_chat_link?: string | null;
                    status?: 'active' | 'inactive';
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    company_id?: string;
                    name?: string;
                    entry_commission?: number;
                    exit_commission?: number;
                    delivery_commission?: number;
                    opening_balance?: number;
                    group_chat_link?: string | null;
                    status?: 'active' | 'inactive';
                    created_at?: string;
                };
            };
            data_entries: {
                Row: {
                    id: string;
                    method_id: string;
                    company_id: string;
                    date: string;
                    supplement: number;
                    entry: number;
                    exit: number;
                    commission: number;
                    payment: number;
                    delivery: number;
                    description: string | null;
                    balance: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    method_id: string;
                    company_id: string;
                    date: string;
                    supplement?: number;
                    entry?: number;
                    exit?: number;
                    commission?: number;
                    payment?: number;
                    delivery?: number;
                    description?: string | null;
                    balance?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    method_id?: string;
                    company_id?: string;
                    date?: string;
                    supplement?: number;
                    entry?: number;
                    exit?: number;
                    commission?: number;
                    payment?: number;
                    delivery?: number;
                    description?: string | null;
                    balance?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            payments: {
                Row: {
                    id: string;
                    company_id: string;
                    method_id: string | null;
                    date: string;
                    description: string;
                    amount: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    company_id: string;
                    method_id?: string | null;
                    date: string;
                    description: string;
                    amount: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    company_id?: string;
                    method_id?: string | null;
                    date?: string;
                    description?: string;
                    amount?: number;
                    created_at?: string;
                };
            };
            activities: {
                Row: {
                    id: string;
                    company_id: string;
                    activity: string;
                    order_id: string | null;
                    date: string;
                    time: string;
                    amount: number;
                    status: 'Tamamlandı' | 'Beklemede' | 'İptal';
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    company_id: string;
                    activity: string;
                    order_id?: string | null;
                    date: string;
                    time: string;
                    amount: number;
                    status?: 'Tamamlandı' | 'Beklemede' | 'İptal';
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    company_id?: string;
                    activity?: string;
                    order_id?: string | null;
                    date?: string;
                    time?: string;
                    amount?: number;
                    status?: 'Tamamlandı' | 'Beklemede' | 'İptal';
                    created_at?: string;
                };
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
    };
}

// Convenience type aliases
export type Company = Database['public']['Tables']['companies']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
export type Personnel = Database['public']['Tables']['personnel']['Row'];
export type Advance = Database['public']['Tables']['advances']['Row'];
export type Method = Database['public']['Tables']['methods']['Row'];
export type DataEntry = Database['public']['Tables']['data_entries']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type Activity = Database['public']['Tables']['activities']['Row'];
