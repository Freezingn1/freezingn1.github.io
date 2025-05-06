(function () {
  "use strict";

  // Кэш для хранения уже полученных названий
  const titleCache = new Map();

  async function getRuTitle(card) {
    if (titleCache.has(card.id)) {
      return titleCache.get(card.id);
    }

    const isTV = card.first_air_date ? 'tv' : 'movie';
    const url = `https://worker-patient-dream-26d7.bdvburik.workers.dev:8443/https://api.themoviedb.org/3/${isTV}/${card.id}?language=ru-RU&api_key=4ef0d7355d9ffb5151e987764708ce96`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { accept: "application/json" }
      });
      const data = await response.json();
      const title = data.title || data.name;
      
      if (title) {
        titleCache.set(card.id, title);
        return title;
      }
    } catch (e) {
      console.error('Error fetching RU title:', e);
    }

    return null;
  }

  // Для карточек в списках
  function processCardElement(element, card) {
    if (!card || !card.id) return;

    getRuTitle(card).then(ruTitle => {
      if (!ruTitle) return;

      const existing = element.querySelector('.ru-title-overlay');
      if (existing) return;

      const overlay = document.createElement('div');
      overlay.className = 'ru-title-overlay';
      overlay.style = `
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(transparent, rgba(0,0,0,0.7));
        padding: 10px 5px 5px;
        color: white;
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      `;
      overlay.textContent = `RU: ${ruTitle}`;

      element.style.position = 'relative';
      element.appendChild(overlay);
    });
  }

  // Для полной страницы
  function processFullPage(card) {
    getRuTitle(card).then(ruTitle => {
      if (!ruTitle) return;

      const render = Lampa.Activity.active()?.activity?.render();
      if (!render) return;

      const existing = $('.ru-title-full', render);
      if (existing.length) return;

      const titleElement = $(".full-start-new__title, .full-start-new__status", render).first();
      if (titleElement.length) {
        titleElement.before(
          `<div class="ru-title-full" style="font-size: 1.3em; margin-bottom: 5px; color: #ffffff;">RU: ${ruTitle}</div>`
        );
      }
    });
  }

  // Обработчик для карточек в списках
  function setupCardObserver() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1 && node.classList?.contains('card')) {
            const cardData = Lampa.Template.get('card', node);
            if (cardData) {
              Lampa.Utils.delay(() => processCardElement(node, cardData.data), 100);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Обработчик для полной страницы
  function setupFullPageListener() {
    Lampa.Listener.follow("full", e => {
      if (e.type === "complite") {
        processFullPage(e.data.movie);
      }
    });
  }

  function startPlugin() {
    if (!window.title_plugin_ru) {
      window.title_plugin_ru = true;
      setupCardObserver();
      setupFullPageListener();
    }
  }

  startPlugin();
})();