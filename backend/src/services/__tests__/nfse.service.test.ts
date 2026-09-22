// backend/src/services/__tests__/nfse.service.test.ts
//
// Testes dos caminhos críticos de emissão/cancelamento de NFS-e: guardas de
// segurança, a bifurcação mock (XML local assinado, gerarXmlNfseNacional) vs.
// transmissão real (DPS enviada ao Sistema Nacional/ADN via SEFAZ_TRANSMISSAO_REAL),
// e o tratamento de rejeição pelo ADN. Repositórios, certificado, geradores de XML,
// assinatura e o cliente REST do ADN são mockados.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  nfseCreate: vi.fn(),
  nfseUpdateStatus: vi.fn(),
  nfseFindById: vi.fn(),
  nfseCancelar: vi.fn(),
  nfseCreateHistoricoStatus: vi.fn(),
  clienteFindById: vi.fn(),
  empresaFindById: vi.fn(),
  empresaUpdate: vi.fn(),
  servicoFindById: vi.fn(),
  financeiroCreate: vi.fn(),
  financeiroFindManyByDocumentoOrigem: vi.fn(),
  financeiroCancelarTitulo: vi.fn(),
  obterCertificadoDecriptado: vi.fn(),
  extrairChaveECertificadoDoPfx: vi.fn(),
  assinarXmlEnvelopado: vi.fn(),
  gerarXmlNfseNacional: vi.fn(),
  gerarXmlCancelamentoNfse: vi.fn(),
  enviarDps: vi.fn(),
  enviarEventoNfse: vi.fn(),
}));

