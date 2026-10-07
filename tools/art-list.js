// 產生美術素材清單 docs/art/assets.csv（森林繪本風格）
// 用法：node tools/art-list.js
// 第一階段（背景、角色、介面、圖示、遊戲卡）寫在下面；第二、三階段的「物件」直接從遊戲內容收集用到的 emoji，
// 物件檔名用 emoji 的 Unicode 碼（🍓 → 1f353.webp），之後程式可以把畫面上的 emoji 自動換成對應的圖，沒有圖就沿用 emoji。
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');

// ---------- 提示詞架構（v3，依 docs/art/ART_SPEC.md 第 3 節）----------
// [Master Style Prefix] + [Category Scaffolding]: [Subject Details]. [類別收尾] --no [Negative Rules]
// 背景與角色帶完整的風格前綴；物件、圖示、遊戲卡、介面元件直接以類別開頭，比較短、主體比較清楚。
// 人工調整過的提示詞放在 docs/art/prompt-overrides.csv，會蓋掉自動產生的那一列。
const STYLE = 'Premium storybook-style mobile game art, painterly digital illustration with soft 3D volume and depth, cozy animated film concept painting, rounded chunky shapes, warm golden afternoon sunlight from the top-left, gentle rim light, soft ambient occlusion and contact shadows. Palette of leaf green, warm wood brown, cream parchment, sunny yellow, berry red.';
const KIND = {
  bg: { pre: true, head: 'Wide environment scene with strong depth', tail: 'Layered foreground slightly blurred, sharp midground, soft hazy distant background. Central screen uncluttered for game UI, important details away from the edges. Square 1:1.', no: 'text, letters, numbers, watermark, characters, flat 2D vector, thick lines' },
  char: { pre: true, head: 'Single full-body character', tail: 'Fluffy tactile fur texture, big glossy eyes with bright catchlights, warm golden rim light from top-left. Centered, isolated on pure white background, soft contact shadow. Square 1:1.', no: 'text, outlines, flat 2D, cel shading' },
  item: { pre: false, head: 'Single 3D storybook game object', tail: 'Chunky rounded proportions, tactile material detail, 3/4 angle from slightly above, soft volumetric shading and specular highlight, soft contact shadow. Centered, isolated on pure white background. Square 1:1.', no: 'text, flat vector, outlines' },
  icon: { pre: false, head: 'Chunky 3D game icon', tail: 'Rounded bulbous shape, soft glossy ambient reflection, warm rim light from top-left, slight bevel edge, readable at tiny size. Isolated on pure white background, soft drop shadow. Square 1:1.', no: 'text, flat vector' },
  card: { pre: false, head: 'Game menu card illustration: miniature storybook diorama of', tail: '3/4 perspective, rounded focal composition, soft golden afternoon rim light, soft volumetric light. Isolated on pure white background. Square 1:1.', no: 'text, letters, numbers' },
  ui: { pre: false, head: 'Game UI element with real thickness', tail: 'Tactile bevels, rich warm wood grain (#8B5A2B) or thick cream parchment (#FFF4DC), small soft green leaf or vine accent, soft ambient shadow underneath, completely empty with no text. Isolated on pure white background.', no: 'text, no letters' }
};
const NEG = 'text, letters, Chinese characters, numbers, watermark, signature, flat vector art, flat colors, simple 2D cartoon, thick black outlines, cel shading, line art, plastic toy, photorealism, neon glow, sharp creepy faces, extra limbs';
const prompt = (kind, subj) => { const k = KIND[kind]; return `${k.pre ? STYLE + ' ' : ''}${k.head}: ${subj.replace(/\.?$/, '.')} ${k.tail} --no ${k.no}`; };

