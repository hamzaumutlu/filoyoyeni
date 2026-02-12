import { useState, useCallback, createContext, useContext, type ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

// ============================================
// Types
// ============================================
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

// ============================================
// Toast Provider
// ============================================
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
        const id = Date.now().toString() + Math.random().toString(36).slice(2);
        setToasts(prev => [...prev, { id, type, title, message, duration }]);

        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

// ============================================
// Hook
// ============================================
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// ============================================
// Toast Container (renders all toasts)
// ============================================
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

// ============================================
// Single Toast Item
// ============================================
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const config = {
        success: {
            icon: CheckCircle,
            bg: 'bg-emerald-500/15 border-emerald-500/30',
            iconColor: 'text-emerald-400',
            titleColor: 'text-emerald-300',
        },
        error: {
            icon: AlertCircle,
            bg: 'bg-red-500/15 border-red-500/30',
            iconColor: 'text-red-400',
            titleColor: 'text-red-300',
        },
        warning: {
            icon: AlertTriangle,
            bg: 'bg-amber-500/15 border-amber-500/30',
            iconColor: 'text-amber-400',
            titleColor: 'text-amber-300',
        },
        info: {
            icon: Info,
            bg: 'bg-blue-500/15 border-blue-500/30',
            iconColor: 'text-blue-400',
            titleColor: 'text-blue-300',
        },
    }[toast.type];

    const Icon = config.icon;

    return (
        <div
            className={`
                pointer-events-auto flex items-start gap-3 p-4 rounded-xl border
                backdrop-blur-xl shadow-lg animate-slide-in
                ${config.bg}
            `}
            style={{
                animation: 'slideIn 0.3s ease-out forwards',
            }}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${config.titleColor}`}>{toast.title}</p>
                {toast.message && (
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">{toast.message}</p>
                )}
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className="text-[var(--color-text-muted)] hover:text-white transition-colors flex-shrink-0"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
