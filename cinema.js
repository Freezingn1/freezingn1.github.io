(function() {
  'use strict';

  function loadScript(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    script.onerror = () => console.error("Ошибка загрузки скрипта:", url);
    document.head.appendChild(script);
  }

  function checkAndLoad() {
    if (typeof Lampa === 'undefined') {
      console.error("Lampa не загружена!");
      return;
    }

    // Проверяем Storage
    if (!Lampa.Storage) {
      console.error("Lampa.Storage не доступен!");
      return;
    }

    // Устанавливаем ID
    if (Lampa.Storage.get("lampac_unic_id") !== "tyusdt") {
      Lampa.Storage.set("lampac_unic_id", "tyusdt");
    }

    // Загружаем скрипт безопасно
    loadScript("https://freezingn1.github.io/conline.js", () => {
      console.log("Скрипт загружен");
    });
  }

  // Ждем загрузки Lampa
  const interval = setInterval(() => {
    if (typeof Lampa !== 'undefined') {
      clearInterval(interval);
      checkAndLoad();
    }
  }, 200);
})();
