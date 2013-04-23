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
        var cwCompoundCallback=function(success, status, response){
            if(success) {
                var results = searcher.parseResponse(response);
                $.each(results, function(index, result) {
                    var compoundSearcher = new Openphacts.CompoundSearch(ldaBaseUrl);  
                    var compoundCallback=function(success, status, response){
                        var compound = compoundSearcher.parseCompoundResponse(response);
                        !compound.prefLabel ? compound.prefLabel = result.prefLabel : '';  
                        compound.prefLabel.toLowerCase() === q.toLowerCase() ? compound['exactMatch'] = true : compound['exactMatch'] = false;
                        this_compound = App.Compound.createRecord(compound);
                        if (this_compound.get('exactMatch')) {
                            me.addExactMatch(this_compound);
                        } else {
                           me.addSearchResult(this_compound);
                        }
                    };    
                    compoundSearcher.fetchCompound(appID, appKey, result.uri, compoundCallback);
                });
            } else {
                // an error in the response, ignore for now
            }
            me.set('isSearching', false);
            pageScrolling = false;
            enable_scroll();
        }; 
        var cwTargetCallback=function(success, status, response){
            if(success) {
                var results = searcher.parseResponse(response);
                $.each(results, function(index, result) {
                    var targetSearcher = new Openphacts.TargetSearch(ldaBaseUrl);  
                    var targetCallback=function(success, status, response){
                        var target = targetSearcher.parseTargetResponse(response);
                        !target.description ? target.description = result.prefLabel : ''; 
                        target.description.toLowerCase() === q.toLowerCase() ? target['exactMatch'] = true : target['exactMatch'] = false;
                        this_target = App.Target.createRecord(target);
                        if (this_target.get('exactMatch')) {
                            me.addExactMatch(this_target);
                        } else {
                            me.addSearchResult(this_target);
                        }
                    };    
                    targetSearcher.fetchTarget(appID, appKey, result.uri, targetCallback);
                });
            } else {
                // an error in the response, ignore for now
            }
            me.set('isSearching', false);
            pageScrolling = false;
            enable_scroll();
        };  
        //targets
        searcher.byTag(appID, appKey, q, '20', '3', 'eeaec894-d856-4106-9fa1-662b1dc6c6f1', cwTargetCallback);
        //compounds
        searcher.byTag(appID, appKey, q, '20', '4', '07a84994-e464-4bbf-812a-a4b96fa3d197', cwCompoundCallback);
   }
});
