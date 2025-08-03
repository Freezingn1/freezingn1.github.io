(function() {
    'use strict';

    // Adding multi-language support
    Lampa.Lang.add({
        search: {
            ru: 'Поиск',
            en: 'Search',
            uk: 'Пошук',
            zh: '搜索'
        },
        settings: {
            ru: 'Настройки',
            en: 'Settings',
            uk: 'Налаштування',
            zh: '设置'
        },
        premium: {
            ru: 'Премиум',
            en: 'Premium',
            uk: 'Преміум',
            zh: '高级'
        },
        profile: {
            ru: 'Профиль',
            en: 'Profile',
            uk: 'Профіль',
            zh: '个人资料'
        },
        feed: {
            ru: 'Новости',
            en: 'Feed',
            uk: 'Новини',
            zh: '饲料'
        },
        notice: {
            ru: 'Уведомления',
            en: 'Notifications',
            uk: 'Сповіщення',
            zh: '通知'
        },
        broadcast: {
            ru: 'Вещание', 
            en: 'Broadcast',
            uk: 'Мовлення',
            zh: '广播'
        },
        fullscreen: {
            ru: 'Полноэкранный режим',
            en: 'Fullscreen mode',
            uk: 'Повноекранний режим',
            zh: '全屏模式'
        },
        reload: {
            ru: 'Обновление страницы',
            en: 'Page reload',
            uk: 'Оновлення сторінки',
            zh: '页面重新加载'
        },
        blackfriday: {
            ru: 'Черная пятница',
            en: 'Black Friday',
            uk: 'Чорна п’ятниця',
            zh: '黑色星期五'
        },
        split: {
            ru: 'Разделитель',
            en: 'Divider',
            uk: 'Розділювач',
            zh: '分隔符'
        },
        split2: {
            ru: 'Разделитель NEW',
            en: 'Divider2',
            uk: 'Розділювач2',
            zh: '分隔符2'
        },
        time: {
            ru: 'Время',
            en: 'Time',
            uk: 'Годинник',
            zh: '时间'
        },
        name_menu: {
            ru: 'Отображать в шапке',
            en: 'Display in header',
            uk: 'Відображати у шапці',
            zh: '在标题中显示'
        },
        name_plugin: {
            ru: 'Настройка шапки',
            en: 'Display in header',
            uk: 'Налаштування шапки',
            zh: '帽子设置'
        },
        plugin_description: {
            ru: 'Плагин для настройки шапки',
            en: 'Plugin for customizing the header',
            uk: 'Плагін для налаштування шапки',
            zh: '用于配置上限的插件'
        },
        NOTICE: {
            ru: 'Уведомления ByLampa',
            en: 'Уведомления ByLampa',
            uk: 'Уведомления ByLampa',
            zh: 'Уведомления ByLampa'
        },
        proto: {
            ru: 'Защита https',
            en: 'Защита https',
            uk: 'Защита https',
            zh: 'Защита https'
        }
    });

    function startPlugin() {
        var manifest = {
            type: 'other',
            version: '0.2.0',
            name: Lampa.Lang.translate('name_plugin'),
            description: Lampa.Lang.translate('plugin_description'),
            component: 'head_filter',
        };
        Lampa.Manifest.plugins = manifest;

        var head = {
            'head_filter_show_search': {name:Lampa.Lang.translate('search'), element: '.open--search', default: true},
            'head_filter_show_settings': {name:Lampa.Lang.translate('settings'), element: '.open--settings', default: true}, 
            'head_filter_show_premium': {name:Lampa.Lang.translate('premium'), element: '.open--premium', default: false}, 
            'head_filter_show_profile': {name: Lampa.Lang.translate('profile'), element: '.open--profile', default: false}, 
            'head_filter_show_feed': {name: Lampa.Lang.translate('feed'), element: '.open--feed', default: false}, 
            'head_filter_show_notice': {name: Lampa.Lang.translate('notice'), element: '.open--notice', default: false},
            'head_filter_show_broadcast': {name: Lampa.Lang.translate('broadcast'), element: '.open--broadcast', default: false},
            'head_filter_show_fullscreen': {name: Lampa.Lang.translate('fullscreen'), element: '.full-screen', default: false}, 
            'head_filter_show_reload': {name: Lampa.Lang.translate('reload'), element: '.m-reload-screen', default: false},
            'head_filter_show_blackfriday': {name: Lampa.Lang.translate('blackfriday'), element: '.black-friday__button', default: false}, 
            'head_filter_show_split': {name: Lampa.Lang.translate('split'), element: '.head__split', default: false}, 
            'head_filter_show_split2': {name: Lampa.Lang.translate('split2'), element: '.head__markers', default: false}, 
            'head_filter_show_time': {name: Lampa.Lang.translate('time'), element: '.head__time', default: false}, 
            'head_filter_show_notice2': {name: Lampa.Lang.translate('NOTICE'), element: '.notice-screen', default: true}, 
            'head_filter_show_proto2': {name: Lampa.Lang.translate('proto'), element: '.proto', default: true, delay: 1000}, // Добавлена задержка 500мс
        };

        function showHideElement(element, show, delay) {
            if (show) {
                $(element).show();
            } else {
                if (delay) {
                    setTimeout(function() {
                        $(element).hide();
                    }, delay);
                } else {
                    $(element).hide();
                }
            }
        }

        Lampa.Storage.listener.follow('change', function(event) {
            if (event.name == 'activity') {
                setTimeout(function() {
                    Object.keys(head).forEach(function(key) {
                        var show_element = Lampa.Storage.get(key, head[key].default); 
                        showHideElement(head[key].element, show_element, head[key].delay);     
                    });          
                }, 500);
            } else if (event.name in head) {
                var show_element = Lampa.Storage.get(event.name, head[event.name].default); 
                showHideElement(head[event.name].element, show_element, head[event.name].delay);     
            }
        });

        Lampa.Template.add('settings_head_filter',`<div></div>`);

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                type: 'button'
            },
            field: {
                name: Lampa.Lang.translate('name_plugin'),
                description: Lampa.Lang.translate('plugin_description')
            },
            onChange: ()=>{
                Lampa.Settings.create('head_filter',{
                    onBack: ()=>{
                        Lampa.Settings.create('interface')
                    }
                })
            }
        })   

        Lampa.SettingsApi.addParam({
            component: 'head_filter',
            param: {
                type: 'title'
            },
            field: {
                name:Lampa.Lang.translate('name_menu'),
            }
        });   

        Object.keys(head).forEach(function(key) {
            Lampa.SettingsApi.addParam({
                component: 'head_filter',
                param: {
                    name: key,
                    type: 'trigger',
                    default: head[key].default
                },
                field: {
                    name: head[key].name,
                }        
            });
        });
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type == 'ready') {
                startPlugin();
            }
        });
    }
})();