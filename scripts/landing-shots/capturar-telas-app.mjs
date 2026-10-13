import * as M from './app-mockdata.mjs';

const OUT = process.env.SHOT_OUT || 'C:/sistemanex/public/landing';
const ONLY = (process.env.SHOT_ONLY || 'dashboard,financeiro,pix,documentos').split(',');
const H = Number(process.env.SHOT_H || 900);

const ok = (dados) => ({ status: 200, contentType: 'application/json', body: JSON.stringify({ sucesso: true, dados }) });
const lista = (arr) => ok({ data: arr, total: arr.length, page: 1, limit: 100, totalPages: 1 });

function mock(pathname, method) {
  const p = pathname.replace(/^\/api/, '');
  if (method !== 'GET') return { status: 403, contentType: 'application/json', body: JSON.stringify({ sucesso: false, erro: 'mock: escrita bloqueada' }) };
  switch (p) {
    case '/auth/me': return ok(M.usuario);
    case '/empresa/me': return ok(M.empresa);
    case '/produtos': return lista(M.produtos);
    case '/produtos/estoque-critico': return ok([]);
    case '/clientes': return lista(M.clientes);
    case '/servicos': return lista([]);
    case '/financeiro/titulos': return lista(M.titulos);
    case '/financeiro/titulos/pendentes': return ok(M.titulos.filter((t) => t.status === 'PENDENTE'));
    case '/nfse': return lista(M.nfses);
    case '/nfe': return lista(M.nfes);
    case '/nfce': return lista(M.nfces);
    case '/cte': return lista(M.ctes);
    case '/nfae': return lista([]);
    case '/mdfe': return lista(M.mdfes);
    case '/transportadoras': return lista(M.transportadoras);
    case '/cfop': return ok([]);
    default: return null;
  }
}

export default async (page) => {
  const browser = page.context().browser();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: H },
    deviceScaleFactor: 2,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  });
  const log = { mocked: [], unmocked: [], otherHosts: new Set(), leaked: [] };

  // Catch-all: tudo que nao for o dev server (3000) e interceptado. Nada sai para o backend real.
  await ctx.route('**/*', async (route) => {
    const req = route.request();
    const u = new URL(req.url());
    const isApi = u.port === '3333' || u.pathname.startsWith('/api/');
    if (isApi) {
      const r = mock(u.pathname, req.method());
      if (r) { log.mocked.push(`${req.method()} ${u.pathname}`); return route.fulfill({ ...r, headers: { 'access-control-allow-origin': '*' } }); }
      log.unmocked.push(`${req.method()} ${u.pathname}${u.search}`);
      return route.fulfill({ status: 404, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ sucesso: false, dados: [] }) });
    }
    if (u.hostname === 'localhost' && u.port === '3000') return route.continue();
    log.otherHosts.add(u.host);
    return route.continue();
  });
  // Preflight CORS e respondido pelo mesmo route (fulfill com ACAO). Verificacao extra: qualquer request que realmente sair para 3333.
  ctx.on('requestfinished', (r) => { /* noop */ });
  ctx.on('request', (r) => {
    const u = new URL(r.url());
    if (u.port === '3333') log.leaked.push(r.method() + ' ' + u.pathname);
  });

  await ctx.addInitScript(([user]) => {
    localStorage.setItem('@sup:token', 'demo-token-ficticio');
    localStorage.setItem('@sup:user', JSON.stringify(user));
  }, [M.usuario]);

  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });

  await pg.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await pg.waitForSelector('text=Carregando dados do sistema', { state: 'detached', timeout: 20000 }).catch(() => {});
  await pg.waitForTimeout(1500);
  // Esconde barras de rolagem e animacoes para um print limpo
  await pg.addStyleTag({ content: '*{scrollbar-width:none!important} *::-webkit-scrollbar{display:none!important} *,*::before,*::after{transition:none!important;animation-duration:0s!important;caret-color:transparent!important}' });
  await pg.mouse.move(0, H - 1);

  const nav = async (label) => {
    const el = pg.locator('aside').getByText(label, { exact: true }).first();
    await el.click();
    await pg.waitForTimeout(1200);
    await pg.mouse.move(0, H - 1);
  };
  const shots = {};

  if (ONLY.includes('dashboard')) {
    await pg.waitForTimeout(1500); // recharts
    await pg.screenshot({ path: `${OUT}/app-dashboard.png` });
    shots.dashboard = true;
  }
  if (ONLY.includes('financeiro') || ONLY.includes('pix')) {
    await nav('Financeiro');
    await pg.getByRole('button', { name: /^A Receber \(/ }).click();
    await pg.waitForTimeout(500);
    await pg.mouse.move(0, H - 1);
    if (ONLY.includes('financeiro')) await pg.screenshot({ path: `${OUT}/app-financeiro.png` });
    if (ONLY.includes('pix')) {
      await pg.getByRole('row', { name: /NF-e 1247/ }).getByRole('button', { name: /Pix/ }).click();
      await pg.waitForTimeout(800);
      await pg.mouse.move(0, H - 1);
      await pg.screenshot({ path: `${OUT}/app-pix.png` });
      shots.brcode = await pg.locator('input[readonly], textarea[readonly]').first().inputValue().catch(() => null);
      await pg.keyboard.press('Escape');
      await pg.getByRole('button', { name: /fechar/i }).first().click().catch(() => {});
    }
  }
  if (ONLY.includes('documentos')) {
    await nav('Documentos Emitidos');
    await pg.screenshot({ path: `${OUT}/app-documentos.png` });
  }

  const sidebarText = await pg.locator('aside').innerText().catch(() => '');
  await ctx.close();
  return {
    shots,
    mocked: [...new Set(log.mocked)],
    unmocked: log.unmocked,
    otherHosts: [...log.otherHosts],
    seen3333: log.leaked.length, fulfilled: log.mocked.length + log.unmocked.length,
    errs: errs.slice(0, 10),
    sidebar: sidebarText.slice(0, 600),
  };
};
