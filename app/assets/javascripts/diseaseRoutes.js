// Disease Routes

App.DiseasesIndexRoute = Ember.Route.extend({

    setupController: function(controller, model, params) {
        console.log('disease index controller');
        controller.set('model', model);
        var disease = model;

        var diseaseSearcher = new DiseaseSearch(ldaBaseUrl, appID, appKey);
        var diseaseCountCallback = function(success, status, response) {
            if (success && response) {
                var count = diseaseSearcher.parseTargetsByDiseaseCountResponse(response);
                Ember.run(function() {
                    disease.set('targetRecords', count);
                });
            }
        };
diseaseSearcher.targetsByDiseaseCount(disease.get('id'), null, diseaseCountCallback);
    },

    model: function(params) {
        console.log('disease index model')
        var uri = params.uri
        var disease = this.controllerFor('diseases.index').store.findRecord('disease', uri);
        return disease;
    },

    beforeModel: function() {
        this.controllerFor('application').set('fetching', false);
        enable_scroll();
    },

    actions: {
        queryParamsDidChange: function() {
            this.refresh();
        }
    }
});
