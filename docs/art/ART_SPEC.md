# 小小學習家 美術規格：森林繪本風格

這份文件告訴你（或插畫家、AI 生成工具）要畫哪些圖、畫成什麼樣子、存成什麼檔名。
完整的逐張清單在 [`assets.csv`](assets.csv)，可以用 Excel 或 Google 試算表開，「狀態」欄可以自己記錄進度。
清單由 `node tools/art-list.js` 從遊戲內容自動產生；之後新增內容，重跑一次就會補上新的物件。

---

## 1. 風格

**一句話**：有立體感的繪本風手機遊戲，像動畫電影的概念圖——圓潤有體積、柔和光影、有景深，森林小島的午後陽光。
（不是平面水彩插畫；參考 `docs/art/ref/style-mockup.webp` 那張概念圖。）

| 項目 | 規則 |
|---|---|
| 立體感 | 物體有**體積和柔和的明暗**，有輪廓光（rim light）和接觸陰影；**沒有黑色外框線**，邊緣靠光影分出來 |
| 景深 | 背景分前景（稍微模糊）、中景（清楚）、遠景（有空氣感、偏淡） |
| 質感 | 看得到蓬鬆的毛、木紋、布紋、水果的亮光 |
| 光線 | 溫暖的午後金色光，**光一律從左上方來** |
| 造型 | 圓潤、可愛、比例偏 Q（頭大身體小），大眼睛有反光點，沒有尖銳或嚇人的東西 |
| 介面 | 木頭要**有厚度**：雕刻、倒角、上緣亮光、下方陰影；羊皮紙卡片、葉子和藤蔓點綴；不要塑膠亮面、不要霓虹發光 |
| 文字 | **圖裡絕對不要有任何文字、數字、注音、字母**，所有字都由程式疊上去（AI 畫中文一定會畫錯，而且要能切換注音、語言） |
| 情緒 | 角色永遠友善；「答錯」只能是溫柔鼓勵，不可以難過、哭、生氣 |

### 色票

| 名稱 | 色碼 | 用途 |
|---|---|---|
| 葉綠 | `#5E8C4A` | 主色、成功、次要按鈕 |
| 苔綠 | `#8DB255` | 草地、亮部 |
| 木頭棕 | `#8B5A2B` | 木牌、導覽列、外框 |
| 羊皮紙 | `#FFF4DC` | 卡片底、對話框 |
| 陽光黃 | `#F6C343` | 主要按鈕、星星、強調 |
| 莓果紅 | `#D9483B` | 重點數字、注意 |
| 湖水藍 | `#5BB8D6` | 水、天空、英文 |

另外三科在介面上用一點點色彩區分（只用在小標籤、邊框），不要改變整體風格：國語＝莓果紅、數學＝陽光黃、英文＝湖水藍。

---

## 2. 角色

每個角色**先做一張「角色設定圖」**：同一隻角色的正面、側面、背面，加上 6 種表情（開心、驚喜、思考、加油、害羞、睡覺），放在同一張圖上。
之後生成每一個動作時，都把這張設定圖一起丟給 AI 當參考，角色才不會每張長得不一樣。設定圖存成 `docs/art/ref/<角色>-sheet.png`（不會放進 App）。

| 角色 | 設定 | 出現在 |
|---|---|---|
| **小狐**（嚮導、吉祥物） | Q 版小紅狐狸，奶油色胸口和嘴巴，大大的琥珀色亮眼睛，蓬鬆尾巴尖端是白色；圍**葉綠色圍巾**、背**咖啡色小皮包** | 首頁、提示小手、答對答錯、結算、休息提醒 |
| **小兔**（廚房客人） | 圓滾滾的白兔，粉紅耳朵內側、紅臉頰；穿**黃色白點小圍裙** | 數字廚房、數數題 |
| **熊熊**（餵小熊） | 胖胖的棕色小熊，淺棕肚子；綁**紅色小領巾** | 餵小熊 |
| **貓頭鷹老師** | 圓圓的棕色貓頭鷹，**大圓眼鏡、綠色小領結**，常拿著書 | 學習步道、故事屋 |
| **寵物（5 階段）** | 蛋 → 破殼寶寶 → 小小雞 → 小恐龍 → 學習神龍（都是森林繪本風） | 我的島 |
| **魔王（3 隻）** | 湖底章魚、夜空星星怪、森林苔蘚龍；**調皮不可怕** | 魔王挑戰 |

---

## 3. 檔案規格

### 資料夾與檔名

