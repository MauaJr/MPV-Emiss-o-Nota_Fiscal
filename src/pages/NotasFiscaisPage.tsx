import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { gerarId } from '../utils/conferencia';
import { ItemNF, Produto, TipoNF } from '../types';

export function NotasFiscaisPage() {
  const { notasFiscais, addNotaFiscal, produtos, abrirOS, ordensServico } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [numero, setNumero] = useState('');
  const [tipo, setTipo] = useState<TipoNF>('ENTRADA');
  const [emitente, setEmitente] = useState('');
  const [dataEmissao, setDataEmissao] = useState(new Date().toISOString().slice(0, 10));
  const [itens, setItens] = useState<{ produtoId: string; quantidade: number }[]>([
    { produtoId: '', quantidade: 1 },
  ]);

  const statusConfig: Record<string, { label: string; class: string }> = {
    PENDENTE: { label: '⚪ Pendente', class: 'gray' },
    CONFERIDA: { label: '✅ Conferida', class: 'green' },
    DIVERGENTE: { label: '❌ Divergente', class: 'red' },
  };

  const addItem = () => setItens((p) => [...p, { produtoId: '', quantidade: 1 }]);
  const removeItem = (i: number) => setItens((p) => p.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: 'produtoId' | 'quantidade', val: string | number) => {
    setItens((p) => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  };

  const handleSalvar = () => {
    if (!numero || !emitente || itens.some((i) => !i.produtoId)) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const itensNF: ItemNF[] = itens.map((item) => {
      const produto = produtos.find((p) => p.id === item.produtoId)!;
      return {
        id: gerarId(),
        produtoId: item.produtoId,
        produto,
        quantidade: item.quantidade,
      };
    });

    addNotaFiscal({ numero, tipo, emitente, dataEmissao, itens: itensNF });
    setShowModal(false);
    setNumero(''); setEmitente(''); setItens([{ produtoId: '', quantidade: 1 }]);
  };

  const temOS = (nfId: string) => ordensServico.some((os) => os.nfId === nfId);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Notas Fiscais</h1>
            <p>Cadastre e gerencie as NFs de entrada e saída</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Nova NF
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Tipo</th>
              <th>Emitente</th>
              <th>Data Emissão</th>
              <th>Itens</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {notasFiscais.slice().reverse().map((nf) => (
              <React.Fragment key={nf.id}>
                <tr>
                  <td style={{ fontWeight: 700 }}>{nf.numero}</td>
                  <td>
                    <span className={`badge ${nf.tipo === 'ENTRADA' ? 'blue' : 'orange'}`}>
                      {nf.tipo === 'ENTRADA' ? '↓ Entrada' : '↑ Saída'}
                    </span>
                  </td>
                  <td>{nf.emitente}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {new Date(nf.dataEmissao).toLocaleDateString('pt-BR')}
                  </td>
                  <td>
                    <span style={{ fontSize: 12 }}>{nf.itens.length} produto(s)</span>
                  </td>
                  <td>
                    <span className={`badge ${statusConfig[nf.status]?.class || 'gray'}`}>
                      {statusConfig[nf.status]?.label || nf.status}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setExpandedId(expandedId === nf.id ? null : nf.id)}
                    >
                      {expandedId === nf.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      Itens
                    </button>
                    {!temOS(nf.id) && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => abrirOS(nf.id)}
                      >
                        + OS
                      </button>
                    )}
                  </td>
                </tr>
                {expandedId === nf.id && (
                  <tr>
                    <td colSpan={7} style={{ padding: 0 }}>
                      <div style={{ padding: '12px 20px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-light)' }}>
                        <table style={{ width: '100%' }}>
                          <thead>
                            <tr>
                              <th style={{ padding: '6px 12px' }}>SKU</th>
                              <th style={{ padding: '6px 12px' }}>Produto</th>
                              <th style={{ padding: '6px 12px' }}>Qtd NF</th>
                              <th style={{ padding: '6px 12px' }}>Unidade</th>
                            </tr>
                          </thead>
                          <tbody>
                            {nf.itens.map((item) => (
                              <tr key={item.id}>
                                <td style={{ padding: '6px 12px', fontFamily: 'monospace', fontSize: 11 }}>{item.produto.sku}</td>
                                <td style={{ padding: '6px 12px', fontWeight: 500 }}>{item.produto.nome}</td>
                                <td style={{ padding: '6px 12px', fontWeight: 700 }}>{item.quantidade}</td>
                                <td style={{ padding: '6px 12px', color: 'var(--text-secondary)' }}>{item.produto.unidade}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Nova NF */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FileText size={16} style={{ display: 'inline', marginRight: 8 }} />Nova Nota Fiscal</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Número da NF *</label>
                  <input className="form-input" placeholder="NF-000001" value={numero} onChange={(e) => setNumero(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo *</label>
                  <select className="form-input" value={tipo} onChange={(e) => setTipo(e.target.value as TipoNF)}>
                    <option value="ENTRADA">↓ Entrada</option>
                    <option value="SAIDA">↑ Saída</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Emitente *</label>
                  <input className="form-input" placeholder="Razão social do fornecedor" value={emitente} onChange={(e) => setEmitente(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Data de Emissão</label>
                  <input className="form-input" type="date" value={dataEmissao} onChange={(e) => setDataEmissao(e.target.value)} />
                </div>
              </div>

              {/* Itens */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className="form-label">Itens da NF</label>
                  <button className="btn btn-secondary btn-sm" onClick={addItem}><Plus size={12} /> Item</button>
                </div>
                {itens.map((item, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 32px', gap: 8, marginBottom: 8 }}>
                    <select className="form-input" value={item.produtoId} onChange={(e) => updateItem(i, 'produtoId', e.target.value)}>
                      <option value="">— Produto —</option>
                      {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome} ({p.sku})</option>)}
                    </select>
                    <input
                      className="form-input"
                      type="number"
                      min={1}
                      value={item.quantidade}
                      onChange={(e) => updateItem(i, 'quantidade', Number(e.target.value))}
                      placeholder="Qtd"
                    />
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeItem(i)}
                      disabled={itens.length === 1}
                      style={{ padding: '6px 8px' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSalvar}>Salvar NF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
