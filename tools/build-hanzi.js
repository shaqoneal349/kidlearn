// 收集 App 用到的國字（生字表 + 部件組字），打包筆順資料成 vendor/hanzi-data.js
// 用法：node tools/build-hanzi.js <node_modules 路徑>（需先 npm i hanzi-writer-data，並先跑 build-chars.js）
const fs = require('fs'), path = require('path');
const nm = process.argv[2];
const chars = new Set();
const data = fs.readFileSync(path.join(__dirname, '../js/data-zh-chars.js'), 'utf8');
for (const m of data.matchAll(/"c":"(.)"/g)) chars.add(m[1]);
const zh = fs.readFileSync(path.join(__dirname, '../js/content-zh.js'), 'utf8');
for (const m of zh.matchAll(/CP\('([^']+)'\)/g)) for (const x of m[1].split(' ')) { chars.add(x.split(':')[0]); for (const p of x.split(':')[1]) chars.add(p); }
const out = {}, miss = [];
for (const c of chars) {
  const f = path.join(nm, 'hanzi-writer-data', c + '.json');
  if (fs.existsSync(f)) { const d = JSON.parse(fs.readFileSync(f, 'utf8')); out[c] = { strokes: d.strokes, medians: d.medians.map(m => m.map(p => p.map(v => Math.round(v)))) }; }
  else miss.push(c);
}
fs.writeFileSync(path.join(__dirname, '../vendor/hanzi-data.js'), 'KL.hanzi=' + JSON.stringify(out) + ';');
console.log('chars', chars.size, 'bundled', Object.keys(out).length, 'missing', miss.join('') || '(none)');
