/*
  Warnings:

  - You are about to alter the column `indicadorIE` on the `clientes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(1)`.
  - You are about to alter the column `modelo` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.
  - You are about to alter the column `municipioInicioCod` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(7)`.
  - You are about to alter the column `municipioFimCod` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(7)`.
  - You are about to alter the column `valorCargaAverbada` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `pesoBrutoKg` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `pesoLiquidoKg` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `cubagemM3` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `veiculoPlaca` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(7)`.
  - You are about to alter the column `motoristaCpf` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(11)`.
  - You are about to alter the column `valorTotalFrete` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `fretePeso` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `freteValor` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `pedagio` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `taxaGris` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `outrasTaxas` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorReceber` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `cstICMS` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.
  - You are about to alter the column `baseCalculoICMS` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaICMS` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `valorICMS` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorPIS` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorCOFINS` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTributosAprox` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `protocoloAutorizacao` on the `ctes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(17)`.
  - You are about to alter the column `valor` on the `duplicatas` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `cnpj` on the `empresas` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(14)`.
  - You are about to alter the column `aliquotaSimples` on the `empresas` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `codigoMunicipio` on the `enderecos` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(7)`.
  - You are about to alter the column `codigoPais` on the `enderecos` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(4)`.
  - You are about to alter the column `quantidade` on the `itens_nfae` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorUnitario` on the `itens_nfae` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotal` on the `itens_nfae` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaICMS` on the `itens_nfae` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `valorICMS` on the `itens_nfae` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `quantidade` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorUnitario` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalBruto` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `cstICMS` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.
  - You are about to alter the column `aliquotaICMS` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `baseCalculoICMS` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorICMS` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `cstPIS` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.
  - You are about to alter the column `aliquotaPIS` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,4)`.
  - You are about to alter the column `valorPIS` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `cstCOFINS` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.
  - You are about to alter the column `aliquotaCOFINS` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,4)`.
  - You are about to alter the column `valorCOFINS` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTributosAprox` on the `itens_nfce` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `quantidade` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorUnitario` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalBruto` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `descontoItem` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `cstICMS` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.
  - You are about to alter the column `aliquotaICMS` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `baseCalculoICMS` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorICMS` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `cstIPI` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.
  - You are about to alter the column `aliquotaIPI` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `valorIPI` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `cstPIS` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.
  - You are about to alter the column `aliquotaPIS` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,4)`.
  - You are about to alter the column `valorPIS` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `cstCOFINS` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.
  - You are about to alter the column `aliquotaCOFINS` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,4)`.
  - You are about to alter the column `valorCOFINS` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaIBSUF` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,4)`.
  - You are about to alter the column `valorIBSUF` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaIBSMun` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,4)`.
  - You are about to alter the column `valorIBSMun` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaCBS` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,4)`.
  - You are about to alter the column `valorCBS` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTributosAprox` on the `itens_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `quantidade` on the `movimentacoes_estoque` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(11,3)`.
  - You are about to alter the column `quantidadeAnterior` on the `movimentacoes_estoque` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(11,3)`.
  - You are about to alter the column `quantidadePosterior` on the `movimentacoes_estoque` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(11,3)`.
  - You are about to alter the column `custoUnitario` on the `movimentacoes_estoque` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotal` on the `movimentacoes_estoque` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `requerenteUf` on the `nfaes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.
  - You are about to alter the column `requerenteCep` on the `nfaes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(9)`.
  - You are about to alter the column `valorTotalProdutos` on the `nfaes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `baseCalculoICMS` on the `nfaes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaICMSMediana` on the `nfaes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `valorTotalICMS` on the `nfaes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalNota` on the `nfaes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `guiaDAEValor` on the `nfaes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `protocoloAutorizacao` on the `nfaes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(17)`.
  - You are about to alter the column `modelo` on the `nfces` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.
  - You are about to alter the column `valorTotalProdutos` on the `nfces` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalDesconto` on the `nfces` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalAcrescimo` on the `nfces` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalTributosAprox` on the `nfces` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalNota` on the `nfces` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `formaPagamento` on the `nfces` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.
  - You are about to alter the column `valorPago` on the `nfces` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTroco` on the `nfces` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `protocoloAutorizacao` on the `nfces` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(17)`.
  - You are about to alter the column `modelo` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.
  - You are about to alter the column `valorTotalProdutos` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalFrete` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalSeguro` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalDesconto` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalOutrasDesp` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `baseCalculoICMS` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalICMS` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `baseCalculoICMSST` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalICMSST` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalIPI` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalPIS` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalCOFINS` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalIBS` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalCBS` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalTributosAprox` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorTotalNota` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `formaPagamento` on the `nfes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.
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
  - You are about to alter the column `aliquotaISS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `valorISS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaPIS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,4)`.
  - You are about to alter the column `valorPIS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaCOFINS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,4)`.
  - You are about to alter the column `valorCOFINS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaIRRF` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `valorIRRF` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaCSLL` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `valorCSLL` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaINSS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `valorINSS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaIBSUF` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,4)`.
  - You are about to alter the column `valorIBSUF` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaIBSMun` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,4)`.
  - You are about to alter the column `valorIBSMun` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaCBS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,4)`.
  - You are about to alter the column `valorCBS` on the `nfses` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `cfopPadrao` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(4)`.
  - You are about to alter the column `precoCusto` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `margemLucro` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `precoVenda` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `estoqueAtual` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(11,3)`.
  - You are about to alter the column `estoqueMinimo` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(11,3)`.
  - You are about to alter the column `aliquotaICMS` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `aliquotaPIS` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,4)`.
  - You are about to alter the column `aliquotaCOFINS` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,4)`.
  - You are about to alter the column `aliquotaIPI` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `aliquotaIBS` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,4)`.
  - You are about to alter the column `aliquotaCBS` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,4)`.
  - You are about to alter the column `valorUnitario` on the `servicos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `aliquotaISS` on the `servicos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `aliquotaPIS` on the `servicos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,4)`.
  - You are about to alter the column `aliquotaCOFINS` on the `servicos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,4)`.
  - You are about to alter the column `aliquotaIRRF` on the `servicos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `aliquotaCSLL` on the `servicos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `aliquotaINSS` on the `servicos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `aliquotaIBS` on the `servicos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,4)`.
  - You are about to alter the column `aliquotaCBS` on the `servicos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(7,4)`.
  - You are about to alter the column `valorOriginal` on the `titulos_financeiros` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorJurosMulta` on the `titulos_financeiros` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorDesconto` on the `titulos_financeiros` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `valorPago` on the `titulos_financeiros` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `cnpj` on the `transportadoras` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(14)`.
  - You are about to alter the column `transportadoraCnpj` on the `transportes_nfe` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(14)`.
  - You are about to alter the column `veiculoPlaca` on the `transportes_nfe` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(7)`.
  - You are about to alter the column `volumesQuantidade` on the `transportes_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `volumesPesoLiquido` on the `transportes_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.
  - You are about to alter the column `volumesPesoBruto` on the `transportes_nfe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,4)`.

*/
-- DropIndex
DROP INDEX "transportadoras_razaoSocial_idx";

