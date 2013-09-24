App.CompoundStructureIndexController = Ember.ObjectController.extend({

  needs: "compound",
  structureSearchType: "exact",

 //The ember docs now say that actions should be inside an action hash but this does not work depending
 //on what version of ember you are using - TODO upgrade required
 // actions: {
  structureSearchType: function(type) {
    console.log("Set structure search type: " + type);
    this.set('structureSearchType', type);
    var me = this;
    var thisCompound = this.get('content');
    var searcher = new Openphacts.StructureSearch(ldaBaseUrl, appID, appKey);
    var callback=function(success, status, response){
      if (success && response) {
          var results = null;
          if (type == "exact") {
              results = searcher.parseExactResponse(response);
              $.each(results, function(index, pharma) {
                // fetch each compound and add to records
                //var structureRecord = App.CompoundStructure.createRecord(pharma);
                //thisCompound.get('structure').pushObject(pharmaRecord);
              });
          } else if (type == "similarity") {
              // fetch each compound and add to records
              //var structureRecord = App.CompoundStructure.createRecord(pharma);
	          //thisCompound.get('structure').pushObject(pharmaRecord);
          } else if (type == "substructure") {
              // fetch each compound and add to records
              //var structureRecord = App.CompoundStructure.createRecord(pharma);
	          //thisCompound.get('structure').pushObject(pharmaRecord);
          }
      }
    };
    if (type == "exact") {
        searcher.exact(thisCompound.smiles, null, null, null, null, callback);
    } else if (type == "similarity") {
        searcher.similarity(thisCompound.smiles, null, null, null, null, 1, 100, callback);
    } else if (type == "substructure") {
        searcher.substructure(thisCompound.smiles, null, null, null, callback);
    }
  }
 // }
});
