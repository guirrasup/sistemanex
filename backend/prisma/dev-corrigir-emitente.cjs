// prisma/dev-corrigir-emitente.cjs
// SOMENTE DESENVOLVIMENTO. Faz todos os documentos de uma empresa terem ELA como
// emitente (os seeds antigos deixaram CNPJ/razão de outras empresas nas chaves,
// no prestador da NFS-e e nos XMLs):
//   - recalcula a chave de acesso (CNPJ + dígito verificador) de NF-e, NFC-e,
//     CT-e e MDF-e e atualiza todas as referências a essas chaves;
//   - NFS-e: prestador = dados da empresa; CNPJ dentro da chave nacional;
//   - XML: troca CNPJ/razão social antigos e as chaves;
//   - acerta proximoNumero* da empresa para depois do maior número já usado.
// Grava backup JSON dos valores antigos antes de alterar. Tudo numa transação.
//
// Uso: node prisma/dev-corrigir-emitente.cjs <CNPJ da empresa> [pasta do backup]
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const cnpjAlvo = (process.argv[2] || '').replace(/\D/g, '');
const pastaBackup = process.argv[3] || path.join(__dirname, 'backups');
if (!cnpjAlvo) {
  console.error('Uso: node prisma/dev-corrigir-emitente.cjs <CNPJ> [pasta do backup]');
  process.exit(1);
}
if (process.env.NODE_ENV === 'production' || !/@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL || '')) {
  console.error('Recusado: este script só roda em banco local de desenvolvimento.');
  process.exit(1);
}

const prisma = new PrismaClient();

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
// Chave de 44: cUF(2) AAMM(4) CNPJ(14) ... DV(1)
function chaveComCnpj(chave, cnpj) {
  const base = chave.slice(0, 6) + cnpj + chave.slice(20, 43);
  return base + dvMod11(base);
}

