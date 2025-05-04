(function() {
    // Ждем полной загрузки Lampa
    function waitForLampa() {
        if (typeof Lampa === 'undefined' || !Lampa.Sidebar) {
            setTimeout(waitForLampa, 100);
            return;
        }

        initPlugin();
    }

    function initPlugin() {
        // Конфигурация
        const config = {
            name: 'tmdb-anime',
            title: 'Аниме (TMDB)',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7,9.5A1.5,1.5 0 0,1 8.5,8A1.5,1.5 0 0,1 10,9.5A1.5,1.5 0 0,1 8.5,11A1.5,1.5 0 0,1 7,9.5M16,17H8V15H16V17M15,13H9V11H15V13M15,9H9V7H15V9Z"/></svg>'
        };

        // Проверяем, не добавлен ли уже раздел
        if (Lampa.Sidebar.items.some(item => item.id === config.name)) {
            return;
        }

        // Добавляем раздел
        Lampa.Sidebar.add({
            id: config.name,
            name: config.title,
            icon: config.icon,
            component: {
                template: `
                    <div class="section">
                        <h2>${config.title}</h2>
                        <div class="section-content">
                            <p>Контент аниме будет здесь</p>
                        </div>
                    </div>
                `
            }
        });

        // Добавляем настройку для API ключа (если есть API настроек)
        if (Lampa.Settings && Lampa.Settings.list) {
            Lampa.Settings.list.push({
                title: 'TMDB API Key',
                name: 'tmdb_api_key',
                component: {
                    template: `
                        <div class="setting">
                            <input type="text" v-model="value" @change="save">
                        </div>
                    `,
                    data: () => ({
                        value: Lampa.Storage.get('tmdb_api_key') || ''
                    }),
                    methods: {
                        save() {
                            Lampa.Storage.set('tmdb_api_key', this.value);
                        }
                    }
                }
            });
        }

        console.log('Плагин аниме успешно загружен!');
    }

    // Запускаем ожидание Lampa
    waitForLampa();
})();