// ---------- 角色設定（產生角色圖時一起附上設定圖當參考；token 依 ART_SPEC 第 2 節）----------
const CHAR = {
  fox: 'chibi red fox cub, cream chest and muzzle, large glossy amber eyes, fluffy brush tail with white tip, wearing a leaf-green scarf (#5E8C4A) and a small brown leather satchel',
  bunny: 'chubby white bunny, pink inner ears, rosy cheeks, warm glossy black eyes, wearing a little yellow apron with white polka dots (#F6C343)',
  bear: 'chubby brown bear cub with round ears, soft tan belly patch, wearing a small red triangle bandana (#D9483B)',
  owl: 'round plump brown owl, wise kind eyes, warm wood-grain feather textures, oversized circular spectacles, tiny green bow tie, holding a thick leatherbound storybook'
};

// ---------- 第一階段：讓整體畫面換掉的「骨架」----------
// [類別, 檔名, 尺寸, 透明, 用在哪裡, 主體描述]
const P1 = [
  // 背景
  ['bg', 'bg/home-island.webp', '2048x2048', '否', '首頁小島', 'a small lush island in a blue lake: a big treehouse with a wooden deck in the center, a mushroom-roof kitchen hut on the left, a wooden harbor with a little sailboat on the right, a white lighthouse in the distance, flower meadows and rope bridges'],
  ['bg', 'bg/game-zh.webp', '2048x2048', '否', '國語遊戲背景', 'inside a cozy treehouse classroom with wooden shelves of books, a small blackboard, potted plants, warm lanterns'],
  ['bg', 'bg/game-ma.webp', '2048x2048', '否', '數學遊戲背景', 'a cozy forest kitchen with wooden counters, jars, baskets of fruit, a window showing the forest'],
  ['bg', 'bg/game-en.webp', '2048x2048', '否', '英文遊戲背景', 'a sunny flower garden with a picket fence, a little garden shed and a winding path'],
  ['bg', 'bg/boss.webp', '2048x2048', '否', '魔王挑戰', 'a misty deep forest clearing at dusk with glowing mushrooms and ancient trees, a bit mysterious but friendly'],
  ['bg', 'bg/library.webp', '2048x2048', '否', '故事屋', 'inside a treehouse library: curved wooden bookshelves, a reading nook with cushions, hanging lanterns'],
  ['bg', 'bg/lessons.webp', '2048x2048', '否', '學習步道', 'a gentle forest trail map seen from above, a winding dirt path with stepping stones, small signposts without text'],
  ['bg', 'bg/puzzle.webp', '2048x2048', '否', '益智島', 'a playful island of giant wooden toy blocks and fruit trees by the water'],
  ['bg', 'bg/garage.webp', '2048x2048', '否', '賽車車庫', 'a wooden forest workshop with tools on the wall, wooden wheels and a workbench'],
  ['bg', 'bg/race-track.webp', '2048x1024', '否', '比賽賽道（橫向可重複）', 'a horizontal dirt race track through the forest, side view, seamlessly tileable left to right'],
  ['bg', 'bg/result.webp', '2048x2048', '否', '結算畫面', 'a sunny forest clearing with colorful bunting flags and floating leaves, celebratory'],
  ['bg', 'bg/welcome.webp', '2048x2048', '否', '開場／選小朋友', 'the island seen from the lake at sunrise, soft and welcoming'],
  // 角色：小狐
  ['char', 'char/fox-idle.webp', '1024x1024', '是', '待機（遊戲畫面角落）', `${CHAR.fox}. Pose: friendly standing pose, front-facing 3/4 view.`],
  ['char', 'char/fox-wave.webp', '1024x1024', '是', '首頁、開場', `${CHAR.fox}. Pose: standing and waving hello.`],
  ['char', 'char/fox-point.webp', '1024x1024', '是', '提示小手（指向）', `${CHAR.fox}. Pose: pointing forward with one paw, encouraging.`],
  ['char', 'char/fox-think.webp', '1024x1024', '是', '出題、提示', `${CHAR.fox}. Pose: thinking with a paw on the chin.`],
  ['char', 'char/fox-cheer.webp', '1024x1024', '是', '答對', `${CHAR.fox}. Pose: jumping with both arms up, very happy.`],
  ['char', 'char/fox-comfort.webp', '1024x1024', '是', '答錯（安慰，不可難過）', `${CHAR.fox}. Pose: gentle smile, one paw raised as if saying "it's okay, try again".`],
  ['char', 'char/fox-read.webp', '1024x1024', '是', '故事屋', `${CHAR.fox}. Pose: sitting and reading an open book.`],
  ['char', 'char/fox-rest.webp', '1024x1024', '是', '休息提醒', `${CHAR.fox}. Pose: yawning and stretching, sleepy but cute.`],
  ['char', 'char/fox-trophy.webp', '1024x1024', '是', '精熟、升級', `${CHAR.fox}. Pose: holding up a golden star trophy.`],
  // 角色：小兔、熊熊、貓頭鷹老師
  ['char', 'char/bunny-idle.webp', '1024x1024', '是', '數字廚房（客人）', `${CHAR.bunny}. Pose: sitting at a table, waiting happily.`],
  ['char', 'char/bunny-happy.webp', '1024x1024', '是', '數字廚房（答對）', `${CHAR.bunny}. Pose: clapping happily.`],
  ['char', 'char/bunny-hmm.webp', '1024x1024', '是', '數字廚房（數量不對）', `${CHAR.bunny}. Pose: tilting head, curious, not sad.`],
  ['char', 'char/bear-hungry.webp', '1024x1024', '是', '餵小熊', `${CHAR.bear}. Pose: holding an empty bowl, hungry and hopeful.`],
  ['char', 'char/bear-happy.webp', '1024x1024', '是', '餵小熊（答對）', `${CHAR.bear}. Pose: eating happily, rubbing belly.`],
  ['char', 'char/owl-teach.webp', '1024x1024', '是', '學習步道、故事屋', `${CHAR.owl}. Pose: standing and holding an open book, teaching.`],
  ['char', 'char/owl-happy.webp', '1024x1024', '是', '學習步道（完成）', `${CHAR.owl}. Pose: wings open, proud and happy.`],
  // 寵物進化（精熟越多越長大）
  ['char', 'char/pet-0-egg.webp', '1024x1024', '是', '寵物：神祕的蛋', 'a speckled cream egg sitting in a little nest of twigs and leaves'],
  ['char', 'char/pet-1-hatch.webp', '1024x1024', '是', '寵物：破殼寶寶', 'a tiny yellow chick peeking out of a cracked speckled egg'],
  ['char', 'char/pet-2-chick.webp', '1024x1024', '是', '寵物：小小雞', 'a fluffy little yellow chick with a tiny leaf on its head'],
  ['char', 'char/pet-3-dino.webp', '1024x1024', '是', '寵物：小恐龍', 'a small friendly green baby dinosaur with a leaf scarf'],
  ['char', 'char/pet-4-dragon.webp', '1024x1024', '是', '寵物：學習神龍', 'a small majestic friendly forest dragon, green and gold, with tiny wings and a book'],
  // 魔王（調皮但不可怕）
  ['char', 'char/boss-octopus.webp', '1024x1024', '是', '魔王：湖底', 'a mischievous purple lake octopus wearing a tiny crown, cheeky not scary'],
  ['char', 'char/boss-star.webp', '1024x1024', '是', '魔王：夜空', 'a mischievous round star creature with a cape, cheeky not scary'],
  ['char', 'char/boss-dragon.webp', '1024x1024', '是', '魔王：森林', 'a mischievous chubby mossy forest dragon, cheeky not scary'],
  // 介面元件（9-slice：四角不拉伸，中間可拉伸；請留 64px 的邊框範圍）
  ['ui', 'ui/panel-wood.webp', '768x256（9-slice 邊 64）', '是', '標題木牌', 'a horizontal painted wooden sign board with rounded corners and two small nails, empty'],
  ['ui', 'ui/panel-paper.webp', '768x768（9-slice 邊 64）', '是', '題目卡、內容卡', 'a cream parchment card with soft torn-paper edges and a thin leaf border, empty'],
  ['ui', 'ui/btn-yellow.webp', '640x192（9-slice 邊 64）', '是', '主要按鈕（開始冒險、上菜）', 'a rounded sunny-yellow game button with a wooden rim and a soft top highlight, empty'],
  ['ui', 'ui/btn-yellow-down.webp', '640x192（9-slice 邊 64）', '是', '主要按鈕（按下）', 'the same rounded sunny-yellow button pressed down, slightly darker and flatter'],
  ['ui', 'ui/btn-green.webp', '640x192（9-slice 邊 64）', '是', '次要按鈕', 'a rounded leaf-green game button with a wooden rim, empty'],
  ['ui', 'ui/btn-round.webp', '256x256', '是', '圓形小按鈕（家、喇叭、暫停）', 'a round wooden button with a cream center, empty'],
  ['ui', 'ui/option-card.webp', '512x384（9-slice 邊 64）', '是', '選擇題選項', 'a rounded cream card with a wooden frame, empty'],
  ['ui', 'ui/option-right.webp', '512x384（9-slice 邊 64）', '是', '選項：答對', 'the same rounded card glowing soft green with tiny sparkles'],
  ['ui', 'ui/option-wrong.webp', '512x384（9-slice 邊 64）', '是', '選項：再想想', 'the same rounded card tinted soft orange'],
  ['ui', 'ui/tabbar.webp', '1536x256（9-slice 邊 96）', '是', '底部導覽列', 'a long horizontal wooden plank bar with rounded ends'],
  ['ui', 'ui/progress-vine.webp', '1024x96（9-slice 邊 48）', '是', '進度條底', 'a horizontal empty wooden progress bar groove with a vine wrapped around'],
  ['ui', 'ui/progress-fill.webp', '1024x96（9-slice 邊 48）', '是', '進度條填色', 'a horizontal glowing leaf-green progress fill bar'],
  ['ui', 'ui/bubble.webp', '512x384（9-slice 邊 80）', '是', '角色對話框', 'a cream speech bubble with a small tail at the bottom-left, empty'],
  ['ui', 'ui/frame-card.webp', '512x640（9-slice 邊 64）', '是', '遊戲卡外框', 'a rounded wooden picture frame card with a small leaf decoration on top, empty'],
  // 小圖示
  ['icon', 'icon/coin.webp', '256x256', '是', '金幣（橡果代幣）', 'stylized golden oak acorn coin, carved wooden cap texture, polished glowing nut body, 3/4 angle'],
  ['icon', 'icon/star.webp', '256x256', '是', '星星', 'a plump golden star'],
  ['icon', 'icon/star-empty.webp', '256x256', '是', '空星星', 'a pale empty star outline, cream'],
  ['icon', 'icon/heart.webp', '256x256', '是', '愛心（魔王血量）', 'a plump red heart'],
  ['icon', 'icon/sticker.webp', '256x256', '是', '收藏', 'a round badge with a ribbon'],
  ['icon', 'icon/calendar.webp', '256x256', '是', '這週天數', 'a small wooden desk calendar'],
  ['icon', 'icon/parent.webp', '256x256', '是', '家長專區', 'a cozy little house with a heart on the door'],
  ['icon', 'icon/sound.webp', '256x256', '是', '再聽一次', 'a small wooden horn speaker with sound waves made of leaves'],
  ['icon', 'icon/hint.webp', '256x256', '是', '提示', 'a glowing firefly lantern'],
  ['icon', 'icon/nav-island.webp', '256x256', '是', '導覽：小島', 'a tiny island with a palm tree'],
  ['icon', 'icon/nav-explore.webp', '256x256', '是', '導覽：探險', 'a brass compass'],
  ['icon', 'icon/nav-story.webp', '256x256', '是', '導覽：故事', 'an open storybook'],
  ['icon', 'icon/nav-home.webp', '256x256', '是', '導覽：小屋', 'a small cottage with a red roof'],
  ['icon', 'icon/subj-zh.webp', '256x256', '是', '國語島', 'three wooden letter tiles stacked, blank faces (zhuyin will be overlaid by the app)'],
  ['icon', 'icon/subj-ma.webp', '256x256', '是', '數學島', 'three wooden counting blocks and an abacus'],
  ['icon', 'icon/subj-en.webp', '256x256', '是', '英文島', 'colorful wooden alphabet blocks among flowers, blank faces'],
  ['icon', 'icon/portal-lessons.webp', '256x256', '是', '入口：學習步道', 'a signpost on a forest path'],
  ['icon', 'icon/portal-library.webp', '256x256', '是', '入口：故事屋', 'a little treehouse with books in the window'],
  ['icon', 'icon/portal-garage.webp', '256x256', '是', '入口：賽車車庫', 'a small wooden race car with leaf decorations']
];
// 遊戲卡插圖（首頁、今日冒險、結算用），描述依遊戲玩法
const CARD = {
  e1: 'colorful balloons floating up with a fox holding strings', e2: 'two flipped picture cards facing up on a wooden table', e3: 'a little wooden word factory machine with conveyor belt', e4: 'stacked wooden building blocks forming a bridge',
  e5: 'a fox running along a forest path with arrows', m1: 'a fox fishing from a dock with numbered fish bobbers (blank)', m2: 'two wooden race cars on a track', m3: 'a small wooden market stall with fruit and coins',
  m4: 'wooden geometric blocks: triangle, square, circle', m5: 'a magnifying glass over footprints', c1: 'a little steam train with blank wooden carriages', c2: 'a calligraphy brush and ink stone with a leaf',
  c3: 'two wooden puzzle pieces fitting together', c4: 'a magnifying glass over a page with a bug', c5: 'two friendly kids on a small wooden stage holding banners (blank)', e6: 'a fox detective with a hat and magnifying glass reading',
  c8: 'a small island with an open book as a sail', e7: 'two animals chatting with speech bubbles (blank)', m6: 'a cooking pot with vegetables and a ladle', c6: 'a forest of trees with matching cards hanging',
  c7: 'a wrench and screwdriver fixing a wooden sign', c10: 'two dots connected by a rope bridge', c9: 'a train track with three blank carriages', c11: 'crayons coloring a half-colored picture',
  e8: 'crayons coloring a half-colored picture with a flower', c12: 'three wooden posts in water with signs (blank)', e9: 'three wooden posts in water with flowers', m9: 'three wooden posts in water with stones',
  c13: 'a horseshoe magnet attracting blank wooden tiles', e10: 'a horseshoe magnet with blank alphabet blocks', m7: 'a cute wooden machine with a red lever', m8: 'soap bubbles of different colors',
  c14: 'a wooden tic-tac-toe board with acorns and leaves as pieces', c15: 'a honeycomb with a friendly bee', m10: 'a wooden wall calendar with a flower on one day',
  lzy: 'soap bubbles with blank wooden tiles inside', labc: 'soap bubbles with blank letter blocks inside', lnum: 'a bear cub with a plate of cookies',
  'pz-match': 'three strawberries in a row on a board', 'pz-tetris': 'falling wooden tetromino blocks', 'pz-merge': 'two wooden number tiles merging (blank)', 'pz-blocks': 'colorful wooden puzzle shapes fitting into a tray', 'pz-sort': 'glass tubes with colored balls'
};

