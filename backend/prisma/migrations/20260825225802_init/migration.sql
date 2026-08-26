-- CreateEnum
CREATE TYPE "TipoPessoa" AS ENUM ('PF', 'PJ', 'EXTERIOR');

-- CreateEnum
CREATE TYPE "TipoCliente" AS ENUM ('CLIENTE', 'FORNECEDOR', 'AMBOS');

-- CreateEnum
CREATE TYPE "StatusDocumento" AS ENUM ('RASCUNHO', 'PROCESSANDO', 'AUTORIZADA', 'REJEITADA', 'CANCELADA', 'SUBSTITUIDA');

-- CreateEnum
CREATE TYPE "TipoAmbiente" AS ENUM ('PRODUCAO', 'HOMOLOGACAO');

-- CreateEnum
CREATE TYPE "StatusTitulo" AS ENUM ('PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoTitulo" AS ENUM ('RECEBER', 'PAGAR');

-- CreateEnum
CREATE TYPE "CategoriaFinanceira" AS ENUM ('VENDA_PRODUTOS', 'PRESTACAO_SERVICOS', 'COMPRA_MERCADORIAS', 'FOLHA_PAGAMENTO', 'IMPOSTOS_TRIBUTOS', 'ALUGUEL_INFRA', 'MARKETING_VENDAS', 'DESPESAS_ADMINISTRATIVAS', 'OUTRAS_RECEITAS', 'OUTRAS_DESPESAS');

-- CreateEnum
CREATE TYPE "RegimeTributario" AS ENUM ('SIMPLES_NACIONAL', 'SIMPLES_EXCESSO', 'NORMAL');

-- CreateEnum
CREATE TYPE "TipoMovimentacaoEstoque" AS ENUM ('ENTRADA_COMPRA', 'SAIDA_VENDA', 'SAIDA_NFE', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO', 'INVENTARIO');

-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('ADMIN', 'FISCAL', 'OPERADOR');

-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "cnpj" TEXT NOT NULL,
    "inscricaoEstadual" TEXT,
    "inscricaoMunicipal" TEXT,
    "cnae" TEXT,
    "regimeTributario" "RegimeTributario" NOT NULL DEFAULT 'SIMPLES_NACIONAL',
    "aliquotaSimples" DOUBLE PRECISION DEFAULT 6.0,
    "ambienteEmissao" "TipoAmbiente" NOT NULL DEFAULT 'PRODUCAO',
    "serieNfe" INTEGER NOT NULL DEFAULT 1,
    "proximoNumeroNfe" INTEGER NOT NULL DEFAULT 1,
    "serieNfse" INTEGER NOT NULL DEFAULT 1,
    "proximoNumeroNfse" INTEGER NOT NULL DEFAULT 1,
    "serieNfce" INTEGER NOT NULL DEFAULT 1,
    "proximoNumeroNfce" INTEGER NOT NULL DEFAULT 1,
    "serieCte" INTEGER NOT NULL DEFAULT 1,
    "proximoNumeroCte" INTEGER NOT NULL DEFAULT 1,
    "serieNfae" INTEGER NOT NULL DEFAULT 900,
    "proximoNumeroNfae" INTEGER NOT NULL DEFAULT 1,
    "chavePixPadrao" TEXT,
    "bancoPadrao" TEXT,
    "optanteSimples" BOOLEAN NOT NULL DEFAULT true,
    "optanteMEI" BOOLEAN NOT NULL DEFAULT false,
    "enderecoId" TEXT NOT NULL,
    "certificadoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enderecos" (
    "id" TEXT NOT NULL,
    "logradouro" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "codigoMunicipio" TEXT NOT NULL,
    "nomeMunicipio" TEXT NOT NULL,
    "uf" CHAR(2) NOT NULL,
    "cep" CHAR(9) NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "codigoPais" TEXT DEFAULT '1058',
    "nomePais" TEXT DEFAULT 'BRASIL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enderecos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificados_digitais" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'A1',
    "nomeTitular" TEXT NOT NULL,
    "cnpjCpf" TEXT NOT NULL,
    "emissora" TEXT NOT NULL,
    "dataValidadeInicio" TIMESTAMP(3) NOT NULL,
    "dataValidadeFim" TIMESTAMP(3) NOT NULL,
    "diasRestantes" INTEGER NOT NULL,
    "arquivoCarregadoNome" TEXT,
    "status" TEXT NOT NULL DEFAULT 'VALIDO',
    "arquivoBase64" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificados_digitais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "cargo" TEXT,
    "perfil" "PerfilUsuario" NOT NULL DEFAULT 'OPERADOR',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoLogin" TIMESTAMP(3),
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "tipo" "TipoCliente" NOT NULL DEFAULT 'CLIENTE',
    "tipoPessoa" "TipoPessoa" NOT NULL DEFAULT 'PJ',
    "documento" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "inscricaoEstadual" TEXT,
    "inscricaoMunicipal" TEXT,
    "indicadorIE" TEXT NOT NULL DEFAULT '9',
    "email" TEXT,
    "telefone" TEXT,
    "celularWhatsApp" TEXT,
    "contato" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "enderecoId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "codigoBarrasEAN" TEXT,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "unidade" TEXT NOT NULL DEFAULT 'UN',
    "ncm" CHAR(8) NOT NULL,
    "cest" CHAR(7),
    "cfopPadrao" TEXT NOT NULL DEFAULT '5102',
    "origem" INTEGER NOT NULL DEFAULT 0,
    "precoCusto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "margemLucro" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "precoVenda" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estoqueAtual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estoqueMinimo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aliquotaICMS" DOUBLE PRECISION NOT NULL DEFAULT 18.0,
    "aliquotaPIS" DOUBLE PRECISION NOT NULL DEFAULT 1.65,
    "aliquotaCOFINS" DOUBLE PRECISION NOT NULL DEFAULT 7.6,
    "aliquotaIPI" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aliquotaIBS" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "aliquotaCBS" DOUBLE PRECISION NOT NULL DEFAULT 0.9,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicos" (
    "id" TEXT NOT NULL,
    "codigoInterno" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "codigoTributacaoNacional" CHAR(6) NOT NULL,
    "codigoTributacaoMunicipal" CHAR(4),
    "codigoNBS" TEXT,
    "valorUnitario" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aliquotaISS" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "retencaoISSPadrao" BOOLEAN NOT NULL DEFAULT false,
    "aliquotaPIS" DOUBLE PRECISION NOT NULL DEFAULT 0.65,
    "aliquotaCOFINS" DOUBLE PRECISION NOT NULL DEFAULT 3.0,
    "aliquotaIRRF" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aliquotaCSLL" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aliquotaINSS" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aliquotaIBS" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "aliquotaCBS" DOUBLE PRECISION NOT NULL DEFAULT 0.9,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfses" (
    "id" TEXT NOT NULL,
    "chaveAcesso" CHAR(53) NOT NULL,
    "numeroNfse" INTEGER NOT NULL,
    "serieDPS" INTEGER NOT NULL DEFAULT 1,
    "numeroDPS" INTEGER NOT NULL,
    "dataCompetencia" TIMESTAMP(3) NOT NULL,
    "dataHoraEmissao" TIMESTAMP(3) NOT NULL,
    "dataHoraProcessamento" TIMESTAMP(3) NOT NULL,
    "codigoVerificacao" CHAR(9) NOT NULL,
    "ambiente" "TipoAmbiente" NOT NULL DEFAULT 'PRODUCAO',
    "tipoEmissao" INTEGER NOT NULL DEFAULT 1,
    "status" "StatusDocumento" NOT NULL DEFAULT 'PROCESSANDO',
    "valorTotalServicos" DOUBLE PRECISION NOT NULL,
    "valorTotalDescontos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTotalDeducoes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "baseCalculoISS" DOUBLE PRECISION NOT NULL,
    "valorTotalISS" DOUBLE PRECISION NOT NULL,
    "valorTotalISSRetido" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTotalRetencoesFed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTotalIBS" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTotalCBS" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorLiquidoNfse" DOUBLE PRECISION NOT NULL,
    "valorTotalNotaFinal" DOUBLE PRECISION NOT NULL,
    "informacoesComplementares" TEXT,
    "numeroPedido" TEXT,
    "motivoCancelamento" TEXT,
    "dataHoraCancelamento" TIMESTAMP(3),
    "chaveNfseSubstituta" TEXT,
    "xmlAssinado" TEXT NOT NULL,
    "urlVisualizacao" TEXT,
    "empresaId" TEXT NOT NULL,
    "tomadorId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "tributacaoISSQN" INTEGER NOT NULL DEFAULT 1,
    "tipoRetencaoISS" INTEGER NOT NULL DEFAULT 1,
    "aliquotaISS" DOUBLE PRECISION NOT NULL,
    "valorISS" DOUBLE PRECISION NOT NULL,
    "aliquotaPIS" DOUBLE PRECISION,
    "valorPIS" DOUBLE PRECISION,
    "retidoPIS" BOOLEAN NOT NULL DEFAULT false,
    "aliquotaCOFINS" DOUBLE PRECISION,
    "valorCOFINS" DOUBLE PRECISION,
    "retidoCOFINS" BOOLEAN NOT NULL DEFAULT false,
    "aliquotaIRRF" DOUBLE PRECISION,
    "valorIRRF" DOUBLE PRECISION,
    "aliquotaCSLL" DOUBLE PRECISION,
    "valorCSLL" DOUBLE PRECISION,
    "aliquotaINSS" DOUBLE PRECISION,
    "valorINSS" DOUBLE PRECISION,
    "aliquotaIBSUF" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "valorIBSUF" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aliquotaIBSMun" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "valorIBSMun" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aliquotaCBS" DOUBLE PRECISION NOT NULL DEFAULT 0.9,
    "valorCBS" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nfses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfes" (
    "id" TEXT NOT NULL,
    "modelo" TEXT NOT NULL DEFAULT '55',
    "serie" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "chaveAcesso" CHAR(44) NOT NULL,
    "dataHoraEmissao" TIMESTAMP(3) NOT NULL,
    "dataHoraSaida" TIMESTAMP(3),
    "naturezaOperacao" TEXT NOT NULL,
    "ambiente" "TipoAmbiente" NOT NULL DEFAULT 'PRODUCAO',
    "tipoEmissao" INTEGER NOT NULL DEFAULT 1,
    "tipoDocumento" INTEGER NOT NULL DEFAULT 1,
    "finalidade" INTEGER NOT NULL DEFAULT 1,
    "consumidorFinal" BOOLEAN NOT NULL DEFAULT false,
    "presencaComprador" INTEGER NOT NULL DEFAULT 2,
    "status" "StatusDocumento" NOT NULL DEFAULT 'PROCESSANDO',
    "valorTotalProdutos" DOUBLE PRECISION NOT NULL,
    "valorTotalFrete" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTotalSeguro" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTotalDesconto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTotalOutrasDesp" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "baseCalculoICMS" DOUBLE PRECISION NOT NULL,
    "valorTotalICMS" DOUBLE PRECISION NOT NULL,
    "baseCalculoICMSST" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTotalICMSST" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTotalIPI" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTotalPIS" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTotalCOFINS" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTotalIBS" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTotalCBS" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTotalTributosAprox" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTotalNota" DOUBLE PRECISION NOT NULL,
    "formaPagamento" TEXT NOT NULL DEFAULT '17',
    "informacoesAdicionais" TEXT,
    "protocoloAutorizacao" TEXT,
    "dataHoraAutorizacao" TIMESTAMP(3),
    "motivoCancelamento" TEXT,
    "dataHoraCancelamento" TIMESTAMP(3),
    "xmlAssinado" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "destinatarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nfes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_nfe" (
    "id" TEXT NOT NULL,
    "codigoProduto" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ncm" CHAR(8) NOT NULL,
    "cest" CHAR(7),
    "cfop" CHAR(4) NOT NULL,
    "unidadeMedida" TEXT NOT NULL DEFAULT 'UN',
    "quantidade" DOUBLE PRECISION NOT NULL,
    "valorUnitario" DOUBLE PRECISION NOT NULL,
    "valorTotalBruto" DOUBLE PRECISION NOT NULL,
    "descontoItem" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "origemMercadoria" INTEGER NOT NULL DEFAULT 0,
    "cstICMS" TEXT NOT NULL DEFAULT '00',
    "aliquotaICMS" DOUBLE PRECISION NOT NULL,
    "baseCalculoICMS" DOUBLE PRECISION NOT NULL,
    "valorICMS" DOUBLE PRECISION NOT NULL,
    "cstIPI" TEXT,
    "aliquotaIPI" DOUBLE PRECISION,
    "valorIPI" DOUBLE PRECISION,
    "cstPIS" TEXT NOT NULL DEFAULT '01',
    "aliquotaPIS" DOUBLE PRECISION NOT NULL,
    "valorPIS" DOUBLE PRECISION NOT NULL,
    "cstCOFINS" TEXT NOT NULL DEFAULT '01',
    "aliquotaCOFINS" DOUBLE PRECISION NOT NULL,
    "valorCOFINS" DOUBLE PRECISION NOT NULL,
    "aliquotaIBSUF" DOUBLE PRECISION,
    "valorIBSUF" DOUBLE PRECISION,
    "aliquotaIBSMun" DOUBLE PRECISION,
    "valorIBSMun" DOUBLE PRECISION,
    "aliquotaCBS" DOUBLE PRECISION,
    "valorCBS" DOUBLE PRECISION,
    "valorTributosAprox" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nfeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itens_nfe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duplicatas" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "nfeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "duplicatas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transportes_nfe" (
    "id" TEXT NOT NULL,
    "modalidadeFrete" INTEGER NOT NULL DEFAULT 0,
    "transportadoraCnpj" TEXT,
    "transportadoraNome" TEXT,
    "transportadoraIE" TEXT,
    "transportadoraEndereco" TEXT,
    "transportadoraMunicipio" TEXT,
    "transportadoraUf" CHAR(2),
    "veiculoPlaca" TEXT,
    "veiculoUf" CHAR(2),
    "veiculoRNTC" TEXT,
    "volumesQuantidade" DOUBLE PRECISION,
    "volumesEspecie" TEXT,
    "volumesMarca" TEXT,
    "volumesPesoLiquido" DOUBLE PRECISION,
    "volumesPesoBruto" DOUBLE PRECISION,
    "nfeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transportes_nfe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfces" (
    "id" TEXT NOT NULL,
    "modelo" TEXT NOT NULL DEFAULT '65',
    "serie" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "chaveAcesso" CHAR(44) NOT NULL,
    "dataHoraEmissao" TIMESTAMP(3) NOT NULL,
    "naturezaOperacao" TEXT NOT NULL DEFAULT 'Venda a Consumidor Final',
    "ambiente" "TipoAmbiente" NOT NULL DEFAULT 'PRODUCAO',
    "tipoEmissao" INTEGER NOT NULL DEFAULT 1,
    "status" "StatusDocumento" NOT NULL DEFAULT 'PROCESSANDO',
    "consumidorIdentificado" BOOLEAN NOT NULL DEFAULT false,
    "consumidorCpfCnpj" TEXT,
    "consumidorNome" TEXT,
    "consumidorEmail" TEXT,
    "valorTotalProdutos" DOUBLE PRECISION NOT NULL,
    "valorTotalDesconto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTotalAcrescimo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTotalTributosAprox" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTotalNota" DOUBLE PRECISION NOT NULL,
    "formaPagamento" TEXT NOT NULL DEFAULT '17',
    "valorPago" DOUBLE PRECISION NOT NULL,
    "valorTroco" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "urlQrCode" TEXT,
    "tokenCscId" TEXT,
    "protocoloAutorizacao" TEXT,
    "dataHoraAutorizacao" TIMESTAMP(3),
    "motivoCancelamento" TEXT,
    "dataHoraCancelamento" TIMESTAMP(3),
    "xmlAssinado" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "consumidorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nfces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_nfce" (
    "id" TEXT NOT NULL,
    "codigoProduto" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ncm" CHAR(8) NOT NULL,
    "cest" CHAR(7),
    "cfop" CHAR(4) NOT NULL,
    "unidadeMedida" TEXT NOT NULL DEFAULT 'UN',
    "quantidade" DOUBLE PRECISION NOT NULL,
    "valorUnitario" DOUBLE PRECISION NOT NULL,
    "valorTotalBruto" DOUBLE PRECISION NOT NULL,
    "cstICMS" TEXT NOT NULL DEFAULT '00',
    "aliquotaICMS" DOUBLE PRECISION NOT NULL,
    "baseCalculoICMS" DOUBLE PRECISION NOT NULL,
    "valorICMS" DOUBLE PRECISION NOT NULL,
    "cstPIS" TEXT NOT NULL DEFAULT '01',
    "aliquotaPIS" DOUBLE PRECISION NOT NULL,
    "valorPIS" DOUBLE PRECISION NOT NULL,
    "cstCOFINS" TEXT NOT NULL DEFAULT '01',
    "aliquotaCOFINS" DOUBLE PRECISION NOT NULL,
    "valorCOFINS" DOUBLE PRECISION NOT NULL,
    "valorTributosAprox" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nfceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itens_nfce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ctes" (
    "id" TEXT NOT NULL,
    "modelo" TEXT NOT NULL DEFAULT '57',
    "serie" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "chaveAcesso" CHAR(44) NOT NULL,
    "dataHoraEmissao" TIMESTAMP(3) NOT NULL,
    "naturezaOperacao" TEXT NOT NULL,
    "cfop" CHAR(4) NOT NULL,
    "ambiente" "TipoAmbiente" NOT NULL DEFAULT 'PRODUCAO',
    "tipoEmissao" INTEGER NOT NULL DEFAULT 1,
    "status" "StatusDocumento" NOT NULL DEFAULT 'PROCESSANDO',
    "remetenteId" TEXT NOT NULL,
    "destinatarioId" TEXT NOT NULL,
    "tomadorServico" INTEGER NOT NULL DEFAULT 0,
    "municipioInicioCod" TEXT NOT NULL,
    "municipioInicioNome" TEXT NOT NULL,
    "municipioInicioUf" CHAR(2) NOT NULL,
    "municipioFimCod" TEXT NOT NULL,
    "municipioFimNome" TEXT NOT NULL,
    "municipioFimUf" CHAR(2) NOT NULL,
    "produtoPredominante" TEXT NOT NULL,
    "valorCargaAverbada" DOUBLE PRECISION NOT NULL,
    "pesoBrutoKg" DOUBLE PRECISION NOT NULL,
    "pesoLiquidoKg" DOUBLE PRECISION NOT NULL,
    "quantidadeVolumes" INTEGER NOT NULL,
    "especieVolumes" TEXT NOT NULL,
    "cubagemM3" DOUBLE PRECISION,
    "chavesNFeTransportadas" TEXT,
    "rntrc" TEXT NOT NULL,
    "veiculoPlaca" TEXT NOT NULL,
    "veiculoUf" CHAR(2) NOT NULL,
    "motoristaNome" TEXT NOT NULL,
    "motoristaCpf" TEXT NOT NULL,
    "valorTotalFrete" DOUBLE PRECISION NOT NULL,
    "fretePeso" DOUBLE PRECISION NOT NULL,
    "freteValor" DOUBLE PRECISION NOT NULL,
    "pedagio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxaGris" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "outrasTaxas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorReceber" DOUBLE PRECISION NOT NULL,
    "cstICMS" TEXT NOT NULL DEFAULT '00',
    "baseCalculoICMS" DOUBLE PRECISION NOT NULL,
    "aliquotaICMS" DOUBLE PRECISION NOT NULL,
    "valorICMS" DOUBLE PRECISION NOT NULL,
    "valorPIS" DOUBLE PRECISION NOT NULL,
    "valorCOFINS" DOUBLE PRECISION NOT NULL,
    "valorTributosAprox" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "protocoloAutorizacao" TEXT,
    "dataHoraAutorizacao" TIMESTAMP(3),
    "motivoCancelamento" TEXT,
    "dataHoraCancelamento" TIMESTAMP(3),
    "xmlAssinado" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ctes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfaes" (
    "id" TEXT NOT NULL,
    "modelo" TEXT NOT NULL DEFAULT '01-AVULSA',
    "serie" INTEGER NOT NULL DEFAULT 900,
    "numero" INTEGER NOT NULL,
    "chaveAcesso" CHAR(44) NOT NULL,
    "dataHoraEmissao" TIMESTAMP(3) NOT NULL,
    "naturezaOperacao" TEXT NOT NULL,
    "motivoEmissao" TEXT NOT NULL,
    "descricaoMotivo" TEXT NOT NULL,
    "ambiente" "TipoAmbiente" NOT NULL DEFAULT 'PRODUCAO',
    "status" "StatusDocumento" NOT NULL DEFAULT 'PROCESSANDO',
    "requerenteTipo" TEXT NOT NULL DEFAULT 'PF',
    "requerenteCpfCnpj" TEXT NOT NULL,
    "requerenteNome" TEXT NOT NULL,
    "requerenteInscricao" TEXT,
    "requerenteLogradouro" TEXT NOT NULL,
    "requerenteNumero" TEXT NOT NULL,
    "requerenteBairro" TEXT NOT NULL,
    "requerenteMunicipio" TEXT NOT NULL,
    "requerenteUf" CHAR(2) NOT NULL,
    "requerenteCep" CHAR(9) NOT NULL,
    "requerenteTelefone" TEXT,
    "requerenteEmail" TEXT,
    "destinatarioId" TEXT NOT NULL,
    "valorTotalProdutos" DOUBLE PRECISION NOT NULL,
    "baseCalculoICMS" DOUBLE PRECISION NOT NULL,
    "aliquotaICMSMediana" DOUBLE PRECISION NOT NULL,
    "valorTotalICMS" DOUBLE PRECISION NOT NULL,
    "valorTotalNota" DOUBLE PRECISION NOT NULL,
    "guiaDAENumero" TEXT,
    "guiaDAECodigoBarras" TEXT,
    "guiaDAEChavePix" TEXT,
    "guiaDAEVencimento" TIMESTAMP(3),
    "guiaDAEValor" DOUBLE PRECISION,
    "guiaDAEStatus" TEXT,
    "orgaoEmissorSefaz" TEXT NOT NULL,
    "protocoloAutorizacao" TEXT,
    "dataHoraAutorizacao" TIMESTAMP(3),
    "motivoCancelamento" TEXT,
    "dataHoraCancelamento" TIMESTAMP(3),
    "xmlAssinado" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nfaes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_nfae" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ncm" CHAR(8) NOT NULL,
    "unidade" TEXT NOT NULL DEFAULT 'UN',
    "quantidade" DOUBLE PRECISION NOT NULL,
    "valorUnitario" DOUBLE PRECISION NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "aliquotaICMS" DOUBLE PRECISION NOT NULL,
    "valorICMS" DOUBLE PRECISION NOT NULL,
    "nfaeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itens_nfae_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "titulos_financeiros" (
    "id" TEXT NOT NULL,
    "tipo" "TipoTitulo" NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" "CategoriaFinanceira" NOT NULL,
    "pessoaId" TEXT,
    "pessoaNome" TEXT NOT NULL,
    "pessoaDocumento" TEXT NOT NULL,
    "dataEmissao" TIMESTAMP(3) NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "valorOriginal" DOUBLE PRECISION NOT NULL,
    "valorJurosMulta" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorDesconto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorPago" DOUBLE PRECISION,
    "status" "StatusTitulo" NOT NULL DEFAULT 'PENDENTE',
    "formaPagamento" TEXT NOT NULL,
    "documentoOrigemTipo" TEXT,
    "documentoOrigemChave" TEXT,
    "observacoes" TEXT,
    "nossoNumeroBoleto" TEXT,
    "codigoPixCopiaCola" TEXT,
    "empresaId" TEXT NOT NULL,
    "clienteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "titulos_financeiros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacoes_estoque" (
    "id" TEXT NOT NULL,
    "tipo" "TipoMovimentacaoEstoque" NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "quantidadeAnterior" DOUBLE PRECISION NOT NULL,
    "quantidadePosterior" DOUBLE PRECISION NOT NULL,
    "custoUnitario" DOUBLE PRECISION NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "documentoReferencia" TEXT,
    "observacao" TEXT,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movimentacoes_estoque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_cnpj_key" ON "empresas"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_enderecoId_key" ON "empresas"("enderecoId");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_certificadoId_key" ON "empresas"("certificadoId");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_documento_key" ON "clientes"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_enderecoId_key" ON "clientes"("enderecoId");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_codigo_key" ON "produtos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "servicos_codigoInterno_key" ON "servicos"("codigoInterno");

-- CreateIndex
CREATE UNIQUE INDEX "nfses_chaveAcesso_key" ON "nfses"("chaveAcesso");

-- CreateIndex
CREATE UNIQUE INDEX "nfes_chaveAcesso_key" ON "nfes"("chaveAcesso");

-- CreateIndex
CREATE UNIQUE INDEX "transportes_nfe_nfeId_key" ON "transportes_nfe"("nfeId");

-- CreateIndex
CREATE UNIQUE INDEX "nfces_chaveAcesso_key" ON "nfces"("chaveAcesso");

-- CreateIndex
CREATE UNIQUE INDEX "ctes_chaveAcesso_key" ON "ctes"("chaveAcesso");

-- CreateIndex
CREATE UNIQUE INDEX "nfaes_chaveAcesso_key" ON "nfaes"("chaveAcesso");

-- AddForeignKey
ALTER TABLE "empresas" ADD CONSTRAINT "empresas_enderecoId_fkey" FOREIGN KEY ("enderecoId") REFERENCES "enderecos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empresas" ADD CONSTRAINT "empresas_certificadoId_fkey" FOREIGN KEY ("certificadoId") REFERENCES "certificados_digitais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_enderecoId_fkey" FOREIGN KEY ("enderecoId") REFERENCES "enderecos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfses" ADD CONSTRAINT "nfses_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfses" ADD CONSTRAINT "nfses_tomadorId_fkey" FOREIGN KEY ("tomadorId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfses" ADD CONSTRAINT "nfses_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfes" ADD CONSTRAINT "nfes_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfes" ADD CONSTRAINT "nfes_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_nfe" ADD CONSTRAINT "itens_nfe_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duplicatas" ADD CONSTRAINT "duplicatas_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportes_nfe" ADD CONSTRAINT "transportes_nfe_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfces" ADD CONSTRAINT "nfces_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfces" ADD CONSTRAINT "nfces_consumidorId_fkey" FOREIGN KEY ("consumidorId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_nfce" ADD CONSTRAINT "itens_nfce_nfceId_fkey" FOREIGN KEY ("nfceId") REFERENCES "nfces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ctes" ADD CONSTRAINT "ctes_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ctes" ADD CONSTRAINT "ctes_remetenteId_fkey" FOREIGN KEY ("remetenteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ctes" ADD CONSTRAINT "ctes_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfaes" ADD CONSTRAINT "nfaes_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfaes" ADD CONSTRAINT "nfaes_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_nfae" ADD CONSTRAINT "itens_nfae_nfaeId_fkey" FOREIGN KEY ("nfaeId") REFERENCES "nfaes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "titulos_financeiros" ADD CONSTRAINT "titulos_financeiros_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "titulos_financeiros" ADD CONSTRAINT "titulos_financeiros_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
