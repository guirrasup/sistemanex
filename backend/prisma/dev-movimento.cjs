// prisma/dev-movimento.cjs
// SOMENTE DESENVOLVIMENTO. Gera movimento fictício para uma empresa já existente,
// para os gráficos do Painel terem o que mostrar:
//   - NF-e / NFC-e / NFS-e autorizadas nos últimos 12 meses (outubro quase diário),
//     clonadas de notas que a empresa já tem (mantém todos os campos obrigatórios
//     e itens), variando número, chave, data, valor e destinatário;
//   - contas a receber (duplicatas das NF-e novas) e contas a pagar (fixas,
//     impostos, frete e fornecedores) de setembro a dezembro.
//
// Uso:  node prisma/dev-movimento.cjs <CNPJ da empresa>
// Recusa rodar com NODE_ENV=production ou banco que não seja localhost.
require('dotenv').config();
const { PrismaClient, Prisma } = require('@prisma/client');

const cnpjAlvo = (process.argv[2] || '').replace(/\D/g, '');
if (!cnpjAlvo) {
  console.error('Uso: node prisma/dev-movimento.cjs <CNPJ da empresa>');
  process.exit(1);
}
if (process.env.NODE_ENV === 'production' || !/@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL || '')) {
  console.error('Recusado: este script só roda em banco local de desenvolvimento.');
  process.exit(1);
}

const prisma = new PrismaClient();

