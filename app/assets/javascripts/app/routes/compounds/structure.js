import Ember from "ember";

export default Ember.Route.extend({


    setupController: function(controller, model, params) {
        controller.set('content', model);
        controller.set('totalCount', null);
        var me = controller;
        //var thisCompound = model;
        //thisCompound.get('structure').clear();
        //controller.set('smilesValue', thisCompound.get('smiles'));
        me.set('filteredCompounds', []);
        var structureSearchType = controller.get('structureSearchType');
        var searcher = new Openphacts.StructureSearch(ldaBaseUrl, appID, appKey);
        var callback = function(success, status, response) {
            me.get('controllers.application').set('fetching', false);
            if (success && response) {
                if (structureSearchType === "exact") {
                    results = searcher.parseExactResponse(response);
                    me.set('totalCount', results.length);
                    $.each(results, function(index, result) {
                        me.get('store').find('compound', result).then(function(compound) {
                            me.get('model').pushObject(compound);
                            me.get('filteredCompounds').pushObject(compound);
                        });
                    });
                } else if (structureSearchType === "similarity") {
                    results = searcher.parseSimilarityResponse(response);
                    me.set('totalCount', results.length);
                    var relevance = {};
                    $.each(results, function(index, result) {
                        var about = result.about;
                        var relVal = result.relevance;
                        relevance[about] = relVal;
                        me.get('store').find('compound', about).then(function(compound) {
                            compound.set('relevance', relevance[about]);
                            me.get('model').pushObject(compound);
                            me.get('filteredCompounds').pushObject(compound);
                        });
                    });
                } else if (structureSearchType === "substructure") {
                    results = searcher.parseSubstructureResponse(response);
                    me.set('totalCount', results.length);
                    var relevance = {};
                    $.each(results, function(index, result) {
                        var about = result.about;
                        var relVal = result.relevance;
                        relevance[about] = relVal;
                        me.get('store').find('compound', about).then(function(compound) {
                            compound.set('relevance', relevance[about]);
                            me.get('model').pushObject(compound);
                            me.get('filteredCompounds').pushObject(compound);
                        });
                    });
                }
                //me.set('filteredCompounds', thisCompound.get('structure'));
            } else {
                me.get('controllers.flash').pushObject(me.get('store').createRecord('flashMessage', {
                    type: 'error',
                    message: 'No compounds found with this structure.'
                }));
            }
        };
        if (me.get('smilesValue') != null) {
            if (structureSearchType === "exact") {
                me.get('controllers.application').set('fetching', true);
                searcher.exact(me.get('smilesValue'), me.get('selectedMatchType'), callback);
            } else if (structureSearchType === "similarity") {
                // TODO fix start and count at 1 and 100 for the moment
                me.get('controllers.application').set('fetching', true);
                searcher.similarity(me.get('smilesValue'), me.get('selectedThresholdType'), me.get('thresholdPercent'), null, null, 1, me.get('maxRecords'), callback);
            } else if (structureSearchType === "substructure") {
                // TODO fix start and count at 1 and 100 for the moment
                me.get('controllers.application').set('fetching', true);
                searcher.substructure(me.get('smilesValue'), null, 1, me.get('maxRecords'), callback);
            }
        }
    },
    model: function(params) {
        //the route can come in with a ?type=structureSearchType param, default is exact
        var type = params.type;
        if (type) {
            this.controllerFor('compoundsStructure').set('currentStructure', type);
            this.controllerFor('compoundsStructure').set('structureSearchType', type);
            this.controllerFor('compoundsStructure').set('initStructureSearchType', type);
        }
        var smiles = params.smiles;
        if (smiles) {
            this.controllerFor('compoundsStructure').set('smilesValue', smiles);
            this.controllerFor('compoundsStructure').set('origSmilesValue', smiles);
        }
        var percent = params.threshold;
        if (percent) {
            this.controllerFor('compoundsStructure').set('thresholdPercent', parseFloat(percent));
        }
        var match = params.match;
        if (match) {
            this.controllerFor('compoundsStructure').set('selectedMatchType', parseInt(match));
        }
        var threshold = params.thresholdtype;
        if (threshold) {
            this.controllerFor('compoundsStructure').set('selectedThresholdType', parseInt(threshold));
        }
        var records = params.records;
        if (records) {
            this.controllerFor('compoundsStructure').set('maxRecords', records);
        }
        //model is an array of compounds
        return [];
        //return this.get('store').find('compound', params.smiles);
    },
    //if we leave the route then set the params to the defaults
    resetController: function(controller, isExiting, transition) {
        if (isExiting) {
            // isExiting would be false if only the route's model was changing
            controller.set('threshold', '0.9');
            controller.set('thresholdtype', '0');
            controller.set('match', '0');
            controller.set('records', 100);
            controller.set('type', 'exact');
        }
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
