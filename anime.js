// Публичный API ключ TheMovieDB
const TMDB_API_KEY = '8a8a1e62d9b9c49a50d280b5f6a9c3f4';

// Конфигурация плагина
const animePlugin = {
    enabled: true,
    initialized: false,
    
    init() {
        // Загружаем сохраненные настройки
        const savedConfig = localStorage.getItem('lampa_anime_plugin');
        if (savedConfig) {
            this.enabled = JSON.parse(savedConfig).enabled;
        }
        
        // Ждем готовности DOM
        this.waitForElements().then(() => {
            if (this.enabled) {
                this.addAnimeSection();
            }
            this.addSettingsControl();
            this.initialized = true;
        }).catch(e => {
            console.error('Anime plugin init error:', e);
        });
    },
    
    saveConfig() {
        localStorage.setItem('lampa_anime_plugin', JSON.stringify({
            enabled: this.enabled
        }));
    },
    
    waitForElements() {
        return new Promise((resolve, reject) => {
            const maxAttempts = 10;
            let attempts = 0;
            
            const checkElements = () => {
                attempts++;
                
                // Проверяем разные возможные селекторы меню и настроек
                const menu = document.querySelector('.menu, [class*="menu"], #menu');
                const settings = document.querySelector('.settings-params, [class*="settings"], #settings');
                
                if (menu && settings) {
                    resolve();
                } else if (attempts < maxAttempts) {
                    setTimeout(checkElements, 500);
                } else {
                    reject(new Error('Не удалось найти необходимые элементы DOM'));
                }
            };
            
            checkElements();
        });
    },
    
    addAnimeSection() {
        // Удаляем существующий раздел, если есть
        this.removeAnimeSection();
        
        // Создаем HTML для раздела
        const animeSectionHTML = `
            <div class="menu-section" data-section="anime">
                <div class="menu-section__title">Аниме</div>
                <div class="menu-section__items">
                    <a href="#" class="menu-section__item" data-action="anime-list" data-list-id="146567">Лучшие аниме</a>
                    <a href="#" class="menu-section__item" data-action="anime-popular">Популярные</a>
                    <a href="#" class="menu-section__item" data-action="anime-trending">Тренды</a>
                </div>
            </div>
        `;
        
        // Пытаемся найти меню разными способами
        const menu = document.querySelector('.menu, [class*="menu"], #menu');
        if (menu) {
            // Пытаемся вставить перед настройками или в конец меню
            const settingsSection = menu.querySelector('[data-section="settings"], .settings');
            if (settingsSection) {
                settingsSection.insertAdjacentHTML('beforebegin', animeSectionHTML);
            } else {
                menu.insertAdjacentHTML('beforeend', animeSectionHTML);
            }
            
            // Добавляем обработчики
            this.addMenuEventListeners();
        }
    },
    
    removeAnimeSection() {
        const animeSection = document.querySelector('[data-section="anime"]');
        if (animeSection) {
            animeSection.remove();
        }
    },
    
    addMenuEventListeners() {
        document.querySelectorAll('[data-action^="anime-"]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const action = item.getAttribute('data-action');
                const listId = item.getAttribute('data-list-id');
                this.loadAnimeList(action, listId);
            });
        });
    },
    
    addSettingsControl() {
        // Удаляем существующий переключатель, если есть
        const existingSwitch = document.querySelector('[data-setting="anime-plugin"]');
        if (existingSwitch) existingSwitch.remove();
        
        // Пытаемся найти контейнер настроек разными способами
        const settingsContainer = document.querySelector('.settings-params, .settings__params, [class*="settings-params"]');
        if (settingsContainer) {
            const switchHTML = `
                <div class="settings-param" data-setting="anime-plugin">
                    <div class="settings-param__name">Раздел "Аниме"</div>
                    <div class="settings-param__value">
                        <div class="switch">
                            <input type="checkbox" id="anime-plugin-switch" ${this.enabled ? 'checked' : ''}>
                            <label for="anime-plugin-switch"></label>
                        </div>
                    </div>
                </div>
            `;
            
            settingsContainer.insertAdjacentHTML('beforeend', switchHTML);
            
            // Добавляем обработчик
            const switchElement = document.getElementById('anime-plugin-switch');
            if (switchElement) {
                switchElement.addEventListener('change', () => {
                    this.enabled = switchElement.checked;
                    this.saveConfig();
                    
                    if (this.enabled) {
                        this.addAnimeSection();
                    } else {
                        this.removeAnimeSection();
                    }
                });
            }
        }
    },
    
    async loadAnimeList(type, listId = null) {
        try {
            // Реализация загрузки списка (как в предыдущих примерах)
            console.log(`Loading anime list: ${type}, ID: ${listId}`);
            // ... остальной код загрузки ...
        } catch (e) {
            console.error('Error loading anime list:', e);
        }
    }
};

// Инициализация плагина с проверкой среды
function initializePlugin() {
    // Проверяем, что мы на странице Lampa
    if (document.querySelector('body.lampa, body[class*="lampa"], #lampa')) {
        // Ждем полной загрузки страницы
        if (document.readyState === 'complete') {
            animePlugin.init();
        } else {
            window.addEventListener('load', () => animePlugin.init());
        }
    }
}

// Запускаем инициализацию
initializePlugin();

// Альтернативный способ инициализации для SPA
const observer = new MutationObserver(() => {
    if (!animePlugin.initialized && document.querySelector('.menu, [class*="menu"], #menu')) {
        animePlugin.init();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});