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

  /* 共用元件：「更多 ⋯」選單，收納封面設定（沿用原本的 setCover／clrCv） */
  function coverMenu() {
    if (!(typeof phOn === "function" && phOn())) return "";
    return '<div class="ch-menu"><button class="ds-icon-btn" aria-label="封面設定" onclick="this.parentNode.classList.toggle(\'open\')">⋯</button><div class="ch-pop">'
      + '<label class="ch-pop-i"><span id="cvm">📷 ' + (S.cover ? '更換封面' : '設定封面') + '</span><input type="file" accept="image/*" style="display:none" onchange="setCover(this)"></label>'
      + (S.cover ? '<button class="ch-pop-i" onclick="clrCv()">🗑️ 移除封面</button>' : '') + '</div></div>';
  }

  /* =====================================================================
     🗺️ 行程頁 Layout（只在鱷魚主題）：精簡頁首 → 日期卡 → 時間軸（樣式在 theme.css）
     ===================================================================== */
  function planLayout(root) {
    if (root.querySelector(".cp-head")) return;
    var heroes = Array.prototype.filter.call(root.children, function (e) {
      return e.matches('div[style*="var(--g1),var(--g2)"]') || (e.classList.contains("card") && e.querySelector(':scope > img[onclick^="zoom"]'));
    });
    if (!heroes.length) return;
    var ti = tripInfo(), done = realPlans().filter(function (p) { return p.done; }).length, all = realPlans().length;
    var c = h("div", "card ds-main ds-paper cp-head");
    c.innerHTML = '<div class="cp-head-txt"><div class="cp-title">🗺️ 旅行時間軸</div>'
      + '<div class="cp-sub">' + E(S.trip || "") + '</div>'
      + (ti.n ? '<div class="cp-meta"><span class="ds-chip">' + ti.n + ' 天</span><span class="ds-chip pink">' + done + ' / ' + all + ' 完成</span></div>' : '')
      + '</div>' + coverMenu();
    c.insertBefore(img("map", "cp-head-img"), c.querySelector(".ch-menu"));
    root.insertBefore(c, heroes[0]);
    heroes.forEach(function (e) { e.remove(); });
  }
  /* 展開的那天：時間軸結尾放一隻小鱷魚陪伴（只是顯示，不影響任何操作） */
  function planTrailEnd(root) {
    root.querySelectorAll(".pday.is-open").forEach(function (card) {
      var body = card.querySelector(".pday-body"), slot = card.querySelector(".pday-char[data-date]");
      if (!body || !slot || body.querySelector(".cp-end")) return;
      var d = slot.getAttribute("data-date"), its = realPlans().filter(function (p) { return p.date === d && !p.skip; });
      if (!its.length) return;
      var left = its.filter(function (p) { return !p.done; }).length;
      var end = h("div", "cp-end");
      end.appendChild(img(left ? "walk" : "sleep"));
      end.appendChild(h("span", "cp-end-txt", left ? "還有 " + left + " 項，慢慢來～" : "今天的行程都完成了，辛苦啦！"));
      body.appendChild(end);
    });
  }

  function tripCard() {
    var ti = tripInfo(), cu = S.cover ? imgUrl(S.cover) : "", yr = (ti.first || "").slice(0, 4);
    var name = String(S.trip || ""), title = yr && name.indexOf(yr) === 0 ? name.slice(yr.length).trim() : name;
    var c = h("div", "card ds-main ds-paper ch-trip");
    var menu = coverMenu();
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


  /* =====================================================================
     💰 記帳頁 Layout：旅行錢包（只在鱷魚主題）
     錢包卡（今日支出＋預算狀態）→ 快速記帳 → 分類 → 消費明細 → 匯率 → 完整表單
     數字全部用 App 原本的計算函式；明細列用原本的 expItemRow（可編輯、刪除）。
     ===================================================================== */
  var WCATS = [["餐飲", "飲食"], ["交通", "交通"], ["購物", "購物"], ["門票", "門票"], ["住宿", "住宿"], ["*", "其他"]];
  function catItems(c) {
    var main = WCATS.slice(0, 5).map(function (x) { return x[0]; });
    return S.items.filter(function (i) { return c === "*" ? main.indexOf(i.cat) < 0 : i.cat === c; });
  }
  /* 顯示用加總：顯示幣別相同的花費直接加原金額（避免先換台幣取整再換回的誤差），其他幣別才換算 */
  function sumShow(list) {
    var c = lc();
    if (c === "TWD") return "NT$ " + fmt(sumTwd(list));
    var r = S.rates[c], v = list.reduce(function (s, i) { return s + (i.cur === c ? (+i.amount || 0) : twd(i) / r); }, 0);
    return (CSYM[c] || c + " ") + fmt(v);
  }
  function walletState() {
    var b = budgetInfo(), ti = tripInfo(), t = today(), inTrip = ti.n && t >= ti.first && t <= ti.last;
    var r = inTrip && b.tb != null && b.tb > 0 ? b.st / b.tb : (S.budget > 0 ? b.spent / S.budget : 0);
    var k = r > 1 ? "budgetOver" : r >= 0.8 ? "budgetNear" : "budgetOk";
    var label = { budgetOk: "預算正常", budgetNear: "接近預算", budgetOver: "超出預算" }[k];
    var hint = inTrip && b.tb != null ? "以今日建議預算計算" : "以總預算計算";
    return { k: k, label: label, hint: hint, b: b };
  }
  window.crocQuickCat = function (c) {
    qAdd();
    setTimeout(function () { var sel = document.getElementById("q_c"); if (sel) { sel.value = c === "*" ? "其他" : c; sel.dispatchEvent(new Event("change", { bubbles: true })); } var a = document.getElementById("q_a"); if (a) try { a.focus(); } catch (e) {} }, 30);
  };
  function walletLayout(root) {
    if (root.querySelector(".cw-wallet")) return;
    var sum = Array.prototype.filter.call(root.querySelectorAll(":scope > .card"), function (c) {
      var x = c.querySelector(":scope > .sub"); return x && /^總支出/.test(x.textContent.trim()) && c.querySelector(".big");
    })[0];
    if (!sum) return;
    var t = today(), st = walletState(), b = st.b, spentT = spentOn(t), left = S.budget - b.spent,
        todayItems = S.items.filter(function (i) { return i.date === t; });
    var pct = S.budget > 0 ? Math.min(100, b.spent / S.budget * 100) : 0;
    var w = h("div", "card ds-main ds-paper cw-wallet");
    w.innerHTML = '<div class="cw-head"><b>👛 旅行錢包</b>' + (typeof curPill === "function" ? curPill() : "") + '</div>'
      + '<div class="cw-top"><div class="cw-main"><div class="cw-label">今日支出・' + E(md(t)) + '（' + wk(t) + '）</div>'
      + '<div class="cw-amt">' + E(sumShow(todayItems)) + '</div>'
      + (lc() !== "TWD" ? '<div class="cw-approx">≈ NT$ ' + fmt(spentT) + '</div>' : '')
      + '<span class="ds-chip ' + (st.k === "budgetOk" ? "" : "pink") + ' cw-state">🐊 ' + st.label + '</span><span class="cw-hint">' + st.hint + '</span></div></div>'
      + '<div class="bar' + (left < 0 ? ' over' : '') + '"><i style="width:' + pct + '%"></i></div>'
      + '<div class="cw-stats"><div><span>總支出</span><b>' + E(sumShow(S.items)) + '</b></div><div><span>預算</span><b>' + E(dm(S.budget)) + '</b></div>'
      + '<div><span>' + (left < 0 ? '超支' : '剩餘') + '</span><b class="' + (left < 0 ? 'warn' : '') + '">' + E(dm(Math.abs(left))) + '</b></div></div>'
      + (typeof rateNote === "function" ? rateNote() : "");
    w.querySelector(".cw-top").appendChild(img(st.k, "cw-img"));
    var pill = w.querySelector(".cw-head button"); if (pill) pill.classList.add("cw-pill");
    root.insertBefore(w, sum); sum.remove();

    /* 分類（真實金額）：點一下開快速記帳並預選分類 */
    var qa = Array.prototype.filter.call(root.querySelectorAll(":scope > button.btn"), function (x) { return /快速記帳/.test(x.textContent); })[0];
    var anchor = qa ? qa.nextSibling : w.nextSibling;
    var cats = h("div", "cw-cats");
    WCATS.forEach(function (x) {
      var L = catItems(x[0]), v = L.length, ic = x[0] === "*" ? "📦" : (CAT_ICON[x[0]] || "📦");
      var tile = h("button", "cw-cat" + (v ? "" : " is-zero"));
      tile.setAttribute("onclick", "crocQuickCat('" + x[0] + "')");
      tile.setAttribute("aria-label", "記一筆" + x[1]);
      tile.innerHTML = '<span class="cw-cat-ic">' + ic + '</span><span class="cw-cat-n">' + x[1] + '</span><span class="cw-cat-v">' + (v ? E(sumShow(L)) : "—") + '</span>';
      cats.appendChild(tile);
    });
    root.insertBefore(h("div", "ds-sec", "🗂️ 分類"), anchor); root.insertBefore(cats, anchor);

    /* 消費明細：今天的；沒有就最近 5 筆 */
    var todays = S.items.filter(function (i) { return i.date === t; });
    var list = todays.length ? todays : S.items.slice().sort(function (a, c) { return (c.date || "").localeCompare(a.date || ""); }).slice(0, 5);
    var sec = h("div", "ds-sec", (todays.length ? "🧾 今天的消費" : "🧾 最近的消費") + '<button class="ds-more" onclick="go(\'list\')">全部明細 ›</button>');
    var box = h("div", "card ds-info cw-list");
    if (list.length && typeof expItemRow === "function") box.innerHTML = list.map(function (i) { return (todays.length ? "" : '<div class="cw-date">' + E(md(i.date)) + '</div>') + expItemRow(i); }).join("");
    else { box.classList.add("thc-empty"); box.appendChild(img("budgetOk")); box.appendChild(h("div", "thc-txt", '<div class="sub">還沒有消費紀錄。按「＋ 快速記帳」記下第一筆吧！</div>')); }
    root.insertBefore(sec, anchor); root.insertBefore(box, anchor);
    if (anchor && anchor.nodeType === 1) root.insertBefore(h("div", "ds-sec", "⚙️ 匯率與完整表單"), anchor);
  }


  /* =====================================================================
     📷 照片頁 Layout：旅行照片手帳（只在鱷魚主題）
     頁首（相簿名稱、張數、儲存說明、拿相機的鱷魚）→ 加照片 → 照片牆（拍立得，CSS）
     日期標題拆成「日期＋📍地點標籤」；鱷魚只在頁首與空狀態，不放在照片上。
     ===================================================================== */
  function splitDatePlace(b) {
    if (!b || b.querySelector(".ds-chip")) return;
    var m = /^(\d{1,2}\/\d{1,2}（週.）)｜(.+)$/.exec(b.textContent.trim());
    if (m) b.innerHTML = '<span class="cph-date">' + E(m[1]) + '</span> <span class="ds-chip">📍 ' + E(m[2]) + '</span>';
    else if (/^\d{1,2}\/\d{1,2}（週.）$/.test(b.textContent.trim())) b.innerHTML = '<span class="cph-date">' + E(b.textContent.trim()) + '</span>';
  }
  function photoLayout(root) {
    if (root.querySelector(".cph-head")) return;
    var first = root.querySelector(":scope > .card.sub");
    if (first && /照片|Cloud/.test(first.textContent)) {
      var n = (typeof P !== "undefined" ? P : []).filter(function (p) { return albumP(p); }).length;
      var note = h("div", "cph-note"); while (first.firstChild) note.appendChild(first.firstChild);
      first.classList.remove("sub"); first.classList.add("ds-main", "ds-paper", "cph-head");
      var tx = h("div", "cph-head-txt", '<div class="cph-title">📷 旅行相簿</div><div class="cph-meta"><span class="ds-chip">共 ' + n + ' 張</span></div>');
      if (typeof claude === "undefined" || !claude || typeof claude.use !== "function")
        Array.prototype.forEach.call(note.querySelectorAll("div"), function (x) { if (/^等待備份/.test(x.textContent.trim())) x.style.display = "none"; });
      tx.appendChild(note); first.appendChild(tx); first.appendChild(img("camera", "cph-head-img"));
    }
    /* 日期卡、單日標題、地點／來源群組：標題整理成日期＋地點標籤 */
    root.querySelectorAll(".swp-in .l>b, #focus-card>b").forEach(splitDatePlace);
    /* 這個環境沒有雲端時，每張都是「僅本機」，標籤只會造成雜訊（頁首已說明照片存在這台裝置） */
    if (typeof claude === "undefined" || !claude || typeof claude.use !== "function")
      root.querySelectorAll(".tile>.sub").forEach(function (x) { if (/僅本機/.test(x.textContent)) x.classList.add("cph-local"); });
    root.querySelectorAll(":scope > .card").forEach(function (c) {
      var b = c.querySelector(":scope > b"), g = c.querySelector(":scope > .grid");
      if (b && g && !c.classList.contains("cph-group")) c.classList.add("cph-group");
    });
  }


  /* =====================================================================
     🎫 票券中心 Layout：旅行票夾（只在鱷魚主題）
     頁首（張數＋拿票券的鱷魚）→ 原本的切換與新增按鈕 → 日期標籤 → 每張票一張票根卡
     票根卡由原本的票券列與圖片區「搬過去」組成，點擊編輯、加圖片、刪圖片都不變。
     ===================================================================== */
  function tixLayout(root) {
    if (root.querySelector(".ct-head")) return;
    var seg = root.querySelector(":scope > .seg"); if (!seg) return;
    var groups = Array.prototype.filter.call(root.querySelectorAll(":scope > .card"), function (c) { return c.querySelector(":scope > .item"); });
    var n = groups.reduce(function (s, c) { return s + c.querySelectorAll(":scope > .item").length; }, 0);
    var head = h("div", "card ds-main ds-paper ct-head", '<div class="ct-head-txt"><div class="ct-title">🎫 旅行票夾</div><div class="ct-sub">新幹線、JR、船班、景點門票和預約 QR Code，都收在這裡。</div>'
      + '<div class="ct-meta"><span class="ds-chip">' + (tixMode === "today" ? "今天 " : "共 ") + n + ' 張</span></div></div>');
    head.appendChild(img("ticket", "ct-head-img"));
    root.insertBefore(head, seg);
    groups.forEach(function (c) {
      var bar = c.querySelector(":scope > .daybar"), isFocus = c.id === "focus-card";
      if (bar) {
        var b = bar.querySelector("b"), sp = bar.querySelector("span");
        var lab = h("div", "ds-sec ct-date", "📅 " + E(b ? b.textContent : "") + (sp ? '<span class="ct-count">' + E(sp.textContent) + '</span>' : ""));
        root.insertBefore(lab, c);
      }
      var kids = Array.prototype.slice.call(c.children).filter(function (x) { return x !== bar; });
      var first = null;
      for (var i = 0; i < kids.length; i++) {
        if (!kids[i].classList.contains("item")) continue;
        var t = h("div", "card ct-ticket"), top = h("div", "ct-top"), stub = h("div", "ct-stub");
        top.appendChild(kids[i]);
        if (kids[i + 1] && !kids[i + 1].classList.contains("item")) { stub.appendChild(kids[i + 1]); i++; }
        t.appendChild(top); if (stub.firstChild) t.appendChild(stub);
        root.insertBefore(t, c); if (!first) first = t;
      }
      if (isFocus && first) first.id = "focus-card";
      c.remove();
    });
  }


  /* =====================================================================
     ➕ 快速記帳（只在鱷魚主題）：金額是焦點、分類用膠囊一點即選
     原本的欄位與存檔流程完全不變；分類膠囊只是幫原本的下拉選單選值。
     ===================================================================== */
  function quickAddLayout(md) {
    var a = md.querySelector("#q_a"), sel = md.querySelector("#q_c");
    if (!a || !sel || md.querySelector(".cq-amt")) return;
    var sheet = md.querySelector(".sheet"); if (sheet) sheet.classList.add("cq");
    var u = md.querySelector("#q_u");
    var symOf = function () { var c = u ? u.value : "JPY"; return (typeof SYM !== "undefined" && SYM[c]) || (CSYM[c] || c + " "); };
    var wrap = h("div", "cq-amt"), sym = h("span", "cq-sym", E(String(symOf()).trim()));
    a.parentNode.insertBefore(wrap, a); wrap.appendChild(sym); wrap.appendChild(a);
    if (u) u.addEventListener("change", function () { sym.textContent = String(symOf()).trim(); });
    /* 分類膠囊 */
    var chips = h("div", "cq-cats");
    Array.prototype.forEach.call(sel.options, function (o) {
      var b = h("button", "cq-cat", E(o.textContent.trim())); b.type = "button"; b.setAttribute("data-v", o.value);
      b.addEventListener("click", function () { sel.value = o.value; sel.dispatchEvent(new Event("change", { bubbles: true })); });
      chips.appendChild(b);
    });
    var sync = function () { Array.prototype.forEach.call(chips.children, function (b) { b.classList.toggle("on", b.getAttribute("data-v") === sel.value); }); };
    sel.addEventListener("change", sync); sync();
    sel.classList.add("cq-hidden"); sel.parentNode.insertBefore(chips, sel);
    /* 外部（例如錢包分類）用程式設定選單值時，也同步一次 */
    setTimeout(sync, 80);
  }


  /* =====================================================================
     🎒 更多：旅行背包（只在鱷魚主題）
     「更多」選單依用途分組；設定頁依旅程／匯率／外觀／資料／關於分區。
     都是把原本的按鈕與卡片搬進分組，點擊行為不變。
     ===================================================================== */
  var MORE_GROUPS = [
    ["🎫 旅途隨身", ["tix", "trans", "resv", "map"]],
    ["📒 旅行紀錄", ["days", "gosh", "rev", "book"]],
    ["💰 帳務", ["list", "stat"]],
    ["🧳 準備與設定", ["pack", "set"]]
  ];
  function moreLayout(md) {
    var g = md.querySelector(".mgrid"); if (!g || md.querySelector(".cm-group")) return;
    var byKey = {}, rest = [];
    Array.prototype.forEach.call(g.querySelectorAll("button"), function (b) { var m = /go\('(\w+)'\)/.exec(b.getAttribute("onclick") || ""); if (m) byKey[m[1]] = b; else rest.push(b); });
    var box = h("div", "cm-groups"), used = {};
    MORE_GROUPS.forEach(function (grp) {
      var items = grp[1].filter(function (k) { return byKey[k]; }); if (!items.length) return;
      var sec = h("div", "cm-group", '<div class="cm-title">' + grp[0] + '</div>'), grid = h("div", "mgrid cm-grid");
      items.forEach(function (k) { grid.appendChild(byKey[k]); used[k] = 1; });
      sec.appendChild(grid); box.appendChild(sec);
    });
    var others = Object.keys(byKey).filter(function (k) { return !used[k]; }).map(function (k) { return byKey[k]; }).concat(rest);
    if (others.length) { var sec2 = h("div", "cm-group", '<div class="cm-title">🧩 其他</div>'), g2 = h("div", "mgrid cm-grid"); others.forEach(function (b) { g2.appendChild(b); }); sec2.appendChild(g2); box.appendChild(sec2); }
    g.parentNode.insertBefore(box, g); g.remove();
    var hd = md.querySelector(".sh-h");
    if (hd) { var t = hd.firstElementChild || hd; if (t && /更多功能/.test(t.textContent)) t.textContent = "🎒 旅行背包"; var old = hd.querySelector(".thc"); if (old) old.remove(); hd.insertBefore(img("walk"), hd.lastElementChild); }
  }
  var SET_GROUPS = [
    ["✈️ 旅程", ["旅程設定", "開始新旅程"]],
    ["💱 匯率", ["💱 匯率"]],
    ["🎨 外觀與主題", ["主題色", "🐊 小鱷魚提示"]],
    ["💾 資料管理", ["備份與還原", "危險操作"]]
  ];
  function settingsLayout(root) {
    if (root.querySelector(".cs-head")) return;
    var cards = Array.prototype.slice.call(root.querySelectorAll(":scope > .card"));
    var byTitle = {}; cards.forEach(function (c) { var t = firstB(c); if (t && !byTitle[t]) byTitle[t] = c; });
    if (!byTitle["旅程設定"]) return;
    var head = h("div", "card ds-main ds-paper cs-head", '<div class="cs-head-txt"><div class="cs-title">🎒 旅行背包</div><div class="cs-sub">旅程、匯率、主題和資料備份都整理在這裡。</div></div>');
    head.appendChild(img("walk", "cs-head-img"));
    var frag = document.createDocumentFragment(), used = [];
    frag.appendChild(head);
    SET_GROUPS.forEach(function (grp) {
      var list = grp[1].map(function (t) { return byTitle[t]; }).filter(Boolean); if (!list.length) return;
      frag.appendChild(h("div", "ds-sec", grp[0]));
      list.forEach(function (c) { frag.appendChild(c); used.push(c); });
    });
    var rest = cards.filter(function (c) { return used.indexOf(c) < 0; });
    if (rest.length) { frag.appendChild(h("div", "ds-sec", "ℹ️ 關於與其他")); rest.forEach(function (c) { frag.appendChild(c); }); }
    root.insertBefore(frag, root.firstChild);
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

    root.setAttribute("data-ctab", tab);
    if (tab === "set") { try { settingsLayout(root); } catch (e) { if (window.console) console.warn("croc set", e); } }
    if (tab === "tix") { try { tixLayout(root); } catch (e) { if (window.console) console.warn("croc tix", e); } }
    if (tab === "photo") { try { photoLayout(root); } catch (e) { if (window.console) console.warn("croc photo", e); } }
    if (tab === "add") { try { walletLayout(root); } catch (e) { if (window.console) console.warn("croc wallet", e); } }
    decorateBudget(root);
    if (tab === "plan") { try { planLayout(root); } catch (e) {} decoratePlan(root); try { planTrailEnd(root); } catch (e) {} }

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
        try { moreLayout(md); } catch (e) {}
        try { quickAddLayout(md); } catch (e) {}
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
