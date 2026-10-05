'use strict';
// 賽車車庫（參考 Starfall G4-5 的 Racers：答題賺金幣 → 升級車子 → 跑比賽，題目與遊戲分開的「元遊戲」）
// 金幣：在任何學習遊戲裡「第一次就答對」得 1 枚（挑戰模式 2 枚）。比賽中車子卡住時要答一題才能脫困。
(() => {
  const K = KL, h = K.h, A = K.audio, E = K.engine;
  const S = () => K.shell;
  const PARTS = [['spd', '🚀', '速度', '最高速度變快'], ['eng', '⚙️', '引擎', '起步加速變快'], ['tire', '🛞', '輪胎', '卡住後更快恢復']];
  const CARS = ['🏎️', '🚙', '🚓', '🚕', '🚒', '🛻'];
  const MAX = 5, cost = lv => 3 * (lv + 1);
  const car = () => { const L = E.L(); L.car = L.car || { spd: 0, eng: 0, tire: 0, look: '🏎️', races: 0, best: 0 }; return L.car; };
  K.garage = { open };

  function open() {
    const L = E.L(), C = car();
    const bar = v => h('span', 'gr-bar', null, [...Array(MAX)].map((_, i) => h('i', i < v ? 'on' : '')));
    const parts = PARTS.map(([k, ic, n, d]) => h('div', 'gr-part', null, h('span', 'gr-ic', { text: ic }), h('div', 'gr-pn', null, h('b', null, { text: `${n} Lv ${C[k]}` }), h('small', null, { text: d }), bar(C[k])),
      C[k] >= MAX ? h('span', 'gr-max', { text: '已滿級' }) : h('button', 'btn gr-buy' + ((L.coins || 0) >= cost(C[k]) ? ' pri' : ''), { text: `🪙 ${cost(C[k])}`, onclick: () => buy(k) })));
    const looks = h('div', 'gr-looks', null, CARS.map(c => h('button', 'gr-look' + (C.look === c ? ' on' : ''), { text: c, onclick: () => { C.look = c; K.store.save(); A.sfx('tap'); open(); } })));
    S().show(h('div', 'screen garage', null,
      h('div', 'lib-head', null, S().btn('🏠 回小島', '', S().showHome), h('h1', null, { text: '🏎️ 賽車車庫' }), h('span', 'gr-coins', { text: `🪙 ${L.coins || 0}` })),
      h('div', 'gr-show', null, h('div', 'gr-car', { text: C.look }), h('div', 'gr-floor')),
      h('p', 'sub', { text: '在學習遊戲裡第一次就答對可以得到金幣（挑戰模式加倍）。用金幣升級零件，再去比賽！' }),
      h('div', 'card', null, h('h3', null, { text: '🔧 升級零件' }), parts),
      h('div', 'card', null, h('h3', null, { text: '🎨 換一台車' }), looks),
      h('div', 'row', null, E.overLimit() ? h('p', 'sub', { text: '今天的時間到了，明天再來比賽吧！' }) : S().btn('🏁 開始比賽', 'pri big', race)),
      C.races ? h('p', 'sub', { text: `已比賽 ${C.races} 場，最好名次：第 ${C.best} 名` }) : null));
    A.speak('歡迎來到賽車車庫！用金幣升級你的賽車。');
  }
  function buy(k) {
    const L = E.L(), C = car(), c = cost(C[k]);
    if ((L.coins || 0) < c) { A.sfx('bad'); S().toast(`金幣不夠，還差 ${c - (L.coins || 0)} 枚。去學習遊戲賺金幣吧！`); return; }
    L.coins -= c; C[k]++; K.store.save(); A.sfx('star'); open();
  }
  // 比賽中的題目：從孩子目前年級、程度範圍內挑
  const pickSkill = () => { const L = E.L(); const ok = K.skills.filter(s => E.eligible(s, L) && s.g >= L.gs[s.subj] - 1 && K.mcqKinds[s.kind]); return K.pick(ok.length ? ok : K.skills.filter(s => s.g === 1 && K.mcqKinds[s.kind])); };

  function race() {
    const L = E.L(), C = car(), round = E.newRound(), game = { id: 'race', name: '賽車比賽', n: 2 };
    const vmax = 1 + C.spd * .09, acc = .018 + C.eng * .006, rec = 1 + C.tire * .25;
    const foes = K.sample(CARS.filter(c => c !== C.look), 3).map((c, i) => ({ c, x: 0, v: 0, vm: .95 + i * .07 + Math.random() * .08 }));
    const me = { c: C.look, x: 0, v: 0 }, all = [me].concat(foes), lanes = all.map(r => { const el = h('span', 'rc-car', { text: r.c }); r.el = el; return h('div', 'rc-lane', null, el); });
    const rocks = [33, 66]; let hit = 0, pedal = false, stopped = false, alive = true, done = false, t0 = performance.now(), last = t0;
    const timeEl = h('span', 'rc-time', { text: '0.0 秒' }), msg = h('div', 'rc-msg', { text: '按住踏板就會前進！' });
    const go = h('button', 'rc-go', { text: '踩油門 ▶' }), quiz = h('div', 'rc-quiz');
    S().show(h('div', 'gs race', null, h('div', 'gbar', null, h('button', 'ib', { text: '🏳️', 'aria-label': '離開', onclick: () => { alive = false; A.stop(); open(); } }), h('div', 'gname', { text: '🏁 賽車比賽' }), timeEl),
      h('div', 'rc-track', null, rocks.map(r => h('span', 'rc-rock', { text: '🪨', style: `left:${r}%` })), h('span', 'rc-flag', { text: '🏁' }), lanes), msg, go, quiz));
    S().setCur({ exit() { alive = false; } }); K.cur = { grade: Math.min(...Object.values(L.gs)), used: round.used };
    const down = e => { e.preventDefault(); pedal = true; go.classList.add('on'); }, up = () => { pedal = false; go.classList.remove('on'); };
    go.addEventListener('pointerdown', down); go.addEventListener('pointerup', up); go.addEventListener('pointerleave', up); go.addEventListener('pointercancel', up);
    A.speak('按住踏板就會前進！車子卡住的時候，答對題目就能修好。');
    async function stuck() {
      stopped = true; up(); me.v = 0; A.sfx('hit'); msg.textContent = '💥 撞到石頭了！答對題目把車修好';
      const s = pickSkill(), q = K.mcq(s, { n: 3 });
      const top = h('div', 'g-top'), work = h('div', 'quiz-work'); quiz.replaceChildren(h('div', 'groot', null, top, work)); quiz.classList.add('on');
      top.replaceChildren(K.ui.prompt(q)); K.sayQ(q);
      const r = await K.ui.choice(work, q, { noFull: true });
      if (!alive) return;
      E.report(game, round, s, r.ok, r.ms, false, r);
      quiz.classList.remove('on'); quiz.replaceChildren();
      me.v = r.ok ? vmax * 1.3 : r.fixed ? vmax * .6 * rec : vmax * .3 * rec; // 答對：渦輪加速
      msg.textContent = r.ok ? '🔧 修好了！渦輪加速！' : '🔧 修好了，慢慢加速…';
      stopped = false; last = performance.now();
    }
    const frame = now => {
      if (!alive || done) return;
      const dt = Math.min(50, now - last) / 16.7; last = now;
      if (!stopped) {
        me.v = pedal ? Math.min(Math.max(me.v, 0) + acc * dt, Math.max(vmax, me.v - .01 * dt)) : Math.max(0, me.v - .02 * dt);
        me.x += me.v * .12 * dt;
        if (hit < rocks.length && me.x >= rocks[hit]) { me.x = rocks[hit]; hit++; stuck(); }
        foes.forEach(f => { f.v = Math.min(f.vm, f.v + .015 * dt); f.x += f.v * .12 * dt * (.92 + Math.random() * .16); });
        timeEl.textContent = ((now - t0) / 1000).toFixed(1) + ' 秒';
      }
      all.forEach(r => r.el.style.left = `calc(${Math.min(100, r.x)}% - ${Math.min(100, r.x) * .4}px)`);
      if (me.x >= 100) return finish(now);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    function finish(now) {
      done = true;
      const place = 1 + foes.filter(f => f.x >= 100 || f.x > me.x).length, prize = [5, 3, 2, 1][place - 1];
      L.coins = (L.coins || 0) + prize; C.races++; C.best = C.best ? Math.min(C.best, place) : place;
      if (round.answers.length) E.endRound(game, round); else K.store.save();
      S().setCur(null); K.cur = null;
      A.sfx('win');
      const names = ['', '第一名！🏆', '第二名！🥈', '第三名！🥉', '第四名'];
      S().show(h('div', 'screen center', null, h('div', 'result', null, h('div', 'r-stars', { text: C.look }), h('h1', null, { text: names[place] }), h('p', 'r-score', { text: `時間 ${((now - t0) / 1000).toFixed(1)} 秒` }), h('p', 'r-coin', { text: `🪙 +${prize}` }),
        h('p', 'sub', { text: place > 1 ? '升級速度和引擎，或在石頭前答對題目拿到渦輪加速，就能跑更快！' : '太快了！你是賽車冠軍！' }),
        h('div', 'row', null, S().btn('🔁 再比一場', '', E.overLimit() ? open : race), S().btn('🔧 回車庫', 'pri', open)))));
      A.speak(place === 1 ? '第一名！你是賽車冠軍！' : `你得到${names[place].replace(/[！🏆🥈🥉]/gu, '')}，再接再厲！`);
    }
  }
})();
