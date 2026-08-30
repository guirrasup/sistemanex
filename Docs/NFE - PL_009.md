# 📦 PL_009 - IMPLEMENTAÇÃO COMPLETA

## 📋 VISÃO GERAL

Implementação completa das alterações do PL_009 (NT2016.002 v1.20 até NT2024.003), seguindo o mesmo padrão utilizado na implementação do PL_006h.

---

## 🔧 BACKEND (Node.js)

### 1. Schema Prisma

**Arquivo:** `prisma/schema.prisma`

#### 1.1 Novos Enums Adicionados

- `TpCreditoPresumido`: IBS, CBS, IBS_CBS
- `StatusCreditoPresumido`: PENDENTE, UTILIZADO, CANCELADO, EXPIRADO
- `TpBeneficioFiscal`: CREDITO_PRESUMIDO, REDUCAO_BC, ISENCAO, ALIQUOTA_ZERO, DIFERIMENTO, SUSPENSAO, OUTROS
- `OrigemCredito`: OPERACAO_PROPRIA, SUBSTITUICAO_TRIBUTARIA, IMPORTACAO, AQUISICAO_INTERNA
- `TpProdutoAgropecuario`: IN_NATURA, BENEFICIADO, INDUSTRIALIZADO, SEMIELABORADO

#### 1.2 Novos Modelos Criados

- **CreditoPresumido**: Armazena créditos presumidos de IBS e CBS gerados em operações
- **EventoCreditoPresumido**: Registro do evento de crédito presumido (envio para SEFAZ)
- **EventoCreditoPresumidoItem**: Itens do evento de crédito presumido (vinculação com itens da NF-e)
- **ProdutoAgropecuario**: Cadastro de produtos agropecuários com informações específicas
- **ReducaoBaseCalculo**: Registro de reduções da base de cálculo aplicadas
- **PagamentoInfo**: Informações detalhadas de pagamentos (cartão, PIX, boleto)

#### 1.3 Campos Adicionados no Model NFe

- `valorCreditoPresumidoIBS`: Valor total de crédito presumido IBS
- `valorCreditoPresumidoCBS`: Valor total de crédito presumido CBS
- `possuiReducaoBC`: Indica se houve redução da base de cálculo
- `percentualReducaoBC`: Percentual de redução aplicado
- `codigoBeneficioUF`: Código do benefício fiscal na UF
- `produtoAgropecuario`: Indica se é operação com produto agropecuário

#### 1.4 Campos Adicionados no Model ItemNFe

- `gCred`: Grupo de crédito presumido (até 4 ocorrências por item)
- `cBenef`: Código do benefício fiscal
- `indEscala`: Indicador de escala relevante (S/N)
- `CNPJFab`: CNPJ do fabricante (obrigatório para escala NÃO relevante)

---

### 2. Tipos TypeScript

**Arquivo:** `src/types/fiscal.d.ts`

Adicionados 12 novos tipos e 6 interfaces para suporte ao PL_009, seguindo o padrão do PL_006h:

- `ICreditoPresumido`: Interface completa do crédito presumido
- `IEventoCreditoPresumido`: Interface do evento
- `IEventoCreditoPresumidoItem`: Interface do item do evento
- `IReducaoBaseCalculo`: Interface da redução da base de cálculo
- `IProdutoAgropecuario`: Interface do produto agropecuário
- `IPagamentoInfo`: Interface das informações de pagamento

---

### 3. Validador Centralizado

**Arquivo:** `src/utils/pl009.validator.ts`

Criado novo validador seguindo o padrão do PL_006h com os métodos:

- `validarCreditoPresumido()`: Valida tipo, origem, valores e percentuais
- `validarEventoCreditoPresumido()`: Valida chave NFe, tpAutor, verAplic, itens
- `validarReducaoBaseCalculo()`: Valida chave, item, percentual e valores
- `validarProdutoAgropecuario()`: Valida tipo, aliquotas e percentuais
- `validarBeneficioFiscal()`: Valida código de benefício (8/10 caracteres ou "SEM CBENEF")
- `validarPagamento()`: Valida tipo, valor, CNPJs e tipo de integração

---

### 4. Serviços

**Arquivo:** `src/services/creditoPresumido.service.ts`

Criado novo serviço com os métodos:

- `criar()`: Cria um novo crédito presumido
- `processarEvento()`: Processa e registra evento de crédito presumido
- `listarPorChave()`: Lista créditos por chave da NF-e
- `listarPorStatus()`: Lista créditos por status
- `utilizar()`: Marca crédito como utilizado
- `cancelar()`: Cancela crédito com justificativa (TJust - 15 a 255 caracteres)

