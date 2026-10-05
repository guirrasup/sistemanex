// backend/src/utils/__tests__/xmlNfeGenerator.test.ts
import { describe, it, expect } from 'vitest';
import { DOMParser } from '@xmldom/xmldom';
import {
  gerarXmlNfe400,
  gerarXmlNfce400,
  gerarXmlCartaCorrecao,
  gerarXmlCancelamentoNFe,
  gerarXmlInutilizacaoNFe,
} from '../xmlNfeGenerator.js';
import { gerarChaveAcessoNFe } from '../chaveAcesso.js';
import type { NFeDocumento, NFCeDocumento, EnderecoFiscal, ItemNfe } from '../../types/fiscal.js';

function criarEndereco(overrides: Partial<EnderecoFiscal> = {}): EnderecoFiscal {
  return {
    logradouro: 'Rua Teste',
    numero: '100',
    bairro: 'Centro',
    codigoMunicipio: '3550308',
    nomeMunicipio: 'São Paulo',
    uf: 'SP',
    cep: '01000000',
    ...overrides,
  };
}

function criarItem(overrides: Partial<ItemNfe> = {}): ItemNfe {
  return {
    id: 'item-1',
    codigoProduto: 'PROD1',
    descricao: 'Produto & Teste <especial>',
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

function criarChaveValida(): string {
  return gerarChaveAcessoNFe({
    codigoUf: '35',
    anoMes: '2609',
    cnpjEmitente: '18236447000190',
    modelo: '55',
    serie: 1,
    numero: 1,
    tipoEmissao: 1,
  }).chaveCompleta;
}

function criarNfe(overrides: Partial<NFeDocumento> = {}): NFeDocumento {
  return {
    id: 'nfe-1',
    modelo: '55',
    serie: 1,
    numero: 1,
    chaveAcesso: criarChaveValida(),
    dataHoraEmissao: '2026-09-22T10:00:00-03:00',
    naturezaOperacao: 'Venda de mercadoria',
    ambiente: 2,
    tipoEmissao: 1,
    tipoDocumento: 1,
    finalidade: 1,
    consumidorFinal: true,
    presencaComprador: 1,
    status: 'PROCESSANDO',
    emitente: {
      cnpj: '18236447000190',
      inscricaoMunicipal: '123',
      inscricaoEstadual: '110042490114',
      razaoSocial: 'Empresa Emitente Teste LTDA',
      regimeTributario: 3,
      optanteSimplesNacional: false,
      optanteMEI: false,
      endereco: criarEndereco(),
    },
    destinatario: {
      tipoPessoa: 'PF',
      documento: '12345678909',
      nomeRazaoSocial: 'Cliente Teste & Cia',
      endereco: criarEndereco({ logradouro: 'Av. Destinatário' }),
    },
    itens: [criarItem()],
    transporte: { modalidadeFrete: 9 },
    duplicatas: [],
    valorTotalProdutos: 100,
    valorTotalFrete: 0,
    valorTotalSeguro: 0,
    valorTotalDesconto: 0,
    valorTotalOutrasDespesas: 0,
    baseCalculoICMS: 100,
    valorTotalICMS: 18,
    baseCalculoICMSST: 0,
    valorTotalICMSST: 0,
    valorTotalIPI: 0,
    valorTotalPIS: 1.65,
    valorTotalCOFINS: 7.6,
    valorTotalIBS: 0,
    valorTotalCBS: 0,
    valorTotalTributosAproximados: 31.4,
    valorTotalNota: 100,
    formaPagamento: '01',
    protocoloAutorizacao: '',
    dataHoraAutorizacao: '',
    xmlAssinado: '',
    ...overrides,
  };
}

function criarNfce(overrides: Partial<NFCeDocumento> = {}): NFCeDocumento {
  return {
    id: 'nfce-1',
    modelo: '65',
    serie: 1,
    numero: 1,
    chaveAcesso: gerarChaveAcessoNFe({
      codigoUf: '35', anoMes: '2609', cnpjEmitente: '18236447000190', modelo: '65', serie: 1, numero: 1, tipoEmissao: 1,
    }).chaveCompleta,
    dataHoraEmissao: '2026-09-22T10:00:00-03:00',
    naturezaOperacao: 'Venda de mercadoria',
    ambiente: 2,
    tipoEmissao: 1,
    status: 'PROCESSANDO',
    emitente: {
      cnpj: '18236447000190',
      inscricaoMunicipal: '123',
      inscricaoEstadual: '110042490114',
      razaoSocial: 'Empresa Emitente Teste LTDA',
      regimeTributario: 3,
      optanteSimplesNacional: false,
      optanteMEI: false,
      endereco: criarEndereco(),
    },
    consumidorIdentificado: false,
    itens: [criarItem()],
    valorTotalProdutos: 100,
    valorTotalDesconto: 0,
    valorTotalTributosAproximados: 31.4,
    valorTotalNota: 100,
    formaPagamento: '01',
    valorPago: 100,
    valorTroco: 0,
    urlQrCode: 'https://www.homologacao.nfce.fazenda.sp.gov.br/qrcode?p=teste',
    tokenCscId: '000001',
    protocoloAutorizacao: '',
    dataHoraAutorizacao: '',
    xmlAssinado: '',
    ...overrides,
  };
}

describe('gerarXmlNfe400', () => {
  it('gera um XML bem-formado com a raiz <NFe> e o Id correto em infNFe', () => {
    const chave = criarChaveValida();
    const xml = gerarXmlNfe400(criarNfe({ chaveAcesso: chave }));

    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const infNFe = doc.getElementsByTagName('infNFe')[0];

    expect(doc.getElementsByTagName('NFe').length).toBe(1);
    expect(infNFe.getAttribute('Id')).toBe(`NFe${chave}`);
    expect(infNFe.getAttribute('versao')).toBe('4.00');
  });

  it('lança erro quando a chave de acesso não tem 44 dígitos', () => {
    expect(() => gerarXmlNfe400(criarNfe({ chaveAcesso: '123' }))).toThrow(/chave de acesso/i);
  });

  it('lança erro quando o protocolo de autorização informado é inválido', () => {
    expect(() => gerarXmlNfe400(criarNfe({ protocoloAutorizacao: 'abc' }))).toThrow(/protocolo/i);
  });

  it('escapa caracteres especiais em campos de texto (xNome, xProd)', () => {
    const xml = gerarXmlNfe400(criarNfe());
    expect(xml).toContain('Cliente Teste &amp; Cia');
    expect(xml).toContain('Produto &amp; Teste &lt;especial&gt;');
    expect(xml).not.toContain('Cliente Teste & Cia');
  });

  it('calcula idDest=1 (interna) quando emitente e destinatário estão na mesma UF', () => {
    const xml = gerarXmlNfe400(criarNfe());
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('idDest')[0].textContent).toBe('1');
  });

  it('calcula idDest=2 (interestadual) quando emitente e destinatário estão em UFs diferentes', () => {
    const nfe = criarNfe({
      destinatario: {
        tipoPessoa: 'PF',
        documento: '12345678909',
        nomeRazaoSocial: 'Cliente Fora do Estado',
        endereco: criarEndereco({ uf: 'RJ', codigoMunicipio: '3304557', nomeMunicipio: 'Rio de Janeiro' }),
      },
    });
    const xml = gerarXmlNfe400(nfe);
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('idDest')[0].textContent).toBe('2');
  });

  it('usa CNPJ do destinatário quando o documento tem 14 dígitos, e CPF quando tem 11', () => {
    const xmlComCpf = gerarXmlNfe400(criarNfe());
    const docCpf = new DOMParser().parseFromString(xmlComCpf, 'text/xml');
    expect(docCpf.getElementsByTagName('CPF').length).toBeGreaterThan(0);
    expect(docCpf.getElementsByTagName('dest')[0].getElementsByTagName('CNPJ').length).toBe(0);

    const xmlComCnpj = gerarXmlNfe400(criarNfe({
      destinatario: {
        tipoPessoa: 'PJ',
        documento: '12345678000199',
        nomeRazaoSocial: 'Empresa Destinatária',
        endereco: criarEndereco(),
      },
    }));
    const docCnpj = new DOMParser().parseFromString(xmlComCnpj, 'text/xml');
    expect(docCnpj.getElementsByTagName('dest')[0].getElementsByTagName('CNPJ').length).toBe(1);
  });

  it('gera um <det> por item, numerados sequencialmente a partir de 1', () => {
    const xml = gerarXmlNfe400(criarNfe({ itens: [criarItem({ id: 'a' }), criarItem({ id: 'b', codigoProduto: 'PROD2' })] }));
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const dets = doc.getElementsByTagName('det');
    expect(dets.length).toBe(2);
    expect(dets[0].getAttribute('nItem')).toBe('1');
    expect(dets[1].getAttribute('nItem')).toBe('2');
  });

  it('formata valores monetários com 2 casas decimais no total da nota', () => {
    const xml = gerarXmlNfe400(criarNfe({ valorTotalNota: 100 }));
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('vNF')[0].textContent).toBe('100.00');
  });

  it('inclui indIntermed=0 logo após indPres (NT 2020.006 — evita a rejeição 434)', () => {
    const xml = gerarXmlNfe400(criarNfe());
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('indIntermed')[0].textContent).toBe('0');
    expect(xml.indexOf('<indPres>')).toBeLessThan(xml.indexOf('<indIntermed>'));
    expect(xml.indexOf('<indIntermed>')).toBeLessThan(xml.indexOf('<procEmi>'));
  });

  it('usa o grupo ICMS00 (CST) quando o emitente é do regime Normal (CRT=3)', () => {
    const xml = gerarXmlNfe400(criarNfe());
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('ICMS00').length).toBe(1);
    expect(doc.getElementsByTagName('CST')[0].textContent).toBe('00');
  });

  it('usa o grupo CSOSN (não CST) quando o emitente é do Simples Nacional (CRT=1) — confirmado contra rejeição real da SEFAZ', () => {
    const nfe = criarNfe({
      emitente: { ...criarNfe().emitente, regimeTributario: 1 },
      itens: [criarItem({ csosnICMS: '102' })],
    });
    const xml = gerarXmlNfe400(nfe);
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('ICMSSN102').length).toBe(1);
    expect(doc.getElementsByTagName('CSOSN')[0].textContent).toBe('102');
    expect(doc.getElementsByTagName('ICMS00').length).toBe(0);
    // <CST> ainda aparece para PIS/COFINS (conceito à parte); o que não pode
    // existir é um <CST> dentro do grupo <ICMS> quando o emitente é do Simples.
    const grupoIcms = doc.getElementsByTagName('ICMS')[0];
    expect(grupoIcms.getElementsByTagName('CST').length).toBe(0);
  });

  it('lança erro quando o emitente é do Simples Nacional e o item não tem CSOSN', () => {
    const nfe = criarNfe({
      emitente: { ...criarNfe().emitente, regimeTributario: 1 },
      itens: [criarItem({ csosnICMS: undefined })],
    });
    expect(() => gerarXmlNfe400(nfe)).toThrow(/sem csosn informado/i);
  });

  it('monta o grupo ICMSSN101 (com crédito) para CSOSN 101', () => {
    const nfe = criarNfe({
      emitente: { ...criarNfe().emitente, regimeTributario: 1 },
      itens: [criarItem({ csosnICMS: '101' })],
    });
    const xml = gerarXmlNfe400(nfe);
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('ICMSSN101').length).toBe(1);
    expect(doc.getElementsByTagName('vCredICMSSN').length).toBe(1);
  });

  it('lança erro para um CSOSN desconhecido/não suportado', () => {
    const nfe = criarNfe({
      emitente: { ...criarNfe().emitente, regimeTributario: 1 },
      itens: [criarItem({ csosnICMS: '999' })],
    });
    expect(() => gerarXmlNfe400(nfe)).toThrow(/não suportado/i);
  });
});

