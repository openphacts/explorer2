App.Target = App.SearchResult.extend({
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
    isCompound: false
});
App.Target.reopenClass({
    find: function(uri) {
        // use the lda api to fetch compounds rather than the default behaviour of rails side
        var target = App.Target.createRecord();
        var targetSearcher = new Openphacts.TargetSearch(ldaBaseUrl);
        var callback=function(success, status, response){  
            var targetResult = targetSearcher.parseTargetResponse(response);
            target.setProperties(targetResult);
            if (!target.description) {
	            // the ops lda target response has no description so try concept wiki
				var cwSearcher = new Openphacts.ConceptWikiSearch(ldaBaseUrl);
				var callback=function(success, status, response){
				    var findConceptResult = cwSearcher.parseFindConceptResponse(response);
				    target.set("description", findConceptResult.prefLabel);
				};
				cwSearcher.findConcept(appID, appKey, target.id, callback);
            }
            return target;
        };  
        targetSearcher.fetchTarget(appID, appKey, 'http://www.conceptwiki.org/concept/' + uri, callback);
        target.set("id", uri);
        return target;
    }
});
