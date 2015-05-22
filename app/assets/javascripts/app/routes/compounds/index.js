import Ember from "ember";

export default Ember.Route.extend({

    setupController: function(controller, model, params) {
        console.log('compound index controller');
        controller.set('model', model);
        var compound = model;
        this.controllerFor('application').findFavourite(model.get('URI'), 'compounds', model);

        var molfile = this.controllerFor('application').get('molfile');
        //set the favourite status for this compound
        this.controllerFor('application').findFavourite(compound.get('URI'), 'compounds', compound);
        var pathwaysSearcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
        var compoundSearcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);
        var pathwaysCountCallback = function(success, status, response) {
            if (success && response) {
                var count = pathwaysSearcher.parseCountPathwaysByCompoundResponse(response);
                Ember.run(function() {
                    compound.set('pathwayRecords', count);
                });
            }
        };

        var pharmaCountCallback = function(success, status, response) {
            if (success && response) {
                var count = compoundSearcher.parseCompoundPharmacologyCountResponse(response);
                Ember.run(function() {
                    compound.set('pharmacologyRecords', count)
                });
            }
        };
        var compoundURI = compound.get('URI');
        pathwaysSearcher.countPathwaysByCompound(compoundURI, null, null, pathwaysCountCallback);
        compoundSearcher.compoundPharmacologyCount(compoundURI, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, pharmaCountCallback);
        Ember.run(function() {
            compound.set('molfile', molfile)
        });
    },

    model: function(params) {
        console.log('compound index model')
            //var uri = this.get('queryParameters').uri;
        var uri = params.uri
        var compound = this.controllerFor('compounds').store.find('compound', uri);
        return compound;
    },

    beforeModel: function() {
        this.controllerFor('application').set('fetching', false);
        enable_scroll();
    },

    actions: {
        queryParamsDidChange: function() {
            this.refresh();
        }
    },

    //if we leave the route then set the params to the defaults
    resetController: function(controller, isExiting, transition) {
        if (isExiting) {
            // isExiting would be false if only the route's model was changing
            controller.set('showProvenance', false);
        }
    }

});
