import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ============================================
// Types
// ============================================
interface User {
    id: string;
    email: string;
    role: 'super_admin' | 'admin' | 'user';
    companyId: string;
    companyName?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    createUser: (email: string, password: string, role: 'admin' | 'user', companyId: string) => Promise<void>;
    isAdmin: boolean;
    isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ============================================
// Demo User for Development
// ============================================
const DEMO_USER: User = {
    id: 'demo-user-001',
    email: 'admin@filoyo.com',
    role: 'super_admin',
    companyId: '00000000-0000-0000-0000-000000000001',
    companyName: 'Filoyo Demo',
};

// ============================================
// Auth Provider Component
// ============================================
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Helper: fetch user details from users table
    const fetchUserDetails = async (authUser: { id: string; email?: string }) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: userData, error: userError } = await (supabase as any)
                .from('users')
                .select('*, companies(name)')
                .eq('id', authUser.id)
                .single();

            if (userError) {
                console.error('[Auth] Kullanıcı bilgisi hatası:', userError.message);
                return {
                    id: authUser.id,
                    email: authUser.email || '',
                    role: 'admin' as const,
                    companyId: '00000000-0000-0000-0000-000000000001',
                    companyName: 'Varsayılan',
                };
            }

            return {
                id: userData.id,
                email: userData.email,
                role: userData.role,
                companyId: userData.company_id,
                companyName: userData.companies?.name,
            };
        } catch {
            return {
                id: authUser.id,
                email: authUser.email || '',
                role: 'admin' as const,
                companyId: '00000000-0000-0000-0000-000000000001',
                companyName: 'Varsayılan',
            };
        }
    };

    // Check for existing session on mount with timeout protection
    useEffect(() => {
        let isMounted = true;

        const checkSession = async () => {
            if (!isSupabaseConfigured()) {
                // Demo mode - check localStorage
                const savedUser = localStorage.getItem('filoyo_user');
                if (savedUser && isMounted) {
                    setUser(JSON.parse(savedUser));
                }
                if (isMounted) setLoading(false);
                return;
            }

            try {
                // Add timeout to prevent infinite loading in production
                const sessionPromise = (supabase as any).auth.getSession();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Session check timeout')), 3000)
                );

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;

                if (!isMounted) return;

                if (session?.user) {
                    const userDetails = await fetchUserDetails(session.user);
                    if (isMounted) setUser(userDetails);
                } else {
                    // No session - check localStorage for demo user
                    const savedUser = localStorage.getItem('filoyo_user');
                    if (savedUser && isMounted) {
                        setUser(JSON.parse(savedUser));
                    }
                }
            } catch (err) {
                console.error('[Auth] Session check error:', err);
                if (!isMounted) return;
                // Fallback: check localStorage
                const savedUser = localStorage.getItem('filoyo_user');
                if (savedUser) {
                    setUser(JSON.parse(savedUser));
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        checkSession();

        // Listen for auth state changes (handles token refresh, sign-in/out)
        let subscription: { unsubscribe: () => void } | null = null;
        if (isSupabaseConfigured()) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data } = (supabase as any).auth.onAuthStateChange(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                async (_event: string, session: any) => {
                    if (!isMounted) return;
                    if (session?.user) {
                        const userDetails = await fetchUserDetails(session.user);
                        if (isMounted) setUser(userDetails);
                    } else {
                        // Check localStorage fallback on sign out
                        const savedUser = localStorage.getItem('filoyo_user');
                        if (savedUser && isMounted) {
                            setUser(JSON.parse(savedUser));
                        } else if (isMounted) {
                            setUser(null);
                        }
                    }
                }
            );
            subscription = data?.subscription;
        }

        return () => {
            isMounted = false;
            subscription?.unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string) => {
        setError(null);
        setLoading(true);

        try {
            // If Supabase is not configured, use demo mode
            if (!isSupabaseConfigured()) {
                console.log('[Auth] Supabase yapılandırılmamış, demo modda çalışılıyor.');
                if (email === 'admin@filoyo.com' && password === 'admin123') {
                    setUser(DEMO_USER);
                    localStorage.setItem('filoyo_user', JSON.stringify(DEMO_USER));
                } else {
                    throw new Error('Geçersiz e-posta veya şifre');
                }
                return;
            }

            console.log('[Auth] Supabase ile giriş yapılıyor...');

            // Try Supabase Auth first
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error: authError } = await (supabase as any).auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                console.error('[Auth] Supabase auth hatası:', authError.message, authError);

                // If Supabase auth fails, try demo credentials as fallback
                if (email === 'admin@filoyo.com' && password === 'admin123') {
                    console.log('[Auth] Demo kimlik bilgileri algılandı, demo moduna geçiliyor...');
                    setUser(DEMO_USER);
                    localStorage.setItem('filoyo_user', JSON.stringify(DEMO_USER));
                    return;
                }

                throw new Error('Geçersiz e-posta veya şifre. Supabase kullanıcısı bulunamadı.');
            }

            if (data.user) {
                console.log('[Auth] Supabase auth başarılı, kullanıcı bilgileri getiriliyor...');
                // Fetch user details
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: userData, error: userError } = await (supabase as any)
                    .from('users')
                    .select('*, companies(name)')
                    .eq('id', data.user.id)
                    .single();

                if (userError) {
                    console.error('[Auth] Kullanıcı bilgi sorgulama hatası:', userError.message, userError);
                    // User authenticated but no record in users table
                    // Create a fallback user from auth data
                    const fallbackUser: User = {
                        id: data.user.id,
                        email: data.user.email || email,
                        role: 'admin',
                        companyId: '00000000-0000-0000-0000-000000000001',
                        companyName: 'Varsayılan',
                    };
                    setUser(fallbackUser);
                    localStorage.setItem('filoyo_user', JSON.stringify(fallbackUser));
                    return;
                }

                const loggedInUser: User = {
                    id: userData.id,
                    email: userData.email,
                    role: userData.role,
                    companyId: userData.company_id,
                    companyName: userData.companies?.name,
                };

                setUser(loggedInUser);
                localStorage.setItem('filoyo_user', JSON.stringify(loggedInUser));
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Giriş başarısız';
            console.error('[Auth] Login hatası:', message);
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            if (isSupabaseConfigured()) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase as any).auth.signOut();
            }
            setUser(null);
            localStorage.removeItem('filoyo_user');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const createUser = async (email: string, password: string, role: 'admin' | 'user', companyId: string) => {
        if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
            throw new Error('Bu işlem için yetkiniz yok');
        }

        try {
            if (!isSupabaseConfigured()) {
                // Demo mode - just log
                console.log('Demo mode: Would create user', { email, role, companyId });
                return;
            }

            // Create auth user via Supabase Admin (requires service role key)
            // For client-side, we'll use signUp
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error: signUpError } = await (supabase as any).auth.signUp({
                email,
                password,
                options: {
                    data: {
                        role,
                        company_id: companyId,
                    }
                }
            });

            if (signUpError) throw signUpError;

            // Insert into our users table
            if (data.user) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error: insertError } = await (supabase as any)
                    .from('users')
                    .insert({
                        id: data.user.id,
                        email,
                        role,
                        company_id: companyId,
                    });

                if (insertError) throw insertError;
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Kullanıcı oluşturulamadı';
            throw new Error(message);
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        error,
        login,
        logout,
        createUser,
        isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
        isSuperAdmin: user?.role === 'super_admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// Hook to use Auth
// ============================================
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
