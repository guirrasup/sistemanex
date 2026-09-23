// backend/src/services/__tests__/mdfe.service.test.ts
//
// Testes dos caminhos críticos de emissão/encerramento/cancelamento de MDF-e:
// guardas de segurança (empresa/emitente/limites de documentos), a bifurcação
// mock vs. transmissão real (SEFAZ_TRANSMISSAO_REAL) e as transições de status
// (RASCUNHO → ASSINADA/AUTORIZADA/REJEITADA, AUTORIZADA → ENCERRADA/CANCELADA).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  mdfeCreate: vi.fn(),
  mdfeFindById: vi.fn(),
  mdfeUpdateStatus: vi.fn(),
  mdfeEncerrar: vi.fn(),
  mdfeCancelar: vi.fn(),
  createManyMunCarrega: vi.fn(),
  createMunDescarga: vi.fn(),
  createHistoricoStatus: vi.fn(),
  clienteFindById: vi.fn(),
  empresaFindById: vi.fn(),
  empresaUpdate: vi.fn(),
  obterCertificadoDecriptado: vi.fn(),
  extrairChaveECertificadoDoPfx: vi.fn(),
  assinarXmlEnvelopado: vi.fn(),
  autorizarMdfe: vi.fn(),
  enviarEventoMdfe: vi.fn(),
}));

