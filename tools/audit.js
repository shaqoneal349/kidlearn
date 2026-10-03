// 題庫稽核（node tools/audit.js）：每個知識點生成 N 題，檢查選項數、重複、空白、語音備援、靜態題量，並模擬新手抽到低年級題的比例
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const sandbox = { console, Math, Date, JSON, Set, Map, Array, Object, String, Number, RegExp, Promise, navigator: {}, localStorage: { getItem: () => null, setItem() { } }, document: null, speechSynthesis: undefined };
sandbox.window = sandbox; sandbox.globalThis = sandbox;
vm.createContext(sandbox);
for (const f of ['core.js', 'data-en.js', 'data-zh-chars.js', 'content-en.js', 'content-ma.js', 'content-zh.js', 'content-zh2.js', 'content-plus.js', 'games-en.js', 'games-ma.js', 'games-zh.js', 'games-plus.js', 'games-more.js']) vm.runInContext(fs.readFileSync(path.join(root, 'js', f), 'utf8'), sandbox, { filename: f });
const K = sandbox.KL, N = +(process.argv[2] || 200);
K.store.data = { settings: {}, learners: [] };
const L = K.store.newLearner('audit', '🦊', 1);
const problems = [], stat = {};
for (const s of K.skills) {
  const seen = new Set(); let few = 0, dup = 0, bad = 0, nov = 0;
  for (let i = 0; i < N; i++) {
    let q; try { q = K.mcq(s, { n: 4 }); } catch (e) { problems.push(`${s.id}: 例外 ${e.message}`); break; }
    const txt = JSON.stringify(q.opts) + (q.prompt || '') + (q.hint || '');
    if (q.ans < 0) bad++;
    if (q.opts.length < 3) few++;
    if (new Set(q.opts).size !== q.opts.length) dup++;
    if (/undefined|NaN|\[object/.test(txt)) bad++;
    if ((!q.prompt || q.prompt === '🔊') && !q.novoice && !q.audio && !q.ask) nov++;
    seen.add(JSON.stringify([q.prompt, q.opts[q.ans]]));
  }
  stat[s.id] = { kind: s.kind, g: s.g, items: s.gen ? '∞' : (s.data && s.data.length) || 0, distinct: seen.size };
  if (few) problems.push(`${s.id}: ${few}/${N} 題少於 3 個選項`);
  if (dup) problems.push(`${s.id}: ${dup}/${N} 題選項重複`);
  if (bad) problems.push(`${s.id}: ${bad}/${N} 題有 undefined/NaN 或找不到正解`);
  if (nov) problems.push(`${s.id}: ${nov}/${N} 題純聽力且沒有文字備援`);
  if (seen.size < Math.min(N, 12) && !s.gen) problems.push(`${s.id}: 只有 ${seen.size} 種不同題目`);
}
// 新手各遊戲抽到低年級題的比例
const low = {};
for (let g = 1; g <= 6; g++) {
  L.gs = { en: g, ma: g, zh: g }; L.sub = { en: 1, ma: 1, zh: 1 }; L.skills = {}; L.seen = {};
  for (const game of Object.values(K.games)) {
    const { list } = K.engine.candidates(game); let n = 0;
    for (let i = 0; i < 400; i++) { const s = K.engine.wpick(list, L, null); if (s.g < g) n++; }
    (low[game.id] = low[game.id] || {})[g] = Math.round(n / 4);
  }
}
const bySubj = {}; for (const s of K.skills) { const k = `${s.subj} G${s.g}`; bySubj[k] = (bySubj[k] || 0) + 1; }
console.log('知識點', K.skills.length, '遊戲', Object.keys(K.games).length);
console.log('各科各年級知識點數', bySubj);
console.log('靜態題量（不含生成器）', Object.values(stat).reduce((a, x) => a + (x.items === '∞' ? 0 : x.items), 0), '；有生成器的知識點', Object.values(stat).filter(x => x.items === '∞').length);
console.log('\n新手抽到低年級題比例 %（遊戲 × 年級）'); for (const id in low) console.log(id.padEnd(4), Object.values(low[id]).map(v => String(v).padStart(3)).join(' '));
console.log('\n問題', problems.length); problems.forEach(p => console.log(' -', p));
process.exitCode = problems.length ? 1 : 0;
