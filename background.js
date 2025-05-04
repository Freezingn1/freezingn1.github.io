// Lampa (Uncensured) Plugin - Loading Screen Background Color Changer
// Сохраните как loading_bg_color.js в папке plugins

(function() {
    // Конфигурация плагина
    const plugin = {
        name: 'LoadingScreenBGColor',
        description: 'Изменяет цвет фона загрузочного экрана',
        version: '1.0',
        author: 'Your Name',
        
        // Настройки по умолчанию
        defaultColor: '#121212', // Стандартный цвет фона
        
        // Инициализация плагина
        initialize() {
            // Создаем стиль для загрузочного экрана
            this.createStyle();
            
            // Добавляем настройку в меню параметров
            this.addSettingsOption();
            
            console.log(`[${this.name}] Плагин инициализирован`);
        },
        
        // Создаем стиль для загрузочного экрана
        createStyle() {
            // Проверяем, есть ли уже наш стиль
            if (document.getElementById('loadingScreenBGColorStyle')) return;
            
            const style = document.createElement('style');
            style.id = 'loadingScreenBGColorStyle';
            
            // Получаем сохраненный цвет или используем стандартный
            const savedColor = localStorage.getItem('lampa_loading_bg_color') || this.defaultColor;
            
            style.textContent = `
                .loader--full {
                    background-color: ${savedColor} !important;
                }
            `;
            
            document.head.appendChild(style);
        },
        
        // Добавляем опцию в настройки
        addSettingsOption() {
            // Ждем, пока загрузится меню настроек
            const waitForSettings = setInterval(() => {
                if (typeof Lampa === 'undefined' || !Lampa.Settings) return;
                
                clearInterval(waitForSettings);
                
                // Добавляем нашу настройку
                Lampa.Settings.addParam({
                    component: 'LoadingScreenBGColor',
                    param: {
                        name: 'loading_bg_color',
                        type: 'title',
                        title: this.name
                    },
                    field: {
                        template: `
                            <div class="selector selector--button">
                                <div class="selector__body">
                                    <div class="selector__title">Цвет фона загрузки</div>
                                    <div class="selector__value">{{text('loading_bg_color')}}</div>
                                </div>
                                <div class="selector__append">
                                    <input type="color" value="${localStorage.getItem('lampa_loading_bg_color') || this.defaultColor}" 
                                           style="width: 30px; height: 30px;"
                                           @change="changeColor($event)">
                                </div>
                            </div>
                        `,
                        methods: {
                            changeColor(event) {
                                const color = event.target.value;
                                localStorage.setItem('lampa_loading_bg_color', color);
                                
                                // Обновляем стиль
                                const style = document.getElementById('loadingScreenBGColorStyle');
                                if (style) {
                                    style.textContent = `
                                        .loader--full {
                                            background-color: ${color} !important;
                                        }
                                    `;
                                }
                                
                                // Обновляем отображаемое значение
                                this.text('loading_bg_color', color);
                            }
                        },
                        computed: {
                            text() {
                                return (key, def = '') => {
                                    return localStorage.getItem('lampa_loading_bg_color') || this.defaultColor;
                                }
                            }
                        }
                    }
                });
                
                console.log(`[${this.name}] Настройка добавлена в меню`);
            }, 500);
        }
    };
    
    // Запускаем плагин после загрузки страницы
    if (window.addEventListener) {
        window.addEventListener('load', () => plugin.initialize());
    } else {
        window.attachEvent('onload', () => plugin.initialize());
    }
})();