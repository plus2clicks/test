#!/usr/bin/env node
// Envoie l'app "Ton Espace Voyage" dans un compte Zite via l'API Build.
// Usage : ZITE_API_KEY=xxx node zite-push.js all      (ou une étape : workspace|session|table|app|write|check|commit|wait|publish)
// État sauvegardé dans .push-state.json pour pouvoir reprendre.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = __dirname;
const LOCAL_APP = path.join(ROOT, 'apps', 'espace-voyage');
const STATE_FILE = path.join(ROOT, '.push-state.json');
const BUILD = 'https://api.zite.com/v1';
const DB = 'https://tables.zite.com/api/v1';
const KEY = process.env.ZITE_API_KEY || 'proxy-injected';

const state = fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) : {};
const save = () => fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

function call(method, url, body) {
  const args = ['-sS', '-X', method, url, '-H', `Authorization: Bearer ${KEY}`, '-H', 'Content-Type: application/json', '-w', '\n%{http_code}'];
  let tmp;
  if (body !== undefined) {
    tmp = path.join(ROOT, '.req.json');
    fs.writeFileSync(tmp, JSON.stringify(body));
    args.push('--data-binary', `@${tmp}`);
  }
  const out = execFileSync('curl', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (tmp) fs.unlinkSync(tmp);
  const i = out.lastIndexOf('\n');
  const status = Number(out.slice(i + 1));
  const text = out.slice(0, i);
  let json; try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (status >= 400) throw new Error(`${method} ${url} -> HTTP ${status}: ${text.slice(0, 2000)}`);
  return json;
}

const steps = {
  workspace() {
    if (state.workspaceId) return console.log('workspace déjà créé', state.workspaceId);
    const r = call('POST', `${BUILD}/workspaces`, { name: 'Espace Voyage' });
    state.workspaceId = r.workspace.id; save();
    console.log('workspace', state.workspaceId);
  },
  session() {
    const r = call('POST', `${BUILD}/workspaces/${state.workspaceId}/sessions`);
    state.sessionId = r.sessionId; save();
    fs.writeFileSync(path.join(ROOT, '.framework-guide.md'), r.guide || '');
    fs.writeFileSync(path.join(ROOT, '.session-files.json'), JSON.stringify({ files: r.files, apps: r.apps, zitejsUpdate: r.zitejsUpdate, notice: r.notice }, null, 2));
    console.log('session', state.sessionId, '| fichiers:', (r.files || []).length, '| notice:', r.notice || '-');
  },
  table() {
    if (state.tableId) return console.log('table déjà créée', state.tableId);
    const cfg = call('POST', `${BUILD}/sessions/${state.sessionId}/files/read`, { path: 'zite.config.json' });
    const content = typeof cfg.content === 'string' ? cfg.content : JSON.stringify(cfg);
    const databaseId = JSON.parse(content).project.basePublicIdentifier;
    state.databaseId = databaseId; save();
    const r = call('POST', `${DB}/bases/${databaseId}/tables`, {
      name: 'Voyageurs',
      fields: [
        { type: 'email', name: 'Email' },
        { type: 'single_line_text', name: 'First Name' },
        { type: 'single_line_text', name: 'Password Hash' },
        { type: 'single_line_text', name: 'Session Token' },
        { type: 'single_line_text', name: 'Reset Token' },
        { type: 'single_line_text', name: 'Reset Expires At' },
        { type: 'long_text', name: 'Checked Items' },
      ],
    });
    state.tableId = r.id || (r.table && r.table.id) || JSON.stringify(r).slice(0, 200); save();
    console.log('table Voyageurs', state.tableId);
  },
  app() {
    if (state.appId) return console.log('app déjà créée', state.appId, state.appDir);
    const r = call('POST', `${BUILD}/sessions/${state.sessionId}/apps`, { name: 'Ton Espace Voyage', accessMode: 'external' });
    state.appId = r.app.id; state.appDir = r.app.dir; save();
    console.log('app', state.appId, state.appDir);
  },
  write() {
    const dir = state.appDir;
    // config: accès public + titre
    const cfgRes = call('POST', `${BUILD}/sessions/${state.sessionId}/files/read`, { path: `${dir}/zite.config.json` });
    const cfg = JSON.parse(cfgRes.content);
    cfg.accessMode = 'external';
    cfg.seoSettings = { ...(cfg.seoSettings || {}), title: 'Ton Espace Voyage', description: 'Toutes les infos utiles pour partir sereinement à Bali' };
    fs.writeFileSync(path.join(ROOT, '.app-config-before.json'), cfgRes.content);
    call('PUT', `${BUILD}/sessions/${state.sessionId}/files`, { path: `${dir}/zite.config.json`, content: JSON.stringify(cfg, null, 2) + '\n' });
    // fichiers source
    const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
    let n = 0;
    for (const f of walk(LOCAL_APP)) {
      const rel = path.relative(LOCAL_APP, f).split(path.sep).join('/');
      call('PUT', `${BUILD}/sessions/${state.sessionId}/files`, { path: `${dir}/${rel}`, content: fs.readFileSync(f, 'utf8') });
      n++;
    }
    console.log('fichiers écrits :', n);
  },
  check() {
    const r = call('POST', `${BUILD}/sessions/${state.sessionId}/check`, { appId: state.appId });
    console.log(JSON.stringify(r, null, 2));
    if (!r.ok) { console.error('CHECK KO'); process.exit(2); }
  },
  commit() {
    const r = call('POST', `${BUILD}/sessions/${state.sessionId}/commit`, { message: 'Ton Espace Voyage: app + workflows auth/checklist' });
    console.log(JSON.stringify(r, null, 2));
  },
  wait() {
    for (let i = 0; i < 60; i++) {
      const r = call('GET', `${BUILD}/apps/${state.appId}`);
      const s = r.app.buildStatus;
      console.log(new Date().toISOString(), 'buildStatus', s, r.app.buildError || '');
      if (s === 'success') return;
      if (s === 'failure') { console.error(r.app.buildError); process.exit(3); }
      execFileSync('sleep', ['10']);
    }
    throw new Error('build timeout');
  },
  publish() {
    const r = call('POST', `${BUILD}/apps/${state.appId}/deployments`);
    console.log(JSON.stringify(r, null, 2));
    const sub = r.customSubdomain || r.publicIdentifier;
    state.liveUrl = `https://${sub}.zite.so`; save();
    console.log('LIVE:', state.liveUrl);
  },
};

const order = ['workspace', 'session', 'table', 'app', 'write', 'check', 'commit', 'wait', 'publish'];
const arg = process.argv[2] || 'all';
const run = arg === 'all' ? order : [arg];
for (const s of run) { console.log(`\n=== ${s} ===`); steps[s](); }
