'use strict';
// 殼層：學習者檔案、首頁任務板、遊戲框架、結算、Boss、圖鑑、家長儀表板
(() => {
  const K = KL, h = K.h, A = K.audio, E = K.engine;
  const VERSION = '1.0.0';
  const app = () => document.getElementById('app'), ov = () => document.getElementById('overlay');
  const SUBJ = { en: { n: '英文', i: '🔤' }, ma: { n: '數學', i: '🔢' }, zh: { n: '國語', i: '📖' } };
  const AV = ['🦊', '🐼', '🐰', '🐯', '🐸', '🦄', '🐵', '🐱'];
  const GN = ['', '小一', '小二', '小三', '小四', '小五', '小六'];
  let cur = null, greeted = false, lastBreak = Date.now(), installEvt = null;

  const show = node => { if (cur) cur.exit(); A.stop(); closeModal(); app().replaceChildren(node); window.scrollTo(0, 0); };
  const closeModal = () => ov().replaceChildren();
  const modal = (node, cls = '') => { ov().replaceChildren(h('div', 'modal-bg'), h('div', 'modal ' + cls, null, node)); };
  const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);
  const btn = (text, cls, onclick) => h('button', 'btn ' + (cls || ''), { text, onclick: e => { A.sfx('tap'); onclick(e); } });

  // ---------- 學習者檔案 ----------
  function showProfiles() {
    const D = K.store.data;
    const list = h('div', 'pf-list', null, D.learners.map(L => h('button', 'pf', { onclick: () => { A.sfx('tap'); D.current = L.id; K.store.save(); greeted = false; showHome(); } }, h('span', 'pf-av', { text: L.avatar }), h('span', 'pf-n', { text: L.name }))),
      h('button', 'pf add', { onclick: () => { A.sfx('tap'); addLearner(); } }, h('span', 'pf-av', { text: '➕' }), h('span', 'pf-n', { text: '新增小朋友' })));
    const scr = h('div', 'screen center', null, h('div', 'logo', { text: '🌟' }), h('h1', 'title', { text: '小小學習家' }), h('p', 'sub', { text: '英文・數學・國語　邊玩邊學' }), h('p', 'sub', { text: D.learners.length ? '誰要來玩？' : '第一次使用，請爸爸媽媽幫忙建立檔案' }), list);
    if (installEvt) scr.append(btn('📲 安裝到主畫面', 'pri', async () => { installEvt.prompt(); installEvt = null; }));
    show(scr);
  }
  function addLearner() {
    let av = AV[0], grade = 1;
    const name = h('input', 'inp', { placeholder: '小朋友的名字', maxlength: 8 });
    const avs = h('div', 'av-row', null, AV.map(a => h('button', 'av' + (a === av ? ' on' : ''), { text: a, onclick: e => { av = a;[...avs.children].forEach(x => x.classList.remove('on')); e.currentTarget.classList.add('on'); A.sfx('tap'); } })));
    const grs = h('div', 'av-row', null, GN.slice(1).map((g, i) => h('button', 'chip' + (i === 0 ? ' on' : ''), { text: g, onclick: e => { grade = i + 1;[...grs.children].forEach(x => x.classList.remove('on')); e.currentTarget.classList.add('on'); A.sfx('tap'); } })));
    modal(h('div', null, null, h('h2', null, { text: '新增小朋友' }), name, h('p', 'lbl', { text: '選一個頭像' }), avs, h('p', 'lbl', { text: '年級（之後可在家長專區調整）' }), grs,
      h('div', 'row', null, btn('取消', '', closeModal), btn('開始！', 'pri', () => { K.store.newLearner(name.value.trim() || '小朋友', av, grade); greeted = false; showHome(); }))));
  }

  // ---------- 首頁 ----------
  function showHome() {
    const L = E.L(); if (!L) return showProfiles();
    const day = E.day(), pet = K.pet(), over = E.overLimit();
    const allDone = ['en', 'ma', 'zh'].every(s => day.tasks[s] > 0);
    const head = h('div', 'hm-head', null,
      h('button', 'hm-me', { onclick: () => { A.sfx('tap'); showProfiles(); } }, h('span', 'pf-av sm', { text: L.avatar }), h('b', null, { text: L.name })),
      h('button', 'hm-pet', { onclick: () => { A.sfx('tap'); showCollection(); } }, h('span', null, { text: pet.e }), h('small', null, { text: `🎁 ${L.stickers.length}` })),
      h('button', 'ib', { text: '👪', 'aria-label': '家長專區', onclick: () => { A.sfx('tap'); parentGate(); } }));
    const board = h('div', 'board', null, h('div', 'bd-t', { text: '今日任務：每一科玩一回合' }),
      h('div', 'bd-row', null, Object.keys(SUBJ).map(s => h('span', 'task s-' + s + (day.tasks[s] ? ' done' : ''), { text: `${day.tasks[s] ? '✅' : '⬜'} ${SUBJ[s].n}` })),
        h('button', 'boss-btn' + (allDone ? '' : ' lock') + (day.boss ? ' done' : ''), { text: day.boss ? '👑 魔王已挑戰' : allDone ? '👑 挑戰魔王！' : '🔒 魔王挑戰', onclick: () => { if (over) return; if (!allDone) { A.sfx('bad'); return A.speak('三科都玩過一回合，就可以挑戰魔王喔！'); } A.sfx('tap'); quiz('boss'); } })));
    const cols = h('div', 'subjs', null, Object.keys(SUBJ).map(s => h('section', 'subj s-' + s, null,
      h('h2', null, { html: `${SUBJ[s].i} ${SUBJ[s].n} <span class="st">${stars(L.sub[s])}</span>` }),
      h('div', 'gcards', null, Object.values(K.games).filter(g => g.subj === s).map(g => h('button', 'gcard' + (over ? ' off' : ''), { onclick: () => { if (over) return A.speak('今天玩得很棒了，明天再來吧！'); A.sfx('tap'); play(g.id); } }, h('span', 'gi', { text: g.icon }), h('span', 'gn', { text: g.name })))))));
    const scr = h('div', 'screen home', null, head, over ? h('div', 'banner', { text: `${pet.e} 今天玩得很棒！讓眼睛休息一下，明天再來吧！` }) : board, cols);
    show(scr);
    if (!greeted) { greeted = true; A.speak(over ? '今天玩得很棒！讓眼睛休息一下，明天再來吧！' : `嗨，${L.name}！今天想玩什麼？`); }
  }

  // ---------- 遊戲框架 ----------
  function play(id) {
    const game = K.games[id], L = E.L();
    const round = { answers: [], cw: {}, start: Date.now(), retry: null }, exits = [];
    const fill = h('i'), bar = h('div', 'pbar', null, fill), root = h('div', 'groot g-' + id);
    const ctx = {
      game, L, grade: L.grade, alive: true, total: game.n, nOpts: L.grade <= 1 ? 3 : 4, note: '',
      pick: () => E.pick(game, round),
      wait: ms => new Promise(r => setTimeout(() => ctx.alive && r(), ms)),
      onExit: f => exits.push(f),
      progress(i, n) { ctx._manual = true; fill.style.width = Math.min(100, i / n * 100) + '%'; },
      async report(p, ok, ms) {
        const demo = E.report(game, round, p.skill, ok, ms, p.probe);
        if (!ctx._manual) fill.style.width = Math.min(100, round.answers.length / ctx.total * 100) + '%';
        if (demo && ctx.alive) await demoCard(p.skill);
      },
      done() { if (!ctx.alive) return; ctx.exit(true); showResult(game, E.endRound(game, round), ctx.note); },
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
  // 示範卡：同一知識點連錯 3 題
  function demoCard(skill) {
    return new Promise(res => {
      const text = skill.demo || '慢慢來，仔細看、仔細聽，再試一次就會了！';
      modal(h('div', 'demo', null, h('div', 'demo-i', { text: '💡' }), h('h2', null, { text: skill.name }), h('p', null, { text }), btn('我知道了 👍', 'pri', () => { A.stop(); closeModal(); res(); })));
      A.speak('我們一起看一下。' + text);
    });
  }
  function showResult(game, res, note) {
    const L = E.L(), acc = res.n ? res.r / res.n : 0, st = acc >= .9 ? 3 : acc >= .7 ? 2 : 1, day = E.day();
    const allDone = ['en', 'ma', 'zh'].every(s => day.tasks[s] > 0);
    const body = h('div', 'result', null, h('div', 'r-stars', { text: stars(st) }), h('h1', null, { text: st === 3 ? '太厲害了！' : st === 2 ? '做得很好！' : '完成了！繼續加油！' }),
      h('p', 'r-score', { text: `答對 ${res.r} / ${res.n} 題` }), note && h('p', 'r-note', { text: note }),
      res.skills.length && h('p', null, { text: '今天練習了：' + K.uniq(res.skills).slice(0, 4).join('、') }),
      res.mastered.length && h('p', 'r-good', { text: '🏅 學會了：' + res.mastered.join('、') }),
      res.up && h('p', 'r-good', { text: `⭐ ${SUBJ[game.subj].n}升級到 ${res.up} 顆星！` }),
      res.sticker && h('p', 'r-sticker', null, '🎁 得到新貼紙 ', h('span', 'big-st', { text: res.sticker })),
      h('div', 'row', null, game.subj && btn('🔁 再玩一次', '', () => E.overLimit() ? showHome() : play(game.id)), btn('🏠 回首頁', 'pri', showHome), allDone && !day.boss && game.subj && btn('👑 挑戰魔王', 'boss', () => quiz('boss'))));
    show(h('div', 'screen center', null, body));
    A.sfx('win');
    setTimeout(() => A.speak(`${st === 3 ? '太厲害了！' : '做得很好！'}答對${res.r}題。` + (res.skills.length ? `今天你練習了${res.skills[0]}。` : '') + (res.mastered.length ? `你學會了${res.mastered[0]}！` : '') + (res.sticker ? '還得到一張新貼紙！' : '')), 700);
    if (Date.now() - lastBreak > 15 * 60000) { // 每 15 分鐘溫和提醒休息
      lastBreak = Date.now();
      setTimeout(() => { modal(h('div', 'demo', null, h('div', 'demo-i', { text: K.pet().e + '💤' }), h('h2', null, { text: '我有點累了，一起休息一下吧！' }), h('p', null, { text: '看看遠方、喝口水、動一動身體。' }), btn('好！', 'pri', closeModal))); A.speak('我有點累了，一起休息一下吧！看看遠方，喝口水。'); }, 3500);
    }
  }

  // ---------- Boss 挑戰／小檢定：跨科混合選擇題 ----------
  function quiz(mode) {
    const L = E.L(), today = K.today(), wk = K.addDays(today, -7), boss = mode === 'boss';
    const level = K.skills.filter(s => E.eligible(s, L) && s.g === L.grade);
    let pool = boss ? K.skills.filter(s => L.skills[s.id] && L.skills[s.id].last >= wk) : level;
    if (pool.length < 3) pool = level.length ? level : K.skills.filter(s => s.g === 1 && s.sub === 1);
    const game = { id: mode, name: boss ? '魔王挑戰' : '小檢定', n: 10 }, round = { answers: [], cw: {}, start: Date.now(), retry: null };
    const theme = [['🐙', '海底', 'sea'], ['👾', '太空', 'space'], ['🐲', '森林', 'forest']][Math.floor(Date.now() / 6048e5) % 3];
    const fill = h('i'), bar = h('div', 'pbar', null, fill), root = h('div', 'groot quiz' + (boss ? ' boss-' + theme[2] : ''));
    const foe = h('div', 'boss-foe', null, h('span', 'bf', { text: theme[0] }), h('span', 'hp', null, h('i'))), top = h('div', 'g-top'), work = h('div', 'quiz-work');
    let alive = true, hp = 10;
    show(h('div', 'gs s-boss', null, h('div', 'gbar', null, h('button', 'ib', { text: '🏠', onclick: () => { A.sfx('tap'); boss ? showHome() : showParent(); } }), bar, h('div', 'gname', { text: boss ? `👑 ${theme[1]}魔王` : '📝 小檢定' })), root));
    cur = { exit() { alive = false; cur = null; } };
    if (boss) root.append(foe); root.append(top, work);
    if (boss) A.speak(`${theme[1]}魔王出現了！答對題目就能打敗牠！`);
    const subjOrder = K.shuffle(['en', 'ma', 'zh']);
    (async () => {
      for (let i = 0; i < game.n && alive; i++) {
        const want = pool.filter(s => s.subj === subjOrder[i % 3]), skill = round.retry && boss ? round.retry : K.pick(want.length ? want : pool);
        round.retry = null;
        const q = K.mcq(skill, { n: 4 });
        top.replaceChildren(K.ui.prompt(q)); work.replaceChildren();
        if (i || !boss) K.sayQ(q); else setTimeout(() => alive && K.sayQ(q), 2600);
        const r = await K.ui.choice(work, q);
        if (!alive) return;
        const demo = E.report(game, round, skill, r.ok, r.ms, false);
        fill.style.width = (i + 1) * 10 + '%';
        if (boss && r.ok) { hp--; foe.querySelector('.hp i').style.width = hp * 10 + '%'; foe.classList.remove('hit'); void foe.offsetWidth; foe.classList.add('hit'); }
        if (boss && demo) await demoCard(skill);
      }
      if (!alive) return;
      cur = null;
      if (boss) {
        const res = E.endRound(game, round); E.day().boss = true; K.store.save();
        showResult(game, res, res.r >= 7 ? `${theme[0]} 打敗${theme[1]}魔王了！` : `${theme[0]} 魔王逃走了，下次再挑戰！`);
      } else {
        const by = {}; round.answers.forEach(a => { const s = K.skill[a.sid].subj, b = by[s] || (by[s] = [0, 0]); b[1]++; if (a.ok) b[0]++; });
        const r = round.answers.filter(a => a.ok).length;
        L.tests.push({ d: today, r, n: round.answers.length, by, g: L.grade }); K.store.save();
        show(h('div', 'screen center', null, h('div', 'result', null, h('h1', null, { text: '小檢定完成！' }), h('p', 'r-score', { text: `答對 ${r} / ${round.answers.length} 題` }), h('p', null, { text: '結果已記錄在家長專區。' }), btn('回家長專區', 'pri', showParent))));
      }
    })();
  }

  // ---------- 圖鑑與寵物 ----------
  function showCollection() {
    const L = E.L(), pet = K.pet();
    const mastered = K.skills.filter(s => L.skills[s.id] && L.skills[s.id].m);
    show(h('div', 'screen', null,
      h('div', 'hm-head', null, btn('🏠 回首頁', '', showHome)),
      h('div', 'pet-card', null, h('div', 'pet-big', { text: pet.e }), h('h2', null, { text: pet.name }), h('p', null, { text: pet.next ? `已學會 ${pet.n} 個本領，學會 ${pet.next} 個就會進化！` : `已學會 ${pet.n} 個本領，是最強的神龍了！` }), h('div', 'pet-steps', null, K.PETS.map(p => h('span', pet.n >= p[0] ? 'on' : '', { text: p[1] })))),
      h('h2', 'sec', { text: `🎁 貼紙簿（${L.stickers.length} / ${K.STICKERS.length}）` }),
      h('div', 'stickers', null, K.STICKERS.map(s => h('span', L.stickers.includes(s) ? 'on' : '', { text: L.stickers.includes(s) ? s : '❔' }))),
      h('h2', 'sec', { text: `🏅 學會的本領（${mastered.length}）` }),
      h('div', 'badges', null, mastered.length ? mastered.map(s => h('span', 'badge s-' + s.subj, { text: s.name })) : h('p', 'sub', { text: '兩天都答得很好，就會得到本領徽章喔！' }))));
    A.speak(`這是你的${pet.name}。你有${L.stickers.length}張貼紙！`);
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
  function showParent() {
    const L = E.L(), D = K.store.data, today = K.today();
    const sel = (opts, val, on) => { const s = h('select', 'inp sm', { onchange: e => { on(e.target.value); K.store.save(); } }, opts.map(([v, t]) => h('option', null, { value: v, text: t }))); s.value = val; return s; };
    const tog = (label, key) => h('label', 'tog', null, h('input', null, Object.assign({ type: 'checkbox', onchange: e => { D.settings[key] = e.target.checked; K.store.save(); } }, D.settings[key] ? { checked: '' } : {})), ' ' + label);
    // 使用時間
    const week = Array.from({ length: 7 }, (_, i) => K.addDays(today, i - 6)), mins = week.map(d => Math.round(((L.days[d] || {}).sec || 0) / 60));
    const mx = Math.max(10, ...mins);
    const usage = h('div', 'card', null, h('h3', null, { text: '📅 最近 7 天' }), h('p', null, { text: `玩了 ${mins.filter(m => m > 0).length} 天，共 ${mins.reduce((a, b) => a + b, 0)} 分鐘（今天 ${mins[6]} 分鐘）` }),
      h('div', 'bars', null, week.map((d, i) => h('div', 'bar', null, h('i', null, { style: `height:${mins[i] / mx * 100}%` }), h('small', null, { text: d.slice(8) })))));
    // 精熟熱圖
    const heat = h('div', 'card', null, h('h3', null, { text: '🗺️ 知識點地圖' }), h('p', 'sub', { html: '<span class="chip k0">未開始</span> <span class="chip k1">學習中</span> <span class="chip k2">已精熟</span>　點一下看詳細' }));
    const detail = h('p', 'detail', { text: '' });
    for (const s in SUBJ) {
      heat.append(h('h4', null, { text: `${SUBJ[s].i} ${SUBJ[s].n}　目前 ${stars(L.sub[s])}` }), h('div', 'chips', null, K.skills.filter(k => k.subj === s && k.g <= L.grade).sort((a, b) => a.g * 10 + a.sub - b.g * 10 - b.sub).map(k => {
        const t = L.skills[k.id];
        return h('button', 'chip k' + (!t || !t.last ? 0 : t.m ? 2 : 1), { text: `${k.g}${'★'.repeat(k.sub)} ${k.name}`, onclick: () => { detail.textContent = t && t.last ? `${k.name}：答對 ${t.r}、答錯 ${t.w}，掌握度 ${Math.round(t.score)}，復習盒 ${t.box}／5，下次復習 ${t.due || '—'}，最近練習 ${t.last}` : `${k.name}：還沒練習過`; } });
      })));
    }
    heat.append(detail);
    // 最常錯
    const wrong = K.skills.map(k => ({ k, t: L.skills[k.id] })).filter(x => x.t && x.t.w >= 2).sort((a, b) => b.t.w / (b.t.r + b.t.w) - a.t.w / (a.t.r + a.t.w)).slice(0, 5);
    const sugg = [];
    wrong.forEach(x => x.k.tip && sugg.push(`${x.k.name}：${x.k.tip}`));
    for (const s in SUBJ) if (L.sub[s] === 3 && L.hi[s] >= 3 && L.grade < 6) sugg.push(`${SUBJ[s].n}在三顆星連續表現很好，可以考慮把年級調到${GN[L.grade + 1]}。`);
    if (!sugg.length) sugg.push('目前沒有特別需要加強的地方，維持每天 15 分鐘就很棒！');
    const weak = h('div', 'card', null, h('h3', null, { text: '🎯 最常錯 Top 5' }),
      wrong.length ? h('ol', null, null, wrong.map(x => h('li', null, { text: `${SUBJ[x.k.subj].n}｜${x.k.name}（正確率 ${Math.round(x.t.r / (x.t.r + x.t.w) * 100)}%，錯 ${x.t.w} 次）` }))) : h('p', 'sub', { text: '還沒有足夠的資料。' }),
      h('h3', null, { text: '💡 建議的親子活動' }), h('ul', null, null, sugg.slice(0, 5).map(t => h('li', null, { text: t }))));
    // 設定
    const set = h('div', 'card', null, h('h3', null, { text: `⚙️ ${L.avatar} ${L.name} 的設定` }),
      h('div', 'frow', null, h('span', null, { text: '年級' }), sel(GN.slice(1).map((g, i) => [i + 1, g]), L.grade, v => { L.grade = +v; L.sub = { en: 1, ma: 1, zh: 1 }; L.recent = { en: [], ma: [], zh: [] }; L.hi = { en: 0, ma: 0, zh: 0 }; })),
      h('div', 'frow', null, h('span', null, { text: '每日上限' }), sel([[0, '不限制'], [10, '10 分鐘'], [15, '15 分鐘'], [20, '20 分鐘'], [30, '30 分鐘'], [45, '45 分鐘']], L.limit, v => L.limit = +v),
        btn('今天再加 10 分鐘', '', () => { L.extra[today] = (L.extra[today] || 0) + 10; K.store.save(); showParent(); })),
      h('div', 'frow', null, tog('音效', 'sfx'), tog('語音旁白', 'voice')));
    // 小檢定
    const tests = h('div', 'card', null, h('h3', null, { text: '📝 小檢定（10 題，約 3 分鐘）' }), h('p', 'sub', { text: '建議每月一次，由孩子自己作答，用來對照學習成效。' }),
      L.tests.length ? h('ul', null, null, L.tests.slice(-6).map(t => h('li', null, { text: `${t.d}（${GN[t.g]}）：${t.r} / ${t.n}　` + Object.keys(t.by).map(s => `${SUBJ[s].n} ${t.by[s][0]}/${t.by[s][1]}`).join('、') }))) : h('p', 'sub', { text: '還沒有檢定紀錄。' }),
      btn('開始小檢定', 'pri', () => quiz('test')));
    // 備份
    const file = h('input', null, { type: 'file', accept: '.json,application/json', style: 'display:none', onchange: e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { try { const d = JSON.parse(t); if (!d.learners) throw 0; if (confirm('匯入會取代這台裝置上的所有紀錄，確定嗎？')) { K.store.data = d; K.store.save(); showProfiles(); } } catch (x) { alert('檔案格式不正確'); } }); } });
    const backup = h('div', 'card', null, h('h3', null, { text: '💾 備份與資料' }), h('p', 'sub', { text: '資料只存在這台裝置的瀏覽器裡。清除瀏覽器資料會遺失，建議每月匯出備份。' }),
      h('div', 'frow', null, btn('匯出備份', '', () => dl(`kidlearn-backup-${today}.json`, JSON.stringify(D), 'application/json')), btn('匯入備份', '', () => file.click()), file,
        btn('匯出學習紀錄 CSV', '', () => dl(`kidlearn-${L.name}-${today}.csv`, '﻿科目,年級,子級,知識點,答對,答錯,掌握度,復習盒,精熟,最近練習\n' + K.skills.filter(k => L.skills[k.id]).map(k => { const t = L.skills[k.id]; return [SUBJ[k.subj].n, k.g, k.sub, k.name, t.r, t.w, Math.round(t.score), t.box, t.m ? '是' : '否', t.last || ''].join(','); }).join('\n'), 'text/csv')),
        btn('列印報告', '', () => window.print())),
      h('div', 'frow', null, btn('刪除這位小朋友', 'danger', () => { if (confirm(`確定刪除「${L.name}」的所有紀錄嗎？無法復原。`)) { D.learners = D.learners.filter(x => x !== L); D.current = null; K.store.save(); showProfiles(); } })));
    const about = h('div', 'card', null, h('h3', null, { text: '📲 安裝到手機／平板' }), h('p', 'sub', { html: 'iPhone／iPad：用 Safari 開啟 → 分享按鈕 → 「加入主畫面」。<br>Android：用 Chrome 開啟 → 選單 → 「安裝應用程式」或「加到主畫面」。<br>安裝後可離線使用。' }), h('p', 'sub', { text: `版本 ${VERSION}｜知識點 ${K.skills.length} 個｜遊戲 ${Object.keys(K.games).length} 款` }));
    show(h('div', 'screen parent', null, h('div', 'hm-head', null, btn('🏠 回首頁', '', showHome), h('h1', null, { text: '家長專區' })), set, usage, weak, heat, tests, backup, about));
  }

  // ---------- 啟動 ----------
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; });
  window.addEventListener('DOMContentLoaded', () => {
    K.store.load();
    if ('speechSynthesis' in window) speechSynthesis.getVoices();
    document.addEventListener('visibilitychange', () => document.hidden && A.stop());
    E.L() ? showHome() : showProfiles();
  });
  K.shell = { showHome, showProfiles, play, quiz, showParent };
})();
