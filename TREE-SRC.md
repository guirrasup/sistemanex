# 🌳 TREE-SRC — Estrutura da pasta `src/`

> 📦 Projeto: **SistemaNEX** — ERP + Emissor de Documentos Fiscais (NF-e, NFS-e, NFC-e, CT-e, NFA-e)
> 🖥️ Frontend: React + TypeScript + Vite + TailwindCSS + Recharts
> 🗓️ Gerado automaticamente

---

```
src/
├── 📄 App.tsx
├── 📄 main.tsx
├── 📄 index.css
├── 📁 auth/
├── 📁 cadastros/
├── 📁 config/
├── 📁 dashboard/
├── 📁 fiscal/
├── 📁 financeiro/
├── 📁 landing/
├── 📁 layout/
├── 📁 tools/
├── 📁 ui/
├── 📁 hooks/
├── 📁 services/
├── 📁 types/
└── 📁 utils/
```

---

## 🚀 Arquivos Raiz

### 📄 `App.tsx`
🧠 **Cérebro da aplicação.** Componente raiz que gerencia autenticação (login/logout), navegação entre telas, cache de dados (TTL de 30s), refresh centralizado com `Promise.allSettled` e renderização condicional de todas as views (emissores fiscais, cadastros, financeiro, visualizadores de DANFEs em modal).

### 📄 `main.tsx`
🎯 **Ponto de entrada.** Monta o app React no DOM (`createRoot`) e importa os estilos globais.

### 📄 `index.css`
🎨 **Estilos globais.** Configuração do TailwindCSS, fontes, reset e classes utilitárias customizadas.

---

## 📁 `auth/` — 🔐 Autenticação

| Arquivo | Emoji | Descrição |
|---|---|---|
| `LoginView.tsx` | 🔑 | Tela de login do sistema. Valida credenciais via API e dispara o `handleLogin` do App, salvando token/usuário no `localStorage`. |

## 📁 `cadastros/` — 📚 Cadastros (CRUD)

| Arquivo | Emoji | Descrição |
|---|---|---|
| `ClientesView.tsx` | 👥 | CRUD de clientes — listagem, busca, filtro, formulário de criação/edição e exclusão. |
| `FornecedoresView.tsx` | 🏭 | CRUD de fornecedores (filtrado de `ClienteFornecedor` com tipo `FORNECEDOR`/`AMBOS`). |
| `ProdutosView.tsx` | 📦 | CRUD de produtos com controle de estoque, preços, unidade e status ativo/inativo. |
| `ServicosView.tsx` | 🛠️ | CRUD de catálogo de serviços (usado na emissão de NFS-e), com códigos LC116 e tributação. |
| `TransportadorasView.tsx` | 🚚 | CRUD de transportadoras, usadas na emissão de CT-e. |

## 📁 `config/` — ⚙️ Configurações

| Arquivo | Emoji | Descrição |
|---|---|---|
| `ConfiguracoesEmpresaView.tsx` | 🏢 | Configuração dos dados da empresa emitente (CNPJ, IE, endereço, regime tributário, certificado digital, seriado de notas). |

## 📁 `dashboard/` — 📊 Painel Principal

| Arquivo | Emoji | Descrição |
|---|---|---|
| `DashboardReal.tsx` | 📈 | **Dashboard em uso (versão atual).** Busca dados reais do backend em paralelo, calcula faturamento, A Receber/A Pagar, crescimento mensal e renderiza gráficos de barras e pizza com **Recharts** + lista dos últimos documentos. |
| `DashboardOverview.tsx` | 🗺️ | Versão anterior do dashboard — resumo fiscal/financeiro a partir dos dados passados via props (IBS/CBS Reforma 2026, estoque mínimo, últimos docs). ⚠️ Legado/não usado no App. |
| `DashboardOverview2.tsx` | 🧪 | Segunda versão legada — consome endpoints `/api/dashboard`, `/api/financeiro/resumo` e `/api/produtos/estoque-critico` diretamente. ⚠️ Legado/não usado no App. |

