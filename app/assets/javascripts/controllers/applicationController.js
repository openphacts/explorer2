App.ApplicationController = Ember.Controller.extend({
    needs: 'search',
    searchQuery: '',
	actions: {
	query: function() {
		console.log('app controller query');
		var query = this.get('search');
		this.set('searchQuery', query);
		this.transitionToRoute('search', { query: query });
  }
},
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
App.IndexController = Ember.Controller.extend({
  needs: 'search',
});
App.SearchBoxController = Ember.Controller.extend({
	//actions: {
		submitInController: function(number) {
			console.log('submitInController');
	  }
	//}	
});
