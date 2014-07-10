App.CompoundsIndexController = Ember.ObjectController.extend({

        needs: ['application'],

        queryParams: ['uri'],
        uri: '',

        showProvenance: false,

        favourite: function() {
            return this.get('model').get('favourite');
        }.property('model.favourite'),

        hasPathways: function() {
            if (this.get('model.pathwayRecords') != null && this.get('model.pathwayRecords') > 0) {
                return true;
            }
        }.property('model.pathwayRecords'),

        hasPharmacology: function() {
            if (this.get('model.pharmacologyRecords') != null && this.get('model.pharmacologyRecords') > 0) {
                return true;
            }
        }.property('model.pharmacologyRecords'),

        actions: {
            enableProvenance: function() {
                this.set('showProvenance', true);
                console.log("Compund provenance enabled");
            },

            disableProvenance: function() {
                this.set('showProvenance', false);
                console.log("Compound provenance disabled");
            },

            changeFavouriteStatus: function() {
                console.log('changing favourite status');
                // Since the compound could have any URI we need to decide on a standard one to save. OPS Chemspider
                // seems like a 'safe' one.
                // Indexeddb with help from https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
                // In the following line, you should include the prefixes of implementations you want to test.
                window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
                // DON'T use "var indexedDB = ..." if you're not in a function.
                // Moreover, you may need references to some window.IDB* objects:
                window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
                window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
                // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)
                if (!window.indexedDB) {
                    window.alert("Your browser doesn't support a stable version of IndexedDB. Favouriting compounds, targets etc will not be available.");
                }
                var db;
                var request = window.indexedDB.open("ExplorerFavouritesDB", 1);
                request.onerror = function(event) {
			console.log("A DB error");
                    // Do something with request.errorCode!
                    //alert("Database error: " + event.target.errorCode);
                };
                request.onsuccess = function(event) {
                    db = this.result;
                    var transaction = db.transaction(["customers"], "readwrite");
                    transaction.oncomplete = function(event) {
                        alert("All done!");
                    };

                    transaction.onerror = function(event) {
                        // Don't forget to handle errors!
			console.log("db find error");
                    };
                    var objectStore = transaction.objectStore("compounds");
                    var request = objectStore.add(customerData[i]);
                    var me = this;
                    var mapSearch = new Openphacts.MapSearch(ldaBaseUrl, appID, appKey);
                    var callback = function(success, status, response) {
                        if (success) {
                            var compoundResult = {};
                            // need to find the Chemspider URI in the db
                            var uris = mapSearch.parseMapURLResponse(response);
                            $.each(uris, function(index, uri) {
                                    var foundIt = false;
                                    if (uri.indexOf("http://ops.rsc.org") !== -1) {
                                        foundIt = true;
                                        var request = objectStore.get(uri);
                                        // Handle errors!
                                        request.onerror = function(event) {
                                            //no entry in db for this uri
                                            var request = objectStore.add({
                                                'uri': uri,
                                                'favourite': true
                                            });
                                            me.get('model').set('favourite', true);
                                        };
                                        request.onsuccess = function(event) {
                                            //update the entry
                                            var data = request.result;
                                            if (data.favourite === "true") {
                                                data.favourite = "false";
                                                me.get('model').set('favourite', false);
                                            } else {
                                                data.favorite = "true";
                                                me.get('model').set('favourite', true);
                                            }
                                            var requestUpdate = objectStore.put(data);
                                            requestUpdate.onerror = function(event) {
                                                // Do something with the error
                                            };
                                            requestUpdate.onsuccess = function(event) {
                                                //            // Success - the data is updated!
                                            };

                                        };
                                    };
                                    if (foundIt === true) return false; //ie break out of the iterator
                                });
			}
                    }
                mapSearch.mapURL(this.get('model').get('URI'), null, null, null, callback);
                };
	    //create db if it doesn't exist
            request.onupgradeneeded = function(event) {
                var db = event.target.result;

                var objectStore = db.createObjectStore("compounds", {
                    keyPath: "uri"
                });
                objectStore.createIndex("favourite", "favourite", {
                    unique: false
                });
            };
        }
    }

});
