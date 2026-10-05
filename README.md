# 小小學習家

小學生英文、數學、國語學習遊戲（PWA）。零後端、可離線、資料只存在本機。

- v1：依《小學生三科學習遊戲 App 企劃書》——殼層 + 共用學習引擎 + 15 款遊戲。
- v2：融合《國小遊戲化學習 APP 產品與教學設計企劃》——冒險島首頁與今日路線、四段式掌握度（含隔日保留）、
  錯誤即教學（提示後再試一次）、找證據的閱讀、情境對話、數字廚房等 6 款新遊戲（共 21 款）、錯誤型態分析。
- v3：依《多角色實測改善報告》全面調整——題庫擴大（284 個知識點、849 個英文字詞、901 個國字、每年級多篇閱讀，數學與英文句型／克漏字改為模板生成）、
  低年級題不再淹沒中高年級、應用類內容新手就讀得到、二選一題補齊、教育部注音音檔、無語音時的文字備援、
  第二次答錯附解釋與錯題回顧、魔王三顆心、鍵盤作答下放、時鐘／角度／面積公式／折線圖等課綱缺口、
  英文語音可選美／英口音與男／女聲、同步碼跨裝置還原、楷體與 Andika 內嵌字型、Service Worker 版本自動雜湊與更新提示、題庫稽核腳本。
- v3.1：語音與注音——中文朗讀把阿拉伯數字轉成口語（2 個 → 兩個、2/3 → 三分之二、8:30 → 八點三十分）、
  每一題都能按 🔊 唸出來（算式與文字題由畫面文字組出朗讀內容）、題目注音（家長專區或遊戲中按「ㄅ」開關；考讀音的題型不標）、
  中英文語速分開設定、題目／說明／音效三種音量、優先挑臺灣中文語音（自然語音 → Google → 美佳 → 其他臺灣語音，不用粵語）、注音音檔音量正規化。
- v3.2：參考「星芽探險」——新增 C9 注音組裝站（看字聽音，依序選聲母、韻母、聲調）、C10 詞語連連看（兩欄配對相反詞／相似詞／成語，共 23 款）；
  答錯第二次時說明會停留，按「我知道了，下一題」才繼續；點題目的指示文字就能聽一次。
- v3.3：遊戲風外觀（參考手機遊戲與 Lingokids／Khan Kids）——頂部狀態列與計數膠囊、立體小島、關卡點路線、
  收藏卡風格的遊戲卡（能力值／NEW）、光澤立體按鈕與選項、新手引導小手；家長專區改成「報告／技能地圖／設定／資料」分頁；
  第一次開啟的功能介紹蓋屏、使用手冊（家長端／小朋友端／常見問題）、意見回饋（寫進 Google 試算表，離線時先存起來之後補送）。
- v3.4：新增「益智島」5 款益智遊戲（水果三消、方塊下落、數字合成、方塊拼圖、彩球分類），關卡地圖＋三星評分、依年級決定起始關、
  連輸 3 次提供簡單版、每過兩關開「知識寶箱」；翻牌卡長單字自動縮小；語音把「數一數」等多音字唸對；Service Worker 安裝時不吃瀏覽器舊快取。
- v3.5：每一局結束後都有「這一場的回顧」（題目、正確答案、孩子選錯的答案、說明，可再聽一次，可只看要再練的題目）；
  字母音氣球的圖片選項附上中文、長單字自動縮小並加寬氣球。

## 益智島的設計依據

參考長青益智遊戲（Candy Crush、Tetris、2048、Katamino／GiiKER、Ball Sort）讓人每天想玩的元素，並刪掉不適合孩子的部分：

| 採用 | 做法 |
|---|---|
| 短關卡、單一明確目標 | 一關 1–3 分鐘；目標寫在畫面上方（收集 8 個 🍎、消 5 排、合成 128） |
| 立即回饋與連鎖 | 消除動畫、連鎖 ×2 提示、音效；每次合成顯示算式 |
| 難度曲線（心流） | 依年級決定起始關；連輸 3 次提供「簡單一點」；過關才往下一關 |
| 看得見的進度 | 關卡地圖、每關三星、首頁卡片顯示目前關卡與總星數 |
| 差一點點的再挑戰 | 失敗時告訴孩子「只差 2 個」，一鍵重來 |
| 學科元素 | 三消唸英文單字、合成顯示加法／乘法、拼圖顯示面積算式、彩球低年級是注音並播放發音、每兩關一題知識寶箱 |

| 不採用 | 原因 |
|---|---|
| 體力、等待時間、付費續命 | 屬於操弄手法，對孩子不健康 |
| 無限時間 | 益智島和學習遊戲共用每日時間上限 |

