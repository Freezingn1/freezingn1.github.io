(function() {
  'use strict';

window.lampainit_invc = {};

window.lampainit_invc.appload = function appload() {
Lampa.Utils.putScriptAsync(["https://aviamovie.github.io/surs.js"]);

    Lampa.Storage.set('surs_disableCustomName', true);
    Lampa.Storage.set('surs_name', 'AVIAMOVIE');
}
})();