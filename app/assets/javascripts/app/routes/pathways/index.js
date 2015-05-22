import Ember from "ember";

export default Ember.Route.extend({

  setupController: function(controller, model, params) {
    controller.set('model', model);
    var pathwaysSearcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
    var compoundCallback=function(success, status, response){
        if (success && response) {
          var compoundResults = pathwaysSearcher.parseGetCompoundsResponse(response);
          model.set('compoundRecords', compoundResults.metabolites.length);
        }
    };
    pathwaysSearcher.getCompounds(model.get('URI'), null, compoundCallback);
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
