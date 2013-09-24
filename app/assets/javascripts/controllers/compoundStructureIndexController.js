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
              results = searcher.parseSimilarityResponse(response);
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
                var compound = App.Compound.createRecord();
                var callback=function(success, status, response){  
                  var compoundResult = searcher.parseCompoundResponse(response); 
                  compound.set("id", compoundResult.cwURI.split("/").pop());
                  compound.setProperties(compoundResult);
                  thisCompound.get('structure').pushObject(pharmaRecord)
                }
                me.fetchCompound(result);
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
        }; 
    }
  },
 // }
  fetchCompound: function(compoundURI, calllback) {
    console.log('fetch compound: ' + compoundURI);
    var searcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);   
    searcher.fetchCompound(compoundURI, callback);
  }


});
