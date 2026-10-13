// scripts/landing-shots/main.tsx
// Harness SOMENTE de desenvolvimento (fora do bundle de produção): renderiza os
// layouts fiscais reais do sistema com dados 100% FICTÍCIOS, para capturar os
// PNGs usados na landing page (public/landing/*.png).
// Servir pelo dev server: http://localhost:3000/scripts/landing-shots/index.html
import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/jetbrains-mono';
import '../../src/index.css';

import { DanfeLayout, type DanfeLayoutProps } from '../../src/components/fiscal/DanfeLayout';
import { DanfseLayout, type DanfseLayoutProps } from '../../src/components/fiscal/DanfseLayout';
import { DanfceLayout, type DanfceLayoutProps } from '../../src/components/fiscal/DanfceLayout';
import { DacteLayout, type DacteLayoutProps } from '../../src/components/fiscal/DacteLayout';
import { DanfaeViewer } from '../../src/components/fiscal/DanfaeViewer';
import { DamdfeViewer } from '../../src/components/fiscal/DamdfeViewer';
import type { NFAeDocumento } from '../../src/types/fiscal';
import type { MDFeDocumento } from '../../src/types/mdfe';
import { gerarChaveAcessoNFe, gerarChaveAcessoNFSe } from '../../src/utils/chaveAcesso';
import { formatarMoeda } from '../../src/utils/cpfCnpjValidator';

// DanfaeViewer.tsx usa formatarMoeda() sem importa-la (ReferenceError em runtime).
// Sem poder mexer em src/, expomos a funcao real no escopo global so neste harness.
(globalThis as unknown as { formatarMoeda: typeof formatarMoeda }).formatarMoeda = formatarMoeda;

const r2 = (v: number) => Math.round(v * 100) / 100;

// ---------------------------------------------------------------- NF-e (DANFE)
const CNPJ_HORIZONTE = '12345678000195';

const itensNfe = [
  { codigoProduto: 'PAP-0101', descricao: 'PAPEL SULFITE A4 75G CX C/ 10 RESMAS', ncm: '48025610', unidadeMedida: 'CX', quantidade: 12, valorUnitario: 219.9 },
  { codigoProduto: 'ESC-0230', descricao: 'CANETA ESFEROGRAFICA AZUL 1.0MM CX C/ 50', ncm: '96081000', unidadeMedida: 'CX', quantidade: 20, valorUnitario: 42.5 },
  { codigoProduto: 'INF-0415', descricao: 'TONER COMPATIVEL LASER PRETO 1.600 PAG', ncm: '84439933', unidadeMedida: 'UN', quantidade: 8, valorUnitario: 129.9 },
  { codigoProduto: 'ARQ-0322', descricao: 'PASTA SUSPENSA KRAFT C/ HASTE CX C/ 50', ncm: '48203000', unidadeMedida: 'CX', quantidade: 6, valorUnitario: 98.0 },
  { codigoProduto: 'ESC-0518', descricao: 'GRAMPEADOR DE METAL 26/6 30 FOLHAS', ncm: '84729010', unidadeMedida: 'UN', quantidade: 10, valorUnitario: 54.9 },
].map((it) => {
  const total = r2(it.quantidade * it.valorUnitario);
  return {
    ...it,
    cstICMS: '000',
    cfop: '5102',
    valorTotalBruto: total,
    baseCalculoICMS: total,
    valorICMS: r2(total * 0.18),
    aliquotaICMS: '18,00',
  };
});

const totalProdNfe = r2(itensNfe.reduce((a, i) => a + i.valorTotalBruto, 0));
const totalIcmsNfe = r2(itensNfe.reduce((a, i) => a + i.valorICMS, 0));
const parcela = r2(Math.floor((totalProdNfe / 3) * 100) / 100);

const chaveNfe = gerarChaveAcessoNFe({
  codigoUf: '35', anoMes: '2610', cnpjEmitente: CNPJ_HORIZONTE, modelo: '55',
  serie: 1, numero: 4127, tipoEmissao: 1, codigoNumerico: '48271936',
}).chaveCompleta;

