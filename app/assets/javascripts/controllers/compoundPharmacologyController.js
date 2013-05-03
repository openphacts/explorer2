App.CompoundPharmacologyController = Ember.ObjectController.extend({

  needs: "compound"

//  currentPage: 1,
  
//  pharmacology: [],

//  getPharmacology: function(URI) {
//    console.log('compound pharma controller get pharma: ' + URI);
//    var me = this;
//    var searcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);  
//    var callback=function(success, status, response) {
//      if (success) {
//        var compoundResult = searcher.parseCompoundPharmacologyResponse(response);
//	$.each(compoundResult, function(index, compoundPharma) {
//           me.pharmacology.push(App.CompoundPharmacology.createRecord(compoundPharma));
//	});
//	me.set('currentPage', me.currentPage++);
//      }  	      
//    };  
//    searcher.compoundPharmacology('http://www.conceptwiki.org/concept/' + URI, this.get('currentPage'), 20, callback);
//  }
});
