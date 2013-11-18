App.ApplicationController = Ember.Controller.extend({
    searchQuery: '',
	actions: {
	query: function() {
		console.log('app controller query');
		var query = this.get('searchQuery');
		//this.set('searchQuery', query);
		//this.transitionToRoute('search', { query: query }); NOTE: this is how you would transition to /search/blah
        var params = Ember.Router.QueryParameters.create({ query: query });
		this.transitionToRoute('search', params);
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
  needs: 'search'
});
App.SearchBoxController = Ember.Controller.extend({
	//actions: {
		submitInController: function(number) {
			console.log('submitInController');
	  }
	//}	
});
