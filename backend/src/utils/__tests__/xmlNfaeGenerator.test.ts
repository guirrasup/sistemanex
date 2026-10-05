// backend/src/utils/__tests__/xmlNfaeGenerator.test.ts
import { describe, it, expect } from 'vitest';
import { DOMParser } from '@xmldom/xmldom';
import { gerarXmlNfae, type NfaeParaXml, type ParteNfae } from '../xmlNfaeGenerator.js';

function criarParte(overrides: Partial<ParteNfae> = {}): ParteNfae {
  return {
    tipoPessoa: 'PF',
    documento: '12345678909',
    nome: 'Produtor Rural & Filhos',
    endereco: {
      logradouro: 'Estrada Rural',
      numero: 'S/N',
      bairro: 'Zona Rural',
      municipio: 'Ribeirão Preto',
      municipioIbge: '3543402',
      uf: 'SP',
      cep: '14000000',
    },
    ...overrides,
  };
}

function criarNfae(overrides: Partial<NfaeParaXml> = {}): NfaeParaXml {
  return {
    chaveAcesso: '35260112345678909630010000000011123456789'.padEnd(44, '0').slice(0, 44),
    numero: 1,
    serie: 1,
    dataHoraEmissao: '2026-09-22T10:00:00-03:00',
    naturezaOperacao: 'Venda de produção rural',
    motivoEmissao: 'PRODUTOR_RURAL',
    descricaoMotivo: 'Emissão avulsa para produtor rural sem inscrição estadual',
    ambiente: 2,
    orgaoEmissorSefaz: 'SEFAZ-SP',
    requerente: criarParte(),
    destinatario: criarParte({ tipoPessoa: 'PJ', documento: '12345678000199', nome: 'Comprador Teste LTDA' }),
    itens: [{
      codigo: 'PROD1',
      descricao: 'Milho em grão',
      ncm: '10059010',
      unidade: 'SC',
      quantidade: 100,
      valorUnitario: 50,
      valorTotal: 5000,
      aliquotaICMS: 7,
      valorICMS: 350,
    }],
    valorTotalProdutos: 5000,
    baseCalculoICMS: 5000,
    aliquotaICMSMediana: 7,
    valorTotalICMS: 350,
    valorTotalNota: 5000,
    ...overrides,
  };
}

describe('gerarXmlNfae', () => {
  it('gera um XML bem-formado com a raiz <NFAe> e o Id correto em infNFAe', () => {
    const nfae = criarNfae();
    const xml = gerarXmlNfae(nfae);
    const doc = new DOMParser().parseFromString(xml, 'text/xml');

    expect(doc.getElementsByTagName('NFAe').length).toBe(1);
    expect(doc.getElementsByTagName('infNFAe')[0].getAttribute('Id')).toBe(`NFAe${nfae.chaveAcesso}`);
    expect(doc.getElementsByTagName('mod')[0].textContent).toBe('63');
  });

  it('lança erro quando a chave de acesso não tem 44 dígitos', () => {
    expect(() => gerarXmlNfae(criarNfae({ chaveAcesso: '123' }))).toThrow(/chave de acesso/i);
  });

  it('usa CPF para requerente pessoa física e CNPJ para destinatário pessoa jurídica', () => {
    const xml = gerarXmlNfae(criarNfae());
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('requerente')[0].getElementsByTagName('CPF').length).toBe(1);
    expect(doc.getElementsByTagName('dest')[0].getElementsByTagName('CNPJ').length).toBe(1);
  });

  it('escapa caracteres especiais no nome do requerente', () => {
    const xml = gerarXmlNfae(criarNfae());
    expect(xml).toContain('Produtor Rural &amp; Filhos');
  });

  it('gera um <det> por item, numerados sequencialmente', () => {
    const xml = gerarXmlNfae(criarNfae({
      itens: [
        { codigo: 'P1', descricao: 'Item 1', ncm: '10059010', unidade: 'SC', quantidade: 1, valorUnitario: 10, valorTotal: 10, aliquotaICMS: 7, valorICMS: 0.7 },
        { codigo: 'P2', descricao: 'Item 2', ncm: '10059010', unidade: 'SC', quantidade: 1, valorUnitario: 20, valorTotal: 20, aliquotaICMS: 7, valorICMS: 1.4 },
      ],
    }));
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const dets = doc.getElementsByTagName('det');
    expect(dets.length).toBe(2);
    expect(dets[0].getAttribute('nItem')).toBe('1');
    expect(dets[1].getAttribute('nItem')).toBe('2');
  });

  it('omite o bloco <guiaDAE> quando não informado, e inclui quando presente', () => {
    const semGuia = gerarXmlNfae(criarNfae());
    expect(semGuia).not.toContain('<guiaDAE>');

    const comGuia = gerarXmlNfae(criarNfae({
      guiaDAE: { numero: 'DAE123', codigoBarras: '000111222', vencimento: '2026-10-01', valor: 350 },
    }));
    const doc = new DOMParser().parseFromString(comGuia, 'text/xml');
    expect(doc.getElementsByTagName('guiaDAE').length).toBe(1);
    expect(doc.getElementsByTagName('nDAE')[0].textContent).toBe('DAE123');
  });

  it('extrai cUF a partir dos 2 primeiros dígitos da chave de acesso', () => {
    const xml = gerarXmlNfae(criarNfae());
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('cUF')[0].textContent).toBe('35');
  });
});
