'use strict';
// 英文 5 款：E1 氣球（辨識）E2 翻翻樂（回憶）E3 拼字工廠（產出）E4 句子積木（應用）E5 聽力跑酷（理解）
(() => {
  const K = KL, h = K.h, A = K.audio;
  const enw = (w, c = '') => `<span class="enw ${c}">${w}</span>`;

  K.games.e1 = {
    id: 'e1', subj: 'en', name: '字母音氣球', icon: '🎈', cog: '辨識', kinds: ['letter', 'lsound', 'vocab', 'phon'], n: 8,
    desc: '聽聲音，點破正確的氣球！',
    async start(root, ctx) {
      const top = h('div', 'g-top'), sky = h('div', 'e1-sky'), combo = h('div', 'combo');
      root.append(top, sky, combo);
      const dur = Math.max(7, 12 - ctx.grade); let cb = 0;
      for (let i = 0; i < ctx.total && ctx.alive; i++) {
        const p = ctx.pick(), q = K.mcq(p.skill, { n: Math.min(6, ctx.nOpts + (ctx.grade > 3 ? 1 : 0)), mode: 'listen' });
        top.replaceChildren(K.ui.prompt(q)); sky.replaceChildren(); delete sky.dataset.lock; K.sayQ(q);
        const t0 = Date.now();
        const good = await new Promise(res => q.opts.forEach((o, j) => {
          const b = h('button', 'balloon c' + j % 6, { html: `<span>${o}</span>`, style: `left:${(j + .5) / q.opts.length * 100}%;animation-duration:${dur + j % 3}s;animation-delay:-${(dur * (.3 + Math.random() * .25)).toFixed(1)}s` });
          b.onclick = () => {
            if (sky.dataset.lock) return; sky.dataset.lock = 1;
            const ok = j === q.ans;
            if (ok) { b.classList.add('pop'); A.sfx('pop'); A.sfx('ok'); }
            else { b.classList.add('wrong'); sky.children[q.ans].classList.add('glow'); A.sfx('bad'); }
            res(ok);
          };
          sky.append(b);
        }));
        const ms = Date.now() - t0;
        cb = good ? cb + 1 : 0; combo.textContent = cb >= 2 ? `🔥 連續答對 ${cb}！` : '';
        await ctx.wait(good ? 700 : 1800);
        await ctx.report(p, good, ms);
      }
      ctx.done();
    }
  };

  K.games.e2 = {
    id: 'e2', subj: 'en', name: '單字翻翻樂', icon: '🃏', cog: '回憶', kinds: ['vocab', 'letter'], n: 8,
    desc: '翻開卡片，找出一對的好朋友！',
    async start(root, ctx) {
      const pairsN = ctx.grade <= 2 ? 4 : ctx.grade <= 4 ? 6 : 8, boards = ctx.grade <= 2 ? 2 : 1, total = pairsN * boards; let done = 0;
      const top = h('div', 'g-top', null, h('div', 'q-ask', { text: '翻開兩張卡片，找出一對！' })), grid = h('div', 'mgrid');
      root.append(top, grid);
      for (let b = 0; b < boards && ctx.alive; b++) {
        const p = ctx.pick(), s = p.skill;
        const items = s.kind === 'letter'
          ? K.sample([...s.data], pairsN).map(L => ({ k: L, a: enw(L), b: enw(L.toLowerCase()), say: L }))
          : K.sample(s.data, pairsN).map(it => ({ k: it.w, a: K.face(it), b: enw(it.w, 'sm'), say: it.w }));
        const cards = K.shuffle(items.flatMap(it => [{ it, html: it.a }, { it, html: it.b }]));
        const land = root.clientWidth > root.clientHeight, n = cards.length;
        grid.style.setProperty('--c', land ? (n > 12 ? 8 : n > 8 ? 6 : 4) : (n > 12 ? 4 : n > 8 ? 3 : 2) + (n > 8 ? 0 : 0));
        grid.replaceChildren();
        await new Promise(res => {
          let open = [], lock = false, left = items.length; const seen = new Set(), miss = {};
          cards.forEach(c => {
            const el = c.el = h('button', 'mcard', null, h('span', 'mc-f', { text: '❓' }), h('span', 'mc-b', { html: c.html }));
            el.onclick = async () => {
              if (lock || el.classList.contains('on')) return;
              el.classList.add('on'); A.sfx('tap'); A.speak(c.it.say, 'en-US'); open.push(c);
              if (open.length < 2) return;
              lock = true; const [x, y] = open; open = [];
              if (x.it === y.it) {
                await ctx.wait(450); x.el.classList.add('ok'); y.el.classList.add('ok'); A.sfx('ok');
                done++; ctx.progress(done, total);
                await ctx.report(p, (miss[x.it.k] || 0) <= 1, 3000);
                lock = false; if (!--left) res();
              } else {
                const partner = cards.find(o => o.it === x.it && o !== x);
                if (seen.has(partner)) miss[x.it.k] = (miss[x.it.k] || 0) + 1; // 看過卻沒配成 → 還沒記住
                seen.add(x); seen.add(y);
                await ctx.wait(1000); x.el.classList.remove('on'); y.el.classList.remove('on'); lock = false;
              }
            };
            grid.append(el);
          });
        });
        await ctx.wait(600);
      }
      ctx.done();
    }
  };

  K.games.e3 = {
    id: 'e3', subj: 'en', name: '拼字工廠', icon: '🏭', cog: '產出', kinds: ['phon', 'vocab'], n: 6,
    desc: '聽單字，把字母一個一個拼出來！',
    async start(root, ctx) {
      const g = ctx.grade, maxLen = [4, 4, 5, 6, 7, 8, 10][g], nd = [0, 0, 2, 3, 3, 4, 4][g];
      const okW = x => /^[a-z]+$/i.test(x.w) && x.w.length >= 2 && x.w.length <= maxLen;
      const belt = h('div', 'e3-belt'), slots = h('div', 'e3-slots'), tiles = h('div', 'tiles');
      root.append(belt, slots, tiles);
      for (let i = 0; i < ctx.total && ctx.alive; i++) {
        let p, ws, tries = 0;
        do { p = ctx.pick(); ws = p.skill.data.filter(okW); } while (!ws.length && ++tries < 12);
        if (!ws.length) { p = { skill: K.skill['en-animals'] }; ws = p.skill.data.filter(okW); }
        const it = K.pick(ws), word = it.w, t0 = Date.now(); let pos = 0, mist = 0, here = 0;
        const sayIt = () => A.speak(word, 'en-US');
        belt.replaceChildren(h('div', 'e3-item', { html: K.face(it) + (it.e && g >= 3 ? `<small>${it.zh}</small>` : '') }), h('button', 'q-snd', { text: '🔊', onclick: sayIt }));
        belt.classList.remove('ship'); void belt.offsetWidth; belt.classList.add('in'); sayIt();
        slots.replaceChildren(...[...word].map(() => h('span', 'slot')));
        const fill = () => { slots.children[pos].textContent = word[pos]; slots.children[pos].classList.add('fill'); pos++; here = 0; };
        if (g <= 1) fill(); // 小一給首字母
        const rest = [...word.slice(pos)], abc = 'abcdefghijklmnopqrstuvwxyz';
        const extra = K.sample([...abc].filter(c => !word.toLowerCase().includes(c)), nd);
        await new Promise(res => {
          tiles.replaceChildren(...K.shuffle(rest.concat(extra)).map(ch => {
            const b = h('button', 'tile', { html: enw(ch) });
            b.onclick = () => {
              if (b.classList.contains('used') || pos >= word.length) return;
              if (ch === word[pos]) { b.classList.add('used'); A.sfx('tap'); fill(); if (pos >= word.length) res(); }
              else {
                mist++; here++; A.sfx('bad'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
                if (here >= 2) { const hint = [...tiles.children].find(t => !t.classList.contains('used') && t.textContent === word[pos]); if (hint) hint.classList.add('hint'); }
              }
              [...tiles.children].forEach(t => t !== b && pos < word.length && t.textContent !== word[pos] && t.classList.remove('hint'));
            };
            return b;
          }));
        });
        A.sfx('ok'); slots.classList.add('done'); sayIt();
        belt.append(h('div', 'e3-zh', { text: `${word} ＝ ${it.zh} 📦` }));
        await ctx.wait(1400); belt.classList.add('ship'); slots.classList.remove('done');
        await ctx.report(p, mist === 0, Date.now() - t0);
      }
      ctx.done();
    }
  };

  K.games.e4 = {
    id: 'e4', subj: 'en', name: '句子積木', icon: '🧱', cog: '應用', kinds: ['sentence'], n: 6,
    desc: '把單字積木排成正確的句子！',
    async start(root, ctx) {
      const top = h('div', 'g-top'), ans = h('div', 'e4-ans'), bank = h('div', 'tiles'), go = h('button', 'btn pri go', { text: '✔ 排好了' });
      root.append(top, ans, bank, go);
      for (let i = 0; i < ctx.total && ctx.alive; i++) {
        const p = ctx.pick(), it = K.pick(p.skill.data), words = it.s.split(' '), t0 = Date.now(); let tries = 0;
        const sayIt = () => A.speak(it.s, 'en-US');
        const pool = words.slice();
        if (ctx.grade >= 5) { const o = K.pick(p.skill.data.filter(x => x !== it)).s.split(' ').filter(w => !words.includes(w)); if (o.length) pool.push(K.pick(o)); }
        top.replaceChildren(h('div', 'q-box', null, h('div', 'q-ask', { text: '排出這句話：' }), h('div', 'q-row', null, h('div', 'q-main', { html: `<span class="zhs">${it.zh}</span>` }), h('button', 'q-snd', { text: '🔊', onclick: sayIt }))));
        if (ctx.grade <= 4) sayIt();
        ans.replaceChildren(); ans.className = 'e4-ans'; go.style.visibility = 'hidden';
        const upd = () => go.style.visibility = ans.children.length >= words.length ? 'visible' : 'hidden';
        bank.replaceChildren(...K.shuffle(pool).map(w => {
          const b = h('button', 'tile word', { html: enw(w, 'sm') });
          b.onclick = () => { if (ans.dataset.lock) return; A.sfx('tap'); (b.parentNode === bank ? ans : bank).append(b); upd(); };
          return b;
        }));
        delete ans.dataset.lock;
        const ok = await new Promise(res => {
          go.onclick = () => {
            if (ans.dataset.lock) return;
            const cur = [...ans.children].map(b => b.textContent).join(' ');
            if (cur === it.s) { ans.dataset.lock = 1; res(tries === 0); }
            else {
              tries++; A.sfx('bad'); ans.classList.remove('shake'); void ans.offsetWidth; ans.classList.add('shake');
              if (tries >= 2) { ans.dataset.lock = 1; ans.replaceChildren(...words.map(w => h('span', 'tile word show', { html: enw(w, 'sm') }))); res(false); }
            }
          };
        });
        go.style.visibility = 'hidden'; ans.classList.add(ok ? 'right' : 'shown'); if (ok) A.sfx('ok'); sayIt();
        await ctx.wait(ok ? 1500 : 2600);
        await ctx.report(p, ok, Date.now() - t0);
      }
      ctx.done();
    }
  };

  K.games.e5 = {
    id: 'e5', subj: 'en', name: '聽力冒險跑酷', icon: '🏃', cog: '理解', kinds: ['vocab', 'prep', 'sentence', 'cloze', 'read'], n: 8,
    desc: '聽指令，選對的門才能繼續跑！',
    async start(root, ctx) {
      const top = h('div', 'g-top'), stage = h('div', 'e5-stage'), doors = h('div', 'e5-doors'), runner = h('div', 'e5-runner', { text: '🏃' });
      stage.append(h('div', 'e5-sky', { text: '☁️　　　☁️　　☁️' }), doors, h('div', 'e5-ground'), runner);
      root.append(top, stage);
      for (let i = 0; i < ctx.total && ctx.alive; i++) {
        const p = ctx.pick(), q = K.mcq(p.skill, { n: ctx.grade <= 1 ? 2 : 3, mode: 'listen' });
        doors.replaceChildren(); top.replaceChildren(); runner.style.left = '8%'; stage.classList.add('run');
        await ctx.wait(900); stage.classList.remove('run');
        top.replaceChildren(K.ui.prompt(q)); K.sayQ(q);
        const t0 = Date.now();
        const good = await new Promise(res => q.opts.forEach((o, j) => {
          const d = h('button', 'door', { html: o });
          d.onclick = () => {
            if (doors.dataset.lock) return; doors.dataset.lock = 1;
            const ok = j === q.ans; runner.style.left = (d.offsetLeft + d.offsetWidth / 2 - 30) + 'px';
            setTimeout(() => {
              A.sfx(ok ? 'ok' : 'bad'); d.classList.add(ok ? 'open' : 'bump');
              if (!ok) doors.children[q.ans].classList.add('open', 'show');
              res(ok);
            }, 500);
          };
          doors.append(d);
        }));
        const ms = Date.now() - t0;
        await ctx.wait(good ? 800 : 1900); delete doors.dataset.lock;
        await ctx.report(p, good, ms);
      }
      ctx.done();
    }
  };
})();
