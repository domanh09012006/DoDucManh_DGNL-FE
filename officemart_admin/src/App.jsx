import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';
import ProductFormPage from './pages/ProductFormPage.jsx';
import ProductListPage from './pages/ProductListPage.jsx';

export default function App() {
  return (
    <ToastProvider>
      <div className="app-shell">
        <header className="app-header">
          <Link to="/products" className="app-brand">
            OfficeMart Admin
          </Link>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/new" element={<ProductFormPage />} />
            <Route path="/products/:id/edit" element={<ProductFormPage />} />
          </Routes>
        </main>
      </div>
    </ToastProvider>
  );
}