const danfe: DanfeLayoutProps = {
  numero: 4127,
  serie: 1,
  tipoDocumento: 1,
  naturezaOperacao: 'VENDA DE MERCADORIA ADQUIRIDA DE TERCEIROS',
  chaveAcesso: chaveNfe,
  protocoloAutorizacao: '135261048271936',
  dataHoraAutorizacao: '2026-10-12T14:32:18-03:00',
  emitente: {
    razaoSocial: 'DISTRIBUIDORA HORIZONTE COMERCIO LTDA',
    cnpj: CNPJ_HORIZONTE,
    inscricaoEstadual: '123.456.789.110',
    endereco: {
      logradouro: 'Av. das Nações Unidas', numero: '4850', complemento: 'Galpão 3',
      bairro: 'Vila Almeida', nomeMunicipio: 'São Paulo', uf: 'SP', cep: '04795100',
      telefone: '(11) 3456-7890',
    },
  },
  destinatario: {
    nomeRazaoSocial: 'PAPELARIA E LIVRARIA ESTRELA LTDA',
    documento: '11222333000181',
    telefone: '(19) 3232-4455',
    inscricaoEstadual: '244.387.612.118',
    endereco: {
      logradouro: 'Rua Barão de Jaguara', numero: '1120', complemento: 'Loja 2',
      bairro: 'Centro', nomeMunicipio: 'Campinas', uf: 'SP', cep: '13015002',
    },
  },
  duplicatas: [
    { numero: '4127-001', dataVencimento: '2026-11-11', valor: parcela },
    { numero: '4127-002', dataVencimento: '2026-12-11', valor: parcela },
    { numero: '4127-003', dataVencimento: '2027-01-10', valor: r2(totalProdNfe - 2 * parcela) },
  ],
  itens: itensNfe,
  totais: {
    baseCalculoICMS: totalProdNfe,
    valorTotalICMS: totalIcmsNfe,
    baseCalculoICMSST: 0,
    valorTotalICMSST: 0,
    valorTotalProdutos: totalProdNfe,
    valorTotalNota: totalProdNfe,
    valorTotalFrete: 0,
    valorTotalSeguro: 0,
    valorTotalDesconto: 0,
    valorTotalIPI: 0,
    valorTotalPIS: r2(totalProdNfe * 0.0165),
    valorTotalCOFINS: r2(totalProdNfe * 0.076),
  },
  informacoesAdicionais:
    'Pedido de compra nº 88213. Pagamento em 3 parcelas (30/60/90 dias) via boleto bancário. ' +
    `Valor aproximado dos tributos: ${(totalIcmsNfe + totalProdNfe * 0.0925).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (Lei 12.741/2012).`,
};

// ------------------------------------------------------------ NFS-e (DANFSe)
const CNPJ_CLINICA = '23456789000195';
const valorServ = 8450;
const nfseChave = gerarChaveAcessoNFSe({
  codigoMunicipioIBGE: '4106902', ambienteGerador: 2, tipoInscricao: 2,
  documentoEmitente: CNPJ_CLINICA, numeroNfse: 1583, anoMesDPS: '2610', codigoNumerico: '502738164',
}).chaveCompleta;
const pis = r2(valorServ * 0.0065);
const cofins = r2(valorServ * 0.03);
const irrf = r2(valorServ * 0.015);
const csll = r2(valorServ * 0.01);

