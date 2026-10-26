/* ===== 🐊 鱷魚旅行主題 =====
   使用共用的主題世界引擎（themes/world/engine.js）；這個檔案只提供鱷魚的美術與名稱。
   角色圖在 img/，以使用者提供的角色素材圖為標準裁切（只縮放、裁切、去背）。 */
makeWorld("croc", {
  label: "🐊 鱷魚旅行",
  char: "croc",
  dir: "themes/croc/img/",
  nav: { home: "nav-home", plan: "nav-plan", add: "nav-list", photo: "nav-photo", more: "nav-more" }
});
