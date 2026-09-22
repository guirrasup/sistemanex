// backend/src/services/__tests__/nfe.service.test.ts
//
// Testes dos caminhos críticos de emissão/cancelamento de NF-e: guardas de
// segurança (empresa/destinatário/certificado ausentes, IDOR), a bifurcação
// mock vs. transmissão real (SEFAZ_TRANSMISSAO_REAL), e o tratamento dos três
// desfechos possíveis da SEFAZ (autorizada / rejeitada / processando em lote).
// Repositórios, o serviço de certificado, a assinatura XML e o cliente SOAP da
// SEFAZ são mockados — o objetivo aqui não é testar a integração real (isso é
// coberto pelos testes de unidade dos próprios geradores de XML/assinatura/
// endpoints), e sim a lógica de orquestração do service.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  nfeCreate: vi.fn(),
  nfeCancelar: vi.fn(),
  nfeContarEventosPorTipo: vi.fn(),
  nfeCriarEvento: vi.fn(),
  nfeFindById: vi.fn(),
  clienteFindById: vi.fn(),
  produtoFindById: vi.fn(),
  produtoFindByIds: vi.fn(),
  produtoUpdate: vi.fn(),
  empresaFindById: vi.fn(),
  empresaUpdate: vi.fn(),
  financeiroCreate: vi.fn(),
  financeiroFindByDocumentoOrigem: vi.fn(),
  financeiroCancelarTitulo: vi.fn(),
  obterCertificadoDecriptado: vi.fn(),
  extrairChaveECertificadoDoPfx: vi.fn(),
  assinarXmlEnvelopado: vi.fn(),
  autorizarNfe: vi.fn(),
  enviarEvento: vi.fn(),
}));

vi.mock('../../repositories/nfe.repository.js', () => ({
  NfeRepository: vi.fn().mockImplementation(() => ({
    create: mocks.nfeCreate,
    cancelar: mocks.nfeCancelar,
    contarEventosPorTipo: mocks.nfeContarEventosPorTipo,
    criarEvento: mocks.nfeCriarEvento,
    findById: mocks.nfeFindById,
  })),
}));
vi.mock('../../repositories/cliente.repository.js', () => ({
  ClienteRepository: vi.fn().mockImplementation(() => ({ findById: mocks.clienteFindById })),
}));
vi.mock('../../repositories/produto.repository.js', () => ({
  ProdutoRepository: vi.fn().mockImplementation(() => ({
    findById: mocks.produtoFindById,
    findByIds: mocks.produtoFindByIds,
    update: mocks.produtoUpdate,
  })),
}));
vi.mock('../../repositories/empresa.repository.js', () => ({
  EmpresaRepository: vi.fn().mockImplementation(() => ({
    findById: mocks.empresaFindById,
    update: mocks.empresaUpdate,
  })),
}));
vi.mock('../../repositories/financeiro.repository.js', () => ({
  FinanceiroRepository: vi.fn().mockImplementation(() => ({
    create: mocks.financeiroCreate,
    findByDocumentoOrigem: mocks.financeiroFindByDocumentoOrigem,
    cancelarTitulo: mocks.financeiroCancelarTitulo,
  })),
}));
vi.mock('../certificado.service.js', () => ({
  CertificadoService: vi.fn().mockImplementation(() => ({
    obterCertificadoDecriptado: mocks.obterCertificadoDecriptado,
  })),
}));
vi.mock('../../utils/xmlSigner.js', () => ({
  extrairChaveECertificadoDoPfx: mocks.extrairChaveECertificadoDoPfx,
  assinarXmlEnvelopado: mocks.assinarXmlEnvelopado,
}));
vi.mock('../nfeSefazClient.js', () => ({
  autorizarNfe: mocks.autorizarNfe,
  enviarEvento: mocks.enviarEvento,
}));

const { NfeService } = await import('../nfe.service.js');

const CERTIFICADO_OK = { status: 'VALIDO' };
const CHAVE_E_CERT = { privateKeyPem: 'PEM-CHAVE', certPem: 'PEM-CERT' };

