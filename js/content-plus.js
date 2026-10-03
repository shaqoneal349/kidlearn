'use strict';
// 補充內容：情境對話（手寫＋模板）、數字廚房、圖表、應用類知識點解鎖、自動解題提示
(() => {
  const K = KL, R = K.rand, P = K.pick, M = K.mcqKinds;
  const enw = w => `<span class="enw sm">${w}</span>`;

  // ---------- 英文情境對話 ----------
  const DG = (g, sub, id, name, s, gen) => K.add('en', g, sub, id, name, 'dialog', s.split('\n').map(x => x.trim()).filter(Boolean).map(x => { const [q, zh, a, o] = x.split('|'); return { q, zh, a, o: o.split(';') }; }), { gen, demo: '先聽懂對方問什麼，再選一句最適合的回答。' });
  const COLOR = { red: '紅色', blue: '藍色', green: '綠色', yellow: '黃色', black: '黑色', white: '白色', pink: '粉紅色', purple: '紫色' }, THING = { book: '書', pen: '筆', bag: '書包', ball: '球', kite: '風箏', hat: '帽子', cup: '杯子', car: '車子' }, ANIM = { cat: '貓', dog: '狗', bird: '鳥', rabbit: '兔子', fish: '魚', pig: '豬' }, FOOD = { apples: '蘋果', bananas: '香蕉', cookies: '餅乾', pizza: '披薩', noodles: '麵', milk: '牛奶' }, DAY = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], ZD = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'], NUM = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'], PLACE = { park: '公園', zoo: '動物園', library: '圖書館', beach: '海灘', museum: '博物館' };
  const PK = o => P(Object.keys(o)), cap = s => s[0].toUpperCase() + s.slice(1);
  const TG = {
    1: () => { const c = PK(COLOR), th = PK(THING); return { q: `What color is the ${th}?`, zh: `${THING[th]}是什麼顏色？`, a: `It is ${c}.`, o: K.sample(Object.keys(COLOR).filter(x => x !== c), 2).map(x => `It is ${x}.`) }; },
    2: () => { const t = R(0, 2), fo = PK(FOOD), th = PK(THING), n = R(2, 9); return [{ q: `Do you like ${fo}?`, zh: `你喜歡${FOOD[fo]}嗎？`, a: P(['Yes, I do.', "No, I don't."]), o: ['Yes, it is.', 'I am seven.'] }, { q: `What is this?`, zh: '這是什麼？', a: `It is a ${th}.`, o: K.sample(Object.keys(THING).filter(x => x !== th), 2).map(x => `It is a ${x}.`), hintZh: THING[th] }, { q: `How many ${th}s do you have?`, zh: `你有幾個${THING[th]}？`, a: `I have ${NUM[n]}.`, o: [`I have ${NUM[n + 1 > 10 ? 2 : n + 1]}.`, 'I am fine.'] }][t]; },
    3: () => { const t = R(0, 2), a = PK(ANIM), n = R(2, 9), v = P(['swim', 'sing', 'dance', 'cook', 'draw']); return [{ q: `Can you ${v}?`, zh: `你會${{ swim: '游泳', sing: '唱歌', dance: '跳舞', cook: '煮飯', draw: '畫畫' }[v]}嗎？`, a: P(['Yes, I can.', "No, I can't."]), o: ['Yes, I do.', 'It is a bus.'] }, { q: `Where is the ${a}?`, zh: `${ANIM[a]}在哪裡？`, a: `It is ${P(['in', 'on', 'under'])} the box.`, o: ['It is seven.', 'I like it.'] }, { q: `How many ${a}s are there?`, zh: `有幾隻${ANIM[a]}？`, a: `There are ${NUM[n]}.`, o: ['There is a box.', 'They are big.'] }][t]; },
    4: () => { const t = R(0, 2), d = R(0, 6), h = R(1, 12), pl = PK(PLACE); return [{ q: 'What day is today?', zh: '今天星期幾？', a: `It is ${DAY[d]}.`, o: K.sample(DAY.filter((_, i) => i !== d), 2).map(x => `It is ${x}.`) }, { q: 'What time is it?', zh: '現在幾點？', a: `It is ${NUM[h] || 'eleven'} o'clock.`.replace('eleven', h === 11 ? 'eleven' : h === 12 ? 'twelve' : NUM[h]), o: [`It is ${DAY[d]}.`, 'It is in May.'] }, { q: 'Where are you going?', zh: '你要去哪裡？', a: `I am going to the ${pl}.`, o: ['I go by bus.', 'I am ten.'] }][t]; },
    5: () => { const t = R(0, 1), v = P(['reading a book', 'playing basketball', 'cooking dinner', 'drawing a picture', 'watching TV']), [x, y] = K.sample(Object.keys(ANIM), 2); return [{ q: 'What are you doing?', zh: '你在做什麼？', a: `I am ${v}.`, o: ['I like books.', 'I am taller.'] }, { q: `Which is bigger, a ${x} or a ${y}?`, zh: `${ANIM[x]}和${ANIM[y]}哪個比較大？`, a: `A ${['pig', 'dog'].includes(x) && !['pig', 'dog'].includes(y) ? x : y} is bigger.`, o: ['They are animals.', 'I have two.'] }][t]; },
    6: () => { const t = R(0, 1), pl = PK(PLACE), v = P([['went to the beach', 'go to the beach'], ['visited my grandma', 'visit my grandma'], ['played soccer', 'play soccer'], ['read a book', 'reads a book']]); return [{ q: 'What did you do yesterday?', zh: '你昨天做了什麼？', a: `I ${v[0]}.`, o: [`I will ${v[1]}.`, `I ${v[1]} every day.`] }, { q: 'What will you do tomorrow?', zh: '你明天要做什麼？', a: `I will go to the ${pl}.`, o: [`I went to the ${pl}.`, `I go to the ${pl} yesterday.`] }][t]; }
  };
  DG(1, 2, 'en-talk-1', '打招呼', `Hello!|哈囉！|Hi!|Thank you.;Goodbye.
    What's your name?|你叫什麼名字？|My name is Amy.|I am six.;Thank you.
    How are you?|你好嗎？|I am fine, thank you.|My name is Amy.;It is red.
    Good morning!|早安！|Good morning, teacher!|Good night.;Thank you.
    Here you are.|給你。|Thank you.|Hello.;Sit down.
    Goodbye!|再見！|See you!|Good morning.;I am fine.
    Nice to meet you.|很高興認識你。|Nice to meet you, too.|I am seven.;It is a cat.
    Thank you!|謝謝！|You are welcome.|Good night.;I am fine.
    I am sorry.|對不起。|That's OK.|Thank you.;It is blue.
    Good night!|晚安！|Good night, Mom!|Good morning.;Yes, I do.
    How old are you?|你幾歲？|I am six.|I am fine.;It is a dog.
    Are you OK?|你還好嗎？|Yes, I am OK.|It is red.;Thank you.`, TG[1]);
  DG(2, 2, 'en-talk-2', '問東西', `What is this?|這是什麼？|It is a book.|I am fine.;Yes, I do.
    Do you like apples?|你喜歡蘋果嗎？|Yes, I do.|It is a pen.;I am seven.
    What color is it?|它是什麼顏色？|It is blue.|It is a dog.;I like cake.
    How old are you?|你幾歲？|I am seven.|I am fine.;It is sunny.
    How's the weather?|天氣如何？|It is rainy.|It is a ruler.;I am Amy.
    Is this your bag?|這是你的書包嗎？|No, it is not.|I like milk.;It is hot.
    What do you want?|你想要什麼？|I want some juice.|I am eight.;It is big.
    Is it a cat?|牠是貓嗎？|Yes, it is.|Yes, I am.;It is red.
    How many pencils?|幾枝鉛筆？|Three pencils.|It is a pencil.;I like pencils.
    Where is my hat?|我的帽子在哪裡？|It is on the chair.|It is red.;Yes, it is.
    What is your favorite food?|你最喜歡的食物是什麼？|I like pizza.|It is Monday.;I am a girl.
    Are you hungry?|你餓了嗎？|Yes, I am.|Yes, I do.;It is noodles.`, TG[2]);
  DG(3, 2, 'en-talk-3', '能力與喜好', `Can you swim?|你會游泳嗎？|Yes, I can.|Yes, I do.;It is a fish.
    What do you want to be?|你想當什麼？|I want to be a doctor.|I like cats.;It is a bus.
    How do you go to school?|你怎麼上學？|By bus.|At school.;I can run.
    What do you have?|你有什麼？|I have a kite.|I can dance.;It is a taxi.
    Who is she?|她是誰？|She is my sister.|He is my father.;It is a doll.
    What can you do?|你會做什麼？|I can sing.|I like rice.;It is a ship.
    Does he have a dog?|他有狗嗎？|Yes, he does.|Yes, he is.;Yes, I am.
    What is your favorite subject?|你最喜歡什麼科目？|I like math.|I go by bike.;It is a desk.
    Whose book is this?|這是誰的書？|It is Amy's.|It is a book.;She is Amy.
    Can I borrow your pen?|我可以借你的筆嗎？|Sure, here you are.|Yes, I can swim.;It is blue.
    What does your father do?|你爸爸是做什麼的？|He is a cook.|He is tall.;He likes fish.
    Do you have any brothers?|你有兄弟嗎？|Yes, I have one brother.|Yes, I can.;I am a brother.`, TG[3]);
  DG(4, 2, 'en-talk-4', '時間與地點', `What time is it?|現在幾點？|It is eight o'clock.|It is Monday.;It is in May.
    Where is the library?|圖書館在哪裡？|It is next to the park.|It is nine o'clock.;It is on Sunday.
    What day is today?|今天星期幾？|It is Friday.|It is sunny.;It is ten o'clock.
    When is your birthday?|你的生日是什麼時候？|It is in June.|It is under the table.;I am ten.
    Does he like music?|他喜歡音樂嗎？|Yes, he does.|Yes, he is.;Yes, I do.
    Where are you going?|你要去哪裡？|I am going to the zoo.|I go there by bus.;I am ten years old.
    What time do you get up?|你幾點起床？|I get up at six.|I go to bed.;It is Tuesday.
    Is there a bank near here?|這附近有銀行嗎？|Yes, it is across the street.|Yes, I am.;It is nine.
    How do I get to the station?|車站怎麼走？|Go straight and turn right.|It is a big station.;I go by bus.
    What do you do on weekends?|你週末都做什麼？|I play basketball.|It is Saturday.;I am happy.
    Which season do you like?|你喜歡哪個季節？|I like summer.|I like apples.;It is hot.
    Excuse me, where is the restroom?|不好意思，廁所在哪裡？|It is on the second floor.|It is two o'clock.;I am fine.`, TG[4]);
  DG(5, 2, 'en-talk-5', '生活情境', `What are you doing?|你在做什麼？|I am reading a book.|I read a book yesterday.;I like books.
    How do you feel?|你覺得怎麼樣？|I feel tired.|I am eating.;I am taller.
    What is your hobby?|你的嗜好是什麼？|My hobby is fishing.|I am fishing now.;I feel happy.
    Which is bigger, a cat or a cow?|貓和牛哪個比較大？|A cow is bigger.|A cat is bigger.;They are animals.
    May I help you?|需要幫忙嗎？|Yes, I want a sandwich, please.|You are welcome.;I am fine.
    How much is it?|這個多少錢？|It is fifty dollars.|It is five o'clock.;It is very big.
    What is the matter?|怎麼了？|I have a headache.|I am a doctor.;It is Monday.
    Who is taller, you or your brother?|你和你哥哥誰比較高？|My brother is taller.|He is my brother.;We are tall.
    Would you like some tea?|要喝點茶嗎？|Yes, please.|Yes, I am.;I like coffee shops.
    What are they doing in the park?|他們在公園做什麼？|They are flying kites.|They go to the park.;It is a big park.
    Can you help me carry this box?|你可以幫我搬這個箱子嗎？|Sure, no problem.|Yes, I am a box.;It is heavy.
    Why are you so happy?|你為什麼這麼開心？|Because today is my birthday.|Because it is Monday.;I am happy.`, TG[5]);
  DG(6, 2, 'en-talk-6', '過去與未來', `What did you do last weekend?|你上週末做了什麼？|I went to the beach.|I will go to the beach.;I go to the beach.
    What will you do tomorrow?|你明天要做什麼？|I will visit my grandma.|I visited my grandma.;I visit my grandma every day.
    How often do you exercise?|你多久運動一次？|Twice a week.|For two hours.;At the park.
    Were you at home yesterday?|你昨天在家嗎？|Yes, I was.|Yes, I am.;Yes, I did.
    Excuse me, how can I get to the station?|不好意思，車站怎麼走？|Go straight and turn left.|I went there yesterday.;It is a big station.
    Why were you late?|你為什麼遲到？|Because I missed the bus.|I am late now.;Yes, I was.
    Have you ever been to Japan?|你去過日本嗎？|Yes, I went there last year.|Yes, I am Japanese.;Japan is a country.
    What did you have for breakfast?|你早餐吃了什麼？|I had an egg and milk.|I eat breakfast.;I will have lunch.
    How was your trip?|你的旅行怎麼樣？|It was wonderful.|It is tomorrow.;I will go.
    What are you going to do this summer?|你今年夏天打算做什麼？|I am going to learn swimming.|I learned swimming.;Summer is hot.
    Did you finish your homework?|你功課寫完了嗎？|Not yet. I will finish it tonight.|Yes, I am.;I do homework.
    Who won the game?|誰贏了比賽？|Our team won.|We are a team.;The game is fun.`, TG[6]);
  M.dialog = (s, n) => { const it = K.pi(s); return K.mkq({ prompt: enw(it.q), say: it.q, lang: 'en-US', ask: '選一句最適合的回答', item: it, hint: `對方說的是：「${it.zh}」` }, enw(it.a), it.o.map(enw), 3); };

  // 應用類知識點不鎖在高子級：新手也讀得到本年級的文章、對話、句子
  for (const s of K.skills) if (['read', 'zread', 'dialog', 'sentence', 'zsent', 'shop', 'cmd'].includes(s.kind) && s.sub > 1) s.sub = 1;

  // ---------- 數字廚房：披薩與量杯 ----------
  K.pizza = (d, on) => {
    let s = ''; const c = 50, r = 46;
    for (let i = 0; i < d; i++) {
      const a0 = i / d * 2 * Math.PI - Math.PI / 2, a1 = (i + 1) / d * 2 * Math.PI - Math.PI / 2;
      s += `<path data-i="${i}" class="wd${on && on(i) ? ' on' : ''}" d="M${c} ${c} L${(c + r * Math.cos(a0)).toFixed(1)} ${(c + r * Math.sin(a0)).toFixed(1)} A${r} ${r} 0 0 1 ${(c + r * Math.cos(a1)).toFixed(1)} ${(c + r * Math.sin(a1)).toFixed(1)} Z"/>`;
    }
    return `<svg class="pizza" viewBox="0 0 100 100">${s}</svg>`;
  };
  M.fracp = (s, n) => {
    const d = P([2, 3, 4, 5, 6, 8]), k = R(1, d - 1);
    return K.mkq({ prompt: K.pizza(d, i => i < k), ask: '塗色的部分是幾分之幾？', say: '塗色的部分是幾分之幾？', item: { ans: k }, hint: `披薩平分成 ${d} 份，塗色的有 ${k} 份。` }, K.frH(k, d), [K.frH(d - k, d), K.frH(k, d + 1), K.frH(d, k), K.frH(k + 1, d + 1)], n);
  };

  // ---------- 長條圖 ----------
  const FRUIT = [['🍎', '蘋果'], ['🍌', '香蕉'], ['🍇', '葡萄'], ['🍊', '橘子'], ['🍓', '草莓'], ['🍉', '西瓜']];
  M.chart = (s, n) => {
    const u = s.data.unit, items = K.sample(FRUIT, 4), vals = []; while (vals.length < 4) { const v = R(1, 8); if (!vals.includes(v)) vals.push(v); }
    let g = ''; for (let y = 0; y <= 8; y += 2) g += `<line x1="16" x2="118" y1="${92 - y * 10}" y2="${92 - y * 10}" stroke="#cbd5e1" stroke-width=".6"/><text x="13" y="${95 - y * 10}" font-size="6" text-anchor="end">${y * u}</text>`;
    vals.forEach((v, i) => g += `<rect x="${24 + i * 24}" y="${92 - v * 10}" width="14" height="${v * 10}" fill="${['#ef4444', '#f59e0b', '#8b5cf6', '#22c55e'][i]}"/><text x="${31 + i * 24}" y="104" font-size="10" text-anchor="middle">${items[i][0]}</text>`);
    const fig = `<svg class="chart" viewBox="0 0 122 108">${g}</svg>`, t = R(0, 3), e = x => `<span class="em">${x}</span>`;
    if (t === 0) { const big = Math.random() < .5, i = vals.indexOf(big ? Math.max(...vals) : Math.min(...vals)), tx = `哪一種水果賣得最${big ? '多' : '少'}？`; return K.mkq({ prompt: fig, ask: tx, say: tx, hint: `找最${big ? '高' : '矮'}的長條。` }, e(items[i][0]), items.filter((_, j) => j !== i).map(x => e(x[0])), n); }
    const [i, j] = K.sample([0, 1, 2, 3], 2);
    if (t === 1) { const a = Math.max(vals[i], vals[j]), b = Math.min(vals[i], vals[j]), hi = vals[i] > vals[j] ? i : j, lo = hi === i ? j : i, tx = `${items[hi][1]}比${items[lo][1]}多賣了幾個？`; return K.mkq({ prompt: fig, ask: tx, item: { ans: (a - b) * u }, hint: `${items[hi][1]} ${a * u} 個，${items[lo][1]} ${b * u} 個，相減看看。` }, (a - b) * u, K.numD((a - b) * u).concat([a * u, b * u]), n); }
    if (t === 2) { const tx = `${items[i][1]}和${items[j][1]}一共賣了幾個？`, a = (vals[i] + vals[j]) * u; return K.mkq({ prompt: fig, ask: tx, item: { ans: a }, hint: `${items[i][1]} ${vals[i] * u} 個，${items[j][1]} ${vals[j] * u} 個，加起來。` }, a, K.numD(a).concat([Math.abs(vals[i] - vals[j]) * u]), n); }
    const tx = `${items[i][1]}賣了幾個？`; return K.mkq({ prompt: fig, ask: tx, item: { ans: vals[i] * u }, hint: `從${items[i][1]}的長條頂端，往左對到數字。` }, vals[i] * u, K.numD(vals[i] * u).concat(vals.map(v => v * u)), n);
  };

  // ---------- 錯誤即教學：依題目自動產生解題提示 ----------
  const arith = M.arith, dots = K.dots;
  K.arithHint = text => {
    let m;
    if ((m = text.match(/^(\d+) \+ □ = 10$/))) return `從 ${m[1]} 往上數到 10，要再數幾個？<br>${dots(+m[1])}`;
    if ((m = text.match(/^(\d+) \+ (\d+)$/))) {
      const a = +m[1], b = +m[2], x = Math.max(a, b), y = Math.min(a, b);
      if (a < 10 && b < 10 && a + b > 10) return `先湊成 10：${x} 還差 ${10 - x}，把 ${y} 拆成 ${10 - x} 和 ${y - (10 - x)}。10 再加 ${y - (10 - x)} 是多少？`;
      if (a + b <= 10) return `合起來數數看：${dots(a)} ＋ ${dots(b)}`;
      return `先算個位 ${a % 10} + ${b % 10}，滿十要進一；再算十位。`;
    }
    if ((m = text.match(/^(\d+) − (\d+)$/))) {
      const a = +m[1], b = +m[2];
      if (a <= 10) return `有 ${a} 個，拿走 ${b} 個：${dots(a)}`;
      if (a < 20 && b < 10 && a % 10 < b) return `先減 ${a - 10} 變成 10，還要再減 ${b - (a - 10)}。10 減 ${b - (a - 10)} 是多少？`;
      return `個位 ${a % 10} − ${b % 10}，不夠減就向十位借 1 當 10。`;
    }
    if ((m = text.match(/^(\d+) × (\d+)$/))) { const a = +m[1], b = +m[2]; return b <= 9 && a <= 12 ? `${a} × ${b} 就是 ${b} 個 ${a} 相加：${Array(b).fill(a).join(' + ')}` : `把 ${a} 拆成 ${a - a % 10} 和 ${a % 10}，分別乘以 ${b} 再加起來。`; }
    if ((m = text.match(/^(\d+) ÷ (\d+)$/))) return `用乘法倒過來想：${m[2]} × ？ 最接近 ${m[1]}`;
    return '';
  };
  M.arith = (s, n, mode) => { const q = arith(s, n, mode); const hh = q.item.hint || K.arithHint(q.item.text) || s.demo; if (hh) q.hint = hh; q.why = q.item.why || ''; return q; };
  const count = M.count; M.count = (s, n) => { const q = count(s, n); q.hint = '用手指一個一個點著數。一排有 10 個，紅色 5 個、藍色 5 個。'; return q; };
})();
