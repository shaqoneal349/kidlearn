'use strict';
// v2 融合內容：找證據的閱讀、情境對話、句子修理、數字廚房、圖表判讀，以及「錯誤即教學」的提示
(() => {
  const K = KL, R = K.rand, P = K.pick, M = K.mcqKinds;
  const enw = w => `<span class="enw sm">${w}</span>`, zs = t => `<span class="zhs">${t}</span>`, zw = t => `<span class="zhc">${t}</span>`;

  // ---------- 英文閱讀：補上低年級短文與「證據句」----------
  // [短文, 問題, 答案, 干擾項, 證據句索引]
  const RD = a => a.map(([t, q, ans, o, ev]) => ({ t, q, a: ans, o, ev: [].concat(ev) }));
  K.add('en', 2, 3, 'en-read-2', '圖文小故事', 'read', RD([
    ['I have a cat. It is white. It likes milk.', 'What color is the cat?', 'White', ['Black', 'Red'], 1],
    ['This is my bag. It is blue. I have two books in it.', 'How many books are in the bag?', 'Two', ['One', 'Three'], 2],
    ['It is sunny. I like sunny days. I fly a kite.', 'What do I fly?', 'A kite', ['A ball', 'A bike'], 2],
    ['Ben has a red ball. Amy has a robot. They play.', 'Who has a robot?', 'Amy', ['Ben', 'Tom'], 1],
    ['I see a pig. It is big. It likes apples.', 'What does the pig like?', 'Apples', ['Milk', 'Rice'], 2]
  ]), { demo: '答案就藏在故事裡。再讀一次，找到說出答案的那一句。' });
  K.add('en', 3, 3, 'en-read-3', '短篇故事', 'read', RD([
    ['Kate can swim. She can not ride a bike. Her brother can ride a bike.', 'Who can ride a bike?', "Kate's brother", ['Kate', 'Nobody'], 2],
    ['My father is a doctor. He goes to work by bus. He likes his job.', 'How does he go to work?', 'By bus', ['By car', 'By train'], 1],
    ['We have three chairs and one big table. The cat sleeps on a chair.', 'Where does the cat sleep?', 'On a chair', ['On the table', 'On the bed'], 1],
    ['Tim likes to draw. He draws a ship and a whale. The whale is blue.', 'What color is the whale?', 'Blue', ['White', 'Green'], 2],
    ['I want to be a cook. I can cook eggs. My mother likes my eggs.', 'What can I cook?', 'Eggs', ['Fish', 'Cake'], 1]
  ]), { demo: '答案就藏在故事裡。再讀一次，找到說出答案的那一句。' });
  const EV = { 'en-read-4': [2, 1, 1, 1, 1, 1], 'en-read-5': [1, 2, 0, [1, 3], 2], 'en-read-6': [1, 2, 1, 3, 1] };
  for (const id in EV) K.skill[id].data.forEach((it, i) => it.ev = [].concat(EV[id][i]));

  // ---------- 英文情境對話 ----------
  const DG = (g, sub, id, name, s) => K.add('en', g, sub, id, name, 'dialog', s.split('\n').map(x => x.trim()).filter(Boolean).map(x => { const [q, zh, a, o] = x.split('|'); return { q, zh, a, o: o.split(';') }; }), { demo: '先聽懂對方問什麼，再選一句最適合的回答。' });
  DG(1, 3, 'en-talk-1', '打招呼', `Hello!|哈囉！|Hello!|Thank you.;Goodbye.
    What's your name?|你叫什麼名字？|My name is Amy.|I am six.;Thank you.
    How are you?|你好嗎？|I am fine, thank you.|My name is Amy.;It is red.
    Good morning!|早安！|Good morning!|Good night.;Thank you.
    Here you are.|給你。|Thank you.|Hello.;Sit down.
    Goodbye!|再見！|See you!|Good morning.;I am fine.`);
  DG(2, 2, 'en-talk-2', '問東西', `What is this?|這是什麼？|It is a book.|I am fine.;Yes, I do.
    Do you like apples?|你喜歡蘋果嗎？|Yes, I do.|It is a pen.;I am seven.
    What color is it?|它是什麼顏色？|It is blue.|It is a dog.;I like cake.
    How old are you?|你幾歲？|I am seven.|I am fine.;It is sunny.
    How's the weather?|天氣如何？|It is rainy.|It is a ruler.;I am Amy.
    Is this your bag?|這是你的書包嗎？|No, it is not.|I like milk.;It is hot.`);
  DG(3, 2, 'en-talk-3', '能力與喜好', `Can you swim?|你會游泳嗎？|Yes, I can.|Yes, I do.;It is a fish.
    What do you want to be?|你想當什麼？|I want to be a doctor.|I like cats.;It is a bus.
    How do you go to school?|你怎麼上學？|By bus.|At school.;I can run.
    What do you have?|你有什麼？|I have a kite.|I can dance.;It is a taxi.
    Who is she?|她是誰？|She is my sister.|He is my father.;It is a doll.
    What can you do?|你會做什麼？|I can sing.|I like rice.;It is a ship.`);
  DG(4, 3, 'en-talk-4', '時間與地點', `What time is it?|現在幾點？|It is eight o'clock.|It is Monday.;It is in May.
    Where is the library?|圖書館在哪裡？|It is next to the park.|It is nine o'clock.;It is on Sunday.
    What day is today?|今天星期幾？|It is Friday.|It is sunny.;It is ten o'clock.
    When is your birthday?|你的生日是什麼時候？|It is in June.|It is under the table.;I am ten.
    Does he like music?|他喜歡音樂嗎？|Yes, he does.|Yes, he is.;Yes, I do.
    Where are you going?|你要去哪裡？|I am going to the zoo.|I go there by bus.;I am ten years old.`);
  DG(5, 2, 'en-talk-5', '生活情境', `What are you doing?|你在做什麼？|I am reading a book.|I read a book yesterday.;I like books.
    How do you feel?|你覺得怎麼樣？|I feel tired.|I am eating.;I am taller.
    What is your hobby?|你的嗜好是什麼？|My hobby is fishing.|I am fishing now.;I feel happy.
    Which is bigger, a cat or a cow?|貓和牛哪個比較大？|A cow is bigger.|A cat is bigger.;They are animals.
    May I help you?|需要幫忙嗎？|Yes, I want a sandwich, please.|You are welcome.;I am fine.
    How much is it?|這個多少錢？|It is fifty dollars.|It is five o'clock.;It is very big.`);
  DG(6, 3, 'en-talk-6', '過去與未來', `What did you do last weekend?|你上週末做了什麼？|I went to the beach.|I will go to the beach.;I go to the beach.
    What will you do tomorrow?|你明天要做什麼？|I will visit my grandma.|I visited my grandma.;I visit my grandma every day.
    How often do you exercise?|你多久運動一次？|Twice a week.|For two hours.;At the park.
    Were you at home yesterday?|你昨天在家嗎？|Yes, I was.|Yes, I am.;Yes, I did.
    Excuse me, how can I get to the station?|不好意思，車站怎麼走？|Go straight and turn left.|I went there yesterday.;It is a big station.
    Why were you late?|你為什麼遲到？|Because I missed the bus.|I am late now.;Yes, I was.`);
  M.dialog = (s, n) => { const it = P(s.data); return K.mkq({ prompt: enw(it.q), say: it.q, lang: 'en-US', ask: '選一句最適合的回答', item: it, hint: `對方說的是：「${it.zh}」` }, enw(it.a), it.o.map(enw), 3); };

  // ---------- 國語：句子修理 ----------
  const ZS = (g, sub, id, name, s) => K.add('zh', g, sub, id, name, 'zsent', s.split('\n').map(x => x.trim()).filter(Boolean).map(x => x.split('|')), { demo: '先找出「誰」，再找「做什麼」。有逗號的那一段通常放在前面。', tip: '把句子寫在紙條上剪開，和孩子一起排回去。' });
  ZS(1, 3, 'zh-sent-1', '排出短句', `我|喜歡|吃|蘋果。
    小鳥|在天上|飛。
    媽媽|帶我|去公園。
    弟弟|在房間|看書。
    今天|天氣|很好。
    我的書包|是|紅色的。
    小狗|跑得|很快。
    我們|一起|去上學。`);
  ZS(2, 2, 'zh-sent-2', '排出長一點的句子', `妹妹|在公園裡|開心地|放風箏。
    下課的時候，|我和同學|一起|跳繩。
    老師|在黑板上|寫了|三個字。
    春天來了，|花園裡的花|都開了。
    我把|房間|打掃得|很乾淨。
    爸爸|每天早上|都會|去跑步。
    這本故事書|真是|太好看了！`);
  ZS(3, 2, 'zh-sent-3', '有連接詞的句子', `因為下雨，|所以|我們|不能去操場。
    雖然很累，|但是|他還是|把功課寫完了。
    如果明天放假，|我想|和家人|去爬山。
    圖書館裡|有|各式各樣的|書。
    弟弟一邊唱歌，|一邊|收拾|玩具。
    我先|洗手，|然後|才吃點心。`);
  ZS(4, 2, 'zh-sent-4', '複句', `只要|每天練習，|你的鋼琴|就會|越彈越好。
    他不但|功課好，|而且|很喜歡|幫助同學。
    經過|大家的努力，|教室|終於|變得乾乾淨淨。
    與其|在家發呆，|不如|出門|運動。
    無論|天氣多冷，|爺爺|都堅持|去公園散步。`);
  ZS(5, 2, 'zh-sent-5', '關聯詞與語意', `這場比賽|雖然輸了，|但是|我們|學到了團隊合作。
    為了|保護環境，|我們|應該|減少使用塑膠袋。
    即使|遇到困難，|也|不要|輕易放棄。
    夕陽|把|整片天空|染成了|金黃色。
    與其說|他是天才，|不如說|他比別人|更努力。`);
  ZS(6, 2, 'zh-sent-6', '長句組織', `閱讀|不只能增加知識，|還能|培養|獨立思考的能力。
    之所以|能夠成功，|是因為|他從不|害怕失敗。
    科技|帶來便利的同時，|也|改變了|人與人相處的方式。
    只有|親身經歷過，|才能|真正體會|其中的辛苦。
    儘管|前方的路很長，|他|仍然|一步一步往前走。`);
  M.zsent = (s, n) => {
    const it = P(s.data), right = it.join(''), bad = new Set();
    for (let i = 0; i < 12 && bad.size < 2; i++) { const x = K.shuffle(it).join(''); if (x !== right) bad.add(x); }
    return K.mkq({ prompt: '', ask: '哪一句是通順的？', item: it }, zs(right), [...bad].map(zs), 3);
  };
  K.add('zh', 2, 3, 'zh-punct', '標點符號', 'mc', '你叫什麼名字＿|？|。,！ 我有一枝鉛筆＿|。|？,、 這是誰的書包＿|？|。,， 蘋果＿香蕉和西瓜都是水果。|、|。,？ 下雨了＿我們快回家吧！|，|？,、 你要喝水還是果汁＿|？|。,、 我喜歡跳舞＿唱歌和畫畫。|、|？,！ 明天會下雨嗎＿|？|。,、'.split(' ').map(t => { const [q, a, o] = t.split('|'); return { q, a, o: o.split(',') }; }), { ask: '空格裡要放哪一個標點符號？', demo: '問問題用問號，說完一句話用句號，句子中間停一下用逗號，並列的東西用頓號。' });

  // ---------- 國語：閱讀探險（要指出證據）----------
  const ZR = (g, id, name, a) => K.add('zh', g, 3, id, name, 'zread', a.map(([t, q, ans, o, ev]) => ({ t, q, a: ans, o, ev: [].concat(ev) })), { demo: '答案的線索就在文章裡。回去找到那一句，再讀一次。', tip: '讀完故事後問孩子「你怎麼知道的？是哪一句告訴你的？」' });
  ZR(1, 'zh-read-1', '短文：找答案', [
    ['小貓喜歡喝牛奶。牠每天早上喝一杯。喝完就去晒太陽。', '小貓喜歡喝什麼？', '牛奶', ['果汁', '汽水'], 0],
    ['下雨了。小明撐著黃色的雨傘。他穿著紅色的雨鞋。', '雨傘是什麼顏色？', '黃色', ['紅色', '藍色'], 1],
    ['公園裡有三隻小鳥。牠們站在樹上唱歌。小狗在樹下睡覺。', '誰在樹下睡覺？', '小狗', ['小鳥', '小貓'], 2],
    ['媽媽買了蘋果和香蕉。我最愛吃香蕉。弟弟最愛吃蘋果。', '弟弟最愛吃什麼？', '蘋果', ['香蕉', '西瓜'], 2]
  ]);
  ZR(2, 'zh-read-2', '短文：事情的順序', [
    ['星期天，爸爸帶我去動物園。我們先看了大象，又看了長頸鹿。最後，我們在門口買了冰淇淋。', '我們最後做了什麼？', '買冰淇淋', ['看大象', '看長頸鹿'], 2],
    ['小華的鉛筆不見了。他找了書包，又找了抽屜，都沒有找到。原來，鉛筆掉在椅子下面。', '鉛筆在哪裡？', '椅子下面', ['書包裡', '抽屜裡'], 2],
    ['春天到了，樹上長出綠色的新葉。小草從土裡鑽出來。蝴蝶在花叢中飛來飛去。', '什麼從土裡鑽出來？', '小草', ['蝴蝶', '新葉'], 1],
    ['奶奶生日那天，我畫了一張卡片送給她。奶奶看了笑得很開心。她把卡片貼在冰箱上。', '奶奶把卡片放在哪裡？', '貼在冰箱上', ['放在書包裡', '掛在門上'], 2]
  ]);
  ZR(3, 'zh-read-3', '段落理解', [
    ['小美每天放學後都會先寫功課。寫完功課，她才去找朋友玩。媽媽常常稱讚她很會安排時間。', '媽媽為什麼稱讚小美？', '因為她很會安排時間', ['因為她朋友很多', '因為她跑得很快'], 2],
    ['螞蟻雖然很小，力氣卻很大。牠可以搬起比自己重好幾倍的食物。遇到太重的東西，螞蟻還會找同伴一起搬。', '遇到太重的東西，螞蟻會怎麼做？', '找同伴一起搬', ['自己慢慢搬', '放棄不搬'], 2],
    ['颱風要來了，天空變得又黑又暗。爸爸把陽台的花盆搬進屋裡。媽媽準備了手電筒和飲用水。', '爸爸為什麼把花盆搬進屋裡？', '因為颱風要來了', ['因為花盆太髒', '因為要幫花澆水'], 0],
    ['阿明第一次學游泳時很害怕。教練要他先練習把臉放進水裡。一個月後，他已經可以游到泳池對面了。', '教練先讓阿明練習什麼？', '把臉放進水裡', ['游到泳池對面', '從池邊跳水'], 1]
  ]);
  ZR(4, 'zh-read-4', '上下文推論', [
    ['石虎是臺灣珍貴的野生動物，外型像貓，但耳朵後面有白色斑點。牠們主要住在淺山地區。因為道路開發，石虎常在過馬路時被車撞到。現在，有些地方設置了動物通道來保護牠們。', '人們設置動物通道是為了什麼？', '讓石虎安全地過馬路', ['讓石虎跑得更快', '方便遊客參觀'], [2, 3]],
    ['小安參加說故事比賽前非常緊張。她每天對著鏡子練習，還請家人當觀眾。比賽那天，她雖然沒有得到第一名，卻覺得自己進步很多。', '這段話主要想告訴我們什麼？', '努力練習會讓人進步', ['比賽一定要得第一名', '緊張的人不適合比賽'], 2],
    ['古時候沒有時鐘，人們看太陽的位置來判斷時間。後來有人發明了日晷，利用影子的長短和方向來計時。可是遇到陰天或晚上，日晷就派不上用場了。', '日晷在什麼時候不能使用？', '陰天或晚上', ['中午', '夏天'], 2],
    ['妹妹把種子埋進土裡，每天澆水。過了一個星期，土裡什麼也沒有，她有點失望。又過了幾天，一株小小的綠芽終於冒了出來。', '妹妹為什麼失望？', '因為種子一直沒有發芽', ['因為她忘記澆水', '因為土不夠多'], 1]
  ]);
  ZR(5, 'zh-read-5', '篇章理解', [
    ['蜜蜂發現花蜜後，會回到蜂巢跳舞給同伴看。如果花蜜離得近，牠就跳圓圈舞；如果離得遠，牠就跳八字形的搖擺舞。同伴看了舞蹈，就知道該往哪裡飛。', '蜜蜂跳搖擺舞代表什麼？', '花蜜離蜂巢比較遠', ['花蜜離蜂巢很近', '附近有危險'], 1],
    ['爺爺常說：「吃虧就是占便宜。」小時候我不懂，總覺得讓別人就是自己損失。直到有一次我把座位讓給老婆婆，她感激的笑容讓我開心了一整天，我才明白爺爺的意思。', '「我」後來明白了什麼？', '幫助別人，自己也會得到快樂', ['讓座是一件很累的事', '爺爺喜歡占別人便宜'], 2],
    ['塑膠吸管很輕，回收的價值又低，常常被直接丟棄。它們流進海裡以後，可能被海龜或海鳥誤食。因此，許多店家改用紙吸管，或鼓勵客人自備環保吸管。', '店家為什麼改用紙吸管？', '為了減少塑膠對海洋生物的傷害', ['因為紙吸管比較便宜', '因為客人不喜歡塑膠'], [1, 2]],
    ['小說家寫作之前，往往會花很長的時間觀察生活。街上行人的表情、市場裡的叫賣聲，都可能成為故事的材料。所以有人說，好作品是從生活裡長出來的。', '這段文字的主旨是什麼？', '好的作品來自對生活的觀察', ['寫小說要花很多錢', '市場是最吵的地方'], 2]
  ]);
  ZR(6, 'zh-read-6', '推論與主旨', [
    ['沙漠裡的仙人掌為了減少水分蒸發，把葉子演化成細細的刺。它的莖又粗又厚，可以儲存大量的水。一場難得的大雨過後，仙人掌能吸收足夠的水，撐過好幾個月的乾旱。', '仙人掌的葉子變成刺，主要是為了什麼？', '減少水分蒸發', ['保護自己不被吃掉', '吸收更多陽光'], 0],
    ['有人認為，失敗是成功的反面。其實，失敗更像是通往成功的階梯。每一次跌倒，都讓我們更清楚哪一條路走不通，也離正確的方向更近一步。', '作者對失敗的看法是什麼？', '失敗能幫助我們接近成功', ['失敗就是成功的反面', '失敗的人應該放棄'], [1, 2]],
    ['臺灣的夜市起源於廟口。早期人們到廟裡拜拜，攤販便聚集在廟前做生意。隨著時間過去，攤位越來越多，漸漸形成今天熱鬧的夜市文化。', '最早的攤販為什麼聚集在廟前？', '因為到廟裡拜拜的人很多', ['因為廟前比較涼快', '因為政府規定'], 1],
    ['網路讓我們能在幾秒內查到資料，但是查到的內容不一定正確。面對各種訊息，我們應該先查證來源，再判斷是否可信。學會分辨真假，比學會搜尋更重要。', '根據本文，面對網路訊息應該怎麼做？', '先查證來源再判斷', ['看到就立刻分享', '完全不要使用網路'], 1]
  ]);
  M.zread = (s, n) => { const it = P(s.data); return K.mkq({ prompt: `<div class="passage zhp">${it.t}</div><div class="rq zhp">${it.q}</div>`, ask: '讀一讀，回答問題', say: s.g <= 2 ? it.t + it.q : '', item: it }, zs(it.a), it.o.map(zs), 3); };
  K.sentences = (t, en) => (t.match(en ? /[^.!?]+[.!?]+["”]?\s*/g : /[^。！？]+[。！？]+[」』]?/g) || [t]).map(x => x.trim());

  // ---------- 數學：數字廚房（具體物 → 圖 → 算式）----------
  const kit = { 'ma-count20': 'make', 'ma-make10': 'ten', 'ma-times-easy': 'groups', 'ma-times': 'groups', 'ma-share': 'share', 'ma-div': 'share', 'ma-percent': 'pct', 'ma-ratio': 'ratio' };
  for (const id in kit) K.skill[id].kit = kit[id];
  K.pizza = (d, on) => {
    let s = ''; const c = 50, r = 46;
    for (let i = 0; i < d; i++) {
      const a0 = i / d * 2 * Math.PI - Math.PI / 2, a1 = (i + 1) / d * 2 * Math.PI - Math.PI / 2;
      s += `<path data-i="${i}" class="wd${on && on(i) ? ' on' : ''}" d="M${c} ${c} L${(c + r * Math.cos(a0)).toFixed(1)} ${(c + r * Math.sin(a0)).toFixed(1)} A${r} ${r} 0 0 1 ${(c + r * Math.cos(a1)).toFixed(1)} ${(c + r * Math.sin(a1)).toFixed(1)} Z"/>`;
    }
    return `<svg class="pizza" viewBox="0 0 100 100">${s}</svg>`;
  };
  K.add('ma', 3, 1, 'ma-frac-part', '幾分之幾', 'fracp', null, { kit: 'frac', demo: '分母是「平分成幾份」，分子是「拿了其中幾份」。', tip: '切蛋糕、分披薩時說「這是四分之三」。' });
  M.fracp = (s, n) => {
    const d = P([2, 3, 4, 5, 6, 8]), k = R(1, d - 1);
    return K.mkq({ prompt: K.pizza(d, i => i < k), ask: '塗色的部分是幾分之幾？', say: '塗色的部分是幾分之幾？', item: { ans: k }, hint: `披薩平分成 ${d} 份，塗色的有 ${k} 份。` }, K.frH(k, d), [K.frH(d - k, d), K.frH(k, d + 1), K.frH(d, k), K.frH(k + 1, d + 1)], n);
  };

  // ---------- 數學：圖表判讀（數學偵探社）----------
  const FRUIT = [['🍎', '蘋果'], ['🍌', '香蕉'], ['🍇', '葡萄'], ['🍊', '橘子'], ['🍓', '草莓']];
  K.add('ma', 3, 3, 'ma-chart', '長條圖', 'chart', { unit: 1 }, { demo: '長條越高，數量越多。對齊左邊的數字，就知道是多少。' });
  K.add('ma', 4, 3, 'ma-chart-2', '長條圖（一格代表多個）', 'chart', { unit: 5 }, { prereq: ['ma-chart'], demo: '先看清楚一格代表多少，再算出每一條的數量。' });
  M.chart = (s, n) => {
    const u = s.data.unit, items = K.sample(FRUIT, 4), vals = []; while (vals.length < 4) { const v = R(1, 8); if (!vals.includes(v)) vals.push(v); }
    let g = ''; for (let y = 0; y <= 8; y += 2) g += `<line x1="16" x2="118" y1="${92 - y * 10}" y2="${92 - y * 10}" stroke="#cbd5e1" stroke-width=".6"/><text x="13" y="${95 - y * 10}" font-size="6" text-anchor="end">${y * u}</text>`;
    vals.forEach((v, i) => g += `<rect x="${24 + i * 24}" y="${92 - v * 10}" width="14" height="${v * 10}" fill="${['#ef4444', '#f59e0b', '#8b5cf6', '#22c55e'][i]}"/><text x="${31 + i * 24}" y="104" font-size="10" text-anchor="middle">${items[i][0]}</text>`);
    const fig = `<svg class="chart" viewBox="0 0 122 108">${g}</svg>`, t = R(0, 3), e = x => `<span class="em">${x}</span>`;
    if (t === 0) { const big = Math.random() < .5, i = vals.indexOf(big ? Math.max(...vals) : Math.min(...vals)), tx = `哪一種水果賣得最${big ? '多' : '少'}？`; return K.mkq({ prompt: fig, ask: tx, say: tx }, e(items[i][0]), items.filter((_, j) => j !== i).map(x => e(x[0])), n); }
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
  M.arith = (s, n, mode) => { const q = arith(s, n, mode); const hh = q.item.hint || K.arithHint(q.item.text); if (hh) q.hint = hh; return q; };
  const vocab = M.vocab; M.vocab = (s, n, mode) => { const q = vocab(s, n, mode); if (q.say) q.hint = `它的中文意思是「${q.item.zh}」`; return q; };
  const phon = M.phon; M.phon = (s, n) => { const q = phon(s, n); q.hint = `一個一個聲音慢慢聽：${[...q.item.w].join(' - ')}`; return q; };
  const read = M.read; M.read = (s, n) => { const q = read(s, n); q.hint = '回到短文，找出說到這件事的那一句。'; return q; };
  const count = M.count; M.count = (s, n) => { const q = count(s, n); q.hint = '用手指一個一個點著數。一排有 10 個，紅色 5 個、藍色 5 個。'; return q; };
  const comp = M.comp; M.comp = (s, n) => { const q = comp(s, n); q.hint = `這個字在「${q.item.w}」裡出現過。`; return q; };
})();
