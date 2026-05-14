import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ScanBarcode, ClipboardList,
  FileText, Package, LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', section: 'PRINCIPAL' },
  { to: '/scanner', icon: ScanBarcode, label: 'Scanner / Conferência', section: 'OPERAÇÃO' },
  { to: '/ordens-servico', icon: ClipboardList, label: 'Ordens de Serviço', section: 'OPERAÇÃO' },
  { to: '/notas-fiscais', icon: FileText, label: 'Notas Fiscais', section: 'CADASTROS' },
  { to: '/produtos', icon: Package, label: 'Produtos / SKUs', section: 'CADASTROS' },
];

export function Sidebar() {
  const { usuario, setUsuario } = useApp();
  const location = useLocation();

  const sections = [...new Set(navItems.map((n) => n.section))];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">📦</div>
        <div>
          <h2>NF Scanner</h2>
          <span>Conferência Logística</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sections.map((section) => (
          <React.Fragment key={section}>
            <div className="nav-section-label">{section}</div>
            {navItems
              .filter((n) => n.section === section)
              .map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
          </React.Fragment>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">
            {usuario ? usuario[0].toUpperCase() : '?'}
          </div>
          <div className="user-info">
            <div className="user-name">{usuario || 'Sem usuário'}</div>
            <div className="user-role">Operador</div>
          </div>
          <button
            onClick={() => setUsuario('')}
            title="Sair"
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
