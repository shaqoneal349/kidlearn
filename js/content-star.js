'use strict';
// v4 內容包（參考 Starfall 研究報告）：看圖識詞與謎語、字謎、詞性、跳數與倒數、單雙數、月曆、注音家族、注音符號的例詞
(() => {
  const K = KL, R = K.rand, P = K.pick;
  const zw = t => `<span class="zhc">${t}</span>`, zs = t => `<span class="zhs">${t}</span>`;

  // ---------- 看圖識詞（Picture Hunt 用）：詞｜圖｜謎語（給中年級的「描述找圖」）----------
  const PIC = (cat, s) => s.split('\n').map(x => x.trim()).filter(Boolean).map(x => { const [w, e, d] = x.split('|'); return { w, e, d, cat }; });
  K.ZPIC = [].concat(
    PIC('動物', `小貓|🐱|喵喵叫，喜歡抓老鼠
      小狗|🐶|汪汪叫，會幫忙看家
      兔子|🐰|耳朵長長的，愛吃紅蘿蔔
      小豬|🐷|鼻子圓圓的，吃飽了就睡
      小鳥|🐦|有一對翅膀，會在天上飛
      金魚|🐠|住在水裡，搖著尾巴游來游去
      大象|🐘|鼻子長長的，耳朵大大的
      長頸鹿|🦒|脖子最長的動物
      猴子|🐵|愛吃香蕉，很會爬樹
      老虎|🐯|身上有黑色條紋的大貓
      烏龜|🐢|背著硬硬的殼，走路慢慢的
      青蛙|🐸|呱呱叫，小時候是蝌蚪
      小雞|🐥|黃黃小小的，跟著媽媽走
      綿羊|🐑|身上長著白白捲捲的毛
      蝴蝶|🦋|翅膀很美麗，喜歡在花間飛
      蜜蜂|🐝|嗡嗡叫，會採花蜜
      企鵝|🐧|住在冰天雪地，是不會飛的鳥
      熊貓|🐼|身上黑白相間，愛吃竹子
      鯨魚|🐳|住在海裡，是最大的動物
      螃蟹|🦀|橫著走路，有兩把大鉗子
      馬|🐴|跑得很快，可以讓人騎`),
    PIC('食物', `蘋果|🍎|紅紅的、圓圓的，咬起來脆脆的水果
      香蕉|🍌|黃色彎彎的，要剝皮才能吃
      西瓜|🍉|外面綠色、裡面紅色，夏天吃最消暑
      葡萄|🍇|一串一串的紫色水果
      草莓|🍓|紅紅的，身上有很多小點點
      橘子|🍊|剝開皮，裡面一瓣一瓣的
      鳳梨|🍍|頭上長葉子，皮刺刺的
      雞蛋|🥚|母雞生的，殼一敲就破
      牛奶|🥛|白白的飲料，是乳牛給我們的
      麵包|🍞|用麵粉烤的，早餐常常吃
      米飯|🍚|一粒一粒白白的，裝在碗裡吃
      冰淇淋|🍦|冰冰甜甜的，太陽一曬就融化
      蛋糕|🎂|過生日時會插上蠟燭
      玉米|🌽|黃色的顆粒排得整整齊齊
      紅蘿蔔|🥕|橘色長長的，兔子最愛吃`),
    PIC('生活', `書包|🎒|背著去上學，裡面裝課本
      雨傘|☂️|下雨的時候撐開它
      鉛筆|✏️|用來寫字，寫錯可以擦掉
      剪刀|✂️|用來剪紙，要小心使用
      時鐘|⏰|告訴我們現在幾點
      電話|📞|可以和很遠的人說話
      椅子|🪑|讓人坐下來休息
      帽子|🧢|戴在頭上遮太陽
      鞋子|👟|穿在腳上走路
      汽車|🚗|有四個輪子，在馬路上跑
      飛機|✈️|在天上飛，載人去很遠的地方
      火車|🚆|在鐵軌上跑，一節一節連在一起
      腳踏車|🚲|有兩個輪子，要用腳踩
      帆船|⛵|靠風在海上前進
      足球|⚽|圓圓的，用腳踢
      氣球|🎈|吹氣會變大，放手就飛走
      星星|⭐|晚上在天上一閃一閃
      月亮|🌙|晚上出來，有時圓有時彎
      太陽|☀️|白天出來，又亮又熱
      雪人|⛄|冬天用雪堆成的
      房子|🏠|我們住的地方
      鑰匙|🔑|用來打開門鎖`));
  const byCat = c => K.ZPIC.filter(x => x.cat === c);
  K.add('zh', 1, 1, 'zh-pic-1', '看圖識詞：動物', 'zpic', byCat('動物'), { demo: '先聽清楚詞語，再找出對的圖片。也可以看看詞語上面的注音。', tip: '看繪本時，請孩子指出「小貓在哪裡？」' });
  K.add('zh', 1, 2, 'zh-pic-2', '看圖識詞：食物', 'zpic', byCat('食物'), { demo: '先聽清楚詞語，再找出對的圖片。', tip: '逛超市時，讓孩子唸出水果的名字。' });
  K.add('zh', 1, 3, 'zh-pic-3', '看圖識詞：生活用品', 'zpic', byCat('生活'), { demo: '先聽清楚詞語，再找出對的圖片。', tip: '在家裡玩「找找看」：鑰匙在哪裡？' });
  K.add('zh', 2, 2, 'zh-riddle', '讀描述猜東西', 'zpic', K.ZPIC, { mode: 'riddle', prereq: ['zh-pic-1'], demo: '把句子讀完，想想有哪些特徵：顏色、形狀、會做什麼，再找出符合的東西。', tip: '輪流出謎題：「我有長長的鼻子，我是誰？」' });

  // ---------- 字謎（Starfall 的 Riddles 中文版）----------
  const ZM = `一口咬掉牛尾巴|告
    十張口，一顆心|思
    二人土上坐|坐
    千里相逢|重
    日月一起來|明
    人在草木中|茶
    大口吃小口|回
    一個人在門裡|閃
    口在門裡|問
    耳朵在門裡|聞
    心在門裡|悶
    太陽在門裡|間
    一個女孩子|好
    三人同日見|春
    自大一點|臭
    牛過獨木橋|生
    上面小，下面大|尖
    十字下面一個口|古
    一人一口|合
    有水能養魚，有土能種菜，有人不是你我，有馬跑遍天下|也
    王先生、白小姐坐在石頭上|碧
    木字多一撇，不當禾字猜|和`.split('\n').map(x => { const [q, a] = x.trim().split('|'); return { q, a }; });
  K.add('zh', 4, 2, 'zh-zimi', '字謎', 'zimi', ZM, { demo: '字謎要把句子拆開來想：「口在門裡」就是把「口」放進「門」裡面，變成「問」。', tip: '睡前猜一個字謎，再換孩子出題考你。' });

  // ---------- 詞性（Starfall 的 Nouns 中文版）----------
  K.POS = {
    n: { name: '名詞', tip: '人、地方、東西的名字', w: '老師 學校 蘋果 書包 小狗 公園 汽車 鉛筆 太陽 花朵 媽媽 椅子 河流 電腦 衣服 醫生 圖書館 星星 雨傘 蛋糕'.split(' ') },
    v: { name: '動詞', tip: '做的動作', w: '跑步 唱歌 吃飯 寫字 跳舞 游泳 睡覺 畫畫 洗手 打球 看書 說話 開門 飛翔 走路 拍手 煮飯 爬山 刷牙 種花'.split(' ') },
    a: { name: '形容詞', tip: '樣子、感覺、好不好', w: '美麗 快樂 高大 可愛 乾淨 安靜 勇敢 聰明 漂亮 寒冷 溫暖 熱鬧 圓滾滾 甜蜜 辛苦 明亮 柔軟 害羞 緊張 有趣'.split(' ') }
  };
  K.add('zh', 3, 2, 'zh-pos', '詞性：名詞、動詞、形容詞', 'pos', ['n', 'v', 'a'], { demo: '名詞是人、地方、東西的名字（老師、學校）；動詞是動作（跑步、唱歌）；形容詞說明樣子或感覺（美麗、快樂）。', tip: '玩「三個籃子」：說一個詞，請孩子丟進名詞、動詞或形容詞的籃子。' });

  // ---------- 數學：跳著數、數到 100 與倒數、單雙數、月曆 ----------
  K.add('ma', 1, 3, 'ma-count100', '數到 100 與倒數', 'skip', { by: [1], max: 100, back: true }, { demo: '往前數一次多 1，倒著數一次少 1。99 的下一個是 100，100 倒數下一個是 99。', tip: '洗澡時從 20 倒數到 0，像火箭發射一樣。' });
  K.add('ma', 2, 1, 'ma-skip', '跳著數：2、5、10', 'skip', { by: [2, 5, 10], max: 100, back: false }, { prereq: ['ma-count100'], demo: '2 個 2 個數：2、4、6、8；5 個 5 個數：5、10、15；10 個 10 個數：10、20、30。', tip: '數襪子用 2 個 2 個數，數零錢用 5 個 5 個數。' });
  K.add('ma', 2, 1, 'ma-oddeven', '單數與雙數', 'oddeven', null, { demo: '看個位數：0、2、4、6、8 是雙數，可以兩個兩個剛好分完；1、3、5、7、9 是單數，會剩下一個。', tip: '分糖果時問：可以兩人剛好分完嗎？' });
  K.add('ma', 2, 3, 'ma-calendar', '看月曆', 'cal', null, { demo: '月曆最上面一排是星期日到星期六。先找到那一天，再往上看是星期幾。同一排往下一格就是再過 7 天。', tip: '在家裡的月曆上圈出生日和節日，一起數還有幾天。' });

  // 節日（臺灣，孩子熟悉的）
  K.holidays = y => {
    const H = { '01-01': '元旦', '02-28': '和平紀念日', '04-04': '兒童節', '05-01': '勞動節', '08-08': '父親節', '09-28': '教師節', '10-10': '國慶日', '10-31': '萬聖節', '12-25': '聖誕節' };
    const L = K.LUNAR || {}; if (L.cny && L.cny[y]) H[L.cny[y]] = '春節'; if (L.boat && L.boat[y]) H[L.boat[y]] = '端午節'; if (L.moon && L.moon[y]) H[L.moon[y]] = '中秋節';
    const may = new Date(y, 4, 1), first = (7 - may.getDay()) % 7 + 1; H['05-' + String(first + 7).padStart(2, '0')] = '母親節'; // 五月第二個星期日
    return H;
  };
  const HICON = { 元旦: '🎉', 和平紀念日: '🕊️', 兒童節: '🧒', 勞動節: '🛠️', 父親節: '👨', 教師節: '👩‍🏫', 國慶日: '🇹🇼', 萬聖節: '🎃', 聖誕節: '🎄', 春節: '🧧', 端午節: '🐉', 中秋節: '🥮', 母親節: '💐' };
  K.HICON = HICON;
  const WD = '日一二三四五六';
  K.WD = WD;
  K.monthDays = (y, m) => new Date(y, m, 0).getDate();
  // 月曆表格：mark 標記的日子、today 今天
  K.calHTML = (y, m, o = {}) => {
    const H = K.holidays(y), first = new Date(y, m - 1, 1).getDay(), n = K.monthDays(y, m), t = new Date();
    let cells = WD.split('').map((w, i) => `<b class="cw${i === 0 || i === 6 ? ' we' : ''}">${w}</b>`).join('');
    for (let i = 0; i < first; i++) cells += '<i></i>';
    for (let d = 1; d <= n; d++) {
      const k = String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0'), hol = H[k], dow = (first + d - 1) % 7;
      const cls = ['cd', dow === 0 || dow === 6 ? 'we' : '', o.mark === d ? 'mk' : '', t.getFullYear() === y && t.getMonth() + 1 === m && t.getDate() === d && o.today !== false ? 'td' : '', hol ? 'hol' : ''].filter(Boolean).join(' ');
      cells += `<span class="${cls}" data-d="${d}">${d}${hol ? `<em>${HICON[hol] || '★'}</em>` : ''}</span>`;
    }
    return `<div class="cal"><div class="cal-h">${y} 年 ${m} 月</div><div class="cal-g">${cells}</div></div>`;
  };
  // 月曆題（y, m 可指定，月曆遊戲會固定同一個月）
  K.calQ = (y, m) => {
    const n = K.monthDays(y, m), first = new Date(y, m - 1, 1).getDay(), dow = d => (first + d - 1) % 7, H = K.holidays(y);
    const hols = Object.keys(H).filter(k => +k.slice(0, 2) === m).map(k => ({ d: +k.slice(3), name: H[k] }));
    const t = R(0, hols.length ? 4 : 3), wk = x => `星期${WD[x]}`;
    if (t === 0) { const d = R(1, n); return { mark: d, text: `${m} 月 ${d} 日是星期幾？`, ans: wk(dow(d)), opts: WD.split('').map((_, i) => wk(i)).filter(x => x !== wk(dow(d))), hint: `找到 ${d}，往上看最上面那一排。` }; }
    if (t === 1) return { text: `${m} 月有幾天？`, ans: n, opts: [28, 29, 30, 31].filter(x => x !== n), hint: '找到這個月最後一個數字。' };
    if (t === 2) { const w = R(0, 6), c = [...Array(n)].filter((_, i) => dow(i + 1) === w).length; return { text: `${m} 月有幾個星期${WD[w]}？`, ans: c, opts: [3, 4, 5, 6].filter(x => x !== c), hint: `找到星期${WD[w]}那一直排，數一數有幾個數字。` }; }
    if (t === 3) { const d = R(1, n - 7); return { mark: d, text: `${m} 月 ${d} 日再過 7 天是幾日？`, ans: d + 7, opts: [d + 6, d + 8, d + 1, d + 14].filter(x => x <= n + 3), hint: '同一直排往下一格，就是再過 7 天。' }; }
    const hd = P(hols); return { mark: null, text: `${hd.name}是 ${m} 月幾日？星期幾？`, ans: `${hd.d} 日${wk(dow(hd.d))}`, opts: [`${hd.d} 日${wk((dow(hd.d) + 1) % 7)}`, `${Math.max(1, hd.d - 1)} 日${wk(dow(Math.max(1, hd.d - 1)))}`, `${Math.min(n, hd.d + 7)} 日${wk(dow(hd.d))}`].filter(x => x !== `${hd.d} 日${wk(dow(hd.d))}`), hint: `找有 ${HICON[hd.name] || '★'} 的那一天。` };
  };
  K.skipSeq = s => {
    const by = P(s.data.by), back = s.data.back && Math.random() < .5, max = s.data.max;
    let start;
    if (by === 1) start = back ? R(8, max) : R(1, max - 5);
    else start = by * R(back ? 5 : 1, Math.floor(max / by) - (back ? 0 : 4));
    const seq = [0, 1, 2, 3].map(i => start + (back ? -1 : 1) * by * i), ans = start + (back ? -1 : 1) * by * 4;
    return { seq, ans, by, back };
  };

  // ---------- 選擇題（給魔王、複習、檢定用）----------
  const M = K.mcqKinds;
  const faceZ = it => `<span class="em">${it.e}</span><small class="cap">${it.w}</small>`;
  M.zpic = (s, n) => {
    const it = K.pi(s), pool = s.data.filter(x => x !== it);
    if (s.mode === 'riddle') return K.mkq({ prompt: zs(it.d), ask: '猜一猜，說的是哪一個？', item: it, hint: `它的名字有 ${[...it.w].length} 個字。` }, faceZ(it), pool.map(faceZ), n);
    return K.mkq({ prompt: '🔊', say: it.w, ask: '聽一聽，是哪一個？', item: it, hint: `「${it.w}」，看看哪一張圖是${it.w}。`, novoice: zs(it.w) }, faceZ(it), pool.map(faceZ), n);
  };
  M.zimi = (s, n) => { const it = K.pi(s); return K.mkq({ prompt: zs(it.q), ask: '猜一個字', item: it, hint: s.demo, full: `${it.q} → ${it.a}` }, zw(it.a), s.data.filter(x => x !== it).map(x => zw(x.a)), n); };
  M.pos = (s, n) => {
    const k = P(s.data), T = K.POS[k], w = P(T.w), others = s.data.filter(x => x !== k).flatMap(x => K.POS[x].w), tx = `哪一個是${T.name}（${T.tip}）？`;
    return K.mkq({ prompt: '', ask: tx, say: tx, item: { w, k }, hint: s.demo, full: `「${w}」是${T.name}` }, zs(w), K.sample(others, 6).map(zs), n);
  };
  M.oddeven = (s, n) => {
    const even = Math.random() < .5, pool = new Set(); const want = (() => { let x; do x = R(2, 99); while ((x % 2 === 0) !== even); return x; })();
    while (pool.size < 6) { const x = R(1, 99); if ((x % 2 === 0) !== even) pool.add(x); }
    const tx = `哪一個是${even ? '雙數' : '單數'}？`;
    return K.mkq({ prompt: '', ask: tx, say: tx, item: { ans: want }, hint: s.demo, full: `${want} 的個位是 ${want % 10}，是${even ? '雙數' : '單數'}` }, want, [...pool], n);
  };
  M.skip = (s, n) => {
    const q = K.skipSeq(s), st = q.back ? `每次少 ${q.by}` : `每次多 ${q.by}`;
    return K.mkq({ prompt: `<span class="expr">${q.seq.join('、')}、❓</span>`, ask: '接下來是多少？', item: q, hint: `${st}。`, full: `${q.seq.join('、')}、${q.ans}` }, q.ans, [q.ans + 1, q.ans - 1, q.ans + q.by, q.ans - q.by * 2, q.ans + 10].filter(x => x >= 0 && x !== q.ans), n);
  };
  M.cal = (s, n) => {
    const t = new Date(), y = t.getFullYear(), m = Math.random() < .5 ? t.getMonth() + 1 : R(1, 12), q = K.calQ(y, m);
    return K.mkq({ prompt: K.calHTML(y, m, { mark: q.mark }), ask: q.text, say: q.text, item: q, hint: q.hint }, q.ans, q.opts, n);
  };

  // ---------- 注音家族（Make-a-Word 中文版：同一個韻母，換不同的聲母）----------
  // 每一家：韻母、[聲母, 字, 詞, 圖]
  const FAM = (f, s) => ({ f, items: s.split(' ').map(x => { const [i, c, w, e] = x.split(':'); return { i, c, w, e: e || '' }; }) });
  K.ZY_FAM = [
    FAM('ㄚ', 'ㄅ:八:八個:8️⃣ ㄇ:媽:媽媽:👩 ㄊ:他:他們:👦 ㄌ:拉:拉手:🤝 ㄉ:搭:搭車:🚌 ㄕ:沙:沙子:🏖️ ㄘ:擦:擦桌子:🧽'),
    FAM('ㄠ', 'ㄅ:包:包子:🥟 ㄇ:貓:小貓:🐱 ㄉ:刀:刀子:🔪 ㄍ:高:高山:🏔️ ㄕ:燒:燒水:🔥 ㄆ:拋:拋球:🤾'),
    FAM('ㄧ', 'ㄐ:雞:小雞:🐔 ㄑ:七:七個:7️⃣ ㄒ:西:西瓜:🍉 ㄉ:低:高低:⬇️ ㄊ:踢:踢球:⚽ ㄆ:披:披風:🦸'),
    FAM('ㄨ', 'ㄕ:書:看書:📖 ㄓ:豬:小豬:🐷 ㄎ:哭:哭哭:😢 ㄍ:姑:姑姑:👩 ㄘ:粗:粗細:🪵 ㄆ:鋪:鋪床:🛏️'),
    FAM('ㄟ', 'ㄅ:杯:杯子:🥤 ㄈ:飛:飛機:✈️ ㄏ:黑:黑色:⬛'),
    FAM('ㄢ', 'ㄕ:山:高山:⛰️ ㄙ:三:三個:3️⃣ ㄉ:單:單車:🚲 ㄅ:班:班級:🏫 ㄍ:乾:乾淨:✨ ㄊ:攤:攤子:🛒'),
    FAM('ㄤ', 'ㄊ:湯:喝湯:🍲 ㄅ:幫:幫忙:🙋 ㄈ:方:方形:🟥 ㄓ:張:一張紙:📄 ㄍ:剛:剛才:⏱️ ㄕ:商:商店:🏪'),
    FAM('ㄥ', 'ㄉ:燈:電燈:💡 ㄈ:風:颳風:🌬️ ㄕ:生:生日:🎂 ㄓ:蒸:蒸包子:♨️ ㄎ:坑:坑洞:🕳️'),
    FAM('ㄡ', 'ㄊ:偷:小偷:🦹 ㄍ:溝:水溝:🌊 ㄕ:收:收玩具:🧸 ㄔ:抽:抽屜:🗄️ ㄓ:週:週末:📅'),
    FAM('ㄞ', 'ㄆ:拍:拍手:👏 ㄎ:開:開門:🚪 ㄘ:猜:猜謎:❓ ㄓ:摘:摘花:🌸 ㄉ:呆:發呆:😶')
  ];

  // ---------- 注音符號的例詞（學習步道的「認識」頁）：詞｜圖 ----------
  const EX = s => s.split(' ').map(x => { const [w, e] = x.split(':'); return { w, e }; });
  K.ZY_EX = {
    ㄅ: EX('爸爸:👨 杯子:🥤 包子:🥟'), ㄆ: EX('葡萄:🍇 蘋果:🍎 螃蟹:🦀'), ㄇ: EX('媽媽:👩 小貓:🐱 小馬:🐴'), ㄈ: EX('飛機:✈️ 房子:🏠 蜂蜜:🍯'),
    ㄉ: EX('雞蛋:🥚 電燈:💡 豆子:🫘'), ㄊ: EX('兔子:🐰 太陽:☀️ 糖果:🍬'), ㄋ: EX('牛奶:🥛 小鳥:🐦 奶奶:👵'), ㄌ: EX('老虎:🐯 籃球:🏀 恐龍:🦖'),
    ㄍ: EX('小狗:🐶 鴿子:🕊️ 蛋糕:🎂'), ㄎ: EX('褲子:👖 恐龍:🦖 咖啡:☕'), ㄏ: EX('花朵:🌸 猴子:🐵 河馬:🦛'),
    ㄐ: EX('小雞:🐔 橘子:🍊 金魚:🐠'), ㄑ: EX('氣球:🎈 汽車:🚗 企鵝:🐧'), ㄒ: EX('西瓜:🍉 星星:⭐ 小熊:🐻'),
    ㄓ: EX('小豬:🐷 蜘蛛:🕷️ 紙張:📄'), ㄔ: EX('汽車:🚗 小船:⛵ 窗戶:🪟'), ㄕ: EX('看書:📖 獅子:🦁 大樹:🌳'), ㄖ: EX('日出:🌅 豬肉:🍖 熱水:♨️'),
    ㄗ: EX('嘴巴:👄 足球:⚽ 粽子:🍙'), ㄘ: EX('小草:🌿 刺蝟:🦔 青菜:🥬'), ㄙ: EX('雨傘:☂️ 松鼠:🐿️ 四個:4️⃣'),
    ㄧ: EX('衣服:👕 鴨子:🦆 椅子:🪑'), ㄨ: EX('烏龜:🐢 青蛙:🐸 飯碗:🥣'), ㄩ: EX('金魚:🐟 下雨:🌧️ 月亮:🌙'),
    ㄚ: EX('媽媽:👩 小馬:🐴 青蛙:🐸'), ㄛ: EX('婆婆:👵 菠菜:🥬 伯伯:👨'), ㄜ: EX('白鵝:🦢 哥哥:👦 汽車:🚗'), ㄝ: EX('爺爺:👴 葉子:🍃 鞋子:👟'),
    ㄞ: EX('愛心:❤️ 白菜:🥬 奶奶:👵'), ㄟ: EX('杯子:🥤 飛機:✈️ 黑色:⬛'), ㄠ: EX('小貓:🐱 包子:🥟 小草:🌿'), ㄡ: EX('小狗:🐶 猴子:🐵 小手:✋'),
    ㄢ: EX('高山:⛰️ 雨傘:☂️ 米飯:🍚'), ㄣ: EX('開門:🚪 大人:🧍 森林:🌲'), ㄤ: EX('糖果:🍬 綿羊:🐑 窗戶:🪟'), ㄥ: EX('電燈:💡 颳風:🌬️ 星星:⭐'), ㄦ: EX('耳朵:👂 兒子:👦 兒歌:🎵')
  };

  // ---------- 小一分級（依十二年國教國語文課綱）----------
  // 課綱：注音符號教學實施於第一學年前十週（首冊沒有國字）；1,000 個常用字是一、二年級兩年的目標；
  // 「運用注音符號輔助識字」(3-Ⅰ-2)、課文全文附注音；識字順序「高頻到低頻、獨體到合體、具體到抽象」，並「以詞義教導識字」。
  // ★ 對應前十週：只有注音、拼讀、看圖識詞（有注音）；★★ 才開始認具體、高頻的字；★★★ 才有造詞、選字、排句子、短文。
  const LV = { 'zh-char-1a': 2, 'zh-char-1b': 2, 'zh-fill-1': 3, 'zh-word-1': 3, 'zh-sent-1': 3, 'zh-read-1': 3 };
  for (const id in LV) if (K.skill[id]) K.skill[id].sub = LV[id];

  // ---------- 注音輔助識字（逐步撤除）----------
  // 小一、小二的孩子在某一組國字還是「新手／熟悉」時：選項是「國字＋注音＋所在的詞」，有圖的字再給圖；
  // 到「穩定」以上就拿掉注音，只看國字；答錯變多、掌握度掉回去，注音又會回來。
  const PICTO = { 日: '☀️', 月: '🌙', 山: '⛰️', 水: '💧', 火: '🔥', 木: '🌳', 土: '🟫', 田: '🌾', 石: '🪨', 雨: '🌧️', 天: '🌤️', 人: '🧍', 口: '👄', 目: '👁️', 耳: '👂', 手: '✋', 足: '🦶', 牛: '🐮', 羊: '🐑', 馬: '🐴', 魚: '🐟', 鳥: '🐦', 狗: '🐶', 貓: '🐱', 豬: '🐷', 雞: '🐔', 鴨: '🦆', 蟲: '🐛', 兔: '🐰', 花: '🌸', 草: '🌿', 米: '🍚', 刀: '🔪', 門: '🚪', 車: '🚗', 書: '📖', 星: '⭐', 雲: '☁️', 風: '🌬️', 雪: '❄️', 衣: '👕', 心: '❤️', 果: '🍎', 瓜: '🍉', 竹: '🎋', 林: '🌲', 一: '1️⃣', 二: '2️⃣', 三: '3️⃣', 四: '4️⃣', 五: '5️⃣', 六: '6️⃣', 七: '7️⃣', 八: '8️⃣', 九: '9️⃣', 十: '🔟', 上: '⬆️', 下: '⬇️', 左: '⬅️', 右: '➡️', 哭: '😢', 笑: '😄', 吃: '🍽️', 喝: '🥤', 走: '🚶', 跑: '🏃', 坐: '🪑', 看: '👀', 聽: '👂' };
  const WORD_PIC = {};
  [...K.ZPIC, ...Object.values(K.ZY_EX).flat()].forEach(x => { if (!WORD_PIC[x.w]) WORD_PIC[x.w] = x.e; });
  K.picOf = it => PICTO[it.c] || WORD_PIC[it.w] || '';
  const zyT = z => z.endsWith('˙') ? '˙' + z.slice(0, -1) : z;
  K.zhScaffold = s => {
    const L = K.store.cur && K.store.cur();
    if (!L || s.subj !== 'zh' || s.g > 2 || L.gs.zh > 2) return false;
    return K.engine.stage(s.id) < 2;
  };
  K.zhHelpChar = it => `<span class="zsc"><ruby class="zhc">${it.c}<rt>${zyT(it.z)}</rt></ruby><small>${it.w}</small></span>`;
  const char0 = M.char;
  M.char = (s, n, mode) => {
    if (!K.zhScaffold(s)) return char0(s, n, mode);
    const it = K.pi(s), pool = s.data.filter(x => x.z !== it.z && x.c !== it.c), pic = K.picOf(it);
    return K.mkq({ prompt: pic ? `<span class="em">${pic}</span>` : '🔊', say: `${it.c}。${it.w}的${it.c}。`, ask: '聽一聽，是哪一個字？可以看注音喔', item: it, hint: `它的注音是 ${it.z.replace('ˉ', '')}，在「${it.w}」這個詞裡。`, novoice: `<span class="zy">${it.z.replace("ˉ", "")}</span> <span class="zhs">${it.w.replace(it.c, "＿")}</span>`, help: true },
      K.zhHelpChar(it), pool.map(K.zhHelpChar), Math.min(n, 3));
  };
})();
