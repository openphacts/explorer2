App.searchController = Ember.ArrayController.create({

    isSearching: false,

    currentPage: 0,

    total_results: 0,

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
    },

    getCurrentQuery: function() {
        return this.current_query;
    },

    resetPageCount: function(query) {
        this.total_results = 0;
        this.currentPage = 0;
        //this.search(query);
        this.set('query', query);
        this.conceptWikiSearch(query);
        App.Router.router.transitionTo('search');
    },

    conceptWikiSearch: function(query) {
        var me = this;
        var q = query;

        this.set('isSearching', true);
        this.set('content', []);
        var searcher = new Openphacts.ConceptWikiSearch(ldaBaseUrl, appID, appKey); 
	var cwCompoundCallback=function(success, status, response){
            if(success && response) {
                var results = searcher.parseResponse(response);
                $.each(results, function(index, result) {
                    var this_compound = App.Compound.find(result.uri.split('/').pop());
                    this_compound.on('didLoad', function() {
		        if (this.get('prefLabel') != null && this.get('prefLabel').toLowerCase() === q.toLowerCase()) {
                            this.set('exactMatch', true);
      			    me.addExactMatch(this);
                        } else {
                            me.addSearchResult(this);
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
                    var this_target = App.Target.find(result.uri.split('/').pop());
                    this_target.on('didLoad', function() {
			var that_target = this;
                        if (this.get('description') === null) {
                            var targetCallback=function(success, status, response){  
                                var description = searcher.parseFindConceptResponse(response).prefLabel;
                                if (description) {
                                    that_target.set('description', description);
                                    if(description.toLowerCase() === q.toLowerCase()) {
                                        that_target.set('exactMatch', true);
	                                me.addExactMatch(that_target);
                                    } else {
                                        me.addSearchResult(that_target);
                                    }
                                }
                            };  
                            searcher.findConcept(that_target.id, targetCallback);
                        } else {
                            if (this.get('description') !== null && this.get('description').toLowerCase() === q.toLowerCase()) {
		                this.set('exactMatch', true);
			        me.addExactMatch(this);
			    } else {
			        me.addSearchResult(this);
			    }
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
        //targets
        searcher.byTag(q, '20', '3', 'eeaec894-d856-4106-9fa1-662b1dc6c6f1', cwTargetCallback);
        //compounds
        searcher.byTag(q, '20', '4', '07a84994-e464-4bbf-812a-a4b96fa3d197', cwCompoundCallback);
   }
});
