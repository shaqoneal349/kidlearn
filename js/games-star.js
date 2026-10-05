'use strict';
// v4 新增遊戲（參考 Starfall 研究報告的互動模式，同一套玩法同時做成國語、英文、數學版）：
// C11 塗色找找看／E8 Picture Hunt（答對就上色）、C12 分類木樁／E9 Word Sort／M9 分類木樁（拖到對的木樁）、
// C13 注音家族／E10 Make-a-Word（換開頭組新字）、M7 加法機器（算式＋圖像＋數線三表徵）、M8 數字泡泡（跳數與倒數）、
// C14 井字棋擂台（選對類別才能落子，可雙人）、C15 成語蜂巢（定義提示＋蜂巢選字＋三隻蜜蜂）、M10 我的月曆
(() => {
  const K = KL, h = K.h, A = K.audio, E = K.engine;
  const shake = el => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
  const enw = w => `<span class="enw">${w}</span>`;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const emojiOK = it => it.e && !/^[#\x00-\x7F]/.test(it.e); // 排除色塊（#hex）與數字、文字

  // =====================================================================
  // 塗色找找看：黑白線稿的場景，聽指令點對的東西，點對就變彩色；全部找到整張圖變彩色（創作即獎勵）
  // =====================================================================
  const SLOTS = [[10, 16], [34, 10], [58, 18], [82, 12], [14, 60], [38, 68], [62, 58], [86, 66]];
  async function hunt(root, ctx, o) {
    const top = h('div', 'g-top'), scene = h('div', 'hunt-scene ' + (o.bg || 'park')), msg = h('div', 'hunt-msg');
    root.append(top, scene, msg);
    const set = o.build(ctx.pick()); // { items:[{html, key, sk}], targets:[...子集], ask(t) → {ask, say, lang, prompt, full} }
    const els = new Map();
    K.shuffle(SLOTS).slice(0, set.items.length).forEach((pos, i) => {
      const it = set.items[i], b = h('button', 'hunt-it gray', { html: it.html, style: `left:${pos[0] + K.rand(-3, 3)}%;top:${pos[1] + K.rand(-3, 3)}%;--r:${K.rand(-8, 8)}deg` });
      scene.append(b); els.set(it, b);
    });
    let n = 0;
    for (const t of set.targets) {
      if (!ctx.alive) return;
      const q = set.ask(t), el = els.get(t), t0 = Date.now(); let miss = 0;
      top.replaceChildren(K.ui.prompt(q)); K.sayQ(q);
      await new Promise(res => {
        els.forEach((b, it) => b.onclick = () => {
          if (!b.classList.contains('gray') || scene.dataset.lock) return;
          if (it === t) {
            scene.dataset.lock = 1; b.classList.remove('gray', 'idle-target'); b.classList.add('pop'); A.sfx(miss ? 'star' : 'ok'); K.fx.burst(b);
            msg.textContent = q.full ? '✅ ' + K.strip(q.full) : ''; (q.fullSay ? q.fullSay() : Promise.resolve()).then(() => setTimeout(res, 500));
          } else {
            miss++; A.sfx('bad'); shake(b);
            if (miss === 1 && set.hint) msg.textContent = '💡 ' + set.hint(t);
            if (miss >= 2) { el.classList.add('idle-target'); el.dataset.tip = '在這裡！'; }
          }
        });
      });
      delete scene.dataset.lock; msg.textContent = '';
      ctx.progress(++n, set.targets.length);
      await ctx.report({ skill: t.sk || set.skill, probe: false }, miss === 0, Date.now() - t0, { hint: miss > 0, fixed: miss > 0, want: K.strip(t.label || t.html), wantH: t.html, q: { ask: q.ask, prompt: q.prompt && q.prompt !== '🔊' ? q.prompt : '', say: q.say || '', lang: q.lang || '' } });
    }
    // 全部找到：整張圖變彩色
    els.forEach(b => b.classList.remove('gray')); scene.classList.add('done'); A.sfx('win');
    msg.textContent = '🎨 整張圖都變彩色了！'; A.speak('哇！整張圖都變彩色了！');
    await ctx.wait(1800);
    ctx.done();
  }
  const zhPicItem = (it, sk) => Object.assign({}, it, { html: `<span class="hu-e">${it.e}</span>`, label: it.w, sk });
  K.games.c11 = {
    id: 'c11', subj: 'zh', name: '塗色找找看', icon: '🖍️', cog: '聽詞找圖', kinds: ['zpic'], n: 6,
    desc: '聽一聽、看一看，點出對的東西，它就會變成彩色的！',
    start: (root, ctx) => hunt(root, ctx, {
      bg: K.pick(['park', 'room', 'sea']),
      build(p) {
        const s = p.skill, pool = K.shuffle(s.data).slice(0, 8).map(it => zhPicItem(it, s)), riddle = s.mode === 'riddle';
        return {
          skill: s, items: pool, targets: pool.slice(0, ctx.total),
          hint: t => riddle ? `它的名字有 ${[...t.w].length} 個字。` : `找找看「${t.w}」在哪裡。`,
          ask: t => riddle
            ? { ask: '讀一讀，點出說的是哪一個', prompt: `<span class="zhs">${t.d}</span>`, say: ctx.grade <= 2 ? t.d : '', full: `${t.e} ${t.w}`, fullSay: () => A.speak(t.w, 'zh-TW', { q: true }) }
            : { ask: '點一點：', prompt: `<span class="zhs hu-w">${t.w}</span>`, say: t.w, full: `${t.e} ${t.w}`, fullSay: () => A.speak(`對了，這是${t.w}。`) }
        };
      }
    })
  };
  K.games.e8 = {
    id: 'e8', subj: 'en', name: 'Picture Hunt', icon: '🖍️', cog: '聽字找圖', kinds: [], accept: s => s.kind === 'vocab' && s.data.filter(emojiOK).length >= 4, n: 6,
    desc: '聽英文，點出對的東西，它就會變成彩色的！',
    start: (root, ctx) => hunt(root, ctx, {
      bg: K.pick(['park', 'room', 'sea']),
      build(p) {
        const s = p.skill, mine = s.data.filter(emojiOK).map(it => ({ it, sk: s }));
        // 不夠 8 個就從同年級或更低年級的其他字彙補
        const more = K.shuffle(K.skills.filter(x => x.subj === 'en' && x.kind === 'vocab' && x !== s && x.g <= s.g).flatMap(x => x.data.filter(emojiOK).map(it => ({ it, sk: x }))));
        const seen = new Set(), pool = [];
        for (const x of K.shuffle(mine).concat(more)) { if (pool.length >= 8 || seen.has(x.it.e) || seen.has(x.it.w)) continue; seen.add(x.it.e); seen.add(x.it.w); pool.push(Object.assign({}, x.it, { html: `<span class="hu-e">${x.it.e}</span>`, label: x.it.w, sk: x.sk })); }
        const targets = pool.filter(x => x.sk === s).concat(pool.filter(x => x.sk !== s)).slice(0, ctx.total);
        return {
          skill: s, items: pool, targets,
          hint: t => `「${t.w}」的中文是「${t.zh}」。`,
          ask: t => ({ ask: '聽一聽，點出對的東西', prompt: `<span class="enw hu-en">Click on the <b>${t.w}</b>.</span>`, say: `Click on the ${t.w}.`, lang: 'en-US', full: `${t.e} ${t.w}　${t.zh}`, fullSay: () => A.speak(t.w, 'en-US', { q: true }).then(() => A.speak(t.zh, 'zh-TW', { queue: true })) })
        };
      }
    })
  };

  // =====================================================================
  // 分類木樁：海上有 2–3 根木樁，把單字拖到（或點）對的木樁上
  // =====================================================================
  async function sortGame(root, ctx, build) {
    const top = h('div', 'g-top'), posts = h('div', 'st-posts'), dock = h('div', 'st-dock'), msg = h('div', 'hunt-msg');
    root.append(top, posts, dock, msg);
    let n = 0;
    while (n < ctx.total && ctx.alive) {
      const p = ctx.pick(), set = build(p);
      if (!set) continue;
      top.replaceChildren(K.ui.prompt({ ask: set.ask })); A.speak(set.ask);
      const pe = set.posts.map(po => h('div', 'st-post', { 'data-k': po.k }, h('div', 'st-sign', { html: po.label }), po.sub && h('small', null, { text: po.sub }), h('div', 'st-pile'), h('div', 'st-pole')));
      posts.replaceChildren(...pe);
      for (const w of set.words) {
        if (!ctx.alive || n >= ctx.total) break;
        const t0 = Date.now(); let miss = 0;
        const card = h('button', 'st-card idle-target' + (w.cls ? ' ' + w.cls : ''), { html: w.html, 'data-tip': '拖到對的木樁上，或點木樁' });
        dock.replaceChildren(h('span', 'st-left', { text: `還有 ${Math.min(set.words.length - set.words.indexOf(w), ctx.total - n)} 個` }), card, w.say ? h('button', 'q-snd sm', { text: '🔊', onclick: () => A.speak(w.say, w.lang || 'zh-TW', { q: true }) }) : null);
        if (w.say) A.speak(w.say, w.lang || 'zh-TW', { q: true });
        const ok = await new Promise(res => {
          const tryPost = postEl => {
            if (dock.dataset.lock) return false;
            if (postEl.dataset.k === w.k) {
              dock.dataset.lock = 1; A.sfx(miss ? 'star' : 'ok'); K.fx.burst(postEl);
              postEl.querySelector('.st-pile').append(h('span', 'st-chip', { html: w.chip || w.html }));
              msg.textContent = w.full ? '✅ ' + w.full : '';
              setTimeout(() => res(miss === 0), 700); return true;
            }
            miss++; A.sfx('bad'); shake(postEl);
            if (miss === 1) msg.textContent = '💡 ' + (w.why || set.hint || '再想一想，它屬於哪一根木樁？');
            if (miss >= 2) { dock.dataset.lock = 1; const right = pe.find(x => x.dataset.k === w.k); right.classList.add('show'); right.querySelector('.st-pile').append(h('span', 'st-chip', { html: w.chip || w.html })); msg.textContent = `👉 ${K.strip(w.html)} 要放在「${K.strip(set.posts.find(x => x.k === w.k).label)}」。${w.why || ''}`; A.speak(msg.textContent.replace('👉', '')); setTimeout(() => { right.classList.remove('show'); res(false); }, 2600); }
            return false;
          };
          pe.forEach(x => x.onclick = () => tryPost(x));
          K.ui.drag(card, { targets: () => pe, onDrop: tryPost });
        });
        delete dock.dataset.lock; msg.textContent = '';
        n++; ctx.progress(n, ctx.total);
        await ctx.report({ skill: w.sk || p.skill, probe: p.probe }, ok, Date.now() - t0, { hint: !ok, want: `${K.strip(w.html)} → ${K.strip(set.posts.find(x => x.k === w.k).label)}`, q: { ask: set.ask, prompt: w.html } });
      }
    }
    ctx.done();
  }
  // 國語：部首／聲調／韻母家族／詞性
  const zhSort = (p, ctx) => {
    const s = p.skill, NOZY = ' nozy';
    if (s.kind === 'radical') {
      const gs = K.sample(s.data, 3);
      const words = K.shuffle(gs.flatMap(g => K.sample([...g[2]], 3).map(c => ({ html: `<span class="zhc">${c}</span>`, k: g[0], say: c, why: `「${c}」裡面有「${g[0]}」，和${g[1]}有關。` })))).slice(0, 8);
      return { ask: '這個字的部首是哪一個？放到對的木樁上', posts: gs.map(g => ({ k: g[0], label: `<span class="zhc">${g[0]}</span>`, sub: g[1] })), words, hint: '找找看字的左邊、上面或下面，藏著哪一個部首。' };
    }
    if (s.kind === 'tone') {
      const items = s.data.filter(x => !x.light && x.z), TN = { 'ˉ': '一聲', 'ˊ': '二聲', 'ˇ': '三聲', 'ˋ': '四聲' };
      const tones = K.sample(Object.keys(TN).filter(t => items.some(x => K.zySplit(x.z).tone === t)), 3);
      const words = K.shuffle(tones.flatMap(t => K.sample(items.filter(x => K.zySplit(x.z).tone === t), 3))).slice(0, 8)
        .map(x => ({ html: `<span class="zhc">${x.c}</span><small class="st-w">${x.w}</small>`, cls: NOZY, chip: x.c, k: K.zySplit(x.z).tone, say: `${x.c}。${x.w}的${x.c}。`, why: `「${x.c}」唸 ${x.z.replace('ˉ', '')}，是${TN[K.zySplit(x.z).tone]}。` }));
      return { ask: '聽一聽，這個字是第幾聲？', posts: tones.map(t => ({ k: t, label: `<span class="zy tn">${t === 'ˉ' ? '—' : t}</span> ${TN[t]}` })), words, hint: '一聲平平的、二聲往上揚、三聲先下再上、四聲往下降。用手比比看。' };
    }
    if (s.kind === 'syl') {
      const fin = x => { const sy = K.zySplit(x.z).syms; return sy.slice(K.INITIALS.includes(sy[0]) ? 1 : 0).join(''); };
      const groups = {}; s.data.forEach(x => { const f = fin(x); if (f) (groups[f] = groups[f] || []).push(x); });
      const fs = K.sample(Object.keys(groups).filter(f => groups[f].length >= 2), 3); if (fs.length < 2) return null;
      const words = K.shuffle(fs.flatMap(f => K.sample(groups[f], 3))).slice(0, 8).map(x => ({ html: `<span class="zhc">${x.c}</span><small class="st-w">${x.w}</small>`, cls: NOZY, chip: x.c, k: fin(x), say: `${x.c}。${x.w}的${x.c}。`, why: `「${x.c}」唸 ${x.z.replace('ˉ', '')}，後面是 ${fin(x)}。` }));
      return { ask: '聽一聽，它的韻母（後面的聲音）是哪一個？', posts: fs.map(f => ({ k: f, label: `<span class="zy">${f}</span>`, sub: '韻母家族' })), words, hint: '把字慢慢唸，聽最後面拉長的那個聲音。' };
    }
    if (s.kind === 'pos') {
      const ks = ['n', 'v', 'a'], words = K.shuffle(ks.flatMap(k => K.sample(K.POS[k].w, 3))).slice(0, 8).map(w => { const k = ks.find(x => K.POS[x].w.includes(w)); return { html: `<span class="zhs">${w}</span>`, k, say: w, why: `「${w}」是${K.POS[k].name}：${K.POS[k].tip}。` }; });
      return { ask: '這個詞是名詞、動詞還是形容詞？', posts: ks.map(k => ({ k, label: K.POS[k].name, sub: K.POS[k].tip })), words, hint: K.skill['zh-pos'].demo };
    }
    return null;
  };
  K.games.c12 = { id: 'c12', subj: 'zh', name: '分類木樁', icon: '🪵', cog: '分類', kinds: ['radical', 'pos'], accept: s => ['radical', 'pos'].includes(s.kind) || (s.kind === 'tone' && s.id === 'zh-tone') || (s.kind === 'syl' && s.data.length >= 10), n: 8, desc: '每個字詞都有自己的家，把它們放到對的木樁上！', start: (root, ctx) => sortGame(root, ctx, p => zhSort(p, ctx)) };
  // 英文：母音／組合音／長母音／字彙主題
  const enSort = (p, ctx) => {
    const s = p.skill;
    if (s.kind === 'phon') {
      const items = s.data.filter(x => /^[a-z]+$/.test(x.w));
      let key, label;
      if (s.id === 'en-digraph') { key = x => (x.w.match(/sh|ch|th|wh/) || [''])[0]; label = k => k; }
      else if (s.id === 'en-magic-e') { key = x => (x.w.match(/([aeiou])[a-z]e$/) || ['', ''])[1] + '_e'; label = k => k; }
      else { key = x => (x.w.match(/[aeiou]/) || [''])[0]; label = k => `短母音 ${k}`; }
      const groups = {}; items.forEach(x => { const k = key(x); if (k && k !== '_e') (groups[k] = groups[k] || []).push(x); });
      const ks = K.sample(Object.keys(groups).filter(k => groups[k].length >= 2), 3); if (ks.length < 2) return null;
      const words = K.shuffle(ks.flatMap(k => K.sample(groups[k], 3))).slice(0, 8).map(x => ({ html: `${emojiOK(x) ? `<span class="em">${x.e}</span>` : ''}${enw(x.w)}`, chip: enw(x.w), k: key(x), say: x.w, lang: 'en-US', why: `${x.w} 裡面有 ${key(x)}。` }));
      return { ask: '聽一聽、看一看，它屬於哪一個聲音？', posts: ks.map(k => ({ k, label: enw(label(k)) })), words, hint: '把單字慢慢唸，注意中間的母音。' };
    }
    if (s.kind === 'vocab') {
      const L = E.L(), others = K.shuffle(K.skills.filter(x => x.subj === 'en' && x.kind === 'vocab' && x !== s && E.eligible(x, L) && x.data.filter(emojiOK).length >= 3));
      const sks = [s].concat(others.slice(0, 1)); if (sks.length < 2) return null;
      const name = x => x.name.replace(/^[^：:]*[：:]/, '');
      const words = K.shuffle(sks.flatMap(x => K.sample(x.data.filter(emojiOK), 4).map(it => ({ html: `<span class="em">${it.e}</span>${enw(it.w)}`, chip: enw(it.w), k: x.id, sk: x, say: it.w, lang: 'en-US', why: `${it.w} 是「${it.zh}」。` })))).slice(0, 8);
      return { ask: '這個英文字屬於哪一類？', posts: sks.map(x => ({ k: x.id, label: name(x) })), words, hint: '先想想它的中文意思，再決定放哪裡。' };
    }
    return null;
  };
  K.games.e9 = { id: 'e9', subj: 'en', name: 'Word Sort', icon: '🪵', cog: '分類', kinds: [], accept: s => (s.kind === 'phon' && s.data.length >= 8) || (s.kind === 'vocab' && s.data.filter(emojiOK).length >= 4), n: 8, desc: '把英文字放到對的木樁上：一樣的聲音、一樣的種類住在一起！', start: (root, ctx) => sortGame(root, ctx, p => enSort(p, ctx)) };
  // 數學：單雙數／比大小／平面與立體形狀
  const COLS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
  const maSort = (p, ctx) => {
    const s = p.skill;
    if (s.kind === 'oddeven') {
      const nums = K.shuffle([...Array(8)].map((_, i) => { let x; do x = K.rand(1, ctx.grade <= 2 ? 50 : 999); while ((x % 2 === 0) !== (i % 2 === 0)); return x; }));
      return { ask: '這個數是單數還是雙數？', posts: [{ k: 'o', label: '單數', sub: '1 3 5 7 9' }, { k: 'e', label: '雙數', sub: '0 2 4 6 8' }], words: nums.map(x => ({ html: `<b class="st-num">${x}</b>`, k: x % 2 ? 'o' : 'e', say: String(x), why: `個位是 ${x % 10}，是${x % 2 ? '單數' : '雙數'}。` })), hint: '只要看個位數就好。' };
    }
    if (s.kind === 'compare') {
      const max = s.data.max, piv = K.rand(Math.ceil(max * .3), Math.floor(max * .7));
      const nums = K.shuffle([...Array(8)].map((_, i) => { let x; do x = K.rand(0, max); while (x === piv || (x > piv) !== (i % 2 === 0)); return x; }));
      return { ask: `比 ${piv} 大，還是比 ${piv} 小？`, posts: [{ k: 's', label: `比 ${piv} 小` }, { k: 'b', label: `比 ${piv} 大` }], words: nums.map(x => ({ html: `<b class="st-num">${x}</b>`, k: x > piv ? 'b' : 's', say: String(x), why: `${x} ${x > piv ? '>' : '<'} ${piv}。` })), hint: '先比較十位數，十位一樣再比個位。' };
    }
    if (s.kind === 'shape') {
      const set = K.SHAPES[s.data], pick = K.sample(set, 3);
      const words = K.shuffle(pick.flatMap(x => [0, 1, 2].map(i => ({ html: `<span class="st-shp">${x[1](K.pick(COLS))}</span>`, chip: x[0][0], k: x[0], say: '', why: K.skill[s.id].demo })))).slice(0, 8);
      return { ask: '這是什麼形狀？放到對的木樁上', posts: pick.map(x => ({ k: x[0], label: x[0] })), words, hint: s.demo };
    }
    return null;
  };
  K.games.m9 = { id: 'm9', subj: 'ma', name: '數學分類木樁', icon: '🪵', cog: '分類', kinds: ['oddeven', 'compare', 'shape'], n: 8, desc: '把數字和形狀放到對的木樁上！', start: (root, ctx) => sortGame(root, ctx, p => maSort(p, ctx)) };

  // =====================================================================
  // 拼字磁鐵（Make-a-Word）：左邊一排磁鐵，右邊圖片＋「▢ 韻」，換一個開頭就是新字
  // =====================================================================
  async function makeWord(root, ctx, o) {
    const top = h('div', 'g-top'), work = h('div', 'mw'), msg = h('div', 'hunt-msg');
    root.append(top, work, msg);
    let n = 0;
    while (n < ctx.total && ctx.alive) {
      const p = ctx.pick(), fam = o.family(p);
      if (!fam) continue;
      const mags = h('div', 'mw-mags'), pic = h('div', 'mw-pic'), slot = h('span', 'mw-slot', { text: '' }), rime = h('span', 'mw-rime ' + (o.zh ? 'zy' : 'enw'), { text: fam.rime });
      const word = h('div', 'mw-word', null, slot, rime), side = h('div', 'mw-side', null, pic, word);
      work.replaceChildren(mags, side);
      top.replaceChildren(K.ui.prompt({ ask: o.ask(fam), prompt: o.zh ? `<span class="zy mw-fam">▢${fam.rime}</span> 家族` : enw(`-${fam.rime} family`) }));
      const magEls = K.shuffle(fam.onsets).map(on => { const b = h('button', 'mw-mag ' + (o.zh ? 'zy' : 'enw'), { text: on, 'data-v': on }); mags.append(b); return b; });
      for (const it of fam.items) {
        if (!ctx.alive || n >= ctx.total) break;
        const t0 = Date.now(); let miss = 0;
        slot.textContent = ''; slot.className = 'mw-slot idle-target'; slot.dataset.tip = '把磁鐵拖到這裡';
        pic.innerHTML = o.picHTML(it); o.say(it);
        pic.onclick = () => o.say(it);
        const ok = await new Promise(res => {
          const put = mag => {
            if (work.dataset.lock) return false;
            if (mag.dataset.v === it.on) {
              work.dataset.lock = 1; slot.textContent = it.on; slot.className = 'mw-slot fill'; A.sfx(miss ? 'star' : 'ok'); K.fx.burst(slot);
              o.done(it, msg).then(() => setTimeout(() => res(miss === 0), 400)); return true;
            }
            miss++; A.sfx('bad'); shake(mag); shake(slot);
            if (miss >= 2) { const right = magEls.find(x => x.dataset.v === it.on); if (right) { right.classList.add('glow'); setTimeout(() => right.classList.remove('glow'), 1800); } msg.textContent = '💡 ' + o.hint(it); }
            return false;
          };
          magEls.forEach(m => K.ui.drag(m, { targets: () => [slot], onDrop: () => put(m), onTap: () => put(m) }));
        });
        delete work.dataset.lock; msg.textContent = '';
        n++; ctx.progress(n, ctx.total);
        await ctx.report({ skill: fam.sk || p.skill, probe: p.probe }, ok, Date.now() - t0, { hint: !ok, fixed: !ok, want: o.label(it), q: { ask: o.ask(fam), prompt: o.picHTML(it) } });
        magEls.forEach(m => { const c = m.cloneNode(true); m.replaceWith(c); magEls[magEls.indexOf(m)] = c; }); // 清掉舊的拖曳事件
      }
    }
    ctx.done();
  }
  // 國語：注音家族（同一個韻母，換聲母）
  const famZh = (p, ctx) => {
    const s = p.skill; let fams;
    if (s.id === 'zh-pin2' || !s.data) fams = K.ZY_FAM.map(f => ({ rime: f.f, items: f.items.map(x => ({ on: x.i, c: x.c, w: x.w, e: x.e, z: x.i + f.f })) }));
    else { // 有聲調的拼音：依「韻母＋聲調」分家
      const g = {}; s.data.forEach(x => { const sp = K.zySplit(x.z); if (!K.INITIALS.includes(sp.syms[0]) || sp.syms.length < 2) return; const r = sp.syms.slice(1).join('') + (sp.tone === 'ˉ' ? '' : sp.tone); (g[r] = g[r] || []).push({ on: sp.syms[0], c: x.c, w: x.w, e: '', z: x.z }); });
      fams = Object.keys(g).map(r => ({ rime: r, items: g[r].filter((x, i, a) => a.findIndex(y => y.on === x.on) === i) })).filter(f => f.items.length >= 3);
      if (!fams.length) fams = K.ZY_FAM.map(f => ({ rime: f.f, items: f.items.map(x => ({ on: x.i, c: x.c, w: x.w, e: x.e, z: x.i + f.f })) }));
    }
    const f = K.pick(fams), items = K.sample(f.items, Math.min(4, f.items.length));
    const extra = K.sample(K.INITIALS.filter(x => !items.some(i => i.on === x)), ctx.hard ? 3 : 1);
    return { rime: f.rime, items, onsets: K.uniq(items.map(i => i.on).concat(extra)), sk: s };
  };
  K.games.c13 = {
    id: 'c13', subj: 'zh', name: '注音家族', icon: '🧲', cog: '拼讀', kinds: [], accept: s => s.kind === 'syl', n: 8,
    desc: '一樣的韻母是一家人！把聲母磁鐵拖到前面，拼出新的字。',
    start: (root, ctx) => { root.classList.add('nozy'); return makeWord(root, ctx, {
      zh: true, family: p => famZh(p, ctx),
      ask: f => `把聲母放到「${f.rime}」前面`,
      picHTML: it => `${it.e ? `<span class="mw-e">${it.e}</span>` : ''}<span class="mw-cw">${it.w.replace(it.c, `<b>${it.c}</b>`)}</span><small>🔊 點我再聽</small>`,
      say: it => A.speak(`${it.c}。${it.w}的${it.c}。`, 'zh-TW', { q: true }),
      label: it => `${it.z} ${it.c}`,
      hint: it => `「${it.c}」的第一個聲音是 ${it.on}（${K.BPMF_SAY[it.on]}）。`,
      async done(it, msg) { const card = K.ui.spellCard(it.z, it.c, it.w); msg.replaceChildren(card); await card.play(); }
    }); }
  };
  // 英文：word family（-at, -an, -ig …）
  const CONS = [...'bcdfghjklmnprstvw'];
  const splitEn = w => { const m = w.match(/^(sh|ch|th|wh|[^aeiou])(.*)$/); return m ? [m[1], m[2]] : ['', w]; };
  const famEn = (p, ctx) => {
    const s = p.skill, items = s.data.filter(x => /^[a-z]{3,5}$/.test(x.w)).map(x => { const [on, ri] = splitEn(x.w); return { on, ri, w: x.w, zh: x.zh, e: x.e }; }).filter(x => x.on);
    const g = {}; items.forEach(x => (g[x.ri] = g[x.ri] || []).push(x));
    let fs = Object.keys(g).filter(r => g[r].length >= 2);
    const v = ctx.data && ctx.data.vowel; if (v && fs.some(r => r[0] === v)) fs = fs.filter(r => r[0] === v); // 學習步道：只出這個母音的家族
    if (!fs.length) return null;
    const r = K.pick(fs), its = K.sample(g[r].filter((x, i, a) => a.findIndex(y => y.on === x.on) === i), 4);
    const extra = K.sample(CONS.filter(c => !its.some(i => i.on === c)), ctx.hard ? 3 : 2);
    return { rime: r, items: its, onsets: K.uniq(its.map(i => i.on).concat(extra)), sk: s };
  };
  K.games.e10 = {
    id: 'e10', subj: 'en', name: 'Make-a-Word', icon: '🧲', cog: '拼讀', kinds: [], accept: s => s.kind === 'phon' && ['en-cvc', 'en-cvc-2', 'en-cvc-3', 'en-magic-e'].includes(s.id), n: 8,
    desc: '把字母磁鐵拖到前面，拼出新的英文字！',
    start: (root, ctx) => makeWord(root, ctx, {
      family: p => famEn(p, ctx),
      ask: f => `Make a word: ▢${f.rime}`,
      picHTML: it => `${emojiOK(it) ? `<span class="mw-e">${it.e}</span>` : ''}<span class="mw-zh">${it.zh}</span><small>🔊 點我再聽</small>`,
      say: it => A.speak(it.w, 'en-US', { q: true }),
      label: it => it.w,
      hint: it => `${it.w}，開頭的字母是 ${it.on}。`,
      async done(it, msg) { msg.innerHTML = `✅ <span class="enw mw-spell">${[...it.w].map(c => `<b>${c}</b>`).join('')}</span> ${it.w}　${it.zh}`; const bs = msg.querySelectorAll('.mw-spell b'); for (const b of bs) { b.classList.add('on'); await wait(220); } await A.speak(it.w, 'en-US', { q: true, slow: .8 }); await A.speak(it.w, 'en-US', { q: true }); }
    })
  };

  // =====================================================================
  // 加法機器：拉桿出題 → 兩個框裡出現圖案 → 數線跳格 → 選項一個一個出現（符號、圖像、數線三種表徵同時出現）
  // =====================================================================
  const ICONS = ['🦖', '🐟', '🍓', '⭐', '🐥', '🍪', '🚗', '🎈'];
  const nlineHTML = max => `<div class="nl2" style="--n:${max}">${[...Array(max + 1)].map((_, i) => `<span class="t${i % 5 === 0 ? ' big' : ''}" data-i="${i}"><b>${i}</b></span>`).join('')}<i class="nl2-frog">🐸</i></div>`;
  K.games.m7 = {
    id: 'm7', subj: 'ma', name: '加法機器', icon: '🎰', cog: '多表徵', kinds: [], accept: s => ['ma-add10', 'ma-sub10', 'ma-add20', 'ma-sub20', 'ma-make10'].includes(s.id), n: 6,
    desc: '拉一下拉桿，機器就會出題！看圖、看數線，算出答案。',
    async start(root, ctx) {
      const top = h('div', 'g-top'), work = h('div', 'quiz-work am');
      root.append(top, work);
      for (let i = 0; i < ctx.total && ctx.alive; i++) {
        const p = ctx.pick(), it = p.skill.gen(), txt = K.strip(it.text);
        const m = txt.match(/(\d+)\s*([+−-])\s*(\d+|□)(?:\s*=\s*(\d+))?/); if (!m) { i--; continue; }
        const a = +m[1], op = m[2] === '+' ? '+' : '−', b = m[3] === '□' ? +m[4] - a : +m[3], make = m[3] === '□', ans = make ? b : op === '+' ? a + b : a - b;
        const max = Math.max(10, op === '+' ? a + b : a) > 10 ? 20 : 10, ic = K.pick(ICONS), ic2 = K.pick(ICONS.filter(x => x !== ic));
        const screen = h('div', 'am-screen', { html: '？ ？ ？' }), lever = h('button', 'am-lever idle-target', { 'data-tip': '拉一下拉桿', html: '<i></i>' });
        const fa = h('div', 'am-frame'), fb = h('div', 'am-frame b'), frames = h('div', 'am-frames', null, fa, h('b', 'am-op', { text: op }), fb), nl = h('div', 'am-nl', { html: nlineHTML(max) }), opts = h('div', 'am-opts');
        const machine = h('div', 'am-machine', null, h('div', 'am-top', null, h('span', 'am-light'), screen, lever), frames, nl);
        work.replaceChildren(machine, opts);
        top.replaceChildren(K.ui.prompt({ ask: '拉一下拉桿，機器會出題' }));
        A.speak(i ? '再拉一次！' : '拉一下拉桿，機器會出題！');
        await new Promise(r => lever.onclick = () => { lever.classList.remove('idle-target'); lever.classList.add('pull'); A.sfx('pop'); r(); });
        if (!ctx.alive) return;
        screen.textContent = make ? `${a} + ▢ = ${a + b}` : `${a} ${op} ${b} = ▢`; machine.classList.add('on');
        const frog = nl.querySelector('.nl2-frog'), tick = k => nl.querySelector(`[data-i="${k}"]`);
        const hop = k => { const t = tick(k); if (!t) return; frog.style.left = (t.offsetLeft + t.offsetWidth / 2) + 'px'; nl.querySelectorAll('.t').forEach(x => x.classList.toggle('on', +x.dataset.i <= k && +x.dataset.i >= 0)); };
        hop(0);
        // 圖像：a 個放左框，b 個放右框（減法：b 個在左框被拿走）
        for (let k = 0; k < a; k++) { fa.append(h('span', 'am-it', { text: ic })); hop(k + 1); A.sfx('tap'); await ctx.wait(Math.max(90, 380 - a * 15)); }
        if (op === '+' && !make) for (let k = 0; k < b; k++) { fb.append(h('span', 'am-it', { text: ic2 })); A.sfx('tap'); await ctx.wait(Math.max(90, 380 - b * 15)); }
        if (op === '−') { fb.append(h('span', 'am-gone', { text: `拿走 ${b} 個` })); const its = [...fa.children]; for (let k = 0; k < b; k++) { its[its.length - 1 - k].classList.add('out'); await ctx.wait(220); } }
        if (make) fb.append(h('span', 'am-gone', { text: `湊成 ${a + b}` }));
        const q = K.mkq({ ask: make ? `${a} 再加多少是 ${a + b}？` : '答案是多少？', prompt: `<span class="expr">${screen.textContent.replace('▢', '□')}</span>`, item: it, hint: K.arithHint ? K.arithHint(it.text) || p.skill.demo : p.skill.demo, full: { text: make ? `${a} + ${b} = ${a + b}` : `${a} ${op} ${b} = ${ans}`, say: make ? `${a}加${b}等於${a + b}` : `${a}${op === '+' ? '加' : '減'}${b}等於${ans}` } }, ans, K.numD(ans).filter(x => x <= max + 2), 3);
        q.skill = p.skill;
        top.replaceChildren(K.ui.prompt(q));
        const r = await K.ui.choice(opts, q, { cls: 'am-choice' });
        if (!ctx.alive) return;
        if (r.ok || r.fixed) { // 合起來、數線跳到答案
          if (op === '+' && !make) { [...fb.children].forEach(x => fa.append(x)); }
          for (let k = op === '+' ? a : a; op === '+' ? k <= (make ? a + b : a + b) : k >= ans; k += op === '+' ? 1 : -1) { hop(k); await ctx.wait(110); }
        }
        await ctx.report(p, r.ok, r.ms, r);
      }
      ctx.done();
    }
  };

  // =====================================================================
  // 數字泡泡：10×10 的泡泡，照順序戳（往前數、倒著數、2/5/10 跳著數）；挑戰模式泡泡上不顯示數字
  // =====================================================================
  K.games.m8 = {
    id: 'm8', subj: 'ma', name: '數字泡泡', icon: '🫧', cog: '數序', kinds: ['skip'], n: 3,
    desc: '照順序把泡泡戳破！可以往前數、倒著數，也可以跳著數。',
    async start(root, ctx) {
      const top = h('div', 'g-top'), wrap = h('div', 'pb-wrap'), grid = h('div', 'pb-grid'), side = h('div', 'pb-side');
      wrap.append(grid, side); root.append(top, wrap);
      for (let run = 0; run < ctx.total && ctx.alive; run++) {
        const p = ctx.pick(), q = K.skipSeq(p.skill), steps = 8, seq = [...Array(steps + 1)].map((_, i) => q.seq[0] + (q.back ? -1 : 1) * q.by * i).filter(x => x >= 1 && x <= 100);
        const hide = ctx.hard, t0 = Date.now(); let miss = 0, k = 1;
        const ask = `從 ${seq[0]} 開始，${q.back ? '倒著數' : '往前數'}${q.by > 1 ? `，${q.by} 個 ${q.by} 個數` : ''}`;
        top.replaceChildren(K.ui.prompt({ ask, prompt: `<span class="expr">${seq[0]}、${seq[1] ?? ''}、…</span>` })); A.speak(ask);
        const big = h('div', 'pb-big', { text: seq[0] }), list = h('div', 'pb-list', { text: String(seq[0]) });
        side.replaceChildren(h('small', null, { text: q.back ? '⬇️ 倒數' : '⬆️ 往前數' }), big, list);
        const cells = [];
        grid.replaceChildren(...[...Array(100)].map((_, i) => { const v = i + 1, c = h('button', 'pb-b' + (hide ? ' hide' : ''), { text: v, 'data-v': v, style: `--h:${(v * 37) % 360}` }); cells[v] = c; return c; }));
        cells[seq[0]].classList.add('popped');
        await new Promise(res => grid.querySelectorAll('.pb-b').forEach(c => c.onclick = () => {
          if (c.classList.contains('popped') || k >= seq.length) return;
          const v = +c.dataset.v;
          if (v === seq[k]) {
            c.classList.add('popped'); c.classList.remove('idle-target'); A.sfx('pop'); A.speak(String(v), 'zh-TW', { q: true }); K.fx.burst(c, 5);
            big.textContent = v; list.textContent += '、' + v; k++;
            if (k >= seq.length) setTimeout(res, 700);
          } else {
            miss++; A.sfx('bad'); shake(c);
            if (miss % 2 === 0) { const t = cells[seq[k]]; t.classList.add('idle-target', 'hintb'); t.dataset.tip = '下一個在這裡'; setTimeout(() => t.classList.remove('hintb'), 1600); }
          }
        }));
        if (!ctx.alive) return;
        A.sfx('ok'); await ctx.wait(400);
        ctx.progress(run + 1, ctx.total);
        await ctx.report(p, miss === 0, Date.now() - t0, { hint: miss > 0, want: seq.join('、'), q: { ask, prompt: `<span class="expr">${seq.join('、')}</span>` } });
      }
      ctx.done();
    }
  };

  // =====================================================================
  // 井字棋擂台：選對類別的字詞才能落子（Starfall Tic Tac Toe 的中文版），可以對電腦或兩人對戰
  // =====================================================================
  const TEAMS = ['🐱', '🐶', '🐰', '🐼', '🦊', '🐸', '🐯', '🐧'];
  const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  const tttRule = s => {
    if (s.kind === 'radical') { const g = K.pick(s.data), yes = K.sample([...g[2]], 5), no = K.sample(s.data.filter(x => x !== g).flatMap(x => [...x[2]]), 4); return { rule: `只能選有「${g[0]}」的字（和${g[1]}有關）`, cells: K.shuffle(yes.map(c => ({ t: c, ok: true })).concat(no.map(c => ({ t: c, ok: false })))), why: c => `「${c.t}」${c.ok ? '有' : '沒有'}「${g[0]}」。`, big: true }; }
    if (s.kind === 'pos') { const k = K.pick(['n', 'v', 'a']), T = K.POS[k], yes = K.sample(T.w, 5), no = K.sample(['n', 'v', 'a'].filter(x => x !== k).flatMap(x => K.POS[x].w), 4); return { rule: `只能選${T.name}（${T.tip}）`, cells: K.shuffle(yes.map(t => ({ t, ok: true })).concat(no.map(t => ({ t, ok: false })))), why: c => `「${c.t}」${c.ok ? '是' : '不是'}${T.name}。` }; }
    const items = s.data.filter(x => !x.light && x.z), TN = { 'ˉ': '一聲', 'ˊ': '二聲', 'ˇ': '三聲', 'ˋ': '四聲' }, tn = K.pick(Object.keys(TN));
    const yes = K.sample(items.filter(x => K.zySplit(x.z).tone === tn), 5), no = K.sample(items.filter(x => K.zySplit(x.z).tone !== tn), 9 - yes.length);
    return { rule: `只能選${TN[tn]}的字`, cells: K.shuffle(yes.map(x => ({ t: x.c, z: x.z, ok: true })).concat(no.map(x => ({ t: x.c, z: x.z, ok: false })))), why: c => `「${c.t}」唸 ${c.z.replace('ˉ', '')}，${c.ok ? '是' : '不是'}${TN[tn]}。`, tone: true, big: true };
  };
  K.games.c14 = {
    id: 'c14', subj: 'zh', name: '井字棋擂台', icon: '⭕', cog: '分類策略', kinds: ['radical', 'pos'], accept: s => ['radical', 'pos'].includes(s.kind) || s.id === 'zh-tone', n: 8,
    desc: '選對的字才能放上你的棋子，三個連成一條線就贏了！可以跟電腦或家人對戰。',
    async start(root, ctx) {
      const top = h('div', 'g-top'), work = h('div', 'ttt');
      root.append(top, work);
      // 誰要玩？選隊伍
      const mode = await new Promise(res => { top.replaceChildren(K.ui.prompt({ ask: '誰要玩？' })); A.speak('誰要玩？一個人對電腦，還是兩個人對戰？'); work.replaceChildren(h('div', 'ttt-pick', null, h('button', 'btn pri big', { text: '🤖 一個人（對電腦）', onclick: () => res(1) }), h('button', 'btn big', { text: '👫 兩個人', onclick: () => res(2) }))); });
      const team = await new Promise(res => { top.replaceChildren(K.ui.prompt({ ask: mode === 1 ? '選你的隊伍' : '第一位選隊伍' })); A.speak('選一個隊伍！'); work.replaceChildren(h('div', 'ttt-teams', null, TEAMS.map(t => h('button', 'ttt-team', { text: t, onclick: () => res(t) })))); });
      const foe = mode === 1 ? '🤖' : K.pick(TEAMS.filter(t => t !== team));
      const wins = { [team]: 0, [foe]: 0 }; let moves = 0;
      for (let g = 0; g < 2 && ctx.alive; g++) {
        const p = ctx.pick(), R = tttRule(p.skill), board = Array(9).fill(null);
        let turn = g % 2 ? foe : team, winner = null;
        const status = h('div', 'ttt-status'), cells = R.cells.map((c, i) => h('button', 'ttt-c' + (R.big ? ' big' : '') + (R.tone ? ' nozy' : ''), { 'data-i': i, html: R.tone ? `<ruby class="zhc">${c.t}<rt>${c.z.endsWith('˙') ? '˙' + c.z.slice(0, -1) : c.z.replace('ˉ', '')}</rt></ruby>` : `<span class="${R.big ? 'zhc' : 'zhs'}">${c.t}</span>` }));
        work.replaceChildren(h('div', 'ttt-score', null, h('span', null, { text: `${team} ${wins[team]}` }), h('b', null, { text: `第 ${g + 1} 局` }), h('span', null, { text: `${wins[foe]} ${foe}` })), h('div', 'ttt-board', null, cells), status);
        top.replaceChildren(K.ui.prompt({ ask: '規則', prompt: `<span class="zhs ttt-rule">${R.rule}</span>` })); A.speak(R.rule);
        const line = () => LINES.find(l => board[l[0]] && board[l[0]] === board[l[1]] && board[l[1]] === board[l[2]]);
        const openOK = () => R.cells.map((c, i) => i).filter(i => !board[i] && R.cells[i].ok);
        const place = (i, who) => { board[i] = who; cells[i].classList.add('taken'); cells[i].append(h('span', 'ttt-mk', { text: who })); };
        const say = t => { status.textContent = t; };
        while (ctx.alive && !winner) {
          if (!openOK().length) break;
          say(`輪到 ${turn}${turn === '🤖' ? ' 電腦想一想…' : '，選一個符合規則的字'}`);
          let i, human = turn !== '🤖';
          if (!human) { await ctx.wait(900); const ok = openOK(), all = board.map((_, j) => j).filter(j => !board[j]); const best = () => { for (const who of [foe, team]) for (const j of ok) { board[j] = who; const w = line(); board[j] = null; if (w) return j; } return ok.includes(4) ? 4 : K.pick(ok); }; i = Math.random() < .82 ? best() : K.pick(all); }
          else { const t0 = Date.now(); i = await new Promise(res => cells.forEach((c, j) => c.onclick = () => { if (!board[j]) res(j); })); cells.forEach(c => c.onclick = null); R._ms = Date.now() - t0; }
          if (!ctx.alive) return;
          const c = R.cells[i];
          if (c.ok) { place(i, turn); A.sfx('ok'); K.fx.burst(cells[i], 5); say(`✅ ${R.why(c)}`); }
          else { A.sfx('bad'); shake(cells[i]); say(`❌ ${R.why(c)}換對方。`); A.speak(R.why(c)); }
          if (human && mode === 1) { moves++; ctx.progress(Math.min(moves, ctx.total), ctx.total); await ctx.report(p, c.ok, R._ms || 3000, { want: R.rule, got: c.ok ? '' : c.t, q: { ask: '井字棋規則', prompt: `<span class="zhs">${R.rule}</span>` } }); }
          await ctx.wait(c.ok ? 600 : 1500);
          const w = line(); if (w) { winner = turn; w.forEach(j => cells[j].classList.add('win')); }
          turn = turn === team ? foe : team;
        }
        if (winner) { wins[winner]++; A.sfx('win'); say(`🏆 ${winner} 贏了！`); A.speak(winner === '🤖' ? '電腦贏了，下次再加油！' : '贏了！好厲害！'); }
        else { say('🤝 平手！'); A.speak('平手！'); }
        await ctx.wait(2200);
      }
      ctx.note = `⭕ 井字棋：${team} ${wins[team]} 勝、${foe} ${wins[foe]} 勝` + (mode === 2 ? '（雙人模式不計分）' : '');
      ctx.done();
    }
  };

  // =====================================================================
  // 成語蜂巢：看意思，從蜂巢裡依序點出成語的四個字；點錯一次飛走一隻蜜蜂（共三隻）
  // =====================================================================
  K.games.c15 = {
    id: 'c15', subj: 'zh', name: '成語蜂巢', icon: '🐝', cog: '詞彙產出', kinds: ['idiom'], n: 5,
    desc: '看看意思，從蜂巢裡照順序點出成語的四個字！',
    async start(root, ctx) {
      const top = h('div', 'g-top'), work = h('div', 'hv');
      root.append(top, work);
      for (let i = 0; i < ctx.total && ctx.alive; i++) {
        const p = ctx.pick(), it = K.pi(p.skill), t0 = Date.now(), want = [...it.i];
        const pool = K.uniq(p.skill.data.filter(x => x !== it).flatMap(x => [...x.i]).filter(c => !want.includes(c)));
        const chars = K.shuffle(want.concat(K.sample(pool, ctx.hard ? 6 : 4)));
        let bees = 3, k = 0;
        const beeEl = h('div', 'hv-bees', { text: '🐝🐝🐝' }), slots = want.map(() => h('span', 'hv-slot')), comb = h('div', 'hv-comb', null, chars.map(c => h('button', 'hv-cell', { text: c })));
        work.replaceChildren(beeEl, comb, h('div', 'hv-board', null, slots));
        const q = { ask: '看意思，照順序點出成語', prompt: `<span class="zhs">${it.m}</span>`, say: ctx.grade <= 4 ? it.m : '' };
        top.replaceChildren(K.ui.prompt(q)); K.sayQ(q);
        const ok = await new Promise(res => comb.querySelectorAll('.hv-cell').forEach(b => b.onclick = () => {
          if (b.classList.contains('used') || bees <= 0 || k >= 4) return;
          if (b.textContent === want[k]) { b.classList.add('used'); slots[k].textContent = want[k]; slots[k].classList.add('fill'); A.sfx('tap'); k++; if (k === 4) { A.sfx(bees < 3 ? 'star' : 'ok'); K.fx.burst(work.querySelector('.hv-board')); setTimeout(() => res(bees === 3), 300); } }
          else {
            bees--; beeEl.textContent = '🐝'.repeat(bees) + '💨'.repeat(3 - bees); A.sfx('bad'); shake(b);
            if (bees === 1) { const nx = [...comb.children].find(x => !x.classList.contains('used') && x.textContent === want[k]); if (nx) nx.classList.add('glow'); }
            if (bees <= 0) { slots.forEach((s, j) => { s.textContent = want[j]; s.classList.add('show'); }); setTimeout(() => res(false), 1600); }
          }
        }));
        if (!ctx.alive) return;
        work.append(h('div', 'hunt-msg', { text: `✅ ${it.i}：${it.m}` }));
        await A.speak(it.i, 'zh-TW', { q: true }); await ctx.wait(900);
        ctx.progress(i + 1, ctx.total);
        await ctx.report(p, ok, Date.now() - t0, { hint: !ok, want: it.i, q: { ask: '照意思拼出成語', prompt: `<span class="zhs">${it.m}</span>` } });
      }
      ctx.done();
    }
  };

  // =====================================================================
  // 我的月曆（Starfall Let's Make a Calendar）：先點日期聽唸法、看節日，再回答月曆問題
  // =====================================================================
  K.games.m10 = {
    id: 'm10', subj: 'ma', name: '我的月曆', icon: '📅', cog: '生活應用', app: true, kinds: ['cal'], n: 5,
    desc: '這是這個月的月曆！點點看日期，再回答月曆的問題。',
    async start(root, ctx) {
      const top = h('div', 'g-top'), work = h('div', 'quiz-work calw');
      root.append(top, work);
      const t = new Date(), y = t.getFullYear(), m = t.getMonth() + 1, H = K.holidays(y), WD = K.WD;
      const readDay = d => { const dow = new Date(y, m - 1, d).getDay(), hol = H[String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0')]; return `${m}月${d}日，星期${WD[dow]}` + (hol ? `，${hol}` : '') + (d === t.getDate() ? '，就是今天！' : ''); };
      top.replaceChildren(K.ui.prompt({ ask: '點一點日期，聽聽看是星期幾' }));
      work.innerHTML = K.calHTML(y, m);
      const info = h('div', 'hunt-msg', { text: `今天是 ${readDay(t.getDate())}` }), go = h('button', 'btn pri go', { text: '開始問答 ▶' });
      work.append(info, go);
      A.speak(`這是${m}月的月曆。今天是${readDay(t.getDate())}`);
      const td = work.querySelector('.cd.td'); if (td) { td.classList.add('idle-target'); td.dataset.tip = '今天在這裡'; }
      let taps = 0;
      await new Promise(res => { work.querySelectorAll('.cd').forEach(c => c.onclick = () => { const d = +c.dataset.d; work.querySelectorAll('.cd').forEach(x => x.classList.remove('mk')); c.classList.add('mk'); info.textContent = readDay(d); A.speak(readDay(d)); if (++taps >= 6) res(); }); go.onclick = res; });
      for (let i = 0; i < ctx.total && ctx.alive; i++) {
        const p = ctx.pick(), cq = K.calQ(y, m);
        const q = K.mkq({ prompt: K.calHTML(y, m, { mark: cq.mark }), ask: cq.text, say: cq.text, item: cq, hint: cq.hint }, cq.ans, cq.opts, ctx.nOpts);
        q.skill = p.skill; q.full = { text: `${cq.text.replace(/？$/, '')}：${cq.ans}`, say: `答案是${cq.ans}` };
        top.replaceChildren(K.ui.prompt(q)); work.replaceChildren(); K.sayQ(q);
        const r = await K.ui.choice(work, q);
        if (!ctx.alive) return;
        await ctx.report(p, r.ok, r.ms, r);
      }
      ctx.done();
    }
  };
})();
