App.TargetController = Ember.ObjectController.extend({

  isExpanded: false,

  expand: function() {
    this.set('isExpanded', true);
  },

  contract: function() {
    this.set('isExpanded', false);
  },

  setupController: function(controller, target) {
    controller.set('content', target);
  }
});
