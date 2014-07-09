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
            var me = this;
            var mapSearch = new Openphacts.MapSearch(ldaBaseUrl, appID, appKey);
            var callback = function(success, status, response) {
                if (success) {
                    var compoundResult = {};
                    var uris = mapSearch.parseMapURLResponse(response);
                    $.each(uris, function(index, uri) {
                        var foundIt = false;
                        if (uri.indexOf("http://ops.rsc.org") !== -1) {
                            foundIt = true;
                            if (me.get('model').get('favourite') === true) {
                                window.localStorage[uri] = false;
                                me.get('model').set('favourite', false);
                            } else {
                                window.localStorage[uri] = true;
                                me.get('model').set('favourite', true);
                            }

                        }
                        if (foundIt === true) return false; //ie break out of the iterator
                    });
                }
            }
            mapSearch.mapURL(this.get('model').get('URI'), null, null, null, callback);
        }
    }

});
