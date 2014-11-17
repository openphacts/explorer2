App.ApplicationController = Ember.Controller.extend({

    //jobsList used in the view to loop over the entries
    jobsList: [],
    alertsAvailable: false,
    iex: false,

    // use for structure drawing
    molfile: null,

    notOldIE: function() {
        return this.get('iex');
    }.property('iex'),

    anyJobs: function() {
        return this.jobsList.get('length') > 0;
    }.property('jobsList.@each'),
    //by default there are no alerts
    alertReady: false,
    fetching: false,
    searchQuery: '',
    //monitor the tsv creation
    addJob: function(jobID, label, filters) {
        this.jobsList.pushObject(Ember.Object.create({
            uuid: jobID,
            percentage: 0,
            status: "processing",
            label: label,
            filters: filters
        }));
        var me = this;
        this.checkTSV(jobID, this, true);
    },
    checkTSV: function(jobID, controller, go) {
        console.log("Check TSV is " + go + " for " + jobID);
        var jobID = jobID;
        var me = controller;
        var runAgain = true;
        if (go !== false) {
            $.ajax({
                url: tsvStatusUrl,
                dataType: 'json',
                cache: true,
                data: {
                    _format: "json",
                    uuid: jobID,
                },
                success: function(response, status, request) {
                    console.log('tsv monitor status ' + response.status);
                    status = response.status;
                    var percentage = response.percentage;
                    var job = me.jobsList.findBy("uuid", jobID);
                    //job may have been removed by the user in the mean time
                    if (job != null) {
                        if (percentage !== 0) {
                            me.jobsList.findBy("uuid", jobID).set('percentage', percentage);
                        }
                        if (status === "finished") {
                            me.jobsList.findBy("uuid", jobID).set('status', 'complete');
                            me.set('alertsAvailable', true);
                            App.FlashQueue.pushFlash('notice', 'TSV file is ready for download, click the "Alerts Bell" for more info.');
                            runAgain = false;
                        } else if (status === "failed") {
                            me.jobsList.findBy("uuid", jobID).set('status', 'failed');
                            App.FlashQueue.pushFlash('error', 'TSV file failed during creation, click the "Alerts Bell" for more info.');
                            runAgain = false;
                        }
                    } else {
                        runAgain = false;
                    }

                },
                error: function(request, status, error) {
                    console.log('tsv create request error');
                },
                complete: setTimeout(function() {
                    me.checkTSV(jobID, me, runAgain)
                }, 5000),
                timeout: 2000
            });
        }
    },

    getDatabase: function() {
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
        var request = window.indexedDB.open("openphacts.explorer.favourites", 1);
        request.onerror = function(event) {
            console.log("A DB error");
            return null;
        };
        request.onsuccess = function(event) {
            var db = event.target.result;
            return db;
        }
        request.onupgradeneeded = function(event) {
            var db = event.target.result;

            var objectStore = db.createObjectStore("compounds", {
                keyPath: "uri"
            });
            objectStore.createIndex("favourite", "favourite", {
                unique: false
            });
            objectStore.createIndex("label", "label", {
                unique: false
            });
            return db;
        };


    },

    addFavourite: function(type, URI, label, model) {
        console.log('changing favourite status');
        var me = this;
        var mapSearch = new Openphacts.MapSearch(ldaBaseUrl, appID, appKey);
        var callback = function(success, status, response) {
            if (success) {
                var compoundResult = {};
                // need to find the Chemspider URI in the db
                var uris = mapSearch.parseMapURLResponse(response);
                //get the database and add/change contents for this uri
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
                var request = window.indexedDB.open("openphacts.explorer.favourites", 1);
                request.onerror = function(event) {
                    console.log("A DB error");
                };
                request.onupgradeneeded = function(event) {
                    var db = event.target.result;

                    var objectStore = db.createObjectStore("compounds", {
                        keyPath: "uri"
                    });
                };
                request.onsuccess = function(event) {
                    var db = event.target.result;
                    var transaction = db.transaction([type], "readwrite");
                    transaction.oncomplete = function(event) {
                        console.log("Saved favourite " + type + " : " + URI);
                    };

                    transaction.onerror = function(event) {
                        // Don't forget to handle errors!
                        console.log("db find error");
                    };
                    var objectStore = transaction.objectStore(type);
                    $.each(uris, function(index, uri) {
			    var foundIt = false;
                            var findURIRequest = objectStore.get(uri);
                            // Handle errors!
                            findURIRequest.onerror = function(event) {
                                //no entry in db for this uri
                                console.log("DB retrieval error for " + uri);
                            };
                            findURIRequest.onsuccess = function(event) {
                                //update the entry
                                var data = findURIRequest.result;
                                if (data == null) {
                                    // no entry in db for this uri
                                    var addRequest = objectStore.add({
                                        'uri': uri,
                                        'label': label,
                                        'favourite': true
                                    });
                                    addRequest.onsuccess = function(event) {
                                        model.set('favourite', true);
                                    }
                                    addRequest.onerror = function(event) {
                                        console.log("Couldn't add data");
                                    };
                                } else {
                                    var fav = false;
                                    if (data.favourite === true) {
                                        data.favourite = false;
                                    } else {
                                        data.favourite = true;
                                        fav = true;
                                    }
                                    var requestUpdate = objectStore.put(data);
                                    requestUpdate.onerror = function(event) {
                                        // Do something with the error
                                        //
                                        alert("Could not save favourite. Sorry.");
                                    };
                                    requestUpdate.onsuccess = function(event) {
                                        // Success - the data is updated!

                                        model.set('favourite', fav);
                                    };
                                }
				foundIt = true;
                            };
                        if (foundIt === true) return false; //ie break out of the iterator
                    });
                }
            }
        }
        mapSearch.mapURL(URI, null, null, null, callback);
    },

    findFavourite: function(URI, type, model) {
        console.log('finding a favourite ' + type + ' : ' + URI);
        var me = this;
        var mapSearch = new Openphacts.MapSearch(ldaBaseUrl, appID, appKey);
        var callback = function(success, status, response) {
            if (success) {
                var compoundResult = {};
                // need to find the Chemspider URI in the db
                var uris = mapSearch.parseMapURLResponse(response);
                //get the database and add/change contents for this uri
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
                var request = window.indexedDB.open("openphacts.explorer.favourites", 1);
                request.onerror = function(event) {
                    console.log("A DB error");
                };
                request.onupgradeneeded = function(event) {
                    var db = event.target.result;

                    var objectStore = db.createObjectStore("compounds", {
                        keyPath: "uri"
                    });
                };
                request.onsuccess = function(event) {
                    var db = event.target.result;
                    var transaction = db.transaction([type], "readwrite");
                    transaction.oncomplete = function(event) {
                        console.log("Found favourite " + type + " : " + URI);
                    };

                    transaction.onerror = function(event) {
                        // Don't forget to handle errors!
                        console.log("db find error");
                    };
                    var objectStore = transaction.objectStore(type);
                        var foundIt = false;
                    $.each(uris, function(index, uri) {
                            var findURIRequest = objectStore.get(uri);
                            // Handle errors!
                            findURIRequest.onerror = function(event) {
                                //no entry in db for this uri
                                console.log("DB retrieval error for " + uri);
                            };
                            findURIRequest.onsuccess = function(event) {
                                //update the entry
                                var data = findURIRequest.result;
                                    if (data != null && data.favourite === true) {
                                        model.set('favourite', true);
                                    } else if (data != null) {
                                        model.set('favourite', false);
                                    }
                            };
                    });
                }
            }
        }
        mapSearch.mapURL(URI, null, null, null, callback);
    },

    actions: {

        dismissAlerts: function() {
            this.set('alertsAvailable', false);
        },

        removeJob: function(job) {
            console.log("removing job " + job.get('uuid'));
            this.jobsList.removeObject(job);
        },

        query: function() {
            console.log('app controller query');
            var query = this.get('searchQuery');
            //this.set('searchQuery', query);
            //this.transitionToRoute('search', { query: query }); NOTE: this is how you would transition to /search/blah
            //var params = Ember.Router.QueryParameters.create({ query: query });
            //this.transitionToRoute('search', {queryParams: {query: this.get('searchQuery')}});
            this.transitionToRoute('search', {
                queryParams: {
                    query: query
                }
            });
            //this.transitionToRoute("/search?query=" + query);
            //this.transitionToRoute('search', params);
        }
    }
});
