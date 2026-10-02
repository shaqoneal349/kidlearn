'use strict';
// 數學內容包：題目多由模板 + 參數即時生成
(() => {
  const K = KL, R = K.rand, P = K.pick;
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const frH = K.frH = (n, d) => d === 1 ? String(n) : `<span class="fr"><i>${n}</i><i>${d}</i></span>`;
  const fr = (n, d) => { const g = gcd(n, d); return frH(n / g, d / g); };
  const numD = K.numD = a => {
    if (typeof a !== 'number') return [];
    const dec = (String(a).split('.')[1] || '').length, st = Math.pow(10, -dec);
    const c = a < 20 && !dec ? [a + 1, a - 1, a + 2, a - 2, a + 3, a - 3] // 小數字用鄰近的數當干擾項
      : [a + st, a - st, a + 2 * st, a - 2 * st, a + 10 * st, a - 10 * st, a + 3 * st, a + 5 * st];
    return c.filter(x => x >= 0).map(x => +x.toFixed(dec));
  };
  const fix = (x, d = 2) => +x.toFixed(d);
  const A = (g, sub, id, name, gen, x) => K.add('ma', g, sub, id, name, 'arith', null, Object.assign({ gen }, x));

  // ---------- G1 ----------
  K.add('ma', 1, 1, 'ma-count20', '數數 1–20', 'count', { max: 20 }, { demo: '一個一個點著數，數到最後一個就是答案。滿十個可以先圈起來。', tip: '數樓梯、數水果、數積木，什麼都可以數。' });
  K.add('ma', 1, 1, 'ma-compare20', '20 以內比大小', 'compare', { max: 20 }, { prereq: ['ma-count20'], demo: '數字越後面越大。先看十位，再看個位。', tip: '玩撲克牌比大小。' });
  A(1, 1, 'ma-make10', '10 的合成分解', () => { const a = R(1, 9); return { text: `${a} + □ = 10`, ans: 10 - a }; }, { prereq: ['ma-count20'], demo: '10 的好朋友：1 和 9、2 和 8、3 和 7、4 和 6、5 和 5。', tip: '用十根手指玩：我出 3，你要出幾才湊成 10？' });
  A(1, 1, 'ma-add10', '10 以內加法', () => { const a = R(1, 9), b = R(1, 10 - a); return { text: `${a} + ${b}`, ans: a + b }; }, { prereq: ['ma-count20'], demo: '加法就是合起來。從大的數字開始往上數。', tip: '用點心練習：3 顆加 2 顆是幾顆？' });
  A(1, 1, 'ma-sub10', '10 以內減法', () => { const a = R(2, 10), b = R(1, a); return { text: `${a} − ${b}`, ans: a - b }; }, { prereq: ['ma-add10'], demo: '減法就是拿走。5 個拿走 2 個，剩下 3 個。' });
  K.add('ma', 1, 1, 'ma-shape', '平面形狀', 'shape', 'flat', { demo: '三角形有三個邊，正方形四個邊一樣長，圓形圓滾滾沒有角。', tip: '在家裡找形狀：時鐘是圓形，書本是長方形。' });
  K.add('ma', 1, 1, 'ma-pattern', '圖形規律', 'pattern', null, { demo: '看看哪幾個圖案一直重複出現，接下來就會再重複一次。', tip: '用積木或珠子排「紅藍紅藍」讓孩子接下去。' });
  A(1, 2, 'ma-add20', '進位加法', () => { const a = R(2, 9), b = R(11 - a, 9); return { text: `${a} + ${b}`, ans: a + b }; }, { prereq: ['ma-make10', 'ma-add10'], demo: '先湊成 10：8 + 5，把 5 分成 2 和 3，8 加 2 是 10，再加 3 是 13。', tip: '用十格板（蛋盒）和小東西練習「湊十」。' });
  A(1, 2, 'ma-sub20', '退位減法', () => { const ans = R(2, 9), b = R(11 - ans, 9); return { text: `${ans + b} − ${b}`, ans }; }, { prereq: ['ma-sub10', 'ma-make10'], demo: '13 − 5：先減 3 變成 10，再減 2，答案是 8。' });
  K.add('ma', 1, 2, 'ma-compare100', '100 以內比大小', 'compare', { max: 100 }, { prereq: ['ma-compare20'], demo: '先比十位數，十位一樣再比個位數。' });
  K.add('ma', 1, 2, 'ma-coin', '認識錢幣', 'shop', 'pay', { demo: '1 元、5 元、10 元。先拿大的錢幣，再用小的補。', tip: '這週一起用零錢買東西，讓孩子數錢。' });
  A(1, 3, 'ma-mix3', '連加連減', () => { const a = R(3, 9), b = R(1, 9), c = R(1, a + b - 1); return { text: `${a} + ${b} − ${c}`, ans: a + b - c }; }, { prereq: ['ma-add20', 'ma-sub20'], demo: '從左邊開始，一步一步算。' });
  K.add('ma', 1, 3, 'ma-numline20', '數線 0–20', 'numline', { max: 20, step: 1, every: 5 }, { prereq: ['ma-compare20'], demo: '數線上越往右邊數字越大。從 0 開始一格一格數。' });

  // ---------- G2 ----------
  A(2, 1, 'ma-add2d', '二位數加法', () => { const a = R(11, 69), b = R(11, 29); return { text: `${a} + ${b}`, ans: a + b }; }, { prereq: ['ma-add20'], demo: '個位加個位，十位加十位。個位滿十要進一。' });
  A(2, 1, 'ma-sub2d', '二位數減法', () => { const a = R(30, 99), b = R(11, a - 5); return { text: `${a} − ${b}`, ans: a - b }; }, { prereq: ['ma-sub20'], demo: '個位不夠減，要向十位借 1 當 10。' });
  K.add('ma', 2, 1, 'ma-compare1000', '1000 以內比大小', 'compare', { max: 1000 }, { demo: '先比百位，再比十位，最後比個位。' });
  K.add('ma', 2, 1, 'ma-numline100', '數線 0–100', 'numline', { max: 100, step: 5, every: 4 });
  A(2, 2, 'ma-times-easy', '2、5、10 的乘法', () => { const a = P([2, 5, 10]), b = R(1, 9); return { text: `${a} × ${b}`, ans: a * b }; }, { demo: '乘法是同樣的數一直加：5 × 3 就是 5 + 5 + 5。', tip: '兩個兩個數、五個五個數襪子或錢幣。' });
  K.add('ma', 2, 2, 'ma-change', '買東西找零', 'shop', 'change', { prereq: ['ma-sub2d'], demo: '找零 = 付的錢 − 東西的價錢。', tip: '買東西時讓孩子先算要找回多少錢。' });
  K.add('ma', 2, 2, 'ma-seq', '數列規律', 'seq', { lv: 1 }, { demo: '看看每次多了多少（或少了多少），下一個也要多一樣多。' });
  K.add('ma', 2, 2, 'ma-solid', '立體形狀', 'shape', 'solid', { demo: '球體會滾，正方體六個面都一樣，圓柱體上下是圓形。' });
  A(2, 3, 'ma-times', '九九乘法', () => { const a = R(2, 9), b = R(2, 9); return { text: `${a} × ${b}`, ans: a * b }; }, { prereq: ['ma-times-easy'], demo: '九九乘法要多唸幾次。忘記時可以用加的：7 × 3 = 7 + 7 + 7。', tip: '每天背一個乘法表，洗澡、坐車時抽考。' });
  A(2, 3, 'ma-share', '平分', () => { const b = R(2, 5), q = R(2, 6); return { text: `${b * q} 顆糖平分給 ${b} 人，每人幾顆？`, ans: q }; }, { prereq: ['ma-times-easy'], demo: '平分就是每個人拿到一樣多。一人一顆輪流發，發完為止。' });

  // ---------- G3 ----------
  A(3, 1, 'ma-mul2d1d', '二位數乘一位數', () => { const a = R(11, 49), b = R(2, 9); return { text: `${a} × ${b}`, ans: a * b }; }, { prereq: ['ma-times'], demo: '把二位數拆開：23 × 4 = 20 × 4 + 3 × 4。' });
  A(3, 1, 'ma-div', '除法', () => { const b = R(2, 9), q = R(2, 9); return { text: `${b * q} ÷ ${b}`, ans: q }; }, { prereq: ['ma-times'], demo: '除法是乘法倒過來想：24 ÷ 6，想 6 乘多少是 24。' });
  K.add('ma', 3, 1, 'ma-area', '面積（數格子）', 'area', { mode: 'area' }, { demo: '面積就是佔了幾個格子。一格一格數。' });
  K.add('ma', 3, 1, 'ma-sudoku4', '4×4 數獨', 'sudoku', { n: 4 }, { demo: '每一橫排、每一直排、每個小方框裡，1 到 4 都只能出現一次。' });
  A(3, 2, 'ma-divrem', '有餘數的除法', () => {
    const b = R(2, 9), q = R(2, 9), r = R(1, b - 1), f = (x, y) => `${x}…${y}`;
    return { text: `${b * q + r} ÷ ${b}`, ans: f(q, r), opts: [f(q, r + 1), f(q + 1, r), f(q - 1, r), f(q, Math.max(0, r - 1))] };
  }, { prereq: ['ma-div'], demo: '分不完剩下的就是餘數，餘數一定比除數小。' });
  K.add('ma', 3, 2, 'ma-perim', '周長', 'area', { mode: 'perim' }, { demo: '周長是繞圖形一圈的長度。長方形周長 =（長 + 寬）× 2。' });
  A(3, 2, 'ma-frac-unit', '單位分數比大小', () => {
    const ds = K.sample([2, 3, 4, 5, 6, 8, 10], 4), big = Math.random() < .5, t = big ? Math.min(...ds) : Math.max(...ds);
    return { text: big ? '哪一個分數最大？' : '哪一個分數最小？', ans: frH(1, t), opts: ds.filter(d => d !== t).map(d => frH(1, d)) };
  }, { demo: '一個披薩分越多份，每一份就越小。所以分母越大，分數越小。', tip: '切蛋糕、分披薩時說「這是四分之一」。' });
  K.add('ma', 3, 2, 'ma-shop-multi', '買很多個', 'shop', 'multi', { prereq: ['ma-mul2d1d'], demo: '同樣的東西買好幾個，用乘法算最快，再把全部加起來。' });
  K.add('ma', 3, 2, 'ma-balance', '天平等式', 'balance', { lv: 1 }, { demo: '等號兩邊要一樣重。先算出一邊是多少，另一邊也要一樣多。' });
  A(3, 3, 'ma-dec1', '一位小數加減', () => { const a = R(1, 9), b = R(1, 9), plus = Math.random() < .5 || a === b, x = Math.max(a, b), y = Math.min(a, b); return plus ? { text: `${a / 10} + ${b / 10}`, ans: fix((a + b) / 10, 1) } : { text: `${x / 10} − ${y / 10}`, ans: fix((x - y) / 10, 1) }; }, { demo: '小數點要對齊，像整數一樣加減。0.3 + 0.5 就是 3 個 0.1 加 5 個 0.1。' });
  K.add('ma', 3, 3, 'ma-numline-dec', '數線上的小數', 'numline', { max: 1, step: .1, every: 5, dec: 1 }, { demo: '0 到 1 平分成 10 格，每一格是 0.1。' });

  // ---------- G4 ----------
  A(4, 1, 'ma-mixed', '四則混合與括號', () => {
    const t = R(0, 3), a = R(2, 9), b = R(2, 6), c = R(2, 6);
    if (t === 0) return { text: `${a} + ${b} × ${c}`, ans: a + b * c, opts: [(a + b) * c, a + b + c, a * b + c] };
    if (t === 1) return { text: `(${a} + ${b}) × ${c}`, ans: (a + b) * c, opts: [a + b * c, a + b + c, a * b * c] };
    if (t === 2) return { text: `${a + 3} × ${b} − ${c}`, ans: (a + 3) * b - c, opts: [(a + 3) * (b - c), (a + 3) * b + c, (a + 3) * b - c - 1] };
    const q = R(2, 5), x = R(q + 2, 20); return { text: `${x} − ${c * q} ÷ ${c}`, ans: x - q, opts: [x - q + 1, x - q - 1, Math.abs(x - c * q), x + q] };
  }, { demo: '先算括號裡面，再算乘除，最後算加減。' });
  A(4, 1, 'ma-bigmul', '二位數乘二位數', () => { const a = R(11, 25), b = R(11, 19); return { text: `${a} × ${b}`, ans: a * b }; }, { prereq: ['ma-mul2d1d'], demo: '把一個數拆成十位和個位，分兩次乘再加起來。' });
  K.add('ma', 4, 1, 'ma-angle', '角的種類', 'geo', 'angle', { demo: '直角像書本的角，剛好 90 度。比直角小是銳角，比直角大是鈍角。' });
  A(4, 2, 'ma-frac-same', '同分母分數加減', () => {
    const d = R(5, 12), a = R(1, d - 2), b = R(1, d - 1 - a);
    if (Math.random() < .5) return { text: `${frH(a, d)} + ${frH(b, d)}`, ans: frH(a + b, d), opts: [frH(a + b, 2 * d), frH(a + b + 1, d), frH(Math.max(1, a + b - 1), d)] };
    return { text: `${frH(a + b, d)} − ${frH(a, d)}`, ans: frH(b, d), opts: [frH(b + 1, d), frH(b, 2 * d), frH(a + b + a, d)] };
  }, { prereq: ['ma-frac-unit'], demo: '分母一樣時，分母不變，只要把分子相加或相減。' });
  A(4, 2, 'ma-dec2', '小數加減', () => { const a = R(11, 99) / 10, b = R(101, 899) / 100; return Math.random() < .5 ? { text: `${a} + ${b}`, ans: fix(a + b) } : { text: `${fix(a + b)} − ${b}`, ans: a }; }, { prereq: ['ma-dec1'], demo: '小數點對齊再計算，位數不夠的補 0。' });
  K.add('ma', 4, 2, 'ma-shop-2step', '兩步驟問題', 'shop', '2step', { demo: '先算一共多少錢，再算找回多少。一步一步來。' });
  A(4, 3, 'ma-unit', '單位換算', () => {
    const t = R(0, 3), n = R(2, 9);
    if (t === 0) return { text: `${n} 公尺 = □ 公分`, ans: n * 100, opts: [n * 10, n * 1000, n * 100 + 10] };
    if (t === 1) return { text: `${n} 公里 = □ 公尺`, ans: n * 1000, opts: [n * 100, n * 10, n * 10000] };
    if (t === 2) return { text: `${n * 100 + 50} 公分 = □ 公尺`, ans: n + .5, opts: [n * 10 + 5, (n * 100 + 50) * 100, n + .05] };
    return { text: `${n} 公斤 = □ 公克`, ans: n * 1000, opts: [n * 100, n * 10, n * 10000] };
  }, { demo: '1 公尺 = 100 公分，1 公里 = 1000 公尺，1 公斤 = 1000 公克。' });

  // ---------- G5 ----------
  A(5, 1, 'ma-factor', '因數', () => {
    const n = P([12, 18, 20, 24, 30, 36]), fs = [], nf = [];
    for (let i = 2; i < n; i++) (n % i ? nf : fs).push(i);
    return { text: `哪一個是 ${n} 的因數？`, ans: P(fs), opts: nf };
  }, { demo: '能把一個數剛好除盡的數，就是它的因數。' });
  A(5, 1, 'ma-gcd', '最大公因數', () => { const g = R(2, 6), [x, y] = K.sample([1, 2, 3, 4, 5], 2), a = g * x, b = g * y; return { text: `${a} 和 ${b} 的最大公因數`, ans: gcd(a, b) }; }, { prereq: ['ma-factor'], demo: '把兩個數的因數都列出來，找出共同有的、最大的那一個。' });
  K.add('ma', 5, 1, 'ma-sym', '線對稱', 'area', { mode: 'sym' }, { demo: '對稱軸像一面鏡子，左邊離鏡子幾格，右邊也要離幾格。' });
  A(5, 2, 'ma-lcm', '最小公倍數', () => { const [a, b] = K.sample([2, 3, 4, 5, 6, 8, 9], 2), l = a * b / gcd(a, b); return { text: `${a} 和 ${b} 的最小公倍數`, ans: l, opts: [a * b === l ? l * 2 : a * b, l + a, l + b, Math.max(a, b)] }; }, { prereq: ['ma-factor'], demo: '把兩個數的倍數列出來，第一個一樣的就是最小公倍數。' });
  A(5, 2, 'ma-frac-diff', '異分母分數加法', () => {
    let d1, d2, n1, n2, i = 0;
    do { [d1, d2] = P([[2, 3], [2, 4], [3, 4], [2, 5], [3, 6], [4, 6], [2, 6], [4, 8], [3, 5]]); n1 = R(1, d1 - 1); n2 = R(1, d2 - 1); } while ((n1 / d1 + n2 / d2 >= 1) && ++i < 30);
    const l = d1 * d2 / gcd(d1, d2), num = n1 * l / d1 + n2 * l / d2, g = gcd(num, l);
    return { text: `${frH(n1, d1)} + ${frH(n2, d2)}`, ans: fr(num, l), opts: [frH(n1 + n2, d1 + d2), frH(n1 + n2, l), frH(num / g + 1, l / g)] };
  }, { prereq: ['ma-frac-same', 'ma-lcm'], demo: '分母不一樣要先通分，變成一樣的分母再相加。' });
  K.add('ma', 5, 2, 'ma-tri-area', '三角形面積', 'geo', 'tri', { demo: '三角形面積 = 底 × 高 ÷ 2，因為它是平行四邊形的一半。' });
  K.add('ma', 5, 2, 'ma-sudoku6', '6×6 數獨', 'sudoku', { n: 6 }, { prereq: ['ma-sudoku4'] });
  A(5, 2, 'ma-dec-mul', '小數乘法', () => { const a = R(11, 50) / 10, b = R(2, 9); return { text: `${a} × ${b}`, ans: fix(a * b, 1), opts: [fix(a * b * 10, 0), fix(a * b / 10, 2), fix(a * b + 1, 1)] }; }, { prereq: ['ma-dec2'], demo: '先當成整數乘，再數一數小數點後面有幾位，點回去。' });
  A(5, 3, 'ma-percent', '百分率', () => { const p = P([10, 20, 25, 50, 75]), n = P([20, 40, 60, 80, 100, 200]); return { text: `${n} 的 ${p}% 是多少？`, ans: n * p / 100 }; }, { demo: '百分之幾就是「一百份裡的幾份」。50% 是一半，25% 是四分之一。', tip: '逛街時一起算「打八折是多少錢」。' });
  K.add('ma', 5, 3, 'ma-equiv', '分數、小數、百分率', 'equiv', null, { demo: '二分之一、0.5、50% 都是一樣的意思，只是寫法不同。' });
  K.add('ma', 5, 3, 'ma-volume', '長方體體積', 'geo', 'vol', { demo: '體積 = 長 × 寬 × 高，就是裡面可以放幾個小方塊。' });
  K.add('ma', 5, 3, 'ma-shop-discount', '打折', 'shop', 'discount', { prereq: ['ma-percent'], demo: '打 8 折就是原價乘以 0.8。' });
  K.add('ma', 5, 3, 'ma-seq2', '進階數列', 'seq', { lv: 2 }, { prereq: ['ma-seq'], demo: '不一定是加法，試試看是不是每次都乘以同一個數，或是差距越來越大。' });
  A(5, 3, 'ma-avg', '平均', () => { const m = R(5, 20), d = R(1, 4); const a = K.shuffle([m - d, m, m + d]); return { text: `${a.join('、')} 的平均是？`, ans: m }; }, { demo: '平均 = 全部加起來 ÷ 個數。' });

  // ---------- G6 ----------
  A(6, 1, 'ma-frac-div', '分數除法', () => {
    const b = R(2, 5), a = R(1, b - 1), d = R(2, 5), c = R(1, d - 1);
    return { text: `${frH(a, b)} ÷ ${frH(c, d)}`, ans: fr(a * d, b * c), opts: [fr(a * c, b * d), fr(b * c, a * d), fr(a * d + 1, b * c), fr(a + c, b + d)] };
  }, { demo: '除以一個分數，等於乘以它的倒數（上下顛倒）。' });
  A(6, 1, 'ma-ratio', '比與比值', () => { const [a, b] = K.sample([1, 2, 3, 4, 5], 2), k = R(2, 6); return { text: `${a} : ${b} = ${a * k} : □`, ans: b * k }; }, { demo: '比的前項和後項同時乘以一樣的數，比不會變。' });
  K.add('ma', 6, 1, 'ma-unknown', '未知數等式', 'balance', { lv: 2 }, { prereq: ['ma-balance'], demo: '把 □ 當成一個神祕數字，用反過來的運算把它找出來。' });
  A(6, 2, 'ma-speed', '速率', () => { const v = P([40, 50, 60, 80]), t = R(2, 5); return Math.random() < .5 ? { text: `時速 ${v} 公里，${t} 小時走幾公里？`, ans: v * t } : { text: `${v * t} 公里走了 ${t} 小時，時速幾公里？`, ans: v }; }, { demo: '距離 = 速率 × 時間。' });
  K.add('ma', 6, 2, 'ma-circle', '圓周長與圓面積', 'geo', 'circle', { demo: '圓周長 = 直徑 × 3.14；圓面積 = 半徑 × 半徑 × 3.14。' });
  K.add('ma', 6, 3, 'ma-shop-unit', '哪個划算', 'shop', 'unit', { demo: '算出「一個多少錢」再比較，單價低的比較划算。', tip: '在超市比較大包裝和小包裝哪個划算。' });
  A(6, 3, 'ma-scale', '比例尺', () => { const s = P([100, 500, 1000]), c = R(2, 8); return { text: `比例尺 1:${s}，圖上 ${c} 公分，實際是幾公尺？`, ans: c * s / 100, opts: [c * s, c * s / 10, c * s / 1000] }; }, { prereq: ['ma-ratio'], demo: '實際長度 = 圖上長度 × 比例尺的後項，最後記得換單位。' });

  // ---------- 產生器 ----------
  K.dots = n => { let s = '<span class="dots">'; for (let i = 0; i < n; i++) s += `<i class="${i % 10 < 5 ? 'a' : 'b'}"></i>`; return s + '</span>'; };
  const COL = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];
  const svg = (inner, vb = '0 0 60 60') => `<svg class="shp" viewBox="${vb}">${inner}</svg>`;
  K.SHAPES = {
    flat: [
      ['三角形', c => svg(`<polygon points="30,6 56,54 4,54" fill="${c}"/>`)],
      ['正方形', c => svg(`<rect x="9" y="9" width="42" height="42" fill="${c}"/>`)],
      ['長方形', c => svg(`<rect x="3" y="17" width="54" height="26" fill="${c}"/>`)],
      ['圓形', c => svg(`<circle cx="30" cy="30" r="25" fill="${c}"/>`)]
    ],
    solid: [['球體', () => '<span class="em">⚽</span>'], ['正方體', () => '<span class="em">🎲</span>'], ['圓柱體', () => '<span class="em">🥫</span>'], ['長方體', () => '<span class="em">📦</span>'], ['圓錐體', () => '<span class="em">🍦</span>']]
  };
  // 數線：回傳刻度標籤、顯示哪些、目標位置
  K.nlMake = s => {
    const c = s.data;
    if (c.frac) { const d = P([2, 3, 4, 5, 6, 8]); return { labels: Array.from({ length: d + 1 }, (_, i) => i === 0 ? '0' : i === d ? '1' : frH(i, d)), show: i => i === 0 || i === d, t: R(1, d - 1) }; }
    const n = Math.round(c.max / c.step), labels = Array.from({ length: n + 1 }, (_, i) => String(fix(i * c.step, c.dec || 0)));
    let t; do { t = R(1, n - 1); } while (t % c.every === 0);
    return { labels, show: i => i % c.every === 0, t };
  };
  K.nlHTML = (nl, mark) => '<span class="nl">' + nl.labels.map((l, i) => `<span class="tk${i === mark ? ' mk' : ''}"><b></b><em>${nl.show(i) ? l : ''}</em></span>`).join('') + '</span>';
  // 數獨
  K.sudoku = n => {
    const bh = 2, bw = n / 2, sh = K.shuffle;
    const band = sz => sh([...Array(n / sz).keys()]).flatMap(b => sh([...Array(sz).keys()]).map(i => b * sz + i));
    const rows = band(bh), cols = band(bw), dig = sh([...Array(n).keys()].map(i => i + 1));
    const sol = rows.map(r => cols.map(c => dig[(bw * (r % bh) + Math.floor(r / bh) + c) % n]));
    const puz = sol.map(r => r.slice());
    const okAt = (g, r, c, v) => {
      for (let i = 0; i < n; i++) if (g[r][i] === v || g[i][c] === v) return false;
      const r0 = r - r % bh, c0 = c - c % bw;
      for (let i = 0; i < bh; i++) for (let j = 0; j < bw; j++) if (g[r0 + i][c0 + j] === v) return false;
      return true;
    };
    const count = g => { for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (!g[r][c]) { let k = 0; for (let v = 1; v <= n && k < 2; v++) if (okAt(g, r, c, v)) { g[r][c] = v; k += count(g); g[r][c] = 0; } return k; } return 1; };
    let rm = n === 4 ? 9 : 19;
    for (const i of sh([...Array(n * n).keys()])) {
      if (!rm) break; const r = Math.floor(i / n), c = i % n, v = puz[r][c];
      puz[r][c] = 0; if (count(puz.map(x => x.slice())) === 1) rm--; else puz[r][c] = v;
    }
    return { n, bh, bw, sol, puz };
  };
  K.balGen = s => {
    if (s.data.lv === 1) {
      const a = R(2, 9), b = R(2, 9), c = R(1, a + b - 1);
      return Math.random() < .5 ? { l: `${a} + ${b}`, r: `□ + ${c}`, ans: a + b - c } : { l: `${c} + □`, r: `${a} + ${b}`, ans: a + b - c };
    }
    const t = R(0, 3), a = R(2, 9), x = R(2, 9), c = R(1, 9);
    if (t === 0) return { l: `□ × ${a}`, r: `${a * x}`, ans: x };
    if (t === 1) return { l: `□ ÷ ${a}`, r: `${x}`, ans: a * x };
    if (t === 2) return { l: `${a} × □ + ${c}`, r: `${a * x + c}`, ans: x };
    return { l: `□ − ${c}`, r: `${a} × ${x}`, ans: a * x + c };
  };
  K.seqGen = s => {
    const lv = s.data.lv; let a = [];
    if (lv === 1) { const st = P([2, 5, 10, 3, 4]), up = Math.random() < .7, s0 = up ? R(1, 12) : R(5, 9) * st + R(0, 3); for (let i = 0; i < 5; i++) a.push(s0 + (up ? i : -i) * st); }
    else {
      const t = R(0, 2);
      if (t === 0) { const m = P([2, 3]), s0 = R(1, 4); for (let i = 0; i < 5; i++) a.push(s0 * m ** i); }
      else if (t === 1) { let v = R(1, 5); for (let i = 0; i < 5; i++) { a.push(v); v += i + 1; } }
      else { const s0 = R(1, 4); for (let i = 0; i < 5; i++) a.push((s0 + i) ** 2); }
    }
    return { seq: a.slice(0, 4), ans: a[4] };
  };
  K.patGen = () => {
    const set = K.shuffle(P([['🔴', '🔵', '🟡', '🟢'], ['🍎', '🍌', '🍇', '🍓'], ['⭐', '🌙', '☀️', '☁️'], ['🐶', '🐱', '🐰', '🐻']]));
    const unit = P([[0, 1], [0, 0, 1], [0, 1, 1], [0, 1, 2]]).map(i => set[i]), len = unit.length * 2 + R(0, unit.length - 1) + (unit.length === 2 ? 2 : 0);
    const seq = Array.from({ length: len }, (_, i) => unit[i % unit.length]);
    return { seq, ans: unit[len % unit.length], opts: set };
  };
  const GOODS = [['🍎', '蘋果'], ['🍌', '香蕉'], ['🍪', '餅乾'], ['🥛', '牛奶'], ['🍬', '糖果'], ['🧃', '果汁'], ['🍞', '麵包'], ['✏️', '鉛筆'], ['📒', '筆記本'], ['🧸', '玩偶'], ['⚽', '球'], ['🍙', '飯糰']];
  K.shopGen = s => {
    const m = s.data, L = K.engine.L(), g = () => P(GOODS);
    const two = () => { const [x, y] = K.sample(GOODS, 2); return [x, y]; };
    if (m === 'pay') {
      if (L && L.sub.ma >= 3 && Math.random() < .5) { const [x, y] = two(), p = R(2, 9), q = R(2, 9); return { lines: [{ e: x[0], price: p, qty: 1 }, { e: y[0], price: q, qty: 1 }], want: '一共要收多少錢？', ans: p + q, coins: [1, 5, 10], text: `${x[1]} ${p} 元，${y[1]} ${q} 元，一共多少元？` }; }
      const x = g(), p = R(3, 15); return { lines: [{ e: x[0], price: p, qty: 1 }], want: `請拿出 ${p} 元`, ans: p, coins: [1, 5, 10], text: `5 元和 ${p - 5 > 0 ? p - 5 : 1} 元合起來是多少元？`, ans2: p - 5 > 0 ? p : 6 };
    }
    if (m === 'change') { const x = g(), p = R(12, 45), pay = p < 20 && Math.random() < .5 ? 20 : 50; return { lines: [{ e: x[0], price: p, qty: 1 }], pay, want: '要找多少錢？', ans: pay - p, coins: [1, 5, 10], text: `${x[1]} ${p} 元，付 ${pay} 元，找回多少元？` }; }
    if (m === 'multi') { const [x, y] = two(), p = P([5, 8, 10, 12, 15]), n = R(2, 5), q = P([10, 20, 25, 30]); return { lines: [{ e: x[0], price: p, qty: n }, { e: y[0], price: q, qty: 1 }], want: '一共要收多少錢？', ans: p * n + q, coins: [1, 5, 10, 50, 100], text: `${x[1]} 一個 ${p} 元買 ${n} 個，${y[1]} ${q} 元，一共多少元？` }; }
    if (m === '2step') { const x = g(), p = P([15, 25, 35, 45, 60]), n = R(2, 6), pay = p * n < 100 ? 100 : p * n < 200 ? 200 : 500; return { lines: [{ e: x[0], price: p, qty: n }], pay, want: '要找多少錢？', ans: pay - p * n, coins: [1, 5, 10, 50, 100], text: `${x[1]} 一個 ${p} 元買 ${n} 個，付 ${pay} 元，找回多少元？` }; }
    if (m === 'discount') {
      const x = g();
      if (Math.random() < .35) { const p = P([20, 30, 40, 50]); return { lines: [{ e: x[0], price: p, qty: 3 }], note: '買二送一', want: '要收多少錢？', ans: p * 2, coins: [5, 10, 50, 100], text: `${x[1]} 一個 ${p} 元，買二送一，拿 3 個要付多少元？` }; }
      const p = P([50, 100, 150, 200, 250, 300]), d = P([9, 8, 7, 5]); return { lines: [{ e: x[0], price: p, qty: 1 }], note: `打 ${d} 折`, want: '要收多少錢？', ans: p * d / 10, coins: [5, 10, 50, 100], text: `${x[1]} 原價 ${p} 元，打 ${d} 折是多少元？` };
    }
    // unit：哪個划算
    const x = g(); let n1, n2, u1, u2;
    do { [n1, n2] = K.sample([2, 3, 4, 5, 6], 2); u1 = R(8, 20); u2 = R(8, 20); } while (u1 === u2);
    const o = (n, u) => `${x[0]} ${n} 個 ${n * u} 元`;
    return { offers: [o(n1, u1), o(n2, u2)], best: u1 < u2 ? 0 : 1, want: '哪一種比較划算？', text: '哪一種比較划算？', ans: o(...(u1 < u2 ? [n1, u1] : [n2, u2])), opts: [o(...(u1 < u2 ? [n2, u2] : [n1, u1]))] };
  };
  const EQ = [[[1, 2], '0.5', '50%'], [[1, 4], '0.25', '25%'], [[3, 4], '0.75', '75%'], [[1, 5], '0.2', '20%'], [[1, 10], '0.1', '10%'], [[2, 5], '0.4', '40%'], [[3, 5], '0.6', '60%'], [[4, 5], '0.8', '80%'], [[3, 10], '0.3', '30%']].map(x => [frH(...x[0]), x[1], x[2]]);
  K.geoGen = s => {
    const m = s.data;
    if (m === 'angle') {
      const d = P([30, 45, 60, 90, 120, 150]), r = d * Math.PI / 180, x = 12 + 44 * Math.cos(r), y = 50 - 44 * Math.sin(r);
      const fig = svg(`<path d="M56 50 L12 50 L${x.toFixed(1)} ${y.toFixed(1)}" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` + (d === 90 ? '<path d="M20 50 V42 H12" fill="none" stroke="#2563eb" stroke-width="1.5"/>' : ''), '-30 0 100 56');
      return { fig, text: '這是什麼角？', ans: d < 90 ? '銳角' : d === 90 ? '直角' : '鈍角', opts: ['銳角', '直角', '鈍角'] };
    }
    if (m === 'tri') { const b = P([4, 6, 8, 10, 12]), hh = R(3, 9); return { fig: svg(`<polygon points="6,52 54,52 38,10" fill="#fde68a" stroke="#d97706" stroke-width="2"/><path d="M38 10 V52" stroke="#d97706" stroke-dasharray="3 3"/><text x="30" y="60" font-size="8" text-anchor="middle">底 ${b}</text><text x="42" y="34" font-size="8">高 ${hh}</text>`, '0 0 60 62'), text: '三角形的面積是多少？', ans: b * hh / 2, opts: [b * hh, b + hh, b * hh / 2 + 2] }; }
    if (m === 'vol') { const a = R(2, 6), b = R(2, 5), c = R(2, 5); return { fig: '<span class="em">📦</span>', text: `長 ${a}、寬 ${b}、高 ${c} 的長方體，體積是多少？`, ans: a * b * c, opts: [a + b + c, a * b + c, a * b * c + a] }; }
    const r = P([1, 2, 5, 10]), circ = Math.random() < .5;
    return { fig: svg(`<circle cx="30" cy="30" r="24" fill="#bfdbfe" stroke="#2563eb" stroke-width="2"/><path d="M30 30 H54" stroke="#2563eb" stroke-width="2"/><text x="42" y="26" font-size="8" text-anchor="middle">${r}</text>`), text: circ ? `半徑 ${r} 公分，圓周長是多少公分？（圓周率 3.14）` : `半徑 ${r} 公分，圓面積是多少平方公分？（圓周率 3.14）`, ans: circ ? fix(2 * r * 3.14) : fix(r * r * 3.14), opts: circ ? [fix(r * 3.14), fix(r * r * 3.14 + 1), fix(4 * r * 3.14)] : [fix(2 * r * 3.14 + 1), fix(r * 3.14 + .5), fix(2 * r * r * 3.14)] };
  };

  // ---------- 選擇題 ----------
  const M = K.mcqKinds, ex = t => `<span class="expr${t.replace(/<[^>]+>/g, '').length > 11 ? ' long' : ''}">${t}</span>`;
  M.arith = (s, n) => { const q = s.gen(); return K.mkq({ prompt: ex(q.text), item: q }, q.ans, q.opts || numD(q.ans), n); };
  M.count = (s, n) => { const v = R(1, s.data.max); return K.mkq({ prompt: K.dots(v), say: '數一數，有幾個？', ask: '數一數，有幾個？', item: { ans: v } }, v, numD(v), n); };
  M.compare = (s, n) => {
    const set = new Set(); while (set.size < n) set.add(R(0, s.data.max));
    const a = [...set], big = Math.random() < .5, t = big ? Math.max(...a) : Math.min(...a), tx = big ? '哪一個數字最大？' : '哪一個數字最小？';
    return K.mkq({ prompt: '', say: tx, ask: tx }, t, a.filter(x => x !== t), n);
  };
  M.numline = (s, n) => { const nl = K.nlMake(s); return K.mkq({ prompt: K.nlHTML(nl, nl.t), ask: '箭頭指的地方是多少？', say: '箭頭指的地方是多少？' }, nl.labels[nl.t], nl.labels.filter((_, i) => i !== nl.t && !nl.show(i)), n); };
  M.shape = (s, n) => {
    const set = K.SHAPES[s.data], cs = K.shuffle(COL), i = R(0, set.length - 1), tx = `哪一個是${set[i][0]}？`;
    return K.mkq({ prompt: '', ask: tx, say: tx }, set[i][1](cs[i]), set.filter((_, j) => j !== i).map((x, j) => x[1](cs[(j + i + 1) % cs.length])), n);
  };
  M.pattern = (s, n) => { const p = K.patGen(); return K.mkq({ prompt: `<span class="pat">${p.seq.join(' ')} ❓</span>`, ask: '接下來是哪一個？', say: '接下來是哪一個？' }, `<span class="em">${p.ans}</span>`, p.opts.map(x => `<span class="em">${x}</span>`), n); };
  M.seq = (s, n) => { const q = K.seqGen(s); return K.mkq({ prompt: ex(q.seq.join('、') + '、❓'), ask: '找出規律，下一個數是？', item: q }, q.ans, numD(q.ans), n); };
  K.balHTML = q => `<span class="bal"><b>${q.l}</b><i>⚖️</i><b>${q.r}</b></span>`;
  M.balance = (s, n) => { const q = K.balGen(s); return K.mkq({ prompt: K.balHTML(q), ask: '□ 是多少，兩邊才會一樣重？', item: q }, q.ans, numD(q.ans), n); };
  M.sudoku = (s, n) => { const N = s.data.n, row = K.shuffle([...Array(N).keys()].map(i => i + 1)), i = R(0, N - 1), v = row[i]; row[i] = '❓'; return K.mkq({ prompt: ex(row.join(' ')), ask: `1 到 ${N} 各出現一次，少了哪一個？`, item: { ans: v } }, v, [...Array(N).keys()].map(i => i + 1), n); };
  M.area = (s, n) => {
    const m = s.data.mode;
    if (m === 'sym') { const y = P([...'AHMTUVWY']), tx = '哪一個字母是左右對稱的圖形？'; return K.mkq({ prompt: '', ask: tx }, `<span class="enw">${y}</span>`, K.sample([...'FGJLPRSZQ'], 3).map(x => `<span class="enw">${x}</span>`), n); }
    const a = R(2, 7), b = R(2, 5);
    if (m === 'perim') return K.mkq({ prompt: ex(`長 ${a}、寬 ${b} 的長方形，周長是多少？`), item: { ans: 2 * (a + b) } }, 2 * (a + b), [a * b, a + b, 2 * (a + b) + 2, a * b + 2], n);
    let cells = ''; const w = R(2, 5), hh = R(1, 3); for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) cells += `<rect x="${c * 10 + 1}" y="${r * 10 + 1}" width="9" height="9" fill="${r < hh && c < w ? '#f59e0b' : '#f3f4f6'}"/>`;
    return K.mkq({ prompt: svg(cells, '0 0 61 41'), ask: '塗色的面積是幾格？', say: '塗色的面積是幾格？', item: { ans: w * hh } }, w * hh, numD(w * hh), n);
  };
  M.geo = (s, n) => { const q = K.geoGen(s); return K.mkq({ prompt: q.fig + ex(q.text), item: q }, q.ans, q.opts, n); };
  M.shop = (s, n) => { const q = K.shopGen(s), a = q.ans2 || q.ans; return K.mkq({ prompt: ex(q.text), item: q }, a, q.opts || numD(a), n); };
  M.equiv = (s, n) => {
    const i = R(0, EQ.length - 1), [f, t] = K.sample([0, 1, 2], 2);
    return K.mkq({ prompt: ex(EQ[i][f]), ask: '哪一個和它一樣大？' }, EQ[i][t], EQ.filter((_, j) => j !== i).map(x => x[t]), n);
  };
})();
