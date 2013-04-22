App.Compound = App.SearchResult.extend({
    cwURI: DS.attr('string'),
    description: DS.attr('string'),
    biotransformationItem: DS.attr('string'),
    toxicity: DS.attr('string'),
    proteinBinding: DS.attr('string'),
    prefLabel: DS.attr('string'),
    exactMatch: DS.attr('boolean'),
    csUri: DS.attr('string'),
    smiles: DS.attr('string'),
    chemblURI: DS.attr('string'),
    fullMWT: DS.attr('string'),
    hba: DS.attr('string'),
    hbd: DS.attr('string'),
    inchi: DS.attr('string'),
    logp: DS.attr('string'),
    molform: DS.attr('string'),
    mwFreebase: DS.attr('string'),
    psa: DS.attr('string'),
    ro5Violations: DS.attr('string'),
    rtb: DS.attr('string'),
    isCompound: true
});
App.Compound.reopenClass({
    find: function(uri) {
        var compound = App.Compound.createRecord();
        // use the lda api to fetch compounds rather than the default behaviour of rails side
        var searcher = new Openphacts.CompoundSearch("https://ops2.few.vu.nl");  
        var callback=function(success, status, response){  
            var compoundResult = searcher.parseCompoundResponse(response); 
            compound.setProperties(compoundResult); 
        };  
        searcher.fetchCompound(appID, appKey, 'http://www.conceptwiki.org/concept/' + uri, callback);
        compound.set("id", uri);
        return compound;
    }
});
