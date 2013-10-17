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
	  var callback=function(success, status, response){  
        if (success) {
	        var compoundResult = searcher.parseCompoundResponse(response); 
            resolve(compoundResult);
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
    return new Ember.RSVP.Promise(function(resolve, reject){
      var searcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
      var compoundSearcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);
      var pathwayInfoCallback=function(success, status, response){
        if (success && response) {
          var pathwayResult = searcher.parseInformationResponse(response);
          resolve(pathwayResult);
        } else {
          reject(status);
        }
      };
      searcher.information('http://identifiers.org/wikipathways/' + id, null, pathwayInfoCallback);
    });
  }
});