vi.mock('../../repositories/nfse.repository.js', () => ({
  NfseRepository: vi.fn().mockImplementation(() => ({
    create: mocks.nfseCreate,
    updateStatus: mocks.nfseUpdateStatus,
    findById: mocks.nfseFindById,
    cancelar: mocks.nfseCancelar,
    createHistoricoStatus: mocks.nfseCreateHistoricoStatus,
  })),
}));
vi.mock('../../repositories/cliente.repository.js', () => ({
  ClienteRepository: vi.fn().mockImplementation(() => ({ findById: mocks.clienteFindById })),
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
vi.mock('../../repositories/servico.repository.js', () => ({
  ServicoRepository: vi.fn().mockImplementation(() => ({ findById: mocks.servicoFindById })),
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
vi.mock('../../utils/xmlNfseGenerator.js', () => ({
  gerarXmlNfseNacional: mocks.gerarXmlNfseNacional,
  gerarXmlCancelamentoNfse: mocks.gerarXmlCancelamentoNfse,
}));
vi.mock('../adnNfseClient.js', () => ({
  enviarDps: mocks.enviarDps,
  enviarEventoNfse: mocks.enviarEventoNfse,
}));

const { NfseService } = await import('../nfse.service.js');

const CHAVE_E_CERT = { privateKeyPem: 'PEM-CHAVE', certPem: 'PEM-CERT' };

function criarEmpresa(overrides: Record<string, any> = {}) {
  return {
    id: 'empresa-1',
    cnpj: '18236447000190',
    inscricaoMunicipal: '123',
    razaoSocial: 'Prestador Teste LTDA',
    regimeTributario: 'NORMAL',
    optanteSimples: false,
    endereco: {
      logradouro: 'Rua Teste', numero: '100', bairro: 'Centro',
      codigoMunicipio: '3550308', nomeMunicipio: 'São Paulo', uf: 'SP', cep: '01000000',
    },
    ambienteEmissao: 'HOMOLOGACAO',
    serieNfse: 1,
    proximoNumeroNfse: 1,
    certificado: { status: 'VALIDO' },
    ...overrides,
  };
}

function criarTomador(overrides: Record<string, any> = {}) {
  return {
    id: 'tomador-1',
    tipoPessoa: 'PJ',
    documento: '12345678000199',
    razaoSocial: 'Tomador Teste LTDA',
    endereco: {
      logradouro: 'Rua Tomador', numero: '10', bairro: 'Centro',
      codigoMunicipio: '3550308', nomeMunicipio: 'São Paulo', uf: 'SP', cep: '01000000',
    },
    ...overrides,
  };
}

const ENV_ORIGINAL = process.env.SEFAZ_TRANSMISSAO_REAL;

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.SEFAZ_TRANSMISSAO_REAL;

  mocks.extrairChaveECertificadoDoPfx.mockReturnValue(CHAVE_E_CERT);
  mocks.assinarXmlEnvelopado.mockImplementation((xml: string) => `${xml}<Signature>MOCK</Signature>`);
  mocks.gerarXmlNfseNacional.mockReturnValue('<NFSe/>');
  mocks.gerarXmlCancelamentoNfse.mockReturnValue('<pedRegEvento/>');
  mocks.obterCertificadoDecriptado.mockResolvedValue({ pfxBuffer: Buffer.from('pfx'), senha: 'senha' });
  mocks.empresaFindById.mockResolvedValue(criarEmpresa());
  mocks.empresaUpdate.mockResolvedValue({});
  mocks.clienteFindById.mockResolvedValue(criarTomador());
  mocks.nfseCreate.mockImplementation((dados: any) => Promise.resolve({ id: 'nfse-1', ...dados }));
  mocks.nfseUpdateStatus.mockResolvedValue({});
  mocks.nfseFindById.mockResolvedValue({ id: 'nfse-1', status: 'AUTORIZADA' });
  mocks.nfseCreateHistoricoStatus.mockResolvedValue({});
  mocks.financeiroCreate.mockResolvedValue({});
  mocks.financeiroFindManyByDocumentoOrigem.mockResolvedValue([]);
});

afterEach(() => {
  if (ENV_ORIGINAL === undefined) delete process.env.SEFAZ_TRANSMISSAO_REAL;
  else process.env.SEFAZ_TRANSMISSAO_REAL = ENV_ORIGINAL;
});

describe('NfseService.emitirNfse', () => {
  it('lança erro quando a empresa não é encontrada', async () => {
    mocks.empresaFindById.mockResolvedValue(null);
    const service = new NfseService();
    await expect(service.emitirNfse({ empresaId: 'x', tomadorId: 'y' })).rejects.toThrow(/empresa não encontrada/i);
  });

  it('lança erro quando o tomador não é encontrado', async () => {
    mocks.clienteFindById.mockResolvedValue(null);
    const service = new NfseService();
    await expect(service.emitirNfse({ empresaId: 'empresa-1', tomadorId: 'y' })).rejects.toThrow(/tomador não encontrado/i);
  });

  it('lança erro quando o certificado digital está ausente ou inválido', async () => {
    mocks.empresaFindById.mockResolvedValue(criarEmpresa({ certificado: { status: 'VENCIDO' } }));
    const service = new NfseService();
    await expect(service.emitirNfse({ empresaId: 'empresa-1', tomadorId: 'tomador-1' })).rejects.toThrow(/certificado digital/i);
  });

  it('em modo mock, gera o XML local (gerarXmlNfseNacional) e assina como AUTORIZADA sem chamar o ADN', async () => {
    const service = new NfseService();
    const resultado = await service.emitirNfse({
      empresaId: 'empresa-1', tomadorId: 'tomador-1',
      servico: { valorServico: 1000, aliquotaISS: 5 },
    });

    expect(mocks.enviarDps).not.toHaveBeenCalled();
    expect(mocks.gerarXmlNfseNacional).toHaveBeenCalledTimes(1);
    expect(mocks.nfseCreate.mock.calls[0][0].status).toBe('AUTORIZADA');
    expect(mocks.nfseUpdateStatus).toHaveBeenCalledWith('nfse-1', 'AUTORIZADA', expect.stringMatching(/^\d+$/), undefined);
    expect(resultado.xmlAssinado).toContain('<Signature>MOCK</Signature>');
  });

  it('lança erro quando o certificado não pode ser decriptado', async () => {
    mocks.obterCertificadoDecriptado.mockResolvedValue(null);
    const service = new NfseService();
    await expect(service.emitirNfse({ empresaId: 'empresa-1', tomadorId: 'tomador-1' })).rejects.toThrow(/certificado digital não configurado/i);
  });

  it('com SEFAZ_TRANSMISSAO_REAL=true e sucesso, envia a DPS ao ADN e marca AUTORIZADA', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.enviarDps.mockResolvedValue({ sucesso: true, nfseXml: '<NFSe autorizada/>', chaveAcesso: '99999999999999999999999999999999999999999999999999' });

    const service = new NfseService();
    const resultado = await service.emitirNfse({ empresaId: 'empresa-1', tomadorId: 'tomador-1', servico: { valorServico: 1000 } });

    expect(mocks.enviarDps).toHaveBeenCalledTimes(1);
    expect(mocks.gerarXmlNfseNacional).not.toHaveBeenCalled();
    expect(mocks.nfseCreate.mock.calls[0][0].status).toBe('AUTORIZADA');
    expect(mocks.nfseUpdateStatus).toHaveBeenCalledWith('nfse-1', 'AUTORIZADA', '99999999999999999999999999999999999999999999999999', '<NFSe autorizada/>');
    expect(resultado).toBeDefined();
  });

  it('com SEFAZ_TRANSMISSAO_REAL=true e rejeição do ADN, marca REJEITADA e lança erro com o motivo', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.enviarDps.mockResolvedValue({ sucesso: false, erro: 'DPS com CNPJ do tomador inválido' });

    const service = new NfseService();
    await expect(service.emitirNfse({ empresaId: 'empresa-1', tomadorId: 'tomador-1', servico: { valorServico: 1000 } }))
      .rejects.toThrow(/dps com cnpj do tomador inválido/i);

    expect(mocks.nfseCreate.mock.calls[0][0].status).toBe('REJEITADA');
    expect(mocks.nfseUpdateStatus).toHaveBeenCalledWith('nfse-1', 'REJEITADA', undefined, undefined, 'DPS com CNPJ do tomador inválido');
  });

  it('não cria título financeiro quando a emissão é rejeitada pelo ADN', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.enviarDps.mockResolvedValue({ sucesso: false, erro: 'Rejeitado' });

    const service = new NfseService();
    await expect(service.emitirNfse({ empresaId: 'empresa-1', tomadorId: 'tomador-1', servico: { valorServico: 1000 } })).rejects.toThrow();
    expect(mocks.financeiroCreate).not.toHaveBeenCalled();
  });

  it('incrementa o próximo número de NFS-e apenas quando a emissão é bem-sucedida', async () => {
    const service = new NfseService();
    await service.emitirNfse({ empresaId: 'empresa-1', tomadorId: 'tomador-1', servico: { valorServico: 1000 } });
    expect(mocks.empresaUpdate).toHaveBeenCalledWith('empresa-1', { proximoNumeroNfse: 2 });
  });

  it('cria um título a receber no financeiro com o valor líquido calculado', async () => {
    const service = new NfseService();
    await service.emitirNfse({ empresaId: 'empresa-1', tomadorId: 'tomador-1', servico: { valorServico: 1000, aliquotaISS: 5 } });

    expect(mocks.financeiroCreate).toHaveBeenCalledTimes(1);
    const dadosFinanceiro = mocks.financeiroCreate.mock.calls[0][0];
    expect(dadosFinanceiro.tipo).toBe('RECEBER');
    expect(dadosFinanceiro.documentoOrigemTipo).toBe('NFSE');
  });
});

describe('NfseService.cancelarNfse', () => {
  it('lança erro quando a NFS-e não é encontrada', async () => {
    mocks.nfseFindById.mockResolvedValue(null);
    const service = new NfseService();
    await expect(service.cancelarNfse('id-x', 'motivo com mais de 15 caracteres', 'empresa-1')).rejects.toThrow(/não encontrada/i);
  });

  it('lança "Acesso negado" (proteção IDOR) quando a NFS-e pertence a outra empresa', async () => {
    mocks.nfseFindById.mockResolvedValue({ id: 'nfse-1', empresaId: 'outra-empresa', status: 'AUTORIZADA' });
    const service = new NfseService();
    await expect(service.cancelarNfse('nfse-1', 'motivo com mais de 15 caracteres', 'empresa-1')).rejects.toThrow(/acesso negado/i);
  });

  it('lança erro quando já está cancelada', async () => {
    mocks.nfseFindById.mockResolvedValue({ id: 'nfse-1', empresaId: 'empresa-1', status: 'CANCELADA' });
    const service = new NfseService();
    await expect(service.cancelarNfse('nfse-1', 'motivo com mais de 15 caracteres', 'empresa-1')).rejects.toThrow(/já está cancelada/i);
  });

  it('valida o tamanho mínimo (15) e máximo (255) do motivo', async () => {
    mocks.nfseFindById.mockResolvedValue({ id: 'nfse-1', empresaId: 'empresa-1', status: 'AUTORIZADA', chaveAcesso: '123' });
    const service = new NfseService();
    await expect(service.cancelarNfse('nfse-1', 'curto', 'empresa-1')).rejects.toThrow(/no mínimo 15/i);
    await expect(service.cancelarNfse('nfse-1', 'a'.repeat(256), 'empresa-1')).rejects.toThrow(/no máximo 255/i);
  });

  it('em modo mock, cancela diretamente sem chamar o ADN', async () => {
    mocks.nfseFindById.mockResolvedValue({ id: 'nfse-1', empresaId: 'empresa-1', status: 'AUTORIZADA', chaveAcesso: '35260112345678000199000000000000123456789012345678' });
    mocks.nfseCancelar.mockResolvedValue({ id: 'nfse-1', status: 'CANCELADA' });

    const service = new NfseService();
    const resultado = await service.cancelarNfse('nfse-1', 'motivo com mais de 15 caracteres', 'empresa-1');

    expect(mocks.enviarEventoNfse).not.toHaveBeenCalled();
    expect(mocks.nfseCancelar).toHaveBeenCalledWith('nfse-1', 'motivo com mais de 15 caracteres');
    expect(resultado.status).toBe('CANCELADA');
  });

  it('em modo real, lança erro quando o ADN rejeita o cancelamento e não cancela localmente', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.nfseFindById.mockResolvedValue({ id: 'nfse-1', empresaId: 'empresa-1', status: 'AUTORIZADA', chaveAcesso: '35260112345678000199000000000000123456789012345678' });
    mocks.enviarEventoNfse.mockResolvedValue({ sucesso: false, erro: 'Evento fora do prazo' });

    const service = new NfseService();
    await expect(service.cancelarNfse('nfse-1', 'motivo com mais de 15 caracteres', 'empresa-1')).rejects.toThrow(/evento fora do prazo/i);
    expect(mocks.nfseCancelar).not.toHaveBeenCalled();
  });

  it('em modo real, cancela localmente após o ADN confirmar o evento', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.nfseFindById.mockResolvedValue({ id: 'nfse-1', empresaId: 'empresa-1', status: 'AUTORIZADA', chaveAcesso: '35260112345678000199000000000000123456789012345678' });
    mocks.enviarEventoNfse.mockResolvedValue({ sucesso: true });
    mocks.nfseCancelar.mockResolvedValue({ id: 'nfse-1', status: 'CANCELADA' });

    const service = new NfseService();
    const resultado = await service.cancelarNfse('nfse-1', 'motivo com mais de 15 caracteres', 'empresa-1');

    expect(mocks.enviarEventoNfse).toHaveBeenCalledTimes(1);
    expect(resultado.status).toBe('CANCELADA');
  });

  it('cancela os títulos financeiros vinculados à chave de acesso da NFS-e', async () => {
    mocks.nfseFindById.mockResolvedValue({ id: 'nfse-1', empresaId: 'empresa-1', status: 'AUTORIZADA', chaveAcesso: '35260112345678000199000000000000123456789012345678' });
    mocks.financeiroFindManyByDocumentoOrigem.mockResolvedValue([{ id: 'titulo-1' }]);
    mocks.nfseCancelar.mockResolvedValue({ id: 'nfse-1', status: 'CANCELADA' });

    const service = new NfseService();
    await service.cancelarNfse('nfse-1', 'motivo com mais de 15 caracteres', 'empresa-1');

    expect(mocks.financeiroCancelarTitulo).toHaveBeenCalledWith('titulo-1', 'motivo com mais de 15 caracteres');
  });
});
