import type { ItemNF, ScanLog, ResultadoConferencia, ItemConferencia, Produto } from '../types';

export function calcularConferencia(
  itensNF: ItemNF[],
  scans: ScanLog[]
): ResultadoConferencia {
  // Agrupar scans por produtoId
  const contagemScans: Record<string, { quantidade: number; produto: Produto }> = {};
  for (const scan of scans) {
    if (!contagemScans[scan.produtoId]) {
      contagemScans[scan.produtoId] = { quantidade: 0, produto: scan.produto };
    }
    contagemScans[scan.produtoId].quantidade++;
  }

  // Conjunto de produtos esperados na NF
  const produtosNF = new Set(itensNF.map((i) => i.produtoId));

  const itensOk: ItemConferencia[] = [];
  const faltando: ItemConferencia[] = [];
  const sobrando: ItemConferencia[] = [];
  const naoEsperados: ItemConferencia[] = [];

  // Verificar cada item da NF
  for (const item of itensNF) {
    const qtdLida = contagemScans[item.produtoId]?.quantidade ?? 0;
    const diff = qtdLida - item.quantidade;

    const entry: ItemConferencia = {
      produto: item.produto,
      qtdNF: item.quantidade,
      qtdLida,
      diferenca: diff,
    };

    if (diff === 0) itensOk.push(entry);
    else if (diff < 0) faltando.push(entry);
    else sobrando.push(entry);
  }

  // Verificar itens lidos que não estão na NF
  for (const [produtoId, { quantidade, produto }] of Object.entries(contagemScans)) {
    if (!produtosNF.has(produtoId)) {
      naoEsperados.push({
        produto,
        qtdNF: 0,
        qtdLida: quantidade,
        diferenca: quantidade,
      });
    }
  }

  const status =
    faltando.length === 0 && sobrando.length === 0 && naoEsperados.length === 0
      ? 'OK'
      : 'DIVERGENTE';

  return { itensOk, faltando, sobrando, naoEsperados, status };
}

export function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function gerarId(): string {
  return Math.random().toString(36).substring(2, 11);
}
