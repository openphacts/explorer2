// If you want your urls to look www.yourapp.org/x instead of www.yourapp.org/#/x
// you have to set location to 'history'. This means that you must also tell rails
// what your routes are and to redirect them to whatever template contains the ember
// outlet
//App.Router.reopen({
//  location: 'history',
//  rootURL: '/'
//});

App.Router.map(function() { 
    this.route("search", { path: "/search" }, function() {

    });
    this.resource('compounds', { path: '/compounds' }, function() {
        this.route('pharmacology', { path: '/pharmacology' }, function(){});
        this.route('pathways', { path: '/pathways' }, function(){});
        this.route('structure', { path: '/structure' }, function(){});
    });
    this.resource('targets', { path: '/targets' }, function() {
        this.route('pharmacology', { path: '/pharmacology' }, function(){});
        this.route('pathways', { path: '/pathways' }, function(){});
    }); 
    this.resource('trees', { path: '/trees' }, function() {
        this.route('pharmacology', { path: '/pharmacology' }, function(){});
    });
    this.resource('pathways', { path: '/pathways' }, function() {}); 
    this.resource('pathway', { path: '/pathways/:pathway_id' }, function() {
        this.resource('pathway.compounds', { path: '/compounds' }, function(){});
    });
});

// Search

App.SearchRoute = Ember.Route.extend({

  observesParameters: ['query'],

  setupController: function(controller, model, queryParams) {
    console.log('search route setup');
    controller.clear();
    controller.set('totalResults', 0);
    controller.doSearch();
  },

  model: function() {
    console.log('search route model');
    this.controllerFor('search').setCurrentQuery(this.get('queryParameters').query);
    return [];
  }
	
});
