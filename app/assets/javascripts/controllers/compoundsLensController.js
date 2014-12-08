App.CompoundsLensController = Ember.ArrayController.extend({

    needs: ['application'],
    lenses: Em.computed.alias('controllers.application.lenses'),
    queryParams: ['uri', 'lens'],
    uri: '',
    lens: null,
    compound: null,
    //Has any lens info come back from the API
    haveLens: false,

    // The lens name for the uri param
    truncatedLens: '',

    displayedLens: null,

    defaultLens: null,

    selectedLens: null,

    initialLens: null,

    showProvenance: false,

    lensName: function() {
        var defLens = this.get('initialLens');
        var lensName;
        this.get('lenses').forEach(function(lens, index, array) {
            if (lens.uri === defLens) {
                lensName = lens.name;
            }
        });
        return lensName;
    }.property('initialLens'),

    favourite: function() {
        return this.get('model').get('favourite');
    }.property('model.favourite'),

    provenanceEnabled: function() {
        return this.get('showProvenance') === true;
    }.property('showProvenance'),

    hasPathways: function() {
        if (this.get('compound.pathwayRecords') != null && this.get('compound.pathwayRecords') > 0) {
            return true;
        }
    }.property('compound.pathwayRecords'),

    hasPharmacology: function() {
        if (this.get('compound.pharmacologyRecords') != null && this.get('compound.pharmacologyRecords') > 0) {
            return true;
        }
    }.property('compound.pharmacologyRecords'),

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
            console.log('apply lens ' + lens.name);
            if (lens != null) {
                //this.send('invalidateModel');
                this.transitionToRoute('compounds.lens', {
                    queryParams: {
                        'uri': this.get('compound').get('URI'),
                        'lens': lens.uri
                    }
                });
            }
        }

        //resetLens: function() {
        //    this.set('selectedLens', null);
        //    this.transitionToRoute('compounds.index', {
        //        queryParams: {
        //            'uri': this.get('model').get('URI'),
        //            'lens': null
        //        }
        //    });

        //}
    }

});