const danfse: DanfseLayoutProps = {
  numeroNfse: 1583,
  serieDPS: 1,
  numeroDPS: 1583,
  codigoVerificacao: 'K7M2-Q9XT',
  dataCompetencia: '2026-10-09T12:00:00-03:00',
  chaveAcesso: nfseChave,
  protocoloAutorizacao: '4106902202610001583 - 09/10/2026 16:47:05',
  prestador: {
    razaoSocial: 'CLINICA BEM VIVER SERVICOS MEDICOS LTDA',
    nomeFantasia: 'Clínica Bem Viver',
    cnpj: CNPJ_CLINICA,
    inscricaoMunicipal: '0812.774.531-6',
    optanteSimplesNacional: false,
    endereco: {
      logradouro: 'Rua Padre Anchieta', numero: '2310', complemento: 'Conj. 804',
      bairro: 'Bigorrilho', nomeMunicipio: 'Curitiba', uf: 'PR', cep: '80730000',
      email: 'faturamento@clinicabemviver.com.br',
    },
  },
  tomador: {
    nomeRazaoSocial: 'METALURGICA VALE DO IGUACU INDUSTRIA LTDA',
    documento: '56789012000100',
    inscricaoMunicipal: '0455.120.988-2',
    telefone: '(41) 3021-7788',
    email: 'rh@metalurgicavaledoiguacu.com.br',
    endereco: {
      logradouro: 'Rodovia BR-116', numero: '15400', complemento: 'Km 98',
      bairro: 'Cidade Industrial', nomeMunicipio: 'Curitiba', uf: 'PR', cep: '81460000',
    },
  },
  descricaoServico:
    'Serviços de medicina ocupacional referentes à competência 10/2026:\n' +
    '- 52 exames clínicos admissionais e periódicos (ASO): R$ 4.680,00\n' +
    '- 38 audiometrias ocupacionais: R$ 1.520,00\n' +
    '- 25 espirometrias: R$ 1.250,00\n' +
    '- Elaboração e atualização do PCMSO 2026/2027: R$ 1.000,00',
  codigoTributacaoNacional: '040301',
  codigoNBS: '123012100',
  localPrestacaoNomeMunicipio: 'Curitiba',
  localPrestacaoUf: 'PR',
  localPrestacaoCodigoMunicipio: '4106902',
  valorTotalServicos: valorServ,
  valorTotalDeducoes: 0,
  valorTotalDescontos: 0,
  baseCalculoISS: valorServ,
  aliquotaISS: 2,
  valorTotalISS: r2(valorServ * 0.02),
  valorPIS: pis,
  valorCOFINS: cofins,
  valorIRRF: irrf,
  valorCSLL: csll,
  valorINSS: 0,
  valorCBS: r2(valorServ * 0.009),
  valorIBSUF: r2(valorServ * 0.001),
  valorIBSMun: 0,
  valorTotalIBS: r2(valorServ * 0.001),
  valorLiquidoNfse: r2(valorServ - pis - cofins - irrf - csll),
  valorTotalISSRetido: 0,
  informacoesComplementares:
    'Retenção de IRRF (1,5%) e CSRF (PIS/COFINS/CSLL - 4,65%) conforme Lei 10.833/2003. ' +
    'IBS/CBS destacados em caráter informativo (ano-teste 2026). Vencimento: 09/11/2026.',
};

// -------------------------------------------------------------- NFC-e (DANFCE)
const CNPJ_MERCADO = '45678901000175';
const itensNfce = [
  { id: '1', descricao: 'ARROZ BRANCO TIPO 1 PCT 5KG', quantidade: 1, valorUnitario: 27.9 },
  { id: '2', descricao: 'FEIJAO CARIOCA TIPO 1 PCT 1KG', quantidade: 2, valorUnitario: 8.49 },
  { id: '3', descricao: 'LEITE UHT INTEGRAL 1L', quantidade: 6, valorUnitario: 4.79 },
  { id: '4', descricao: 'CAFE TORRADO E MOIDO 500G', quantidade: 1, valorUnitario: 21.9 },
  { id: '5', descricao: 'OLEO DE SOJA 900ML', quantidade: 2, valorUnitario: 7.29 },
  { id: '6', descricao: 'ACUCAR REFINADO 1KG', quantidade: 2, valorUnitario: 4.99 },
  { id: '7', descricao: 'PAO DE FORMA INTEGRAL 500G', quantidade: 1, valorUnitario: 8.74 },
].map((it) => ({ ...it, valorTotalBruto: r2(it.quantidade * it.valorUnitario) }));
const totalNfce = r2(itensNfce.reduce((a, i) => a + i.valorTotalBruto, 0));
const chaveNfce = gerarChaveAcessoNFe({
  codigoUf: '31', anoMes: '2610', cnpjEmitente: CNPJ_MERCADO, modelo: '65',
  serie: 1, numero: 98342, tipoEmissao: 1, codigoNumerico: '71625390',
}).chaveCompleta;

const danfce: DanfceLayoutProps = {
  numero: 98342,
  serie: 1,
  dataHoraEmissao: '2026-10-11T18:24:51-03:00',
  chaveAcesso: chaveNfce,
  protocoloAutorizacao: '131265098342117',
  urlQrCode: `https://portalsped.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=${chaveNfce}|2|1|1|8F3A1C7E92B04D5A6E1F27C3B9D0A4E5F6172839`,
  emitente: {
    razaoSocial: 'MERCADO BOM PRECO LTDA',
    nomeFantasia: 'Supermercado Bom Preço',
    cnpj: CNPJ_MERCADO,
    inscricaoEstadual: '062.418.937.0045',
    endereco: {
      logradouro: 'Av. Amazonas', numero: '3155', bairro: 'Prado',
      nomeMunicipio: 'Belo Horizonte', uf: 'MG',
    },
  },
  consumidor: { cpfCnpj: '12345678909', nomeRazaoSocial: 'Mariana Alves Pereira' },
  itens: itensNfce,
  valorTotalProdutos: totalNfce,
  valorTotalDesconto: 0,
  valorTotalNota: totalNfce,
  valorPago: 150,
  valorTroco: r2(150 - totalNfce),
  valorTotalTributosAprox: r2(totalNfce * 0.1873),
  formaPagamento: '01',
};