vi.mock('../../repositories/mdfe.repository.js', () => ({
  MdfeRepository: vi.fn().mockImplementation(() => ({
    create: mocks.mdfeCreate,
    findById: mocks.mdfeFindById,
    updateStatus: mocks.mdfeUpdateStatus,
    encerrar: mocks.mdfeEncerrar,
    cancelar: mocks.mdfeCancelar,
  })),
}));
vi.mock('../../repositories/mdfe.component.repository.js', () => ({
  MdfeComponentRepository: vi.fn().mockImplementation(() => ({
    createManyMunCarrega: mocks.createManyMunCarrega,
    createMunDescarga: mocks.createMunDescarga,
    createHistoricoStatus: mocks.createHistoricoStatus,
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
vi.mock('../certificado.service.js', () => ({
  CertificadoService: vi.fn().mockImplementation(() => ({
    obterCertificadoDecriptado: mocks.obterCertificadoDecriptado,
  })),
}));
vi.mock('../../utils/xmlSigner.js', () => ({
  extrairChaveECertificadoDoPfx: mocks.extrairChaveECertificadoDoPfx,
  assinarXmlEnvelopado: mocks.assinarXmlEnvelopado,
}));
vi.mock('../mdfeSefazClient.js', () => ({
  autorizarMdfe: mocks.autorizarMdfe,
  enviarEventoMdfe: mocks.enviarEventoMdfe,
}));

const { MdfeService } = await import('../mdfe.service.js');

const CHAVE_E_CERT = { privateKeyPem: 'PEM-CHAVE', certPem: 'PEM-CERT' };

function criarEmpresa(overrides: Record<string, any> = {}) {
  return {
    id: 'empresa-1',
    cnpj: '18236447000190',
    uf: 'SP',
    codigoUF: '35',
    ambienteEmissao: 'HOMOLOGACAO',
    serieMdfe: 1,
    proximoNumeroMdfe: 1,
    inscricaoEstadual: '110042490114',
    razaoSocial: 'Empresa Teste LTDA',
    nomeFantasia: 'Empresa Teste',
    endereco: {
      logradouro: 'Rua da Empresa', numero: '100', bairro: 'Centro',
      codigoMunicipio: '3550308', nomeMunicipio: 'São Paulo', uf: 'SP', cep: '01000000',
    },
    certificado: { status: 'VALIDO' },
    ...overrides,
  };
}

function criarInputBase(overrides: Record<string, any> = {}) {
  return {
    empresaId: 'empresa-1',
    emitenteId: 'emitente-1',
    municipiosCarrega: [{ codigo: '3550308', nome: 'São Paulo' }],
    municipiosDescarga: [{ codigo: '3304557', nome: 'Rio de Janeiro' }],
    modal: 'RODOVIARIO',
    tpEmit: 'PRESTADOR_SERVICO',
    UFIni: 'SP',
    UFFim: 'RJ',
    tpCarga: 'GRANEL_SOLIDO',
    xProd: 'Materiais diversos',
    ...overrides,
  } as any; // os enums do Prisma (ModalMDFe, TipoEmitenteMDFe, TipoCargaMDFe) não são
  // relevantes aqui: os repositórios estão mockados e não validam esses valores em runtime.
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
  mocks.clienteFindById.mockResolvedValue({ id: 'emitente-1', empresaId: 'empresa-1', razaoSocial: 'Transportadora Teste', documento: '18236447000190', endereco: { logradouro: 'Rua X', numero: '1', bairro: 'Centro', codigoMunicipio: '3550308', nomeMunicipio: 'São Paulo', uf: 'SP', cep: '01000000' } });
  mocks.mdfeCreate.mockImplementation((dados: any) => Promise.resolve({ id: 'mdfe-1', ...dados, dhEmi: new Date() }));
  mocks.createManyMunCarrega.mockResolvedValue({});
  mocks.createMunDescarga.mockResolvedValue({ id: 'mun-desc-1' });
  mocks.createHistoricoStatus.mockResolvedValue({});
  mocks.mdfeUpdateStatus.mockImplementation((id: string, status: string) => Promise.resolve({ id, status }));
});

afterEach(() => {
  if (ENV_ORIGINAL === undefined) delete process.env.SEFAZ_TRANSMISSAO_REAL;
  else process.env.SEFAZ_TRANSMISSAO_REAL = ENV_ORIGINAL;
});

describe('MdfeService.emitirMdfe', () => {
  it('lança erro quando a empresa não é encontrada', async () => {
    mocks.empresaFindById.mockResolvedValue(null);
    const service = new MdfeService();
    await expect(service.emitirMdfe(criarInputBase())).rejects.toThrow(/empresa não encontrada/i);
  });

  it('lança erro quando o certificado digital está ausente ou inválido', async () => {
    mocks.empresaFindById.mockResolvedValue(criarEmpresa({ certificado: null }));
    const service = new MdfeService();
    await expect(service.emitirMdfe(criarInputBase())).rejects.toThrow(/certificado digital/i);
  });

  it('lança erro quando o emitente não é encontrado', async () => {
    mocks.clienteFindById.mockResolvedValue(null);
    const service = new MdfeService();
    await expect(service.emitirMdfe(criarInputBase())).rejects.toThrow(/emitente não encontrado/i);
  });

  it('lança erro quando o emitente pertence a outra empresa (proteção IDOR)', async () => {
    mocks.clienteFindById.mockResolvedValue({ id: 'emitente-1', empresaId: 'empresa-outra' });
    const service = new MdfeService();
    await expect(service.emitirMdfe(criarInputBase())).rejects.toThrow(/não pertence à empresa/i);
  });

  it('lança erro quando nenhum município de carregamento é informado', async () => {
    const service = new MdfeService();
    await expect(service.emitirMdfe(criarInputBase({ municipiosCarrega: [] }))).rejects.toThrow(/município de carregamento/i);
  });

  it('lança erro quando nenhum município de descarga é informado', async () => {
    const service = new MdfeService();
    await expect(service.emitirMdfe(criarInputBase({ municipiosDescarga: [] }))).rejects.toThrow(/município de descarga/i);
  });

  it('em modo mock, fica com status ASSINADA e não chama a SEFAZ', async () => {
    const service = new MdfeService();
    const resultado = await service.emitirMdfe(criarInputBase());

    expect(mocks.autorizarMdfe).not.toHaveBeenCalled();
    expect(mocks.mdfeUpdateStatus).toHaveBeenCalledWith('mdfe-1', 'ASSINADA', undefined, expect.stringContaining('<Signature>MOCK</Signature>'), undefined);
    expect(resultado.status).toBe('ASSINADA');
  });

  it('lança erro quando o certificado não pode ser decriptado', async () => {
    mocks.obterCertificadoDecriptado.mockResolvedValue(null);
    const service = new MdfeService();
    await expect(service.emitirMdfe(criarInputBase())).rejects.toThrow(/certificado digital não configurado/i);
  });

  it('com SEFAZ_TRANSMISSAO_REAL=true e autorização, atualiza status para AUTORIZADA com o protocolo real', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.autorizarMdfe.mockResolvedValue({ autorizado: true, nProt: '158260000012345', xmlRetorno: '<retMDFe/>' });

    const service = new MdfeService();
    const resultado = await service.emitirMdfe(criarInputBase());

    expect(resultado.status).toBe('AUTORIZADA');
    expect(mocks.mdfeUpdateStatus).toHaveBeenCalledWith('mdfe-1', 'AUTORIZADA', '158260000012345', expect.any(String), undefined);
  });

  it('com SEFAZ_TRANSMISSAO_REAL=true e rejeição, marca REJEITADA e lança erro com o motivo', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.autorizarMdfe.mockResolvedValue({ autorizado: false, xMotivo: 'UF de percurso inválida', xmlRetorno: '<retMDFe/>' });

    const service = new MdfeService();
    await expect(service.emitirMdfe(criarInputBase())).rejects.toThrow(/uf de percurso inválida/i);
    expect(mocks.mdfeUpdateStatus).toHaveBeenCalledWith('mdfe-1', 'REJEITADA', undefined, expect.any(String), 'UF de percurso inválida');
  });

  it('registra o histórico de status mesmo quando a SEFAZ rejeita', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.autorizarMdfe.mockResolvedValue({ autorizado: false, xMotivo: 'Rejeitado', xmlRetorno: '<retMDFe/>' });

    const service = new MdfeService();
    await expect(service.emitirMdfe(criarInputBase())).rejects.toThrow();
    expect(mocks.createHistoricoStatus).toHaveBeenCalledWith(expect.objectContaining({ statusNovo: 'REJEITADA' }));
  });

  it('incrementa o próximo número de MDF-e da empresa', async () => {
    mocks.empresaFindById.mockResolvedValue(criarEmpresa({ proximoNumeroMdfe: 4 }));
    const service = new MdfeService();
    await service.emitirMdfe(criarInputBase());
    expect(mocks.empresaUpdate).toHaveBeenCalledWith('empresa-1', { proximoNumeroMdfe: 5 });
  });
});

describe('MdfeService.encerrarMdfe', () => {
  it('lança erro quando o MDF-e não é encontrado', async () => {
    mocks.mdfeFindById.mockResolvedValue(null);
    const service = new MdfeService();
    await expect(service.encerrarMdfe('id-x', 'protocolo', 'municipio', 'empresa-1')).rejects.toThrow(/não encontrado/i);
  });

  it('lança "Acesso negado" quando o MDF-e pertence a outra empresa', async () => {
    mocks.mdfeFindById.mockResolvedValue({ id: 'mdfe-1', empresaId: 'outra-empresa', status: 'AUTORIZADA' });
    const service = new MdfeService();
    await expect(service.encerrarMdfe('mdfe-1', 'protocolo', 'municipio', 'empresa-1')).rejects.toThrow(/acesso negado/i);
  });

  it('lança erro quando o MDF-e não está autorizado', async () => {
    mocks.mdfeFindById.mockResolvedValue({ id: 'mdfe-1', empresaId: 'empresa-1', status: 'ASSINADA' });
    const service = new MdfeService();
    await expect(service.encerrarMdfe('mdfe-1', 'protocolo', 'municipio', 'empresa-1')).rejects.toThrow(/deve estar autorizado/i);
  });

  it('encerra um MDF-e autorizado e registra o histórico de status', async () => {
    mocks.mdfeFindById.mockResolvedValue({ id: 'mdfe-1', empresaId: 'empresa-1', status: 'AUTORIZADA' });
    // O repositório real usa prisma.$transaction([update, create]), que resolve
    // para uma tupla [MDFe, EncerramentoMDFe] — o service repassa esse valor como está.
    mocks.mdfeEncerrar.mockResolvedValue([{ id: 'mdfe-1', status: 'ENCERRADA' }, { id: 'encerramento-1' }]);

    const service = new MdfeService();
    const resultado: any = await service.encerrarMdfe('mdfe-1', 'protocolo-123', 'municipio-x', 'empresa-1');

    expect(mocks.mdfeEncerrar).toHaveBeenCalledWith('mdfe-1', 'protocolo-123', 'municipio-x');
    expect(mocks.createHistoricoStatus).toHaveBeenCalledWith(expect.objectContaining({ statusNovo: 'ENCERRADA' }));
    expect(resultado[0].status).toBe('ENCERRADA');
  });

  it('em modo real, exige protocolo de autorização e o código IBGE do município de encerramento', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.mdfeFindById.mockResolvedValue({ id: 'mdfe-1', empresaId: 'empresa-1', status: 'AUTORIZADA', protocoloAutorizacao: null });

    const service = new MdfeService();
    await expect(service.encerrarMdfe('mdfe-1', 'protocolo-123', 'municipio-x', 'empresa-1')).rejects.toThrow(/sem protocolo de autorização/i);
    expect(mocks.enviarEventoMdfe).not.toHaveBeenCalled();

    mocks.mdfeFindById.mockResolvedValue({ id: 'mdfe-1', empresaId: 'empresa-1', status: 'AUTORIZADA', protocoloAutorizacao: '158260000012345' });
    await expect(service.encerrarMdfe('mdfe-1', 'protocolo-123', 'municipio-x', 'empresa-1')).rejects.toThrow(/código ibge do município/i);
  });

  it('em modo real, lança erro quando a SEFAZ rejeita o encerramento e não registra localmente', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.mdfeFindById.mockResolvedValue({
      id: 'mdfe-1', empresaId: 'empresa-1', status: 'AUTORIZADA',
      protocoloAutorizacao: '158260000012345', chaveAcesso: '35260118236447000190580010000000011123456789',
    });
    mocks.enviarEventoMdfe.mockResolvedValue({ sucesso: false, cStat: '573', xMotivo: 'Duplicidade de evento', xmlRetorno: '<retEvento/>' });

    const service = new MdfeService();
    await expect(service.encerrarMdfe('mdfe-1', 'protocolo-123', 'São Paulo', 'empresa-1', '3550308')).rejects.toThrow(/duplicidade de evento/i);
    expect(mocks.mdfeEncerrar).not.toHaveBeenCalled();
  });

  it('em modo real, transmite o evento de encerramento e usa o protocolo devolvido pela SEFAZ', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.mdfeFindById.mockResolvedValue({
      id: 'mdfe-1', empresaId: 'empresa-1', status: 'AUTORIZADA',
      protocoloAutorizacao: '158260000012345', chaveAcesso: '35260118236447000190580010000000011123456789',
    });
    mocks.enviarEventoMdfe.mockResolvedValue({ sucesso: true, cStat: '135', nProt: '158260000099999', xmlRetorno: '<retEvento/>' });
    mocks.mdfeEncerrar.mockResolvedValue([{ id: 'mdfe-1', status: 'ENCERRADA' }, { id: 'encerramento-1' }]);

    const service = new MdfeService();
    await service.encerrarMdfe('mdfe-1', 'protocolo-informado-pelo-usuario', 'São Paulo', 'empresa-1', '3550308');

    expect(mocks.enviarEventoMdfe).toHaveBeenCalledTimes(1);
    expect(mocks.mdfeEncerrar).toHaveBeenCalledWith('mdfe-1', '158260000099999', 'São Paulo');
  });
});