describe('gerarXmlNfce400', () => {
  it('inclui o bloco <transp> com modFrete=9 — obrigatório pelo schema mesmo na NFC-e (confirmado contra rejeição real da SEFAZ)', () => {
    const xml = gerarXmlNfce400(criarNfce());
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('transp').length).toBe(1);
    expect(doc.getElementsByTagName('modFrete')[0].textContent).toBe('9');
    expect(xml.indexOf('</total>')).toBeLessThan(xml.indexOf('<transp>'));
    expect(xml.indexOf('</transp>')).toBeLessThan(xml.indexOf('<pag>'));
  });

  it('gera um XML com mod=65 e inclui o bloco infNFeSupl com o QR Code', () => {
    const xml = gerarXmlNfce400(criarNfce());
    const doc = new DOMParser().parseFromString(xml, 'text/xml');

    expect(doc.getElementsByTagName('mod')[0].textContent).toBe('65');
    expect(doc.getElementsByTagName('infNFeSupl').length).toBe(1);
    expect(xml).toContain('https://www.homologacao.nfce.fazenda.sp.gov.br/qrcode?p=teste');
  });

  it('lança erro quando a chave de acesso não tem 44 dígitos', () => {
    expect(() => gerarXmlNfce400(criarNfce({ chaveAcesso: '123' }))).toThrow(/chave de acesso/i);
  });

  it('soma vBC e vICMS totais a partir dos itens (NFC-e não guarda totais próprios)', () => {
    const itens = [
      criarItem({ id: 'i1', baseCalculoICMS: 100, valorICMS: 18 }),
      criarItem({ id: 'i2', baseCalculoICMS: 50, valorICMS: 9 }),
    ];
    const xml = gerarXmlNfce400(criarNfce({ itens }));
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('ICMSTot')[0].getElementsByTagName('vBC')[0].textContent).toBe('150.00');
    expect(doc.getElementsByTagName('ICMSTot')[0].getElementsByTagName('vICMS')[0].textContent).toBe('27.00');
  });

  it('soma vPIS e vCOFINS totais a partir dos itens (rejeição real: "Total do PIS difere do somatorio dos itens")', () => {
    const itens = [
      criarItem({ id: 'i1', valorPIS: 1.65, valorCOFINS: 7.6 }),
      criarItem({ id: 'i2', valorPIS: 2.35, valorCOFINS: 10.8 }),
    ];
    const xml = gerarXmlNfce400(criarNfce({ itens }));
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('ICMSTot')[0].getElementsByTagName('vPIS')[0].textContent).toBe('4.00');
    expect(doc.getElementsByTagName('ICMSTot')[0].getElementsByTagName('vCOFINS')[0].textContent).toBe('18.40');
  });

  it('omite o bloco <dest> quando o consumidor não é identificado', () => {
    const xml = gerarXmlNfce400(criarNfce({ consumidorIdentificado: false }));
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('dest').length).toBe(0);
  });

  it('inclui o bloco <dest> com CPF quando o consumidor é identificado', () => {
    const xml = gerarXmlNfce400(criarNfce({ consumidorIdentificado: true, consumidorCpf: '12345678909', consumidorNome: 'Fulano' }));
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('dest').length).toBe(1);
    expect(doc.getElementsByTagName('CPF')[0].textContent).toBe('12345678909');
  });
});

