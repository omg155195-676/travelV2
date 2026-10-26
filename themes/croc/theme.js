/* ===== 🐊 鱷魚旅行主題（主題包） =====
   - 只在「設定 → 主題色 → 🐊 鱷魚旅行」被選中時才有作用。
   - 不改任何資料、不改原本版面與功能：只在畫面畫好之後，把鱷魚放進適合的位置。
   - 配色與樣式在同資料夾的 theme.css（全部限定在 html[data-ac=croc] 底下）。
   - 動作圖沿用 App 既有的 CROC_IMG；新增的表情、天氣、狀態圖在 img/ 資料夾。
   之後的角色主題（例如 🎀 小馬蕾）照這個檔案的格式再建一個資料夾即可。 */
(function () {
  var ID = "croc";
  var DIR = "themes/croc/img/";

  function on() { return typeof S !== "undefined" && S && S.ac === ID; }
  /* 這個主題包自己的圖檔（img/ 資料夾）；其餘動作沿用既有的 CROC_IMG */
  var OWN = ["sunny", "cloudy", "rain", "hot", "cold", "loading", "done", "error",
             "happy", "proud", "think", "love", "front", "empty-photo", "empty-plan", "empty-list"];
  function pose(k) {
    if (OWN.indexOf(k) >= 0) return DIR + k + ".webp";
    if (typeof CROC_IMG !== "undefined" && CROC_IMG[k]) return CROC_IMG[k];
    return DIR + "happy.webp";
  }
  function img(k, cls) {
    var i = document.createElement("img");
    i.className = "thc" + (cls ? " " + cls : ""); i.alt = ""; i.src = pose(k);
    i.decoding = "async"; i.setAttribute("aria-hidden", "true");
    return i;
  }
  function firstB(el) { var b = el.querySelector("b"); return b ? b.textContent.trim() : ""; }

  /* 空狀態：依分頁挑表情 */
  var EMPTY = { photo: "empty-photo", plan: "empty-plan", list: "empty-list", home: "empty-plan", day: "empty-photo", tix: "empty-list" };
  var EMPTY_RE = /^(還沒有|這天還沒有|這天沒有|今天還沒有|行程裡還沒有)/;
  function decorateEmpty(tab, root) {
    root.querySelectorAll(".card").forEach(function (card) {
      if (card.querySelector(".thc")) return;
      var k = EMPTY[tab] || "think";
      if (card.classList.contains("sub") && EMPTY_RE.test(card.textContent.trim())) {
        var t = document.createElement("div"); t.className = "thc-txt";
        while (card.firstChild) t.appendChild(card.firstChild);
        card.classList.add("thc-empty"); card.appendChild(img(k)); card.appendChild(t);
        return;
      }
      var s = card.querySelector(":scope > .sub");
      if (s && s === card.firstElementChild && EMPTY_RE.test(s.textContent.trim())) {
        var w = document.createElement("div"); w.className = "thc-empty";
        card.insertBefore(w, s); w.appendChild(img(k)); s.classList.add("thc-txt"); w.appendChild(s);
      }
    });
  }

  /* 天氣：依實際天氣挑表情 */
  function wxPose(w) {
    if (w.pop != null && w.pop >= 50) return "rain";
    if (w.hi != null && w.hi >= 30) return "hot";
    if (w.lo != null && w.lo <= 8) return "cold";
    if (w.pop != null && w.pop >= 30) return "cloudy";
    return "sunny";
  }

  var DAY_POSES = ["depart", "map", "camera", "walk", "food", "idea", "train", "look", "eat1", "where"];

  function decorate(tab, root) {
    if (!on() || !root) return;

    /* 頂部漸層卡（沒有封面照片時） */
    var hero = root.querySelector(':scope > div[style*="var(--g1),var(--g2)"]');
    if (hero && !hero.querySelector(".thc")) {
      hero.classList.add("thc-hero");
      hero.appendChild(img(tab === "plan" ? "map" : tab === "photo" ? "camera" : "depart"));
    }

    /* 記帳：總支出卡 */
    root.querySelectorAll(".card").forEach(function (c) {
      var s = c.querySelector(":scope > .sub");
      if (s && /^總支出/.test(s.textContent.trim()) && c.querySelector(".big") && !c.querySelector(".thc")) {
        c.classList.add("thc-side"); c.appendChild(img("budget"));
      }
    });

    /* 匯率卡 */
    root.querySelectorAll(".card").forEach(function (c) {
      if (/^💱/.test(firstB(c)) && !c.querySelector(".thc")) { c.classList.add("thc-side", "thc-fx"); c.appendChild(img("proud")); }
    });

    /* 行程：每天標題列前放小鱷魚 */
    if (tab === "plan") {
      root.querySelectorAll(".daybar").forEach(function (d, i) {
        if (d.querySelector(".thc")) return;
        d.classList.add("thc-day"); d.insertBefore(img(DAY_POSES[i % DAY_POSES.length]), d.firstChild);
      });
    }

    /* 錯誤卡 */
    root.querySelectorAll(".card").forEach(function (c) {
      if (/發生錯誤/.test(firstB(c)) && !c.querySelector(".thc")) { c.classList.add("thc-err"); c.appendChild(img("error")); }
    });

    /* 設定：主題預覽 */
    if (tab === "set") {
      root.querySelectorAll(".card").forEach(function (c) {
        if (firstB(c) === "主題色" && !c.querySelector(".thc-pv")) {
          var pv = document.createElement("div"); pv.className = "thc-pv";
          pv.appendChild(img("front"));
          var t = document.createElement("div");
          t.innerHTML = '<b style="display:block">🐊 鱷魚旅行 使用中</b><span class="sub">小鱷魚會在首頁、行程、記帳、天氣和提示裡陪你。換回其他主題就會恢復原本的樣子。</span>';
          pv.appendChild(t); c.appendChild(pv);
        }
      });
    }

    decorateEmpty(tab, root);
  }

  function init() {
    /* 天氣卡：只在主題啟用時加上表情，否則回傳原本的內容 */
    if (typeof wxCard === "function") {
      var _wx = wxCard;
      wxCard = function (date, region) {
        var h = _wx.apply(this, arguments);
        if (!on() || !h) return h;
        try {
          var w = wxGet(date, region), k = wxPose(w);
          return h.replace('<div class="card">', '<div class="card thc-wx"><img class="thc" alt="" aria-hidden="true" src="' + pose(k) + '">');
        } catch (e) { return h; }
      };
    }
    /* 「更多」選單：標題旁放一隻看地圖的小鱷魚 */
    var md = document.getElementById("md");
    if (md && window.MutationObserver) {
      new MutationObserver(function () {
        if (!on()) return;
        var g = md.querySelector(".mgrid"), hd = md.querySelector(".sh-h");
        if (g && hd && !hd.querySelector(".thc")) hd.insertBefore(img("map"), hd.lastElementChild);
      }).observe(md, { childList: true, subtree: true });
    }
  }

  registerTheme(ID, {
    label: "🐊 鱷魚旅行",
    char: "croc",            // 讓既有的小鱷魚提示知道：這個主題有角色
    decorate: decorate,
    init: init
  });
})();
