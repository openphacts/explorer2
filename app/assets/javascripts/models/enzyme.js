App.Enzyme = App.SearchResult.extend({
    uri: DS.attr('string'),
    name: DS.attr('string')
});
App.Enzyme.reopenClass({
    find: function(enzymeID) {
        var compound = App.Enzyme.createRecord();
        // use the lda api to fetch enzymes rather than the default behaviour of rails side
        var searcher = new Openphacts.EnzymeSearch('http://beta.openphacts.org', appID, appKey);  
        var callback=function(success, status, response){  
            var enzymeResult = searcher.parseEnzymeResponse(response); 
            enzyme.setProperties(enzymeResult);
	        enzyme.trigger('didLoad');
        };  
        searcher.Enzyme(enzymeID, callback);
        enzyme.set("id", enzymeID);
        return compound;
    }
});
