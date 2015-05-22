import Ember from "ember";

export default Ember.Route.extend({

    setupController: function(controller, model, params) {
        controller.set('content', model);
        controller.set('totalCount', null);
        var me = controller;
        var thisCompound = model;
        var searcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
        //how many pathways for this compound
        var countCallback = function(success, status, response) {
            if (success && response) {
                var count = searcher.parseCountPathwaysByCompoundResponse(response);
                controller.set('totalCount', count);
                if (count > 0) {
                    searcher.byCompound(thisCompound.get('URI'), null, null, 1, 50, null, pathwaysByCompoundCallback);
                } else {
	me.get('controllers.flash').pushObject(me.get('store').createRecord('flashMessage', {
                    type: 'error',
                    message: 'No pathways found for this compound.'
                }));
		}
            }
        };

        var countOnlyCallback = function(success, status, response) {
            if (success && response) {
                var count = searcher.parseCountPathwaysByCompoundResponse(response);
                controller.set('totalCount', count);
                //set page just in case it is for a different compound previously loaded
                if (me.get('currentCount') % 50 > 0) {
                    me.set('page', Math.floor(me.get('currentCount') / 50) + 1);
                } else {
                    me.set('page', me.get('currentCount') / 50);
                }
            }
        };
        //load the pathways for this compound
        var pathwaysByCompoundCallback = function(success, status, response) {
                if (success && response) {
                    me.set('page', 1);
                    var pathwayResults = searcher.parseByCompoundResponse(response);
                    $.each(pathwayResults, function(index, pathwayResult) {
                        pathwayID = pathwayResult.identifier;
                        //have to find the pathway record and add it, just adding the ID does not work
                        me.get('store').find('pathway', pathwayID).then(function(pathway) {
                            thisCompound.get('pathways').pushObject(pathway);
                        });
                    });
                }
            }
            //searcher.countPathwaysByCompound(thisCompound.get('URI'), null, null, countCallback);

        //if currentCount is 0 (ie controllers content is empty) and totalCount is null then we have not loaded any pharma
        if (controller.get('currentCount') === 0 && controller.get('totalCount') === null) {
            searcher.countPathwaysByCompound(thisCompound.get('URI'), null, null, countCallback);
        } else if (controller.get('currentCount') === 0 && controller.get('totalCount') >= 0) {
            //could still be count for a different compound
            searcher.countPathwaysByCompound(thisCompound.get('URI'), null, null, countCallback);
        } else {
            //reset the totalCount just to be sure
            searcher.countPathwaysByCompound(thisCompound.get('URI'), null, null, countOnlyCallback);
        }


    },
    model: function(params) {
        var uri = params.uri;
        return this.get('store').find('compound', uri);
    },

    beforeModel: function() {
        this.controllerFor('application').set('fetching', false);
        enable_scroll();
    }
});
