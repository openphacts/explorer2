
import Ember from "ember";

export default Ember.Route.extend({

    setupController: function(controller, model, params) {
        controller.set('content', model);
        controller.set('totalCount', null);
        var me = controller;
        var thisTarget = model;
        var searcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
        //how many pathways for this compound
        var countCallback = function(success, status, response) {
            me.get('controllers.application').set('fetching', false);
            if (success && response) {
                var count = searcher.parseCountPathwaysByTargetResponse(response);
                controller.set('totalCount', count);
                if (count > 0) {
                    searcher.byTarget(thisTarget.get('URI'), null, null, 1, 50, null, pathwaysByTargetCallback);
                }
            }
        };
        var countOnlyCallback = function(success, status, response) {
            me.get('controllers.application').set('fetching', false);
            if (success && response) {
                var count = searcher.parseCountPathwaysByTargetResponse(response);
                controller.set('totalCount', count);
                //set page just in case it is for a different compound previously loaded
                if (me.get('currentCount') % 50 > 0) {
                    me.set('page', Math.floor(me.get('currentCount') / 50) + 1);
                } else {
                    me.set('page', me.get('currentCount') / 50);
                }
            }
        };

        //load the pathways for this target
        var pathwaysByTargetCallback = function(success, status, response) {
                if (success && response) {
                    var pathwayResults = searcher.parseByTargetResponse(response);
                    $.each(pathwayResults, function(index, pathwayResult) {
                        pathwayID = pathwayResult.identifier;
                        //have to find the pathway record and add it, just adding the ID does not work
                        me.get('store').find('pathway', pathwayID).then(function(pathway) {
                            thisTarget.get('pathways').pushObject(pathway);
                        });
                    });
                }
            }
            //searcher.countPathwaysByTarget(thisTarget.get('URI'), null, null, countCallback);
            //if currentCount is 0 (ie controllers content is empty) and totalCount is null then we have not loaded any pharma
        if (controller.get('currentCount') === 0 && controller.get('totalCount') === null) {
            me.get('controllers.application').set('fetching', true);
            searcher.countPathwaysByTarget(thisTarget.get('URI'), null, null, countCallback);
        } else if (controller.get('currentCount') === 0 && controller.get('totalCount') >= 0) {
            //could still be count for a different compound
            me.get('controllers.application').set('fetching', true);
            searcher.countPathwaysByTarget(thisTarget.get('URI'), null, null, countCallback);
        } else {
            //reset the totalCount just to be sure
            me.get('controllers.application').set('fetching', true);
            searcher.countPathwaysByTarget(thisTarget.get('URI'), null, null, countOnlyCallback);
        }

    },
    model: function(params) {
        var uri = params.uri;
        return this.get('store').find('target', uri);
    },

    beforeModel: function() {
        this.controllerFor('application').set('fetching', false);
        enable_scroll();
    }
});