function criarEmpresa(overrides: Record<string, any> = {}) {
  return {
    id: 'empresa-1',
    cnpj: '18236447000190',
    inscricaoMunicipal: '123',
    inscricaoEstadual: '110042490114',
    razaoSocial: 'Empresa Teste LTDA',
    regimeTributario: 'NORMAL',
    optanteSimples: false,
    optanteMEI: false,
    endereco: {
      logradouro: 'Rua Teste', numero: '100', bairro: 'Centro',
      codigoMunicipio: '3550308', nomeMunicipio: 'São Paulo', uf: 'SP', cep: '01000000',
    },
    codigoUF: '35',
    uf: 'SP',
    codigoMunicipio: '3550308',
    serieNfe: 1,
    ambienteEmissao: 'HOMOLOGACAO',
    proximoNumeroNfe: 1,
    certificado: CERTIFICADO_OK,
    ...overrides,
  };
}

function criarCliente(overrides: Record<string, any> = {}) {
  return {
    id: 'cliente-1',
    tipoPessoa: 'PF',
    documento: '12345678909',
    razaoSocial: 'Cliente Teste',
    endereco: {
      logradouro: 'Rua Cliente', numero: '10', bairro: 'Centro',
      codigoMunicipio: '3550308', nomeMunicipio: 'São Paulo', uf: 'SP', cep: '01000000',
    },
    ...overrides,
  };
}

function criarProduto(overrides: Record<string, any> = {}) {
  return {
    id: 'produto-1',
    codigo: 'PROD1',
    descricao: 'Produto Teste',
    ncm: '12345678',
    cfopPadrao: '5102',
    unidade: 'UN',
    precoVenda: 100,
    aliquotaICMS: 18,
    aliquotaPIS: 1.65,
    aliquotaCOFINS: 7.6,
    origem: '0',
    estoqueAtual: 50,
    ...overrides,
  };
}

const ENV_ORIGINAL = process.env.SEFAZ_TRANSMISSAO_REAL;

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.SEFAZ_TRANSMISSAO_REAL;

  mocks.extrairChaveECertificadoDoPfx.mockReturnValue(CHAVE_E_CERT);
  mocks.assinarXmlEnvelopado.mockImplementation((xml: string) => `${xml}<Signature>MOCK</Signature>`);
  mocks.obterCertificadoDecriptado.mockResolvedValue({ pfxBuffer: Buffer.from('pfx'), senha: 'senha' });
  mocks.empresaFindById.mockResolvedValue(criarEmpresa());
  mocks.clienteFindById.mockResolvedValue(criarCliente());
  mocks.produtoFindById.mockResolvedValue(criarProduto());
  mocks.produtoFindByIds.mockResolvedValue([criarProduto()]);
  mocks.nfeCreate.mockResolvedValue({ id: 'nfe-criada-1' });
  mocks.empresaUpdate.mockResolvedValue({});
  mocks.produtoUpdate.mockResolvedValue({});
  mocks.financeiroCreate.mockResolvedValue({});
});

afterEach(() => {
  if (ENV_ORIGINAL === undefined) delete process.env.SEFAZ_TRANSMISSAO_REAL;
  else process.env.SEFAZ_TRANSMISSAO_REAL = ENV_ORIGINAL;
});

