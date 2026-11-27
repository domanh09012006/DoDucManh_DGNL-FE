import { Navigate, Route, Routes } from 'react-router-dom';
import ProductListPage from './pages/ProductListPage.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-brand">OfficeMart Admin</span>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductListPage />} />
        </Routes>
      </main>
    </div>
  );
}
