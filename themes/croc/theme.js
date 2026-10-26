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

  /* ---------- 行程：Day 卡片留給角色的插槽（.pday-char），依當天內容挑動作 ----------
     行程頁本身不知道鱷魚：它只留一個空插槽，由目前的角色主題決定放什麼。 */
  function dayPose(date, idx) {
    var its = (S.plan || []).filter(function (p) { return p.date === date && p.time !== "23:59" && !p.skip; });
    if (its.length >= 2 && its.every(function (p) { return p.done; })) return "happy";
    if (idx === 0) return "depart";
    var t = its.map(function (p) { return (p.name || "") + " " + (p.place || ""); }).join(" ");
    if (/🚲|E-bike|自行車|單車|騎/.test(t)) return "walk";
    if (/✈️|機場|新幹線|etSETOra|→ *廣島|→ *福山|搭船|港/.test(t)) return "train";
    if (/攝影|拍|夜景|點燈|紅葉|夕陽|夕景/.test(t)) return "camera";
    if (/休息|溫泉/.test(t)) return "rest";
    return "map";
  }
  function decoratePlan(root) {
    root.querySelectorAll(".pday-char[data-date]").forEach(function (slot) {
      if (slot.firstChild) return;
      slot.appendChild(img(dayPose(slot.getAttribute("data-date"), +slot.getAttribute("data-i") || 0)));
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


  /* =====================================================================
     🏠 首頁 Layout（只在鱷魚主題）：
     主要功能（1 大＋2 小）→ 今日資訊卡（真實數字）→ 旅行主卡 → 倒數 → 下一個行程 → 其餘原有卡片
     作法：搬動「既有」的按鈕與卡片（點擊行為完全不變），只新增純顯示用的旅行主卡與下一個行程卡。
     ===================================================================== */
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function E(x) { return typeof esc === "function" ? esc(x) : String(x); }
  function realPlans() { return (S.plan || []).filter(function (p) { return p.time !== "23:59"; }); }

  function quickCard(btn, cls, title, sub, pose, extra) {
    btn.classList.add("ch-q", cls);
    btn.innerHTML = '<span class="ch-q-txt"><b>' + E(title) + '</b>' + (sub ? '<span class="ch-q-sub">' + sub + '</span>' : '') + '</span>' + (extra || "");
    btn.insertBefore(img(pose, "ch-q-img"), cls === "ch-big" ? btn.lastChild : null);
    return btn;
  }

  function nextPlan() {
    var t = today(), d = new Date(), hm = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    var L = realPlans().filter(function (p) { return !p.done && !p.skip && p.date && (p.date > t || (p.date === t && (!p.time || p.time >= hm))); });
    L.sort(function (a, b) { return (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")); });
    return L[0] || null;
  }

  function tripCard() {
    var ti = tripInfo(), cu = S.cover ? imgUrl(S.cover) : "", yr = (ti.first || "").slice(0, 4);
    var name = String(S.trip || ""), title = yr && name.indexOf(yr) === 0 ? name.slice(yr.length).trim() : name;
    var c = h("div", "card ds-main ds-paper ch-trip");
    var menu = "";
    if (typeof phOn === "function" && phOn()) {
      menu = '<div class="ch-menu"><button class="ds-icon-btn" aria-label="封面設定" onclick="this.parentNode.classList.toggle(\'open\')">⋯</button><div class="ch-pop">'
        + '<label class="ch-pop-i"><span id="cvm">📷 ' + (S.cover ? '更換封面' : '設定封面') + '</span><input type="file" accept="image/*" style="display:none" onchange="setCover(this)"></label>'
        + (S.cover ? '<button class="ch-pop-i" onclick="clrCv()">🗑️ 移除封面</button>' : '') + '</div></div>';
    }
    c.innerHTML = '<div class="ch-trip-head">' + (yr ? '<span class="ch-year">' + E(yr) + '</span>' : '') + menu + '</div>'
      + '<div class="ch-trip-body"><div class="ch-trip-txt"><div class="ch-trip-title">' + E(title || "我的旅行") + '</div>'
      + (ti.n ? '<div class="ch-trip-date">🗓️ ' + E(ti.first) + ' ～ ' + E(ti.last) + '</div><div class="ch-trip-days">' + ti.n + ' 天・' + Math.max(0, ti.n - 1) + ' 夜</div>'
              : '<div class="ch-trip-date">還沒有安排日期</div>') + '</div>'
      + (cu ? '<button class="ch-polaroid" aria-label="查看封面" onclick="zoom(\'' + E(S.cover) + '\')"><img alt="" src="' + E(cu) + '"></button>' : '') + '</div>';
    var body = c.querySelector(".ch-trip-txt");
    var deco = h("div", "ch-trip-deco"); deco.appendChild(img("walk")); deco.appendChild(h("span", "ch-plane", "✈"));
    body.appendChild(deco);
    return c;
  }

  function nextCard(p) {
    var n = dayNum(p.date), same = realPlans().filter(function (x) { return x.date === p.date && !x.done && !x.skip && x.id !== p.id && (x.time || "") >= (p.time || ""); })
      .sort(function (a, b) { return (a.time || "").localeCompare(b.time || ""); }).slice(0, 2);
    var c = h("div", "card ds-info ch-next");
    c.innerHTML = '<div class="ch-next-head"><b>📍 下一個行程</b><button class="ds-more" onclick="planMode=\'day\';planDay=\'' + E(p.date) + '\';go(\'plan\')">查看完整行程 ›</button></div>'
      + '<div class="ch-next-body"><div class="ch-date"><b>' + E(md(p.date)) + '</b><span>（' + wk(p.date) + '）</span></div>'
      + '<div class="ch-next-main">' + (n > 0 ? '<span class="ds-chip pink">DAY ' + n + '</span>' : '')
      + '<div class="ch-next-name">' + (planTime(p) ? '<span class="ch-time">' + E(planTime(p)) + '</span> ' : '') + E(p.name) + '</div>'
      + (p.place ? '<div class="ch-next-place">📍 ' + E(p.place) + '</div>' : '')
      + same.map(function (x) { return '<div class="ch-next-more">' + (x.time ? '<span class="ch-time">' + E(planTime(x)) + '</span> ' : '') + E(x.name) + '</div>'; }).join("")
      + '</div></div>';
    c.querySelector(".ch-next-body").appendChild(img(n === 1 ? "depart" : "map", "ch-next-img"));
    return c;
  }

  function homeLayout(root) {
    if (root.querySelector(".ch-main")) return;
    var q = root.querySelector(":scope > .qgrid"); if (!q) return;
    var B = {}; Array.prototype.forEach.call(q.querySelectorAll("button"), function (b) { B[b.textContent.replace(/\s/g, "").replace(/^\S{0,2}(?=快速|今天|票券|今日|行程)/, "")] = b; });
    var key = function (k) { for (var x in B) if (x.indexOf(k) >= 0) return B[x]; return null; };
    var bAdd = key("快速記帳"), bToday = key("今天"), bTix = key("票券中心"), bPh = key("今日照片"), bTr = key("今日交通"), bPl = key("行程");
    if (!bAdd || !bToday || !bTix || !bPh || !bTr || !bPl) return;

    var d = (typeof focusDate !== "undefined" && focusDate) || today(), ti = tripInfo(), inTrip = ti.n && d >= ti.first && d <= ti.last;
    var nPh = (typeof P !== "undefined" ? P : []).filter(function (p) { return albumP(p) && p.date === d; }).length;
    var nTr = transEvents(d).length;
    var nPlToday = realPlans().filter(function (p) { return p.date === d; }).length, nPlAll = realPlans().length;
    var tixN = (S.trans || []).filter(function (t) { return t.ticketStatus === "已購票" || t.ticketStatus === "已取票"; }).length;

    /* ① 主要功能：快速記帳（大）＋今天、票券中心（小） */
    var main = h("div", "ch-main");
    main.appendChild(quickCard(bAdd, "ch-big", "快速記帳", "記下今天的花費", "budgetOk", '<span class="ch-plus" aria-hidden="true">＋</span>'));
    main.appendChild(quickCard(bToday, "ch-sm", "今天", "查看今日行程", "map"));
    main.appendChild(quickCard(bTix, "ch-sm", "票券中心", tixN ? "已購 " + tixN + " 張" : "查看票券", "ticket"));

    /* ② 今日資訊卡：真實數字；沒有資料時顯示空狀態文字 */
    var info = h("div", "ch-info");
    info.appendChild(quickCard(bPh, "ch-stat", "今日照片", nPh ? '<span class="ds-num">' + nPh + '</span> 張' : '<span class="ch-empty">還沒有</span>', "camera", '<span class="ch-chev">›</span>'));
    info.appendChild(quickCard(bTr, "ch-stat", "今日交通", nTr ? '<span class="ds-num">' + nTr + '</span> 筆' : '<span class="ch-empty">今天沒有</span>', "train", '<span class="ch-chev">›</span>'));
    info.appendChild(quickCard(bPl, "ch-stat", "行程", inTrip ? (nPlToday ? '今天 <span class="ds-num">' + nPlToday + '</span> 項' : '<span class="ch-empty">今天沒有</span>') : (nPlAll ? '共 <span class="ds-num">' + nPlAll + '</span> 項' : '<span class="ch-empty">還沒有</span>'), "map", '<span class="ch-chev">›</span>'));

    q.parentNode.insertBefore(main, q); q.parentNode.insertBefore(info, q); q.remove();

    /* ③ 旅行主卡：取代原本的頂部旅行卡（封面管理收進右上角 ⋯） */
    var heroes = Array.prototype.filter.call(root.children, function (e) {
      return e.matches('div[style*="var(--g1),var(--g2)"]') || (e.classList.contains("card") && e.querySelector(':scope > img[onclick^="zoom"]'));
    });
    heroes.forEach(function (e) { e.remove(); });
    var anchor = info.nextSibling;
    var trip = tripCard(); root.insertBefore(trip, anchor);
    var after = trip;

    /* ④ 倒數卡（出發前才有）：「X 天」是視覺中心 */
    var cd = Array.prototype.filter.call(root.querySelectorAll(":scope > .card"), function (c) { return /^距離旅行還有/.test((c.querySelector(".sub") || {}).textContent || ""); })[0];
    if (cd) {
      cd.removeAttribute("style"); cd.classList.add("ds-main", "ds-paper", "ch-count");
      var txt = h("div", "ch-count-txt"); while (cd.firstChild) txt.appendChild(cd.firstChild);
      var big = txt.querySelector(".big"); if (big) { big.removeAttribute("style"); var m = /(\d+)\s*天/.exec(big.textContent); if (m) big.innerHTML = '<span class="ch-count-n">' + m[1] + '</span> 天'; }
      cd.appendChild(txt);
      var side = h("div", "ch-count-side", '<span class="ch-bubble">準備好了嗎？<br>一起出發吧！</span>'); side.appendChild(img("depart"));
      cd.appendChild(side);
      root.insertBefore(cd, after.nextSibling); after = cd;
    }

    /* 小鱷魚提示：放在倒數／旅行卡之後，當作旅伴的提醒 */
    var tip = root.querySelector(":scope > .ctip");
    if (tip) { root.insertBefore(tip, after.nextSibling); after = tip; }

    /* ⑤ 下一個行程 */
    var np = nextPlan();
    if (np) { var nc = nextCard(np); root.insertBefore(nc, after.nextSibling); after = nc; }

    /* 其餘原有卡片（天氣、出發前、預算、旅行中的今日區塊…）順序不變，前面加一個區塊標題 */
    var phase = !ti.n ? "📝 開始規劃" : inTrip ? "📋 今天的細節" : (d > ti.last ? "🌸 旅程回顧" : "🧳 旅行準備");
    if (after.nextSibling) root.insertBefore(h("div", "ds-sec", phase), after.nextSibling);
  }

  function decorate(tab, root) {
    if (!on() || !root) return;

    if (tab === "home") { try { homeLayout(root); } catch (e) { if (window.console) console.warn("croc home", e); } }

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