## 📁 `fiscal/` — 🧾 Módulo Fiscal (coração do sistema)

### Emissores
| Arquivo | Emoji | Descrição |
|---|---|---|
| `NfeEmissor.tsx` | 📋 | Emissor de **NF-e** (Modelo 55) — mercadorias, cálculo de ICMS/PIS/COFINS/IBS-CBS, geração e assinatura do XML. |
| `NfseEmissor.tsx` | 🧾 | Emissor de **NFS-e** (DPS Nacional) — serviços, ISSQN, códigos LC116, retenções. |
| `NfceEmissor.tsx` | 🛒 | Emissor de **NFC-e** (Modelo 65) — venda ao consumidor, cupom fiscal. |
| `CteEmissor.tsx` | 🚛 | Emissor de **CT-e** — conhecimento de transporte de cargas, com seleção de transportadora. |
| `NfaeEmissor.tsx` | 📝 | Emissor de **NFA-e** — nota fiscal avulsa eletrônica. |
| `DocumentosFiscaisList.tsx` | 📚 | Listagem unificada de todos os documentos fiscais emitidos, com filtros por tipo/status e ações (visualizar DANFE, baixar XML). |

### Visualizadores (DANFEs)
| Arquivo | Emoji | Descrição |
|---|---|---|
| `DanfeViewer.tsx` | 🖨️ | Visualização/impressão do **DANFE** da NF-e. |
| `DanfseViewer.tsx` | 🖨️ | Visualização/impressão do **DANFSE** da NFS-e. |
| `DanfceViewer.tsx` | 🧾 | Visualização do **DANFC-e** (cupom) da NFC-e. |
| `DacteViewer.tsx` | 🚚 | Visualização do **DACTE** do CT-e. |
| `DanfaeViewer.tsx` | 📄 | Visualização do **DANFA-e** da NFA-e. |

## 📁 `financeiro/` — 💰 Financeiro

| Arquivo | Emoji | Descrição |
|---|---|---|
| `FinanceiroView.tsx` | 💵 | Gestão de títulos financeiros — contas a receber/pagar, baixas, vencimentos e status (PENDENTE/VENCIDO/PAGO). |

## 📁 `landing/` — 🏠 Página Pública

| Arquivo | Emoji | Descrição |
|---|---|---|
| `LandingPageView.tsx` | 🌐 | Landing page de apresentação do sistema, exibida antes do login, com CTA para a tela de autenticação. |

## 📁 `layout/` — 🧭 Layout do Sistema

| Arquivo | Emoji | Descrição |
|---|---|---|
| `Header.tsx` | 🔝 | Cabeçalho superior — logo/empresa, usuário logado, exportar backup JSON e botão de logout. |
| `Sidebar.tsx` | 🧭 | Menu lateral de navegação com contadores por módulo (notas, cadastros, financeiro). |

## 📁 `tools/` — 🧰 Ferramentas

| Arquivo | Emoji | Descrição |
|---|---|---|
| `ConsultaCnpjView.tsx` | 🔍 | Consulta de CNPJ na API pública (OpenCNPJ/ReceitaWS) para auto-preenchimento de cadastros. |

## 📁 `ui/` — 🧩 Componentes de Interface

| Arquivo | Emoji | Descrição |
|---|---|---|
| `AlertasSistema.tsx` | 🔔 | Componente global de alertas/notificações do sistema. |
| `ConfirmModal.tsx` | ❓ | Modal genérico de confirmação (usado em exclusões e ações críticas). |
| `LoadingDinamico.tsx` | ⏳ | Componente de loading animado reutilizável. |
| `ToastProvider.tsx` | 🍞 | Provider de toasts (notificações flutuantes de sucesso/erro/aviso) via Context API. |

## 📁 `hooks/` — 🪝 Hooks Customizados

| Arquivo | Emoji | Descrição |
|---|---|---|
| `useToast.ts` | 🍞 | Hook para disparar toasts de qualquer componente (`useToast().sucesso()`, `.erro()` etc.). |

