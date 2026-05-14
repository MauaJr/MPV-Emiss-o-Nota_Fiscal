import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Package, Plus } from 'lucide-react';

export function ProdutosPage() {
  const { produtos, addProduto } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [sku, setSku] = useState('');
  const [nome, setNome] = useState('');
  const [unidade, setUnidade] = useState('UN');

  const filtrados = produtos.filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.includes(search)
  );

  const handleSalvar = () => {
    if (!sku.trim() || !nome.trim()) {
      alert('SKU e nome são obrigatórios');
      return;
    }
    addProduto({ sku: sku.trim(), nome: nome.trim(), unidade });
    setShowModal(false);
    setSku(''); setNome(''); setUnidade('UN');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Produtos / SKUs</h1>
            <p>Cadastre os produtos e seus respectivos códigos de barras</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Novo Produto
          </button>
        </div>
      </div>

      {/* Busca */}
      <div style={{ marginBottom: 16 }}>
        <input
          className="form-input"
          style={{ maxWidth: 360 }}
          placeholder="🔍 Buscar por nome ou SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>SKU / Código de Barras</th>
              <th>Nome do Produto</th>
              <th>Unidade</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  Nenhum produto encontrado
                </td>
              </tr>
            ) : (
              filtrados.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: 13,
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 4,
                      padding: '3px 8px',
                      color: '#60a5fa',
                    }}>
                      {p.sku}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{p.nome}</td>
                  <td>
                    <span className="badge purple">{p.unidade}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Info do leitor */}
      <div style={{
        marginTop: 20,
        padding: '14px 18px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 20 }}>💡</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Como funciona o leitor de código de barras?</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            O leitor HID (estilo supermercado) funciona como um teclado — ele digita o SKU e pressiona Enter automaticamente.
            Na página de Scanner, o sistema captura esse input e identifica o produto em tempo real.
            O campo de "SKU" acima deve ser o exato código que o leitor envia.
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Package size={16} style={{ display: 'inline', marginRight: 8 }} />Novo Produto</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">SKU / Código de Barras *</label>
                <input
                  className="form-input"
                  placeholder="Ex: 7891000315507"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  autoFocus
                />
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  Pode usar o leitor de código de barras para preencher este campo
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Nome do Produto *</label>
                <input
                  className="form-input"
                  placeholder="Ex: Papel A4 Chamex 500fls"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unidade</label>
                <select className="form-input" value={unidade} onChange={(e) => setUnidade(e.target.value)}>
                  {['UN', 'CX', 'PCT', 'KG', 'RL', 'LT', 'MT', 'PAR'].map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSalvar}>Salvar Produto</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
