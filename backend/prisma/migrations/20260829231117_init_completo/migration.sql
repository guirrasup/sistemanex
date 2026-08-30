/*
  Warnings:

  - The `indicadorIE` column on the `clientes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `modelo` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.
  - The `tipoEmissao` column on the `ctes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `municipioInicioCod` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(7)`.
  - You are about to alter the column `municipioFimCod` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(7)`.
  - You are about to alter the column `valorCargaAverbada` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `pesoBrutoKg` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `pesoLiquidoKg` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `cubagemM3` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `veiculoPlaca` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(7)`.
  - You are about to alter the column `motoristaCpf` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(11)`.
  - You are about to alter the column `valorTotalFrete` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `fretePeso` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `freteValor` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `pedagio` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `taxaGris` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `outrasTaxas` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorReceber` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - The `cstICMS` column on the `ctes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `baseCalculoICMS` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `aliquotaICMS` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(3,2)`.
  - You are about to alter the column `valorICMS` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorPIS` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorCOFINS` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorTributosAprox` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `protocoloAutorizacao` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(17)`.
  - You are about to alter the column `valor` on the `duplicatas` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `cnpj` on the `empresas` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(14)`.
  - The `regimeTributario` column on the `empresas` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `aliquotaSimples` on the `empresas` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(3,2)`.
  - You are about to alter the column `codigoMunicipio` on the `enderecos` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(7)`.
  - You are about to alter the column `codigoPais` on the `enderecos` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(4)`.
  - You are about to alter the column `quantidade` on the `itens_nfae` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorUnitario` on the `itens_nfae` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotal` on the `itens_nfae` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `aliquotaICMS` on the `itens_nfae` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(3,2)`.
  - You are about to alter the column `valorICMS` on the `itens_nfae` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `quantidade` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorUnitario` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalBruto` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - The `cstICMS` column on the `itens_nfce` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `aliquotaICMS` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(3,2)`.
  - You are about to alter the column `baseCalculoICMS` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorICMS` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - The `cstPIS` column on the `itens_nfce` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `aliquotaPIS` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,4)`.
  - You are about to alter the column `valorPIS` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - The `cstCOFINS` column on the `itens_nfce` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `aliquotaCOFINS` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,4)`.
  - You are about to alter the column `valorCOFINS` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorTributosAprox` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `quantidade` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorUnitario` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalBruto` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `descontoItem` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - The `origemMercadoria` column on the `itens_nfe` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `cstICMS` column on the `itens_nfe` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `aliquotaICMS` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(3,2)`.
  - You are about to alter the column `baseCalculoICMS` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorICMS` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - The `cstIPI` column on the `itens_nfe` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `aliquotaIPI` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(3,2)`.
  - You are about to alter the column `valorIPI` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - The `cstPIS` column on the `itens_nfe` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `aliquotaPIS` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,4)`.
  - You are about to alter the column `valorPIS` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - The `cstCOFINS` column on the `itens_nfe` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `aliquotaCOFINS` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,4)`.
  - You are about to alter the column `valorCOFINS` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `aliquotaIBSUF` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,4)`.
  - You are about to alter the column `valorIBSUF` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `aliquotaIBSMun` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,4)`.
  - You are about to alter the column `valorIBSMun` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `aliquotaCBS` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,4)`.
  - You are about to alter the column `valorCBS` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorTributosAprox` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `quantidade` on the `movimentacoes_estoque` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(11,3)`.
  - You are about to alter the column `quantidadeAnterior` on the `movimentacoes_estoque` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(11,3)`.
  - You are about to alter the column `quantidadePosterior` on the `movimentacoes_estoque` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(11,3)`.
  - You are about to alter the column `custoUnitario` on the `movimentacoes_estoque` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotal` on the `movimentacoes_estoque` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `requerenteUf` on the `nfaes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.
  - You are about to alter the column `requerenteCep` on the `nfaes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(9)`.
  - You are about to alter the column `valorTotalProdutos` on the `nfaes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `baseCalculoICMS` on the `nfaes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `aliquotaICMSMediana` on the `nfaes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(3,2)`.
  - You are about to alter the column `valorTotalICMS` on the `nfaes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorTotalNota` on the `nfaes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `guiaDAEValor` on the `nfaes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `protocoloAutorizacao` on the `nfaes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(17)`.
  - You are about to drop the column `formaPagamento` on the `nfces` table. All the data in the column will be lost.
  - You are about to alter the column `modelo` on the `nfces` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.
  - The `tipoEmissao` column on the `nfces` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `valorTotalProdutos` on the `nfces` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorTotalDesconto` on the `nfces` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorTotalAcrescimo` on the `nfces` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorTotalTributosAprox` on the `nfces` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorTotalNota` on the `nfces` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorPago` on the `nfces` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorTroco` on the `nfces` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `protocoloAutorizacao` on the `nfces` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(17)`.
  - You are about to drop the column `formaPagamento` on the `nfes` table. All the data in the column will be lost.
  - You are about to alter the column `modelo` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.
  - The `tipoEmissao` column on the `nfes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tipoDocumento` column on the `nfes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `finalidade` column on the `nfes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `consumidorFinal` column on the `nfes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `presencaComprador` column on the `nfes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `valorTotalProdutos` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorTotalFrete` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorTotalSeguro` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorTotalDesconto` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorTotalOutrasDesp` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `baseCalculoICMS` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorTotalICMS` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `baseCalculoICMSST` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorTotalICMSST` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorTotalIPI` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorTotalPIS` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorTotalCOFINS` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorTotalIBS` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorTotalCBS` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorTotalTributosAprox` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorTotalNota` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `protocoloAutorizacao` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(17)`.
  - You are about to alter the column `valorTotalServicos` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalDescontos` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalDeducoes` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `baseCalculoISS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalISS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalISSRetido` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalRetencoesFed` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalIBS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalCBS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorLiquidoNfse` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalNotaFinal` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaISS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(3,2)`.
  - You are about to alter the column `valorISS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaPIS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,4)`.
  - You are about to alter the column `valorPIS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaCOFINS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,4)`.
  - You are about to alter the column `valorCOFINS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaIRRF` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(3,2)`.
  - You are about to alter the column `valorIRRF` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaCSLL` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(3,2)`.
  - You are about to alter the column `valorCSLL` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaINSS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(3,2)`.
  - You are about to alter the column `valorINSS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaIBSUF` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,4)`.
  - You are about to alter the column `valorIBSUF` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaIBSMun` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,4)`.
  - You are about to alter the column `valorIBSMun` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaCBS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,4)`.
  - You are about to alter the column `valorCBS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `cfopPadrao` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(4)`.
  - The `origem` column on the `produtos` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `precoCusto` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `margemLucro` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(3,2)`.
  - You are about to alter the column `precoVenda` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `estoqueAtual` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(11,3)`.
  - You are about to alter the column `estoqueMinimo` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(11,3)`.
  - You are about to alter the column `aliquotaICMS` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(3,2)`.
  - You are about to alter the column `aliquotaPIS` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,4)`.
  - You are about to alter the column `aliquotaCOFINS` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,4)`.
  - You are about to alter the column `aliquotaIPI` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(3,2)`.
  - You are about to alter the column `aliquotaIBS` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,4)`.
  - You are about to alter the column `aliquotaCBS` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,4)`.
  - You are about to alter the column `valorUnitario` on the `servicos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaISS` on the `servicos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(3,2)`.
  - You are about to alter the column `aliquotaPIS` on the `servicos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,4)`.
  - You are about to alter the column `aliquotaCOFINS` on the `servicos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,4)`.
  - You are about to alter the column `aliquotaIRRF` on the `servicos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(3,2)`.
  - You are about to alter the column `aliquotaCSLL` on the `servicos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(3,2)`.
  - You are about to alter the column `aliquotaINSS` on the `servicos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(3,2)`.
  - You are about to alter the column `aliquotaIBS` on the `servicos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,4)`.
  - You are about to alter the column `aliquotaCBS` on the `servicos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,4)`.
  - You are about to alter the column `valorOriginal` on the `titulos_financeiros` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorJurosMulta` on the `titulos_financeiros` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorDesconto` on the `titulos_financeiros` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valorPago` on the `titulos_financeiros` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `cnpj` on the `transportadoras` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(14)`.
  - The `regimeTributario` column on the `transportadoras` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `modalidadeFrete` column on the `transportes_nfe` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `transportadoraCnpj` on the `transportes_nfe` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(14)`.
  - You are about to alter the column `veiculoPlaca` on the `transportes_nfe` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(7)`.
  - You are about to alter the column `volumesQuantidade` on the `transportes_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `volumesPesoLiquido` on the `transportes_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,3)`.
  - You are about to alter the column `volumesPesoBruto` on the `transportes_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,3)`.
  - Added the required column `codigoUF` to the `empresas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codigoUF` to the `enderecos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantidadeTributavel` to the `itens_nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unidadeTributavel` to the `itens_nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valorUnitarioTributavel` to the `itens_nfe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cDV` to the `nfes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cMunFG` to the `nfes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cNF` to the `nfes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cUF` to the `nfes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valorPago` to the `nfes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verProc` to the `nfes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cListServ` to the `servicos` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CRT" AS ENUM ('SIMPLES_NACIONAL', 'SIMPLES_EXCESSO', 'NORMAL', 'MEI');

-- CreateEnum
CREATE TYPE "TpImp" AS ENUM ('SEM_DANFE', 'DANFE_RETRATO', 'DANFE_PAISAGEM', 'DANFE_SIMPLIFICADO', 'DANFE_NFCE', 'DANFE_NFCE_MSG');

-- CreateEnum
CREATE TYPE "TpEmis" AS ENUM ('NORMAL', 'CONTINGENCIA_FS', 'REGIME_ESPECIAL_NFF', 'CONTINGENCIA_DPEC', 'CONTINGENCIA_FSDA', 'CONTINGENCIA_SVC_AN', 'CONTINGENCIA_SVC_RS', 'OFF_LINE_NFCE');

-- CreateEnum
CREATE TYPE "TpNF" AS ENUM ('ENTRADA', 'SAIDA');

-- CreateEnum
CREATE TYPE "IdDest" AS ENUM ('OPERACAO_INTERNA', 'OPERACAO_INTERESTADUAL', 'OPERACAO_EXTERIOR');

-- CreateEnum
CREATE TYPE "IndPresenca" AS ENUM ('NAO_APLICA', 'PRESENCIAL', 'NAO_PRESENCIAL_INTERNET', 'NAO_PRESENCIAL_TELE', 'NFC_ENTREGA_DOMICILIO', 'PRESENCIAL_FORA', 'NAO_PRESENCIAL_OUTROS');

-- CreateEnum
CREATE TYPE "FinNFe" AS ENUM ('NORMAL', 'COMPLEMENTAR', 'AJUSTE', 'DEVOLUCAO_RETORNO');

-- CreateEnum
CREATE TYPE "ProcEmi" AS ENUM ('APP_CONTRIBUINTE', 'AVULSA_FISCO', 'AVULSA_CONTRIBUINTE_SITE', 'APP_FISCO');

-- CreateEnum
CREATE TYPE "IndFinal" AS ENUM ('NAO', 'SIM');

-- CreateEnum
CREATE TYPE "IndIntermed" AS ENUM ('SEM_INTERMEDIADOR', 'COM_INTERMEDIADOR');

-- CreateEnum
CREATE TYPE "ModFrete" AS ENUM ('CIF', 'FOB', 'TERCEIROS', 'PROPRIO_REMETENTE', 'PROPRIO_DESTINATARIO', 'SEM_TRANSPORTE');

-- CreateEnum
CREATE TYPE "IndIEDest" AS ENUM ('CONTRIBUINTE', 'ISENTO', 'NAO_CONTRIBUINTE');

-- CreateEnum
CREATE TYPE "IndPag" AS ENUM ('VISTA', 'PRAZO');

-- CreateEnum
CREATE TYPE "TpIntegra" AS ENUM ('INTEGRADO', 'NAO_INTEGRADO');

-- CreateEnum
CREATE TYPE "OrigemMercadoria" AS ENUM ('NACIONAL', 'ESTRANGEIRA_IMPORTACAO_DIRETA', 'ESTRANGEIRA_MERCADO_INTERNO', 'NACIONAL_CONTEUDO_40_70', 'NACIONAL_PROCESSOS_BASICOS', 'NACIONAL_CONTEUDO_INFERIOR_40', 'ESTRANGEIRA_IMPORTACAO_DIRETA_CAMEX', 'ESTRANGEIRA_MERCADO_INTERNO_CAMEX', 'NACIONAL_CONTEUDO_IMPORTACAO_70');

-- CreateEnum
CREATE TYPE "ModBC" AS ENUM ('MVA', 'PAUTA', 'PRECO_TABELADO', 'VALOR_OPERACAO');

-- CreateEnum
CREATE TYPE "ModBCST" AS ENUM ('PRECO_TABELADO', 'LISTA_NEGATIVA', 'LISTA_POSITIVA', 'LISTA_NEUTRA', 'MVA', 'PAUTA', 'VALOR_OPERACAO');

-- CreateEnum
CREATE TYPE "MotDesICMS" AS ENUM ('TAXI', 'PRODUTOR_AGROPECUARIO', 'FROTISTA_LOCADORA', 'DIPLOMATICO_CONSULAR', 'AMAZONIA_OCCIDENTAL', 'SUFRAMA', 'ORGAO_PUBLICO', 'OUTROS', 'DEFICIENTE_CONDUTOR', 'DEFICIENTE_NAO_CONDUTOR', 'OLIMPIADAS_2016', 'SOLICITADO_FISCO');

-- CreateEnum
CREATE TYPE "MotDesICMSST" AS ENUM ('USO_AGROPECUARIA', 'OUTROS', 'FOMENTO_AGROPECUARIO');

-- CreateEnum
CREATE TYPE "IndDeduzDeson" AS ENUM ('NAO_DEDUZ', 'DEDUZ');

-- CreateEnum
CREATE TYPE "TpViaTransp" AS ENUM ('MARITIMA', 'FLUVIAL', 'LACUSTRE', 'AEREA', 'POSTAL', 'FERROVIARIA', 'RODOVIARIA', 'CONDUTO', 'MEIOS_PROPRIOS', 'ENTRADA_SAIDA_FICTA', 'COURIER', 'EM_MAOS', 'POR_REBOQUE');

-- CreateEnum
CREATE TYPE "TpIntermedio" AS ENUM ('CONTA_PROPRIA', 'CONTA_E_ORDEM', 'ENCOMENDA');

-- CreateEnum
CREATE TYPE "IndISS" AS ENUM ('EXIGIVEL', 'NAO_INCIDENTE', 'ISENCAO', 'EXPORTACAO', 'IMUNIDADE', 'SUSPENSAO_JUDICIAL', 'SUSPENSAO_ADMINISTRATIVA');

-- CreateEnum
CREATE TYPE "IndIncentivo" AS ENUM ('SIM', 'NAO');

-- CreateEnum
CREATE TYPE "TpAutor" AS ENUM ('EMITENTE', 'DESTINATARIO', 'EMPRESA', 'FISCO', 'RFB', 'OUTROS');

-- CreateEnum
CREATE TYPE "IndProc" AS ENUM ('SEFAZ', 'JUSTICA_FEDERAL', 'JUSTICA_ESTADUAL', 'SECEX_RFB', 'CONFAZ', 'OUTROS');

-- CreateEnum
CREATE TYPE "TpAto" AS ENUM ('TERMO_ACORDO', 'REGIME_ESPECIAL', 'AUTORIZACAO_ESPECIFICA', 'AJUSTE_SINIEF', 'CONVENIO_ICMS');

-- CreateEnum
CREATE TYPE "IndImport" AS ENUM ('NACIONAL', 'IMPORTADO');

-- CreateEnum
CREATE TYPE "TpArma" AS ENUM ('USO_PERMITIDO', 'USO_RESTRITO');

-- CreateEnum
CREATE TYPE "CSTICMS" AS ENUM ('CST_00', 'CST_02', 'CST_10', 'CST_15', 'CST_20', 'CST_30', 'CST_40', 'CST_41', 'CST_50', 'CST_51', 'CST_53', 'CST_60', 'CST_61', 'CST_70', 'CST_90');

-- CreateEnum
CREATE TYPE "CSOSN" AS ENUM ('CSOSN_101', 'CSOSN_102', 'CSOSN_103', 'CSOSN_201', 'CSOSN_202', 'CSOSN_203', 'CSOSN_300', 'CSOSN_400', 'CSOSN_500', 'CSOSN_900');

-- CreateEnum
CREATE TYPE "CSTPIS" AS ENUM ('CST_01', 'CST_02', 'CST_03', 'CST_04', 'CST_05', 'CST_06', 'CST_07', 'CST_08', 'CST_09', 'CST_49', 'CST_50', 'CST_51', 'CST_52', 'CST_53', 'CST_54', 'CST_55', 'CST_56', 'CST_60', 'CST_61', 'CST_62', 'CST_63', 'CST_64', 'CST_65', 'CST_66', 'CST_67', 'CST_70', 'CST_71', 'CST_72', 'CST_73', 'CST_74', 'CST_75', 'CST_98', 'CST_99');

-- CreateEnum
CREATE TYPE "CSTCOFINS" AS ENUM ('CST_01', 'CST_02', 'CST_03', 'CST_04', 'CST_05', 'CST_06', 'CST_07', 'CST_08', 'CST_09', 'CST_49', 'CST_50', 'CST_51', 'CST_52', 'CST_53', 'CST_54', 'CST_55', 'CST_56', 'CST_60', 'CST_61', 'CST_62', 'CST_63', 'CST_64', 'CST_65', 'CST_66', 'CST_67', 'CST_70', 'CST_71', 'CST_72', 'CST_73', 'CST_74', 'CST_75', 'CST_98', 'CST_99');

-- CreateEnum
CREATE TYPE "CSTIPI" AS ENUM ('CST_00', 'CST_01', 'CST_02', 'CST_03', 'CST_04', 'CST_05', 'CST_49', 'CST_50', 'CST_51', 'CST_52', 'CST_53', 'CST_54', 'CST_55', 'CST_99');

-- DropIndex
DROP INDEX "transportadoras_razaoSocial_idx";

-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "inscricaoEstadualST" TEXT,
ADD COLUMN     "inscricaoSuframa" CHAR(9),
DROP COLUMN "indicadorIE",
ADD COLUMN     "indicadorIE" "IndIEDest" NOT NULL DEFAULT 'NAO_CONTRIBUINTE';

-- AlterTable
ALTER TABLE "ctes" ALTER COLUMN "modelo" SET DATA TYPE CHAR(2),
DROP COLUMN "tipoEmissao",
ADD COLUMN     "tipoEmissao" "TpEmis" NOT NULL DEFAULT 'NORMAL',
ALTER COLUMN "municipioInicioCod" SET DATA TYPE CHAR(7),
ALTER COLUMN "municipioFimCod" SET DATA TYPE CHAR(7),
ALTER COLUMN "valorCargaAverbada" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "pesoBrutoKg" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "pesoLiquidoKg" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "cubagemM3" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "veiculoPlaca" SET DATA TYPE CHAR(7),
ALTER COLUMN "motoristaCpf" SET DATA TYPE CHAR(11),
ALTER COLUMN "valorTotalFrete" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "fretePeso" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "freteValor" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "pedagio" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "taxaGris" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "outrasTaxas" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorReceber" SET DATA TYPE DECIMAL(15,2),
DROP COLUMN "cstICMS",
ADD COLUMN     "cstICMS" "CSTICMS" NOT NULL DEFAULT 'CST_00',
ALTER COLUMN "baseCalculoICMS" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "aliquotaICMS" SET DATA TYPE DECIMAL(3,2),
ALTER COLUMN "valorICMS" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorPIS" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorCOFINS" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTributosAprox" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "protocoloAutorizacao" SET DATA TYPE CHAR(17);

-- AlterTable
ALTER TABLE "duplicatas" ALTER COLUMN "valor" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "empresas" ADD COLUMN     "codigoUF" CHAR(2) NOT NULL,
ADD COLUMN     "inscricaoEstadualST" TEXT,
ALTER COLUMN "cnpj" SET DATA TYPE CHAR(14),
DROP COLUMN "regimeTributario",
ADD COLUMN     "regimeTributario" "CRT" NOT NULL DEFAULT 'NORMAL',
ALTER COLUMN "aliquotaSimples" SET DATA TYPE DECIMAL(3,2);

-- AlterTable
ALTER TABLE "enderecos" ADD COLUMN     "codigoUF" CHAR(2) NOT NULL,
ALTER COLUMN "codigoMunicipio" SET DATA TYPE CHAR(7),
ALTER COLUMN "codigoPais" SET DATA TYPE CHAR(4);

-- AlterTable
ALTER TABLE "itens_nfae" ALTER COLUMN "quantidade" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorUnitario" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotal" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "aliquotaICMS" SET DATA TYPE DECIMAL(3,2),
ALTER COLUMN "valorICMS" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "itens_nfce" ALTER COLUMN "quantidade" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorUnitario" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalBruto" SET DATA TYPE DECIMAL(15,2),
DROP COLUMN "cstICMS",
ADD COLUMN     "cstICMS" "CSTICMS" NOT NULL DEFAULT 'CST_00',
ALTER COLUMN "aliquotaICMS" SET DATA TYPE DECIMAL(3,2),
ALTER COLUMN "baseCalculoICMS" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorICMS" SET DATA TYPE DECIMAL(15,2),
DROP COLUMN "cstPIS",
ADD COLUMN     "cstPIS" "CSTPIS" NOT NULL DEFAULT 'CST_01',
ALTER COLUMN "aliquotaPIS" SET DATA TYPE DECIMAL(5,4),
ALTER COLUMN "valorPIS" SET DATA TYPE DECIMAL(15,2),
DROP COLUMN "cstCOFINS",
ADD COLUMN     "cstCOFINS" "CSTCOFINS" NOT NULL DEFAULT 'CST_01',
ALTER COLUMN "aliquotaCOFINS" SET DATA TYPE DECIMAL(5,4),
ALTER COLUMN "valorCOFINS" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTributosAprox" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "itens_nfe" ADD COLUMN     "cBarra" VARCHAR(30),
ADD COLUMN     "cBarraTrib" VARCHAR(30),
ADD COLUMN     "cEnqIPI" VARCHAR(3),
ADD COLUMN     "codigoEAN" TEXT,
ADD COLUMN     "codigoEANTrib" TEXT,
ADD COLUMN     "csosnICMS" "CSOSN",
ADD COLUMN     "indTot" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "modBC" "ModBC" NOT NULL DEFAULT 'VALOR_OPERACAO',
ADD COLUMN     "nFCI" VARCHAR(36),
ADD COLUMN     "nItemPed" VARCHAR(6),
ADD COLUMN     "pCOFINSST" DECIMAL(5,4),
ADD COLUMN     "pFCP" DECIMAL(3,2),
ADD COLUMN     "pPISST" DECIMAL(5,4),
ADD COLUMN     "pRedBC" DECIMAL(3,2),
ADD COLUMN     "qBCProdCOFINS" DECIMAL(15,4),
ADD COLUMN     "qBCProdPIS" DECIMAL(15,4),
ADD COLUMN     "quantidadeTributavel" DECIMAL(15,4) NOT NULL,
ADD COLUMN     "unidadeTributavel" VARCHAR(6) NOT NULL,
ADD COLUMN     "vAliqProdCOFINS" DECIMAL(15,4),
ADD COLUMN     "vAliqProdPIS" DECIMAL(15,4),
ADD COLUMN     "vBCFCP" DECIMAL(15,2),
ADD COLUMN     "vBCSTCOFINS" DECIMAL(15,2),
ADD COLUMN     "vBCSTPIS" DECIMAL(15,2),
ADD COLUMN     "vCOFINSST" DECIMAL(15,2),
ADD COLUMN     "vFCP" DECIMAL(15,2),
ADD COLUMN     "vFreteItem" DECIMAL(15,2),
ADD COLUMN     "vOutroItem" DECIMAL(15,2),
ADD COLUMN     "vPISST" DECIMAL(15,2),
ADD COLUMN     "vSegItem" DECIMAL(15,2),
ADD COLUMN     "valorUnitarioTributavel" DECIMAL(15,4) NOT NULL,
ADD COLUMN     "xPed" VARCHAR(15),
ALTER COLUMN "quantidade" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorUnitario" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalBruto" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "descontoItem" SET DATA TYPE DECIMAL(15,2),
DROP COLUMN "origemMercadoria",
ADD COLUMN     "origemMercadoria" "OrigemMercadoria" NOT NULL DEFAULT 'NACIONAL',
DROP COLUMN "cstICMS",
ADD COLUMN     "cstICMS" "CSTICMS" NOT NULL DEFAULT 'CST_00',
ALTER COLUMN "aliquotaICMS" SET DATA TYPE DECIMAL(3,2),
ALTER COLUMN "baseCalculoICMS" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorICMS" SET DATA TYPE DECIMAL(15,2),
DROP COLUMN "cstIPI",
ADD COLUMN     "cstIPI" "CSTIPI",
ALTER COLUMN "aliquotaIPI" SET DATA TYPE DECIMAL(3,2),
ALTER COLUMN "valorIPI" SET DATA TYPE DECIMAL(15,2),
DROP COLUMN "cstPIS",
ADD COLUMN     "cstPIS" "CSTPIS" NOT NULL DEFAULT 'CST_01',
ALTER COLUMN "aliquotaPIS" SET DATA TYPE DECIMAL(5,4),
ALTER COLUMN "valorPIS" SET DATA TYPE DECIMAL(15,2),
DROP COLUMN "cstCOFINS",
ADD COLUMN     "cstCOFINS" "CSTCOFINS" NOT NULL DEFAULT 'CST_01',
ALTER COLUMN "aliquotaCOFINS" SET DATA TYPE DECIMAL(5,4),
ALTER COLUMN "valorCOFINS" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "aliquotaIBSUF" SET DATA TYPE DECIMAL(5,4),
ALTER COLUMN "valorIBSUF" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "aliquotaIBSMun" SET DATA TYPE DECIMAL(5,4),
ALTER COLUMN "valorIBSMun" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "aliquotaCBS" SET DATA TYPE DECIMAL(5,4),
ALTER COLUMN "valorCBS" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTributosAprox" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "movimentacoes_estoque" ALTER COLUMN "quantidade" SET DATA TYPE DECIMAL(11,3),
ALTER COLUMN "quantidadeAnterior" SET DATA TYPE DECIMAL(11,3),
ALTER COLUMN "quantidadePosterior" SET DATA TYPE DECIMAL(11,3),
ALTER COLUMN "custoUnitario" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotal" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "nfaes" ALTER COLUMN "requerenteUf" SET DATA TYPE CHAR(2),
ALTER COLUMN "requerenteCep" SET DATA TYPE CHAR(9),
ALTER COLUMN "valorTotalProdutos" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "baseCalculoICMS" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "aliquotaICMSMediana" SET DATA TYPE DECIMAL(3,2),
ALTER COLUMN "valorTotalICMS" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTotalNota" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "guiaDAEValor" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "protocoloAutorizacao" SET DATA TYPE CHAR(17);

-- AlterTable
ALTER TABLE "nfces" DROP COLUMN "formaPagamento",
ALTER COLUMN "modelo" SET DATA TYPE CHAR(2),
DROP COLUMN "tipoEmissao",
ADD COLUMN     "tipoEmissao" "TpEmis" NOT NULL DEFAULT 'NORMAL',
ALTER COLUMN "valorTotalProdutos" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTotalDesconto" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTotalAcrescimo" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTotalTributosAprox" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTotalNota" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorPago" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTroco" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "protocoloAutorizacao" SET DATA TYPE CHAR(17);

-- AlterTable
ALTER TABLE "nfes" DROP COLUMN "formaPagamento",
ADD COLUMN     "cDV" CHAR(1) NOT NULL,
ADD COLUMN     "cMunFG" CHAR(7) NOT NULL,
ADD COLUMN     "cNF" CHAR(8) NOT NULL,
ADD COLUMN     "cUF" CHAR(2) NOT NULL,
ADD COLUMN     "dhCont" TIMESTAMP(3),
ADD COLUMN     "idDest" "IdDest" NOT NULL DEFAULT 'OPERACAO_INTERNA',
ADD COLUMN     "indIntermed" "IndIntermed" DEFAULT 'SEM_INTERMEDIADOR',
ADD COLUMN     "infAdFisco" VARCHAR(2000),
ADD COLUMN     "infCpl" VARCHAR(5000),
ADD COLUMN     "procEmi" "ProcEmi" NOT NULL DEFAULT 'APP_CONTRIBUINTE',
ADD COLUMN     "qBCMono" DECIMAL(15,2),
ADD COLUMN     "qBCMonoRet" DECIMAL(15,2),
ADD COLUMN     "qBCMonoReten" DECIMAL(15,2),
ADD COLUMN     "tpImp" "TpImp" NOT NULL DEFAULT 'DANFE_RETRATO',
ADD COLUMN     "vFCP" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "vFCPST" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "vFCPSTRet" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "vFCPUFDest" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "vICMSMono" DECIMAL(15,2),
ADD COLUMN     "vICMSMonoRet" DECIMAL(15,2),
ADD COLUMN     "vICMSMonoReten" DECIMAL(15,2),
ADD COLUMN     "vICMSUFDest" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "vICMSUFRemet" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "valorICMSDeson" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "valorIPIDevol" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "valorPago" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "valorTroco" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "verProc" VARCHAR(20) NOT NULL,
ADD COLUMN     "xJust" VARCHAR(256),
ADD COLUMN     "xmlRetorno" TEXT,
ALTER COLUMN "modelo" SET DATA TYPE CHAR(2),
DROP COLUMN "tipoEmissao",
ADD COLUMN     "tipoEmissao" "TpEmis" NOT NULL DEFAULT 'NORMAL',
DROP COLUMN "tipoDocumento",
ADD COLUMN     "tipoDocumento" "TpNF" NOT NULL DEFAULT 'SAIDA',
DROP COLUMN "finalidade",
ADD COLUMN     "finalidade" "FinNFe" NOT NULL DEFAULT 'NORMAL',
DROP COLUMN "consumidorFinal",
ADD COLUMN     "consumidorFinal" "IndFinal" NOT NULL DEFAULT 'NAO',
DROP COLUMN "presencaComprador",
ADD COLUMN     "presencaComprador" "IndPresenca" NOT NULL DEFAULT 'NAO_PRESENCIAL_INTERNET',
ALTER COLUMN "valorTotalProdutos" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTotalFrete" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTotalSeguro" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTotalDesconto" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTotalOutrasDesp" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "baseCalculoICMS" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTotalICMS" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "baseCalculoICMSST" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTotalICMSST" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTotalIPI" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTotalPIS" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTotalCOFINS" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTotalIBS" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTotalCBS" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTotalTributosAprox" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorTotalNota" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "protocoloAutorizacao" SET DATA TYPE CHAR(17);

-- AlterTable
ALTER TABLE "nfses" ADD COLUMN     "indISS" "IndISS" NOT NULL DEFAULT 'EXIGIVEL',
ADD COLUMN     "indIncentivo" "IndIncentivo" NOT NULL DEFAULT 'NAO',
ALTER COLUMN "valorTotalServicos" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalDescontos" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalDeducoes" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "baseCalculoISS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalISS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalISSRetido" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalRetencoesFed" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalIBS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalCBS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorLiquidoNfse" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalNotaFinal" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaISS" SET DATA TYPE DECIMAL(3,2),
ALTER COLUMN "valorISS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaPIS" SET DATA TYPE DECIMAL(5,4),
ALTER COLUMN "valorPIS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaCOFINS" SET DATA TYPE DECIMAL(5,4),
ALTER COLUMN "valorCOFINS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaIRRF" SET DATA TYPE DECIMAL(3,2),
ALTER COLUMN "valorIRRF" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaCSLL" SET DATA TYPE DECIMAL(3,2),
ALTER COLUMN "valorCSLL" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaINSS" SET DATA TYPE DECIMAL(3,2),
ALTER COLUMN "valorINSS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaIBSUF" SET DATA TYPE DECIMAL(5,4),
ALTER COLUMN "valorIBSUF" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaIBSMun" SET DATA TYPE DECIMAL(5,4),
ALTER COLUMN "valorIBSMun" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaCBS" SET DATA TYPE DECIMAL(5,4),
ALTER COLUMN "valorCBS" SET DATA TYPE DECIMAL(15,4);

-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "aliquotaICMSST" DECIMAL(3,2),
ADD COLUMN     "csosnICMS" "CSOSN",
ADD COLUMN     "cstCOFINS" "CSTCOFINS" NOT NULL DEFAULT 'CST_01',
ADD COLUMN     "cstICMS" "CSTICMS" NOT NULL DEFAULT 'CST_00',
ADD COLUMN     "cstIPI" "CSTIPI" DEFAULT 'CST_50',
ADD COLUMN     "cstPIS" "CSTPIS" NOT NULL DEFAULT 'CST_01',
ADD COLUMN     "extipi" CHAR(3),
ADD COLUMN     "modBC" "ModBC" NOT NULL DEFAULT 'VALOR_OPERACAO',
ADD COLUMN     "modBCST" "ModBCST" NOT NULL DEFAULT 'MVA',
ADD COLUMN     "pMVAST" DECIMAL(3,2),
ADD COLUMN     "pRedBC" DECIMAL(3,2),
ADD COLUMN     "pRedBCST" DECIMAL(3,2),
ALTER COLUMN "cfopPadrao" SET DATA TYPE CHAR(4),
DROP COLUMN "origem",
ADD COLUMN     "origem" "OrigemMercadoria" NOT NULL DEFAULT 'NACIONAL',
ALTER COLUMN "precoCusto" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "margemLucro" SET DATA TYPE DECIMAL(3,2),
ALTER COLUMN "precoVenda" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "estoqueAtual" SET DATA TYPE DECIMAL(11,3),
ALTER COLUMN "estoqueMinimo" SET DATA TYPE DECIMAL(11,3),
ALTER COLUMN "aliquotaICMS" SET DATA TYPE DECIMAL(3,2),
ALTER COLUMN "aliquotaPIS" SET DATA TYPE DECIMAL(5,4),
ALTER COLUMN "aliquotaCOFINS" SET DATA TYPE DECIMAL(5,4),
ALTER COLUMN "aliquotaIPI" SET DATA TYPE DECIMAL(3,2),
ALTER COLUMN "aliquotaIBS" SET DATA TYPE DECIMAL(5,4),
ALTER COLUMN "aliquotaCBS" SET DATA TYPE DECIMAL(5,4);

-- AlterTable
ALTER TABLE "servicos" ADD COLUMN     "cListServ" CHAR(5) NOT NULL,
ADD COLUMN     "cServico" VARCHAR(20),
ALTER COLUMN "valorUnitario" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaISS" SET DATA TYPE DECIMAL(3,2),
ALTER COLUMN "aliquotaPIS" SET DATA TYPE DECIMAL(5,4),
ALTER COLUMN "aliquotaCOFINS" SET DATA TYPE DECIMAL(5,4),
ALTER COLUMN "aliquotaIRRF" SET DATA TYPE DECIMAL(3,2),
ALTER COLUMN "aliquotaCSLL" SET DATA TYPE DECIMAL(3,2),
ALTER COLUMN "aliquotaINSS" SET DATA TYPE DECIMAL(3,2),
ALTER COLUMN "aliquotaIBS" SET DATA TYPE DECIMAL(5,4),
ALTER COLUMN "aliquotaCBS" SET DATA TYPE DECIMAL(5,4);

-- AlterTable
ALTER TABLE "titulos_financeiros" ALTER COLUMN "valorOriginal" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorJurosMulta" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorDesconto" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "valorPago" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "transportadoras" ALTER COLUMN "cnpj" SET DATA TYPE CHAR(14),
DROP COLUMN "regimeTributario",
ADD COLUMN     "regimeTributario" "CRT" DEFAULT 'SIMPLES_NACIONAL';

-- AlterTable
ALTER TABLE "transportes_nfe" ADD COLUMN     "balsa" VARCHAR(20),
ADD COLUMN     "cMunFGRet" CHAR(7),
ADD COLUMN     "cfopRet" CHAR(4),
ADD COLUMN     "pICMSRet" DECIMAL(3,2),
ADD COLUMN     "reboquePlaca" CHAR(7),
ADD COLUMN     "reboqueRNTC" TEXT,
ADD COLUMN     "reboqueUf" CHAR(2),
ADD COLUMN     "vBCRet" DECIMAL(15,2),
ADD COLUMN     "vICMSRet" DECIMAL(15,2),
ADD COLUMN     "vServ" DECIMAL(15,2),
ADD COLUMN     "vagao" VARCHAR(20),
ADD COLUMN     "volumesNumeracao" TEXT,
DROP COLUMN "modalidadeFrete",
ADD COLUMN     "modalidadeFrete" "ModFrete" NOT NULL DEFAULT 'CIF',
ALTER COLUMN "transportadoraCnpj" SET DATA TYPE CHAR(14),
ALTER COLUMN "veiculoPlaca" SET DATA TYPE CHAR(7),
ALTER COLUMN "volumesQuantidade" SET DATA TYPE INTEGER,
ALTER COLUMN "volumesPesoLiquido" SET DATA TYPE DECIMAL(12,3),
ALTER COLUMN "volumesPesoBruto" SET DATA TYPE DECIMAL(12,3);

-- CreateTable
CREATE TABLE "nfes_referencias" (
    "id" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "tipoRef" TEXT NOT NULL,
    "chaveNFe" CHAR(44),
    "cUF" CHAR(2),
    "AAMM" CHAR(4),
    "CNPJ" CHAR(14),
    "CPF" CHAR(11),
    "IE" TEXT,
    "mod" CHAR(2),
    "serie" INTEGER,
    "nNF" INTEGER,
    "nECF" VARCHAR(3),
    "nCOO" VARCHAR(6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nfes_referencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_rastreabilidade" (
    "id" TEXT NOT NULL,
    "itemNFeId" TEXT NOT NULL,
    "nLote" VARCHAR(20) NOT NULL,
    "qLote" DECIMAL(11,3) NOT NULL,
    "dFab" TIMESTAMP(3) NOT NULL,
    "dVal" TIMESTAMP(3) NOT NULL,
    "cAgreg" VARCHAR(20),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itens_rastreabilidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "declaracoes_importacao" (
    "id" TEXT NOT NULL,
    "itemNFeId" TEXT NOT NULL,
    "nDI" VARCHAR(15) NOT NULL,
    "dDI" TIMESTAMP(3) NOT NULL,
    "xLocDesemb" VARCHAR(60) NOT NULL,
    "UFDesemb" CHAR(2) NOT NULL,
    "dDesemb" TIMESTAMP(3) NOT NULL,
    "tpViaTransp" "TpViaTransp" NOT NULL DEFAULT 'MARITIMA',
    "vAFRMM" DECIMAL(15,2),
    "tpIntermedio" "TpIntermedio" NOT NULL DEFAULT 'CONTA_PROPRIA',
    "CNPJ" CHAR(14),
    "CPF" CHAR(11),
    "UFTerceiro" CHAR(2),
    "cExportador" VARCHAR(60) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "declaracoes_importacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adicoes_importacao" (
    "id" TEXT NOT NULL,
    "diId" TEXT NOT NULL,
    "nAdicao" TEXT NOT NULL,
    "nSeqAdic" TEXT NOT NULL,
    "cFabricante" VARCHAR(60) NOT NULL,
    "vDescDI" DECIMAL(15,2),
    "nDraw" VARCHAR(20),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adicoes_importacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalhes_exportacao" (
    "id" TEXT NOT NULL,
    "itemNFeId" TEXT NOT NULL,
    "nDraw" VARCHAR(20),
    "nRE" VARCHAR(12),
    "chNFe" CHAR(44),
    "qExport" DECIMAL(15,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "detalhes_exportacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veiculos_produto" (
    "id" TEXT NOT NULL,
    "itemNFeId" TEXT NOT NULL,
    "tpOp" TEXT NOT NULL,
    "chassi" VARCHAR(17) NOT NULL,
    "cCor" VARCHAR(4) NOT NULL,
    "xCor" VARCHAR(40) NOT NULL,
    "pot" VARCHAR(4) NOT NULL,
    "cilin" VARCHAR(4) NOT NULL,
    "pesoL" VARCHAR(9) NOT NULL,
    "pesoB" VARCHAR(9) NOT NULL,
    "nSerie" VARCHAR(9) NOT NULL,
    "tpComb" VARCHAR(2) NOT NULL,
    "nMotor" VARCHAR(21) NOT NULL,
    "CMT" VARCHAR(9) NOT NULL,
    "dist" VARCHAR(4) NOT NULL,
    "anoMod" CHAR(4) NOT NULL,
    "anoFab" CHAR(4) NOT NULL,
    "tpPint" CHAR(1) NOT NULL,
    "tpVeic" VARCHAR(2) NOT NULL,
    "espVeic" CHAR(1) NOT NULL,
    "VIN" CHAR(1) NOT NULL,
    "condVeic" CHAR(1) NOT NULL,
    "cMod" VARCHAR(6) NOT NULL,
    "cCorDENATRAN" VARCHAR(2) NOT NULL,
    "lota" VARCHAR(3) NOT NULL,
    "tpRest" CHAR(1) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "veiculos_produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicamentos" (
    "id" TEXT NOT NULL,
    "itemNFeId" TEXT NOT NULL,
    "cProdANVISA" TEXT NOT NULL,
    "xMotivoIsencao" VARCHAR(255),
    "vPMC" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "armas" (
    "id" TEXT NOT NULL,
    "itemNFeId" TEXT NOT NULL,
    "tpArma" "TpArma" NOT NULL DEFAULT 'USO_PERMITIDO',
    "nSerie" VARCHAR(15) NOT NULL,
    "nCano" VARCHAR(15) NOT NULL,
    "descr" VARCHAR(256) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "armas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "combustiveis" (
    "id" TEXT NOT NULL,
    "itemNFeId" TEXT NOT NULL,
    "cProdANP" CHAR(9) NOT NULL,
    "descANP" VARCHAR(95) NOT NULL,
    "pGLP" DECIMAL(3,2),
    "pGNn" DECIMAL(3,2),
    "pGNi" DECIMAL(3,2),
    "vPart" DECIMAL(15,2),
    "CODIF" VARCHAR(21),
    "qTemp" DECIMAL(12,4),
    "UFCons" CHAR(2) NOT NULL,
    "pBio" DECIMAL(3,2),
    "qBCProdCIDE" DECIMAL(15,4) NOT NULL,
    "vAliqProdCIDE" DECIMAL(15,4) NOT NULL,
    "vCIDE" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "combustiveis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encerrantes" (
    "id" TEXT NOT NULL,
    "combustivelId" TEXT NOT NULL,
    "nBico" VARCHAR(3) NOT NULL,
    "nBomba" VARCHAR(3),
    "nTanque" VARCHAR(3) NOT NULL,
    "vEncIni" DECIMAL(12,3) NOT NULL,
    "vEncFin" DECIMAL(12,3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "encerrantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "origens_combustivel" (
    "id" TEXT NOT NULL,
    "combustivelId" TEXT NOT NULL,
    "indImport" "IndImport" NOT NULL DEFAULT 'NACIONAL',
    "cUFOrig" CHAR(2) NOT NULL,
    "pOrig" DECIMAL(3,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "origens_combustivel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lacres" (
    "id" TEXT NOT NULL,
    "transporteNFeId" TEXT NOT NULL,
    "nLacre" VARCHAR(60) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lacres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos_nfe" (
    "id" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "indPag" "IndPag" NOT NULL DEFAULT 'VISTA',
    "tPag" CHAR(2) NOT NULL,
    "xPag" VARCHAR(60),
    "vPag" DECIMAL(15,2) NOT NULL,
    "dPag" TIMESTAMP(3),
    "CNPJPag" CHAR(14),
    "UFPag" CHAR(2),
    "tpIntegra" "TpIntegra" DEFAULT 'INTEGRADO',
    "CNPJInstPag" CHAR(14),
    "tBand" CHAR(2),
    "cAut" VARCHAR(128),
    "CNPJReceb" CHAR(14),
    "idTermPag" VARCHAR(40),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagamentos_nfe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intermediadores" (
    "id" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "CNPJ" CHAR(14) NOT NULL,
    "idCadIntTran" VARCHAR(60) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intermediadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos_nfce" (
    "id" TEXT NOT NULL,
    "nfceId" TEXT NOT NULL,
    "indPag" "IndPag" NOT NULL DEFAULT 'VISTA',
    "tPag" CHAR(2) NOT NULL,
    "xPag" VARCHAR(60),
    "vPag" DECIMAL(15,2) NOT NULL,
    "dPag" TIMESTAMP(3),
    "tpIntegra" "TpIntegra" DEFAULT 'INTEGRADO',
    "CNPJInstPag" CHAR(14),
    "tBand" CHAR(2),
    "cAut" VARCHAR(128),
    "CNPJReceb" CHAR(14),
    "idTermPag" VARCHAR(40),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagamentos_nfce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_nfe" (
    "id" TEXT NOT NULL,
    "chaveNFe" CHAR(44) NOT NULL,
    "tpAutor" "TpAutor" NOT NULL DEFAULT 'EMITENTE',
    "tpEvento" CHAR(6) NOT NULL,
    "nSeqEvento" INTEGER NOT NULL DEFAULT 1,
    "dhEvento" TIMESTAMP(3) NOT NULL,
    "cStat" CHAR(3) NOT NULL,
    "xMotivo" TEXT NOT NULL,
    "nRec" CHAR(15),
    "nProt" CHAR(17),
    "xmlEvento" TEXT NOT NULL,
    "xmlRetorno" TEXT,
    "empresaId" TEXT NOT NULL,
    "nfeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventos_nfe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_credito_presumido" (
    "id" TEXT NOT NULL,
    "chaveNFe" CHAR(44) NOT NULL,
    "tpAutor" INTEGER NOT NULL DEFAULT 1,
    "verAplic" TEXT NOT NULL,
    "cOrgaoAutor" CHAR(2) NOT NULL,
    "dhEvento" TIMESTAMP(3) NOT NULL,
    "nRec" CHAR(15),
    "nProt" CHAR(17),
    "xmlEvento" TEXT NOT NULL,
    "xmlRetorno" TEXT,
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventos_credito_presumido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_credito_presumido_itens" (
    "id" TEXT NOT NULL,
    "nItem" TEXT NOT NULL,
    "vBCCredPres" DECIMAL(15,2) NOT NULL,
    "cCredPres" CHAR(2) NOT NULL,
    "pCredPresIBS" DECIMAL(5,4),
    "vCredPresIBS" DECIMAL(15,2),
    "pCredPresCBS" DECIMAL(5,4),
    "vCredPresCBS" DECIMAL(15,2),
    "eventoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventos_credito_presumido_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exportacoes" (
    "id" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "UFSaidaPais" CHAR(2) NOT NULL,
    "xLocExporta" VARCHAR(60) NOT NULL,
    "xLocDespacho" VARCHAR(60),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exportacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compras" (
    "id" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "xNEmp" VARCHAR(22),
    "xPed" VARCHAR(60),
    "xCont" VARCHAR(60),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cana" (
    "id" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "safra" VARCHAR(9) NOT NULL,
    "ref" CHAR(7) NOT NULL,
    "qTotMes" DECIMAL(15,4) NOT NULL,
    "qTotAnt" DECIMAL(15,4) NOT NULL,
    "qTotGer" DECIMAL(15,4) NOT NULL,
    "vFor" DECIMAL(15,2) NOT NULL,
    "vTotDed" DECIMAL(15,2) NOT NULL,
    "vLiqFor" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cana_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fornecimentos_dia" (
    "id" TEXT NOT NULL,
    "canaId" TEXT NOT NULL,
    "dia" CHAR(2) NOT NULL,
    "qtde" DECIMAL(15,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fornecimentos_dia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deducoes_cana" (
    "id" TEXT NOT NULL,
    "canaId" TEXT NOT NULL,
    "xDed" VARCHAR(60) NOT NULL,
    "vDed" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deducoes_cana_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "responsaveis_tecnicos" (
    "id" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "CNPJ" CHAR(14) NOT NULL,
    "xContato" VARCHAR(60) NOT NULL,
    "email" VARCHAR(60) NOT NULL,
    "fone" VARCHAR(14) NOT NULL,
    "idCSRT" CHAR(2),
    "hashCSRT" VARCHAR(28),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "responsaveis_tecnicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processos_referenciados" (
    "id" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "nProc" VARCHAR(60) NOT NULL,
    "indProc" "IndProc" NOT NULL DEFAULT 'SEFAZ',
    "tpAto" "TpAto",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "processos_referenciados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "declaracoes_importacao_itemNFeId_key" ON "declaracoes_importacao"("itemNFeId");

-- CreateIndex
CREATE UNIQUE INDEX "detalhes_exportacao_itemNFeId_key" ON "detalhes_exportacao"("itemNFeId");

-- CreateIndex
CREATE UNIQUE INDEX "veiculos_produto_itemNFeId_key" ON "veiculos_produto"("itemNFeId");

-- CreateIndex
CREATE UNIQUE INDEX "medicamentos_itemNFeId_key" ON "medicamentos"("itemNFeId");

-- CreateIndex
CREATE UNIQUE INDEX "combustiveis_itemNFeId_key" ON "combustiveis"("itemNFeId");

-- CreateIndex
CREATE UNIQUE INDEX "encerrantes_combustivelId_key" ON "encerrantes"("combustivelId");

-- CreateIndex
CREATE UNIQUE INDEX "intermediadores_nfeId_key" ON "intermediadores"("nfeId");

-- CreateIndex
CREATE INDEX "eventos_nfe_chaveNFe_idx" ON "eventos_nfe"("chaveNFe");

-- CreateIndex
CREATE INDEX "eventos_credito_presumido_chaveNFe_idx" ON "eventos_credito_presumido"("chaveNFe");

-- CreateIndex
CREATE UNIQUE INDEX "eventos_credito_presumido_itens_eventoId_nItem_key" ON "eventos_credito_presumido_itens"("eventoId", "nItem");

-- CreateIndex
CREATE UNIQUE INDEX "exportacoes_nfeId_key" ON "exportacoes"("nfeId");

-- CreateIndex
CREATE UNIQUE INDEX "compras_nfeId_key" ON "compras"("nfeId");

-- CreateIndex
CREATE UNIQUE INDEX "cana_nfeId_key" ON "cana"("nfeId");

-- CreateIndex
CREATE UNIQUE INDEX "fornecimentos_dia_canaId_dia_key" ON "fornecimentos_dia"("canaId", "dia");

-- CreateIndex
CREATE UNIQUE INDEX "responsaveis_tecnicos_nfeId_key" ON "responsaveis_tecnicos"("nfeId");

-- AddForeignKey
ALTER TABLE "nfes_referencias" ADD CONSTRAINT "nfes_referencias_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_rastreabilidade" ADD CONSTRAINT "itens_rastreabilidade_itemNFeId_fkey" FOREIGN KEY ("itemNFeId") REFERENCES "itens_nfe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "declaracoes_importacao" ADD CONSTRAINT "declaracoes_importacao_itemNFeId_fkey" FOREIGN KEY ("itemNFeId") REFERENCES "itens_nfe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adicoes_importacao" ADD CONSTRAINT "adicoes_importacao_diId_fkey" FOREIGN KEY ("diId") REFERENCES "declaracoes_importacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalhes_exportacao" ADD CONSTRAINT "detalhes_exportacao_itemNFeId_fkey" FOREIGN KEY ("itemNFeId") REFERENCES "itens_nfe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veiculos_produto" ADD CONSTRAINT "veiculos_produto_itemNFeId_fkey" FOREIGN KEY ("itemNFeId") REFERENCES "itens_nfe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicamentos" ADD CONSTRAINT "medicamentos_itemNFeId_fkey" FOREIGN KEY ("itemNFeId") REFERENCES "itens_nfe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "armas" ADD CONSTRAINT "armas_itemNFeId_fkey" FOREIGN KEY ("itemNFeId") REFERENCES "itens_nfe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combustiveis" ADD CONSTRAINT "combustiveis_itemNFeId_fkey" FOREIGN KEY ("itemNFeId") REFERENCES "itens_nfe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encerrantes" ADD CONSTRAINT "encerrantes_combustivelId_fkey" FOREIGN KEY ("combustivelId") REFERENCES "combustiveis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "origens_combustivel" ADD CONSTRAINT "origens_combustivel_combustivelId_fkey" FOREIGN KEY ("combustivelId") REFERENCES "combustiveis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lacres" ADD CONSTRAINT "lacres_transporteNFeId_fkey" FOREIGN KEY ("transporteNFeId") REFERENCES "transportes_nfe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos_nfe" ADD CONSTRAINT "pagamentos_nfe_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intermediadores" ADD CONSTRAINT "intermediadores_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos_nfce" ADD CONSTRAINT "pagamentos_nfce_nfceId_fkey" FOREIGN KEY ("nfceId") REFERENCES "nfces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_nfe" ADD CONSTRAINT "eventos_nfe_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_nfe" ADD CONSTRAINT "eventos_nfe_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_credito_presumido" ADD CONSTRAINT "eventos_credito_presumido_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_credito_presumido_itens" ADD CONSTRAINT "eventos_credito_presumido_itens_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "eventos_credito_presumido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exportacoes" ADD CONSTRAINT "exportacoes_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras" ADD CONSTRAINT "compras_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cana" ADD CONSTRAINT "cana_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecimentos_dia" ADD CONSTRAINT "fornecimentos_dia_canaId_fkey" FOREIGN KEY ("canaId") REFERENCES "cana"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deducoes_cana" ADD CONSTRAINT "deducoes_cana_canaId_fkey" FOREIGN KEY ("canaId") REFERENCES "cana"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responsaveis_tecnicos" ADD CONSTRAINT "responsaveis_tecnicos_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processos_referenciados" ADD CONSTRAINT "processos_referenciados_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
