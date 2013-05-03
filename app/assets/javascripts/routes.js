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
        this.resource('pharmacology', function(){});
    });
    this.resource('targets'); 
    this.resource('target', { path: '/targets/:target_id' }, function() {
        //this.resource('pharmacology');
    });
});

App.CompoundIndexRoute = Ember.Route.extend({
  model: function(params) {
    return this.modelFor('compound');
  }
});

App.CompoundPharmacologyRoute = Ember.Route.extend({
	
//  setupController: function(controller, compoundPharmacology) {
//      console.log('comp pharma route setup controller');
//      controller.set('content', compoundPharmacology);
//  },

  model: function(params) {
    console.log('comp pharma route');
    return this.modelFor('compound');
  }
});

App.PharmacologyIndexRoute = Ember.Route.extend({
  model: function(params) {
    console.log('comp pharma index route');
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
