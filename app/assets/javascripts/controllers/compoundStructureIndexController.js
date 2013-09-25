App.CompoundStructureIndexController = Ember.ObjectController.extend({

  needs: "compound",
  structureSearchType: "exact",

 //The ember docs now say that actions should be inside an action hash but this does not work depending
 //on what version of ember you are using - TODO upgrade required
 // actions: {
  structureSearch: function(type) {
    console.log("Set structure search type: " + type);
    this.set('structureSearchType', type);
    var me = this;
    var thisCompound = this.get('content');
    var searcher = new Openphacts.StructureSearch(ldaBaseUrl, appID, appKey);
    var compoundSearcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);   
    var callback=function(success, status, response){
      if (success && response) {
          var results = null;
          if (type == "exact") {
              results = compoundSearcher.parseExactResponse(response);
              $.each(results, function(index, pharma) {
                // fetch each compound and add to records
                //var structureRecord = App.CompoundStructure.createRecord(pharma);
                //thisCompound.get('structure').pushObject(pharmaRecord);
              });
          } else if (type == "similarity") {
              results = compoundSearcher.parseSimilarityResponse(response);
              $.each(results, function(index, pharma) {
                // fetch each compound and add to records
                //var structureRecord = App.CompoundStructure.createRecord(pharma);
                //thisCompound.get('structure').pushObject(pharmaRecord);
              });
              // fetch each compound and add to records
              //var structureRecord = App.CompoundStructure.createRecord(pharma);
	          //thisCompound.get('structure').pushObject(pharmaRecord);
          } else if (type == "substructure") {
              results = searcher.parseSubstructureResponse(response);
              $.each(results, function(index, result) {
                var callback=function(success, status, response){ 
                  var compound = App.Compound.createRecord(); 
                  var csURI = response["_about"];
                  var compoundResult = compoundSearcher.parseCompoundResponse(response); 
                  //compound.set("id", compoundResult.id);
                  compoundResult.csUri = csURI;
                  compound.setProperties(compoundResult);
                  thisCompound.get('structure').pushObject(compound)
                }
                compoundSearcher.fetchCompound(result, callback);
              });
          }
      }
    };
    if (type == "exact") {
        searcher.exact(thisCompound.get('smiles'), null, null, null, null, callback);
    } else if (type == "similarity") {
        // TODO fix start and count at 1 and 100 for the moment
        searcher.similarity(thisCompound.get('smiles'), null, null, 100, null, null, callback);
    } else if (type == "substructure") {
        // TODO fix start and count at 1 and 100 for the moment
        searcher.substructure(thisCompound.get('smiles'), 100, null, null, callback);
    }
  }
 // }
});
