import React from 'react';
import { ResultadoConferencia } from '../types';
import { CheckCircle, AlertTriangle, XCircle, AlertCircle } from 'lucide-react';

interface Props {
  resultado: ResultadoConferencia;
}

export function ConferenciaResult({ resultado }: Props) {
  const { itensOk, faltando, sobrando, naoEsperados, status } = resultado;
  const total = itensOk.length + faltando.length + sobrando.length + naoEsperados.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Status geral */}
      <div style={{
        padding: '14px 18px',
        borderRadius: 'var(--radius)',
        background: status === 'OK' ? 'var(--green-light)' : 'var(--red-light)',
        border: `1px solid ${status === 'OK' ? 'var(--green-border)' : 'var(--red-border)'}`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontWeight: 700,
        color: status === 'OK' ? '#4ade80' : '#f87171',
      }}>
        {status === 'OK'
          ? <><CheckCircle size={18} /> Conferência OK — Todos os itens conferem com a NF</>
          : <><XCircle size={18} /> Divergência detectada — Verifique os itens abaixo</>
        }
        <span style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.8, fontWeight: 500 }}>
          {itensOk.length}/{total} ok
        </span>
      </div>

      {/* Itens OK */}
      {itensOk.length > 0 && (
        <div className="conferencia-section">
          <div className="conf-header ok">
            <CheckCircle size={13} /> Corretos ({itensOk.length})
          </div>
          {itensOk.map((item) => (
            <div key={item.produto.id} className="conf-row">
              <span className="conf-row-name">{item.produto.nome}</span>
              <div className="conf-row-qty">
                <div><div className="conf-qty-label">NF</div><div className="conf-qty-val">{item.qtdNF}</div></div>
                <div><div className="conf-qty-label">Lido</div><div className="conf-qty-val ok">{item.qtdLida}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Faltando */}
      {faltando.length > 0 && (
        <div className="conferencia-section">
          <div className="conf-header err">
            <XCircle size={13} /> Faltando ({faltando.length})
          </div>
          {faltando.map((item) => (
            <div key={item.produto.id} className="conf-row">
              <span className="conf-row-name">{item.produto.nome}</span>
              <div className="conf-row-qty">
                <div><div className="conf-qty-label">NF</div><div className="conf-qty-val">{item.qtdNF}</div></div>
                <div><div className="conf-qty-label">Lido</div><div className="conf-qty-val err">{item.qtdLida}</div></div>
                <div><div className="conf-qty-label">Faltam</div><div className="conf-qty-val err">{item.qtdNF - item.qtdLida}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sobrando */}
      {sobrando.length > 0 && (
        <div className="conferencia-section">
          <div className="conf-header warn">
            <AlertTriangle size={13} /> Sobrando ({sobrando.length})
          </div>
          {sobrando.map((item) => (
            <div key={item.produto.id} className="conf-row">
              <span className="conf-row-name">{item.produto.nome}</span>
              <div className="conf-row-qty">
                <div><div className="conf-qty-label">NF</div><div className="conf-qty-val">{item.qtdNF}</div></div>
                <div><div className="conf-qty-label">Lido</div><div className="conf-qty-val warn">{item.qtdLida}</div></div>
                <div><div className="conf-qty-label">Sobram</div><div className="conf-qty-val warn">+{item.diferenca}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Não esperados */}
      {naoEsperados.length > 0 && (
        <div className="conferencia-section">
          <div className="conf-header orange">
            <AlertCircle size={13} /> Não esperados ({naoEsperados.length})
          </div>
          {naoEsperados.map((item) => (
            <div key={item.produto.id} className="conf-row">
              <span className="conf-row-name">{item.produto.nome}</span>
              <div className="conf-row-qty">
                <div><div className="conf-qty-label">NF</div><div className="conf-qty-val">—</div></div>
                <div><div className="conf-qty-label">Lido</div><div className="conf-qty-val orange">{item.qtdLida}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
