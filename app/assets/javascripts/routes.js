// If you want your urls to look www.yourapp.org/x instead of www.yourapp.org/#/x
// you have to set location to 'history'. This means that you must also tell rails
// what your routes are and to redirect them to whatever template contains the ember
// outlet
App.Router.reopen({
  location: 'history',
  rootURL: '/'
});

App.Router.map(function() { 
    this.route("search", { path: "/search" });
    this.resource('compounds');
    this.resource('compound', { path: '/compounds/:compound_id' }, function() {
        this.resource('compound.pharmacology', { path: '/pharmacology' }, function(){});
        this.resource('compound.structure', { path: '/structure' }, function(){});
        this.resource('compound.pathways', { path: '/pathways' }, function(){});
    });
    this.resource('targets'); 
    this.resource('target', { path: '/targets/:target_id' }, function() {
        this.resource('target.pharmacology', { path: '/pharmacology' }, function(){});
        this.resource('target.pathways', { path: '/pathways' }, function(){});
    });
    this.resource('enzymes'); 
    this.resource('enzyme', { path: '/enzymes/:enzyme_id' }, function() {
        this.resource('enzyme.pharmacology', { path: '/pharmacology' }, function(){});
    });
    this.resource('pathways');
    this.resource('pathway', { path: '/pathways/:pathway_id' });
});

App.CompoundIndexRoute = Ember.Route.extend({
  model: function(params) {
    return this.modelFor('compound');
  }
});

App.CompoundPharmacologyIndexRoute = Ember.Route.extend({

  setupController: function(controller, compound) {
    controller.set('content', compound);
      var thisCompound = compound;
      var searcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);
      var pharmaCallback=function(success, status, response){
        if (success && response) {
          var pharmaResults = searcher.parseCompoundPharmacologyResponse(response);
          $.each(pharmaResults, function(index, pharma) {
            var pharmaRecord = App.CompoundPharmacology.createRecord(pharma);
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

App.CompoundPathwaysIndexRoute = Ember.Route.extend({

  setupController: function(controller, compound) {
    controller.set('content', compound);
      var thisCompound = compound;
      var searcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
      var pathwaysByCompoundCallback=function(success, status, response){
        if (success && response) {
          var pathwayResults = searcher.parseByCompoundResponse(response);
          $.each(pathwayResults, function(index, pathwayResult) {
            var pathwayRecord = App.Pathway.createRecord(pathwayResult);
            pathwayRecord.set("id", pathwayResult.identifier.split('/').pop());
	        thisCompound.get('pathways').pushObject(pathwayRecord);        
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

App.TargetIndexRoute = Ember.Route.extend({
  model: function(params) {
    return this.modelFor('target');
  }
});

App.TargetPharmacologyIndexRoute = Ember.Route.extend({

  setupController: function(controller, target) {
    console.log('target index route setup controller');
    controller.set('content', target);
      var thisTarget = target;
      var searcher = new Openphacts.TargetSearch(ldaBaseUrl, appID, appKey);
      var pharmaCallback=function(success, status, response){
      if (success && response) {
        var pharmaResults = searcher.parseTargetPharmacologyResponse(response);
        $.each(pharmaResults, function(index, pharma) {
          var pharmaRecord = App.TargetPharmacology.createRecord(pharma);
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
				    var enzyme = App.Enzyme.createRecord(enzymeResult);
				    controller.addObject(enzyme);				    
			    });
			}
		}
	    searcher.getClassificationRootClasses(callback);
   }	
});

App.EnzymeIndexRoute = Ember.Route.extend({
  model: function(params) {
    return this.modelFor('enzyme');
  }
});

App.EnzymePharmacologyIndexRoute = Ember.Route.extend({

  setupController: function(controller, enzyme) {
    console.log('enzyme index route setup controller');
    controller.set('content', enzyme);
      var thisEnzyme = enzyme;
      var searcher = new Openphacts.EnzymeSearch(ldaBaseUrl, appID, appKey);
      var pharmaCallback=function(success, status, response){
      if (success && response) {
        var pharmaResults = searcher.parsePharmacologyPaginated(response);
        $.each(pharmaResults, function(index, pharma) {
          var pharmaRecord = App.EnzymePharmacology.createRecord(pharma);
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

App.IndexRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    App.searchController.set('query', '');
  }
});

App.PathwayIndexRoute = Ember.Route.extend({
  model: function(params) {
    console.log('pathway index');
    return this.modelFor('pathway');
  }
});
