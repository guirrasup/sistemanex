// backend/src/config/nfseAdnEndpoints.ts
// Endereços da API REST do Sistema Nacional NFS-e (SEFIN Nacional / ADN), único
// autorizador nacional — não há tabela por UF/município como em NFe/CTe/MDFe.
//
// Fonte oficial: https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/apis-prod-restrita-e-producao
// ⚠️ Note a diferença real de path entre os ambientes: produção restrita (homologação)
// tem um prefixo "/API" que a produção não tem — confirmado na página oficial.

export type AmbienteAdn = 'homologacao' | 'producao';

const BASE_URL: Record<AmbienteAdn, string> = {
  homologacao: 'https://sefin.producaorestrita.nfse.gov.br/API/SefinNacional',
  producao: 'https://sefin.nfse.gov.br/SefinNacional',
};

export function obterBaseUrlSefinNacional(ambiente: AmbienteAdn): string {
  return BASE_URL[ambiente];
}