```
assets/
  bg/      背景         例：bg/home-island.webp
  char/    角色         例：char/fox-cheer.webp（角色-動作）
  ui/      介面元件     例：ui/btn-yellow.webp
  icon/    小圖示       例：icon/coin.webp
  game/    遊戲卡插圖   例：game/c11.webp（遊戲代號）
  item/    物件         例：item/1f353.webp（🍓 的 Unicode 碼）
```

- 檔名全部用英文小寫和連字號，**請照 `assets.csv` 的檔名存**，程式會自動對應。
- **物件用 emoji 的 Unicode 碼當檔名**：遊戲裡原本用 🍓 的地方，只要 `assets/item/1f353.webp` 存在就會自動換成這張圖；沒有圖就繼續顯示 emoji。所以物件可以一張一張慢慢補。

### 尺寸與格式

| 類別 | 尺寸 | 背景 | 格式 | 備註 |
|---|---|---|---|---|
| 背景 | 2048×2048（賽道 2048×1024） | 不透明 | WebP | 重要內容放中間 1200×1200 範圍內，手機直式和平板橫式都會從中間裁切 |
| 角色 | 1024×1024 | 透明 | WebP | 角色腳底對齊畫面下緣往上 6%，四周留白 |
| 物件 | 512×512 | 透明 | WebP | 物件佔畫面約 80%，四周留白一致 |
| 圖示 | 256×256 | 透明 | WebP | 縮到 48px 還要看得懂 |
| 遊戲卡 | 512×512 | 透明 | WebP | 一個清楚的主角或小場景 |
| 介面元件 | 依清單 | 透明 | WebP | 「9-slice」：四個角不拉伸、中間會被拉長，清單註明的邊框寬度內不要放圖案 |

- 原始大圖（PNG、PSD）放在 App 以外的地方保存；放進 `assets/` 的是壓縮後的版本。
- WebP 品質 80–85；單張物件建議小於 60KB、背景小於 400KB。第一階段全部約 3–5MB。

---

## 4. 怎麼用 AI 生成

### 提示詞架構

每一列的提示詞都照這個公式：

```
[Master Style Prefix] + [Category Scaffolding]: [Subject Details]. [類別收尾] --no [Negative Rules]
```

- **Master Style Prefix**（只有背景、角色加；物件、圖示、遊戲卡、介面元件直接以類別開頭，比較短、主體比較清楚）：
  > `Premium storybook-style mobile game art, painterly digital illustration with soft 3D volume and depth, cozy animated film concept painting, rounded chunky shapes, warm golden afternoon sunlight from the top-left, gentle rim light, soft ambient occlusion and contact shadows. Palette of leaf green, warm wood brown, cream parchment, sunny yellow, berry red.`
- **Category Scaffolding**：

  | 類別 | 開頭 | 收尾重點 |
  |---|---|---|
  | 背景 | `Wide environment scene with strong depth:` | 前景微模糊、中景清楚、遠景有空氣感；中央留給介面 |
  | 角色 | `Single full-body character:` ＋角色 token | 蓬鬆毛質、大眼反光、左上輪廓光、純白背景、接觸陰影 |
  | 物件 | `Single 3D storybook game object:` | 圓潤比例、材質細節、俯角 3/4、柔和明暗與亮點 |
  | 圖示 | `Chunky 3D game icon:` | 圓潤飽滿、微光澤、倒角、縮小仍清楚 |
  | 遊戲卡 | `Game menu card illustration: miniature storybook diorama of` | 3/4 透視、圓形構圖、微型場景感 |
  | 介面元件 | `Game UI element with real thickness:` | 厚實倒角木頭或厚羊皮紙、葉片點綴、完全空白 |

- **Negative Rules**（放在最後 `--no` 後面；Midjourney 直接支援，ChatGPT／Gemini 也看得懂）：
  > `text, letters, Chinese characters, numbers, watermark, signature, flat vector art, flat colors, simple 2D cartoon, thick black outlines, cel shading, line art, plastic toy, photorealism, neon glow, sharp creepy faces, extra limbs`
- **角色 token**（第 2 節的設定，每張角色圖都一字不差地帶上，例如小狐：`chibi red fox cub, cream chest and muzzle, large glossy amber eyes, fluffy brush tail with white tip, wearing a leaf-green scarf (#5E8C4A) and a small brown leather satchel`）。

### 三個檔案

