App.ApplicationController = Ember.Controller.extend({

    //flash messages displayed in main application view
    needs: ['flash'],
    flashMessages: Ember.computed.alias("controllers.flash.model"),
    //jobsList used in the view to loop over the entries
    jobsList: [],
    workersList: {},
    alertsAvailable: false,
    lenses: null,
    lensesInfo: null,
    iex: false,

    // use for structure drawing
    molfile: null,
    cookieAcceptance: false,

    notCookie: function() {
        return !this.get('cookieAcceptance');
    }.property('cookieAcceptance'),
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
        var date = Date.now();
        // save the TSV file locally
        window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        // DON'T use "var indexedDB = ..." if you're not in a function.
        // Moreover, you may need references to some window.IDB* objects:
        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
        window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
        // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)
        if (!!window.Worker && !!window.indexedDB) {
            var id = params.uri + date;
            var job = this.jobsList.pushObject(this.get('store').createRecord('job', {
                // not really a UUID but term consistent with other parts of the code
                uuid: id,
                date: date,
                percentage: 0,
                status: "processing",
                label: label,
                filters: filters
            }));

            var myWorker = new Worker("/workers.js");
            // keep track of workers in case we need to remove it due to user stopping job before finish
            me.get('workersList')[encodeURIComponent(id)] = myWorker;
            myWorker.postMessage(['start', ldaBaseUrl, appID, appKey, params]);
            me.get('controllers.flash').pushObject(me.get('store').createRecord('flashMessage', {
                type: 'success',
                message: 'TSV file is being created. You will be alerted when it is ready for download. Click the "Alerts Bell" to view the current progress.'
            }));

            myWorker.onmessage = function(e) {
                console.log('Message received from worker: ' + e.data);
                //job may have been removed by the user in the mean time
                if (e.data.status === "processing") {
                    job.set('percentage', e.data.percent);
                    myWorker.postMessage(['continue']);
                } else if (e.data.status === "complete") {
                    job.set('status', 'complete');
                    job.set('percentage', 100);
                    var db;
                    var request = window.indexedDB.open("openphacts.explorer.tsvfiles", 1);
                    request.onerror = function(event) {
                        console.log("Could not open tsvfiles db " + event);
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
                            console.log("Transaction error for tsv file " + event);
                        };
                        var objectStore = transaction.objectStore('tsvfile');
                        var addRequest = objectStore.add({
                            // slightly clumsy key but it will do 
                            'uriDate': id,
                            'date': date,
                            'label': label,
                            'filters': filters,
                            'tsvFile': e.data.tsvFile
                        });
                        addRequest.onsuccess = function(event) {
                            console.log('Saved tsv file');
                            me.set('alertsAvailable', true);
                            me.get('controllers.flash').pushObject(me.get('store').createRecord('flashMessage', {
                                type: 'success',
                                message: 'TSV file is ready for download, click the "Alerts Bell" for more info.'
                            }));

                            myWorker.terminate();
                        }
                        addRequest.onerror = function(event) {
                            console.log("Couldn't save tsv file " + event);
                            // Job has failed
                            job.set('status', 'failed');
                            me.get('controllers.flash').pushObject(me.get('store').createRecord('flashMessage', {
                                type: 'error',
                                message: 'TSV file failed to save locally. You may have a fault with your browsers IndexedDB storage.'
                            }));
                            myWorker.terminate();
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
        } else {
            // No web worker so do it the old way
            var jobID = params.jobID;
            var job = this.jobsList.pushObject(this.get('store').createRecord('job', {
                uuid: jobID,
                date: date,
                percentage: 0,
                status: "processing",
                label: label,
                filters: filters,
                local: false
            }));
            this.checkTSV(job, this, true);
        }
    },

    checkTSV: function(job, controller, go) {
        var me = controller;
        var runAgain = true;
        var jobID = job.get('uuid');
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
                    //job may have been removed by the user in the mean time
                    if (job != null) {
                        if (percentage !== 0) {
                            job.set('percentage', percentage);
                        }
                        if (status === "finished") {
                            job.set('status', 'complete');
                            me.set('alertsAvailable', true);
                            me.get('controllers.flash').pushObject(me.get('store').createRecord('flashMessage', {
                                type: 'success',
                                message: 'TSV file is ready for download, click the "Alerts Bell" for more info.'
                            }));
                            runAgain = false;
                        } else if (status === "failed") {
                            job.set('status', 'failed');
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
                    me.checkTSV(job, me, runAgain)
                }, 5000),
                timeout: 2000
            });
        }
    },

    addFavourite: function(type, URI, label, model) {
        console.log('changing favourite status');
        //get the database and add/change contents for this uri
        window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        // DON'T use "var indexedDB = ..." if you're not in a function.
        // Moreover, you may need references to some window.IDB* objects:
        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
        window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
        // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)
        var me = this;
        if (!!window.indexedDB) {
            var mapSearch = new Openphacts.MapSearch(ldaBaseUrl, appID, appKey);
            var callback = function(success, status, response) {
                if (success) {
                    var compoundResult = {};
                    // need to find the Chemspider URI in the db
                    var uris = mapSearch.parseMapURLResponse(response);
                    var db;
                    var request = window.indexedDB.open("openphacts.explorer.favourites", 1);
                    request.onerror = function(event) {
                        console.log("A DB error");
                        me.get('controllers.flash').pushObject(me.get('store').createRecord('flashMessage', {
                            type: 'error',
                            message: "There was a problem using your browsers storage. Please contact support for help in investigating.."
                        }));
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
                            me.get('controllers.flash').pushObject(me.get('store').createRecord('flashMessage', {
                                type: 'error',
                                message: "There was a problem using your browsers storage. Please contact support for help in investigating.."
                            }));
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
                                        me.get('controllers.flash').pushObject(me.get('store').createRecord('flashMessage', {
                                            type: 'error',
                                            message: "There was a problem using your browsers storage. Please contact support for help in investigating.."
                                        }));
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
                                        me.get('controllers.flash').pushObject(me.get('store').createRecord('flashMessage', {
                                            type: 'error',
                                            message: "There was a problem using your browsers storage. Please contact support for help in investigating.."
                                        }));
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
        } else {
            me.get('controllers.flash').pushObject(me.get('store').createRecord('flashMessage', {
                type: 'notice',
                message: "Your browser doesn't support local storage using IndexedDB. Favouriting compounds, targets etc will not be available."
            }));
        }
    },

    findFavourite: function(URI, type, model) {
        console.log('finding a favourite ' + type + ' : ' + URI);
        var me = this;
        var mapSearch = new Openphacts.MapSearch(ldaBaseUrl, appID, appKey);
        //get the database and add/change contents for this uri
        window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        // DON'T use "var indexedDB = ..." if you're not in a function.
        // Moreover, you may need references to some window.IDB* objects:
        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
        window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
        // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)
        // Only try to find favourites if indexedDB is present
        if (!!window.indexedDB) {
            var callback = function(success, status, response) {
                if (success) {
                    var compoundResult = {};
                    // need to find the Chemspider URI in the db
                    var uris = mapSearch.parseMapURLResponse(response);
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
        }
    },

    actions: {

        dismissAlerts: function() {
            this.set('alertsAvailable', false);
        },

        removeJob: function(job) {
            // If it's a webworker then terminate it as well
            if (!!window.Worker) {
                this.get('workersList')[encodeURIComponent(job.get('uuid'))].terminate();
            }
            this.jobsList.removeObject(job);
        },

        query: function() {
            var query = this.get('searchQuery');
            this.transitionToRoute('search', {
                queryParams: {
                    query: query
                }
            });
        },

        downloadTSV: function(tsvFileID) {
            window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
            window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
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
                    console.log("Downloaded tsv file");
                };

                transaction.onerror = function(event) {
                    // Don't forget to handle errors!
                    console.log("Transaction error for tsv file");
                };
                var objectStore = transaction.objectStore('tsvfile');
                var findURIRequest = objectStore.get(tsvFileID);
                findURIRequest.onerror = function(event) {
                    //no entry in db for this tsv file
                    console.log("DB retrieval error for " + tsvFileID);
                };
                findURIRequest.onsuccess = function(event) {
                    var data = findURIRequest.result;
                    if (data != null) {
                        if (data.tsvFile !== null) {
                            var blob = new Blob([data.tsvFile], {
                                type: "text/tsv;charset=utf-8"
                            });
                            saveAs(blob, data.label + ".tsv");
                        } else {
                            // no tsv data so....e
                        }
                    }
                };
            }
        },
        // User clicks button to accept cookies and storage
        setUserAcceptanceCookie: function() {
            var d = new Date();
            // Set expiry of cookie in 10 years!
            d.setTime(d.getTime() + (3650 * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            document.cookie = "explorerCookieAcceptance=true;" + expires;
            this.set('cookieAcceptance', true);
        }
    }
});
