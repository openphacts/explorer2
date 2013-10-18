//App.Store = DS.Store.extend({
//  revision: 12,
//  adapter: DS.RESTAdapter.create({
//    bulkCommit: false
//  })
//});

//window.attr = DS.attr;
App.CompoundAdapter = DS.Adapter.extend({
  find: function(store, type, id) {
    // return a promise inside of which is the callback which either resolves with the retrieved data or rejects with the status
    return new Ember.RSVP.Promise(function(resolve, reject){
      var searcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);
      var pathwaysSearcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
      // get the compound details  
	  var callback=function(success, status, response){  
        if (success) {
            //get the pathways for the compound
            var pathwaysByCompoundCallback=function(success, status, response){
              if (success && response) {
                  var pathwayResults = pathwaysSearcher.parseByCompoundResponse(response);
                  $.each(pathwayResults, function(index, pathwayResult) {
                    pathwayID = pathwayResult.identifier.split('/').pop();
                    //load the ids of the pathways, the compound model will lazy load it
                    compoundResult['pathways'].push(pathwayID);
                    //me.store.find('pathway', pathwayID).then(function(pathway) {
                    //  thisCompound.get('pathways').pushObject(pathway);
                    //});
                  });
                  // all data added so send it back
                  resolve(compoundResult);
              }
            }
	        var compoundResult = searcher.parseCompoundResponse(response);
            compoundResult['pathways'] = [];
            pathwaysSearcher.byCompound('http://www.conceptwiki.org/concept/' + id, null, null, 1, 50, null, pathwaysByCompoundCallback);
        } else {
            reject(status);
        }
      }
	  searcher.fetchCompound('http://www.conceptwiki.org/concept/' + id, null, callback);
    });
  }
});
App.TargetAdapter = DS.Adapter.extend({
  find: function(store, type, id) {
    return new Ember.RSVP.Promise(function(resolve, reject){
      var searcher = new Openphacts.TargetSearch(ldaBaseUrl, appID, appKey);  
	  var callback=function(success, status, response){  
        if (success) {
	        var targetResult = searcher.parseTargetResponse(response); 
            resolve(targetResult);
        } else {
            reject(status);
        }
      }
	  searcher.fetchTarget('http://www.conceptwiki.org/concept/' + id, null, callback);
    });
  }
});
App.PathwayAdapter = DS.Adapter.extend({
  find: function(store, type, id) {
    console.log('pathway adapter find');
    var identifier = id;
    return new Ember.RSVP.Promise(function(resolve, reject){
      var searcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
      var pathwayInfoCallback=function(success, status, response){
        if (success && response) {
            // we have the pathway so now  find all the compounds and add ids for lazy loading
            var getCompoundsCallback=function(success, status, response){
              if (success && response) {
                  var compoundsResult = searcher.parseGetCompoundsResponse(response);
                  $.each(compoundsResult.metabolites, function(index, metabolite) {
                    //load the ids of the pathways, the compound model will lazy load it
                    // need to then find the cw id using the mapURL function
                    pathwayResult['compounds'].push(metabolite);
                  });
                  // all data added so send it back
                  resolve(pathwayResult);
              }
            }
          var pathwayResult = searcher.parseInformationResponse(response);
          pathwayResult['id'] = identifier;
          pathwayResult['compounds'] = [];
          searcher.getCompounds('http://identifiers.org/wikipathways/' + id, null, getCompoundsCallback);
        } else {
          reject(status);
        }
      };
      searcher.information('http://identifiers.org/wikipathways/' + id, null, pathwayInfoCallback);
    });
  }
});
