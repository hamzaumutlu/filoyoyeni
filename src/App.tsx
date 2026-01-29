import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Personnel from './pages/Personnel';
import Methods from './pages/Methods';
import DataEntry from './pages/DataEntry';
import Payments from './pages/Payments';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/personnel" element={<Personnel />} />
        <Route path="/methods" element={<Methods />} />
        <Route path="/data-entry" element={<DataEntry />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/settings" element={<PlaceholderPage title="Ayarlar" />} />
      </Routes>
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
