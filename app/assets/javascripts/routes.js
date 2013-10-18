// If you want your urls to look www.yourapp.org/x instead of www.yourapp.org/#/x
// you have to set location to 'history'. This means that you must also tell rails
// what your routes are and to redirect them to whatever template contains the ember
// outlet
//App.Router.reopen({
//  location: 'history',
//  rootURL: '/'
//});

App.Router.map(function() { 
    this.route("search", { path: "/search" }, function() {

    });
    this.resource('compounds', { path: '/compounds' }, function() {});
    this.resource('compound', { path: '/compounds/:compound_id' } , function() {
        this.resource('compound.pharmacology', { path: '/pharmacology' }, function(){});
        this.resource('compound.structure', { path: '/structure' }, function(){});
        this.resource('compound.pathways', { path: '/pathways' }, function(){});
    });
    this.resource('targets', { path: '/targets' }, function() {}); 
    this.resource('target', { path: '/targets/:target_id' }, function() {
        this.resource('target.pharmacology', { path: '/pharmacology' }, function(){});
        this.resource('target.pathways', { path: '/pathways' }, function(){});
    });
    this.resource('enzymes', { path: '/enzymes' }, function() {}); 
    this.resource('enzyme', { path: '/enzymes/:enzyme_id' }, function() {
        this.resource('enzyme.pharmacology', { path: '/pharmacology' }, function(){});
    });
    this.resource('pathways', { path: '/pathways' }, function() {}); 
    this.resource('pathway', { path: '/pathways/:pathway_id' }, function() {
    });
});

App.SearchRoute = Ember.Route.extend({

  observesParameters: ['query'],

  setupController: function(controller, model, queryParams) {
    console.log('search route setup');
    controller.clear();
    controller.set('totalResults', 0);
    var me = controller;
    var currentQuery = controller.getCurrentQuery();	
    var searcher = new Openphacts.ConceptWikiSearch(ldaBaseUrl, appID, appKey); 
	var cwCompoundCallback=function(success, status, response){
            if(success && response) {
                var results = searcher.parseResponse(response);
                $.each(results, function(index, result) {
                  //find the compound then check if the preferred label exactly matches the query when it returns from the 'promise'
                  //the promise is generated inside the store adapter for compound, see store.js
                  controller.store.find('compound', result.uri.split('/').pop()).then(function(compound) {
                      if (compound.get('prefLabel') != null && compound.get('prefLabel').toLowerCase() === currentQuery.toLowerCase()) {
                          compound.set('exactMatch', true);
      			          me.addExactMatch(compound);
                          me.set('totalResults', me.get('totalResults') + 1);
                      } else {
                          me.addSearchResult(compound);
                          me.set('totalResults', me.get('totalResults') + 1);
                      } 
                  });
                });
            } else {
                // an error in the response, ignore for now
            }
            me.set('isSearching', false);
            pageScrolling = false;
            enable_scroll();
        };
        var cwTargetCallback=function(success, status, response){
            if(success && response) {
                var results = searcher.parseResponse(response);
                $.each(results, function(index, result) {
                    //find the target then add to the search results when the 'promise' returns
                    controller.store.find('target', result.uri.split('/').pop()).then(function(target) {
                      me.set('totalResults', me.get('totalResults') + 1);
                      me.addSearchResult(target);
					  console.log('target load');
                    });
                });
            } else {
                // an error in the response, ignore for now
            }
            me.set('isSearching', false);
            pageScrolling = false;
            enable_scroll();
        }; 
        //targets
        searcher.byTag(controller.getCurrentQuery(), '20', '3', 'eeaec894-d856-4106-9fa1-662b1dc6c6f1', cwTargetCallback);
        searcher.byTag(controller.getCurrentQuery(), '20', '4', '07a84994-e464-4bbf-812a-a4b96fa3d197', cwCompoundCallback);
  },

  model: function() {
    console.log('search route model');
    this.controllerFor('search').setCurrentQuery(this.get('queryParameters').query);
    return [];
  }
	
});

App.CompoundIndexRoute = Ember.Route.extend({
	
  setupController: function(controller, model) {
   console.log('compound index controller');
   controller.set('model', model);	
  },

  model: function() {
	console.log('compound index model')
    return this.modelFor('compound');
 }
});

App.CompoundRoute = Ember.Route.extend({
	
  setupController: function(controller, model) {
    console.log('compound controller');
    controller.set('model', model);	
  },

  model: function(params) {
	console.log('compound model');
    return this.get('store').find('compound', params.compound_id);
 }
});

App.CompoundPharmacologyIndexRoute = Ember.Route.extend({

  setupController: function(controller, compound) {
    controller.set('content', compound);
      var me = controller;
      var thisCompound = compound;
      var searcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);
      var pharmaCallback=function(success, status, response){
        if (success && response) {
          var pharmaResults = searcher.parseCompoundPharmacologyResponse(response);
          $.each(pharmaResults, function(index, pharma) {
            var pharmaRecord = me.store.createRecord('compoundPharmacology', pharma);
	        thisCompound.get('pharmacology').pushObject(pharmaRecord);        
          });
          controller.set('currentCount', controller.get('currentCount') + pharmaResults.length);
          controller.set('page', controller.get('page') + 1);
        }
    };
    var countCallback=function(success, status, response){
      if (success && response) {
        var count = searcher.parseCompoundPharmacologyCountResponse(response);
        controller.set('totalCount', count);
      }
    };
    searcher.compoundPharmacology('http://www.conceptwiki.org/concept/' + compound.id, 1, 50, pharmaCallback);
    searcher.compoundPharmacologyCount('http://www.conceptwiki.org/concept/' + compound.id, countCallback);
  },
  model: function(params) {
    return this.modelFor('compound');
  }

});

