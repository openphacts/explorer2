// Compound Routes

App.CompoundsIndexRoute = Ember.Route.extend({

    setupController: function(controller, model, params) {
        console.log('compound index controller');
        controller.set('model', model);
        var compound = model;
        this.controllerFor('application').findFavourite(model.get('URI'), 'compounds', model);

        var molfile = this.controllerFor('application').get('molfile');
        //set the favourite status for this compound
        this.controllerFor('application').findFavourite(compound.get('URI'), 'compounds', compound);
        var pathwaysSearcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
        var compoundSearcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);
        var pathwaysCountCallback = function(success, status, response) {
            if (success && response) {
                var count = pathwaysSearcher.parseCountPathwaysByCompoundResponse(response);
                Ember.run(function() {
                    compound.set('pathwayRecords', count);
                });
            }
        };

        var pharmaCountCallback = function(success, status, response) {
            if (success && response) {
                var count = compoundSearcher.parseCompoundPharmacologyCountResponse(response);
                Ember.run(function() {
                    compound.set('pharmacologyRecords', count)
                });
            }
        };
        var compoundURI = compound.get('URI');
        pathwaysSearcher.countPathwaysByCompound(compoundURI, null, null, pathwaysCountCallback);
        compoundSearcher.compoundPharmacologyCount(compoundURI, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, pharmaCountCallback);
        Ember.run(function() {
            compound.set('molfile', molfile)
        });
    },

    model: function(params) {
        console.log('compound index model')
            //var uri = this.get('queryParameters').uri;
        var uri = params.uri
        var compound = this.controllerFor('compounds').store.find('compound', uri);
        return compound;
    },

    beforeModel: function() {
        this.controllerFor('application').set('fetching', false);
        enable_scroll();
    },

    actions: {
        queryParamsDidChange: function() {
            this.refresh();
        }
    },

    //if we leave the route then set the params to the defaults
    resetController: function(controller, isExiting, transition) {
        if (isExiting) {
            // isExiting would be false if only the route's model was changing
            controller.set('showProvenance', false);
        }
    }

});

App.CompoundsDrawRoute = Ember.Route.extend({

    setupController: function(controller, model, params) {
        console.log('compound ketcher controller');
        //var kPath = ketcherProtocol + '://' + document.location.hostname + ':' + ketcherPort + '/' + ketcherPath;
        //controller.set('ketcherPath', kPath);
        controller.set('model', model);
    },

    model: function(params) {
        console.log('compound ketcher model')
        var smiles = params.smiles;
        var structureInfo = {
            'smiles': smiles
        };
        var structure = this.controllerFor('compounds').store.createRecord('structure', structureInfo);
        return structure;
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

App.CompoundsPharmacologyRoute = Ember.Route.extend({

    setupController: function(controller, model, params) {
        controller.set('content', model);
        controller.set('totalCount', null);
        var me = controller;
        // set all the current filters
	var assayOrganism = me.get('assayOrganismQuery');
	// The organism filter box might have been emptied by deleting the text
        assayOrganism = assayOrganism === "" ? null : assayOrganism;
	var targetOrganism = me.get('targetOrganismQuery');
	targetOrganism = targetOrganism === "" ? null : targetOrganism;
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
        // only set activity filter if all filter boxes have been selected
        if (unit != null && activity != null && condition != null && currentActivityValue != null) {
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
        var thisCompound = model;
        var searcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);
        var pharmaCallback = function(success, status, response) {
            if (success && response) {
                var pharmaResults = searcher.parseCompoundPharmacologyResponse(response);
                $.each(pharmaResults, function(index, pharma) {
                    var pharmaRecord = me.store.createRecord('compoundPharmacology', pharma);
                    thisCompound.get('pharmacology').pushObject(pharmaRecord);
                });
                me.set('fetching', false);
                //controller.set('currentCount', controller.get('currentCount') + pharmaResults.length);
                controller.set('page', 1);
            } else {
                me.set('fetching', false);
            }
        };
        var countCallback = function(success, status, response) {
            if (success && response) {
                var count = searcher.parseCompoundPharmacologyCountResponse(response);
                controller.set('totalCount', count);
                if (count > 0) {
                    me.set('fetching', true);
                    searcher.compoundPharmacology(thisCompound.get('URI'), assayOrganism, targetOrganism, activity, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, unit, activityRelation, actualPchemblValue, minPchemblValue, minExPchemblValue, maxPchemblValue, maxExPchemblValue, targetType, 1, 50, sortBy, lens, pharmaCallback);
                } else {
			me.get('controllers.flash').pushObject(me.get('store').createRecord('flashMessage', {
                    type: 'error',
                    message: 'No pharmacology found for this compound.'
                }));
		}
            }
        };
        var countOnlyCallback = function(success, status, response) {
            if (success && response) {
                var count = searcher.parseCompoundPharmacologyCountResponse(response);
                controller.set('totalCount', count);
                //set page just in case it is for a different compound previously loaded
                if (me.get('currentCount') % 50 > 0) {
                    me.set('page', Math.floor(me.get('currentCount') / 50) + 1);
                } else {
                    me.set('page', me.get('currentCount') / 50);
                }
            }
        };
        //if currentCount is 0 (ie controllers content is empty) and totalCount is null then we have not loaded any pharma
        if (controller.get('currentCount') === 0 && controller.get('totalCount') === null) {
            searcher.compoundPharmacologyCount(thisCompound.get('URI'), assayOrganism, targetOrganism, activity, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, unit, activityRelation, actualPchemblValue, minPchemblValue, minExPchemblValue, maxPchemblValue, maxExPchemblValue, targetType, lens, countCallback);
        } else if (controller.get('currentCount') === 0 && controller.get('totalCount') >= 0) {
            //could still be count for a different compound
            searcher.compoundPharmacologyCount(thisCompound.get('URI'), assayOrganism, targetOrganism, activity, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, unit, activityRelation, actualPchemblValue, minPchemblValue, minExPchemblValue, maxPchemblValue, maxExPchemblValue, targetType, lens, countCallback);
        } else {
            //reset the totalCount just to be sure
            searcher.compoundPharmacologyCount(thisCompound.get('URI'), assayOrganism, targetOrganism, activity, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, unit, activityRelation, actualPchemblValue, minPchemblValue, minExPchemblValue, maxPchemblValue, maxExPchemblValue, targetType, lens, countOnlyCallback);
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
        console.log('compounds pharma controller model');
        var uri = params.uri;
        return this.get('store').find('compound', uri);
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

App.CompoundsStructureRoute = Ember.Route.extend({


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

App.CompoundsPathwaysRoute = Ember.Route.extend({

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
