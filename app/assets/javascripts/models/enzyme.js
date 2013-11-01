App.Enzyme = App.SearchResult.extend({
    uri: DS.attr('string'),
    name: DS.attr('string'),
    pharmacology: DS.hasMany('enzymePharmacology'),
    pharmacologyRecords: DS.attr('number')
});
App.Enzyme.reopenClass({
    find: function(enzymeID) {
        var enzyme = App.Enzyme.createRecord();
        // use the lda api to fetch enzymes rather than the default behaviour of rails side
        var searcher = new Openphacts.EnzymeSearch('http://beta.openphacts.org', appID, appKey);  
        var callback=function(success, status, response){  
            var enzymeResult = searcher.parseClassificationClass(response); 
            enzyme.setProperties(enzymeResult);
	    enzyme.trigger('didLoad');
        };  
        searcher.getClassificationClass('http://purl.uniprot.org/enzyme/' + enzymeID, callback);
        enzyme.set("id", enzymeID);
        return enzyme;
    }
});
