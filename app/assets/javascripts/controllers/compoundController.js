App.CompoundController = Ember.ObjectController.extend({
  setupController: function(controller, compound) {
    controller.set('content', compound);
  }
});
