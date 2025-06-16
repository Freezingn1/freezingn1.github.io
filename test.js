// Создаем категорию для плагинов
Lampa.SettingsApi.addCategory({
    name: "Плагины",
    icon: `
    <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m8 8-4 4 4 4m8 0 4-4-4-4m-2-3-4 14"/>
    </svg>
    `
});

// Добавляем компонент "Стильный интерфейс" в категорию "Плагины"
Lampa.SettingsApi.addComponent({
    component: 'styleinter',
    name: Lampa.Lang.translate('Стильный интерфейс'),
    category: 'Плагины',
    icon: `
    <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m3 16 5-7 6 6.5m6.5 2.5L16 13l-4.286 6M14 10h.01M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"/>
    </svg>
    `
});

// Настройки отображения логотипов (в той же категории)
Lampa.SettingsApi.addParam({
    component: "styleinter",
    param: {
        name: "logo_start",
        type: "select",
        values: { 
            "logo_on": "Включить логотипы", 
            "logo_off": "Выключить логотипы", 
        },
        default: "logo_on"
    },
    field: {
        name: "Отображение логотипов",
        description: "Управление отображением логотипов в стильном интерфейсе"
    }
});

// Пример добавления другого плагина в ту же категорию
/*
Lampa.SettingsApi.addComponent({
    component: 'another_plugin',
    name: Lampa.Lang.translate('Другой плагин'),
    category: 'Плагины',
    icon: `...`
});
*/