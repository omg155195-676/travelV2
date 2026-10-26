/* 旅行控制中心 — 離線快取
 * App 本身：先用快取打開（離線也能開），同時在背景抓新版，下次打開就是新版。
 * 天氣、匯率等即時資料：一律走網路，不快取。
 * 改版時把 VERSION 加 1。 */
var VERSION = "v19";
var CACHE = "travel-app-" + VERSION;
var SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png",
  "./themes/world/world.css",
  "./themes/world/themes.css",
  "./themes/world/engine.js",
  "./themes/world/themes.js",
  "./themes/croc/theme.css",
  "./themes/croc/theme.js",
  "./themes/croc/img/bg-meadow.webp",
  "./themes/croc/img/budget-near.webp",
  "./themes/croc/img/budget-ok.webp",
  "./themes/croc/img/budget-over.webp",
  "./themes/croc/img/camera.webp",
  "./themes/croc/img/cloudy.webp",
  "./themes/croc/img/cold.webp",
  "./themes/croc/img/depart.webp",
  "./themes/croc/img/eat.webp",
  "./themes/croc/img/error.webp",
  "./themes/croc/img/front.webp",
  "./themes/croc/img/happy.webp",
  "./themes/croc/img/hot.webp",
  "./themes/croc/img/idea.webp",
  "./themes/croc/img/map.webp",
  "./themes/croc/img/nav-home.webp",
  "./themes/croc/img/nav-list.webp",
  "./themes/croc/img/nav-more.webp",
  "./themes/croc/img/nav-photo.webp",
  "./themes/croc/img/nav-plan.webp",
  "./themes/croc/img/rain.webp",
  "./themes/croc/img/rest.webp",
  "./themes/croc/img/sleep.webp",
  "./themes/croc/img/ticket.webp",
  "./themes/croc/img/tired.webp",
  "./themes/croc/img/train.webp",
  "./themes/croc/img/walk.webp",
  "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // 一個一個加，某個 CDN 檔失敗也不影響 App 本身
      return Promise.all(SHELL.map(function (u) {
        return c.add(new Request(u, { cache: "reload" })).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k.indexOf("travel-app-") === 0 && k !== CACHE;
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isShell(url) {
  if (url.origin === self.location.origin) return true;
  return url.hostname === "cdnjs.cloudflare.com" || url.hostname === "cdn.jsdelivr.net";
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (!isShell(url)) return; // 天氣、匯率、地圖等：交給網路

  // 打開頁面：不管網址後面帶什麼參數，都對應到同一個 App
  var key = req.mode === "navigate" ? "./index.html" : req;

  e.respondWith(
    caches.open(CACHE).then(function (c) {
      return c.match(key, { ignoreSearch: req.mode === "navigate" }).then(function (hit) {
        var net = fetch(req).then(function (res) {
          if (res && (res.ok || res.type === "opaque")) c.put(key, res.clone());
          return res;
        }).catch(function () { return hit; });
        if (hit) { e.waitUntil(net); return hit; }
        return net.then(function (res) {
          return res || new Response("目前離線，請連上網路後再打開一次。", {
            status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" }
          });
        });
      });
    })
  );
});
