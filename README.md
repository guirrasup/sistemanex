# 🚀 SISTEMANEX — ERP & SISTEMA DE EMISSÃO DE DOCUMENTOS FISCAIS

**Versão:** 2026.1  
**Status:** 🟢 Pronto para Produção  
**Licença:** Apache-2.0  
**Idioma:** Português (Brasil)

---

## 📋 SUMÁRIO

- [Visão Geral](#visão-geral)
- [Principais Funcionalidades](#principais-funcionalidades)
- [Documentos Fiscais Suportados](#documentos-fiscais-suportados)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitetura](#arquitetura)
- [Referência da API](#referência-da-api)
- [Módulos Fiscais](#módulos-fiscais)
- [Motor de Cálculo Tributário](#motor-de-cálculo-tributário)
- [Segurança](#segurança)
- [Referências Oficiais](#referências-oficiais)

---

## 📌 VISÃO GERAL

O **SistemaNEX** é um **ERP (Planejamento de Recursos Empresariais)** e **Sistema de Emissão de Documentos Fiscais** completo, projetado para empresas brasileiras. Ele simplifica a emissão, gestão e arquivamento de todos os documentos fiscais eletrônicos exigidos pelas autoridades fiscais brasileiras (SEFAZ, Receita Federal).

O sistema está em total conformidade com as regulamentações fiscais mais recentes, incluindo:

- NF-e 4.00 (SEFAZ)
- NFS-e Padrão Nacional v1.01 (Receita Federal)
- NFC-e 4.00 (SEFAZ)
- CT-e 3.00 (SEFAZ)
- NFA-e (SEFAZ)
- MDF-e 3.00 (SEFAZ)
- Reforma Tributária 2026 (EC 132/2023 - IBS/CBS)

---

## 🎯 PRINCIPAIS FUNCIONALIDADES

**Autenticação:** JWT com controle de acesso por perfil (Admin, Fiscal, Operador)

**Emissão Fiscal:** Emissão em tempo real de NF-e, NFS-e, NFC-e, CT-e, NFA-e e MDF-e

**Assinatura Digital:** Certificados ICP-Brasil A1/A3 com assinatura XMLDSig

**Motor de Cálculo:** Cálculo automatizado de ICMS, ISSQN, PIS, COFINS, IPI, IBS e CBS

**Dashboard:** Métricas financeiras, estatísticas e indicadores de crescimento

**Gestão Financeira:** Contas a receber/pagar com geração de QR Code PIX

**Controle de Estoque:** Gestão com alertas de estoque crítico

**Gestão de Clientes:** CRM completo com validação fiscal (CPF/CNPJ)

**Gestão de Transportadoras:** Cadastro com RNTRC/ANTT

**Consulta CNPJ:** Dados em tempo real via OpenCNPJ/ReceitaWS

**Arquivo de Documentos:** Repositório centralizado com XML e DANFE

**Alertas do Sistema:** Vencimento de certificado, títulos vencidos, estoque crítico

**Backup e Exportação:** Backup completo com exportação JSON

---

## 📄 DOCUMENTOS FISCAIS SUPORTADOS

**NF-e (Modelo 55)** - Nota Fiscal Eletrônica de Mercadorias
Documento oficial para circulação de mercadorias. Em conformidade com o leiaute 4.00 da SEFAZ.
Site oficial: https://www.nfe.fazenda.gov.br

**NFS-e (Padrão Nacional)** - Nota Fiscal de Serviços Eletrônica
Documento para prestação de serviços conforme padrão nacional DPS v1.01 da Receita Federal.
Site oficial: https://www.gov.br/receitafederal/pt-br/assuntos/nfse

**NFC-e (Modelo 65)** - Nota Fiscal de Consumidor Eletrônica
Cupom fiscal eletrônico para venda ao consumidor final, com QR Code para consulta.
Site oficial: https://www.nfce.fazenda.gov.br

**CT-e (Modelo 57)** - Conhecimento de Transporte Eletrônico
Documento fiscal para prestação de serviços de transporte de cargas.
Site oficial: https://www.cte.fazenda.gov.br

**NFA-e (Série 900)** - Nota Fiscal Avulsa Eletrônica
Documento para produtores rurais, MEI e pessoas físicas sem inscrição estadual.
Site oficial: https://www.nfae.fazenda.gov.br

**MDF-e (Modelo 58)** - Manifesto Eletrônico de Documentos Fiscais
Documento para agrupamento de documentos fiscais no transporte de cargas.
Site oficial: https://www.mdfe.fazenda.gov.br

---

## 🛠 STACK TECNOLÓGICO

**Frontend:** React 18.x, TypeScript 5.x, Vite 4.x, TailwindCSS 3.x, Recharts 2.x, Lucide React, Axios 1.x, QRCode, jsBarcode, React Hot Toast 2.x

**Backend:** Node.js 18.x, Express 4.x, Prisma 5.x, PostgreSQL 14.x, JWT 9.x, Bcrypt 5.x, Node-Forge 1.x, Axios 1.x, Rate Limit 6.x, Helmet 7.x, CORS 2.x

**Ferramentas de Desenvolvimento:** ESLint, Prettier, PostCSS, Docker, Git

---

## 🏗 ARQUITETURA

O sistema segue uma arquitetura de três camadas bem definidas:

**Camada de Apresentação (Frontend React):** Responsável pela interface com o usuário, incluindo os emissores fiscais, cadastros, dashboard e visualizadores de documentos. Utiliza cache com TTL de 30 segundos e fallback para localStorage quando a API está indisponível.

**Camada de API (Backend Express):** Exposição de endpoints RESTful com autenticação JWT, rate limiting e validação de dados. Contém os controladores que orquestram as requisições.

**Camada de Dados (Prisma + PostgreSQL):** ORM para acesso ao banco de dados relacional, com modelos que refletem a estrutura fiscal brasileira.

### Fluxo de Dados

Ação do Usuário → Componente → Service (Axios) → REST API → Controller → Service → Repository → Database → Response → Componente → Atualização UI → Atualização Cache

### Estratégia de Cache

- TTL de 30 segundos
- Estratégia in-memory com stale-while-revalidate
- Refresh automático na emissão/atualização de documentos
- Fallback para localStorage quando API está indisponível

---

## 📡 REFERÊNCIA DA API

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /api/auth/login | Login do usuário |
| POST | /api/auth/register | Registro de novo usuário |
| GET | /api/auth/me | Dados do usuário logado |
| POST | /api/auth/alterar-senha | Alterar senha |
| POST | /api/auth/recuperar-senha | Solicitar recuperação de senha |
| POST | /api/auth/redefinir-senha | Redefinir senha com token |

### NF-e

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/nfe | Listar NF-e com filtros |
| GET | /api/nfe/:id | Buscar NF-e por ID |
| GET | /api/nfe/chave/:chave | Buscar por chave de acesso |
| POST | /api/nfe/emitir | Emitir NF-e |
| POST | /api/nfe/cancelar/:id | Cancelar NF-e |
| GET | /api/nfe/danfe/:id | Gerar DANFE |
| GET | /api/nfe/xml/:id | Baixar XML |
| POST | /api/nfe/carta-correcao | Enviar carta de correção |
| POST | /api/nfe/inutilizar | Inutilizar numeração |

### NFS-e

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/nfse | Listar NFS-e |
| GET | /api/nfse/:id | Buscar por ID |
| GET | /api/nfse/chave/:chave | Buscar por chave |
| POST | /api/nfse/emitir | Emitir NFS-e |
| POST | /api/nfse/cancelar/:id | Cancelar NFS-e |

### NFC-e

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/nfce | Listar NFC-e |
| POST | /api/nfce/emitir | Emitir NFC-e |
| POST | /api/nfce/cancelar/:id | Cancelar NFC-e |

### CT-e

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/cte | Listar CT-e |
| POST | /api/cte/emitir | Emitir CT-e |
| POST | /api/cte/cancelar/:id | Cancelar CT-e |

### NFA-e

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/nfae | Listar NFA-e |
| POST | /api/nfae/emitir | Emitir NFA-e |
| POST | /api/nfae/cancelar/:id | Cancelar NFA-e |

### MDF-e

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/mdfe | Listar MDF-e com filtros |
| GET | /api/mdfe/:id | Buscar MDF-e por ID |
| GET | /api/mdfe/chave/:chave | Buscar por chave de acesso |
| GET | /api/mdfe/estatisticas | Estatísticas por status |
| GET | /api/mdfe/total-carga | Total de carga transportada |
| GET | /api/mdfe/xml/:id | Baixar XML |
| POST | /api/mdfe/emitir | Emitir MDF-e |
| POST | /api/mdfe/cancelar/:id | Cancelar MDF-e |
| POST | /api/mdfe/encerrar/:id | Encerrar MDF-e |

### Cadastros

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| CRUD | /api/clientes | Clientes/Fornecedores |
| CRUD | /api/produtos | Produtos |
| CRUD | /api/servicos | Serviços |
| CRUD | /api/transportadoras | Transportadoras |

### Financeiro

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/financeiro/titulos | Listar títulos |
| GET | /api/financeiro/titulos/pendentes | Títulos pendentes |
| POST | /api/financeiro/titulos/baixar/:id | Baixar título |
| GET | /api/financeiro/resumo | Resumo financeiro |

### Dashboard

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/dashboard | Dados do dashboard |

### CNPJ

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/cnpj/consultar/:cnpj | Consulta CNPJ |

---

## 🧾 MÓDULOS FISCAIS

### NF-e (Modelo 55)

Finalidade: Nota Fiscal de Produtos e Mercadorias
Validação: Schema XSD SEFAZ v4.00
Cálculos: ICMS, PIS, COFINS, IPI, IBS, CBS
Geração: XML assinado + DANFE
Eventos: Cancelamento, Carta de Correção

### NFS-e (Padrão Nacional)

Finalidade: Nota Fiscal de Serviços
Padrão: DPS Nacional v1.01
Cálculos: ISSQN, PIS, COFINS, IRRF, CSLL, INSS, IBS, CBS
Geração: XML assinado + DANFSe

### NFC-e (Modelo 65)

Finalidade: Cupom Fiscal para Consumidor Final
Validação: Schema XSD SEFAZ v4.00
Geração: QR Code para consulta
Pagamentos: Dinheiro, Cartão, PIX

### CT-e (Modelo 57)

Finalidade: Conhecimento de Transporte de Cargas
Validação: Schema XSD SEFAZ v3.00
Cálculos: ICMS, PIS, COFINS
Componentes: Frete Peso, Frete Valor, Pedágio, GRIS

### NFA-e (Série 900)

Finalidade: Nota Fiscal Avulsa (Produtor Rural, MEI, PF)
Emissão: SEFAZ sem certificado digital
Guia: DAE (Documento de Arrecadação Estadual)

### MDF-e (Modelo 58)

Finalidade: Manifesto de Documentos Fiscais
Validação: Schema XSD SEFAZ v3.00
Modal: Rodoviário, Aéreo, Aquaviário, Ferroviário
Documentos: CT-e, NF-e, MDF-e
Eventos: Cancelamento, Encerramento

---

## 🧮 MOTOR DE CÁLCULO TRIBUTÁRIO

### Impostos Federais

**PIS (Programa de Integração Social):** Base de cálculo sobre o valor da operação. Alíquota padrão de 1.65%.

**COFINS (Contribuição para o Financiamento da Seguridade Social):** Base de cálculo sobre o valor da operação. Alíquota padrão de 7.60%.

**IPI (Imposto sobre Produtos Industrializados):** Base de cálculo sobre o valor do produto. Alíquota variável conforme NCM.

**IRRF (Imposto de Renda Retido na Fonte):** Base de cálculo sobre o valor do serviço. Alíquota padrão de 1.5%.

**CSLL (Contribuição Social sobre o Lucro Líquido):** Base de cálculo sobre o valor do serviço. Alíquota padrão de 1.0%.

**INSS (Instituto Nacional do Seguro Social):** Base de cálculo sobre o valor do serviço. Alíquota variável de 0 a 11%.

### Impostos Estaduais

**ICMS (Imposto sobre Circulação de Mercadorias e Serviços):** Base de cálculo sobre o valor da operação. Alíquota padrão de 18% (SP).

**ICMS ST (Substituição Tributária):** Base de cálculo sobre o valor da operação acrescido da MVA (Margem de Valor Agregado). Alíquota variável.

### Impostos Municipais

**ISSQN (Imposto sobre Serviços de Qualquer Natureza):** Base de cálculo sobre o valor do serviço. Alíquota padrão de 2 a 5%.

### Reforma Tributária 2026 (EC 132/2023)

**CBS (Contribuição sobre Bens e Serviços):** Substitui PIS e COFINS. Alíquota padrão de 0.90%.

**IBS (Imposto sobre Bens e Serviços):** Substitui ICMS e ISS. Alíquota padrão de 0.10% (UF + Mun).

---

## 🔒 SEGURANÇA

**Autenticação:** JWT com expiração de 7 dias, armazenado no localStorage

**Autorização:** Controle baseado em perfis (ADMIN, FISCAL, OPERADOR)

**Senhas:** Hash com Bcrypt (salt rounds: 12)

**Certificado Digital:** ICP-Brasil A1/A3 com assinatura XMLDSig (SHA256/RSA)

**Headers de Segurança:** Helmet.js configurado com políticas recomendadas

**Rate Limiting:** Limitação de requisições (100 por minuto, 10 para emissão de documentos)

**CORS:** Configurado com whitelist de origens permitidas

**SSL/TLS:** Suporte a HTTPS em produção

**Auditoria:** Logs de todas as ações dos usuários com IP e data/hora

---

## 📚 REFERÊNCIAS OFICIAIS

### SEFAZ - Sistemas Fiscais

**NF-e - Nota Fiscal Eletrônica**
https://www.nfe.fazenda.gov.br/portal/principal.aspx

**NFC-e - Nota Fiscal de Consumidor Eletrônica**
https://www.nfce.fazenda.gov.br

**CT-e - Conhecimento de Transporte Eletrônico**
https://www.cte.fazenda.gov.br

**MDF-e - Manifesto Eletrônico de Documentos Fiscais**
https://www.mdfe.fazenda.gov.br

**NFA-e - Nota Fiscal Avulsa Eletrônica**
https://www.nfae.fazenda.gov.br

### Receita Federal

**NFS-e Padrão Nacional**
https://www.gov.br/receitafederal/pt-br/assuntos/nfse

**Manual de Integração NFS-e Nacional**
https://www.gov.br/receitafederal/pt-br/assuntos/nfse/manual

### Certificação Digital

**ICP-Brasil - Infraestrutura de Chaves Públicas Brasileira**
https://www.gov.br/iti/pt-br

**Certificado Digital A1 (Arquivo .pfx/.p12)**
https://www.gov.br/iti/pt-br/servicos/certificado-digital

### Legislação

**Lei Complementar 116/2003 - ISSQN**
http://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm

**Lei Complementar 123/2006 - Simples Nacional**
http://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm

**Emenda Constitucional 132/2023 - Reforma Tributária**
http://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc132.htm

**Lei 12.741/2012 - Transparência Tributária**
http://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12741.htm

### API Pública

**OpenCNPJ - Consulta Pública de CNPJ**
https://api.opencnpj.org

**BrasilAPI - Dados Públicos Brasileiros**
https://brasilapi.com.br