// ---------------------------------------------------------------- CT-e (DACTE)
const CNPJ_ROTA_SUL = '34567890000130';
const chaveCte = gerarChaveAcessoNFe({
  codigoUf: '43', anoMes: '2610', cnpjEmitente: CNPJ_ROTA_SUL, modelo: '57',
  serie: 1, numero: 21754, tipoEmissao: 1, codigoNumerico: '39018472',
}).chaveCompleta;
const nfeTransp = [4131, 4132].map((n, i) =>
  gerarChaveAcessoNFe({
    codigoUf: '35', anoMes: '2610', cnpjEmitente: CNPJ_HORIZONTE, modelo: '55',
    serie: 1, numero: n, tipoEmissao: 1, codigoNumerico: i === 0 ? '55120394' : '60394817',
  }).chaveCompleta,
);
const componentesCte = [
  { xNome: 'FRETE PESO', vComp: 1850 },
  { xNome: 'FRETE VALOR', vComp: 285 },
  { xNome: 'GRIS', vComp: 95 },
  { xNome: 'PEDAGIO', vComp: 120 },
];
const totalFrete = r2(componentesCte.reduce((a, c) => a + c.vComp, 0));

const dacte: DacteLayoutProps = {
  numero: 21754,
  serie: 1,
  modelo: '57',
  chaveAcesso: chaveCte,
  protocoloAutorizacao: '143260021754088',
  dataHoraEmissao: '2026-10-13T09:15:42-03:00',
  cfop: '6353',
  naturezaOperacao: 'PRESTACAO DE SERV. TRANSPORTE',
  municipioInicioNome: 'São Paulo',
  municipioInicioUf: 'SP',
  municipioFimNome: 'Porto Alegre',
  municipioFimUf: 'RS',
  tomadorServico: 0,
  emitente: {
    razaoSocial: 'TRANSPORTES ROTA SUL LTDA',
    nomeFantasia: 'Rota Sul Logística',
    cnpj: CNPJ_ROTA_SUL,
    inscricaoEstadual: '096/3184572',
    endereco: {
      logradouro: 'Av. Sertório', numero: '6600', bairro: 'Sarandi',
      nomeMunicipio: 'Porto Alegre', uf: 'RS', cep: '91110-580',
    },
  },
  remetente: {
    razaoSocial: 'DISTRIBUIDORA HORIZONTE COMERCIO LTDA',
    documento: CNPJ_HORIZONTE,
    inscricaoEstadual: '123.456.789.110',
    endereco: {
      logradouro: 'Av. das Nações Unidas', numero: '4850', bairro: 'Vila Almeida',
      nomeMunicipio: 'São Paulo', uf: 'SP', cep: '04795-100',
    },
  },
  destinatario: {
    razaoSocial: 'COMERCIAL GAUCHA DE PAPELARIA LTDA',
    documento: '67890123000116',
    inscricaoEstadual: '096/2275139',
    endereco: {
      logradouro: 'Rua Voluntários da Pátria', numero: '1985', bairro: 'Floresta',
      nomeMunicipio: 'Porto Alegre', uf: 'RS', cep: '90230-010',
    },
  },
  produtoPredominante: 'MATERIAL DE ESCRITORIO E PAPELARIA',
  valorCargaAverbada: 47500,
  quantidades: [
    { cUnid: '01', tpMed: 'PESO BRUTO', qCarga: 1840.5 },
    { cUnid: '03', tpMed: 'VOLUMES', qCarga: 96 },
  ],
  documentos: nfeTransp.map((chave) => ({ tipo: 'NFE', chave })),
  componentes: componentesCte,
  transportadora: { razaoSocial: 'TRANSPORTES ROTA SUL LTDA', rntrc: '048213567' },
  aliquotaICMS: 12,
  baseCalculoICMS: totalFrete,
  valorICMS: r2(totalFrete * 0.12),
  valorTotalFrete: totalFrete,
};

