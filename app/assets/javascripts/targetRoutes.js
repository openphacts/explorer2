// Target Routes

App.TargetsIndexRoute = Ember.Route.extend({

  observesParameters: ['uri'],
	
  setupController: function(controller, model) {
    console.log('target index controller');
    controller.set('model', model);	
  },

  model: function() {
    console.log('target index model')
    var uri = this.get('queryParameters').uri;
    var target = this.controllerFor('targets').store.find('target', uri);
    var uriParams = Ember.Router.QueryParameters.create({ "uri": uri });
    return target;
  }

});

App.TargetsPharmacologyRoute = Ember.Route.extend({

  observesParameters: ['uri'],

  setupController: function(controller, model) {
    console.log('target index route setup controller');
    controller.set('content', model);
      var me = controller;
      var thisTarget = model;
      var searcher = new Openphacts.TargetSearch(ldaBaseUrl, appID, appKey);
      var pharmaCallback=function(success, status, response){
        if (success && response) {
          var pharmaResults = searcher.parseTargetPharmacologyResponse(response);
          $.each(pharmaResults, function(index, pharma) {
            var pharmaRecord = me.store.createRecord('targetPharmacology', pharma);
	        thisTarget.get('pharmacology').pushObject(pharmaRecord);
          });
          controller.set('page', 1);
        }
    };
    var countCallback=function(success, status, response){
      if (success && response) {
        var count = searcher.parseTargetPharmacologyCountResponse(response);
        controller.set('totalCount', count);
        if (count > 0) {
            searcher.targetPharmacology(thisTarget.get('URI'), 1, 50, pharmaCallback);
        }
      }
    };
    var countOnlyCallback=function(success, status, response){
      if (success && response) {
        var count = searcher.parseTargetPharmacologyCountResponse(response);
        controller.set('totalCount', count);
        //set page just in case it is for a different compound previously loaded
        if (me.get('currentCount')%50 > 0) {
            me.set('page', Math.floor(me.get('currentCount')/50) + 1);
        } else {
            searcher.targetPharmacology(thisTarget.get('URI'), 1, 50, pharmaCallback);
        }
      }
    };
    //if controllers model is empty and totalCount is null then we have not loaded any pharma
    if (me.get('currentCount') === 0 && controller.get('totalCount') === null) {
        searcher.targetPharmacologyCount(thisTarget.get('URI'), countCallback);
    } else if (me.get('currentCount') === 0 && controller.get('totalCount') >= 0) {
        //could still be count for a different target
        searcher.targetPharmacologyCount(thisTarget.get('URI'), countCallback);
    } else {
        //reset the totalCount just to be sure
        searcher.targetPharmacologyCount(thisTarget.get('URI'), countOnlyCallback);
    }
  },
  model: function(params) {
    console.log('target pharma index route');
    var uri = this.get('queryParameters').uri;
    return this.get('store').find('target', uri);
  }

});

App.TargetsPathwaysRoute = Ember.Route.extend({

  setupController: function(controller, model) {
    controller.set('content', model);
    controller.clear();
    var me = controller;
    var thisTarget = this.modelFor('target');
    var searcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
    //how many pathways for this compound
    var countCallback=function(success, status, response){
      if (success && response) {
        var count = searcher.parseCountPathwaysByTargetResponse(response);
        controller.set('totalCount', count);
        if (count > 0) {
            searcher.byTarget(thisTarget.get('URI'), null, null, 1, 50, null, pathwaysByTargetCallback);
        }
      }
    };
    //load the pathways for this compound
    var pathwaysByTargetCallback=function(success, status, response){
      if (success && response) {
          var pathwayResults = searcher.parseByTargetResponse(response);
          $.each(pathwayResults, function(index, pathwayResult) {
            pathwayID = pathwayResult.identifier.split('/').pop();
            //have to find the pathway record and add it, just adding the ID does not work
            me.get('store').find('pathway', pathwayID).then(function(pathway) {
              thisTarget.get('pathways').pushObject(pathway);
            });
          });
      }
    }
    searcher.countPathwaysByTarget(thisTarget.get('URI'), null, null, countCallback);
  },
  model: function() {
    return this.modelFor('target').get('pathways');
  }
});
