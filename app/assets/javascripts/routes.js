// If you want your urls to look www.yourapp.org/x instead of www.yourapp.org/#/x
// you have to set location to 'history'. This means that you must also tell rails
// what your routes are and to redirect them to whatever template contains the ember
// outlet
App.Router.reopen({
  location: 'history',
  rootURL: '/'
});

App.Router.map(function() { 
    this.route("search", { path: "/search/:query" }, function() {

    });
    this.resource('compounds', { path: '/compounds' }, function() {});
    this.resource('compound', { path: '/compounds/:compound_id' }, function() {
        this.resource('compound.pharmacology', { path: '/pharmacology' }, function(){});
//        this.resource('compound.structure', { path: '/structure' }, function(){});
//        this.resource('compound.pathways', { path: '/pathways' }, function(){});
    });
//    this.resource('targets', {}, function() {}); 
//    this.resource('target', { path: '/targets/:target_id' }, function() {
//        this.resource('target.pharmacology', { path: '/pharmacology' }, function(){});
//        this.resource('target.pathways', { path: '/pathways' }, function(){});
//    });
//    this.resource('enzymes'); 
//    this.resource('enzyme', { path: '/enzymes/:enzyme_id' }, function() {
//        this.resource('enzyme.pharmacology', { path: '/pharmacology' }, function(){});
//    });
//    this.resource('pathways');
//    this.resource('pathway', { path: '/pathways/:pathway_id' }, function() {
//    });
});

App.SearchRoute = Ember.Route.extend({

  setupController: function(controller) {
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
                    var compound = controller.store.find('compound', result.uri.split('/').pop());
                    //if (compoundResult.prefLabel != null && compoundResult.prefLabel.toLowerCase() === currentQuery.toLowerCase()) {
                    //    compound.set('exactMatch', true);
      			    //    me.addExactMatch(compound);
                        me.set('totalResults', me.get('totalResults') + 1);
                    //} else {
                        me.addSearchResult(compound);
                    //    me.set('totalResults', me.get('totalResults') + 1);
                    //} 
					console.log('compound load');
                });
            } else {
                // an error in the response, ignore for now
            }
            me.set('isSearching', false);
            pageScrolling = false;
            enable_scroll();
        };
//        var cwTargetCallback=function(success, status, response){
//            if(success && response) {
//                var results = searcher.parseResponse(response);
//                $.each(results, function(index, result) {
//                    var uuid = result.uri.split('/').pop();
//	                //var compound = controller.store.createRecord('compound', {id: uuid});
//                    controller.store.push('target', {id: uuid});
//                    var target = controller.store.find('target', uuid);
//					//var compound = me.store.find('compound', {});
//					        // use the lda api to fetch compounds rather than the default behaviour of rails side
//					        var searcher = new Openphacts.TargetSearch(ldaBaseUrl, appID, appKey);  
//					        var callback=function(success, status, response){  
//					          var targetResult = searcher.parseTargetResponse(response); 
//					          target.setProperties(targetResult);
//                              me.addSearchResult(target);
//                              me.set('totalResults', me.get('totalResults') + 1);
//					        };
//					        searcher.fetchTarget(result.uri, null, callback);
//					        console.log('target load');
//                });
//            } else {
//                // an error in the response, ignore for now
//            }
//            me.set('isSearching', false);
//           pageScrolling = false;
//            enable_scroll();
//        }; 
//        //targets
//        searcher.byTag(controller.getCurrentQuery(), '20', '3', 'eeaec894-d856-4106-9fa1-662b1dc6c6f1', cwTargetCallback);
        searcher.byTag(controller.getCurrentQuery(), '20', '4', '07a84994-e464-4bbf-812a-a4b96fa3d197', cwCompoundCallback);
  },

  model: function(params) {
    console.log('search route model');
    this.controllerFor('search').setCurrentQuery(params.query);
    return [];	
  }
	
});

App.CompoundIndexRoute = Ember.Route.extend({
	
  setupController: function(controller, model) {
    console.log('compound index controller');	
  },

  model: function(params) {
	console.log('compound index compound')
	//var compound = controller.store.createRecord('compound', {id: params.compound_id});
    //return compound;
    return this.modelFor('compound');
 }
});

App.CompoundRoute = Ember.Route.extend({
	
  setupController: function(controller, model) {
    console.log('compound index controller');	
  },

  model: function(params) {
	console.log('compound index compound')
	//var compound = controller.store.createRecord('compound', {id: params.compound_id});
    //return compound;
    return this.modelFor('compound');
 }
});

App.IndexRoute = Ember.Route.extend({
	// actions: {
	// query: function() {
	// 	console.log('query');
	// 	var query = this.get('search');
	// 	this.transitionTo('search/' + query);
	//     }
// },
  setupController: function(controller, model) {
    //App.searchController.set('query', '');
  }
});