// ------------------------------------------------------------ NFA-e (DANFAE)
const ORGAO_CNPJ_FICTICIO = '78901234000105';
const chaveNfae = gerarChaveAcessoNFe({
  codigoUf: '43', anoMes: '2610', cnpjEmitente: ORGAO_CNPJ_FICTICIO, modelo: '55',
  serie: 890, numero: 15734, tipoEmissao: 1, codigoNumerico: '20817364',
}).chaveCompleta;
const itensNfae = [
  { id: '1', codigo: '001', descricao: 'UVA ISABEL IN NATURA (SAFRA 2026)', ncm: '08061000', unidade: 'KG', quantidade: 4800, valorUnitario: 2.35 },
  { id: '2', codigo: '002', descricao: 'UVA BORDO IN NATURA (SAFRA 2026)', ncm: '08061000', unidade: 'KG', quantidade: 3200, valorUnitario: 2.6 },
  { id: '3', codigo: '003', descricao: 'UVA NIAGARA BRANCA IN NATURA', ncm: '08061000', unidade: 'KG', quantidade: 1500, valorUnitario: 2.9 },
].map((it) => {
  const valorTotal = r2(it.quantidade * it.valorUnitario);
  return { ...it, valorTotal, aliquotaICMS: 12, valorICMS: r2(valorTotal * 0.12) };
});
const totalNfae = r2(itensNfae.reduce((a, i) => a + i.valorTotal, 0));
const icmsNfae = r2(itensNfae.reduce((a, i) => a + i.valorICMS, 0));

const nfae = {
  id: 'demo-nfae',
  modelo: '01-AVULSA',
  serie: 890,
  numero: 15734,
  chaveAcesso: chaveNfae,
  dataHoraEmissao: '2026-10-08T10:41:27-03:00',
  naturezaOperacao: 'VENDA DE PRODUCAO DO ESTABELECIMENTO',
  motivoEmissao: 'PRODUTOR_RURAL',
  descricaoMotivo: 'Venda de produção rural própria por produtor pessoa física',
  ambiente: 1,
  status: 'AUTORIZADA',
  requerente: {
    tipoPessoa: 'PF',
    cpfCnpj: '41827395664',
    nomeRazaoSocial: 'JOAO CARLOS MENEGOTTO',
    inscricaoProdutorRural: '096/4417825',
    endereco: {
      logradouro: 'Estrada Linha Leopoldina', numero: 'Km 7', bairro: 'Interior',
      codigoMunicipio: '4302105', nomeMunicipio: 'Bento Gonçalves', uf: 'RS', cep: '95700-000',
    },
    telefone: '(54) 99812-4471',
  },
  destinatario: {
    tipoPessoa: 'PJ',
    documento: '89012345000179',
    inscricaoEstadual: '010/0391827',
    nomeRazaoSocial: 'VINICOLA COOPERATIVA SERRA ALTA LTDA',
    endereco: {
      logradouro: 'Rua Marechal Deodoro', numero: '1450', bairro: 'Cidade Alta',
      codigoMunicipio: '4302105', nomeMunicipio: 'Bento Gonçalves', uf: 'RS', cep: '95700-028',
    },
  },
  itens: itensNfae,
  valorTotalProdutos: totalNfae,
  baseCalculoICMS: totalNfae,
  aliquotaICMSMediana: 12,
  valorTotalICMS: icmsNfae,
  valorTotalNota: totalNfae,
  guiaDAE: {
    numeroDAE: '2026.4301.0157340',
    codigoBarras: '85860000028 7 74000220261 1 02043010157 3 34020261020 6',
    chavePixSefaz: 'pix.dae@sefaz.exemplo.gov.br',
    dataVencimento: '2026-10-20T12:00:00-03:00',
    valorDAE: icmsNfae,
    statusPagamento: 'PAGO',
  },
  orgaoEmissorSefaz: 'SECRETARIA DA FAZENDA DO ESTADO DO RIO GRANDE DO SUL - RECEITA ESTADUAL',
  protocoloAutorizacao: '143260015734062',
  xmlAssinado: '<NFe/>',
} as unknown as NFAeDocumento;

// -------------------------------------------------------------- MDF-e (DAMDFE)
const chaveMdfe = gerarChaveAcessoNFe({
  codigoUf: '43', anoMes: '2610', cnpjEmitente: CNPJ_ROTA_SUL, modelo: '58',
  serie: 1, numero: 3318, tipoEmissao: 1, codigoNumerico: '64093751',
}).chaveCompleta;