describe('NfeService.emitirNfe', () => {
  it('lança erro quando a empresa não é encontrada', async () => {
    mocks.empresaFindById.mockResolvedValue(null);
    const service = new NfeService();
    await expect(service.emitirNfe({ empresaId: 'x', destinatarioId: 'y' })).rejects.toThrow(/empresa não encontrada/i);
  });

  it('lança erro quando o destinatário não é encontrado', async () => {
    mocks.clienteFindById.mockResolvedValue(null);
    const service = new NfeService();
    await expect(service.emitirNfe({ empresaId: 'x', destinatarioId: 'y' })).rejects.toThrow(/destinatário não encontrado/i);
  });

  it('lança erro quando o certificado digital da empresa está ausente ou inválido', async () => {
    mocks.empresaFindById.mockResolvedValue(criarEmpresa({ certificado: null }));
    const service = new NfeService();
    await expect(service.emitirNfe({ empresaId: 'x', destinatarioId: 'y' })).rejects.toThrow(/certificado digital/i);

    mocks.empresaFindById.mockResolvedValue(criarEmpresa({ certificado: { status: 'VENCIDO' } }));
    await expect(service.emitirNfe({ empresaId: 'x', destinatarioId: 'y' })).rejects.toThrow(/certificado digital/i);
  });

  it('em modo mock (SEFAZ_TRANSMISSAO_REAL desligado), marca a NF-e como AUTORIZADA sem chamar a SEFAZ', async () => {
    const service = new NfeService();
    const resultado = await service.emitirNfe({ empresaId: 'empresa-1', destinatarioId: 'cliente-1', itens: [{ produtoId: 'produto-1', quantidade: 2 }] });

    expect(mocks.autorizarNfe).not.toHaveBeenCalled();
    expect(mocks.nfeCreate).toHaveBeenCalledTimes(1);
    const dadosCriados = mocks.nfeCreate.mock.calls[0][0];
    expect(dadosCriados.status).toBe('AUTORIZADA');
    expect(dadosCriados.protocoloAutorizacao).toBeNull();
    expect(resultado.xml).toContain('<Signature>MOCK</Signature>');
  });

  it('assina o XML antes de decidir o status final (a assinatura sempre acontece, mesmo em modo mock)', async () => {
    const service = new NfeService();
    await service.emitirNfe({ empresaId: 'empresa-1', destinatarioId: 'cliente-1', itens: [{ produtoId: 'produto-1' }] });

    expect(mocks.extrairChaveECertificadoDoPfx).toHaveBeenCalledWith(expect.any(Buffer), 'senha');
    expect(mocks.assinarXmlEnvelopado).toHaveBeenCalledWith(expect.stringContaining('<NFe'), 'infNFe', CHAVE_E_CERT);
  });

  it('lança erro quando o certificado não pode ser decriptado (ausente no repositório)', async () => {
    mocks.obterCertificadoDecriptado.mockResolvedValue(null);
    const service = new NfeService();
    await expect(service.emitirNfe({ empresaId: 'empresa-1', destinatarioId: 'cliente-1' })).rejects.toThrow(/certificado digital não configurado/i);
  });

  it('com SEFAZ_TRANSMISSAO_REAL=true e autorização síncrona, marca como AUTORIZADA com o protocolo retornado', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.autorizarNfe.mockResolvedValue({ autorizado: true, nProt: '135260000012345', xmlRetorno: '<retNFe/>' });

    const service = new NfeService();
    await service.emitirNfe({ empresaId: 'empresa-1', destinatarioId: 'cliente-1', itens: [{ produtoId: 'produto-1' }] });

    const dadosCriados = mocks.nfeCreate.mock.calls[0][0];
    expect(dadosCriados.status).toBe('AUTORIZADA');
    expect(dadosCriados.protocoloAutorizacao).toBe('135260000012345');
    expect(dadosCriados.xmlRetorno).toBe('<retNFe/>');
  });

  it('com SEFAZ_TRANSMISSAO_REAL=true e rejeição, marca como REJEITADA com o motivo informado pela SEFAZ', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.autorizarNfe.mockResolvedValue({ autorizado: false, xMotivo: 'Duplicidade de NF-e', xmlRetorno: '<retNFe/>' });

    const service = new NfeService();
    await service.emitirNfe({ empresaId: 'empresa-1', destinatarioId: 'cliente-1', itens: [{ produtoId: 'produto-1' }] });

    const dadosCriados = mocks.nfeCreate.mock.calls[0][0];
    expect(dadosCriados.status).toBe('REJEITADA');
    expect(dadosCriados.motivoRejeicao).toBe('Duplicidade de NF-e');
    expect(dadosCriados.dataHoraAutorizacao).toBeNull();
  });

  it('com SEFAZ_TRANSMISSAO_REAL=true e processamento assíncrono em lote (nRec), marca como PROCESSANDO', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.autorizarNfe.mockResolvedValue({ autorizado: false, nRec: '351000000012345', xmlRetorno: '<retNFe/>' });

    const service = new NfeService();
    await service.emitirNfe({ empresaId: 'empresa-1', destinatarioId: 'cliente-1', itens: [{ produtoId: 'produto-1' }] });

    const dadosCriados = mocks.nfeCreate.mock.calls[0][0];
    expect(dadosCriados.status).toBe('PROCESSANDO');
  });

  it('incrementa o próximo número de NF-e da empresa após a emissão', async () => {
    mocks.empresaFindById.mockResolvedValue(criarEmpresa({ proximoNumeroNfe: 7 }));
    const service = new NfeService();
    await service.emitirNfe({ empresaId: 'empresa-1', destinatarioId: 'cliente-1', itens: [{ produtoId: 'produto-1' }] });

    expect(mocks.empresaUpdate).toHaveBeenCalledWith('empresa-1', { proximoNumeroNfe: 8 });
  });

  it('cria um título a receber no financeiro vinculado à chave de acesso da NF-e emitida', async () => {
    const service = new NfeService();
    await service.emitirNfe({ empresaId: 'empresa-1', destinatarioId: 'cliente-1', itens: [{ produtoId: 'produto-1' }] });

    expect(mocks.financeiroCreate).toHaveBeenCalledTimes(1);
    const dadosFinanceiro = mocks.financeiroCreate.mock.calls[0][0];
    expect(dadosFinanceiro.tipo).toBe('RECEBER');
    expect(dadosFinanceiro.documentoOrigemTipo).toBe('NFE');
    expect(dadosFinanceiro.documentoOrigemChave).toHaveLength(44);
  });

  it('baixa o estoque do produto proporcionalmente à quantidade vendida', async () => {
    mocks.produtoFindByIds.mockResolvedValue([criarProduto({ id: 'produto-1', estoqueAtual: 50 })]);
    const service = new NfeService();
    await service.emitirNfe({ empresaId: 'empresa-1', destinatarioId: 'cliente-1', itens: [{ produtoId: 'produto-1', quantidade: 5 }] });

    expect(mocks.produtoUpdate).toHaveBeenCalledWith('produto-1', 'empresa-1', { estoqueAtual: 45 });
  });
});

