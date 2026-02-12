import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Loader2 } from 'lucide-react';
import './index.css';

// Lazy load pages - only download code when navigating to them
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Companies = lazy(() => import('./pages/Companies'));
const Personnel = lazy(() => import('./pages/Personnel'));
const Methods = lazy(() => import('./pages/Methods'));
const DataEntry = lazy(() => import('./pages/DataEntry'));
const Payments = lazy(() => import('./pages/Payments'));
const Login = lazy(() => import('./pages/Login'));
const Users = lazy(() => import('./pages/Users'));

// Lightweight loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[var(--color-accent-orange)] animate-spin" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/companies"
              element={
                <ProtectedRoute>
                  <Companies />
                </ProtectedRoute>
              }
            />
            <Route
              path="/personnel"
              element={
                <ProtectedRoute>
                  <Personnel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/methods"
              element={
                <ProtectedRoute>
                  <Methods />
                </ProtectedRoute>
              }
            />
            <Route
              path="/data-entry"
              element={
                <ProtectedRoute>
                  <DataEntry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <Payments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute requireAdmin>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Ayarlar" />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Placeholder component for settings page
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        <p className="text-[var(--color-text-secondary)]">Bu sayfa yakında eklenecek...</p>
      </div>
    </div>
  );
}

export default App;
