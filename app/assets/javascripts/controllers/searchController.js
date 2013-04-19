App.searchController = Ember.ArrayController.create({

    isSearching: false,

    currentPage: 0,

    total_results: 0,

    current_query: '',

    query: '',

  contract: function() {
    this.set('isExpanded', false);
  },

    setCurrentQuery: function(query) {
        this.current_query=query;
    },

    getCurrentQuery: function() {
        return this.current_query;
    },

    parseSolrResponse: function(response) {
        var results = {};
        this.total_results = response.response.numFound;
        $.each(response.response.docs, function(i, doc) {
            var result = {};
            var id = doc.id;
            result["uri"] = doc.cw_uri[0];
            result["label"] = doc.prefLabel[0];
            result["biotrans"] = doc.db_biotran[0];
            result["description"] = doc.db_description[0];
            results[id] = result;
        });
        return results;
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
        var searcher = new Openphacts.ConceptWikiSearch(ldaBaseUrl); 
        var callback=function(success, status, response){
            if(success) {
                var results = searcher.parseResponse(response);
                $.each(results, function(index, compoundURI) {
                    var compoundSearcher = new Openphacts.CompoundSearch(ldaBaseUrl);  
                    var compoundCallback=function(success, status, response){
                        var compound = compoundSearcher.parseCompoundResponse(response); 
                        compound.prefLabel.toLowerCase() === q.toLowerCase() ? compound['exactMatch'] = true : compound['exactMatch'] = false;
                        this_compound = App.Compound.createRecord(compound);
                        if (this_compound.get('prefLabel').toLowerCase() === q.toLowerCase()) {
                            App.compoundsController.addExactMatch(this_compound);
                        } else {
                           App.compoundsController.addCompound(this_compound);
                        }
                    };    
                    compoundSearcher.fetchCompound(appID, appKey, compoundURI, compoundCallback);
                });
            } else {
                // an error in the response, ignore for now
            }
            me.set('isSearching', false);
            pageScrolling = false;
            enable_scroll();
        };  
        searcher.byTag(appID, appKey, 'Aspirin', '20', '4', '07a84994-e464-4bbf-812a-a4b96fa3d197', callback);
   }
});