describe('NfeService.cancelarNfe', () => {
  function criarNfePersistida(overrides: Record<string, any> = {}) {
    return {
      id: 'nfe-1',
      empresaId: 'empresa-1',
      status: 'AUTORIZADA',
      chaveAcesso: '35260118236447000190550010000000011123456789',
      protocoloAutorizacao: '135260000012345',
      ...overrides,
    };
  }

  it('lança erro quando a NF-e não é encontrada', async () => {
    mocks.nfeFindById.mockResolvedValue(null);
    const service = new NfeService();
    await expect(service.cancelarNfe('id-inexistente', 'motivo qualquer com mais de 15 caracteres', 'empresa-1')).rejects.toThrow(/não encontrada/i);
  });

  it('lança "Acesso negado" (proteção IDOR) quando a NF-e pertence a outra empresa', async () => {
    mocks.nfeFindById.mockResolvedValue(criarNfePersistida({ empresaId: 'empresa-outra' }));
    const service = new NfeService();
    await expect(service.cancelarNfe('nfe-1', 'motivo qualquer com mais de 15 caracteres', 'empresa-1')).rejects.toThrow(/acesso negado/i);
  });

  it('lança erro quando a NF-e já está cancelada', async () => {
    mocks.nfeFindById.mockResolvedValue(criarNfePersistida({ status: 'CANCELADA' }));
    const service = new NfeService();
    await expect(service.cancelarNfe('nfe-1', 'motivo qualquer com mais de 15 caracteres', 'empresa-1')).rejects.toThrow(/já está cancelada/i);
  });

  it('em modo mock, cancela diretamente no repositório sem chamar a SEFAZ', async () => {
    mocks.nfeFindById.mockResolvedValue(criarNfePersistida());
    mocks.nfeCancelar.mockResolvedValue({ id: 'nfe-1', status: 'CANCELADA' });
    mocks.financeiroFindByDocumentoOrigem.mockResolvedValue(null);

    const service = new NfeService();
    const resultado = await service.cancelarNfe('nfe-1', 'motivo qualquer com mais de 15 caracteres', 'empresa-1');

    expect(mocks.enviarEvento).not.toHaveBeenCalled();
    expect(mocks.nfeCancelar).toHaveBeenCalledWith('nfe-1', 'motivo qualquer com mais de 15 caracteres');
    expect(resultado.status).toBe('CANCELADA');
  });

  it('em modo real, exige que a NF-e esteja AUTORIZADA com protocolo antes de cancelar', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.nfeFindById.mockResolvedValue(criarNfePersistida({ status: 'REJEITADA', protocoloAutorizacao: null }));

    const service = new NfeService();
    await expect(service.cancelarNfe('nfe-1', 'motivo qualquer com mais de 15 caracteres', 'empresa-1')).rejects.toThrow(/apenas NF-e autorizadas/i);
  });

  it('em modo real, lança erro quando a SEFAZ rejeita o cancelamento', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.nfeFindById.mockResolvedValue(criarNfePersistida());
    mocks.nfeContarEventosPorTipo.mockResolvedValue(0);
    mocks.enviarEvento.mockResolvedValue({ sucesso: false, cStat: '573', xMotivo: 'Duplicidade de evento', xmlRetorno: '<retEvento/>' });

    const service = new NfeService();
    await expect(service.cancelarNfe('nfe-1', 'motivo qualquer com mais de 15 caracteres', 'empresa-1')).rejects.toThrow(/duplicidade de evento/i);
    expect(mocks.nfeCriarEvento).toHaveBeenCalledTimes(1);
    expect(mocks.nfeCancelar).not.toHaveBeenCalled();
  });

  it('em modo real, cancela no repositório local após a SEFAZ confirmar o evento de cancelamento', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.nfeFindById.mockResolvedValue(criarNfePersistida());
    mocks.nfeContarEventosPorTipo.mockResolvedValue(0);
    mocks.enviarEvento.mockResolvedValue({ sucesso: true, cStat: '135', xMotivo: 'Evento registrado e vinculado a NF-e', xmlRetorno: '<retEvento/>' });
    mocks.nfeCancelar.mockResolvedValue({ id: 'nfe-1', status: 'CANCELADA' });
    mocks.financeiroFindByDocumentoOrigem.mockResolvedValue(null);

    const service = new NfeService();
    const resultado = await service.cancelarNfe('nfe-1', 'motivo qualquer com mais de 15 caracteres', 'empresa-1');

    expect(mocks.enviarEvento).toHaveBeenCalledTimes(1);
    expect(mocks.nfeCancelar).toHaveBeenCalledWith('nfe-1', 'motivo qualquer com mais de 15 caracteres');
    expect(resultado.status).toBe('CANCELADA');
  });

  it('cancela o título financeiro vinculado quando a NF-e cancelada tinha um título a receber pendente', async () => {
    mocks.nfeFindById.mockResolvedValue(criarNfePersistida());
    mocks.nfeCancelar.mockResolvedValue({ id: 'nfe-1', status: 'CANCELADA' });
    mocks.financeiroFindByDocumentoOrigem.mockResolvedValue({ id: 'titulo-1' });
    mocks.financeiroCancelarTitulo.mockResolvedValue({});

    const service = new NfeService();
    await service.cancelarNfe('nfe-1', 'motivo qualquer com mais de 15 caracteres', 'empresa-1');

    expect(mocks.financeiroCancelarTitulo).toHaveBeenCalledWith('titulo-1', 'motivo qualquer com mais de 15 caracteres');
  });
});
