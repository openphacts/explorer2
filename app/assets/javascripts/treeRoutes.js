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
			    $.each(root.rootClasses, function(index,enzymeResult) {
				    var enzyme = controller.store.createRecord('tree', enzymeResult);
                    enzyme.set('id', enzymeResult.uri.split('/').pop());
                    enzyme.set('hasChildren', false);
                    enzyme.set('level', 1);
                    enzyme.set('opened', false);
                    allRoot.push(enzyme);
                    var innerCallback = function(success, status, response) {
			          if (success && response) {
			              var members = searcher.parseChildNodes(response);
                          //does the node have children
                          enzyme.set('hasChildren', members.children.length > 0 ? true : false);
				      }
			        }
                    searcher.getChildNodes(enzymeResult.uri, innerCallback);	    
			    });
                allRoot.sort(function(a,b) {
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
	    searcher.getRootNodes('enzyme', callback);
   },

   model: function(params) {
     console.log('enzymes route model');
     return [];
   },

  beforeModel: function() {
    this.controllerFor('application').set('fetching', false);
    enable_scroll();
  }
});

App.TreesPharmacologyRoute = Ember.Route.extend({

  setupController: function(controller, model, params) {
    console.log('tree pharma controller setup');
    var me = controller;
    controller.set('content', model);
      var thisEnzyme = model;
      var searcher = new Openphacts.TreeSearch(ldaBaseUrl, appID, appKey);
      var pharmaCallback=function(success, status, response){
      if (success && response) {
        var pharmaResults = searcher.parseTargetClassPharmacologyPaginated(response);
        $.each(pharmaResults, function(index, pharma) {
          pharma['ketcherPath'] = ketcherPath;
          var pharmaRecord = me.store.createRecord('treePharmacology', pharma);
	      thisEnzyme.get('pharmacology').addObject(pharmaRecord);
        });
      }
    };
    var countCallback = function(success, status, response) {
        if (success) {
            var count = searcher.parseTargetClassPharmacologyCount(response);
            controller.set('totalCount', count);
            if (count > 0) {
		        searcher.getTargetClassPharmacologyPaginated(thisEnzyme.id, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 1, 50, null, pharmaCallback);
            } else {
App.FlashQueue.pushFlash('error', 'There is no pharmacology data for ' + thisEnzyme.id);

	    }
        }
    };
    var activitySearcher = new Openphacts.ActivitySearch(ldaBaseUrl, appID, appKey);
    var activityTypesCallback=function(success, status, response){
        if (success && response) {
                var activityTypes = activitySearcher.parseTypes(response);
            me.set('activityTypes', activityTypes);
        }
    };
    activitySearcher.getTypes(null, null, null, null, null, activityTypesCallback);

    // fetch all activity units for default in filter select
    var allUnitsCallback=function(success, status, response){
                if (success && response) {
                    var units = activitySearcher.parseAllUnits(response);
                    me.set('activityUnits', units);
            //me.set('defaultUnitFilters', units);
                }
    };
    activitySearcher.getAllUnits(null, 'all', null, null, allUnitsCallback);
    searcher.getTargetClassPharmacologyCount(thisEnzyme.id, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, countCallback);
  },

  model: function(params) {
    console.log('tree pharma controller model');
    var uri = params.uri;
    var tree = this.controllerFor('trees').store.find('tree', uri);
    return tree;
  },

  beforeModel: function() {
    this.controllerFor('application').set('fetching', false);
    enable_scroll();
  }

});

App.TreesPharmacologyIndexRoute = Ember.Route.extend({

  setupController: function(controller, model, params) {
    console.log('enzyme index route setup controller');
    var me = controller;
    controller.set('model', model);
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
    return tree.get('pharmacology');
  },

  beforeModel: function() {
    this.controllerFor('application').set('fetching', false);
    enable_scroll();
  }

});
