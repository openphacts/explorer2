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
    inchiKey: DS.attr('string'),
    logp: DS.attr('string'),
    molform: DS.attr('string'),
    mwFreebase: DS.attr('string'),
    psa: DS.attr('string'),
    ro5Violations: DS.attr('string'),
    rtb: DS.attr('string'),
    pharmacology: DS.hasMany('App.CompoundPharmacology'),
    pharmacologyRecords: DS.attr('number'),
    structure: DS.hasMany('App.CompoundStructure'),
    isCompound: true
});
App.Compound.reopenClass({
    find: function(uri) {
        var compound = App.Compound.createRecord();
        // use the lda api to fetch compounds rather than the default behaviour of rails side
        var searcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);  
        var callback=function(success, status, response){  
            var compoundResult = searcher.parseCompoundResponse(response); 
            compound.setProperties(compoundResult);
	    compound.trigger('didLoad');
        };  
        searcher.fetchCompound('http://www.conceptwiki.org/concept/' + uri, callback);
        compound.set("id", uri);
//        var pharmaCallback=function(success, status, response){
//            var pharmaResults = searcher.parseCompoundPharmacologyResponse(response);
//	    $.each(pharmaResults, function(index, pharma) {
//                var pharmaRecord = App.CompoundPharmacology.createRecord(pharma);
//	        compound.get('pharmacology').pushObject(pharmaRecord);
//	    });
//        };
//        searcher.compoundPharmacology('http://www.conceptwiki.org/concept/' + uri, 1, 50, pharmaCallback);
        console.log('compound load');
        return compound;
    }
});
