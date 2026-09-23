// backend/src/services/__tests__/nfce.service.test.ts
//
// Testes dos caminhos críticos de emissão/cancelamento de NFC-e: guardas de
// segurança, a bifurcação mock vs. transmissão real (SEFAZ_TRANSMISSAO_REAL) e
// o tratamento dos desfechos da SEFAZ. Repositórios, certificado, assinatura XML
// e o cliente SOAP são mockados, como em nfe.service.test.ts.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  nfceCreate: vi.fn(),
  nfceCreateItem: vi.fn(),
  nfceCreatePagamento: vi.fn(),
  nfceUpdateStatus: vi.fn(),
  nfceFindById: vi.fn(),
  nfceCancelar: vi.fn(),
  clienteFindByDocumento: vi.fn(),
  produtoFindByIds: vi.fn(),
  produtoUpdate: vi.fn(),
  empresaFindById: vi.fn(),
  empresaUpdate: vi.fn(),
  financeiroCreate: vi.fn(),
  financeiroFindManyByDocumentoOrigem: vi.fn(),
  financeiroCancelarTitulo: vi.fn(),
  obterCertificadoDecriptado: vi.fn(),
  extrairChaveECertificadoDoPfx: vi.fn(),
  assinarXmlEnvelopado: vi.fn(),
  autorizarNfe: vi.fn(),
  enviarEvento: vi.fn(),
}));

