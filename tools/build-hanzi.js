// 從 content-zh.js 抓出所有「國字」知識點的字，打包筆順資料成 vendor/hanzi-data.js
// 用法：node tools/build-hanzi.js <node_modules 路徑>
const fs = require('fs'), path = require('path');
const nm = process.argv[2];
const src = fs.readFileSync(path.join(__dirname, '../js/content-zh.js'), 'utf8');
const chars = new Set();
for (const m of src.matchAll(/CH\(\d, \d, '[^']+', '[^']+', '([^']+)'/g)) for (const x of m[1].split(' ')) chars.add(x.split(':')[0]);
const out = {}, miss = [];
for (const c of chars) { const f = path.join(nm, 'hanzi-writer-data', c + '.json'); if (fs.existsSync(f)) { const d = JSON.parse(fs.readFileSync(f, 'utf8')); out[c] = { strokes: d.strokes, medians: d.medians }; } else miss.push(c); }
fs.writeFileSync(path.join(__dirname, '../vendor/hanzi-data.js'), 'KL.hanzi=' + JSON.stringify(out) + ';');
console.log('chars', chars.size, 'missing', miss.join('') || '(none)');
