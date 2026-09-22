// backend/src/utils/__tests__/xmlCteGenerator.test.ts
import { describe, it, expect } from 'vitest';
import { DOMParser } from '@xmldom/xmldom';
import { gerarXmlCte400 } from '../xmlCteGenerator.js';

function criarCteBase(overrides: Record<string, any> = {}): Record<string, any> {
  return {
    chaveAcesso: '35260118236447000190570010000000011123456789'.padEnd(44, '0').slice(0, 44),
    versao: '4.00',
    cUF: '35',
    cCT: '12345678',
    CFOP: '5353',
    natOp: 'Prestação de serviço de transporte',
    mod: '57',
    serie: 1,
    nCT: 1,
    dhEmi: '2026-09-22T10:00:00-03:00',
    tpImp: '1',
    tpEmis: '1',
    cDV: '9',
    tpAmb: '2',
    tpCTe: 'NORMAL',
    procEmi: '0',
    cMunEnv: '3550308',
    xMunEnv: 'São Paulo',
    UFEnv: 'SP',
    modal: 'RODOVIARIO',
    tpServ: 'NORMAL',
    cMunIni: '3550308',
    xMunIni: 'São Paulo',
    UFIni: 'SP',
    cMunFim: '3304557',
    xMunFim: 'Rio de Janeiro',
    UFFim: 'RJ',
    retira: '1',
    indIEToma: 'CONTRIBUINTE',
    toma: 'REMETENTE',
    emitente: {
      cnpj: '18236447000190',
      inscricaoEstadual: '110042490114',
      razaoSocial: 'Transportadora Teste LTDA',
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
    remetente: {
      documento: '12345678000199',
      razaoSocial: 'Remetente Teste & Cia',
      endereco: {
        logradouro: 'Rua do Remetente',
        numero: '10',
        bairro: 'Centro',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'São Paulo',
        uf: 'SP',
        cep: '01000000',
      },
    },
    destinatario: {
      documento: '98765432000188',
      razaoSocial: 'Destinatário Teste',
      endereco: {
        logradouro: 'Rua do Destinatário',
        numero: '20',
        bairro: 'Centro',
        codigoMunicipio: '3304557',
        nomeMunicipio: 'Rio de Janeiro',
        uf: 'RJ',
        cep: '20000000',
      },
    },
    vTPrest: 1000,
    vRec: 1000,
    CST00: '00',
    vBC00: 1000,
    pICMS00: 12,
    vICMS00: 120,
    proPred: 'Materiais diversos',
    transportadora: { rntrc: '12345678' },
    ordensColeta: [],
    lacresRodo: [],
    ...overrides,
  };
}

describe('gerarXmlCte400', () => {
  it('gera um XML bem-formado com a raiz <CTe> e o Id correto em infCte', () => {
    const cte = criarCteBase();
    const xml = gerarXmlCte400(cte);
    const doc = new DOMParser().parseFromString(xml, 'text/xml');

    expect(doc.getElementsByTagName('CTe').length).toBe(1);
    expect(doc.getElementsByTagName('infCte')[0].getAttribute('Id')).toBe(`CTe${cte.chaveAcesso}`);
  });

  it('lança erro quando a chave de acesso não tem 44 dígitos', () => {
    expect(() => gerarXmlCte400(criarCteBase({ chaveAcesso: '123' }))).toThrow(/chave de acesso/i);
  });

  it('lança erro quando nenhum grupo de tributação de ICMS é informado', () => {
    const cte = criarCteBase({ CST00: undefined });
    expect(() => gerarXmlCte400(cte)).toThrow(/grupo de tributação de ICMS/i);
  });

  it('monta o grupo ICMS00 quando CST00 está presente', () => {
    const xml = gerarXmlCte400(criarCteBase());
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('ICMS00').length).toBe(1);
    expect(doc.getElementsByTagName('ICMS00')[0].getElementsByTagName('vICMS')[0].textContent).toBe('120.00');
  });

  it('monta o grupo ICMS20 (com redução de base de cálculo) quando CST20 está presente em vez de CST00', () => {
    const cte = criarCteBase({
      CST00: undefined,
      CST20: '20', pRedBC20: 20, vBC20: 800, pICMS20: 12, vICMS20: 96,
    });
    const xml = gerarXmlCte400(cte);
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('ICMS20').length).toBe(1);
    expect(doc.getElementsByTagName('ICMS00').length).toBe(0);
  });

  it('inclui o RNTRC da transportadora no infModal rodoviário', () => {
    const xml = gerarXmlCte400(criarCteBase());
    expect(xml).toContain('<RNTRC>12345678</RNTRC>');
  });

  it('usa "ISENTO" como RNTRC quando a transportadora não tem RNTRC cadastrado', () => {
    const xml = gerarXmlCte400(criarCteBase({ transportadora: undefined }));
    expect(xml).toContain('<RNTRC>ISENTO</RNTRC>');
  });

  it('inclui ordens de coleta (occ) e lacres (lacRodo) quando informados', () => {
    const cte = criarCteBase({
      ordensColeta: [{ nOcc: '1', dEmi: '2026-09-20', emiCNPJ: '18236447000190', emiUF: 'SP' }],
      lacresRodo: [{ nLacre: 'LAC123' }],
    });
    const xml = gerarXmlCte400(cte);
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('occ').length).toBe(1);
    expect(doc.getElementsByTagName('nOcc')[0].textContent).toBe('1');
    expect(doc.getElementsByTagName('lacRodo').length).toBe(1);
    expect(doc.getElementsByTagName('nLacre')[0].textContent).toBe('LAC123');
  });

  it('gera um placeholder comentado para modais ainda não implementados (ex.: AEREO)', () => {
    const xml = gerarXmlCte400(criarCteBase({ modal: 'AEREO' }));
    expect(xml).toContain('infModal do modal AEREO ainda não implementado');
    expect(xml).not.toContain('<rodo>');
  });

  it('escapa caracteres especiais no nome do remetente', () => {
    const xml = gerarXmlCte400(criarCteBase());
    expect(xml).toContain('Remetente Teste &amp; Cia');
  });

  it('inclui um <infNFe> por documento transportado do tipo NFe', () => {
    const cte = criarCteBase({
      documentos: [{ tipo: 'NFe', chave: '35260112345678000199550010000000011123456780' }],
    });
    const xml = gerarXmlCte400(cte);
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('infNFe').length).toBe(1);
    expect(doc.getElementsByTagName('chave')[0].textContent).toBe('35260112345678000199550010000000011123456780');
  });
});
