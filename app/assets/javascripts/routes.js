// If you want your urls to look www.yourapp.org/x instead of www.yourapp.org/#/x
// you have to set location to 'history'. This means that you must also tell rails
// what your routes are and to redirect them to whatever template contains the ember
// outlet
//App.Router.reopen({
//  location: 'history',
//  rootURL: '/'
//});
App.Router.reopen({
    //rootURL: '/'
    // sub-uri deployment
    rootURL: root_url
});

if (window.history && window.history.pushState) {
    App.Router.reopen({
        location: 'history'
    });
}

App.Router.map(function() {
    this.route("search", {
        path: "/search"
    }, function() {

    });
    this.route('favourites', {
        path: '/favourites'
    }, function() {

    });
    this.resource('compounds', {
        path: '/compounds'
    }, function() {
        this.route('pharmacology', {
            path: '/pharmacology'
        }, function() {});
        this.route('pathways', {
            path: '/pathways'
        }, function() {});
        this.route('structure', {
            path: '/structure'
        }, function() {});
        this.route('draw', {
            path: '/draw'
        }, function() {});
    });
    this.resource('targets', {
        path: '/targets'
    }, function() {
        this.route('pharmacology', {
            path: '/pharmacology'
        }, function() {});
        this.route('pathways', {
            path: '/pathways'
        }, function() {});
        this.route('diseases', {
            path: '/diseases'
        }, function() {});
    });
    this.resource('trees', {
        path: '/trees'
    }, function() {
        this.route('pharmacology', {
            path: '/pharmacology'
        }, function() {});
    });
    this.resource('pathways', {
        path: '/pathways'
    }, function() {
        this.route('compounds', {
            path: '/compounds'
        }, function() {});
	this.route('targets', {
            path: '/targets'
        }, function() {});

    });
    this.resource('diseases', {
        path: '/diseases'
    }, function() {
        this.route('targets', {
            path: '/targets'
        }, function() {});
    });
    this.route('catchall', {
        path: '/*wildcard'
    });
});

App.ErrorRoute = Ember.Route.extend({

setupController: function(controller, model, params) {
console.log('error route');
controller.set('model', model);
console.log('model set');
},

model: function(params) {
console.log('error model');
}

});

App.ApplicationRoute = Ember.Route.extend({

    setupController: function(controller, model, params) {
        console.log('application route setup controller');
        controller.set('iex', !oldIE); 
        controller.set('closedForMaintenance', closedForMaintenance === 'true' ? true : false);

        var name = "explorerCookieAcceptance" + "=";
        var ca = document.cookie.split(';');
        ca.forEach(function(cookie, index, cookies) {
            var cookieData = cookie.split('=');
            if (cookieData[0].trim() === "explorerCookieAcceptance") {
                controller.set('cookieAcceptance', true);
            }
        });
    },

    actions: {
                //error: function(error, transition) {
//            if (error && error === 404) {
        //                // Can't find anything with that URI or general page not found response
        //                this.controllerFor('flash').pushObject(this.get('store').createRecord('flashMessage', {
        //                    type: 'error',
        //                    message: 'Sorry, can\'t find what you are looking for. If you think it should exist then please contact support using the help link above.'
        //                }));
        //            } else if (error && error === 500) {
        //                // App gone boom somehow
        //                console.log('500');
        //                this.controllerFor('flash').pushObject(this.get('store').createRecord('flashMessage', {
        //                    type: 'error',
        //                    message: 'Sorry, something seems to have gone wrong. Please try again. If the problem persists report it to support using the help link above.'
        //                }));
        //            } else if (error) {
        //                // Any other error codes
        //                console.log('general error');
        //                this.controllerFor('flash').pushObject(this.get('store').createRecord('flashMessage', {
        //                    type: 'error',
        //                    message: 'Sorry, something seems to have gone wrong. Please try again. If the problem persists report it to support using the help link above.'
        //                }));
        //            }
//                }
    }

});
//App.CatchallRoute = Ember.Route.extend({ 
//    beforeModel: function() {
//        this.transitionTo('error'); 
//    }
//});
App.ErrorRoute = Ember.Route.extend({

//    setupController: function(controller, model, params) {
//        controller.set('model', model);
//    }

});

// Search

App.SearchRoute = Ember.Route.extend({

    setupController: function(controller, model, params) {
        console.log('search route setup');
        controller.clear();
        controller.set('totalCompounds', 0);
        controller.set('totalTargets', 0);
        controller.doSearch();
    },

    model: function(params) {
        console.log('search route model');
        this.controllerFor('search').setCurrentQuery(params.query);
        return [];
    },

    beforeModel: function() {
        this.controllerFor('application').set('fetching', false);
        enable_scroll();
    },

    actions: {
        queryParamsDidChange: function() {
            this.refresh();
        }
    },

    //if we leave the route then set the params to the defaults
    resetController: function(controller, isExiting, transition) {
        if (isExiting) {
            // isExiting would be false if only the route's model was changing
            controller.set('listView', true);
            controller.set('objectView', false);
        }
    }


});
