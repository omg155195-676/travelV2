/* ===== 🐊 鱷魚旅行主題（主題包） =====
   - 只在「設定 → 主題色 → 🐊 鱷魚旅行」被選中時才有作用；其他主題完全不受影響。
   - 不改任何資料、計算或功能：只在畫面畫好之後，把鱷魚放進適合的位置。
   - 配色與排版在同資料夾的 theme.css（全部限定在 html[data-ac=croc] 底下）。
   - 角色圖在 img/，以使用者提供的角色素材圖為標準裁切（只縮放、裁切、去背）。
   - 原則：鱷魚是旅伴，不塞滿 UI；永遠不能蓋住文字、金額、按鈕。
   之後的角色主題（例如 🎀 小馬蕾）照這個資料夾的格式再建一個即可。 */
(function () {
  var ID = "croc";
  var DIR = "themes/croc/img/";

  /* 情境 → 圖檔（新版素材優先；完成、晴天、錯誤等新素材沒有的狀態，用先前同一套角色的圖） */
  var POSE = {
    depart: "depart", map: "map", walk: "walk", camera: "camera", eat: "eat", rest: "rest",
    idea: "idea", sleep: "sleep", rain: "rain", cold: "cold", train: "train", ticket: "ticket",
    budgetOk: "budget-ok", budgetNear: "budget-near", budgetOver: "budget-over", tired: "tired",
    happy: "happy", hot: "hot", cloudy: "cloudy", error: "error", front: "front"
  };
  /* 既有小鱷魚提示的圖，換成新版素材（提示文字和觸發條件都不變） */
  var TIP = {
    depart: "depart", map: "map", look: "map", where: "map", plan: "map", walk: "walk",
    camera: "camera", train: "train", umbrella: "rain", rain: "rain", sleep: "sleep",
    rest: "rest", tired: "tired", budget: "budgetNear", food: "eat", eat1: "eat", eat2: "eat",
    idea: "idea"
  };
  var NAV = { home: "nav-home", plan: "nav-plan", add: "nav-list", photo: "nav-photo", more: "nav-more" };

  function on() { return typeof S !== "undefined" && S && S.ac === ID; }
  function src(k) { return DIR + (POSE[k] || k) + ".webp"; }
  function img(k, cls) {
    var i = document.createElement("img");
    i.className = "thc" + (cls ? " " + cls : ""); i.alt = ""; i.src = src(k);
    i.decoding = "async"; i.setAttribute("aria-hidden", "true");
    return i;
  }
  function firstB(el) { var b = el.querySelector("b"); return b ? b.textContent.trim() : ""; }

  /* ---------- 空狀態：鱷魚在左、原本文字在右（排在版面裡，不會蓋字） ---------- */
  var EMPTY = { photo: "camera", day: "camera", plan: "map", home: "map", days: "map",
                add: "budgetOk", list: "budgetOk", stat: "budgetOk",
                trans: "train", resv: "ticket", tix: "ticket", gosh: "idea", map: "map" };
  var EMPTY_RE = /^(還沒有|這天還沒有|這天沒有|今天還沒有|行程裡還沒有)/;
  function decorateEmpty(tab, root) {
    var k = EMPTY[tab] || "map";
    root.querySelectorAll(".card").forEach(function (card) {
      if (card.querySelector(".thc")) return;
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

  /* ---------- 記帳：總支出卡 ----------
     不浮在資訊上：把卡片上方拆成「左：標題＋金額」「右：切換鈕＋鱷魚」兩欄，
     鱷魚只佔右欄自己的位置；進度條、預算、剩餘、匯率說明都在下方完整寬度。 */
  function budgetPose() {
    try {
      var spent = sumTwd(S.items), b = +S.budget || 0;
      if (b <= 0) return "budgetOk";
      var r = spent / b;
      return r > 1 ? "budgetOver" : r >= 0.8 ? "budgetNear" : "budgetOk";
    } catch (e) { return "budgetOk"; }
  }
  function decorateBudget(root) {
    root.querySelectorAll(".card").forEach(function (c) {
      if (c.querySelector(".thc")) return;
      var label = Array.prototype.filter.call(c.children, function (x) {
        return x.classList.contains("sub") && /^總支出/.test(x.textContent.trim());
      })[0];
      var big = label && label.nextElementSibling;
      if (!big || !big.classList.contains("big")) return;
      var approx = big.nextElementSibling && big.nextElementSibling.classList.contains("sub") &&
                   /^≈/.test(big.nextElementSibling.textContent.trim()) ? big.nextElementSibling : null;
      var pill = Array.prototype.filter.call(c.children, function (x) {
        return x.tagName === "BUTTON" && /⇄/.test(x.textContent);
      })[0];
      var top = document.createElement("div"); top.className = "thc-top";
      var main = document.createElement("div"); main.className = "thc-main";
      var aside = document.createElement("div"); aside.className = "thc-aside";
      c.insertBefore(top, label);
      main.appendChild(label); main.appendChild(big); if (approx) main.appendChild(approx);
      if (pill) aside.appendChild(pill);
      aside.appendChild(img(budgetPose()));
      top.appendChild(main); top.appendChild(aside);
      c.classList.add("thc-budget");
    });
  }

  /* ---------- 行程：每天標題列前的小鱷魚，依當天內容挑動作 ---------- */
  function dayPose(date, idx) {
    var its = (S.plan || []).filter(function (p) { return p.date === date && p.time !== "23:59" && !p.skip; });
    if (its.length >= 2 && its.every(function (p) { return p.done; })) return "happy";
    if (idx === 0) return "depart";
    var t = its.map(function (p) { return (p.name || "") + " " + (p.place || ""); }).join(" ");
    if (/✈️|機場|新幹線|JR|etSETOra|→|搭船|港/.test(t)) return "train";
    if (/攝影|拍|夜景|點燈|紅葉|夕陽|夕景/.test(t)) return "camera";
    if (/神社|寺|城|美術館|博物館|資料館|朱印/.test(t)) return "idea";
    if (/休息|咖啡|溫泉/.test(t)) return "rest";
    if (/拉麵|燒|市場|屋台|美食/.test(t)) return "eat";
    return idx % 2 ? "walk" : "map";
  }
  function decoratePlan(root) {
    var i = 0;
    root.querySelectorAll(".daybar").forEach(function (d) {
      if (d.querySelector(".thc")) return;
      var m = /'(\d{4}-\d{2}-\d{2})'/.exec(d.getAttribute("onclick") || "");
      if (!m) return;
      d.classList.add("thc-day"); d.insertBefore(img(dayPose(m[1], i++)), d.firstChild);
    });
  }

  /* ---------- 既有提示框：換成新版素材 ---------- */
  function decorateTips(root) {
    root.querySelectorAll(".ctip img.cimg[data-k]").forEach(function (i) {
      var k = TIP[i.getAttribute("data-k")];
      if (k) i.src = src(k);
    });
  }

  /* ---------- 底部導航：只把小圖示換成鱷魚小頭，結構與功能不動 ---------- */
  function decorateNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;
    nav.querySelectorAll("button").forEach(function (b) {
      var oc = b.getAttribute("onclick") || "", m = /go\('(\w+)'\)/.exec(oc);
      var key = m ? m[1] : (/openMore/.test(oc) ? "more" : "");
      var sp = b.querySelector("span");
      if (!NAV[key] || !sp || sp.querySelector("img")) return;
      sp.textContent = ""; sp.classList.add("thc-nav");
      var i = document.createElement("img"); i.alt = ""; i.src = DIR + NAV[key] + ".webp"; i.setAttribute("aria-hidden", "true");
      sp.appendChild(i);
    });
  }

  function decorate(tab, root) {
    if (!on() || !root) return;

    /* 頂部漸層卡（沒有封面照片時）：鱷魚放在卡片上方的留白區，不碰標題 */
    var hero = root.querySelector(':scope > div[style*="var(--g1),var(--g2)"]');
    if (hero && !hero.querySelector(".thc")) {
      var hk = tab === "plan" ? "map" : tab === "photo" ? "camera" : "depart";
      try { var ti = tripInfo(), t = today(); if (tab === "home" && ti.n && t >= ti.first && t <= ti.last) hk = "map"; } catch (e) {}
      hero.classList.add("thc-hero"); hero.appendChild(img(hk));
    }

    decorateBudget(root);
    if (tab === "plan") decoratePlan(root);

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
          var tx = document.createElement("div");
          tx.innerHTML = '<b style="display:block">🐊 鱷魚旅行 使用中</b><span class="sub">小鱷魚會在提醒、行程、記帳、天氣和照片頁陪你。換回其他主題就會恢復原本的樣子。</span>';
          pv.appendChild(tx); c.appendChild(pv);
        }
      });
    }

    decorateTips(root);
    decorateEmpty(tab, root);
  }

  /* 天氣：依實際天氣挑表情（晴天開心、下雨撐傘、寒冷保暖） */
  function wxPose(w) {
    if (w.pop != null && w.pop >= 50) return "rain";
    if (w.lo != null && w.lo <= 10) return "cold";
    if (w.hi != null && w.hi >= 30) return "hot";
    if (w.pop != null && w.pop >= 30) return "cloudy";
    return "happy";
  }

  function init() {
    if (typeof wxCard === "function") {
      var _wx = wxCard;
      wxCard = function (date, region) {
        var h = _wx.apply(this, arguments);
        if (!on() || !h) return h;
        try {
          return h.replace('<div class="card">', '<div class="card thc-wx"><img class="thc" alt="" aria-hidden="true" src="' + src(wxPose(wxGet(date, region))) + '">');
        } catch (e) { return h; }
      };
    }
    /* 導航每次重畫都套用（導航不在主畫面區塊內） */
    if (typeof renderNav === "function") {
      var _nav = renderNav;
      renderNav = function () { _nav.apply(this, arguments); try { if (on()) decorateNav(); } catch (e) {} };
    }
    /* 「更多」選單：標題旁一隻很小的看地圖鱷魚 */
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
    char: "croc",
    decorate: decorate,
    init: init
  });
})();
