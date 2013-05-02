// If you want your urls to look www.yourapp.org/x instead of www.yourapp.org/#/x
// you have to set location to 'history'. This means that you must also tell rails
// what your routes are and to redirect them to whatever template contains the ember
// outlet
App.Router.reopen({
  location: 'history',
  rootURL: '/'
});

App.Router.map(function() { 
    this.route("search", { path: "/search" });
    this.resource('compounds'); 
    this.resource('compound', { path: '/compounds/:compound_id' }, function() {
        this.route('pharmacology');
    });
    this.resource('targets'); 
    this.resource('target', { path: '/targets/:target_id' }, function() {
        this.route('pharmacology');
    });
});

App.CompoundIndexRoute = Ember.Route.extend({
  model: function(params) {
    return this.modelFor('compound');
  }
});

App.CompoundPharmacologyRoute = Ember.Route.extend({
	
  setupController: function(controller, compound) {
      console.log('comp pharma route setup controller');
      controller.getPharmacology(compound.get('id'));
      //controller.set('content', compound.getPharmacology(this.get('currentPage')));
  },

  model: function(params) {
    console.log('comp pharma route');
    return this.modelFor('compound');
  }
});

App.TargetIndexRoute = Ember.Route.extend({
  model: function(params) {
    return this.modelFor('target');
  }
});

App.TargetPharmacologyRoute = Ember.Route.extend({
  model: function(params) {
    return this.modelFor('target');
  }
});

App.IndexRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    App.searchController.set('query', '');
  }
});
