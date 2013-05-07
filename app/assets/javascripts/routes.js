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
    });
    this.resource('targets'); 
    this.resource('target', { path: '/targets/:target_id' }, function() {
        this.resource('target.pharmacology', { path: '/pharmacology' }, function(){});
    });
});

App.CompoundIndexRoute = Ember.Route.extend({
  model: function(params) {
    return this.modelFor('compound');
  }
});

App.CompoundPharmacologyRoute = Ember.Route.extend({
	
//  setupController: function(controller, compoundPharmacology) {
//      console.log('comp pharma route setup controller');
//      controller.set('content', compoundPharmacology);
//  },

  model: function(params) {
    console.log('comp pharma route');
    return this.modelFor('compound');
  }
});

App.CompoundPharmacologyIndexRoute = Ember.Route.extend({

  setupController: function(controller, compound) {
    console.log('pharma index route setup controller');
      var thisCompound = compound;
      var searcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);
      var pharmaCallback=function(success, status, response){
      var pharmaResults = searcher.parseCompoundPharmacologyResponse(response);
      $.each(pharmaResults, function(index, pharma) {
        var pharmaRecord = App.CompoundPharmacology.createRecord(pharma);
	thisCompound.get('pharmacology').pushObject(pharmaRecord);
      });
    };
    searcher.compoundPharmacology('http://www.conceptwiki.org/concept/' + compound.id, 1, 50, pharmaCallback);
  },
  model: function(params) {
    console.log('comp pharma index route');
    return this.modelFor('compound');
  }

});

App.TargetIndexRoute = Ember.Route.extend({
  model: function(params) {
    return this.modelFor('target');
  }
});

App.TargetPharmacologyRoute = Ember.Route.extend({
  model: function(params) {
    return this.modelFor('target');
  }
});

App.TargetPharmacologyIndexRoute = Ember.Route.extend({

  setupController: function(controller, target) {
    console.log('target index route setup controller');
      var thisTarget = target;
      var searcher = new Openphacts.TargetSearch(ldaBaseUrl, appID, appKey);
      var pharmaCallback=function(success, status, response){
      var pharmaResults = searcher.parseTargetPharmacologyResponse(response);
      $.each(pharmaResults, function(index, pharma) {
        var pharmaRecord = App.TargetPharmacology.createRecord(pharma);
	thisTarget.get('pharmacology').pushObject(pharmaRecord);
      });
    };
    searcher.targetPharmacology('http://www.conceptwiki.org/concept/' + target.id, 1, 50, pharmaCallback);
  },
  model: function(params) {
    console.log('target pharma index route');
    return this.modelFor('target');
  }

});

App.IndexRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    App.searchController.set('query', '');
  }
});
