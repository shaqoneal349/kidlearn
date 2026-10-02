'use strict';
// 小小學習家 — 核心：工具、存檔、語音音效、學習引擎
window.KL = { games: {}, skills: [], skill: {}, mcqKinds: {}, ui: {} };
(() => {
  const K = KL;

  // ---------- 工具 ----------
  K.rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  K.pick = a => a[Math.floor(Math.random() * a.length)];
  K.shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  K.sample = (a, n) => K.shuffle(a).slice(0, n);
  K.uniq = a => [...new Set(a)];
  K.h = (tag, cls, props, ...kids) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (props) for (const k in props) {
      const v = props[k];
      if (k === 'html') e.innerHTML = v;
      else if (k === 'text') e.textContent = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (k === 'style') e.style.cssText = v;
      else e.setAttribute(k, v);
    }
    for (const c of kids.flat()) { if (c == null || c === false || c === 0 || c === '') continue; e.append(c.nodeType ? c : document.createTextNode(c)); }
    return e;
  };
  K.dstr = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  K.today = () => K.dstr(new Date());
  K.addDays = (s, n) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return K.dstr(d); };

  // 知識點註冊
  K.add = (subj, g, sub, id, name, kind, data, x) => {
    const s = Object.assign({ subj, g, sub, id, name, kind, data }, x || {});
    K.skills.push(s); K.skill[id] = s; return s;
  };
  // 選擇題組裝：a 正解、ds 干擾項（皆為 HTML 字串）
  K.mkq = (base, a, ds, n = 4) => {
    a = String(a);
    ds = K.uniq(ds.map(String)).filter(x => x !== a);
    const opts = K.shuffle([a, ...K.shuffle(ds).slice(0, n - 1)]);
    return Object.assign(base, { opts, ans: opts.indexOf(a) });
  };
  K.mcq = (skill, o = {}) => { const q = K.mcqKinds[skill.kind](skill, o.n || 4, o.mode); q.skill = skill; return q; };
  K.fits = (g, s) => g.subj === s.subj && (g.accept ? g.accept(s) : g.kinds.includes(s.kind));
  K.gamesOf = skill => Object.values(K.games).filter(g => K.fits(g, skill));
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
  const median = a => { const b = a.slice().sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
  const push = (arr, v, max) => { arr.push(v); while (arr.length > max) arr.shift(); };

  // ---------- 存檔 ----------
  const KEY = 'kidlearn.v1';
  K.store = {
    data: null,
    load() {
      let d = null;
      try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) { }
      if (!d || !d.learners) d = { v: 2, learners: [], current: null, settings: { sfx: true, voice: true } };
      d.learners.forEach(this.migrate); d.v = 2;
      this.data = d;
    },
    // v1 → v2：只新增欄位，不刪除任何既有紀錄
    migrate(L) {
      L.gs = L.gs || { en: L.grade, ma: L.grade, zh: L.grade };
      L.log = L.log || []; L.last = L.last || {}; L.bonus = L.bonus || { fix: 0, ev: 0, rev: 0 };
      for (const id in L.skills) {
        const t = L.skills[id];
        if (!t.rec) {
          const n = Math.min(10, t.r + t.w), k = Math.round(n * t.r / Math.max(1, t.r + t.w));
          t.rec = Array(n).fill(0).fill(1, 0, k); t.hint = []; t.dl = t.m ? [1] : []; t.ap = []; t.ms = []; t.conf = {};
        }
      }
    },
    save() { try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { } },
    newLearner(name, avatar, grade) {
      const L = {
        id: 'L' + Date.now(), name, avatar, grade, limit: 20, extra: {},
        sub: { en: 1, ma: 1, zh: 1 }, recent: { en: [], ma: [], zh: [] }, hi: { en: 0, ma: 0, zh: 0 },
        skills: {}, stickers: [], days: {}, tests: [], best: {}, created: K.today()
      };
      this.migrate(L);
      this.data.learners.push(L); this.data.current = L.id; this.save(); return L;
    },
    cur() { return this.data.learners.find(l => l.id === this.data.current) || null; }
  };

  // ---------- 音效與語音 ----------
  const A = K.audio = {
    ac: null,
    tone(f, t0, d, type = 'sine', g = .15) {
      const ac = A.ac, o = ac.createOscillator(), ga = ac.createGain();
      o.type = type; o.frequency.value = f;
      ga.gain.setValueAtTime(g, ac.currentTime + t0);
      ga.gain.exponentialRampToValueAtTime(.001, ac.currentTime + t0 + d);
      o.connect(ga).connect(ac.destination); o.start(ac.currentTime + t0); o.stop(ac.currentTime + t0 + d);
    },
    sfx(n) {
      if (!K.store.data.settings.sfx) return;
      try {
        A.ac = A.ac || new (window.AudioContext || window.webkitAudioContext)();
        if (A.ac.state === 'suspended') A.ac.resume();
        ({
          ok: () => { A.tone(660, 0, .12); A.tone(880, .1, .2); },
          bad: () => A.tone(220, 0, .25, 'triangle', .12),
          tap: () => A.tone(500, 0, .05, 'sine', .06),
          pop: () => A.tone(900, 0, .07, 'square', .06),
          win: () => [523, 659, 784, 1047].forEach((f, i) => A.tone(f, i * .12, .25)),
          star: () => { A.tone(1200, 0, .1); A.tone(1600, .08, .15); }
        })[n]();
      } catch (e) { }
    },
    voice(lang) {
      const vs = speechSynthesis.getVoices(), p = lang.slice(0, 2);
      return vs.find(v => v.lang.replace('_', '-') === lang)
        || vs.find(v => v.lang.startsWith(p) && (p !== 'zh' || /TW|Hant/i.test(v.lang + v.name)))
        || vs.find(v => v.lang.startsWith(p)) || null;
    },
    speak(text, lang = 'zh-TW', o = {}) {
      return new Promise(res => {
        if (!K.store.data.settings.voice || !('speechSynthesis' in window) || !text) return res();
        try {
          if (!o.queue) speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.lang = lang; const v = A.voice(lang); if (v) u.voice = v;
          u.rate = o.rate || (lang[0] === 'e' ? .8 : .9);
          u.onend = u.onerror = () => res();
          speechSynthesis.speak(u);
          setTimeout(res, Math.max(2500, text.length * 450));
        } catch (e) { res(); }
      });
    },
    stop() { try { speechSynthesis.cancel(); } catch (e) { } }
  };
  K.sayQ = (q, o) => { if (q && q.say) return A.speak(q.say, q.lang || 'zh-TW', o); return Promise.resolve(); };

  // ---------- 學習引擎 ----------
  const GAP = [0, 1, 3, 7, 14, 30]; // Leitner 間隔（天）
  K.STAGES = [['🌱', '新手'], ['🌿', '熟悉'], ['🌳', '穩定'], ['⭐', '精熟']];
  const E = K.engine = {
    L: () => K.store.cur(),
    st(sid) { const L = E.L(); return L.skills[sid] || (L.skills[sid] = { score: 0, box: 0, due: null, r: 0, w: 0, days: {}, games: {}, m: false, last: null, rec: [], hint: [], dl: [], ap: [], ms: [], conf: {} }); },
    // 掌握度 0–100：近期正確率 45% + 隔日保留 20% + 情境應用 15% + 獨立完成 10% + 流暢度 10%
    // 新技能（作答少於 6 次）不看速度，避免逼孩子求快
    mastery(t, s) {
      if (!t || !t.rec || !t.rec.length) return 0;
      const n = t.rec.length, acc = mean(t.rec);
      const dl = t.dl.length ? mean(t.dl) : acc * .5, ap = t.ap.length ? mean(t.ap) : acc * .6, ind = t.hint.length ? 1 - mean(t.hint) : 1;
      let fw = .10, fl = 0;
      if (n < 6 || !t.ms.length) fw = 0; else { const base = (s && s.base) || 7000; fl = Math.max(0, Math.min(1, (2.5 * base - median(t.ms)) / (1.5 * base))); }
      return Math.round(100 * ((.55 - fw) * acc + .20 * dl + .15 * ap + .10 * ind + fw * fl) * Math.min(1, n / 6));
    },
    // 0 新手 1 熟悉 2 穩定 3 精熟（精熟需要至少一次隔日仍答對）
    stage(sid) { const t = E.L().skills[sid]; if (!t || !t.last) return 0; const m = t.score; let st = m >= 80 ? 3 : m >= 60 ? 2 : m >= 35 ? 1 : 0; if (st === 3 && !(t.dl && t.dl.some(x => x))) st = 2; return st; },
    eligible(s, L) { const g = L.gs[s.subj]; return s.g < g || (s.g === g && s.sub <= L.sub[s.subj]); },
    unlocked(s, L) { return (s.prereq || []).every(p => { const ps = K.skill[p]; return !ps || ps.g < L.gs[ps.subj] || E.stage(p) >= 2; }); },
    candidates(game) {
      const L = E.L();
      const all = K.skills.filter(s => K.fits(game, s));
      let el = all.filter(s => E.eligible(s, L));
      if (!el.length && all.length) { // 這款遊戲在此程度沒有內容 → 用最基礎的
        const lv = Math.min(...all.map(s => s.g * 10 + s.sub));
        el = all.filter(s => s.g * 10 + s.sub === lv);
      }
      const un = el.filter(s => E.unlocked(s, L));
      return { all, list: un.length ? un : el };
    },
    weight(s, L, round) {
      const t = L.skills[s.id], today = K.today(), low = s.g < L.gs[s.subj];
      if (!t || !t.last) return low ? .3 : 3;                    // 沒練過：低年級內容偶爾抽查
      if (t.due && t.due <= today) return round && round.answers.length < 3 ? 8 : 4; // 到期復習優先放在開頭
      if (t.m) return .4;
      return low ? 1.5 : 3;
    },
    wpick(list, L, round) {
      const ws = list.map(s => E.weight(s, L, round));
      let r = Math.random() * ws.reduce((a, b) => a + b, 0);
      for (let i = 0; i < list.length; i++) { r -= ws[i]; if (r <= 0) return list[i]; }
      return list[list.length - 1];
    },
    pick(game, round) {
      const L = E.L();
      if (round.retry) { const s = round.retry; round.retry = null; return { skill: s }; }
      const { all, list } = E.candidates(game);
      if (Math.random() < .08) { // 探測題：下一子級
        const pr = all.filter(s => s.g === L.gs[s.subj] && s.sub === L.sub[s.subj] + 1);
        if (pr.length) return { skill: K.pick(pr), probe: true };
      }
      return { skill: E.wpick(list, L, round) };
    },
    // 回報一次作答。ok＝第一次、沒用提示就答對；info: {hint, fixed, want, got, ev}
    // 回傳 true 表示該跳示範卡
    report(game, round, skill, ok, ms, probe, info) {
      info = info || {};
      const L = E.L(), t = E.st(skill.id), today = K.today(), day = E.day();
      if (!(skill.id in round.pre)) round.pre[skill.id] = E.stage(skill.id);
      ok ? t.r++ : t.w++;
      const d = t.days[today] || (t.days[today] = [0, 0]); d[ok ? 0 : 1]++;
      const ks = Object.keys(t.days).sort(); while (ks.length > 8) delete t.days[ks.shift()];
      if (t.last && t.last < today && !probe) push(t.dl, ok ? 1 : 0, 4); // 隔日後的第一題 = 延遲保留
      t.games[game.id] = 1; t.last = today;
      push(t.rec, ok ? 1 : 0, 10); push(t.hint, info.hint ? 1 : 0, 10);
      if (game.app) push(t.ap, ok ? 1 : 0, 6);
      if (ok && ms > 0) push(t.ms, ms, 6);
      if (!ok && info.want && info.got) { // 錯誤型態
        let key = `把「${info.want}」選成「${info.got}」`;
        const a = +info.want, b = +info.got;
        if (skill.kind === 'arith' && !isNaN(a) && !isNaN(b)) key = Math.abs(a - b) === 1 ? '答案差 1（數錯或粗心）' : Math.abs(a - b) === 10 ? '答案差 10（進位／退位）' : String(a).split('').reverse().join('') === String(b) ? '十位和個位顛倒' : '計算方法還不熟';
        t.conf[key] = (t.conf[key] || 0) + 1;
        const cs = Object.keys(t.conf); if (cs.length > 12) delete t.conf[cs.sort((x, y) => t.conf[x] - t.conf[y])[0]];
      }
      t.score = E.mastery(t, skill); t.m = E.stage(skill.id) === 3;
      round.answers.push({ sid: skill.id, ok, ms, probe: !!probe });
      if (info.fixed) { round.fixed++; L.bonus.fix++; }
      if (info.ev) { round.ev++; L.bonus.ev++; }
      push(L.log, [Date.now(), game.id, skill.id, ok ? 1 : 0, Math.round(ms / 100) / 10, info.hint ? 1 : 0], 2000);
      const by = day.by[skill.subj]; by[1]++; if (ok) by[0]++;
      if (!probe) push(L.recent[skill.subj], ok ? 1 : 0, 10);
      round.cw[skill.id] = ok ? 0 : (round.cw[skill.id] || 0) + 1;
      round.fast = !ok && ms < 700 ? (round.fast || 0) + 1 : 0;
      if (!ok && !probe) round.retry = skill; // 答錯：下一題給同技能的近遷移題
      K.store.save();
      if (round.cw[skill.id] >= 2 || round.fast >= 2) { round.cw[skill.id] = 0; round.fast = 0; return true; } // 連錯或亂猜 → 示範卡
      return false;
    },
    newRound() { return { answers: [], cw: {}, pre: {}, fixed: 0, ev: 0, start: Date.now(), retry: null }; },
    endRound(game, round) {
      const L = E.L(), today = K.today(), res = { n: 0, r: 0, skills: [], mastered: [], grew: [], up: null, down: null, gradeUp: false, sticker: null, fixed: round.fixed, ev: round.ev };
      const by = {};
      for (const a of round.answers) {
        if (a.probe) continue;
        const b = by[a.sid] || (by[a.sid] = { n: 0, r: 0 }); b.n++; if (a.ok) b.r++;
        res.n++; if (a.ok) res.r++;
      }
      for (const sid in by) {
        const s = K.skill[sid], t = E.st(sid), acc = by[sid].r / by[sid].n, st = E.stage(sid);
        res.skills.push(s.name);
        if (!t.box) { t.box = 1; t.due = K.addDays(today, 1); }
        else if (t.due <= today) { t.box = acc >= .8 ? Math.min(5, t.box + 1) : acc < .6 ? 1 : t.box; t.due = K.addDays(today, GAP[t.box]); }
        else if (acc < .6) { t.box = 1; t.due = K.addDays(today, 1); } // 明顯遺忘：排入近期複習，不降級
        if (st > (round.pre[sid] || 0)) (st === 3 ? res.mastered : res.grew).push(st === 3 ? s.name : `${s.name} ${K.STAGES[st][0]}`);
      }
      // 自適應：回合之間才升降；答對但很慢先不升級
      const subj = game.subj;
      if (subj) {
        const rc = L.recent[subj], okMs = round.answers.filter(a => a.ok && a.ms > 0).map(a => a.ms), slow = okMs.length && median(okMs) > 15000;
        if (rc.length >= 10) {
          const acc = mean(rc);
          if (acc > .85 && !slow) {
            if (L.sub[subj] < 3) { L.sub[subj]++; L.recent[subj] = []; res.up = L.sub[subj]; }
            else if (res.n && res.r / res.n > .9) {
              L.hi[subj]++;
              // 年級只是起點：這個年級大多數技能都穩定了，就開放下一個年級
              const mine = K.skills.filter(s => s.subj === subj && s.g === L.gs[subj]);
              if (L.hi[subj] >= 3 && L.gs[subj] < 6 && mine.filter(s => E.stage(s.id) >= 2).length >= mine.length * .7) { L.gs[subj]++; L.sub[subj] = 1; L.hi[subj] = 0; L.recent[subj] = []; res.gradeUp = true; }
            }
          } else if (acc < .6 && L.sub[subj] > 1) { L.sub[subj]--; L.recent[subj] = []; res.down = L.sub[subj]; L.hi[subj] = 0; }
        }
      }
      const day = E.day();
      day.rounds++; day.sec += Math.min(600, Math.round((Date.now() - round.start) / 1000));
      if (game.subj) day.tasks[game.subj]++;
      if (game.id === 'review') { day.rev = 1; L.bonus.rev++; }
      L.last[game.id] = Date.now();
      // 島嶼裝飾：亂點（很快又錯）過半就不給
      const fast = round.answers.filter(a => !a.ok && a.ms < 500).length;
      if (res.n >= 3 && fast < res.n / 2) {
        const pool = K.STICKERS.filter(s => !L.stickers.includes(s));
        if (pool.length) { res.sticker = K.pick(pool); L.stickers.push(res.sticker); }
      }
      K.store.save();
      return res;
    },
    day() {
      const L = E.L(), t = K.today(), d = L.days[t] || (L.days[t] = { sec: 0, rounds: 0, tasks: { en: 0, ma: 0, zh: 0 }, boss: false });
      d.by = d.by || { en: [0, 0], ma: [0, 0], zh: [0, 0] };
      return d;
    },
    due() { const L = E.L(), today = K.today(); return K.skills.filter(s => { const t = L.skills[s.id]; return t && t.due && t.due <= today; }); },
    // 推薦一款遊戲：先依引擎權重挑技能，再選最久沒玩、能練這個技能的遊戲
    suggest(subj) {
      const L = E.L(), all = K.skills.filter(s => s.subj === subj && K.gamesOf(s).length);
      let el = all.filter(s => E.eligible(s, L) && E.unlocked(s, L)); if (!el.length) el = all.filter(s => E.eligible(s, L)); if (!el.length) el = all;
      const gs = K.gamesOf(E.wpick(el, L, null));
      return gs.sort((a, b) => (L.last[a.id] || 0) - (L.last[b.id] || 0) || Math.random() - .5)[0].id;
    },
    // 今日冒險路線：快複習 → 三科各一站 → 跨科魔王
    route() {
      const day = E.day(); if (day.route) return day.route;
      const r = [], order = ['zh', 'ma', 'en'], k = new Date().getDate() % 3;
      if (E.due().length >= 3) r.push({ k: 'review' });
      order.slice(k).concat(order.slice(0, k)).forEach(s => r.push({ k: 'game', id: E.suggest(s), s }));
      r.push({ k: 'boss' });
      day.route = r; K.store.save(); return r;
    },
    weekDays() { const L = E.L(), t = K.today(); let n = 0; for (let i = 0; i < 7; i++) { const d = L.days[K.addDays(t, -i)]; if (d && d.rounds) n++; } return n; },
    masteredCount() { const L = E.L(); return Object.values(L.skills).filter(t => t.m).length; },
    overLimit() { const L = E.L(), d = E.day(); return L.limit > 0 && d.sec >= (L.limit + (L.extra[K.today()] || 0)) * 60; }
  };

  K.STICKERS = [...'🌴🌳🌵🌺🌻🍄🏠⛺🏰🎡🎠⛲🗿🌋🚤⛱️🦜🐚🦩🐠🦁🐯🐻🐼🐨🐵🐶🐱🐰🦊🐸🐷🐮🐔🐧🦉🦄🐝🦋🐢🐬🐳🐙🦀🦖🌈⭐🌙☀️🌸🍎🍓🍉🍩🍦🧁🚀🚗🚂⛵🎈🎁🏆🎨🎸⚽🏀'.matchAll(/\p{Extended_Pictographic}️?/gu)].map(m => m[0]);
  K.PETS = [[0, '🥚', '神祕的蛋'], [3, '🐣', '破殼寶寶'], [8, '🐥', '小小雞'], [16, '🦕', '小恐龍'], [30, '🐉', '學習神龍']];
  K.pet = () => { const n = E.masteredCount(); let p = K.PETS[0]; for (const x of K.PETS) if (n >= x[0]) p = x; return { e: p[1], name: p[2], n, next: (K.PETS[K.PETS.indexOf(p) + 1] || [null])[0] }; };

  // ---------- 共用 UI 元件 ----------
  const h = K.h, strip = s => String(s).replace(/<[^>]+>/g, '').trim();
  // 題目列：指示文字 + 題目 + 重聽 + 求助
  K.ui.prompt = q => {
    const box = h('div', 'q-box');
    if (q.ask) box.append(h('div', 'q-ask', { text: q.ask }));
    const row = h('div', 'q-row');
    if (q.prompt && q.prompt !== '🔊') row.append(h('div', 'q-main', { html: q.prompt }));
    if (q.say) row.append(h('button', 'q-snd', { text: '🔊', 'aria-label': '再聽一次', onclick: () => K.sayQ(q) }));
    if (q.opts && q.opts.length > 2) row.append(h('button', 'q-help', { text: '💡', 'aria-label': '給我提示', onclick: () => q._help && q._help() }));
    box.append(row);
    return box;
  };
  // 提示列（錯誤即教學）：不遮住題目，下一題自動消失
  K.ui.hint = (html, speak) => {
    const r = document.querySelector('.groot'); if (!r) return;
    let e = r.querySelector('.hint-toast');
    if (!html) { if (e) e.remove(); return; }
    if (!e) { e = h('div', 'hint-toast'); r.append(e); }
    e.innerHTML = '💡 ' + html;
    if (speak) A.speak(strip(html));
  };
  // 多選一的共用流程：第一次答錯 → 給提示再試一次；第二次錯才公布答案
  // els 依選項順序排列；回傳 {ok（第一次且沒提示就對）, fixed（提示後改對）, hint, ms, want, got}
  K.ui.multi = (q, els, o = {}) => new Promise(res => {
    const t0 = Date.now(), two = q.opts.length > 2 && !o.single; let tries = 0, got = null, done = false, helped = false;
    const hintText = () => q.hint || (q.skill && q.skill.demo) || '再仔細看一次，慢慢想。';
    const showHint = () => { if (o.onHint) o.onHint(); K.ui.hint(hintText(), !q.say); if (q.say) setTimeout(() => K.sayQ(q, { rate: .6 }), 300); };
    const finish = ok => {
      done = true; q._help = null; if (o.lock) o.lock();
      setTimeout(() => { K.ui.hint(null); res({ ok: ok && !tries && !helped, fixed: ok && (tries > 0 || helped), hint: tries > 0 || helped, ms: Date.now() - t0, want: strip(q.opts[q.ans]), got: got == null ? '' : strip(q.opts[got]) }); }, ok ? (o.okWait || 800) : (o.badWait || 1800));
    };
    q._help = () => { // 主動求助：給提示並刪去一個錯的選項
      if (done || helped || o.single) return; helped = true; showHint();
      const w = els.map((e, i) => i).filter(i => i !== q.ans && !els[i].dataset.x);
      if (w.length > 1) { const i = K.pick(w); els[i].dataset.x = 1; els[i].classList.add(o.wrong || 'wrong'); }
    };
    els.forEach((el, i) => el.addEventListener('click', () => {
      if (done || el.dataset.x) return;
      if (o.onPick) o.onPick(el, i);
      if (i === q.ans) { A.sfx(tries ? 'star' : 'ok'); el.classList.add(o.right || 'right'); return finish(true); }
      A.sfx('bad'); el.classList.add(o.wrong || 'wrong'); el.dataset.x = 1; if (got == null) got = i;
      if (!tries && two) { tries = 1; showHint(); }
      else { tries = 2; els[q.ans].classList.add(o.reveal || 'right', 'show'); finish(false); }
    }));
  });
  K.ui.choice = (root, q, o = {}) => {
    const wrap = h('div', 'choices ' + (o.cls || '')), els = q.opts.map(op => h('button', 'opt', { html: op }));
    wrap.append(...els); root.append(wrap);
    return K.ui.multi(q, els, Object.assign({ lock: () => wrap.dataset.done = 1 }, o));
  };
  // 數字鍵盤輸入
  K.ui.keypad = (root, q) => new Promise(res => {
    const t0 = Date.now(), ans = String(q.item.ans); let v = '';
    const disp = h('div', 'kp-disp', { text: '？' }), pad = h('div', 'kp');
    const upd = () => disp.textContent = v || '？';
    [...'123456789'].concat(['⌫', '0', '✔']).forEach(k => pad.append(h('button', 'kp-k' + (k === '✔' ? ' go' : ''), {
      text: k, onclick: () => {
        if (pad.dataset.done) return;
        if (k === '⌫') v = v.slice(0, -1);
        else if (k === '✔') {
          if (!v) return; pad.dataset.done = 1;
          const ok = v === ans; A.sfx(ok ? 'ok' : 'bad');
          disp.classList.add(ok ? 'right' : 'wrong'); if (!ok) disp.textContent = v + ' ✗　答案 ' + ans;
          return setTimeout(() => res({ ok, ms: Date.now() - t0, want: ans, got: ok ? '' : v }), ok ? 700 : 1800);
        } else if (v.length < 6) v += k;
        A.sfx('tap'); upd();
      }
    })));
    root.append(h('div', 'kp-wrap', null, disp, pad));
  });
  // 翻牌配對（英文翻翻樂、字詞配對森林共用）。items: [{k, a, b, say, lang}]
  K.ui.memory = (grid, ctx, p, items, onPair) => new Promise(res => {
    const cards = K.shuffle(items.flatMap(it => [{ it, html: it.a, say: it.say }, { it, html: it.b, say: it.sayB === undefined ? it.say : it.sayB }]));
    const land = grid.parentNode.clientWidth > grid.parentNode.clientHeight, n = cards.length;
    grid.style.setProperty('--c', land ? (n > 12 ? 8 : n > 8 ? 6 : 4) : (n > 12 ? 4 : n > 8 ? 3 : 2));
    grid.replaceChildren();
    let open = [], lock = false, left = items.length; const seen = new Set(), miss = {};
    cards.forEach(c => {
      const el = c.el = h('button', 'mcard', null, h('span', 'mc-f', { text: '❓' }), h('span', 'mc-b', { html: c.html }));
      el.onclick = async () => {
        if (lock || el.classList.contains('on')) return;
        el.classList.add('on'); A.sfx('tap'); if (c.say) A.speak(c.say, c.it.lang || 'zh-TW'); open.push(c);
        if (open.length < 2) return;
        lock = true; const [x, y] = open; open = [];
        if (x.it === y.it) {
          await ctx.wait(450); x.el.classList.add('ok'); y.el.classList.add('ok'); A.sfx('ok'); onPair();
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
})();
