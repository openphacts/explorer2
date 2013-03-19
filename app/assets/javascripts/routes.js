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
    console.log('compound controller');
    controller.set('content', compound);
  },
  model: function(params) {
    compound = App.Compound.find(params.compound_id);
    return compound;
  }
});