describe('gerarXmlCartaCorrecao', () => {
  const chaveValida = criarChaveValida();

  it('gera o evento 110110 com Id no formato ID110110<chave><seq>', () => {
    const xml = gerarXmlCartaCorrecao({
      chaveAcessoNFe: chaveValida,
      cnpjAutor: '18236447000190',
      sequencialEvento: 1,
      textoCorrecao: 'Correção do endereço do destinatário na nota fiscal',
    });
    expect(xml).toContain(`Id="ID110110${chaveValida}01"`);
    expect(xml).toContain('<tpEvento>110110</tpEvento>');
  });

  it('lança erro quando o texto de correção tem menos de 15 caracteres', () => {
    expect(() => gerarXmlCartaCorrecao({
      chaveAcessoNFe: chaveValida,
      cnpjAutor: '18236447000190',
      sequencialEvento: 1,
      textoCorrecao: 'curto',
    })).toThrow(/15 e 255/);
  });

  it('lança erro quando a chave de acesso é inválida', () => {
    expect(() => gerarXmlCartaCorrecao({
      chaveAcessoNFe: '123',
      cnpjAutor: '18236447000190',
      sequencialEvento: 1,
      textoCorrecao: 'Correção válida com mais de 15 caracteres',
    })).toThrow(/chave de acesso/i);
  });
});

