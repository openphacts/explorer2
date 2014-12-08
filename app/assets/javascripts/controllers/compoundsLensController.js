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

    currentHeader: null,

    sortedHeader: null,

    filteredCompounds: [],

    lensedCompounds: (function() {
        return Ember.ArrayProxy.createWithMixins(Ember.SortableMixin, {
            sortProperties: null,
            sortAscending: false,
            content: this.get('filteredCompounds')
        });
    }).property('filteredCompounds'),

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

    prefLabelSortASC: function() {
        return this.get('currentHeader') === "prefLabel" && this.get('sortedHeader') === "prefLabel";
    }.property('sortedHeader'),

    prefLabelSortDESC: function() {
        return this.get('currentHeader') === "prefLabel" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    descriptionSortASC: function() {
        return this.get('currentHeader') === "description" && this.get('sortedHeader') === "description";
    }.property('sortedHeader'),

    descriptionSortDESC: function() {
        return this.get('currentHeader') === "description" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    biotransSortASC: function() {
        return this.get('currentHeader') === "biotransformationItem" && this.get('sortedHeader') === "biotransformationItem";
    }.property('sortedHeader'),

    biotransSortDESC: function() {
        return this.get('currentHeader') === "biotransformationItem" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    toxicitySortASC: function() {
        return this.get('currentHeader') === "toxicity" && this.get('sortedHeader') === "toxicity";
    }.property('sortedHeader'),

    toxicitySortDESC: function() {
        return this.get('currentHeader') === "toxicity" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    proteinBindingSortASC: function() {
        return this.get('currentHeader') === "proteinBinding" && this.get('sortedHeader') === "proteinBinding";
    }.property('sortedHeader'),

    proteinBindingSortDESC: function() {
        return this.get('currentHeader') === "proteinBinding" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    smilesSortASC: function() {
        return this.get('currentHeader') === "smiles" && this.get('sortedHeader') === "smiles";
    }.property('sortedHeader'),

    smilesSortDESC: function() {
        return this.get('currentHeader') === "smiles" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    chemblURISortASC: function() {
        return this.get('currentHeader') === "chemblURI" && this.get('sortedHeader') === "chemblURI";
    }.property('sortedHeader'),

    chemblURISortDESC: function() {
        return this.get('currentHeader') === "chemblURI" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    fullMWTSortASC: function() {
        return this.get('currentHeader') === "fullMWT" && this.get('sortedHeader') === "fullMWT";
    }.property('sortedHeader'),

    fullMWTSortDESC: function() {
        return this.get('currentHeader') === "fullMWT" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    hbaSortASC: function() {
        return this.get('currentHeader') === "hba" && this.get('sortedHeader') === "hba";
    }.property('sortedHeader'),

    hbaSortDESC: function() {
        return this.get('currentHeader') === "hba" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    hbdSortASC: function() {
        return this.get('currentHeader') === "hbd" && this.get('sortedHeader') === "hbd";
    }.property('sortedHeader'),

    hbdSortDESC: function() {
        return this.get('currentHeader') === "hbd" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    inchiSortASC: function() {
        return this.get('currentHeader') === "inchi" && this.get('sortedHeader') === "inchi";
    }.property('sortedHeader'),

    inchiSortDESC: function() {
        return this.get('currentHeader') === "inchi" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    inchiKeySortASC: function() {
        return this.get('currentHeader') === "inchiKey" && this.get('sortedHeader') === "inchiKey";
    }.property('sortedHeader'),

    inchiKeySortDESC: function() {
        return this.get('currentHeader') === "inchiKey" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    logpSortASC: function() {
        return this.get('currentHeader') === "logp" && this.get('sortedHeader') === "logp";
    }.property('sortedHeader'),

    logpSortDESC: function() {
        return this.get('currentHeader') === "logp" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    molformSortASC: function() {
        return this.get('currentHeader') === "molform" && this.get('sortedHeader') === "molform";
    }.property('sortedHeader'),

    molformSortDESC: function() {
        return this.get('currentHeader') === "molform" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    mwFreebaseSortASC: function() {
        return this.get('currentHeader') === "mwFreebase" && this.get('sortedHeader') === "mwFreebase";
    }.property('sortedHeader'),

    mwFreebaseSortDESC: function() {
        return this.get('currentHeader') === "mwFreebase" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    psaSortASC: function() {
        return this.get('currentHeader') === "psa" && this.get('sortedHeader') === "psa";
    }.property('sortedHeader'),

    psaSortDESC: function() {
        return this.get('currentHeader') === "psa" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    ro5ViolationsSortASC: function() {
        return this.get('currentHeader') === "ro5Violations" && this.get('sortedHeader') === "ro5Violations";
    }.property('sortedHeader'),

    ro5ViolationsSortDESC: function() {
        return this.get('currentHeader') === "ro5Violations" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    rtbSortASC: function() {
        return this.get('currentHeader') === "rtb" && this.get('sortedHeader') === "rtb";
    }.property('sortedHeader'),

    rtbSortDESC: function() {
        return this.get('currentHeader') === "rtb" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),


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
        },
        sortHeader: function(header) {
            var sortHeader = [];
            sortHeader.push(header);
            if (this.get('currentHeader') === header && this.get('sortedHeader') === header) {
                this.get('lensedCompounds').set('sortProperties', sortHeader);
                this.get('lensedCompounds').set('sortAscending', false);
                //descending
                //reset so next time for same one will be ascending
                this.set('sortedHeader', null);
            } else {
                //ascending
                //next time will be descending
                this.get('lensedCompounds').set('sortProperties', sortHeader);
                this.get('lensedCompounds').set('sortAscending', true);
                this.set('sortedHeader', header);
                this.set('currentHeader', header);
            }
        }

    }
});
