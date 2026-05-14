import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { ScannerPage } from './pages/ScannerPage';
import { OrdensServicoPage } from './pages/OrdensServicoPage';
import { NotasFiscaisPage } from './pages/NotasFiscaisPage';
import { ProdutosPage } from './pages/ProdutosPage';

function AppShell() {
  const { usuario } = useApp();

  if (!usuario) return <LoginPage />;

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scanner" element={<ScannerPage />} />
            <Route path="/ordens-servico" element={<OrdensServicoPage />} />
            <Route path="/notas-fiscais" element={<NotasFiscaisPage />} />
            <Route path="/produtos" element={<ProdutosPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
