'use strict';
// 英文字彙資料：以教育部「國民中小學英語基本字詞 1200」為骨架，依主題分組、依年級分級
// 格式：# 年級 子級 id 名稱 ／ 單字|中文|圖示（可省略；色彩用 #色碼，可接 emoji）
KL.EN_VOCAB = `
# 1 1 en-colors 顏色
red|紅色|#ef4444🍎
blue|藍色|#3b82f6🫐
green|綠色|#22c55e🍃
yellow|黃色|#facc15🍋
orange|橘色|#fb923c🍊
purple|紫色|#a855f7🍇
pink|粉紅色|#f9a8d4🌸
black|黑色|#111827⚫
white|白色|#ffffff⚪
brown|咖啡色|#92400e🍫
gray|灰色|#9ca3af🐘
# 1 2 en-num10 數字 1–10
one|一|1
two|二|2
three|三|3
four|四|4
five|五|5
six|六|6
seven|七|7
eight|八|8
nine|九|9
ten|十|10
zero|零|0
# 1 2 en-animals 動物
cat|貓|🐱
dog|狗|🐶
bird|鳥|🐦
fish|魚|🐟
pig|豬|🐷
duck|鴨子|🦆
cow|乳牛|🐮
lion|獅子|🦁
monkey|猴子|🐵
rabbit|兔子|🐰
tiger|老虎|🐯
bear|熊|🐻
mouse|老鼠|🐭
frog|青蛙|🐸
# 1 3 en-family 家人
father|爸爸|👨
mother|媽媽|👩
brother|兄弟|👦
sister|姊妹|👧
baby|寶寶|👶
grandfather|爺爺|👴
grandmother|奶奶|👵
family|家人|👨‍👩‍👧
boy|男孩|🧒
girl|女孩|👧
# 1 3 en-body 身體部位
eye|眼睛|👁️
ear|耳朵|👂
nose|鼻子|👃
mouth|嘴巴|👄
hand|手|✋
foot|腳|🦶
leg|腿|🦵
tooth|牙齒|🦷
head|頭|🙂
hair|頭髮|💇
arm|手臂|💪
face|臉|😊
# 1 2 en-class1 教室裡的東西
book|書|📖
pen|筆|🖊️
pencil|鉛筆|✏️
desk|書桌|🪑
chair|椅子|💺
bag|書包|🎒
door|門|🚪
window|窗戶|🪟
table|桌子|🪵
box|箱子|📦
# 1 1 en-greet 打招呼用語
hello|哈囉|👋
hi|嗨|🙋
goodbye|再見|👋
yes|是|👍
no|不是|👎
please|請|🙏
thank you|謝謝|😊
sorry|對不起|😔
OK|好的|👌
# 1 3 en-shapes 形狀
circle|圓形|⭕
square|正方形|🟦
triangle|三角形|🔺
star|星星|⭐
heart|愛心|❤️
line|線|📏
# 1 2 en-fruit1 水果
apple|蘋果|🍎
banana|香蕉|🍌
orange|柳橙|🍊
grape|葡萄|🍇
watermelon|西瓜|🍉
strawberry|草莓|🍓
lemon|檸檬|🍋
peach|桃子|🍑
# 1 3 en-toys 玩具
ball|球|⚽
doll|娃娃|🪆
kite|風箏|🪁
robot|機器人|🤖
car|小汽車|🚗
balloon|氣球|🎈
toy|玩具|🧸
game|遊戲|🎲
# 1 3 en-verbs1 動作
run|跑|🏃
jump|跳|🦘
walk|走|🚶
sit|坐|🪑
stand|站|🧍
eat|吃|🍽️
drink|喝|🥤
sleep|睡覺|😴
look|看|👀
listen|聽|👂
open|打開|📂
close|關上|📁
# 2 1 en-num20 數字 11–20
eleven|十一|11
twelve|十二|12
thirteen|十三|13
fourteen|十四|14
fifteen|十五|15
sixteen|十六|16
seventeen|十七|17
eighteen|十八|18
nineteen|十九|19
twenty|二十|20
# 2 2 en-tens 數字 30–100
thirty|三十|30
forty|四十|40
fifty|五十|50
sixty|六十|60
seventy|七十|70
eighty|八十|80
ninety|九十|90
hundred|一百|100
thousand|一千|1000
# 2 1 en-food 食物
rice|飯|🍚
bread|麵包|🍞
egg|蛋|🥚
cake|蛋糕|🍰
cookie|餅乾|🍪
candy|糖果|🍬
pizza|披薩|🍕
hamburger|漢堡|🍔
noodles|麵|🍜
soup|湯|🍲
chicken|雞肉|🍗
fish|魚|🐟
hot dog|熱狗|🌭
ice cream|冰淇淋|🍦
sandwich|三明治|🥪
# 2 1 en-drink 飲料
water|水|💧
milk|牛奶|🥛
juice|果汁|🧃
tea|茶|🍵
coffee|咖啡|☕
coke|可樂|🥤
soda|汽水|🧋
# 2 2 en-stationery 文具
ruler|尺|📏
eraser|橡皮擦|🧽
crayon|蠟筆|🖍️
marker|麥克筆|🖊️
notebook|筆記本|📒
paper|紙|📄
glue|膠水|🧴
scissors|剪刀|✂️
pencil box|鉛筆盒|🧰
tape|膠帶|🩹
# 2 2 en-clothes 衣服
shirt|襯衫|👕
T-shirt|T 恤|👕
pants|長褲|👖
shorts|短褲|🩳
dress|洋裝|👗
skirt|裙子|👗
shoe|鞋子|👟
sock|襪子|🧦
hat|帽子|🎩
cap|鴨舌帽|🧢
coat|外套|🧥
jacket|夾克|🧥
glove|手套|🧤
# 2 3 en-weather 天氣
sunny|晴天|☀️
rainy|下雨|🌧️
cloudy|多雲|☁️
windy|有風|🌬️
snowy|下雪|❄️
hot|熱|🥵
cold|冷|🥶
warm|溫暖|🌤️
cool|涼爽|🍃
rain|雨|☔
snow|雪|⛄
wind|風|💨
sun|太陽|🌞
# 2 2 en-home 家裡的房間
house|房子|🏠
home|家|🏡
room|房間|🛏️
kitchen|廚房|🍳
bathroom|浴室|🛁
bedroom|臥室|🛌
living room|客廳|🛋️
garden|花園|🌷
yard|院子|🏡
# 2 3 en-furniture 家具與用品
bed|床|🛏️
sofa|沙發|🛋️
lamp|檯燈|💡
clock|時鐘|🕐
TV|電視|📺
telephone|電話|☎️
cup|杯子|☕
bowl|碗|🥣
plate|盤子|🍽️
knife|刀子|🔪
fork|叉子|🍴
spoon|湯匙|🥄
key|鑰匙|🔑
# 2 2 en-animals2 更多動物
elephant|大象|🐘
horse|馬|🐴
sheep|綿羊|🐑
goat|山羊|🐐
chicken|雞|🐔
bee|蜜蜂|🐝
ant|螞蟻|🐜
butterfly|蝴蝶|🦋
snake|蛇|🐍
turtle|烏龜|🐢
panda|熊貓|🐼
zebra|斑馬|🦓
giraffe|長頸鹿|🦒
kangaroo|袋鼠|🦘
# 2 3 en-verbs2 更多動作
swim|游泳|🏊
read|閱讀|📖
write|寫|✍️
draw|畫畫|🎨
sing|唱歌|🎤
dance|跳舞|💃
play|玩|🎮
cook|煮飯|🍳
wash|洗|🧼
clean|打掃|🧹
fly|飛|🕊️
climb|爬|🧗
ride|騎|🚴
# 2 3 en-adj1 形容詞（一）
big|大的|🐘
small|小的|🐭
tall|高的|🦒
short|矮的／短的|🐧
long|長的|🐍
fat|胖的|🐷
thin|瘦的|🥢
new|新的|✨
old|舊的／老的|👴
good|好的|👍
bad|壞的|👎
happy|快樂的|😀
sad|難過的|😢
# 2 3 en-pets 寵物與農場
pet|寵物|🐾
puppy|小狗|🐶
kitten|小貓|🐱
farm|農場|🚜
farmer|農夫|👨‍🌾
egg|蛋|🥚
nest|鳥巢|🪺
# 3 1 en-transport 交通工具
bus|公車|🚌
train|火車|🚆
bike|腳踏車|🚲
plane|飛機|✈️
boat|小船|⛵
ship|大船|🚢
taxi|計程車|🚕
truck|卡車|🚚
motorcycle|機車|🏍️
MRT|捷運|🚇
# 3 1 en-jobs 職業
doctor|醫生|👨‍⚕️
nurse|護理師|👩‍⚕️
teacher|老師|👩‍🏫
student|學生|🧑‍🎓
cook|廚師|👨‍🍳
farmer|農夫|👨‍🌾
police officer|警察|👮
firefighter|消防員|👨‍🚒
singer|歌手|🧑‍🎤
driver|司機|🚖
worker|工人|👷
pilot|飛行員|🧑‍✈️
dentist|牙醫|🦷
# 3 1 en-subjects 學校科目
English|英文|🔤
math|數學|🔢
Chinese|國語|📖
music|音樂|🎵
art|美術|🎨
PE|體育|⚽
science|自然|🔬
class|課|🏫
homework|功課|📝
test|考試|📝
# 3 2 en-places1 地點
school|學校|🏫
park|公園|🏞️
zoo|動物園|🦒
library|圖書館|📚
hospital|醫院|🏥
supermarket|超市|🛒
restaurant|餐廳|🍽️
store|商店|🏪
bank|銀行|🏦
post office|郵局|📮
station|車站|🚉
market|市場|🧺
# 3 2 en-verbs3 動作（三）
help|幫忙|🤝
like|喜歡|❤️
want|想要|🙏
need|需要|📌
have|有|🤲
see|看見|👀
hear|聽見|👂
say|說|💬
talk|講話|🗣️
go|去|🚶
come|來|👋
make|做|🛠️
buy|買|🛍️
give|給|🎁
take|拿|🤏
# 3 2 en-adj2 形容詞（二）
fast|快的|🐇
slow|慢的|🐢
clean|乾淨的|🧼
dirty|髒的|🧦
hungry|餓的|🍽️
thirsty|渴的|🥤
tired|累的|😫
sick|生病的|🤒
busy|忙的|💼
free|有空的|🛋️
cute|可愛的|🐣
beautiful|美麗的|🌹
strong|強壯的|💪
heavy|重的|🏋️
light|輕的|🪶
# 3 3 en-feelings 心情
angry|生氣的|😠
scared|害怕的|😨
excited|興奮的|🤩
surprised|驚訝的|😲
bored|無聊的|😑
sleepy|想睡的|😴
shy|害羞的|😳
worried|擔心的|😟
fine|很好|🙂
great|很棒|🤩
# 3 2 en-animals3 動物園與海洋
whale|鯨魚|🐋
dolphin|海豚|🐬
shark|鯊魚|🦈
octopus|章魚|🐙
crab|螃蟹|🦀
penguin|企鵝|🐧
owl|貓頭鷹|🦉
fox|狐狸|🦊
wolf|狼|🐺
deer|鹿|🦌
camel|駱駝|🐫
hippo|河馬|🦛
# 3 3 en-veg 蔬菜與更多水果
carrot|紅蘿蔔|🥕
tomato|番茄|🍅
potato|馬鈴薯|🥔
corn|玉米|🌽
onion|洋蔥|🧅
cabbage|高麗菜|🥬
mango|芒果|🥭
pineapple|鳳梨|🍍
cherry|櫻桃|🍒
pear|梨子|🍐
guava|芭樂|🍈
papaya|木瓜|🧡
vegetable|蔬菜|🥦
fruit|水果|🍎
# 3 3 en-sports 運動
basketball|籃球|🏀
baseball|棒球|⚾
soccer|足球|⚽
tennis|網球|🎾
badminton|羽球|🏸
swimming|游泳|🏊
running|跑步|🏃
jump rope|跳繩|🪢
table tennis|桌球|🏓
sport|運動|🏅
# 3 3 en-time1 時間
morning|早上|🌅
afternoon|下午|🌤️
evening|傍晚|🌆
night|晚上|🌙
today|今天|📅
tomorrow|明天|➡️
yesterday|昨天|⬅️
day|白天／一天|☀️
week|星期|🗓️
year|年|🎆
o'clock|…點鐘|🕐
# 3 3 en-prep1 位置
in|在…裡面|📦
on|在…上面|⬆️
under|在…下面|⬇️
next to|在…旁邊|↔️
behind|在…後面|🔙
in front of|在…前面|🔜
between|在…中間|↔️
near|在…附近|📍
# 3 3 en-wh 疑問詞
what|什麼|❓
who|誰|🙋
where|哪裡|📍
when|什麼時候|⏰
why|為什麼|🤔
how|如何|🛠️
which|哪一個|☝️
how many|多少（個）|🔢
how much|多少（錢）|💰
how old|幾歲|🎂
# 4 1 en-days 星期
Monday|星期一
Tuesday|星期二
Wednesday|星期三
Thursday|星期四
Friday|星期五
Saturday|星期六
Sunday|星期日
weekend|週末|🎉
# 4 1 en-months 月份
January|一月
February|二月
March|三月
April|四月
May|五月
June|六月
July|七月
August|八月
September|九月
October|十月
November|十一月
December|十二月
# 4 1 en-seasons 季節與節慶
spring|春天|🌸
summer|夏天|☀️
fall|秋天|🍂
winter|冬天|⛄
Christmas|聖誕節|🎄
Halloween|萬聖節|🎃
New Year|新年|🎆
birthday|生日|🎂
holiday|假日|🏖️
vacation|假期|🧳
party|派對|🥳
gift|禮物|🎁
card|卡片|💌
# 4 2 en-places2 更多地點
museum|博物館|🏛️
theater|電影院|🎬
church|教堂|⛪
temple|寺廟|🛕
airport|機場|✈️
bookstore|書店|📚
bakery|麵包店|🥐
hotel|飯店|🏨
beach|海灘|🏖️
city|城市|🏙️
town|小鎮|🏘️
country|國家／鄉下|🗺️
street|街道|🛣️
road|道路|🛤️
bridge|橋|🌉
# 4 2 en-nature 大自然
mountain|山|⛰️
river|河|🏞️
sea|海|🌊
lake|湖|🏞️
tree|樹|🌳
flower|花|🌸
grass|草|🌿
sky|天空|☁️
moon|月亮|🌙
cloud|雲|☁️
rock|石頭|🪨
sand|沙子|🏖️
island|島|🏝️
forest|森林|🌲
# 4 2 en-house2 家中物品
refrigerator|冰箱|🧊
stove|爐子|🔥
mirror|鏡子|🪞
towel|毛巾|🧻
toothbrush|牙刷|🪥
soap|肥皂|🧼
comb|梳子|🪮
umbrella|雨傘|☂️
camera|相機|📷
computer|電腦|💻
radio|收音機|📻
fan|電風扇|🌀
light|燈|💡
# 4 2 en-routine 一天的作息
get up|起床|🛏️
wash my face|洗臉|🚿
brush my teeth|刷牙|🪥
eat breakfast|吃早餐|🍳
go to school|上學|🏫
have lunch|吃午餐|🍱
do homework|寫功課|📝
watch TV|看電視|📺
take a bath|洗澡|🛁
go to bed|上床睡覺|😴
breakfast|早餐|🥣
lunch|午餐|🍱
dinner|晚餐|🍝
# 4 3 en-adj3 形容詞（三）
young|年輕的|👶
hard|困難的／硬的|🪨
easy|簡單的|👌
quiet|安靜的|🤫
noisy|吵鬧的|📢
cheap|便宜的|🏷️
expensive|貴的|💎
full|飽的／滿的|🍚
empty|空的|🫙
wet|濕的|💦
dry|乾的|🌵
dark|暗的|🌑
bright|明亮的|🔆
soft|軟的|🧸
sweet|甜的|🍭
sour|酸的|🍋
delicious|美味的|😋
# 4 3 en-hobby 嗜好
hobby|嗜好|🎯
painting|畫畫|🎨
fishing|釣魚|🎣
camping|露營|🏕️
hiking|健行|🥾
cooking|烹飪|🍳
singing|唱歌|🎤
dancing|跳舞|💃
reading|閱讀|📖
shopping|購物|🛍️
movie|電影|🎬
music|音樂|🎵
piano|鋼琴|🎹
guitar|吉他|🎸
# 4 3 en-health 健康
headache|頭痛|🤕
stomachache|肚子痛|🤢
cold|感冒|🤧
fever|發燒|🤒
cough|咳嗽|😷
medicine|藥|💊
rest|休息|🛌
exercise|運動|🏃
healthy|健康的|💪
doctor|醫生|👨‍⚕️
# 4 3 en-pron 代名詞與所有格
I|我
you|你
he|他
she|她
it|它
we|我們
they|他們
my|我的
your|你的
his|他的
her|她的
our|我們的
their|他們的
me|我（受詞）
him|他（受詞）
them|他們（受詞）
# 4 3 en-prep2 介系詞（二）
at|在（時刻／地點）
from|從
to|到
with|和…一起
about|關於
for|為了
of|…的
by|搭乘／藉由
up|向上|⬆️
down|向下|⬇️
over|越過|🌉
# 5 1 en-feelings2 情緒（二）
nervous|緊張的|😬
proud|驕傲的|😌
lonely|寂寞的|🙍
comfortable|舒服的|😌
afraid|害怕的|😱
glad|高興的|😄
sure|確定的|✅
interested|感興趣的|🧐
lucky|幸運的|🍀
upset|難過的|😞
# 5 1 en-person 個性
kind|親切的|🤗
friendly|友善的|😊
honest|誠實的|🤝
lazy|懶惰的|🦥
smart|聰明的|🧠
brave|勇敢的|🦁
careful|小心的|⚠️
polite|有禮貌的|🙇
funny|好笑的|🤣
quiet|安靜的|🤫
helpful|樂於助人的|🙋
popular|受歡迎的|🌟
# 5 1 en-school2 學校生活
classmate|同學|🧑‍🤝‍🧑
principal|校長|🧑‍💼
playground|操場|🏃
classroom|教室|🏫
blackboard|黑板|🖤
dictionary|字典|📘
grade|年級／成績|🎓
lesson|課程|📚
question|問題|❓
answer|答案|💡
mistake|錯誤|❌
report|報告|📄
# 5 2 en-shopping 購物與金錢
money|錢|💰
dollar|元|💵
price|價錢|🏷️
cheap|便宜的|🏷️
sale|特價|🛍️
buy|買|🛒
sell|賣|🏪
pay|付錢|💳
cost|花費|💸
shopkeeper|店員|🧑‍💼
customer|顧客|🙋
wallet|皮夾|👛
# 5 2 en-travel 旅行
travel|旅行|🧳
trip|旅程|🗺️
ticket|票|🎫
map|地圖|🗺️
passport|護照|🛂
luggage|行李|🧳
visit|拜訪|🏠
arrive|到達|🛬
leave|離開|🛫
tourist|遊客|📸
picture|照片|🖼️
photo|相片|📷
# 5 2 en-tech 科技與媒體
computer|電腦|💻
Internet|網路|🌐
e-mail|電子郵件|📧
cell phone|手機|📱
video|影片|📹
game|遊戲|🎮
screen|螢幕|🖥️
message|訊息|💬
news|新聞|📰
program|節目|📺
# 5 2 en-countries 國家與語言
Taiwan|臺灣|🇹🇼
Japan|日本|🇯🇵
America|美國|🇺🇸
England|英國|🇬🇧
Korea|韓國|🇰🇷
China|中國|🇨🇳
France|法國|🇫🇷
language|語言|🗣️
foreign|外國的|🌍
world|世界|🌍
# 5 3 en-verbs4 動作（四）
finish|完成|✅
begin|開始|▶️
learn|學習|📚
teach|教|👩‍🏫
practice|練習|🎯
remember|記得|🧠
forget|忘記|🤷
understand|了解|💡
believe|相信|🙏
decide|決定|⚖️
enjoy|享受|😄
hope|希望|🌟
wait|等待|⏳
carry|搬運|📦
catch|接住|🧤
throw|丟|🤾
kick|踢|🦵
push|推|👐
pull|拉|🪢
# 5 3 en-adv 副詞
always|總是
usually|通常
often|常常
sometimes|有時候
never|從不
quickly|很快地|⚡
slowly|慢慢地|🐢
carefully|小心地|⚠️
loudly|大聲地|📢
quietly|安靜地|🤫
together|一起|🤝
again|再一次|🔁
early|早|🌅
late|晚|🌙
# 5 3 en-compare 比較
bigger|比較大
smaller|比較小
taller|比較高
shorter|比較矮
faster|比較快
slower|比較慢
older|比較老
younger|比較年輕
better|比較好
worse|比較差
the biggest|最大的
the best|最好的
# 5 3 en-classroom 課堂用語
raise your hand|舉手|🙋
be quiet|安靜|🤫
line up|排隊|🧍‍🧍
sit down|坐下|🪑
stand up|起立|🧍
open your book|打開課本|📖
listen carefully|仔細聽|👂
repeat after me|跟著我唸|🗣️
work in pairs|兩人一組|👥
hand in|繳交|📤
# 5 3 en-jobs2 職業（二）
actor|演員|🎭
writer|作家|✍️
reporter|記者|🎤
engineer|工程師|⚙️
scientist|科學家|🔬
businessman|商人|💼
soldier|軍人|🪖
mail carrier|郵差|📮
waiter|服務生|🧑‍🍳
secretary|祕書|🗂️
lawyer|律師|⚖️
artist|藝術家|🎨
# 6 1 en-env 環境
environment|環境|🌍
pollution|汙染|🏭
recycle|回收|♻️
trash|垃圾|🗑️
energy|能源|⚡
plant|植物／種植|🌱
earth|地球|🌏
air|空氣|💨
save|節省／拯救|💧
protect|保護|🛡️
nature|大自然|🌿
weather|天氣|🌦️
# 6 1 en-city 城市生活
traffic|交通|🚦
corner|轉角|↩️
block|街區|🏢
building|建築物|🏢
elevator|電梯|🛗
stairs|樓梯|🪜
office|辦公室|🏢
factory|工廠|🏭
hospital|醫院|🏥
police station|警察局|🚓
fire station|消防局|🚒
convenience store|便利商店|🏪
# 6 1 en-past 不規則過去式
went|go 的過去式（去了）
ate|eat 的過去式（吃了）
saw|see 的過去式（看見了）
had|have 的過去式（有）
came|come 的過去式（來了）
made|make 的過去式（做了）
took|take 的過去式（拿了）
ran|run 的過去式（跑了）
wrote|write 的過去式（寫了）
bought|buy 的過去式（買了）
said|say 的過去式（說了）
got|get 的過去式（得到了）
did|do 的過去式（做了）
was|is 的過去式
were|are 的過去式
read|read 的過去式（讀了）
drank|drink 的過去式（喝了）
swam|swim 的過去式（游了）
gave|give 的過去式（給了）
found|find 的過去式（找到了）
told|tell 的過去式（告訴了）
thought|think 的過去式（想了）
knew|know 的過去式（知道）
slept|sleep 的過去式（睡了）
sang|sing 的過去式（唱了）
drew|draw 的過去式（畫了）
flew|fly 的過去式（飛了）
left|leave 的過去式（離開了）
# 6 2 en-conj 連接詞
and|和
but|但是
or|或者
so|所以
because|因為
if|如果
when|當…的時候
before|在…之前
after|在…之後
although|雖然
then|然後
also|也
# 6 2 en-quant 數量詞
some|一些
any|任何
many|很多（可數）
much|很多（不可數）
a few|一些（可數）
a little|一點（不可數）
a lot of|很多
every|每一個
all|全部
both|兩者都
each|每個
most|大部分
# 6 2 en-abstract 抽象名詞
idea|想法|💡
dream|夢想|💭
future|未來|🔮
problem|問題|⚠️
plan|計畫|📋
chance|機會|🎯
experience|經驗|🧭
habit|習慣|🔁
health|健康|💪
peace|和平|☮️
hobby|嗜好|🎯
story|故事|📖
history|歷史|🏛️
culture|文化|🏮
# 6 2 en-science 科學與自然（二）
animal|動物|🐾
insect|昆蟲|🐞
dinosaur|恐龍|🦖
space|太空|🚀
planet|行星|🪐
sun|太陽|☀️
star|星星|⭐
rainbow|彩虹|🌈
typhoon|颱風|🌀
earthquake|地震|🌋
volcano|火山|🌋
desert|沙漠|🏜️
ocean|海洋|🌊
# 6 3 en-safety 健康與安全
safe|安全的|🛡️
dangerous|危險的|⚠️
careful|小心的|⚠️
accident|意外|🚑
hurt|受傷|🤕
help|幫助|🆘
seat belt|安全帶|🚗
helmet|安全帽|⛑️
rule|規則|📏
emergency|緊急狀況|🚨
# 6 3 en-adj4 形容詞（四）
important|重要的|⭐
different|不同的|🔀
same|相同的|🟰
special|特別的|✨
famous|有名的|🌟
real|真的|✅
possible|可能的|🎲
difficult|困難的|🧗
simple|簡單的|👌
modern|現代的|🏙️
traditional|傳統的|🏮
convenient|方便的|👍
terrible|糟糕的|😱
wonderful|很棒的|🤩
# 6 3 en-junior 國中銜接
prepare|準備|📋
collect|收集|🗂️
invite|邀請|💌
celebrate|慶祝|🎉
share|分享|🤝
join|加入|➕
borrow|借（入）|📥
lend|借（出）|📤
spend|花費|💸
cheer|加油|📣
agree|同意|👍
explain|解釋|🗣️
improve|進步|📈
succeed|成功|🏆
`;
