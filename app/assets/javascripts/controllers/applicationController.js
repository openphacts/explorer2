App.ApplicationController = Ember.Controller.extend({

    //flash messages displayed in main application view
    needs: ['flash'],
    flashMessages: Ember.computed.alias("controllers.flash.model"),
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
    addJob: function(params, label, filters) {
        var me = this;
        var id = params.uri + Date.now();
        var job = this.jobsList.pushObject(this.get('store').createRecord('job', {
            // not really a UUID but consistent with other parts of the code
            uuid: id,
            percentage: 0,
            status: "processing",
            label: label,
            filters: filters
        }));

        if (!!window.Worker) {
            var myWorker = new Worker("/assets/workers.js");

            myWorker.postMessage(['start', ldaBaseUrl, appID, appKey, params]);

            myWorker.onmessage = function(e) {
                console.log('Message received from worker: ' + e.data);
                //job may have been removed by the user in the mean time
                if (e.data.status === "processing") {
                    job.set('percentage', e.data.percent);
                    myWorker.postMessage(['continue']);
                } else if (e.data.status === "complete") {
                    job.set('status', 'complete');
                    job.set('percentage', 100);
                    me.set('alertsAvailable', true);
                    me.get('controllers.flash').pushObject(me.get('store').createRecord('flashMessage', {
                        type: 'success',
                        message: 'TSV file is ready for download, click the "Alerts Bell" for more info.'
                    }));
                    // save the TSV file locally
                    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
                    // DON'T use "var indexedDB = ..." if you're not in a function.
                    // Moreover, you may need references to some window.IDB* objects:
                    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
                    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
                    // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)
                    if (!window.indexedDB) {
                        window.alert("Your browser doesn't support a stable version of IndexedDB. TSV files cannot be stored locally.");
                    }
                    var db;
                    var request = window.indexedDB.open("openphacts.explorer.tsvfiles", 1);
                    request.onerror = function(event) {
                        console.log("Could not open tsvfiles db");
                    };
                    request.onupgradeneeded = function(event) {
                        var db = event.target.result;

                        var objectStore = db.createObjectStore("tsvfile", {
                            keyPath: "uriDate"
                        });
                    };
                    request.onsuccess = function(event) {
                        var db = event.target.result;
                        var transaction = db.transaction("tsvfile", "readwrite");
                        transaction.oncomplete = function(event) {
                            console.log("Saved tsv file");
                        };

                        transaction.onerror = function(event) {
                            // Don't forget to handle errors!
                            console.log("Transaction error for tsv file");
                        };
                        var objectStore = transaction.objectStore('tsvfile');
                        var addRequest = objectStore.add({
                            // slightly clumsy key but it will do 
                            'uriDate': id,
                            'label': label,
                            'filters': filters,
                            'tsvFile': e.data.tsvFile
                        });
                        addRequest.onsuccess = function(event) {
                            console.log('Saved tsv file');
                        }
                        addRequest.onerror = function(event) {
                            console.log("Couldn't save tsv file");
                        };
                    }
                } else {
                    // Job has failed
                    job.set('status', 'failed');
                    me.get('controllers.flash').pushObject(me.get('store').createRecord('flashMessage', {
                        type: 'error',
                        message: 'TSV file failed during creation, click the "Alerts Bell" for more info.'
                    }));
                }
            }
        }
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
                            me.get('controllers.flash').pushObject(me.get('store').createRecord('flashMessage', {
                                type: 'success',
                                message: 'TSV file is ready for download, click the "Alerts Bell" for more info.'
                            }));
                            runAgain = false;
                        } else if (status === "failed") {
                            me.jobsList.findBy("uuid", jobID).set('status', 'failed');
                            me.get('controllers.flash').pushObject(me.get('store').createRecord('flashMessage', {
                                type: 'error',
                                message: 'TSV file failed during creation, click the "Alerts Bell" for more info.'
                            }));
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
                    var objectStore = db.createObjectStore("targets", {
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
                    var foundIt = false;
                    var totalURIS = uris.length;
                    var keysChecked = 0;
                    // check each URI one at a time to avoid any async problems
                    (function nextURI() {
                        if (!uris.length)
                            return;
                        var uri = uris.shift();
                        var findURIRequest = objectStore.get(uri);
                        findURIRequest.onerror = function(event) {
                            //no entry in db for this uri
                            console.log("DB retrieval error for " + uri);
                        };
                        findURIRequest.onsuccess = function(event) {
                            keysChecked += 1;
                            var data = findURIRequest.result;
                            if (data != null) {
                                foundIt = true;
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
                                    alert("Could not save favourite. Sorry.");
                                };
                                requestUpdate.onsuccess = function(event) {
                                    // Success - the data is updated!

                                    model.set('favourite', fav);
                                };
                            } else if (foundIt === false && keysChecked === totalURIS) {
                                // checked all the URIs and no entry in db for this uri
                                var addRequest = objectStore.add({
                                    'uri': URI,
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
                                // Check the next URI    
                                nextURI();
                            }
                        };
                    }());
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
                    var objectStore = db.createObjectStore("targets", {
                        keyPath: "uri"
                    });

                };
                request.onsuccess = function(event) {
                    var db = event.target.result;
                    var transaction = db.transaction([type], "readwrite");
                    transaction.oncomplete = function(event) {
                        console.log("Started transaction for " + type + " : " + URI);
                    };

                    transaction.onerror = function(event) {
                        // Don't forget to handle errors!
                        console.log("db find error");
                    };
                    var objectStore = transaction.objectStore(type);
                    var foundIt = false;
                    // check each URI one at a time to avoid any async problems
                    (function nextURI() {
                        if (!uris.length)
                            return;
                        var uri = uris.shift();
                        var findURIRequest = objectStore.get(uri);
                        findURIRequest.onerror = function(event) {
                            //no entry in db for this uri
                            console.log("DB retrieval error for " + uri);
                        };
                        findURIRequest.onsuccess = function(event) {
                            //update the entry
                            var data = findURIRequest.result;
                            if (data != null) {
                                if (data.favourite === true) {
                                    model.set('favourite', true);
                                } else {
                                    // it is in the db but is not a favourite
                                    model.set('favourite', false);
                                }
                            } else {
                                nextURI();
                            }
                        };
                    }());
                }
            }
        }
        mapSearch.mapURL(URI, null, null, null, callback);
    },

    jobComplete: function(job) {
        console.log('job complete');
	return false;
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
        },

        downloadTSV: function(tsvFileID) {
            console.log('download ' + tsvFileID);
        }
    }
});
