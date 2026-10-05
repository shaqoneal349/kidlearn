'use strict';
// 殼層：學習者檔案、冒險島首頁與今日路線、遊戲框架、結算與錯題回顧、複習／魔王／檢定／診斷、我的島、家長專區、更新提示
(() => {
  const K = KL, h = K.h, A = K.audio, E = K.engine;
  const VERSION = '4.0.0'; K.VERSION = VERSION;
  const app = () => document.getElementById('app'), ov = () => document.getElementById('overlay');
  const SUBJ = { en: { n: '英文', i: '🔤', isle: '英文島' }, ma: { n: '數學', i: '🔢', isle: '數學島' }, zh: { n: '國語', i: '📖', isle: '國語島' } };
  const AV = ['🦊', '🐼', '🐰', '🐯', '🐸', '🦄', '🐵', '🐱', '🧑‍🚀', '🧙', '🦸', '🥷'];
  const GN = ['', '小一', '小二', '小三', '小四', '小五', '小六'];
  let cur = null, greeted = false, lastBreak = Date.now(), installEvt = null, swReg = null;

  const closeModal = () => ov().replaceChildren();
  const show = node => { document.querySelectorAll('.coach').forEach(x => x.remove()); if (cur) cur.exit(); K.cur = null; A.stop(); closeModal(); app().replaceChildren(node); window.scrollTo(0, 0); applyPrefs(); };
  const modal = (node, cls = '') => ov().replaceChildren(h('div', 'modal-bg'), h('div', 'modal ' + cls, null, node));
  const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);
  const btn = (text, cls, onclick) => h('button', 'btn ' + (cls || ''), { text, onclick: e => { A.sfx('tap'); onclick(e); } });
  const lvText = (L, s) => `${GN[L.gs[s]]} ${stars(L.sub[s])}`;
  const toast = (text, onclick) => { const t = h('button', 'toast', { text, onclick: () => { t.remove(); onclick && onclick(); } }); document.body.append(t); if (!onclick) setTimeout(() => t.remove(), 4000); };
  K.toast = t => toast(t);
  function applyPrefs() {
    const S = K.store.data.settings, L = E.L(), b = document.body;
    b.classList.toggle('rm', !S.motion); b.classList.toggle('big', !!S.big); b.dataset.theme = L ? L.theme : 'kid';
    K.zyWatch(); K.zyApply();
  }
  // 遊戲畫面右上角的注音開關
  const zyBtn = () => { const b = h('button', 'ib zyb' + (K.zyOn() ? ' on' : ''), { text: 'ㄅ', 'aria-label': '注音開關', onclick: () => { const L = E.L(); L.zy = !L.zy; K.store.save(); b.classList.toggle('on', L.zy); A.sfx('tap'); K.zyApply(); } }); return b; };

  // ---------- 學習者檔案 ----------
  function showProfiles() {
    const D = K.store.data;
    const list = h('div', 'pf-list', null, D.learners.map(L => h('button', 'pf', { onclick: () => { A.sfx('tap'); D.current = L.id; K.store.save(); greeted = false; showHome(); } }, h('span', 'pf-av', { text: L.avatar }), h('span', 'pf-n', { text: L.name }))),
      h('button', 'pf add', { onclick: () => { A.sfx('tap'); addLearner(); } }, h('span', 'pf-av', { text: '➕' }), h('span', 'pf-n', { text: '新增小朋友' })));
    const scr = h('div', 'screen center', null, h('div', 'logo', { text: '🏝️' }), h('h1', 'title', { text: '小小學習家' }), h('p', 'sub', { text: '英文・數學・國語　學習冒險島' }), h('p', 'sub', { text: D.learners.length ? '誰要來冒險？' : '第一次使用，請爸爸媽媽幫忙建立檔案' }), list,
      h('p', 'sub tiny', { text: '無廣告・無內購・紀錄只存在這台裝置・有每日時間上限與休息提醒' }));
    if (installEvt) scr.append(btn('📲 安裝到主畫面', 'pri', async () => { installEvt.prompt(); installEvt = null; }));
    show(scr);
  }
  function addLearner() {
    let av = AV[0], grade = 1; const gs = { en: 1, ma: 1, zh: 1 };
    const name = h('input', 'inp', { placeholder: '小朋友的名字', maxlength: 8 });
    const avs = h('div', 'av-row', null, AV.map(a => h('button', 'av' + (a === av ? ' on' : ''), { text: a, onclick: e => { av = a;[...avs.children].forEach(x => x.classList.remove('on')); e.currentTarget.classList.add('on'); A.sfx('tap'); } })));
    const sel = (val, on) => { const s = h('select', 'inp sm', { onchange: e => on(+e.target.value) }, GN.slice(1).map((g, i) => h('option', null, { value: i + 1, text: g }))); s.value = val; return s; };
    const subjSel = h('div', 'frow', null, Object.keys(SUBJ).map(s => h('label', 'tog', null, SUBJ[s].n, sel(1, v => gs[s] = v))));
    const grs = h('div', 'av-row', null, GN.slice(1).map((g, i) => h('button', 'chip' + (i === 0 ? ' on' : ''), { text: g, onclick: e => { grade = i + 1;[...grs.children].forEach(x => x.classList.remove('on')); e.currentTarget.classList.add('on'); A.sfx('tap'); subjSel.querySelectorAll('select').forEach(x => x.value = grade); Object.keys(gs).forEach(k => gs[k] = grade); } })));
    modal(h('div', null, null, h('h2', null, { text: '新增小朋友' }), name, h('p', 'lbl', { text: '選一個頭像' }), avs, h('p', 'lbl', { text: '年級（只是起點，系統會依表現自動調整）' }), grs,
      h('details', 'det', null, h('summary', null, { text: '三科分別設定起點（例如英文晚一點開始）' }), subjSel),
      h('div', 'row', null, btn('取消', '', closeModal), btn('開始！', 'pri', () => { const L = K.store.newLearner(name.value.trim() || '小朋友', av, grade, Object.assign({}, gs)); L.theme = grade >= 4 ? 'explorer' : 'kid'; K.store.save(); greeted = false; offerDiag(); }))));
  }
  function offerDiag() {
    showHome();
    modal(h('div', 'demo', null, h('div', 'demo-i', { text: '🧭' }), h('h2', null, { text: '出發前的小探險' }), h('p', null, { text: '每科玩幾題，幫你找到剛剛好的起點。答錯也沒關係！' }), h('div', 'row', null, btn('先跳過', '', closeModal), btn('開始探險', 'pri', () => quiz('diag')))));
    A.speak('先玩幾題小探險，幫你找到剛剛好的起點。答錯也沒關係！');
  }

  // ---------- 冒險島首頁 ----------
  const stopInfo = st => st.k === 'review' ? { i: '🔁', n: '快複習' } : st.k === 'boss' ? { i: '👑', n: '跨科魔王' } : { i: K.games[st.id].icon, n: K.games[st.id].name };
  const nextStop = () => E.route().findIndex(s => !s.done);
  function runStop(i) { const st = E.route()[i]; st.k === 'game' ? play(st.id, i) : quiz(st.k, i); }
  const calm = g => g && (g.id === 'e6' || g.id === 'c8' || g.id === 'c2'); // 超時後仍可玩的「無時限」活動
  // 遊戲卡上的能力值：這款遊戲在目前年級的知識點平均掌握度（0–99）
  const gamePct = (g, L) => { const ks = K.skills.filter(k => K.fits(g, k) && k.g === L.gs[g.subj]); if (!ks.length) return 0; return Math.min(99, Math.round(ks.reduce((a, k) => a + ((L.skills[k.id] || {}).score || 0), 0) / ks.length)); };
  // 新手引導的小手：指著要點的地方，點任何地方就消失
  function coach(target, text) {
    if (!target || !target.isConnected) return;
    document.querySelectorAll('.coach').forEach(x => x.remove());
    const r = target.getBoundingClientRect(), c = h('div', 'coach', { style: `left:${r.left + r.width / 2}px;top:${r.top + r.height * .6}px` }, h('span', 'coach-hand', { text: '👆' }), text && h('span', 'coach-tip', { text }));
    document.body.append(c);
    const off = () => { c.remove(); document.removeEventListener('pointerdown', off, true); document.removeEventListener('scroll', off, true); };
    document.addEventListener('pointerdown', off, true); document.addEventListener('scroll', off, true); setTimeout(off, 7000);
  }
  function showHome() {
    const L = E.L(); if (!L) return showProfiles();
    const pet = K.pet(), over = E.overLimit(), route = E.route(), nx = nextStop(), wk = E.weekDays(), ex = L.theme === 'explorer';
    // 頂部狀態列（遊戲風 HUD）：頭像名牌＋三個計數膠囊＋我的島＋家長
    const pill = (icon, n, label, cls) => h('span', 'hud-pill ' + cls, { title: label }, h('i', null, { text: icon }), h('b', null, { text: n }), h('small', null, { text: label }));
    const head = h('div', 'hm-head hud', null,
      h('button', 'hm-me', { onclick: () => { A.sfx('tap'); showProfiles(); } }, h('span', 'pf-av sm', { text: L.avatar }), h('span', 'hm-id', null, h('b', null, { text: L.name }), h('small', null, { text: `${pet.e} ${pet.name}` }))),
      h('div', 'hud-pills', null, pill('🗓️', wk, '這週天數', 'p-day'), pill('🎖️', L.stickers.length, '收藏', 'p-stk'), pill('⭐', E.masteredCount(), '精熟技能', 'p-star'), pill('🪙', L.coins || 0, '金幣', 'p-coin')),
      h('button', 'hm-pet', { onclick: () => { A.sfx('tap'); showCollection(); } }, h('span', null, { text: ex ? '🧭' : '🗺️' }), h('small', null, { text: ex ? '基地' : '我的島' })),
      h('button', 'ib', { text: '👪', 'aria-label': '家長專區', onclick: () => { A.sfx('tap'); parentGate(); } }));
    // 我的小島：裝飾擺在固定的格位，不會疊在一起
    const SLOTS = [[6, 40], [18, 22], [30, 46], [42, 18], [58, 44], [70, 20], [82, 40], [92, 24], [12, 60], [26, 68], [40, 62], [62, 66], [76, 60], [88, 68], [50, 72], [4, 76]];
    const decos = L.stickers.slice(-SLOTS.length), isle = h('button', 'isle' + (ex ? ' ex' : ''), { onclick: () => { A.sfx('tap'); showCollection(); } }, h('div', 'isle-land'), h('span', 'isle-tree', { text: ex ? '🏕️' : '🌴', style: 'left:20%' }), h('span', 'isle-tree', { text: ex ? '🔭' : '🌳', style: 'right:20%;font-size:34px' }), h('span', 'isle-pet', { text: pet.e }));
    decos.forEach((d, i) => isle.append(h('span', 'isle-d', { text: d, style: `left:${SLOTS[i][0]}%;bottom:${SLOTS[i][1] - 10}%;font-size:${22 + (i % 3) * 4}px` })));
    // 季節換皮：天空飄著當季的小圖示，左上角掛季節牌
    const sea = K.season();
    sea.deco.forEach((d, i) => isle.append(h('span', 'isle-sea', { text: d, style: `left:${8 + i * 24}%;animation-delay:${i * .7}s` })));
    isle.append(h('span', 'isle-tag', { text: `${sea.dot} ${sea.n}` }));
    const path = h('div', 'route', null, route.map((st, i) => {
      const inf = stopInfo(st), state = st.done ? 'done' : i === nx ? 'next' : 'later';
      return h('button', 'stop ' + state + (st.s ? ' s-' + st.s : ''), { onclick: () => { if (state === 'done') return; if (over && !(st.k === 'review' || (st.k === 'game' && calm(K.games[st.id])))) return A.speak('今天玩得很棒了，明天再來吧！'); A.sfx('tap'); runStop(i); } },
        h('span', 'stop-i', { text: st.done ? '✅' : inf.i }), h('span', 'stop-n', { text: inf.n }));
    }));
    const board = h('div', 'board', null, h('div', 'bd-t', { text: nx < 0 ? '🎉 今天的冒險完成了！可以自由探險，或是休息一下。' : '🧭 今日冒險：建議照順序走，想先玩哪一站也可以。' }), path,
      nx >= 0 && !over && h('button', 'btn pri go-big', { text: `出發！▶ ${stopInfo(route[nx]).n}`, onclick: () => { A.sfx('tap'); runStop(nx); } }));
    const cols = h('div', 'subjs', null, Object.keys(SUBJ).map(s => {
      const mine = K.skills.filter(k => k.subj === s && k.g === L.gs[s]), solid = mine.filter(k => E.stage(k.id) >= 2).length;
      return h('section', 'subj s-' + s, null,
        h('h2', null, { html: `${SUBJ[s].i} ${SUBJ[s].isle} <small>${GN[L.gs[s]]}</small> <span class="st">${stars(L.sub[s])}</span>` }),
        h('div', 'isl-bar', null, h('i', null, { style: `width:${mine.length ? solid / mine.length * 100 : 0}%` })),
        h('div', 'gcards', null, Object.values(K.games).filter(g => g.subj === s && !g.hidden).map(g => {
          const off = over && !calm(g), pc = gamePct(g, L), isNew = !L.last[g.id];
          // 收藏卡風格：左上能力值、中間大圖示、下方名牌與技能類型
          return h('button', 'gcard' + (off ? ' off' : '') + (isNew ? ' new' : ''), { onclick: () => { if (off) return A.speak('今天玩得很棒了，明天再來吧！'); A.sfx('tap'); play(g.id); } },
            h('span', 'gc-rt', { text: isNew ? 'NEW' : pc }), h('span', 'gi', { text: g.icon }), h('span', 'gn', { text: g.name }), h('span', 'gc-cog', { text: g.cog }));
        })));
    }));
    // 益智島：五款益智小遊戲，各自有關卡進度
    const pz = h('section', 'subj s-pz', null, h('h2', null, { html: '🧩 益智島 <small>動動腦</small>' }),
      h('div', 'gcards', null, Object.values(K.puzzles).map(g => {
        const s2 = K.pz.st(g.id), stars = Object.values(s2.best).reduce((a, b) => a + b, 0), isNew = !s2.seen;
        return h('button', 'gcard' + (over ? ' off' : '') + (isNew ? ' new' : ''), { onclick: () => { if (over) return A.speak('今天玩得很棒了，明天再來吧！'); A.sfx('tap'); K.pz.openMap(g.id); } },
          h('span', 'gc-rt', { text: isNew ? 'NEW' : `第${s2.lv}關` }), h('span', 'gi', { text: g.icon }), h('span', 'gn', { text: g.name }), h('span', 'gc-cog', { text: stars ? `★ ${stars}` : '益智' }));
      })));
    // 三個入口（參考 Starfall 的「書＋遊戲＋影片」與年齡分層）：學習步道（引導認識）、故事屋（點讀書）、賽車車庫（高年級的元遊戲）
    const portal = (cls, icon, name, sub, fn, off) => h('button', 'portal ' + cls + (off ? ' off' : ''), { onclick: () => { if (off) return A.speak('今天玩得很棒了，明天再來吧！'); A.sfx('tap'); fn(); } }, h('span', 'pt-i', { text: icon }), h('span', 'pt-n', null, h('b', null, { text: name }), h('small', null, { text: sub })));
    const portals = h('div', 'portals', null,
      K.lessons && portal('p-ls', '📚', '學習步道', '注音・ABC・數字 一步一步學', () => K.lessons.open(), over),
      K.books && portal('p-bk', '📖', '故事屋', `${K.books.count()} 本會說話的書`, () => K.books.open(), false),
      K.garage && portal('p-gr', '🏎️', '賽車車庫', `🪙 ${L.coins || 0}　答題賺金幣、升級賽車`, () => K.garage.open(), over));
    show(h('div', 'screen home', null, head, isle, over ? h('div', 'banner', { text: `${pet.e} 今天玩得很棒！眼睛休息一下。想安靜看故事或寫字還是可以喔。` }) : board, portals, h('h3', 'free-t', { text: '🏝️ 自由探險' }), cols, h('div', 'subjs pz-row', null, pz)));
    if (!Object.values(L.days).some(d => d.rounds) && !over) setTimeout(() => coach(document.querySelector('.go-big'), '按這裡開始今天的冒險！'), 900);
    if (!greeted) { greeted = true; A.speak(over ? '今天玩得很棒！讓眼睛休息一下，明天再來吧！' : nx < 0 ? `${L.name}，今天的冒險完成了！` : `嗨，${L.name}！今天的冒險準備好了，按出發吧！`); }
  }

  // ---------- 遊戲框架 ----------
  // 進度圓點（Starfall：3–10 顆，答一題亮一顆，圖示依季節換）；題數多的遊戲仍用進度條
  function progressUI(n) {
    if (n > 10) { const fill = h('i'), el = h('div', 'pbar', null, fill); return { el, set: f => fill.style.width = Math.min(100, f * 100) + '%' }; }
    const dot = K.season().dot, ds = Array.from({ length: n }, () => h('i', 'pd')), el = h('div', 'pdots', null, ds);
    return { el, set: f => { const k = Math.round(Math.min(1, f) * n); ds.forEach((d, i) => { const on = i < k; if (on && !d.classList.contains('on')) { d.textContent = dot; d.classList.add('on'); } else if (!on && d.classList.contains('on')) { d.textContent = ''; d.classList.remove('on'); } }); } };
  }
  // 閒置提示的小手（Starfall 的「指向手」）：一段時間沒操作，就指向該點的地方；遊戲用 .idle-target 標記目標，否則指喇叭
  function idleWatch(root, ms) {
    let t = null, n = 0, last = null;
    const fire = () => {
      if (!root.isConnected) return;
      const tg = [...root.querySelectorAll('.idle-target')].find(x => x.offsetParent) || root.querySelector('.q-snd');
      if (tg !== last) { last = tg; n = 0; }
      if (tg && n < 2 && !document.querySelector('.modal-bg,.hint-toast .next')) { n++; coach(tg, tg.dataset.tip || (tg.classList.contains('q-snd') ? '聽不清楚？按這裡再聽一次' : '點這裡')); }
      t = setTimeout(fire, ms * 1.6);
    };
    const reset = () => { clearTimeout(t); t = setTimeout(fire, ms); };
    root.addEventListener('pointerdown', reset, true); reset();
    return () => { clearTimeout(t); root.removeEventListener('pointerdown', reset, true); };
  }
  // 難度燈號：Lv ●●○（星等由系統依表現決定，只是給孩子看的回饋）
  const lvLights = n => h('span', 'lv', { title: '難度由系統依表現自動調整' }, h('b', null, { text: 'Lv' }), [1, 2, 3].map(i => h('i', i <= n ? 'on' : '')));
  // opts.focus：只出這些知識點（學習步道用）；opts.onDone(res)：結束時回呼；opts.back：返回按鈕 [文字, 函式]
  function play(id, stop, opts = {}) {
    const game = K.games[id], L = E.L();
    const round = E.newRound(), exits = [];
    const prog = progressUI(game.n), root = h('div', 'groot g-' + id);
    const ctx = {
      game, L, grade: L.gs[game.subj], alive: true, total: game.n, nOpts: L.gs[game.subj] <= 1 ? 3 : 4, note: '', used: round.used, hard: false, focus: opts.focus, data: opts.data,
      pick: () => opts.focus && !round.retry ? { skill: K.skill[K.pick(opts.focus)] } : E.pick(game, round),
      wait: ms => new Promise(r => setTimeout(() => ctx.alive && r(), ms)),
      onExit: f => exits.push(f),
      progress(i, n) { ctx._manual = true; prog.set(i / n); },
      async report(p, ok, ms, info) {
        const demo = E.report(game, round, p.skill, ok, ms, p.probe, info);
        if (!ctx._manual) prog.set(round.answers.length / ctx.total);
        if (demo && ctx.alive) await demoCard(p.skill);
      },
      done() { if (!ctx.alive) return; ctx.exit(true); if (stop != null) { E.route()[stop].done = true; K.store.save(); } const res = E.endRound(game, round); if (opts.onDone) opts.onDone(res); showResult(game, res, ctx.note, opts); },
      exit(finished) {
        ctx.alive = false; exits.forEach(f => f()); cur = null; K.cur = null;
        if (!finished) { E.day().sec += Math.min(600, Math.round((Date.now() - round.start) / 1000)); K.store.save(); }
      }
    };
    const leave = () => { A.sfx('tap'); if (opts.back) { show(h('div')); opts.back[1](); } else showHome(); };
    show(h('div', 'gs s-' + game.subj, null, h('div', 'gbar', null, h('button', 'ib', { text: opts.back ? '↩️' : '🏠', 'aria-label': '離開', onclick: leave }), prog.el, h('div', 'gname', null, h('span', 'gn-t', { text: `${game.icon} ${game.name}` }), lvLights(L.sub[game.subj])), zyBtn()), root));
    cur = ctx; K.cur = ctx;
    // 開場：大大的 ▶（取得手勢才能播音）＋「挑戰難一點」（Starfall 的 Make it Hard：多一個選項、更常出下一級的題目、不出提示小手）
    let manual = false;
    const hardB = h('span', 'hard-tog', { role: 'button', text: '💪 挑戰難一點', onclick: e => { e.stopPropagation(); manual = true; ctx.hard = round.hard = !ctx.hard; hardB.classList.toggle('on', ctx.hard); hardB.textContent = ctx.hard ? '💪 挑戰模式：開' : '💪 挑戰難一點'; A.sfx(ctx.hard ? 'star' : 'tap'); } });
    const intro = h('button', 'intro', null, h('span', 'gi', { text: game.icon }), h('b', null, { text: game.name }), h('span', null, { text: game.desc }), h('small', 'play-big', { text: '▶ 開始' }), opts.focus ? null : hardB);
    root.append(intro);
    const auto = new Promise(r => { A.speak(game.desc).then(() => setTimeout(() => !manual && r(), 400)); setTimeout(() => !manual && r(), 5000); });
    Promise.race([auto, new Promise(r => intro.onclick = r)]).then(() => {
      if (!ctx.alive) return; A.stop(); intro.remove(); round.start = Date.now();
      if (ctx.hard) { ctx.nOpts = Math.min(5, ctx.nOpts + 1); root.classList.add('hard'); }
      game.start(root, ctx).catch(e => console.error(e));
      if (!ctx.hard) exits.push(idleWatch(root, L.gs[game.subj] <= 2 ? 7000 : 10000));
      if (!L.last[game.id]) setTimeout(() => ctx.alive && coach(root.querySelector('.q-snd'), '聽不清楚，按這裡再聽一次'), 1500); // 第一次玩這款：指一下喇叭
    });
  }
  function demoCard(skill) {
    return new Promise(res => {
      const text = skill.demo || '慢慢來，仔細看、仔細聽，再試一次就會了！';
      modal(h('div', 'demo', null, h('div', 'demo-i', { text: '💡' }), h('h2', null, { text: skill.name }), h('p', null, { text }), btn('我知道了 👍', 'pri', () => { A.stop(); closeModal(); res(); })));
      A.speak('我們一起看一下。' + text);
    });
  }
  function reviewWrongs(wrongs) {
    modal(h('div', 'wr', null, h('h2', null, { text: `看看錯的 ${wrongs.length} 題` }), h('p', 'sub', { text: '錯的題目明天還會再出現，再練一次就記住了。' }),
      h('div', 'wr-list', null, wrongs.map(w => h('div', 'wr-it', null, h('b', null, { text: K.skill[w.sid].name }), w.prompt && h('div', 'wr-q', { text: w.prompt.slice(0, 80) }), h('div', null, { html: `正確：<span class="ok">${w.want || '—'}</span>${w.got ? `　你選：<span class="no">${w.got}</span>` : ''}` }), w.why && h('div', 'wr-why', { text: '💡 ' + w.why })))),
      btn('知道了', 'pri', closeModal)));
  }
  // 回合回顧：每一題的題目、正確答案、孩子選的錯答案與說明，可以再聽一次
  function reviewList(log) {
    if (!log || !log.length) return null;
    const wrongN = log.filter(x => !x.ok).length;
    const esc = t => String(t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const clean = html => String(html || '').replace(/<button[\s\S]*?<\/button>/g, '');
    const item = (x, i) => {
      const badge = x.ok ? ['ok', '✅ 答對'] : x.fixed ? ['fix', '💪 改對了'] : ['no', '❌ 再想想'];
      const heard = !x.prompt && (x.say || x.audio);
      const play = () => { A.sfx('tap'); if (x.audio) return A.playFile(x.audio); if (x.say) return A.speak(x.say, x.lang || 'zh-TW', { q: true }); A.say(K.strip(x.ask + ' ' + x.prompt), { q: true }); };
      return h('div', 'rv-it rv-' + badge[0], null,
        h('div', 'rv-top', null, h('b', 'rv-n', { text: i + 1 }), h('span', 'rv-badge', { text: badge[1] }), h('span', 'rv-skill', { text: (K.skill[x.sid] || {}).name || '' }),
          (x.say || x.audio || x.prompt) && h('button', 'rv-snd', { text: '🔊', 'aria-label': '再聽一次', onclick: play })),
        x.ask && h('div', 'rv-ask', { text: x.ask }),
        x.prompt && h('div', 'rv-q', { html: clean(x.prompt) }),
        heard && h('div', 'rv-q rv-heard', { html: `🔊 聽到的是：<b>${esc(x.say || '')}</b>` }),
        h('div', 'rv-ans', null, h('span', 'rv-l', { text: '正確答案' }), h('span', 'rv-v ok', { html: clean(x.wantH) || esc(x.want) || '—' })),
        x.got && h('div', 'rv-ans', null, h('span', 'rv-l', { text: x.fixed ? '一開始選了' : '你選了' }), h('span', 'rv-v no', { html: clean(x.gotH) || esc(x.got) })),
        x.why && !x.ok && h('div', 'rv-why', { text: '💡 ' + K.strip(x.why) }));
    };
    let onlyWrong = false;
    const list = h('div', 'rv-items');
    const paint = () => list.replaceChildren(...log.map(item).filter((_, i) => !onlyWrong || !log[i].ok));
    const tog = wrongN && h('button', 'chip', { text: `只看要再練的 ${wrongN} 題`, onclick: e => { onlyWrong = !onlyWrong; e.currentTarget.classList.toggle('on', onlyWrong); A.sfx('tap'); paint(); } });
    paint();
    return h('section', 'rv', { id: 'rv' }, h('div', 'rv-head', null, h('h2', null, { text: '📖 這一場的回顧' }), tog),
      h('p', 'sub', { text: wrongN ? '看一看正確答案，按 🔊 再聽一次，下次就記住了！' : '全部都會了！再看一次加深印象。' }), list);
  }
  function showResult(game, res, note, opts = {}) {
    const acc = res.n ? res.r / res.n : 0, st = acc >= .9 ? 3 : acc >= .7 ? 2 : 1, route = E.route(), nx = nextStop();
    const body = h('div', 'result', null, h('div', 'r-stars', { text: stars(st) }), h('h1', null, { text: st === 3 ? '太厲害了！' : st === 2 ? '做得很好！' : '完成了！繼續加油！' }),
      res.n > 0 && h('p', 'r-score', { text: `自己答對 ${res.r} / ${res.n} 題` }), note && h('p', 'r-note', { text: note }),
      res.fixed > 0 && h('p', 'r-good', { text: `💪 有 ${res.fixed} 題看了提示後自己改對了！` }),
      res.ev > 0 && h('p', 'r-good', { text: `🔎 找到 ${res.ev} 個證據！` }),
      res.skills.length && h('p', null, { text: '今天練習了：' + K.uniq(res.skills).slice(0, 4).join('、') }),
      res.grew.length && h('p', 'r-good', { text: '📈 進步了：' + res.grew.slice(0, 3).join('、') }),
      res.mastered.length && h('p', 'r-good', { text: '⭐ 精熟了：' + res.mastered.join('、') }),
      res.up && h('p', 'r-good', { text: `⭐ ${SUBJ[game.subj].n}升級到 ${res.up} 顆星！` }),
      res.gradeUp && h('p', 'r-good', { text: `🚀 ${SUBJ[game.subj].isle}開放了新的區域！` }),
      res.sticker && h('p', 'r-sticker', null, '🎁 小島多了新裝飾 ', h('span', 'big-st', { text: res.sticker })),
      res.hard && h('p', 'r-good', { text: '💪 挑戰模式完成！金幣加倍' }),
      res.coins > 0 && h('p', 'r-coin', { text: `🪙 +${res.coins}（共 ${E.L().coins || 0} 枚，可以到賽車車庫升級）` }),
      nx < 0 && route.some(s => s.done) && E.day().rounds <= route.length + 1 && h('p', 'r-note', { text: '🎉 今天的冒險全部完成了！' }),
      h('div', 'row', null,
        res.log && res.log.length > 0 && btn(`📖 回顧這一場（${res.log.length} 題）`, '', () => document.getElementById('rv').scrollIntoView({ behavior: 'smooth' })),
        game.subj && btn('🔁 再玩一次', '', () => E.overLimit() && !calm(game) ? showHome() : play(game.id, null, opts)),
        opts.back ? btn(opts.back[0], 'pri', opts.back[1]) : btn('🏠 回小島', nx >= 0 ? '' : 'pri', showHome),
        !opts.back && nx >= 0 && !E.overLimit() && btn(`➡️ 下一站：${stopInfo(route[nx]).n}`, 'pri', () => runStop(nx))));
    show(h('div', 'screen center rv-screen', null, body, reviewList(res.log)));
    A.sfx('win');
    setTimeout(() => A.speak(`${st === 3 ? '太厲害了！' : '做得很好！'}` + (res.fixed ? `你有${res.fixed}題自己改對了，這樣最棒！` : '') + (res.skills.length ? `今天你練習了${res.skills[0]}。` : '') + (res.mastered.length ? `你精熟了${res.mastered[0]}！` : '') + (res.sticker ? '小島多了一個新裝飾！' : '')), 700);
    if (Date.now() - lastBreak > 15 * 60000) {
      lastBreak = Date.now();
      setTimeout(() => { modal(h('div', 'demo', null, h('div', 'demo-i', { text: K.pet().e + '💤' }), h('h2', null, { text: '我有點累了，一起休息一下吧！' }), h('p', null, { text: '看看遠方、喝口水、動一動身體。' }), btn('好！', 'pri', closeModal))); A.speak('我有點累了，一起休息一下吧！看看遠方，喝口水。'); }, 3500);
    }
  }

  // ---------- 跨遊戲關卡：快複習／魔王（三顆心）／小檢定／起點診斷 ----------
  function quiz(mode, stop) {
    const L = E.L(), today = K.today(), wk = K.addDays(today, -7), boss = mode === 'boss', diag = mode === 'diag';
    const level = K.skills.filter(s => E.eligible(s, L) && s.g === L.gs[s.subj]);
    const fallback = level.length ? level : K.skills.filter(s => s.g === 1 && s.sub === 1);
    let pool, n = 10;
    if (boss) pool = K.skills.filter(s => L.skills[s.id] && L.skills[s.id].last >= wk);
    else if (mode === 'review') { pool = E.due(); n = 5; }
    else if (diag) { n = 12; pool = level; }
    else pool = level;
    if (pool.length < 3) pool = fallback;
    const names = { boss: '魔王挑戰', review: '快複習', test: '小檢定', diag: '小探險' };
    const game = { id: mode, name: names[mode], n, app: boss }, round = E.newRound();
    const theme = [['🐙', '海底', 'sea'], ['👾', '太空', 'space'], ['🐲', '森林', 'forest']][Math.floor(Date.now() / 6048e5) % 3];
    const fill = h('i'), bar = h('div', 'pbar', null, fill), root = h('div', 'groot quiz' + (boss ? ' boss-' + theme[2] : ''));
    const foe = h('div', 'boss-foe', null, h('span', 'bf', { text: theme[0] }), h('span', 'hp', null, h('i'))), hearts = h('div', 'hearts', { text: '❤️❤️❤️' }), top = h('div', 'g-top'), work = h('div', 'quiz-work');
    const single = mode === 'test' || diag;
    let alive = true, hp = 10, life = 3;
    show(h('div', 'gs s-boss', null, h('div', 'gbar', null, h('button', 'ib', { text: '🏠', onclick: () => { A.sfx('tap'); mode === 'test' ? showParent() : showHome(); } }), bar, boss && hearts, h('div', 'gname', { text: boss ? `👑 ${theme[1]}魔王` : mode === 'review' ? '🔁 快複習' : diag ? '🧭 小探險' : '📝 小檢定' }), zyBtn()), root));
    cur = { exit() { alive = false; cur = null; K.cur = null; } }; K.cur = { used: round.used, grade: Math.min(...Object.values(L.gs)) };
    if (boss) root.append(foe); root.append(top, work);
    if (boss) A.speak(`${theme[1]}魔王出現了！答對題目就能打敗牠，答錯會被攻擊喔！`);
    if (mode === 'review') A.speak('先來複習一下之前學過的！');
    const order = K.shuffle(['en', 'ma', 'zh']), used = new Set();
    // 診斷：每科二分搜尋起點
    const dg = {}; if (diag) for (const s of order) dg[s] = { g: L.gs[s], step: 0, ups: 0, downs: 0 };
    const diagNext = () => {
      for (const s of order) { const d = dg[s]; if (d.step >= 4 || d.doneS) continue; const want = K.skills.filter(k => k.subj === s && k.g === d.g && k.sub === (d.step % 2 ? 2 : 1) && !used.has(k.id)); if (want.length) return { s, skill: K.pick(want) }; d.step++; }
      return null;
    };
    (async () => {
      for (let i = 0; i < n && alive; i++) {
        let skill, ds = null;
        if (diag) { const x = diagNext(); if (!x) break; ds = dg[x.s]; skill = x.skill; }
        else if (round.retry && boss) skill = round.retry;
        else { const want = pool.filter(s => s.subj === order[i % 3] && !used.has(s.id)), rest = pool.filter(s => !used.has(s.id)); skill = K.pick(want.length ? want : rest.length ? rest : pool); }
        round.retry = null; used.add(skill.id);
        const q = K.mcq(skill, { n: 4 });
        top.replaceChildren(K.ui.prompt(q)); work.replaceChildren();
        if (single) { const hb = top.querySelector('.q-help'); if (hb) hb.remove(); }
        if (i || !(boss || mode === 'review')) K.sayQ(q); else setTimeout(() => alive && K.sayQ(q), 2800);
        const r = await K.ui.choice(work, q, { single });
        if (!alive) return;
        const demo = E.report(game, round, skill, r.ok, r.ms, false, r);
        fill.style.width = (i + 1) / n * 100 + '%';
        if (boss) {
          if (r.ok || r.fixed) { hp--; foe.querySelector('.hp i').style.width = hp * 10 + '%'; foe.classList.remove('hit'); void foe.offsetWidth; foe.classList.add('hit'); }
          else { life--; hearts.textContent = '❤️'.repeat(life) + '🖤'.repeat(3 - life); root.classList.remove('shake'); void root.offsetWidth; root.classList.add('shake'); A.sfx('hit'); if (life <= 0) { await new Promise(r => setTimeout(r, 900)); break; } }
        }
        if (diag && ds) { // 兩題都對 → 往上試；兩題都錯 → 往下試
          ds.res = (ds.res || []).concat(r.ok);
          if (ds.res.length === 2) {
            const [a, b] = ds.res; ds.res = [];
            if (a && b) { if (ds.ups === 0 && ds.g < 6 && ds.downs === 0) { ds.g++; ds.ups++; ds.step = 0; } else { ds.doneS = true; ds.final = { g: ds.g, sub: ds.ups ? 1 : 2 }; } }
            else if (!a && !b) { if (ds.downs === 0 && ds.g > 1 && ds.ups === 0) { ds.g--; ds.downs++; ds.step = 0; } else { ds.doneS = true; ds.final = { g: ds.g, sub: 1 }; } }
            else { ds.doneS = true; ds.final = { g: ds.g, sub: 1 }; }
            if (ds.ups && ds.doneS && !(a && b)) ds.final = { g: ds.g - 1, sub: 3 }; // 上一年級全對、這年級沒全對 → 回到上一年級 ★★★
            if (ds.downs && ds.doneS && (a || b)) ds.final = { g: ds.g, sub: 2 };
          }
        }
        if (demo && !single) await demoCard(skill);
      }
      if (!alive) return;
      cur = null; K.cur = null;
      if (stop != null) { E.route()[stop].done = true; K.store.save(); }
      if (boss || mode === 'review') {
        const res = E.endRound(game, round); if (boss) E.day().boss = true; K.store.save();
        showResult(game, res, boss ? (life > 0 && hp <= 3 ? `${theme[0]} 打敗${theme[1]}魔王了！` : life <= 0 ? `${theme[0]} 這次被魔王打敗了，休息一下再來挑戰！` : `${theme[0]} 魔王逃走了，下次再挑戰！`) : '🔁 複習完成，記得更牢了！');
      } else if (diag) {
        for (const s of order) { const d = dg[s]; const f = d.final || { g: d.g, sub: d.ups ? 1 : 1 }; L.gs[s] = Math.max(1, Math.min(6, f.g)); L.sub[s] = f.sub || 1; L.recent[s] = []; }
        delete E.day().route; K.store.save();
        show(h('div', 'screen center', null, h('div', 'result', null, h('div', 'demo-i', { text: '🧭' }), h('h1', null, { text: '找到你的起點了！' }), h('p', null, { text: Object.keys(SUBJ).map(s => `${SUBJ[s].n}：${lvText(L, s)}`).join('　') }), h('p', 'sub', { text: '之後會依表現自動調整，爸媽也可以在家長專區修改。' }), btn('前往小島', 'pri', showHome))));
        A.speak('找到你的起點了！我們出發吧！');
      } else {
        const by = {}; round.answers.forEach(a => { const s = K.skill[a.sid].subj, b = by[s] || (by[s] = [0, 0]); b[1]++; if (a.ok) b[0]++; });
        const r = round.answers.filter(a => a.ok).length;
        L.tests.push({ d: today, r, n: round.answers.length, by, g: L.grade }); K.store.save();
        show(h('div', 'screen center rv-screen', null, h('div', 'result', null, h('h1', null, { text: '小檢定完成！' }), h('p', 'r-score', { text: `答對 ${r} / ${round.answers.length} 題` }), h('p', null, { text: '結果已記錄在家長專區。' }), h('div', 'row', null, round.log.length > 0 && btn(`📖 回顧這一場（${round.log.length} 題）`, '', () => document.getElementById('rv').scrollIntoView({ behavior: 'smooth' })), btn('回家長專區', 'pri', showParent))), reviewList(round.log)));
      }
    })();
  }

  // ---------- 我的島：寵物、裝飾系列、能力地圖 ----------
  function showCollection() {
    const L = E.L(), pet = K.pet(), ex = L.theme === 'explorer';
    const map = h('div', 'card');
    for (const s in SUBJ) {
      const list = K.skills.filter(k => k.subj === s && (k.g === L.gs[s] ? k.sub <= L.sub[s] : L.skills[k.id] && L.skills[k.id].last)).sort((a, b) => a.g * 10 + a.sub - b.g * 10 - b.sub);
      map.append(h('h4', null, { text: `${SUBJ[s].i} ${SUBJ[s].isle}　${lvText(L, s)}` }), h('div', 'chips', null, list.map(k => { const st = E.stage(k.id); return h('span', 'badge st' + st, { text: `${K.STAGES[st][0]} ${k.name}` }); })));
    }
    const sets = K.STICKER_SETS.map(([name, emo]) => { const all = [...emo.matchAll(/\p{Extended_Pictographic}️?/gu)].map(m => m[0]), own = all.filter(x => L.stickers.includes(x)).length; return h('div', 'card', null, h('h4', null, { text: `${name}　${own} / ${all.length}${own === all.length ? '　🏆 集滿了！' : ''}` }), h('div', 'stickers', null, all.map(x => h('span', L.stickers.includes(x) ? 'on' : '', { text: L.stickers.includes(x) ? x : '❔' })))); });
    show(h('div', 'screen', null,
      h('div', 'hm-head', null, btn('🏠 回小島', '', showHome)),
      h('div', 'pet-card', null, h('div', 'pet-big', { text: pet.e }), h('h2', null, { text: pet.name }), h('p', null, { text: pet.next ? `已精熟 ${pet.n} 個本領，精熟 ${pet.next} 個就會進化！` : `已精熟 ${pet.n} 個本領，是最強的神龍了！` }), h('div', 'pet-steps', null, K.PETS.map(p => h('span', pet.n >= p[0] ? 'on' : '', { text: p[1] }))),
        h('p', 'sub', { text: `💪 自己改對 ${L.bonus.fix} 題　🔎 找到證據 ${L.bonus.ev} 次　🔁 完成複習 ${L.bonus.rev} 次` })),
      h('h2', 'sec', { text: ex ? '🧭 能力地圖' : '🗺️ 我的能力地圖' }), h('p', 'sub', { text: '🌱 新手 → 🌿 熟悉 → 🌳 穩定 → ⭐ 精熟（隔天、隔一週都還記得才算精熟）' }), map,
      h('h2', 'sec', { text: `🎁 收藏（${L.stickers.length} / ${K.STICKERS.length}）` }), sets));
    A.speak(`這是你的${ex ? '基地' : '小島'}和${pet.name}。你有${L.stickers.length}個收藏！`);
  }

  // ---------- 家長專區 ----------
  function parentGate() {
    const S = K.store.data.settings, a = K.rand(12, 49), b = K.rand(3, 9), inp = h('input', 'inp', { type: 'number', inputmode: 'numeric', placeholder: S.pin ? '四位數密碼' : '答案' });
    const go = () => { if ((S.pin && inp.value === S.pin) || (!S.pin && +inp.value === a * b)) { closeModal(); showParent(); } else { inp.value = ''; A.sfx('bad'); } };
    inp.addEventListener('keydown', e => e.key === 'Enter' && go());
    let timer = null;
    const hold = h('button', 'btn pri hold', { text: '按住 2 秒' });
    const start = () => { hold.classList.add('on'); timer = setTimeout(() => { timer = null; hold.replaceWith(h('div', null, null, h('p', null, { text: S.pin ? '請輸入家長密碼' : `請回答：${a} × ${b} = ?` }), inp, h('div', 'row', null, btn('進入', 'pri', go)))); inp.focus(); }, 2000); };
    const stop = () => { hold.classList.remove('on'); if (timer) { clearTimeout(timer); timer = null; } };
    hold.addEventListener('pointerdown', start); hold.addEventListener('pointerup', stop); hold.addEventListener('pointerleave', stop); hold.addEventListener('pointercancel', stop);
    modal(h('div', null, null, h('h2', null, { text: '家長專區' }), h('p', 'sub', { text: '給爸爸媽媽用的設定與報告' }), hold, h('div', 'row', null, btn('取消', '', closeModal))));
  }
  const dl = (name, text, type) => { const a = h('a', null, { href: URL.createObjectURL(new Blob([text], { type })), download: name }); document.body.append(a); a.click(); a.remove(); };
  const topErr = t => { const ks = Object.keys(t.conf || {}); return ks.length ? ks.sort((x, y) => t.conf[y] - t.conf[x])[0] : ''; };
  // 同步碼：壓縮 + base64，可用訊息軟體傳到另一台裝置
  async function makeSync() {
    const json = JSON.stringify(K.store.data), bytes = new TextEncoder().encode(json);
    if ('CompressionStream' in window) { const cs = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip')); const buf = await new Response(cs).arrayBuffer(); return 'KLZ:' + btoa(String.fromCharCode(...new Uint8Array(buf))); }
    return 'KL1:' + btoa(unescape(encodeURIComponent(json)));
  }
  async function readSync(code) {
    code = code.trim();
    if (code.startsWith('KLZ:')) { const bin = Uint8Array.from(atob(code.slice(4)), c => c.charCodeAt(0)); const ds = new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip')); return JSON.parse(await new Response(ds).text()); }
    if (code.startsWith('KL1:')) return JSON.parse(decodeURIComponent(escape(atob(code.slice(4)))));
    return JSON.parse(code);
  }
  function voiceCard() {
    const S = K.store.data.settings, D = K.store.data;
    const vs = A.voices(), en = vs.filter(v => /^en/i.test(v.lang)), zh = A.zhVoices(), tw = zh.filter(A.isTW);
    const sel = (opts, val, on) => { const s = h('select', 'inp sm', { onchange: e => { on(e.target.value); K.store.save(); } }, opts.map(([v, t]) => h('option', null, { value: v, text: t }))); s.value = String(val); return s; };
    const test = (lang, text) => btn('🔊 試聽', '', () => A.speak(text, lang, { q: true }));
    const vname = v => `${A.isTW(v) ? '🇹🇼 ' : ''}${v.name}${v.localService === false ? '（網路）' : ''}`;
    const pct = v => Math.round(v * 100) + '%';
    const slider = (key, label, sample) => {
      const out = h('b', 'vol-v', { text: pct(S[key]) });
      return h('label', 'vol', null, h('span', null, { text: label }), h('input', null, { type: 'range', min: 0, max: 100, step: 5, value: Math.round(S[key] * 100), oninput: e => { S[key] = +e.target.value / 100; out.textContent = pct(S[key]); }, onchange: () => { K.store.save(); sample(); } }), out);
    };
    const RATES = [[.6, '很慢'], [.75, '慢'], [.85, '稍慢'], [.95, '正常'], [1.1, '快']];
    const near = v => RATES.reduce((a, r) => Math.abs(r[0] - v) < Math.abs(a - v) ? r[0] : a, RATES[0][0]);
    const cur = A.voice('zh-TW');
    return h('div', 'card', null, h('h3', null, { text: '🔊 語音與音量' }),
      h('p', 'sub', { text: `這台裝置的語音：臺灣中文 ${tw.length ? '✓ ' + tw.length + ' 種' : '✗ 沒有'}　英文 ${en.length ? '✓ ' + en.length + ' 種' : '✗ 沒有'}。沒有語音時，聽力題會改成顯示文字。` }),
      h('h4', null, { text: '英文' }),
      h('div', 'frow', null, h('span', null, { text: '口音' }), sel([['US', '美國'], ['UK', '英國']], S.enAccent, v => { S.enAccent = v; S.enVoice = ''; showParent(); }), h('span', null, { text: '聲音' }), sel([['f', '女生'], ['m', '男生']], S.enGender, v => { S.enGender = v; S.enVoice = ''; showParent(); })),
      h('div', 'frow', null, h('span', null, { text: '英文語速' }), sel(RATES, near(S.enRate), v => { S.enRate = +v; A.speak('apple. banana. Hello! How are you?', 'en-US', { q: true }); }), test('en-US', 'A, B, C. Hello! I am your English teacher. Nice to meet you.')),
      h('div', 'frow', null, h('span', null, { text: '指定英文語音' }), sel([['', `自動（目前：${(A.voice('en-US') || {}).name || '無'}）`]].concat(en.map(v => [v.name, `${vname(v)} · ${v.lang}`])), S.enVoice, v => S.enVoice = v)),
      h('h4', null, { text: '中文' }),
      h('div', 'frow', null, h('span', null, { text: '中文語速' }), sel(RATES, near(S.zhRate), v => { S.zhRate = +v; A.speak('我有兩個蘋果，你有幾個？', 'zh-TW', { q: true }); }), test('zh-TW', '你好，我是小小學習家。我有兩個蘋果和二十二顆糖果。'), btn('🔊 試聽注音', '', () => K.sayQ({ audio: K.BPMF_FILE['ㄅ'], say: '玻' }))),
      h('div', 'frow', null, h('span', null, { text: '指定中文語音' }), sel([['', `自動（目前：${cur ? vname(cur) : '無'}）`]].concat(zh.map(v => [v.name, `${vname(v)} · ${v.lang}`])), S.zhVoice, v => S.zhVoice = v)),
      cur && !A.isTW(cur) && h('p', 'warn', { text: '⚠️ 目前用的不是臺灣中文語音，發音會比較像大陸口音。請依下面的說明安裝「中文（臺灣）」語音。' }),
      h('h4', null, { text: '音量' }),
      slider('volQ', '題目（單字、字母、注音）', () => A.speak('A. B. apple.', 'en-US', { q: true })),
      slider('volT', '說明與鼓勵', () => A.speak('做得很好！', 'zh-TW')),
      slider('volS', '音效', () => A.sfx('ok')),
      h('p', 'sub', { text: '題目已經是最大聲時，可以把「說明與鼓勵」和「音效」調小一點，題目聽起來就會比較清楚。裝置本身的音量也要開大。' }),
      h('details', 'det', null, h('summary', null, { text: '怎麼讓發音更像臺灣人？' }),
        h('p', 'sub', { text: '電腦：用 Microsoft Edge 開啟，會自動使用「HsiaoChen／HsiaoYu／YunJhe（自然語音）」等臺灣語音，最自然。Windows 也可在「設定 → 時間與語言 → 語音 → 新增語音」安裝「中文（台灣）」。' }),
        h('p', 'sub', { text: 'iPad／iPhone：「設定 → 輔助使用 → 朗讀內容 → 聲音 → 中文 → 中文（台灣）」下載「美佳」（增強版更自然）；英文可下載 Samantha、Daniel。' }),
        h('p', 'sub', { text: 'Android：「設定 → 一般管理 → 文字轉語音」，引擎選 Google，語言選「中文（台灣）」並下載語音資料。' }),
        h('p', 'sub', { text: '注音符號使用教育部開放音檔，不受裝置影響。' })));
  }
  let pTab = 'report';
  function showParent() {
    const L = E.L(), D = K.store.data, S = D.settings, today = K.today();
    const sel = (opts, val, on) => { const s = h('select', 'inp sm', { onchange: e => { on(e.target.value); K.store.save(); } }, opts.map(([v, t]) => h('option', null, { value: v, text: t }))); s.value = val; return s; };
    const tog = (label, key, obj) => { obj = obj || S; return h('label', 'tog', null, h('input', null, Object.assign({ type: 'checkbox', onchange: e => { obj[key] = e.target.checked; K.store.save(); applyPrefs(); } }, obj[key] ? { checked: '' } : {})), ' ' + label); };
    const set = h('div', 'card', null, h('h3', null, { text: `⚙️ ${L.avatar} ${L.name} 的設定` }),
      h('div', 'frow', null, h('span', null, { text: '各科目前程度' }), Object.keys(SUBJ).map(s => h('label', 'tog', null, SUBJ[s].n, sel(GN.slice(1).map((g, i) => [i + 1, g]), L.gs[s], v => { L.gs[s] = +v; L.sub[s] = 1; L.recent[s] = []; L.hi[s] = 0; delete E.day().route; }), sel([[1, '★'], [2, '★★'], [3, '★★★']], L.sub[s], v => { L.sub[s] = +v; L.recent[s] = []; })))),
      h('p', 'sub', { text: '系統會依表現自動升降；孩子程度超前或落後時可直接在這裡調整。' }),
      h('div', 'frow', null, h('span', null, { text: '每日上限' }), sel([[0, '不限制'], [10, '10 分鐘'], [15, '15 分鐘'], [20, '20 分鐘'], [30, '30 分鐘'], [45, '45 分鐘']], L.limit, v => L.limit = +v),
        btn('今天再加 10 分鐘', '', () => { L.extra[today] = (L.extra[today] || 0) + 10; K.store.save(); showParent(); })),
      h('div', 'frow', null, h('span', null, { text: '主題' }), sel([['kid', '小島與寵物（低年級）'], ['explorer', '探險家（高年級）']], L.theme, v => { L.theme = v; applyPrefs(); })),
      h('div', 'frow', null, tog('題目加注音', 'zy', L), tog('自動唸出題目（算式、文字題）', 'autoRead', L)),
      h('p', 'sub', { text: '注音會標在題目和選項上方；考注音、考讀音的題目不會標，以免直接看到答案。遊戲中也可以按右上角的「ㄅ」開關。' }),
      h('div', 'frow', null, tog('音效', 'sfx'), tog('語音旁白', 'voice'), tog('震動回饋', 'vib'), tog('畫面動態', 'motion'), tog('大字模式', 'big')),
      h('div', 'frow', null, h('span', null, { text: '家長密碼（四位數，留空則用乘法題）' }), h('input', 'inp sm', { type: 'number', inputmode: 'numeric', value: S.pin, placeholder: '例如 1234', onchange: e => { S.pin = /^\d{4}$/.test(e.target.value) ? e.target.value : ''; K.store.save(); } })));
    const week = Array.from({ length: 7 }, (_, i) => K.addDays(today, i - 6)), mins = week.map(d => Math.round(((L.days[d] || {}).sec || 0) / 60)), mx = Math.max(10, ...mins), WD = ['日', '一', '二', '三', '四', '五', '六'];
    const td = E.day(), tskills = K.skills.filter(k => L.skills[k.id] && L.skills[k.id].last === today), kept = K.skills.filter(k => E.stage(k.id) === 3).length;
    const usage = h('div', 'card', null, h('h3', null, { text: '📅 今天與最近 7 天' }),
      h('p', null, { text: `今天：有效學習 ${mins[6]} 分鐘，作答 ${Object.values(td.by).reduce((a, b) => a + b[1], 0)} 題` + (tskills.length ? `，練習了 ${tskills.slice(0, 5).map(k => k.name).join('、')}${tskills.length > 5 ? '…' : ''}` : '') }),
      h('p', null, { text: `最近 7 天玩了 ${mins.filter(m => m > 0).length} 天、共 ${mins.reduce((a, b) => a + b, 0)} 分鐘。已精熟（隔日與隔週都保留）的技能：${kept} 個。` }),
      h('div', 'bars', null, week.map((d, i) => h('div', 'bar', null, h('i', null, { style: `height:${mins[i] / mx * 100}%` }), h('small', null, { text: `${d.slice(5).replace('-', '/')}${WD[new Date(d + 'T12:00:00').getDay()]}` })))));
    const wkAcc = (w, s) => { let r = 0, n = 0; for (let i = 0; i < 7; i++) { const d = L.days[K.addDays(today, -(w * 7 + i))]; if (d && d.by) { r += d.by[s][0]; n += d.by[s][1]; } } return n >= 5 ? Math.round(r / n * 100) + '%' : '—'; };
    const trend = h('div', 'card', null, h('h3', null, { text: '📈 近 4 週獨立答對率' }), h('p', 'sub', { text: '只計算「第一次、沒看提示就答對」的題目。少於 5 題的週次顯示 —。' }),
      h('table', 'tbl', null, h('tr', null, null, ['', '3 週前', '2 週前', '上週', '本週'].map(t => h('th', null, { text: t }))), Object.keys(SUBJ).map(s => h('tr', null, null, h('td', null, { text: SUBJ[s].n }), [3, 2, 1, 0].map(w => h('td', null, { text: wkAcc(w, s) }))))));
    const wrong = K.skills.map(k => ({ k, t: L.skills[k.id] })).filter(x => x.t && x.t.w >= 2).sort((a, b) => b.t.w / (b.t.r + b.t.w) - a.t.w / (a.t.r + a.t.w)).slice(0, 5);
    const sugg = [], dueN = E.due().length;
    if (dueN) sugg.push(`有 ${dueN} 個技能到了該複習的時間，明天先做「快複習」約 2 分鐘。`);
    wrong.forEach(x => x.k.tip && sugg.push(`${x.k.name}：${x.k.tip}`));
    if (!sugg.length) sugg.push('目前沒有特別需要加強的地方，維持每天 15 分鐘就很棒！');
    const weak = h('div', 'card', null, h('h3', null, { text: '🎯 卡住的地方與錯誤型態' }),
      wrong.length ? h('ol', null, null, wrong.map(x => h('li', null, { text: `${SUBJ[x.k.subj].n}｜${x.k.name}（${K.STAGES[E.stage(x.k.id)][1]}，掌握度 ${Math.round(x.t.score)}）` + (topErr(x.t) ? `　常見錯誤：${topErr(x.t)}` : '') }))) : h('p', 'sub', { text: '還沒有足夠的資料。' }),
      h('h3', null, { text: '💡 下一步建議' }), h('ul', null, null, sugg.slice(0, 5).map(t => h('li', null, { text: t }))),
      h('p', 'sub', { text: `學習行為：看提示後自己改對 ${L.bonus.fix} 題｜閱讀找到證據 ${L.bonus.ev} 次｜完成複習 ${L.bonus.rev} 次` }));
    const heat = h('div', 'card', null, h('h3', null, { text: '🗺️ 技能地圖' }), h('p', 'sub', { html: '<span class="chip k0">未開始</span> <span class="chip k1">新手／熟悉</span> <span class="chip k2">穩定</span> <span class="chip k3">精熟</span>　點一下看詳細' }));
    const detail = h('p', 'detail', { text: '' });
    for (const s in SUBJ) {
      heat.append(h('h4', null, { text: `${SUBJ[s].i} ${SUBJ[s].n}　目前 ${lvText(L, s)}` }), h('div', 'chips', null, K.skills.filter(k => k.subj === s && k.g <= L.gs[s]).sort((a, b) => a.g * 10 + a.sub - b.g * 10 - b.sub).map(k => {
        const t = L.skills[k.id], st = E.stage(k.id), pc = a => a && a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length * 100) + '%' : '—';
        return h('button', 'chip k' + (!t || !t.last ? 0 : st <= 1 ? 1 : st), { text: `${k.g}${'★'.repeat(k.sub)} ${k.name}`, onclick: () => { detail.textContent = t && t.last ? `${k.name}：${K.STAGES[st][1]}，掌握度 ${Math.round(t.score)}。近期獨立答對 ${pc(t.rec)}、隔日保留 ${pc(t.dl)}、情境應用 ${pc(t.ap)}、用提示比例 ${pc(t.hint)}。下次複習 ${t.due || '—'}。` + (topErr(t) ? `常見錯誤：${topErr(t)}。` : '') : `${k.name}：還沒練習過`; } });
      })));
    }
    heat.append(detail);
    const tests = h('div', 'card', null, h('h3', null, { text: '📝 小檢定（10 題，約 3 分鐘，不給提示）' }), h('p', 'sub', { text: '建議每月一次，由孩子自己作答，用來對照學習成效。' }),
      L.tests.length ? h('ul', null, null, L.tests.slice(-6).map(t => h('li', null, { text: `${t.d}（${GN[t.g]}）：${t.r} / ${t.n}　` + Object.keys(t.by).map(s => `${SUBJ[s].n} ${t.by[s][0]}/${t.by[s][1]}`).join('、') }))) : h('p', 'sub', { text: '還沒有檢定紀錄。' }),
      h('div', 'frow', null, btn('開始小檢定', 'pri', () => quiz('test')), btn('重做起點診斷', '', () => quiz('diag'))));
    const syncIn = h('textarea', 'inp', { placeholder: '把另一台裝置的同步碼貼在這裡', rows: 3 });
    const file = h('input', null, { type: 'file', accept: '.json,application/json,.txt', style: 'display:none', onchange: e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => importData(t)); } });
    const importData = async t => { try { const d = await readSync(t); if (!d.learners) throw 0; if (confirm('匯入會取代這台裝置上的所有紀錄，確定嗎？')) { localStorage.setItem('kidlearn.v1', JSON.stringify(d)); K.store.load(); showProfiles(); } } catch (x) { alert('格式不正確或已損毀'); } };
    const backup = h('div', 'card', null, h('h3', null, { text: '💾 備份、同步與資料' }), h('p', 'sub', { text: '資料只存在這台裝置的瀏覽器裡。換裝置或清除瀏覽器資料前，請先備份或複製同步碼。' }),
      h('div', 'frow', null, btn('📋 複製同步碼', 'pri', async () => { const c = await makeSync(); try { await navigator.clipboard.writeText(c); toast('同步碼已複製，貼到另一台裝置的家長專區即可還原'); } catch (e) { prompt('請複製這段同步碼：', c); } }),
        navigator.share && btn('📤 分享同步碼', '', async () => { try { await navigator.share({ title: '小小學習家同步碼', text: await makeSync() }); } catch (e) { } }),
        btn('匯出備份檔', '', () => dl(`kidlearn-backup-${today}.json`, JSON.stringify(D), 'application/json')), btn('匯入備份檔', '', () => file.click()), file),
      syncIn, h('div', 'frow', null, btn('用同步碼還原', '', () => syncIn.value.trim() && importData(syncIn.value))),
      h('div', 'frow', null,
        btn('匯出技能紀錄 CSV', '', () => dl(`kidlearn-${L.name}-${today}.csv`, '﻿科目,年級,子級,知識點,階段,掌握度,答對,答錯,隔日保留,提示比例,復習盒,最近練習,常見錯誤\n' + K.skills.filter(k => L.skills[k.id]).map(k => { const t = L.skills[k.id], m = a => a && a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(2) : ''; return [SUBJ[k.subj].n, k.g, k.sub, k.name, K.STAGES[E.stage(k.id)][1], Math.round(t.score), t.r, t.w, m(t.dl), m(t.hint), t.box, t.last || '', topErr(t)].join(','); }).join('\n'), 'text/csv')),
        btn('匯出作答事件 CSV', '', () => dl(`kidlearn-events-${L.name}-${today}.csv`, '﻿時間,遊戲,知識點,獨立答對,秒數,用提示\n' + L.log.map(e => [new Date(e[0]).toLocaleString('zh-TW').replace(/,/g, ''), (K.games[e[1]] || {}).name || e[1], (K.skill[e[2]] || {}).name || e[2], e[3], e[4], e[5]].join(',')).join('\n'), 'text/csv')),
        btn('列印報告', '', () => window.print())),
      h('div', 'frow', null, btn('刪除這位小朋友', 'danger', () => { if (confirm(`確定刪除「${L.name}」的所有紀錄嗎？無法復原。`)) { D.learners = D.learners.filter(x => x !== L); D.current = null; K.store.save(); showProfiles(); } })));
    const about = h('div', 'card', null, h('h3', null, { text: '📲 安裝與更新' }), h('p', 'sub', { html: 'iPhone／iPad：用 Safari 開啟 → 分享按鈕 → 「加入主畫面」。<br>Android：用 Chrome 開啟 → 選單 → 「安裝應用程式」或「加到主畫面」。<br>安裝後可離線使用；有新版本時畫面下方會出現更新提示。' }),
      h('div', 'frow', null, btn('檢查更新', '', async () => { if (swReg) { await swReg.update(); toast('已檢查，有新版本時會出現提示'); } else toast('目前不是安裝版'); }), h('span', 'sub', { text: `版本 ${VERSION}｜知識點 ${K.skills.length} 個｜遊戲 ${Object.values(K.games).filter(g => !g.hidden).length} 款` })),
      h('p', 'sub', { html: '素材來源：注音音檔 © 2017 教育部《國語注音符號手冊》開放部件（CC BY 4.0）；筆順 Hanzi Writer（MIT）與 Make Me a Hanzi；字型 LXGW WenKai TC、Andika（SIL OFL）；英文字彙依教育部「國民中小學英語基本字詞」。' }));
    const help = h('div', 'card', null, h('h3', null, { text: '📖 使用說明' }), h('p', 'sub', { text: '家長端與小朋友端的操作教學、常見問題。' }),
      h('div', 'frow two', null, btn('📖 使用手冊', 'soft', () => K.help.manual()), btn('🎪 重看介紹', 'soft', () => K.help.intro())));
    const fb = h('div', 'card', null, h('h3', null, { text: '💬 意見回饋' }), h('p', 'sub', { text: '用起來哪裡卡卡的、哪題有錯、想要什麼功能，都告訴我。你的建議會直接影響下一版怎麼做。' }),
      btn('我有話想說 💬', 'pri wide', () => K.help.feedback()));
    // 分頁：報告／技能地圖／設定／資料
    // 內容：學習步道與故事屋的進度、所有遊戲的文字總覽（Starfall 的 Accessible Version：家長不用玩也能看懂內容）
    const books = L.books || {}, lp = K.lessons ? K.lessons.progress() : [];
    const content = h('div', 'card', null, h('h3', null, { text: '📚 學習步道與故事屋' }),
      h('ul', null, null, lp.map(t => h('li', null, { text: `${t.n}：完成 ${t.done} / ${t.all} 課（每課＝認識＋小書＋遊戲）` }))),
      h('p', null, { text: `故事屋：讀過 ${Object.keys(books).length} / ${(K.BOOKS || []).length} 本` + (Object.keys(books).length ? '　' + Object.keys(books).map(id => { const b = K.BOOKS.find(x => x.id === id); return b ? `《${b.title}》${'★'.repeat(books[id].best)}` : ''; }).join('、') : '') }),
      h('p', 'sub', { text: `賽車車庫：金幣 ${L.coins || 0} 枚` + (L.car ? `，比賽 ${L.car.races} 場` : '') + '。金幣只用來升級遊戲裡的賽車，沒有任何付費內容。' }));
    const catalog = h('div', 'card', null, h('h3', null, { text: '🎮 全部遊戲一覽' }), h('p', 'sub', { text: '每款遊戲練習的能力與玩法。同一個知識點會出現在好幾款遊戲裡，用不同方式反覆練習。' }),
      Object.keys(SUBJ).map(s => h('div', null, null, h('h4', null, { text: `${SUBJ[s].i} ${SUBJ[s].n}` }), h('ul', 'cat-list', null, Object.values(K.games).filter(g => g.subj === s && !g.hidden).map(g => h('li', null, { text: `${g.icon} ${g.name}（${g.cog}）：${g.desc}` }))))));
    const TABS = [['report', '報告', [usage, trend, weak, tests]], ['map', '技能地圖', [heat]], ['content', '內容', [content, catalog]], ['set', '設定', [help, fb, set, voiceCard()]], ['data', '資料', [backup, about]]];
    const body = h('div', 'pt-body'), tabs = h('div', 'pt-tabs');
    const paint = () => { tabs.replaceChildren(...TABS.map(([k, t]) => h('button', k === pTab ? 'on' : '', { text: t, onclick: () => { pTab = k; paint(); } }))); body.replaceChildren(...TABS.find(x => x[0] === pTab)[2]); app().querySelector('.parent') && (app().querySelector('.parent').scrollTop = 0); };
    show(h('div', 'screen parent', null, h('div', 'pt-head', null, h('div', 'pt-top', null, h('h1', null, { text: '👪 家長專區' }), h('button', 'pt-back', { text: '返回小孩端', onclick: () => { A.sfx('tap'); showHome(); } })), tabs), body));
    paint();
  }

  // ---------- 啟動 ----------
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; });
  K.swReady = reg => {
    swReg = reg;
    // 新版本下載好後不打斷正在玩的回合：顯示提示，點一下才重新載入
    navigator.serviceWorker.addEventListener('controllerchange', () => toast('🎉 新版本準備好了，點一下更新', () => location.reload()));
  };
  window.addEventListener('DOMContentLoaded', () => {
    K.store.load();
    if ('speechSynthesis' in window) { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => { }; }
    document.addEventListener('visibilitychange', () => document.hidden && A.stop());
    E.L() ? showHome() : showProfiles();
    if (!K.store.data.settings.introSeen) setTimeout(() => K.help.intro(), 300); // 第一次開啟：功能介紹蓋屏
    setTimeout(() => K.help.flush(), 3000); // 補送之前沒送出的意見回饋
  });
  K.shell = { showHome, showProfiles, play, quiz, showParent, showCollection, show, modal, closeModal, btn, coach, idleWatch, zyBtn, lvLights, progressUI, demoCard, toast, SUBJ, GN, setCur: c => { cur = c; } };
})();