參考資料：[Deconstructing Candy Crush（Emerald）](https://www.emerald.com/insight/content/doi/10.1108/ijilt-09-2014-0019/full/html)、
[Game Developer：Candy Crush 設計分析](https://www.gamedeveloper.com/design/candy-crush-saga-a-sweet-journey-into-monetization)、
[Yu-kai Chou：Candy Crush 遊戲機制](https://yukaichou.com/gamification-study/game-mechanics-research-candy-crush-addicting/)、
[ScienceDaily：拼圖與積木有助孩子空間能力](https://www.sciencedaily.com/releases/2015/01/150128131323.htm)、
[ScienceDirect：Tetris 作為認知訓練的限制](https://www.sciencedirect.com/science/article/abs/pii/S0361476X17304988)。

## 架構

| 檔案 | 內容 |
|---|---|
| `js/core.js` | 工具、存檔（localStorage）、語音與音效、**學習引擎**（知識點、Leitner 間隔復習、滾動正確率自適應、精熟判定、探測題、示範卡觸發） |
| `js/data-zhuyin.js` | 題目注音字典（由 `tools/build-zhuyin.js` 產生：內容檔用到的字的預設讀音 + 多音詞） |
| `js/data-en.js`、`js/data-zh-chars.js` | 英文字彙表（依教育部 1200 字詞分主題分級）、國字表（由 `tools/zh-chars.txt` 產生，注音取自 Unihan 臺灣讀音）|
| `js/content-*.js` | 三科內容包：知識點定義、題庫資料與模板生成器、選擇題產生器 |
| `js/content-plus.js` | v2 內容：閱讀證據句、情境對話、句子修理、數字廚房、圖表、自動解題提示 |
| `js/games-*.js` | 遊戲模組，各自只負責「呈現題目、接收答案」；`games-plus.js` 是 v2 新增的 6 款，`games-more.js` 是 v3.2 新增的 2 款 |
| `js/puzzles.js`、`css/puzzles.css` | 益智島：共用關卡框架（地圖、三星、簡單版、知識寶箱）與 5 款益智遊戲 |
| `js/help.js` | 功能介紹蓋屏、使用手冊、意見回饋（端點設定在檔頭，Apps Script 原始碼見 `tools/feedback-apps-script.gs`） |
| `css/theme.css` | v3.3 遊戲風外觀（只覆寫外觀，版面在 `css/app.css`） |
| `js/shell.js` | 殼層：學習者檔案、首頁任務板、結算、魔王挑戰、圖鑑、家長專區 |
| `sw.js` | 離線快取（cache-first） |
| `vendor/` | 筆順套件 hanzi-writer（MIT）與筆順資料（源自 Make Me a Hanzi，Arphic Public License） |

## 修改後要做的事

- 改了任何檔案 → 執行 `node tools/build.js`，會重算雜湊、產生 `sw.js`（使用者下次開啟會看到「有新版本」提示）。
- 在 `tools/zh-chars.txt` 新增國字 → `node tools/build-chars.js <Unihan_Readings.txt>`（Unihan 從 unicode.org 下載），
  再 `node tools/build-hanzi.js <node_modules 路徑>`（需先 `npm i hanzi-writer-data`）重新打包筆順。
- 新增中文內容後若出現缺字 → `node tools/build.js --font <LXGWWenKaiTC-Regular.ttf>` 重新子集化楷體（需要 `python -m pip install fonttools brotli`）。
- 新增中文內容後 → `node tools/build-zhuyin.js <資料夾>` 重新產生注音字典（資料夾內放 libchewing-data 的 `dict/chewing/tsi.csv`）；
  讀音不對時改腳本裡的 `OVER`（單字）、`DROP`／`SUB`／`ADD`（詞）。
- 題庫稽核：`node tools/audit.js 200`（選項數、重複、空白、語音備援、新手抽到低年級題比例）。
- 重新產生圖示：`python tools/make-icons.py`（需要 Pillow）。

## 素材授權

- 注音符號音檔：2017 © 教育部《國語注音符號手冊》開放部件，CC BY 4.0（`vendor/bpmf/LICENSE_MOE.txt`）；本專案已將音量正規化（調大）。
- 題目注音字典：衍生自 libchewing-data（新酷音詞庫，LGPL-2.1-or-later），https://github.com/chewing/libchewing-data 。
- 筆順：hanzi-writer（MIT）、Make Me a Hanzi 資料（Arphic Public License）。
- 字型：LXGW WenKai TC、Andika（SIL Open Font License）。

## 本機預覽

```bash
python -m http.server 8765
```

然後開 http://localhost:8765 。
