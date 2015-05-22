import Ember from "ember";

export default Ember.Route.extend({

    setupController: function(controller, model, params) {
        console.log('tree pharma controller setup');
        var me = controller;
        controller.set('content', model);
        var searcher = new Openphacts.TreeSearch(ldaBaseUrl, appID, appKey);
        var pharmaCallback = function(success, status, response) {
            if (success && response) {
                me.set('page', 1);
                me.get('controllers.application').set('fetching', false);
                var pharmaResults = searcher.parseTargetClassPharmacologyPaginated(response);
                $.each(pharmaResults, function(index, pharma) {
                    var pharmaRecord = me.store.createRecord('treePharmacology', pharma);
                    me.addObject(pharmaRecord);
                });
            } else {
                me.get('controllers.flash').pushObject(me.get('store').createRecord('flashMessage', {
                    type: 'error',
                    message: 'Could not load pharmacology data. Please try again later..'
                }));
                me.get('controllers.application').set('fetching', false);
            }
        };
        var compoundPharmaCallback = function(success, status, response) {
            if (success) {
                me.set('page', 1);
                me.get('controllers.application').set('fetching', false);
                var pharmaResults = searcher.parseCompoundClassPharmacologyPaginated(response);
                $.each(pharmaResults, function(index, pharma) {
                    var pharmaRecord = me.store.createRecord('treePharmacology', pharma);
                    me.addObject(pharmaRecord);
                });
            } else {
                me.get('controllers.flash').pushObject(me.get('store').createRecord('flashMessage', {
                    type: 'error',
                    message: 'Could not load pharmacology data. Please try again later..'
                }));
                me.get('controllers.application').set('fetching', false);
            }

        }
        var compoundCountCallback = function(success, status, response) {
            if (success) {
                var count = searcher.parseCompoundClassPharmacologyCount(response);
                me.set('totalCount', count);
                if (count > 0) {
                    me.set('treeType', 'chebi');
                    searcher.getCompoundClassPharmacologyPaginated(params.queryParams.uri, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 1, 50, null, compoundPharmaCallback);
                } else {
                    me.get('controllers.flash').pushObject(me.get('store').createRecord('flashMessage', {
                        type: 'error',
                        message: 'No pharmacology found for this class.'
                    }));

                    me.get('controllers.application').set('fetching', false);
                }
            } else {
                me.get('controllers.application').set('fetching', false);
            }
        }
        var countCallback = function(success, status, response) {
            if (success) {
                var count = searcher.parseTargetClassPharmacologyCount(response);
                if (count === 0) {
                    // it could be a compound class so check that as well
                    searcher.getCompoundClassPharmacologyCount(params.queryParams.uri, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, compoundCountCallback);
                } else {
                    controller.set('totalCount', count);
                    searcher.getTargetClassPharmacologyPaginated(params.queryParams.uri, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 1, 50, null, pharmaCallback);
                }
            } else {
                me.get('controllers.application').set('fetching', false);
            }
        };
        var activitySearcher = new Openphacts.ActivitySearch(ldaBaseUrl, appID, appKey);
        var activityTypesCallback = function(success, status, response) {
            if (success && response) {
                var activityTypes = activitySearcher.parseTypes(response);
                me.set('activityTypes', activityTypes);
            }
        };
        activitySearcher.getTypes(null, null, null, null, null, activityTypesCallback);

        // fetch all activity units for default in filter select
        var allUnitsCallback = function(success, status, response) {
            if (success && response) {
                var units = activitySearcher.parseAllUnits(response);
                me.set('activityUnits', units);
                //me.set('defaultUnitFilters', units);
            }
        };
        activitySearcher.getAllUnits(null, 'all', null, null, allUnitsCallback);
        me.get('controllers.application').set('fetching', true);
        // we might already have been on this route
        if (controller.get('totalCount') == null) {
            searcher.getTargetClassPharmacologyCount(params.queryParams.uri, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, countCallback);
        } else {
            me.get('controllers.application').set('fetching', false);
        }
    },

    model: function(params) {
        console.log('tree pharma controller model');
        this.controllerFor('trees.pharmacology').set('totalCount', null);
        //var uri = params.uri;
        //var tree = this.controllerFor('trees').store.find('tree', uri);
        //return tree;
        return [];
    },

    beforeModel: function() {
        this.controllerFor('application').set('fetching', false);
        enable_scroll();
    },

    //if we leave the route then set the params to the defaults
    resetController: function(controller, isExiting, transition) {
        if (isExiting) {
            // isExiting would be false if only the route's model was changing
            controller.set('showProvenance', false);
        }
    }


});
