App.CompoundStructureIndexController = Ember.ArrayController.extend({

  needs: "compound",
  structureSearchType: "exact",

 actions: {
     structureSearchType: function(type) {
       console.log("Set structure search type: " + type);
       this.set('structureSearchType', type);
       var me = this;
       var thisCompound = this.get('controllers.compound').get('content');
       thisCompound.get('structure').clear();
       var searcher = new Openphacts.StructureSearch(ldaBaseUrl, appID, appKey);
       var callback=function(success, status, response){
         if (success && response) {
             var results = null;
             if (type == "exact") {
                 result = searcher.parseExactResponse(response);
                 var structureRecord = me.get('store').createRecord('compoundStructure', result);
                 thisCompound.get('structure').pushObject(structureRecord);
             } else if (type == "similarity") {
                 results = searcher.parseSimilarityResponse(response);
                 $.each(results, function(index, result) {
                   var structureRecord = me.get('store').createRecord('compoundStructure', result);
                   thisCompound.get('structure').pushObject(structureRecord);
                 });
             } else if (type == "substructure") {
                 results = searcher.parseSubstructureResponse(response);
                 $.each(results, function(index, result) {
                   var structureRecord = me.get('store').createRecord('compoundStructure', result);
                   thisCompound.get('structure').pushObject(structureRecord);
                 });
             }
         }
       };
       if (type == "exact") {
           searcher.exact(thisCompound.get('smiles'), null, callback);
       } else if (type == "similarity") {
           // TODO fix start and count at 1 and 100 for the moment
           searcher.similarity(thisCompound.get('smiles'), null, null, null, null, 1, 100, callback);
       } else if (type == "substructure") {
           // TODO fix start and count at 1 and 100 for the moment
           searcher.substructure(thisCompound.get('smiles'), null, 1, 100, callback);
       }
     }
  }
});
