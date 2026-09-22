// backend/src/utils/__tests__/tributosEngine.test.ts
import { describe, it, expect } from 'vitest';
import { calcularTotaisNfe, calcularTributosNfse } from '../tributosEngine.js';
import type { ItemNfe } from '../../types/fiscal.js';

function criarItemNfe(overrides: Partial<ItemNfe> = {}): ItemNfe {
  return {
    id: 'item-1',
    codigoProduto: 'PROD1',
    descricao: 'Produto de teste',
    ncm: '12345678',
    cfop: '5102',
    unidadeMedida: 'UN',
    quantidade: 1,
    valorUnitario: 100,
    valorTotalBruto: 100,
    origemMercadoria: 0,
    cstICMS: '00',
    aliquotaICMS: 18,
    baseCalculoICMS: 100,
    valorICMS: 18,
    cstPIS: '01',
    aliquotaPIS: 1.65,
    valorPIS: 1.65,
    cstCOFINS: '01',
    aliquotaCOFINS: 7.6,
    valorCOFINS: 7.6,
    valorTributosAproximados: 31.4,
    ...overrides,
  };
}

describe('calcularTotaisNfe', () => {
  it('soma corretamente os valores de um único item, sem frete/seguro/desconto', () => {
    const totais = calcularTotaisNfe([criarItemNfe()]);

    expect(totais.valorTotalProdutos).toBe(100);
    expect(totais.baseCalculoICMS).toBe(100);
    expect(totais.valorTotalICMS).toBe(18);
    expect(totais.valorTotalPIS).toBe(1.65);
    expect(totais.valorTotalCOFINS).toBe(7.6);
    expect(totais.valorTotalDesconto).toBe(0);
    expect(totais.valorTotalNota).toBe(100);
  });

  it('soma múltiplos itens e aplica frete, seguro, outras despesas e desconto geral', () => {
    const itens = [
      criarItemNfe({ id: 'i1', quantidade: 2, valorUnitario: 50, valorTotalBruto: 100, baseCalculoICMS: 100, valorICMS: 18 }),
      criarItemNfe({ id: 'i2', quantidade: 1, valorUnitario: 200, valorTotalBruto: 200, baseCalculoICMS: 200, valorICMS: 36, descontoItem: 10 }),
    ];

    const totais = calcularTotaisNfe(itens, 15, 5, 2, 8);

    // vProd = soma de quantidade*valorUnitario de cada item = (2*50) + (1*200) = 300
    expect(totais.valorTotalProdutos).toBe(300);
    expect(totais.valorTotalFrete).toBe(15);
    expect(totais.valorTotalSeguro).toBe(5);
    expect(totais.valorTotalOutrasDespesas).toBe(2);
    // desconto = descontoItem (10) + descontoGeral (8)
    expect(totais.valorTotalDesconto).toBe(18);
    expect(totais.valorTotalICMS).toBe(54);

    // vNF = vProd + frete + seguro + outras + IPI + ICMSST - desconto
    //     = 300 + 15 + 5 + 2 + 0 + 0 - 18 = 304
    expect(totais.valorTotalNota).toBe(304);
  });

  it('trata itens sem campos tributários opcionais (fallback para 0) sem lançar erro', () => {
    const itemMinimo = criarItemNfe({
      valorICMS: 0,
      valorPIS: 0,
      valorCOFINS: 0,
      valorTributosAproximados: 0,
    });

    expect(() => calcularTotaisNfe([itemMinimo])).not.toThrow();
    const totais = calcularTotaisNfe([itemMinimo]);
    expect(totais.valorTotalTributosAproximados).toBe(0);
  });

  it('retorna zeros para uma lista de itens vazia', () => {
    const totais = calcularTotaisNfe([]);
    expect(totais.valorTotalProdutos).toBe(0);
    expect(totais.valorTotalNota).toBe(0);
  });
});

describe('calcularTributosNfse', () => {
  const base = {
    valorServico: 1000,
    aliquotaISS: 5,
    tipoRetencaoISS: 1 as const,
    tributacaoISSQN: 1 as const,
    optanteSimplesNacional: false,
  };

  it('calcula ISS normalmente quando tributacaoISSQN = 1 (tributável no município)', () => {
    const resultado = calcularTributosNfse(base);
    expect(resultado.baseCalculoISS).toBe(1000);
    expect(resultado.valorISS).toBe(50); // 5% de 1000
    expect(resultado.valorISSRetido).toBe(0); // tipoRetencaoISS=1 → não retido
  });

  it('retém o ISS quando tipoRetencaoISS indica retenção pelo tomador (2 ou 3)', () => {
    const resultado = calcularTributosNfse({ ...base, tipoRetencaoISS: 2 });
    expect(resultado.valorISS).toBe(50);
    expect(resultado.valorISSRetido).toBe(50);
    expect(resultado.totalRetencoes).toBeGreaterThanOrEqual(50);
  });

  it('não calcula base de ISS quando tributacaoISSQN != 1 (fora do município/imune/etc.)', () => {
    const resultado = calcularTributosNfse({ ...base, tributacaoISSQN: 3 });
    expect(resultado.baseCalculoISS).toBe(0);
    expect(resultado.valorISS).toBe(0);
  });

  it('usa alíquotas PIS/COFINS padrão de mercado (0.65%/3%) quando não é optante do Simples e nada foi informado', () => {
    const resultado = calcularTributosNfse(base);
    expect(resultado.aliquotaPIS).toBe(0.65);
    expect(resultado.aliquotaCOFINS).toBe(3.0);
  });

  it('zera PIS/COFINS por padrão para optante do Simples Nacional sem alíquota explícita', () => {
    const resultado = calcularTributosNfse({ ...base, optanteSimplesNacional: true });
    expect(resultado.aliquotaPIS).toBe(0);
    expect(resultado.aliquotaCOFINS).toBe(0);
  });

  it('respeita alíquotas de PIS/COFINS explicitamente informadas mesmo para optante do Simples', () => {
    const resultado = calcularTributosNfse({ ...base, optanteSimplesNacional: true, aliquotaPIS: 1.65, aliquotaCOFINS: 7.6 });
    expect(resultado.aliquotaPIS).toBe(1.65);
    expect(resultado.aliquotaCOFINS).toBe(7.6);
  });

  it('nunca deixa o valor líquido ficar negativo mesmo com retenções maiores que o serviço', () => {
    const resultado = calcularTributosNfse({
      ...base,
      valorServico: 10,
      aliquotaIRRF: 100, // absurdamente alto de propósito
    });
    expect(resultado.valorLiquido).toBeGreaterThanOrEqual(0);
  });

  it('monta o grupo ibscbs com o meio de pagamento e CNPJ do tomador informados', () => {
    const resultado = calcularTributosNfse({ ...base, formaPagamento: '01', cnpjTomador: '12345678000199' });
    expect(resultado.ibscbs.pagamentoVinculado?.tipoMeioPagamento).toBe('01');
    expect(resultado.ibscbs.pagamentoVinculado?.cnpjRecebedor).toBe('12345678000199');
  });
});
