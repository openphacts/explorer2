App.SearchController = Ember.ArrayController.extend({

    queryParams: ['query'],

    needs: ['application'],

    compoundsChecked: true,

    targetsChecked: true,

    listView: true,

    numberOfResults: 50,

    totalCompounds: 0,

    totalTargets: 0,

    currentPage: 0,

    totalResults: function() {
      return this.get('model.length');
    }.property('model.length'),

    current_query: '',

    previous_query: null,

    query: '',

    listViewActive: function() {
      return this.get('listView') === true;
    }.property('listView'),

    objectViewActive: function() {
      return this.get('listView') === false;
    }.property('listView'),

    contract: function() {
      this.set('isExpanded', false);
    },

    addSearchResult: function(searchResult) {
        this.pushObject(searchResult);
    },

    addExactMatch: function(compound) {
        this.insertAt(0, compound);
    },

    setCurrentQuery: function(query) {
        this.current_query=query;
        // ensure the search box is bound to the query when using 'back' button
        this.get('controllers.application').set('searchQuery', query);
    },

    getCurrentQuery: function() {
        return this.current_query;
    },

    setPreviousQuery: function(query) {
        this.previous_query=query;
    },

    getPreviousQuery: function() {
        return this.previous_query;
    },

    resetPageCount: function(query) {
        this.currentPage = 0;
        this.set('query', query);
        this.conceptWikiSearch(query);
        App.Router.router.transitionTo('search');
    },

    doSearch: function() {
    var me = this;
    var searcher = new Openphacts.ConceptWikiSearch(ldaBaseUrl, appID, appKey); 
	var cwCompoundCallback=function(success, status, response){
            Ember.run(function(){me.get('controllers.application').set('fetching', false)});
            if(success && response) {
                var results = searcher.parseResponse(response);
                $.each(results, function(index, result) {
                  //find the compound then check if the preferred label exactly matches the query when it returns from the 'promise'
                  //the promise is generated inside the store adapter for compound, see store.js
                  Ember.run(function(){me.store.find('compound', result.uri).then(function(compound) {
                      if (compound.get('prefLabel') != null && compound.get('prefLabel').toLowerCase() === me.getCurrentQuery().toLowerCase()) {
                          compound.set('exactMatch', true);
      			          me.addExactMatch(compound);
                      } else {
                          me.addSearchResult(compound);
                      }
		      Ember.run(function(){me.set('totalCompounds', me.get('totalCompounds') + 1)});
                      //how many pathways & pharmacology for this compound
                      var pathwaysSearcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
                      var compoundSearcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);

                      var pathwaysCountCallback=function(success, status, response){
                          if (success && response) {
                            var count = pathwaysSearcher.parseCountPathwaysByCompoundResponse(response);
                            Ember.run(function(){compound.set('pathwayRecords', count)});
                          }
                      };

                      var pharmaCountCallback=function(success, status, response){
                          if (success && response) {
                            var count = compoundSearcher.parseCompoundPharmacologyCountResponse(response);
                            Ember.run(function(){compound.set('pharmacologyRecords', count)});
                          }
                      };
                      var compoundURI = compound.get('URI');
                      compoundSearcher.compoundPharmacologyCount(compoundURI, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, pharmaCountCallback);
                      pathwaysSearcher.countPathwaysByCompound(compoundURI, null, null, pathwaysCountCallback);
                  })});
                });
            } else {
                // an error in the response, ignore for now
            }
        };
        var cwTargetCallback=function(success, status, response){
            Ember.run(function(){me.get('controllers.application').set('fetching', false)});
            if(success && response) {
                var results = searcher.parseResponse(response);
                $.each(results, function(index, result) {
                    //find the target then add to the search results when the 'promise' returns
                    Ember.run(function(){me.store.find('target', result.uri).then(function(target) {
                      if (target.get('prefLabel') != null && target.get('prefLabel').toLowerCase() === me.getCurrentQuery().toLowerCase()) {
                          Ember.run(function(){target.set('exactMatch', true)});
                          me.addExactMatch(target);
                      } else {
                          me.addSearchResult(target);
                      }
		      Ember.run(function(){me.set('totalTargets', me.get('totalTargets') + 1)});
                      //how many pathways & pharmacology for this target
                      var pathwaysSearcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
                      var targetSearcher = new Openphacts.TargetSearch(ldaBaseUrl, appID, appKey);

                      var pathwaysCountCallback=function(success, status, response){
                          if (success && response) {
                            var count = pathwaysSearcher.parseCountPathwaysByTargetResponse(response);
                            Ember.run(function(){target.set('pathwayRecords', count)});
                          }
                      };

                      var pharmaCountCallback=function(success, status, response){
                          if (success && response) {
                            var count = targetSearcher.parseTargetPharmacologyCountResponse(response);
                            Ember.run(function(){target.set('pharmacologyRecords', count)});
                          }
                      };

                      var targetURI = target.get('URI');
                      targetSearcher.targetPharmacologyCount(targetURI, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, pharmaCountCallback);
                      pathwaysSearcher.countPathwaysByTarget(targetURI, null, null, pathwaysCountCallback);
                    })});
                });
            } else {
                // an error in the response, ignore for now
            }
        }; 
        var cwGeneTargetCallback=function(success, status, response){
            Ember.run(function(){me.get('controllers.application').set('fetching', false)});
            if(success && response) {
                var results = searcher.parseResponse(response);
                $.each(results, function(index, result) {
                    //find the target then add to the search results when the 'promise' returns
                    Ember.run(function(){me.store.find('target', result.uri).then(function(target) {
                      if (target.get('prefLabel') != null && target.get('prefLabel').toLowerCase() === me.getCurrentQuery().toLowerCase()) {
                          Ember.run(function(){target.set('exactMatch', true)});
                          me.addExactMatch(target);
                      } else {
                          me.addSearchResult(target);
                      }
                      //how many pathways & pharmacology for this target
                      var pathwaysSearcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
                      var targetSearcher = new Openphacts.TargetSearch(ldaBaseUrl, appID, appKey);

                      var pathwaysCountCallback=function(success, status, response){
                          if (success && response) {
                            var count = pathwaysSearcher.parseCountPathwaysByTargetResponse(response);
                            Ember.run(function(){target.set('pathwayRecords', count)});
                          }
                      };

                      var pharmaCountCallback=function(success, status, response){
                          if (success && response) {
                            var count = targetSearcher.parseTargetPharmacologyCountResponse(response);
                            Ember.run(function(){target.set('pharmacologyRecords', count)});
                          }
                      };

                      var targetURI = target.get('URI');
                      targetSearcher.targetPharmacologyCount(targetURI, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, pharmaCountCallback);
                      pathwaysSearcher.countPathwaysByTarget(targetURI, null, null, pathwaysCountCallback);
                    })});
                });
            } else {
                // an error in the response, ignore for now
            }
        }; 
        var structureSearcher = new Openphacts.StructureSearch(ldaBaseUrl, appID, appKey);
        var structureCallback = function(success, status, response) {
            if (success) {
	            Ember.run(function(){me.get('controllers.application').set('fetching', false)});
              var uri = structureSearcher.parseSmilesToURLResponse(response);
              // got the uri from the smiles so now fetch the compound
              Ember.run(function(){me.store.find('compound', uri).then(function(compound) {
                  me.addSearchResult(compound);
		  Ember.run(function(){me.set('totalCompounds', me.get('totalCompounds') + 1)});
                  //how many pathways & pharmacology for this compound
                  var pathwaysSearcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
                  var compoundSearcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);

                  var pathwaysCountCallback=function(success, status, response){
                      if (success && response) {
                        var count = pathwaysSearcher.parseCountPathwaysByCompoundResponse(response);
                        Ember.run(function(){compound.set('pathwayRecords', count)});
                      }
                  };

                  var pharmaCountCallback=function(success, status, response){
                      if (success && response) {
                        var count = compoundSearcher.parseCompoundPharmacologyCountResponse(response);
                        Ember.run(function(){compound.set('pharmacologyRecords', count)});
                      }
                  };
                  var compoundURI = compound.get('URI');
                  compoundSearcher.compoundPharmacologyCount(compoundURI, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, pharmaCountCallback);
                  pathwaysSearcher.countPathwaysByCompound(compoundURI, null, null, pathwaysCountCallback);
              })});

            } else {
	          //didn'f find anything, doesn't really matter
            }
        }
        //targets
	  me.set('totalCompounds', 0);
	  me.set('totalTargets', 0);
          me.get('controllers.application').set('fetching', true);
          //searching uses branch 3 for compounds and 4 for branches rather than byTag and semantic tag - caused issues due to there being multiple semantic tags for a branch
          searcher.freeText(me.getCurrentQuery(), me.get('numberOfResults'), '3', cwTargetCallback);
          //searcher.byTag(me.getCurrentQuery(), '20', '3', 'a3b5c57e-8ac1-46ac-afef-3347d40c4d37', cwGeneTargetCallback);
          searcher.freeText(me.getCurrentQuery(), me.get('numberOfResults'), '4', cwCompoundCallback);
		  //smiles for compounds
          structureSearcher.smilesToURL(me.getCurrentQuery(), structureCallback);

   },

   actions: {

       switchView: function() {
           this.set('listView', !this.get('listView'));
       }

   }

});
