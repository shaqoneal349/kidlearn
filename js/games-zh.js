'use strict';
// 國語 5 款：C1 注音拼讀列車 C2 筆順小畫家 C3 部件拼字工坊 C4 錯字抓抓樂 C5 詞語接龍擂台
(() => {
  const K = KL, h = K.h, A = K.audio;
  const shake = el => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
  const sayC = it => A.speak(`${it.c}。${it.w}的${it.c}。`);

  K.games.c1 = {
    id: 'c1', subj: 'zh', name: '注音拼讀列車', icon: '🚂', cog: '辨識／產出', kinds: ['bpmf', 'tone', 'syl', 'char', 'poly'], n: 8,
    desc: '聽聲音，把注音車廂掛上火車！',
    async start(root, ctx) {
      const top = h('div', 'g-top'), work = h('div', 'c1-work');
      root.append(top, work);
      for (let i = 0; i < ctx.total && ctx.alive; i++) {
        const p = ctx.pick(), s = p.skill, t0 = Date.now(); let ok, info;
        work.replaceChildren();
        if (s.kind !== 'syl') {
          const q = K.mcq(s, { n: ctx.nOpts + (s.kind === 'bpmf' && ctx.L.sub.zh > 1 ? 1 : 0), mode: 'zy' });
          top.replaceChildren(K.ui.prompt(q)); K.sayQ(q);
          info = await K.ui.choice(work, q, { cls: 'cars' }); ok = info.ok;
        } else {
          const it = K.pick(s.data), sp = K.zySplit(it.z), need = sp.syms.concat(s.tone && sp.tone !== 'ˉ' ? [sp.tone] : []);
          const q = { ask: '聽聲音，照順序把車廂掛上去', say: `${it.c}。${it.w}的${it.c}。` };
          top.replaceChildren(K.ui.prompt(q)); K.sayQ(q);
          const train = h('div', 'train', null, h('span', 'loco', { text: '🚂' }), need.map(() => h('span', 'car')));
          const extra = K.sample(K.INITIALS.concat(K.FINALS).filter(x => !need.includes(x)), 2 + Math.min(2, ctx.L.sub.zh));
          const tones = s.tone ? ['ˊ', 'ˇ', 'ˋ'].filter(t => !need.includes(t)) : [];
          const tiles = h('div', 'tiles'); let pos = 0, mist = 0, here = 0;
          work.append(train, tiles);
          await new Promise(res => tiles.append(...K.shuffle(need.concat(extra)).concat(tones).map(sym => {
            const b = h('button', 'tile zyt' + ('ˊˇˋ'.includes(sym) ? ' tn' : ''), { text: sym });
            b.onclick = () => {
              if (b.classList.contains('used') || pos >= need.length) return;
              if (sym === need[pos]) {
                b.classList.add('used'); A.sfx('tap'); const car = train.children[pos + 1]; car.textContent = sym; car.classList.add('fill'); pos++; here = 0;
                [...tiles.children].forEach(t => t.classList.remove('hint'));
                if (pos >= need.length) res();
              } else {
                mist++; here++; A.sfx('bad'); shake(b);
                if (here >= 2) { const hint = [...tiles.children].find(t => !t.classList.contains('used') && t.textContent === need[pos]); if (hint) hint.classList.add('hint'); }
              }
            };
            return b;
          })));
          ok = mist === 0; A.sfx('ok'); sayC(it);
          work.append(h('div', 'c1-ans', { html: `<span class="zy">${it.z}</span> <span class="zhc">${it.c}</span> <small>${it.w}</small>` }));
          await ctx.wait(1100); train.classList.add('go'); await ctx.wait(900);
        }
        if (!ctx.alive) return;
        await ctx.report(p, ok, Date.now() - t0, info);
      }
      ctx.done();
    }
  };

  K.games.c2 = {
    id: 'c2', subj: 'zh', name: '筆順小畫家', icon: '🖌️', cog: '產出／動作記憶', kinds: ['char'], n: 5,
    desc: '跟著筆順，一筆一畫把字寫出來！',
    async start(root, ctx) {
      const top = h('div', 'g-top'), work = h('div', 'c2-work');
      root.append(top, work);
      const HZ = K.hanzi || {};
      for (let i = 0; i < ctx.total && ctx.alive; i++) {
        let p, pool, tries = 0;
        do { p = ctx.pick(); pool = p.skill.data.filter(x => HZ[x.c]); } while (!pool.length && ++tries < 10);
        if (!pool.length || !window.HanziWriter) { work.append(h('div', 'm4-msg wrong', { text: '筆順資料載入失敗' })); await ctx.wait(1500); break; }
        const it = K.pick(pool), t0 = Date.now(), st = ctx.L.skills[p.skill.id];
        const outline = ctx.grade <= 2 || !st || st.r < 4; // 低年級與新字：描紅；之後：默寫
        top.replaceChildren(K.ui.prompt({ ask: outline ? '看完示範，跟著描一次' : '不看提示，把字寫出來', prompt: `<span class="zy">${it.z}</span><span class="zhs">${it.w}</span>`, say: `${it.w}的${it.c}` }));
        sayC(it);
        const S = Math.max(220, Math.min(root.clientWidth - 32, root.clientHeight - 210, 440));
        const box = h('div', 'c2-box', { style: `width:${S}px;height:${S}px` }), replay = h('button', 'btn', { text: '👀 看筆順' });
        work.replaceChildren(box, replay);
        const w = HanziWriter.create(box, it.c, {
          width: S, height: S, padding: S * .06, showCharacter: false, showOutline: outline,
          strokeColor: '#1f2937', outlineColor: '#d6d3d1', drawingColor: '#dc2626', drawingWidth: Math.max(16, S / 14),
          highlightColor: '#16a34a', showHintAfterMisses: outline ? 2 : 3, strokeAnimationSpeed: 1.2, delayBetweenStrokes: 180,
          charDataLoader: (c, done) => done(HZ[c])
        });
        let peeks = 0, busy = false;
        const quiz = () => new Promise(res => w.quiz({ onComplete: sm => res(sm.totalMistakes) }));
        replay.disabled = true;
        if (outline) { await w.animateCharacter(); if (!ctx.alive) return; await w.hideCharacter(); }
        const mist = await new Promise(res => {
          quiz().then(res); replay.disabled = false;
          replay.onclick = async () => { if (busy) return; busy = true; peeks++; w.cancelQuiz(); await w.animateCharacter(); await w.hideCharacter(); busy = false; quiz().then(res); };
        });
        replay.disabled = true;
        if (!ctx.alive) return;
        const n = HZ[it.c].strokes.length, ok = mist <= Math.ceil(n * .25) && (outline || peeks === 0);
        A.sfx('ok'); box.classList.add('done'); work.append(h('div', 'c1-ans', { html: `<span class="zhc">${it.c}</span> <small>${it.w}　共 ${n} 畫</small>` }));
        await ctx.wait(1300);
        await ctx.report(p, ok, Date.now() - t0, { hint: peeks > 0 });
      }
      ctx.done();
    }
  };

  K.games.c3 = {
    id: 'c3', subj: 'zh', name: '部件拼字工坊', icon: '🧩', cog: '結構理解', kinds: ['comp', 'radical', 'phonetic'], n: 6,
    desc: '把部件組合起來，變出一個字！',
    async start(root, ctx) {
      const top = h('div', 'g-top'), work = h('div', 'c3-work');
      root.append(top, work);
      for (let i = 0; i < ctx.total && ctx.alive; i++) {
        const p = ctx.pick(), s = p.skill, t0 = Date.now(); let ok, info;
        work.replaceChildren();
        if (s.kind !== 'comp') {
          const q = K.mcq(s, { n: ctx.nOpts }); top.replaceChildren(K.ui.prompt(q)); K.sayQ(q);
          info = await K.ui.choice(work, q); ok = info.ok;
        } else {
          const it = K.pick(s.data), tx = `拼出「${it.w}」的「${it.c}」`;
          const q = { ask: '選出正確的部件', prompt: `<span class="zhs">拼出</span><span class="zhc tgt">${it.c}</span>`, say: tx };
          top.replaceChildren(K.ui.prompt(q)); K.sayQ(q);
          const others = K.uniq(s.data.flatMap(x => x.p)).filter(x => !it.p.includes(x));
          const slots = h('div', 'c3-slots', null, it.p.map(() => h('button', 'slot big'))), tiles = h('div', 'tiles');
          let mist = 0;
          work.append(slots, tiles);
          ok = await new Promise(res => {
            const check = () => {
              const cur = [...slots.children].map(x => x.textContent);
              if (cur.some(x => !x)) return;
              if (cur.slice().sort().join() === it.p.slice().sort().join()) return res(mist === 0);
              mist++; A.sfx('bad'); shake(slots);
              setTimeout(() => { [...slots.children].forEach(sl => sl.click()); if (mist >= 2) [...tiles.children].forEach(t => it.p.includes(t.textContent) && t.classList.add('hint')); }, 500);
            };
            tiles.append(...K.shuffle(it.p.concat(K.sample(others, 3))).map(part => {
              const b = h('button', 'tile zhp', { text: part });
              b.onclick = () => {
                const sl = [...slots.children].find(x => !x.textContent);
                if (!sl || b.classList.contains('used')) return;
                A.sfx('tap'); b.classList.add('used'); sl.textContent = part; sl._b = b; check();
              };
              return b;
            }));
            [...slots.children].forEach(sl => sl.onclick = () => { if (sl._b) { sl._b.classList.remove('used'); sl._b = null; sl.textContent = ''; } });
          });
          A.sfx('ok'); A.speak(`${it.w}的${it.c}`);
          work.replaceChildren(h('div', 'c3-alive', { html: `<span class="zhc">${it.c}</span><small>${it.p.join(' ＋ ')}　${it.w}</small>` }));
          await ctx.wait(1500);
        }
        if (!ctx.alive) return;
        await ctx.report(p, ok, Date.now() - t0, info);
      }
      ctx.done();
    }
  };

  K.games.c4 = {
    id: 'c4', subj: 'zh', app: true, name: '錯字抓抓樂', icon: '🔍', cog: '辨識／應用', kinds: ['fill', 'poly'], n: 8,
    desc: '句子裡藏了錯字，把它抓出來！',
    async start(root, ctx) {
      const top = h('div', 'g-top'), work = h('div', 'c4-work');
      root.append(top, work);
      for (let i = 0; i < ctx.total && ctx.alive; i++) {
        const p = ctx.pick(), s = p.skill, t0 = Date.now(); let ok, info;
        work.replaceChildren();
        const it = s.kind === 'fill' ? K.pick(s.data) : null;
        if (!it || ctx.grade <= 2 || s.g <= 2 || it.a.length > 1 || Math.random() < .3) {
          const q = K.mcq(s, { n: ctx.nOpts }); top.replaceChildren(K.ui.prompt(q)); K.sayQ(q);
          info = await K.ui.choice(work, q); ok = info.ok;
        } else { // 抓錯字：先點出錯字，再選正確的字
          const wrong = K.pick(it.o), idx = it.s.indexOf('＿'), text = it.s.replace('＿', wrong);
          top.replaceChildren(K.ui.prompt({ ask: '有一個字寫錯了，把它點出來！' }));
          const sent = h('div', 'c4-sent'); let miss = 0;
          work.append(sent);
          const found = await new Promise(res => [...text].forEach((ch, j) => {
            const b = h('button', 'c4-ch', { text: ch });
            if (/[，。！？、]/.test(ch)) b.disabled = true;
            b.onclick = () => {
              if (sent.dataset.lock) return;
              if (j === idx) { sent.dataset.lock = 1; b.classList.add('caught'); A.sfx('pop'); res(miss === 0); }
              else { miss++; A.sfx('bad'); shake(b); if (miss >= 2) { sent.dataset.lock = 1; sent.children[idx].classList.add('caught'); res(false); } }
            };
            sent.append(b);
          }));
          const q = K.mkq({ ask: '應該是哪一個字？' }, `<span class="zhc">${it.a}</span>`, it.o.map(x => `<span class="zhc">${x}</span>`), 4);
          top.replaceChildren(K.ui.prompt(q));
          const r = await K.ui.choice(work, q);
          ok = found && r.ok; info = r;
          sent.children[idx].textContent = it.a; sent.children[idx].classList.add('fixed');
          await ctx.wait(700);
        }
        if (!ctx.alive) return;
        await ctx.report(p, ok, Date.now() - t0, info);
      }
      ctx.done();
    }
  };

  K.games.c5 = {
    id: 'c5', subj: 'zh', name: '詞語接龍擂台', icon: '🥋', cog: '詞彙擴展', kinds: ['mc', 'pair', 'idiom', 'chain'], n: 8,
    desc: '小狐狸出題，你來接招！',
    async start(root, ctx) {
      const foe = h('div', 'c5-foe', null, h('span', 'c5-face', { text: '🦊' }), h('div', 'c5-bubble')), work = h('div', 'c5-work'), score = h('div', 'combo');
      root.append(foe, work, score); let pts = 0;
      const cheer = ['好厲害！', '接得漂亮！', '你真會！', '再來一題！'], soft = ['沒關係，記起來了！', '這題有點難，再試試！'];
      for (let i = 0; i < ctx.total && ctx.alive; i++) {
        const p = ctx.pick(), q = K.mcq(p.skill, { n: ctx.nOpts });
        foe.lastChild.replaceChildren(K.ui.prompt(q)); foe.firstChild.textContent = '🦊'; K.sayQ(q);
        work.replaceChildren();
        const r = await K.ui.choice(work, q);
        if (r.ok) pts++;
        foe.firstChild.textContent = r.ok ? '😲' : '🤗'; score.textContent = `⭐ × ${pts}　${K.pick(r.ok ? cheer : soft)}`;
        await ctx.wait(500);
        await ctx.report(p, r.ok, r.ms, r);
      }
      ctx.done();
    }
  };
})();
