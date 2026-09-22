# Testes de integração — SEFAZ homologação (reais)

Estes testes fazem chamadas de rede reais aos webservices de homologação da
SEFAZ (NFe, CT-e, MDF-e), autenticadas por mTLS com um certificado digital
ICP-Brasil A1. Eles são **separados** dos testes de unidade (`npm test`), não
rodam no CI por padrão, e exigem que o operador forneça:

1. Um certificado A1 (`.pfx`) genuíno, emitido por uma Autoridade Certificadora
   credenciada à ICP-Brasil, com o CNPJ associado devidamente habilitado para
   emissão de documentos fiscais eletrônicos no ambiente de homologação da UF
   testada. **Não existe certificado de teste "fake" que a SEFAZ aceite** — o
   handshake mTLS exige uma cadeia de confiança real.
2. As variáveis de ambiente abaixo.

## Como rodar

```bash
export SEFAZ_INTEGRATION_TESTS=true
export SEFAZ_TEST_CERT_PFX_PATH=/caminho/para/certificado.pfx
export SEFAZ_TEST_CERT_SENHA='senha-do-pfx'
export SEFAZ_TEST_UF=SP        # UF do certificado/empresa
export SEFAZ_TEST_CUF=35       # código IBGE da UF (2 dígitos)

npm run test:integration
```

Sem `SEFAZ_INTEGRATION_TESTS=true` (ou sem as demais variáveis), todos os
`describe` destes testes são pulados via `describe.skipIf(...)` — eles nunca
são simulados nem reportados como "passando" sem uma resposta real da SEFAZ.

## O que é (e o que não é) testado aqui

`sefaz.statusServico.integration.test.ts` consulta o status do serviço
(`NFeStatusServico4` / `CTeStatusServico` / `MDFeStatusServico`) — uma chamada
somente-leitura, sem efeitos colaterais, que já valida de ponta a ponta:

- que o certificado fornecido é aceito no handshake mTLS pela SEFAZ real;
- que os endpoints resolvidos em `src/config/*Endpoints.ts` para a UF testada
  estão corretos;
- que o cliente SOAP (`src/services/sefazSoapClient.ts`) monta envelopes que a
  SEFAZ aceita e consegue interpretar a resposta.

Isso **não** cobre a emissão real de um documento fiscal (autorização de
NF-e/CT-e/MDF-e), porque isso consome numeração sequencial real vinculada ao
CNPJ do certificado no ambiente de homologação daquela UF — não é algo que
deva rodar automaticamente sem uma decisão explícita do operador sobre qual
CNPJ/numeração usar. Se for necessário validar a emissão ponta a ponta,
escreva um teste adicional (seguindo o mesmo padrão de
`helpers/certificadoTeste.ts`) que chame `autorizarNfe`/`autorizarCte`/
`autorizarMdfe` com um XML de teste gerado e assinado na hora, e rode-o
manualmente e de forma consciente — não como parte de uma suíte automatizada.
