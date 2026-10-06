'use strict';
// v2 融合新增 6 款：E6 故事偵探、E7 情境對話、M6 數字廚房、C6 字詞配對森林、C7 句子修理店、C8 閱讀探險島
(() => {
  const K = KL, h = K.h, A = K.audio, R = K.rand;
  const shake = el => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };

  // 閱讀題共用：先回答，再「指出證據」。答錯時把線索句亮起來，而不是直接給答案。
  async function reading(root, ctx, en) {
    const lang = en ? 'en-US' : 'zh-TW';
    const pass = h('div', 'rd-pass' + (en ? ' en' : '')), top = h('div', 'g-top'), work = h('div', 'quiz-work');
    root.append(pass, top, work);
    for (let i = 0; i < ctx.total && ctx.alive; i++) {
      const p = ctx.pick(), it = K.pi(p.skill), sents = K.sentences(it.t, en), ev = (it.ev || []).filter(x => x < sents.length);
      const els = sents.map(s => h('button', 'rd-s', { text: s + (en ? ' ' : '') }));
      const readIt = () => A.speak(it.t, lang, { q: true });
      pass.replaceChildren(h('button', 'q-snd sm', { text: '🔊', onclick: readIt }), ...els); pass.dataset.step = 1;
      if (ctx.grade <= 2) readIt();
      const wrap = t => en ? `<span class="enw sm">${t}</span>` : `<span class="zhs">${t}</span>`;
      const q = K.mkq({ prompt: wrap(it.q), ask: '讀一讀，回答問題', hint: '線索就在亮起來的句子裡，再讀一次。', skill: p.skill }, wrap(it.a), it.o.map(wrap), 3);
      top.replaceChildren(K.ui.prompt(q)); work.replaceChildren();
      const r = await K.ui.choice(work, q, { onHint: () => ev.forEach(x => els[x].classList.add('clue')) });
      if (!ctx.alive) return;
      if ((r.ok || r.fixed) && ev.length) { // 指出證據才算真的讀懂
        els.forEach(e => e.classList.remove('clue')); pass.dataset.step = 2;
        top.replaceChildren(K.ui.prompt({ ask: '🔎 你怎麼知道的？點出告訴你答案的那一句' })); work.replaceChildren();
        A.speak('你怎麼知道的？點出告訴你答案的那一句。');
        r.ev = await new Promise(res => els.forEach((e, j) => e.onclick = () => {
          if (pass.dataset.step !== '2') return; pass.dataset.step = 3;
          const good = ev.includes(j); A.sfx(good ? 'star' : 'bad');
          if (!good) shake(e); ev.forEach(x => els[x].classList.add('ev'));
          setTimeout(() => res(good), good ? 900 : 1700);
        }));
      } else { ev.forEach(x => els[x].classList.add('ev')); await ctx.wait(900); }
      if (!ctx.alive) return;
      await ctx.report(p, r.ok, r.ms, r);
    }
    ctx.done();
  }

  K.games.e6 = {
    id: 'e6', subj: 'en', app: true, name: '故事偵探', icon: '🕵️‍♀️', cog: '閱讀理解', kinds: ['read'], n: 5,
    desc: '讀故事、回答問題，再找出證據！', start: (root, ctx) => reading(root, ctx, true)
  };
  K.games.c8 = {
    id: 'c8', subj: 'zh', app: true, name: '閱讀探險島', icon: '🏝️', cog: '閱讀理解', kinds: ['zread'], n: 5,
    desc: '讀短文、回答問題，再指出證據在哪一句！', start: (root, ctx) => reading(root, ctx, false)
  };

  K.games.e7 = {
    id: 'e7', subj: 'en', app: true, name: '情境對話', icon: '💬', cog: '口說應用', kinds: ['dialog'], n: 6,
    desc: '聽聽他說什麼，選一句回答，再跟著說一次！',
    async start(root, ctx) {
      const scene = h('div', 'tk-scene'), work = h('div', 'quiz-work');
      root.append(scene, work);
      for (let i = 0; i < ctx.total && ctx.alive; i++) {
        const p = ctx.pick(), q = K.mcq(p.skill, { n: 3 }), it = q.item, npc = K.pick(['🧑‍🏫', '👩‍🍳', '👮', '🧒', '👵', '🧑‍🌾', '👨‍⚕️']);
        const bub = h('div', 'tk-bub', null, h('div', 'enw', { text: it.q }), ctx.grade <= 3 && h('small', null, { text: it.zh }));
        scene.replaceChildren(h('div', 'tk-npc', { text: npc }), bub, h('button', 'q-snd', { text: '🔊', onclick: () => K.sayQ(q) }), h('button', 'q-help', { text: '💡', onclick: () => q._help && q._help() }));
        work.replaceChildren(); K.sayQ(q);
        const r = await K.ui.choice(work, q, { cls: 'col' });
        if (!ctx.alive) return;
        // 跟讀：只做練習，不用語音辨識評分，避免用口音判定好壞
        work.replaceChildren(h('div', 'tk-me', null, h('div', 'enw', { text: it.a }), h('small', null, { text: '🗣️ 跟著說一次！' })));
        await A.speak(it.a, 'en-US', { slow: .8, q: true }); await ctx.wait(1600);
        await ctx.report(p, r.ok, r.ms, r);
      }
      ctx.done();
    }
  };

  K.games.m6 = {
    id: 'm6', subj: 'ma', app: true, name: '數字廚房', icon: '🍳', cog: '數感／具體操作', kinds: [], accept: s => !!s.kit, n: 6,
    desc: '照著訂單準備餐點，動手排一排、分一分！',
    async start(root, ctx) {
      const top = h('div', 'g-top'), work = h('div', 'kt-work');
      root.append(top, work);
      const food = () => K.pick(['🍓', '🍪', '🥟', '🍡', '🍒', '🥕']);
      for (let i = 0; i < ctx.total && ctx.alive; i++) {
        const p = ctx.pick(), m = p.skill.kit, t0 = Date.now(), f = food();
        const msg = h('div', 'm4-msg'), go = h('button', 'btn pri go', { text: '✔ 上菜' });
        let tx, check, eq, body, tries = 0;
        const plate = (n, fixedN = 0) => { const el = h('button', 'kt-plate'); el._n = n; el._fx = fixedN; const draw = () => el.innerHTML = `<span>${(f + ' ').repeat(el._n)}</span><b>${el._n}</b>`; el._draw = draw; draw(); return el; };
        if (m === 'make' || m === 'ten' || m === 'ratio') {
          let N, pre = 0, item = f;
          if (m === 'make') { N = R(3, ctx.L.sub.ma > 1 ? 20 : 10); tx = `客人點了 ${N} 個 ${f}`; eq = `數到 ${N} 個`; }
          else if (m === 'ten') { pre = R(1, 9); N = 10; tx = `盤子裡有 ${pre} 個，請補到剛好 10 個`; eq = `${pre} + ${10 - pre} = 10`; }
          else { const [a, b] = K.sample([1, 2, 3, 4], 2), k = R(2, 4); pre = 0; N = b * k; item = '💧'; tx = `果汁配方：🧃 ${a} 杯配 💧 ${b} 杯。現在有 🧃 ${a * k} 杯，要加幾杯水？`; eq = `${a} : ${b} = ${a * k} : ${b * k}`; }
          let n = pre; const pl = h('div', 'kt-bowl' + (m === 'ten' ? ' ten' : '')), cnt = h('b', 'kt-cnt');
          const draw = () => { pl.replaceChildren(...Array.from({ length: n }, (_, j) => h('button', 'kt-it' + (j < pre ? ' fx' : ''), { text: m === 'ratio' ? item : f, onclick: () => { if (work.dataset.lock || j < pre) return; n--; A.sfx('tap'); draw(); } }))); cnt.textContent = ctx.grade <= 1 || m === 'ratio' ? `${n}` : ''; };
          draw();
          body = [h('div', 'kt-row', null, pl, cnt), h('button', 'kt-add', { text: `➕ ${m === 'ratio' ? item : f}`, onclick: () => { if (work.dataset.lock || n >= 24) return; n++; A.sfx('tap'); draw(); } })];
          check = () => n === N ? '' : n < N ? `還差 ${N - n} 個` : `多了 ${n - N} 個`;
        } else if (m === 'groups' || m === 'share') {
          const g = R(2, 5), per = R(2, 5), total = g * per, plates = Array.from({ length: g }, () => plate(0));
          let pile = m === 'share' ? total : Infinity; const pileEl = h('div', 'kt-pile');
          const drawPile = () => pileEl.textContent = m === 'share' ? `還沒分的：${(f + ' ').repeat(pile)}（${pile}）` : '';
          plates.forEach(el => el.onclick = () => { if (work.dataset.lock || pile <= 0 || el._n >= 9) return; el._n++; pile--; A.sfx('tap'); el._draw(); drawPile(); });
          drawPile();
          tx = m === 'groups' ? `每個盤子放 ${per} 個 ${f}，一共 ${g} 盤` : `把 ${total} 個 ${f} 平分到 ${g} 個盤子`;
          eq = m === 'groups' ? `${per} × ${g} = ${total}` : `${total} ÷ ${g} = ${per}`;
          body = [pileEl, h('div', 'kt-plates', null, plates), h('button', 'btn', { text: '↩️ 重來', onclick: () => { if (work.dataset.lock) return; plates.forEach(el => { el._n = 0; el._draw(); }); pile = m === 'share' ? total : Infinity; drawPile(); } }), h('div', 'sub', { text: '點盤子，放一個上去' })];
          check = () => { const bad = plates.filter(el => el._n !== per).length; return !bad && (m !== 'share' || pile === 0) ? '' : m === 'share' && pile > 0 ? `還有 ${pile} 個沒分完` : `每一盤要一樣多：${per} 個`; };
        } else if (m === 'frac2') { // 同分母分數加法：兩個披薩合在第三個
          const d = K.pick([4, 5, 6, 8]), a = R(1, d - 2), b = R(1, d - 1 - a), on = new Set();
          tx = `${a}/${d} 個披薩加 ${b}/${d} 個披薩，一共是幾分之幾？請在右邊的披薩選出來`; eq = `${a}/${d} + ${b}/${d} = ${a + b}/${d}`;
          const fig = h('div', 'kt-pz3', { html: K.pizza(d, i => i < a) + '<b>＋</b>' + K.pizza(d, i => i < b) + '<b>＝</b>' + K.pizza(d) });
          const last = fig.querySelectorAll('.pizza')[2];
          last.querySelectorAll('.wd').forEach(w => w.addEventListener('click', () => { if (work.dataset.lock) return; const x = +w.dataset.i; on.has(x) ? on.delete(x) : on.add(x); w.classList.toggle('on'); A.sfx('tap'); }));
          body = [fig, h('div', 'sub', { text: '點右邊的披薩，選出合起來的份數' })];
          check = () => on.size === a + b ? '' : on.size < a + b ? `還差 ${a + b - on.size} 片` : `多了 ${on.size - a - b} 片`;
        } else if (m === 'tiles') { // 面積公式：鋪出長 × 寬 的長方形
          const l = R(3, 6), w = R(2, 4), on = new Set(), COLS = 6, ROWS = 4;
          tx = `用方塊鋪出一個長 ${l} 格、寬 ${w} 格的長方形`; eq = `${l} × ${w} = ${l * w}（面積 ${l * w} 格）`;
          const grid = h('div', 'm4-grid', { style: `--c:${COLS};--r:${ROWS}` });
          for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const k = r * COLS + c, cell = h('button', 'cell'); cell.onclick = () => { if (work.dataset.lock) return; A.sfx('tap'); on.has(k) ? on.delete(k) : on.add(k); cell.classList.toggle('on'); }; grid.append(cell); }
          body = [grid, h('div', 'sub', { text: '點格子鋪方塊' })];
          check = () => { if (!on.size) return '還沒鋪方塊'; const rs = [...on].map(k => Math.floor(k / COLS)), cs = [...on].map(k => k % COLS), W = Math.max(...cs) - Math.min(...cs) + 1, H = Math.max(...rs) - Math.min(...rs) + 1; if (W * H !== on.size) return '中間有空洞，不是長方形'; return (W === l && H === w) || (W === w && H === l) ? '' : `你鋪的是 ${W} × ${H}，要 ${l} × ${w}`; };
        } else { // frac / pct：披薩或量杯
          const pct = m === 'pct', d = pct ? 10 : K.pick([2, 3, 4, 6, 8]), k = R(1, d - 1), on = new Set();
          tx = pct ? `把果汁倒到 ${k * 10}%（每一格是 10%）` : `客人要 ${k}/${d} 個披薩（${d} 份裡的 ${k} 份）`; eq = pct ? `${k * 10}% = ${k}/10` : `${d} 份裡的 ${k} 份 = ${k}/${d}`;
          const fig = h('div', pct ? 'kt-cup' : 'kt-pz');
          if (pct) for (let j = 9; j >= 0; j--) fig.append(h('button', 'kt-cell', { onclick: e => { if (work.dataset.lock) return; on.clear(); for (let x = 0; x <= j; x++) on.add(x); [...fig.children].forEach((c, ci) => c.classList.toggle('on', 9 - ci <= j)); A.sfx('tap'); } }));
          else { fig.innerHTML = K.pizza(d); fig.querySelectorAll('.wd').forEach(w => w.addEventListener('click', () => { if (work.dataset.lock) return; const x = +w.dataset.i; on.has(x) ? on.delete(x) : on.add(x); w.classList.toggle('on'); A.sfx('tap'); })); }
          body = [fig, h('div', 'sub', { text: pct ? '點一下要倒到的高度' : '點披薩，選出要給客人的那幾片' })];
          check = () => on.size === k ? '' : on.size < k ? `還差 ${k - on.size} ${pct ? '格' : '片'}` : `多了 ${on.size - k} ${pct ? '格' : '片'}`;
        }
        top.replaceChildren(K.ui.prompt({ prompt: `<span class="expr long">🧾 ${tx}</span>`, say: tx.replace(/[🧃💧]/g, '').replace('/', ' 分之 ') })); A.speak(tx.replace(/\p{Extended_Pictographic}/gu, ''), 'zh-TW', { q: true });
        work.replaceChildren(...body, msg, go); delete work.dataset.lock;
        const ok = await new Promise(res => go.onclick = () => {
          if (work.dataset.lock) return;
          const err = check();
          if (!err) { work.dataset.lock = 1; A.sfx(tries ? 'star' : 'ok'); msg.className = 'm4-msg right'; msg.textContent = `👍 ${eq}`; return setTimeout(() => res(tries === 0), 1500); }
          tries++; A.sfx('bad'); msg.className = 'm4-msg wrong'; msg.textContent = err; shake(msg); // 用物件顯示差多少，再試一次
          if (tries >= 2) { work.dataset.lock = 1; msg.textContent = `${err}　答案：${eq}`; setTimeout(() => res(false), 2400); }
        });
        if (!ctx.alive) return;
        await ctx.report(p, ok, Date.now() - t0, { hint: tries > 0, fixed: !ok && tries === 1 });
      }
      ctx.done();
    }
  };

  K.games.c6 = {
    id: 'c6', subj: 'zh', name: '字詞配對森林', icon: '🌲', cog: '音形義連結', kinds: ['char', 'pair', 'idiom'], n: 8,
    desc: '翻開卡片，把一對的字詞找出來！',
    async start(root, ctx) {
      const pairsN = ctx.grade <= 2 ? 4 : 6, boards = ctx.grade <= 2 ? 2 : 1, total = pairsN * boards; let done = 0;
      const top = h('div', 'g-top'), grid = h('div', 'mgrid forest');
      root.append(top, grid);
      for (let b = 0; b < boards && ctx.alive; b++) {
        const p = ctx.pick(), s = p.skill; let items, ask;
        // 注音輔助階段（小一、小二的新字）：國字配「有這個字的詞語＋圖」，用詞義認字
        if (s.kind === 'char' && K.zhScaffold && K.zhScaffold(s)) { ask = '把國字和有它的詞語配成一對'; items = K.sample(s.data.filter((x, i, a) => a.findIndex(y => y.c === x.c || y.w === x.w) === i), pairsN).map(it => ({ k: it.c, a: `<span class="zhc">${it.c}</span>`, b: `<span class="zhs sm">${K.picOf(it) ? K.picOf(it) + ' ' : ''}${it.w.replace(it.c, `<b>${it.c}</b>`)}</span>`, say: `${it.w}的${it.c}`, sayB: it.w })); }
        else if (s.kind === 'char') { ask = '把國字和它的注音配成一對'; items = K.sample(s.data.filter((x, i, a) => a.findIndex(y => y.z === x.z) === i), pairsN).map(it => ({ k: it.c, a: `<span class="zhc">${it.c}</span>`, b: `<span class="zy sm">${it.z}</span>`, say: `${it.w}的${it.c}`, sayB: '' })); }
        else if (s.kind === 'pair') { ask = `把${s.rel}詞配成一對`; items = K.sample(s.data, pairsN).map(it => ({ k: it[0], a: `<span class="zhc">${it[0]}</span>`, b: `<span class="zhc">${it[1]}</span>`, say: it[0], sayB: it[1] })); }
        else { ask = '把成語和它的意思配成一對'; items = K.sample(s.data, pairsN).map(it => ({ k: it.i, a: `<span class="zhc xs">${it.i}</span>`, b: `<span class="zhs xs">${it.m}</span>`, say: '' })); }
        top.replaceChildren(h('div', 'q-ask', { text: ask })); A.speak(ask);
        await K.ui.memory(grid, ctx, p, items, () => ctx.progress(++done, total));
        await ctx.wait(600);
      }
      ctx.done();
    }
  };

  K.games.c7 = {
    id: 'c7', subj: 'zh', app: true, name: '句子修理店', icon: '🔧', cog: '語序／語用', kinds: [], accept: s => s.kind === 'zsent' || s.id === 'zh-punct', n: 6,
    desc: '句子壞掉了！把它排回通順的樣子。',
    async start(root, ctx) {
      const top = h('div', 'g-top'), ans = h('div', 'e4-ans'), bank = h('div', 'tiles'), go = h('button', 'btn pri go', { text: '✔ 修好了' }), work = h('div', 'quiz-work');
      root.append(top, ans, bank, go, work);
      for (let i = 0; i < ctx.total && ctx.alive; i++) {
        const p = ctx.pick(), t0 = Date.now();
        const show = on => { ans.style.display = bank.style.display = on ? '' : 'none'; go.style.visibility = 'hidden'; work.replaceChildren(); };
        if (p.skill.kind !== 'zsent') {
          show(false); const q = K.mcq(p.skill, { n: 3 }); top.replaceChildren(K.ui.prompt(q)); K.sayQ(q);
          const r = await K.ui.choice(work, q); if (!ctx.alive) return;
          await ctx.report(p, r.ok, r.ms, r); continue;
        }
        show(true);
        const it = K.pi(p.skill), parts = it.parts, right = it.ok[0]; let tries = 0;
        top.replaceChildren(K.ui.prompt({ ask: '把詞語排成通順的句子', say: ctx.grade <= 2 ? right : '' })); if (ctx.grade <= 2) A.speak('把詞語排成通順的句子。' + right, 'zh-TW');
        ans.replaceChildren(); ans.className = 'e4-ans'; delete ans.dataset.lock;
        const upd = () => go.style.visibility = ans.children.length >= parts.length ? 'visible' : 'hidden';
        bank.replaceChildren(...K.shuffle(parts).map(w => { const b = h('button', 'tile word zh', { text: w }); b.onclick = () => { if (ans.dataset.lock) return; A.sfx('tap'); (b.parentNode === bank ? ans : bank).append(b); upd(); }; return b; }));
        const ok = await new Promise(res => go.onclick = () => {
          if (ans.dataset.lock) return;
          const cur = [...ans.children].map(b => b.textContent).join('');
          if (it.ok.includes(cur)) { ans.dataset.lock = 1; return res(tries === 0); } // 接受白名單裡的任何一種通順語序
          tries++; A.sfx('bad'); shake(ans);
          if (tries === 1) { K.ui.hint(`念念看順不順？句子的開頭是「${parts[0]}」`, true); [...ans.children, ...bank.children].forEach(b => b.classList.toggle('hint', b.textContent === parts[0])); }
          else { ans.dataset.lock = 1; ans.replaceChildren(...parts.map(w => h('span', 'tile word zh show', { text: w }))); res(false); }
        });
        K.ui.hint(null); go.style.visibility = 'hidden'; ans.classList.add(ok ? 'right' : 'shown'); A.sfx(ok || tries === 1 ? 'ok' : 'tap'); A.speak([...ans.children].map(b => b.textContent).join('') || right);
        await ctx.wait(ok ? 1600 : 2600);
        await ctx.report(p, ok, Date.now() - t0, { hint: tries > 0, fixed: !ok && tries === 1 });
      }
      ctx.done();
    }
  };
})();
