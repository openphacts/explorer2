// Pathway Routes

App.PathwaysIndexRoute = Ember.Route.extend({

  setupController: function(controller, model, params) {
    controller.set('model', model);
  },

  model: function(params) {
    console.log('pathway model');
    var uri = params.uri;
    return this.get('store').find('pathway', uri);
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
    var searcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
    var compoundCallback=function(success, status, response){
        me.set('fetching', false);
        if (success && response) {
          var compoundResults = searcher.parseGetCompoundsResponse(response);
          me.set('totalCount', compoundResults.metabolites.length);
          $.each(compoundResults.metabolites, function(index, uri) {
            me.store.find('compound', uri).then(function(compound) {
	          thisPathway.get('compounds').pushObject(compound);
            });
          });
        }
    };
    // only fetch compounds for this pathway if there are none, since it is not a paginated call
    if (thisPathway.get('compounds.length') <= 0) {
        me.set('fetching', true);
        searcher.getCompounds(thisPathway.get('URI'), null, compoundCallback);
    }
  },

  model: function(params) {
    console.log('pathway compounds index');
    var uri = params.uri;
    return this.get('store').find('pathway', uri);
  },

  beforeModel: function() {
    this.controllerFor('application').set('fetching', false);
    enable_scroll();
  }

});