// ---------- 讀取遊戲內容 ----------
const sb = { console, Math, Date, JSON, Set, Map, Array, Object, String, Number, RegExp, Promise, navigator: {}, localStorage: { getItem: () => null, setItem() { } }, document: null };
sb.window = sb; vm.createContext(sb);
for (const f of ['core.js', 'data-zhuyin.js', 'data-en.js', 'data-zh-chars.js', 'content-en.js', 'content-ma.js', 'content-zh.js', 'content-zh2.js', 'content-plus.js', 'content-star.js', 'content-books.js', 'games-en.js', 'games-ma.js', 'games-zh.js', 'games-plus.js', 'games-more.js', 'games-star.js', 'puzzles.js'])
  vm.runInContext(fs.readFileSync(path.join(root, 'js', f), 'utf8'), sb);
const K = sb.KL;
const games = Object.values(K.games).concat(Object.values(K.puzzles || {}).map(g => Object.assign({}, g, { id: 'pz-' + g.id })));

// ---------- 物件：收集內容裡用到的 emoji ----------
const EMO = /\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*|[0-9#*]️?⃣/gu;
const code = e => [...e].map(c => c.codePointAt(0)).filter(c => c !== 0xFE0F).map(c => c.toString(16)).join('-');
const items = new Map(); // emoji → { names:Set, where:Set, phase }
const addE = (e, name, where, phase) => { if (!e) return; for (const m of e.matchAll(EMO)) { const k = m[0]; const it = items.get(k) || { en: new Set(), names: new Set(), where: new Set(), phase }; if (name) it.names.add(name); it.where.add(where); it.phase = Math.min(it.phase, phase); items.set(k, it); } };
K.ZPIC.forEach(x => addE(x.e, x.w, '塗色找找看／看圖識詞', 2));
Object.values(K.ZY_EX).flat().forEach(x => addE(x.e, x.w, '學習步道：注音例詞', 2));
K.ZY_FAM.forEach(f => f.items.forEach(x => addE(x.e, x.w, '注音家族', 2)));
K.BOOKS.forEach(b => { addE(b.cover, `《${b.title}》封面`, '故事屋封面', 2); b.pages.forEach(p => addE(p.e, `《${b.title}》`, '故事屋插圖', 2)); });
['🍪 餅乾', '🍎 蘋果', '🍓 草莓', '🍯 蜂蜜', '🐟 魚', '🦖 恐龍', '⭐ 星星', '🐥 小雞', '🚗 汽車', '🎈 氣球', '🍌 香蕉', '🍊 橘子', '🍇 葡萄', '🍉 西瓜', '🍩 甜甜圈', '🧁 杯子蛋糕', '🍽️ 盤子', '🧺 籃子'].forEach(s => { const [e, n] = s.split(' '); addE(e, n, '數學：數數與加法機器', 2); });
(K.STICKERS || []).forEach(e => addE(e, '', '小島收藏裝飾', 3));
const addEn = (x, where, phase) => { addE(x.e, /^[a-z]$/i.test(x.zh) ? '' : x.zh, where, phase); for (const m of (x.e || '').matchAll(EMO)) items.get(m[0]).en.add(x.w); };
K.EN_ALL.forEach(x => addEn(x, '英文單字', 3));
(K.skills || []).forEach(s => { if (s.kind === 'lsound' || s.kind === 'phon') s.data.forEach(x => addEn(x, '英文拼讀', 2)); });

// ---------- 輸出 ----------
const rows = [['編號', '階段', '類別', '檔名', '尺寸', '透明背景', '用在哪裡', '主體（中文）', '提示詞（貼到 AI 生成工具）', '狀態']];
let n = 0;
const id = () => 'A' + String(++n).padStart(3, '0');
const KZ = { bg: '背景', char: '角色', ui: '介面元件', icon: '圖示', card: '遊戲卡', item: '物件' };
P1.forEach(([k, file, size, tr, where, subj]) => rows.push([id(), 1, KZ[k], 'assets/' + file, size, tr, where, where, prompt(k, subj), '']));
games.forEach(g => rows.push([id(), 1, KZ.card, `assets/game/${g.id}.webp`, '512x512', '是', `遊戲卡：${g.name}`, `${g.name}（${g.desc || ''}）`, prompt('card', CARD[g.id] || g.name), '']));
[...items.entries()].sort((a, b) => a[1].phase - b[1].phase).forEach(([e, it]) => {
  const names = [...it.names].filter(n => !/^《/.test(n)).slice(0, 3).join('、') || [...it.names].slice(0, 1).join(''), en = [...it.en][0] || '';
  rows.push([id(), it.phase, KZ.item, `assets/item/${code(e)}.webp`, '512x512', '是', [...it.where].join('；'), `${e} ${names}`, prompt('item', `${en ? en + (names ? ' (' + names + ')' : '') : names || e}, as in the emoji ${e}`), '']);
});
// 人工調整的提示詞（docs/art/prompt-overrides.csv：kind,filename,name,prompt）蓋掉自動產生的；檔名不同的用 ALIAS 對到現有檔名
const ALIAS = { 'bg/forest-path.webp': 'bg/lessons.webp', 'bg/story-room.webp': 'bg/library.webp', 'bg/math-kitchen.webp': 'bg/game-ma.webp', 'char/owl-teacher.webp': 'char/owl-teach.webp', 'ui/btn-primary-wood.webp': 'ui/btn-yellow.webp', 'ui/board-parchment.webp': 'ui/panel-paper.webp', 'icon/star-gold.webp': 'icon/star.webp', 'icon/coin-acorn.webp': 'icon/coin.webp', 'game/c11-phonics.webp': 'game/c8.webp', 'game/c12-math.webp': 'game/m6.webp' };
const parseCSV = t => {
  const out = []; let row = [], cur = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"' && t[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; row.push(cur); cur = ''; if (row.some(Boolean)) out.push(row); row = []; }
    else cur += c;
  }
  if (cur || row.length) { row.push(cur); out.push(row); }
  return out;
};
const ovPath = path.join(root, 'docs/art/prompt-overrides.csv');
let nOv = 0;
if (fs.existsSync(ovPath)) for (const [kind, file, name, pr] of parseCSV(fs.readFileSync(ovPath, 'utf8').replace(/^\uFEFF/, '')).slice(1)) {
  const wf = file.replace(/\.png$/, '.webp'), f = 'assets/' + (ALIAS[file] || ALIAS[wf] || wf), r = rows.find(x => x[3] === f);
  if (r) { r[8] = pr; r[9] = r[9] || '提示詞已人工調整'; nOv++; } else console.log('override 找不到對應：', file);
}
console.log('人工提示詞', nOv, '筆');
const csv = '\uFEFF' + rows.map(r => r.map(v => /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v).join(',')).join('\r\n');
fs.mkdirSync(path.join(root, 'docs/art'), { recursive: true });
// 檔案正被 Excel 開著（Windows 會鎖住）時，改存成「（新）」檔，不要整個失敗
const save = (name, text) => { const f = path.join(root, 'docs/art', name); try { fs.writeFileSync(f, text); } catch (e) { if (e.code !== 'EBUSY' && e.code !== 'EPERM') throw e; const alt = f.replace(/\.csv$/, '（新）.csv'); fs.writeFileSync(alt, text); console.log(`⚠️ ${name} 正被其他程式開著，這次存成 ${path.basename(alt)}`); } };
save('assets.csv', csv);
// 精簡版（kind,filename,name,prompt），方便直接貼或批次生成
const KEN = { 背景: 'bg', 角色: 'char', 介面元件: 'ui', 圖示: 'icon', 遊戲卡: 'game', 物件: 'item' };
const q = v => /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v;
save('prompts.csv', '\uFEFF' + [['kind', 'filename', 'name', 'prompt']].concat(rows.slice(1).map(r => [KEN[r[2]], r[3].replace(/^assets\//, ''), r[7].slice(0, 40), r[8]])).map(r => r.map(q).join(',')).join('\r\n'));
const by = {}; rows.slice(1).forEach(r => { const k = `第${r[1]}階段 ${r[2]}`; by[k] = (by[k] || 0) + 1; });
console.log('assets.csv', rows.length - 1, '列'); console.log(by);
fs.writeFileSync(path.join(root, 'docs/art/characters.json'), JSON.stringify({ style: STYLE, negative: NEG, kinds: KIND, characters: CHAR }, null, 2));
