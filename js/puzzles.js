'use strict';
// 益智島：5 款益智小遊戲（三消、方塊下落、數字合成、方塊拼圖、彩球分類）
// 設計原則（參考 Candy Crush／Tetris 等長青益智遊戲）：
//   1. 一關 1–3 分鐘、目標只有一個且看得見（收集 8 個 🍎、清掉 5 行）
//   2. 每一步都有立即回饋（消除動畫、連鎖音效、進度條）
//   3. 難度曲線：依年級決定起始關卡；連續失敗 3 次提供「簡單一點」，難關之後接幾關較輕鬆的
//   4. 三星評分＋關卡地圖，看得到自己走到哪裡；差一點點時告訴孩子「只差 2 個！」
//   5. 不用「體力」「等待時間」「付費續命」這類操弄手法；仍受每日時間上限管理
//   6. 每款都帶一點學科元素：英文單字發音、算式、面積、注音發音；每過兩關開一次「知識寶箱」
(() => {
  const K = KL, h = K.h, A = K.audio, E = K.engine;
  const R = K.rand, pick = K.pick, shuffle = K.shuffle;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const P = K.puzzles = {};

  // ---------- 共用框架 ----------
  const grade = () => { const L = E.L(); return Math.max(1, Math.min(...Object.values(L.gs))); };
  const st = id => { const L = E.L(); L.pz = L.pz || {}; return L.pz[id] || (L.pz[id] = { lv: P[id].startLv(grade()), best: {}, fails: {} }); };
  const MAXLV = 30;
  let session = null;

  function openMap(id) {
    const g = P[id], s = st(id), L = E.L();
    const maxShow = Math.min(MAXLV, Math.max(s.lv + 4, 12));
    const nodes = Array.from({ length: maxShow }, (_, i) => i + 1).map(n => {
      const open = n <= s.lv, stars = s.best[n] || 0;
      return h('button', 'pz-node' + (open ? '' : ' lock') + (n === s.lv ? ' cur' : '') + (stars ? ' done' : ''), { onclick: () => { if (!open) return A.sfx('bad'); A.sfx('tap'); playLevel(id, n); } },
        h('b', null, { text: open ? n : '🔒' }), h('small', null, { text: stars ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : open ? '' : '' }));
    });
    K.shell.show(h('div', 'screen pz-map', null,
      h('div', 'pz-mhead', null, h('button', 'ib', { text: '🏠', 'aria-label': '回首頁', onclick: () => { A.sfx('tap'); K.shell.showHome(); } }),
        h('div', 'pz-mt', null, h('span', 'pz-mi', { text: g.icon }), h('div', null, null, h('h1', null, { text: g.name }), h('p', null, { text: g.desc })))),
      h('div', 'pz-learn', { text: '📚 ' + g.learn }),
      h('div', 'pz-nodes', null, nodes),
      h('button', 'btn go-big', { text: `▶ 開始第 ${s.lv} 關`, onclick: () => { A.sfx('tap'); playLevel(id, s.lv); } })));
    A.speak(`${g.name}。${g.desc}`);
    if (!s.seen) { s.seen = 1; K.store.save(); }
  }

  function playLevel(id, lv, easy) {
    if (E.overLimit()) { A.speak('今天玩得很棒了，讓眼睛休息一下，明天再來吧！'); K.toast('今天的時間到了，明天再來玩 🌙'); return K.shell.showHome(); }
    const g = P[id], s = st(id), t0 = Date.now();
    const goal = h('div', 'pz-goal'), stat = h('div', 'pz-stat'), stage = h('div', 'pz-stage pz-' + id), ctl = h('div', 'pz-ctl');
    let done = false, timers = [];
    const sess = session = {
      alive: true,
      exit() { if (!sess.alive) return; sess.alive = false; timers.forEach(clearInterval); timers = []; document.removeEventListener('keydown', onKey); const d = E.day(); d.sec += Math.min(600, Math.round((Date.now() - t0) / 1000)); K.store.save(); }
    };
    let keyFn = null; const onKey = e => keyFn && keyFn(e);
    document.addEventListener('keydown', onKey);
    const api = {
      lv, easy: !!easy, grade: grade(), stage, ctl,
      alive: () => sess.alive && !done,
      goal: html => goal.innerHTML = html,
      stat: html => stat.innerHTML = html,
      every: (ms, fn) => { const t = setInterval(() => sess.alive && !done && fn(), ms); timers.push(t); return t; },
      clear: t => clearInterval(t),
      keys: fn => keyFn = fn,
      win: stars => finish(true, stars),
      lose: near => finish(false, 0, near)
    };
    function finish(ok, stars, near) {
      if (done) return; done = true; timers.forEach(clearInterval);
      setTimeout(() => ok ? winBox(stars) : loseBox(near), 500);
    }
    function winBox(stars) {
      A.sfx('win'); stars = Math.max(1, Math.min(3, stars || 1));
      const first = !s.best[lv];
      s.best[lv] = Math.max(s.best[lv] || 0, stars); s.fails[lv] = 0;
      if (lv >= s.lv) s.lv = Math.min(MAXLV, lv + 1);
      let sticker = null;
      if (first && lv % 3 === 0) { const L = E.L(), pool = K.STICKERS.filter(x => !L.stickers.includes(x)); if (pool.length) { sticker = pick(pool); L.stickers.push(sticker); } }
      K.store.save();
      const chest = first && lv % 2 === 0;
      const box = h('div', 'demo pz-res', null, h('div', 'r-stars', { text: '★'.repeat(stars) + '☆'.repeat(3 - stars) }), h('h2', null, { text: stars === 3 ? '太厲害了！' : '過關了！' }),
        sticker && h('p', 'r-good', { text: `🎁 得到新收藏：${sticker}` }),
        h('div', 'row', null, h('button', 'btn', { text: '回地圖', onclick: () => { A.sfx('tap'); K.shell.closeModal(); openMap(id); } }),
          h('button', 'btn pri', { text: chest ? '🎁 打開知識寶箱' : `下一關 ▶`, onclick: () => { A.sfx('tap'); K.shell.closeModal(); chest ? treasure(() => playLevel(id, Math.min(MAXLV, lv + 1))) : playLevel(id, Math.min(MAXLV, lv + 1)); } })));
      K.shell.modal(box);
      A.speak(stars === 3 ? '太厲害了！三顆星！' : '過關了！' + (chest ? '打開知識寶箱看看！' : ''));
    }
    function loseBox(near) {
      A.sfx('bad'); s.fails[lv] = (s.fails[lv] || 0) + 1; K.store.save();
      const tired = s.fails[lv] >= 3 && !easy;
      const box = h('div', 'demo pz-res', null, h('div', 'demo-i', { text: '💪' }), h('h2', null, { text: '差一點點！' }), near && h('p', null, { text: near }),
        h('p', 'sub', { text: tired ? '試了好幾次了，要不要先玩簡單一點的版本？' : '每一次都會更熟練，再試一次！' }),
        h('div', 'row', null, h('button', 'btn', { text: '回地圖', onclick: () => { A.sfx('tap'); K.shell.closeModal(); openMap(id); } }),
          tired && h('button', 'btn', { text: '簡單一點', onclick: () => { A.sfx('tap'); K.shell.closeModal(); playLevel(id, lv, true); } }),
          h('button', 'btn pri', { text: '再試一次 🔄', onclick: () => { A.sfx('tap'); K.shell.closeModal(); playLevel(id, lv, easy); } })));
      K.shell.modal(box);
      A.speak('差一點點！' + (near || '') + '再試一次！');
    }
    K.shell.show(h('div', 'gs pz-gs', null,
      h('div', 'gbar', null, h('button', 'ib', { text: '🗺️', 'aria-label': '回關卡地圖', onclick: () => { A.sfx('tap'); openMap(id); } }),
        h('div', 'pz-lv', null, h('span', null, { text: g.icon }), h('b', null, { text: `第 ${lv} 關` }), easy && h('small', null, { text: '簡單版' })), stat),
      h('div', 'groot pz-root nozy', null, goal, stage, ctl)));
    K.shell.setCur(sess);
    g.start(api);
  }

  // 知識寶箱：從待複習或目前程度的知識點出一題，答對送一張收藏
  function treasure(next) {
    const L = E.L(), due = E.due(), pool = due.length ? due : K.skills.filter(s => E.eligible(s, L) && ['vocab', 'arith', 'char', 'pair', 'letter', 'compare', 'fill'].includes(s.kind));
    let q; try { q = K.mcq(pick(pool), { n: 3 }); } catch (e) { return next(); }
    const work = h('div', 'quiz-work');
    const box = h('div', 'groot pz-chest', null, h('div', 'demo-i', { text: '🎁' }), h('h2', null, { text: '知識寶箱' }), K.ui.prompt(q), work);
    K.shell.modal(box, 'wide');
    const hb = box.querySelector('.q-help'); if (hb) hb.remove(); // 寶箱題不給提示
    K.sayQ(q);
    K.ui.choice(work, q, { single: true }).then(r => {
      let gift = null;
      if (r.ok) { const pool2 = K.STICKERS.filter(x => !L.stickers.includes(x)); if (pool2.length) { gift = pick(pool2); L.stickers.push(gift); K.store.save(); } }
      setTimeout(() => {
        K.shell.modal(h('div', 'demo', null, h('div', 'demo-i', { text: r.ok ? (gift || '🌟') : '📘' }), h('h2', null, { text: r.ok ? '答對了！' : '下次就會了！' }),
          h('p', null, { text: r.ok ? (gift ? `寶箱裡是 ${gift}，放到你的小島上了！` : '你已經收集了所有收藏！') : `答案是「${K.strip(q.opts[q.ans])}」。` }),
          h('button', 'btn pri', { text: '下一關 ▶', onclick: () => { A.sfx('tap'); K.shell.closeModal(); next(); } })));
        A.speak(r.ok ? '答對了！' : '沒關係，下次就會了！');
      }, 700);
    });
  }
  K.pz = { openMap, playLevel, st };

  // ---------- 1. 水果三消（Candy Crush／Bejeweled）：英文單字 ----------
  const FRUIT = [['🍎', 'apple'], ['🍌', 'banana'], ['🍇', 'grape'], ['🍊', 'orange'], ['🍓', 'strawberry'], ['🫐', 'blueberry']];
  P.match = {
    id: 'match', name: '水果三消', icon: '🍓', desc: '交換相鄰的水果，三個一樣就消掉！', learn: '英文：消掉目標水果時會唸出英文單字',
    startLv: g => [1, 2, 4, 6, 8, 10][g - 1],
    start(api) {
      const lv = api.lv, N = lv <= 2 ? 6 : 7, kinds = lv <= 3 ? 4 : lv <= 12 ? 5 : 6;
      const goals = (lv <= 4 ? [[R(0, kinds - 1), 8 + lv * 2]] : [[0, 6 + lv], [1, 6 + lv]].map(([_, n], i) => [(lv + i * 2) % kinds, n]));
      if (goals.length === 2 && goals[0][0] === goals[1][0]) goals[1][0] = (goals[1][0] + 1) % kinds;
      let moves = Math.max(12, 22 - Math.floor(lv / 3)) + (api.easy ? 6 : 0); const total = moves;
      const left = goals.map(g => g[1]);
      let b = [], sel = null, busy = false;
      const rnd = () => R(0, kinds - 1);
      // 開局不能已經有三連
      for (let y = 0; y < N; y++) { b[y] = []; for (let x = 0; x < N; x++) { let v; do v = rnd(); while ((x >= 2 && b[y][x - 1].k === v && b[y][x - 2].k === v) || (y >= 2 && b[y - 1][x].k === v && b[y - 2][x].k === v)); b[y][x] = { k: v, sp: 0 }; } }
      const grid = h('div', 'm3-grid', { style: `--n:${N}` });
      api.stage.append(grid);
      const paintGoal = () => api.goal(`<div class="pz-goals">${goals.map((g, i) => `<span class="${left[i] <= 0 ? 'ok' : ''}"><i>${FRUIT[g[0]][0]}</i><b>${Math.max(0, left[i])}</b><small class="enw">${FRUIT[g[0]][1]}</small></span>`).join('')}</div>`);
      const paintStat = () => api.stat(`<span class="pz-pill">👣 ${moves}</span>`);
      const cells = [];
      const draw = (fresh = []) => {
        grid.replaceChildren();
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
          const c = b[y][x], el = h('button', 'm3-c' + (c ? ' k' + c.k : '') + (c && c.sp ? ' sp' : '') + (sel && sel[0] === x && sel[1] === y ? ' sel' : '') + (fresh.includes(y * N + x) ? ' fall' : ''), { text: c ? FRUIT[c.k][0] : '' });
          el.dataset.x = x; el.dataset.y = y; grid.append(el); cells[y * N + x] = el;
        }
      };
      const runs = () => {
        const hit = new Set(), sp = [];
        for (let y = 0; y < N; y++) for (let x = 0; x < N;) { let e = x; while (e < N && b[y][e] && b[y][x] && b[y][e].k === b[y][x].k) e++; if (e - x >= 3) { for (let i = x; i < e; i++) hit.add(y * N + i); if (e - x >= 4) sp.push([x + 1, y, b[y][x].k]); } x = Math.max(e, x + 1); }
        for (let x = 0; x < N; x++) for (let y = 0; y < N;) { let e = y; while (e < N && b[e][x] && b[y][x] && b[e][x].k === b[y][x].k) e++; if (e - y >= 3) { for (let i = y; i < e; i++) hit.add(i * N + x); if (e - y >= 4) sp.push([x, y + 1, b[y][x].k]); } y = Math.max(e, y + 1); }
        return { hit, sp };
      };
      const anyMove = () => {
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) for (const [dx, dy] of [[1, 0], [0, 1]]) {
          const x2 = x + dx, y2 = y + dy; if (x2 >= N || y2 >= N) continue;
          [b[y][x], b[y2][x2]] = [b[y2][x2], b[y][x]]; const ok = runs().hit.size > 0; [b[y][x], b[y2][x2]] = [b[y2][x2], b[y][x]]; if (ok) return true;
        }
        return false;
      };
      async function resolve(swapAt) {
        let combo = 0;
        for (; ;) {
          const { hit, sp } = runs(); if (!hit.size) break;
          combo++;
          // 條紋水果（4 連產生）被消掉時清掉整排
          for (const i of [...hit]) { const c = b[Math.floor(i / N)][i % N]; if (c && c.sp) for (let x = 0; x < N; x++) hit.add(Math.floor(i / N) * N + x); }
          const said = new Set();
          for (const i of hit) { const c = b[Math.floor(i / N)][i % N]; if (!c) continue; goals.forEach((g, j) => { if (g[0] === c.k) { left[j]--; said.add(c.k); } }); cells[i] && cells[i].classList.add('pop'); }
          A.sfx(combo > 1 ? 'star' : 'pop'); if (said.size) A.speak([...said].map(k => FRUIT[k][1]).join(', '), 'en-US', { q: true });
          if (combo > 1) flash(`連鎖 ×${combo}！`);
          paintGoal(); await wait(260);
          for (const i of hit) b[Math.floor(i / N)][i % N] = null;
          for (const [x, y, k] of sp) { const at = swapAt && runsHas(hit, swapAt) ? swapAt : [x, y]; b[at[1]][at[0]] = { k, sp: 1 }; }
          // 往下掉＋補新的
          const fresh = [];
          for (let x = 0; x < N; x++) { let w = N - 1; for (let y = N - 1; y >= 0; y--) if (b[y][x]) { b[w][x] = b[y][x]; if (w !== y) { b[y][x] = null; fresh.push(w * N + x); } w--; } for (; w >= 0; w--) { b[w][x] = { k: rnd(), sp: 0 }; fresh.push(w * N + x); } }
          draw(fresh); await wait(240); swapAt = null;
        }
        if (!anyMove()) { flash('重新洗牌！'); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) b[y][x].k = rnd(); draw(); if (runs().hit.size) await resolve(); }
      }
      const runsHas = (hit, [x, y]) => hit.has(y * N + x);
      const flash = t => { const f = h('div', 'pz-flash', { text: t }); api.stage.append(f); setTimeout(() => f.remove(), 900); };
      async function trySwap(x, y, x2, y2) {
        if (busy || !api.alive()) return; busy = true; sel = null;
        [b[y][x], b[y2][x2]] = [b[y2][x2], b[y][x]]; draw();
        if (!runs().hit.size) { A.sfx('bad'); await wait(220); [b[y][x], b[y2][x2]] = [b[y2][x2], b[y][x]]; draw(); busy = false; return; }
        moves--; paintStat(); await resolve([x2, y2]);
        busy = false;
        if (left.every(n => n <= 0)) return api.win(moves >= total * .35 ? 3 : moves >= total * .15 ? 2 : 1);
        if (moves <= 0) { const rest = left.reduce((a, n) => a + Math.max(0, n), 0); return api.lose(`只差 ${rest} 個水果！`); }
      }
      // 點選或滑動交換
      let down = null;
      grid.addEventListener('pointerdown', e => { const t = e.target.closest('.m3-c'); if (!t) return; down = [+t.dataset.x, +t.dataset.y, e.clientX, e.clientY]; });
      grid.addEventListener('pointerup', e => {
        if (!down) return; const [x, y, sx, sy] = down; down = null;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.hypot(dx, dy) > 18) { const [ax, ay] = Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]; const x2 = x + ax, y2 = y + ay; if (x2 >= 0 && y2 >= 0 && x2 < N && y2 < N) trySwap(x, y, x2, y2); return; }
        if (sel && Math.abs(sel[0] - x) + Math.abs(sel[1] - y) === 1) return trySwap(sel[0], sel[1], x, y);
        sel = sel && sel[0] === x && sel[1] === y ? null : [x, y]; A.sfx('tap'); draw();
      });
      paintGoal(); paintStat(); draw();
      A.speak(`收集 ${goals.map(g => `${g[1]} 個 ${FRUIT[g[0]][1]}`).join('、')}！`);
    }
  };

  // ---------- 2. 方塊下落（Tetris）：空間旋轉 ----------
  const TET = [[[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [2, 0], [1, 1]], [[0, 0], [0, 1], [1, 1], [2, 1]], [[2, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [2, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]]];
  const TCOL = ['#22d3ee', '#facc15', '#a855f7', '#3b82f6', '#f97316', '#22c55e', '#ef4444'];
  P.tetris = {
    id: 'tetris', name: '方塊下落', icon: '🧱', desc: '轉一轉、移一移，把一整排填滿就會消掉！', learn: '數學：旋轉與空間想像；每消一排看算式加分',
    startLv: g => [1, 2, 3, 5, 6, 7][g - 1],
    start(api) {
      const lv = api.lv, W = 9, H = lv <= 3 ? 14 : 16, need = 2 + Math.ceil(lv / 2) + (api.easy ? -1 : 0);
      const speed = Math.max(170, 900 - lv * 45 - (api.easy ? -200 : 0));
      const bag = lv <= 2 ? [0, 1, 2, 3, 4] : [0, 1, 2, 3, 4, 5, 6];
      const b = Array.from({ length: H }, () => Array(W).fill(-1));
      let cur, lines = 0, score = 0;
      const board = h('div', 'tt-board', { style: `--w:${W};--h:${H}` }); api.stage.append(board);
      const cellsEl = []; for (let i = 0; i < W * H; i++) { const c = h('i'); cellsEl.push(c); board.append(c); }
      const nextBox = h('div', 'tt-next'); let nextT = pick(bag);
      api.goal(''); api.goal(`<div class="pz-goals"><span><i>🧱</i><b id="tt-l">0 / ${need}</b><small>消除排數</small></span></div>`);
      const paintStat = () => api.stat(`<span class="pz-pill">⭐ ${score}</span>`);
      const newPiece = () => { const t = nextT; nextT = pick(bag); nextBox.innerHTML = '下一個 ' + `<span style="color:${TCOL[nextT]}">■</span>`; return { t, c: TET[t].map(p => p.slice()), x: Math.floor(W / 2) - 1, y: 0 }; };
      const fits = (c, x, y) => c.every(([cx, cy]) => { const X = cx + x, Y = cy + y; return X >= 0 && X < W && Y < H && (Y < 0 || b[Y][X] < 0); });
      const ghostY = () => { let y = cur.y; while (fits(cur.c, cur.x, y + 1)) y++; return y; };
      const draw = () => {
        const gy = ghostY();
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const v = b[y][x], el = cellsEl[y * W + x]; el.style.background = v >= 0 ? TCOL[v] : ''; el.className = v >= 0 ? 'on' : ''; }
        cur.c.forEach(([cx, cy]) => { const e = cellsEl[(cy + gy) * W + cx + cur.x]; if (e && cy + gy >= 0 && b[cy + gy][cx + cur.x] < 0) e.className = 'gh'; });
        cur.c.forEach(([cx, cy]) => { const Y = cy + cur.y; if (Y >= 0) { const e = cellsEl[Y * W + cx + cur.x]; e.style.background = TCOL[cur.t]; e.className = 'on'; } });
      };
      const rot = () => { if (cur.t === 1) return; const mx = Math.max(...cur.c.map(p => p[0])); const c = cur.c.map(([x, y]) => [y, mx - x]); for (const k of [0, -1, 1, -2]) if (fits(c, cur.x + k, cur.y)) { cur.c = c; cur.x += k; A.sfx('tap'); return draw(); } };
      const move = dx => { if (fits(cur.c, cur.x + dx, cur.y)) { cur.x += dx; draw(); } };
      const lock = () => {
        if (cur.c.some(([, cy]) => cy + cur.y < 0)) return api.lose(`這局消了 ${lines} 排，只差 ${need - lines} 排！`);
        cur.c.forEach(([cx, cy]) => b[cy + cur.y][cx + cur.x] = cur.t);
        let n = 0; for (let y = H - 1; y >= 0; y--) if (b[y].every(v => v >= 0)) { b.splice(y, 1); b.unshift(Array(W).fill(-1)); n++; y++; }
        if (n) {
          lines += n; const pts = n * 10 * n; score += pts; A.sfx(n > 1 ? 'win' : 'ok');
          flash(n > 1 ? `${n} 排 × ${n * 10} = ${pts} 分！` : `+${pts} 分`);
          const lb = document.getElementById('tt-l'); if (lb) lb.textContent = `${Math.min(lines, need)} / ${need}`;
          paintStat();
          if (lines >= need) { draw(); return api.win(score >= need * 20 ? 3 : score >= need * 12 ? 2 : 1); }
        } else A.sfx('tap');
        cur = newPiece(); if (!fits(cur.c, cur.x, cur.y)) return api.lose(`只差 ${need - lines} 排！`);
        draw();
      };
      const down = () => { if (!api.alive()) return; if (fits(cur.c, cur.x, cur.y + 1)) { cur.y++; draw(); } else lock(); };
      const drop = () => { if (!api.alive()) return; cur.y = ghostY(); draw(); lock(); };
      const flash = t => { const f = h('div', 'pz-flash', { text: t }); api.stage.append(f); setTimeout(() => f.remove(), 1000); };
      const bt = (t, f, cls = '') => { const e = h('button', 'pz-key ' + cls, { text: t }); e.addEventListener('pointerdown', ev => { ev.preventDefault(); api.alive() && f(); }); return e; };
      api.ctl.append(nextBox, h('div', 'pz-keys', null, bt('◀', () => move(-1)), bt('⟳', rot, 'big'), bt('▶', () => move(1)), bt('⬇', down), bt('⤓', drop, 'big')));
      // 觸控：點一下旋轉、左右滑移動、往下滑直接落下
      let s0 = null;
      board.addEventListener('pointerdown', e => s0 = [e.clientX, e.clientY, cur.x]);
      board.addEventListener('pointermove', e => { if (!s0) return; const step = board.clientWidth / W, dx = Math.round((e.clientX - s0[0]) / step); const tx = s0[2] + dx; while (cur.x < tx && fits(cur.c, cur.x + 1, cur.y)) cur.x++; while (cur.x > tx && fits(cur.c, cur.x - 1, cur.y)) cur.x--; draw(); });
      board.addEventListener('pointerup', e => { if (!s0) return; const dx = e.clientX - s0[0], dy = e.clientY - s0[1]; s0 = null; if (dy > 60 && dy > Math.abs(dx)) drop(); else if (Math.hypot(dx, dy) < 12) rot(); });
      api.keys(e => { const k = e.key; if (k === 'ArrowLeft') move(-1); else if (k === 'ArrowRight') move(1); else if (k === 'ArrowUp') rot(); else if (k === 'ArrowDown') down(); else if (k === ' ') drop(); else return; e.preventDefault(); });
      cur = newPiece(); draw(); paintStat();
      api.every(speed, down);
      A.speak(`消掉 ${need} 排就過關！`);
    }
  };

  // ---------- 3. 數字合成（2048）：加法與倍數 ----------
  P.merge = {
    id: 'merge', name: '數字合成', icon: '🔢', desc: '往同一個方向滑，一樣的數字會合在一起！', learn: '數學：每次合成都會出現算式（8＋8＝16、8×2＝16）',
    startLv: g => [1, 2, 3, 4, 5, 5][g - 1],
    start(api) {
      const lv = Math.min(api.lv, 9), N = 4, target = 2 ** (Math.min(12, lv + 3 + (api.easy ? -1 : 0)));
      let b = Array.from({ length: N }, () => Array(N).fill(0)), moves = 0, undo = null, undoLeft = api.easy ? 3 : 1, best = 2, saidMax = 0;
      const grid = h('div', 'mg-grid', { style: `--n:${N}` }); api.stage.append(grid);
      const eq = h('div', 'mg-eq'); api.stage.append(eq);
      api.goal(`<div class="pz-goals"><span><i>🎯</i><b>${target}</b><small>合成出這個數字</small></span></div>`);
      const paintStat = () => api.stat(`<span class="pz-pill">👣 ${moves}</span>`);
      const add = () => { const e = []; b.forEach((r, y) => r.forEach((v, x) => !v && e.push([x, y]))); if (!e.length) return null; const [x, y] = pick(e); b[y][x] = Math.random() < .88 ? 2 : 4; return y * N + x; };
      const draw = (born, merged = []) => { grid.replaceChildren(...b.flat().map((v, i) => h('div', 'mg-c v' + Math.min(v, 4096) + (i === born ? ' born' : '') + (merged.includes(i) ? ' mrg' : ''), { text: v || '' }))); };
      const slide = dir => { // 0 左 1 右 2 上 3 下
        const old = JSON.stringify(b), merges = [], mergedAt = [];
        for (let i = 0; i < N; i++) {
          let line = Array.from({ length: N }, (_, j) => dir < 2 ? b[i][dir ? N - 1 - j : j] : b[dir === 2 ? j : N - 1 - j][i]).filter(Boolean);
          const out = [];
          for (let j = 0; j < line.length; j++) { if (line[j] === line[j + 1]) { out.push(line[j] * 2); merges.push(line[j]); j++; } else out.push(line[j]); }
          while (out.length < N) out.push(0);
          out.forEach((v, j) => { const [x, y] = dir < 2 ? [dir ? N - 1 - j : j, i] : [i, dir === 2 ? j : N - 1 - j]; b[y][x] = v; });
        }
        if (JSON.stringify(b) === old) return A.sfx('tap');
        undo = old; moves++; paintStat();
        if (merges.length) {
          const m = Math.max(...merges); best = Math.max(best, m * 2);
          eq.innerHTML = `<b>${m} + ${m} = ${m * 2}</b>` + (api.grade >= 3 ? `<small>${m} × 2 = ${m * 2}</small>` : '');
          eq.classList.remove('go'); void eq.offsetWidth; eq.classList.add('go');
          A.sfx(m * 2 >= 64 ? 'star' : 'pop');
          if (m * 2 > saidMax && m * 2 >= 8) { saidMax = m * 2; A.speak(`${m}加${m}等於${m * 2}`, 'zh-TW', { q: true }); }
        } else A.sfx('tap');
        const born = add(); draw(born);
        if (best >= target) { const par = target / 2; return api.win(moves <= par * 1.4 ? 3 : moves <= par * 2 ? 2 : 1); }
        if (!canMove()) api.lose(`最大合成到 ${best}，目標 ${target}！`);
      };
      const canMove = () => b.some((r, y) => r.some((v, x) => !v || (x < N - 1 && r[x + 1] === v) || (y < N - 1 && b[y + 1][x] === v)));
      let s0 = null;
      grid.addEventListener('pointerdown', e => { s0 = [e.clientX, e.clientY]; grid.setPointerCapture && grid.setPointerCapture(e.pointerId); });
      grid.addEventListener('pointerup', e => { if (!s0 || !api.alive()) return; const dx = e.clientX - s0[0], dy = e.clientY - s0[1]; s0 = null; if (Math.hypot(dx, dy) < 24) return; slide(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 0 : 1) : (dy < 0 ? 2 : 3)); });
      api.keys(e => { const m = { ArrowLeft: 0, ArrowRight: 1, ArrowUp: 2, ArrowDown: 3 }[e.key]; if (m == null) return; e.preventDefault(); api.alive() && slide(m); });
      const ub = h('button', 'pz-key', { html: `↶ <small>×${undoLeft}</small>`, title: '悔一步', onclick: () => { if (!undo || !undoLeft || !api.alive()) return A.sfx('bad'); b = JSON.parse(undo); undo = null; undoLeft--; ub.innerHTML = `↶ <small>×${undoLeft}</small>`; A.sfx('tap'); draw(); } });
      const arrows = h('div', 'pz-keys', null, ['◀', '▲', '▼', '▶'].map((t, i) => h('button', 'pz-key', { text: t, onclick: () => api.alive() && slide([0, 2, 3, 1][i]) })), ub);
      api.ctl.append(arrows);
      add(); add(); draw(); paintStat();
      A.speak(`滑一滑，合成出 ${target}！`);
    }
  };

  // ---------- 4. 方塊拼圖（Katamino／GiiKER）：面積與空間 ----------
  const PZL = [[3, 2, 2], [3, 4, 3], [4, 3, 3], [4, 4, 4], [5, 4, 4], [6, 3, 3], [4, 6, 4], [5, 5, 5], [6, 4, 4], [6, 5, 5], [5, 6, 5], [6, 6, 4], [7, 5, 5], [8, 5, 5], [6, 6, 6], [8, 6, 4], [7, 6, 6], [10, 5, 5], [8, 8, 4], [9, 6, 6]];
  const PCOL = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#06b6d4', '#e11d48', '#0ea5e9', '#d946ef', '#65a30d', '#ea580c'];
  // 把 W×H 的板子隨機切成每塊 k 格的拼塊（保證有解）
  function partition(W, H, k) {
    for (let tries = 0; tries < 400; tries++) {
      const own = Array.from({ length: H }, () => Array(W).fill(-1)), pieces = []; let ok = true;
      for (let y = 0; y < H && ok; y++) for (let x = 0; x < W && ok; x++) {
        if (own[y][x] >= 0) continue;
        const id = pieces.length, cells = [[x, y]]; own[y][x] = id;
        while (cells.length < k) {
          const fr = []; for (const [cx, cy] of cells) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = cx + dx, Y = cy + dy; if (X >= 0 && Y >= 0 && X < W && Y < H && own[Y][X] < 0) fr.push([X, Y]); }
          if (!fr.length) { ok = false; break; }
          // 偏好往右下長，減少把空格困死
          const c = fr.sort((a, b) => (a[1] * W + a[0]) - (b[1] * W + b[0]))[Math.random() < .35 ? 0 : R(0, fr.length - 1)];
          own[c[1]][c[0]] = id; cells.push(c);
        }
        pieces.push(cells);
      }
      if (ok) return pieces;
    }
    return null;
  }
  const norm = c => { const mx = Math.min(...c.map(p => p[0])), my = Math.min(...c.map(p => p[1])); return c.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]); };
  P.blocks = {
    id: 'blocks', name: '方塊拼圖', icon: '🧩', desc: '把所有拼塊放進板子裡，剛好填滿！', learn: '數學：面積（每塊幾格 × 幾塊 = 板子幾格）、旋轉與翻面',
    startLv: g => [1, 2, 4, 6, 8, 10][g - 1],
    start(api) {
      const [W, H, k] = PZL[Math.min(PZL.length - 1, api.lv - 1 - (api.easy ? 1 : 0) < 0 ? 0 : api.lv - 1 - (api.easy ? 1 : 0))];
      // 產生多組切法，挑形狀最多樣的一組（避免全是方塊或直條）
      const key = c => { let best = null, sh = norm(c); for (let f = 0; f < 2; f++) { for (let r = 0; r < 4; r++) { sh = norm(sh.map(([x, y]) => [y, -x])); const t = JSON.stringify(sh); if (!best || t < best) best = t; } sh = norm(sh.map(([x, y]) => [-x, y])); } return best; };
      let sol = null, bestScore = -1;
      for (let i = 0; i < 40; i++) { const c = partition(W, H, k); if (!c) continue; const sc = new Set(c.map(key)).size; if (sc > bestScore) { bestScore = sc; sol = c; } }
      const pcs = sol.map((c, i) => { let s = norm(c); for (let r = R(0, 3); r > 0; r--) s = norm(s.map(([x, y]) => [y, -x])); return { i, sol: c, shape: s, at: null }; });
      const occ = Array.from({ length: H }, () => Array(W).fill(-1));
      let sel = null, hints = 0;
      api.goal(`<div class="pz-goals"><span><i>📐</i><b>${W}×${H} = ${W * H} 格</b><small>${pcs.length} 塊，每塊 ${k} 格</small></span></div>`);
      const board = h('div', 'bk-board', { style: `--w:${W};--h:${H}` }), tray = h('div', 'bk-tray');
      api.stage.append(board, tray);
      const fits = (s, x, y, self) => s.every(([dx, dy]) => { const X = x + dx, Y = y + dy; return X >= 0 && Y >= 0 && X < W && Y < H && (occ[Y][X] < 0 || occ[Y][X] === self); });
      const lift = p => { if (!p.at) return; p.shape.forEach(([dx, dy]) => occ[p.at[1] + dy][p.at[0] + dx] = -1); p.at = null; };
      const place = (p, x, y) => { if (!fits(p.shape, x, y, p.i)) return false; lift(p); p.shape.forEach(([dx, dy]) => occ[y + dy][x + dx] = p.i); p.at = [x, y]; return true; };
      const draw = () => {
        board.replaceChildren(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const v = occ[y][x]; board.append(h('div', 'bk-c' + (v >= 0 ? ' on' : ''), { style: v >= 0 ? `background:${PCOL[v % PCOL.length]}` : '', 'data-x': x, 'data-y': y })); }
        tray.replaceChildren(...pcs.filter(p => !p.at).map(p => {
          const mw = Math.max(...p.shape.map(c => c[0])) + 1, mh = Math.max(...p.shape.map(c => c[1])) + 1;
          const el = h('div', 'bk-p' + (sel === p ? ' sel' : ''), { style: `--w:${mw};--h:${mh}` });
          for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) { const on = p.shape.some(c => c[0] === x && c[1] === y); el.append(h('i', on ? 'on' : '', { style: on ? `background:${PCOL[p.i % PCOL.length]}` : '', 'data-x': x, 'data-y': y })); }
          el._p = p; return el;
        }));
      };
      const check = () => { if (pcs.every(p => p.at)) { A.sfx('win'); api.win(hints === 0 ? 3 : hints === 1 ? 2 : 1); } };
      const turn = (p, flip) => { p.shape = norm(flip ? p.shape.map(([x, y]) => [-x, y]) : p.shape.map(([x, y]) => [y, -x])); A.sfx('tap'); draw(); };
      // 拖曳：抓住拼塊的某一格，放開時那一格對齊手指下的格子
      let drag = null;
      tray.addEventListener('pointerdown', e => {
        const el = e.target.closest('.bk-p'); if (!el) return; const p = el._p, cell = e.target.closest('i');
        const gx = cell ? +cell.dataset.x : p.shape[0][0], gy = cell ? +cell.dataset.y : p.shape[0][1];
        const g = p.shape.some(c => c[0] === gx && c[1] === gy) ? [gx, gy] : p.shape[0];
        drag = { p, g, sx: e.clientX, sy: e.clientY, ghost: null };
      });
      document.addEventListener('pointermove', mv);
      function mv(e) {
        if (!drag) return; if (!drag.ghost && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 10) return;
        if (!drag.ghost) { const cs = board.firstChild.getBoundingClientRect().width; const p = drag.p, mw = Math.max(...p.shape.map(c => c[0])) + 1, mh = Math.max(...p.shape.map(c => c[1])) + 1; drag.ghost = h('div', 'bk-p bk-ghost', { style: `--w:${mw};--h:${mh};--cs:${cs}px` }); for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) { const on = p.shape.some(c => c[0] === x && c[1] === y); drag.ghost.append(h('i', on ? 'on' : '', { style: on ? `background:${PCOL[p.i % PCOL.length]}` : '' })); } drag.cs = cs; document.body.append(drag.ghost); }
        drag.ghost.style.left = e.clientX - (drag.g[0] + .5) * drag.cs + 'px'; drag.ghost.style.top = e.clientY - (drag.g[1] + .5) * drag.cs + 'px';
      }
      const up = e => {
        if (!drag) return; const d = drag; drag = null;
        if (d.ghost) {
          d.ghost.remove(); const under = document.elementFromPoint(e.clientX, e.clientY), c = under && under.closest('.bk-c');
          if (c && place(d.p, +c.dataset.x - d.g[0], +c.dataset.y - d.g[1])) { A.sfx('ok'); sel = null; draw(); check(); } else { A.sfx('bad'); draw(); }
          return;
        }
        // 沒拖動＝點一下：選取；選取中的再點一下＝旋轉
        if (sel === d.p) turn(d.p); else { sel = d.p; A.sfx('tap'); draw(); }
      };
      document.addEventListener('pointerup', up);
      const cleanup = () => { document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up); };
      const obs = new MutationObserver(() => { if (!board.isConnected) { cleanup(); obs.disconnect(); } }); obs.observe(document.body, { childList: true, subtree: true });
      // 點板子：放下選取的拼塊（以第一格對齊）；點已放好的拼塊：拿回來
      board.addEventListener('click', e => {
        const c = e.target.closest('.bk-c'); if (!c || !api.alive()) return; const x = +c.dataset.x, y = +c.dataset.y, v = occ[y][x];
        if (v >= 0 && !sel) { lift(pcs[v]); A.sfx('tap'); return draw(); }
        if (sel) { if (place(sel, x - sel.shape[0][0], y - sel.shape[0][1])) { A.sfx('ok'); sel = null; draw(); check(); } else A.sfx('bad'); }
      });
      api.ctl.append(h('div', 'pz-keys', null,
        h('button', 'pz-key', { text: '⟳ 旋轉', onclick: () => sel ? turn(sel) : K.toast('先點一個拼塊') }),
        h('button', 'pz-key', { text: '⇋ 翻面', onclick: () => sel ? turn(sel, true) : K.toast('先點一個拼塊') }),
        h('button', 'pz-key', { text: '💡 提示', onclick: () => { // 把一塊放到正確位置（扣一顆星）
          const p = pcs.find(q => !q.at) || null; if (!p || !api.alive()) return;
          pcs.forEach(q => { if (q.at && q.sol.some(([x, y]) => occ[y][x] === q.i && !q.sol.some(s => s[0] === x && s[1] === y))) lift(q); });
          p.sol.forEach(([x, y]) => { const o = occ[y][x]; if (o >= 0 && o !== p.i) lift(pcs[o]); });
          lift(p); p.shape = norm(p.sol); const mx = Math.min(...p.sol.map(c => c[0])), my = Math.min(...p.sol.map(c => c[1])); place(p, mx, my); hints++; A.sfx('star'); sel = null; draw(); check();
        } })));
      draw();
      A.speak(`把 ${pcs.length} 塊拼塊放進板子裡！拖過去，或點一下再點板子。`);
    }
  };

  // ---------- 5. 彩球分類（Ball Sort）：注音／英文 ----------
  const BCOL = [['#ef4444', 'red'], ['#3b82f6', 'blue'], ['#22c55e', 'green'], ['#facc15', 'yellow'], ['#a855f7', 'purple'], ['#f97316', 'orange'], ['#ec4899', 'pink'], ['#14b8a6', 'teal'], ['#78350f', 'brown']];
  const BZY = ['ㄅ', 'ㄇ', 'ㄉ', 'ㄍ', 'ㄚ', 'ㄧ', 'ㄨ', 'ㄠ', 'ㄢ'];
  P.sort = {
    id: 'sort', name: '彩球分類', icon: '🧪', desc: '把同一種顏色的球都放進同一支管子！', learn: '低年級：球上有注音，排好一管就唸出聲音；中高年級：英文顏色單字',
    startLv: g => [1, 2, 4, 6, 8, 9][g - 1],
    start(api) {
      const lv = api.lv - (api.easy ? 2 : 0), n = Math.min(9, 2 + Math.ceil(Math.max(1, lv) / 2)), cap = lv <= 2 ? 3 : 4, empty = 2;
      const zy = api.grade <= 2, cols = shuffle(BCOL.map((c, i) => [...c, BZY[i]])).slice(0, n);
      // 隨機發球，再用深度優先搜尋確認有解（和市面上的排序遊戲一樣，比倒推法更有挑戰）
      const solved = s2 => s2.every(tb => !tb.length || (tb.length === cap && tb.every(v => v === tb[0])));
      const solvable = (t0, limit = 40000) => {
        const seen = new Set(); let nodes = 0;
        const dfs = s2 => {
          if (solved(s2)) return true; if (++nodes > limit) return false;
          const k = s2.map(x => x.join(',')).sort().join('|'); if (seen.has(k)) return false; seen.add(k);
          const mv = [];
          for (let a = 0; a < s2.length; a++) {
            if (!s2[a].length) continue; const x = s2[a][s2[a].length - 1]; if (s2[a].length === cap && s2[a].every(v => v === x)) continue;
            for (let c = 0; c < s2.length; c++) { if (a === c || s2[c].length >= cap || (s2[c].length && s2[c][s2[c].length - 1] !== x) || (!s2[c].length && s2[a].every(v => v === x))) continue; mv.push([a, c, s2[c].length ? 0 : 1]); }
          }
          mv.sort((p2, q2) => p2[2] - q2[2]);
          for (const [a, c] of mv) { const n2 = s2.map(y => y.slice()); n2[c].push(n2[a].pop()); if (dfs(n2)) return true; }
          return false;
        };
        return dfs(t0.map(x => x.slice()));
      };
      let t;
      for (let tries = 0; tries < 30; tries++) {
        const balls = shuffle([].concat(...cols.map((_, i) => Array(cap).fill(i))));
        t = cols.map((_, i) => balls.slice(i * cap, i * cap + cap)).concat(Array.from({ length: empty }, () => []));
        if (!solved(t) && solvable(t)) break;
      }
      let pickT = null, moves = 0; const hist = []; let undoLeft = 3; const balls = n * cap;
      const done = new Set();
      api.goal(`<div class="pz-goals"><span><i>🧪</i><b>${n} 種顏色</b><small>每管 ${cap} 顆</small></span></div>`);
      const paintStat = () => api.stat(`<span class="pz-pill">👣 ${moves}</span>`);
      const wrap = h('div', 'bs-wrap'); api.stage.append(wrap);
      const draw = () => wrap.replaceChildren(...t.map((tb, i) => h('button', 'bs-tube' + (pickT === i ? ' up' : '') + (done.has(i) ? ' full' : ''), { style: `--cap:${cap}`, onclick: () => tap(i) },
        tb.map((v, j) => h('span', 'bs-ball' + (pickT === i && j === tb.length - 1 ? ' lift' : ''), { style: `background:${cols[v][0]}`, text: zy ? cols[v][2] : cols[v][1][0].toUpperCase() })))));
      const tap = i => {
        if (!api.alive()) return;
        if (pickT == null) { if (!t[i].length) return A.sfx('bad'); pickT = i; A.sfx('tap'); return draw(); }
        if (pickT === i) { pickT = null; return draw(); }
        const a = t[pickT], c = t[i], x = a[a.length - 1];
        if (c.length >= cap || (c.length && c[c.length - 1] !== x)) { A.sfx('bad'); pickT = null; return draw(); }
        hist.push(JSON.stringify(t)); c.push(a.pop()); pickT = null; moves++; paintStat(); A.sfx('pop');
        if (c.length === cap && c.every(v => v === x) && !done.has(i)) { done.add(i); A.sfx('star'); zy ? A.playFile(K.BPMF_FILE[cols[x][2]]) : A.speak(cols[x][1], 'en-US', { q: true }); }
        draw();
        if (t.every(tb => !tb.length || (tb.length === cap && tb.every(v => v === tb[0])))) api.win(moves <= balls ? 3 : moves <= balls * 1.6 ? 2 : 1);
      };
      const ub = h('button', 'pz-key', { html: `↶ 退一步 <small>×${undoLeft}</small>`, onclick: () => { if (!hist.length || !undoLeft || !api.alive()) return A.sfx('bad'); t = JSON.parse(hist.pop()); undoLeft--; moves++; done.clear(); t.forEach((tb, i) => { if (tb.length === cap && tb.every(v => v === tb[0])) done.add(i); }); ub.innerHTML = `↶ 退一步 <small>×${undoLeft}</small>`; paintStat(); draw(); } });
      api.ctl.append(h('div', 'pz-keys', null, ub, h('button', 'pz-key', { text: '🔄 重來', onclick: () => api.alive() && playLevel('sort', api.lv, api.easy) })));
      t.forEach((tb, i) => { if (tb.length === cap && tb.every(v => v === tb[0])) done.add(i); });
      draw(); paintStat();
      A.speak('點一支管子拿起最上面的球，再點另一支管子放進去！');
    }
  };
})();