## 📁 `services/` — 🌐 Camada de Serviços (API)

| Arquivo | Emoji | Descrição |
|---|---|---|
| `api.ts` | 🌐 | Instância central do **Axios** — base URL, interceptor de token JWT e tratamento de erros 401. |
| `clientes.service.ts` | 👥 | Endpoints CRUD de clientes/fornecedores. |
| `produtos.service.ts` | 📦 | Endpoints CRUD de produtos. |
| `servicos.service.ts` | 🛠️ | Endpoints CRUD de serviços. |
| `financeiro.service.ts` | 💰 | Endpoints de títulos financeiros. |
| `transportadora.service.ts` | 🚚 | Endpoints CRUD de transportadoras (exporta o tipo `Transportadora`). |
| `nfe.service.ts` | 📋 | Emissão/listagem/cancelamento de NF-e. |
| `nfse.service.ts` | 🧾 | Emissão/listagem/cancelamento de NFS-e. |
| `nfce.service.ts` | 🛒 | Emissão/listagem/cancelamento de NFC-e. |
| `cte.service.ts` | 🚛 | Emissão/listagem/cancelamento de CT-e. |
| `nfae.service.ts` | 📝 | Emissão/listagem/cancelamento de NFA-e. |
| `openCnpj.service.ts` | 🔍 | Serviço de consulta de CNPJ (OpenCNPJ). |

## 📁 `types/` — 🏷️ Tipagens TypeScript

| Arquivo | Emoji | Descrição |
|---|---|---|
| `fiscal.ts` | 🧾 | Tipos dos documentos fiscais (`NFSeDocumento`, `NFeDocumento`, `NFCeDocumento`, `CTeDocumento`, `NFAeDocumento`, itens, impostos, destinatários...). |
| `fiscal.d.ts` | 🏷️ | Declarações de tipos complementares do módulo fiscal. |
| `erp.ts` | 🏢 | Tipos do ERP (`Produto`, `ClienteFornecedor`, `ServicoCatalogo`, `TituloFinanceiro`, `ConfiguracaoEmpresa`, `UsuarioAuth`...). |

## 📁 `utils/` — 🔧 Utilitários

| Arquivo | Emoji | Descrição |
|---|---|---|
| `api.ts` (services) | — | *(listado acima em services)* |
| `certificadoParser.ts` | 🔐 | Parser do certificado digital A1 (extração de validade, CNPJ e dados do titular). |
| `chaveAcesso.ts` | 🔢 | Geração e validação da chave de acesso de 44 dígitos dos documentos fiscais (DV módulo 11). |
| `consultaCnpjApi.ts` | 🔍 | Funções de consulta de CNPJ em APIs externas. |
| `cpfCnpjValidator.ts` | ✅ | Validação e formatação de CPF/CNPJ e formatação de moeda (`formatarMoeda`). |
| `pixGenerator.ts` | 📲 | Geração de QR Code PIX (BR Code / EMV) para pagamento em NFC-e. |
| `storage.ts` | 💾 | Serviço de persistência local (`localStorage`) — cache de produtos, clientes, notas, backup/export JSON. |
| `tributosEngine.ts` | 🧮 | Motor de cálculo tributário — ICMS, ISSQN, PIS/COFINS e IBS/CBS (Reforma Tributária EC 132/2023). |
| `xmlNfeGenerator.ts` | 📤 | Gerador do XML da NF-e/NFC-e/CT-e (layout SEFAZ) a partir dos documentos tipados. |
| `xmlNfseGenerator.ts` | 📤 | Gerador do XML da NFS-e (padrão DPS Nacional). |

---

## 🔀 Fluxo de Dados (resumo)

```
🌐 Backend (Express + Prisma)
        ⇅
🌐 services/*.service.ts  (Axios + JWT)
        ⇅
🧠 App.tsx  (cache + refresh + navegação)
        ⇅
🧩 components/*  (Views → Emissores → Viewers)
        ⇅
🔧 utils/*  (cálculo tributos, XML, chave de acesso)
```
