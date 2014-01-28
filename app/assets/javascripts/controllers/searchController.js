App.SearchController = Ember.ArrayController.extend({

    queryParams: ['query'],

    needs: 'application',

    isSearching: false,

    currentPage: 0,

    totalResults: function() {
      return this.get('model.length');
    }.property('model.length'),

    current_query: '',

    previous_query: null,

    query: '',

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
            if(success && response) {
                var results = searcher.parseResponse(response);
                $.each(results, function(index, result) {
                  //find the compound then check if the preferred label exactly matches the query when it returns from the 'promise'
                  //the promise is generated inside the store adapter for compound, see store.js
                  me.store.find('compound', result.uri).then(function(compound) {
                      if (compound.get('prefLabel') != null && compound.get('prefLabel').toLowerCase() === me.getCurrentQuery().toLowerCase()) {
                          compound.set('exactMatch', true);
      			          me.addExactMatch(compound);
                      } else {
                          me.addSearchResult(compound);
                      } 
                  });
                });
            } else {
                // an error in the response, ignore for now
            }
            me.set('isSearching', false);
        };
        var cwTargetCallback=function(success, status, response){
            if(success && response) {
                var results = searcher.parseResponse(response);
                $.each(results, function(index, result) {
                    //find the target then add to the search results when the 'promise' returns
                    me.store.find('target', result.uri).then(function(target) {
                      if (target.get('prefLabel') != null && target.get('prefLabel').toLowerCase() === me.getCurrentQuery().toLowerCase()) {
                          target.set('exactMatch', true);
                          me.addExactMatch(target);
                      } else {
                          me.addSearchResult(target);
                      }
                    });
                });
            } else {
                // an error in the response, ignore for now
            }
            me.set('isSearching', false);
        }; 
        //targets
          searcher.byTag(me.getCurrentQuery(), '20', '3', 'eeaec894-d856-4106-9fa1-662b1dc6c6f1', cwTargetCallback);
          searcher.byTag(me.getCurrentQuery(), '20', '4', '07a84994-e464-4bbf-812a-a4b96fa3d197', cwCompoundCallback);

   }
});
