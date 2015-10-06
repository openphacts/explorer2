// Pathway Routes

App.PathwaysIndexRoute = Ember.Route.extend({

  setupController: function(controller, model, params) {
    controller.set('model', model);
    var pathwaysSearcher = new PathwaySearch(ldaBaseUrl, appID, appKey);
    var compoundCallback=function(success, status, response){
        if (success && response) {
          var compoundResults = pathwaysSearcher.parseGetCompoundsResponse(response);
          model.set('compoundRecords', compoundResults.metabolites.length);
        }
    };
    var targetCallback=function(success, status, response){
        if (success && response) {
          var targetResults = pathwaysSearcher.parseGetTargetsResponse(response);
          model.set('targetRecords', targetResults.geneProducts.length);
        }
    };
    pathwaysSearcher.getTargets(model.get('URI'), null, targetCallback);
    pathwaysSearcher.getCompounds(model.get('URI'), null, compoundCallback);
  },

  model: function(params) {
    console.log('pathway model');
    var uri = params.uri;
    return this.get('store').findRecord('pathway', uri);
  },

  beforeModel: function() {
    this.controllerFor('application').set('fetching', false);
    enable_scroll();
  }

});

App.PathwaysCompoundsRoute = Ember.Route.extend({

  setupController: function(controller, model, params) {
    controller.set('model', model);
    var me = controller;
    var thisPathway = model;
    var searcher = new PathwaySearch(ldaBaseUrl, appID, appKey);
    var compoundCallback=function(success, status, response){
        me.set('fetching', false);
        if (success && response) {
          var compoundResults = searcher.parseGetCompoundsResponse(response);
          me.set('totalCount', compoundResults.metabolites.length);
          compoundResults.metabolites.forEach(function(uri, index) {
            me.store.findRecord('compound', uri).then(function(compound) {
	          thisPathway.get('compounds').pushObject(compound);
            });
          });
        }
    };
    // only fetch compounds for this pathway if there are none, since it is not a paginated call
    //TODO ther emight be one compound when navigating here if we came from compound pathways. Could
    //add them in the store when fetching that compound initially. Lots of network calls!
        me.set('fetching', true);
        searcher.getCompounds(thisPathway.get('URI'), null, compoundCallback);
  },

  model: function(params) {
    console.log('pathway compounds index');
    var uri = params.uri;
    return this.get('store').findRecord('pathway', uri);
  },

  beforeModel: function() {
    this.controllerFor('application').set('fetching', false);
    enable_scroll();
  }

});

App.PathwaysTargetsRoute = Ember.Route.extend({

  setupController: function(controller, model, params) {
    controller.set('model', model);
    controller.set('totalCount', 0);
    controller.set('failures', 0);
    var me = controller;
    var thisPathway = model;
    var searcher = new PathwaySearch(ldaBaseUrl, appID, appKey);
    var targetCallback=function(success, status, response){
        me.set('fetching', false);
        if (success && response) {
          var targetResults = searcher.parseGetTargetsResponse(response);
          me.set('totalCount', targetResults.geneProducts.length);
          targetResults.geneProducts.forEach(function(uri, index) {
            me.store.findRecord('target', uri).then(function(target) {
	          thisPathway.get('targets').pushObject(target);
		  me.set('currentLoad', me.get('currentLoad') + 1);
            }, function(reason) {
				    me.set('failures', me.get('failures') + 1);
				    me.set('currentLoad', me.get('currentLoad') + 1);
				    //me.get('currentLoad') === 49 ? me.set('currentLoad', 0) : me.set('currentLoad', me.get('currentLoad') + 1);
				});
          });
        }
    };
    // only fetch targets for this pathway if there are none, since it is not a paginated call
    //TODO there might be one target when navigating here if we came from target pathways. Could
    //add them in the store when fetching that target initially. Lots of network calls!
        me.set('fetching', true);
        searcher.getTargets(thisPathway.get('URI'), null, targetCallback);
  },

  model: function(params) {
    console.log('pathway targets index');
    var uri = params.uri;
    return this.get('store').findRecord('pathway', uri);
  },

  beforeModel: function() {
    this.controllerFor('application').set('fetching', false);
    enable_scroll();
  }

});
