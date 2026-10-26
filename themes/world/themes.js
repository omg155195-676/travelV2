/* ===== 主題世界：🍁 秋日日本、🌊 海洋旅行、🌙 星空夜旅、🌸 櫻花日和、🧳 復古旅行手帳 =====
   共用 themes/world/engine.js 的頁面架構與互動；這裡只提供每個世界的插圖與名稱。
   插圖全部是 SVG，顏色來自各主題的 --w1～--w4、--wk（定義在 themes.css），所以同一張圖在不同世界有不同配色。
   不使用任何鱷魚素材。 */
(function () {
  /* ---------- SVG 小工具 ---------- */
  function f(n, sw) { /* n：1~4 主題色、k 墨色、w 白、n 無 */
    var fill = n === "w" ? "#fff" : n === "n" ? "none" : "var(--w" + n + ")";
    return ' style="fill:' + fill + (sw === 0 ? "" : ';stroke:var(--wk);stroke-width:' + (sw || 2.4) + ';stroke-linejoin:round;stroke-linecap:round') + '"';
  }
  function ln(w) { return ' style="fill:none;stroke:var(--wk);stroke-width:' + (w || 2.4) + ';stroke-linecap:round;stroke-linejoin:round"'; }
  function wrap(inner) { return '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">' + inner + "</svg>"; }

  /* ---------- 共用插圖（每個世界自動換色） ---------- */
  var G = {
    camera: '<rect x="8" y="21" width="48" height="31" rx="7"' + f(1) + '/><rect x="22" y="13" width="18" height="10" rx="3"' + f(2) + '/><circle cx="32" cy="37" r="11"' + f("w") + '/><circle cx="32" cy="37" r="5.5"' + f("k", 0) + '/><circle cx="47" cy="28" r="2.6"' + f(3, 0) + '/>',
    train: '<rect x="14" y="8" width="36" height="42" rx="10"' + f(1) + '/><rect x="19" y="15" width="26" height="14" rx="4"' + f("w") + '/><circle cx="23" cy="39" r="3.4"' + f(3) + '/><circle cx="41" cy="39" r="3.4"' + f(3) + '/><path d="M22 50 L16 58 M42 50 L48 58 M18 58 H46"' + ln() + '/><rect x="27" y="4" width="10" height="5" rx="2"' + f(2) + '/>',
    ticket: '<path d="M8 18 H56 V27 A5 5 0 0 0 56 37 V46 H8 V37 A5 5 0 0 0 8 27 Z"' + f(4) + '/><path d="M40 20 V44"' + ' style="fill:none;stroke:var(--wk);stroke-width:2;stroke-dasharray:3 3"/><path d="M15 27 H33 M15 33 H29 M15 39 H31"' + ln(2.2) + '/><circle cx="48" cy="32" r="4"' + f(1) + '/>',
    bowl: '<path d="M8 30 H56 A24 22 0 0 1 8 30 Z"' + f(1) + '/><path d="M14 30 C20 22 26 34 32 26 C38 18 44 30 50 24"' + ln() + '/><path d="M36 6 L24 28 M44 8 L30 28"' + ln() + '/><rect x="22" y="50" width="20" height="5" rx="2"' + f(2) + '/>',
    purse: '<path d="M10 26 Q10 18 18 18 H46 Q54 18 54 26 V48 Q54 56 46 56 H18 Q10 56 10 48 Z"' + f(1) + '/><path d="M22 18 Q22 8 32 8 Q42 8 42 18"' + ln() + '/><circle cx="32" cy="36" r="7"' + f(3) + '/><path d="M32 32 V40 M29 35 H35"' + ln(2) + '/>',
    sun: '<circle cx="32" cy="32" r="12"' + f(3) + '/><path d="M32 6 V13 M32 51 V58 M6 32 H13 M51 32 H58 M13.6 13.6 L18.5 18.5 M45.5 45.5 L50.4 50.4 M13.6 50.4 L18.5 45.5 M45.5 18.5 L50.4 13.6"' + ln() + '/>',
    cloud: '<path d="M18 46 A10 10 0 0 1 18 26 A14 14 0 0 1 44 22 A12 12 0 0 1 48 46 Z"' + f(4) + '/><circle cx="46" cy="14" r="6"' + f(3) + '/>',
    rain: '<path d="M8 32 A24 24 0 0 1 56 32 Z"' + f(1) + '/><path d="M32 32 V50 Q32 56 26 56 Q22 56 22 52"' + ln() + '/><path d="M12 42 V46 M52 40 V44 M44 50 V54"' + ' style="fill:none;stroke:var(--w2);stroke-width:2.6;stroke-linecap:round"/>',
    cold: '<path d="M32 8 V56 M11 20 L53 44 M11 44 L53 20"' + ' style="fill:none;stroke:var(--w2);stroke-width:4;stroke-linecap:round"/><path d="M26 12 L32 18 L38 12 M26 52 L32 46 L38 52"' + ln(2.4) + '/><circle cx="32" cy="32" r="5"' + f(4) + '/>',
    hot: '<circle cx="28" cy="34" r="13"' + f(3) + '/><path d="M28 9 V15 M8 34 H14 M12 18 L16 22 M44 18 L40 22"' + ln() + '/><path d="M46 40 Q50 36 54 40 M46 48 Q50 44 54 48"' + ' style="fill:none;stroke:var(--w1);stroke-width:2.6;stroke-linecap:round"/>',
    error: '<path d="M32 8 L58 54 H6 Z"' + f(3) + '/><path d="M32 24 V38"' + ln(3.4) + '/><circle cx="32" cy="46" r="2.6"' + f("k", 0) + '/>',
    moon: '<path d="M40 8 A24 24 0 1 0 56 44 A19 19 0 1 1 40 8 Z"' + f(3) + '/><path d="M44 16 H52 L44 24 H52"' + ln(2.2) + '/>',
    cup: '<path d="M12 28 H46 V40 A14 14 0 0 1 32 54 H26 A14 14 0 0 1 12 40 Z"' + f(1) + '/><path d="M46 32 H50 A6 6 0 0 1 50 44 H45"' + ln() + '/><path d="M22 10 Q18 16 22 20 M32 8 Q28 14 32 20"' + ' style="fill:none;stroke:var(--w2);stroke-width:2.6;stroke-linecap:round"/>',
    map: '<path d="M8 14 L22 9 L42 15 L56 10 V50 L42 55 L22 49 L8 54 Z"' + f(4) + '/><path d="M22 9 V49 M42 15 V55"' + ln(2) + '/><path d="M14 40 Q22 30 30 36 T48 26"' + ' style="fill:none;stroke:var(--w1);stroke-width:2.6;stroke-dasharray:4 3;stroke-linecap:round"/><circle cx="48" cy="25" r="3.5"' + f(3) + '/>',
    suitcase: '<rect x="12" y="18" width="40" height="34" rx="6"' + f(1) + '/><path d="M24 18 V12 Q24 9 27 9 H37 Q40 9 40 12 V18"' + ln() + '/><path d="M22 18 V52 M42 18 V52"' + ' style="fill:none;stroke:var(--w2);stroke-width:3"/><circle cx="20" cy="56" r="3"' + f("k", 0) + '/><circle cx="44" cy="56" r="3"' + f("k", 0) + '/>',
    feet: '<ellipse cx="22" cy="40" rx="7" ry="11"' + f(1) + '/><ellipse cx="42" cy="24" rx="7" ry="11"' + f(1) + '/><circle cx="17" cy="26" r="2.2"' + f(2, 0) + '/><circle cx="23" cy="25" r="2.2"' + f(2, 0) + '/><circle cx="37" cy="10" r="2.2"' + f(2, 0) + '/><circle cx="43" cy="9" r="2.2"' + f(2, 0) + '/>'
  };
  /* 預算狀態：同一個錢包＋不同的小徽章 */
  function purseState(st) {
    var badge = st === "ok" ? '<circle cx="50" cy="16" r="9"' + f(2) + '/><path d="M46 16 L49 19 L55 12"' + ln(2.4) + '/>'
      : st === "near" ? '<circle cx="50" cy="16" r="9"' + f(3) + '/><path d="M50 11 V17"' + ln(2.8) + '/><circle cx="50" cy="21" r="1.6"' + f("k", 0) + '/>'
      : '<circle cx="50" cy="16" r="9" style="fill:#e25a4f;stroke:var(--wk);stroke-width:2.4"/><path d="M50 11 V20 M46 17 L50 21 L54 17"' + ln(2.4) + '/>';
    return G.purse + badge;
  }

  /* ---------- 各世界的專屬插圖 ---------- */
  var M = {
    maple: '<path d="M32 5 L36 19 L48 12 L44 27 L58 29 L46 37 L52 50 L38 44 L34 57 H30 L26 44 L12 50 L18 37 L6 29 L20 27 L16 12 L28 19 Z"' + f(1) + '/><path d="M32 22 V60"' + ln(2.2) + '/>',
    torii: '<path d="M4 14 Q32 6 60 14 L60 20 Q32 12 4 20 Z"' + f(1) + '/><rect x="10" y="24" width="44" height="5" rx="1"' + f(1) + '/><rect x="14" y="18" width="7" height="40" rx="1.5"' + f(1) + '/><rect x="43" y="18" width="7" height="40" rx="1.5"' + f(1) + '/><rect x="29" y="18" width="6" height="7"' + f(2) + '/>',
    ginkgo: '<path d="M32 38 C14 36 6 20 13 10 C21 16 26 14 32 20 C38 14 43 16 51 10 C58 20 50 36 32 38 Z"' + f(3) + '/><path d="M32 22 L32 58"' + ln(2.4) + '/>',
    boat: '<path d="M8 40 H56 L48 52 H16 Z"' + f(1) + '/><path d="M32 8 V40"' + ln() + '/><path d="M34 10 L34 37 L54 37 Z"' + f("w") + '/><path d="M30 16 L30 37 L14 37 Z"' + f(4) + '/><path d="M4 58 Q12 52 20 58 T36 58 T52 58 T64 58"' + ' style="fill:none;stroke:var(--w2);stroke-width:2.8;stroke-linecap:round"/>',
    lighthouse: '<path d="M24 58 L28 20 H36 L40 58 Z"' + f("w") + '/><path d="M26.6 32 H37.4 L38.4 44 H25.6 Z"' + f(1, 0) + '/><path d="M24 58 L28 20 H36 L40 58 Z"' + ln() + '/><rect x="26" y="12" width="12" height="8" rx="2"' + f(3) + '/><path d="M24 12 L32 5 L40 12 Z"' + f(1) + '/><path d="M42 16 L56 12 M42 18 L56 22"' + ' style="fill:none;stroke:var(--w3);stroke-width:2.6;stroke-linecap:round"/>',
    shell: '<path d="M32 54 L10 26 Q32 4 54 26 Z"' + f(4) + '/><path d="M32 54 L18 18 M32 54 L32 12 M32 54 L46 18"' + ln(2) + '/><rect x="27" y="52" width="10" height="6" rx="2"' + f(3) + '/>',
    moonstars: '<path d="M30 8 A24 24 0 1 0 56 40 A19 19 0 1 1 30 8 Z"' + f(3) + '/><path d="M48 8 L50 13 L55 14 L50 16 L48 21 L46 16 L41 14 L46 13 Z"' + f(3, 1.6) + '/><circle cx="56" cy="28" r="2"' + f(3, 0) + '/>',
    shooting: '<path d="M44 10 L48 20 L59 21 L51 28 L54 39 L44 33 L34 39 L37 28 L29 21 L40 20 Z"' + f(3) + '/><path d="M28 34 L8 54 M22 30 L6 44 M32 42 L18 58"' + ' style="fill:none;stroke:var(--w2);stroke-width:2.6;stroke-linecap:round"/>',
    lantern: '<rect x="20" y="16" width="24" height="34" rx="10"' + f(3) + '/><path d="M20 26 H44 M20 40 H44"' + ln(2) + '/><path d="M28 16 V10 H36 V16 M28 50 V56 H36 V50"' + ln() + '/><path d="M32 4 V10"' + ln() + '/>',
    sakura: '<g>' + [0, 72, 144, 216, 288].map(function (r) { return '<path transform="rotate(' + r + ' 32 32)" d="M32 30 C22 22 24 8 32 10 C34 7 38 7 37 12 C42 12 40 24 32 30 Z"' + f(1) + '/>'; }).join("") + '</g><circle cx="32" cy="32" r="5"' + f(3) + '/>',
    branch: '<path d="M4 54 Q24 44 30 30 Q36 18 58 10"' + ' style="fill:none;stroke:var(--w2);stroke-width:4;stroke-linecap:round"/>' + [[18, 44], [36, 24], [52, 14]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="7"' + f(1) + '/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.4"' + f(3, 0) + '/>'; }).join(""),
    chime: '<path d="M18 30 Q18 12 32 12 Q46 12 46 30 Z"' + f(4) + '/><path d="M14 30 H50"' + ln() + '/><path d="M32 4 V12 M32 30 V40"' + ln() + '/><rect x="26" y="40" width="12" height="18" rx="2"' + f(1) + '/>',
    compass: '<circle cx="32" cy="32" r="24"' + f(4) + '/><circle cx="32" cy="32" r="18"' + ln(1.6) + '/><path d="M32 12 L38 32 L32 52 L26 32 Z"' + f(1, 1.6) + '/><path d="M32 12 L38 32 L26 32 Z"' + f(3, 1.6) + '/><circle cx="32" cy="32" r="3"' + f("k", 0) + '/>',
    stamp: '<rect x="12" y="8" width="40" height="48"' + f("w") + '/><rect x="18" y="14" width="28" height="30"' + f(4, 1.6) + '/><path d="M20 38 L28 26 L34 34 L38 28 L44 38 Z"' + f(1, 1.6) + '/><circle cx="38" cy="20" r="3"' + f(3, 0) + '/><path d="M18 50 H40"' + ln(2) + '/>',
    envelope: '<rect x="8" y="16" width="48" height="34" rx="3"' + f(4) + '/><path d="M8 18 L32 36 L56 18"' + ln() + '/><rect x="42" y="20" width="10" height="12"' + f(1, 1.6) + '/>'
  };

  /* 角色動作 → 插圖（各世界自己的對照；沒有指定就用共用插圖） */
  function artFor(world) {
    return function (k) {
      var w = world.motif, inner;
      switch (k) {
        case "map": case "front": inner = M[w.hero]; break;
        case "idea": inner = M[w.idea]; break;
        case "walk": inner = M[w.walk] || G.feet; break;
        case "happy": inner = M[w.happy] || G.sun; break;
        case "depart": inner = G.suitcase; break;
        case "camera": inner = G.camera; break;
        case "train": inner = G.train; break;
        case "ticket": inner = G.ticket; break;
        case "eat": inner = G.bowl; break;
        case "rest": inner = G.cup; break;
        case "sleep": case "tired": inner = G.moon; break;
        case "rain": inner = G.rain; break;
        case "cold": inner = G.cold; break;
        case "hot": inner = G.hot; break;
        case "cloudy": inner = G.cloud; break;
        case "error": inner = G.error; break;
        case "budget-ok": inner = purseState("ok"); break;
        case "budget-near": inner = purseState("near"); break;
        case "budget-over": inner = purseState("over"); break;
        default: inner = M[w.hero];
      }
      var s = document.createElement("span");
      s.className = "wart wart-" + k;
      s.innerHTML = wrap(inner);
      return s;
    };
  }

  /* ---------- 五個世界 ---------- */
  var WORLDS = [
    { id: "maple", label: "🍁 秋日日本", motif: { hero: "torii", idea: "ginkgo", walk: "maple", happy: "maple" },
      text: { plan: "🍁 秋日旅行時間軸", wallet: "🍁 旅行支出手帳", stateIcon: "🍁", photo: "📷 拍立得相簿", tix: "🎫 日本車票夾",
              more: "📖 旅行手帳目錄", pack: "🧳 旅行行李", list: "🧾 支出帳本", usingSub: "紅葉、神社、日本電車與拍立得，陪你走一趟秋天的日本。" } },
    { id: "sea", label: "🌊 海洋旅行", motif: { hero: "boat", idea: "lighthouse", walk: "shell", happy: "shell" },
      text: { plan: "🗺️ 航海日誌", wallet: "⚓ 航海補給帳", stateIcon: "⛵", photo: "🐚 海洋旅行相簿", tix: "⛴️ 船票夾",
              more: "🎒 航海背包", pack: "🎒 航海行李", list: "🧾 補給明細", trans: "⛴️ 航線與交通", usingSub: "海浪、小船、燈塔和船票，像在島與島之間航行。" } },
    { id: "night", label: "🌙 星空夜旅", motif: { hero: "moonstars", idea: "shooting", walk: "lantern", happy: "shooting" },
      text: { plan: "🌌 星空時間軸", wallet: "🌙 夜旅支出", stateIcon: "⭐", photo: "✨ 星空照片牆", tix: "🚆 夜行列車票夾",
              more: "🎒 夜旅背包", pack: "🔦 夜旅行李", list: "🧾 夜旅明細", usingSub: "月亮、星星和夜行列車，溫暖地陪你看每天的行程。" } },
    { id: "sakura", label: "🌸 櫻花日和", motif: { hero: "branch", idea: "chime", walk: "sakura", happy: "sakura" },
      text: { plan: "🌸 春日時間軸", wallet: "🌸 春日旅行帳", stateIcon: "🌸", photo: "📷 春日相簿", tix: "🎫 春日車票夾",
              more: "🧳 春日旅行箱", pack: "🧺 春日行李", list: "🧾 春日明細", usingSub: "櫻花、白雲、風鈴和單車，輕柔清新的日系春日。" } },
    { id: "retro", label: "🧳 復古旅行手帳", motif: { hero: "compass", idea: "envelope", walk: "stamp", happy: "stamp" },
      text: { plan: "🧭 旅行日誌", wallet: "📒 復古支出簿", stateIcon: "✒️", photo: "🎞️ 底片相簿", tix: "🎟️ 收藏老車票",
              more: "🧳 復古行李箱", pack: "🧳 行李清單", list: "📒 支出明細", usingSub: "老地圖、郵票、印章和舊車票，像一本真的旅行手帳。" } }
  ];

  WORLDS.forEach(function (w) {
    makeWorld(w.id, {
      label: w.label,
      art: artFor(w),
      text: Object.assign({ using: w.label + " 使用中" }, w.text),
      after: function (tab, root) {
        /* 舊的「小鱷魚提示」開關，在插圖世界裡改叫「旅伴提示」（功能不變） */
        if (tab === "set") root.querySelectorAll(".card>.l>b").forEach(function (b) { if (/小鱷魚提示/.test(b.textContent)) b.textContent = "💬 旅伴提示"; });
      }
    });
  });
})();
