# 🌳 TREE — Estrutura Completa do Projeto

> 📦 Projeto: **SistemaNEX** — ERP + Emissor de Documentos Fiscais (NF-e, NFS-e, NFC-e, CT-e, NFA-e, MDF-e)
> 🏗️ Arquitetura: React + TypeScript (frontend) · Node.js + Express + Prisma + PostgreSQL (backend) · Docker + nginx (deploy)
> 🗓️ Gerado automaticamente

---

## 📑 Sumário

- [Raiz do projeto](#-raiz-do-projeto)
- [Docs/ — Documentação oficial](#-docs--documentação-oficial)
- [assets/ — Recursos auxiliares](#-assets--recursos-auxiliares)
- [scripts/ — Scripts de operação](#-scripts--scripts-de-operação)
- [backend/ — API Node.js + Express + Prisma](#-backend--api-nodejs--express--prisma)
  - [backend/prisma](#-backendprisma--banco-de-dados)
  - [backend/scripts](#-backendscripts)
  - [backend/src (visão geral)](#-backendsrc--visão-geral)
  - [backend/src/controllers](#-backendsrccontrollers--controladores)
  - [backend/src/middlewares](#-backendsrcmiddlewares--middlewares)
  - [backend/src/repositories](#-backendsrcrepositories--repositórios)
  - [backend/src/routes](#-backendsrcroutes--rotas)
  - [backend/src/services](#-backendsrcservices--serviços)
  - [backend/src/types](#-backendsrctypes--tipagens)
  - [backend/src/utils](#-backendsrcutils--utilitários)
  - [backend/src/lib](#-backendsrclib--bibliotecas)
- [src/ — Frontend React](#-src--frontend-react)
  - [src/components](#-srccomponents--componentes)
  - [src/hooks](#-srchooks--hooks)
  - [src/services](#-srcservices--camada-de-api)
  - [src/types](#-srctypes--tipagens)
  - [src/utils](#-srcutils--utilitários)
- [Fluxo de dados](#-fluxo-de-dados)

---

# 📁 Raiz do projeto

| Arquivo | Emoji | Descrição |
|---|---|---|
| `README.md` | 📘 | Documentação principal do sistema: visão geral, funcionalidades, documentos fiscais suportados, stack, arquitetura, referência da API, módulos fiscais, motor tributário e segurança. |
| `TREE.md` | 🌳 | Este arquivo — mapa completo de pastas, subpastas e arquivos com descrição de funcionalidades. |
| `TREE-SRC.md` | 🗂️ | Mapa detalhado somente da pasta `src/` (frontend), gerado anteriormente. |
| `estrutura_src.txt` | 📄 | Dump em texto da estrutura de `src/` (referência rápida). |
| `metadata.json` | 🏷️ | Metadados do projeto (nome, descrição, tags). |
| `index.html` | 🌐 | HTML de entrada do Vite — shell único onde o React é montado. |
| `vite.config.ts` | ⚡ | Configuração do Vite: plugins React/Tailwind, alias de paths e proxy de dev. |
| `vite-env.d.ts` | 🏷️ | Declarações de tipos do ambiente Vite (`import.meta.env` etc.). |
| `tsconfig.json` | 🔧 | Configuração do TypeScript do frontend (target, strict, JSX, paths). |
| `package.json` | 📦 | Dependências e scripts do frontend (`dev`, `build`, `lint` = `tsc --noEmit`). |
| `package-lock.json` | 🔒 | Lock de versões do npm (raiz). |
| `bun.lock` | 🔒 | Lock de versões do Bun (alternativa de instalador usada no projeto). |
| `Dockerfile` | 🐳 | Build multi-stage: compila frontend e backend; alvos `backend-runner` (Node) e `frontend-runner` (nginx). |
| `docker-compose.yml` | 🐳 | Orquestração de 3 serviços: `postgres` (Postgres 16, sem porta pública), `backend` (porta interna 3333) e `nginx` (publica a porta 80 e proxya a API). |
| `nginx.conf` | 🌐 | Configuração do nginx: serve o SPA, gzip e proxy reverso das rotas `/api` para o backend. |
| `.env` | 🔐 | Variáveis de ambiente locais (senhas/segredos) — **não versionar**. |
| `.env.example` | 📄 | Modelo das variáveis necessárias: `POSTGRES_*`, `JWT_SECRET`, `FRONTEND_URL`, `HTTP_PORT`, `CONECTAGOV_*`. |
| `.gitignore` | 🙈 | Arquivos/pastas ignorados pelo Git. |
| `.dockerignore` | 🐳 | Contexto de build do Docker reduzido (exclui `node_modules` etc.). |
| `allcode.bat` | 🖥️ | Script Windows auxiliar (concatena código do projeto em um arquivo único para análise). |

---

# 📁 Docs/ — Documentação oficial

| Arquivo | Emoji | Descrição |
|---|---|---|
| `Links.txt` | 🔗 | Coleção de links oficiais (SEFAZ, Receita Federal, ICP-Brasil, legislação) usados como referência. |
| `NFE - PL_006h.md` | 📋 | Esquema/layout NF-e PL_006h — referência técnica do leiaute XML da NF-e. |
| `NFE - PL_009.md` | 📋 | Esquema/layout NF-e PL_009 — referência técnica do leiaute XML da NF-e (mais recente). |
| `manual_emissor_nfe.pdf` | 📕 | Manual oficial do emissor de NF-e (guia de preenchimento e fluxo de emissão). |

---

# 📁 assets/ — Recursos auxiliares

| Arquivo | Emoji | Descrição |
|---|---|---|
| `assets/.aistudio/.gitignore` | 🤖 | Ignora artefatos gerados pelo AI Studio dentro de assets. |

---

# 📁 scripts/ — Scripts de operação

| Arquivo | Emoji | Descrição |
|---|---|---|
| `scripts/deploy-watch.sh` | 👀 | Script bash de apoio ao deploy — monitora alterações e reconstrói/reinicia containers. |

---

# 📁 backend/ — API Node.js + Express + Prisma

Servidor HTTP que expõe a API RESTful consumida pelo frontend. Camadas: `routes → controllers → services → repositories → Prisma/PostgreSQL`.

| Arquivo | Emoji | Descrição |
|---|---|---|
| `backend/package.json`      | 📦 | Dependências do backend (Express, Prisma, JWT, Bcrypt, Helmet, rate-limit, node-forge, axios). |
| `backend/package-lock.json` | 🔒 | Lock de versões do npm do backend. |
| `backend/tsconfig.json`     | 🔧 | Configuração TypeScript do backend (CommonJS, strict). |
| `backend/.env`              | 🔐 | Variáveis locais do backend (DATABASE_URL, JWT_SECRET, credenciais ConectaGov). |

## 📁 backend/prisma — Banco de dados

| Arquivo | Emoji | Descrição |
|---|---|---|
| `backend/prisma/schema.prisma`    | 🗃️ | **Schema completo do banco** — dezenas de models fiscais  |
| `backend/prisma/seed.ts`          | 🌱 | Seed inicial do banco (dados base: empresa, usuários, cadastros de exemplo). |
| `backend/prisma/seed-fiscal.ts`   | 🌱 | Seed específico do módulo fiscal (documentos fiscais de demonstração). |
| `backend/prisma/migrations/…`     | 🗄️ | Histórico de migrations. |

## 📁 backend/scripts

| Arquivo | Emoji | Descrição |
|---|---|---|
| `backend/scripts/seed.ts`   | 🌱 | Seed alternativo/executável via `tsx` (carga de dados de teste). |
| `backend/scripts/seed1.ts`  | 🌱 | Variação do seed com outro conjunto de dados. |

## 📁 backend/src — Visão geral

| Arquivo | Emoji | Descrição |
|---|---|---|
| `backend/src/server.ts` | 🚀 | **Ponto de entrada da API.** Sobe o Express na porta 3333, aplica Helmet, CORS com whitelist, rate limiting global (100/min) e por dados (200/min), parsers JSON/URL (10 MB), registra todas as rotas `/api/*`, endpoint `/health` (com status de configuração ConectaGov) e o error middleware por último. |

## 📁 backend/src/controllers — Controladores

Recebem as requisições HTTP, validam entrada e chamam os services. Todos são classes instanciadas nas routes.

| Arquivo | Emoji | Descrição |
|---|---|---|
| `auth.controller.ts`              | 🔑 | Login, registro, dados do usuário logado, troca/recuperação de senha. |
| `nfe.controller.ts`               | 📋 | NF-e: listar, buscar (id/chave), emitir, cancelar, carta de correção, inutilização, baixar XML/DANFE. |
| `nfse.controller.ts`              | 🧾 | NFS-e: CRUD, emissão e cancelamento (padrão nacional DPS). |
| `nfce.controller.ts`              | 🛒 | NFC-e: listagem, emissão e cancelamento (venda ao consumidor). |
| `cte.controller.ts`               | 🚛 | CT-e: listagem com filtros, estatísticas, total de frete, resumo mensal, XML/DACTE. |
| `nfae.controller.ts`              | 📝 | NFA-e: emissão e cancelamento de nota avulsa (série 900). |
| `mdfe.controller.ts`              | 🚛 | MDF-e: listagem, busca por chave, estatísticas, total de carga, emissão, cancelamento e encerramento. |
| `cliente.controller.ts`           | 👥 | CRUD de clientes/fornecedores. |
| `produto.controller.ts`           | 📦 | CRUD de produtos e movimentações de estoque. |
| `servico.controller.ts`           | 🛠️ | CRUD do catálogo de serviços (códigos LC 116). |
| `transportadora.controller.ts`    | 🚚 | CRUD de transportadoras (RNTRC/ANTT). |
| `financeiro.controller.ts`        | 💰 | Títulos financeiros: listagem, pendentes, baixa, resumo. |
| `dashboard.controller.ts`         | 📊 | Métricas agregadas do dashboard (faturamento, documentos, receber/pagar). |
| `cnpj.controller.ts`              | 🔍 | Proxy de consulta de CNPJ (OpenCNPJ/ReceitaWS) para auto-preenchimento. |

## 📁 backend/src/middlewares — Middlewares

| Arquivo | Emoji | Descrição |
|---|---|---|
| `auth.middleware.ts` | 🔐 | Valida o token JWT, decodifica o usuário e aplica controle de acesso por perfil (ADMIN/FISCAL/OPERADOR). |
| `error.middleware.ts` | ⚠️ | Captura central de erros, normaliza respostas `{ sucesso, erro }` e evita vazamento de stack em produção. |

## 📁 backend/src/repositories — Repositórios

Camada de acesso a dados via Prisma — isola queries dos services.

| Arquivo | Emoji | Descrição |
|---|---|---|
| `base.repository.ts`              | 🧱 | Repositório genérico com operações CRUD reutilizáveis (paginate, find, create, update, delete). |
| `usuario.repository.ts`           | 👤 | Acesso a usuários (login, perfis). |
| `empresa.repository.ts`           | 🏢 | Acesso aos dados da empresa emitente e certificado. |
| `cliente.repository.ts`           | 👥 | Queries de clientes/fornecedores. |
| `produto.repository.ts`           | 📦 | Queries de produtos e estoque. |
| `servico.repository.ts`           | 🛠️ | Queries do catálogo de serviços. |
| `transportadora.repository.ts`    | 🚚 | Queries de transportadoras. |
| `financeiro.repository.ts`        | 💰 | Queries de títulos financeiros e baixas. |
| `nfe.repository.ts`               | 📋 | Persistência/consulta de NF-e, itens, eventos e inutilizações. |
| `nfse.repository.ts`              | 🧾 | Persistência/consulta de NFS-e e histórico de status. |
| `nfce.repository.ts`              | 🛒 | Persistência/consulta de NFC-e, itens e pagamentos. |
| `cte.repository.ts`               | 🚛 | Persistência/consulta de CT-e, componentes, documentos e duplicatas. |
| `nfae.repository.ts`              | 📝 | Persistência/consulta de NFA-e e itens. |
| `mdfe.repository.ts`              | 🚛 | Persistência/consulta de MDF-e (municípios, percurso, documentos vinculados). |
| `mdfe.component.repository.ts`    | 🧩 | Repositório auxiliar das entidades filhas do MDF-e (unidades de transporte, lacres, cargas). |

## 📁 backend/src/routes — Rotas

Mapeiam endpoints HTTP aos controllers e aplicam o `authMiddleware`.

| Arquivo | Emoji | Descrição |
|---|---|---|
| `index.ts`                  | 🗺️ | Índice/roteador agregador (contém exemplo do padrão de rotas CT-e usado nos demais). |
| `auth.routes.ts`            | 🔑 | `/api/auth/*` — login, registro, me, senha. |
| `nfe.routes.ts`             | 📋 | `/api/nfe/*` — emissão, listagem, cancelamento, carta de correção, inutilização, XML/DANFE. |
| `nfse.routes.ts`            | 🧾 | `/api/nfse/*`. |
| `nfce.routes.ts`            | 🛒 | `/api/nfce/*`. |
| `cte.routes.ts`             | 🚛 | `/api/cte/*` — inclui buscas por chave/protocolo/status/modal e downloads XML/DACTE. |
| `nfae.routes.ts`            | 📝 | `/api/nfae/*`. |
| `mdfe.routes.ts`            | 🚛 | `/api/mdfe/*` — inclui encerramento e estatísticas. |
| `cliente.routes.ts`         | 👥 | `/api/clientes/*` (protegido por dataLimiter). |
| `produto.routes.ts`         | 📦 | `/api/produtos/*` (inclui estoque-crítico). |
| `servico.routes.ts`         | 🛠️ | `/api/servicos/*`. |
| `transportadora.routes.ts`  | 🚚 | `/api/transportadoras/*`. |
| `financeiro.routes.ts`      | 💰 | `/api/financeiro/*` — títulos, pendentes, baixa, resumo. |
| `dashboard.routes.ts`       | 📊 | `/api/dashboard` — métricas consolidadas. |
| `cnpj.routes.ts`            | 🔍 | `/api/cnpj/consultar/:cnpj`. |

## 📁 backend/src/services — Serviços

Regras de negócio: cálculo tributário, geração/assinatura de XML, fluxo de emissão, comunicação externa.

| Arquivo | Emoji | Descrição |
|---|---|---|
| `auth.service.ts`              | 🔑 | Autenticação: hash Bcrypt, geração/validação de JWT, perfis e recuperação de senha. |
| `emissao.service.ts`           | ⚙️ | Orquestrador central do fluxo de emissão fiscal (validação → cálculo → XML → assinatura → persistência/protocolo). |
| `nfe.service.ts`               | 📋 | Regras de NF-e: validação do leiaute 4.00, cálculo de impostos, (cancelamento, carta de correção, inutilização). |
| `nfse.service.ts`              | 🧾 | Regras de NFS-e (DPS Nacional v1.01): ISSQN, retenções, LC 116. |
| `nfce.service.ts`              | 🛒 | Regras de NFC-e: venda ao consumidor, pagamentos (dinheiro/cartão/PIX), QR Code. |
| `cte.service.ts`               | 🚛 | Regras de CT-e 3.00: componentes de frete, ICMS, modal, substituição/complemento. |
| `nfae.service.ts`              | 📝 | Regras de NFA-e (série 900) e geração da guia DAE. |
| `mdfe.service.ts`              | 🚛 | Regras de MDF-e 3.00: condutores, municípios de carga/descarga, documentos vinculados, encerramento. |
| `certificado.service.ts`       | 🔐 | Gestão do certificado ICP-Brasil A1/A3: leitura de PFX, validade e assinatura XMLDSig (SHA256/RSA) via node-forge. |
| `conectagov.service.ts`        | 🏛️ | Integração com APIs do governo (ConectaGov): autenticação OAuth e consultas oficiais. |
| `cliente.service.ts`           | 👥 | Negócio de clientes/fornecedores (validação CPF/CNPJ, regras de tipo). |
| `produto.service.ts`           | 📦 | Negócio de produtos e preços. |
| `servico.service.ts`           | 🛠️ | Negócio do catálogo de serviços. |
| `transportadora.service.ts`    | 🚚 | Negócio de transportadoras (RNTRC/ANTT). |
| `financeiro.service.ts`        | 💰 | Títulos a receber/pagar, baixas, vencidos e resumo financeiro. |
| `estoque.service.ts`           | 📦 | Movimentações de estoque, baixa automática por emissão e alertas de mínimo. |

## 📁 backend/src/types — Tipagens

| Arquivo | Emoji | Descrição |
|---|---|---|
| `index.ts`         | 🏷️ | Barrel de tipos compartilhados do backend. |
| `erp.d.ts`         | 🏢 | Tipos do ERP (clientes, produtos, títulos, empresa). |
| `fiscal.d.ts`      | 🧾 | Tipos dos documentos fiscais e impostos. |
| `cte.types.ts`     | 🚛 | Tipos específicos do CT-e (modal, componentes, tomador). |
| `mdfe.d.ts`        | 🚛 | Tipos específicos do MDF-e. |
| `nfae.types.ts`    | 📝 | Tipos específicos da NFA-e. |
| `cnpj.ts`          | 🔍 | Tipos do retorno das APIs de consulta de CNPJ. |

## 📁 backend/src/utils — Utilitários

| Arquivo | Emoji | Descrição |
|---|---|---|
| `chaveAcesso.ts`         | 🔢 | Geração/validação da chave de acesso de 44 dígitos (DV módulo 11) — NF-e/NFC-e/CT-e. |
| `chaveAcessoMDFe.ts`     | 🔢 | Chave de acesso específica do MDF-e (série 58). |
| `cpfCnpjValidator.ts`    | ✅ | Validação e formatação de CPF/CNPJ. |
| `tributosEngine.ts`      | 🧮 | Cálculo de ICMS/ST, ISSQN, PIS, COFINS, IPI e IBS/CBS (Reforma Tributária EC 132/2023). |
| `xmlNfeGenerator.ts`     | 📤 | Gerador do XML da NF-e/NFC-e (leiaute SEFAZ 4.00) a partir dos documentos tipados. |
| `xmlNfseGenerator.ts`    | 📤 | Gerador do XML da NFS-e (DPS Nacional). |
| `xmlMdfeGenerator.ts`    | 📤 | Gerador do XML do MDF-e (leiaute SEFAZ 3.00). |
| `validators.ts`          | ✅ | Validadores genéricos de payload (campos obrigatórios, formatos). |
| `helpers.ts`             | 🔧 | Funções auxiliares (datas, números, arredondamento monetário). |
| `storage.ts`             | 💾 | Apoio a arquivos/exports gerados pelo backend. |

## 📁 backend/src/lib — Bibliotecas

| Arquivo | Emoji | Descrição |
|---|---|---|
| `prisma.ts` | 🔌 | Cliente Prisma singleton (conexão única com o PostgreSQL, reutilizada por todos os repositórios). |

---

# 📁 src/ — Frontend React

SPA React + TypeScript + Vite + TailwindCSS. `App.tsx` centraliza autenticação, navegação, cache (TTL 30s) e refresh com `Promise.allSettled`.

> ⚠️ Nota de organização: no disco, os componentes ficam em `src/components/…` (o mapa `TREE-SRC.md` usa os nomes de pastas sem o prefixo `components`).

| Arquivo | Emoji | Descrição |
|---|---|---|
| `src/main.tsx`  | 🎯 | Ponto de entrada — monta o React no DOM (`createRoot`). |
| `src/App.tsx`   | 🧠 | Cérebro da aplicação. |
| `src/index.css` | 🎨 | TailwindCSS, fontes, reset e classes utilitárias customizadas. |

## 📁 src/components — Componentes

### `src/components/auth/` — Autenticação

| Arquivo | Emoji | Descrição |
|---|---|---|
| `LoginView.tsx` | 🔑 | Tela de login — valida credenciais via API e salva token/usuário no `localStorage`. |

### `src/components/cadastros/` — Cadastros (CRUD)

| Arquivo | Emoji | Descrição |
|---|---|---|
| `ClientesView.tsx`          | 👥 | CRUD de clientes — listagem, busca, filtro, formulário e exclusão. |
| `FornecedoresView.tsx`      | 🏭 | CRUD de fornecedores (filtro de `ClienteFornecedor` por tipo `FORNECEDOR`/`AMBOS`). |
| `ProdutosView.tsx`          | 📦 | CRUD de produtos com estoque, preços, unidade e status ativo/inativo. |
| `ServicosView.tsx`          | 🛠️ | CRUD do catálogo de serviços (códigos LC 116 e tributação) para NFS-e. |
| `TransportadorasView.tsx`   | 🚚 | CRUD de transportadoras usadas na emissão de CT-e. |

### `src/components/config/` — Configurações

| Arquivo | Emoji | Descrição |
|---|---|---|
| `ConfiguracoesEmpresaView.tsx` | 🏢 | Dados da empresa emitente: CNPJ, IE, endereço, regime tributário, certificado digital, série/numeração de notas. |

### `src/components/dashboard/` — Painel

| Arquivo | Emoji | Descrição |
|---|---|---|
| `DashboardReal.tsx`      | 📈 | **Dashboard em uso** — busca real do backend em paralelo, faturamento, A Receber/A Pagar, crescimento e gráficos. |
| `DashboardOverview.tsx`  | 🗺️ | ⚠️ Legado (não usado no App) — resumo via props (IBS/CBS, estoque mínimo). |
| `DashboardOverview2.tsx` | 🧪 | ⚠️ Legado (não usado no App) — consome `/api/dashboard` e `/api/financeiro/resumo` diretamente. |

### `src/components/fiscal/` — Módulo Fiscal (coração do sistema)

**Emissores**

| Arquivo | Emoji | Descrição |
|---|---|---|
| `NfeEmissor.tsx`            | 📋 | Emissor de NF-e (Modelo 55) — mercadorias, ICMS/PIS/COFINS/IBS-CBS, XML assinado. |
| `NfseEmissor.tsx`           | 🧾 | Emissor de NFS-e (DPS Nacional) — serviços, ISSQN, LC 116, retenções. |
| `NfceEmissor.tsx`           | 🛒 | Emissor de NFC-e (Modelo 65) — cupom fiscal ao consumidor, pagamentos e PIX. |
| `CteEmissor.tsx`            | 🚛 | Emissor de CT-e — transporte de cargas com seleção de transportadora e componentes de frete. |
| `NfaeEmissor.tsx`           | 📝 | Emissor de NFA-e — nota fiscal avulsa eletrônica (série 900). |
| `MdfeEmissor.tsx`           | 🚛 | Emissor de MDF-e — manifesto de carga, municípios de carga/descarga e documentos vinculados. |
| `DocumentosFiscaisList.tsx` | 📚 | Listagem unificada de todos os documentos emitidos com filtros tipo/status e ações (DANFE, XML). |

**Visualizadores (DANFEs)**

| Arquivo | Emoji | Descrição |
|---|---|---|
| `DanfeViewer.tsx`  | 🖨️ | Visualização/impressão do DANFE da NF-e. |
| `DanfseViewer.tsx` | 🖨️ | Visualização/impressão da DANFSE da NFS-e. |
| `DanfceViewer.tsx` | 🧾 | Visualização do DANFC-e (cupom) da NFC-e. |
| `DacteViewer.tsx`  | 🚚 | Visualização do DACTE do CT-e. |
| `DamdfeViewer.tsx` | 🚛 | Visualização do DAMDFE do MDF-e. |
| `DanfaeViewer.tsx` | 📄 | Visualização do DANFA-e da NFA-e. |

### `src/components/financeiro/` — Financeiro

| Arquivo | Emoji | Descrição |
|---|---|---|
| `FinanceiroView.tsx` | 💵 | Contas a receber/pagar, baixas, vencimentos e status (PENDENTE/VENCIDO/PAGO), com QR Code PIX. |

### `src/components/landing/` — Página pública

| Arquivo | Emoji | Descrição |
|---|---|---|
| `LandingPageView.tsx` | 🌐 | Landing page apresentando o sistema antes do login, com CTA para autenticação. |

### `src/components/layout/` — Layout

| Arquivo | Emoji | Descrição |
|---|---|---|
| `Header.tsx` | 🔝 | Cabeçalho — logo/empresa, usuário logado, exportar backup JSON e logout. |
| `Sidebar.tsx` | 🧭 | Menu lateral com contadores por módulo (notas, cadastros, financeiro). |

### `src/components/tools/` — Ferramentas

| Arquivo | Emoji | Descrição |
|---|---|---|
| `ConsultaCnpjView.tsx` | 🔍 | Consulta de CNPJ nas APIs públicas para auto-preenchimento de cadastros. |

### `src/components/ui/` — Componentes de interface

| Arquivo | Emoji | Descrição |
|---|---|---|
| `AlertasSistema.tsx` | 🔔 | Alertas globais (vencimento de certificado, títulos vencidos, estoque crítico). |
| `ConfirmModal.tsx` | ❓ | Modal de confirmação para ações críticas (exclusões, cancelamentos). |
| `LoadingDinamico.tsx` | ⏳ | Loading animado reutilizável. |
| `ToastProvider.tsx` | 🍞 | Provider de toasts (sucesso/erro/aviso) via Context API. |

## 📁 src/hooks — Hooks

| Arquivo | Emoji | Descrição |
|---|---|---|
| `useToast.ts` | 🍞 | Hook `useToast()` — dispara toasts de qualquer componente (`sucesso()`, `erro()`…). |

## 📁 src/services — Camada de API

| Arquivo | Emoji | Descrição |
|---|---|---|
| `api.ts` | 🌐 | Instância central do Axios — base URL, interceptor de token JWT e tratamento de 401. |
| `nfe.service.ts` | 📋 | Emissão/listagem/cancelamento de NF-e. |
| `nfse.service.ts` | 🧾 | Endpoints de NFS-e. |
| `nfce.service.ts` | 🛒 | Endpoints de NFC-e. |
| `cte.service.ts` | 🚛 | Endpoints de CT-e. |
| `nfae.service.ts` | 📝 | Endpoints de NFA-e. |
| `mdfe.service.ts` | 🚛 | Endpoints de MDF-e (inclui encerrar e estatísticas). |
| `clientes.service.ts` | 👥 | CRUD de clientes/fornecedores. |
| `produtos.service.ts` | 📦 | CRUD de produtos. |
| `servicos.service.ts` | 🛠️ | CRUD de serviços. |
| `transportadora.service.ts` | 🚚 | CRUD de transportadoras (exporta o tipo `Transportadora`). |
| `financeiro.service.ts` | 💰 | Títulos financeiros e resumo. |
| `openCnpj.service.ts` | 🔍 | Consulta de CNPJ (OpenCNPJ). |

## 📁 src/types — Tipagens

| Arquivo | Emoji | Descrição |
|---|---|---|
| `erp.ts` | 🏢 | Tipos do ERP (`Produto`, `ClienteFornecedor`, `ServicoCatalogo`, `TituloFinanceiro`, `ConfiguracaoEmpresa`, `UsuarioAuth`…). |
| `fiscal.ts` | 🧾 | Tipos dos documentos fiscais (`NFeDocumento`, `NFSeDocumento`, `NFCeDocumento`, `CTeDocumento`, `NFAeDocumento`, itens, impostos…). |
| `fiscal.d.ts` | 🏷️ | Declarações complementares do módulo fiscal. |
| `mdfe.d.ts` | 🚛 | Tipos do MDF-e no frontend. |

## 📁 src/utils — Utilitários

| Arquivo | Emoji | Descrição |
|---|---|---|
| `tributosEngine.ts` | 🧮 | Motor de cálculo tributário — ICMS, ISSQN, PIS/COFINS e IBS/CBS (EC 132/2023). |
| `chaveAcesso.ts` | 🔢 | Geração/validação da chave de acesso de 44 dígitos (DV módulo 11). |
| `certificadoParser.ts` | 🔐 | Parser do certificado A1 — validade, CNPJ e titular. |
| `cpfCnpjValidator.ts` | ✅ | Validação/formatação de CPF/CNPJ e moeda (`formatarMoeda`). |
| `pixGenerator.ts` | 📲 | QR Code PIX (BR Code/EMV) para pagamento na NFC-e. |
| `xmlNfeGenerator.ts` | 📤 | Gerador XML NF-e/NFC-e/CT-e (leiaute SEFAZ) no cliente. |
| `xmlNfseGenerator.ts` | 📤 | Gerador XML NFS-e (DPS Nacional) no cliente. |
| `consultaCnpjApi.ts` | 🔍 | Chamadas às APIs externas de CNPJ. |
| `storage.ts` | 💾 | Persistência local (localStorage) — cache de dados e backup/export JSON. |

---

# 🔀 Fluxo de dados

```
👤 Usuário
   ⇅
🧩 src/components/* (Views → Emissores → Viewers)
   ⇅
🧠 src/App.tsx (cache + refresh + navegação)
   ⇅
🌐 src/services/*.service.ts (Axios + JWT)
   ⇅
🛡️ backend/src/routes → controllers (auth + rate limit)
   ⇅
⚙️ backend/src/services (regras de negócio + tributosEngine + XML/certificado)
   ⇅
🗄️ backend/src/repositories → backend/src/lib/prisma.ts → PostgreSQL
```