vi.mock('../../repositories/nfce.repository.js', () => ({
  NfceRepository: vi.fn().mockImplementation(() => ({
    create: mocks.nfceCreate,
    createItem: mocks.nfceCreateItem,
    createPagamento: mocks.nfceCreatePagamento,
    updateStatus: mocks.nfceUpdateStatus,
    findById: mocks.nfceFindById,
    cancelar: mocks.nfceCancelar,
  })),
}));
vi.mock('../../repositories/cliente.repository.js', () => ({
  ClienteRepository: vi.fn().mockImplementation(() => ({ findByDocumento: mocks.clienteFindByDocumento })),
}));
vi.mock('../../repositories/produto.repository.js', () => ({
  ProdutoRepository: vi.fn().mockImplementation(() => ({
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
    findManyByDocumentoOrigem: mocks.financeiroFindManyByDocumentoOrigem,
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

const { NfceService } = await import('../nfce.service.js');

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
    serieNfce: 1,
    ambienteEmissao: 'HOMOLOGACAO',
    proximoNumeroNfce: 1,
    certificado: CERTIFICADO_OK,
    ...overrides,
  };
}

function criarItemInput(overrides: Record<string, any> = {}) {
  return {
    produtoId: 'produto-1',
    codigoProduto: 'PROD1',
    descricao: 'Produto Teste',
    ncm: '12345678',
    cfop: '5102',
    unidadeMedida: 'UN',
    quantidade: 2,
    valorUnitario: 50,
    valorTotalBruto: 100,
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

const ENV_ORIGINAL = process.env.SEFAZ_TRANSMISSAO_REAL;

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.SEFAZ_TRANSMISSAO_REAL;

  mocks.extrairChaveECertificadoDoPfx.mockReturnValue(CHAVE_E_CERT);
  mocks.assinarXmlEnvelopado.mockImplementation((xml: string) => `${xml}<Signature>MOCK</Signature>`);
  mocks.obterCertificadoDecriptado.mockResolvedValue({ pfxBuffer: Buffer.from('pfx'), senha: 'senha' });
  mocks.empresaFindById.mockResolvedValue(criarEmpresa());
  mocks.empresaUpdate.mockResolvedValue({});
  mocks.nfceCreate.mockResolvedValue({ id: 'nfce-1', dataHoraEmissao: new Date('2026-09-22T10:00:00-03:00') });
  mocks.nfceCreateItem.mockImplementation((_id: string, item: any) => Promise.resolve({ id: 'item-1', ...item }));
  mocks.nfceCreatePagamento.mockResolvedValue({});
  mocks.nfceUpdateStatus.mockResolvedValue({});
  mocks.nfceFindById.mockResolvedValue({ id: 'nfce-1', status: 'AUTORIZADA' });
  mocks.produtoFindByIds.mockResolvedValue([{ id: 'produto-1', estoqueAtual: 50 }]);
  mocks.produtoUpdate.mockResolvedValue({});
  mocks.financeiroCreate.mockResolvedValue({});
  mocks.financeiroFindManyByDocumentoOrigem.mockResolvedValue([]);
});

afterEach(() => {
  if (ENV_ORIGINAL === undefined) delete process.env.SEFAZ_TRANSMISSAO_REAL;
  else process.env.SEFAZ_TRANSMISSAO_REAL = ENV_ORIGINAL;
});

describe('NfceService.emitirNfce', () => {
  it('lança erro quando a empresa não é encontrada', async () => {
    mocks.empresaFindById.mockResolvedValue(null);
    const service = new NfceService();
    await expect(service.emitirNfce({ empresaId: 'x', itens: [criarItemInput()] })).rejects.toThrow(/empresa não encontrada/i);
  });

  it('lança erro quando o certificado digital está ausente ou inválido', async () => {
    mocks.empresaFindById.mockResolvedValue(criarEmpresa({ certificado: null }));
    const service = new NfceService();
    await expect(service.emitirNfce({ empresaId: 'empresa-1', itens: [criarItemInput()] })).rejects.toThrow(/certificado digital/i);
  });

  it('lança erro quando nenhum item é informado', async () => {
    const service = new NfceService();
    await expect(service.emitirNfce({ empresaId: 'empresa-1', itens: [] })).rejects.toThrow(/pelo menos um item/i);
  });

  it('lança erro quando o consumidor identificado não está cadastrado', async () => {
    mocks.clienteFindByDocumento.mockResolvedValue(null);
    const service = new NfceService();
    await expect(service.emitirNfce({
      empresaId: 'empresa-1', itens: [criarItemInput()],
      consumidorIdentificado: true, consumidorDoc: '12345678909',
    })).rejects.toThrow(/consumidor não encontrado/i);
  });

  it('em modo mock, emite com status AUTORIZADA e não chama a SEFAZ', async () => {
    const service = new NfceService();
    const resultado = await service.emitirNfce({ empresaId: 'empresa-1', itens: [criarItemInput()] });

    expect(mocks.autorizarNfe).not.toHaveBeenCalled();
    expect(mocks.nfceUpdateStatus).toHaveBeenCalledWith('nfce-1', 'AUTORIZADA', expect.stringMatching(/^\d+$/), expect.stringContaining('<Signature>MOCK</Signature>'));
    expect(resultado.xmlAssinado).toContain('<Signature>MOCK</Signature>');
  });

  it('lança erro quando o certificado não pode ser decriptado', async () => {
    mocks.obterCertificadoDecriptado.mockResolvedValue(null);
    const service = new NfceService();
    await expect(service.emitirNfce({ empresaId: 'empresa-1', itens: [criarItemInput()] })).rejects.toThrow(/certificado digital não configurado/i);
  });

  it('com SEFAZ_TRANSMISSAO_REAL=true e autorização síncrona, atualiza status para AUTORIZADA com o protocolo real', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.autorizarNfe.mockResolvedValue({ autorizado: true, nProt: '135260000099999', xmlRetorno: '<retNFe/>' });

    const service = new NfceService();
    await service.emitirNfce({ empresaId: 'empresa-1', itens: [criarItemInput()] });

    expect(mocks.nfceUpdateStatus).toHaveBeenCalledWith('nfce-1', 'AUTORIZADA', '135260000099999', expect.any(String));
  });

  it('com SEFAZ_TRANSMISSAO_REAL=true e rejeição, marca REJEITADA e lança erro com o motivo', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.autorizarNfe.mockResolvedValue({ autorizado: false, xMotivo: 'Rejeição: CFOP inválido', cStat: '999', xmlRetorno: '<retNFe/>' });

    const service = new NfceService();
    await expect(service.emitirNfce({ empresaId: 'empresa-1', itens: [criarItemInput()] })).rejects.toThrow(/rejeição: cfop inválido/i);

    expect(mocks.nfceUpdateStatus).toHaveBeenCalledWith('nfce-1', 'REJEITADA', undefined, expect.any(String), 'Rejeição: CFOP inválido');
  });

  it('com SEFAZ_TRANSMISSAO_REAL=true e lote assíncrono (nRec), marca PROCESSANDO sem lançar erro', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.autorizarNfe.mockResolvedValue({ autorizado: false, nRec: '351000000099999', xmlRetorno: '<retNFe/>' });

    const service = new NfceService();
    await expect(service.emitirNfce({ empresaId: 'empresa-1', itens: [criarItemInput()] })).resolves.toBeDefined();
    expect(mocks.nfceUpdateStatus).toHaveBeenCalledWith('nfce-1', 'PROCESSANDO', expect.any(String), expect.any(String));
  });

  it('baixa o estoque dos produtos vendidos', async () => {
    const service = new NfceService();
    await service.emitirNfce({ empresaId: 'empresa-1', itens: [criarItemInput({ produtoId: 'produto-1', quantidade: 3 })] });

    expect(mocks.produtoUpdate).toHaveBeenCalledWith('produto-1', 'empresa-1', { estoqueAtual: 47 });
  });

  it('não cria título financeiro para pagamento em dinheiro, PIX ou "sem pagamento" (01/17/90)', async () => {
    const service = new NfceService();
    await service.emitirNfce({ empresaId: 'empresa-1', itens: [criarItemInput()], formaPagamento: '17' });
    expect(mocks.financeiroCreate).not.toHaveBeenCalled();
  });

  it('cria título financeiro a receber quando a forma de pagamento é a prazo (ex.: boleto "15")', async () => {
    const service = new NfceService();
    await service.emitirNfce({ empresaId: 'empresa-1', itens: [criarItemInput()], formaPagamento: '15' });
    expect(mocks.financeiroCreate).toHaveBeenCalledTimes(1);
    expect(mocks.financeiroCreate.mock.calls[0][0].documentoOrigemTipo).toBe('NFCE');
  });
});

describe('NfceService.cancelarNfce', () => {
  it('lança erro quando a NFC-e não é encontrada', async () => {
    mocks.nfceFindById.mockResolvedValue(null);
    const service = new NfceService();
    await expect(service.cancelarNfce('id-x', 'motivo com mais de 15 caracteres', 'empresa-1')).rejects.toThrow(/não encontrada/i);
  });

  it('lança "Acesso negado" (proteção IDOR) quando a NFC-e pertence a outra empresa', async () => {
    mocks.nfceFindById.mockResolvedValue({ id: 'nfce-1', empresaId: 'empresa-outra', status: 'AUTORIZADA' });
    const service = new NfceService();
    await expect(service.cancelarNfce('nfce-1', 'motivo com mais de 15 caracteres', 'empresa-1')).rejects.toThrow(/acesso negado/i);
  });

  it('lança erro quando já está cancelada', async () => {
    mocks.nfceFindById.mockResolvedValue({ id: 'nfce-1', empresaId: 'empresa-1', status: 'CANCELADA' });
    const service = new NfceService();
    await expect(service.cancelarNfce('nfce-1', 'motivo com mais de 15 caracteres', 'empresa-1')).rejects.toThrow(/já está cancelada/i);
  });

  it('valida o tamanho mínimo (15) e máximo (255) do motivo (TJust)', async () => {
    mocks.nfceFindById.mockResolvedValue({ id: 'nfce-1', empresaId: 'empresa-1', status: 'AUTORIZADA', chaveAcesso: '123' });
    const service = new NfceService();
    await expect(service.cancelarNfce('nfce-1', 'curto', 'empresa-1')).rejects.toThrow(/no mínimo 15/i);
    await expect(service.cancelarNfce('nfce-1', 'a'.repeat(256), 'empresa-1')).rejects.toThrow(/no máximo 255/i);
  });

  it('cancela títulos financeiros vinculados e delega o cancelamento ao repositório', async () => {
    mocks.nfceFindById.mockResolvedValue({ id: 'nfce-1', empresaId: 'empresa-1', status: 'AUTORIZADA', chaveAcesso: '35260118236447000190650010000000011123456789' });
    mocks.financeiroFindManyByDocumentoOrigem.mockResolvedValue([{ id: 'titulo-1' }, { id: 'titulo-2' }]);
    mocks.nfceCancelar.mockResolvedValue({ id: 'nfce-1', status: 'CANCELADA' });

    const service = new NfceService();
    const resultado = await service.cancelarNfce('nfce-1', 'motivo com mais de 15 caracteres', 'empresa-1');

    expect(mocks.financeiroCancelarTitulo).toHaveBeenCalledTimes(2);
    expect(mocks.nfceCancelar).toHaveBeenCalledWith('nfce-1', 'motivo com mais de 15 caracteres');
    expect(resultado.status).toBe('CANCELADA');
  });

  it('em modo real, exige que a NFC-e esteja AUTORIZADA com protocolo antes de cancelar', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.nfceFindById.mockResolvedValue({ id: 'nfce-1', empresaId: 'empresa-1', status: 'PROCESSANDO', protocoloAutorizacao: null });

    const service = new NfceService();
    await expect(service.cancelarNfce('nfce-1', 'motivo com mais de 15 caracteres', 'empresa-1')).rejects.toThrow(/apenas nfc-e autorizadas/i);
    expect(mocks.enviarEvento).not.toHaveBeenCalled();
  });

  it('em modo real, lança erro quando a SEFAZ rejeita o cancelamento e não cancela localmente', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.nfceFindById.mockResolvedValue({
      id: 'nfce-1', empresaId: 'empresa-1', status: 'AUTORIZADA',
      protocoloAutorizacao: '135260000012345', chaveAcesso: '35260118236447000190650010000000011123456789',
    });
    mocks.enviarEvento.mockResolvedValue({ sucesso: false, cStat: '573', xMotivo: 'Duplicidade de evento', xmlRetorno: '<retEvento/>' });

    const service = new NfceService();
    await expect(service.cancelarNfce('nfce-1', 'motivo com mais de 15 caracteres', 'empresa-1')).rejects.toThrow(/duplicidade de evento/i);
    expect(mocks.nfceCancelar).not.toHaveBeenCalled();
  });

  it('em modo real, chama a SEFAZ (modelo 65) e cancela localmente após a confirmação', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.nfceFindById.mockResolvedValue({
      id: 'nfce-1', empresaId: 'empresa-1', status: 'AUTORIZADA',
      protocoloAutorizacao: '135260000012345', chaveAcesso: '35260118236447000190650010000000011123456789',
    });
    mocks.enviarEvento.mockResolvedValue({ sucesso: true, cStat: '135', xMotivo: 'Evento registrado', xmlRetorno: '<retEvento/>' });
    mocks.nfceCancelar.mockResolvedValue({ id: 'nfce-1', status: 'CANCELADA' });
    mocks.financeiroFindManyByDocumentoOrigem.mockResolvedValue([]);

    const service = new NfceService();
    const resultado = await service.cancelarNfce('nfce-1', 'motivo com mais de 15 caracteres', 'empresa-1');

    expect(mocks.enviarEvento).toHaveBeenCalledWith(expect.objectContaining({ modelo: '65' }));
    expect(mocks.nfceCancelar).toHaveBeenCalledWith('nfce-1', 'motivo com mais de 15 caracteres');
    expect(resultado.status).toBe('CANCELADA');
  });
});
