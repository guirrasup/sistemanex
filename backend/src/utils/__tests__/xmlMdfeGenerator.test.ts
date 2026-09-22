// backend/src/utils/__tests__/xmlMdfeGenerator.test.ts
import { describe, it, expect } from 'vitest';
import { DOMParser } from '@xmldom/xmldom';
import { gerarXmlMDFe } from '../xmlMdfeGenerator.js';

function criarParamsBase(overrides: Partial<Parameters<typeof gerarXmlMDFe>[0]> = {}): Parameters<typeof gerarXmlMDFe>[0] {
  return {
    mdfe: {
      chaveAcesso: '35260118236447000190580010000000011123456789'.slice(0, 44),
      cUF: '35',
      tpAmb: '2',
      tpEmit: '1',
      modelo: '58',
      serie: 1,
      numero: 1,
      cMDF: '12345678',
      cDV: '9',
      modal: '1',
      dhEmi: new Date('2026-09-22T10:00:00-03:00'),
      tpEmis: '1',
      procEmi: '0',
      verProc: 'SUP-TECNOLOGIA-3.00',
      UFIni: 'SP',
      UFFim: 'RJ',
    },
    emitente: {
      documento: '18236447000190',
      razaoSocial: 'Transportadora Teste & Cia',
      inscricaoEstadual: '110042490114',
      endereco: {
        logradouro: 'Rua da Transportadora',
        numero: '500',
        bairro: 'Centro',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'São Paulo',
        uf: 'SP',
        cep: '01000000',
      },
    },
    municipiosCarrega: [{ cMunCarrega: '3550308', xMunCarrega: 'São Paulo' }],
    percursos: [],
    municipiosDescarga: [{ cMunDescarga: '3304557', xMunDescarga: 'Rio de Janeiro' }],
    seguros: [],
    lacres: [],
    autorizadosDownload: [],
    produtoPredominante: { tpCarga: '01', xProd: 'Materiais diversos' },
    totalizadores: { vCarga: 5000, cUnid: '01', qCarga: 100 },
    ...overrides,
  };
}

describe('gerarXmlMDFe', () => {
  it('gera um XML bem-formado com a raiz <MDFe> e o Id correto em infMDFe', () => {
    const params = criarParamsBase();
    const xml = gerarXmlMDFe(params);
    const doc = new DOMParser().parseFromString(xml, 'text/xml');

    expect(doc.getElementsByTagName('MDFe').length).toBe(1);
    expect(doc.getElementsByTagName('infMDFe')[0].getAttribute('Id')).toBe(`MDFe${params.mdfe.chaveAcesso}`);
  });

  it('usa CNPJ do emitente quando o documento tem 14 dígitos', () => {
    const xml = gerarXmlMDFe(criarParamsBase());
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('emit')[0].getElementsByTagName('CNPJ').length).toBe(1);
  });

  it('usa CPF do emitente quando o documento tem 11 dígitos', () => {
    const xml = gerarXmlMDFe(criarParamsBase({
      emitente: {
        documento: '12345678909',
        razaoSocial: 'Motorista Autônomo',
        endereco: {
          logradouro: 'Rua Teste', numero: '1', bairro: 'Centro',
          codigoMunicipio: '3550308', nomeMunicipio: 'São Paulo', uf: 'SP', cep: '01000000',
        },
      },
    }));
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('emit')[0].getElementsByTagName('CPF').length).toBe(1);
    expect(doc.getElementsByTagName('emit')[0].getElementsByTagName('CNPJ').length).toBe(0);
  });

  it('escapa caracteres especiais no nome do emitente', () => {
    const xml = gerarXmlMDFe(criarParamsBase());
    expect(xml).toContain('Transportadora Teste &amp; Cia');
  });

  it('gera um <infMunCarrega> por município de carregamento informado', () => {
    const xml = gerarXmlMDFe(criarParamsBase({
      municipiosCarrega: [
        { cMunCarrega: '3550308', xMunCarrega: 'São Paulo' },
        { cMunCarrega: '3509502', xMunCarrega: 'Campinas' },
      ],
    }));
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('infMunCarrega').length).toBe(2);
  });

  it('gera <infCTe> aninhado dentro de <infMunDescarga> para CT-e vinculados', () => {
    const xml = gerarXmlMDFe(criarParamsBase({
      municipiosDescarga: [{
        cMunDescarga: '3304557',
        xMunDescarga: 'Rio de Janeiro',
        ctes: [{ chCTe: '35260118236447000190570010000000011123456780' }],
      }],
    }));
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('infCTe').length).toBe(1);
    expect(doc.getElementsByTagName('chCTe')[0].textContent).toBe('35260118236447000190570010000000011123456780');
  });

  it('gera <infNFe> aninhado dentro de <infMunDescarga> para NF-e vinculadas', () => {
    const xml = gerarXmlMDFe(criarParamsBase({
      municipiosDescarga: [{
        cMunDescarga: '3304557',
        xMunDescarga: 'Rio de Janeiro',
        nfes: [{ chNFe: '35260112345678000199550010000000011123456780' }],
      }],
    }));
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('infNFe').length).toBe(1);
    expect(doc.getElementsByTagName('chNFe')[0].textContent).toBe('35260112345678000199550010000000011123456780');
  });

  it('gera um <lacres> por lacre informado', () => {
    const xml = gerarXmlMDFe(criarParamsBase({ lacres: ['LAC1', 'LAC2', 'LAC3'] }));
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('lacres').length).toBe(3);
  });

  it('omite o bloco <infAdic> quando não há informações adicionais nem informações ao fisco', () => {
    const xml = gerarXmlMDFe(criarParamsBase());
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('infAdic').length).toBe(0);
  });

  it('inclui o bloco <infAdic> com infCpl quando informações complementares são fornecidas', () => {
    const xml = gerarXmlMDFe(criarParamsBase({
      mdfe: { ...criarParamsBase().mdfe, infCpl: 'Observação complementar do MDF-e' },
    }));
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('infAdic').length).toBe(1);
    expect(doc.getElementsByTagName('infCpl')[0].textContent).toBe('Observação complementar do MDF-e');
  });

  it('formata os totalizadores de carga com as casas decimais corretas', () => {
    const xml = gerarXmlMDFe(criarParamsBase({ totalizadores: { vCarga: 5000, cUnid: '01', qCarga: 100.5 } }));
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('vCarga')[0].textContent).toBe('5000.00');
    expect(doc.getElementsByTagName('qCarga')[0].textContent).toBe('100.5000');
  });
});