---

### 5. Controllers

**Arquivo:** `src/controllers/creditoPresumido.controller.ts`

Criado novo controller com os endpoints:

- `POST /`: Criar crédito presumido
- `POST /evento`: Processar evento de crédito presumido
- `GET /chave/:chaveNFe`: Listar créditos por chave
- `GET /status/:status`: Listar créditos por status
- `PUT /:id/utilizar`: Utilizar crédito
- `PUT /:id/cancelar`: Cancelar crédito

---

### 6. Rotas

**Arquivo:** `src/routes/creditoPresumido.routes.ts`

- 6 rotas com autenticação e rate limit (100 requisições por 15 minutos)
- Seguindo o padrão das rotas NF-e

---

### 7. Atualização do Gerador XML NFe

**Arquivo:** `src/utils/xmlNfeGenerator.ts`

Adicionados os grupos PL_009 no XML:

- **gCred**: Grupo de crédito presumido (cCredPresumido, pCredPresumido, vCredPresumido)
- **cBenef**: Código do benefício fiscal
- **pRedBC**: Percentual de redução da base de cálculo (ICMS20)
- **indEscala**: Indicador de escala relevante
- **CNPJFab**: CNPJ do fabricante

---

### 8. Atualização do NFeService

**Arquivo:** `src/services/nfe.service.ts`

Adicionadas validações PL_009:

- Validação do código de benefício fiscal (cBenef)
- Validação do crédito presumido (gCred)
- Validação do percentual de redução da BC (pRedBC)
- Validação de CNPJFab quando indEscala = N

---

## 🖥️ FRONTEND (React)

### 1. Componentes Criados

**Arquivo:** `src/components/fiscal/CreditoPresumidoForm.tsx`

- Formulário de criação/edição de crédito presumido
- Campos: tipo, origem, valores IBS/CBS, percentuais, data competência, data vencimento
- Validações PL_009

**Arquivo:** `src/components/fiscal/CreditoPresumidoList.tsx`

- Listagem de créditos presumidos
- Filtros por status, chave NFe, período
- Ações: utilizar, cancelar

---

### 2. Atualização do NfeEmissor

**Arquivo:** `src/components/fiscal/NfeEmissor.tsx`

Adicionados campos PL_009:

- **Crédito Presumido**: Campo para informar crédito IBS/CBS
- **Benefício Fiscal**: Campo cBenef (8/10 caracteres)
- **Redução da BC**: Percentual de redução
- **Produto Agropecuário**: Checkbox e campos específicos
- **Pagamentos**: Detalhamento de cartão/PIX/boleto com campos: tipo integração, CNPJ instituição, bandeira, autorização

---

### 3. Atualização do ProdutosView

**Arquivo:** `src/components/cadastros/ProdutosView.tsx`

Adicionados campos PL_009:

- **Produto Agropecuário**: Tipo (in natura, beneficiado, etc)
- **Alíquotas de Crédito**: IBS e CBS
- **Percentuais**: Nacional e importado
- **Código SIAF**: Código do produto agropecuário

---

### 4. Atualização do Serviço NFe (Frontend)

**Arquivo:** `src/services/nfe.service.ts`

- Validações para campos PL_009
- Filtros por crédito presumido, redução BC, benefício fiscal
- Métodos para consulta de créditos

---

## 📋 CHECKLIST PL_009

| Item | Backend | Frontend | Status |
|------|---------|----------|--------|
| Schema - Enums | ✅ | - | Concluído |
| Schema - Modelos | ✅ | - | Concluído |
| Schema - Campos NFe | ✅ | - | Concluído |
| Types TypeScript | ✅ | ✅ | Concluído |
| Validador PL_009 | ✅ | - | Concluído |
| Serviço Crédito | ✅ | - | Concluído |
| Controller | ✅ | - | Concluído |
| Rotas | ✅ | - | Concluído |
| XML Generator | ✅ | - | Concluído |
| NFeService | ✅ | - | Concluído |
| CreditoPresumidoForm | - | ✅ | Concluído |
| CreditoPresumidoList | - | ✅ | Concluído |
| NfeEmissor | - | ✅ | Concluído |
| ProdutosView | - | ✅ | Concluído |
| NFeService Frontend | - | ✅ | Concluído |

---

## 🚀 COMANDOS

```bash
# Backend
npx prisma generate
npx prisma db push --force-reset
npx prisma db seed

# Frontend
npm run type-check
npm run build