App.CompoundsIndexController = Ember.ObjectController.extend({

    needs: ['application'],
    lenses: Em.computed.alias('controllers.application.lenses'),
    queryParams: ['uri', 'lens'],
    uri: '',
    lens: null,
    // The lens name for the uri param
    truncatedLens: '',

    // Contains a list of compounds and their properties fetched when a lens is applied
    lensedCompounds: [],

    displayedLens: null,

    defaultLens: null,

    selectedLens: null,

    showProvenance: false,

    favourite: function() {
        return this.get('model').get('favourite');
    }.property('model.favourite'),

    provenanceEnabled: function() {
        return this.get('showProvenance') === true;
    }.property('showProvenance'),

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
        changeFavouriteStatus: function() {
            console.log('changing favourite status');
            this.get('controllers.application').addFavourite('compounds', this.get('model').get('URI'), this.get('model').get('prefLabel'), this.get('model'));
        },

        enableProvenance: function() {
            this.get('showProvenance') === false ? this.set('showProvenance', true) : '';
        },

        disableProvenance: function() {
            this.get('showProvenance') === true ? this.set('showProvenance', false) : '';
        },

        applyLens: function() {
            var lens = this.get('selectedLens');
            if (lens != null) {
                this.transitionToRoute('compounds.index', {
                    queryParams: {
                        'uri': this.get('model').get('URI'),
                        'lens': lens.uri
                    }
                });
            }
        },

        resetLens: function() {
            this.set('selectedLens', null);
            this.transitionToRoute('compounds.index', {
                queryParams: {
                    'uri': this.get('model').get('URI'),
                    'lens': null
                }
            });

        }
    }

});
