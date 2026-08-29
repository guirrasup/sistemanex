📂 ARQUIVOS ALTERADOS
Backend (Node.js)
Arquivo	O que foi alterado
prisma/schema.prisma	Adicionados tipos PL_006h (Decimal, Char, enums)
prisma/seed.ts	Ajustado para usar Decimal do Prisma
prisma/seed-fiscal.ts	Ajustado para usar Decimal do Prisma
src/types/fiscal.d.ts	Adicionados 28 tipos do PL_006h
src/types/erp.d.ts	Adicionados tipos PL_006h
src/utils/xmlNfeGenerator.ts	Substituído btoa() por Buffer, validações TChNFe/TProt/TJust
src/utils/xmlNfseGenerator.ts	Substituído btoa() por Buffer
src/utils/validators.ts	Adicionadas validações PL_006h
src/utils/pl006h.validator.ts	NOVO - Validações centralizadas
src/services/nfe.service.ts	Validações TJust/TChNFe, Decimal
src/services/nfse.service.ts	Validações, Decimal
src/repositories/nfe.repository.ts	Enums, validações, IBS/CBS
src/controllers/nfe.controller.ts	Filtros avançados, novas rotas
src/routes/nfe.routes.ts	12 rotas, rate limit
Frontend (React)
Arquivo	O que foi alterado
src/components/fiscal/NfeEmissor.tsx	Layout vertical, todos os campos PL_006h, transportadoras do banco
src/components/fiscal/DanfeViewer.tsx	Validações TChNFe/TProt
src/components/cadastros/ProdutosView.tsx	Alíquotas, CEST, EAN, validações
src/services/nfe.service.ts	Validações PL_006h, filtros
src/utils/xmlNfeGenerator.ts	base64Encode() com fallback
📋 PASSO A PASSO PARA AS PRÓXIMAS NOTAS
1. NFS-e (Nota Fiscal de Serviços)
Backend
bash
# 1. Validar tipos no schema
# - chaveAcesso: 53 dígitos (TChNFSe)
# - valores: Decimal(15,4)
# - alíquotas: Decimal(3,4)

# 2. Corrigir xmlNfseGenerator.ts
# - Substituir btoa() por Buffer
# - Validar TChNFSe (53 dígitos)
# - Validar TProt (15/17 dígitos)

# 3. Atualizar nfse.service.ts
# - Usar Decimal do Prisma
# - Validar TJust (15-255)
Frontend
bash
# 1. Atualizar NfseEmissor.tsx
# - Layout vertical (igual NF-e)
# - IBS/CBS detalhado
# - Campos: IE ST, Código IBGE, Complemento

# 2. Atualizar nfse.service.ts
# - Validações TChNFSe (53 dígitos)
# - Validações TJust (15-255)
2. NFC-e (Nota Fiscal de Consumidor)
Backend
bash
# 1. Validar schema
# - modelo: "65"
# - chaveAcesso: 44 dígitos
# - consumidorCpfCnpj: TCnpjOpc ou TCpf

# 2. Criar nfce.service.ts (se não existir)
# - Emissão com validações PL_006h
# - Cancelamento com TJust

# 3. Criar nfce.repository.ts
# - StatusDocumento enum
# - Validações TChNFe, TProt
Frontend
bash
# 1. Criar NfceEmissor.tsx
# - Modelo 65
# - Consumidor PF/PJ
# - Validações PL_006h

# 2. Atualizar nfce.service.ts
# - Filtros por data, status
# - Validações TChNFe
3. CT-e (Conhecimento de Transporte)
Backend
bash
# 1. Validar schema
# - modelo: "57"
# - chaveAcesso: 44 dígitos
# - RNTRC: string
# - veiculoPlaca: 7 caracteres

# 2. Corrigir cte.service.ts
# - Decimal para valores
# - Validações PL_006h

# 3. Atualizar cte.repository.ts
# - StatusDocumento enum
# - Validações TChNFe
Frontend
bash
# 1. Criar CteEmissor.tsx
# - Remetente e Destinatário
# - Veículo (Placa, UF, RNTC)
# - Volumes (Qtd, Espécie, Pesos)
# - Frete e componentes

# 2. Atualizar cte.service.ts
# - Validações PL_006h
4. NFA-e (Nota Fiscal Avulsa)
Backend
bash
# 1. Validar schema
# - modelo: "01-AVULSA"
# - chaveAcesso: 44 dígitos (NÃO É TChNFe!)
# - requerente: PF/PJ
# - guiaDAE: DAE

# 2. Corrigir nfae.service.ts
# - Validações TJust (15-255)
# - Validações de documento

# 3. Atualizar nfae.repository.ts
# - StatusDocumento enum
Frontend
bash
# 1. Criar NfaeEmissor.tsx
# - Requerente (PF/PJ)
# - Destinatário
# - Itens com ICMS
# - Guia DAE

# 2. Atualizar nfae.service.ts
# - Validações PL_006h
🔧 CHECKLIST RÁPIDO PARA CADA NOTA
Padrão para TODAS as notas:
Item	Ação
✅	prisma/schema.prisma - Decimal(15,4) para valores
✅	prisma/schema.prisma - @db.Char(n) para campos fixos
✅	src/types/fiscal.d.ts - Tipos PL_006h
✅	src/utils/pl006h.validator.ts - Validações centralizadas
✅	xml*Generator.ts - Buffer em vez de btoa()
✅	*service.ts - Validações TJust/TChNFe/TProt
✅	*repository.ts - Enums do Prisma
✅	*controller.ts - Filtros avançados
✅	*routes.ts - Rate limit, rotas completas
✅	*Emissor.tsx - Layout vertical, todos os campos
✅	*service.ts (frontend) - Validações PL_006h
🚀 COMANDOS PARA CADA MÓDULO
Backend
bash
# 1. Gerar novos tipos
npx prisma generate

# 2. Criar migration (se mudou schema)
npx prisma migrate dev --name add_tipos_pl006h_para_[modulo]

# 3. Rodar seed
npx prisma db seed
Frontend
bash
# 1. Verificar tipos
npm run type-check

# 2. Build
npm run build
📌 PRIORIDADE DE IMPLEMENTAÇÃO
Ordem	Módulo	Motivo
1	NFS-e	Já temos xmlNfseGenerator.ts e NfseService
2	NFC-e	Similar à NF-e (modelo 65)
3	CT-e	Já temos estrutura parcial
4	NFA-e	Já temos estrutura parcial
Dica: Siga o padrão que usamos na NF-e para todos os outros módulos! 🎯