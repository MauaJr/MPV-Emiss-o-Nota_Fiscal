import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { calcularConferencia, formatarData } from '../utils/conferencia';
import { ClipboardList, ScanBarcode, Plus, Eye, CheckCircle } from 'lucide-react';

export function OrdensServicoPage() {
  const { ordensServico, notasFiscais, abrirOS } = useApp();
  const navigate = useNavigate();
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [novaOsNfId, setNovaOsNfId] = useState('');
  const [showNovaOS, setShowNovaOS] = useState(false);

  const statusConfig: Record<string, { label: string; class: string }> = {
    CONCLUIDA: { label: '✅ Concluída', class: 'green' },
    EM_ANDAMENTO: { label: '⏳ Em andamento', class: 'yellow' },
    PENDENTE: { label: '⚪ Pendente', class: 'gray' },
  };

  const nfsSemOS = notasFiscais.filter(
    (nf) => !ordensServico.find((os) => os.nfId === nf.id)
  );

  const filtradas = ordensServico.filter((os) => {
    if (filtroStatus !== 'TODOS' && os.status !== filtroStatus) return false;
    if (filtroTipo !== 'TODOS' && os.nf.tipo !== filtroTipo) return false;
    return true;
  });

  const handleAbrirOS = () => {
    if (!novaOsNfId) return;
    abrirOS(novaOsNfId);
    setNovaOsNfId('');
    setShowNovaOS(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Ordens de Serviço</h1>
            <p>Gerencie e acompanhe todas as OSs de entrada e saída</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowNovaOS(true)}>
            <Plus size={15} /> Nova OS
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {['TODOS', 'PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA'].map((s) => (
          <button
            key={s}
            className={`btn btn-sm ${filtroStatus === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFiltroStatus(s)}
          >
            {s === 'TODOS' ? 'Todos' : statusConfig[s]?.label}
          </button>
        ))}
        <div style={{ marginLeft: 8, display: 'flex', gap: 8 }}>
          {['TODOS', 'ENTRADA', 'SAIDA'].map((t) => (
            <button
              key={t}
              className={`btn btn-sm ${filtroTipo === t ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFiltroTipo(t)}
            >
              {t === 'TODOS' ? 'Entrada + Saída' : t === 'ENTRADA' ? '↓ Entrada' : '↑ Saída'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>OS</th>
              <th>Nota Fiscal</th>
              <th>Tipo</th>
              <th>Emitente</th>
              <th>Responsável</th>
              <th>Status</th>
              <th>Progresso</th>
              <th>Resultado</th>
              <th>Abertura</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  Nenhuma OS encontrada com os filtros selecionados
                </td>
              </tr>
            ) : (
              filtradas.slice().reverse().map((os) => {
                const totalItensNF = os.nf.itens.reduce((s, i) => s + i.quantidade, 0);
                const pct = totalItensNF > 0 ? Math.min(100, Math.round((os.scans.length / totalItensNF) * 100)) : 0;
                const cfg = statusConfig[os.status];
                const resultado = calcularConferencia(os.nf.itens, os.scans);

                return (
                  <tr key={os.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700 }}>
                      #{os.id.slice(-6).toUpperCase()}
                    </td>
                    <td style={{ fontWeight: 600 }}>{os.nf.numero}</td>
                    <td>
                      <span className={`badge ${os.nf.tipo === 'ENTRADA' ? 'blue' : 'orange'}`}>
                        {os.nf.tipo === 'ENTRADA' ? '↓ Entrada' : '↑ Saída'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {os.nf.emitente}
                    </td>
                    <td>{os.responsavel}</td>
                    <td><span className={`badge ${cfg.class}`}>{cfg.label}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
                        <div className="progress-bar-wrap">
                          <div
                            className={`progress-bar-fill ${pct === 100 ? 'green' : pct > 0 ? 'yellow' : 'blue'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)', width: 40 }}>
                          {os.scans.length}/{totalItensNF}
                        </span>
                      </div>
                    </td>
                    <td>
                      {os.scans.length > 0 ? (
                        <span className={`badge ${resultado.status === 'OK' ? 'green' : 'red'}`}>
                          {resultado.status === 'OK' ? '✅ OK' : '❌ Divergente'}
                        </span>
                      ) : (
                        <span className="badge gray">—</span>
                      )}
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{formatarData(os.abertaEm)}</td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/scanner?os=${os.id}`)}
                        style={{ gap: 5 }}
                      >
                        <ScanBarcode size={13} />
                        {os.status === 'CONCLUIDA' ? <><Eye size={13} /> Ver</> : 'Escanear'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Nova OS */}
      {showNovaOS && (
        <div className="modal-overlay" onClick={() => setShowNovaOS(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><ClipboardList size={16} style={{ display: 'inline', marginRight: 8 }} />Nova Ordem de Serviço</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowNovaOS(false)}>✕</button>
            </div>

            <div className="form-group">
              <label className="form-label">Nota Fiscal</label>
              <select
                className="form-input"
                value={novaOsNfId}
                onChange={(e) => setNovaOsNfId(e.target.value)}
              >
                <option value="">— Selecionar NF —</option>
                {nfsSemOS.map((nf) => (
                  <option key={nf.id} value={nf.id}>
                    {nf.numero} · {nf.tipo} · {nf.emitente}
                  </option>
                ))}
              </select>
              {nfsSemOS.length === 0 && (
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Todas as NFs já possuem OS vinculada.
                </span>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowNovaOS(false)}>Cancelar</button>
              <button
                className="btn btn-primary"
                onClick={handleAbrirOS}
                disabled={!novaOsNfId}
              >
                <CheckCircle size={14} /> Abrir OS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
