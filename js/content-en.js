'use strict';
// 英文內容包：字彙（教育部 1200 字詞）、自然發音、常見字、句型（手寫＋模板生成）、文法克漏字、閱讀
(() => {
  const K = KL, R = K.rand, P = K.pick;
  const W = s => s.split(',').map(x => { const [w, zh, e] = x.split('|'); return { w, zh, e: e || '' }; });
  const em = K.em = it => {
    if (it.e[0] !== '#') return it.e;
    const m = it.e.match(/^(#[0-9a-fA-F]{6})(.*)$/);
    return `<i class="sw" style="background:${m[1]}"><b>${m[2] || ''}</b></i>`;
  };
  const face = K.face = it => it.e ? `<span class="em">${em(it)}</span>` : `<span class="zhw">${it.zh}</span>`;
  const enw = w => `<span class="enw">${w}</span>`;

  // ---------- 字母 ----------
  K.add('en', 1, 1, 'en-abc-1', '字母 A–M', 'letter', 'ABCDEFGHIJKLM', { demo: '每個字母都有大寫和小寫。聽聽看它的名字，再找出來！', tip: '一起唱字母歌，邊唱邊指字母卡。' });
  K.add('en', 1, 1, 'en-abc-2', '字母 N–Z', 'letter', 'NOPQRSTUVWXYZ', { demo: '每個字母都有大寫和小寫。聽聽看它的名字，再找出來！', tip: '在招牌、書本封面上找找看認識的字母。' });
  K.add('en', 1, 2, 'en-case', '大小寫配對', 'letter', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', { mode: 'case', prereq: ['en-abc-1', 'en-abc-2'], demo: '大寫和小寫是好朋友，像 A 和 a、B 和 b。', tip: '用字母卡玩大小寫配對。' });
  K.add('en', 1, 3, 'en-lsound', '字母的聲音', 'lsound', W('apple|a|🍎,ball|b|⚽,cat|c|🐱,dog|d|🐶,egg|e|🥚,fish|f|🐟,goat|g|🐐,hat|h|🎩,ink|i|🖋️,juice|j|🧃,kite|k|🪁,lion|l|🦁,moon|m|🌙,nose|n|👃,octopus|o|🐙,pig|p|🐷,queen|q|👸,rabbit|r|🐰,sun|s|☀️,tiger|t|🐯,umbrella|u|☂️,van|v|🚐,watch|w|⌚,yo-yo|y|🪀,zebra|z|🦓,bed|b|🛏️,cup|c|☕,duck|d|🦆,fan|f|🌀,gift|g|🎁,hen|h|🐔,jam|j|🍯,king|k|🤴,leg|l|🦵,milk|m|🥛,net|n|🥅,pen|p|🖊️,rain|r|🌧️,sock|s|🧦,top|t|🔝,web|w|🕸️'), { prereq: ['en-case'], demo: '每個字母都有自己的聲音。ball 的開頭是 b 的聲音，b、b、ball！', tip: '說一個單字，請孩子說出開頭的聲音。' });

  // ---------- 字彙：由 data-en.js 的主題表產生 ----------
  const TIPS = { 'en-colors': '玩「I spy」：找找家裡 red 的東西。', 'en-num10': '爬樓梯時用英文數階梯。', 'en-animals': '看繪本或去動物園時，用英文說動物名字。', 'en-body': '玩「Touch your nose!」指令遊戲。', 'en-food': '吃飯時問 What do you like?', 'en-weather': "每天早上問 How's the weather?", 'en-verbs2': '玩比手畫腳：一人做動作，一人用英文猜。', 'en-routine': '早上照作息順序用英文說一遍。' };
  let cur = null; const VOC = [];
  for (const raw of K.EN_VOCAB.split('\n')) {
    const l = raw.trim(); if (!l) continue;
    if (l[0] === '#') { const m = l.match(/^#\s+(\d)\s+(\d)\s+(\S+)\s+(.+)$/); if (m) { cur = { g: +m[1], sub: +m[2], id: m[3], name: m[4], w: [] }; VOC.push(cur); } continue; }
    const [w, zh, e] = l.split('|'); if (cur) cur.w.push({ w, zh, e: e || '' });
  }
  VOC.forEach(s => K.add('en', s.g, s.sub, s.id, s.name, 'vocab', s.w, { tip: TIPS[s.id] || '', demo: '先聽聲音，再想想它是什麼意思。多聽幾次就記得了！' }));
  K.EN_ALL = VOC.flatMap(s => s.w);
  const byId = id => K.skill[id].data;

  // ---------- 自然發音 ----------
  const PH = (g, sub, id, name, s, x) => K.add('en', g, sub, id, name, 'phon', W(s), Object.assign({ demo: '把每個聲音連起來唸：c、a、t，cat！' }, x));
  PH(2, 1, 'en-cvc', 'CVC 拼讀：-at -an -ap', 'cat|貓|🐱,hat|帽子|🎩,bat|蝙蝠|🦇,mat|墊子|🧘,rat|老鼠|🐀,fan|電扇|🌀,can|罐子|🥫,man|男人|👨,pan|平底鍋|🍳,van|廂型車|🚐,cap|帽子|🧢,map|地圖|🗺️,nap|小睡|😴,tap|水龍頭|🚰', { prereq: ['en-lsound'], tip: '用字母磁鐵拼 cat、hat、bat，換開頭字母玩。' });
  PH(2, 2, 'en-cvc-2', 'CVC 拼讀：-ig -in -it -ot', 'pig|豬|🐷,big|大的|🐘,dig|挖|⛏️,wig|假髮|💇,pin|別針|📌,win|贏|🏆,bin|垃圾桶|🗑️,fin|魚鰭|🐟,sit|坐|🪑,hit|打|🥊,kit|工具組|🧰,hot|熱的|🔥,pot|鍋子|🍲,dot|點|⚫,top|陀螺|🪀,hop|單腳跳|🐇,mop|拖把|🧹', { prereq: ['en-cvc'] });
  PH(2, 3, 'en-cvc-3', 'CVC 拼讀：-ug -un -ed -en -et', 'bug|蟲|🐛,hug|擁抱|🤗,mug|馬克杯|☕,rug|地毯|🧶,jug|水壺|🫗,sun|太陽|☀️,run|跑|🏃,bun|小圓麵包|🥯,fun|好玩|🎉,bed|床|🛏️,red|紅色|🟥,hen|母雞|🐔,pen|筆|🖊️,ten|十|🔟,net|網子|🥅,wet|濕的|💦,pet|寵物|🐾,jet|噴射機|✈️,box|箱子|📦,fox|狐狸|🦊', { prereq: ['en-cvc'] });
  PH(3, 1, 'en-digraph', '組合音 sh / ch / th / wh', 'ship|船|🚢,shop|商店|🏪,shoe|鞋子|👟,fish|魚|🐟,dish|盤子|🍽️,chair|椅子|🪑,cheese|起司|🧀,chick|小雞|🐥,lunch|午餐|🍱,beach|海灘|🏖️,three|三|3,bath|洗澡|🛁,teeth|牙齒|🦷,moth|蛾|🦋,whale|鯨魚|🐋,wheel|輪子|🎡,white|白色|⚪,when|什麼時候|⏰', { prereq: ['en-cvc-3'], demo: '兩個字母合起來發一個音：s 和 h 變成「噓」的 sh。' });
  PH(3, 2, 'en-magic-e', 'Magic e 長母音', 'cake|蛋糕|🍰,name|名字|📛,gate|大門|🚪,lake|湖|🏞️,game|遊戲|🎲,bike|腳踏車|🚲,kite|風箏|🪁,five|五|5,nine|九|9,time|時間|⏰,line|線|📏,bone|骨頭|🦴,home|家|🏠,nose|鼻子|👃,rope|繩子|🪢,note|筆記|📝,cube|方塊|🧊,cute|可愛的|🐣,tube|管子|🧪,June|六月|📅', { prereq: ['en-digraph'], demo: '字尾的 e 不發音，但會讓前面的母音唸出自己的名字：cap → cape，kit → kite。' });
  PH(3, 3, 'en-blends', '子音群 bl cl fr gr st tr', 'black|黑色|⚫,blue|藍色|🔵,clock|時鐘|🕐,class|班級|🏫,flag|旗子|🚩,frog|青蛙|🐸,grape|葡萄|🍇,green|綠色|🟢,plant|植物|🌱,sleep|睡覺|😴,snake|蛇|🐍,star|星星|⭐,stop|停|🛑,swim|游泳|🏊,tree|樹|🌳,truck|卡車|🚚,drum|鼓|🥁,crab|螃蟹|🦀,bread|麵包|🍞,glass|玻璃杯|🥛', { prereq: ['en-magic-e'], demo: '兩個子音很快地連在一起唸：b、l、bl！' });
  PH(4, 1, 'en-rcontrol', 'r 控制母音 ar or er ir ur', 'car|汽車|🚗,star|星星|⭐,farm|農場|🚜,park|公園|🏞️,arm|手臂|💪,bird|鳥|🐦,girl|女孩|👧,shirt|襯衫|👕,corn|玉米|🌽,fork|叉子|🍴,horse|馬|🐴,short|短的|📏,nurse|護理師|👩‍⚕️,turtle|烏龜|🐢,purple|紫色|🟣,letter|信|✉️,water|水|💧,sister|姊妹|👧,teacher|老師|👩‍🏫,river|河|🏞️', { prereq: ['en-blends'], demo: 'r 跟在母音後面，母音的聲音會變：a 變成 ar（像「啊兒」）。' });
  PH(5, 1, 'en-suffix', '字尾變化 -ing -ed -er', 'running|正在跑|🏃,jumping|正在跳|🦘,singing|正在唱|🎤,reading|正在讀|📖,swimming|正在游|🏊,played|玩了|🎮,walked|走了|🚶,watched|看了|📺,cooked|煮了|🍳,teacher|老師|👩‍🏫,singer|歌手|🎤,player|球員|⚽,farmer|農夫|👨‍🌾,faster|比較快|🐇,bigger|比較大|🐘', { demo: '-ing 是正在做，-ed 是做過了，-er 是「做這件事的人」或「比較…」。' });
  // 常見字（sight words）：聽到就要認得
  const SW = (g, sub, id, name, s) => K.add('en', g, sub, id, name, 'sight', s.split(',').map(x => { const [w, zh] = x.split('|'); return { w, zh, e: '' }; }), { demo: '這些字很常出現，看到就要馬上認得，不用拼。' });
  SW(2, 2, 'en-sight-1', '常見字（一）', 'the|這個,a|一個,is|是,are|是（複數）,I|我,you|你,he|他,she|她,it|它,we|我們,they|他們,am|是（我）,this|這個,that|那個,and|和,in|在…裡,on|在…上,my|我的,your|你的,can|能,like|喜歡,have|有,see|看見,go|去,to|到,no|不,yes|是,not|不,do|做,up|上');
  SW(3, 1, 'en-sight-2', '常見字（二）', 'here|這裡,there|那裡,what|什麼,where|哪裡,who|誰,with|和,for|為了,from|從,of|…的,was|是（過去）,were|是（過去複數）,has|有,had|有（過去）,said|說了,come|來,some|一些,one|一,two|二,little|小的,big|大的,look|看,help|幫忙,play|玩,make|做,good|好,very|非常,all|全部,out|外面,down|下,over|越過');

  // ---------- 句型：手寫 ----------
  const SEN = s => s.split('|').map(x => { const [a, b] = x.split('='); return { s: a, zh: b }; });
  K.add('en', 1, 3, 'en-sent-1', '問候與指令', 'sentence', SEN('Good morning.=早安。|Thank you.=謝謝你。|Sit down.=坐下。|Stand up.=起立。|I am happy.=我很開心。|My name is Amy.=我的名字是 Amy。|Open the book.=打開書本。|I am a girl.=我是女生。|Good night.=晚安。|See you tomorrow.=明天見。|Nice to meet you.=很高興認識你。|I am six years old.=我六歲。|Close the door.=關上門。|Look at me.=看著我。|Line up, please.=請排隊。'), { demo: '英文句子的第一個字母要大寫，最後有句點。', tip: '早上起床互道 Good morning。' });
  K.add('en', 2, 1, 'en-sent-2', '這是什麼？我喜歡…', 'sentence', SEN("It is a dog.=牠是一隻狗。|What is this?=這是什麼？|I like apples.=我喜歡蘋果。|I do not like milk.=我不喜歡牛奶。|This is my book.=這是我的書。|Is it a cat?=牠是一隻貓嗎？|Yes, it is.=是的，牠是。|No, it is not.=不，牠不是。|It is sunny today.=今天是晴天。|I have a red bag.=我有一個紅色書包。|That is a big tree.=那是一棵大樹。|How old are you?=你幾歲？|I am seven.=我七歲。|What color is it?=它是什麼顏色？|It is blue.=它是藍色的。"), { demo: '說「這是…」用 It is a…；說「我喜歡」用 I like…。' });
  K.add('en', 3, 1, 'en-sent-3', 'I have / Can you', 'sentence', SEN('I have a red bike.=我有一輛紅色腳踏車。|Can you swim?=你會游泳嗎？|I can ride a bike.=我會騎腳踏車。|What do you like?=你喜歡什麼？|She is my sister.=她是我的姊妹。|He has two dogs.=他有兩隻狗。|I want to be a doctor.=我想當醫生。|We go to school by bus.=我們搭公車上學。|Who is that man?=那個男人是誰？|He is my uncle.=他是我的叔叔。|How many pens do you have?=你有幾枝筆？|I have three pens.=我有三枝筆。|Do you like pizza?=你喜歡披薩嗎？|Yes, I do.=是的，我喜歡。|They are my friends.=他們是我的朋友。'));
  K.add('en', 4, 1, 'en-sent-4', '時間與地點問答', 'sentence', SEN("What time is it?=現在幾點？|It is seven o'clock.=現在七點。|Where is the library?=圖書館在哪裡？|The cat is under the table.=貓在桌子下面。|Does she like music?=她喜歡音樂嗎？|I go to the park on Sunday.=我星期日去公園。|My birthday is in May.=我的生日在五月。|He gets up at six.=他六點起床。|What day is today?=今天星期幾？|It is Friday.=今天星期五。|There are two books on the desk.=書桌上有兩本書。|Where are you from?=你來自哪裡？|I am from Taiwan.=我來自臺灣。|Is there a park near here?=這附近有公園嗎？|Turn left at the corner.=在轉角左轉。"));
  K.add('en', 5, 1, 'en-sent-5', '進行式與比較句', 'sentence', SEN('What are you doing now?=你現在在做什麼？|I am reading a comic book.=我正在看漫畫書。|She is taller than her brother.=她比她弟弟高。|My hobby is taking pictures.=我的嗜好是拍照。|He is playing basketball with friends.=他正在和朋友打籃球。|Which is faster, a car or a train?=汽車和火車哪個比較快？|We are having dinner at home.=我們正在家吃晚餐。|I feel happy on my birthday.=我生日的時候覺得很開心。|How much is this hat?=這頂帽子多少錢？|It is one hundred dollars.=一百元。|Elephants are the biggest animals on land.=大象是陸地上最大的動物。|Can I have a glass of water?=我可以喝杯水嗎？|The weather is getting colder.=天氣越來越冷了。|She sings better than me.=她唱得比我好。|Are they swimming in the pool?=他們正在泳池游泳嗎？'));
  K.add('en', 6, 1, 'en-sent-6', '過去與未來的句子', 'sentence', SEN('I went to the beach last summer.=我去年夏天去了海邊。|What did you do yesterday?=你昨天做了什麼？|She will visit Japan next year.=她明年會去日本。|He always gets up early.=他總是很早起床。|We sometimes play tennis after school.=我們有時候放學後打網球。|Did you finish your homework?=你寫完功課了嗎？|I am going to see a movie tonight.=我今晚要去看電影。|They never eat fast food.=他們從不吃速食。|I was tired, so I went to bed early.=我很累，所以早早上床睡覺。|If it rains tomorrow, we will stay home.=如果明天下雨，我們會待在家。|She has lived here for ten years.=她在這裡住了十年。|How often do you exercise?=你多久運動一次？|I usually walk to school with my friend.=我通常和朋友走路上學。|We should protect the environment.=我們應該保護環境。|Could you tell me the way to the station?=你能告訴我去車站的路嗎？'));

  // ---------- 句型與文法：模板生成器（每次都是新句子）----------
  const sub1 = { I: ['我', 'am', 'have', 'like', 'go', 'get', 'was', 'do'], You: ['你', 'are', 'have', 'like', 'go', 'get', 'were', 'do'], We: ['我們', 'are', 'have', 'like', 'go', 'get', 'were', 'do'], They: ['他們', 'are', 'have', 'like', 'go', 'get', 'were', 'do'], He: ['他', 'is', 'has', 'likes', 'goes', 'gets', 'was', 'does'], She: ['她', 'is', 'has', 'likes', 'goes', 'gets', 'was', 'does'] };
  const S3 = ['He', 'She'], PL = ['We', 'They'];
  const noun = ids => P(ids.flatMap(byId).filter(x => /^[a-z]+$/.test(x.w)));
  const plural = w => /(s|x|ch|sh)$/.test(w) ? w + 'es' : /[^aeiou]y$/.test(w) ? w.slice(0, -1) + 'ies' : w === 'foot' ? 'feet' : w === 'tooth' ? 'teeth' : w === 'mouse' ? 'mice' : w === 'fish' ? 'fish' : w === 'sheep' ? 'sheep' : w + 's';
  const an = w => /^[aeiou]/.test(w) ? 'an' : 'a';
  const ing = v => ({ run: 'running', swim: 'swimming', sit: 'sitting', get: 'getting', shop: 'shopping', stop: 'stopping', dance: 'dancing', ride: 'riding', write: 'writing', make: 'making', come: 'coming', have: 'having', take: 'taking', give: 'giving' }[v] || v + 'ing');
  const past = v => ({ go: 'went', eat: 'ate', see: 'saw', have: 'had', come: 'came', make: 'made', take: 'took', run: 'ran', write: 'wrote', buy: 'bought', say: 'said', get: 'got', do: 'did', read: 'read', drink: 'drank', swim: 'swam', give: 'gave', find: 'found', tell: 'told', think: 'thought', know: 'knew', sleep: 'slept', sing: 'sang', draw: 'drew', fly: 'flew', ride: 'rode', sit: 'sat', stand: 'stood', wear: 'wore', win: 'won', meet: 'met', feel: 'felt', stop: 'stopped', shop: 'shopped', plan: 'planned', study: 'studied', cry: 'cried', dance: 'danced', like: 'liked', live: 'lived' }[v] || v + 'ed');
  const comp = a => ({ good: 'better', bad: 'worse', big: 'bigger', fat: 'fatter', thin: 'thinner', hot: 'hotter', happy: 'happier', heavy: 'heavier', busy: 'busier', easy: 'easier', pretty: 'prettier', beautiful: 'more beautiful', expensive: 'more expensive', important: 'more important', delicious: 'more delicious' }[a] || a + 'er');
  const ZH = { I: '我', You: '你', We: '我們', They: '他們', He: '他', She: '她' };
  const NUM = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'], ZN = ['', '一', '兩', '三', '四', '五', '六', '七', '八', '九', '十'];
  const HOUR = ['twelve', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'];
  const VERB = { run: '跑步', swim: '游泳', sing: '唱歌', dance: '跳舞', draw: '畫畫', cook: '煮飯', read: '閱讀', jump: '跳', fly: '飛', climb: '爬', ride: '騎車', play: '玩' };
  const VERB2 = { 'play basketball': '打籃球', 'ride a bike': '騎腳踏車', 'read a book': '看書', 'watch TV': '看電視', 'eat lunch': '吃午餐', 'do homework': '寫功課', 'play the piano': '彈鋼琴', 'draw a picture': '畫畫', 'clean the room': '打掃房間', 'wash the dishes': '洗碗' };
  const PLACE = { park: '公園', zoo: '動物園', library: '圖書館', school: '學校', beach: '海灘', supermarket: '超市', museum: '博物館', hospital: '醫院', station: '車站', market: '市場' };
  const DAY = { Monday: '星期一', Tuesday: '星期二', Wednesday: '星期三', Thursday: '星期四', Friday: '星期五', Saturday: '星期六', Sunday: '星期日' };
  const MONTH = { January: '一月', February: '二月', March: '三月', April: '四月', May: '五月', June: '六月', July: '七月', August: '八月', September: '九月', October: '十月', November: '十一月', December: '十二月' };
  const FEEL = { happy: '開心', sad: '難過', tired: '累', hungry: '餓', angry: '生氣', excited: '興奮', bored: '無聊', sleepy: '想睡', thirsty: '口渴', scared: '害怕' };
  const ADJ = { big: '大', small: '小', tall: '高', fast: '快', slow: '慢', old: '老', young: '年輕', heavy: '重', long: '長', strong: '強壯', cheap: '便宜', expensive: '貴' };
  const ANIM = { cat: '貓', dog: '狗', bird: '鳥', rabbit: '兔子', elephant: '大象', horse: '馬', lion: '獅子', tiger: '老虎', mouse: '老鼠', turtle: '烏龜', fish: '魚', frog: '青蛙' };
  const FOOD = { apples: '蘋果', bananas: '香蕉', cookies: '餅乾', eggs: '蛋', noodles: '麵', pizza: '披薩', rice: '飯', milk: '牛奶', juice: '果汁', bread: '麵包', cake: '蛋糕', fish: '魚' };
  const COLOR = { red: '紅色', blue: '藍色', green: '綠色', yellow: '黃色', black: '黑色', white: '白色', pink: '粉紅色', purple: '紫色', brown: '咖啡色', orange: '橘色' };
  const THING = { book: '書', pen: '筆', bag: '書包', ball: '球', kite: '風箏', hat: '帽子', cup: '杯子', box: '箱子', car: '車子', doll: '娃娃', bike: '腳踏車', egg: '蛋', apple: '蘋果', umbrella: '雨傘' };
  const PK = o => P(Object.keys(o));
  const G = {
    1: () => { const t = R(0, 3), f = PK(FEEL), th = PK(THING), c = PK(COLOR); return [[`I am ${f}.`, `我很${FEEL[f]}。`], [`This is ${an(th)} ${th}.`, `這是一個${THING[th]}。`], [`I have ${an(th)} ${th}.`, `我有一個${THING[th]}。`], [`It is ${c}.`, `它是${COLOR[c]}的。`]][t]; },
    2: () => { const t = R(0, 4), c = PK(COLOR), th = PK(THING), fo = PK(FOOD), a = PK(ANIM); return [[`It is a ${c} ${th}.`, `它是一個${COLOR[c]}的${THING[th]}。`], [`I like ${fo}.`, `我喜歡${FOOD[fo]}。`], [`I do not like ${fo}.`, `我不喜歡${FOOD[fo]}。`], [`Is it a ${a}?`, `牠是一隻${ANIM[a]}嗎？`], [`I see a ${c} ${a}.`, `我看到一隻${COLOR[c]}的${ANIM[a]}。`]][t]; },
    3: () => { const t = R(0, 4), n = R(2, 9), th = PK(THING), v = PK(VERB), s = P(S3), a = PK(ANIM); return [[`I have ${NUM[n]} ${plural(th)}.`, `我有${ZN[n]}個${THING[th]}。`], [`I can ${v}.`, `我會${VERB[v]}。`], [`Can you ${v}?`, `你會${VERB[v]}嗎？`], [`${s} has ${NUM[n]} ${plural(a)}.`, `${ZH[s]}有${ZN[n]}隻${ANIM[a]}。`], [`${s} likes ${PK(FOOD)}.`.replace(/likes (\w+)\./, (m, w) => `likes ${w}.`), `${ZH[s]}喜歡吃東西。`]][Math.min(t, 3)]; },
    4: () => { const t = R(0, 4), h = R(0, 11), pl = PK(PLACE), d = PK(DAY), m = PK(MONTH), s = P(S3), fo = PK(FOOD), a = PK(ANIM), pp = P(['in', 'on', 'under']); return [[`I get up at ${HOUR[h]} o'clock.`, `我${['十二', '一', '兩', '三', '四', '五', '六', '七', '八', '九', '十', '十一'][h]}點起床。`], [`We go to the ${pl} on ${d}.`, `我們${DAY[d]}去${PLACE[pl]}。`], [`My birthday is in ${m}.`, `我的生日在${MONTH[m]}。`], [`The ${a} is ${pp} the box.`, `${ANIM[a]}在箱子${{ in: '裡面', on: '上面', under: '下面' }[pp]}。`], [`Does ${s.toLowerCase()} like ${fo}?`, `${ZH[s]}喜歡${FOOD[fo]}嗎？`]][t]; },
    5: () => { const t = R(0, 3), s = P(Object.keys(sub1)), v = PK(VERB), a = PK(ADJ), [x, y] = K.sample(Object.keys(ANIM), 2), f = PK(FEEL), pl = PK(PLACE); return [[`${s} ${sub1[s][1]} ${ing(v)} now.`, `${ZH[s]}現在正在${VERB[v]}。`], [`A ${x} is ${comp(a)} than a ${y}.`, `${ANIM[x]}比${ANIM[y]}${ADJ[a]}。`], [`${s} ${sub1[s][1]} ${ing(v)} in the ${pl}.`, `${ZH[s]}正在${PLACE[pl]}${VERB[v]}。`], [`I feel ${f} today.`, `我今天覺得很${FEEL[f]}。`]][t]; },
    6: () => { const t = R(0, 3), s = P(Object.keys(sub1)), pl = PK(PLACE), v2 = PK(VERB2), fq = P(['always', 'usually', 'often', 'sometimes', 'never']), FQ = { always: '總是', usually: '通常', often: '常常', sometimes: '有時候', never: '從不' }, fo = PK(FOOD); return [[`${s} went to the ${pl} yesterday.`, `${ZH[s]}昨天去了${PLACE[pl]}。`], [`${s} will ${v2} tomorrow.`, `${ZH[s]}明天會${VERB2[v2]}。`], [`${s} ${fq} ${sub1[s][3] === 'likes' ? v2.replace(/^(\w+)/, m => m + (m.endsWith('h') ? 'es' : 's')) : v2} after school.`, `${ZH[s]}放學後${FQ[fq]}${VERB2[v2]}。`], [`We ate ${fo} for lunch.`, `我們午餐吃了${FOOD[fo]}。`]][t]; }
  };
  for (let g = 1; g <= 6; g++) K.add('en', g, 2, 'en-gsent-' + g, `句型練習（${'一二三四五六'[g - 1]}）`, 'sentence', [], { gen: () => { const [s, zh] = G[g](); return { s, zh }; }, demo: '先找出「誰」，再找「做什麼」。英文句子第一個字母大寫，最後有句點。' });

  // 克漏字生成：a/an、複數、can；Do/Does、is/are、介系詞；進行式、比較級；過去式、未來式
  const CZ = s => s.split('|').map(x => { const [q, a, o] = x.split('='); return { s: q, a, o: o.split(',') }; });
  const CG = {
    3: () => { const t = R(0, 3), th = PK(THING), n = R(2, 9), v = PK(VERB); return [{ s: `I have ___ ${th}.`, a: an(th), o: [an(th) === 'a' ? 'an' : 'a', 'two'] }, { s: `I have ${NUM[n]} ___.`, a: plural(th), o: [th, 'a ' + th] }, { s: `I ___ ${v}.`, a: 'can', o: ['am', 'is'] }, { s: `___ you ${v}?`, a: 'Can', o: ['Are', 'Is'] }][t]; },
    4: () => { const t = R(0, 4), s = P(Object.keys(sub1)), fo = PK(FOOD), pl = PK(PLACE), th = PK(THING), d = PK(DAY), m = PK(MONTH); return [{ s: `___ ${s.toLowerCase()} like ${fo}?`, a: sub1[s][7] === 'does' ? 'Does' : 'Do', o: [sub1[s][7] === 'does' ? 'Do' : 'Does', 'Are'] }, { s: `${s} ___ to the ${pl} by bus.`, a: sub1[s][4], o: [sub1[s][4] === 'goes' ? 'go' : 'goes', 'going'] }, { s: `Where ___ the ${plural(th)}?`, a: 'are', o: ['is', 'am'] }, { s: `We play ball ___ ${d}.`, a: 'on', o: ['in', 'at'] }, { s: `My birthday is ___ ${m}.`, a: 'in', o: ['on', 'at'] }][t]; },
    5: () => { const t = R(0, 3), s = P(Object.keys(sub1)), v = PK(VERB), a = PK(ADJ), [x, y] = K.sample(Object.keys(ANIM), 2); return [{ s: `${s} ${sub1[s][1]} ___ now.`, a: ing(v), o: [v, v + 's'] }, { s: `A ${x} is ___ than a ${y}.`, a: comp(a), o: [a, a + 'est'] }, { s: `What ${sub1[s][1]} ${s.toLowerCase()} ___?`, a: 'doing', o: ['do', 'does'] }, { s: `${s} ${sub1[s][1]} ___ in the pool.`, a: 'swimming', o: ['swim', 'swims'] }][t]; },
    6: () => { const t = R(0, 3), s = P(Object.keys(sub1)), pl = PK(PLACE), v = P(['go', 'eat', 'see', 'buy', 'make', 'read', 'write', 'play', 'watch', 'visit']), fo = PK(FOOD); return [{ s: `${s} ___ to the ${pl} yesterday.`, a: 'went', o: ['go', 'goes'] }, { s: `${s} ___ ${fo} last night.`, a: past('eat'), o: ['eat', 'eats'] }, { s: `${s} will ___ a movie tomorrow.`, a: 'watch', o: ['watched', 'watches'] }, { s: `___ you ${v} yesterday?`, a: 'Did', o: ['Do', 'Does'] }][t]; }
  };
  K.add('en', 3, 2, 'en-cloze-3', 'a / an、複數、can', 'cloze', CZ('I have ___ apple.=an=a,two|It is ___ dog.=a=an,two|I have two ___.=cats=cat,a cat|She has three ___.=books=book,a book|I ___ swim.=can=am,is|___ you jump?=Can=Are,Is|This is ___ egg.=an=a,two|I see five ___.=birds=bird,a bird|He ___ run fast.=can=is,am|It is ___ orange.=an=a,three'), { gen: CG[3], demo: '母音 a e i o u 開頭的字用 an；兩個以上的東西，字尾要加 s。', why: 'a/an 看後面單字的第一個音；數量超過一個，名詞要加 s。' });
  K.add('en', 4, 2, 'en-cloze-4', 'Do / Does、is / are、介系詞', 'cloze', CZ('___ you like pizza?=Do=Does,Are|___ she like cats?=Does=Do,Is|He ___ to school by bus.=goes=go,going|They ___ my friends.=are=is,am|Where ___ the cat?=is=are,do|What time ___ it?=is=are,does|I get up ___ seven.=at=in,on|We play ball ___ Sunday.=on=at,in|She ___ a new bag.=has=have,is|My birthday is ___ May.=in=on,at'), { gen: CG[4], demo: '主詞是 he、she、it 的時候，用 Does，動詞要加 s。時刻用 at、星期用 on、月份用 in。' });
  K.add('en', 5, 2, 'en-cloze-5', '現在進行式與比較級', 'cloze', CZ('She is ___ now.=running=run,runs|They are ___ TV.=watching=watch,watched|I am ___ a book.=reading=read,reads|He is ___ than me.=taller=tall,tallest|A car is ___ than a bike.=faster=fast,fastest|What are you ___?=doing=do,does|The cat is ___ than the dog.=smaller=small,smallest|We are ___ lunch.=eating=eat,eats|Is he ___ the piano?=playing=play,plays|An elephant is ___ than a horse.=bigger=big,biggest'), { gen: CG[5], demo: '正在做的事用 be 動詞加上 -ing；兩個東西比較，形容詞加 -er。' });
  K.add('en', 6, 2, 'en-cloze-6', '過去式與未來式', 'cloze', CZ('I ___ to the zoo yesterday.=went=go,going|She ___ a movie last night.=watched=watch,watches|We ___ pizza for lunch yesterday.=ate=eat,eating|He ___ visit his grandma tomorrow.=will=did,was|They ___ at home last Sunday.=were=are,will|I ___ a letter last week.=wrote=write,writes|It ___ rain tomorrow.=will=was,did|Did you ___ your homework?=do=did,does|She ___ happy yesterday.=was=is,will|We will ___ a trip next month.=take=took,taking'), { gen: CG[6], demo: '昨天發生的事用過去式，像 go 變成 went；明天的事用 will。' });

  // ---------- 介系詞、聽指令 ----------
  K.add('en', 4, 1, 'en-prep', '介系詞 in / on / under', 'prep', ['in', 'on', 'under', 'next to'], { demo: 'in 是在裡面，on 是在上面，under 是在下面，next to 是在旁邊。', tip: '把玩偶放在箱子裡面、上面、下面，問 Where is it?' });
  K.prepScene = (p, a = '🐱') => `<span class="scene p-${p.replace(/ /g, '')}"><i class="bx"></i><b>${a}</b></span>`;
  const BODY = { nose: '👃', eye: '👁️', ear: '👂', mouth: '👄', hand: '✋', foot: '🦶', head: '🙂', leg: '🦵' }, CMD = ['Touch your', 'Point to your', 'Show me your'];
  K.add('en', 1, 2, 'en-cmd-1', '聽指令：身體部位', 'cmd', null, { gen: () => { const b = PK(BODY); return { say: `${P(CMD)} ${b}.`, ans: BODY[b], opts: Object.values(BODY), ask: '聽指令，點出對的部位' }; }, demo: 'Touch 是摸，nose 是鼻子。聽到 Touch your nose 就摸鼻子！', tip: '玩 Simon says：Touch your nose, clap your hands。' });
  K.add('en', 2, 2, 'en-cmd-2', '聽指令：顏色與物品', 'cmd', null, { gen: () => { const c = PK(COLOR), th = P(['ball', 'car', 'cup', 'hat', 'kite']); const E = { ball: '⚽', car: '🚗', cup: '🥤', hat: '🎩', kite: '🪁' }, CO = { red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#facc15', black: '#111827', white: '#ffffff', pink: '#f9a8d4', purple: '#a855f7', brown: '#92400e', orange: '#fb923c' }; const f = x => `<i class="sw" style="background:${CO[x]}"><b>${E[th]}</b></i>`; return { say: P(['Find the', 'Go to the', 'Touch the']) + ` ${c} ${th}.`, ans: f(c), opts: K.sample(Object.keys(COLOR).filter(x => x !== c), 3).map(f).concat(f(c)), ask: '聽一聽，是哪一個？' }; }, demo: '先聽顏色，再聽東西。red ball 就是紅色的球。' });

  // ---------- 閱讀：手寫 + 生成 ----------
  const RD = a => a.map(([t, q, ans, o, ev]) => ({ t, q, a: ans, o, ev: [].concat(ev) }));
  const NAME = ['Amy', 'Ben', 'Kate', 'Tom', 'Lily', 'Sam', 'Mia', 'Leo', 'Emma', 'Jack'], HE = n => ['Ben', 'Tom', 'Sam', 'Leo', 'Jack'].includes(n);
  const story1 = () => { const n = P(NAME), a = PK(ANIM), c = PK(COLOR), fo = PK(FOOD), t = `${n} has a ${a}. It is ${c}. It likes ${fo}.`, k = R(0, 2); return [{ t, q: `What does ${n} have?`, a: `A ${a}`, o: K.sample(Object.keys(ANIM).filter(x => x !== a), 2).map(x => `A ${x}`), ev: [0] }, { t, q: `What color is the ${a}?`, a: c[0].toUpperCase() + c.slice(1), o: K.sample(Object.keys(COLOR).filter(x => x !== c), 2).map(x => x[0].toUpperCase() + x.slice(1)), ev: [1] }, { t, q: `What does the ${a} like?`, a: fo[0].toUpperCase() + fo.slice(1), o: K.sample(Object.keys(FOOD).filter(x => x !== fo), 2).map(x => x[0].toUpperCase() + x.slice(1)), ev: [2] }][k]; };
  const story2 = () => { const n = P(NAME), h = R(5, 8), fo = PK(FOOD), dr = P(['milk', 'juice', 'tea', 'water']), pl = PK(PLACE), pr = HE(n) ? 'He' : 'She', t = `${n} gets up at ${NUM[h]}. ${pr} eats ${fo} and drinks ${dr}. Then ${pr.toLowerCase()} goes to the ${pl}.`, k = R(0, 2); return [{ t, q: `What time does ${n} get up?`, a: `At ${NUM[h]}`, o: [`At ${NUM[h + 1]}`, `At ${NUM[h - 1]}`], ev: [0] }, { t, q: `What does ${n} drink?`, a: dr[0].toUpperCase() + dr.slice(1), o: K.sample(['milk', 'juice', 'tea', 'water'].filter(x => x !== dr), 2).map(x => x[0].toUpperCase() + x.slice(1)), ev: [1] }, { t, q: `Where does ${n} go?`, a: `To the ${pl}`, o: K.sample(Object.keys(PLACE).filter(x => x !== pl), 2).map(x => `To the ${x}`), ev: [2] }][k]; };
  const story3 = () => { const n = P(NAME), [v1, v2] = K.sample(Object.keys(VERB), 2), pr = HE(n) ? 'He' : 'She', ps = HE(n) ? 'His' : 'Her', t = `${n} can ${v1}. ${pr} can not ${v2}. ${ps} brother can ${v2}.`, k = R(0, 1); return [{ t, q: `Who can ${v2}?`, a: `${n}'s brother`, o: [n, 'Nobody'], ev: [2] }, { t, q: `What can ${n} do?`, a: v1[0].toUpperCase() + v1.slice(1), o: [v2[0].toUpperCase() + v2.slice(1), 'Nothing'], ev: [0] }][k]; };
  K.add('en', 2, 1, 'en-read-2', '圖文小故事', 'read', RD([
    ['I have a cat. It is white. It likes milk.', 'What color is the cat?', 'White', ['Black', 'Red'], 1],
    ['This is my bag. It is blue. I have two books in it.', 'How many books are in the bag?', 'Two', ['One', 'Three'], 2],
    ['It is sunny. I like sunny days. I fly a kite.', 'What do I fly?', 'A kite', ['A ball', 'A bike'], 2],
    ['Ben has a red ball. Amy has a robot. They play.', 'Who has a robot?', 'Amy', ['Ben', 'Tom'], 1],
    ['I see a pig. It is big. It likes apples.', 'What does the pig like?', 'Apples', ['Milk', 'Rice'], 2]
  ]), { gen: story1, demo: '答案就藏在故事裡。再讀一次，找到說出答案的那一句。' });
  K.add('en', 3, 1, 'en-read-3', '短篇故事', 'read', RD([
    ['Kate can swim. She can not ride a bike. Her brother can ride a bike.', 'Who can ride a bike?', "Kate's brother", ['Kate', 'Nobody'], 2],
    ['My father is a doctor. He goes to work by bus. He likes his job.', 'How does he go to work?', 'By bus', ['By car', 'By train'], 1],
    ['We have three chairs and one big table. The cat sleeps on a chair.', 'Where does the cat sleep?', 'On a chair', ['On the table', 'On the bed'], 1],
    ['Tim likes to draw. He draws a ship and a whale. The whale is blue.', 'What color is the whale?', 'Blue', ['White', 'Green'], 2],
    ['I want to be a cook. I can cook eggs. My mother likes my eggs.', 'What can I cook?', 'Eggs', ['Fish', 'Cake'], 1]
  ]), { gen: () => (Math.random() < .5 ? story2 : story3)(), demo: '答案就藏在故事裡。再讀一次，找到說出答案的那一句。' });
  K.add('en', 4, 1, 'en-read-4', '短文閱讀', 'read', RD([
    ['Tom has a dog. Its name is Lucky. Lucky is brown. It likes to run.', 'What color is Lucky?', 'Brown', ['Black', 'White'], 2],
    ['Amy gets up at six. She eats bread and drinks milk. Then she goes to school.', 'What does Amy drink?', 'Milk', ['Juice', 'Water'], 1],
    ['It is Sunday. Ben and his dad go to the zoo. They see lions and monkeys.', 'Where do they go?', 'The zoo', ['The park', 'The school'], 1],
    ['The ball is under the chair. The cat is on the chair. The dog is next to the chair.', 'Where is the cat?', 'On the chair', ['Under the chair', 'Next to the chair'], 1],
    ['Lily likes red. She has a red bag, a red hat, and red shoes.', "What color is Lily's bag?", 'Red', ['Blue', 'Pink'], 1],
    ['Sam is a cook. He works in a restaurant. He makes pizza every day.', 'Where does Sam work?', 'In a restaurant', ['In a hospital', 'In a bank'], 1],
    ['My school is big. There are thirty classrooms and a library. I like the library because it is quiet.', 'Why does the writer like the library?', 'It is quiet', ['It is big', 'It is new'], 2],
    ['On Saturday, Mia goes to the park with her grandma. They feed the ducks and eat ice cream.', 'Who goes to the park with Mia?', 'Her grandma', ['Her mother', 'Her teacher'], 0],
    ['Jack has a new bike. It is green. He rides it to school every day, but not on rainy days.', 'When does Jack not ride his bike?', 'On rainy days', ['On school days', 'On Sundays'], 2],
    ['It is winter. It is very cold. Emma wears a coat and gloves. She drinks hot tea.', 'What does Emma wear?', 'A coat and gloves', ['A dress', 'Shorts'], 2],
    ['Leo has three pets: a cat, a dog, and a bird. The bird can sing. The cat likes to sleep.', 'Which pet can sing?', 'The bird', ['The cat', 'The dog'], 1],
    ['There is a supermarket next to my house. My mom buys eggs and milk there every morning.', 'Where is the supermarket?', 'Next to the house', ['Next to the school', 'Behind the park'], 0]
  ]), { demo: '答案就在短文裡，回去找說到這件事的那一句。' });
  K.add('en', 5, 1, 'en-read-5', '短文理解', 'read', RD([
    ['Today is Halloween. Kevin is wearing a ghost costume. He goes from door to door with his friends and says, "Trick or treat!" They get a lot of candy.', 'What is Kevin wearing?', 'A ghost costume', ['A witch hat', 'A school uniform'], 1],
    ['Mia likes camping. Last week, she went camping with her family. They cooked dinner outside and looked at the stars at night.', 'What did they do at night?', 'Looked at the stars', ['Went swimming', 'Watched TV'], 2],
    ['Jack is taller than Tim, but Tim is faster than Jack. They are both on the school basketball team.', 'Who is faster?', 'Tim', ['Jack', 'They are the same'], 0],
    ['If it is rainy, take the bus. If it is sunny, ride your bike. Look! The sun is out today.', 'How should you go today?', 'Ride your bike', ['Take the bus', 'Take a taxi'], [1, 3]],
    ['Nina is making a cake for her mom. She needs eggs, milk, and sugar. But there is no milk at home, so she goes to the supermarket.', 'Why does Nina go to the supermarket?', 'To buy milk', ['To buy eggs', 'To buy a cake'], 2],
    ['My favorite season is summer. I can swim in the sea and eat watermelon. My sister likes winter because she loves snow.', 'Why does the sister like winter?', 'She loves snow', ['She can swim', 'She likes watermelon'], 2],
    ['Ben wants a new robot. It costs 500 dollars. He saves 50 dollars every week. After ten weeks, he can buy it.', 'How much does Ben save every week?', '50 dollars', ['500 dollars', '10 dollars'], 2],
    ['Our class has a pet rabbit. Its name is Snow. Every day a different student feeds it. Today it is my turn.', 'Who feeds the rabbit today?', 'The writer', ['The teacher', 'Snow'], 3],
    ['Grandpa gets up at five every day. He walks in the park and then reads the newspaper. He says walking keeps him healthy.', 'Why does Grandpa walk every day?', 'To keep healthy', ['To buy a newspaper', 'To meet friends'], 2],
    ['Lily is nervous. Tomorrow she will sing on the stage for the first time. Her mom says, "Just do your best." Lily smiles.', 'How does Lily feel?', 'Nervous', ['Angry', 'Bored'], 0],
    ['The museum is open from nine to five. Tickets are 100 dollars for adults and free for children under twelve.', 'How much is a ticket for a ten-year-old?', 'Free', ['100 dollars', '50 dollars'], 1],
    ['Tom and his dad planted a tree in the yard last spring. Now the tree is taller than Tom. Birds come to sing in it every morning.', 'When did they plant the tree?', 'Last spring', ['This morning', 'Last winter'], 0]
  ]));
  K.add('en', 6, 1, 'en-read-6', '閱讀理解', 'read', RD([
    ['Last Saturday, Ken went hiking with his father. They got up at five and took a bus to the mountain. It was cold in the morning, but the view at the top was beautiful. Ken took many pictures. He wants to go again next month.', 'How did they get to the mountain?', 'By bus', ['By train', 'By car'], 1],
    ['Emma always walks to school. But yesterday it rained a lot, so her mother drove her to school. Emma forgot her umbrella in the car, and she got wet on her way home.', 'Why did Emma get wet?', 'She forgot her umbrella', ['She walked to school', 'She lost her bag'], 2],
    ['The library opens at nine and closes at five. You can borrow five books for two weeks. Please be quiet and do not eat in the library.', 'How long can you borrow books?', 'Two weeks', ['Five days', 'Nine days'], 1],
    ['Leo wants to buy a new bike. It costs 3,000 dollars. He has 1,800 dollars now. He will help his neighbor wash cars every weekend to make more money.', 'What will Leo do to make money?', 'Wash cars', ['Sell books', 'Walk dogs'], 3],
    ['Sea turtles live in the ocean, but they lay eggs on the beach. Many turtles eat plastic bags because the bags look like jellyfish. We should use fewer plastic bags to protect them.', 'Why do turtles eat plastic bags?', 'The bags look like jellyfish', ['They are hungry all the time', 'The bags smell good'], 1],
    ['Dear Amy, thank you for the birthday gift. I love the blue scarf. It is cold here in Canada, so I wear it every day. I hope you can visit me next summer. Love, Jenny', 'Where does Jenny live now?', 'In Canada', ['In Taiwan', 'In Japan'], 2],
    ['Many people think bats are birds, but they are not. Bats are the only mammals that can fly. They sleep in the daytime and hunt insects at night, using sound to find their way.', 'When do bats hunt?', 'At night', ['In the morning', 'At noon'], 2],
    ['Our school will have a sports day on May 10. Students should wear PE uniforms and bring a water bottle. Parents are welcome to come and cheer. If it rains, the sports day will be on May 17.', 'What should students bring?', 'A water bottle', ['A textbook', 'A camera'], 1],
    ['Mr. Lin has a small farm. In spring he plants rice, and in summer he grows watermelons. He sells them at the market on weekends. He says the best part of his job is working outside.', 'What does Mr. Lin like most about his job?', 'Working outside', ['Selling watermelons', 'Getting up early'], 3],
    ['Kate did not do well on her math test. She was sad, but her teacher told her that mistakes help us learn. Kate started to practice ten minutes every day. A month later, she got a much better score.', 'What did Kate do after the test?', 'Practiced every day', ['Stopped studying math', 'Changed her teacher'], 2],
    ['Taipei 101 was once the tallest building in the world. It has 101 floors and a very fast elevator that takes you to the top in about 37 seconds. On New Year\'s Eve, fireworks shoot out from the building.', 'How long does the elevator take to reach the top?', 'About 37 seconds', ['About 101 seconds', 'About 10 minutes'], 1],
    ['Water is important for our bodies. Doctors say children should drink about six cups of water a day. Drinking water helps us think better and keeps our skin healthy. Soda is not a good choice because it has too much sugar.', 'Why is soda not a good choice?', 'It has too much sugar', ['It is too cold', 'It costs too much'], 3]
  ]));
  K.sentences = (t, en) => (t.match(en ? /[^.!?]+[.!?]+["”]?\s*/g : /[^。！？]+[。！？]+[」』]?/g) || [t]).map(x => x.trim());

  // ---------- 選擇題產生器 ----------
  const M = K.mcqKinds;
  M.letter = (s, n) => {
    const all = [...s.data], L = K.pi(s, all), pool = all.filter(x => x !== L);
    if (s.mode === 'case') {
      const up = Math.random() < .5, f = x => enw(up ? x.toLowerCase() : x);
      return K.mkq({ prompt: `<span class="big enw">${up ? L : L.toLowerCase()}</span>`, say: L, lang: 'en-US', ask: up ? '找出它的小寫' : '找出它的大寫', item: L, hint: `大寫 ${L} 和小寫 ${L.toLowerCase()} 是一對。` }, f(L), pool.map(f), n);
    }
    const lc = Math.random() < .5, f = x => enw(lc ? x.toLowerCase() : x);
    return K.mkq({ prompt: '🔊', say: L, lang: 'en-US', ask: '聽一聽，是哪個字母？', item: L, novoice: `<span class="big enw">${L}</span>` }, f(L), pool.map(f), n);
  };
  M.lsound = (s, n) => {
    const it = K.pi(s), pool = s.data.filter(x => x.zh !== it.zh);
    return K.mkq({ prompt: `<span class="em">${it.e}</span>`, say: it.w, lang: 'en-US', ask: '它的開頭是哪個字母的聲音？', item: it, hint: `${it.w}，開頭的聲音是「${it.zh}」。`, novoice: `<span class="enw sm">${it.w}</span>` }, enw(it.zh), pool.map(x => enw(x.zh)), n);
  };
  M.vocab = (s, n, mode) => {
    const it = K.pi(s), pool = s.data.filter(x => x !== it && x.zh !== it.zh && x.e !== it.e || (x !== it && !x.e && !it.e && x.zh !== it.zh));
    const m = s.g <= 1 ? 'listen' : (mode || K.pick(['listen', 'read', 'zh']));
    if (m === 'listen') return K.mkq({ prompt: '🔊', say: it.w, lang: 'en-US', ask: '聽一聽，選出對的', item: it, hint: `它的中文意思是「${it.zh}」`, novoice: `<span class="enw sm">${it.w}</span>` }, face(it), pool.map(face), n);
    if (m === 'zh' || !it.e) return K.mkq({ prompt: `<span class="zhs">${it.zh}</span>`, ask: '它的英文是？', say: s.g <= 2 ? it.zh : '', item: it, hint: `開頭的字母是 ${it.w[0].toUpperCase()}` }, enw(it.w), pool.map(x => enw(x.w)), n);
    return K.mkq({ prompt: face(it), ask: '它的英文是？', item: it, hint: `它的中文是「${it.zh}」，開頭字母是 ${it.w[0].toUpperCase()}` }, enw(it.w), pool.map(x => enw(x.w)), n);
  };
  M.sight = (s, n) => { const it = K.pi(s), pool = s.data.filter(x => x !== it); return K.mkq({ prompt: '🔊', say: it.w, lang: 'en-US', ask: '聽一聽，是哪一個字？', item: it, hint: `它的意思是「${it.zh}」`, novoice: `<span class="zhs">${it.zh}</span>` }, enw(it.w), pool.map(x => enw(x.w)), n); };
  M.phon = (s, n) => {
    const it = K.pi(s), V = 'aeiou', vars = [];
    for (let i = 0; i < it.w.length; i++) if (V.includes(it.w[i])) for (const v of V) if (v !== it.w[i]) vars.push(it.w.slice(0, i) + v + it.w.slice(i + 1));
    const others = s.data.filter(x => x !== it).map(x => x.w);
    return K.mkq({ prompt: it.e ? `<span class="em">${em(it)}</span>` : '🔊', say: it.w, lang: 'en-US', ask: '聽一聽，哪一個拼對了？', item: it, hint: `一個一個聲音慢慢聽：${[...it.w].join(' - ')}`, novoice: `<span class="zhs">${it.zh}</span>` }, enw(it.w), K.shuffle(vars).slice(0, 2).concat(K.shuffle(others)).map(enw), n);
  };
  M.sentence = (s, n) => {
    const it = K.pi(s), pool = (s.data.length ? s.data : [it]).filter(x => x.s !== it.s);
    while (pool.length < 3 && s.gen) { const x = s.gen(); if (x.s !== it.s && !pool.some(p => p.zh === x.zh)) pool.push(x); }
    return K.mkq({ prompt: s.g >= 3 ? enw(it.s) : '🔊', say: it.s, lang: 'en-US', ask: '這句話是什麼意思？', item: it, novoice: enw(it.s) }, `<span class="zhs">${it.zh}</span>`, pool.map(x => `<span class="zhs">${x.zh}</span>`), Math.min(n, 3));
  };
  M.cloze = (s, n) => { const it = K.pi(s); return K.mkq({ prompt: enw(it.s), ask: '選出正確的字', item: it, hint: s.demo }, enw(it.a), it.o.map(enw), n); };
  M.prep = (s, n) => {
    const p = K.pi(s, s.data), a = P(['🐱', '🐶', '⚽', '🐭']), nm = { '🐱': 'cat', '🐶': 'dog', '⚽': 'ball', '🐭': 'mouse' }[a];
    return K.mkq({ prompt: '🔊', say: `The ${nm} is ${p} the box.`, lang: 'en-US', ask: '聽一聽，是哪一張圖？', item: p, hint: `${p} 的意思是「${{ in: '在裡面', on: '在上面', under: '在下面', 'next to': '在旁邊' }[p]}」`, novoice: enw(`The ${nm} is ${p} the box.`) }, K.prepScene(p, a), s.data.filter(x => x !== p).map(x => K.prepScene(x, a)), n);
  };
  M.cmd = (s, n) => { const it = s.gen(); return K.mkq({ prompt: '🔊', say: it.say, lang: 'en-US', ask: it.ask, item: it, novoice: enw(it.say) }, it.ans, it.opts.filter(x => x !== it.ans), n); };
  M.read = (s, n) => { const it = K.pi(s); return K.mkq({ prompt: `<div class="passage">${it.t}</div><div class="rq">${it.q}</div>`, ask: '讀一讀，回答問題', item: it, hint: '回到短文，找出說到這件事的那一句。' }, enw(it.a), it.o.map(enw), n); };
})();
