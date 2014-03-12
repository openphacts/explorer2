// If you want your urls to look www.yourapp.org/x instead of www.yourapp.org/#/x
// you have to set location to 'history'. This means that you must also tell rails
// what your routes are and to redirect them to whatever template contains the ember
// outlet
//App.Router.reopen({
//  location: 'history',
//  rootURL: '/'
//});
if (window.history && window.history.pushState) {
    App.Router.reopen({
      location: 'history',
      rootURL: '/'
    });
}

App.Router.map(function() { 
    this.route("search", { path: "/search" }, function() {

    });
    this.resource('compounds', { path: '/compounds' }, function() {
        this.route('pharmacology', { path: '/pharmacology' }, function(){});
        this.route('pathways', { path: '/pathways' }, function(){});
        this.route('structure', { path: '/structure' }, function(){});
        this.route('draw', { path: '/draw' }, function(){});
    });
    this.resource('targets', { path: '/targets' }, function() {
        this.route('pharmacology', { path: '/pharmacology' }, function(){});
        this.route('pathways', { path: '/pathways' }, function(){});
    }); 
    this.resource('trees', { path: '/trees' }, function() {
        this.route('pharmacology', { path: '/pharmacology' }, function(){});
    });
    this.resource('pathways', { path: '/pathways' }, function() {
        this.route('compounds', { path: '/compounds' }, function(){});
    });
});

App.ApplicationRoute = Ember.Route.extend({

  setupController: function(controller, model, params) {
    console.log('application route setup controller');
    controller.set('iex', !oldIE);
  }

});

// Search

App.SearchRoute = Ember.Route.extend({

  setupController: function(controller, model, params) {
    console.log('search route setup');
    controller.clear();
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
  }
	
});
