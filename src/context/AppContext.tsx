import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Produto, NotaFiscal, OrdemServico, ScanLog, StatusOS } from '../types';
import { mockProdutos, mockNotasFiscais, mockOrdensServico } from '../data/mockData';
import { gerarId } from '../utils/conferencia';

interface AppContextType {
  usuario: string;
  setUsuario: (u: string) => void;
  produtos: Produto[];
  notasFiscais: NotaFiscal[];
  ordensServico: OrdemServico[];
  addProduto: (p: Omit<Produto, 'id'>) => void;
  addNotaFiscal: (nf: Omit<NotaFiscal, 'id' | 'criadoEm' | 'status'>) => void;
  registrarScan: (osId: string, sku: string) => { sucesso: boolean; mensagem: string; produto?: Produto };
  abrirOS: (nfId: string) => void;
  fecharOS: (osId: string, status: StatusOS) => void;
  getOSById: (id: string) => OrdemServico | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState(() => localStorage.getItem('nf_usuario') || '');
  const [produtos, setProdutos] = useState<Produto[]>(mockProdutos);
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscal[]>(mockNotasFiscais);
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>(mockOrdensServico);

  useEffect(() => {
    localStorage.setItem('nf_usuario', usuario);
  }, [usuario]);

  const addProduto = (p: Omit<Produto, 'id'>) => {
    const novo: Produto = { ...p, id: gerarId() };
    setProdutos((prev) => [...prev, novo]);
  };

  const addNotaFiscal = (nf: Omit<NotaFiscal, 'id' | 'criadoEm' | 'status'>) => {
    const nova: NotaFiscal = {
      ...nf,
      id: gerarId(),
      status: 'PENDENTE',
      criadoEm: new Date().toISOString(),
    };
    setNotasFiscais((prev) => [...prev, nova]);
  };

  const abrirOS = (nfId: string) => {
    const nf = notasFiscais.find((n) => n.id === nfId);
    if (!nf) return;
    const novaOS: OrdemServico = {
      id: gerarId(),
      nfId,
      nf,
      status: 'PENDENTE',
      responsavel: usuario || 'Operador',
      abertaEm: new Date().toISOString(),
      scans: [],
    };
    setOrdensServico((prev) => [...prev, novaOS]);
    setNotasFiscais((prev) =>
      prev.map((n) => (n.id === nfId ? { ...n, status: 'PENDENTE' } : n))
    );
  };

  const fecharOS = (osId: string, status: StatusOS) => {
    setOrdensServico((prev) =>
      prev.map((os) =>
        os.id === osId
          ? { ...os, status, fechadaEm: new Date().toISOString() }
          : os
      )
    );
  };

  const registrarScan = (
    osId: string,
    sku: string
  ): { sucesso: boolean; mensagem: string; produto?: Produto } => {
    const produto = produtos.find((p) => p.sku === sku);
    if (!produto) {
      return { sucesso: false, mensagem: `SKU não encontrado: ${sku}` };
    }

    const scan: ScanLog = {
      id: gerarId(),
      osId,
      produtoId: produto.id,
      produto,
      usuario: usuario || 'Operador',
      timestamp: new Date().toISOString(),
    };

    setOrdensServico((prev) =>
      prev.map((os) => {
        if (os.id !== osId) return os;
        return {
          ...os,
          status: 'EM_ANDAMENTO',
          scans: [...os.scans, scan],
        };
      })
    );

    return { sucesso: true, mensagem: `✓ ${produto.nome}`, produto };
  };

  const getOSById = (id: string) => ordensServico.find((os) => os.id === id);

  return (
    <AppContext.Provider
      value={{
        usuario, setUsuario,
        produtos, notasFiscais, ordensServico,
        addProduto, addNotaFiscal, registrarScan, abrirOS, fecharOS, getOSById,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
