// Tree Routes

App.TreesIndexRoute = Ember.Route.extend({
    setupController: function(controller, model) {
        console.log('enzymes index route setup controller');
        controller.set('content', model);
        var me = controller;
        var searcher = new Openphacts.TreeSearch(ldaBaseUrl, appID, appKey);
        var callback = function(success, status, response) {
            me.get('controllers.application').set('fetching', false);
            if (success && response) {
                var root = searcher.parseRootNodes(response);
                var allRoot = [];
                $.each(root.rootClasses, function(index, enzymeResult) {
                    if (enzymeResult.uri != null) {
                        var enzyme = controller.store.createRecord('tree', enzymeResult);
                        enzyme.set('id', enzymeResult.uri.split('/').pop());
                        // by default we set this to true. only check when it is clicked to save the browser from making too many network calls
                        enzyme.set('hasChildren', true);
                        enzyme.set('level', 1);
                        enzyme.set('opened', false);
                        allRoot.push(enzyme);
                    }
                });
                allRoot.sort(function(a, b) {
                    var x = a.get('uri').split('/').pop();
                    var y = b.get('uri').split('/').pop();
                    if (x === y) {
                        return 0;
                    }
                    return x > y ? 1 : -1;

                });
                $.each(allRoot, function(index, member) {
                    controller.addObject(member);
                });
            }
        }
        me.get('controllers.application').set('fetching', true);
        searcher.getRootNodes(controller.get('defaultTree'), callback);
    },

    model: function(params) {
        console.log('enzymes route model');
        if (params.ontology == null) {
            this.transitionTo('trees.index', {
                queryParams: {
                    'ontology': 'enzyme'
                }
            });
        } else {
            this.controllerFor('trees.index').set('defaultTree', params.ontology);
            this.controllerFor('trees.index').set('initialTree', params.ontology);
            this.controllerFor('trees.index').set('selectedTree', params.ontology);
        }
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
            controller.set('defaultTree', null);
            controller.set('selectedTree', null);
            controller.set('initialTree', null);
        }
    },

    actions: {
        queryParamsDidChange: function() {
            this.refresh();
        }
    }

});

App.TreesPharmacologyRoute = Ember.Route.extend({

    setupController: function(controller, model, params) {
        console.log('tree pharma controller setup');
        var me = controller;
        controller.set('content', model);
        var searcher = new Openphacts.TreeSearch(ldaBaseUrl, appID, appKey);
        var compoundSearcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);
        var pharmaCallback = function(success, status, response) {
            if (success && response) {
                me.get('controllers.application').set('fetching', false);
                var pharmaResults = searcher.parseTargetClassPharmacologyPaginated(response);
                $.each(pharmaResults, function(index, pharma) {
                    var pharmaRecord = me.store.createRecord('treePharmacology', pharma);
                    me.addObject(pharmaRecord);
                });
            } else {
                App.FlashQueue.pushFlash('error', 'Could not load  pharmacology data. Please try again later.');
                me.get('controllers.application').set('fetching', false);
            }
        };
        var compoundClassMembersCallback = function(success, status, response) {
            if (success) {
                var compounds = compoundSearcher.parseCompoundClassMembersResponse(response);
                compounds.forEach(function(compound, index, array) {
                    me.store.find('compound', compound.URI).then(function(compound) {
                        me.addObject(compound);
                    });
                });
            }
        }
        var compoundCountCallback = function(success, status, response) {
            if (success) {
                var count = compoundSearcher.parseCompoundClassMembersCountResponse(response);
                me.set('totalCount', count);
                if (count > 0) {
                    me.get('controllers.application').set('fetching', false);
                    me.set('treeType', 'chebi');
                    compoundSearcher.compoundClassMembers(params.queryParams.uri, 1, 50, null, null, compoundClassMembersCallback);
                } else {
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
                    compoundSearcher.compoundClassMembersCount(params.queryParams.uri, null, compoundCountCallback);
                } else {
                    controller.set('totalCount', count);
                    searcher.getTargetClassPharmacologyPaginated(params.queryParams.uri, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 1, 50, null, pharmaCallback);
                }
            } else {
                me.get('controllers.application').set('fetching', false);
                //App.FlashQueue.pushFlash('error', 'There is no pharmacology data for ' + thisEnzyme.id);

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
    }

});
