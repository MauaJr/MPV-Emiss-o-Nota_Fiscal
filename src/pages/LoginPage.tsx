import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ScanBarcode } from 'lucide-react';

export function LoginPage() {
  const { setUsuario } = useApp();
  const [nome, setNome] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setError('Informe seu nome para continuar.');
      return;
    }
    setUsuario(nome.trim());
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      padding: '16px',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        pointerEvents: 'none',
      }} />

      {/* Glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        animation: 'slideUp 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, var(--accent), var(--purple))',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 30,
          }}>
            <ScanBarcode size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>NF Scanner</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
            Sistema de Conferência Logística
          </p>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '12px 14px',
          marginBottom: '24px',
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 18 }}>ℹ️</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Modo demonstração</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              Não é necessário senha. Os dados são mockados e ficam em memória.
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Seu nome (operador)</label>
            <input
              className="form-input"
              placeholder="Ex: Carlos Mendes"
              value={nome}
              onChange={(e) => { setNome(e.target.value); setError(''); }}
              autoFocus
            />
            {error && <span style={{ fontSize: 12, color: '#f87171' }}>{error}</span>}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            Entrar no sistema
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Mauá Jr. · MVP Conferência Logística
          </span>
        </div>
      </div>
    </div>
  );
}
