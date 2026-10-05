// 產生 js/data-zhuyin.js：題目注音用的字典（只收內容檔用到的字，多音字以「詞」覆寫）
// 資料來源：libchewing-data 的 dict/chewing/tsi.csv（LGPL-2.1-or-later，臺灣讀音、含詞頻）
// 用法：node tools/build-zhuyin.js <放 tsi.csv 的資料夾>
// 課本慣例：「一」「不」標本調；同頻的詞優先取輕聲（爸爸 ㄅㄚˋ ˙ㄅㄚ）
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), dir = process.argv[2];
if (!dir) { console.error('用法：node tools/build-zhuyin.js <tsi.csv 所在資料夾>'); process.exit(1); }
const CJK = /[㐀-鿿]/;
// 單字預設讀音的人工修正（詞庫頻率以口語為準，這裡改成課本常用的讀音）
const OVER = { 累: 'ㄌㄟˋ', 和: 'ㄏㄜˊ', 還: 'ㄏㄞˊ', 地: 'ㄉㄧˋ', 為: 'ㄨㄟˋ', 一: 'ㄧ', 不: 'ㄅㄨˋ', 誰: 'ㄕㄟˊ', 那: 'ㄋㄚˋ', 哪: 'ㄋㄚˇ', 期: 'ㄑㄧˊ', 什: 'ㄕㄣˊ', 麼: 'ㄇㄜ˙', 們: 'ㄇㄣ˙', 子: 'ㄗˇ', 頭: 'ㄊㄡˊ', 個: 'ㄍㄜˋ', 裡: 'ㄌㄧˇ', 上: 'ㄕㄤˋ', 下: 'ㄒㄧㄚˋ', 來: 'ㄌㄞˊ', 去: 'ㄑㄩˋ', 好: 'ㄏㄠˇ', 少: 'ㄕㄠˇ', 樂: 'ㄌㄜˋ', 只: 'ㄓˇ', 種: 'ㄓㄨㄥˇ', 數: 'ㄕㄨˋ', 分: 'ㄈㄣ', 差: 'ㄔㄚ', 間: 'ㄐㄧㄢ', 重: 'ㄓㄨㄥˋ', 便: 'ㄅㄧㄢˋ', 處: 'ㄔㄨˋ', 相: 'ㄒㄧㄤ', 會: 'ㄏㄨㄟˋ', 要: 'ㄧㄠˋ', 看: 'ㄎㄢˋ', 長: 'ㄔㄤˊ', 行: 'ㄒㄧㄥˊ', 得: 'ㄉㄜ˙', 著: 'ㄓㄜ˙', 的: 'ㄉㄜ˙', 了: 'ㄌㄜ˙' };
const norm = (w, r) => r.split(' ').map((z, i) => w[i] === '一' ? 'ㄧ' : w[i] === '不' ? 'ㄅㄨˋ' : z).join(' ');
const best = {}; // 詞 → [頻率, 讀音]
for (const line of fs.readFileSync(path.join(dir, 'tsi.csv'), 'utf8').split('\n')) {
  if (!line || line[0] === '#') continue;
  const [w, f, r] = line.trim().split(','); if (!r || ![...w].every(c => CJK.test(c))) continue;
  const n = [...w].length; if (n > 6 || r.split(' ').length !== n) continue;
  const rr = norm([...w], r), fr = +f, light = (rr.match(/˙/g) || []).length, b = best[w];
  if (!b || fr > b[0] || (fr === b[0] && light > b[2])) best[w] = [fr, rr, light];
}
// 內容檔裡所有中文片段
const text = [];
for (const f of fs.readdirSync(path.join(root, 'js'))) { if (f === 'data-zhuyin.js') continue; for (const m of fs.readFileSync(path.join(root, 'js', f), 'utf8').matchAll(/[㐀-鿿]+/g)) text.push(m[0]); }
const chars = new Set(text.join(''));
const C = {}, miss = [];
for (const c of chars) { const z = OVER[c] || (best[c] && best[c][1]); if (z) C[c] = z; else miss.push(c); }
// 正向最長比對斷詞；讀音和逐字預設不同的詞才收進詞表
const P = {};
for (const run of new Set(text)) {
  const a = [...run];
  for (let i = 0; i < a.length;) {
    let L = Math.min(6, a.length - i);
    for (; L > 1; L--) if (best[a.slice(i, i + L).join('')]) break;
    if (L > 1) { const w = a.slice(i, i + L).join(''), r = best[w][1]; if (r !== a.slice(i, i + L).map(c => C[c] || '').join(' ')) P[w] = r; }
    i += L;
  }
}
// 詞庫的口語／錯誤讀音修正：DROP 會誤配的詞、SUB 詞中片段改課本讀音、ADD 補上需要的詞
const DROP = ['那一', '一數', '有數', '花都', '都會', '穿著', '倒到', '點著', '大夫', '很長'];
const SUB = { 什麼: 'ㄕㄣˊ ㄇㄜ˙', 怎麼: 'ㄗㄣˇ ㄇㄜ˙' };
const ADD = { 什麼: 'ㄕㄣˊ ㄇㄜ˙', 怎麼: 'ㄗㄣˇ ㄇㄜ˙', 數一數: 'ㄕㄨˇ ㄧ ㄕㄨˇ', 僧繇: 'ㄙㄥ ㄧㄠˊ', 苗長: 'ㄇㄧㄠˊ ㄓㄤˇ', 長高: 'ㄓㄤˇ ㄍㄠ', 長葉子: 'ㄓㄤˇ ㄧㄝˋ ㄗ˙', 長著: 'ㄓㄤˇ ㄓㄜ˙', 累了: 'ㄌㄟˋ ㄌㄜ˙', 相間: 'ㄒㄧㄤ ㄐㄧㄢˋ', 耳朵: 'ㄦˇ ㄉㄨㄛ˙', 穿得下: 'ㄔㄨㄢ ㄉㄜ˙ ㄒㄧㄚˋ', 數數看: 'ㄕㄨˇ ㄕㄨˇ ㄎㄢˋ', 周長: 'ㄓㄡ ㄔㄤˊ', 尾巴: 'ㄨㄟˇ ㄅㄚ˙', 待在: 'ㄉㄞ ㄗㄞˋ', 長長: 'ㄔㄤˊ ㄔㄤˊ', 好玩: 'ㄏㄠˇ ㄨㄢˊ' };
DROP.forEach(w => delete P[w]);
for (const w in P) for (const s in SUB) { const i = w.indexOf(s); if (i >= 0) { const r = P[w].split(' '); r.splice(i, s.length, ...SUB[s].split(' ')); P[w] = r.join(' '); } }
Object.assign(P, ADD);
const out = '// 由 tools/build-zhuyin.js 產生（資料源自 libchewing-data，LGPL-2.1-or-later）\nKL.ZY={c:' + JSON.stringify(C) + ',p:' + JSON.stringify(P) + '};\n';
fs.writeFileSync(path.join(root, 'js/data-zhuyin.js'), out);
console.log('chars', Object.keys(C).length, 'phrases', Object.keys(P).length, 'KB', Math.round(out.length / 1024), 'missing', miss.join(''));
