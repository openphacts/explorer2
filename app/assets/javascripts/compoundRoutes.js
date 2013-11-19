// Compound Routes

App.CompoundsIndexRoute = Ember.Route.extend({

  observesParameters: ['uri'],
	
  setupController: function(controller, model) {
   console.log('compound index controller');
   controller.set('model', model);	
  },

  model: function() {
	console.log('compound index model')
    var uri = this.get('queryParameters').uri;
    var compound = this.controllerFor('compounds').store.find('compound', uri);
    var uriParams = Ember.Router.QueryParameters.create({ "uri": uri });
    return compound;
 }
});

App.CompoundsPharmacologyRoute = Ember.Route.extend({

  observesParameters: ['uri'],

  setupController: function(controller, model) {
    controller.set('content', model);
      var me = controller;
      var thisCompound = model;
      var searcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);
      var pharmaCallback=function(success, status, response){
        if (success && response) {
          var pharmaResults = searcher.parseCompoundPharmacologyResponse(response);
          $.each(pharmaResults, function(index, pharma) {
            var pharmaRecord = me.store.createRecord('compoundPharmacology', pharma);
	        thisCompound.get('pharmacology').pushObject(pharmaRecord);
          });
          controller.set('page', 1);
        }
    };
    var countCallback=function(success, status, response){
      if (success && response) {
        var count = searcher.parseCompoundPharmacologyCountResponse(response);
        controller.set('totalCount', count);
        if (count > 0) {
            searcher.compoundPharmacology(thisCompound.get('URI'), 1, 50, pharmaCallback);
        }
      }
    };
    var countOnlyCallback=function(success, status, response){
      if (success && response) {
        var count = searcher.parseCompoundPharmacologyCountResponse(response);
        controller.set('totalCount', count);
        //set page just in case it is for a different compound previously loaded
        if (me.get('currentCount')%50 > 0) {
            me.set('page', Math.floor(me.get('currentCount')/50) + 1);
        } else {
            me.set('page', me.get('currentCount')/50);
        }
      }
    };
    //if currentCount is 0 (ie controllers content is empty) and totalCount is null then we have not loaded any pharma
    if (controller.get('currentCount') === 0 && controller.get('totalCount') === null) {
        searcher.compoundPharmacologyCount(thisCompound.get('URI'), countCallback);
    } else if (controller.get('currentCount') === 0 && controller.get('totalCount') >= 0) {
        //could still be count for a different compound
        searcher.compoundPharmacologyCount(thisCompound.get('URI'), countCallback);
    } else {
        //reset the totalCount just to be sure
        searcher.compoundPharmacologyCount(thisCompound.get('URI'), countOnlyCallback);
    }

  },
  model: function(params) {
    console.log('compounds pharma controller model');
    var uri = this.get('queryParameters').uri;
    return this.get('store').find('compound', uri);
  }

});

App.CompoundsStructureRoute = Ember.Route.extend({

  observesParameters: ['type', 'uri'],

  setupController: function(controller, model) {
    controller.set('content', model);
    var me = controller;
    var thisCompound = model;
    thisCompound.get('structure').clear();
    var structureSearchType = controller.get('structureSearchType');
    var searcher = new Openphacts.StructureSearch(ldaBaseUrl, appID, appKey);
    var callback=function(success, status, response){
       if (success && response) {
           if (structureSearchType === "exact") {
               results = searcher.parseExactResponse(response);
               me.set('totalCount', results.length);
               $.each(results, function(index, result) {
                   me.get('store').find('compound', result).then(function(compound) {
		               thisCompound.get('structure').pushObject(compound);
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
		               thisCompound.get('structure').pushObject(compound);
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
		               thisCompound.get('structure').pushObject(compound);
                   });
                 });
           }
       }
     };
     if (structureSearchType === "exact") {
         searcher.exact(thisCompound.get('smiles'), null, callback);
     } else if (structureSearchType === "similarity") {
         // TODO fix start and count at 1 and 100 for the moment
         searcher.similarity(thisCompound.get('smiles'), null, null, null, null, 1, 100, callback);
     } else if (structureSearchType === "substructure") {
         // TODO fix start and count at 1 and 100 for the moment
         searcher.substructure(thisCompound.get('smiles'), null, 1, 100, callback);
     }
  },
  model: function(params) {
    //the route can come in with a ?type=structureSearchType param, default is exact
    var type = this.get('queryParameters').type;
    if (type) {
        this.controllerFor('compoundsStructure').set('structureSearchType', type);
    }
    var uri = this.get('queryParameters').uri;
    return this.get('store').find('compound', uri);
  }

});

App.CompoundsPathwaysRoute = Ember.Route.extend({

  observesParameters: ['uri'],

  setupController: function(controller, model) {
    controller.set('content', model);
    var me = controller;
    var thisCompound = model;
    var searcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
    //how many pathways for this compound
    var countCallback=function(success, status, response){
      if (success && response) {
        var count = searcher.parseCountPathwaysByCompoundResponse(response);
        controller.set('totalCount', count);
        if(count > 0) {
          searcher.byCompound(thisCompound.get('URI'), null, null, 1, 50, null, pathwaysByCompoundCallback);
        }
      }
    };
    //load the pathways for this compound
    var pathwaysByCompoundCallback=function(success, status, response){
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
    searcher.countPathwaysByCompound(thisCompound.get('URI'), null, null, countCallback);
  },
  model: function() {
    var uri = this.get('queryParameters').uri;
    return this.get('store').find('compound', uri);
  }
});
