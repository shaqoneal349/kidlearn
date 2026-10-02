'use strict';
// 殼層：學習者檔案、冒險島首頁與今日路線、遊戲框架、結算、複習／魔王／檢定、圖鑑與能力地圖、家長專區
(() => {
  const K = KL, h = K.h, A = K.audio, E = K.engine;
  const VERSION = '2.0.0';
  const app = () => document.getElementById('app'), ov = () => document.getElementById('overlay');
  const SUBJ = { en: { n: '英文', i: '🔤', isle: '英文島' }, ma: { n: '數學', i: '🔢', isle: '數學島' }, zh: { n: '國語', i: '📖', isle: '國語島' } };
  const AV = ['🦊', '🐼', '🐰', '🐯', '🐸', '🦄', '🐵', '🐱'];
  const GN = ['', '小一', '小二', '小三', '小四', '小五', '小六'];
  let cur = null, greeted = false, lastBreak = Date.now(), installEvt = null;

  const closeModal = () => ov().replaceChildren();
  const show = node => { if (cur) cur.exit(); A.stop(); closeModal(); app().replaceChildren(node); window.scrollTo(0, 0); };
  const modal = (node, cls = '') => ov().replaceChildren(h('div', 'modal-bg'), h('div', 'modal ' + cls, null, node));
  const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);
  const btn = (text, cls, onclick) => h('button', 'btn ' + (cls || ''), { text, onclick: e => { A.sfx('tap'); onclick(e); } });
  const lvText = (L, s) => `${GN[L.gs[s]]} ${stars(L.sub[s])}`;

  // ---------- 學習者檔案 ----------
  function showProfiles() {
    const D = K.store.data;
    const list = h('div', 'pf-list', null, D.learners.map(L => h('button', 'pf', { onclick: () => { A.sfx('tap'); D.current = L.id; K.store.save(); greeted = false; showHome(); } }, h('span', 'pf-av', { text: L.avatar }), h('span', 'pf-n', { text: L.name }))),
      h('button', 'pf add', { onclick: () => { A.sfx('tap'); addLearner(); } }, h('span', 'pf-av', { text: '➕' }), h('span', 'pf-n', { text: '新增小朋友' })));
    const scr = h('div', 'screen center', null, h('div', 'logo', { text: '🏝️' }), h('h1', 'title', { text: '小小學習家' }), h('p', 'sub', { text: '英文・數學・國語　學習冒險島' }), h('p', 'sub', { text: D.learners.length ? '誰要來冒險？' : '第一次使用，請爸爸媽媽幫忙建立檔案' }), list);
    if (installEvt) scr.append(btn('📲 安裝到主畫面', 'pri', async () => { installEvt.prompt(); installEvt = null; }));
    show(scr);
  }
  function addLearner() {
    let av = AV[0], grade = 1;
    const name = h('input', 'inp', { placeholder: '小朋友的名字', maxlength: 8 });
    const avs = h('div', 'av-row', null, AV.map(a => h('button', 'av' + (a === av ? ' on' : ''), { text: a, onclick: e => { av = a;[...avs.children].forEach(x => x.classList.remove('on')); e.currentTarget.classList.add('on'); A.sfx('tap'); } })));
    const grs = h('div', 'av-row', null, GN.slice(1).map((g, i) => h('button', 'chip' + (i === 0 ? ' on' : ''), { text: g, onclick: e => { grade = i + 1;[...grs.children].forEach(x => x.classList.remove('on')); e.currentTarget.classList.add('on'); A.sfx('tap'); } })));
    modal(h('div', null, null, h('h2', null, { text: '新增小朋友' }), name, h('p', 'lbl', { text: '選一個頭像' }), avs, h('p', 'lbl', { text: '年級只是起點，系統會依表現自動調整' }), grs,
      h('div', 'row', null, btn('取消', '', closeModal), btn('開始！', 'pri', () => { K.store.newLearner(name.value.trim() || '小朋友', av, grade); greeted = false; offerDiag(); }))));
  }
  // 診斷：6 題找到「剛剛好」的起點
  function offerDiag() {
    showHome();
    modal(h('div', 'demo', null, h('div', 'demo-i', { text: '🧭' }), h('h2', null, { text: '出發前的小探險' }), h('p', null, { text: '先玩 6 題，幫你找到剛剛好的難度。答錯也沒關係！' }), h('div', 'row', null, btn('先跳過', '', closeModal), btn('開始探險', 'pri', () => quiz('diag')))));
    A.speak('先玩六題小探險，幫你找到剛剛好的難度。答錯也沒關係！');
  }

  // ---------- 冒險島首頁 ----------
  const stopInfo = st => st.k === 'review' ? { i: '🔁', n: '快複習' } : st.k === 'boss' ? { i: '👑', n: '跨科魔王' } : { i: K.games[st.id].icon, n: K.games[st.id].name };
  const nextStop = () => E.route().findIndex(s => !s.done);
  function runStop(i) { const st = E.route()[i]; st.k === 'game' ? play(st.id, i) : quiz(st.k, i); }
  function showHome() {
    const L = E.L(); if (!L) return showProfiles();
    const pet = K.pet(), over = E.overLimit(), route = E.route(), nx = nextStop(), wk = E.weekDays();
    const head = h('div', 'hm-head', null,
      h('button', 'hm-me', { onclick: () => { A.sfx('tap'); showProfiles(); } }, h('span', 'pf-av sm', { text: L.avatar }), h('b', null, { text: L.name })),
      h('span', 'hm-wk', { text: `🗓️ 這週來了 ${wk} 天` }),
      h('button', 'hm-pet', { onclick: () => { A.sfx('tap'); showCollection(); } }, h('span', null, { text: '🗺️' }), h('small', null, { text: '我的島' })),
      h('button', 'ib', { text: '👪', 'aria-label': '家長專區', onclick: () => { A.sfx('tap'); parentGate(); } }));
    // 我的小島：裝飾是學習換來的收藏
    const decos = L.stickers.slice(-16), isle = h('button', 'isle', { onclick: () => { A.sfx('tap'); showCollection(); } }, h('div', 'isle-land'), h('span', 'isle-pet', { text: pet.e }));
    decos.forEach((d, i) => isle.append(h('span', 'isle-d', { text: d, style: `left:${6 + (i * 37) % 88}%;bottom:${18 + (i * 23) % 34}%;font-size:${22 + (i * 7) % 14}px` })));
    // 今日冒險路線
    const path = h('div', 'route', null, route.map((st, i) => {
      const inf = stopInfo(st), state = st.done ? 'done' : i === nx ? 'next' : 'lock';
      return h('button', 'stop ' + state + (st.s ? ' s-' + st.s : ''), { onclick: () => { if (over) return A.speak('今天玩得很棒了，明天再來吧！'); if (state === 'lock') { A.sfx('bad'); return A.speak('先完成前面的站，才能到這裡喔！'); } if (state === 'done') return; A.sfx('tap'); runStop(i); } },
        h('span', 'stop-i', { text: st.done ? '✅' : inf.i }), h('span', 'stop-n', { text: inf.n }));
    }));
    const board = h('div', 'board', null, h('div', 'bd-t', { text: nx < 0 ? '🎉 今天的冒險完成了！可以自由探險，或是休息一下。' : '🧭 今日冒險：照著路線走，最後挑戰魔王！' }), path,
      nx >= 0 && !over && h('button', 'btn pri go-big', { text: `出發！▶ ${stopInfo(route[nx]).n}`, onclick: () => { A.sfx('tap'); runStop(nx); } }));
    const cols = h('div', 'subjs', null, Object.keys(SUBJ).map(s => {
      const mine = K.skills.filter(k => k.subj === s && k.g === L.gs[s]), solid = mine.filter(k => E.stage(k.id) >= 2).length;
      return h('section', 'subj s-' + s, null,
        h('h2', null, { html: `${SUBJ[s].i} ${SUBJ[s].isle} <span class="st">${stars(L.sub[s])}</span>` }),
        h('div', 'isl-bar', null, h('i', null, { style: `width:${mine.length ? solid / mine.length * 100 : 0}%` })),
        h('div', 'gcards', null, Object.values(K.games).filter(g => g.subj === s).map(g => h('button', 'gcard' + (over ? ' off' : ''), { onclick: () => { if (over) return A.speak('今天玩得很棒了，明天再來吧！'); A.sfx('tap'); play(g.id); } }, h('span', 'gi', { text: g.icon }), h('span', 'gn', { text: g.name })))));
    }));
    show(h('div', 'screen home', null, head, isle, over ? h('div', 'banner', { text: `${pet.e} 今天玩得很棒！讓眼睛休息一下，明天再來吧！` }) : board, h('h3', 'free-t', { text: '🏝️ 自由探險' }), cols));
    if (!greeted) { greeted = true; A.speak(over ? '今天玩得很棒！讓眼睛休息一下，明天再來吧！' : nx < 0 ? `${L.name}，今天的冒險完成了！` : `嗨，${L.name}！今天的冒險準備好了，按出發吧！`); }
  }

  // ---------- 遊戲框架 ----------
  function play(id, stop) {
    const game = K.games[id], L = E.L();
    const round = E.newRound(), exits = [];
    const fill = h('i'), bar = h('div', 'pbar', null, fill), root = h('div', 'groot g-' + id);
    const ctx = {
      game, L, grade: L.gs[game.subj], alive: true, total: game.n, nOpts: L.gs[game.subj] <= 1 ? 3 : 4, note: '',
      pick: () => E.pick(game, round),
      wait: ms => new Promise(r => setTimeout(() => ctx.alive && r(), ms)),
      onExit: f => exits.push(f),
      progress(i, n) { ctx._manual = true; fill.style.width = Math.min(100, i / n * 100) + '%'; },
      async report(p, ok, ms, info) {
        const demo = E.report(game, round, p.skill, ok, ms, p.probe, info);
        if (!ctx._manual) fill.style.width = Math.min(100, round.answers.length / ctx.total * 100) + '%';
        if (demo && ctx.alive) await demoCard(p.skill);
      },
      done() { if (!ctx.alive) return; ctx.exit(true); if (stop != null) { E.route()[stop].done = true; K.store.save(); } showResult(game, E.endRound(game, round), ctx.note); },
      exit(finished) {
        ctx.alive = false; exits.forEach(f => f()); cur = null;
        if (!finished) { E.day().sec += Math.min(600, Math.round((Date.now() - round.start) / 1000)); K.store.save(); }
      }
    };
    show(h('div', 'gs s-' + game.subj, null, h('div', 'gbar', null, h('button', 'ib', { text: '🏠', 'aria-label': '回首頁', onclick: () => { A.sfx('tap'); showHome(); } }), bar, h('div', 'gname', { text: `${game.icon} ${game.name}` })), root));
    cur = ctx;
    // 5 秒內的語音教學，可點一下跳過
    const intro = h('button', 'intro', null, h('span', 'gi', { text: game.icon }), h('b', null, { text: game.name }), h('span', null, { text: game.desc }), h('small', null, { text: '點一下開始 ▶' }));
    root.append(intro);
    Promise.race([A.speak(game.desc).then(() => new Promise(r => setTimeout(r, 400))), new Promise(r => intro.onclick = r), new Promise(r => setTimeout(r, 5000))]).then(() => {
      if (!ctx.alive) return; A.stop(); intro.remove(); round.start = Date.now();
      game.start(root, ctx).catch(e => console.error(e));
    });
  }
  // 示範卡：同一知識點連錯，或看起來在亂猜 → 停下來教一次
  function demoCard(skill) {
    return new Promise(res => {
      const text = skill.demo || '慢慢來，仔細看、仔細聽，再試一次就會了！';
      modal(h('div', 'demo', null, h('div', 'demo-i', { text: '💡' }), h('h2', null, { text: skill.name }), h('p', null, { text }), btn('我知道了 👍', 'pri', () => { A.stop(); closeModal(); res(); })));
      A.speak('我們一起看一下。' + text);
    });
  }
  function showResult(game, res, note) {
    const acc = res.n ? res.r / res.n : 0, st = acc >= .9 ? 3 : acc >= .7 ? 2 : 1, route = E.route(), nx = nextStop(), allDone = nx < 0;
    const body = h('div', 'result', null, h('div', 'r-stars', { text: stars(st) }), h('h1', null, { text: st === 3 ? '太厲害了！' : st === 2 ? '做得很好！' : '完成了！繼續加油！' }),
      h('p', 'r-score', { text: `自己答對 ${res.r} / ${res.n} 題` }), note && h('p', 'r-note', { text: note }),
      // 獎勵學習行為：願意重試、看提示後改對、找到證據
      res.fixed > 0 && h('p', 'r-good', { text: `💪 有 ${res.fixed} 題看了提示後自己改對了！` }),
      res.ev > 0 && h('p', 'r-good', { text: `🔎 找到 ${res.ev} 個證據！` }),
      res.skills.length && h('p', null, { text: '今天練習了：' + K.uniq(res.skills).slice(0, 4).join('、') }),
      res.grew.length && h('p', 'r-good', { text: '📈 進步了：' + res.grew.slice(0, 3).join('、') }),
      res.mastered.length && h('p', 'r-good', { text: '⭐ 精熟了：' + res.mastered.join('、') }),
      res.up && h('p', 'r-good', { text: `⭐ ${SUBJ[game.subj].n}升級到 ${res.up} 顆星！` }),
      res.gradeUp && h('p', 'r-good', { text: `🚀 ${SUBJ[game.subj].isle}開放了新的區域！` }),
      res.sticker && h('p', 'r-sticker', null, '🎁 小島多了新裝飾 ', h('span', 'big-st', { text: res.sticker })),
      allDone && route.some(s => s.done) && E.day().rounds <= route.length + 1 && h('p', 'r-note', { text: '🎉 今天的冒險全部完成了！' }),
      h('div', 'row', null,
        game.subj && btn('🔁 再玩一次', '', () => E.overLimit() ? showHome() : play(game.id)),
        btn('🏠 回小島', nx >= 0 ? '' : 'pri', showHome),
        nx >= 0 && !E.overLimit() && btn(`➡️ 下一站：${stopInfo(route[nx]).n}`, 'pri', () => runStop(nx))));
    show(h('div', 'screen center', null, body));
    A.sfx('win');
    setTimeout(() => A.speak(`${st === 3 ? '太厲害了！' : '做得很好！'}` + (res.fixed ? `你有${res.fixed}題自己改對了，這樣最棒！` : '') + (res.skills.length ? `今天你練習了${res.skills[0]}。` : '') + (res.mastered.length ? `你精熟了${res.mastered[0]}！` : '') + (res.sticker ? '小島多了一個新裝飾！' : '')), 700);
    if (Date.now() - lastBreak > 15 * 60000) { // 每 15 分鐘溫和提醒休息
      lastBreak = Date.now();
      setTimeout(() => { modal(h('div', 'demo', null, h('div', 'demo-i', { text: K.pet().e + '💤' }), h('h2', null, { text: '我有點累了，一起休息一下吧！' }), h('p', null, { text: '看看遠方、喝口水、動一動身體。' }), btn('好！', 'pri', closeModal))); A.speak('我有點累了，一起休息一下吧！看看遠方，喝口水。'); }, 3500);
    }
  }

  // ---------- 跨遊戲的選擇題關卡：快複習／魔王／小檢定／診斷 ----------
  function quiz(mode, stop) {
    const L = E.L(), today = K.today(), wk = K.addDays(today, -7), boss = mode === 'boss';
    const level = K.skills.filter(s => E.eligible(s, L) && s.g === L.gs[s.subj]);
    const fallback = level.length ? level : K.skills.filter(s => s.g === 1 && s.sub === 1);
    let pool, plan = null, n = 10;
    if (boss) pool = K.skills.filter(s => L.skills[s.id] && L.skills[s.id].last >= wk);
    else if (mode === 'review') { pool = E.due(); n = 5; }
    else if (mode === 'diag') { // 每科：目前年級 ★ 與 ★★ 各一題
      plan = []; for (const s of ['zh', 'ma', 'en']) for (const sub of [1, 2]) { const c = K.skills.filter(k => k.subj === s && k.g === L.grade && k.sub === sub); if (c.length) plan.push(K.pick(c)); }
      n = plan.length; pool = plan;
    } else pool = level;
    if (pool.length < 3) pool = fallback;
    const names = { boss: '魔王挑戰', review: '快複習', test: '小檢定', diag: '小探險' };
    const game = { id: mode, name: names[mode], n, app: boss }, round = E.newRound();
    const theme = [['🐙', '海底', 'sea'], ['👾', '太空', 'space'], ['🐲', '森林', 'forest']][Math.floor(Date.now() / 6048e5) % 3];
    const fill = h('i'), bar = h('div', 'pbar', null, fill), root = h('div', 'groot quiz' + (boss ? ' boss-' + theme[2] : ''));
    const foe = h('div', 'boss-foe', null, h('span', 'bf', { text: theme[0] }), h('span', 'hp', null, h('i'))), top = h('div', 'g-top'), work = h('div', 'quiz-work');
    const single = mode === 'test' || mode === 'diag'; // 檢定與診斷不給提示
    let alive = true, hp = 10;
    show(h('div', 'gs s-boss', null, h('div', 'gbar', null, h('button', 'ib', { text: '🏠', onclick: () => { A.sfx('tap'); mode === 'test' ? showParent() : showHome(); } }), bar, h('div', 'gname', { text: boss ? `👑 ${theme[1]}魔王` : mode === 'review' ? '🔁 快複習' : mode === 'diag' ? '🧭 小探險' : '📝 小檢定' })), root));
    cur = { exit() { alive = false; cur = null; } };
    if (boss) root.append(foe); root.append(top, work);
    if (boss) A.speak(`${theme[1]}魔王出現了！答對題目就能打敗牠！`);
    if (mode === 'review') A.speak('先來複習一下之前學過的！');
    const order = K.shuffle(['en', 'ma', 'zh']), used = new Set();
    (async () => {
      for (let i = 0; i < n && alive; i++) {
        let skill;
        if (plan) skill = plan[i];
        else if (round.retry && boss) skill = round.retry;
        else { const want = pool.filter(s => s.subj === order[i % 3] && !used.has(s.id)), rest = pool.filter(s => !used.has(s.id)); skill = K.pick(want.length ? want : rest.length ? rest : pool); }
        round.retry = null; if (mode === 'review') used.add(skill.id);
        const q = K.mcq(skill, { n: 4 });
        top.replaceChildren(K.ui.prompt(q)); work.replaceChildren();
        if (single) { const hb = top.querySelector('.q-help'); if (hb) hb.remove(); }
        if (i || !(boss || mode === 'review')) K.sayQ(q); else setTimeout(() => alive && K.sayQ(q), 2600);
        const r = await K.ui.choice(work, q, { single });
        if (!alive) return;
        const demo = E.report(game, round, skill, r.ok, r.ms, false, r);
        fill.style.width = (i + 1) / n * 100 + '%';
        if (boss && (r.ok || r.fixed)) { hp--; foe.querySelector('.hp i').style.width = hp * 10 + '%'; foe.classList.remove('hit'); void foe.offsetWidth; foe.classList.add('hit'); }
        if (demo && !single) await demoCard(skill);
      }
      if (!alive) return;
      cur = null;
      if (stop != null) { E.route()[stop].done = true; K.store.save(); }
      if (boss || mode === 'review') {
        const res = E.endRound(game, round); if (boss) E.day().boss = true; K.store.save();
        showResult(game, res, boss ? (hp <= 3 ? `${theme[0]} 打敗${theme[1]}魔王了！` : `${theme[0]} 魔王逃走了，下次再挑戰！`) : '🔁 複習完成，記得更牢了！');
      } else if (mode === 'diag') {
        const by = {}; round.answers.forEach(a => { const s = K.skill[a.sid]; (by[s.subj] = by[s.subj] || []).push(a.ok); });
        for (const s in by) L.sub[s] = by[s].length >= 2 && by[s].every(x => x) ? 2 : 1;
        K.store.save();
        show(h('div', 'screen center', null, h('div', 'result', null, h('div', 'demo-i', { text: '🧭' }), h('h1', null, { text: '找到你的起點了！' }), h('p', null, { text: '冒險路線已經準備好，我們出發吧！' }), btn('前往小島', 'pri', showHome))));
        A.speak('找到你的起點了！我們出發吧！');
      } else {
        const by = {}; round.answers.forEach(a => { const s = K.skill[a.sid].subj, b = by[s] || (by[s] = [0, 0]); b[1]++; if (a.ok) b[0]++; });
        const r = round.answers.filter(a => a.ok).length;
        L.tests.push({ d: today, r, n: round.answers.length, by, g: L.grade }); K.store.save();
        show(h('div', 'screen center', null, h('div', 'result', null, h('h1', null, { text: '小檢定完成！' }), h('p', 'r-score', { text: `答對 ${r} / ${round.answers.length} 題` }), h('p', null, { text: '結果已記錄在家長專區。' }), btn('回家長專區', 'pri', showParent))));
      }
    })();
  }

  // ---------- 我的島：寵物、裝飾、能力地圖 ----------
  function showCollection() {
    const L = E.L(), pet = K.pet();
    const map = h('div', 'card');
    for (const s in SUBJ) {
      const list = K.skills.filter(k => k.subj === s && (k.g === L.gs[s] ? k.sub <= L.sub[s] : L.skills[k.id] && L.skills[k.id].last)).sort((a, b) => a.g * 10 + a.sub - b.g * 10 - b.sub);
      map.append(h('h4', null, { text: `${SUBJ[s].i} ${SUBJ[s].isle}` }), h('div', 'chips', null, list.map(k => { const st = E.stage(k.id); return h('span', 'badge st' + st, { text: `${K.STAGES[st][0]} ${k.name}` }); })));
    }
    show(h('div', 'screen', null,
      h('div', 'hm-head', null, btn('🏠 回小島', '', showHome)),
      h('div', 'pet-card', null, h('div', 'pet-big', { text: pet.e }), h('h2', null, { text: pet.name }), h('p', null, { text: pet.next ? `已精熟 ${pet.n} 個本領，精熟 ${pet.next} 個就會進化！` : `已精熟 ${pet.n} 個本領，是最強的神龍了！` }), h('div', 'pet-steps', null, K.PETS.map(p => h('span', pet.n >= p[0] ? 'on' : '', { text: p[1] }))),
        h('p', 'sub', { text: `💪 自己改對 ${L.bonus.fix} 題　🔎 找到證據 ${L.bonus.ev} 次　🔁 完成複習 ${L.bonus.rev} 次` })),
      h('h2', 'sec', { text: '🗺️ 我的能力地圖' }), h('p', 'sub', { text: '🌱 新手 → 🌿 熟悉 → 🌳 穩定 → ⭐ 精熟（隔天還記得才算精熟）' }), map,
      h('h2', 'sec', { text: `🎁 小島裝飾（${L.stickers.length} / ${K.STICKERS.length}）` }),
      h('div', 'stickers', null, K.STICKERS.map(s => h('span', L.stickers.includes(s) ? 'on' : '', { text: L.stickers.includes(s) ? s : '❔' })))));
    A.speak(`這是你的小島和${pet.name}。你有${L.stickers.length}個裝飾！`);
  }

  // ---------- 家長專區 ----------
  function parentGate() {
    const a = K.rand(6, 9), b = K.rand(6, 9), inp = h('input', 'inp', { type: 'number', inputmode: 'numeric', placeholder: '答案' });
    const go = () => { if (+inp.value === a * b) { closeModal(); showParent(); } else { inp.value = ''; A.sfx('bad'); } };
    inp.addEventListener('keydown', e => e.key === 'Enter' && go());
    modal(h('div', null, null, h('h2', null, { text: '家長專區' }), h('p', null, { text: `請回答：${a} × ${b} = ?` }), inp, h('div', 'row', null, btn('取消', '', closeModal), btn('進入', 'pri', go))));
    inp.focus();
  }
  const dl = (name, text, type) => { const a = h('a', null, { href: URL.createObjectURL(new Blob([text], { type })), download: name }); document.body.append(a); a.click(); a.remove(); };
  const topErr = t => { const ks = Object.keys(t.conf || {}); return ks.length ? ks.sort((x, y) => t.conf[y] - t.conf[x])[0] : ''; };
  function showParent() {
    const L = E.L(), D = K.store.data, today = K.today();
    const sel = (opts, val, on) => { const s = h('select', 'inp sm', { onchange: e => { on(e.target.value); K.store.save(); } }, opts.map(([v, t]) => h('option', null, { value: v, text: t }))); s.value = val; return s; };
    const tog = (label, key) => h('label', 'tog', null, h('input', null, Object.assign({ type: 'checkbox', onchange: e => { D.settings[key] = e.target.checked; K.store.save(); } }, D.settings[key] ? { checked: '' } : {})), ' ' + label);
    // 設定
    const set = h('div', 'card', null, h('h3', null, { text: `⚙️ ${L.avatar} ${L.name} 的設定` }),
      h('div', 'frow', null, h('span', null, { text: '起點年級' }), sel(GN.slice(1).map((g, i) => [i + 1, g]), L.grade, v => { L.grade = +v; L.gs = { en: +v, ma: +v, zh: +v }; L.sub = { en: 1, ma: 1, zh: 1 }; L.recent = { en: [], ma: [], zh: [] }; L.hi = { en: 0, ma: 0, zh: 0 }; delete E.day().route; showParent(); })),
      h('p', 'sub', { text: '目前程度（系統依表現自動調整，年級只是起點）：' + Object.keys(SUBJ).map(s => `${SUBJ[s].n} ${lvText(L, s)}`).join('｜') }),
      h('div', 'frow', null, h('span', null, { text: '每日上限' }), sel([[0, '不限制'], [10, '10 分鐘'], [15, '15 分鐘'], [20, '20 分鐘'], [30, '30 分鐘'], [45, '45 分鐘']], L.limit, v => L.limit = +v),
        btn('今天再加 10 分鐘', '', () => { L.extra[today] = (L.extra[today] || 0) + 10; K.store.save(); showParent(); })),
      h('div', 'frow', null, tog('音效', 'sfx'), tog('語音旁白', 'voice')));
    // 今天與最近 7 天
    const week = Array.from({ length: 7 }, (_, i) => K.addDays(today, i - 6)), mins = week.map(d => Math.round(((L.days[d] || {}).sec || 0) / 60)), mx = Math.max(10, ...mins);
    const td = E.day(), tskills = K.skills.filter(k => L.skills[k.id] && L.skills[k.id].last === today);
    const kept = K.skills.filter(k => E.stage(k.id) === 3).length;
    const usage = h('div', 'card', null, h('h3', null, { text: '📅 今天與最近 7 天' }),
      h('p', null, { text: `今天：有效學習 ${mins[6]} 分鐘，作答 ${Object.values(td.by).reduce((a, b) => a + b[1], 0)} 題` + (tskills.length ? `，練習了 ${tskills.slice(0, 5).map(k => k.name).join('、')}${tskills.length > 5 ? '…' : ''}` : '') }),
      h('p', null, { text: `最近 7 天玩了 ${mins.filter(m => m > 0).length} 天、共 ${mins.reduce((a, b) => a + b, 0)} 分鐘。已精熟並在隔日仍保留的技能：${kept} 個。` }),
      h('div', 'bars', null, week.map((d, i) => h('div', 'bar', null, h('i', null, { style: `height:${mins[i] / mx * 100}%` }), h('small', null, { text: d.slice(8) })))));
    // 近 4 週趨勢
    const wkAcc = (w, s) => { let r = 0, n = 0; for (let i = 0; i < 7; i++) { const d = L.days[K.addDays(today, -(w * 7 + i))]; if (d && d.by) { r += d.by[s][0]; n += d.by[s][1]; } } return n >= 5 ? Math.round(r / n * 100) + '%' : '—'; };
    const trend = h('div', 'card', null, h('h3', null, { text: '📈 近 4 週獨立答對率' }), h('p', 'sub', { text: '只計算「第一次、沒看提示就答對」的題目。少於 5 題的週次顯示 —。' }),
      h('table', 'tbl', null, h('tr', null, null, ['', '3 週前', '2 週前', '上週', '本週'].map(t => h('th', null, { text: t }))), Object.keys(SUBJ).map(s => h('tr', null, null, h('td', null, { text: SUBJ[s].n }), [3, 2, 1, 0].map(w => h('td', null, { text: wkAcc(w, s) }))))));
    // 最常錯 + 錯誤型態 + 下一步
    const wrong = K.skills.map(k => ({ k, t: L.skills[k.id] })).filter(x => x.t && x.t.w >= 2).sort((a, b) => b.t.w / (b.t.r + b.t.w) - a.t.w / (a.t.r + a.t.w)).slice(0, 5);
    const sugg = [], dueN = E.due().length;
    if (dueN) sugg.push(`有 ${dueN} 個技能到了該複習的時間，明天先做「快複習」約 2 分鐘。`);
    wrong.forEach(x => x.k.tip && sugg.push(`${x.k.name}：${x.k.tip}`));
    if (!sugg.length) sugg.push('目前沒有特別需要加強的地方，維持每天 15 分鐘就很棒！');
    const weak = h('div', 'card', null, h('h3', null, { text: '🎯 卡住的地方與錯誤型態' }),
      wrong.length ? h('ol', null, null, wrong.map(x => h('li', null, { text: `${SUBJ[x.k.subj].n}｜${x.k.name}（${K.STAGES[E.stage(x.k.id)][1]}，掌握度 ${Math.round(x.t.score)}）` + (topErr(x.t) ? `　常見錯誤：${topErr(x.t)}` : '') }))) : h('p', 'sub', { text: '還沒有足夠的資料。' }),
      h('h3', null, { text: '💡 下一步建議' }), h('ul', null, null, sugg.slice(0, 5).map(t => h('li', null, { text: t }))),
      h('p', 'sub', { text: `學習行為：看提示後自己改對 ${L.bonus.fix} 題｜閱讀找到證據 ${L.bonus.ev} 次｜完成複習 ${L.bonus.rev} 次` }));
    // 技能地圖
    const heat = h('div', 'card', null, h('h3', null, { text: '🗺️ 技能地圖' }), h('p', 'sub', { html: '<span class="chip k0">未開始</span> <span class="chip k1">新手／熟悉</span> <span class="chip k2">穩定</span> <span class="chip k3">精熟</span>　點一下看詳細' }));
    const detail = h('p', 'detail', { text: '' });
    for (const s in SUBJ) {
      heat.append(h('h4', null, { text: `${SUBJ[s].i} ${SUBJ[s].n}　目前 ${lvText(L, s)}` }), h('div', 'chips', null, K.skills.filter(k => k.subj === s && k.g <= L.gs[s]).sort((a, b) => a.g * 10 + a.sub - b.g * 10 - b.sub).map(k => {
        const t = L.skills[k.id], st = E.stage(k.id), pc = a => a && a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length * 100) + '%' : '—';
        return h('button', 'chip k' + (!t || !t.last ? 0 : st <= 1 ? 1 : st), { text: `${k.g}${'★'.repeat(k.sub)} ${k.name}`, onclick: () => { detail.textContent = t && t.last ? `${k.name}：${K.STAGES[st][1]}，掌握度 ${Math.round(t.score)}。近期獨立答對 ${pc(t.rec)}、隔日保留 ${pc(t.dl)}、情境應用 ${pc(t.ap)}、用提示比例 ${pc(t.hint)}。下次複習 ${t.due || '—'}。` + (topErr(t) ? `常見錯誤：${topErr(t)}。` : '') : `${k.name}：還沒練習過`; } });
      })));
    }
    heat.append(detail);
    // 小檢定
    const tests = h('div', 'card', null, h('h3', null, { text: '📝 小檢定（10 題，約 3 分鐘，不給提示）' }), h('p', 'sub', { text: '建議每月一次，由孩子自己作答，用來對照學習成效。' }),
      L.tests.length ? h('ul', null, null, L.tests.slice(-6).map(t => h('li', null, { text: `${t.d}（${GN[t.g]}）：${t.r} / ${t.n}　` + Object.keys(t.by).map(s => `${SUBJ[s].n} ${t.by[s][0]}/${t.by[s][1]}`).join('、') }))) : h('p', 'sub', { text: '還沒有檢定紀錄。' }),
      h('div', 'frow', null, btn('開始小檢定', 'pri', () => quiz('test')), btn('重做 6 題起點診斷', '', () => quiz('diag'))));
    // 備份
    const file = h('input', null, { type: 'file', accept: '.json,application/json', style: 'display:none', onchange: e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { try { const d = JSON.parse(t); if (!d.learners) throw 0; if (confirm('匯入會取代這台裝置上的所有紀錄，確定嗎？')) { localStorage.setItem('kidlearn.v1', JSON.stringify(d)); K.store.load(); showProfiles(); } } catch (x) { alert('檔案格式不正確'); } }); } });
    const backup = h('div', 'card', null, h('h3', null, { text: '💾 備份與資料' }), h('p', 'sub', { text: '資料只存在這台裝置的瀏覽器裡。清除瀏覽器資料會遺失，建議每月匯出備份。' }),
      h('div', 'frow', null, btn('匯出備份', '', () => dl(`kidlearn-backup-${today}.json`, JSON.stringify(D), 'application/json')), btn('匯入備份', '', () => file.click()), file,
        btn('匯出技能紀錄 CSV', '', () => dl(`kidlearn-${L.name}-${today}.csv`, '﻿科目,年級,子級,知識點,階段,掌握度,答對,答錯,隔日保留,提示比例,復習盒,最近練習,常見錯誤\n' + K.skills.filter(k => L.skills[k.id]).map(k => { const t = L.skills[k.id], m = a => a && a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(2) : ''; return [SUBJ[k.subj].n, k.g, k.sub, k.name, K.STAGES[E.stage(k.id)][1], Math.round(t.score), t.r, t.w, m(t.dl), m(t.hint), t.box, t.last || '', topErr(t)].join(','); }).join('\n'), 'text/csv')),
        btn('匯出作答事件 CSV', '', () => dl(`kidlearn-events-${L.name}-${today}.csv`, '﻿時間,遊戲,知識點,獨立答對,秒數,用提示\n' + L.log.map(e => [new Date(e[0]).toLocaleString('zh-TW').replace(/,/g, ''), (K.games[e[1]] || {}).name || e[1], (K.skill[e[2]] || {}).name || e[2], e[3], e[4], e[5]].join(',')).join('\n'), 'text/csv')),
        btn('列印報告', '', () => window.print())),
      h('div', 'frow', null, btn('刪除這位小朋友', 'danger', () => { if (confirm(`確定刪除「${L.name}」的所有紀錄嗎？無法復原。`)) { D.learners = D.learners.filter(x => x !== L); D.current = null; K.store.save(); showProfiles(); } })));
    const about = h('div', 'card', null, h('h3', null, { text: '📲 安裝到手機／平板' }), h('p', 'sub', { html: 'iPhone／iPad：用 Safari 開啟 → 分享按鈕 → 「加入主畫面」。<br>Android：用 Chrome 開啟 → 選單 → 「安裝應用程式」或「加到主畫面」。<br>安裝後可離線使用。' }), h('p', 'sub', { text: `版本 ${VERSION}｜知識點 ${K.skills.length} 個｜遊戲 ${Object.keys(K.games).length} 款` }));
    show(h('div', 'screen parent', null, h('div', 'hm-head', null, btn('🏠 回小島', '', showHome), h('h1', null, { text: '家長專區' })), set, usage, trend, weak, heat, tests, backup, about));
  }

  // ---------- 啟動 ----------
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; });
  window.addEventListener('DOMContentLoaded', () => {
    K.store.load();
    if ('speechSynthesis' in window) speechSynthesis.getVoices();
    document.addEventListener('visibilitychange', () => document.hidden && A.stop());
    E.L() ? showHome() : showProfiles();
  });
  K.shell = { showHome, showProfiles, play, quiz, showParent, showCollection };
})();
