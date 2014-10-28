App.TargetsDiseasesController = Ember.ObjectController.extend({

    needs: ['application'],

    queryParams: ['uri'],

    uri: '',

    page: null,

    currentCount: function() {
        return this.get('model.diseases.length');
    }.property('model.diseases.length'),

    totalCount: null,

    notEmpty: function() {
        return this.get('totalCount') > 0;
    }.property('totalCount'),

    actions: {
        fetchMore: function() {
            if (this.currentCount < this.totalCount) {
                var me = this;
                var thisTarget = this.get('content');
                var searcher = new Openphacts.DiseaseSearch(ldaBaseUrl, appID, appKey);
                var diseasesByTargetCallback = function(success, status, response) {
                    if (success && response) {
                        me.page++;
                        var diseaseResults = searcher.parseDiseasesByTargetResponse(response);
                        $.each(diseaseResults, function(index, disease) {
                            diseaseID = disease.identifier.split('/').pop();
                            //have to find the pathway record and add it, just adding the ID does not work
                            me.get('store').find('disease', diseaseID).then(function(disease) {
                                thisTarget.get('diseases').pushObject(disease);
                            });
                        });
                        pageScrolling = false;
                        enable_scroll();
                    }
                };
                searcher.diseasesByTarget(thisTarget.URI, null, null, 1, 50, null, diseasesByTargetCallback);
            }
            pageScrolling = false;
            enable_scroll();
        }
    }

});
