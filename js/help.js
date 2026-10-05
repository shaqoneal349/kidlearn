'use strict';
// 說明與回饋：第一次開啟的功能介紹（蓋屏）、使用手冊（家長端／小朋友端／常見問題）、意見回饋（寫進 Google 試算表）
(() => {
  const K = KL, h = K.h, A = K.audio;

  // 意見回饋端點：和「小小任務家」共用同一支 Google Apps Script（tools/feedback-apps-script.gs）。
  // 「App 版本」欄會寫成「小小學習家 x.y.z」，在試算表裡可以用這欄分辨是哪個 App 的回饋。
  const FEEDBACK_URL = 'https://script.google.com/macros/s/AKfycby3BK_6DX6ViNXeC-ArWvzBeN0pqLmpesIrf-upKT5ewcIHEND9OFt6w37uEjIHKEQWbw/exec';
  const FEEDBACK_TOKEN = 'kq-2026-fb'; // 不是密碼，只是擋掉亂掃網址的機器人
  const APP = '小小學習家';
  const ver = () => `${APP} ${K.VERSION || ''}`.trim();
  const S = () => K.store.data.settings;
  const D = () => K.store.data;
  const layer = () => { let el = document.getElementById('sheet'); if (!el) { el = h('div', null, { id: 'sheet' }); document.body.append(el); } return el; };
  const close = () => layer().replaceChildren();
  const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  // ---------- 功能介紹（第一次開啟、或在家長專區按「重看介紹」）----------
  const SLIDES = [
    { art: '🏝️', tag: '歡迎來到', t: '小小學習家', p: '英文・數學・國語三座學習島，<br>35 款小遊戲＋學習步道＋故事屋，每天 15 分鐘，<br>玩著玩著就學會。' },
    { art: '🧭', tag: '🧒 小朋友', t: '今天玩什麼，<br>跟著路線走就好', b: [['🗺️', '首頁的「今日冒險」幫你排好路線，按「出發」就開始'], ['🎯', '題目會跟著你的程度自動變難或變簡單'], ['💡', '答錯沒關係：先給提示，再試一次']] },
    { art: '🔊', tag: '👂 聽得懂、看得懂', t: '每一題都能唸，<br>還能加注音', b: [['🔊', '按喇叭就會唸題目，點上面的指示文字也會唸'], ['ㄅ', '遊戲右上角的「ㄅ」可以開關注音'], ['🐢', '語速、音量都能在家長專區調整']] },
    { art: '📚', tag: '✨ v4 新功能', t: '一步一步學，<br>還有會說話的書', b: [['📚', '學習步道：注音、ABC、數字，每課「認識→小書→遊戲」'], ['📖', '故事屋：25 本書，每個字都能點，會拼注音、看筆順'], ['🏎️', '賽車車庫：答對賺金幣，升級賽車去比賽'], ['💪', '開始前可選「挑戰難一點」，金幣加倍']] },
    { art: '🥚', tag: '🎁 收集與成長', t: '練習會讓寵物長大，<br>還能裝飾小島', b: [['🎖️', '每玩完一局得到一張收藏貼紙'], ['🐣', '學會的技能越多，寵物就會長大'], ['👑', '完成三座島再挑戰跨科魔王']] },
    { art: '👪', tag: '🔒 家長專區', t: '看報告、調設定，<br>都在右上角', b: [['📈', '每天學了什麼、哪裡卡住、近 4 週進步'], ['⏰', '可設定每日時間上限與休息提醒'], ['💾', '資料只存在這台裝置，記得用同步碼備份'], ['📖', '完整說明在「家長專區 → 設定 → 使用手冊」']] }
  ];
  K.help = {};
  K.help.intro = done => {
    let i = 0;
    const track = h('div', 'in-track'), dots = h('div', 'in-dots'), next = h('button', 'btn pri in-next'), skip = h('button', 'in-skip', { text: '略過介紹' });
    SLIDES.forEach(s => track.append(h('div', 'in-slide', null,
      h('span', 'in-tag', { text: s.tag }), h('div', 'in-art', { text: s.art }), h('h2', null, { html: s.t }),
      s.p && h('p', null, { html: s.p }),
      s.b && h('div', 'in-bul', null, s.b.map(([ic, t]) => h('div', null, null, h('b', null, { text: ic }), h('span', null, { text: t })))))));
    const paint = () => {
      dots.replaceChildren(...SLIDES.map((_, j) => h('i', j === i ? 'on' : '')));
      next.textContent = i >= SLIDES.length - 1 ? '開始冒險 🚀' : '下一步 →'; skip.style.visibility = i >= SLIDES.length - 1 ? 'hidden' : 'visible';
    };
    const go = j => { i = Math.max(0, Math.min(SLIDES.length - 1, j)); track.scrollTo({ left: track.clientWidth * i, behavior: 'smooth' }); paint(); };
    const end = () => { S().introSeen = 1; K.store.save(); A.stop(); close(); done && done(); };
    next.onclick = () => { A.sfx('tap'); i >= SLIDES.length - 1 ? end() : go(i + 1); };
    skip.onclick = () => { A.sfx('tap'); end(); };
    track.addEventListener('scroll', () => { const j = Math.round(track.scrollLeft / Math.max(1, track.clientWidth)); if (j !== i) { i = j; paint(); } }, { passive: true });
    layer().replaceChildren(h('div', 'in-wrap', null, track, h('div', 'in-foot', null, dots, next, skip)));
    paint();
  };

  // ---------- 使用手冊 ----------
  const sec = (icon, title, items) => h('div', 'man-sec', null, h('h3', null, { text: `${icon} ${title}` }), h('ul', null, null, items.map(t => h('li', null, { html: t }))));
  const MANUAL = {
    parent: () => [
      sec('🚀', '開始使用', ['第一次打開：按「新增小朋友」，填名字、選頭像和年級。年級只是起點，系統會依表現自動調整。', '建立後會問要不要玩「小探險」：每科幾題，幫孩子找到剛剛好的起點。可以先跳過，之後在「家長專區 → 報告 → 重做起點診斷」再做。', '一台裝置可以建立好幾位小朋友，首頁左上角點頭像就能換人，紀錄各自獨立。']),
      sec('🔒', '進入家長專區', ['首頁右上角 👪 → 按住按鈕 2 秒 → 回答一題乘法（或輸入你設定的四位數密碼）。', '這樣做是為了不讓小朋友誤闖，不是真正的資安保護。']),
      sec('📈', '報告分頁', ['<b>今天與最近 7 天</b>：有效學習分鐘數、作答題數、練習了哪些技能。', '<b>近 4 週獨立答對率</b>：只算「第一次、沒看提示就答對」的題目，比較能反映真實程度。', '<b>卡住的地方</b>：最常錯的技能與錯誤型態（例如「答案差 10」代表進位／退位還不熟），以及下一步建議。', '<b>小檢定</b>：10 題不給提示，建議每月做一次對照。']),
      sec('🗺️', '技能地圖分頁', ['每個知識點一顆小標籤：灰色未開始、黃色新手／熟悉、綠色穩定、深綠精熟。', '點一下標籤可以看掌握度、近期正確率、隔日保留率等細節。', '「精熟」要隔日也答對、而且相隔一週以上還記得，避免只是當天短期記憶。']),
      sec('⚙️', '設定分頁', ['<b>各科程度</b>：孩子超前或落後時可直接調整年級與星等。', '<b>每日上限</b>：時間到了只能玩安靜的閱讀與寫字活動；也能「今天再加 10 分鐘」。', '<b>題目加注音／自動唸題目</b>：小一小二預設打開。考注音、考讀音的題目不會標，以免看到答案。', '<b>語音與音量</b>：中英文語速分開調；題目、說明、音效三種音量。建議用 Edge 或安裝「中文（台灣）」語音，發音最自然。']),
      sec('💾', '資料分頁', ['資料只存在這台裝置的瀏覽器裡，不會上傳。', '<b>換裝置</b>：舊裝置按「複製同步碼」，在新裝置的家長專區貼上「用同步碼還原」。', '清除瀏覽器資料、或刪除主畫面圖示前，請先備份。', '可以匯出技能紀錄、作答事件 CSV，用試算表自己分析。'])
    ],
    kid: () => [
      sec('🏝️', '首頁', ['上面是你的小島和寵物，玩越多寵物會長大。', '「今日冒險」排好今天的路線，按大大的「出發」就開始。', '下面三座島可以自由選喜歡的遊戲。']),
      sec('📚', '學習步道與故事屋', ['首頁的「學習步道」：每一課有三個活動——👀 認識（跟著小手點一點）、📖 小書或兒歌、🎮 遊戲，三個都做完得到一顆星。', '「故事屋」裡的書，每個字都可以點：會一個一個唸出注音、再唸出整個字，還能看筆順。按 👂 聽整句，翻頁前偶爾會有「猜一猜」。', '讀完一本書回答兩題，最多三顆星。今天的遊戲時間到了，還是可以看故事。']),
      sec('🏎️', '金幣與賽車', ['在學習遊戲裡第一次就答對得到 1 枚金幣，選「挑戰難一點」得到 2 枚。', '到「賽車車庫」用金幣升級速度、引擎、輪胎，再去比賽。比賽時撞到石頭要答一題，答對有渦輪加速！']),
      sec('🎮', '玩遊戲的時候', ['🔊 再聽一次題目；點上面的指示文字也會唸。', '💡 需要提示時按燈泡，會幫你刪掉一個錯的答案。', '上面的圓點是進度，答一題亮一顆；Lv 燈號是目前的難度，系統會依你的表現自動調整。', '一陣子沒動作時，小手會指給你看該點哪裡。', 'ㄅ 右上角可以開關注音。', '答錯一次會給提示再試一次；第二次答錯會告訴你答案和原因，看懂了再按「下一題」。']),
      sec('🎖️', '收集', ['每玩完一局會得到一張貼紙，貼到你的小島上。', '三座島都玩過，就能挑戰「跨科魔王」。']),
      sec('😴', '休息', ['每天有時間上限，時間到了讓眼睛休息，明天再來！', '玩一陣子寵物會提醒你看看遠方、喝口水。'])
    ],
    faq: () => [
      ['沒有聲音？', '先確認裝置沒有靜音、音量有開。iPhone 要把側邊的靜音開關關掉。再到「家長專區 → 設定 → 語音與音量」按試聽。'],
      ['中文發音怪怪的、像大陸口音？', '裝置沒有臺灣中文語音。電腦建議改用 Edge；iPhone 到「設定 → 輔助使用 → 朗讀內容 → 聲音」下載「中文（台灣）美佳」。'],
      ['注音標錯了？', '注音是用詞庫自動判斷多音字，少數會標錯。請用「我有話想說」告訴我們是哪一題、哪個字。'],
      ['題目太難或太簡單？', '系統會依最近 10 題的表現自動升降。也可以在「設定 → 各科程度」直接調整。'],
      ['換手機紀錄會不見嗎？', '會，資料只存在這台裝置。換機前請在「資料」分頁複製同步碼。'],
      ['可以離線用嗎？', '加到主畫面後，第一次開過就能離線使用。有新版本時會出現「點一下更新」。'],
      ['會收集孩子的資料嗎？', '不會。學習紀錄只存在這台裝置。只有你主動送出的意見回饋會傳出去，而且不包含孩子姓名與紀錄。']
    ]
  };
  K.help.manual = (view = 'parent') => {
    const body = h('div', 'man-body'), tabs = h('div', 'man-tabs');
    const paint = () => {
      tabs.replaceChildren(...[['parent', '家長端'], ['kid', '小朋友端'], ['faq', '常見問題']].map(([k, t]) => h('button', k === view ? 'on' : '', { text: t, onclick: () => { view = k; paint(); } })));
      body.replaceChildren(...(view === 'faq'
        ? MANUAL.faq().map(([q, a]) => h('details', 'faq', null, h('summary', null, { text: q }), h('div', null, { text: a })))
        : MANUAL[view]()),
        h('div', 'man-sec man-fb', null, h('p', null, { text: '還有不清楚的地方，或想要什麼功能？' }), h('button', 'btn pri', { text: '我有話想說 💬', onclick: () => K.help.feedback() })));
      body.scrollTop = 0;
    };
    layer().replaceChildren(h('div', 'man-wrap', null, h('div', 'man-head', null, h('h1', null, { text: '📖 使用手冊' }), h('button', 'man-x', { text: '關閉', onclick: close })), tabs, body));
    paint();
  };

  // ---------- 意見回饋 ----------
  const payload = (type, text, contact) => ({ k: FEEDBACK_TOKEN, ts: new Date().toISOString(), type, text, contact, ver: ver(), kids: D().learners.length, standalone: isStandalone() ? '1' : '0', ua: navigator.userAgent.slice(0, 180) });
  async function post(item) {
    if (!FEEDBACK_URL) return false;
    const body = new URLSearchParams(item);
    try {
      const res = await fetch(FEEDBACK_URL, { method: 'POST', body });
      if (!res.ok) return false;
      try { return JSON.parse((await res.text()).trim()).ok === true; } catch (e) { return false; }
    } catch (e) { // 讀不到回應（CORS）→ 用 no-cors 再送一次，只能樂觀視為已送出
      try { await fetch(FEEDBACK_URL, { method: 'POST', body, mode: 'no-cors' }); return true; } catch (e2) { return false; }
    }
  }
  // 沒網路時先存起來，下次開啟再補送
  K.help.flush = async () => {
    const q = S().fbQueue; if (!q || !q.length || !navigator.onLine) return;
    const rest = []; for (const it of q) if (!(await post(it))) rest.push(it);
    S().fbQueue = rest; K.store.save();
  };
  K.help.feedback = () => {
    let type = '建議';
    const types = h('div', 'fb-types'), text = h('textarea', 'inp', { maxlength: 1000, rows: 5, placeholder: '例如：希望英文多一點句子題；某一題的注音標錯了；小孩很喜歡連連看！' });
    const count = h('div', 'fb-count', { text: '0 / 1000' }), contact = h('input', 'inp', { maxlength: 60, placeholder: 'Email，方便回覆你（可不填）' });
    const paintT = () => types.replaceChildren(...[['建議', '💡 功能建議'], ['問題', '🐛 遇到問題'], ['其他', '💬 其他']].map(([k, t]) => h('button', k === type ? 'on' : '', { text: t, onclick: () => { type = k; paintT(); } })));
    text.oninput = () => count.textContent = `${text.value.length} / 1000`;
    const send = h('button', 'btn pri', { text: '送出' });
    send.onclick = async () => {
      const t = text.value.trim(); if (t.length < 4) { K.toast('再多寫幾個字，才知道怎麼改 🙂'); return; }
      send.disabled = true; send.textContent = '送出中…';
      const item = payload(type, t, contact.value.trim());
      if (await post(item)) { K.toast('收到了，謝謝你 🙌'); A.sfx('win'); }
      else { (S().fbQueue = S().fbQueue || []).push(item); K.store.save(); K.toast('目前連不上網路，已先存在這台裝置，之後會自動補送'); }
      close();
    };
    paintT();
    layer().replaceChildren(h('div', 'modal-bg', { onclick: close }), h('div', 'modal fb', null,
      h('h2', null, { text: '💬 意見回饋' }),
      h('p', 'sub', { text: '覺得哪裡難用、哪題有錯、希望多什麼功能、孩子的反應，都很有幫助。' }),
      h('p', 'lbl', { text: '這則是關於' }), types,
      h('p', 'lbl', { text: '想說的話' }), text, count,
      h('p', 'lbl', { text: '聯絡方式（可留可不留）' }), contact,
      h('p', 'sub tiny', { text: '送出的內容會附上 App 版本與裝置型號，不包含孩子的姓名與學習紀錄。' }),
      h('div', 'row', null, h('button', 'btn', { text: '取消', onclick: close }), send)));
    setTimeout(() => text.focus(), 150);
  };
})();
