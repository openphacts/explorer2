App.DiseasesTargetsController = Ember.Controller.extend({

    needs: ['application'],

    queryParams: ['uri'],

    uri: '',

    showProvenance: false,

    totalCount: null,

    page: 0,

    actions: {
        enableProvenance: function() {
            this.set('showProvenance', true);
        },

        disableProvenance: function() {
            this.set('showProvenance', false);
        },
        fetchMore: function() {
            if (this.get('content').get('targets').get('length') < this.totalCount && this.totalCount > 0 && this.get('controllers.application').get('fetching') === false) {
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
        }
    }
});
