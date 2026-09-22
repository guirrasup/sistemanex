// backend/test/integration/sefaz.statusServico.integration.test.ts
//
// Teste de integração REAL com a SEFAZ em homologação: consulta o status do
// serviço (NFeStatusServico4 / CTeStatusServico / MDFeStatusServico) via SOAP
// com autenticação mTLS usando um certificado ICP-Brasil A1 de verdade.
//
// Não emite nenhum documento fiscal — é apenas um teste de conectividade e de
// que o handshake mTLS com o certificado fornecido é aceito pela SEFAZ. Isso já
// é suficiente para validar, de ponta a ponta, that: o certificado é válido e
// confiável pela cadeia ICP-Brasil, os endpoints resolvidos em
// src/config/*Endpoints.ts estão corretos para a UF testada, e o cliente SOAP
// (sefazSoapClient.ts) monta envelopes que a SEFAZ aceita.
//
// Roda apenas quando configuracaoDisponivel() é true (veja
// test/integration/helpers/certificadoTeste.ts e README.md deste diretório).
// Sem um certificado real, describe.skipIf pula estes testes inteiramente —
// eles NUNCA são simulados ou dados como "passando" sem uma resposta real da SEFAZ.
import { describe, it, expect } from 'vitest';
import { consultarStatusServico } from '../../src/services/nfeSefazClient.js';
import { consultarStatusServicoCte } from '../../src/services/cteSefazClient.js';
import { consultarStatusServicoMdfe } from '../../src/services/mdfeSefazClient.js';
import { configuracaoDisponivel, carregarConfiguracao } from './helpers/certificadoTeste.js';

describe.skipIf(!configuracaoDisponivel())('SEFAZ homologação — status do serviço (mTLS real)', () => {
  it('NFeStatusServico4: responde com um cStat numérico usando o certificado real', async () => {
    const { uf, cUF, chaveECertificado } = carregarConfiguracao();

    const resultado = await consultarStatusServico({
      uf,
      ambiente: 'homologacao',
      cUF,
      mtls: { cert: chaveECertificado.certPem, key: chaveECertificado.privateKeyPem },
    });

    expect(resultado.cStat).toMatch(/^\d{3}$/);
    expect(typeof resultado.online).toBe('boolean');
  });

  it('CTeStatusServico: responde com um cStat numérico usando o certificado real', async () => {
    const { uf, cUF, chaveECertificado } = carregarConfiguracao();

    const resultado = await consultarStatusServicoCte({
      uf,
      ambiente: 'homologacao',
      cUF,
      mtls: { cert: chaveECertificado.certPem, key: chaveECertificado.privateKeyPem },
    });

    expect(resultado.cStat).toMatch(/^\d{3}$/);
  });

  it('MDFeStatusServico: responde com um cStat numérico usando o certificado real (autorizador único SVRS/RS)', async () => {
    const { uf, cUF, chaveECertificado } = carregarConfiguracao();

    const resultado = await consultarStatusServicoMdfe({
      uf,
      ambiente: 'homologacao',
      cUF,
      mtls: { cert: chaveECertificado.certPem, key: chaveECertificado.privateKeyPem },
    });

    expect(resultado.cStat).toMatch(/^\d{3}$/);
  });
});