const mdfe: MDFeDocumento = {
  id: 'demo-mdfe',
  chaveAcesso: chaveMdfe,
  modelo: '58',
  serie: 1,
  numero: 3318,
  cUF: '43',
  cMDF: '64093751',
  cDV: chaveMdfe.slice(-1),
  modal: 'RODOVIARIO',
  tpAmb: '1',
  tpEmit: 'TRANSPORTADOR_CARGA_PROPRIA',
  tpTransp: 'ETC',
  tpEmis: '1',
  procEmi: '0',
  verProc: 'SUP-1.0',
  dhEmi: '2026-10-13T10:02:36-03:00',
  dhIniViagem: '2026-10-13T11:00:00-03:00',
  UFIni: 'SP',
  UFFim: 'RS',
  status: 'AUTORIZADA',
  emitente: {
    cnpj: CNPJ_ROTA_SUL,
    inscricaoEstadual: '096/3184572',
    razaoSocial: 'TRANSPORTES ROTA SUL LTDA',
    nomeFantasia: 'Rota Sul Logística',
    endereco: {
      logradouro: 'Av. Sertório', numero: '6600', bairro: 'Sarandi',
      codigoMunicipio: '4314902', nomeMunicipio: 'Porto Alegre', uf: 'RS', cep: '91110580',
    },
  },
  municipiosCarrega: [{ codigo: '3550308', nome: 'São Paulo' }],
  percursos: [{ uf: 'PR', ordem: 1 }, { uf: 'SC', ordem: 2 }],
  municipiosDescarga: [{
    codigo: '4314902', nome: 'Porto Alegre',
    nfes: nfeTransp.map((chave) => ({ chave })),
  }],
  seguros: [{
    responsavel: '1', responsavelCNPJ: CNPJ_ROTA_SUL,
    seguradoraNome: 'PAMPA SEGUROS DE CARGA S.A.', apolice: '0451.23.000781-9',
    averbacoes: ['AV2026101300318'],
  }],
  lacres: ['RS-0048213', 'RS-0048214'],
  produtoPredominante: {
    tipoCarga: 'CARGA_GERAL',
    descricao: 'MATERIAL DE ESCRITORIO E PAPELARIA',
    ncm: '48025610',
  },
  totalizadores: { qCTe: 0, qNFe: 2, qMDFe: 0, valorCarga: 47500, unidadePeso: '01', pesoCarga: 1840.5 },
  protocoloAutorizacao: '943260003318417',
  dataHoraAutorizacao: '2026-10-13T10:02:41-03:00',
  // Veículo/motorista fictícios (o DamdfeViewer atual não exibe o grupo do modal rodoviário).
  xmlAssinado: '<MDFe/>',
  xmlModal: '<rodo><veicTracao><placa>RSL4E27</placa><tara>8200</tara></veicTracao><condutor><xNome>CARLOS EDUARDO RAMOS</xNome><CPF>52998224725</CPF></condutor></rodo>',
  empresaId: 'demo',
  emitenteId: 'demo',
  createdAt: '2026-10-13T10:02:36-03:00',
  updatedAt: '2026-10-13T10:02:41-03:00',
};

function Shot({ id, width, children }: { id: string; width: number; children: ReactNode }) {
  return (
    <div style={{ padding: 32, background: '#ffffff' }}>
      <div id={id} style={{ width, background: '#ffffff' }}>
        {children}
      </div>
    </div>
  );
}

const noop = () => {};
// O DamdfeViewer é um modal "fixed inset-0": renderizado sozinho em ?doc=damdfe.
const doc = new URLSearchParams(window.location.search).get('doc');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {doc === 'damdfe' ? (
      <div id="shot-damdfe-host"><DamdfeViewer mdfe={mdfe} onClose={noop} /></div>
    ) : (
      <div style={{ background: '#ffffff', width: 1100 }}>
        <Shot id="shot-danfe" width={896}><DanfeLayout {...danfe} /></Shot>
        <Shot id="shot-danfse" width={896}><DanfseLayout {...danfse} /></Shot>
        <Shot id="shot-danfce" width={448}><DanfceLayout {...danfce} /></Shot>
        <Shot id="shot-dacte" width={960}><DacteLayout {...dacte} /></Shot>
        <Shot id="shot-danfae" width={896}><DanfaeViewer nfae={nfae} onBack={noop} /></Shot>
      </div>
    )}
  </StrictMode>,
);
