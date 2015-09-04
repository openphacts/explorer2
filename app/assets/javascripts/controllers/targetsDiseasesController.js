App.TargetsDiseasesController = Ember.Controller.extend({

    needs: ['application'],

    queryParams: ['uri'],

    uri: '',

    page: 0,

    failures: 0,

    failuresExist: function() {
        return this.get('failures') > 0;
    }.property('failures'),

    haveRecords: function() {
	    return this.get('content.diseases.length') > 0;
    }.property('content.diseases'),

    currentCount: function() {
        return this.get('model.diseases.length');
    }.property('model.diseases.length'),

    loadInProgress: function() {
	    return this.get('currentLoad') > 0;
    }.property('currentLoad'),

    currentLoad: 0,

    totalCount: null,

    actions: {
        fetchMore: function() {
            if (this.get('content').get('diseases').get('length') + this.get('failures') < this.get('totalCount')) {
                if (this.get('content').get('diseases').get('length') < this.get('totalCount') && this.get('totalCount') > 0 && this.get('controllers.application').get('fetching') === false) {
                    this.get('controllers.application').set('fetching', true)
			var me = this;
                var thisTarget = this.get('content');
                var searcher = new DiseaseSearch(ldaBaseUrl, appID, appKey);
                var diseasesByTargetCallback = function(success, status, response) {
                    if (success && response) {
me.get('controllers.application').set('fetching', false)
	
                        me.set('page', me.get('page') + 1);
                        var diseaseResults = searcher.parseDiseasesByTargetResponse(response);
                        diseaseResults.forEach(function(disease, index) {
                            diseaseID = disease.URI;
                            me.get('store').findRecord('disease', diseaseID).then(function(disease) {
                                thisTarget.get('diseases').pushObject(disease);
				me.get('currentLoad') === 49 ? me.set('currentLoad', 0) : me.set('currentLoad', me.get('currentLoad') + 1);
                            }, function(reason) {
				    me.set('failures', me.get('failures') + 1);
				    me.get('currentLoad') === 49 ? me.set('currentLoad', 0) : me.set('currentLoad', me.get('currentLoad') + 1);
				});
                        });
			me.set('currentLoad', 0);
                        enable_scroll();
                    } else {
			    me.get('controllers.application').set('fetching', false)
	enable_scroll();
		    }
                };
                searcher.diseasesByTarget(thisTarget.get('URI'), me.get('page') + 1, 50, null, null, diseasesByTargetCallback);
            } else {
            enable_scroll();
	    }
        } else {
            enable_scroll();
	}
    }
    }
});
