// Pathway Routes

App.PathwayIndexRoute = Ember.Route.extend({

  setupController: function(controller, model) {
    controller.set('model', model);
  },

  model: function(params) {
    console.log('pathway index');
    return this.modelFor('pathway');
  }
});

App.PathwaysCompoundIndexRoute = Ember.Route.extend({

  setupController: function(controller, model) {
    controller.set('model', model);
  },

  model: function(params) {
    console.log('pathway compounds index');
    return this.modelFor('pathway').get('compounds');
  }

});
