export type TipoNF = 'ENTRADA' | 'SAIDA';
export type StatusNF = 'PENDENTE' | 'CONFERIDA' | 'DIVERGENTE';
export type StatusOS = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';

export interface Produto {
  id: string;
  sku: string;
  nome: string;
  unidade: string;
}

export interface ItemNF {
  id: string;
  produtoId: string;
  produto: Produto;
  quantidade: number;
}

export interface NotaFiscal {
  id: string;
  numero: string;
  tipo: TipoNF;
  emitente: string;
  dataEmissao: string;
  status: StatusNF;
  itens: ItemNF[];
  criadoEm: string;
}

export interface ScanLog {
  id: string;
  osId: string;
  produtoId: string;
  produto: Produto;
  usuario: string;
  timestamp: string;
}

export interface OrdemServico {
  id: string;
  nfId: string;
  nf: NotaFiscal;
  status: StatusOS;
  scans: ScanLog[];
  responsavel: string;
  abertaEm: string;
  fechadaEm?: string;
}

export interface ItemConferencia {
  produto: Produto;
  qtdNF: number;
  qtdLida: number;
  diferenca: number;
}

export interface ResultadoConferencia {
  itensOk: ItemConferencia[];
  faltando: ItemConferencia[];
  sobrando: ItemConferencia[];
  naoEsperados: ItemConferencia[];
  status: 'OK' | 'DIVERGENTE';
}
