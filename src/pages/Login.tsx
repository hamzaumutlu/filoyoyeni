import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Giriş başarısız');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[var(--color-accent-orange)] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[var(--color-accent-orange)]/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[var(--color-accent-orange)]/10 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-orange mb-6 shadow-lg shadow-[var(--color-accent-orange)]/30"
                    >
                        <Car className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white mb-2">Filoyo</h1>
                    <p className="text-[var(--color-text-secondary)]">
                        Rent-a-Car B2B CRM & Financial Tracking
                    </p>
                </div>

                {/* Login Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-[var(--color-bg-card)] backdrop-blur-xl rounded-2xl border border-[var(--color-border-glass)] p-8 shadow-xl"
                >
                    <h2 className="text-xl font-semibold text-white mb-6">Giriş Yap</h2>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-[var(--color-accent-red)]/10 border border-[var(--color-accent-red)]/30 text-[var(--color-accent-red)]"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div>
                            <label className="block text-[var(--color-text-secondary)] text-sm font-medium mb-2">
                                E-posta
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ornek@firma.com"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] text-white border border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)] focus:ring-2 focus:ring-[var(--color-accent-orange)]/20 transition-all outline-none placeholder:text-[var(--color-text-muted)]"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-[var(--color-text-secondary)] text-sm font-medium mb-2">
                                Şifre
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-4 py-3 pr-12 rounded-xl bg-[var(--color-bg-secondary)] text-white border border-[var(--color-border-glass)] focus:border-[var(--color-accent-orange)] focus:ring-2 focus:ring-[var(--color-accent-orange)]/20 transition-all outline-none placeholder:text-[var(--color-text-muted)]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--color-text-muted)] hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-4 rounded-xl gradient-orange text-white font-semibold hover:shadow-lg hover:shadow-[var(--color-accent-orange)]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Giriş yapılıyor...
                                </>
                            ) : (
                                'Giriş Yap'
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 pt-6 border-t border-[var(--color-border-glass)]">
                        <p className="text-[var(--color-text-muted)] text-xs text-center mb-3">Demo Giriş Bilgileri</p>
                        <div className="bg-[var(--color-bg-secondary)] rounded-xl p-3 text-center">
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                <span className="text-white font-medium">E-posta:</span> admin@filoyo.com
                            </p>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                <span className="text-white font-medium">Şifre:</span> admin123
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <p className="text-center text-[var(--color-text-muted)] text-sm mt-6">
                    © 2026 Filoyo. Tüm hakları saklıdır.
                </p>
            </motion.div>
        </div>
    );
}
