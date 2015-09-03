App.DiseasesTargetsController = Ember.Controller.extend({

    needs: ['application'],

    queryParams: ['uri'],

    uri: '',

    showProvenance: false,

    totalCount: null,

    page: 0,

    failures: 0,

    failuresExist: function() {
        return this.get('failures') > 0;
    }.property('failures'),

    haveRecords: function() {
	    return this.get('content.targets.length') > 0;
    }.property('content.targets'),

    actions: {
        enableProvenance: function() {
            this.set('showProvenance', true);
        },

        disableProvenance: function() {
            this.set('showProvenance', false);
        },
        fetchMore: function() {
            if (this.get('content').get('targets').get('length') + this.get('failures') < this.get('totalCount')) {
                if (this.get('content').get('targets').get('length') < this.get('totalCount') && this.get('totalCount') > 0 && this.get('controllers.application').get('fetching') === false) {
                    this.get('controllers.application').set('fetching', true)
                    var thisDisease = this.get('content');
                    var me = this;
                    var diseaseSearcher = new DiseaseSearch(ldaBaseUrl, appID, appKey);
                    var diseaseTargetsCallback = function(success, status, response) {
                        if (success && response) {
                            me.set('page', me.get('page') + 1);
                            var targets = diseaseSearcher.parseTargetsByDiseaseResponse(response);
                            targets.forEach(function(targetInfo, index) {
                                me.get('store').findRecord('target', targetInfo.URI).then(function(target) {
                                    thisDisease.get('targets').pushObject(target);
                                }, function(reason) {
                                    me.set('failures', me.get('failures') + 1);
                                });
                            });
                            me.get('controllers.application').set('fetching', false);
                            enable_scroll();
                        } else {
                            me.get('controllers.application').set('fetching', false);
                            enable_scroll();
                        }
                    }
                    diseaseSearcher.targetsByDisease(thisDisease.get('id'), me.get('page') + 1, 50, null, null, diseaseTargetsCallback);
                } else {
                    enable_scroll();
                }
            } else {
                enable_scroll();
	    }
        }
    }
});