describe('MdfeService.cancelarMdfe', () => {
  it('lança erro quando já está cancelado', async () => {
    mocks.mdfeFindById.mockResolvedValue({ id: 'mdfe-1', empresaId: 'empresa-1', status: 'CANCELADA' });
    const service = new MdfeService();
    await expect(service.cancelarMdfe('mdfe-1', 'motivo', 'empresa-1')).rejects.toThrow(/já está cancelado/i);
  });

  it('lança erro quando o MDF-e já foi encerrado', async () => {
    mocks.mdfeFindById.mockResolvedValue({ id: 'mdfe-1', empresaId: 'empresa-1', status: 'ENCERRADA' });
    const service = new MdfeService();
    await expect(service.cancelarMdfe('mdfe-1', 'motivo', 'empresa-1')).rejects.toThrow(/encerrado não pode ser cancelado/i);
  });

  it('cancela um MDF-e ainda não encerrado/cancelado e registra o histórico', async () => {
    mocks.mdfeFindById.mockResolvedValue({ id: 'mdfe-1', empresaId: 'empresa-1', status: 'AUTORIZADA' });
    mocks.mdfeCancelar.mockResolvedValue({ id: 'mdfe-1', status: 'CANCELADA' });

    const service = new MdfeService();
    const resultado = await service.cancelarMdfe('mdfe-1', 'motivo do cancelamento', 'empresa-1');

    expect(mocks.mdfeCancelar).toHaveBeenCalledWith('mdfe-1', 'motivo do cancelamento');
    expect(resultado.status).toBe('CANCELADA');
  });

  it('em modo real, exige protocolo de autorização antes de transmitir o cancelamento', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.mdfeFindById.mockResolvedValue({ id: 'mdfe-1', empresaId: 'empresa-1', status: 'AUTORIZADA', protocoloAutorizacao: null });

    const service = new MdfeService();
    await expect(service.cancelarMdfe('mdfe-1', 'motivo do cancelamento', 'empresa-1')).rejects.toThrow(/sem protocolo de autorização/i);
    expect(mocks.enviarEventoMdfe).not.toHaveBeenCalled();
  });

  it('em modo real, lança erro quando a SEFAZ rejeita o cancelamento e não cancela localmente', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.mdfeFindById.mockResolvedValue({
      id: 'mdfe-1', empresaId: 'empresa-1', status: 'AUTORIZADA',
      protocoloAutorizacao: '158260000012345', chaveAcesso: '35260118236447000190580010000000011123456789',
    });
    mocks.enviarEventoMdfe.mockResolvedValue({ sucesso: false, cStat: '573', xMotivo: 'Duplicidade de evento', xmlRetorno: '<retEvento/>' });

    const service = new MdfeService();
    await expect(service.cancelarMdfe('mdfe-1', 'motivo do cancelamento', 'empresa-1')).rejects.toThrow(/duplicidade de evento/i);
    expect(mocks.mdfeCancelar).not.toHaveBeenCalled();
  });

  it('em modo real, transmite o evento de cancelamento à SEFAZ antes de cancelar localmente', async () => {
    process.env.SEFAZ_TRANSMISSAO_REAL = 'true';
    mocks.mdfeFindById.mockResolvedValue({
      id: 'mdfe-1', empresaId: 'empresa-1', status: 'AUTORIZADA',
      protocoloAutorizacao: '158260000012345', chaveAcesso: '35260118236447000190580010000000011123456789',
    });
    mocks.enviarEventoMdfe.mockResolvedValue({ sucesso: true, cStat: '135', xMotivo: 'Evento registrado', xmlRetorno: '<retEvento/>' });
    mocks.mdfeCancelar.mockResolvedValue({ id: 'mdfe-1', status: 'CANCELADA' });

    const service = new MdfeService();
    const resultado = await service.cancelarMdfe('mdfe-1', 'motivo do cancelamento', 'empresa-1');

    expect(mocks.enviarEventoMdfe).toHaveBeenCalledTimes(1);
    expect(mocks.mdfeCancelar).toHaveBeenCalledWith('mdfe-1', 'motivo do cancelamento');
    expect(resultado.status).toBe('CANCELADA');
  });
});
