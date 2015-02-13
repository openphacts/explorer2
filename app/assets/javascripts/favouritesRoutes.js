// Favourites Routes

App.FavouritesRoute = Ember.Route.extend({

    setupController: function(controller, model, params) {
        console.log('favourites index controller');
        controller.set('model', model);
        var me = controller;
        //get the database and add/change contents for this uri
        window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        // DON'T use "var indexedDB = ..." if you're not in a function.
        // Moreover, you may need references to some window.IDB* objects:
        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
        window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
        // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)
        if (!window.indexedDB) {
            console.log('No indexed db in this browser');
            me.get('controllers.flash').pushObject(me.get('store').createRecord('flashMessage', {
                type: 'notice',
                message: 'Your browser does not support a storing data locally. Favouriting compounds, targets etc will not be available.'
            }));
        } else {
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
            var types = {
                "compounds": "compound",
                "targets": "target"
            };
            request.onsuccess = function(event) {
                ["compounds", "targets"].forEach(function(type, index, array) {
                    var db = event.target.result;
                    var transaction = db.transaction([type], "readonly")
                    var objectStore = transaction.objectStore(type);
                    objectStore.openCursor().onsuccess = function(event) {
                        var cursor = event.target.result;
                        if (cursor) {
                            if (cursor.value.favourite === true) {
                                me.store.find(types[type], cursor.value.uri).then(function(compound) {
                                    me.get('model').pushObject(compound);
                                });;

                                //me.get('model').pushObject({
                                //    "type": type,
                                //    "URI": cursor.value.uri,
                                //    "label": cursor.value.label
                                //});
                            }
                            cursor.continue();
                        } else {}
                    };
                });
            };
        }
    },

    model: function(params) {
        console.log('favourites index model')
        return [];
    },

    beforeModel: function() {
        this.controllerFor('application').set('fetching', false);
        enable_scroll();
    },

    actions: {
        error: function(error, transition) {
            console.log('favourites error ' + error);
        }
    }

});
