App.SearchController = Ember.ArrayController.extend({

    needs: 'application',

    isSearching: false,

    currentPage: 0,

    totalResults: 0,

    current_query: '',

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
        this.get('controllers.application').set('searchQuery', query);
    },

    getCurrentQuery: function() {
        return this.current_query;
    },

    resetPageCount: function(query) {
        this.totalResults = 0;
        this.currentPage = 0;
        //this.search(query);
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
                  me.store.find('compound', result.uri.split('/').pop()).then(function(compound) {
                      if (compound.get('prefLabel') != null && compound.get('prefLabel').toLowerCase() === me.getCurrentQuery().toLowerCase()) {
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
        };
        var cwTargetCallback=function(success, status, response){
            if(success && response) {
                var results = searcher.parseResponse(response);
                $.each(results, function(index, result) {
                    //find the target then add to the search results when the 'promise' returns
                    me.store.find('target', result.uri.split('/').pop()).then(function(target) {
                      me.set('totalResults', me.get('totalResults') + 1);
                      me.addSearchResult(target);
					  console.log('target load');
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
