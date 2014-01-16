//Developers = [{name: 'Yehuda'},{name: 'Tom'}, {name: 'Paul'}];
//App.jobsList = [];
//App.jobsStatus = {};
App.ApplicationController = Ember.ArrayController.extend({

    //jobsList used in the view to loop over the entries
    jobsList: [],
    alertsAvailable: false,

    anyJobs: function() {
      return this.jobsList.get('length') > 0;
    }.property('jobsList.@each'),
    //by default there are no alerts
    alertReady: false,
    fetching: false,
    searchQuery: '',
    //monitor the tsv creation
    addJob: function(jobID) {
      this.jobsList.pushObject(Ember.Object.create({uuid: jobID, percentage: 0, status: "processing"}));
      var me = this;
	  this.checkTSV(jobID, this, true);
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
            var job = me.jobsList.findBy("uuid", jobID);
            //job may have been removed by the user in the mean time
            if (job != null) {
            if (percentage !== 0) {
              me.jobsList.findBy("uuid", jobID).set('percentage', percentage);
            }
            if (status === "finished") {
              me.jobsList.findBy("uuid", jobID).set('status', 'complete');
              me.set('alertsAvailable', true);
              runAgain = false;
            } else if (status === "failed") {
              me.jobsList.findBy("uuid", jobID).set('status', 'failed');
              runAgain = false;
            }
            } else {
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

    dismissAlerts: function() {
      this.set('alertsAvailable', false);
    },

    removeJob: function(job) {
      console.log("removing job " + job.get('uuid'));
      this.jobsList.removeObject(job);
    },

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
