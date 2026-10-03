'use strict';
// 數學 5 款：M1 數感釣魚 M2 算式賽車（流暢度）M3 小小店長（應用）M4 幾何建築師（空間）M5 數字偵探（推理）
(() => {
  const K = KL, h = K.h, A = K.audio, R = K.rand;
  const shake = el => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };

  K.games.m1 = {
    id: 'm1', subj: 'ma', name: '數感釣魚', icon: '🎣', cog: '數感', kinds: ['count', 'compare', 'arith', 'numline', 'equiv', 'clock'], n: 8,
    desc: '看題目，釣起正確的魚！',
    async start(root, ctx) {
      const top = h('div', 'g-top'), pond = h('div', 'm1-pond');
      root.append(top, pond);
      const fish = (html, i) => h('button', 'fish f' + i % 4, { html: `<span>${html}</span>`, style: `animation-delay:-${(Math.random() * 3).toFixed(1)}s` });
      for (let i = 0; i < ctx.total && ctx.alive; i++) {
        const p = ctx.pick(), s = p.skill, t0 = Date.now(); let ok, info;
        pond.replaceChildren(); pond.className = 'm1-pond';
        if (s.kind === 'compare') { // 釣起所有比 N 大／小的魚
          let N, nums, tg; const big = Math.random() < .5, max = s.data.max;
          do { N = R(Math.round(max * .2), Math.round(max * .8)); const set = new Set(); while (set.size < 6) { const v = R(0, max); if (v !== N) set.add(v); } nums = [...set]; tg = nums.filter(v => big ? v > N : v < N); } while (tg.length < 2 || tg.length > 4);
          const tx = `釣起所有比 ${N} ${big ? '大' : '小'}的魚`;
          top.replaceChildren(K.ui.prompt({ prompt: `<span class="expr long">${tx}</span>`, say: tx }));
          A.speak(tx, 'zh-TW', { q: true });
          ok = await new Promise(res => {
            let left = tg.length, mist = 0;
            nums.forEach((v, j) => {
              const f = fish(v, j);
              f.onclick = () => {
                if (f.classList.contains('caught')) return;
                if (tg.includes(v)) { f.classList.add('caught'); A.sfx('pop'); if (!--left) { A.sfx('ok'); res(mist === 0); } }
                else { mist++; A.sfx('bad'); shake(f); }
              };
              pond.append(f);
            });
          });
          await ctx.wait(700);
        } else if (s.kind === 'numline') {
          const nl = K.nlMake(s), tx = '把魚放到正確的位置';
          top.replaceChildren(K.ui.prompt({ ask: tx, prompt: `<span class="expr">🐟 → ${nl.labels[nl.t]}</span>`, say: tx }));
          A.speak(tx, 'zh-TW', { q: true }); pond.classList.add('line');
          const line = h('div', 'nl big');
          pond.append(line);
          ok = await new Promise(res => nl.labels.forEach((l, j) => {
            const tk = h('button', 'tk', { html: `<b></b><em>${nl.show(j) ? l : ''}</em>` });
            tk.onclick = () => {
              if (line.dataset.lock) return; line.dataset.lock = 1;
              const good = j === nl.t; A.sfx(good ? 'ok' : 'bad');
              tk.classList.add(good ? 'right' : 'wrong'); line.children[nl.t].classList.add('mk', 'right');
              line.children[nl.t].querySelector('em').innerHTML = nl.labels[nl.t];
              res(good);
            };
            line.append(tk);
          }));
          await ctx.wait(ok ? 800 : 1800);
        } else {
          const q = K.mcq(s, { n: ctx.nOpts + 1 });
          if (s.kind === 'arith') q.ask = '釣起答案一樣的魚';
          top.replaceChildren(K.ui.prompt(q)); K.sayQ(q);
          const els = q.opts.map(fish); pond.append(...els);
          info = await K.ui.multi(q, els, { right: 'caught', wrong: 'wrong', reveal: 'glow' }); ok = info.ok;
        }
        await ctx.report(p, ok, Date.now() - t0, info);
      }
      ctx.done();
    }
  };

  K.games.m2 = {
    id: 'm2', subj: 'ma', name: '算式賽車', icon: '🏎️', cog: '流暢度', kinds: ['arith'], n: 10,
    desc: '算得又快又對，賽車就會加速！',
    async start(root, ctx) {
      const road = h('div', 'm2-road', null, h('div', 'm2-lines'), h('div', 'm2-car', { text: '🏎️' }));
      const hud = h('div', 'm2-hud'), panel = h('div', 'm2-panel');
      root.append(hud, road, panel);
      let speed = 1, dist = 0; const best = ctx.L.best.m2 || 0;
      const setSpeed = () => { road.style.setProperty('--dur', (1 / speed).toFixed(2) + 's'); road.dataset.fast = speed > 1.8 ? 1 : 0; };
      setSpeed();
      const tick = setInterval(() => { dist += speed * 1.2; hud.textContent = `🏁 ${Math.round(dist)} 公尺` + (best ? `　⭐ 最佳 ${best}` : ''); }, 100);
      ctx.onExit(() => clearInterval(tick));
      for (let i = 0; i < ctx.total && ctx.alive; i++) {
        const p = ctx.pick(), q = K.mcq(p.skill, { n: ctx.nOpts });
        panel.replaceChildren(h('div', 'm2-q', { html: q.prompt }));
        const stg = K.engine.stage(p.skill.id), tt = ctx.L.skills[p.skill.id];
        // 小二起預設用鍵盤作答；新技能前三題先用選項當鷹架
        const useKey = ctx.grade >= 2 && !q.item.opts && q.item.ans !== undefined && (typeof q.item.ans === 'number' || /data-v/.test(q.item.ans)) && !(stg === 0 && (!tt || tt.r < 3));
        const fluent = K.engine.stage(p.skill.id) >= 1; // 新技能不比速度，熟悉之後才有加速挑戰
        const r = await (useKey ? K.ui.keypad(panel, q) : K.ui.choice(panel, q));
        speed = r.ok || r.fixed ? Math.min(3, speed + (fluent && r.ms < 4000 ? .45 : .25)) : fluent ? Math.max(.6, speed - .4) : speed; setSpeed();
        await ctx.report(p, r.ok, r.ms, r);
      }
      clearInterval(tick);
      const d = Math.round(dist); if (d > best) { ctx.L.best.m2 = d; ctx.note = `🏁 新紀錄！跑了 ${d} 公尺`; } else ctx.note = `🏁 跑了 ${d} 公尺`;
      ctx.done();
    }
  };

  K.games.m3 = {
    id: 'm3', subj: 'ma', app: true, name: '小小店長', icon: '🏪', cog: '應用', kinds: ['shop'], n: 6,
    desc: '你是小店長！幫客人算錢、找零。',
    async start(root, ctx) {
      const shop = h('div', 'm3-shop'), work = h('div', 'm3-work');
      root.append(shop, work);
      for (let i = 0; i < ctx.total && ctx.alive; i++) {
        const p = ctx.pick(), q = K.shopGen(p.skill), t0 = Date.now(), cust = K.pick(['🧒', '👧', '👨', '👩', '👵', '👴']);
        let ok, info;
        if (q.offers) {
          shop.replaceChildren(h('div', 'm3-cust', { text: cust }), h('div', 'm3-bubble', { text: q.want }));
          A.speak(q.want, 'zh-TW', { q: true });
          work.replaceChildren();
          ok = await new Promise(res => {
            const wrap = h('div', 'choices two');
            q.offers.forEach((o, j) => wrap.append(h('button', 'opt', {
              html: `<span class="zhs">${o}</span>`, onclick: e => {
                if (wrap.dataset.done) return; wrap.dataset.done = 1; const good = j === q.best; A.sfx(good ? 'ok' : 'bad');
                e.currentTarget.classList.add(good ? 'right' : 'wrong'); if (!good) wrap.children[q.best].classList.add('right', 'show');
                setTimeout(() => res(good), good ? 800 : 1800);
              }
            })));
            work.append(wrap);
          });
        } else {
          const lines = q.lines.map(l => `<div class="m3-line"><span class="em">${l.e}</span>${l.qty > 1 ? ` × ${l.qty}` : ''}<b>${l.price} 元${l.qty > 1 ? '／個' : ''}</b></div>`).join('');
          shop.replaceChildren(h('div', 'm3-cust', { text: cust }), h('div', 'm3-bubble', { html: lines + (q.note ? `<div class="m3-note">🏷️ ${q.note}</div>` : '') + (q.pay ? `<div class="m3-pay">💵 我付 ${q.pay} 元</div>` : '') }));
          A.speak((q.pay ? `客人付了 ${q.pay} 元。` : '') + q.want, 'zh-TW', { q: true });
          let sum = 0; const tray = h('div', 'm3-tray'), total = h('div', 'm3-sum', { text: '0 元' }), go = h('button', 'btn pri go', { text: '✔ 好了' });
          const upd = () => total.textContent = sum + ' 元';
          const coins = h('div', 'm3-coins', null, q.coins.map(v => h('button', 'coin v' + v, {
            text: v, onclick: () => {
              if (work.dataset.lock || tray.children.length >= 24) return; A.sfx('tap'); sum += v; upd();
              tray.append(h('button', 'coin sm v' + v, { text: v, onclick: e => { if (work.dataset.lock) return; e.currentTarget.remove(); sum -= v; upd(); A.sfx('tap'); } }));
            }
          })));
          work.replaceChildren(h('div', 'm3-want', { text: q.want }), h('div', 'm3-mid', null, tray, total), coins, go);
          delete work.dataset.lock;
          ok = await new Promise(res => go.onclick = () => {
            if (work.dataset.lock || !sum) return; work.dataset.lock = 1;
            const good = sum === q.ans; A.sfx(good ? 'ok' : 'bad');
            total.classList.add(good ? 'right' : 'wrong'); total.textContent = good ? `${sum} 元 ✔ 謝謝光臨！` : `${sum} 元 ✗　應該是 ${q.ans} 元`;
            setTimeout(() => res(good), good ? 1000 : 2200);
          });
        }
        if (!ctx.alive) return;
        await ctx.report(p, ok, Date.now() - t0, info);
      }
      ctx.done();
    }
  };

  K.games.m4 = {
    id: 'm4', subj: 'ma', name: '幾何建築師', icon: '📐', cog: '空間推理', kinds: ['shape', 'area', 'geo'], n: 6,
    desc: '認識形狀，在格子上蓋出指定的圖形！',
    async start(root, ctx) {
      const top = h('div', 'g-top'), work = h('div', 'm4-work');
      root.append(top, work);
      for (let i = 0; i < ctx.total && ctx.alive; i++) {
        const p = ctx.pick(), s = p.skill, t0 = Date.now(); let ok, info;
        work.replaceChildren();
        if (s.kind !== 'area') {
          const q = K.mcq(s, { n: ctx.nOpts }); top.replaceChildren(K.ui.prompt(q)); K.sayQ(q);
          info = await K.ui.choice(work, q); ok = info.ok;
        } else {
          const m = s.data.mode, ROWS = m === 'sym' ? 5 : 6, COLS = 6, on = new Set(), fixed = new Set();
          let tx, check;
          const box = () => { const rs = [...on].map(k => k >> 3), cs = [...on].map(k => k & 7); const w = Math.max(...cs) - Math.min(...cs) + 1, hh = Math.max(...rs) - Math.min(...rs) + 1; return { w, hh, rect: w * hh === on.size }; };
          if (m === 'area') {
            if (ctx.L.sub.ma >= 2 && Math.random() < .5) { const N = K.pick([4, 6, 8, 9, 10, 12]); tx = `塗出一個面積 ${N} 格的長方形`; check = () => on.size !== N ? `你塗了 ${on.size} 格，要 ${N} 格` : box().rect ? '' : '格數對了，但不是長方形'; }
            else { const N = R(3, 10); tx = `塗出面積是 ${N} 格的圖形`; check = () => on.size === N ? '' : `你塗了 ${on.size} 格，要 ${N} 格`; }
          } else if (m === 'perim') {
            const P = K.pick([6, 8, 10, 12, 14, 16]); tx = `塗出一個周長是 ${P} 的長方形`;
            check = () => { const b = box(); return !b.rect ? '這不是長方形喔' : 2 * (b.w + b.hh) === P ? '' : `這個長方形的周長是 ${2 * (b.w + b.hh)}，要 ${P}`; };
          } else {
            while (fixed.size < R(4, 6)) fixed.add(R(0, ROWS - 1) << 3 | R(0, 2));
            tx = '把左邊的圖形對稱到右邊';
            check = () => { for (const k of fixed) if (!on.has((k & ~7) | (5 - (k & 7)))) return '還有沒對稱到的格子'; return on.size === fixed.size ? '' : '多塗了幾格喔'; };
          }
          top.replaceChildren(K.ui.prompt({ prompt: `<span class="expr long">${tx}</span>`, say: tx })); A.speak(tx, 'zh-TW', { q: true });
          const grid = h('div', 'm4-grid' + (m === 'sym' ? ' sym' : ''), { style: `--c:${COLS};--r:${ROWS}` });
          for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            const k = r << 3 | c, cell = h('button', 'cell' + (fixed.has(k) ? ' fx' : m === 'sym' && c < 3 ? ' no' : ''));
            if (!(m === 'sym' && c < 3)) cell.onclick = () => { if (grid.dataset.lock) return; A.sfx('tap'); on.has(k) ? on.delete(k) : on.add(k); cell.classList.toggle('on'); };
            grid.append(cell);
          }
          const msg = h('div', 'm4-msg'), go = h('button', 'btn pri go', { text: '✔ 蓋好了' });
          work.append(grid, msg, go);
          ok = await new Promise(res => go.onclick = () => {
            if (grid.dataset.lock || !on.size) return; grid.dataset.lock = 1;
            const err = check(); A.sfx(err ? 'bad' : 'ok'); msg.textContent = err || '太棒了！'; msg.className = 'm4-msg ' + (err ? 'wrong' : 'right');
            setTimeout(() => res(!err), err ? 2200 : 900);
          });
        }
        if (!ctx.alive) return;
        await ctx.report(p, ok, Date.now() - t0, info);
      }
      ctx.done();
    }
  };

  K.games.m5 = {
    id: 'm5', subj: 'ma', app: true, name: '數字偵探', icon: '🕵️', cog: '推理', kinds: ['pattern', 'seq', 'balance', 'sudoku', 'chart', 'line', 'clock'], n: 6,
    desc: '找出規律、解開謎題，你是小偵探！',
    async start(root, ctx) {
      const top = h('div', 'g-top'), work = h('div', 'm5-work');
      root.append(top, work);
      for (let i = 0; i < ctx.total && ctx.alive; i++) {
        const p = ctx.pick(), s = p.skill, t0 = Date.now(); let ok, info;
        work.replaceChildren();
        if (s.kind !== 'sudoku') {
          const q = K.mcq(s, { n: ctx.nOpts }); top.replaceChildren(K.ui.prompt(q)); K.sayQ(q);
          info = await K.ui.choice(work, q); ok = info.ok;
        } else {
          const sd = K.sudoku(s.data.n), n = sd.n; let sel = null, left = 0, err = 0;
          const tx = `每一排、每一行、每個粗框裡，1 到 ${n} 只能出現一次`;
          top.replaceChildren(K.ui.prompt({ ask: tx, say: tx })); A.speak(tx, 'zh-TW', { q: true });
          const grid = h('div', 'sdk', { style: `--n:${n}` }), pal = h('div', 'sdk-pal');
          sd.puz.forEach((row, r) => row.forEach((v, c) => {
            const cell = h('button', 'sc' + (v ? ' giv' : '') + (c % sd.bw === 0 && c ? ' bl' : '') + (r % sd.bh === 0 && r ? ' bt' : ''), { text: v || '' });
            if (!v) { left++; cell.onclick = () => { if (cell.classList.contains('giv')) return; sel && sel.el.classList.remove('sel'); sel = { r, c, el: cell }; cell.classList.add('sel'); A.sfx('tap'); }; }
            grid.append(cell);
          }));
          ok = await new Promise(res => {
            for (let v = 1; v <= n; v++) pal.append(h('button', 'kp-k', {
              text: v, onclick: () => {
                if (!sel) return;
                if (sd.sol[sel.r][sel.c] === v) { sel.el.textContent = v; sel.el.classList.remove('sel'); sel.el.classList.add('giv', 'mine'); sel = null; A.sfx('ok'); if (!--left) res(err <= (n === 4 ? 1 : 3)); }
                else { err++; A.sfx('bad'); shake(sel.el); }
              }
            }));
            work.append(grid, pal);
          });
          await ctx.wait(900);
        }
        if (!ctx.alive) return;
        await ctx.report(p, ok, Date.now() - t0, info);
      }
      ctx.done();
    }
  };
})();
