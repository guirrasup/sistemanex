// backend/src/services/__tests__/cte.service.test.ts
//
// Testes dos caminhos críticos de emissão/cancelamento de CT-e: guardas de
// segurança, a bifurcação mock vs. transmissão real (SEFAZ_TRANSMISSAO_REAL),
// e o fato de que — diferente de NFe/NFCe — uma rejeição da SEFAZ aqui lança
// (o CT-e já foi persistido como REJEITADA antes do throw). Repositório,
// certificado, assinatura XML e cliente SOAP são mockados.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  cteCreate: vi.fn(),
  cteUpdate: vi.fn(),
  cteFindById: vi.fn(),
  cteUpdateStatus: vi.fn(),
  cteGetProximoNumero: vi.fn(),
  empresaFindById: vi.fn(),
  obterCertificadoDecriptado: vi.fn(),
  extrairChaveECertificadoDoPfx: vi.fn(),
  assinarXmlEnvelopado: vi.fn(),
  autorizarCte: vi.fn(),
}));

vi.mock('../../repositories/cte.repository.js', () => ({
  CteRepository: vi.fn().mockImplementation(() => ({
    create: mocks.cteCreate,
    update: mocks.cteUpdate,
    findById: mocks.cteFindById,
    updateStatus: mocks.cteUpdateStatus,
    getProximoNumero: mocks.cteGetProximoNumero,
  })),
}));
vi.mock('../../repositories/empresa.repository.js', () => ({
  EmpresaRepository: vi.fn().mockImplementation(() => ({ findById: mocks.empresaFindById })),
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
vi.mock('../cteSefazClient.js', () => ({
  autorizarCte: mocks.autorizarCte,
}));

const { CteService } = await import('../cte.service.js');

const CHAVE_E_CERT = { privateKeyPem: 'PEM-CHAVE', certPem: 'PEM-CERT' };

function criarEmpresa(overrides: Record<string, any> = {}) {
  return {
    id: 'empresa-1',
    cnpj: '18236447000190',
    uf: 'SP',
    codigoUF: '35',
    ambienteEmissao: 'HOMOLOGACAO',
    certificado: { status: 'VALIDO' },
    ...overrides,
  };
}

function criarInputBase(overrides: Record<string, any> = {}) {
  return {
    empresaId: 'empresa-1',
    cUF: '35',
    cMunIni: '3550308',
    emitenteCNPJ: '18236447000190',
    serie: 1,
    nCT: 1,
    vTPrest: 1000,
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
  mocks.cteGetProximoNumero.mockResolvedValue(1);
  // O repositório real persiste o registro e devolve os relacionamentos carregados;
  // aqui simulamos o resultado ecoando o que foi passado para create(), que já tem
  // tudo que gerarXmlCte400() precisa (chaveAcesso, CST00, etc.).
  mocks.cteCreate.mockImplementation((dados: any) => Promise.resolve({ id: 'cte-1', ...dados }));
  mocks.cteUpdate.mockImplementation((id: string, _empresaId: string, dados: any) => Promise.resolve({ id, ...dados }));
});

afterEach(() => {
  if (ENV_ORIGINAL === undefined) delete process.env.SEFAZ_TRANSMISSAO_REAL;
  else process.env.SEFAZ_TRANSMISSAO_REAL = ENV_ORIGINAL;
});

describe('CteService.emitirCte', () => {
  it('lança erro quando a empresa não é encontrada', async () => {
    mocks.empresaFindById.mockResolvedValue(null);
    const service = new CteService();
    await expect(service.emitirCte(criarInputBase())).rejects.toThrow(/empresa não encontrada/i);
  });

  it('lança erro quando o certificado digital está ausente ou inválido', async () => {
    mocks.empresaFindById.mockResolvedValue(criarEmpresa({ certificado: { status: 'VENCIDO' } }));
    const service = new CteService();
    await expect(service.emitirCte(criarInputBase())).rejects.toThrow(/certificado digital/i);
  });

  it('em modo mock, persiste como AUTORIZADA com um protocolo simulado e não chama a SEFAZ', async () => {
    const service = new CteService();
    const resultado = await service.emitirCte(criarInputBase());

    expect(mocks.autorizarCte).not.toHaveBeenCalled();
    expect(mocks.cteUpdate).toHaveBeenCalledTimes(1);
    const dadosAtualizados = mocks.cteUpdate.mock.calls[0][2];
    expect(dadosAtualizados.status).toBe('AUTORIZADA');
    expect(dadosAtualizados.protocoloAutorizacao).toMatch(/^\d+$/);
    expect(resultado.status).toBe('AUTORIZADA');
  });

  it('lança erro quando o certificado não pode ser decriptado', async () => {
    mocks.obterCertificadoDecriptado.mockResolvedValue(null);
    const service = new CteService();
    await expect(service.emitirCte(criarInputBase())).rejects.toThrow(/certificado digital não configurado/i);
  });

  it('com SEFAZ_TRANSMISSAO_REAL=true e autorização, persiste AUTORIZADA com o protocolo real da SEFAZ', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.autorizarCte.mockResolvedValue({ autorizado: true, nProt: '157260000012345', xmlRetorno: '<retCTe/>' });

    const service = new CteService();
    const resultado = await service.emitirCte(criarInputBase());

    expect(resultado.status).toBe('AUTORIZADA');
    expect(resultado.protocoloAutorizacao).toBe('157260000012345');
  });

  it('com SEFAZ_TRANSMISSAO_REAL=true e rejeição, persiste REJEITADA e lança erro com o motivo', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.autorizarCte.mockResolvedValue({ autorizado: false, xMotivo: 'RNTRC inválido', xmlRetorno: '<retCTe/>' });

    const service = new CteService();
    await expect(service.emitirCte(criarInputBase())).rejects.toThrow(/rntrc inválido/i);

    const dadosAtualizados = mocks.cteUpdate.mock.calls[0][2];
    expect(dadosAtualizados.status).toBe('REJEITADA');
    expect(dadosAtualizados.motivoRejeicao).toBe('RNTRC inválido');
  });

  it('gera a chave de acesso com o modelo 57 (CT-e) e propaga para o registro criado', async () => {
    const service = new CteService();
    await service.emitirCte(criarInputBase());

    const dadosCriados = mocks.cteCreate.mock.calls[0][0];
    expect(dadosCriados.chaveAcesso).toHaveLength(44);
    expect(dadosCriados.chaveAcesso.slice(20, 22)).toBe('57');
  });
});

describe('CteService.cancelarCte', () => {
  it('lança erro quando o CT-e não é encontrado', async () => {
    mocks.cteFindById.mockResolvedValue(null);
    const service = new CteService();
    await expect(service.cancelarCte('cte-x', 'motivo', 'empresa-1')).rejects.toThrow(/não encontrado/i);
  });

  it('lança erro quando já está cancelado', async () => {
    mocks.cteFindById.mockResolvedValue({ id: 'cte-1', status: 'CANCELADA' });
    const service = new CteService();
    await expect(service.cancelarCte('cte-1', 'motivo', 'empresa-1')).rejects.toThrow(/já está cancelado/i);
  });

  it('lança erro quando o CT-e ainda não foi autorizado (ex.: REJEITADA/PROCESSANDO)', async () => {
    mocks.cteFindById.mockResolvedValue({ id: 'cte-1', status: 'PROCESSANDO' });
    const service = new CteService();
    await expect(service.cancelarCte('cte-1', 'motivo', 'empresa-1')).rejects.toThrow(/apenas ct-e autorizados/i);
  });

  it('cancela um CT-e autorizado delegando ao repositório', async () => {
    mocks.cteFindById.mockResolvedValue({ id: 'cte-1', status: 'AUTORIZADA' });
    mocks.cteUpdateStatus.mockResolvedValue({ id: 'cte-1', status: 'CANCELADA' });

    const service = new CteService();
    const resultado = await service.cancelarCte('cte-1', 'motivo do cancelamento', 'empresa-1');

    expect(mocks.cteUpdateStatus).toHaveBeenCalledWith('cte-1', 'empresa-1', 'CANCELADA', 'motivo do cancelamento');
    expect(resultado.status).toBe('CANCELADA');
  });
});