describe('gerarXmlCancelamentoNFe', () => {
  const chaveValida = criarChaveValida();

  it('gera o evento 110111 referenciando o protocolo de autorização', () => {
    const xml = gerarXmlCancelamentoNFe({
      chaveAcessoNFe: chaveValida,
      cnpjAutor: '18236447000190',
      sequencialEvento: 1,
      justificativa: 'Cancelamento solicitado pelo cliente',
      protocoloAutorizacao: '135260000012345',
    });
    expect(xml).toContain('<tpEvento>110111</tpEvento>');
    expect(xml).toContain('<nProt>135260000012345</nProt>');
  });

  it('lança erro quando o protocolo não tem 15 ou 17 dígitos', () => {
    expect(() => gerarXmlCancelamentoNFe({
      chaveAcessoNFe: chaveValida,
      cnpjAutor: '18236447000190',
      sequencialEvento: 1,
      justificativa: 'Cancelamento solicitado pelo cliente',
      protocoloAutorizacao: '123',
    })).toThrow(/protocolo/i);
  });

  it('lança erro quando a justificativa tem mais de 255 caracteres', () => {
    expect(() => gerarXmlCancelamentoNFe({
      chaveAcessoNFe: chaveValida,
      cnpjAutor: '18236447000190',
      sequencialEvento: 1,
      justificativa: 'a'.repeat(256),
      protocoloAutorizacao: '135260000012345',
    })).toThrow(/15 e 255/);
  });

  it('usa tpAmb=2 (homologação) por padrão, e respeita o ambiente informado', () => {
    const xmlPadrao = gerarXmlCancelamentoNFe({
      chaveAcessoNFe: chaveValida,
      cnpjAutor: '18236447000190',
      sequencialEvento: 1,
      justificativa: 'Cancelamento solicitado pelo cliente',
      protocoloAutorizacao: '135260000012345',
    });
    expect(xmlPadrao).toContain('<tpAmb>2</tpAmb>');

    const xmlProducao = gerarXmlCancelamentoNFe({
      chaveAcessoNFe: chaveValida,
      cnpjAutor: '18236447000190',
      sequencialEvento: 1,
      justificativa: 'Cancelamento solicitado pelo cliente',
      protocoloAutorizacao: '135260000012345',
      ambiente: 1,
    });
    expect(xmlProducao).toContain('<tpAmb>1</tpAmb>');
  });
});

