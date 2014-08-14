App.CompoundAdapter = DS.Adapter.extend({
    find: function(store, type, id) {
        var compoundResult;
        // return a promise inside of which is the callback which either resolves with the retrieved compound data or rejects with the status
        var promise = new Ember.RSVP.Promise(function(resolve, reject) {
            var searcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);
            // get the compound details  
            var callback = function(success, status, response) {
                if (success) {
                    compoundResult = searcher.parseCompoundResponse(response);
                    compoundResult['pathways'] = [];
                    Ember.run(function() {
                        resolve(compoundResult)
                    });
                } else {
                    Ember.run(function() {
                        reject(status)
                    });
                }
            }
            searcher.fetchCompound(id, null, callback);
        });
        return promise;
    }
});
App.TargetAdapter = DS.Adapter.extend({
    find: function(store, type, id) {
        return new Ember.RSVP.Promise(function(resolve, reject) {
            var searcher = new Openphacts.TargetSearch(ldaBaseUrl, appID, appKey);
            var callback = function(success, status, response) {
                if (success) {
                    var targetResult = searcher.parseTargetResponse(response);
                    targetResult['pathways'] = [];
                    Ember.run(function() {
                        resolve(targetResult)
                    });
                } else {
                    Ember.run(function() {
                        reject(status)
                    });
                }
            }
            searcher.fetchTarget(id, null, callback);
        });
    }
});
App.PathwayAdapter = DS.Adapter.extend({
    find: function(store, type, id) {
        console.log('pathway adapter find');
        var identifier = id;
        var promise = new Ember.RSVP.Promise(function(resolve, reject) {
            var searcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
            var pathwayInfoCallback = function(success, status, response) {
                if (success && response) {
                    // we have the pathway so now  find all the compounds and add ids for lazy loading
                    var pathwayResult = searcher.parseInformationResponse(response);
                    pathwayResult['id'] = identifier;
                    pathwayResult['compounds'] = [];
                    Ember.run(function() {
                        resolve(pathwayResult)
                    });
                } else {
                    Ember.run(function() {
                        reject(status)
                    });
                }
            };
            searcher.information(id, null, pathwayInfoCallback);
        });
        return promise;
    }
});
App.TreeAdapter = DS.Adapter.extend({
    find: function(store, type, id) {
        console.log('enzyme adapter find');
        var enzymeResponse = {};
        enzymeResponse['id'] = id;
        enzymeResponse['uri'] = id;

        return enzymeResponse;
    }
});
