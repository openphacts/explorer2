App.Target = App.SearchResult.extend({
    prefLabel: DS.attr('string'),
    exactMatch: DS.attr('boolean'),
    cellularLocation: DS.attr('string'),
    molecularWeight: DS.attr('string'),
    numberOfResidues: DS.attr('string'),
    theoreticalPi: DS.attr('string'),
    drugbankURI: DS.attr('string'),
    description: DS.attr('string'),
    subClassOf: DS.attr('string'),
    keywords: DS.attr('array'),
    functionAnnotation: DS.attr('string'),
    alternativeName: DS.attr('string'),
    existence: DS.attr('string'),
    organism: DS.attr('string'),
    sequence: DS.attr('string'),
    classifiedWith: DS.attr('array'),
    seeAlso: DS.attr('string'),
    pharmacology: DS.hasMany('App.TargetPharmacology'),
    isCompound: false
});
App.Target.reopenClass({
    find: function(uri) {
        // use the lda api to fetch compounds rather than the default behaviour of rails side
        var target = App.Target.createRecord();
        var searcher = new Openphacts.TargetSearch(ldaBaseUrl, appID, appKey);  
        var callback=function(success, status, response){  
            var targetResult = searcher.parseTargetResponse(response); 
            target.setProperties(targetResult);
	    target.trigger('didLoad');
        };  
        searcher.fetchTarget('http://www.conceptwiki.org/concept/' + uri, null, callback);
        target.set("id", uri);
        return target;
    }
});
