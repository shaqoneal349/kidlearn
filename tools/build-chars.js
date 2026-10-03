// 由 tools/zh-chars.txt 產生 js/data-zh-chars.js：注音取自 Unihan kMandarin（有兩個讀音時取臺灣讀音），多音字以 overrides 覆寫
// 用法：node tools/build-chars.js <Unihan_Readings.txt 路徑>
const fs = require('fs'), path = require('path');
const uni = fs.readFileSync(process.argv[2], 'utf8');
const PY = {};
for (const line of uni.split('\n')) {
  const m = line.match(/^U\+([0-9A-F]+)\tkMandarin\t(.+)$/);
  if (m) { const rs = m[2].trim().split(/\s+/); PY[String.fromCodePoint(parseInt(m[1], 16))] = rs[rs.length - 1]; }
}
// 拼音 → 注音
const INI = { b: 'ㄅ', p: 'ㄆ', m: 'ㄇ', f: 'ㄈ', d: 'ㄉ', t: 'ㄊ', n: 'ㄋ', l: 'ㄌ', g: 'ㄍ', k: 'ㄎ', h: 'ㄏ', j: 'ㄐ', q: 'ㄑ', x: 'ㄒ', zh: 'ㄓ', ch: 'ㄔ', sh: 'ㄕ', r: 'ㄖ', z: 'ㄗ', c: 'ㄘ', s: 'ㄙ' };
const FIN = { a: 'ㄚ', o: 'ㄛ', e: 'ㄜ', ê: 'ㄝ', ai: 'ㄞ', ei: 'ㄟ', ao: 'ㄠ', ou: 'ㄡ', an: 'ㄢ', en: 'ㄣ', ang: 'ㄤ', eng: 'ㄥ', er: 'ㄦ', i: 'ㄧ', ia: 'ㄧㄚ', io: 'ㄧㄛ', ie: 'ㄧㄝ', iai: 'ㄧㄞ', iao: 'ㄧㄠ', iu: 'ㄧㄡ', iou: 'ㄧㄡ', ian: 'ㄧㄢ', in: 'ㄧㄣ', iang: 'ㄧㄤ', ing: 'ㄧㄥ', iong: 'ㄩㄥ', u: 'ㄨ', ua: 'ㄨㄚ', uo: 'ㄨㄛ', uai: 'ㄨㄞ', ui: 'ㄨㄟ', uei: 'ㄨㄟ', uan: 'ㄨㄢ', un: 'ㄨㄣ', uen: 'ㄨㄣ', uang: 'ㄨㄤ', ueng: 'ㄨㄥ', ong: 'ㄨㄥ', ü: 'ㄩ', üe: 'ㄩㄝ', üan: 'ㄩㄢ', ün: 'ㄩㄣ', v: 'ㄩ', ve: 'ㄩㄝ', van: 'ㄩㄢ', vn: 'ㄩㄣ' };
const TONE = { '': '', 1: '', 2: 'ˊ', 3: 'ˇ', 4: 'ˋ', 5: '˙' };
const DIA = { ā: 'a1', á: 'a2', ǎ: 'a3', à: 'a4', ō: 'o1', ó: 'o2', ǒ: 'o3', ò: 'o4', ē: 'e1', é: 'e2', ě: 'e3', è: 'e4', ī: 'i1', í: 'i2', ǐ: 'i3', ì: 'i4', ū: 'u1', ú: 'u2', ǔ: 'u3', ù: 'u4', ǖ: 'ü1', ǘ: 'ü2', ǚ: 'ü3', ǜ: 'ü4', ü: 'ü', ê: 'ê', ḿ: 'm2', ń: 'n2', ň: 'n3', ǹ: 'n4' };
function py2zy(py) {
  let tone = '', s = '';
  for (const ch of py.normalize('NFC')) { const d = DIA[ch]; if (d) { s += d[0]; if (d[1]) tone = d[1]; } else s += ch; }
  s = s.toLowerCase();
  let ini = '', fin = s;
  for (const k of ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's']) if (s.startsWith(k)) { ini = k; fin = s.slice(k.length); break; }
  if (!ini && fin.startsWith('y')) fin = fin === 'yu' || fin.startsWith('yu') ? 'ü' + fin.slice(2) : fin === 'yi' || fin.startsWith('yi') ? fin.slice(1) : 'i' + fin.slice(1);
  if (!ini && fin.startsWith('w')) fin = fin === 'wu' || fin.startsWith('wu') ? fin.slice(1) : 'u' + fin.slice(1);
  if (ini && 'jqx'.includes(ini) && fin.startsWith('u')) fin = 'ü' + fin.slice(1);
  if (fin === 'i' && ['zh', 'ch', 'sh', 'r', 'z', 'c', 's'].includes(ini)) fin = '';
  const z = (INI[ini] || '') + (fin === '' ? '' : (FIN[fin] ?? '?' + fin));
  const t = TONE[tone] || '';
  return t === '˙' ? z + '˙' : z + t;
}
const src = fs.readFileSync(path.join(__dirname, 'zh-chars.txt'), 'utf8').split('\n');
const groups = [], seen = new Set(), over = {}, problems = [];
let cur = null, inOver = false;
for (const raw of src) {
  const line = raw.trim(); if (!line) continue;
  if (line.startsWith('# overrides')) { inOver = true; continue; }
  if (line.startsWith('#')) { const m = line.match(/^#\s+(\d)\s+(\d)\s+(\S+)\s+(.+)$/); if (m) { cur = { g: +m[1], sub: +m[2], id: m[3], name: m[4], items: [] }; groups.push(cur); } continue; }
  for (const tok of line.split(/\s+/)) {
    const p = tok.split(':');
    if (inOver) { over[p[0] + ':' + p[1]] = p[2]; continue; }
    const [c, w] = p; if (!c || !w || !cur) continue;
    if (seen.has(c)) continue; seen.add(c);
    cur.items.push({ c, w });
  }
}
for (const g of groups) for (const it of g.items) {
  const o = over[it.c + ':' + it.w];
  if (o) { it.z = o; continue; }
  const py = PY[it.c]; if (!py) { problems.push(it.c + ' 無 Unihan 讀音'); it.z = '？'; continue; }
  it.z = py2zy(py); if (it.z.includes('?')) problems.push(it.c + ' ' + py + ' → ' + it.z);
}
const out = 'KL.ZH_CHARS=' + JSON.stringify(groups) + ';';
fs.writeFileSync(path.join(__dirname, '../js/data-zh-chars.js'), out);
const n = groups.reduce((a, g) => a + g.items.length, 0);
console.log('groups', groups.length, 'chars', n, 'problems', problems.length); problems.forEach(p => console.log(' ', p));
fs.writeFileSync(path.join(__dirname, 'zh-chars.out.txt'), groups.map(g => `# ${g.id} ${g.name}\n` + g.items.map(i => `${i.c}:${i.z}:${i.w}`).join(' ')).join('\n'));
