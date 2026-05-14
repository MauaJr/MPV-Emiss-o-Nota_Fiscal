import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ConferenciaResult } from '../components/ConferenciaResult';
import { calcularConferencia } from '../utils/conferencia';
import { ScanBarcode, Wifi, CheckCircle, XCircle } from 'lucide-react';

type FeedbackState = 'idle' | 'ok' | 'error';

export function ScannerPage() {
  const { ordensServico, registrarScan, fecharOS } = useApp();
  const [searchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const [osId, setOsId] = useState(searchParams.get('os') || '');
  const [scanBuffer, setScanBuffer] = useState('');
  const [feedback, setFeedback] = useState<{ state: FeedbackState; msg: string }>({ state: 'idle', msg: '' });
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const osAtiva = ordensServico.find((os) => os.id === osId);
  const resultado = osAtiva ? calcularConferencia(osAtiva.nf.itens, osAtiva.scans) : null;

  // Auto-focus no input invisível
  useEffect(() => {
    inputRef.current?.focus();
  }, [osId]);

  const showFeedback = useCallback((state: FeedbackState, msg: string) => {
    setFeedback({ state, msg });
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback({ state: 'idle', msg: '' }), 2500);
  }, []);

  const handleScan = useCallback((sku: string) => {
    if (!osId) {
      showFeedback('error', 'Selecione uma OS antes de escanear.');
      return;
    }
    if (osAtiva?.status === 'CONCLUIDA') {
      showFeedback('error', 'Essa OS já está concluída.');
      return;
    }

    const result = registrarScan(osId, sku);
    setLastScanned(sku);
    if (result.sucesso) {
      showFeedback('ok', `${result.produto?.nome} — SKU: ${sku}`);
    } else {
      showFeedback('error', result.mensagem);
    }
  }, [osId, osAtiva, registrarScan, showFeedback]);

  // Captura do leitor HID (teclado virtual) ou teclado real
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const sku = scanBuffer.trim();
      if (sku) {
        handleScan(sku);
        setScanBuffer('');
      }
    }
  }, [scanBuffer, handleScan]);

  const statusConfig: Record<string, string> = {
    CONCLUIDA: 'green',
    EM_ANDAMENTO: 'yellow',
    PENDENTE: 'gray',
  };

  const statusLabel: Record<string, string> = {
    CONCLUIDA: '✅ Concluída',
    EM_ANDAMENTO: '⏳ Em andamento',
    PENDENTE: '⚪ Pendente',
  };

  return (
    <div>
      <div className="page-header">
        <h1>Scanner / Conferência</h1>
        <p>Leia os códigos de barras com o leitor e acompanhe a conferência em tempo real</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Coluna esquerda: controles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Seleção de OS */}
          <div className="card">
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Ordem de Serviço ativa
              </div>
              <select
                className="form-input"
                value={osId}
                onChange={(e) => setOsId(e.target.value)}
              >
                <option value="">— Selecionar OS —</option>
                {ordensServico
                  .filter((os) => os.status !== 'CONCLUIDA')
                  .map((os) => (
                    <option key={os.id} value={os.id}>
                      {os.nf.numero} · {os.nf.tipo === 'ENTRADA' ? '↓ Entrada' : '↑ Saída'} · {os.nf.emitente.slice(0, 24)}...
                    </option>
                  ))}
              </select>
            </div>

            {osAtiva && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>NF:</span>
                  <span style={{ fontWeight: 600 }}>{osAtiva.nf.numero}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Tipo:</span>
                  <span className={`badge ${osAtiva.nf.tipo === 'ENTRADA' ? 'blue' : 'orange'}`}>
                    {osAtiva.nf.tipo === 'ENTRADA' ? '↓ Entrada' : '↑ Saída'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Emitente:</span>
                  <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: 160 }}>{osAtiva.nf.emitente}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                  <span className={`badge ${statusConfig[osAtiva.status]}`}>{statusLabel[osAtiva.status]}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Responsável:</span>
                  <span>{osAtiva.responsavel}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Itens NF / Lidos:</span>
                  <span style={{ fontWeight: 600 }}>
                    {osAtiva.nf.itens.reduce((s, i) => s + i.quantidade, 0)} / {osAtiva.scans.length}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Zona de Scanner */}
          {osId && (
            <div
              className={`scanner-zone ${feedback.state === 'ok' ? 'success' : feedback.state === 'error' ? 'error' : 'active'}`}
              onClick={() => inputRef.current?.focus()}
            >
              <div className="scanner-icon">
                <ScanBarcode size={28} />
              </div>
              <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                Aponte o leitor aqui
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Clique para focar e leia o código de barras
              </p>

              {/* Input invisível capturando o leitor HID */}
              <input
                ref={inputRef}
                value={scanBuffer}
                onChange={(e) => setScanBuffer(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  position: 'absolute',
                  opacity: 0,
                  width: 1,
                  height: 1,
                  pointerEvents: 'none',
                }}
                readOnly={false}
              />

              {/* Input manual (digitação) */}
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <input
                  className="form-input"
                  placeholder="Digitar SKU manualmente..."
                  value={scanBuffer}
                  onChange={(e) => setScanBuffer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleScan(scanBuffer.trim());
                      setScanBuffer('');
                    }
                  }}
                  style={{ fontSize: 12 }}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => { handleScan(scanBuffer.trim()); setScanBuffer(''); }}
                  disabled={!scanBuffer.trim()}
                >
                  OK
                </button>
              </div>
            </div>
          )}

          {/* Feedback */}
          {feedback.state !== 'idle' && (
            <div className={`scan-feedback ${feedback.state === 'ok' ? 'ok' : 'err'}`}>
              {feedback.state === 'ok' ? <CheckCircle size={16} /> : <XCircle size={16} />}
              {feedback.msg}
            </div>
          )}

          {/* Ação: Fechar OS */}
          {osAtiva && osAtiva.status !== 'CONCLUIDA' && resultado && (
            <div className="card card-sm" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Conferência: <strong style={{ color: resultado.status === 'OK' ? '#4ade80' : '#f87171' }}>
                  {resultado.status}
                </strong>
              </p>
              <button
                className={`btn ${resultado.status === 'OK' ? 'btn-success' : 'btn-danger'} w-full`}
                style={{ justifyContent: 'center' }}
                onClick={() => {
                  fecharOS(osId, 'CONCLUIDA');
                  alert(`OS concluída com status: ${resultado.status}`);
                }}
              >
                {resultado.status === 'OK' ? <CheckCircle size={15} /> : <XCircle size={15} />}
                Fechar OS ({resultado.status})
              </button>
            </div>
          )}

          {/* Log de itens esperados na NF */}
          {osAtiva && (
            <div className="card card-sm">
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
                Itens na NF
              </div>
              {osAtiva.nf.itens.map((item) => {
                const qtdLida = osAtiva.scans.filter((s) => s.produtoId === item.produtoId).length;
                const ok = qtdLida >= item.quantidade;
                return (
                  <div key={item.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '6px 0', borderBottom: '1px solid var(--border-light)',
                    fontSize: 12,
                  }}>
                    <span style={{ color: 'var(--text-primary)', flex: 1 }}>{item.produto.nome}</span>
                    <span style={{
                      fontWeight: 700,
                      color: ok ? '#4ade80' : qtdLida > 0 ? '#fbbf24' : 'var(--text-muted)',
                    }}>
                      {qtdLida}/{item.quantidade}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Coluna direita: resultado */}
        <div>
          {resultado ? (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Wifi size={16} style={{ color: '#4ade80' }} />
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Resultado da Conferência</h3>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-secondary)' }}>
                  {osAtiva?.scans.length} leituras realizadas
                </span>
              </div>
              <ConferenciaResult resultado={resultado} />

              {/* Log de scans */}
              {osAtiva && osAtiva.scans.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Histórico de leituras (últimas 10)
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Produto</th>
                          <th>SKU</th>
                          <th>Operador</th>
                          <th>Horário</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...osAtiva.scans].reverse().slice(0, 10).map((scan, i) => (
                          <tr key={scan.id}>
                            <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{osAtiva.scans.length - i}</td>
                            <td style={{ fontWeight: 500 }}>{scan.produto.nome}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>{scan.produto.sku}</td>
                            <td style={{ fontSize: 12 }}>{scan.usuario}</td>
                            <td style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                              {new Date(scan.timestamp).toLocaleTimeString('pt-BR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, color: 'var(--text-muted)' }}>
              <ScanBarcode size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>Selecione uma OS para iniciar</p>
              <p style={{ fontSize: 13 }}>O resultado da conferência aparecerá aqui em tempo real</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
