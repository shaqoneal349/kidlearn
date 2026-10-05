'use strict';
// 學習步道（參考 Starfall 的 Learn to Read：每一課固定「認識＋小書＋遊戲」，同一個知識點用三種方式學）
// 三條步道：注音（37 個符號＋拼讀＋聲調）、ABC（26 個字母＋5 個短母音）、數字（0–20＋數到 100＋10 的好朋友＋加法）
// 「認識」是引導式的：大大的符號落下並發音 → 點例詞聽 → 綠色箭頭才往下 → 最後找一找（會記進學習紀錄）
(() => {
  const K = KL, h = K.h, A = K.audio, E = K.engine;
  const S = () => K.shell;
  const zyT = z => z.endsWith('˙') ? '˙' + z.slice(0, -1) : z;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const shake = el => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
  const playSym = s => K.BPMF_FILE[s] ? Promise.race([A.playFile(K.BPMF_FILE[s]), wait(1500)]).then(ok => ok || A.speak(K.BPMF_SAY[s], 'zh-TW', { q: true })) : A.speak(K.BPMF_SAY[s] || s, 'zh-TW', { q: true });

  // ---------- 注音兒歌（每單元一首，原創）----------
  const RHYME = {
    1: '👨🥟|爸爸買包子，\n👩🍇|媽媽買葡萄，\n✈️|飛機飛呀飛，\n🐱|小貓喵喵叫。',
    2: '🐰|兔子跳跳跳，\n🥚|雞蛋圓又圓，\n🐮🥛|喝杯熱牛奶，\n🐯|老虎吼一聲。',
    3: '🐶|小狗汪汪叫，\n🌸|花朵香又香，\n🐵|猴子爬上樹，\n👖|褲子穿好了。',
    4: '🐔|小雞嘰嘰叫，\n🎈|氣球飛上天，\n🍉|西瓜甜又甜，\n⭐|星星眨眼睛。',
    5: '🐷|小豬吃飽了，\n🚗|汽車叭叭叭，\n📖|我來看看書，\n🌅|日出好溫暖。',
    6: '⚽|足球踢一踢，\n🌿|小草綠油油，\n☂️|雨傘撐開來，\n🐿️|松鼠找松果。',
    7: '🦆|鴨子游一游，\n🐢|烏龜慢慢爬，\n🐟|金魚吐泡泡，\n🌧️|下雨滴滴答。',
    8: '🐸|青蛙呱呱叫，\n👵|婆婆笑哈哈，\n🦢|白鵝唱著歌，\n🍃|葉子沙沙沙。',
    9: '❤️|愛心送給你，\n✈️|飛機飛得高，\n🎒|書包背好了，\n🐵|猴子拍拍手。',
    10: '⛰️|高山好高大，\n🚪|開門說你好，\n🍬|糖果甜蜜蜜，\n💡|電燈亮晶晶，\n👂|耳朵聽一聽。'
  };
  const rhymeBook = (u, title) => ({ id: 'rhyme-' + u, title, cover: '🎵', lang: 'zh', ask: null, qs: [], pages: RHYME[u].split('\n').map(l => { const [e, t] = l.split('|'); return { e, t }; }) });

  // ---------- 步道與單元 ----------
  const ZU = [['ㄅㄆㄇㄈ', 'zh-bpmf-1'], ['ㄉㄊㄋㄌ', 'zh-bpmf-1'], ['ㄍㄎㄏ', 'zh-bpmf-2'], ['ㄐㄑㄒ', 'zh-bpmf-2'], ['ㄓㄔㄕㄖ', 'zh-bpmf-3'], ['ㄗㄘㄙ', 'zh-bpmf-3'], ['ㄧㄨㄩ', 'zh-bpmf-4'], ['ㄚㄛㄜㄝ', 'zh-bpmf-4'], ['ㄞㄟㄠㄡ', 'zh-bpmf-5'], ['ㄢㄣㄤㄥㄦ', 'zh-bpmf-5']];
  const EU = ['ABCD', 'EFGH', 'IJKL', 'MNOP', 'QRST', 'UVWX', 'YZ'];
  const VOW = [['a', 'en-cvc', 'en-sam'], ['e', 'en-cvc-3', 'en-hens'], ['i', 'en-cvc-2', 'en-pig'], ['o', 'en-cvc-2', 'en-pot'], ['u', 'en-cvc-3', 'en-bug']];
  const TRACKS = [
    { k: 'zy', n: '注音步道', icon: 'ㄅ', subj: 'zh', g: 1, units: ZU.map(([syms, sk], i) => ({ id: 'zy' + (i + 1), title: [...syms].join(' '), sub: '認識注音', acts: [['see', '👀', '認識', () => seeSyms([...syms], sk)], ['book', '🎵', '兒歌', () => K.books.readBook(rhymeBook(i + 1, `注音兒歌：${[...syms].join(' ')}`), () => mark('zy' + (i + 1), 'book'))], ['game', '🫧', '聽音戳泡泡', () => S().play('lzy', null, { focus: [sk], data: { syms: [...syms] }, back: ['📚 回學習步道', () => open('zy')], onDone: () => mark('zy' + (i + 1), 'game') })]] })).concat([
      { id: 'zy11', title: 'ㄇ＋ㄚ→ㄇㄚ', sub: '二拼', acts: [['see', '🎰', '拼讀機器', () => seeBlend('zh-pin2', 'zy11')], ['book', '📖', '小貓咪', () => K.books.readBook(K.BOOKS.find(b => b.id === 'zy-cat'), () => mark('zy11', 'book'))], ['game', '🧲', '注音家族', () => S().play('c13', null, { focus: ['zh-pin2'], back: ['📚 回學習步道', () => open('zy')], onDone: () => mark('zy11', 'game') })]] },
      { id: 'zy12', title: 'ˉ ˊ ˇ ˋ', sub: '四聲', acts: [['see', '🎵', '聲調高低', () => seeTones()], ['book', '📖', '下雨了', () => K.books.readBook(K.BOOKS.find(b => b.id === 'zy-rain'), () => mark('zy12', 'book'))], ['game', '🪵', '分類木樁', () => S().play('c12', null, { focus: ['zh-tone'], back: ['📚 回學習步道', () => open('zy')], onDone: () => mark('zy12', 'game') })]] },
      { id: 'zy13', title: 'ㄏ＋ㄨ＋ㄚ', sub: '三拼', acts: [['see', '🎰', '三拼機器', () => seeBlend('zh-pin3', 'zy13')], ['book', '📖', '好吃的水果', () => K.books.readBook(K.BOOKS.find(b => b.id === 'zy-fruit'), () => mark('zy13', 'book'))], ['game', '🛤️', '注音組裝站', () => S().play('c9', null, { focus: ['zh-pin3'], back: ['📚 回學習步道', () => open('zy')], onDone: () => mark('zy13', 'game') })]] }
    ]) },
    { k: 'abc', n: 'ABC 步道', icon: 'Aa', subj: 'en', g: 1, units: EU.map((ls, i) => ({ id: 'abc' + (i + 1), title: [...ls].join(' '), sub: '字母', en: true, acts: [['see', '👀', '認識', () => seeLetters([...ls], i < 4 ? 'en-abc-1' : 'en-abc-2', 'abc' + (i + 1))], ['book', '🎵', 'ABC 韻文', () => K.books.readBook(abcBook([...ls]), () => mark('abc' + (i + 1), 'book'))], ['game', '🫧', '字母泡泡', () => S().play('labc', null, { focus: [i < 4 && !'NOPQRSTUVWXYZ'.includes(ls[0]) ? 'en-abc-1' : 'en-abc-2'], data: { syms: [...ls] }, back: ['📚 回學習步道', () => open('abc')], onDone: () => mark('abc' + (i + 1), 'game') })]] })).concat(
      VOW.map(([v, sk, bk], i) => ({ id: 'sv-' + v, title: `short ${v}`, sub: '短母音', en: true, acts: [['see', '🎰', 'Word Machine', () => seeMachine(v, sk, 'sv-' + v)], ['book', '📖', K.BOOKS.find(b => b.id === bk).title, () => K.books.readBook(K.BOOKS.find(b => b.id === bk), () => mark('sv-' + v, 'book'))], ['game', '🧲', 'Make-a-Word', () => S().play('e10', null, { focus: [sk], data: { vowel: v }, back: ['📚 回學習步道', () => open('abc')], onDone: () => mark('sv-' + v, 'game') })]] }))) },
    { k: 'num', n: '數字步道', icon: '123', subj: 'ma', g: 1, units: [[0, 5], [6, 10], [11, 15], [16, 20]].map(([a, b], i) => ({ id: 'num' + (i + 1), title: `${a} – ${b}`, sub: '認識數字', acts: [['see', '👀', '認識', () => seeNums(a, b, 'num' + (i + 1))], ['book', '📖', '數數書', () => K.books.readBook(countBook(a, b), () => mark('num' + (i + 1), 'book'))], ['game', '🐻', '餵小熊', () => S().play('lnum', null, { focus: ['ma-count20'], data: { a: Math.max(1, a), b }, back: ['📚 回學習步道', () => open('num')], onDone: () => mark('num' + (i + 1), 'game') })]] })).concat([
      { id: 'num5', title: '10 的好朋友', sub: '合成 10', acts: [['see', '🔟', '十格框', () => seeTen()], ['game', '🎰', '加法機器', () => S().play('m7', null, { focus: ['ma-make10'], back: ['📚 回學習步道', () => open('num')], onDone: () => mark('num5', 'game') })]] },
      { id: 'num6', title: '1 – 100', sub: '數到 100', acts: [['see', '💯', '百數表', () => seeHundred()], ['game', '🫧', '數字泡泡', () => S().play('m8', null, { focus: ['ma-count100'], back: ['📚 回學習步道', () => open('num')], onDone: () => mark('num6', 'game') })]] },
      { id: 'num7', title: '3 + 2 = 5', sub: '加法', acts: [['game', '🎰', '加法機器', () => S().play('m7', null, { focus: ['ma-add10'], back: ['📚 回學習步道', () => open('num')], onDone: () => mark('num7', 'game') })]] }
    ]) }
  ];
  K.lessons = { open, TRACKS, progress };
  const LS = () => { const L = E.L(); L.lessons = L.lessons || {}; return L.lessons; };
  const mark = (uid, act) => { const s = LS()[uid] || (LS()[uid] = {}); s[act] = K.today(); K.store.save(); };
  const doneU = u => u.acts.every(a => (LS()[u.id] || {})[a[0]]);
  function progress() { return TRACKS.map(t => ({ n: t.n, done: t.units.filter(doneU).length, all: t.units.length })); }

  // ---------- 步道地圖 ----------
  let curTrack = null;
  function open(k) {
    const L = E.L();
    if (!k) k = curTrack || (L.gs.zh <= 1 ? 'zy' : L.gs.en <= 2 ? 'abc' : 'num');
    curTrack = k;
    const T = TRACKS.find(t => t.k === k), nextU = T.units.find(u => !doneU(u));
    const tabs = h('div', 'ls-tabs', null, TRACKS.map(t => h('button', 'ls-tab' + (t.k === k ? ' on' : ''), { onclick: () => { A.sfx('tap'); open(t.k); } }, h('b', null, { text: t.icon }), h('span', null, { text: t.n }), h('small', null, { text: `${t.units.filter(doneU).length}/${t.units.length}` }))));
    const path = h('div', 'ls-path', null, T.units.map((u, i) => {
      const st = LS()[u.id] || {}, dn = doneU(u), isNext = u === nextU;
      return h('div', 'ls-unit' + (dn ? ' done' : '') + (isNext ? ' next' : '') + (i % 2 ? ' r' : ''), null,
        h('div', 'ls-num', { text: dn ? '⭐' : i + 1 }),
        h('div', 'ls-body', null, h('b', 'ls-title' + (u.en ? ' enw' : ' zy'), { text: u.title }), h('small', null, { text: u.sub }),
          h('div', 'ls-acts', null, u.acts.map(([key, ic, name, fn]) => h('button', 'ls-act' + (st[key] ? ' ok' : '') + (isNext && !st[key] && !u.acts.slice(0, u.acts.findIndex(a => a[0] === key)).some(a => !st[a[0]]) ? ' go' : ''), { onclick: () => { A.sfx('tap'); fn(); } }, h('span', null, { text: st[key] ? '✅' : ic }), h('small', null, { text: name }))))));
    }));
    S().show(h('div', 'screen lessons lstrack-' + k, null,
      h('div', 'lib-head', null, S().btn('🏠 回小島', '', S().showHome), h('h1', null, { text: '📚 學習步道' })),
      tabs, h('p', 'sub', { text: k === 'zy' ? '先「認識」注音，再唸兒歌，最後玩遊戲。三個都完成就得到一顆星！' : k === 'abc' ? '每一課：認識字母 → 唸韻文 → 玩遊戲。後面還有短母音拼讀。' : '看數字、數一數、餵小熊，學會 0 到 20，再數到 100。' }), path));
    const go = document.querySelector('.ls-act.go');
    if (go) { go.scrollIntoView({ block: 'center' }); setTimeout(() => S().coach(go, '從這裡開始！'), 600); }
    A.speak(`${T.n}，${nextU ? '從亮亮的那一課開始吧！' : '全部完成了，好厲害！'}`);
  }

  // ---------- 引導畫面框架 ----------
  // steps: [async (stage, api) => {...}]；api.next() 顯示綠色箭頭並等待點擊
  function guide(title, subj, steps, onDone, back) {
    const stage = h('div', 'gd-stage'), nextB = h('button', 'gd-next', { text: '➜', 'aria-label': '下一步' }), prog = S().progressUI(steps.length);
    let alive = true;
    const quit = () => { alive = false; A.stop(); S().setCur(null); K.cur = null; (back || (() => open()))(); };
    S().show(h('div', 'gs guide s-' + subj, null, h('div', 'gbar', null, h('button', 'ib', { text: '↩️', 'aria-label': '回學習步道', onclick: () => { A.sfx('tap'); quit(); } }), prog.el, h('div', 'gname', { text: title }), subj === 'zh' ? S().zyBtn() : null), h('div', 'groot gd', null, stage, nextB)));
    S().setCur({ exit() { alive = false; } }); K.cur = { grade: 1, alive: true, used: {} };
    const round = E.newRound(), game = { id: 'lesson', name: '學習步道', subj, n: steps.length };
    const api = {
      alive: () => alive,
      wait: ms => new Promise(r => setTimeout(() => alive && r(), ms)),
      next: () => new Promise(r => { nextB.classList.add('on', 'idle-target'); nextB.dataset.tip = '按綠色箭頭繼續'; nextB.onclick = () => { A.sfx('tap'); A.stop(); nextB.classList.remove('on', 'idle-target'); r(); }; }),
      tap: (el, tip) => new Promise(r => { el.classList.add('idle-target', 'flash'); if (tip) el.dataset.tip = tip; const f = () => { el.classList.remove('idle-target', 'flash'); el.removeEventListener('click', f); r(); }; el.addEventListener('click', f); }),
      report: (skill, ok, ms, info) => { if (skill) E.report(game, round, skill, ok, ms, false, info || {}); },
      // 找一找：聽題目，在選項裡點對的（第一次就點對才算獨立答對）
      async find(ask, sayFn, opts, ans, skill, cls) {
        stage.replaceChildren(h('div', 'gd-ask', { text: ask }), h('div', 'gd-find', null, opts.map(o => h('button', 'gd-opt ' + (cls || ''), { text: o, 'data-v': o }))));
        const els = [...stage.querySelectorAll('.gd-opt')], t0 = Date.now(); let miss = 0;
        stage.prepend(h('button', 'q-snd', { text: '🔊', onclick: sayFn })); sayFn();
        await new Promise(r => els.forEach(b => b.onclick = () => { if (b.dataset.v === ans) { A.sfx(miss ? 'star' : 'ok'); b.classList.add('right'); K.fx.burst(b); r(); } else { miss++; A.sfx('bad'); shake(b); b.classList.add('wrong'); if (miss >= 2) els.find(x => x.dataset.v === ans).classList.add('idle-target', 'flash'); } }));
        api.report(skill, miss === 0, Date.now() - t0, { hint: miss > 0, want: ans, q: { ask } });
        await api.wait(700);
      }
    };
    (async () => {
      for (let i = 0; i < steps.length && alive; i++) { await steps[i](stage, api); prog.set((i + 1) / steps.length); }
      if (!alive) return;
      if (round.answers.length) E.endRound(game, round);
      onDone && onDone();
      A.sfx('win');
      stage.replaceChildren(h('div', 'result', null, h('div', 'r-stars', { text: '🌟' }), h('h1', null, { text: '這一課認識完了！' }), h('p', null, { text: '接下來可以唸小書、玩遊戲，三個都完成就有一顆星。' }), h('div', 'row nozy', null, S().btn('📚 回學習步道', 'pri', quit))));
      A.speak('這一課認識完了！好棒！');
      S().setCur(null); K.cur = null;
    })();
    const stopIdle = S().idleWatch(stage.parentNode, 6000);
    const obs = new MutationObserver(() => { if (!stage.isConnected) { stopIdle(); obs.disconnect(); alive = false; } });
    obs.observe(document.getElementById('app'), { childList: true });
  }
  // 詞語＋注音，指定的符號在注音裡標紅
  const zyWord = (w, sym) => { const zs = K.zyOf(w); return h('span', 'zw nozy', null, [...w].map((c, i) => h('ruby', null, null, c, h('rt', null, { html: zyT(zs[i] || '').replace(sym, `<b>${sym}</b>`) })))); };

  // ---------- 注音：認識符號 ----------
  function seeSyms(syms, sk) {
    const uid = TRACKS[0].units.find(u => u.title === syms.join(' ')).id;
    const steps = syms.map(sym => async (st, api) => {
      const big = h('button', 'gd-sym zy drop', { text: sym });
      const exs = (K.ZY_EX[sym] || []).map(x => h('button', 'gd-ex', null, h('span', 'gd-e', { text: x.e }), zyWord(x.w, sym)));
      st.replaceChildren(big, h('div', 'gd-exs', null, exs));
      exs.forEach(x => x.style.visibility = 'hidden');
      await api.wait(500); await playSym(sym);
      big.onclick = () => playSym(sym);
      await api.tap(big, '點一下，再聽一次'); await playSym(sym);
      for (let j = 0; j < exs.length && api.alive(); j++) {
        const x = exs[j], w = K.ZY_EX[sym][j].w; x.style.visibility = 'visible'; x.classList.add('pop');
        await api.tap(x, '點點看');
        x.classList.add('ok'); await A.speak(w, 'zh-TW', { q: true });
        x.onclick = () => A.speak(w, 'zh-TW', { q: true });
      }
      A.speak(`${syms.length > 1 ? '' : ''}這些詞語裡都有 ${K.BPMF_SAY[sym]} 的聲音。`);
      await api.next();
    });
    // 最後：找一找
    steps.push(async (st, api) => {
      for (const sym of K.shuffle(syms)) {
        if (!api.alive()) return;
        const opts = K.shuffle(K.uniq([sym].concat(K.shuffle(syms.filter(x => x !== sym)), K.shuffle(K.INITIALS.concat(K.FINALS)))).slice(0, 4));
        await api.find('聽一聽，是哪一個注音？', () => playSym(sym), opts, sym, K.skill[sk], 'zy');
      }
    });
    guide(`👀 認識 ${syms.join(' ')}`, 'zh', steps, () => mark(uid, 'see'), () => open('zy'));
  }
  // 拼讀機器：聲母＋韻母（＋介音）滑在一起，變成一個音
  function seeBlend(sk, uid) {
    const items = K.sample(K.skill[sk].data.filter(x => x.z && K.zySplit(x.z).syms.length === (sk === 'zh-pin3' ? 3 : 2)), 4);
    const steps = items.map(it => async (st, api) => {
      const sp = K.zySplit(it.z), parts = sp.syms.map(s => h('b', 'bm-part zy', { text: s }));
      const lever = h('button', 'am-lever', { html: '<i></i>' }), out = h('div', 'bm-out');
      st.replaceChildren(h('div', 'bm', null, h('div', 'bm-in', null, parts), lever), out);
      A.speak('拉一下拉桿，把聲音拼起來！');
      await api.tap(lever, '拉一下拉桿'); lever.classList.add('pull'); A.sfx('pop');
      for (const p of parts) { p.classList.add('on'); await playSym(p.textContent); await api.wait(150); }
      st.querySelector('.bm-in').classList.add('merge');
      const card = K.ui.spellCard(it.z, it.c, it.w); out.replaceChildren(card); await card.play();
      await api.next();
    });
    guide(sk === 'zh-pin3' ? '🎰 三拼機器' : '🎰 拼讀機器', 'zh', steps, () => mark(uid, 'see'), () => open('zy'));
  }
  // 聲調：媽 麻 馬 罵，手勢箭頭
  function seeTones() {
    const sets = [['媽', 'ㄇㄚ', '麻', 'ㄇㄚˊ', '馬', 'ㄇㄚˇ', '罵', 'ㄇㄚˋ'], ['衣', 'ㄧ', '姨', 'ㄧˊ', '椅', 'ㄧˇ', '億', 'ㄧˋ'], ['湯', 'ㄊㄤ', '糖', 'ㄊㄤˊ', '躺', 'ㄊㄤˇ', '燙', 'ㄊㄤˋ']];
    const AR = ['→', '↗', '↘↗', '↘'], NM = ['一聲', '二聲', '三聲', '四聲'];
    const steps = sets.map(s => async (st, api) => {
      const cards = [0, 1, 2, 3].map(i => h('button', 'tn-card', null, h('span', 'tn-ar', { text: AR[i] }), h('span', 'zhc', { text: s[i * 2] }), h('span', 'zy', { text: s[i * 2 + 1] }), h('small', null, { text: NM[i] })));
      st.replaceChildren(h('div', 'gd-ask', { text: '聲音的高低不一樣，意思就不一樣！' }), h('div', 'tn-row nozy', null, cards));
      for (let i = 0; i < 4 && api.alive(); i++) { await api.tap(cards[i], '點點看'); cards[i].classList.add('ok'); await A.speak(s[i * 2], 'zh-TW', { q: true }); cards[i].onclick = () => A.speak(s[i * 2], 'zh-TW', { q: true }); }
      await api.next();
    });
    guide('🎵 聲調高低', 'zh', steps, () => mark('zy12', 'see'), () => open('zy'));
  }

  // ---------- ABC：認識字母 ----------
  const LETTER_WORD = l => { const d = K.skill['en-lsound'].data.find(x => x.zh === l.toLowerCase()); return d || (l === 'X' ? { w: 'box', e: '📦', zh: 'x' } : { w: l, e: '🔤' }); };
  function seeLetters(ls, sk, uid) {
    const steps = ls.map(l => async (st, api) => {
      const wd = LETTER_WORD(l), up = h('button', 'gd-sym enw drop', { text: l }), lo = h('button', 'gd-sym enw lo', { text: l.toLowerCase() });
      const pic = h('button', 'gd-ex en', null, h('span', 'gd-e', { text: wd.e }), h('span', 'enw gd-w', { html: l === 'X' ? 'bo<b>x</b>' : `<b>${wd.w[0]}</b>${wd.w.slice(1)}` }));
      lo.style.visibility = 'hidden'; pic.style.visibility = 'hidden';
      st.replaceChildren(h('div', 'gd-pair', null, up, lo), pic);
      await api.wait(500); await A.speak(l, 'en-US', { q: true });
      up.onclick = () => A.speak(l, 'en-US', { q: true });
      lo.style.visibility = 'visible'; lo.classList.add('pop'); await A.speak(`Big ${l}, little ${l.toLowerCase()}.`, 'en-US', { q: true });
      await api.tap(lo, '點一下聽聽看'); await A.speak(l, 'en-US', { q: true });
      pic.style.visibility = 'visible'; pic.classList.add('pop');
      await api.tap(pic, '點點看'); pic.classList.add('ok');
      await A.speak(l === 'X' ? 'box. X is at the end of box.' : `${l} is for ${wd.w}.`, 'en-US', { q: true });
      pic.onclick = () => A.speak(wd.w, 'en-US', { q: true });
      await api.next();
    });
    steps.push(async (st, api) => {
      for (const l of K.shuffle(ls)) {
        if (!api.alive()) return;
        const lc = Math.random() < .5, opts = K.shuffle(K.uniq([l].concat(K.shuffle(ls.filter(x => x !== l)), K.shuffle([...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']))).slice(0, 4)).map(x => lc ? x.toLowerCase() : x);
        await api.find('Find the letter. 聽一聽，是哪一個字母？', () => A.speak(l, 'en-US', { q: true }), opts, lc ? l.toLowerCase() : l, K.skill[sk], 'enw');
      }
    });
    guide(`👀 ${ls.join(' ')}`, 'en', steps, () => mark(uid, 'see'), () => open('abc'));
  }
  const abcBook = ls => ({ id: 'abc-' + ls.join(''), title: `ABC：${ls.join(' ')}`, cover: '🔤', lang: 'en', ask: null, qs: [], pages: ls.map(l => { const wd = LETTER_WORD(l); return { e: wd.e, t: l === 'X' ? 'X, x, box. A fox in a box.' : `${l}, ${l.toLowerCase()}, ${wd.w}. I like the ${wd.w}.` }; }) });
  // Word Machine：開頭＋韻 → 單字（示範，孩子拉桿、看、跟著唸）
  function seeMachine(v, sk, uid) {
    const words = K.shuffle(K.skill[sk].data.filter(x => /^[a-z]{3}$/.test(x.w) && x.w[1] === v)).slice(0, 4);
    const steps = words.map(it => async (st, api) => {
      const on = h('b', 'bm-part enw', { text: it.w[0] }), ri = h('b', 'bm-part enw', { text: it.w.slice(1) }), lever = h('button', 'am-lever', { html: '<i></i>' }), out = h('div', 'bm-out');
      st.replaceChildren(h('div', 'bm en', null, h('div', 'bm-in', null, on, ri), lever), out);
      A.speak('Pull the lever! 拉一下拉桿。', 'zh-TW');
      await api.tap(lever, '拉一下拉桿'); lever.classList.add('pull'); A.sfx('pop');
      on.classList.add('on'); await api.wait(400); ri.classList.add('on'); await A.speak(it.w.slice(1), 'en-US', { q: true, slow: .8 });
      st.querySelector('.bm-in').classList.add('merge'); await api.wait(300);
      out.innerHTML = `<span class="gd-e">${it.e && it.e[0] !== '#' ? it.e : ''}</span><b class="enw bm-w">${it.w}</b><small>${it.zh}</small>`;
      await A.speak(it.w, 'en-US', { q: true, slow: .8 }); await A.speak(it.w, 'en-US', { q: true });
      out.onclick = () => A.speak(it.w, 'en-US', { q: true });
      await api.next();
    });
    guide(`🎰 Word Machine：short ${v}`, 'en', steps, () => mark(uid, 'see'), () => open('abc'));
  }

  // ---------- 數字：認識 0–20 ----------
  const OBJ = ['🍎', '🐟', '⭐', '🐥', '🍓', '🎈', '🍪', '🌸'];
  function seeNums(a, b, uid) {
    const steps = [];
    for (let n = a; n <= b; n++) steps.push(async (st, api) => {
      const ob = K.pick(OBJ), big = h('button', 'gd-sym num drop', { text: n }), plate = h('div', 'gd-plate'), line = h('div', 'gd-line');
      st.replaceChildren(big, plate, line);
      await api.wait(400); await A.speak(String(n), 'zh-TW', { q: true });
      await api.tap(big, '點一下數字');
      if (n === 0) { plate.append(h('span', 'gd-empty', { text: '🍽️' })); await A.speak('零，盤子上什麼都沒有。'); line.textContent = '0：什麼都沒有'; }
      else for (let k = 1; k <= n && api.alive(); k++) { plate.append(h('span', 'gd-ob' + (k % 10 === 0 ? ' ten' : ''), { text: ob })); A.sfx('tap'); await A.speak(K.cnNum(k), 'zh-TW', { q: true }); }
      if (n) { line.textContent = `${n}：有 ${n} 個 ${ob}`; await A.speak(`${n}，有${n}個。`); }
      big.onclick = () => A.speak(String(n), 'zh-TW', { q: true });
      await api.next();
    });
    steps.push(async (st, api) => {
      for (const n of K.sample([...Array(b - a + 1)].map((_, i) => a + i), Math.min(4, b - a + 1))) {
        if (!api.alive()) return;
        const opts = K.shuffle(K.uniq([n, n + 1, Math.max(0, n - 1), n + 2, Math.max(0, n - 2)]).slice(0, 3)).map(String);
        await api.find(`找一找：哪一個是 ${n}？`, () => A.speak(`哪一個是${n}？`), opts, String(n), K.skill['ma-count20'], 'num');
      }
    });
    guide(`👀 認識 ${a}–${b}`, 'ma', steps, () => mark(uid, 'see'), () => open('num'));
  }
  const MEAS = [['🌞', '個', '太陽'], ['🐦', '隻', '小鳥'], ['🍎', '顆', '蘋果'], ['🐟', '條', '小魚'], ['🌸', '朵', '花'], ['🚗', '輛', '汽車'], ['🎈', '個', '氣球'], ['📚', '本', '書'], ['🐥', '隻', '小雞'], ['⭐', '顆', '星星']];
  const countBook = (a, b) => ({ id: `count-${a}-${b}`, title: `數數書 ${a}–${b}`, cover: '🔢', lang: 'zh', ask: null, qs: [], pages: [...Array(b - a + 1)].map((_, i) => { const n = a + i, m = MEAS[n % MEAS.length]; return n === 0 ? { e: '🍽️', t: '零，盤子空空的，什麼都沒有。' } : { e: m[0].repeat(Math.min(n, 10)), t: `${K.cnNum(n).replace(/^二$/, '兩')}${m[1]}${m[2]}，數一數，一共${K.cnNum(n).replace(/^二$/, '兩')}${m[1]}。` }; }) });
  function seeTen() {
    const steps = [1, 2, 3, 4, 5].map(() => async (st, api) => {
      const x = K.rand(1, 9), cells = [...Array(10)].map((_, i) => h('span', 'tf-c' + (i < x ? ' a' : ''), { text: i < x ? '🔴' : '' }));
      st.replaceChildren(h('div', 'gd-ask', { text: `有 ${x} 個紅點，還要幾個才湊成 10？` }), h('div', 'tf', null, cells), h('div', 'gd-line', { text: '' }));
      A.speak(`有${x}個紅點。點空格，把它們填滿！`);
      for (let i = x; i < 10 && api.alive(); i++) { await api.tap(cells[i], '點空格'); cells[i].textContent = '🔵'; cells[i].classList.add('b'); A.sfx('tap'); A.speak(K.cnNum(i - x + 1), 'zh-TW', { q: true }); }
      st.querySelector('.gd-line').textContent = `${x} 和 ${10 - x} 是好朋友：${x} + ${10 - x} = 10`;
      await A.speak(`${x}和${10 - x}是好朋友，${x}加${10 - x}等於10。`);
      await api.next();
    });
    guide('🔟 10 的好朋友', 'ma', steps, () => mark('num5', 'see'), () => open('num'));
  }
  function seeHundred() {
    const steps = [10, 5, 2].map(by => async (st, api) => {
      const grid = h('div', 'pb-grid sm', null, [...Array(100)].map((_, i) => h('span', 'pb-b', { text: i + 1, style: `--h:${((i + 1) * 37) % 360}` })));
      st.replaceChildren(h('div', 'gd-ask', { text: by === 10 ? '10 個 10 個數，每一排最後一個' : `${by} 個 ${by} 個數` }), grid);
      for (let v = by; v <= (by === 2 ? 20 : 100) && api.alive(); v += by) { grid.children[v - 1].classList.add('popped'); A.sfx('pop'); await A.speak(K.cnNum(v), 'zh-TW', { q: true }); }
      await api.next();
    });
    guide('💯 百數表', 'ma', steps, () => mark('num6', 'see'), () => open('num'));
  }

  // ---------- 步道專用的小遊戲（不出現在首頁的遊戲卡）----------
  // 聽音戳泡泡（注音）／字母泡泡（ABC）：泡泡從下面飄上來，聽到哪個就戳哪個
  const popGame = (zh) => async (root, ctx) => {
    const syms = (ctx.data && ctx.data.syms) || (zh ? [...'ㄅㄆㄇㄈ'] : [...'ABCD']);
    const top = h('div', 'g-top'), sky = h('div', 'pop-sky');
    root.append(top, sky);
    for (let i = 0; i < ctx.total && ctx.alive; i++) {
      const p = ctx.pick(), want = K.pick(syms), t0 = Date.now(); let miss = 0;
      const pool = zh ? K.INITIALS.concat(K.FINALS) : [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
      const lc = !zh && Math.random() < .5;
      const opts = K.shuffle(K.uniq([want].concat(K.shuffle(syms.filter(x => x !== want)), K.shuffle(pool))).slice(0, 5));
      const say = () => zh ? playSym(want) : A.speak(want, 'en-US', { q: true });
      top.replaceChildren(h('div', 'q-box', null, h('div', 'q-ask', { text: zh ? '聽一聽，戳破對的泡泡！' : '聽一聽，戳破對的字母泡泡！' }), h('div', 'q-row', null, h('button', 'q-snd', { text: '🔊', onclick: say }))));
      sky.replaceChildren(...opts.map((s, j) => h('button', 'pop-b ' + (zh ? 'zy' : 'enw'), { text: lc ? s.toLowerCase() : s, 'data-v': s, style: `left:${8 + j * 18 + K.rand(-3, 3)}%;animation-delay:${j * .35}s;--h:${K.rand(0, 360)}` })));
      say();
      await new Promise(res => sky.querySelectorAll('.pop-b').forEach(b => b.onclick = () => {
        if (b.classList.contains('gone')) return;
        if (b.dataset.v === want) { b.classList.add('gone'); A.sfx('pop'); K.fx.burst(b); setTimeout(res, 500); }
        else { miss++; A.sfx('bad'); shake(b); if (miss === 1) say(); }
      }));
      if (!ctx.alive) return;
      await ctx.report(p, miss === 0, Date.now() - t0, { hint: miss > 0, want, q: { ask: '聽音戳泡泡', say: zh ? K.BPMF_SAY[want] : want, lang: zh ? 'zh-TW' : 'en-US', audio: zh ? K.BPMF_FILE[want] : '' } });
    }
    ctx.done();
  };
  K.games.lzy = { id: 'lzy', subj: 'zh', hidden: true, name: '聽音戳泡泡', icon: '🫧', cog: '注音辨識', kinds: [], accept: () => false, n: 6, desc: '聽一聽注音，戳破對的泡泡！', start: popGame(true) };
  K.games.labc = { id: 'labc', subj: 'en', hidden: true, name: '字母泡泡', icon: '🫧', cog: '字母辨識', kinds: [], accept: () => false, n: 6, desc: '聽一聽字母，戳破對的泡泡！', start: popGame(false) };
  // 餵小熊（Starfall 的 Feed the Animals）：小熊說要幾個，點籃子放到盤子上，數好了按「給你」
  K.games.lnum = {
    id: 'lnum', subj: 'ma', hidden: true, name: '餵小熊', icon: '🐻', cog: '數數', kinds: [], accept: () => false, n: 5,
    desc: '小熊肚子餓了！牠要幾個，就放幾個到盤子上。',
    async start(root, ctx) {
      const d = ctx.data || { a: 1, b: 10 }, top = h('div', 'g-top'), work = h('div', 'feed');
      root.append(top, work);
      const FOODS = [['🍪', '塊餅乾'], ['🍎', '顆蘋果'], ['🍓', '顆草莓'], ['🍯', '罐蜂蜜'], ['🐟', '條魚']];
      for (let i = 0; i < ctx.total && ctx.alive; i++) {
        const p = ctx.pick(), n = K.rand(d.a, Math.min(20, d.b)), [f, m] = K.pick(FOODS), t0 = Date.now();
        const plate = h('div', 'fd-plate idle-target', { 'data-tip': '點盤子上的可以拿回來' }), basket = h('button', 'fd-basket idle-target', { 'data-tip': '點籃子拿一個', text: f.repeat(3) }), give = h('button', 'btn pri fd-give', { text: '給你！🐻' }), cnt = h('b', 'fd-cnt', { text: '0' });
        const ask = `小熊說：我要 ${n} ${m}！`;
        top.replaceChildren(K.ui.prompt({ ask, prompt: `<span class="expr">🐻 ${n}</span>`, say: `我要${K.cnNum(n).replace(/^二$/, '兩')}${m}！` }));
        work.replaceChildren(h('div', 'fd-bear', { text: '🐻' }), h('div', 'fd-mid', null, plate, h('div', 'fd-row', null, h('span', null, { text: '盤子上有' }), cnt, h('span', null, { text: m.slice(1) }))), h('div', 'fd-side', null, basket, give));
        A.speak(`我要${K.cnNum(n).replace(/^二$/, '兩')}${m}！`);
        const upd = () => { const k = plate.children.length; cnt.textContent = k; };
        basket.onclick = () => { if (plate.children.length >= 20) return; const it = h('button', 'fd-it', { text: f, onclick: () => { it.remove(); A.sfx('tap'); upd(); } }); plate.append(it); A.sfx('tap'); upd(); A.speak(K.cnNum(plate.children.length), 'zh-TW', { q: true }); };
        let tries = 0;
        const ok = await new Promise(res => give.onclick = () => {
          const k = plate.children.length;
          if (k === n) { A.sfx(tries ? 'star' : 'ok'); work.querySelector('.fd-bear').textContent = '😋'; K.fx.burst(plate); A.speak(`對了，${n}${m.slice(1)}，謝謝你！`); setTimeout(() => res(tries === 0), 1400); return; }
          tries++; A.sfx('bad'); shake(plate);
          K.ui.hint(k < n ? `太少了，盤子上只有 ${k} 個，還要再放 ${n - k} 個。` : `太多了，盤子上有 ${k} 個，要拿回 ${k - n} 個。`, true);
          setTimeout(() => K.ui.hint(null), 2600);
        });
        if (!ctx.alive) return;
        await ctx.report(p, ok, Date.now() - t0, { hint: !ok, want: String(n), q: { ask } });
      }
      ctx.done();
    }
  };
})();
