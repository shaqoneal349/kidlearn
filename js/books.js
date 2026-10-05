'use strict';
// 故事屋：會說話的書（參考 Starfall 的 Talking Library 與互動書）
// 每頁一張圖＋一句話；👂 整句朗讀（字一個一個亮起來）；點任何一個字 → 拼讀卡（注音逐一發音＋筆順）；
// 「猜一猜」頁引導預測；讀完回答 2 題，最多三顆星。書架依年級排，推薦適合的書架。
(() => {
  const K = KL, h = K.h, A = K.audio, E = K.engine;
  const S = () => K.shell;
  const zyT = z => z.endsWith('˙') ? '˙' + z.slice(0, -1) : z;
  const st = () => { const L = E.L(); L.books = L.books || {}; return L.books; };
  const starsOf = b => (st()[b.id] || {}).best || 0;
  K.books = {
    count: () => K.BOOKS.length,
    open, read: id => readBook(K.BOOKS.find(x => x.id === id)), readBook
  };

  // ---------- 書架 ----------
  function open() {
    const L = E.L(), gz = L.gs.zh, ge = L.gs.en, over = E.overLimit();
    const rec = sh => sh.k === 'en' ? Math.abs(sh.g - ge) <= 1 : sh.k === 'zy' ? gz <= 1 : sh.k === 'life' ? gz <= 2 : sh.k === 'fable' ? gz >= 2 && gz <= 4 : gz >= 4;
    const shelves = K.SHELVES.map(sh => {
      const bs = K.BOOKS.filter(b => b.shelf === sh.k), read = bs.filter(b => st()[b.id]).length;
      return h('section', 'shelf' + (rec(sh) ? ' rec' : ''), null,
        h('div', 'sh-head', null, h('span', 'sh-i', { text: sh.icon }), h('div', null, null, h('b', null, { text: sh.n }), h('small', null, { text: sh.desc })), rec(sh) && h('span', 'sh-rec', { text: '⭐ 適合你' }), h('span', 'sh-n', { text: `${read}/${bs.length}` })),
        h('div', 'sh-row', null, bs.map(b => { const s = starsOf(b); return h('button', 'book' + (s ? ' read' : ''), { onclick: () => { A.sfx('tap'); readBook(b); } }, h('span', 'bk-c', { text: b.cover }), h('b', b.lang === 'en' ? 'enw' : '', { text: b.title }), h('small', 'bk-s', { text: s ? '★'.repeat(s) + '☆'.repeat(3 - s) : '還沒讀' })); })));
    });
    S().show(h('div', 'screen library', null,
      h('div', 'lib-head', null, S().btn('🏠 回小島', '', S().showHome), h('h1', null, { text: '📖 故事屋' }), h('span', 'lib-sub', { text: `讀過 ${Object.keys(st()).length} / ${K.BOOKS.length} 本` })),
      over && h('div', 'banner', { text: '今天的遊戲時間到了，還是可以安靜看故事喔！' }),
      h('p', 'sub lib-tip', { text: '每一個字都可以點：會唸出來，還會一個一個拼注音。按 👂 聽整句。' }),
      shelves));
    A.speak('歡迎來到故事屋！挑一本書來讀吧。');
  }

  // ---------- 拼讀卡（點字跳出）----------
  function charCard(c, word) {
    const z = (K.zyOf(word || c)[[...(word || c)].indexOf(c)]) || (K.zyOf(c)[0]) || '';
    const box = h('div', 'cc-hz'), card = z ? K.ui.spellCard(z, c, word && word !== c ? word : '') : h('div', 'zhc cc-c', { text: c });
    const again = S().btn('🔊 再聽一次', '', () => card.play && card.play());
    const strokes = K.hanzi && K.hanzi[c] && window.HanziWriter;
    S().modal(h('div', 'cc nozy', null, h('div', 'cc-big zhc', { text: c }), card, strokes && box, h('div', 'row', null, again, strokes && S().btn('✍️ 看筆順', '', () => w && w.animateCharacter()), S().btn('好 👍', 'pri', () => { A.stop(); S().closeModal(); }))));
    let w = null;
    if (strokes) w = HanziWriter.create(box, c, { width: 150, height: 150, padding: 8, showOutline: true, strokeColor: '#1f2937', outlineColor: '#e7e5e4', delayBetweenStrokes: 160, strokeAnimationSpeed: 1.3, charDataLoader: (ch, done) => done(K.hanzi[ch]) });
    if (card.play) card.play().then(() => w && w.animateCharacter()); else A.speak(c, 'zh-TW', { q: true });
  }
  function wordCard(w) {
    const clean = w.replace(/[^A-Za-z']/g, ''), lw = clean.toLowerCase(), hit = (K.EN_ALL || []).find(x => x.w.toLowerCase() === lw);
    const letters = h('div', 'cc-letters enw', null, [...clean].map(ch => h('b', null, { text: ch })));
    const play = async () => { const bs = letters.querySelectorAll('b'); bs.forEach(b => b.classList.remove('on')); for (const b of bs) { b.classList.add('on'); A.sfx('tap'); await new Promise(r => setTimeout(r, 200)); } await A.speak(clean, 'en-US', { q: true, slow: .75 }); await A.speak(clean, 'en-US', { q: true }); };
    S().modal(h('div', 'cc', null, letters, hit && h('div', 'cc-zh', { html: `${hit.e && hit.e[0] !== '#' ? hit.e + ' ' : ''}${hit.zh}` }), h('div', 'row', null, S().btn('🔊 再聽一次', '', play), S().btn('好 👍', 'pri', () => { A.stop(); S().closeModal(); }))));
    play();
  }

  // ---------- 閱讀 ----------
  // onDone：讀完時回呼（學習步道用）；從學習步道進來的書，讀完回到學習步道
  function readBook(b, onDone) {
    const L = E.L(), zh = b.lang === 'zh', t0 = Date.now(), inLib = K.BOOKS.includes(b), back = onDone ? () => K.lessons.open() : open;
    if (!K.BOOK_WORDS) K.BOOK_WORDS = new Set([...(K.ZH_CHARS || []).flatMap(g => g.items.map(x => x.w)), ...(K.ZPIC || []).map(x => x.w), ...Object.values(K.ZY_EX || {}).flat().map(x => x.w)].filter(w => w && [...w].length > 1));
    let i = 0, alive = true, auto = true;
    const ill = h('div', 'bk-ill'), text = h('div', 'bk-text ' + (zh ? 'zh' : 'en')), ear = h('button', 'bk-ear', { text: '👂', 'aria-label': '聽這一句' });
    const prev = h('button', 'bk-nav prev', { text: '◀', 'aria-label': '上一頁' }), next = h('button', 'bk-nav next', { text: '▶', 'aria-label': '下一頁' }), pg = h('span', 'bk-pg');
    const zyB = zh && h('button', 'ib zyb' + (L.zy ? ' on' : ''), { text: 'ㄅ', 'aria-label': '注音開關', onclick: () => { L.zy = !L.zy; K.store.save(); zyB.classList.toggle('on', L.zy); A.sfx('tap'); paint(false); } });
    const autoB = h('button', 'ib on', { text: '🔊', 'aria-label': '自動朗讀', onclick: () => { auto = !auto; autoB.classList.toggle('on', auto); A.sfx('tap'); if (!auto) A.stop(); } });
    const exit = () => { alive = false; A.stop(); E.day().sec += Math.min(900, Math.round((Date.now() - t0) / 1000)); K.store.save(); back(); };
    const page = h('div', 'bk-page', null, ill, h('div', 'bk-bar', null, ear, text));
    S().show(h('div', 'gs reader s-' + (zh ? 'zh' : 'en'), null,
      h('div', 'gbar', null, h('button', 'ib', { text: onDone ? '↩️' : '📚', 'aria-label': '回去',onclick: () => { A.sfx('tap'); exit(); } }), h('div', 'gname', { text: `${b.cover} ${b.title}` }), pg, autoB, zyB),
      h('div', 'bk-wrap', null, prev, page, next)));
    // 把一句話拆成可以點的字／單字；中文依注音字典標注音（含多音詞）
    const units = () => {
      const t = b.pages[i].t;
      if (!zh) return t.split(/(\s+)/).map(w => /\s/.test(w) ? document.createTextNode(' ') : h('span', 'tu', { text: w, onclick: () => { A.sfx('tap'); wordCard(w); } }));
      const zs = K.zyOf(t), cs = [...t], words = segWords(t);
      return cs.map((c, j) => {
        if (!/[㐀-鿿]/.test(c)) return h('span', 'tp', { text: c });
        const el = h('span', 'tu', { onclick: () => { A.sfx('tap'); charCard(c, words[j]); } });
        if (L.zy && zs[j]) el.append(h('ruby', null, null, c, h('rt', null, { text: zyT(zs[j]) }))); else el.append(c);
        return el;
      });
    };
    async function readAloud() {
      const t = b.pages[i].t, us = [...text.querySelectorAll('.tu')], my = i;
      text.classList.add('reading');
      const rate = A.rate(zh ? 'zh-TW' : 'en-US'), per = (zh ? 300 : 380) / rate;
      let k = 0; const tick = setInterval(() => { if (my !== i || !alive) return clearInterval(tick); us.forEach((u, j) => u.classList.toggle('hl', j === k)); k++; if (k > us.length) clearInterval(tick); }, per);
      await A.speak(t, zh ? 'zh-TW' : 'en-US', { q: true });
      clearInterval(tick); us.forEach(u => u.classList.remove('hl')); text.classList.remove('reading');
      if (my === i && alive) next.classList.add('pulse');
    }
    function paint(speak = true) {
      const p = b.pages[i];
      ill.replaceChildren(...[...p.e.matchAll(/\p{Extended_Pictographic}(?:‍\p{Extended_Pictographic}|️|[\u{1F3FB}-\u{1F3FF}])*|\d️?⃣/gu)].map((m, j) => h('span', 'bk-e', { text: m[0], style: `animation-delay:${j * .25}s` })));
      text.replaceChildren(...units());
      pg.textContent = `${i + 1} / ${b.pages.length}`; prev.style.visibility = i ? 'visible' : 'hidden'; next.classList.remove('pulse');
      if (speak && auto) readAloud(); else if (!auto) next.classList.add('pulse');
    }
    ear.onclick = () => { A.sfx('tap'); readAloud(); };
    prev.onclick = () => { if (i > 0) { A.sfx('tap'); A.stop(); i--; paint(); } };
    next.onclick = async () => {
      A.sfx('tap'); A.stop();
      if (b.ask && b.ask.p === i + 1 && !next.dataset.asked) { next.dataset.asked = 1; return askPage(); }
      if (i < b.pages.length - 1) { i++; paint(); } else finish();
    };
    // 猜一猜（預測）：沒有標準答案，只是停下來想一想
    function askPage() {
      S().modal(h('div', 'demo', null, h('div', 'demo-i', { text: '🤔' }), h('h2', null, { text: '猜一猜' }), h('p', 'ask-q ' + (zh ? '' : 'enw'), { text: b.ask.q }), h('p', 'sub', { text: zh ? '想好了嗎？翻下一頁看看你猜對了沒有！' : '想一想，再翻下一頁看看！' }), S().btn('我想好了 ▶', 'pri', () => { A.stop(); S().closeModal(); i++; paint(); })));
      A.speak(b.ask.q, zh ? 'zh-TW' : 'en-US');
    }
    // 讀完：兩題理解題 → 星星
    async function finish() {
      if (!b.qs.length) { // 兒歌、數數書：沒有問題，讀完就完成
        A.sfx('win'); onDone && onDone();
        page.replaceChildren(h('div', 'result bk-res', null, h('div', 'r-stars', { text: '🌟' }), h('h1', null, { text: '唸完了！' }), h('div', 'row', null, S().btn('🔁 再唸一次', '', () => readBook(b, onDone)), S().btn(onDone ? '📚 回學習步道' : '📚 回書架', 'pri', exit))));
        prev.style.visibility = 'hidden'; next.style.visibility = 'hidden'; A.speak('唸完了，好棒！'); return;
      }
      const box = h('div', 'groot quiz bk-quiz'), top = h('div', 'g-top'), work = h('div', 'quiz-work');
      box.append(h('h2', 'bk-done', { text: '📕 讀完了！回答兩個問題' }), top, work);
      page.replaceChildren(box); prev.style.visibility = 'hidden'; next.style.visibility = 'hidden';
      A.speak('讀完了！來回答兩個問題。');
      K.cur = { grade: zh ? L.gs.zh : L.gs.en, used: {} };
      let right = 0;
      for (const qq of b.qs) {
        if (!alive) return;
        const q = K.mkq({ ask: zh ? '想一想' : 'Think', prompt: `<span class="${zh ? 'zhs' : 'enw'}">${qq.q}</span>`, say: qq.q, lang: zh ? 'zh-TW' : 'en-US', hint: zh ? '回想一下故事裡發生的事。' : '想想故事裡發生了什麼。', full: false }, `<span class="${zh ? 'zhs' : 'enw'}">${qq.a}</span>`, qq.o.map(x => `<span class="${zh ? 'zhs' : 'enw'}">${x}</span>`), 3);
        top.replaceChildren(K.ui.prompt(q)); work.replaceChildren(); K.sayQ(q);
        const r = await K.ui.choice(work, q);
        if (r.ok || r.fixed) right++;
      }
      K.cur = null;
      if (!alive) return;
      const stars = 1 + right;
      if (inLib) { const rec = st()[b.id] || (st()[b.id] = { n: 0, best: 0 }); rec.n++; rec.best = Math.max(rec.best, stars); rec.last = K.today(); K.store.save(); }
      onDone && onDone();
      A.sfx('win');
      box.replaceChildren(h('div', 'result bk-res', null, h('div', 'r-stars', { text: '★'.repeat(stars) + '☆'.repeat(3 - stars) }), h('h1', null, { text: stars === 3 ? '讀得好仔細！' : '讀完一本書了！' }), h('p', null, { text: `《${b.title}》　答對 ${right} / ${b.qs.length} 題` }),
        h('div', 'row', null, S().btn('🔁 再讀一次', '', () => readBook(b, onDone)), S().btn(onDone ? '📚 回學習步道' : '📚 回書架', 'pri', exit))));
      A.speak(stars === 3 ? '讀得好仔細！你得到三顆星！' : '讀完一本書了，真棒！');
    }
    paint();
  }
  // 依注音字典的詞表把句子斷成詞，點字時拼讀卡可以顯示「在哪個詞裡」
  function segWords(t) {
    const a = [...t], out = Array(a.length).fill(''), P = (K.ZY && K.ZY.p) || {};
    for (let i = 0; i < a.length;) {
      let n = Math.min(4, a.length - i);
      for (; n > 1; n--) { const w = a.slice(i, i + n).join(''); if (P[w] || (/^[㐀-鿿]+$/.test(w) && (K.BOOK_WORDS || new Set()).has(w))) break; }
      if (n < 2) n = 1;
      const w = a.slice(i, i + n).join(''); for (let j = 0; j < n; j++) out[i + j] = w; i += n;
    }
    return out;
  }
})();