-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "inscricaoEstadualST" TEXT,
ALTER COLUMN "indicadorIE" SET DATA TYPE CHAR(1);

-- AlterTable
ALTER TABLE "ctes" ALTER COLUMN "modelo" SET DATA TYPE CHAR(2),
ALTER COLUMN "municipioInicioCod" SET DATA TYPE CHAR(7),
ALTER COLUMN "municipioFimCod" SET DATA TYPE CHAR(7),
ALTER COLUMN "valorCargaAverbada" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "pesoBrutoKg" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "pesoLiquidoKg" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "cubagemM3" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "veiculoPlaca" SET DATA TYPE CHAR(7),
ALTER COLUMN "motoristaCpf" SET DATA TYPE CHAR(11),
ALTER COLUMN "valorTotalFrete" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "fretePeso" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "freteValor" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "pedagio" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "taxaGris" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "outrasTaxas" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorReceber" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "cstICMS" SET DATA TYPE CHAR(2),
ALTER COLUMN "baseCalculoICMS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaICMS" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "valorICMS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorPIS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorCOFINS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTributosAprox" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "protocoloAutorizacao" SET DATA TYPE CHAR(17);

-- AlterTable
ALTER TABLE "duplicatas" ALTER COLUMN "valor" SET DATA TYPE DECIMAL(15,4);

-- AlterTable
ALTER TABLE "empresas" ALTER COLUMN "cnpj" SET DATA TYPE CHAR(14),
ALTER COLUMN "aliquotaSimples" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "enderecos" ALTER COLUMN "codigoMunicipio" SET DATA TYPE CHAR(7),
ALTER COLUMN "codigoPais" SET DATA TYPE CHAR(4);