| 檔案 | 用途 |
|---|---|
| `assets.csv` | 完整清單：編號、階段、檔名、尺寸、透明、用在哪裡、提示詞、狀態（自己記進度） |
| `prompts.csv` | 精簡版（`kind,filename,name,prompt`），方便直接複製或丟給批次生成工具 |
| `prompt-overrides.csv` | **人工調整過的提示詞**（同樣四欄）。這裡的會蓋掉自動產生的那一列；想精修某一張，就把它加進這個檔再跑一次 `node tools/art-list.js` |

物件的主體會寫成「英文（中文）」，例如 `dog (小狗、狗), as in the emoji 🐶`；想要更好的效果，可以像草莓那樣把材質、形狀寫具體，加進 `prompt-overrides.csv`。

0. **最有效的一步：把你喜歡的那張概念圖當「風格參考圖」一起上傳。** 存成 `docs/art/ref/style-mockup.webp`，每次生成都附上，並加一句「請完全照這張參考圖的畫風、立體感、光線和材質」。只靠文字描述，AI 很容易畫成平面插畫。
   - ChatGPT／Gemini：直接上傳參考圖，再貼提示詞。
   - Midjourney：`--sref <參考圖網址> --sw 300`（風格權重調高），角色另外加 `--cref`。
   - 如果畫出來還是太平：在提示詞最前面加「soft 3D, volumetric lighting, depth of field」，或請它「照參考圖重畫一次，只把主體換成 ○○」。
1. **先做角色設定圖和 1 張背景**（建議 `bg/home-island`），反覆調整到滿意，這兩張就是之後所有圖的「風格參考」。
2. 之後每次生成都**附上這幾張參考圖**；ChatGPT 圖像、Gemini 可以直接上傳參考圖，Midjourney 用 `--sref`（風格）和 `--cref`（角色）。
3. 一次生成同一類的一批（例如 10 個水果），比較容易一致。
4. 需要透明背景的圖：提示詞已經要求「白色背景」，生成後用去背工具處理（如 remove.bg、Photoshop、Canva 去背），再存成 WebP。
5. 物件的主體欄位是中文詞，ChatGPT、Gemini 看得懂；用 Midjourney 時請把主體翻成英文。
6. 商用前確認你使用的 AI 工具的授權條款，並保留生成紀錄。

### 檢查清單（每張圖收進來前）

- [ ] 沒有任何文字、數字、字母、注音
- [ ] 有立體感（體積、光影、景深），不是平面插畫；光從左上方來，色調跟參考圖一致
- [ ] 角色長相跟設定圖一致（圍巾顏色、眼睛、配件）
- [ ] 透明背景乾淨，邊緣沒有白邊
- [ ] 檔名、尺寸跟 `assets.csv` 一樣
- [ ] 縮小到手機上看還認得出是什麼

---

## 5. 分三階段做

| 階段 | 內容 | 數量 | 效果 |
|---|---|---|---|
| **第一階段** | 背景、角色、介面元件、圖示、遊戲卡 | 109 張 | 整個 App 的「樣子」換掉，最有感 |
| **第二階段** | 遊戲裡常出現的物件：看圖識詞、注音例詞、故事屋、數學數數物件、英文拼讀 | 305 張 | 題目畫面變成繪本風 |
| **第三階段** | 其他英文單字、小島收藏裝飾 | 264 張 | 補完長尾；做好之前先用一致的圖示庫代替 |

建議順序：角色設定圖 → `bg/home-island` → 介面元件 → 小狐 8 個動作 → 其他背景 → 圖示 → 遊戲卡 → 第二階段。

---

## 6. 交給程式（匯入新的一批圖）

```bash
python tools/import-art.py <生成圖資料夾>
node tools/build.js
```

- `import-art.py` 依「建立時間」排序後的編號對應檔名：第 0–110 張是第一階段（對照表寫在腳本的 `MAP`），第 111 張起依 `assets.csv` 的物件順序。
  重新生成某一張、或順序不一樣時，可以另外給一份對照表：`python tools/import-art.py <資料夾> 對照表.json`（格式 `{"來源檔名.png": "item/1f353"}`）。
- 會自動縮放、壓成 WebP（背景 1254、角色 512、物件與遊戲卡 384、圖示 256），介面元件會裁掉透明邊。
- `build.js` 會重新產生 `js/art-manifest.js`（有哪些圖），App 就會「有圖用圖、沒圖用 emoji」。
- 物件圖（`assets/item/`）不預先下載，第一次出現時才存進離線快取，App 不會一次變很大。
- 家長專區 → 設定 →「繪本美術」可以關掉，改回圖示。
