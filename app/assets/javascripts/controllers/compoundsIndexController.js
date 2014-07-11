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
            this.get('controllers.application').addFavourite('compounds', this.get('model').get('URI'), this.get('model').get('prefLabel'), this.get('model'));
        }
    }

});
