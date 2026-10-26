/* ===== 私人主題載入器（PRIVATE_THEME_XIAOMALEI） =====
   - 角色圖、名稱與文字都加密在 pack.json（PBKDF2-SHA256 → AES-256-GCM）；這個檔案只有解密流程，沒有任何私人內容。
   - 密碼不存在任何檔案裡：用使用者輸入的密碼嘗試解密，解得開就是正確。
   - 解鎖後只把「解出的金鑰」記在這台裝置（localStorage），不存密碼；可隨時在設定裡重新上鎖。
   - 注意：這是純前端網站，安全程度取決於密碼強度。 */
(function () {
  var ID = "PRIVATE_THEME_XIAOMALEI", LS = "pvt-k1", PACK = "themes/private/pack.json";
  var pack = null, loaded = null;

  function b64(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function ub64(u) { var s = ""; for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s); }
  function getPack() { if (pack) return Promise.resolve(pack); return fetch(PACK, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error("pack"); return r.json(); }).then(function (j) { pack = j; return j; }); }
  function keyFromPw(pw, p) {
    return crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"])
      .then(function (k) { return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: b64(p.salt), iterations: p.it }, k, 256); })
      .then(function (bits) { return new Uint8Array(bits); });
  }
  function decrypt(raw, p) {
    return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["decrypt"])
      .then(function (k) { return crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(p.iv) }, k, b64(p.ct)); })
      .then(function (buf) { return JSON.parse(new TextDecoder().decode(buf)); });
  }
  function savedKey() { try { var v = localStorage.getItem(LS); return v ? b64(v) : null; } catch (e) { return null; } }

  /* 解鎖成功後：註冊成一個世界主題（共用 engine 的頁面架構） */
  function install(d) {
    if (loaded) return loaded; loaded = d;
    var I = d.img, T = d.text;
    function pic(k) { var e = document.createElement("img"); e.src = I[k] || I.smile; e.alt = ""; e.decoding = "async"; return e; }
    /* 情境 → 角色圖（全部來自角色設定圖，只縮放、裁切、去背） */
    var POSE = { map: "map", front: "full", walk: "pull", happy: "happy", depart: "depart", camera: "camera", train: "train", ticket: "plane",
      eat: "eat", rest: "rest", sleep: "sleep", tired: "tired", rain: "troubled", cold: "blush", hot: "huff", cloudy: "ponder", error: "panic",
      idea: "idea", "budget-ok": "content", "budget-near": "troubled", "budget-over": "panic", budgetOk: "content", budgetNear: "troubled", budgetOver: "panic" };
    /* 各頁頁首用最貼切的動作 */
    var HEAD = { pack: "pack", trans: "train", resv: "plane", gosh: "idea", list: "work", days: "map", stat: "work", map: "map", rev: "scenery", book: "work",
      plan: "map", photo: "camera", tix: "plane", set: "pull" };
    /* 日期列頭像：依日期輪流換表情 */
    var DOT = ["wave", "happy", "hope", "smile", "excited", "wink", "sweet", "laugh"];
    makeWorld(ID, {
      label: d.label,
      forceLight: true,
      art: function (k) { var s = document.createElement("span"); s.className = "xm-art xm-" + k; s.appendChild(pic(POSE[k] || k)); return s; },
      text: T,
      after: function (tab, root) {
        try { xmNav(); } catch (e) {}
        if (tab === "set") root.querySelectorAll(".card>.l>b").forEach(function (b) { if (/小鱷魚提示/.test(b.textContent)) b.textContent = "💬 " + (d.name || "旅伴") + "提示"; });
        /* 記帳：預算控制得很好（花不到一半）時，開心比讚 */
        if (tab === "add") {
          var w = root.querySelector(".cw-wallet .xm-art img");
          try { if (w && S.budget > 0 && sumTwd(S.items) / S.budget < 0.5 && S.items.length) w.src = I.thumb; } catch (e) {}
        }
        /* 頁首：每頁用最貼切的動作 */
        if (HEAD[tab]) {
          var hi = root.querySelector(".cx-head .xm-art img, .cp-head .xm-art img, .cph-head .xm-art img, .ct-head .xm-art img, .cs-head .xm-art img");
          if (hi && I[HEAD[tab]]) hi.src = I[HEAD[tab]];
        }
        /* 行程：目前日期上方的角色頭像（切換日期時輕輕跳一下） */
        if (tab === "plan") {
          var on = root.querySelector(".pd-d.on");
          if (on && !on.querySelector(".xm-dot")) { var a = document.createElement("span"); a.className = "xm-dot"; a.appendChild(pic(on.classList.contains("is-today") ? "wave" : DOT[(+(on.querySelector(".pd-dn") || {}).textContent.replace(/\D/g, "") || 0) % DOT.length])); on.appendChild(a); }
        }
        /* 首頁：旅行主卡旁陪伴的角色（拿相機、拉行李箱） */
        if (tab === "home") {
          var deco = root.querySelector(".ch-trip-deco .xm-art img"); if (deco) deco.src = I.pull;
          var big = root.querySelector(".ch-big .xm-art img"); if (big) big.src = I.work;
        }
      },
      nav: null
    });
    function xmNav() {
      var M = { home: "smile", plan: "ico-plan", add: "ico-list", photo: "ico-photo", more: "ico-map" };
      document.querySelectorAll("#nav button").forEach(function (b) {
        var oc = b.getAttribute("onclick") || "", m = /go\('(\w+)'\)/.exec(oc), k = m ? m[1] : (/openMore/.test(oc) ? "more" : "");
        var sp = b.querySelector("span"); if (!M[k] || !sp || sp.querySelector("img")) return;
        sp.textContent = ""; sp.classList.add("thc-nav"); sp.appendChild(pic(M[k]));
      });
    }
    /* 導航：用角色小圖示（engine 只對有 cfg.nav 的主題換圖示；這裡自己處理，因為圖在記憶體裡） */
    if (typeof renderNav === "function" && !renderNav.__xm) {
      var _n = renderNav;
      renderNav = function () {
        _n.apply(this, arguments);
        if (!S || S.ac !== ID) return;
        var M = { home: "smile", plan: "ico-plan", add: "ico-list", photo: "ico-photo", more: "ico-map" };
        document.querySelectorAll("#nav button").forEach(function (b) {
          var oc = b.getAttribute("onclick") || "", m = /go\('(\w+)'\)/.exec(oc), k = m ? m[1] : (/openMore/.test(oc) ? "more" : "");
          var sp = b.querySelector("span"); if (!M[k] || !sp || sp.querySelector("img")) return;
          sp.textContent = ""; sp.classList.add("thc-nav"); sp.appendChild(pic(M[k]));
        });
      };
      renderNav.__xm = 1;
    }
    try { THEME_PACKS[ID].init(); } catch (e) {}
    try { if (S && S.ac === ID) renderNav(); } catch (e) {}
    return d;
  }

  /* 公開 API（給設定頁的隱藏區塊用） */
  window.pvtUnlock = function (pw) {
    return getPack().then(function (p) {
      return keyFromPw(pw, p).then(function (raw) {
        return decrypt(raw, p).then(function (d) { try { localStorage.setItem(LS, ub64(raw)); } catch (e) {} install(d); return true; });
      });
    }).catch(function () { return false; });
  };
  window.pvtLock = function () { try { localStorage.removeItem(LS); } catch (e) {} if (S && S.ac === ID) { S.ac = "sakura"; save(); } location.reload(); };
  window.pvtUnlocked = function () { return !!loaded; };

  /* 啟動：這台裝置已解鎖過 → 自動用記住的金鑰解開 */
  window.pvtReady = (function () {
    var raw = savedKey();
    if (!raw || !window.crypto || !crypto.subtle) return Promise.resolve(false);
    return getPack().then(function (p) { return decrypt(raw, p).then(function (d) { install(d); return true; }); }).catch(function () { return false; });
  })();
})();
