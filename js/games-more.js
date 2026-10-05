'use strict';
// v4 新增 2 款（參考「星芽探險」的玩法）：C9 注音組裝站（聲母／韻母／聲調逐一組出讀音）、C10 詞語連連看（兩欄配對）
(() => {
  const K = KL, h = K.h, A = K.audio;
  const shake = el => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };

  // ---------- 兩欄連連看：先點左邊，再點右邊對應的那一個 ----------
  // pairs: [{k, a, b, say, sayB, lang}]；每配對成功一組就回報一次（那一組沒配錯過才算獨立答對）
  K.ui.match = (root, ctx, p, pairs, onPair) => new Promise(res => {
    const L = h('div', 'mt-col'), R = h('div', 'mt-col'), board = h('div', 'mt-board', null, L, R);
    root.replaceChildren(board);
    let pick = null, left = pairs.length; const miss = {}, t0 = Date.now();
    const mk = (it, side) => {
      const b = h('button', 'mt-card ' + side, { html: side === 'l' ? it.a : it.b });
      b._it = it;
      b.onclick = async () => {
        if (b.classList.contains('done') || board.dataset.lock) return;
        const say = side === 'l' ? it.say : it.sayB === undefined ? it.say : it.sayB;
        if (say) A.speak(say, it.lang || 'zh-TW', { q: true });
        if (side === 'l') { L.querySelectorAll('.mt-card').forEach(x => x.classList.remove('on')); b.classList.add('on'); pick = b; A.sfx('tap'); return; }
        if (!pick) { A.sfx('tap'); K.ui.hint('先點左邊的一張，再點右邊配對的那一張。'); setTimeout(() => K.ui.hint(null), 1800); return; }
        if (pick._it === it) {
          board.dataset.lock = 1; pick.classList.remove('on'); pick.classList.add('done'); b.classList.add('done'); A.sfx('ok'); onPair && onPair();
          const ok = !miss[it.k]; pick = null;
          await ctx.report(p, ok, Date.now() - t0, { hint: !ok, fixed: !ok, want: `${K.strip(it.a)} ＝ ${K.strip(it.b)}`, wantH: `${it.a} ＝ ${it.b}`, q: { ask: '連連看', say: it.say || '' } });
          delete board.dataset.lock;
          if (!--left) { await ctx.wait(500); res(); }
        } else {
          miss[pick._it.k] = (miss[pick._it.k] || 0) + 1; A.sfx('bad'); shake(b); b.classList.add('no'); setTimeout(() => b.classList.remove('no'), 600);
          if (miss[pick._it.k] >= 2) { // 錯兩次：把正確的那張亮起來
            const right = [...R.children].find(x => x._it === pick._it); right.classList.add('hint'); setTimeout(() => right.classList.remove('hint'), 1500);
          }
        }
      };
      return b;
    };
    L.append(...pairs.map(it => mk(it, 'l')));
    R.append(...K.shuffle(pairs).map(it => mk(it, 'r')));
  });

  K.games.c10 = {
    id: 'c10', subj: 'zh', name: '詞語連連看', icon: '🔗', cog: '詞義連結', kinds: ['pair', 'idiom'], n: 8,
    desc: '先點左邊的詞語，再點右邊和它配對的那一個！',
    async start(root, ctx) {
      const n = ctx.grade <= 2 ? 3 : 4, boards = 2, total = n * boards; let done = 0;
      const top = h('div', 'g-top'), work = h('div', 'quiz-work');
      root.append(top, work);
      for (let b = 0; b < boards && ctx.alive; b++) {
        const p = ctx.pick(), s = p.skill; let items, ask;
        if (s.kind === 'pair') { ask = `把意思${s.rel}的詞語連起來`; items = K.sample(s.data.filter((x, i, a) => a.findIndex(y => y[0] === x[0] || y[1] === x[1]) === i), n).map(it => ({ k: it[0], a: `<span class="zhs">${it[0]}</span>`, b: `<span class="zhs">${it[1]}</span>`, say: it[0], sayB: it[1] })); }
        else { ask = '把成語和它的意思連起來'; items = K.sample(s.data, n).map(it => ({ k: it.i, a: `<span class="zhs">${it.i}</span>`, b: `<span class="zhs sm">${it.m}</span>`, say: it.i, sayB: it.m })); }
        top.replaceChildren(K.ui.prompt({ ask })); A.speak(ask);
        await K.ui.match(work, ctx, p, items, () => ctx.progress(++done, total));
      }
      ctx.done();
    }
  };

  // ---------- 注音組裝站：看字聽音，依序選出聲母、韻母、聲調 ----------
  const NEAR = { ㄓ: 'ㄗ', ㄗ: 'ㄓ', ㄔ: 'ㄘ', ㄘ: 'ㄔ', ㄕ: 'ㄙ', ㄙ: 'ㄕ', ㄋ: 'ㄌ', ㄌ: 'ㄋ', ㄈ: 'ㄏ', ㄏ: 'ㄈ', ㄅ: 'ㄆ', ㄆ: 'ㄅ', ㄉ: 'ㄊ', ㄊ: 'ㄉ', ㄍ: 'ㄎ', ㄎ: 'ㄍ', ㄐ: 'ㄑ', ㄑ: 'ㄐ', ㄒ: 'ㄕ', ㄖ: 'ㄌ', ㄇ: 'ㄋ', ㄣ: 'ㄥ', ㄥ: 'ㄣ', ㄢ: 'ㄤ', ㄤ: 'ㄢ', ㄧㄣ: 'ㄧㄥ', ㄧㄥ: 'ㄧㄣ', ㄨㄣ: 'ㄨㄥ', ㄨㄥ: 'ㄨㄣ', ㄛ: 'ㄜ', ㄜ: 'ㄛ', ㄟ: 'ㄞ', ㄞ: 'ㄟ', ㄠ: 'ㄡ', ㄡ: 'ㄠ', ㄧ: 'ㄩ', ㄩ: 'ㄧ', ㄧㄢ: 'ㄧㄤ', ㄧㄤ: 'ㄧㄢ', ㄨㄢ: 'ㄨㄤ', ㄨㄤ: 'ㄨㄢ', ㄧㄠ: 'ㄧㄡ', ㄧㄡ: 'ㄧㄠ' };
  const NONE = '（沒有）', TN = { 'ˉ': '一聲', 'ˊ': '二聲', 'ˇ': '三聲', 'ˋ': '四聲', '˙': '輕聲' };
  const parse = z => {
    const sp = K.zySplit(z), syms = sp.syms.join(''), ini = K.INITIALS.includes(syms[0]) ? syms[0] : '';
    return { ini: ini || NONE, fin: syms.slice(ini.length) || NONE, tone: sp.tone };
  };
  const opts = (want, pool, near, n) => K.shuffle(K.uniq([want, near].filter(Boolean).concat(K.shuffle(pool.filter(x => x !== want)))).slice(0, n));
  K.games.c9 = {
    id: 'c9', subj: 'zh', name: '注音組裝站', icon: '🛤️', cog: '拼音產出', kinds: [], accept: s => s.kind === 'syl' || (s.kind === 'char' && s.g <= 3), n: 6,
    desc: '聽一聽這個字，選出聲母、韻母和聲調，把車廂接起來！',
    async start(root, ctx) {
      const top = h('div', 'g-top'), work = h('div', 'quiz-work zb');
      root.classList.add('nozy'); // 整個遊戲都不標注音（含提示），不然會直接看到答案
      root.append(top, work);
      for (let i = 0; i < ctx.total && ctx.alive; i++) {
        const p = ctx.pick(), it = K.pi(p.skill);
        if (!it || !it.z || /[^ㄅ-ㄩˊˇˋ˙]/.test(it.z)) { i--; continue; }
        const want = parse(it.z), allFins = K.uniq(p.skill.data.map(x => x.z && parse(x.z).fin).filter(Boolean).concat(K.FINALS));
        const steps = [
          { key: 'ini', label: '聲母', choices: opts(want.ini, K.INITIALS.concat(NONE), NEAR[want.ini] || (want.ini === NONE ? K.pick(K.INITIALS) : NONE), 4) },
          { key: 'fin', label: '韻母', choices: opts(want.fin, allFins, NEAR[want.fin] || (want.fin === NONE ? K.pick(K.FINALS) : null), 4) },
          { key: 'tone', label: '聲調', choices: want.tone === '˙' ? ['ˉ', 'ˊ', 'ˋ', '˙'] : ['ˉ', 'ˊ', 'ˇ', 'ˋ'] }
        ];
        const sel = {}, t0 = Date.now(); let tries = 0, firstTry = null;
        const say = () => A.speak(`${it.c}。${it.w}的${it.c}。`, 'zh-TW', { q: true });
        top.replaceChildren(h('div', 'q-box', null, h('div', 'q-ask', { text: '這個字怎麼拼？依序選出聲母、韻母、聲調' }),
          h('div', 'q-row', null, h('div', 'q-main', null, h('span', 'zhc', { text: it.c }), h('small', 'zb-w', { text: it.w })), h('button', 'q-snd', { text: '🔊', 'aria-label': '再聽一次', onclick: say }))));
        const cars = h('div', 'zb-train', null, h('span', 'zb-eng', { text: '🚂' }), steps.map(s => h('div', 'zb-car', { 'data-k': s.key }, h('small', null, { text: s.label }), h('b', null, { text: '？' }))));
        const rows = steps.map(s => h('div', 'zb-row', null, h('span', 'zb-lbl', { text: s.label }), h('div', 'zb-opts', null, s.choices.map(c => h('button', 'zb-opt' + (s.key === 'tone' ? ' tn' : ''), { 'data-k': s.key, 'data-v': c, html: s.key === 'tone' ? `<b>${c === 'ˉ' ? '—' : c}</b><small>${TN[c]}</small>` : `<span class="zy">${c}</span>` })))));
        const go = h('button', 'btn pri go', { text: '✔ 檢查', disabled: '' });
        work.replaceChildren(cars, ...rows, go);
        const paint = () => {
          steps.forEach(s => { const car = cars.querySelector(`[data-k="${s.key}"] b`); car.textContent = sel[s.key] ? (s.key === 'tone' ? TN[sel[s.key]] : sel[s.key]) : '？'; });
          work.querySelectorAll('.zb-opt').forEach(b => b.classList.toggle('on', sel[b.dataset.k] === b.dataset.v));
          go.disabled = steps.some(s => !sel[s.key]);
        };
        work.querySelectorAll('.zb-opt').forEach(b => b.onclick = () => { if (work.dataset.lock) return; sel[b.dataset.k] = b.dataset.v; A.sfx('tap'); if (b.dataset.k !== 'tone' && b.dataset.v !== NONE && K.BPMF_FILE[b.dataset.v]) A.playFile(K.BPMF_FILE[b.dataset.v]); cars.querySelectorAll('.zb-car').forEach(c => c.classList.remove('bad')); paint(); });
        say();
        const ok = await new Promise(res => go.onclick = () => {
          if (go.disabled || work.dataset.lock) return;
          const bad = steps.filter(s => sel[s.key] !== want[s.key]);
          if (!bad.length) { work.dataset.lock = 1; cars.classList.add('ok'); A.sfx(tries ? 'star' : 'ok'); setTimeout(() => res(true), 1100); return; }
          tries++; A.sfx('bad'); shake(cars); if (tries === 1) firstTry = steps.map(st2 => sel[st2.key]); // 記下第一次拼的，給回顧用
          bad.forEach(s => cars.querySelector(`[data-k="${s.key}"]`).classList.add('bad'));
          if (tries === 1) { // 第一次錯：指出哪一節錯了，再聽一次
            K.ui.hint(`${bad.map(s => s.label).join('、')}不對喔，再聽一次「${it.c}」。`); setTimeout(say, 400);
            bad.forEach(s => delete sel[s.key]); paint(); bad.forEach(s => cars.querySelector(`[data-k="${s.key}"]`).classList.add('bad'));
          } else { // 第二次錯：公布答案
            work.dataset.lock = 1; steps.forEach(s => sel[s.key] = want[s.key]); paint(); cars.classList.add('shown');
            K.ui.hint(`「${it.c}」拼成 ${it.z.replace(/ˉ/, '')}：${steps.map(s => `${s.label} ${s.key === 'tone' ? TN[want.tone] : want[s.key]}`).join('、')}。`, true);
            setTimeout(() => res(false), 3200);
          }
        });
        K.ui.hint(null); delete work.dataset.lock;
        if (!ctx.alive) return;
        await ctx.report(p, ok && tries === 0, Date.now() - t0, { hint: tries > 0, fixed: ok && tries > 0, want: it.z, got: firstTry ? firstTry.map(v => v === 'ˉ' || v === NONE ? '' : v).join('') : '', q: { ask: '這個字怎麼拼？', prompt: `<span class="zhc">${it.c}</span> <small>${it.w}</small>`, say: `${it.c}。${it.w}的${it.c}。` } });
      }
      ctx.done();
    }
  };
})();
