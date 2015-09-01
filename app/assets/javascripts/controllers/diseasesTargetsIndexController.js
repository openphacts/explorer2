App.DiseasesTargetsIndexController = Ember.Controller.extend({

    needs: ['application'],

    queryParams: ['uri'],

    uri: '',

    showProvenance: false,

    actions: {
        enableProvenance: function() {
            this.set('showProvenance', true);
        },

        disableProvenance: function() {
            this.set('showProvenance', false);
        }
    }

});
