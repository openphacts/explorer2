import Ember from "ember";

export defaule Ember.Route.extend({

    setupController: function(controller, model, params) {
        console.log('disease index controller');
        controller.set('model', model);
        var disease = model;
    },

    model: function(params) {
        console.log('disease index model')
        var uri = params.uri
        var disease = this.controllerFor('diseases.index').store.find('disease', uri);
        return disease;
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
