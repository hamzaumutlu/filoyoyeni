// ============================================
// Application Types - Filoyo CRM
// ============================================

// Company Types
export interface Company {
    id: string;
    name: string;
    logo?: string;
    status: 'active' | 'inactive' | 'pending';
    authorizedEmail: string;
    createdAt: Date;
}

// Personnel Types
export interface Personnel {
    id: string;
    name: string;
    department: string;
    baseSalary: number;
    startDate: Date;
    note?: string;
}

export interface Advance {
    id: string;
    personnelId: string;
    amount: number;
    date: Date;
    description?: string;
}

// Method Types (Channels like Yolcu360, Enuygun)
export interface Method {
    id: string;
    name: string;
    entryCommission: number;      // Giriş Komisyonu %
    exitCommission: number;       // Çıkış Komisyonu %
    deliveryCommission: number;   // Teslim Komisyonu %
    openingBalance: number;       // Devir (Transfer)
    groupChatLink?: string;       // Group Chat URL
    status: 'active' | 'inactive';
}

// Data Entry Types
export interface DataEntry {
    id: string;
    methodId: string;
    date: Date;
    supplement: number;          // Takviye
    entry: number;               // Giriş
    exit: number;                // Çıkış
    commission: number;          // Auto-calculated
    payment: number;             // Payment/Expense
    delivery: number;            // Teslim
    description?: string;
    balance: number;             // Kasa (Running total)
}

// Payment Types
export interface Payment {
    id: string;
    date: Date;
    description: string;
    amount: number;
    methodId?: string;           // Related Method (optional)
}
