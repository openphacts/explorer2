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
                 var mapSearcher = new Openphacts.MapSearch(ldaBaseUrl, appID, appKey);
	             var mapURLCallback = function(success, status, response) {
	               var constants = new Openphacts.Constants();
	               if (success && response) {
		               var matchingURL = null;
		               var urls = mapSearcher.parseMapURLResponse(response);
                       var found = false;
                       //loop through all the identifiers for a compound until we find the cw one
		               $.each(urls, function(i, url) {
		                 var uri = new URI(url);
		                 if (!found && constants.SRC_CLS_MAPPINGS['http://' + uri.hostname()] == 'conceptWikiValue') {
                             me.get('store').find('compound', url.split('/').pop()).then(function(compound) {
		                       thisCompound.get('structure').pushObject(compound);
                             });
                            found = true;
		                 }
                       });	
	               }
	             };
                 mapSearcher.mapURL(result.csURI, null, null, null, mapURLCallback);
             } else if (type == "similarity") {
                 results = searcher.parseSimilarityResponse(response);
                 $.each(results, function(index, result) {
                   var about = result.about;
                   var relevance = result.relevance;
	               var mapSearcher = new Openphacts.MapSearch(ldaBaseUrl, appID, appKey);
	               var mapURLCallback = function(success, status, response) {
	                 var constants = new Openphacts.Constants();
	                 if (success && response) {
		                 var matchingURL = null;
		                 var urls = mapSearcher.parseMapURLResponse(response);
                         var found = false;
                         //loop through all the identifiers for a compound until we find the cw one
		                 $.each(urls, function(i, url) {
		                   var uri = new URI(url);
		                   if (!found && constants.SRC_CLS_MAPPINGS['http://' + uri.hostname()] == 'conceptWikiValue') {
                               me.get('store').find('compound', url.split('/').pop()).then(function(compound) {
                                 compound.set('relevance', relevance);
		                         thisCompound.get('structure').pushObject(compound);
                               });
                              found = true;
		                   }
                         });	
	                 }
	               };
                   mapSearcher.mapURL(about, null, null, null, mapURLCallback);
                 });
             } else if (type == "substructure") {
                 results = searcher.parseSubstructureResponse(response);
                 $.each(results, function(index, result) {
                   var about = result.about;
                   var relevance = result.relevance;
	               var mapSearcher = new Openphacts.MapSearch(ldaBaseUrl, appID, appKey);
	               var mapURLCallback = function(success, status, response) {
	                 var constants = new Openphacts.Constants();
	                 if (success && response) {
		                 var matchingURL = null;
		                 var urls = mapSearcher.parseMapURLResponse(response);
                         var found = false;
                         //loop through all the identifiers for a compound until we find the cw one
		                 $.each(urls, function(i, url) {
		                   var uri = new URI(url);
		                   if (!found && constants.SRC_CLS_MAPPINGS['http://' + uri.hostname()] == 'conceptWikiValue') {
                               me.get('store').find('compound', url.split('/').pop()).then(function(compound) {
                                 compound.set('relevance', relevance);
		                         thisCompound.get('structure').pushObject(compound);
                               });
                              found = true;
		                   }
                         });	
	                 }
	               };
                   mapSearcher.mapURL(about, null, null, null, mapURLCallback);
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
