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
        var disease = this.get('store').findRecord('disease', uri);
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

App.DiseasesTargetsIndexRoute = Ember.Route.extend({

	setupController: function(controller, model, params) {
		console.log('disease targets index controller');
		controller.set('content', model);
		controller.set('totalCount', null);
		var me = controller;
		var disease = model;
        var diseaseSearcher = new DiseaseSearch(ldaBaseUrl, appID, appKey);
        var diseaseTargetsCountCallback = function(success, status, response) {
            if (success && response) {
                var count = diseaseSearcher.parseTargetsByDiseaseCountResponse(response);
                Ember.run(function() {
                    disease.set('targetRecords', count);
                });
		if (count > 0) {
var diseaseTargetsCallback = function(success, status, response) {
if (success && response) {
 var targets = diseaseSearcher.parseTargetsByDiseaseResponse(response);
 targets.forEach(function(targetInfo, index) {
       me.get('store').findRecord('target', targetInfo.URI).then(function(target) {
	          disease.get('targets').pushObject(target);
       });
 });
}
}
diseaseSearcher.targetsByDisease(disease.get('id'), 1, 50, null, null, diseaseTargetsCallback);
		}
            }
        };
diseaseSearcher.targetsByDiseaseCount(disease.get('id'), null, diseaseTargetsCountCallback);
	},

	model: function(params) {
		console.log('disease targets model');
		var uri = params.uri;
		var disease = this.get('store').findRecord('disease', uri);
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
