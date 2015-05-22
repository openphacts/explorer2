import Ember from "ember";

export default Ember.Route.extend({

    setupController: function(controller, model, params) {
        console.log('target index route setup controller');
        controller.set('content', model);
        controller.set('totalCount', null);
        var me = controller;
        // set all the current filters
        var assayOrganism = me.get('assayOrganismQuery');
        var targetOrganism = me.get('targetOrganismQuery');
        var targetType = null;
        var lens = null;
        var activity = me.get('selectedActivity') != null ? me.get('selectedActivity').label : null;
        var unit = me.get('selectedUnit') != null ? me.get('selectedUnit').label : null;
        var condition = me.get('selectedCondition') != null ? me.get('selectedCondition') : null;
        var currentActivityValue = me.get('activityValue') != null ? me.get('activityValue') : null;
        var activityRelation = null;
        var minActivityValue = null;
        var maxActivityValue = null;
        var maxExActivityValue = null;
        var activityValue = null;
        var minExActivityValue = null;
        // only set activity filter if there is a condition and a value (same as comp pharma)
        if (condition != null && currentActivityValue != null) {
            switch (condition) {
                case '>':
                    minExActivityValue = currentActivityValue;
                    break;
                case '<':
                    maxExActivityValue = currentActivityValue;
                    break;
                case '=':
                    activityValue = currentActivityValue;
                    break;
                case '<=':
                    maxActivityValue = currentActivityValue;
                    break;
                case '>=':
                    minActivityValue = currentActivityValue;
                    break;
            }
        }
        var activityRelations = [];
        if (me.get('greaterThan') === true) {
            activityRelations.push(">");
        }
        if (me.get('lessThan') === true) {
            activityRelations.push("<");
        }
        if (me.get('greaterThanOrEqual') === true) {
            activityRelations.push(">=");
        }
        if (me.get('lessThanOrEqual') === true) {
            activityRelations.push("<=");
        }
        if (me.get('equalTo') === true) {
            activityRelations.push("=");
        }
        // if there are any relations then add them all to the string with the "|" (OR) separator otherwise activityRelation will still be null
        // a trailing "|" is fine according to tests on the LD API
        if (activityRelations.length > 0) {
            activityRelation = "";
            $.each(activityRelations, function(index, relation) {
                activityRelation = activityRelation + relation + "|";
            });
        }
        var pchemblCondition = me.get('selectedPchemblCondition') != null ? me.get('selectedPchemblCondition') : null;
        var currentPchemblValue = me.get('pchemblValue') != null ? me.get('pchemblValue') : null;
        var minPchemblValue = null;
        var maxPchemblValue = null;
        var maxExPchemblValue = null;
        var minExPchemblValue = null;
        var actualPchemblValue = null;
        // pchembl filter only valid if all filter bits selected
        if (pchemblCondition != null && currentPchemblValue != null) {
            switch (pchemblCondition) {
                case '>':
                    minExPchemblValue = currentPchemblValue;
                    break;
                case '<':
                    maxExPchemblValue = currentPchemblValue;
                    break;
                case '=':
                    actualPchemblValue = currentPchemblValue;
                    break;
                case '<=':
                    maxPchemblValue = currentPchemblValue;
                    break;
                case '>=':
                    minPchemblValue = currentPchemblValue;
                    break;
            }
        }
        var sortBy = null;
        if (me.get('currentHeader') !== null && me.get('sortedHeader') == null) {
            // we have previously sorted descending on a header and it is still current
            sortBy = 'DESC(?' + me.get('currentHeader') + ')';
        } else if (me.get('currentHeader') !== null) {
            //we have previously sorted on a header
            sortBy = '?' + me.get('currentHeader');
        }
        var thisTarget = model;
        var searcher = new Openphacts.TargetSearch(ldaBaseUrl, appID, appKey);
        var pharmaCallback = function(success, status, response) {
            if (success && response) {
                var pharmaResults = searcher.parseTargetPharmacologyResponse(response);
                $.each(pharmaResults, function(index, pharma) {
                    var pharmaRecord = me.store.createRecord('targetPharmacology', pharma);
                    thisTarget.get('pharmacology').pushObject(pharmaRecord);
                });
                controller.set('page', 1);
                me.get('controllers.application').set('fetching', false);
            } else {
                me.get('controllers.application').set('fetching', false);
            }
        };
        var countCallback = function(success, status, response) {
            me.set('fetchingCount', false);
            if (success && response) {
                var count = searcher.parseTargetPharmacologyCountResponse(response);
                controller.set('totalCount', count);
                if (count > 0 && controller.get('model.pharmacology.length') == 0) {
                    searcher.targetPharmacology(thisTarget.get('URI'), assayOrganism, targetOrganism, activity, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, unit, activityRelation, actualPchemblValue, minPchemblValue, minExPchemblValue, maxPchemblValue, maxExPchemblValue, targetType, 1, 50, sortBy, lens, pharmaCallback);
                } else {
                    // if we already have results then don't fetch more and switch off the spinner, probably because the back/forward button was pressed
                    me.get('controllers.application').set('fetching', false);
                }
            } else {
                // if it didn't work then switch off the spinner
                me.get('controllers.application').set('fetching', false);
            }
        };
        if (controller.get('totalCount') == null) {
            me.set('fetchingCount', true);
            me.get('controllers.application').set('fetching', true);
            searcher.targetPharmacologyCount(thisTarget.get('URI'), assayOrganism, targetOrganism, activity, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, unit, activityRelation, actualPchemblValue, minPchemblValue, minExPchemblValue, maxPchemblValue, maxExPchemblValue, targetType, lens, countCallback);
        }
        var activityTypesCallback = function(success, status, response) {
            if (success && response) {
                var activityTypes = activitySearcher.parseTypes(response);
                me.set('activityTypes', activityTypes);
            }
        };
        var activitySearcher = new Openphacts.ActivitySearch(ldaBaseUrl, appID, appKey);
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
    },
    model: function(params) {
        console.log('target pharma index route');
        var uri = params.uri;
        return this.get('store').find('target', uri);
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

