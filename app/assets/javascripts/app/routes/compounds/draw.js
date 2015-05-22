import Ember from "ember";

export default Ember.Route.extend({

    setupController: function(controller, model, params) {
        console.log('compound ketcher controller');
        //var kPath = ketcherProtocol + '://' + document.location.hostname + ':' + ketcherPort + '/' + ketcherPath;
        //controller.set('ketcherPath', kPath);
        controller.set('model', model);
    },

    model: function(params) {
        console.log('compound ketcher model')
        var smiles = params.smiles;
        var structureInfo = {
            'smiles': smiles
        };
        var structure = this.controllerFor('compounds').store.createRecord('structure', structureInfo);
        return structure;
    },

    beforeModel: function() {
        this.controllerFor('application').set('fetching', false);
        enable_scroll();
    },

    actions: {
        queryParamsDidChange: function() {
            this.refresh();
        }
    }
});
