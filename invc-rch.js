(function() {
  'use strict';

  if (!window.rch) {

    window.rch = {
      type: undefined,
	  startTypeInvoke: false
    }


    window.rch.typeInvoke = function rchtypeInvoke(host, call) {
      if (window.rch.type == undefined) {
        window.rch.startTypeInvoke = true;
        var check = function check(good) {
          window.rch.type = Lampa.Platform.is('android') ? 'apk' : good ? 'cors' : 'web';
          call();
        }

        if (Lampa.Platform.is('android') || Lampa.Platform.is('tizen')) check(true);
        else {
          var net = new Lampa.Reguest();
          net.silent('http://vcdn3.skaz.tv'.indexOf(location.host) >= 0 ? 'https://github.com/' : host+'/cors/check', function() {
            check(true);
          }, function() {
            check(false);
          }, false, {
            dataType: 'text'
          });
        }
      } else call();
    }


    window.rch.Registry = function RchRegistry(toresult, hubConnection, startConnection) {
      window.rch.typeInvoke('http://vcdn3.skaz.tv', function() {
        hubConnection.invoke("RchRegistry", JSON.stringify({
          version: 141,
          host: location.host,
          href: location.href,
          rchtype: window.rch.type
        })).then(function() {
          startConnection();
          hubConnection.on("RchClient", function(rchId, url, data, headers, returnHeaders) {
            console.log('RCH', url);
			var network = new Lampa.Reguest();
            function result(html) {
              if (Lampa.Arrays.isObject(html) || Lampa.Arrays.isArray(html)) {
                html = JSON.stringify(html);
              }
              network.silent(toresult, false, false, {
                id: rchId,
                value: html
              }, {
                dataType: 'text',
                timeout: 1000 * 5
              });
            }
            if (url == 'eval') {
              result(eval(data));
            } else {
              network["native"](url, result, function() {
                console.log('RCH', 'result empty');
                result('');
              }, data, {
                dataType: 'text',
                timeout: 1000 * 8,
                headers: headers,
                returnHeaders: returnHeaders
              });
            }
          });
        });
      });
    };
  }

})();