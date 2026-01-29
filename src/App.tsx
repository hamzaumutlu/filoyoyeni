import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/companies" element={<PlaceholderPage title="Firmalar" />} />
        <Route path="/personnel" element={<PlaceholderPage title="Personel" />} />
        <Route path="/methods" element={<PlaceholderPage title="Yöntemler" />} />
        <Route path="/data-entry" element={<PlaceholderPage title="Veri Girişi" />} />
        <Route path="/payments" element={<PlaceholderPage title="Ödemeler" />} />
        <Route path="/settings" element={<PlaceholderPage title="Ayarlar" />} />
      </Routes>
    </BrowserRouter>
  );
}

// Placeholder component for other pages
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
