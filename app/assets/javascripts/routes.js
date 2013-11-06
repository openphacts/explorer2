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
    this.resource('trees', { path: '/trees' }, function() {
        this.route('pharmacology', { path: '/pharmacology' }, function(){});
    });
    this.resource('pathways', { path: '/pathways' }, function() {}); 
    this.resource('pathway', { path: '/pathways/:pathway_id' }, function() {
        this.resource('pathway.compounds', { path: '/compounds' }, function(){});
    });
});

App.SearchRoute = Ember.Route.extend({

  observesParameters: ['query'],

  setupController: function(controller, model, queryParams) {
    console.log('search route setup');
    controller.clear();
    controller.set('totalResults', 0);
    controller.doSearch();
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

  setupController: function(controller, model) {
    controller.set('content', model);
      var me = controller;
      var thisCompound = this.modelFor('compound');
      var searcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);
      var pharmaCallback=function(success, status, response){
        if (success && response) {
          var pharmaResults = searcher.parseCompoundPharmacologyResponse(response);
          $.each(pharmaResults, function(index, pharma) {
            var pharmaRecord = me.store.createRecord('compoundPharmacology', pharma);
	        thisCompound.get('pharmacology').pushObject(pharmaRecord);
          });
          //controller.set('currentCount', controller.get('currentCount') + pharmaResults.length);
          controller.set('page', 1);
        }
    };
    var countCallback=function(success, status, response){
      if (success && response) {
        var count = searcher.parseCompoundPharmacologyCountResponse(response);
        controller.set('totalCount', count);
        if (count > 0) {
            searcher.compoundPharmacology('http://www.conceptwiki.org/concept/' + thisCompound.id, 1, 50, pharmaCallback);
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
        searcher.compoundPharmacologyCount('http://www.conceptwiki.org/concept/' + thisCompound.id, countCallback);
    } else if (controller.get('currentCount') === 0 && controller.get('totalCount') >= 0) {
        //could still be count for a different compound
        searcher.compoundPharmacologyCount('http://www.conceptwiki.org/concept/' + thisCompound.id, countCallback);
    } else {
        //reset the totalCount just to be sure
        searcher.compoundPharmacologyCount('http://www.conceptwiki.org/concept/' + thisCompound.id, countOnlyCallback);
    }

  },
  model: function(params) {
    return this.modelFor('compound').get('pharmacology');
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

  setupController: function(controller, model) {
    console.log('target index route setup controller');
    var me = controller;
    controller.set('content', model);
      var thisTarget = this.modelFor('target');
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
          if (count > 0 && controller.get('page') == null) {
              searcher.targetPharmacology('http://www.conceptwiki.org/concept/' + thisTarget.id, 1, 50, pharmaCallback);
          }
      }
    };
    if (controller.get('totalCount') == null) {
        searcher.targetPharmacologyCount('http://www.conceptwiki.org/concept/' + thisTarget.id, countCallback);
    }
  },
  model: function(params) {
    console.log('target pharma index route');
    return this.modelFor('target').get('pharmacology');
  }

});

App.TreesIndexRoute = Ember.Route.extend({
    setupController: function(controller, model) {
	    console.log('enzymes index route setup controller');
	    controller.set('content', model);
	    var searcher = new Openphacts.TreeSearch(ldaBaseUrl, appID, appKey);
	    var callback = function(success, status, response) {
		    if (success && response) {
			    var root = searcher.parseRootNodes(response);
			    $.each(root, function(index,enzymeResult) {
				    var enzyme = controller.store.createRecord('tree', enzymeResult);
                    enzyme.set('id', enzymeResult.uri.split('/').pop());
                    enzyme.set('hasChildren', false);
                    enzyme.set('level', 1);
                    enzyme.set('opened', false);
				    controller.addObject(enzyme);
                    var innerCallback = function(success, status, response) {
			          if (success && response) {
			              var members = searcher.parseChildNodes(response);
                          //does the node have children
                          enzyme.set('hasChildren', members.children.length > 0 ? true : false);
				      }
			        }
                    searcher.getChildNodes(enzymeResult.uri, innerCallback);	    
			    });
			}
		}
	    searcher.getRootNodes('enzyme', callback);
   },

   model: function(params) {
     console.log('enzymes route model');
     return [];
   }	
});

App.TreesPharmacologyRoute = Ember.Route.extend({

  observesParameters: ['uri'],

  setupController: function(controller, model) {
    console.log('tree pharma controller setup');
    var me = controller;
    controller.set('content', model);
      var thisEnzyme = model;
      var searcher = new Openphacts.TreeSearch(ldaBaseUrl, appID, appKey);
      var pharmaCallback=function(success, status, response){
      if (success && response) {
        var pharmaResults = searcher.parseTargetClassPharmacologyPaginated(response);
        $.each(pharmaResults, function(index, pharma) {
          var pharmaRecord = me.store.createRecord('treePharmacology', pharma);
	      thisEnzyme.get('pharmacology').addObject(pharmaRecord);
        });
      }
    };
    var countCallback = function(success, status, response) {
        if (success) {
            var count = searcher.parseTargetClassPharmacologyCount(response);
            controller.totalCount = count;
            // are there any results?
            controller.set('empty', count > 0 ? false : true);
            if (count > 0) {
		        searcher.getTargetClassPharmacologyPaginated(thisEnzyme.id, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, pharmaCallback);
            }
        }
    };

    searcher.getTargetClassPharmacologyCount(thisEnzyme.id, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, countCallback);
  },

  model: function(params) {
    console.log('tree pharma controller model');
    var uri = this.get('queryParameters').uri;
    var tree = this.controllerFor('trees').store.find('tree', uri);
    return tree;
  }

});

App.TreesPharmacologyIndexRoute = Ember.Route.extend({

  observesParameters: ['uri'],

  setupController: function(controller, enzyme) {
    console.log('enzyme index route setup controller');
    var me = controller;
    controller.set('model', enzyme.get('pharmacology'));
      var thisEnzyme = enzyme;
      var searcher = new Openphacts.TreeSearch(ldaBaseUrl, appID, appKey);
      var pharmaCallback=function(success, status, response){
      if (success && response) {
        var pharmaResults = searcher.parseTargetClassPharmacologyPaginated(response);
        $.each(pharmaResults, function(index, pharma) {
          var pharmaRecord = me.store.createRecord('treePharmacology', pharma);
	      thisEnzyme.get('pharmacology').pushObject(pharmaRecord);
        });
      }
    };
    var countCallback = function(success, status, response) {
        if (success) {
            var count = searcher.parseTargetClassPharmacologyCount(response);
            controller.totalCount = count;
            // are there any results?
            controller.set('empty', count > 0 ? false : true);
            if (count > 0) {
		        searcher.getTargetClassPharmacologyPaginated(enzyme.id, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, pharmaCallback);
            }
        }
    };

    searcher.getTargetClassPharmacologyCount(enzyme.id, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, countCallback);
  },
  model: function(params) {
    console.log('enzyme pharma index route');
    var uri = this.get('queryParameters').uri;
    var tree = this.controllerFor('trees').store.find('tree', uri);
    return tree;
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

App.PathwayCompoundsIndexRoute = Ember.Route.extend({

  setupController: function(controller, model) {
    controller.set('model', model);
    controller.clear();
    console.log('pathway adapter find');
    var me = controller;
    thisPathway = this.modelFor('pathway');
    var alert = {};
    Ember.RSVP.EventTarget.mixin(alert);
    // alert when the list of compounds for this pathway have been loaded
    alert.on("finished", function(event) {
      // find the cw url for each compound associated with a pathway
	  var mapSearcher = new Openphacts.MapSearch(ldaBaseUrl, appID, appKey);
	  var mapURLCallback = function(success, status, response) {
	    var constants = new Openphacts.Constants();
	    if (success && response) {
		    var matchingURL = null;
		    var urls = mapSearcher.parseMapURLResponse(response);
            var found = false;
            //loop through all the identifiers for a compound until we find the cw one
		    $.each(urls, function(i, url) {
		      var uri = new URI(url);
		      if (!found && constants.SRC_CLS_MAPPINGS['http://' + uri.hostname()] == 'conceptWikiValue') {
                me.get('store').find('compound', url.split('/').pop()).then(function(compound) {
		          thisPathway.get('compounds').pushObject(compound);
                });
                found = true;
		      }
            });	
	    }
	  };
      //loop through the url for each compound and fetch all the urls for it from the backend
      $.each(compoundURLs, function(index, URL) {
	    mapSearcher.mapURL(URL, null, null, null, mapURLCallback);
      });
    });
    var compoundURLs = [];
    var searcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
    var getCompoundsCallback=function(success, status, response){
      if (success && response) {
          var compoundsResult = searcher.parseGetCompoundsResponse(response);
          $.each(compoundsResult.metabolites, function(index, metabolite) {
            //load the ids of the pathways, the compound model will lazy load it
            // need to then find the cw id using the mapURL function
            compoundURLs.push(metabolite);
          });
          //we now have all the compound urls for this pathway although they are probably not the cw one so call the trigger
          alert.trigger('finished');
      }
    }
    searcher.getCompounds('http://identifiers.org/wikipathways/' + thisPathway.id, null, getCompoundsCallback);
  },

  model: function(params) {
    console.log('pathway compounds index');
    return this.modelFor('pathway').get('compounds');
  }
});

App.PathwaysCompoundIndexRoute = Ember.Route.extend({

  setupController: function(controller, model) {
    controller.set('model', model);
  },

  model: function(params) {
    console.log('pathway compounds index');
    return this.modelFor('pathway').get('compounds');
  }

});

App.CompoundPathwaysIndexRoute = Ember.Route.extend({

  setupController: function(controller, model) {
    controller.set('content', model);
    controller.clear();
    var me = controller;
    var thisCompound = this.modelFor('compound');
    var searcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
    //how many pathways for this compound
    var countCallback=function(success, status, response){
      if (success && response) {
        var count = searcher.parseCountPathwaysByCompoundResponse(response);
        controller.set('totalCount', count);
        if(count > 0) {
          searcher.byCompound('http://www.conceptwiki.org/concept/' + thisCompound.id, null, null, 1, 50, null, pathwaysByCompoundCallback);
        }
      }
    };
    //load the pathways for this compound
    var pathwaysByCompoundCallback=function(success, status, response){
      if (success && response) {
          var pathwayResults = searcher.parseByCompoundResponse(response);
          $.each(pathwayResults, function(index, pathwayResult) {
            pathwayID = pathwayResult.identifier.split('/').pop();
            //have to find the pathway record and add it, just adding the ID does not work
            me.get('store').find('pathway', pathwayID).then(function(pathway) {
              thisCompound.get('pathways').pushObject(pathway);
            });
          });
      }
    }
    searcher.countPathwaysByCompound('http://www.conceptwiki.org/concept/' + thisCompound.id, null, null, countCallback);
  },
  model: function() {
    return this.modelFor('compound').get('pathways');
  }
});

App.TargetPathwaysIndexRoute = Ember.Route.extend({

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
            searcher.byTarget('http://www.conceptwiki.org/concept/' + thisTarget.id, null, null, 1, 50, null, pathwaysByTargetCallback);
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
    searcher.countPathwaysByTarget('http://www.conceptwiki.org/concept/' + thisTarget.id, null, null, countCallback);
  },
  model: function() {
    return this.modelFor('target').get('pathways');
  }
});
App.CompoundStructureIndexRoute = Ember.Route.extend({

  observesParameters: ['type'],

  setupController: function(controller, model) {
    controller.set('content', model);
    controller.clear();
    var me = controller;
    var thisCompound = this.modelFor('compound');
    var structureSearchType = controller.get('structureSearchType');
    var searcher = new Openphacts.StructureSearch(ldaBaseUrl, appID, appKey);
    var callback=function(success, status, response){
       if (success && response) {
           if (structureSearchType === "exact") {
               result = searcher.parseExactResponse(response);
               var mapSearcher = new Openphacts.MapSearch(ldaBaseUrl, appID, appKey);
	           var mapURLCallback = function(success, status, response) {
	             var constants = new Openphacts.Constants();
	             if (success && response) {
		             var matchingURL = null;
		             var urls = mapSearcher.parseMapURLResponse(response);
                     var found = false;
                     //loop through all the identifiers for a compound until we find the cw one
		             $.each(urls, function(i, url) {
		               var uri = new URI(url);
		               if (!found && constants.SRC_CLS_MAPPINGS['http://' + uri.hostname()] == 'conceptWikiValue') {
                           me.get('store').find('compound', url.split('/').pop()).then(function(compound) {
		                     thisCompound.get('structure').pushObject(compound);
                           });
                          found = true;
		               }
                     });	
	             }
	           };
               mapSearcher.mapURL(result.csURI, null, null, null, mapURLCallback);
           } else if (structureSearchType === "similarity") {
                 results = searcher.parseSimilarityResponse(response);
                 var relevance = {};
                 $.each(results, function(index, result) {
                   var about = result.about;
                   var relevance = result.relevance;
                   relevance[about] = relevance;
                   //var compound = me.get('store').find('compound', );
	               var mapSearcher = new Openphacts.MapSearch(ldaBaseUrl, appID, appKey);
	               var mapURLCallback = function(success, status, response) {
	                 var constants = new Openphacts.Constants();
	                 if (success && response) {
		                 var matchingURL = null;
		                 var urls = mapSearcher.parseMapURLResponse(response);
                         var found = false;
                         //loop through all the identifiers for a compound until we find the cw one
		                 $.each(urls, function(i, url) {
		                   var uri = new URI(url);
		                   if (!found && constants.SRC_CLS_MAPPINGS['http://' + uri.hostname()] == 'conceptWikiValue') {
                               me.get('store').find('compound', url.split('/').pop()).then(function(compound) {
		                         thisCompound.get('structure').pushObject(compound);
                               });
                              found = true;
		                   }
                         });	
	                 }
	               };
                   mapSearcher.mapURL(about, null, null, null, mapURLCallback);
                 });
           } else if (structureSearchType === "substructure") {
                 results = searcher.parseSubstructureResponse(response);
                 var relevance = {};
                 $.each(results, function(index, result) {
                   var about = result.about;
                   var relevance = result.relevance;
                   relevance[about] = relevance;
                   //var compound = me.get('store').find('compound', );
	               var mapSearcher = new Openphacts.MapSearch(ldaBaseUrl, appID, appKey);
	               var mapURLCallback = function(success, status, response) {
	                 var constants = new Openphacts.Constants();
	                 if (success && response) {
		                 var matchingURL = null;
		                 var urls = mapSearcher.parseMapURLResponse(response);
                         var found = false;
                         //loop through all the identifiers for a compound until we find the cw one
		                 $.each(urls, function(i, url) {
		                   var uri = new URI(url);
		                   if (!found && constants.SRC_CLS_MAPPINGS['http://' + uri.hostname()] == 'conceptWikiValue') {
                               me.get('store').find('compound', url.split('/').pop()).then(function(compound) {
		                         thisCompound.get('structure').pushObject(compound);
                               });
                              found = true;
		                   }
                         });	
	                 }
	               };
                   mapSearcher.mapURL(about, null, null, null, mapURLCallback);
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
        this.controllerFor('compoundStructureIndex').set('structureSearchType', type);
    }
    return this.modelFor('compound').get('structure');
  }

});
