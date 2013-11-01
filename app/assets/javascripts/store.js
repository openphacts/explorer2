//App.Store = DS.Store.extend({
//  revision: 12,
//  adapter: DS.RESTAdapter.create({
//    bulkCommit: false
//  })
//});

//window.attr = DS.attr;
App.CompoundAdapter = DS.Adapter.extend({
  find: function(store, type, id) {
    // return a promise inside of which is the callback which either resolves with the retrieved compound data or rejects with the status
    var promise = new Ember.RSVP.Promise(function(resolve, reject){
      var searcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);
      var pathwaysSearcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
      // get the compound details  
	  var callback=function(success, status, response){  
        if (success) {
	        var compoundResult = searcher.parseCompoundResponse(response);
            compoundResult['pathways'] = [];
            resolve(compoundResult);
        } else {
            reject(status);
        }
      }
	  searcher.fetchCompound('http://www.conceptwiki.org/concept/' + id, null, callback);
    });
    return promise;
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
    var promise = new Ember.RSVP.Promise(function(resolve, reject){
      var searcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
      var pathwayInfoCallback=function(success, status, response){
        if (success && response) {
            // we have the pathway so now  find all the compounds and add ids for lazy loading
          var pathwayResult = searcher.parseInformationResponse(response);
          pathwayResult['id'] = identifier;
          pathwayResult['compounds'] = [];
          resolve(pathwayResult);
        } else {
          reject(status);
        }
      };
      searcher.information('http://identifiers.org/wikipathways/' + id, null, pathwayInfoCallback);
    });
    return promise;
  }
});
App.EnzymeAdapter = DS.Adapter.extend({
  find: function(store, type, id) {
    console.log('enzyme adapter find');
    var identifier = id;
    var promise = new Ember.RSVP.Promise(function(resolve, reject){
      var searcher = new Openphacts.TreeSearch(ldaBaseUrl, appID, appKey);
      var parentCallback=function(success, status, response){
        if (success && response) {
		  enzymeResult = searcher.parseParentNodes(response);
		  var enzymeResponse = {};
		  enzymeResponse['id'] = id;
		  enzymeResponse['uri'] = 'http://purl.uniprot.org/enzyme/' + id;
		  enzymeResponse['name'] = enzymeResult.label;
          resolve(enzymeResponse);
        } else {
          reject(status);
        }
      };
      var childCallback=function(success, status, response){
        if (success && response) {
		  var enzymeResponse = {};
		  enzymeResponse['id'] = id;
		  enzymeResponse['uri'] = 'http://purl.uniprot.org/enzyme/' + id;
		  enzymeResponse['name'] = enzymeResult.label;
          resolve(enzymeResponse);
        } else {
          reject(status);
        }
      };

      if ((id.match(/-$/))) {
		searcher.getChildNodes('http://purl.uniprot.org/enzyme/' + id, parentCallback);	
      } else {
		searcher.getParentNodes('http://purl.uniprot.org/enzyme/' + id, parentCallback);	
      }
    });
    return promise;	
  }		
});