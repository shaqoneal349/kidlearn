'use strict';
// 英文內容包：知識點 + 題目資料 + 選擇題產生器
(() => {
  const K = KL;
  const W = s => s.split(',').map(x => { const [w, zh, e] = x.split('|'); return { w, zh, e: e || '' }; });
  const em = K.em = it => it.e[0] === '#' ? `<i class="sw" style="background:${it.e}"></i>` : it.e;
  const face = K.face = it => it.e ? `<span class="em">${em(it)}</span>` : `<span class="zhw">${it.zh}</span>`;
  const enw = w => `<span class="enw">${w}</span>`;
  const T = { tip: '' };

  // ---------- G1 ----------
  K.add('en', 1, 1, 'en-abc-1', '字母 A–M', 'letter', 'ABCDEFGHIJKLM', { demo: '每個字母都有大寫和小寫。聽聽看它的名字，再找出來！', tip: '一起唱字母歌，邊唱邊指字母卡。' });
  K.add('en', 1, 1, 'en-abc-2', '字母 N–Z', 'letter', 'NOPQRSTUVWXYZ', { demo: '每個字母都有大寫和小寫。聽聽看它的名字，再找出來！', tip: '在招牌、書本封面上找找看認識的字母。' });
  K.add('en', 1, 1, 'en-colors', '顏色', 'vocab', W('red|紅色|#ef4444,blue|藍色|#3b82f6,green|綠色|#22c55e,yellow|黃色|#facc15,orange|橘色|#fb923c,purple|紫色|#a855f7,pink|粉紅色|#f9a8d4,black|黑色|#111827,white|白色|#ffffff,brown|咖啡色|#92400e'), { tip: '玩「I spy」：找找家裡 red 的東西。' });
  K.add('en', 1, 2, 'en-case', '大小寫配對', 'letter', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', { mode: 'case', prereq: ['en-abc-1', 'en-abc-2'], demo: '大寫和小寫是好朋友，像 A 和 a、B 和 b。', tip: '用字母卡玩大小寫配對。' });
  K.add('en', 1, 2, 'en-num10', '數字 1–10', 'vocab', W('one|一|1,two|二|2,three|三|3,four|四|4,five|五|5,six|六|6,seven|七|7,eight|八|8,nine|九|9,ten|十|10'), { tip: '爬樓梯時用英文數階梯。' });
  K.add('en', 1, 2, 'en-animals', '動物', 'vocab', W('cat|貓|🐱,dog|狗|🐶,bird|鳥|🐦,fish|魚|🐟,pig|豬|🐷,duck|鴨子|🦆,cow|乳牛|🐮,lion|獅子|🦁,monkey|猴子|🐵,rabbit|兔子|🐰,tiger|老虎|🐯,bear|熊|🐻'), { tip: '看繪本或去動物園時，用英文說動物名字。' });
  K.add('en', 1, 3, 'en-lsound', '字母的聲音', 'lsound', W('apple|a|🍎,ball|b|⚽,cat|c|🐱,dog|d|🐶,egg|e|🥚,fish|f|🐟,goat|g|🐐,hat|h|🎩,ink|i|🖋️,juice|j|🧃,kite|k|🪁,lion|l|🦁,moon|m|🌙,nose|n|👃,octopus|o|🐙,pig|p|🐷,queen|q|👸,rabbit|r|🐰,sun|s|☀️,tiger|t|🐯,umbrella|u|☂️,van|v|🚐,watch|w|⌚,yo-yo|y|🪀,zebra|z|🦓'), { prereq: ['en-case'], demo: '每個字母都有自己的聲音。ball 的開頭是 b 的聲音，b、b、ball！', tip: '說一個單字，請孩子說出開頭的聲音。' });
  K.add('en', 1, 3, 'en-family', '家人', 'vocab', W('father|爸爸|👨,mother|媽媽|👩,brother|兄弟|👦,sister|姊妹|👧,baby|寶寶|👶,grandpa|爺爺|👴,grandma|奶奶|👵'), { tip: '看家庭照片，用英文介紹家人。' });
  K.add('en', 1, 3, 'en-body', '身體部位', 'vocab', W('eye|眼睛|👁️,ear|耳朵|👂,nose|鼻子|👃,mouth|嘴巴|👄,hand|手|✋,foot|腳|🦶,leg|腿|🦵,tooth|牙齒|🦷'), { tip: '玩「Touch your nose!」指令遊戲。' });
  const SEN = s => s.split('|').map(x => { const [a, b] = x.split('='); return { s: a, zh: b }; });
  K.add('en', 1, 3, 'en-sent-1', '問候與指令', 'sentence', SEN('Good morning.=早安。|Thank you.=謝謝你。|Sit down.=坐下。|Stand up.=起立。|I am happy.=我很開心。|My name is Amy.=我的名字是 Amy。|Open the book.=打開書本。|I am a girl.=我是女生。'), { demo: '英文句子的第一個字母要大寫，最後有句點。', tip: '早上起床互道 Good morning。' });

  // ---------- G2 ----------
  K.add('en', 2, 1, 'en-cvc', 'CVC 拼讀', 'phon', W('cat|貓|🐱,dog|狗|🐶,sun|太陽|☀️,pig|豬|🐷,bed|床|🛏️,hat|帽子|🎩,bus|公車|🚌,cup|杯子|🥤,fox|狐狸|🦊,hen|母雞|🐔,map|地圖|🗺️,pen|筆|🖊️,web|蜘蛛網|🕸️,bag|袋子|👜,bug|蟲|🐛,leg|腿|🦵,net|網子|🥅,nut|堅果|🥜,van|廂型車|🚐,bat|蝙蝠|🦇,box|箱子|📦,jam|果醬|🍯,ten|十|🔟'), { prereq: ['en-lsound'], demo: '把三個聲音連起來：c、a、t，cat！', tip: '用字母磁鐵拼 cat、hat、bat，換開頭字母玩。' });
  K.add('en', 2, 1, 'en-food', '食物', 'vocab', W('apple|蘋果|🍎,banana|香蕉|🍌,cake|蛋糕|🍰,egg|蛋|🥚,milk|牛奶|🥛,rice|飯|🍚,bread|麵包|🍞,pizza|披薩|🍕,juice|果汁|🧃,water|水|💧,candy|糖果|🍬,orange|柳橙|🍊'), { tip: '吃飯時問 What do you like? 用 I like... 回答。' });
  K.add('en', 2, 2, 'en-things', '文具與玩具', 'vocab', W('book|書|📖,pencil|鉛筆|✏️,ruler|尺|📏,bag|書包|🎒,ball|球|⚽,kite|風箏|🪁,robot|機器人|🤖,car|車子|🚗,doll|娃娃|🪆,bike|腳踏車|🚲,eraser|橡皮擦|🧽,clock|時鐘|🕐'), { tip: '整理書包時用英文說出每樣文具。' });
  K.add('en', 2, 2, 'en-num20', '數字 11–20', 'vocab', W('eleven|十一|11,twelve|十二|12,thirteen|十三|13,fourteen|十四|14,fifteen|十五|15,sixteen|十六|16,seventeen|十七|17,eighteen|十八|18,nineteen|十九|19,twenty|二十|20'), { prereq: ['en-num10'] });
  K.add('en', 2, 2, 'en-sent-2', '這是什麼？我喜歡…', 'sentence', SEN("It is a dog.=牠是一隻狗。|What is this?=這是什麼？|I like apples.=我喜歡蘋果。|I do not like milk.=我不喜歡牛奶。|This is my book.=這是我的書。|Is it a cat?=牠是一隻貓嗎？|Yes, it is.=是的，牠是。|No, it is not.=不，牠不是。"), { demo: '說「這是…」用 It is a…；說「我喜歡」用 I like…。' });
  K.add('en', 2, 3, 'en-weather', '天氣', 'vocab', W('sunny|晴天|☀️,rainy|下雨|🌧️,cloudy|多雲|☁️,windy|有風|🌬️,snowy|下雪|❄️,hot|熱|🥵,cold|冷|🥶'), { tip: "每天早上問 How's the weather?" });

  // ---------- G3 ----------
  K.add('en', 3, 1, 'en-digraph', '組合音 sh / ch / th / wh', 'phon', W('ship|船|🚢,shop|商店|🏪,shoe|鞋子|👟,fish|魚|🐟,chair|椅子|🪑,cheese|起司|🧀,chick|小雞|🐥,lunch|午餐|🍱,three|三|3,bath|洗澡|🛁,whale|鯨魚|🐋,wheel|輪子|🎡,white|白色|#ffffff,teeth|牙齒|🦷'), { prereq: ['en-cvc'], demo: '兩個字母合起來發一個音：s 和 h 變成「噓」的 sh。' });
  K.add('en', 3, 1, 'en-transport', '交通工具', 'vocab', W('bus|公車|🚌,train|火車|🚆,bike|腳踏車|🚲,plane|飛機|✈️,boat|小船|⛵,taxi|計程車|🚕,car|汽車|🚗,truck|卡車|🚚,scooter|機車|🛵'));
  K.add('en', 3, 2, 'en-jobs', '職業', 'vocab', W('doctor|醫生|👨‍⚕️,nurse|護理師|👩‍⚕️,cook|廚師|👨‍🍳,farmer|農夫|👨‍🌾,teacher|老師|👩‍🏫,student|學生|🧑‍🎓,singer|歌手|🧑‍🎤,pilot|飛行員|🧑‍✈️,artist|畫家|🧑‍🎨'));
  const CZ = s => s.split('|').map(x => { const [q, a, o] = x.split('='); return { s: q, a, o: o.split(',') }; });
  K.add('en', 3, 2, 'en-cloze-3', 'a / an、複數、can', 'cloze', CZ('I have ___ apple.=an=a,two|It is ___ dog.=a=an,two|I have two ___.=cats=cat,a cat|She has three ___.=books=book,a book|I ___ swim.=can=am,is|___ you jump?=Can=Are,Is|This is ___ egg.=an=a,two|I see five ___.=birds=bird,a bird|He ___ run fast.=can=is,am|It is ___ orange.=an=a,three'), { demo: '母音 a e i o u 開頭的字用 an；兩個以上的東西，字尾要加 s。' });
  K.add('en', 3, 3, 'en-verbs', '動作', 'vocab', W('run|跑|🏃,swim|游泳|🏊,read|閱讀|📖,write|寫|✍️,sing|唱歌|🎤,dance|跳舞|💃,sleep|睡覺|😴,draw|畫畫|🎨,walk|走路|🚶,cook|煮飯|🍳,eat|吃|🍽️,drink|喝|🥤'), { tip: '玩比手畫腳：一人做動作，一人用英文猜。' });
  K.add('en', 3, 3, 'en-sent-3', 'I have / Can you', 'sentence', SEN('I have a red bike.=我有一輛紅色腳踏車。|Can you swim?=你會游泳嗎？|I can ride a bike.=我會騎腳踏車。|What do you like?=你喜歡什麼？|She is my sister.=她是我的姊妹。|He has two dogs.=他有兩隻狗。|I want to be a doctor.=我想當醫生。|We go to school by bus.=我們搭公車上學。'));

  // ---------- G4 ----------
  K.add('en', 4, 1, 'en-days', '星期', 'vocab', W('Monday|星期一,Tuesday|星期二,Wednesday|星期三,Thursday|星期四,Friday|星期五,Saturday|星期六,Sunday|星期日'));
  K.add('en', 4, 1, 'en-places', '地點', 'vocab', W('park|公園|🏞️,zoo|動物園|🦒,library|圖書館|📚,hospital|醫院|🏥,supermarket|超市|🛒,bank|銀行|🏦,restaurant|餐廳|🍽️,station|車站|🚉,school|學校|🏫'));
  K.add('en', 4, 2, 'en-prep', '介系詞 in / on / under', 'prep', ['in', 'on', 'under', 'next to'], { demo: 'in 是在裡面，on 是在上面，under 是在下面，next to 是在旁邊。', tip: '把玩偶放在箱子裡面、上面、下面，問 Where is it?' });
  K.add('en', 4, 2, 'en-months', '月份', 'vocab', W('January|一月,February|二月,March|三月,April|四月,May|五月,June|六月,July|七月,August|八月,September|九月,October|十月,November|十一月,December|十二月'));
  K.add('en', 4, 2, 'en-cloze-4', 'Do / Does、is / are', 'cloze', CZ('___ you like pizza?=Do=Does,Are|___ she like cats?=Does=Do,Is|He ___ to school by bus.=goes=go,going|They ___ my friends.=are=is,am|Where ___ the cat?=is=are,do|What time ___ it?=is=are,does|I get up ___ seven.=at=in,on|We play ball ___ Sunday.=on=at,in|She ___ a new bag.=has=have,is|My birthday is ___ May.=in=on,at'), { demo: '主詞是 he、she、it 的時候，用 Does，動詞要加 s。' });
  K.add('en', 4, 3, 'en-sent-4', '時間與地點問答', 'sentence', SEN('What time is it?=現在幾點？|It is seven o\'clock.=現在七點。|Where is the library?=圖書館在哪裡？|The cat is under the table.=貓在桌子下面。|Does she like music?=她喜歡音樂嗎？|I go to the park on Sunday.=我星期日去公園。|My birthday is in May.=我的生日在五月。|He gets up at six.=他六點起床。'));
  const RD = a => a.map(([t, q, ans, o]) => ({ t, q, a: ans, o }));
  K.add('en', 4, 3, 'en-read-4', '短文閱讀', 'read', RD([
    ['Tom has a dog. Its name is Lucky. Lucky is brown. It likes to run.', 'What color is Lucky?', 'Brown', ['Black', 'White']],
    ['Amy gets up at six. She eats bread and drinks milk. Then she goes to school.', 'What does Amy drink?', 'Milk', ['Juice', 'Water']],
    ['It is Sunday. Ben and his dad go to the zoo. They see lions and monkeys.', 'Where do they go?', 'The zoo', ['The park', 'The school']],
    ['The ball is under the chair. The cat is on the chair. The dog is next to the chair.', 'Where is the cat?', 'On the chair', ['Under the chair', 'Next to the chair']],
    ['Lily likes red. She has a red bag, a red hat, and red shoes.', 'What color is Lily\'s bag?', 'Red', ['Blue', 'Pink']],
    ['Sam is a cook. He works in a restaurant. He makes pizza every day.', 'Where does Sam work?', 'In a restaurant', ['In a hospital', 'In a bank']]
  ]));

  // ---------- G5 ----------
  K.add('en', 5, 1, 'en-feelings', '情緒', 'vocab', W('happy|開心|😀,sad|難過|😢,angry|生氣|😠,tired|累|😫,scared|害怕|😨,excited|興奮|🤩,sick|生病|🤒,sleepy|想睡|😴,surprised|驚訝|😲'));
  K.add('en', 5, 1, 'en-hobbies', '嗜好', 'vocab', W('painting|畫畫|🎨,fishing|釣魚|🎣,camping|露營|🏕️,hiking|健行|🥾,cooking|烹飪|🍳,singing|唱歌|🎤,swimming|游泳|🏊,reading|閱讀|📖,dancing|跳舞|💃'));
  K.add('en', 5, 2, 'en-cloze-5', '現在進行式與比較級', 'cloze', CZ('She is ___ now.=running=run,runs|They are ___ TV.=watching=watch,watched|I am ___ a book.=reading=read,reads|He is ___ than me.=taller=tall,tallest|A car is ___ than a bike.=faster=fast,fastest|What are you ___?=doing=do,does|The cat is ___ than the dog.=smaller=small,smallest|We are ___ lunch.=eating=eat,eats|Is he ___ the piano?=playing=play,plays|An elephant is ___ than a horse.=bigger=big,biggest'), { demo: '正在做的事用 be 動詞加上 -ing；兩個東西比較，形容詞加 -er。' });
  K.add('en', 5, 2, 'en-compar', '比較級形容詞', 'vocab', W('bigger|比較大,smaller|比較小,taller|比較高,shorter|比較矮,faster|比較快,slower|比較慢,older|比較老,younger|比較年輕,stronger|比較強壯,heavier|比較重'));
  K.add('en', 5, 3, 'en-festival', '節慶', 'vocab', W('Christmas|聖誕節|🎄,Halloween|萬聖節|🎃,New Year|新年|🎆,Moon Festival|中秋節|🥮,birthday|生日|🎂,Easter|復活節|🐣'));
  K.add('en', 5, 3, 'en-sent-5', '進行式與比較句', 'sentence', SEN('What are you doing now?=你現在在做什麼？|I am reading a comic book.=我正在看漫畫書。|She is taller than her brother.=她比她弟弟高。|My hobby is taking pictures.=我的嗜好是拍照。|He is playing basketball with friends.=他正在和朋友打籃球。|Which is faster, a car or a train?=汽車和火車哪個比較快？|We are having dinner at home.=我們正在家吃晚餐。|I feel happy on my birthday.=我生日的時候覺得很開心。'));
  K.add('en', 5, 3, 'en-read-5', '短文理解', 'read', RD([
    ['Today is Halloween. Kevin is wearing a ghost costume. He goes from door to door with his friends and says, "Trick or treat!" They get a lot of candy.', 'What is Kevin wearing?', 'A ghost costume', ['A witch hat', 'A school uniform']],
    ['Mia likes camping. Last week, she went camping with her family. They cooked dinner outside and looked at the stars at night.', 'What did they do at night?', 'Looked at the stars', ['Went swimming', 'Watched TV']],
    ['Jack is taller than Tim, but Tim is faster than Jack. They are both on the school basketball team.', 'Who is faster?', 'Tim', ['Jack', 'They are the same']],
    ['If it is rainy, take the bus. If it is sunny, ride your bike. Look! The sun is out today.', 'How should you go today?', 'Ride your bike', ['Take the bus', 'Take a taxi']],
    ['Nina is making a cake for her mom. She needs eggs, milk, and sugar. But there is no milk at home, so she goes to the supermarket.', 'Why does Nina go to the supermarket?', 'To buy milk', ['To buy eggs', 'To buy a cake']]
  ]));

  // ---------- G6 ----------
  K.add('en', 6, 1, 'en-cloze-6', '過去式與未來式', 'cloze', CZ('I ___ to the zoo yesterday.=went=go,going|She ___ a movie last night.=watched=watch,watches|We ___ pizza for lunch yesterday.=ate=eat,eating|He ___ visit his grandma tomorrow.=will=did,was|They ___ at home last Sunday.=were=are,will|I ___ a letter last week.=wrote=write,writes|It ___ rain tomorrow.=will=was,did|Did you ___ your homework?=do=did,does|She ___ happy yesterday.=was=is,will|We will ___ a trip next month.=take=took,taking'), { demo: '昨天發生的事用過去式，像 go 變成 went；明天的事用 will。' });
  K.add('en', 6, 1, 'en-past', '不規則過去式', 'vocab', W('went|go 的過去式,ate|eat 的過去式,saw|see 的過去式,had|have 的過去式,came|come 的過去式,made|make 的過去式,took|take 的過去式,ran|run 的過去式,wrote|write 的過去式,bought|buy 的過去式,said|say 的過去式,got|get 的過去式'));
  K.add('en', 6, 2, 'en-freq', '頻率副詞', 'vocab', W('always|總是,usually|通常,often|常常,sometimes|有時候,never|從不,every day|每天,once a week|一週一次'));
  K.add('en', 6, 2, 'en-nature', '自然與世界', 'vocab', W('mountain|山|⛰️,river|河|🏞️,ocean|海洋|🌊,forest|森林|🌲,island|島|🏝️,desert|沙漠|🏜️,volcano|火山|🌋,rainbow|彩虹|🌈,earth|地球|🌍,star|星星|⭐'));
  K.add('en', 6, 2, 'en-sent-6', '過去與未來的句子', 'sentence', SEN('I went to the beach last summer.=我去年夏天去了海邊。|What did you do yesterday?=你昨天做了什麼？|She will visit Japan next year.=她明年會去日本。|He always gets up early.=他總是很早起床。|We sometimes play tennis after school.=我們有時候放學後打網球。|Did you finish your homework?=你寫完功課了嗎？|I am going to see a movie tonight.=我今晚要去看電影。|They never eat fast food.=他們從不吃速食。'));
  K.add('en', 6, 3, 'en-read-6', '閱讀理解', 'read', RD([
    ['Last Saturday, Ken went hiking with his father. They got up at five and took a bus to the mountain. It was cold in the morning, but the view at the top was beautiful. Ken took many pictures. He wants to go again next month.', 'How did they get to the mountain?', 'By bus', ['By train', 'By car']],
    ['Emma always walks to school. But yesterday it rained a lot, so her mother drove her to school. Emma forgot her umbrella in the car, and she got wet on her way home.', 'Why did Emma get wet?', 'She forgot her umbrella', ['She walked to school', 'She lost her bag']],
    ['The library opens at nine and closes at five. You can borrow five books for two weeks. Please be quiet and do not eat in the library.', 'How long can you borrow books?', 'Two weeks', ['Five days', 'Nine days']],
    ['Leo wants to buy a new bike. It costs 3,000 dollars. He has 1,800 dollars now. He will help his neighbor wash cars every weekend to make more money.', 'What will Leo do to make money?', 'Wash cars', ['Sell books', 'Walk dogs']],
    ['Sea turtles live in the ocean, but they lay eggs on the beach. Many turtles eat plastic bags because the bags look like jellyfish. We should use fewer plastic bags to protect them.', 'Why do turtles eat plastic bags?', 'The bags look like jellyfish', ['They are hungry all the time', 'The bags smell good']]
  ]));

  // ---------- 選擇題產生器 ----------
  const M = K.mcqKinds;
  M.letter = (s, n) => {
    const all = [...s.data], L = K.pick(all), pool = all.filter(x => x !== L);
    if (s.mode === 'case') {
      const up = Math.random() < .5, f = x => enw(up ? x.toLowerCase() : x);
      return K.mkq({ prompt: `<span class="big enw">${up ? L : L.toLowerCase()}</span>`, say: L, lang: 'en-US', ask: up ? '找出它的小寫' : '找出它的大寫', item: L }, f(L), pool.map(f), n);
    }
    const lc = Math.random() < .5, f = x => enw(lc ? x.toLowerCase() : x);
    return K.mkq({ prompt: '🔊', say: L, lang: 'en-US', ask: '聽一聽，是哪個字母？', item: L }, f(L), pool.map(f), n);
  };
  M.lsound = (s, n) => {
    const it = K.pick(s.data), pool = s.data.filter(x => x.zh !== it.zh);
    return K.mkq({ prompt: `<span class="em">${it.e}</span>`, say: it.w, lang: 'en-US', ask: '它的開頭是哪個字母的聲音？', item: it }, enw(it.zh), pool.map(x => enw(x.zh)), n);
  };
  M.vocab = (s, n, mode) => {
    const it = K.pick(s.data), pool = s.data.filter(x => x !== it);
    const m = s.g <= 1 ? 'listen' : (mode || K.pick(['listen', 'read']));
    if (m === 'listen') return K.mkq({ prompt: '🔊', say: it.w, lang: 'en-US', ask: '聽一聽，選出對的', item: it }, face(it), pool.map(face), n);
    return K.mkq({ prompt: face(it), ask: '它的英文是？', item: it }, enw(it.w), pool.map(x => enw(x.w)), n);
  };
  M.phon = (s, n) => {
    const it = K.pick(s.data), V = 'aeiou';
    const vars = [];
    for (let i = 0; i < it.w.length; i++) if (V.includes(it.w[i])) for (const v of V) if (v !== it.w[i]) vars.push(it.w.slice(0, i) + v + it.w.slice(i + 1));
    const others = s.data.filter(x => x !== it).map(x => x.w);
    return K.mkq({ prompt: it.e ? `<span class="em">${em(it)}</span>` : '🔊', say: it.w, lang: 'en-US', ask: '聽一聽，哪一個拼對了？', item: it }, enw(it.w), K.shuffle(vars).slice(0, 2).concat(K.shuffle(others)).map(enw), n);
  };
  M.sentence = (s, n) => {
    const it = K.pick(s.data), pool = s.data.filter(x => x !== it);
    return K.mkq({ prompt: s.g >= 3 ? enw(it.s) : '🔊', say: it.s, lang: 'en-US', ask: '這句話是什麼意思？', item: it }, `<span class="zhs">${it.zh}</span>`, pool.map(x => `<span class="zhs">${x.zh}</span>`), Math.min(n, 3));
  };
  M.cloze = (s, n) => {
    const it = K.pick(s.data);
    return K.mkq({ prompt: enw(it.s), ask: '選出正確的字', item: it }, enw(it.a), it.o.map(enw), n);
  };
  K.prepScene = (p, a = '🐱') => `<span class="scene p-${p.replace(/ /g, '')}"><i class="bx"></i><b>${a}</b></span>`;
  M.prep = (s, n) => {
    const p = K.pick(s.data), a = K.pick(['🐱', '🐶', '⚽', '🐭']), nm = { '🐱': 'cat', '🐶': 'dog', '⚽': 'ball', '🐭': 'mouse' }[a];
    return K.mkq({ prompt: '🔊', say: `The ${nm} is ${p} the box.`, lang: 'en-US', ask: '聽一聽，是哪一張圖？', item: p }, K.prepScene(p, a), s.data.filter(x => x !== p).map(x => K.prepScene(x, a)), n);
  };
  M.read = (s, n) => {
    const it = K.pick(s.data);
    return K.mkq({ prompt: `<div class="passage">${it.t}</div><div class="rq">${it.q}</div>`, ask: '讀一讀，回答問題', item: it }, enw(it.a), it.o.map(enw), n);
  };
})();
