import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  ClipboardList, CheckCircle, Clock, AlertCircle,
  TrendingUp, FileText, ArrowRight, ScanBarcode,
} from 'lucide-react';
import { formatarData } from '../utils/conferencia';

export function Dashboard() {
  const { ordensServico, notasFiscais } = useApp();
  const navigate = useNavigate();

  const totalOS = ordensServico.length;
  const concluidas = ordensServico.filter((os) => os.status === 'CONCLUIDA').length;
  const emAndamento = ordensServico.filter((os) => os.status === 'EM_ANDAMENTO').length;
  const pendentes = ordensServico.filter((os) => os.status === 'PENDENTE').length;

  const entradas = notasFiscais.filter((nf) => nf.tipo === 'ENTRADA').length;
  const saidas = notasFiscais.filter((nf) => nf.tipo === 'SAIDA').length;
  const divergentes = notasFiscais.filter((nf) => nf.status === 'DIVERGENTE').length;

  const statusConfig: Record<string, { label: string; class: string; dot: string }> = {
    CONCLUIDA: { label: 'Concluída', class: 'green', dot: '🟢' },
    EM_ANDAMENTO: { label: 'Em andamento', class: 'yellow', dot: '🟡' },
    PENDENTE: { label: 'Pendente', class: 'gray', dot: '⚪' },
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Dashboard</h1>
            <p>Visão geral das operações de conferência logística</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/scanner')}>
            <ScanBarcode size={15} />
            Iniciar Scanner
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-icon blue"><ClipboardList size={18} /></div>
          <div>
            <div className="kpi-value">{totalOS}</div>
            <div className="kpi-label">Total de OS</div>
          </div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-icon green"><CheckCircle size={18} /></div>
          <div>
            <div className="kpi-value">{concluidas}</div>
            <div className="kpi-label">OS Concluídas</div>
          </div>
        </div>
        <div className="kpi-card yellow">
          <div className="kpi-icon yellow"><Clock size={18} /></div>
          <div>
            <div className="kpi-value">{emAndamento}</div>
            <div className="kpi-label">Em andamento</div>
          </div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-icon red"><AlertCircle size={18} /></div>
          <div>
            <div className="kpi-value">{pendentes}</div>
            <div className="kpi-label">OS Pendentes</div>
          </div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-icon blue"><TrendingUp size={18} /></div>
          <div>
            <div className="kpi-value">{entradas}</div>
            <div className="kpi-label">Entradas</div>
          </div>
        </div>
        <div className="kpi-card orange">
          <div className="kpi-icon orange"><FileText size={18} /></div>
          <div>
            <div className="kpi-value">{saidas}</div>
            <div className="kpi-label">Saídas</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* OS Recentes */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Ordens de Serviço</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/ordens-servico')}>
              Ver todas <ArrowRight size={13} />
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>OS</th>
                  <th>Nota Fiscal</th>
                  <th>Tipo</th>
                  <th>Responsável</th>
                  <th>Status</th>
                  <th>Progresso</th>
                  <th>Abertura</th>
                </tr>
              </thead>
              <tbody>
                {ordensServico.slice().reverse().map((os) => {
                  const totalItensNF = os.nf.itens.reduce((s, i) => s + i.quantidade, 0);
                  const totalScans = os.scans.length;
                  const pct = totalItensNF > 0 ? Math.min(100, Math.round((totalScans / totalItensNF) * 100)) : 0;
                  const cfg = statusConfig[os.status];

                  return (
                    <tr key={os.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/scanner?os=${os.id}`)}>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>#{os.id.slice(-6).toUpperCase()}</td>
                      <td style={{ fontWeight: 600 }}>{os.nf.numero}</td>
                      <td>
                        <span className={`badge ${os.nf.tipo === 'ENTRADA' ? 'blue' : 'orange'}`}>
                          {os.nf.tipo === 'ENTRADA' ? '↓ Entrada' : '↑ Saída'}
                        </span>
                      </td>
                      <td>{os.responsavel}</td>
                      <td><span className={`badge ${cfg.class}`}>{cfg.dot} {cfg.label}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
                          <div className="progress-bar-wrap">
                            <div
                              className={`progress-bar-fill ${pct === 100 ? 'green' : pct > 0 ? 'yellow' : 'blue'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-secondary)', width: 32 }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{formatarData(os.abertaEm)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* NFs com divergência */}
        {divergentes > 0 && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#f87171', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} /> Notas com Divergência
            </h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Número</th><th>Tipo</th><th>Emitente</th><th>Data Emissão</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {notasFiscais.filter((nf) => nf.status === 'DIVERGENTE').map((nf) => (
                    <tr key={nf.id}>
                      <td style={{ fontWeight: 600 }}>{nf.numero}</td>
                      <td><span className={`badge ${nf.tipo === 'ENTRADA' ? 'blue' : 'orange'}`}>{nf.tipo}</span></td>
                      <td>{nf.emitente}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(nf.dataEmissao).toLocaleDateString('pt-BR')}</td>
                      <td><span className="badge red">❌ Divergente</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
