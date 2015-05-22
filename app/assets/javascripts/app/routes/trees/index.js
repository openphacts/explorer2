import Ember from "ember";

export default Ember.Route.extend({
    setupController: function(controller, model) {
        console.log('enzymes index route setup controller');
        controller.set('content', model);
        var me = controller;
        var searcher = new Openphacts.TreeSearch(ldaBaseUrl, appID, appKey);
        var callback = function(success, status, response) {
            Ember.run(function() {me.get('controllers.application').set('fetching', false);});
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
	    var me = this;
        console.log('enzymes route model');
        if (params.ontology == null) {
            this.transitionTo('trees.index', {
                queryParams: {
                    'ontology': 'enzyme'
                }
            });
        } else {
            Ember.run(function(){me.controllerFor('trees.index').set('defaultTree', params.ontology);});
            Ember.run(function(){me.controllerFor('trees.index').set('initialTree', params.ontology);});
            Ember.run(function(){me.controllerFor('trees.index').set('selectedTree', params.ontology);});
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

