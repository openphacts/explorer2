import Ember from "ember";

export default Ember.Route.extend({

    setupController: function(controller, model, params) {
        console.log('target index controller');
        controller.set('model', model);
        var target = model;
        var diseaseSearcher = new Openphacts.DiseaseSearch(ldaBaseUrl, appID, appKey);
	var targetSearcher = new Openphacts.TargetSearch(ldaBaseUrl, appID, appKey);
        var diseaseCountCallback = function(success, status, response) {
            if (success && response) {
                var count = diseaseSearcher.parseDiseasesByTargetCountResponse(response);
                Ember.run(function() {
                    target.set('diseaseRecords', count)
                });
            }
        };
        var pharmaCountCallback = function(success, status, response) {
            if (success && response) {
                var count = targetSearcher.parseTargetPharmacologyCountResponse(response);
                Ember.run(function() {
			target.set('pharmacologyRecords', count);
		});
	    }
	}
	var pathwaysSearcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
        //how many pathways for this compound
        var pathwaysCountCallback = function(success, status, response) {
            if (success && response) {
                var count = pathwaysSearcher.parseCountPathwaysByTargetResponse(response);
                Ember.run(function() {
			target.set('pathwaysRecords', count);
		});
	    }
	}
        diseaseSearcher.diseasesByTargetCount(target.get('URI'), null, diseaseCountCallback);
	pathwaysSearcher.countPathwaysByTarget(target.get('URI'), null, null, pathwaysCountCallback);
	targetSearcher.targetPharmacologyCount(target.get('URI'), null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, pharmaCountCallback);
        this.controllerFor('application').findFavourite(model.get('URI'), 'targets', model);
    },

    model: function(params) {
        console.log('target index model')
        var uri = params.uri;
        return this.get('store').find('target', uri);
    },

    beforeModel: function() {
        this.controllerFor('application').set('fetching', false);
        enable_scroll();
    },

    actions: {
 //       error: function(error, transition) {
            // TODO need to navigate back somewhere if there is an error, however using window.history.back()
            // might not go back to the correct place because the browser window might have been at a different
            // starting point than the ember app.
            // Maybe just needs a 404 page eg return this.transitionTo('modelNotFound'); (from ember docs example)
//            this.controllerFor('flash').pushObject(this.get('store').createRecord('flashMessage', {
//                type: 'error',
//                message: 'This target is not available, please try a different one.'
//            }));
//        }
    },

    //if we leave the route then set the params to the defaults
    resetController: function(controller, isExiting, transition) {
        if (isExiting) {
            // isExiting would be false if only the route's model was changing
            controller.set('showProvenance', false);
        }
    }


});