App.TargetIndexRoute = Ember.Route.extend({
	
  setupController: function(controller, model) {
   console.log('target index controller');
   controller.set('model', model);	
  },

  model: function() {
	console.log('target index model')
    return this.modelFor('target');
 }
});

App.TargetRoute = Ember.Route.extend({
	
  setupController: function(controller, model) {
    console.log('target controller');
    controller.set('model', model);	
  },

  model: function(params) {
	console.log('target model');
    return this.get('store').find('target', params.target_id);
 }
});

App.TargetPharmacologyIndexRoute = Ember.Route.extend({

  setupController: function(controller, target) {
    console.log('target index route setup controller');
    var me = controller;
    controller.set('content', target);
      var thisTarget = target;
      var searcher = new Openphacts.TargetSearch(ldaBaseUrl, appID, appKey);
      var pharmaCallback=function(success, status, response){
      if (success && response) {
        var pharmaResults = searcher.parseTargetPharmacologyResponse(response);
        $.each(pharmaResults, function(index, pharma) {
          var pharmaRecord = me.store.createRecord('targetPharmacology', pharma);
	      thisTarget.get('pharmacology').pushObject(pharmaRecord);
        });
        controller.set('page', controller.get('page') + 1);
        controller.set('currentCount', controller.get('currentCount') + pharmaResults.length);
      }
    };
    var countCallback=function(success, status, response){
      if (success && response) {
        var count = searcher.parseTargetPharmacologyCountResponse(response);
        controller.set('totalCount', count);
      }
    };
    searcher.targetPharmacology('http://www.conceptwiki.org/concept/' + target.id, 1, 50, pharmaCallback);
    searcher.targetPharmacologyCount('http://www.conceptwiki.org/concept/' + target.id, countCallback);
  },
  model: function(params) {
    console.log('target pharma index route');
    return this.modelFor('target');
  }

});

App.EnzymesRoute = Ember.Route.extend({
    setupController: function(controller) {
	    console.log('enzymes index route setup controller');
	    controller.set('content', []);
	    var searcher = new Openphacts.EnzymeSearch(ldaBaseUrl, appID, appKey);
	    var callback = function(success, status, response) {
		    if (success && response) {
			    var root = searcher.parseClassificationRootClasses(response);
			    $.each(root, function(index,enzymeResult) {
				    var enzyme = controller.store.createRecord('enzyme', enzymeResult);
				    controller.addObject(enzyme);				    
			    });
			}
		}
	    searcher.getClassificationRootClasses(callback);
   }	
});

App.EnzymeIndexRoute = Ember.Route.extend({

  setupController: function(controller, model) {
    controller.set('model', model);
  },
  model: function(params) {
    return this.modelFor('enzyme');
  }
});

App.EnzymePharmacologyIndexRoute = Ember.Route.extend({

  setupController: function(controller, enzyme) {
    console.log('enzyme index route setup controller');
    var me = controller;
    controller.set('model', enzyme);
      var thisEnzyme = enzyme;
      var searcher = new Openphacts.EnzymeSearch(ldaBaseUrl, appID, appKey);
      var pharmaCallback=function(success, status, response){
      if (success && response) {
        var pharmaResults = searcher.parsePharmacologyPaginated(response);
        $.each(pharmaResults, function(index, pharma) {
          var pharmaRecord = me.store.createRecord('enzymePharmacology', pharma);
	      thisEnzyme.get('pharmacology').pushObject(pharmaRecord);
        });
      }
    };
    var countCallback = function(success, status, response) {
        if (success) {
            var count = searcher.parsePharmacologyCount(response);
            controller.totalCount = count;
            // are there any results?
            controller.set('empty', count > 0 ? false : true);
            if (count > 0) {
                searcher.getPharmacologyPaginated('http://purl.uniprot.org/enzyme/' + enzyme.id, null, null, null, null, null, null, null, null, null, 1, 50, null, pharmaCallback);
            }
        }
    };

    searcher.getPharmacologyCount('http://purl.uniprot.org/enzyme/' + enzyme.id, null, null, null, null, null, null, null, null, null, countCallback);
  },
  model: function(params) {
    console.log('enzyme pharma index route');
    return this.modelFor('enzyme');
  }

});

App.PathwayIndexRoute = Ember.Route.extend({

  setupController: function(controller, model) {
    controller.set('model', model);
  },

  model: function(params) {
    console.log('pathway index');
    return this.modelFor('pathway');
  }
});

App.CompoundPathwaysIndexRoute = Ember.Route.extend({

  setupController: function(controller, compound) {
    controller.set('content', compound);
    var me = controller;
      var thisCompound = compound;
      var searcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
      var pathwaysByCompoundCallback=function(success, status, response){
        if (success && response) {
          var pathwayResults = searcher.parseByCompoundResponse(response);
          $.each(pathwayResults, function(index, pathwayResult) {
            pathwayID = pathwayResult.identifier.split('/').pop();
            me.store.find('pathway', pathwayID).then(function(pathway) {
              thisCompound.get('pathways').pushObject(pathway);
            });
          });
          controller.set('currentCount', controller.get('currentCount') + pathwayResults.length);
          controller.set('page', controller.get('page') + 1);
        }
    };
    var countCallback=function(success, status, response){
      if (success && response) {
        var count = searcher.parseCountPathwaysByCompoundResponse(response);
        controller.set('totalCount', count);
      }
    };
    searcher.byCompound('http://www.conceptwiki.org/concept/' + compound.id, null, null, 1, 50, null, pathwaysByCompoundCallback);
    searcher.countPathwaysByCompound('http://www.conceptwiki.org/concept/' + compound.id, null, null, countCallback);
  },
  model: function(params) {
    return this.modelFor('compound');
  }

});