describe('gerarXmlInutilizacaoNFe', () => {
  const paramsBase = {
    cUF: '35',
    cnpjAutor: '18236447000190',
    ano: '26',
    modelo: '55' as const,
    serie: 1,
    numeroInicial: 10,
    numeroFinal: 15,
    justificativa: 'Pulo de numeração por erro de sequência no sistema',
  };

  it('gera um XML bem-formado com a raiz <inutNFe> e o Id no formato oficial', () => {
    const xml = gerarXmlInutilizacaoNFe(paramsBase);
    const doc = new DOMParser().parseFromString(xml, 'text/xml');

    expect(doc.getElementsByTagName('inutNFe').length).toBe(1);
    const id = doc.getElementsByTagName('infInut')[0].getAttribute('Id');
    // ID + cUF(2) + ano(2) + CNPJ(14) + mod(2) + serie(3) + nNFIni(9) + nNFFin(9)
    expect(id).toBe('ID35261823644700019055001000000010000000015');
  });

  it('lança erro quando a justificativa tem menos de 15 caracteres', () => {
    expect(() => gerarXmlInutilizacaoNFe({ ...paramsBase, justificativa: 'curta' })).toThrow(/15 e 255/);
  });

  it('lança erro quando o número inicial é maior que o final', () => {
    expect(() => gerarXmlInutilizacaoNFe({ ...paramsBase, numeroInicial: 20, numeroFinal: 10 })).toThrow(/menor ou igual/i);
  });

  it('usa tpAmb=2 (homologação) por padrão', () => {
    const xml = gerarXmlInutilizacaoNFe(paramsBase);
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('tpAmb')[0].textContent).toBe('2');
  });

  it('inclui a faixa de numeração e o serviço INUTILIZAR', () => {
    const xml = gerarXmlInutilizacaoNFe(paramsBase);
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.getElementsByTagName('xServ')[0].textContent).toBe('INUTILIZAR');
    expect(doc.getElementsByTagName('nNFIni')[0].textContent).toBe('10');
    expect(doc.getElementsByTagName('nNFFin')[0].textContent).toBe('15');
  });
});
