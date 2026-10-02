# 小小學習家

小學生英文、數學、國語學習遊戲（PWA）。依《小學生三科學習遊戲 App 企劃書 v1.0》開發：
一個殼層 + 共用學習引擎 + 15 款小遊戲，小一～小六內容，零後端、可離線、資料只存在本機。

## 架構

| 檔案 | 內容 |
|---|---|
| `js/core.js` | 工具、存檔（localStorage）、語音與音效、**學習引擎**（知識點、Leitner 間隔復習、滾動正確率自適應、精熟判定、探測題、示範卡觸發） |
| `js/content-*.js` | 三科內容包：知識點定義、題庫資料、選擇題產生器 |
| `js/games-*.js` | 15 款遊戲模組，各自只負責「呈現題目、接收答案」 |
| `js/shell.js` | 殼層：學習者檔案、首頁任務板、結算、魔王挑戰、圖鑑、家長專區 |
| `sw.js` | 離線快取（cache-first） |
| `vendor/` | 筆順套件 hanzi-writer（MIT）與筆順資料（源自 Make Me a Hanzi，Arphic Public License） |

## 修改後要做的事

- 改了任何檔案 → `sw.js` 的 `CACHE` 版號 +1，使用者才會拿到新版。
- 在 `content-zh.js` 的 `CH(...)` 新增國字 → 重新產生筆順資料：
  `npm i hanzi-writer-data` 後執行 `node tools/build-hanzi.js <node_modules 路徑>`。
- 重新產生圖示：`python tools/make-icons.py`（需要 Pillow）。

## 本機預覽

```bash
python -m http.server 8765
```

然後開 http://localhost:8765 。
