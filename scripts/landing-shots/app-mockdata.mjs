// Dados 100% ficticios para screenshots da landing page.

// ---------- helpers de documento ----------
function dvCnpj(base12) {
  const calc = (s, pesos) => {
    const soma = s.split('').reduce((a, d, i) => a + Number(d) * pesos[i], 0);
    const r = soma % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = calc(base12, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calc(base12 + d1, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return base12 + d1 + d2;
}
function chave(cUF, aamm, cnpj, mod, serie, nNF, tpEmis, cNF) {
  const base =
    String(cUF) + aamm + cnpj + String(mod).padStart(2, '0') + String(serie).padStart(3, '0') +
    String(nNF).padStart(9, '0') + String(tpEmis) + String(cNF).padStart(8, '0');
  let soma = 0, peso = 2;
  for (let i = base.length - 1; i >= 0; i--) {
    soma += Number(base[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  const r = soma % 11;
  const dv = r < 2 ? 0 : 11 - r;
  return base + dv;
}

export const EMPRESA_CNPJ = '12345678000195';

export const empresa = {
  id: 'emp-demo-0001',
  razaoSocial: 'DISTRIBUIDORA HORIZONTE COMERCIO LTDA',
  nomeFantasia: 'Distribuidora Horizonte',
  cnpj: EMPRESA_CNPJ,
  inscricaoEstadual: '110042490114',
  inscricaoMunicipal: '48291037',
  cnae: '4649408',
  regimeTributario: 'SIMPLES_NACIONAL',
  aliquotaSimplesNacional: 6.0,
  ambienteEmissao: '1',
  serieNfe: 1, proximoNumeroNfe: 1249,
  serieNfse: 1, proximoNumeroNfse: 319,
  serieNfce: 1, proximoNumeroNfce: 5732,
  serieCte: 1, proximoNumeroCte: 215,
  serieNfae: 900, proximoNumeroNfae: 12,
  serieMdfe: 1, proximoNumeroMdfe: 38,
  endereco: {
    logradouro: 'Avenida das Nacoes Unidas', numero: '4500', complemento: 'Galpao 3',
    bairro: 'Vila Almeida', codigoMunicipio: '3550308', nomeMunicipio: 'São Paulo', uf: 'SP',
    cep: '04578000', telefone: '1140028922', email: 'financeiro@distribuidorahorizonte.com.br',
    codigoPais: '1058', nomePais: 'Brasil',
  },
  certificado: {
    instalado: true, tipo: 'A1', nomeTitular: 'DISTRIBUIDORA HORIZONTE COMERCIO LTDA',
    cnpjCpf: EMPRESA_CNPJ, emissora: 'AC DEMO RFB v5',
    dataValidadeInicio: '2026-03-10', dataValidadeFim: '2027-03-10', diasRestantes: 148,
    arquivoCarregadoNome: 'certificado-horizonte.pfx', status: 'VALIDO',
  },
  chavePixPadrao: 'financeiro@distribuidorahorizonte.com.br',
  bancoPadrao: '341',
  optanteSimples: true,
  optanteMEI: false,
};

export const usuario = {
  id: 'usr-demo-ana',
  nome: 'Ana Souza',
  email: 'ana.souza@distribuidorahorizonte.com.br',
  cargo: 'Gerente Financeira',
  perfil: 'ADMIN',
  empresaCnpj: EMPRESA_CNPJ,
  dataLogin: '2026-10-13T11:02:00.000Z',
  permissoes: [],
  perfilAcesso: null,
};

// ---------- clientes ----------
const C = (id, base, razao, fantasia, cidade, uf, codMun, tipo = 'CLIENTE', email) => ({
  id, tipo, tipoPessoa: 'PJ', documento: dvCnpj(base), razaoSocial: razao, nomeFantasia: fantasia,
  inscricaoEstadual: 'ISENTO', indicadorIE: '9', email: email || `contato@${fantasia.toLowerCase().replace(/[^a-z]/g, '')}.com.br`,
  telefone: '1130000000',
  endereco: { logradouro: 'Rua Exemplo', numero: '100', bairro: 'Centro', codigoMunicipio: codMun, nomeMunicipio: cidade, uf, cep: '01000000' },
  dataCadastro: '2026-02-15', ativo: true,
});
export const clientes = [
  C('cli-1', '234567810001', 'PAPELARIA E LIVRARIA ESTRELA LTDA', 'Papelaria Estrela', 'São Paulo', 'SP', '3550308'),
  C('cli-2', '345678120001', 'MERCADO BOM PRECO LTDA', 'Mercado Bom Preco', 'Guarulhos', 'SP', '3518800'),
  C('cli-3', '456781230001', 'ATACADAO SERRA VERDE LTDA', 'Atacadao Serra Verde', 'Campinas', 'SP', '3509502'),
  C('cli-4', '567812340001', 'CLINICA BEM VIVER LTDA', 'Clinica Bem Viver', 'São Paulo', 'SP', '3550308'),
  C('cli-5', '678123450001', 'FERRAGENS HORIZONTE LTDA', 'Ferragens Horizonte', 'Santo André', 'SP', '3547809'),
  C('cli-6', '781234560001', 'ESCRITORIO LIMA & COSTA LTDA', 'Escritorio Lima & Costa', 'São Paulo', 'SP', '3550308'),
  C('for-1', '812345670001', 'TRANSPORTES ROTA SUL LTDA', 'Rota Sul', 'Jundiaí', 'SP', '3525904', 'FORNECEDOR'),
  C('for-2', '923456780001', 'EMBALAGENS PRIMOR INDUSTRIA LTDA', 'Embalagens Primor', 'Osasco', 'SP', '3534401', 'FORNECEDOR'),
];
const cli = Object.fromEntries(clientes.map((c) => [c.id, c]));

// ---------- produtos ----------
export const produtos = [
  ['prd-1', 'CADERNO UNIVERSITARIO 10 MATERIAS 200FLS', 'UN', 18.9],
  ['prd-2', 'PAPEL SULFITE A4 75G RESMA 500FLS', 'RS', 27.5],
  ['prd-3', 'CANETA ESFEROGRAFICA AZUL CX 50UN', 'CX', 42.0],
  ['prd-4', 'DETERGENTE NEUTRO 500ML CX 24UN', 'CX', 46.8],
  ['prd-5', 'ARROZ TIPO 1 5KG FARDO 6UN', 'FD', 152.4],
  ['prd-6', 'PARAFUSO SEXTAVADO 1/4 CX 100UN', 'CX', 36.9],
  ['prd-7', 'FITA ADESIVA TRANSPARENTE 45MMX100M', 'UN', 7.9],
  ['prd-8', 'CAFE TORRADO E MOIDO 500G FD 10UN', 'FD', 189.0],
].map(([id, descricao, unidade, preco], i) => ({
  id, codigo: String(1000 + i), descricao, unidade, ncm: '48202000', cfop: '5102', origem: '0',
  precoVenda: preco, valorUnitario: preco, estoqueAtual: 40 + i * 13, estoqueMinimo: 10, ativo: true,
}));

export const transportadoras = [
  { id: 'trp-1', tipoPessoa: 'PJ', documento: dvCnpj('812345670001'), razaoSocial: 'TRANSPORTES ROTA SUL LTDA', nomeFantasia: 'Rota Sul', ativo: true },
];

// ---------- titulos ----------
const T = (id, tipo, numeroDocumento, descricao, categoria, pessoaId, pessoaNome, pessoaDocumento, emissao, venc, valor, status, origem, extra = {}) => ({
  id, tipo, numeroDocumento, descricao, categoria, pessoaId, pessoaNome, pessoaDocumento,
  dataEmissao: emissao, dataVencimento: venc, valorOriginal: valor, status,
  formaPagamento: 'PIX', documentoOrigemTipo: origem, ...extra,
  ...(status === 'PAGO' ? { dataPagamento: venc, valorPago: valor } : {}),
});
const p = (id) => [id, cli[id].razaoSocial, cli[id].documento];
export const titulos = [
  T('tit-1', 'RECEBER', 'NF-e 1248', 'Venda de mercadorias - NF-e 1248', 'VENDA_PRODUTOS', ...p('cli-1'), '2026-10-12', '2026-10-27', 4870.5, 'PENDENTE', 'NFE'),
  T('tit-2', 'RECEBER', 'NF-e 1247', 'Venda de mercadorias - NF-e 1247', 'VENDA_PRODUTOS', ...p('cli-2'), '2026-10-11', '2026-10-25', 12340.0, 'PENDENTE', 'NFE'),
  T('tit-3', 'RECEBER', 'NFS-e 318', 'Consultoria de reposicao - NFS-e 318', 'PRESTACAO_SERVICOS', ...p('cli-4'), '2026-09-25', '2026-10-05', 3200.0, 'PENDENTE', 'NFSE'),
  T('tit-4', 'RECEBER', 'NF-e 1245', 'Venda de mercadorias - NF-e 1245', 'VENDA_PRODUTOS', ...p('cli-3'), '2026-10-05', '2026-10-10', 28915.8, 'PAGO', 'NFE'),
  T('tit-5', 'RECEBER', 'NFS-e 317', 'Assessoria logistica - NFS-e 317', 'PRESTACAO_SERVICOS', ...p('cli-6'), '2026-10-06', '2026-10-30', 1850.0, 'PENDENTE', 'NFSE'),
  T('tit-6', 'RECEBER', 'NF-e 1243', 'Venda de mercadorias - NF-e 1243', 'VENDA_PRODUTOS', ...p('cli-5'), '2026-09-30', '2026-10-08', 6452.3, 'PAGO', 'NFE'),
  T('tit-7', 'RECEBER', 'NF-e 1240', 'Venda de mercadorias - NF-e 1240', 'VENDA_PRODUTOS', ...p('cli-1'), '2026-09-22', '2026-10-02', 2315.9, 'PAGO', 'NFE'),
  T('tit-8', 'RECEBER', 'PED-2026-0412', 'Pedido avulso - parcela 2/3', 'OUTRAS_RECEITAS', ...p('cli-2'), '2026-10-01', '2026-11-03', 980.0, 'PENDENTE', 'MANUAL'),
  T('tit-9', 'PAGAR', 'CT-e 8841', 'Frete de distribuicao - outubro', 'COMPRA_MERCADORIAS', ...p('for-1'), '2026-10-08', '2026-10-22', 2740.0, 'PENDENTE', 'MANUAL'),
  T('tit-10', 'PAGAR', 'NF 55.903', 'Compra de embalagens', 'COMPRA_MERCADORIAS', ...p('for-2'), '2026-10-02', '2026-10-17', 5380.6, 'PENDENTE', 'MANUAL'),
  T('tit-11', 'PAGAR', 'DAS 09/2026', 'DAS Simples Nacional - competencia 09/2026', 'IMPOSTOS_TRIBUTOS', null, 'RECEITA FEDERAL DO BRASIL', '00394460000141', '2026-10-01', '2026-10-20', 3918.4, 'PENDENTE', 'MANUAL'),
];

// ---------- documentos fiscais ----------
const AAMM = '2610';
const itens = (n) => Array.from({ length: n }, (_, i) => ({ id: `it-${i}`, descricao: produtos[i % produtos.length].descricao }));
const dest = (id) => ({ id, razaoSocial: cli[id].razaoSocial, documento: cli[id].documento });

const NFE = (n, id, data, vNF, status, nItens, aamm = AAMM) => ({
  id: `nfe-${n}`, numero: n, serie: 1, modelo: '55',
  chaveAcesso: chave(35, aamm, EMPRESA_CNPJ, 55, 1, n, 1, 40000000 + n * 7),
  dhEmi: data, status, vNF: vNF.toFixed(2), destinatario: dest(id), destinatarioId: id,
  itens: itens(nItens), xmlAssinado: '<NFe/>',
  ...(status === 'REJEITADA' ? { motivoRejeicao: '539 - Duplicidade de NF-e com diferenca na Chave de Acesso' } : {}),
});
const NFSE = (n, id, data, valor, status, desc) => ({
  id: `nfse-${n}`, numeroNfse: n, serieDPS: 1, numeroDPS: n,
  chaveAcesso: '3550308' + '2' + EMPRESA_CNPJ + '00000' + String(n).padStart(13, '0') + '261000' + String(n).padStart(4, '0'),
  dataHoraEmissao: data, status, valorServico: valor.toFixed(2), valorTotalServicos: valor,
  tomador: dest(id), servico: { descricao: desc }, xmlAssinado: '<NFSe/>',
});
const NFCE = (n, data, valor, status, nItens, tpEmis = 1, extra = {}) => ({
  id: `nfce-${n}`, numero: n, serie: 1,
  chaveAcesso: chave(35, AAMM, EMPRESA_CNPJ, 65, 1, n, tpEmis, 50000000 + n),
  dataHoraEmissao: data, status, valorTotalNota: valor, consumidorNome: 'Consumidor Final', consumidorCpfCnpj: 'Não identificado',
  itens: itens(nItens), xmlAssinado: '<NFe/>', tpEmis, ...extra,
});

export const nfes = [
  NFE(1248, 'cli-1', '2026-10-12T14:32:00-03:00', 4870.5, 'AUTORIZADA', 6),
  NFE(1247, 'cli-2', '2026-10-11T10:05:00-03:00', 12340.0, 'AUTORIZADA', 14),
  NFE(1246, 'cli-3', '2026-10-12T09:18:00-03:00', 9120.0, 'REJEITADA', 9),
  NFE(1245, 'cli-3', '2026-10-05T09:12:00-03:00', 28915.8, 'AUTORIZADA', 22),
  NFE(1244, 'cli-5', '2026-10-11T16:20:00-03:00', 2730.0, 'CANCELADA', 4),
  NFE(1243, 'cli-5', '2026-09-30T15:40:00-03:00', 6452.3, 'AUTORIZADA', 7, '2609'),
  NFE(1242, 'cli-2', '2026-09-24T08:55:00-03:00', 18760.0, 'AUTORIZADA', 16, '2609'),
  NFE(1241, 'cli-1', '2026-09-15T13:10:00-03:00', 9874.2, 'AUTORIZADA', 8, '2609'),
  NFE(1240, 'cli-1', '2026-09-22T17:25:00-03:00', 2315.9, 'AUTORIZADA', 3, '2609'),
  NFE(1236, 'cli-3', '2026-08-27T10:00:00-03:00', 21450.0, 'AUTORIZADA', 19, '2608'),
  NFE(1233, 'cli-2', '2026-08-18T14:45:00-03:00', 15230.0, 'AUTORIZADA', 12, '2608'),
  NFE(1229, 'cli-5', '2026-08-06T09:30:00-03:00', 7340.0, 'AUTORIZADA', 6, '2608'),
];
export const nfses = [
  NFSE(318, 'cli-4', '2026-10-10T09:40:00-03:00', 3200.0, 'AUTORIZADA', 'Consultoria em gestao de estoque e reposicao'),
  NFSE(317, 'cli-6', '2026-10-06T15:15:00-03:00', 1850.0, 'AUTORIZADA', 'Assessoria logistica - setembro/2026'),
  NFSE(312, 'cli-4', '2026-09-08T11:00:00-03:00', 3200.0, 'AUTORIZADA', 'Consultoria em gestao de estoque e reposicao'),
];
export const nfces = [
  NFCE(5731, '2026-10-13T08:47:00-03:00', 186.4, 'PROCESSANDO', 5, 9, { justificativaContingencia: 'Falha de comunicacao com a SEFAZ - emissao em contingencia offline' }),
  NFCE(5730, '2026-10-12T18:22:00-03:00', 89.9, 'AUTORIZADA', 2),
];
export const ctes = [
  {
    id: 'cte-214', nCT: 214, serie: 1, chaveAcesso: chave(35, AAMM, EMPRESA_CNPJ, 57, 1, 214, 1, 60000214),
    dhEmi: '2026-10-08T07:30:00-03:00', status: 'AUTORIZADA', vTPrest: '1150.00',
    remetente: { razaoSocial: 'DISTRIBUIDORA HORIZONTE COMERCIO LTDA', documento: EMPRESA_CNPJ },
    destinatario: dest('cli-3'), xMunIni: 'São Paulo', UFIni: 'SP', xMunFim: 'Campinas', UFFim: 'SP', xmlAssinado: '<CTe/>',
  },
];
export const mdfes = [
  {
    id: 'mdfe-37', numero: 37, serie: 1, chaveAcesso: chave(35, AAMM, EMPRESA_CNPJ, 58, 1, 37, 1, 70000037),
    dhEmi: '2026-10-07T06:15:00-03:00', status: 'AUTORIZADA', vCarga: '46000.00', xProd: 'Mercadorias em geral',
    UFIni: 'SP', UFFim: 'MG', qCTe: 0, qNFe: 4, xmlAssinado: '<MDFe/>',
  },
];

// ============================================================
// Movimento extra (fictício, determinístico): 12 meses de notas com tendência
// de alta, outubro com emissões diárias e contas a pagar/receber distribuídas.
// ============================================================
function semente(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = semente(20261013);
const entre = (a, b) => a + rnd() * (b - a);
const escolhe = (l) => l[Math.floor(rnd() * l.length)];
const iso = (ano, mes, dia, h = 10, m = 0) =>
  `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00-03:00`;
const ymd = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
const somaDias = (ano, mes, dia, n) => new Date(ano, mes - 1, dia + n);

const CLIENTES_PJ = ['cli-1', 'cli-2', 'cli-3', 'cli-5'];
const HOJE = { ano: 2026, mes: 10, dia: 13 };
let numNfe = 1000;
let numNfse = 250;
let numNfce = 5400;
let numTit = 100;

// 11 meses anteriores (nov/25 → set/26) com tendência de alta + sazonalidade
for (let k = 11; k >= 1; k--) {
  const base = new Date(HOJE.ano, HOJE.mes - 1 - k, 1);
  const ano = base.getFullYear();
  const mes = base.getMonth() + 1;
  const diasNoMes = new Date(ano, mes, 0).getDate();
  const fator = 0.55 + (11 - k) * 0.045 + (mes === 12 ? 0.25 : 0);
  const qtdNfe = Math.round(entre(9, 14) * fator) + 3;
  for (let i = 0; i < qtdNfe; i++) {
    const dia = 1 + Math.floor(rnd() * diasNoMes);
    const n = numNfe++;
    const id = escolhe(CLIENTES_PJ);
    const valor = +entre(2500, 16000).toFixed(2);
    const status = rnd() < 0.04 ? 'CANCELADA' : 'AUTORIZADA';
    nfes.push(NFE(n, id, iso(ano, mes, dia, 8 + Math.floor(rnd() * 9), Math.floor(rnd() * 60)), valor, status, 3 + Math.floor(rnd() * 15), `${String(ano).slice(2)}${String(mes).padStart(2, '0')}`));
    // Vendas de ago/set geram duplicatas 30/60/90 dias que caem no fluxo atual.
    if (k <= 2 && status === 'AUTORIZADA') {
      [30, 60, 90].forEach((prazo, pi) => {
        const venc = somaDias(ano, mes, dia, prazo);
        const pago = venc < new Date(HOJE.ano, HOJE.mes - 1, HOJE.dia) && rnd() < 0.9;
        titulos.push(T(`tit-${numTit++}`, 'RECEBER', `NF-e ${n}/${pi + 1}`, `Venda de mercadorias - NF-e ${n} parc. ${pi + 1}/3`, 'VENDA_PRODUTOS', ...p_(id), ymd(new Date(ano, mes - 1, dia)), ymd(venc), +(valor / 3).toFixed(2), pago ? 'PAGO' : 'PENDENTE', 'NFE'));
      });
    }
  }
  nfses.push(NFSE(numNfse++, 'cli-4', iso(ano, mes, 8, 11), 3200, 'AUTORIZADA', 'Consultoria em gestao de estoque e reposicao'));
  nfses.push(NFSE(numNfse++, 'cli-6', iso(ano, mes, 6, 15), 1850, 'AUTORIZADA', 'Assessoria logistica mensal'));
  for (let i = 0; i < 18; i++) nfces.push(NFCE(numNfce++, iso(ano, mes, 1 + Math.floor(rnd() * diasNoMes), 9 + Math.floor(rnd() * 10), Math.floor(rnd() * 60)), +entre(35, 420).toFixed(2), 'AUTORIZADA', 1 + Math.floor(rnd() * 6)));
}

// Outubro: emissões quase diárias até hoje (dia 13)
for (let dia = 1; dia <= HOJE.dia; dia++) {
  const dt = new Date(HOJE.ano, HOJE.mes - 1, dia);
  const util = dt.getDay() !== 0;
  if (util) {
    const qtd = rnd() < 0.4 ? 1 : 0;
    for (let i = 0; i < qtd; i++) {
      const id = escolhe(CLIENTES_PJ);
      const valor = +entre(1500, 7500).toFixed(2);
      const status = rnd() < 0.05 ? 'REJEITADA' : 'AUTORIZADA';
      const n = numNfe++;
      nfes.push(NFE(n, id, iso(HOJE.ano, HOJE.mes, dia, 8 + Math.floor(rnd() * 9), Math.floor(rnd() * 60)), valor, status, 2 + Math.floor(rnd() * 14)));
      if (status === 'AUTORIZADA') {
        // Duplicatas em 2 parcelas (28/56 dias); as já vencidas parte foram pagas.
        [28, 56].forEach((prazo, p) => {
          const venc = somaDias(HOJE.ano, HOJE.mes, dia, prazo - 21);
          const pago = venc < new Date(HOJE.ano, HOJE.mes - 1, HOJE.dia) && rnd() < 0.6;
          titulos.push(T(`tit-${numTit++}`, 'RECEBER', `NF-e ${n}/${p + 1}`, `Venda de mercadorias - NF-e ${n} parc. ${p + 1}/2`, 'VENDA_PRODUTOS', ...p_(id), ymd(dt), ymd(venc), +(valor / 2).toFixed(2), pago ? 'PAGO' : 'PENDENTE', 'NFE'));
        });
      }
    }
  }
  const qtdCupom = util ? 4 + Math.floor(rnd() * 8) : 2;
  for (let i = 0; i < qtdCupom; i++) nfces.push(NFCE(numNfce++, iso(HOJE.ano, HOJE.mes, dia, 9 + Math.floor(rnd() * 10), Math.floor(rnd() * 60)), +entre(25, 380).toFixed(2), 'AUTORIZADA', 1 + Math.floor(rnd() * 6)));
}
function p_(id) { return [id, cli[id].razaoSocial, cli[id].documento]; }

// Recebíveis antigos ainda em aberto (aging: vencidos há mais de 30 dias)
titulos.push(T(`tit-${numTit++}`, 'RECEBER', 'NF-e 1188', 'Venda de mercadorias - NF-e 1188', 'VENDA_PRODUTOS', ...p_('cli-5'), '2026-08-01', '2026-08-31', 4120.0, 'PENDENTE', 'NFE'));
titulos.push(T(`tit-${numTit++}`, 'RECEBER', 'NF-e 1201', 'Venda de mercadorias - NF-e 1201', 'VENDA_PRODUTOS', ...p_('cli-2'), '2026-08-20', '2026-09-04', 2875.4, 'PENDENTE', 'NFE'));

// Contas a pagar: fornecedores, frete, despesas fixas e impostos (out → dez)
const fornecedor = (id) => p_(id);
const orgao = (nome, doc) => [null, nome, doc];
const despesas = [];
for (const [mes, ano] of [[10, 2026], [11, 2026], [12, 2026]]) {
  despesas.push(['Aluguel do galpao', 'DESPESAS_ADMINISTRATIVAS', orgao('IMOBILIARIA PAULISTA LTDA', '11444777000161'), 5, 6800]);
  despesas.push(['Folha de pagamento', 'DESPESAS_PESSOAL', orgao('FOLHA DE PAGAMENTO', '00000000000000'), 5, 23450]);
  despesas.push(['Energia eletrica', 'DESPESAS_ADMINISTRATIVAS', orgao('ENEL DISTRIBUICAO SAO PAULO', '61695227000193'), 12, entre(1400, 1900)]);
  despesas.push(['Internet e telefonia', 'DESPESAS_ADMINISTRATIVAS', orgao('VIVO EMPRESAS', '02558157000162'), 15, 489.9]);
  despesas.push([`DAS Simples Nacional - competencia ${String(mes - 1).padStart(2, '0')}/${ano}`, 'IMPOSTOS_TRIBUTOS', orgao('RECEITA FEDERAL DO BRASIL', '00394460000141'), 20, entre(3600, 5200)]);
  despesas.push(['Frete de distribuicao', 'COMPRA_MERCADORIAS', fornecedor('for-1'), 22, entre(2200, 3400)]);
  for (let i = 0; i < 3; i++) despesas.push(['Compra de embalagens e insumos', 'COMPRA_MERCADORIAS', fornecedor('for-2'), 3 + Math.floor(rnd() * 25), entre(2400, 9800)]);
  despesas.push(['Contabilidade - honorarios', 'DESPESAS_ADMINISTRATIVAS', orgao('ESCRITORIO LIMA & COSTA LTDA', cli['cli-6'].documento), 10, 1650]);
  for (const [desc, cat, pessoa, dia, valor] of despesas.splice(0)) {
    const venc = new Date(ano, mes - 1, dia);
    const pago = venc < new Date(HOJE.ano, HOJE.mes - 1, HOJE.dia);
    titulos.push(T(`tit-${numTit++}`, 'PAGAR', `${mes}/${ano}-${numTit}`, desc, cat, ...pessoa, ymd(new Date(ano, mes - 1, Math.max(1, dia - 15))), ymd(venc), +Number(valor).toFixed(2), pago ? 'PAGO' : 'PENDENTE', 'MANUAL'));
  }
}
