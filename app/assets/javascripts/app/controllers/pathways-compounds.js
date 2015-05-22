App.PathwaysCompoundsController = Ember.Controller.extend({

    needs: ['application'],

    infoHide: false,

    queryParams: ['uri'],

    uri: '',

    currentCount: function() {
        return this.get('model.compounds.length');
    }.property('model.compounds.length'),

    totalCount: function() {
        return this.get('model.compounds.length');
    }.property('model.compounds.length'),

    notEmpty: function() {
        return this.get('model.compounds.length') > 0;
    }.property('model.compounds.length'),

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

        fetchMore: function() {
            //TODO fetch more results if there are any
        },

        sortHeader: function(header) {
            var sortHeader = [];
            sortHeader.push(header);
            if (this.get('currentHeader') === header && this.get('sortedHeader') === header) {
                this.get('compounds').set('sortProperties', sortHeader);
                this.get('compounds').set('sortAscending', false);
                //descending
                //reset so next time for same one will be ascending
                this.set('sortedHeader', null);
            } else {
                //ascending
                //next time will be descending
                this.get('compounds').set('sortProperties', sortHeader);
                this.get('compounds').set('sortAscending', true);
                this.set('sortedHeader', header);
                this.set('currentHeader', header);
            }
        },
        goToTop: function() {
            window.scrollTo(0, 0);
        }

    }

});
