// backend/src/utils/__tests__/xmlDpsGenerator.test.ts
import { describe, it, expect } from 'vitest';
import { DOMParser } from '@xmldom/xmldom';
import { gerarXmlDps } from '../xmlDpsGenerator.js';
import type { NFSeDocumento } from '../../types/fiscal.js';

function criarNfse(overrides: Partial<NFSeDocumento> = {}): NFSeDocumento {
  return {
    id: 'nfse-1',
    chaveAcesso: '35260112345678000199000000000000123456789012345678',
    numeroNfse: 1,
    serieDPS: 1,
    numeroDPS: 42,
    dataCompetencia: '2026-09-01',
    dataHoraEmissao: '2026-09-22T10:00:00-03:00',
    dataHoraProcessamento: '2026-09-22T10:00:01-03:00',
    codigoVerificacao: 'ABCD-1234',
    ambiente: 2,
    tipoEmissao: 1,
    status: 'PROCESSANDO',
    emitente: {
      cnpj: '18236447000190',
      inscricaoMunicipal: '99887766',
      razaoSocial: 'Prestador de Serviços & Consultoria LTDA',
      regimeTributario: 3,
      optanteSimplesNacional: false,
      optanteMEI: false,
      endereco: {
        logradouro: 'Rua do Prestador',
        numero: '10',
        bairro: 'Centro',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'São Paulo',
        uf: 'SP',
        cep: '01000000',
      },
    },
    tomador: {
      tipoPessoa: 'PJ',
      documento: '12345678000199',
      nomeRazaoSocial: 'Tomador Teste LTDA',
      endereco: {
        logradouro: 'Rua do Tomador',
        numero: '20',
        bairro: 'Centro',
        codigoMunicipio: '3550308',
        nomeMunicipio: 'São Paulo',
        uf: 'SP',
        cep: '01000000',
      },
    },
    servico: {
      codigoTributacaoNacional: '010101',
      codigoTributacaoMunicipal: '0101',
      descricao: 'Consultoria em tecnologia da informação',
      localPrestacao: { codigoMunicipio: '3550308', nomeMunicipio: 'São Paulo', uf: 'SP' },
      valorServico: 1000,
      tributacaoISSQN: 1,
      aliquotaISS: 5,
      valorISS: 50,
      tipoRetencaoISS: 1,
      valorISSRetido: 0,
      baseCalculoISS: 1000,
      valorTributosFederais: 0,
      valorTributosEstaduais: 0,
      valorTributosMunicipais: 50,
      percentualTotalTributos: 5,
    },
    valorTotalServicos: 1000,
    valorTotalDescontos: 0,
    valorTotalDeducoes: 0,
    baseCalculoISS: 1000,
    valorTotalISS: 50,
    valorTotalISSRetido: 0,
    valorTotalRetencoesFederais: 0,
    valorTotalIBS: 0,
    valorTotalCBS: 0,
    valorLiquidoNfse: 950,
    valorTotalNotaFinal: 1000,
    xmlAssinado: '',
    ...overrides,
  };
}

describe('gerarXmlDps', () => {
  it('gera um XML bem-formado com a raiz <DPS> e o Id no formato DPS<chaveAcesso>', () => {
    const nfse = criarNfse();
    const xml = gerarXmlDps(nfse);
    const doc = new DOMParser().parseFromString(xml, 'text/xml');

    expect(doc.getElementsByTagName('DPS').length).toBe(1);
    expect(doc.getElementsByTagName('infDPS')[0].getAttribute('Id')).toBe(`DPS${nfse.chaveAcesso}`);
  });

  it('inclui CNPJ do prestador e do tomador nos blocos corretos', () => {
    const xml = gerarXmlDps(criarNfse());
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('prest')[0].getElementsByTagName('CNPJ')[0].textContent).toBe('18236447000190');
    expect(doc.getElementsByTagName('toma')[0].getElementsByTagName('CNPJ')[0].textContent).toBe('12345678000199');
  });

  it('usa CPF no bloco <toma> quando o tomador é pessoa física', () => {
    const nfse = criarNfse({
      tomador: {
        tipoPessoa: 'PF',
        documento: '12345678909',
        nomeRazaoSocial: 'Tomador Pessoa Física',
        endereco: criarNfse().tomador.endereco,
      },
    });
    const xml = gerarXmlDps(nfse);
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('toma')[0].getElementsByTagName('CPF').length).toBe(1);
    expect(doc.getElementsByTagName('toma')[0].getElementsByTagName('CNPJ').length).toBe(0);
  });

  it('mapeia tpAmb=1 para produção e tpAmb=2 para homologação', () => {
    const xmlHomolog = gerarXmlDps(criarNfse({ ambiente: 2 }));
    const docHomolog = new DOMParser().parseFromString(xmlHomolog, 'text/xml');
    expect(docHomolog.getElementsByTagName('tpAmb')[0].textContent).toBe('2');

    const xmlProducao = gerarXmlDps(criarNfse({ ambiente: 1 }));
    const docProducao = new DOMParser().parseFromString(xmlProducao, 'text/xml');
    expect(docProducao.getElementsByTagName('tpAmb')[0].textContent).toBe('1');
  });

  it('escapa o "&" na razão social do prestador, preservando os demais caracteres', () => {
    const xml = gerarXmlDps(criarNfse());
    expect(xml).toContain('Prestador de Serviços &amp; Consultoria LTDA');
  });

  it('inclui o bloco de descontos apenas quando há desconto incondicionado ou condicionado', () => {
    const semDesconto = gerarXmlDps(criarNfse());
    expect(semDesconto).not.toContain('vDescCondIncond');

    const comDesconto = gerarXmlDps(criarNfse({
      servico: { ...criarNfse().servico, descontoIncondicionado: 100 },
    }));
    const doc = new DOMParser().parseFromString(comDesconto, 'text/xml');
    expect(doc.getElementsByTagName('vDescCondIncond').length).toBe(1);
    expect(doc.getElementsByTagName('vDescIncond')[0].textContent).toBe('100.00');
  });

  it('formata o valor do serviço com 2 casas decimais em <vServ>', () => {
    const xml = gerarXmlDps(criarNfse({ servico: { ...criarNfse().servico, valorServico: 1234.5 } }));
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('vServ')[0].textContent).toBe('1234.50');
  });
});
