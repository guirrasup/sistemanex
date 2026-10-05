// backend/src/config/nfseMunicipiosWebservicePropio.ts
// Alguns municípios/UFs mantêm webservice PRÓPRIO de NFS-e (mesma DPS/XSD do
// Padrão Nacional, mas protocolo SOAP e URL específicos), em vez de aceitar a
// DPS pelo Emissor Nacional público (ADN/SEFIN — ver nfseAdnEndpoints.ts).
// Enviar a DPS pra URL genérica do ADN nesses casos é rejeitado com
// "[E0037] O código do município emissor informado na DPS é inexistente no
// cadastro de convênio municipal do sistema nacional" — confirmado em teste
// real (DF). Distinção real: "aderir ao convênio de compartilhamento de dados
// com o ADN" (a maioria dos municípios, incl. SP e DF) é diferente de "aceitar
// emissão de DPS direto pelo Emissor Nacional público" (só quem NÃO mantém
// webservice próprio).
//
// Fonte (DF): comunicado da SEEC/DF + Manual de Integração NFS-e Padrão
// Nacional v1.01 (plataforma NotaControl/ISS.net Online), confirmado ao vivo
// contra o WSDL real do webservice de homologação.
export interface WebservicePropioConfig {
  homologacao: string;
  producao: string;
}

const MUNICIPIOS_WEBSERVICE_PROPRIO: Record<string, WebservicePropioConfig> = {
  // Brasília/DF
  '5300108': {
    homologacao: 'https://nfse.issnetonline.com.br/wsnfsenacional/homologacao/nfse.asmx',
    producao: 'https://nfse.fazenda.df.gov.br/wsnfsenacional/nfse.asmx',
  },
};

export function obterWebservicePropio(codigoMunicipio: string): WebservicePropioConfig | undefined {
  return MUNICIPIOS_WEBSERVICE_PROPRIO[codigoMunicipio];
}
