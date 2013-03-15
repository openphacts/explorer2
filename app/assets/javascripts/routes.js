App.Router.reopen({
  location: 'history',
  rootURL: '/'
});

App.Router.map(function() { 
    this.resource('compounds'); 
    this.resource('compound', { path: '/compound/:compound_id' });
});

App.CompoundRoute = Ember.Route.extend({
  setupController: function(controller, compound) {
    controller.set('content', compound);
  }
});
