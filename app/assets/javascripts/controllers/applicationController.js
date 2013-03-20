App.ApplicationController = Ember.Controller.extend({
  isHome: (function() {
    return this.get('currentRoute') === 'home';
  }).property('currentRoute'),
  isUsers: (function() {
    return this.get('currentRoute') === 'users';
  }).property('currentRoute'),
  contract: function() {
    this.set('isExpanded', false);
  }
});
