App.ApplicationController = Ember.Controller.extend({

    jobsList: {},
    //by default there are no alerts
    alertReady: false,
    fetching: false,
    searchQuery: '',
    //monitor the tsv creation
    addJob: function(jobID) {
      this.jobsList[jobID] = {"id": jobID, "percentage": 0, "status": "processing"};
      var me = this;
	  this.checkTSV(jobID, me, true);
    },
    checkTSV: function (jobID, controller, go) {
    console.log("Check TSV is " + go + " for " + jobID);
    var jobID = jobID;
    var me = controller;
    var runAgain = true;
    if (go !== false) {
    $.ajax({
		url: tsvStatusUrl,
        dataType: 'json',
		cache: true,
		data: {
			_format: "json",
			uuid: jobID,
		},
		success: function(response, status, request) {
			console.log('tsv monitor status ' + response.status);
            status = response.status;
            var percentage = response.percentage;
            if (percentage !== 0) {
              controller.jobsList[thisJob].percentage = percentage;
            }
            if (status === "finished") {
              controller.jobsList[thisJob].status = "complete";
              runAgain = false;
            } else if (status === "failed") {
              controller.jobsList[thisJob].status = "failed";
              runAgain = false;
            }
            
		},
		error: function(request, status, error) {
			console.log('tsv create request error');
		},
        complete: setTimeout(function() {me.checkTSV(jobID, me, runAgain)}, 5000),
        timeout: 2000
	  });
      }
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
