App.ApplicationController = Ember.Controller.extend({

    jobsList: {},
    //by default there are no alerts
    alertReady: false,
    fetching: false,
    searchQuery: '',
    //monitor the tsv creation
    addJob: function(jobID) {
      this.jobsList[jobID] = {"percentage": 0, "status": "processing"};
      var me = this;
      var thisJob = jobID;
	  var tsvCreateRequest = $.ajax({
		url: tsvStatusUrl,
        dataType: 'json',
		cache: true,
		data: {
			_format: "json",
			uuid: jobID,
		},
		success: function(response, status, request) {
			console.log('tsv monitor status ' + response.status);
            var status = response.status;
            var percentage = response.percentage;
            if (percentage !== 0) {
              me.jobsList[thisJob].percentage = percentage;
            }
            if (status === "finished") {
              me.jobsList[thisJob].status = "complete";
            } else if (status === "failed") {
              me.jobsList[thisJob].status = "failed";
            }
            
		},
		error: function(request, status, error) {
			console.log('tsv create request error');
		}
	  });
    },
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