// ---------- utilitários ----------
function semente(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = semente(Date.now() % 100000);
const entre = (a, b) => a + rnd() * (b - a);
const escolhe = (l) => l[Math.floor(rnd() * l.length)];
const DIA = 86_400_000;

function dvMod11(base) {
  let soma = 0;
  let peso = 2;
  for (let i = base.length - 1; i >= 0; i--) {
    soma += Number(base[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  const r = soma % 11;
  return r < 2 ? 0 : 11 - r;
}
function chave44(cUF, data, cnpj, mod, serie, numero, tpEmis) {
  const aamm = `${String(data.getFullYear()).slice(2)}${String(data.getMonth() + 1).padStart(2, '0')}`;
  const cNF = String(Math.floor(rnd() * 1e8)).padStart(8, '0');
  const base = `${cUF}${aamm}${cnpj}${mod}${String(serie).padStart(3, '0')}${String(numero).padStart(9, '0')}${tpEmis}${cNF}`;
  return { chave: base + dvMod11(base), cNF };
}

const ehDecimal = (v) => Prisma.Decimal.isDecimal(v);
// Copia os campos escalares, escalando os monetários (vXxx / valorXxx / baseCalculoXxx).
function clonar(obj, fator, omitir = []) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (['id', 'createdAt', 'updatedAt', ...omitir].includes(k)) continue;
    if (Array.isArray(v)) continue;
    if (ehDecimal(v) && (/^v[A-Z]/.test(k) || /^valor/.test(k) || /^baseCalculo/.test(k))) {
      out[k] = new Prisma.Decimal(v).mul(fator).toDecimalPlaces(2);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function horario(dia) {
  return new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), 8 + Math.floor(rnd() * 10), Math.floor(rnd() * 60));
}

async function main() {
  const empresa = await prisma.empresa.findFirst({ where: { cnpj: cnpjAlvo } });
  if (!empresa) throw new Error(`Empresa com CNPJ ${cnpjAlvo} não encontrada.`);
  const E = empresa.id;
  console.log(`Empresa: ${empresa.razaoSocial} (${E})`);

  const modeloNfe = await prisma.nFe.findFirst({ where: { empresaId: E, status: 'AUTORIZADA' }, include: { itens: true }, orderBy: { dhEmi: 'desc' } });
  const modeloNfce = await prisma.nFCe.findFirst({ where: { empresaId: E }, include: { itens: true, pagamentos: true }, orderBy: { dataHoraEmissao: 'desc' } });
  const modeloNfse = await prisma.nFSe.findFirst({ where: { empresaId: E, status: 'AUTORIZADA' }, orderBy: { dataHoraEmissao: 'desc' } });
  if (!modeloNfe) throw new Error('A empresa precisa ter ao menos uma NF-e autorizada para servir de modelo.');

  const clientes = await prisma.cliente.findMany({
    where: { empresaId: E, tipo: { in: ['CLIENTE', 'AMBOS'] }, NOT: { razaoSocial: { contains: 'HOMOLOGACAO' } } },
  });
  const fornecedores = await prisma.cliente.findMany({ where: { empresaId: E, tipo: { in: ['FORNECEDOR', 'AMBOS'] } } });
  if (!clientes.length) throw new Error('A empresa precisa ter clientes cadastrados.');

  let numNfe = ((await prisma.nFe.aggregate({ where: { empresaId: E, modelo: modeloNfe.modelo, serie: modeloNfe.serie }, _max: { numero: true } }))._max.numero || 0) + 1;
  let numNfce = modeloNfce ? ((await prisma.nFCe.aggregate({ where: { empresaId: E, serie: modeloNfce.serie }, _max: { numero: true } }))._max.numero || 0) + 1 : 0;
  let numNfse = modeloNfse ? ((await prisma.nFSe.aggregate({ where: { empresaId: E, serieDPS: modeloNfse.serieDPS }, _max: { numeroNfse: true } }))._max.numeroNfse || 0) + 1 : 0;

  const hoje = new Date();
  const hoje0 = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  // ---------- agenda de emissões (cronológica) ----------
  const agenda = [];
  for (let k = 11; k >= 0; k--) {
    const ini = new Date(hoje.getFullYear(), hoje.getMonth() - k, 1);
    const diasNoMes = k === 0 ? hoje.getDate() : new Date(ini.getFullYear(), ini.getMonth() + 1, 0).getDate();
    const tendencia = 0.6 + (11 - k) * 0.04 + (ini.getMonth() === 11 ? 0.2 : 0);
    if (k === 0) {
      // Mês atual: NF-e na maioria dos dias úteis, cupons todo dia.
      for (let d = 1; d <= diasNoMes; d++) {
        const dia = new Date(ini.getFullYear(), ini.getMonth(), d);
        if (dia.getDay() !== 0 && rnd() < 0.75) agenda.push({ tipo: 'NFE', quando: horario(dia), valor: entre(3500, 16000) });
        for (let i = 0; i < (dia.getDay() === 0 ? 2 : 3 + Math.floor(rnd() * 4)); i++) agenda.push({ tipo: 'NFCE', quando: horario(dia), valor: entre(35, 480) });
      }
    } else {
      const qtdNfe = Math.round(entre(8, 13) * tendencia) + 2;
      for (let i = 0; i < qtdNfe; i++) agenda.push({ tipo: 'NFE', quando: horario(new Date(ini.getFullYear(), ini.getMonth(), 1 + Math.floor(rnd() * diasNoMes))), valor: entre(4000, 18000) * tendencia });
      for (let i = 0; i < 14; i++) agenda.push({ tipo: 'NFCE', quando: horario(new Date(ini.getFullYear(), ini.getMonth(), 1 + Math.floor(rnd() * diasNoMes))), valor: entre(35, 480) });
    }
    for (const dia of [6, 9]) if (dia <= diasNoMes) agenda.push({ tipo: 'NFSE', quando: horario(new Date(ini.getFullYear(), ini.getMonth(), dia)), valor: entre(2800, 6500) });
  }
  agenda.sort((a, b) => a.quando - b.quando);

  const novos = { NFE: 0, NFCE: 0, NFSE: 0, RECEBER: 0, PAGAR: 0 };
  const titulos = [];

  for (const ev of agenda) {
    if (ev.quando > hoje) continue;
    const status = rnd() < 0.03 ? 'CANCELADA' : 'AUTORIZADA';

    if (ev.tipo === 'NFE') {
      const fator = ev.valor / Number(modeloNfe.vNF);
      const cliente = escolhe(clientes);
      const numero = numNfe++;
      const { chave, cNF } = chave44(modeloNfe.cUF, ev.quando, empresa.cnpj, '55', modeloNfe.serie, numero, '1');
      const nfe = await prisma.nFe.create({
        data: {
          ...clonar(modeloNfe, fator, ['itens', 'loteId']),
          numero,
          chaveAcesso: chave,
          cNF,
          cDV: chave.slice(-1),
          dhEmi: ev.quando,
          dhSaiEnt: ev.quando,
          dataHoraAutorizacao: ev.quando,
          status,
          motivoCancelamento: status === 'CANCELADA' ? 'Erro na digitacao dos dados do destinatario' : null,
          dataHoraCancelamento: status === 'CANCELADA' ? new Date(ev.quando.getTime() + 3600_000) : null,
          destinatarioId: cliente.id,
          itens: { create: modeloNfe.itens.map((it) => clonar(it, fator, ['nfeId'])) },
        },
      });
      novos.NFE++;

      // Duplicatas em 2 parcelas (28/56 dias) para notas dos últimos 3 meses.
      if (status === 'AUTORIZADA' && hoje0 - ev.quando < 95 * DIA) {
        const vNF = Number(nfe.vNF);
        [28, 56].forEach((prazo, p) => {
          const venc = new Date(ev.quando.getFullYear(), ev.quando.getMonth(), ev.quando.getDate() + prazo);
          const pago = venc < hoje0 && rnd() < 0.85;
          titulos.push({
            tipo: 'RECEBER', numeroDocumento: `NFE-${numero}/${String(p + 1).padStart(2, '0')}`, descricao: `NF-e ${numero} - parcela ${p + 1}/2`,
            categoria: 'VENDA_PRODUTOS', pessoaId: null, pessoaNome: cliente.razaoSocial, pessoaDocumento: cliente.documento || '',
            dataEmissao: ev.quando, dataVencimento: venc, valorOriginal: +(vNF / 2).toFixed(2), status: pago ? 'PAGO' : 'PENDENTE',
            ...(pago ? { dataPagamento: venc, valorPago: +(vNF / 2).toFixed(2) } : {}),
            formaPagamento: 'PIX / Boleto', documentoOrigemTipo: 'NFE', documentoOrigemChave: chave, empresaId: E, clienteId: cliente.id,
          });
        });
      }
    } else if (ev.tipo === 'NFCE' && modeloNfce) {
      const fator = ev.valor / Number(modeloNfce.valorTotalNota);
      const numero = numNfce++;
      const { chave } = chave44(modeloNfe.cUF, ev.quando, empresa.cnpj, '65', modeloNfce.serie, numero, '1');
      await prisma.nFCe.create({
        data: {
          ...clonar(modeloNfce, fator, ['itens', 'pagamentos']),
          numero,
          chaveAcesso: chave,
          dataHoraEmissao: ev.quando,
          dataHoraAutorizacao: ev.quando,
          status,
          motivoCancelamento: null,
          dataHoraCancelamento: status === 'CANCELADA' ? new Date(ev.quando.getTime() + 600_000) : null,
          consumidorIdentificado: false,
          consumidorCpfCnpj: null,
          consumidorNome: null,
          consumidorId: null,
          itens: { create: modeloNfce.itens.map((it) => clonar(it, fator, ['nfceId'])) },
          pagamentos: { create: modeloNfce.pagamentos.map((pg) => clonar(pg, fator, ['nfceId'])) },
        },
      });
      novos.NFCE++;
    } else if (ev.tipo === 'NFSE' && modeloNfse) {
      const fator = ev.valor / Number(modeloNfse.valorServico);
      const numero = numNfse++;
      await prisma.nFSe.create({
        data: {
          ...clonar(modeloNfse, fator),
          numeroNfse: numero,
          numeroDPS: numero,
          chaveAcesso: modeloNfse.chaveAcesso.slice(0, 36) + String(numero).padStart(14, '0'),
          codigoVerificacao: `${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          dataCompetencia: ev.quando,
          dataHoraEmissao: ev.quando,
          dataHoraProcessamento: ev.quando,
          dataHoraAutorizacao: ev.quando,
          status: 'AUTORIZADA',
        },
      });
      novos.NFSE++;
    }
  }

  // ---------- contas a pagar: mês anterior até 2 meses à frente ----------
  const pessoa = (nome, documento, id = null) => ({ pessoaNome: nome, pessoaDocumento: documento, clienteId: id });
  const forn = (i) => {
    const f = fornecedores[i % Math.max(1, fornecedores.length)];
    return f ? pessoa(f.razaoSocial, f.documento || '', f.id) : pessoa('FORNECEDOR DIVERSOS', '00000000000000');
  };
  for (let k = -1; k <= 2; k++) {
    const ano = new Date(hoje.getFullYear(), hoje.getMonth() + k, 1).getFullYear();
    const mes = new Date(hoje.getFullYear(), hoje.getMonth() + k, 1).getMonth();
    const competencia = `${String(((mes + 11) % 12) + 1).padStart(2, '0')}/${mes === 0 ? ano - 1 : ano}`;
    const contas = [
      ['Aluguel do galpao', 'ALUGUEL_INFRA', pessoa('IMOBILIARIA CENTRAL LTDA', '11444777000161'), 5, 7200, 'Boleto'],
      ['Folha de pagamento', 'FOLHA_PAGAMENTO', pessoa('FOLHA DE PAGAMENTO', '00000000000000'), 5, entre(21000, 24500), 'Transferencia'],
      ['Energia eletrica', 'DESPESAS_ADMINISTRATIVAS', pessoa('NEOENERGIA BRASILIA', '07522669000192'), 12, entre(1500, 2100), 'Debito automatico'],
      ['Internet e telefonia', 'DESPESAS_ADMINISTRATIVAS', pessoa('TELEFONICA BRASIL S/A', '02558157000162'), 15, 489.9, 'Debito automatico'],
      [`DAS Simples Nacional - competencia ${competencia}`, 'IMPOSTOS_TRIBUTOS', pessoa('RECEITA FEDERAL DO BRASIL', '00394460000141'), 20, entre(4200, 6100), 'DARF/DAS'],
      ['Frete de distribuicao', 'COMPRA_MERCADORIAS', forn(0), 22, entre(2300, 3600), 'PIX'],
      ['Compra de mercadorias para revenda', 'COMPRA_MERCADORIAS', forn(1), 8, entre(9000, 18000), 'Boleto'],
      ['Compra de embalagens e insumos', 'COMPRA_MERCADORIAS', forn(2), 18, entre(2500, 7500), 'Boleto'],
      ['Compra de mercadorias para revenda', 'COMPRA_MERCADORIAS', forn(3), 27, entre(6000, 14000), 'Boleto'],
      ['Honorarios contabeis', 'DESPESAS_ADMINISTRATIVAS', pessoa('ESCRITORIO CONTABIL PLANALTO LTDA', '22333444000155'), 10, 1650, 'PIX'],
      ['Campanha de marketing digital', 'MARKETING_VENDAS', pessoa('AGENCIA ALCANCE DIGITAL LTDA', '33444555000166'), 25, entre(1200, 2800), 'Cartao'],
    ];
    for (const [descricao, categoria, quem, dia, valor, forma] of contas) {
      const venc = new Date(ano, mes, dia);
      // Passados: quase tudo pago; dois do mês atual ficam em atraso para o aging.
      const pago = venc < hoje0 && !(k === 0 && /Energia|Frete/.test(descricao));
      titulos.push({
        tipo: 'PAGAR', numeroDocumento: `${String(mes + 1).padStart(2, '0')}${ano}-${descricao.slice(0, 3).toUpperCase()}-${dia}`, descricao, categoria,
        pessoaId: null, ...quem, dataEmissao: new Date(ano, mes, Math.max(1, dia - 15)), dataVencimento: venc,
        valorOriginal: +Number(valor).toFixed(2), status: pago ? 'PAGO' : 'PENDENTE', ...(pago ? { dataPagamento: venc, valorPago: +Number(valor).toFixed(2) } : {}),
        formaPagamento: forma, documentoOrigemTipo: 'MANUAL', empresaId: E,
      });
    }
  }

  await prisma.tituloFinanceiro.createMany({ data: titulos });
  novos.RECEBER = titulos.filter((t) => t.tipo === 'RECEBER').length;
  novos.PAGAR = titulos.filter((t) => t.tipo === 'PAGAR').length;
  console.log('Criados:', JSON.stringify(novos));
}

main()
  .catch((e) => {
    console.error('Erro:', e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