async function main() {
  const empresa = await prisma.empresa.findFirst({ where: { cnpj: cnpjAlvo }, include: { endereco: true } });
  if (!empresa) throw new Error(`Empresa ${cnpjAlvo} não encontrada.`);
  const E = empresa.id;
  const cnpj = empresa.cnpj;
  console.log(`Empresa: ${empresa.razaoSocial} (${cnpj})`);

  // ---------- coleta ----------
  const nfes = await prisma.nFe.findMany({ where: { empresaId: E }, select: { id: true, chaveAcesso: true, xmlAssinado: true } });
  const nfces = await prisma.nFCe.findMany({ where: { empresaId: E }, select: { id: true, chaveAcesso: true, xmlAssinado: true } });
  const ctes = await prisma.cTe.findMany({ where: { empresaId: E }, select: { id: true, chaveAcesso: true, xmlAssinado: true } });
  const mdfes = await prisma.mDFe.findMany({ where: { empresaId: E }, select: { id: true, chaveAcesso: true, xmlAssinado: true } });
  const nfses = await prisma.nFSe.findMany({ where: { empresaId: E } });

  const mapa = new Map(); // chave antiga -> nova
  for (const d of [...nfes, ...nfces, ...ctes, ...mdfes]) {
    if (d.chaveAcesso && d.chaveAcesso.length === 44 && d.chaveAcesso.slice(6, 20) !== cnpj) mapa.set(d.chaveAcesso, chaveComCnpj(d.chaveAcesso, cnpj));
  }

  // CNPJs e razões sociais "estranhos" que aparecem nos XMLs/prestadores
  const cnpjsAntigos = new Set();
  const nomesAntigos = new Set();
  for (const [antiga] of mapa) cnpjsAntigos.add(antiga.slice(6, 20));
  for (const d of [...nfes, ...nfces, ...ctes, ...mdfes]) {
    const m = /<emit>\s*<CNPJ>(\d{14})<\/CNPJ>[\s\S]*?<xNome>([^<]+)<\/xNome>/.exec(d.xmlAssinado || '');
    if (m && m[1] !== cnpj) {
      cnpjsAntigos.add(m[1]);
      nomesAntigos.add(m[2]);
    }
  }
  for (const n of nfses) {
    if (n.prestadorCnpj !== cnpj) {
      cnpjsAntigos.add(n.prestadorCnpj);
      nomesAntigos.add(n.prestadorRazaoSocial);
    }
  }

  // Chaves trocam no XML inteiro; CNPJ/nome só dentro de <emit>…</emit> (o mesmo
  // CNPJ pode aparecer legitimamente como destinatário em outras notas).
  const trocarXml = (xml) => {
    if (!xml) return xml;
    let out = xml;
    for (const [antiga, nova] of mapa) out = out.split(antiga).join(nova);
    return out.replace(/<emit>([\s\S]*?)<\/emit>/, (_, dentro) =>
      '<emit>' +
      dentro
        .replace(/<CNPJ>\d{14}<\/CNPJ>/, `<CNPJ>${cnpj}</CNPJ>`)
        .replace(/<xNome>[^<]*<\/xNome>/, `<xNome>${empresa.razaoSocial}</xNome>`)
        .replace(/<xFant>[^<]*<\/xFant>/, empresa.nomeFantasia ? `<xFant>${empresa.nomeFantasia}</xFant>` : '') +
      '</emit>');
  };
  // NFS-e: o prestador antigo nunca é cliente, então a troca vale no XML inteiro.
  const trocarXmlNfse = (n) => {
    if (!n.xmlAssinado || n.prestadorCnpj === cnpj) return n.xmlAssinado;
    return n.xmlAssinado.split(n.prestadorCnpj).join(cnpj).split(n.prestadorRazaoSocial).join(empresa.razaoSocial);
  };

  // ---------- backup ----------
  fs.mkdirSync(pastaBackup, { recursive: true });
  const arquivo = path.join(pastaBackup, `emitente-${cnpj}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(
    arquivo,
    JSON.stringify(
      {
        empresa: { id: E, cnpj, proximos: { proximoNumeroNfe: empresa.proximoNumeroNfe, proximoNumeroNfce: empresa.proximoNumeroNfce, proximoNumeroNfse: empresa.proximoNumeroNfse, proximoNumeroCte: empresa.proximoNumeroCte } },
        chaves: Object.fromEntries(mapa),
        nfe: nfes, nfce: nfces, cte: ctes, mdfe: mdfes,
        nfse: nfses.map((n) => ({ id: n.id, chaveAcesso: n.chaveAcesso, prestadorCnpj: n.prestadorCnpj, prestadorRazaoSocial: n.prestadorRazaoSocial, xmlAssinado: n.xmlAssinado })),
      },
      null,
      1,
    ),
  );
  console.log(`Backup: ${arquivo}`);
  console.log(`Chaves a recalcular: ${mapa.size} · CNPJs antigos: ${[...cnpjsAntigos].join(', ')} · razões antigas: ${[...nomesAntigos].join(' | ')}`);

  const end = empresa.endereco;
  const resumo = { nfe: 0, nfce: 0, cte: 0, mdfe: 0, nfse: 0, referencias: 0 };

  await prisma.$transaction(
    async (tx) => {
      const atualizarDoc = async (modelo, lista, extra = () => ({})) => {
        for (const d of lista) {
          const nova = d.chaveAcesso && mapa.get(d.chaveAcesso);
          const xml = trocarXml(d.xmlAssinado);
          if (!nova && xml === d.xmlAssinado) continue;
          await tx[modelo].update({ where: { id: d.id }, data: { ...(nova ? { chaveAcesso: nova, ...extra(nova) } : {}), xmlAssinado: xml } });
          resumo[modelo === 'nFe' ? 'nfe' : modelo === 'nFCe' ? 'nfce' : modelo === 'cTe' ? 'cte' : 'mdfe']++;
        }
      };
      await atualizarDoc('nFe', nfes, (nova) => ({ cDV: nova.slice(-1) }));
      await atualizarDoc('nFCe', nfces);
      await atualizarDoc('cTe', ctes);
      await atualizarDoc('mDFe', mdfes);

      // Referências às chaves em outras tabelas
      const refs = [
        ['tituloFinanceiro', 'documentoOrigemChave'],
        ['eventoNFe', 'chaveNFe'],
        ['eventoCreditoPresumido', 'chaveNFe'],
        ['nFeReferencia', 'chaveNFe'],
        ['documentoCTe', 'chave'],
        ['cTeComplemento', 'chCTe'],
        ['cTeSubstituto', 'chCTe'],
        ['mDFeNFe', 'chNFe'],
        ['mDFeCTe', 'chCTe'],
        ['mDFeNFePrestParcial', 'chNFe'],
        ['detalheExportacao', 'chNFe'],
      ];
      for (const [antiga, nova] of mapa) {
        for (const [modelo, campo] of refs) {
          if (!tx[modelo]) continue;
          const r = await tx[modelo].updateMany({ where: { [campo]: antiga }, data: { [campo]: nova } });
          resumo.referencias += r.count;
        }
      }

      // NFS-e: prestador = a própria empresa
      for (const n of nfses) {
        const chave = n.chaveAcesso.length === 50 ? n.chaveAcesso.slice(0, 9) + cnpj + n.chaveAcesso.slice(23) : n.chaveAcesso;
        await tx.nFSe.update({
          where: { id: n.id },
          data: {
            chaveAcesso: chave,
            prestadorCnpj: cnpj,
            prestadorRazaoSocial: empresa.razaoSocial,
            prestadorNomeFantasia: empresa.nomeFantasia,
            prestadorInscricaoMunicipal: empresa.inscricaoMunicipal || n.prestadorInscricaoMunicipal,
            ...(end
              ? {
                  prestadorLogradouro: end.logradouro,
                  prestadorNumero: end.numero,
                  prestadorComplemento: end.complemento,
                  prestadorBairro: end.bairro,
                  prestadorCodigoMunicipio: end.codigoMunicipio,
                  prestadorNomeMunicipio: end.nomeMunicipio,
                  prestadorUf: end.uf,
                  prestadorCep: end.cep,
                  prestadorTelefone: end.telefone,
                  prestadorEmail: end.email,
                }
              : {}),
            xmlAssinado: trocarXmlNfse(n),
          },
        });
        resumo.nfse++;
      }

      // Próximos números depois do maior já usado (evita colisão na próxima emissão)
      const maxNfe = (await tx.nFe.aggregate({ where: { empresaId: E, serie: empresa.serieNfe }, _max: { numero: true } }))._max.numero || 0;
      const maxNfce = (await tx.nFCe.aggregate({ where: { empresaId: E, serie: empresa.serieNfce }, _max: { numero: true } }))._max.numero || 0;
      const maxNfse = (await tx.nFSe.aggregate({ where: { empresaId: E }, _max: { numeroNfse: true } }))._max.numeroNfse || 0;
      const maxCte = (await tx.cTe.aggregate({ where: { empresaId: E, serie: empresa.serieCte }, _max: { nCT: true } }))._max.nCT || 0;
      await tx.empresa.update({
        where: { id: E },
        data: {
          proximoNumeroNfe: Math.max(empresa.proximoNumeroNfe, maxNfe + 1),
          proximoNumeroNfce: Math.max(empresa.proximoNumeroNfce, maxNfce + 1),
          proximoNumeroNfse: Math.max(empresa.proximoNumeroNfse, maxNfse + 1),
          proximoNumeroCte: Math.max(empresa.proximoNumeroCte, maxCte + 1),
        },
      });
      resumo.proximos = { nfe: Math.max(empresa.proximoNumeroNfe, maxNfe + 1), nfce: Math.max(empresa.proximoNumeroNfce, maxNfce + 1), nfse: Math.max(empresa.proximoNumeroNfse, maxNfse + 1), cte: Math.max(empresa.proximoNumeroCte, maxCte + 1) };
    },
    { timeout: 120_000 },
  );

  console.log('Atualizados:', JSON.stringify(resumo));
}

main()
  .catch((e) => {
    console.error('Erro (nada foi alterado):', e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
