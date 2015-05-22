import Ember from 'ember';

export default Ember.Route.extend({

    setupController: function(controller, model, params) {
        console.log('application route setup controller');
        controller.set('iex', !oldIE);

        var name = "explorerCookieAcceptance" + "=";
        var ca = document.cookie.split(';');
        ca.forEach(function(cookie, index, cookies) {
            var cookieData = cookie.split('=');
            if (cookieData[0].trim() === "explorerCookieAcceptance") {
                controller.set('cookieAcceptance', true);
            }
        });
    }

});

