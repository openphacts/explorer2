App.CompoundsStructureController = Ember.ObjectController.extend({

  structureSearchType: "exact",

  page: null,

  currentCount: function() {
    return this.get('model.structure.length');
  }.property('model.structure.length'),

  totalCount: null,

  fetching: false,

  notEmpty: function() {
    return this.get('totalCount') > 0;
  }.property('totalCount'),

  exactSearch: function() {
    return this.get('structureSearchType') === "exact";
  }.property('structureSearchType'),

  subSearch: function() {
    return this.get('structureSearchType') === "substructure";
  }.property('structureSearchType'),

  simSearch: function() {
    return this.get('structureSearchType') === "similarity";
  }.property('structureSearchType'),

  actions: {
     structureSearchType: function(type) {
       console.log("Set structure search type: " + type);
       this.set('structureSearchType', type);
       var me = this;
       var thisCompound = this.get('content');
       thisCompound.get('structure').clear();
       var searcher = new Openphacts.StructureSearch(ldaBaseUrl, appID, appKey);
       var callback=function(success, status, response){
         if (success && response) {
            me.set('fetching', false);
             var results = null;
             if (type == "exact") {
                 results = searcher.parseExactResponse(response);
                 me.set('totalCount', results.length);
                 $.each(results, function(index, result) {
                   me.get('store').find('compound', result).then(function(compound) {
		               thisCompound.get('structure').pushObject(compound);
                   });
                 });
             } else if (type == "similarity") {
                 results = searcher.parseSimilarityResponse(response);
                 me.set('totalCount', results.length);
                 var relevance = {};
                 $.each(results, function(index, result) {
                   var about = result.about;
                   var relVal = result.relevance;
                   relevance[about] = relVal;
                   me.get('store').find('compound', about).then(function(compound) {
		               thisCompound.get('structure').pushObject(compound);
                   });
                 }); 
             } else if (type == "substructure") {
                 results = searcher.parseSubstructureResponse(response);
                 me.set('totalCount', results.length);
                 var relevance = {};
                 $.each(results, function(index, result) {
                   var about = result.about;
                   var relVal = result.relevance;
                   relevance[about] = relVal;
                   me.get('store').find('compound', about).then(function(compound) {
		               thisCompound.get('structure').pushObject(compound);
                   });
                 });
             }
         }
       };
       if (type == "exact") {
           this.set('fetching', true);
           searcher.exact(thisCompound.get('smiles'), null, callback);
       } else if (type == "similarity") {
           this.set('fetching', true);
           // TODO fix start and count at 1 and 100 for the moment
           searcher.similarity(thisCompound.get('smiles'), null, null, null, null, 1, 100, callback);
       } else if (type == "substructure") {
           this.set('fetching', true);
           // TODO fix start and count at 1 and 100 for the moment
           searcher.substructure(thisCompound.get('smiles'), null, 1, 100, callback);
       }
     },

     fetchMore: function() {
       console.log('fetch more structures');
     }
  }
});
