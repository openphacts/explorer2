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
    // after finding the compound, find the pathways
    promise.then(function(data) {
      var pathwaysSearcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
      var pathwaysByCompoundCallback=function(success, status, response){
        if (success && response) {
            var pathwayResults = pathwaysSearcher.parseByCompoundResponse(response);
            $.each(pathwayResults, function(index, pathwayResult) {
              pathwayID = pathwayResult.identifier.split('/').pop();
              //have to find the pathway record and add it, just adding the ID does not work
              data['pathways'].pushObject(store.find('pathway', pathwayID));
            });
        }
      }
      pathwaysSearcher.byCompound('http://www.conceptwiki.org/concept/' + id, null, null, 1, 50, null, pathwaysByCompoundCallback);
      return data;
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
    var alert = {};
    Ember.RSVP.EventTarget.mixin(alert);
      alert.on("finished", function(event) {
        // find the cw url for each compound associated with a pathway
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
                  console.log('compound is ' + url);
				  thisData['compounds'].pushObject(store.find('compound', url.split('/').pop()));
                  found = true;
				}
		      });	
		  }
	    };
        //loop through the url for each compound and fetch all the urls for it from the backend
        $.each(compoundURLs, function(index, URL) {
	      console.log('url is ' + URL);
	      mapSearcher.mapURL(URL, null, null, null, mapURLCallback);
        });
      });
    var compoundURLs = [];
    var thisData = null;
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
    promise.then(function(data){
      thisData = data;
      console.log('compounds by pathway promise');
      var searcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
      var getCompoundsCallback=function(success, status, response){
        if (success && response) {
            var compoundsResult = searcher.parseGetCompoundsResponse(response);
            $.each(compoundsResult.metabolites, function(index, metabolite) {
              //load the ids of the pathways, the compound model will lazy load it
              // need to then find the cw id using the mapURL function
              compoundURLs.push(metabolite);
              //data['compounds'].pushObject(store.find('compound', '83931753-9e3f-4e90-b104-e3bcd0b4d833'));
              //data['compounds'].pushObject(store.find('compound', '5a814fb1-403a-4dab-8190-b7e6db7b4432'));
              //data['compounds'].push(metabolite);
            });
            //we now have all the compound urls for this pathway although they are probably not the cw one so call the trigger
            alert.trigger('finished');
        }
        return data;
      }
      searcher.getCompounds('http://identifiers.org/wikipathways/' + id, null, getCompoundsCallback);
    });
//    promise.then(function(data) {
//      alert.on("finished", function(event) {
//        // find the cw url for each compound associated with a pathway
//	    var mapSearcher = new Openphacts.MapSearch(ldaBaseUrl, appID, appKey);
//	    var mapURLCallback = function(success, status, response) {
//		  var constants = new Openphacts.Constants();
//		  if (success && response) {
//			  var matchingURL = null;
//		      var urls = mapSearcher.parseMapURLResponse(response);
//              var found = false;
//              //loop through all the identifiers for a compound until we find the cw one
//		      $.each(urls, function(i, url) {
//			    var uri = new URI(url);
//			    if (!found && constants.SRC_CLS_MAPPINGS['http://' + uri.hostname()] == 'conceptWikiValue') {
//                  console.log('compound is ' + url);
//				  data['compounds'].pushObject(store.find('compound', url.split('/').pop()));
//                  found = true;
//				}
//		      });	
//		  }
//	    };
//        //loop through the url for each compound and fetch all the urls for it from the backend
//        $.each(compoundURLs, function(index, URL) {
//	      console.log('url is ' + URL);
//	      mapSearcher.mapURL(URL, null, null, null, mapURLCallback);
//        });
//      });
//      return data;
//    });
    return promise;
  }
});
