'use strict';
// 森林繪本美術（v5）：有圖就用圖、沒圖就沿用 emoji
// - KL.ART_FILES（js/art-manifest.js，由 tools/build.js 產生）列出 assets/ 裡有哪些圖
// - 畫面上的 emoji 只要有對應的圖（物件 item/<Unicode>、介面符號 icon/*），會自動換成圖片
// - 遊戲卡、寵物、魔王、背景、小狐夥伴由 decorate() 依 data-* 標記套上
// - 家長專區可以關掉（settings.art === false）
(() => {
  const K = KL, h = K.h;
  const FILES = new Set(K.ART_FILES || []);
  const url = p => FILES.has(p) ? `assets/${p}.webp` : '';
  const on = () => FILES.has('bg/home-island') && K.store.data && K.store.data.settings.art !== false;
  const code = e => [...e].map(c => c.codePointAt(0)).filter(c => c !== 0xFE0F).map(c => c.toString(16)).join('-');
  // 介面常用的符號也換成同風格的圖示
  const ICON = { '🪙': 'icon/coin', '⭐': 'icon/star', '❤️': 'icon/heart', '🎖️': 'icon/sticker', '🗓️': 'icon/calendar', '👪': 'icon/parent', '🔊': 'icon/sound', '💡': 'icon/hint', '🧭': 'icon/nav-explore', '🏝️': 'icon/nav-island', '📖': 'icon/nav-story', '🏠': 'icon/nav-home' };
  // 已經畫好的角色、寵物、入口圖，也拿來代替同意思的 emoji（還沒畫的圖示見 docs/art 的「介面圖示」）
  Object.assign(ICON, { '🦊': 'char/fox-idle', '🐣': 'char/pet-1-hatch', '🦕': 'char/pet-3-dino', '🐉': 'char/pet-4-dragon', '🐲': 'char/boss-dragon', '🗺️': 'icon/nav-island', '👑': 'char/boss-dragon', '📚': 'icon/portal-lessons', '🏎️': 'icon/portal-garage', '🐇': 'item/1f430', '🐎': 'item/1f434', '🫧': 'game/m8', '🧲': 'game/c13', '🪵': 'game/c12', '🛤️': 'game/c9', '🎰': 'game/m7',
    '👀': 'icon/ui-see', '🎵': 'icon/ui-song', '🔁': 'icon/ui-again', '💪': 'icon/ui-challenge', '🎁': 'icon/ui-gift', '🧩': 'icon/ui-puzzle', '🚀': 'icon/ui-speed', '⚙️': 'icon/ui-engine', '🛞': 'icon/ui-tire', '🦄': 'icon/av-unicorn', '🧑‍🚀': 'icon/av-astronaut', '🧙': 'icon/av-wizard', '🦸': 'icon/av-hero', '🥷': 'icon/av-ninja' });
  const emojiURL = e => { const ic = ICON[e] || ICON[e + '️'] || ICON[e.replace(/️/g, '')]; return (ic && url(ic)) || url('item/' + code(e)); };
  const PETS = ['char/pet-0-egg', 'char/pet-1-hatch', 'char/pet-2-chick', 'char/pet-3-dino', 'char/pet-4-dragon'];
  const BOSS = { '🐙': 'char/boss-octopus', '👾': 'char/boss-star', '🐲': 'char/boss-dragon' };
  const img = (src, cls, alt) => h('img', cls, { src, alt: alt || '', draggable: 'false', decoding: 'async' });

  K.art = { on, url, img, emojiURL, FILES };

  // ---------- emoji → 圖片（掃描新加入的文字節點）----------
  const EMO = /\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*/gu;
  const SKIP = 'input,textarea,select,option,svg,rt,.noart,.zb-opt,.pdots,.isle-tag';
  const swapText = node => {
    const t = node.nodeValue; if (!t || !EMO.test(t)) return; EMO.lastIndex = 0;
    const p = node.parentNode; if (!p || (p.closest && p.closest(SKIP))) return;
    let last = 0, hit = false; const frag = document.createDocumentFragment();
    for (const m of t.matchAll(EMO)) {
      const u = emojiURL(m[0]); if (!u) continue;
      hit = true; if (m.index > last) frag.append(t.slice(last, m.index));
      frag.append(img(u, 'emo', m[0])); last = m.index + m[0].length;
    }
    if (!hit) return;
    if (last < t.length) frag.append(t.slice(last));
    node.replaceWith(frag);
  };
  const swapIn = el => {
    if (el.nodeType === 3) return swapText(el);
    if (el.nodeType !== 1 || el.matches(SKIP)) return;
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), ns = []; while (w.nextNode()) ns.push(w.currentNode);
    ns.forEach(swapText);
  };

  // ---------- 依 data-* 標記套上美術 ----------
  function decorate(el) {
    if (el.nodeType !== 1) return;
    const all = sel => (el.matches(sel) ? [el] : []).concat([...el.querySelectorAll(sel)]);
    // 遊戲卡、路線、開場：遊戲插圖
    all('[data-g]').forEach(x => { const u = url('game/' + x.dataset.g), gi = x.querySelector('.gi,.stop-i'); if (u && gi && !gi.querySelector('img.gart')) { gi.replaceChildren(img(u, 'gart')); gi.classList.add('has-art'); } });
    // 寵物
    all('[data-pet]').forEach(x => { const u = url(PETS[+x.dataset.pet]); if (u && !x.querySelector('img')) { x.replaceChildren(img(u, 'pet-img')); x.classList.add('has-art'); } });
    // 魔王
    all('.boss-foe .bf').forEach(x => { const u = url(BOSS[x.textContent.trim()]); if (u) { x.replaceChildren(img(u, 'boss-img')); x.classList.add('has-art'); } });
    // 各科入口、科目標頭
    all('[data-icon]').forEach(x => { const u = url('icon/' + x.dataset.icon); if (u && !x.querySelector('img')) { x.replaceChildren(img(u, 'icon-img')); x.classList.add('has-art'); } });
    // 角色（data-char="fox-cheer"）
    all('[data-char]').forEach(x => { const u = url('char/' + x.dataset.char); if (u && !x.querySelector('img')) { x.replaceChildren(img(u, 'char-img')); x.classList.add('has-art'); } });
    // 遊戲畫面：加上小狐夥伴
    all('.gs').forEach(gs => { if (!gs.querySelector('.mascot') && !gs.classList.contains('race') && url('char/fox-idle')) gs.append(h('div', 'mascot', { 'aria-hidden': 'true' }, img(url('char/fox-idle'), 'm-img'))); });
    swapIn(el);
  }

  // ---------- 小狐夥伴：答對歡呼、答錯安慰、過關拿獎盃 ----------
  let mt = null;
  K.mascot = type => {
    if (!on()) return;
    const m = document.querySelector('.gs .mascot img'); if (!m) return;
    const pose = { ok: 'fox-cheer', star: 'fox-cheer', bad: 'fox-comfort', win: 'fox-trophy' }[type]; if (!pose || !url('char/' + pose)) return;
    m.src = url('char/' + pose); m.parentNode.className = 'mascot ' + type;
    clearTimeout(mt); mt = setTimeout(() => { if (m.isConnected) { m.src = url('char/fox-idle'); m.parentNode.className = 'mascot'; } }, type === 'bad' ? 1600 : 1100);
  };
  const sfx0 = K.audio.sfx;
  K.audio.sfx = n => { sfx0(n); K.mascot(n); };

  // ---------- 啟動 ----------
  let applied = false;
  const apply = () => {
    const b = document.body; b.classList.toggle('art', on());
    if (!on() || applied) return;
    applied = true;
    // 背景圖用 CSS 變數，畫面不用一張張改
    const st = document.documentElement.style;
    ['home-island', 'game-zh', 'game-ma', 'game-en', 'boss', 'library', 'lessons', 'puzzle', 'garage', 'race-track', 'result', 'welcome'].forEach(k => { const u = url('bg/' + k); if (u) st.setProperty('--bg-' + k, `url("${new URL(u, location.href).href}")`); });
    ['panel-wood', 'panel-paper', 'btn-yellow', 'btn-yellow-down', 'btn-green', 'btn-round', 'option-card', 'option-right', 'option-wrong', 'tabbar', 'progress-vine', 'progress-fill', 'bubble', 'frame-card'].forEach(k => { const u = url('ui/' + k); if (u) st.setProperty('--ui-' + k, `url("${new URL(u, location.href).href}")`); });
  };
  K.artApply = apply;
  window.addEventListener('DOMContentLoaded', () => {
    apply();
    const obs = new MutationObserver(ms => { if (!on()) return; for (const m of ms) for (const n of m.addedNodes) { if (n.nodeType === 1) decorate(n); else if (n.nodeType === 3) swapText(n); } });
    ['app', 'overlay'].forEach(id => { const r = document.getElementById(id); if (r) obs.observe(r, { childList: true, subtree: true }); });
    obs.observe(document.body, { childList: true }); // 浮在 body 上的提示、星光、對話框
  });
})();
