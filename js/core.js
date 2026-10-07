'use strict';
// 小小學習家 — 核心：工具、存檔、語音音效、學習引擎、共用 UI
window.KL = { games: {}, skills: [], skill: {}, mcqKinds: {}, ui: {}, cur: null };
(() => {
  const K = KL;

  // ---------- 工具 ----------
  K.rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  K.pick = a => a[Math.floor(Math.random() * a.length)];
  K.shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  K.sample = (a, n) => K.shuffle(a).slice(0, n);
  K.uniq = a => [...new Set(a)];
  K.strip = s => String(s == null ? '' : s).replace(/<[^>]+>/g, '').trim();
  K.h = (tag, cls, props, ...kids) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (props) for (const k in props) {
      const v = props[k];
      if (v == null || v === false) continue; // null／false 就不設這個屬性
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
  K.daysBetween = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);

  // 知識點註冊
  K.add = (subj, g, sub, id, name, kind, data, x) => {
    const s = Object.assign({ subj, g, sub, id, name, kind, data }, x || {});
    K.skills.push(s); K.skill[id] = s; return s;
  };
  // 選擇題組裝：a 正解、ds 干擾項（皆為 HTML 字串）
  K.mkq = (base, a, ds, n = 4) => {
    a = String(a);
    const vis = x => /<svg|class="(sw|scene|em)/.test(x); // 圖像選項不用文字去重
    ds = K.uniq(ds.map(String)).filter(x => x !== a && (vis(x) || !K.strip(x) || K.strip(x) !== K.strip(a)));
    const opts = K.shuffle([a, ...K.shuffle(ds).slice(0, n - 1)]);
    return Object.assign(base, { opts, ans: opts.indexOf(a) });
  };
  K.mcq = (skill, o = {}) => { const q = K.mcqKinds[skill.kind](skill, o.n || 4, o.mode); q.skill = skill; if (!q.why && skill.why) q.why = skill.why; return q; };
  K.fits = (g, s) => g.subj === s.subj && (g.accept ? g.accept(s) : g.kinds.includes(s.kind));
  K.gamesOf = skill => Object.values(K.games).filter(g => K.fits(g, skill));
  // 抽題：有產生器就生成新題；靜態題庫避開本回合與最近幾回合出過的
  K.pi = (s, pool) => {
    if (s.gen && (!s.data || !s.data.length || (!pool && Math.random() < .55))) return s.gen();
    pool = pool || s.data; if (!pool || !pool.length) return s.gen();
    const L = K.engine.L(), seen = L ? ((L.seen = L.seen || {})[s.id] = L.seen[s.id] || []) : [];
    const used = K.cur ? (K.cur.used[s.id] = K.cur.used[s.id] || new Set()) : new Set();
    const idx = pool.map((_, i) => i);
    let cand = idx.filter(i => !used.has(i) && !seen.includes(i));
    if (cand.length < Math.max(1, Math.floor(pool.length * .25))) cand = idx.filter(i => !used.has(i));
    if (!cand.length) cand = idx;
    const i = K.pick(cand); used.add(i); seen.push(i); while (seen.length > Math.min(40, Math.floor(pool.length * .7))) seen.shift();
    return pool[i];
  };
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
      if (!d || !d.learners) d = { v: 3, learners: [], current: null, settings: {} };
      const old = d.settings || {}, r0 = old.rate || 1;
      // 語速分中英文；音量分「題目」（單字、字母、注音、題目本身）與「說明」（指示、鼓勵、旁白），音效另計
      d.settings = Object.assign({ sfx: true, voice: true, vib: true, motion: true, big: false, enAccent: 'US', enGender: 'f', enVoice: '', zhVoice: '', pin: '', enRate: Math.round(.85 * r0 * 100) / 100, zhRate: Math.round(.95 * r0 * 100) / 100, volQ: 1, volT: .8, volS: .7 }, old);
      delete d.settings.rate;
      d.learners.forEach(this.migrate); d.v = 3;
      this.data = d;
    },
    // 舊版 → 新版：只新增欄位，不刪除任何既有紀錄
    migrate(L) {
      L.gs = L.gs || { en: L.grade, ma: L.grade, zh: L.grade };
      if (L.zy == null) L.zy = (L.grade || 1) <= 2; // 題目注音：小一小二預設打開
      if (L.autoRead == null) L.autoRead = (L.grade || 1) <= 2; // 自動唸出沒有語音的題目（算式、文字題）
      L.log = L.log || []; L.last = L.last || {}; L.bonus = L.bonus || { fix: 0, ev: 0, rev: 0 }; L.seen = L.seen || {}; L.theme = L.theme || (L.grade >= 4 ? 'explorer' : 'kid');
      for (const id in L.skills) {
        const t = L.skills[id];
        if (!t.rec) {
          const n = Math.min(10, t.r + t.w), k = Math.round(n * t.r / Math.max(1, t.r + t.w));
          t.rec = Array(n).fill(0).fill(1, 0, k); t.hint = []; t.dl = t.m ? [1] : []; t.ap = []; t.ms = []; t.conf = {};
        }
        if (!t.dlD) t.dlD = t.dl.map(() => t.last || K.today());
      }
    },
    save() { try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { } },
    newLearner(name, avatar, grade, gs) {
      const L = {
        id: 'L' + Date.now(), name, avatar, grade, limit: 20, extra: {}, gs: gs || { en: grade, ma: grade, zh: grade },
        sub: { en: 1, ma: 1, zh: 1 }, recent: { en: [], ma: [], zh: [] }, hi: { en: 0, ma: 0, zh: 0 },
        skills: {}, stickers: [], days: {}, tests: [], best: {}, created: K.today()
      };
      this.migrate(L);
      this.data.learners.push(L); this.data.current = L.id; this.save(); return L;
    },
    cur() { return this.data.learners.find(l => l.id === this.data.current) || null; }
  };

  // ---------- 音效、震動與語音 ----------
  const A = K.audio = {
    ac: null,
    tone(f, t0, d, type = 'sine', g = .15) {
      const ac = A.ac, o = ac.createOscillator(), ga = ac.createGain();
      o.type = type; o.frequency.value = f;
      ga.gain.setValueAtTime(Math.max(.002, g * (K.store.data.settings.volS ?? 1)), ac.currentTime + t0);
      ga.gain.exponentialRampToValueAtTime(.001, ac.currentTime + t0 + d);
      o.connect(ga).connect(ac.destination); o.start(ac.currentTime + t0); o.stop(ac.currentTime + t0 + d);
    },
    sfx(n) {
      const S = K.store.data.settings;
      if (S.vib && navigator.vibrate && (n === 'ok' || n === 'bad' || n === 'win')) try { navigator.vibrate(n === 'bad' ? [30, 40, 30] : n === 'win' ? [20, 30, 20, 30, 60] : 20); } catch (e) { }
      if (!S.sfx) return;
      try {
        A.ac = A.ac || new (window.AudioContext || window.webkitAudioContext)();
        if (A.ac.state === 'suspended') A.ac.resume();
        ({
          ok: () => { A.tone(660, 0, .12); A.tone(880, .1, .2); },
          bad: () => A.tone(220, 0, .25, 'triangle', .12),
          tap: () => A.tone(500, 0, .05, 'sine', .06),
          pop: () => A.tone(900, 0, .07, 'square', .06),
          win: () => [523, 659, 784, 1047].forEach((f, i) => A.tone(f, i * .12, .25)),
          star: () => { A.tone(1200, 0, .1); A.tone(1600, .08, .15); },
          hit: () => { A.tone(150, 0, .3, 'sawtooth', .12); }
        })[n]();
      } catch (e) { }
    },
    voices() { try { return speechSynthesis.getVoices(); } catch (e) { return []; } },
    // 依設定挑語音：指定名稱 → 口音 + 性別 → 同語言任一
    voice(lang) {
      const S = K.store.data.settings, vs = A.voices(), p = lang.slice(0, 2);
      if (p === 'zh') {
        if (S.zhVoice) { const v = vs.find(v => v.name === S.zhVoice); if (v) return v; }
        return A.zhVoices()[0] || null;
      }
      if (S.enVoice) { const v = vs.find(v => v.name === S.enVoice); if (v) return v; }
      const acc = S.enAccent === 'UK' ? /en[-_]GB/i : /en[-_]US/i, en = vs.filter(v => /^en/i.test(v.lang));
      const g = v => A.gender(v), want = S.enGender;
      return en.find(v => acc.test(v.lang) && g(v) === want) || en.find(v => acc.test(v.lang) && g(v) !== (want === 'f' ? 'm' : 'f')) || en.find(v => acc.test(v.lang)) || en.find(v => g(v) === want) || en[0] || null;
    },
    // 中文語音依「像不像臺灣口音」排序：臺灣的自然語音 → 臺灣語音 → 其他華語；粵語（香港）不用
    isTW: v => /zh[-_]TW|Taiwan|臺灣|台灣/i.test(v.lang + ' ' + v.name),
    zhRank(v) {
      if (A.isTW(v)) return /Natural|Online|Neural|Enhanced|Premium|增強|優化/i.test(v.name) ? 0 : /Google/i.test(v.name) ? 1 : /Mei-?Jia|美佳/i.test(v.name) ? 2 : 3;
      return /zh[-_]CN|cmn|Hans|普通话/i.test(v.lang + v.name) ? 5 : 6;
    },
    zhVoices: () => A.voices().filter(v => /^(zh|cmn)/i.test(v.lang) && !/HK|yue|Cantonese|粵|廣東/i.test(v.lang + v.name)).sort((a, b) => A.zhRank(a) - A.zhRank(b)),
    gender(v) {
      const n = v.name;
      if (/female|woman|girl|女/i.test(n)) return 'f'; if (/male|man|boy|男/i.test(n)) return 'm';
      if (/Samantha|Karen|Moira|Tessa|Fiona|Victoria|Zira|Hazel|Susan|Ava|Allison|Serena|Kate|Emma|Jenny|Aria|Libby|Sonia|Olivia|Amy|Joanna|Salli|Kendra|Kimberly|Ivy|Nicole|Emily|Catherine|Linda|Heather|Zoe|Martha|Hollie|Maisie|Michelle|Ana|Sara|Natasha|Clara|Yating|Hsiao|Mei|Ting|Yun|Xiaoxiao|Hanhan|Shu/i.test(n)) return 'f';
      if (/Daniel|Alex|Fred|Tom|David|Mark|George|Ryan|Guy|Oliver|Thomas|Brian|Matthew|Christopher|Eric|Jacob|Brandon|Roger|Steffan|Liam|James|Arthur|Aaron|Andrew|Justin|Kevin|Russell|William|Yunjhe|Zhiwei|Wayne|Junjie|Yunxi/i.test(n)) return 'm';
      return '?';
    },
    ok(lang) { const S = K.store.data.settings; return !!(S.voice && 'speechSynthesis' in window && A.voice(lang)); },
    rate: lang => { const S = K.store.data.settings; return lang[0] === 'e' ? S.enRate || .85 : S.zhRate || .95; },
    // o.q：題目內容（用題目音量）；o.slow：再放慢的倍數；o.queue：接在前一句後面
    speak(text, lang = 'zh-TW', o = {}) {
      return new Promise(res => {
        const S = K.store.data.settings;
        if (!S.voice || !('speechSynthesis' in window) || !text) return res(false);
        try {
          if (!o.queue) speechSynthesis.cancel();
          const zh = lang[0] !== 'e', said = zh ? K.zhRead(text) : String(text).replace(/_{2,}|＿+/g, ' blank ');
          const u = new SpeechSynthesisUtterance(said);
          u.lang = lang; const v = A.voice(lang); if (v) { u.voice = v; u.lang = v.lang; }
          const rate = A.rate(lang) * (o.slow || 1);
          u.rate = rate; u.volume = Math.max(0, Math.min(1, o.q ? S.volQ ?? 1 : S.volT ?? 1));
          u.onend = () => res(true); u.onerror = () => res(false);
          speechSynthesis.speak(u);
          setTimeout(() => res(true), Math.max(2500, said.length * (zh ? 400 : 110)) / rate);
        } catch (e) { res(false); }
      });
    },
    // 中英夾雜的句子拆段，各用對應的語音依序唸
    async say(text, o = {}) {
      const segs = K.segs(text);
      for (let i = 0; i < segs.length; i++) if (!await A.speak(segs[i][0], segs[i][1], Object.assign({}, o, { queue: i > 0 || o.queue }))) return false;
      return segs.length > 0;
    },
    playFile(url) {
      return new Promise(res => {
        try {
          const S = K.store.data.settings; if (!S.voice) return res(false);
          A.el = A.el || new Audio(); const el = A.el; el.src = url; el.volume = Math.max(0, Math.min(1, S.volQ ?? 1));
          el.playbackRate = Math.min(1.5, Math.max(.6, (S.zhRate || .95) / .95));
          el.onended = () => res(true); el.onerror = () => res(false);
          el.play().catch(() => res(false)); setTimeout(() => res(true), 3000);
        } catch (e) { res(false); }
      });
    },
    stop() { try { speechSynthesis.cancel(); if (A.el) { A.el.pause(); } } catch (e) { } }
  };
  // ---------- 中文朗讀前處理：阿拉伯數字與符號改成口語（2 個 → 兩個、2/3 → 三分之二、8:30 → 八點三十分）----------
  const CN = '零一二三四五六七八九';
  const sec = (x, head) => { // 0–9999
    const ds = String(x).padStart(4, '0').split('').map(Number), U = ['千', '百', '十', ''];
    let out = '', zero = false;
    ds.forEach((d, i) => {
      if (!d) { if (out) zero = true; return; }
      if (zero) { out += '零'; zero = false; }
      out += (d === 2 && i < 2 ? '兩' : d === 1 && i === 2 && !out && head ? '' : CN[d]) + U[i];
    });
    return out;
  };
  K.cnNum = s => {
    s = String(s); const n = +s;
    if (s.length > 1 && s[0] === '0' || n > 99999999) return s.split('').map(d => CN[d]).join('');
    if (!n) return '零';
    const w = Math.floor(n / 1e4), r = n % 1e4;
    if (!w) return sec(r, true);
    return (w === 2 ? '兩' : sec(w, true)) + '萬' + (r ? (r < 1000 ? '零' : '') + sec(r, false) : '');
  };
  const MEAS = '個|隻|本|張|條|顆|位|塊|元|枝|支|件|杯|輛|朵|片|包|盒|台|臺|把|頭|匹|棵|根|粒|間|座|封|雙|對|次|天|週|周|年|歲|小時|點|分鐘|秒|公尺|公分|公里|公斤|公克|公升|毫升|公頃|倍|人|頁|瓶|碗|袋|箱|串|層|艘|份|種|名|題|步|圈|格|邊|隊|組|堂|節|場|首|句|篇|筆|球|下|口|聲|罐|餐|樣|類|斤|排|行|列|半|千|百|萬|億|週';
  const MEAS_RE = new RegExp('^\\s*(' + MEAS + ')');
  const zhRead0 = t => String(t)
    .replace(/<[^>]+>/g, '')
    .replace(/(\d+)\s*\/\s*(\d+)/g, (m, a, b) => `${b}分之${a}`)
    .replace(/(^|[^\d:])(\d{1,2}):(\d{2})(?![\d:])/g, (m, p, hh, mm) => +mm < 60 && +hh < 25 ? `${p}${hh}點${+mm ? (+mm < 10 ? '零' : '') + (+mm) + '分' : ''}` : m)
    .replace(/(\d)\s*[:：]\s*(?=[\d□])/g, '$1比')
    .replace(/(\d+(?:\.\d+)?)\s*[%％]/g, '百分之$1')
    .replace(/(\d+)\.(\d+)/g, (m, a, b) => K.cnNum(a) + '點' + b.split('').map(d => CN[d]).join(''))
    .replace(/(^|[^\d\s]|[^\d]\s)[−-](?=\d)/g, '$1負')
    .replace(/\s*[+＋]\s*/g, '加').replace(/\s*[−]\s*/g, '減').replace(/(\d)\s+-\s+(?=\d)/g, '$1減').replace(/\s*[×＊]\s*/g, '乘以').replace(/\s*[÷]\s*/g, '除以').replace(/\s*[=＝]\s*/g, '等於')
    .replace(/□/g, '多少').replace(/＿+|_{2,}|❓/g, '什麼')
    .replace(/(第?)(\d+)/g, (m, di, d, i, all) => di ? '第' + K.cnNum(d) : d === '2' && MEAS_RE.test(all.slice(i + m.length)) ? '兩' : K.cnNum(d))
    .replace(/[\p{Extended_Pictographic}️‍]/gu, '').replace(/\s{2,}/g, ' ').trim();
  // 語音引擎常唸錯的多音字：依注音字典判斷這個字在詞裡的讀音，換成同音字再交給語音（只影響發音，不影響畫面）
  // 例：「數一數」裡的數是 ㄕㄨˇ，但 Windows／Android 語音常唸成 ㄕㄨˋ。
  const SAY_SUB = { '數ㄕㄨˇ': '暑', '背ㄅㄟ': '杯' };
  K.zhRead = t => {
    const x = zhRead0(t); if (!K.zyOf || !/[數背]/.test(x)) return x;
    const a = [...x], zs = K.zyOf(x);
    return a.map((c, i) => SAY_SUB[c + zs[i]] || c).join('');
  };
  // 中英夾雜拆段：[[文字, 語言]]
  K.segs = t => {
    const out = [], s = String(t || '').replace(/<[^>]+>/g, ' ');
    let last = 0;
    for (const m of s.matchAll(/[A-Za-z_][A-Za-z0-9'’,.!?;\s_-]*[A-Za-z0-9.!?_]|[A-Za-z]/g)) {
      const zh = s.slice(last, m.index); if (/[㐀-鿿\d]/.test(zh)) out.push([zh.trim(), 'zh-TW']);
      out.push([m[0].trim(), 'en-US']); last = m.index + m[0].length;
    }
    const rest = s.slice(last); if (/[㐀-鿿\d]/.test(rest)) out.push([rest.trim(), 'zh-TW']);
    return out;
  };
  // 會洩漏答案的題型（題目就是在考讀音）：不加注音，也不把題目本體唸出來
  K.NOZY = new Set(['bpmf', 'syl', 'tone', 'char', 'poly', 'phonetic']);
  const secret = q => q.skill && K.NOZY.has(q.skill.kind);
  const strip0 = s => String(s).replace(/<[^>]+>/g, ' ');
  // 沒有指定語音的題目，從畫面文字組出要唸的內容（算式、文字題、閱讀題）
  K.qText = q => {
    if (!q.prompt || q.prompt === '🔊' || secret(q)) return '';
    let x = String(q.prompt).replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<span class="nl">[\s\S]*$/, ' ')
      .replace(/<span class="fr" data-v="(\d+)\/(\d+)">[\s\S]*?<\/span>/g, ' $2分之$1 ').replace(/<\/div>/g, '。');
    x = strip0(x).replace(/[\p{Extended_Pictographic}️‍](?<!❓)/gu, ' ').replace(/\s+/g, ' ').trim();
    return /[㐀-鿿A-Za-z\d]/.test(x) ? x : '';
  };
  K.canSay = q => !!(q && (q.say || q.audio || q.ask || K.qText(q)));
  // 唸題目：低年級先唸指示再唸內容；注音用教育部音檔，失敗才用 TTS 代字
  // o.manual：孩子按了 🔊（沒有指定語音的題目，指示和題目都唸）
  K.sayQ = async (q, o = {}) => {
    if (!q) return;
    const L = K.store.cur && K.store.cur(), low = K.cur && K.cur.grade <= 2, qo = Object.assign({ q: true }, o);
    if (q.say || q.audio) {
      if (low && q.ask && !o.noAsk && !o.slow) { await A.speak(q.ask, 'zh-TW'); await new Promise(r => setTimeout(r, 150)); }
      if (q.audio) { const played = await A.playFile(q.audio); if (played) return; }
      if (q.say) await A.speak(q.say, q.lang || 'zh-TW', Object.assign(qo, { queue: low && q.ask && !o.noAsk }));
      return;
    }
    const body = K.qText(q), auto = L && L.autoRead;
    if (!o.manual && !auto) { if (low && q.ask && !o.noAsk) await A.speak(q.ask, 'zh-TW'); return; }
    if (q.ask && (o.manual || !o.noAsk)) await A.speak(q.ask, 'zh-TW');
    if (body) await A.say(body, Object.assign(qo, { queue: !!q.ask }));
  };

  // ---------- 注音（題目文字上方標注音，可在家長專區或遊戲中按「ㄅ」開關）----------
  // 遊戲畫面裡的文字都標；字卡、拼字格、找錯字等「字本身就是答案」的元件不標
  const ZYSEL = '.groot,.hint-toast,.demo', ZYEXC = 'ruby,svg,.nozy,.zy,.tile,.slot,.mcard,.c4-ch,.kp-wrap,input,select,textarea,.q-snd,.q-help';
  // 文字 → 每個字的讀音（先比對詞表的多音詞，其餘用單字預設讀音）
  K.zyOf = t => {
    const Z = K.ZY || { c: {}, p: {} }, a = [...t], out = Array(a.length).fill('');
    for (let i = 0; i < a.length;) {
      let hit = 0;
      for (let n = Math.min(6, a.length - i); n > 1; n--) { const r = Z.p[a.slice(i, i + n).join('')]; if (r) { r.split(' ').forEach((z, j) => out[i + j] = z); hit = n; break; } }
      if (hit) { i += hit; continue; }
      let z = Z.c[a[i]] || '';
      if (a[i] === '地' && i >= 2 && a[i - 1] === a[i - 2]) z = 'ㄉㄜ˙'; // 慢慢地
      out[i++] = z;
    }
    return out;
  };
  const zyText = z => z.endsWith('˙') ? '˙' + z.slice(0, -1) : z; // 輕聲點放前面
  const zyNode = node => {
    const t = node.nodeValue; if (!/[㐀-鿿]/.test(t)) return;
    const a = [...t], zs = K.zyOf(t); if (!zs.some(Boolean)) return; // 沒有可標的字就不動（避免監看迴圈）
    const frag = document.createDocumentFragment();
    let buf = '';
    a.forEach((c, i) => {
      if (!zs[i]) { buf += c; return; }
      if (buf) { frag.append(buf); buf = ''; }
      const r = document.createElement('ruby'); r.className = 'zr'; r.append(c, K.h('rt', null, { text: zyText(zs[i]) })); frag.append(r);
    });
    if (buf) frag.append(buf);
    node.replaceWith(frag);
  };
  const inZy = el => el && el.closest && el.closest(ZYSEL) && !el.closest(ZYEXC);
  K.zyAnnotate = el => {
    if (!inZy(el)) return;
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentNode.closest(ZYEXC) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    const ns = []; while (w.nextNode()) ns.push(w.currentNode);
    ns.forEach(zyNode);
  };
  K.zyOn = () => { const L = K.store.cur && K.store.cur(); return !!(L && L.zy); };
  K.zyApply = () => {
    document.body.classList.toggle('zyon', K.zyOn());
    if (K.zyOn()) document.querySelectorAll(ZYSEL).forEach(K.zyAnnotate);
  };
  K.zyWatch = () => {
    if (K._zyObs || typeof MutationObserver === 'undefined') return;
    K._zyObs = new MutationObserver(ms => {
      if (!K.zyOn()) return;
      for (const m of ms) for (const n of m.addedNodes) {
        if (n.nodeType === 3) { if (inZy(n.parentNode)) K.zyAnnotate(n.parentNode); continue; }
        if (n.nodeType !== 1 || n.matches('ruby,rt')) continue;
        if (inZy(n)) K.zyAnnotate(n); else n.querySelectorAll(ZYSEL).forEach(K.zyAnnotate);
      }
    });
    K._zyObs.observe(document.body, { childList: true, subtree: true });
  };

  // ---------- 學習引擎 ----------
  const GAP = [0, 1, 3, 7, 14, 30]; // Leitner 間隔（天）
  K.STAGES = [['🌱', '新手'], ['🌿', '熟悉'], ['🌳', '穩定'], ['⭐', '精熟']];
  const E = K.engine = {
    L: () => K.store.cur(),
    st(sid) { const L = E.L(); return L.skills[sid] || (L.skills[sid] = { score: 0, box: 0, due: null, r: 0, w: 0, days: {}, games: {}, m: false, last: null, rec: [], hint: [], dl: [], dlD: [], ap: [], ms: [], conf: {} }); },
    // 掌握度 0–100：近期正確率 + 隔日保留 + 情境應用 + 獨立完成 + 流暢度；新技能不看速度
    mastery(t, s) {
      if (!t || !t.rec || !t.rec.length) return 0;
      const n = t.rec.length, acc = mean(t.rec);
      const dl = t.dl.length ? mean(t.dl) : acc * .5, ap = t.ap.length ? mean(t.ap) : acc * .6, ind = t.hint.length ? 1 - mean(t.hint) : 1;
      let fw = .10, fl = 0;
      if (n < 6 || !t.ms.length) fw = 0; else { const base = (s && s.base) || 7000; fl = Math.max(0, Math.min(1, (2.5 * base - median(t.ms)) / (1.5 * base))); }
      return Math.round(100 * ((.55 - fw) * acc + .20 * dl + .15 * ap + .10 * ind + fw * fl) * Math.min(1, n / 6));
    },
    // 0 新手 1 熟悉 2 穩定 3 精熟（精熟：隔日答對兩次以上，且前後相隔至少 7 天）
    stage(sid) {
      const t = E.L().skills[sid]; if (!t || !t.last) return 0;
      const m = t.score; let st = m >= 80 ? 3 : m >= 60 ? 2 : m >= 35 ? 1 : 0;
      if (st === 3) { const ok = (t.dl || []).map((v, i) => v ? (t.dlD || [])[i] : null).filter(Boolean); if (!(ok.length >= 2 && K.daysBetween(ok[0], ok[ok.length - 1]) >= 7)) st = 2; }
      return st;
    },
    eligible(s, L) { const g = L.gs[s.subj]; return s.g < g || (s.g === g && s.sub <= L.sub[s.subj]); },
    unlocked(s, L) { return (s.prereq || []).every(p => { const ps = K.skill[p]; return !ps || ps.g < L.gs[ps.subj] || E.stage(p) >= 2; }); },
    candidates(game) {
      const L = E.L();
      const all = K.skills.filter(s => K.fits(game, s));
      let el = all.filter(s => E.eligible(s, L));
      if (!el.length && all.length) { const lv = Math.min(...all.map(s => s.g * 10 + s.sub)); el = all.filter(s => s.g * 10 + s.sub === lv); }
      return { all, list: el };
    },
    weight(s, L, round) {
      const t = L.skills[s.id], today = K.today(), low = s.g < L.gs[s.subj];
      const lock = E.unlocked(s, L) ? 1 : .35;
      if (!t || !t.last) return (low ? .3 : 3) * lock;
      if (t.due && t.due <= today) return round && round.answers.length < 3 ? 8 : 4; // 到期復習優先放在開頭
      if (t.m) return .4;
      return (low ? 1.5 : 3) * lock;
    },
    // 低年級題目總權重封頂 20%（到期複習不受限），避免淹沒本年級內容
    wpick(list, L, round) {
      const today = K.today(), ws = list.map(s => E.weight(s, L, round));
      const low = list.map(s => { const t = L.skills[s.id]; return s.g < L.gs[s.subj] && !(t && t.due && t.due <= today); });
      let ls = 0, cs = 0; ws.forEach((w, i) => low[i] ? ls += w : cs += w);
      if (cs > 0 && ls > cs / 4) { const k = (cs / 4) / ls; ws.forEach((w, i) => { if (low[i]) ws[i] = w * k; }); }
      let r = Math.random() * ws.reduce((a, b) => a + b, 0);
      for (let i = 0; i < list.length; i++) { r -= ws[i]; if (r <= 0) return list[i]; }
      return list[list.length - 1];
    },
    pick(game, round) {
      const L = E.L();
      if (round.retry) { const s = round.retry; round.retry = null; return { skill: s }; }
      const { all, list } = E.candidates(game);
      if (Math.random() < (round.hard ? .35 : .08)) { const pr = all.filter(s => s.g === L.gs[s.subj] && s.sub === L.sub[s.subj] + 1); if (pr.length) return { skill: K.pick(pr), probe: true }; }
      return { skill: E.wpick(list, L, round) };
    },
    // 回報一次作答。ok＝第一次、沒用提示就答對；info: {hint, fixed, want, got, ev, q}
    report(game, round, skill, ok, ms, probe, info) {
      info = info || {};
      const L = E.L(), t = E.st(skill.id), today = K.today(), day = E.day();
      if (!(skill.id in round.pre)) round.pre[skill.id] = E.stage(skill.id);
      ok ? t.r++ : t.w++;
      const d = t.days[today] || (t.days[today] = [0, 0]); d[ok ? 0 : 1]++;
      const ks = Object.keys(t.days).sort(); while (ks.length > 8) delete t.days[ks.shift()];
      if (t.last && t.last < today && !probe) { push(t.dl, ok ? 1 : 0, 4); push(t.dlD = t.dlD || [], today, 4); } // 隔日後的第一題 = 延遲保留
      t.games[game.id] = 1; t.last = today;
      push(t.rec, ok ? 1 : 0, 10); push(t.hint, info.hint ? 1 : 0, 10);
      if (game.app) push(t.ap, ok ? 1 : 0, 6);
      if (ok && ms > 0) push(t.ms, ms, 6);
      if (ok && !probe) { const c = round.hard ? 2 : 1; L.coins = (L.coins || 0) + c; round.coins = (round.coins || 0) + c; } // 金幣：給賽車車庫用
      if (!ok && info.want && info.got) { // 錯誤型態
        let key = `把「${info.want}」選成「${info.got}」`;
        const a = +info.want, b = +info.got;
        if (skill.kind === 'arith' && !isNaN(a) && !isNaN(b)) key = Math.abs(a - b) === 1 ? '答案差 1（數錯或粗心）' : Math.abs(a - b) === 10 ? '答案差 10（進位／退位）' : String(a).split('').reverse().join('') === String(b) ? '十位和個位顛倒' : '計算方法還不熟';
        t.conf[key] = (t.conf[key] || 0) + 1;
        const cs = Object.keys(t.conf); if (cs.length > 12) delete t.conf[cs.sort((x, y) => t.conf[x] - t.conf[y])[0]];
      }
      t.score = E.mastery(t, skill); t.m = E.stage(skill.id) === 3;
      round.answers.push({ sid: skill.id, ok, ms, probe: !!probe });
      // 回合回顧：記下每一題的題目、正確答案與孩子的選擇，結束後給孩子再看一次
      const q = info.q || {};
      round.log.push({ sid: skill.id, ok, hint: !!info.hint, fixed: !!info.fixed, ask: q.ask || '', prompt: q.prompt && q.prompt !== '🔊' ? q.prompt : '', say: q.say || '', lang: q.lang || '', audio: q.audio || '',
        want: info.want || '', got: info.got || '', wantH: info.wantH || '', gotH: info.gotH || '', why: q.why || (!ok ? q.hint || skill.demo || '' : '') });
      if (!ok) round.wrongs.push({ sid: skill.id, want: info.want || '', got: info.got || '', prompt: info.q ? K.strip(info.q.ask || '') + ' ' + K.strip(info.q.prompt || info.q.say || '') : '', why: (info.q && info.q.why) || skill.why || skill.demo || '' });
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
    newRound() { return { answers: [], log: [], wrongs: [], cw: {}, pre: {}, fixed: 0, ev: 0, start: Date.now(), retry: null, used: {} }; },
    endRound(game, round) {
      const L = E.L(), today = K.today(), res = { coins: round.coins || 0, hard: !!round.hard, n: 0, r: 0, skills: [], mastered: [], grew: [], up: null, down: null, gradeUp: false, sticker: null, fixed: round.fixed, ev: round.ev, wrongs: round.wrongs, log: round.log };
      const by = {};
      for (const a of round.answers) { if (a.probe) continue; const b = by[a.sid] || (by[a.sid] = { n: 0, r: 0 }); b.n++; if (a.ok) b.r++; res.n++; if (a.ok) res.r++; }
      for (const sid in by) {
        const s = K.skill[sid], t = E.st(sid), acc = by[sid].r / by[sid].n, st = E.stage(sid);
        res.skills.push(s.name);
        if (!t.box) { t.box = 1; t.due = K.addDays(today, 1); }
        else if (t.due <= today) { t.box = acc >= .8 ? Math.min(5, t.box + 1) : acc < .6 ? 1 : t.box; t.due = K.addDays(today, GAP[t.box]); }
        else if (acc < .6) { t.box = 1; t.due = K.addDays(today, 1); }
        if (st > (round.pre[sid] || 0)) (st === 3 ? res.mastered : res.grew).push(st === 3 ? s.name : `${s.name} ${K.STAGES[st][0]}`);
      }
      const subj = game.subj;
      if (subj) {
        const rc = L.recent[subj], okMs = round.answers.filter(a => a.ok && a.ms > 0).map(a => a.ms), slow = okMs.length && median(okMs) > 15000;
        if (rc.length >= 10) {
          const acc = mean(rc);
          if (acc > .85 && !slow) {
            if (L.sub[subj] < 3) { L.sub[subj]++; L.recent[subj] = []; res.up = L.sub[subj]; }
            else if (res.n && res.r / res.n > .9) {
              L.hi[subj]++;
              const mine = K.skills.filter(s => s.subj === subj && s.g === L.gs[subj]);
              if (L.hi[subj] >= 3 && L.gs[subj] < 6 && mine.filter(s => E.stage(s.id) >= 2).length >= mine.length * .6) { L.gs[subj]++; L.sub[subj] = 1; L.hi[subj] = 0; L.recent[subj] = []; res.gradeUp = true; }
            }
          } else if (acc < .6 && L.sub[subj] > 1) { L.sub[subj]--; L.recent[subj] = []; res.down = L.sub[subj]; L.hi[subj] = 0; }
        }
      }
      const day = E.day();
      day.rounds++; day.sec += Math.min(600, Math.round((Date.now() - round.start) / 1000));
      if (game.subj) day.tasks[game.subj]++;
      if (game.id === 'review') { day.rev = 1; L.bonus.rev++; }
      L.last[game.id] = Date.now();
      const fast = round.answers.filter(a => !a.ok && a.ms < 500).length;
      if (res.n >= 3 && fast < res.n / 2) { const pool = K.STICKERS.filter(s => !L.stickers.includes(s)); if (pool.length) { res.sticker = K.pick(pool); L.stickers.push(res.sticker); } }
      K.store.save();
      return res;
    },
    day() {
      const L = E.L(), t = K.today(), d = L.days[t] || (L.days[t] = { sec: 0, rounds: 0, tasks: { en: 0, ma: 0, zh: 0 }, boss: false });
      d.by = d.by || { en: [0, 0], ma: [0, 0], zh: [0, 0] };
      return d;
    },
    due() { const L = E.L(), today = K.today(); return K.skills.filter(s => { const t = L.skills[s.id]; return t && t.due && t.due <= today; }); },
    suggest(subj) {
      const L = E.L(), all = K.skills.filter(s => s.subj === subj && K.gamesOf(s).length);
      let el = all.filter(s => E.eligible(s, L) && E.unlocked(s, L)); if (!el.length) el = all.filter(s => E.eligible(s, L)); if (!el.length) el = all;
      const gs = K.gamesOf(E.wpick(el, L, null));
      return gs.sort((a, b) => (L.last[a.id] || 0) - (L.last[b.id] || 0) || Math.random() - .5)[0].id;
    },
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

  // 島嶼裝飾：四個系列，各自集滿有成就感
  K.STICKER_SETS = [['🏝️ 小島建設', '🌴🌳🌵🌺🌻🍄🏠⛺🏰🎡🎠⛲🗿🌋🚤⛱️'], ['🐾 島上動物', '🦜🐚🦩🐠🦁🐯🐻🐼🐨🐵🐶🐱🐰🦊🐸🐷🐮🐔🐧🦉🦄🐝🦋🐢🐬🐳🐙🦀🦖'], ['🌈 天空與點心', '🌈⭐🌙☀️🌸🍎🍓🍉🍩🍦🧁'], ['🎉 冒險道具', '🚀🚗🚂⛵🎈🎁🏆🎨🎸⚽🏀']];
  K.STICKERS = K.STICKER_SETS.flatMap(s => [...s[1].matchAll(/\p{Extended_Pictographic}️?/gu)].map(m => m[0]));
  K.PETS = [[0, '🥚', '神祕的蛋'], [3, '🐣', '破殼寶寶'], [8, '🐥', '小小雞'], [16, '🦕', '小恐龍'], [30, '🐉', '學習神龍']];
  K.pet = () => { const n = E.masteredCount(); let p = K.PETS[0]; for (const x of K.PETS) if (n >= x[0]) p = x; return { e: p[1], name: p[2], n, next: (K.PETS[K.PETS.indexOf(p) + 1] || [null])[0] }; };

  // ---------- 季節換皮（參考 Starfall：同一遊戲依日期換主題，內容不變、新鮮感更新）----------
  // 農曆節日用對照表（2026–2030）；其餘依月份
  const LUNAR = { cny: { 2026: '02-17', 2027: '02-06', 2028: '01-26', 2029: '02-13', 2030: '02-03' }, moon: { 2026: '09-25', 2027: '09-15', 2028: '10-03', 2029: '09-22', 2030: '09-12' }, boat: { 2026: '06-19', 2027: '06-09', 2028: '05-28', 2029: '06-16', 2030: '06-05' } };
  K.LUNAR = LUNAR;
  K.season = (d = new Date()) => {
    const y = d.getFullYear(), md = K.dstr(d).slice(5), m = d.getMonth() + 1;
    const near = (s, a, b) => { if (!s) return false; const diff = (new Date(K.dstr(d) + 'T12:00:00') - new Date(`${y}-${s}T12:00:00`)) / 864e5; return diff >= -a && diff <= b; };
    if (near(LUNAR.cny[y], 10, 15)) return { k: 'cny', n: '新年快樂', dot: '🧧', deco: ['🏮', '🧧', '🐉', '🎆', '🍊'] };
    if (near(LUNAR.moon[y], 7, 5)) return { k: 'moon', n: '中秋節快樂', dot: '🥮', deco: ['🌕', '🐰', '🥮', '🏮'] };
    if (near(LUNAR.boat[y], 5, 2)) return { k: 'boat', n: '端午節', dot: '🍙', deco: ['🐉', '🚣', '🍙', '🌿'] };
    if (md >= '10-15' && md <= '10-31') return { k: 'hall', n: '萬聖節', dot: '🎃', deco: ['🎃', '🦇', '👻', '🍬'] };
    if (md >= '12-10' && md <= '12-31') return { k: 'xmas', n: '聖誕節', dot: '🎁', deco: ['🎄', '⛄', '🎁', '🔔'] };
    if (m >= 3 && m <= 5) return { k: 'spring', n: '春天', dot: '🌸', deco: ['🌸', '🌷', '🦋', '🐝'] };
    if (m >= 6 && m <= 8) return { k: 'summer', n: '夏天', dot: '🍉', deco: ['🍉', '🌞', '🐚', '🏖️'] };
    if (m >= 9 && m <= 11) return { k: 'autumn', n: '秋天', dot: '🍁', deco: ['🍁', '🍂', '🌰', '🍄'] };
    return { k: 'winter', n: '冬天', dot: '❄️', deco: ['❄️', '⛄', '🧣', '☃️'] };
  };

  // ---------- 共用 UI 元件 ----------
  const h = K.h, strip = K.strip;
  // 星光粒子：答對時從物件中心噴出（參考 Starfall 的 sparkles）
  K.fx = {
    burst(el, n = 8) {
      if (!el || !el.isConnected || !K.store.data.settings.motion) return;
      const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      for (let i = 0; i < n; i++) {
        const a = Math.PI * 2 * i / n + Math.random() * .4, d = 50 + Math.random() * 50;
        const s = h('span', 'spark', { text: K.pick(['✨', '⭐', '🌟', '✦']), style: `left:${cx}px;top:${cy}px;--dx:${(Math.cos(a) * d).toFixed(0)}px;--dy:${(Math.sin(a) * d).toFixed(0)}px` });
        document.body.append(s); setTimeout(() => s.remove(), 800);
      }
    }
  };
  // 注音拼讀卡：符號一個一個亮起並播放教育部音檔，最後唸出整個字（Starfall 的「拼讀卡」中文版）
  K.ui.spellCard = (z, c, w) => {
    const sp = K.zySplit(z), card = h('div', 'spell nozy', null,
      h('div', 'sp-syms', null, sp.syms.map(s => h('b', 'zy', { text: s })), sp.tone !== 'ˉ' && h('b', 'zy tn', { text: sp.tone })),
      h('span', 'sp-eq', { text: '→' }), h('span', 'sp-all zy', { text: z.replace('ˉ', '') }), c && h('span', 'sp-c zhc', { text: c }), w && h('small', 'sp-w', { text: w }));
    card.play = async () => {
      const bs = card.querySelectorAll('.sp-syms b');
      for (let i = 0; i < sp.syms.length; i++) {
        bs.forEach(b => b.classList.remove('on')); bs[i].classList.add('on');
        const f = K.BPMF_FILE && K.BPMF_FILE[sp.syms[i]];
        if (!(f && await Promise.race([A.playFile(f), new Promise(r => setTimeout(() => r(true), 900))]))) await A.speak(K.BPMF_SAY[sp.syms[i]] || sp.syms[i], 'zh-TW', { q: true });
      }
      bs.forEach(b => b.classList.add('on')); card.classList.add('all');
      if (c) await A.speak(w && w !== c ? `${c}。${w}的${c}` : c, 'zh-TW', { q: true });
    };
    return card;
  };
  // 拖曳（也支援點一下）：放到目標上由 onDrop 決定對錯，錯了彈回原位
  K.ui.drag = (el, o) => {
    let sx, sy, ghost = null, moved = false;
    const at = (x, y) => (o.targets() || []).find(t => { const r = t.getBoundingClientRect(); return x >= r.left - 12 && x <= r.right + 12 && y >= r.top - 12 && y <= r.bottom + 12; });
    el.addEventListener('pointerdown', e => {
      if (el.dataset.off) return;
      sx = e.clientX; sy = e.clientY; moved = false;
      const mv = ev => {
        const dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (!moved && Math.hypot(dx, dy) < 10) return;
        if (!moved) { moved = true; const r = el.getBoundingClientRect(); ghost = el.cloneNode(true); ghost.classList.add('drag-ghost'); ghost.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`; document.body.append(ghost); el.classList.add('dragging'); }
        ghost.style.transform = `translate(${dx}px,${dy}px) scale(1.08)`;
        (o.targets() || []).forEach(t => t.classList.toggle('over', t === at(ev.clientX, ev.clientY)));
      };
      const up = ev => {
        document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', up);
        (o.targets() || []).forEach(t => t.classList.remove('over'));
        if (!moved) { o.onTap && o.onTap(); return; }
        const t = at(ev.clientX, ev.clientY), ok = t ? o.onDrop(t) : false;
        el.classList.remove('dragging');
        if (ok || !ghost) { if (ghost) ghost.remove(); return; }
        ghost.style.transition = 'transform .3s'; ghost.style.transform = 'translate(0,0)'; setTimeout(() => ghost.remove(), 320); // 彈回
      };
      document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up);
    });
  };
  // 整句語音化：答對後把答案說成完整的一句話（「3 + 5 = 8」「天上有白雲。」「ㄇ、ㄚ → ㄇㄚ 媽」）
  // 回傳 { text, say, lang, zy:{z,c,w} }，沒有合適的句子就回傳 null
  K.fullOf = q => {
    if (q.full === false) return null;
    if (q.full) return typeof q.full === 'string' ? { text: q.full, say: q.full } : q.full;
    const s = q.skill, it = q.item, want = strip(q.opts[q.ans]);
    if (!s) return null;
    const fillBlank = t => String(t).replace(/□|＿+|_{2,}|❓/, want);
    switch (s.kind) {
      case 'arith': { const t = strip(it.text); if (/[文題]|，|？/.test(t) && !/[□]/.test(t)) return { text: `答案是 ${want}`, say: `答案是${want}` }; const x = /□/.test(t) ? t.replace('□', want) : `${t} = ${want}`; return { text: x, say: x }; }
      case 'count': return { text: `一共有 ${want} 個`, say: `一共有${want}個` };
      case 'compare': return { text: `${/大/.test(q.ask) ? '最大' : '最小'}的是 ${want}`, say: `${/大/.test(q.ask) ? '最大' : '最小'}的是${want}` };
      case 'syl': case 'char': return it && it.z ? { zy: { z: it.z, c: it.c, w: it.w } } : null;
      case 'tone': { if (!it || !it.z) return null; const tn = want.replace(/[ˉˊˇˋ˙\s]|（.*?）/g, ''); return { text: `${it.w || it.c}：${tn}`, say: `${it.c}，${tn}` }; }
      case 'vocab': case 'lsound': case 'phon': case 'sight': return it && it.w ? { text: `${it.w}　${s.kind === 'lsound' ? '' : it.zh}`, say: it.w, lang: 'en-US', then: s.kind === 'lsound' ? '' : it.zh } : null;
      case 'fill': return it ? { text: it.s.replace(/＿+/, it.a), say: it.s.replace(/＿+/, it.a) } : null;
      case 'mc': return it && /＿/.test(it.q) ? { text: it.q.replace('＿', it.a), say: it.q.replace('＿', it.a) } : null;
      case 'cloze': return it ? { text: it.s.replace(/_{2,}/, it.a), say: it.s.replace(/_{2,}/, it.a), lang: 'en-US' } : null;
      case 'pair': { const p = strip(q.prompt); return { text: `${p} ↔ ${want}`, say: `${p}的${s.rel}詞是${want}` }; }
      case 'comp': return it ? { text: `${it.p.join('＋')}＝${it.c}`, say: `${it.c}，${it.w}的${it.c}` } : null;
      case 'zpic': return it ? { text: `${it.e} ${it.w}`, say: it.w } : null;
      case 'balance': return { text: `□ = ${want}`, say: `答案是${want}` };
      default: { const p = strip(q.prompt); if (/□|＿|_{2,}/.test(p) && p.length < 40) { const x = fillBlank(p); return { text: x, say: x, lang: /[㐀-鿿]/.test(x) ? 'zh-TW' : 'en-US' }; } return null; }
    }
  };
  // 顯示並唸出整句；低年級等唸完再進下一題（最多 4 秒）
  K.ui.full = q => {
    const f = K.fullOf(q), box = document.querySelector('.groot .q-box');
    if (!f || !box) return Promise.resolve();
    const low = !K.cur || K.cur.grade == null || K.cur.grade <= 3;
    const pill = h('div', 'full-say' + (f.zy ? ' nozy' : ''));
    let p;
    if (f.zy) { const card = K.ui.spellCard(f.zy.z, f.zy.c, f.zy.w); pill.append(card); p = low ? card.play() : Promise.resolve(); }
    else { pill.append(h('span', null, { text: '✅ ' }), h('span', f.lang === 'en-US' ? 'enw' : '', { text: f.text })); p = low ? (f.lang === 'en-US' ? A.speak(f.say, 'en-US', { q: true }).then(() => f.then && A.speak(f.then, 'zh-TW', { queue: true })) : A.say(f.say)) : Promise.resolve(); }
    box.querySelectorAll('.full-say').forEach(x => x.remove()); box.append(pill);
    return Promise.race([p, new Promise(r => setTimeout(r, 4000))]);
  };
  // 題目列：指示文字 + 題目（無語音時顯示文字備援）+ 重聽 + 求助
  K.ui.prompt = q => {
    const box = h('div', 'q-box' + (secret(q) ? ' nozy' : ''));
    if (q.ask) box.append(h('div', 'q-ask tap', { text: q.ask, title: '點一下聽題目', onclick: () => A.speak(q.ask) })); // 點指示文字就唸出來
    const row = h('div', 'q-row');
    const voiceOK = q.audio || A.ok(q.lang || 'zh-TW'), nz = secret(q) ? ' nozy' : '';
    if (q.prompt && q.prompt !== '🔊') row.append(h('div', 'q-main' + nz, { html: q.prompt }));
    else if (!voiceOK) row.append(h('div', 'q-main nov' + nz, { html: q.novoice || `<span class="zhs">${strip(q.say)}</span>` }));
    // 每一題都能按 🔊 唸出來：有指定語音就唸指定的，沒有就唸指示＋畫面上的題目
    if (K.canSay(q)) row.append(h('button', 'q-snd' + (voiceOK ? '' : ' off'), { text: '🔊', 'aria-label': '再聽一次', onclick: () => K.sayQ(q, { noAsk: true, manual: true }) }));
    if (q.opts && q.opts.length > 2) row.append(h('button', 'q-help', { text: '💡', 'aria-label': '給我提示', onclick: () => q._help && q._help() }));
    box.append(row);
    return box;
  };
  K.ui.hint = (html, speak) => {
    const r = document.querySelector('.groot'); if (!r) return;
    let e = r.querySelector('.hint-toast');
    if (!html) { if (e) e.remove(); return; }
    if (!e) { e = h('div', 'hint-toast'); r.append(e); }
    e.innerHTML = '💡 ' + html;
    if (speak) A.speak(strip(html));
  };
  // 多選一的共用流程：第一次答錯 → 給提示再試一次；第二次錯才公布答案並說明
  K.ui.multi = (q, els, o = {}) => new Promise(res => {
    const t0 = Date.now(), two = q.opts.length > 2 && !o.single; let tries = 0, got = null, done = false, helped = false;
    const hintText = () => q.hint || (q.skill && q.skill.demo) || '再仔細看一次，慢慢想。';
    const showHint = () => { if (o.onHint) o.onHint(); K.ui.hint(hintText(), !q.say && !q.audio); const ht = document.querySelector('.hint-toast'); if (ht) ht.classList.toggle('nozy', secret(q)); if (q.say || q.audio) setTimeout(() => K.sayQ(q, { slow: .75, noAsk: true }), 300); };
    const finish = ok => {
      done = true; q._help = null; if (o.lock) o.lock();
      const out = () => { K.ui.hint(null); res({ ok: ok && !tries && !helped, fixed: ok && (tries > 0 || helped), hint: tries > 0 || helped, ms: Date.now() - t0, want: strip(q.opts[q.ans]), got: got == null ? '' : strip(q.opts[got]), wantH: q.opts[q.ans], gotH: got == null ? '' : q.opts[got], q }); };
      // 答錯：留著說明，等孩子看完按「下一步」再繼續
      if (!ok && !o.single) { const why = q.why || ''; K.ui.hint(`正確答案是「${strip(q.opts[q.ans])}」。${why}`, true); const t = document.querySelector('.hint-toast'); if (t) { t.append(h('button', 'btn pri next', { text: '我知道了，下一題 →', onclick: () => { A.sfx('tap'); A.stop(); out(); } })); return; } }
      const ms = Date.now() - t0, go = () => { K.ui.hint(null); res({ ok: ok && !tries && !helped, fixed: ok && (tries > 0 || helped), hint: tries > 0 || helped, ms, want: strip(q.opts[q.ans]), got: got == null ? '' : strip(q.opts[got]), wantH: q.opts[q.ans], gotH: got == null ? '' : q.opts[got], q }); };
      if (ok && !o.single && !o.noFull) { const sleep = new Promise(r => setTimeout(r, o.okWait || 800)); Promise.all([K.ui.full(q), sleep]).then(() => setTimeout(go, 250)); return; }
      setTimeout(go, ok ? (o.okWait || 800) : (o.badWait || (q.why ? 2600 : 1900)));
    };
    q._help = () => {
      if (done || helped || o.single) return; helped = true; showHint();
      const w = els.map((e, i) => i).filter(i => i !== q.ans && !els[i].dataset.x);
      if (w.length > 1) { const i = K.pick(w); els[i].dataset.x = 1; els[i].classList.add(o.wrong || 'wrong'); }
    };
    els.forEach((el, i) => el.addEventListener('click', () => {
      if (done || el.dataset.x || el.closest('[data-wait]')) return;
      if (o.onPick) o.onPick(el, i);
      if (i === q.ans) { A.sfx(tries ? 'star' : 'ok'); el.classList.add(o.right || 'right'); K.fx.burst(el); return finish(true); }
      A.sfx('bad'); el.classList.add(o.wrong || 'wrong'); el.dataset.x = 1; if (got == null) got = i;
      if (!tries && two) { tries = 1; showHint(); }
      else { tries = 2; els[q.ans].classList.add(o.reveal || 'right', 'show'); finish(false); }
    }));
  });
  K.ui.choice = (root, q, o = {}) => {
    const wrap = h('div', 'choices ' + (o.cls || '') + (secret(q) ? ' nozy' : '')), els = q.opts.map(op => { const L = strip(op).length, b = h('button', 'opt' + (L > 18 ? ' xl' : L > 9 ? ' long' : ''), { html: op }); return b; });
    wrap.append(...els); root.append(wrap);
    // 選項逐一浮出（Starfall：先看題、再看選項，避免一出現就亂點）；低年級慢一點，挑戰模式與關閉動態時不延遲
    const S = K.store.data.settings, step = !S.motion || o.single || (K.cur && K.cur.hard) ? 0 : K.cur && K.cur.grade <= 2 ? 320 : 140;
    if (step) { wrap.classList.add('stag'); wrap.style.setProperty('--d', step + 'ms'); els.forEach((b, i) => b.style.setProperty('--i', i)); wrap.dataset.wait = 1; setTimeout(() => delete wrap.dataset.wait, step * els.length + 120); }
    return K.ui.multi(q, els, Object.assign({ lock: () => wrap.dataset.done = 1 }, o));
  };
  // 數字鍵盤輸入（支援小數點與分數）
  K.ui.keypad = (root, q) => new Promise(res => {
    const raw = q.item.ans, m = typeof raw === 'string' && raw.match(/data-v="([^"]+)"/), ans = m ? m[1] : String(raw), t0 = Date.now(); let v = '';
    const disp = h('div', 'kp-disp', { text: '？' }), pad = h('div', 'kp');
    const keys = [...'123456789'].concat([ans.includes('.') ? '.' : ans.includes('/') ? '/' : '⌫', '0', '✔']);
    if (keys[9] !== '⌫') keys.splice(9, 0, '⌫');
    const upd = () => disp.textContent = v || '？';
    keys.forEach(k => pad.append(h('button', 'kp-k' + (k === '✔' ? ' go' : ''), {
      text: k, onclick: () => {
        if (pad.dataset.done) return;
        if (k === '⌫') v = v.slice(0, -1);
        else if (k === '✔') {
          if (!v) return; pad.dataset.done = 1;
          const ok = v === ans || (+v === +ans && !ans.includes('/')); A.sfx(ok ? 'ok' : 'bad');
          disp.classList.add(ok ? 'right' : 'wrong'); if (!ok) { disp.textContent = v + ' ✗　答案 ' + ans; K.ui.hint(q.hint || (q.skill && q.skill.demo) || '', true); }
          return setTimeout(() => { K.ui.hint(null); res({ ok, ms: Date.now() - t0, want: ans, got: ok ? '' : v, q }); }, ok ? 700 : 2600);
        } else if (v.length < 7) v += k;
        A.sfx('tap'); upd();
      }
    })));
    root.append(h('div', 'kp-wrap', null, disp, pad));
  });
  // 翻牌配對。items: [{k, a, b, say, sayB, lang}]
  K.ui.memory = (grid, ctx, p, items, onPair) => new Promise(res => {
    const cards = K.shuffle(items.flatMap(it => [{ it, html: it.a, say: it.say }, { it, html: it.b, say: it.sayB === undefined ? it.say : it.sayB }]));
    const W = grid.parentNode.clientWidth, H = grid.parentNode.clientHeight - 80, n = cards.length;
    const longest = Math.max(...cards.map(c => strip(c.html).length)); // 有長單字時用比較少欄，卡片才夠寬
    let cols = 4; for (const c of (longest > 8 ? [3] : longest > 6 ? [5, 4, 3] : [8, 6, 5, 4, 3])) { const rows = Math.ceil(n / c), size = Math.min((W - 10 * c) / c, (H - 10 * rows) / rows / 1.05); if (size >= 70 || c === 3) { cols = c; if (size >= 70) break; } }
    grid.style.setProperty('--c', cols); grid.classList.toggle('wide', longest > 8);
    grid.replaceChildren();
    let open = [], lock = false, left = items.length; const seen = new Set(), miss = {};
    cards.forEach(c => {
      // 長單字自動縮小字級：依字數算出卡片寬度內放得下的大小（cqi = 卡片寬度的 1%）
      const tx = strip(c.html).replace(/\s+/g, ' '), n = Math.max(1, [...tx].length), cjk = /[㐀-鿿]/.test(tx);
      const el = c.el = h('button', 'mcard', null, h('span', 'mc-f', { text: '❓' }), h('span', 'mc-b', { html: c.html, style: `--fit:${Math.min(40, (cjk ? 80 : 165) / n).toFixed(1)}` }));
      el.onclick = async () => {
        if (lock || el.classList.contains('on')) return;
        el.classList.add('on'); A.sfx('tap'); if (c.say) A.speak(c.say, c.it.lang || 'zh-TW', { q: true }); open.push(c);
        if (open.length < 2) return;
        lock = true; const [x, y] = open; open = [];
        if (x.it === y.it) {
          await ctx.wait(450); x.el.classList.add('ok'); y.el.classList.add('ok'); A.sfx('ok'); onPair();
          await ctx.report(p, (miss[x.it.k] || 0) <= 1, 3000, { want: `${strip(x.it.a)} ＝ ${strip(x.it.b)}`, wantH: `${x.it.a} ＝ ${x.it.b}`, q: { ask: '配對', say: x.it.say || '', lang: x.it.lang || '' } });
          lock = false; if (!--left) res();
        } else {
          const partner = cards.find(o => o.it === x.it && o !== x);
          if (seen.has(partner)) miss[x.it.k] = (miss[x.it.k] || 0) + 1;
          seen.add(x); seen.add(y);
          await ctx.wait(1000); x.el.classList.remove('on'); y.el.classList.remove('on'); lock = false;
        }
      };
      grid.append(el);
    });
  });
})();