-- AlterTable
ALTER TABLE "itens_nfae" ALTER COLUMN "quantidade" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorUnitario" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotal" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaICMS" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "valorICMS" SET DATA TYPE DECIMAL(15,4);

-- AlterTable
ALTER TABLE "itens_nfce" ALTER COLUMN "quantidade" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorUnitario" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalBruto" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "cstICMS" SET DATA TYPE CHAR(2),
ALTER COLUMN "aliquotaICMS" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "baseCalculoICMS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorICMS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "cstPIS" SET DATA TYPE CHAR(2),
ALTER COLUMN "aliquotaPIS" SET DATA TYPE DECIMAL(7,4),
ALTER COLUMN "valorPIS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "cstCOFINS" SET DATA TYPE CHAR(2),
ALTER COLUMN "aliquotaCOFINS" SET DATA TYPE DECIMAL(7,4),
ALTER COLUMN "valorCOFINS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTributosAprox" SET DATA TYPE DECIMAL(15,4);

-- AlterTable
ALTER TABLE "itens_nfe" ADD COLUMN     "codigoEAN" TEXT,
ADD COLUMN     "codigoEANTrib" TEXT,
ALTER COLUMN "quantidade" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorUnitario" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalBruto" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "descontoItem" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "cstICMS" SET DATA TYPE CHAR(2),
ALTER COLUMN "aliquotaICMS" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "baseCalculoICMS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorICMS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "cstIPI" SET DATA TYPE CHAR(2),
ALTER COLUMN "aliquotaIPI" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "valorIPI" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "cstPIS" SET DATA TYPE CHAR(2),
ALTER COLUMN "aliquotaPIS" SET DATA TYPE DECIMAL(7,4),
ALTER COLUMN "valorPIS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "cstCOFINS" SET DATA TYPE CHAR(2),
ALTER COLUMN "aliquotaCOFINS" SET DATA TYPE DECIMAL(7,4),
ALTER COLUMN "valorCOFINS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaIBSUF" SET DATA TYPE DECIMAL(7,4),
ALTER COLUMN "valorIBSUF" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaIBSMun" SET DATA TYPE DECIMAL(7,4),
ALTER COLUMN "valorIBSMun" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaCBS" SET DATA TYPE DECIMAL(7,4),
ALTER COLUMN "valorCBS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTributosAprox" SET DATA TYPE DECIMAL(15,4);

-- AlterTable
ALTER TABLE "movimentacoes_estoque" ALTER COLUMN "quantidade" SET DATA TYPE DECIMAL(11,3),
ALTER COLUMN "quantidadeAnterior" SET DATA TYPE DECIMAL(11,3),
ALTER COLUMN "quantidadePosterior" SET DATA TYPE DECIMAL(11,3),
ALTER COLUMN "custoUnitario" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotal" SET DATA TYPE DECIMAL(15,4);

-- AlterTable
ALTER TABLE "nfaes" ALTER COLUMN "requerenteUf" SET DATA TYPE CHAR(2),
ALTER COLUMN "requerenteCep" SET DATA TYPE CHAR(9),
ALTER COLUMN "valorTotalProdutos" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "baseCalculoICMS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaICMSMediana" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "valorTotalICMS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalNota" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "guiaDAEValor" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "protocoloAutorizacao" SET DATA TYPE CHAR(17);

-- AlterTable
ALTER TABLE "nfces" ALTER COLUMN "modelo" SET DATA TYPE CHAR(2),
ALTER COLUMN "valorTotalProdutos" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalDesconto" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalAcrescimo" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalTributosAprox" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalNota" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "formaPagamento" SET DATA TYPE CHAR(2),
ALTER COLUMN "valorPago" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTroco" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "protocoloAutorizacao" SET DATA TYPE CHAR(17);

-- AlterTable
ALTER TABLE "nfes" ADD COLUMN     "idDest" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "tpImp" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "modelo" SET DATA TYPE CHAR(2),
ALTER COLUMN "valorTotalProdutos" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalFrete" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalSeguro" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalDesconto" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalOutrasDesp" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "baseCalculoICMS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalICMS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "baseCalculoICMSST" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalICMSST" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalIPI" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalPIS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalCOFINS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalIBS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalCBS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalTributosAprox" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorTotalNota" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "formaPagamento" SET DATA TYPE CHAR(2),
ALTER COLUMN "protocoloAutorizacao" SET DATA TYPE CHAR(17);

