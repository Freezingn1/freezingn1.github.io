/*
  Lampa plugin — "Стильный интерфейс" (Stylish Interface)
  Single-file plugin (JavaScript).

  Что делает:
  - Инъекция кастомных стилей (тёмная/золотая темы, большие постеры, размытие фона).
  - Добавляет простую панель настроек в шапку Lampa (если доступна) для быстрой настройки.
  - Сохраняет настройки в localStorage, даёт API для включения/выключения плагина.

  Установка:
  1) Поместите этот файл на хостинг (GitHub Pages, raw.githack, любой static host).
  2) В приложении Lampa: Настройки -> Плагины -> Добавить плагин -> вставьте URL до этого файла.
  3) Перезапустите Lampa или перезагрузите приложение.

  Примечание: Lampa поддерживает разные версии плагинов; этот скрипт написан максимально совместимо —
  он не требует знания приватного API и работает через стандартный DOM и localStorage. Если у вашей
  версии Lampa есть собственный API для регистрации плагинов, его можно интегрировать поверх этого файла.

  Автор: (сгенерировано ChatGPT)
  Версия: 1.0.0
*/

(function(){
  if(typeof window === 'undefined' || !document) return;

  const PLUGIN_KEY = 'lampa_plugin_stylish_interface_v1';
  const STORAGE_KEY = 'lampa_stylish_interface_settings';

  // Default settings
  const defaults = {
    enabled: true,
    theme: 'dark', // 'dark' | 'gold' | 'light'
    bigPosters: true,
    blurBackground: false,
    accentColor: '#ffb74d' // used for 'gold' and accents
  };

  // Utilities
  const util = {
    read(){
      try{
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {...defaults};
      }catch(e){
        console.error('StylishInterface: read error', e);
        return {...defaults};
      }
    },
    write(obj){
      try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); }
      catch(e){ console.error('StylishInterface: write error', e); }
    },
    onDOMReady(cb){
      if(document.readyState === 'complete' || document.readyState === 'interactive') cb();
      else document.addEventListener('DOMContentLoaded', cb);
    }
  };

  // State
  let settings = util.read();
  let styleNode = null;
  let helperNode = null;

  // Generate CSS according to settings
  function buildCSS(s){
    const accent = s.accentColor || defaults.accentColor;
    const base = `
      /* --- Stylish Interface plugin styles --- */
      :root{
        --si-accent: ${accent};
      }
      /* Make main containers look cleaner */
      .si-card-rounded{ border-radius: 12px !important; box-shadow: 0 6px 18px rgba(0,0,0,0.35) !important; overflow: hidden }
      .si-poster-big img{ width: 100% !important; height: auto !important; object-fit: cover !important }

      /* Generic focus style for remote/keyboard */
      .si-focus-visible:focus{ outline: 3px solid rgba(255,190,100,0.18) !important; box-shadow: 0 0 0 3px rgba(255,190,100,0.08) inset }
    `;

    const themeCss = (s.theme === 'gold') ? `
      body{ background: linear-gradient(180deg,#0b0b0b,#0f0f0f) !important }
      .si-accent, .si-btn, .si-header{ color: #fff !important }
      .si-accent-strong{ color: var(--si-accent) !important }
      .si-card{ background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.12)) !important; border: 1px solid rgba(255,190,100,0.06) !important }
    ` : (s.theme === 'light') ? `
      body{ background: #f7f7f7 !important; color: #111 !important }
      .si-card{ background: #fff !important; border: 1px solid rgba(0,0,0,0.06) !important }
      .si-accent-strong{ color: ${accent} !important }
    ` : `
      /* dark theme */
      body{ background: #0a0a0a !important; color: #ddd !important }
      .si-card{ background: rgba(8,8,8,0.6) !important; border: 1px solid rgba(255,255,255,0.02) !important }
      .si-accent-strong{ color: ${accent} !important }
    `;

    const posterCss = s.bigPosters ? `
      .si-poster-big{ width: 220px; height: 330px; }
      .si-grid .si-poster-big{ width: 260px; height: 380px; }
    ` : '';

    const blurCss = s.blurBackground ? `
      /* Attempt to blur large background elements */
      .player-bg, .wallpaper, .lampa-cover{ filter: blur(6px) brightness(0.6) !important; transform: scale(1.02) !important }
    ` : '';

    // Small responsive tweak for TV
    const responsive = `
      @media (max-width: 1280px){ .si-poster-big{ width: 180px; height: 260px } }
    `;

    return base + themeCss + posterCss + blurCss + responsive;
  }

  // Inject or update style tag
  function applyStyles(){
    if(!settings.enabled) return removeStyles();
    const css = buildCSS(settings);
    if(!styleNode){
      styleNode = document.createElement('style');
      styleNode.id = PLUGIN_KEY + '_styles';
      document.documentElement.appendChild(styleNode);
    }
    styleNode.textContent = css;

    // Add helper classes to common elements (best-effort)
    try{
      document.querySelectorAll('.card, .item, .poster, .poster__img').forEach(el=>{
        el.classList.add('si-card', 'si-card-rounded');
      });
      document.querySelectorAll('img.poster__img, img.poster, .poster img').forEach(img=>{
        const parent = img.closest('.poster, .item');
        if(parent) parent.classList.add('si-poster-big');
      });
    }catch(e){/* ignore if DOM differs */}
  }

  function removeStyles(){
    if(styleNode){ styleNode.remove(); styleNode = null; }
    // remove helper classes (best-effort)
    try{
      document.querySelectorAll('.si-card, .si-card-rounded, .si-poster-big').forEach(el=>{
        el.classList.remove('si-card','si-card-rounded','si-poster-big');
      });
    }catch(e){}
  }

  // Create a small UI panel in header for quick access
  function createQuickPanel(){
    // Don't create duplicate
    if(document.getElementById(PLUGIN_KEY + '_panel')) return;

    const header = document.querySelector('.header, .lampa__header, header') || document.body;
    const panel = document.createElement('div');
    panel.id = PLUGIN_KEY + '_panel';
    panel.style.cssText = 'position:relative;display:flex;gap:8px;align-items:center;padding:6px;z-index:9999;';

    const btn = document.createElement('button');
    btn.textContent = settings.enabled ? 'SI: ON' : 'SI: OFF';
    btn.className = 'si-btn';
    btn.style.cssText = 'padding:6px 10px;border-radius:8px;border:0;cursor:pointer;background:var(--si-accent, #ffb74d);color:#000;font-weight:600';
    btn.onclick = ()=>{
      settings.enabled = !settings.enabled;
      util.write(settings);
      btn.textContent = settings.enabled ? 'SI: ON' : 'SI: OFF';
      if(settings.enabled) applyStyles(); else removeStyles();
    };

    const gear = document.createElement('button');
    gear.textContent = 'Настройки';
    gear.className = 'si-btn';
    gear.style.cssText = 'padding:6px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);cursor:pointer;background:transparent;color:inherit';
    gear.onclick = openSettingsDialog;

    panel.appendChild(btn);
    panel.appendChild(gear);

    // attach
    header.insertBefore(panel, header.firstChild);
    helperNode = panel;
  }

  function removeQuickPanel(){ if(helperNode) helperNode.remove(); helperNode = null; }

  // Settings dialog (simple)
  function openSettingsDialog(){
    // If Lampa has its own modal, trying to reuse would be better; fallback - create custom overlay
    const overlay = document.createElement('div');
    overlay.id = PLUGIN_KEY + '_overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:10000;padding:20px';

    const box = document.createElement('div');
    box.style.cssText = 'width:760px;max-width:94%;background:linear-gradient(180deg, rgba(20,20,20,0.98), rgba(8,8,8,0.98));padding:18px;border-radius:12px;color:#fff;box-shadow:0 10px 40px rgba(0,0,0,0.7)';

    box.innerHTML = `
      <h2 style="margin:0 0 10px 0">Стильный интерфейс — настройки</h2>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <label style="flex:1;min-width:180px">Тема
          <select id="si_theme" style="width:100%;margin-top:6px;padding:8px;border-radius:8px;background:#fff;color:#000"></select>
        </label>
        <label style="flex:1;min-width:160px">Большие постеры
          <input id="si_big" type="checkbox" style="margin-left:8px;transform:scale(1.2)" />
        </label>
        <label style="flex:1;min-width:160px">Размытие фона
          <input id="si_blur" type="checkbox" style="margin-left:8px;transform:scale(1.2)" />
        </label>
        <label style="flex:1;min-width:160px">Акцентный цвет
          <input id="si_color" type="color" style="width:100%;margin-top:6px;padding:6px;border-radius:8px" />
        </label>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">
        <button id="si_cancel" style="padding:8px 14px;border-radius:8px">Отмена</button>
        <button id="si_save" style="padding:8px 14px;border-radius:8px;background:var(--si-accent);border:0;">Сохранить</button>
      </div>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // fill
    const sel = box.querySelector('#si_theme');
    ['dark','gold','light'].forEach(v=>{
      const opt = document.createElement('option'); opt.value = v; opt.textContent = v; sel.appendChild(opt);
    });
    box.querySelector('#si_theme').value = settings.theme;
    box.querySelector('#si_big').checked = !!settings.bigPosters;
    box.querySelector('#si_blur').checked = !!settings.blurBackground;
    box.querySelector('#si_color').value = settings.accentColor || defaults.accentColor;

    // handlers
    box.querySelector('#si_cancel').onclick = ()=>{ overlay.remove(); };
    box.querySelector('#si_save').onclick = ()=>{
      settings.theme = box.querySelector('#si_theme').value;
      settings.bigPosters = box.querySelector('#si_big').checked;
      settings.blurBackground = box.querySelector('#si_blur').checked;
      settings.accentColor = box.querySelector('#si_color').value;
      util.write(settings);
      applyStyles();
      overlay.remove();
    };
  }

  // Public API in window for power users
  function exposeAPI(){
    try{
      window[PLUGIN_KEY] = window[PLUGIN_KEY] || {};
      window[PLUGIN_KEY].settings = settings;
      window[PLUGIN_KEY].openSettings = openSettingsDialog;
      window[PLUGIN_KEY].applyStyles = ()=>{ settings = util.read(); applyStyles(); };
      window[PLUGIN_KEY].enable = ()=>{ settings.enabled = true; util.write(settings); applyStyles(); };
      window[PLUGIN_KEY].disable = ()=>{ settings.enabled = false; util.write(settings); removeStyles(); };
      window[PLUGIN_KEY].reset = ()=>{ settings = {...defaults}; util.write(settings); applyStyles(); };
    }catch(e){ console.warn('StylishInterface: cannot expose API', e); }
  }

  // Initialize plugin
  function init(){
    util.onDOMReady(()=>{
      try{
        // small delay — allow Lampa to render its UI
        setTimeout(()=>{
          settings = util.read();
          if(settings.enabled) applyStyles();
          createQuickPanel();
          exposeAPI();
        }, 300);

        // Try to observe DOM for lazy-loaded elements
        const obs = new MutationObserver((mut)=>{
          if(!settings.enabled) return;
          // when new nodes added, re-apply helper classes/styles
          for(const m of mut){
            if(m.addedNodes && m.addedNodes.length) applyStyles();
          }
        });
        obs.observe(document.documentElement || document.body, { childList:true, subtree:true });

      }catch(e){ console.error('StylishInterface init failed', e); }
    });
  }

  // auto-run
  init();

  // expose uninstall for cleanliness
  window[PLUGIN_KEY + '_uninstall'] = function(){ removeStyles(); removeQuickPanel(); try{ localStorage.removeItem(STORAGE_KEY); }catch(e){} };

})();
