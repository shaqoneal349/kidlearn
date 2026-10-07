// 建置：1) 從內容檔收集用到的中文字，子集化楷體字型  2) 以檔案雜湊產生 sw.js 的快取版本與檔案清單
// 用法：node tools/build.js [--font <LXGWWenKaiTC-Regular.ttf 路徑>]
const fs = require('fs'), path = require('path'), crypto = require('crypto'), cp = require('child_process');
const root = path.join(__dirname, '..');
const args = process.argv.slice(2), fi = args.indexOf('--font');
if (fi >= 0) {
  const chars = new Set();
  for (const f of fs.readdirSync(path.join(root, 'js'))) for (const m of fs.readFileSync(path.join(root, 'js', f), 'utf8').matchAll(/[㐀-鿿ㄅ-ㄩˇˊˋ˙　-〿＀-￯]/g)) chars.add(m[0]);
  '。，、？！：；「」『』（）—…０１２３４５６７８９'.split('').forEach(c => chars.add(c));
  fs.writeFileSync(path.join(__dirname, 'font-chars.txt'), [...chars].join(''));
  const out = path.join(root, 'vendor/fonts/kai.woff2');
  cp.execSync(`python -m fontTools.subset "${args[fi + 1]}" --text-file="${path.join(__dirname, 'font-chars.txt')}" --flavor=woff2 --output-file="${out}" --layout-features='*' --no-hinting`, { stdio: 'inherit' });
  console.log('font chars', chars.size, 'woff2', fs.statSync(out).size);
}
// 美術素材清單：assets/ 裡有哪些圖（程式靠它決定「有圖用圖、沒圖用 emoji」）
{
  const list = [];
  const adir = path.join(root, 'assets');
  if (fs.existsSync(adir)) (function walk(d, rel) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f), r = rel ? rel + '/' + f : f; if (fs.statSync(p).isDirectory()) walk(p, r); else if (/\.webp$/.test(f)) list.push(r.replace(/\.webp$/, '')); } })(adir, '');
  fs.writeFileSync(path.join(root, 'js/art-manifest.js'), `// 由 tools/build.js 產生：assets/ 裡的圖（不含副檔名）\nKL.ART_FILES = ${JSON.stringify(list.sort())};\n`);
  console.log('art', list.length, 'files');
}
const SKIP = new Set(['tools', 'docs', '.git', 'node_modules', '.claude', 'README.md', 'sw.js', '.gitignore']);
// 只收 App 自己的檔案（白名單），專案資料夾裡其他不相干的東西不會被放進離線快取
const APP = /^(index\.html|manifest\.webmanifest|(css|js|icons|vendor|assets)\/)/;
const files = [];
(function walk(dir, rel) { for (const f of fs.readdirSync(dir)) { if (SKIP.has(f) || f.startsWith('.')) continue; const p = path.join(dir, f), r = rel ? rel + '/' + f : f; if (fs.statSync(p).isDirectory()) walk(p, r); else if (APP.test(r)) files.push(r); } })(root, '');
const hash = crypto.createHash('sha1'); for (const f of files.sort()) hash.update(f).update(fs.readFileSync(path.join(root, f)));
const ver = hash.digest('hex').slice(0, 10);
const sw = `// 由 tools/build.js 產生：版本 = 所有檔案內容的雜湊，任何檔案改動都會換新快取
const CACHE = 'kidlearn-${ver}';
// assets/item/（題目裡的物件圖，數量多）不預先下載，第一次用到時再存進快取
const FILES = ${JSON.stringify(['./'].concat(files.filter(f => !f.startsWith('assets/item/'))))};
// cache: 'reload'：安裝新版本時一律向伺服器拿最新檔，不用瀏覽器 HTTP 快取裡的舊檔
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('message', e => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request).then(res => {
    if (res.ok && e.request.url.includes('/assets/')) { const c = res.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); }
    return res;
  })));
});
`;
fs.writeFileSync(path.join(root, 'sw.js'), sw);
console.log('sw.js', ver, files.length, 'files', Math.round(files.reduce((a, f) => a + fs.statSync(path.join(root, f)).size, 0) / 1024), 'KB');
