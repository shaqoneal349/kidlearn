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
  K.mcq = (skill, o = {}) => K.mcqKinds[skill.kind](skill, o.n || 4, o.mode);
  K.gamesOf = skill => Object.values(K.games).filter(g => g.subj === skill.subj && g.kinds.includes(skill.kind));

  // ---------- 存檔 ----------
  const KEY = 'kidlearn.v1';
  K.store = {
    data: null,
    load() {
      let d = null;
      try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) { }
      if (!d || !d.learners) d = { v: 1, learners: [], current: null, settings: { sfx: true, voice: true } };
      this.data = d;
    },
    save() { try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { } },
    newLearner(name, avatar, grade) {
      const L = {
        id: 'L' + Date.now(), name, avatar, grade, limit: 20, extra: {},
        sub: { en: 1, ma: 1, zh: 1 }, recent: { en: [], ma: [], zh: [] }, hi: { en: 0, ma: 0, zh: 0 },
        skills: {}, stickers: [], days: {}, tests: [], best: {}, created: K.today()
      };
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
  // 唸題目：先中文指示（若有）再唸內容
  K.sayQ = q => { if (q && q.say) return A.speak(q.say, q.lang || 'zh-TW'); return Promise.resolve(); };

  // ---------- 學習引擎 ----------
  const GAP = [0, 1, 3, 7, 14, 30]; // Leitner 間隔（天）
  const E = K.engine = {
    L: () => K.store.cur(),
    st(sid) { const L = E.L(); return L.skills[sid] || (L.skills[sid] = { score: 0, box: 0, due: null, r: 0, w: 0, days: {}, games: {}, m: false, last: null }); },
    eligible(s, L) { return s.g < L.grade || (s.g === L.grade && s.sub <= L.sub[s.subj]); },
    unlocked(s, L) {
      return (s.prereq || []).every(p => {
        const ps = K.skill[p], t = L.skills[p];
        if (!ps || ps.g < L.grade) return true; // 低年級的先備視為已具備
        return t && (t.m || (t.r >= 5 && t.score >= 60));
      });
    },
    candidates(game) {
      const L = E.L();
      const all = K.skills.filter(s => s.subj === game.subj && game.kinds.includes(s.kind));
      let el = all.filter(s => E.eligible(s, L));
      if (!el.length && all.length) { // 這款遊戲在此程度沒有內容 → 用最基礎的
        const lv = Math.min(...all.map(s => s.g * 10 + s.sub));
        el = all.filter(s => s.g * 10 + s.sub === lv);
      }
      const un = el.filter(s => E.unlocked(s, L));
      return { all, list: un.length ? un : el };
    },
    weight(s, L, round) {
      const t = L.skills[s.id], today = K.today();
      if (!t || !t.last) return s.g < L.grade ? .3 : 3;          // 沒練過：低年級內容偶爾抽查
      if (t.due && t.due <= today) return round.answers.length < 3 ? 8 : 4; // 到期復習優先放在開頭
      if (t.m) return .4;
      return s.g < L.grade ? 1.5 : 3;
    },
    pick(game, round) {
      const L = E.L();
      if (round.retry) { const s = round.retry; round.retry = null; return { skill: s }; }
      const { all, list } = E.candidates(game);
      if (Math.random() < .08) { // 探測題：下一子級
        const pr = all.filter(s => s.g === L.grade && s.sub === L.sub[s.subj] + 1);
        if (pr.length) return { skill: K.pick(pr), probe: true };
      }
      const ws = list.map(s => E.weight(s, L, round));
      let r = Math.random() * ws.reduce((a, b) => a + b, 0);
      for (let i = 0; i < list.length; i++) { r -= ws[i]; if (r <= 0) return { skill: list[i] }; }
      return { skill: list[list.length - 1] };
    },
    // 回報一次作答；回傳 true 表示該跳示範卡
    report(game, round, skill, ok, ms, probe) {
      const L = E.L(), t = E.st(skill.id), today = K.today();
      ok ? t.r++ : t.w++;
      const d = t.days[today] || (t.days[today] = [0, 0]); d[ok ? 0 : 1]++;
      const ks = Object.keys(t.days).sort(); while (ks.length > 8) delete t.days[ks.shift()];
      t.games[game.id] = 1; t.last = today;
      t.score = ok ? t.score + (100 - t.score) * .2 : t.score * .75;
      round.answers.push({ sid: skill.id, ok, ms, probe: !!probe });
      if (!probe) { const rc = L.recent[skill.subj]; rc.push(ok ? 1 : 0); while (rc.length > 10) rc.shift(); }
      round.cw[skill.id] = ok ? 0 : (round.cw[skill.id] || 0) + 1;
      if (!ok && !probe) round.retry = skill; // 答錯立刻再來一題同類
      K.store.save();
      if (round.cw[skill.id] >= 3) { round.cw[skill.id] = 0; return true; }
      return false;
    },
    endRound(game, round) {
      const L = E.L(), today = K.today(), res = { n: 0, r: 0, skills: [], mastered: [], up: null, down: null, sticker: null };
      const by = {};
      for (const a of round.answers) {
        if (a.probe) continue;
        const b = by[a.sid] || (by[a.sid] = { n: 0, r: 0 }); b.n++; if (a.ok) b.r++;
        res.n++; if (a.ok) res.r++;
      }
      for (const sid in by) {
        const s = K.skill[sid], t = E.st(sid), acc = by[sid].r / by[sid].n;
        res.skills.push(s.name);
        if (!t.box) { t.box = 1; t.due = K.addDays(today, 1); }
        else if (t.due <= today) { t.box = acc >= .8 ? Math.min(5, t.box + 1) : acc < .6 ? 1 : t.box; t.due = K.addDays(today, GAP[t.box]); }
        else if (acc < .6) { t.box = 1; t.due = K.addDays(today, 1); }
        if (!t.m) { // 精熟：兩個不同日期皆 ≥90%，且在兩款遊戲出現過
          const good = Object.values(t.days).filter(d => d[0] + d[1] >= 3 && d[0] / (d[0] + d[1]) >= .9).length;
          const need = Math.min(2, K.gamesOf(s).length + 1); // +1：Boss 也算一種題型
          if (good >= 2 && Object.keys(t.games).length >= need) { t.m = true; res.mastered.push(s.name); }
        }
      }
      // 自適應：回合之間才升降
      const subj = game.subj || (round.answers[0] && K.skill[round.answers[0].sid].subj);
      if (subj && game.subj) {
        const rc = L.recent[subj];
        if (rc.length >= 10) {
          const acc = rc.reduce((a, b) => a + b, 0) / rc.length;
          if (acc > .85) { if (L.sub[subj] < 3) { L.sub[subj]++; L.recent[subj] = []; res.up = L.sub[subj]; } else if (res.n && res.r / res.n > .9) L.hi[subj]++; }
          else if (acc < .6 && L.sub[subj] > 1) { L.sub[subj]--; L.recent[subj] = []; res.down = L.sub[subj]; L.hi[subj] = 0; }
        }
      }
      const day = E.day();
      day.rounds++; day.sec += Math.min(600, Math.round((Date.now() - round.start) / 1000));
      if (game.subj) day.tasks[game.subj]++;
      // 貼紙：亂點（很快又錯）過半就不給
      const fast = round.answers.filter(a => !a.ok && a.ms < 500).length;
      if (res.n >= 3 && fast < res.n / 2) {
        const pool = K.STICKERS.filter(s => !L.stickers.includes(s));
        if (pool.length) { res.sticker = K.pick(pool); L.stickers.push(res.sticker); }
      }
      K.store.save();
      return res;
    },
    day() { const L = E.L(), t = K.today(); return L.days[t] || (L.days[t] = { sec: 0, rounds: 0, tasks: { en: 0, ma: 0, zh: 0 }, boss: false }); },
    masteredCount() { const L = E.L(); return Object.values(L.skills).filter(t => t.m).length; },
    overLimit() { const L = E.L(), d = E.day(); return L.limit > 0 && d.sec >= (L.limit + (L.extra[K.today()] || 0)) * 60; }
  };

  K.STICKERS = [...'🦁🐯🐻🐼🐨🐵🐶🐱🐰🦊🐸🐷🐮🐔🐧🦉🦄🐝🦋🐢🐬🐳🐙🦀🦖🌈⭐🌙☀️🌸🌻🍎🍓🍉🍩🍦🧁🚀🚗🚂⛵🎈🎁🏆🎨🎸⚽🏀'.matchAll(/\p{Extended_Pictographic}️?/gu)].map(m => m[0]);
  K.PETS = [[0, '🥚', '神祕的蛋'], [3, '🐣', '破殼寶寶'], [8, '🐥', '小小雞'], [16, '🦕', '小恐龍'], [30, '🐉', '學習神龍']];
  K.pet = () => { const n = E.masteredCount(); let p = K.PETS[0]; for (const x of K.PETS) if (n >= x[0]) p = x; return { e: p[1], name: p[2], n, next: (K.PETS[K.PETS.indexOf(p) + 1] || [null])[0] }; };

  // ---------- 共用 UI 元件 ----------
  const h = K.h;
  // 題目列：指示文字 + 題目 + 重聽
  K.ui.prompt = q => {
    const box = h('div', 'q-box');
    if (q.ask) box.append(h('div', 'q-ask', { text: q.ask }));
    const row = h('div', 'q-row');
    if (q.prompt && q.prompt !== '🔊') row.append(h('div', 'q-main', { html: q.prompt }));
    if (q.say) row.append(h('button', 'q-snd', { text: '🔊', 'aria-label': '再聽一次', onclick: () => K.sayQ(q) }));
    box.append(row);
    return box;
  };
  // 選項按鈕；回傳 Promise<{ok,ms}>
  K.ui.choice = (root, q, o = {}) => new Promise(res => {
    const t0 = Date.now(), wrap = h('div', 'choices ' + (o.cls || ''));
    q.opts.forEach((op, i) => {
      const b = h('button', 'opt', { html: op });
      b.onclick = () => {
        if (wrap.dataset.done) return; wrap.dataset.done = 1;
        const ok = i === q.ans; A.sfx(ok ? 'ok' : 'bad');
        b.classList.add(ok ? 'right' : 'wrong');
        if (!ok) wrap.children[q.ans].classList.add('right', 'show');
        setTimeout(() => res({ ok, ms: Date.now() - t0 }), ok ? 800 : 1700);
      };
      wrap.append(b);
    });
    root.append(wrap);
  });
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
          return setTimeout(() => res({ ok, ms: Date.now() - t0 }), ok ? 700 : 1800);
        } else if (v.length < 6) v += k;
        A.sfx('tap'); upd();
      }
    })));
    root.append(h('div', 'kp-wrap', null, disp, pad));
  });
})();