-- AlterTable
ALTER TABLE "nfses" ALTER COLUMN "valorTotalServicos" SET DATA TYPE DECIMAL(15,4),
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
ALTER COLUMN "aliquotaISS" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "valorISS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaPIS" SET DATA TYPE DECIMAL(7,4),
ALTER COLUMN "valorPIS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaCOFINS" SET DATA TYPE DECIMAL(7,4),
ALTER COLUMN "valorCOFINS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaIRRF" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "valorIRRF" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaCSLL" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "valorCSLL" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaINSS" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "valorINSS" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaIBSUF" SET DATA TYPE DECIMAL(7,4),
ALTER COLUMN "valorIBSUF" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaIBSMun" SET DATA TYPE DECIMAL(7,4),
ALTER COLUMN "valorIBSMun" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaCBS" SET DATA TYPE DECIMAL(7,4),
ALTER COLUMN "valorCBS" SET DATA TYPE DECIMAL(15,4);

-- AlterTable
ALTER TABLE "produtos" ALTER COLUMN "cfopPadrao" SET DATA TYPE CHAR(4),
ALTER COLUMN "precoCusto" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "margemLucro" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "precoVenda" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "estoqueAtual" SET DATA TYPE DECIMAL(11,3),
ALTER COLUMN "estoqueMinimo" SET DATA TYPE DECIMAL(11,3),
ALTER COLUMN "aliquotaICMS" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "aliquotaPIS" SET DATA TYPE DECIMAL(7,4),
ALTER COLUMN "aliquotaCOFINS" SET DATA TYPE DECIMAL(7,4),
ALTER COLUMN "aliquotaIPI" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "aliquotaIBS" SET DATA TYPE DECIMAL(7,4),
ALTER COLUMN "aliquotaCBS" SET DATA TYPE DECIMAL(7,4);

-- AlterTable
ALTER TABLE "servicos" ALTER COLUMN "valorUnitario" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "aliquotaISS" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "aliquotaPIS" SET DATA TYPE DECIMAL(7,4),
ALTER COLUMN "aliquotaCOFINS" SET DATA TYPE DECIMAL(7,4),
ALTER COLUMN "aliquotaIRRF" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "aliquotaCSLL" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "aliquotaINSS" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "aliquotaIBS" SET DATA TYPE DECIMAL(7,4),
ALTER COLUMN "aliquotaCBS" SET DATA TYPE DECIMAL(7,4);

-- AlterTable
ALTER TABLE "titulos_financeiros" ALTER COLUMN "valorOriginal" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorJurosMulta" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorDesconto" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "valorPago" SET DATA TYPE DECIMAL(15,4);

-- AlterTable
ALTER TABLE "transportadoras" ALTER COLUMN "cnpj" SET DATA TYPE CHAR(14);

-- AlterTable
ALTER TABLE "transportes_nfe" ALTER COLUMN "transportadoraCnpj" SET DATA TYPE CHAR(14),
ALTER COLUMN "veiculoPlaca" SET DATA TYPE CHAR(7),
ALTER COLUMN "volumesQuantidade" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "volumesPesoLiquido" SET DATA TYPE DECIMAL(15,4),
ALTER COLUMN "volumesPesoBruto" SET DATA TYPE DECIMAL(15,4);

-- CreateTable
CREATE TABLE "eventos_nfe" (
    "id" TEXT NOT NULL,
    "chaveNFe" CHAR(44) NOT NULL,
    "tpAutor" INTEGER NOT NULL,
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
    "pCredPresIBS" DECIMAL(7,4),
    "vCredPresIBS" DECIMAL(15,2),
    "pCredPresCBS" DECIMAL(7,4),
    "vCredPresCBS" DECIMAL(15,2),
    "eventoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventos_credito_presumido_itens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "eventos_nfe_chaveNFe_idx" ON "eventos_nfe"("chaveNFe");

-- CreateIndex
CREATE INDEX "eventos_credito_presumido_chaveNFe_idx" ON "eventos_credito_presumido"("chaveNFe");

-- CreateIndex
CREATE UNIQUE INDEX "eventos_credito_presumido_itens_eventoId_nItem_key" ON "eventos_credito_presumido_itens"("eventoId", "nItem");

-- AddForeignKey
ALTER TABLE "eventos_nfe" ADD CONSTRAINT "eventos_nfe_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_credito_presumido" ADD CONSTRAINT "eventos_credito_presumido_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_credito_presumido_itens" ADD CONSTRAINT "eventos_credito_presumido_itens_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "eventos_credito_presumido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
