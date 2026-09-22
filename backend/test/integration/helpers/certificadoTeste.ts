// backend/test/integration/helpers/certificadoTeste.ts
//
// Carrega, a partir de variáveis de ambiente, o certificado ICP-Brasil A1 real
// usado pelos testes de integração com a SEFAZ em homologação. Não existe (nem
// pode existir) um certificado "de teste" que a SEFAZ aceite — o mTLS exige uma
// cadeia confiável emitida por uma AC credenciada — então esses testes só rodam
// quando o operador fornece um certificado de verdade via:
//
//   SEFAZ_INTEGRATION_TESTS=true
//   SEFAZ_TEST_CERT_PFX_PATH=/caminho/para/certificado.pfx
//   SEFAZ_TEST_CERT_SENHA=senha-do-pfx
//   SEFAZ_TEST_UF=SP              (UF do certificado/empresa)
//   SEFAZ_TEST_CUF=35             (código IBGE da UF, 2 dígitos)
//
// Sem essas variáveis, configuracaoDisponivel() retorna false e os describes
// correspondentes são pulados (describe.skipIf) — não fingimos sucesso nem
// fabricamos uma resposta simulada.
import { readFileSync } from 'fs';
import { extrairChaveECertificadoDoPfx, type ChaveECertificadoPem } from '../../../src/utils/xmlSigner.js';

export interface ConfiguracaoTesteIntegracao {
  uf: string;
  cUF: string;
  chaveECertificado: ChaveECertificadoPem;
}

export function configuracaoDisponivel(): boolean {
  return (
    process.env.SEFAZ_INTEGRATION_TESTS === 'true' &&
    !!process.env.SEFAZ_TEST_CERT_PFX_PATH &&
    !!process.env.SEFAZ_TEST_CERT_SENHA &&
    !!process.env.SEFAZ_TEST_UF &&
    !!process.env.SEFAZ_TEST_CUF
  );
}

export function carregarConfiguracao(): ConfiguracaoTesteIntegracao {
  if (!configuracaoDisponivel()) {
    throw new Error(
      'Testes de integração SEFAZ não configurados. Defina SEFAZ_INTEGRATION_TESTS=true, ' +
      'SEFAZ_TEST_CERT_PFX_PATH, SEFAZ_TEST_CERT_SENHA, SEFAZ_TEST_UF e SEFAZ_TEST_CUF ' +
      '(veja test/integration/README.md).'
    );
  }

  const pfxBuffer = readFileSync(process.env.SEFAZ_TEST_CERT_PFX_PATH as string);
  const chaveECertificado = extrairChaveECertificadoDoPfx(pfxBuffer, process.env.SEFAZ_TEST_CERT_SENHA as string);

  return {
    uf: process.env.SEFAZ_TEST_UF as string,
    cUF: process.env.SEFAZ_TEST_CUF as string,
    chaveECertificado,
  };
}
