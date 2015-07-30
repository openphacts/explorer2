App.ExplorerAdapter = DS.RESTAdapter.extend({
//TODO If we ever want to use the JSONAPI style then we may need this	
// Convert the flat response from OPS.js to a JSONAPI version
//    convertJSON: function(id, type, json) {
//       var response = {};
//       response.data = {};
//       response.data.id = id;
//       response.data.type = type;
//       response.data.attributes = {};
//       response.data.relationships = {};
//       Object.keys(json).forEach(function(key, index) {
//           key !== 'id' ? response.data.attributes[key] = json[key] : '';
//       });
//       return response;
//    }
});
App.CompoundAdapter = App.ExplorerAdapter.extend({
    findRecord: function(store, type, id) {
        var compoundResult = {};
	var me = this;
        // return a promise inside of which is the callback which either resolves with the retrieved compound data or rejects with the status
        var promise = new Ember.RSVP.Promise(function(resolve, reject) {
            var searcher = new CompoundSearch(ldaBaseUrl, appID, appKey);
            // get the compound details  
            var callback = function(success, status, response) {
                if (success) {
                    var parsedResult = searcher.parseCompoundResponse(response);
                    compoundResult.compound = parsedResult;
		    compoundResult.compound.pathways = [];
		    //compoundResult = me.convertJSON(id, 'compound', parsedResult);
		    //compoundResult.data.relationships.pathways = {};
		    //compoundResult.data.relationships.pathways.data = []; 
                    Ember.run(function() {
                        resolve(compoundResult)
                    });
                } else {
                    Ember.run(function() {
                        reject({"message": status})
                    });
                }
            }
            searcher.fetchCompound(id, null, callback);
        });
        return promise;
    }
});
App.TargetAdapter = App.ExplorerAdapter.extend({
    findRecord: function(store, type, id) {
	    var targetResult = {};
        return new Ember.RSVP.Promise(function(resolve, reject) {
            var searcher = new TargetSearch(ldaBaseUrl, appID, appKey);
            var callback = function(success, status, response) {
                if (success) {
                    var parsedResult = searcher.parseTargetResponse(response);
                    targetResult.target = parsedResult;
		    targetResult.target.pathways = [];
                    Ember.run(function() {
                        resolve(targetResult)
                    });
                } else {
                    Ember.run(function() {
                        reject({"message": status})
                    });
                }
            }
            searcher.fetchTarget(id, null, callback);
        });
    }
});
App.PathwayAdapter = App.ExplorerAdapter.extend({
    findRecord: function(store, type, id) {
	    var pathwayResult = {};
        console.log('pathway adapter find');
        var identifier = id;
        var promise = new Ember.RSVP.Promise(function(resolve, reject) {
            var searcher = new PathwaySearch(ldaBaseUrl, appID, appKey);
            var pathwayInfoCallback = function(success, status, response) {
                if (success && response) {
                    // we have the pathway so now  find all the compounds and add ids for lazy loading
                    var parsedResult = searcher.parseInformationResponse(response);
                    pathwayResult.pathway = parsedResult;
		    pathwayResult.pathway.id = identifier;
                    pathwayResult.pathway.compounds = [];
                    Ember.run(function() {
                        resolve(pathwayResult)
                    });
                } else {
                    Ember.run(function() {
                        reject({"message": status})
                    });
                }
            };
            searcher.information(id, null, pathwayInfoCallback);
        });
        return promise;
    }
});
App.TreeAdapter = App.ExplorerAdapter.extend({
    findRecord: function(store, type, id) {
        console.log('enzyme adapter find');
        var enzymeResponse = {};
        enzymeResponse.tree = {}
	enzymeResponse.tree.id = id;
        enzymeResponse.tree.uri = id;

        return enzymeResponse;
    }
});
App.DiseaseAdapter = App.ExplorerAdapter.extend({
    findRecord: function(store, type, id) {
        console.log('disease adapter find');
	var diseaseResult = {};
        var identifier = id;
        var promise = new Ember.RSVP.Promise(function(resolve, reject) {
            var searcher = new DiseaseSearch(ldaBaseUrl, appID, appKey);
            var diseaseInfoCallback = function(success, status, response) {
                if (success && response) {
                    // we have the disease so now  find all the targets and add ids for lazy loading
                    var parsedResult = searcher.parseDiseaseResponse(response);
                    diseaseResult.disease = parsedResult;
		    diseaseResult.disease.id = identifier;
                    diseaseResult.disease.targets = [];
                    Ember.run(function() {
                        resolve(diseaseResult)
                    });
                } else {
                    Ember.run(function() {
                        reject({"message": status})
                    });
                }
            };
            searcher.fetchDisease(id, null, diseaseInfoCallback);
        });
        return promise;
    }
});
App.TargetPharmacologyAdapter = App.ExplorerAdapter.extend({});
App.CompoundPharmacologyAdapter = App.ExplorerAdapter.extend({});
App.TreePharmacologyAdapter = App.ExplorerAdapter.extend({});
App.FlashMessageAdapter = App.ExplorerAdapter.extend({});
