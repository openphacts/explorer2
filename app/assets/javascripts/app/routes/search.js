import Ember from 'ember';

export default Ember.Route.extend({

    setupController: function(controller, model, params) {
        console.log('search route setup');
        controller.clear();
        controller.set('totalCompounds', 0);
        controller.set('totalTargets', 0);
        controller.doSearch();
    },

    model: function(params) {
        console.log('search route model');
        this.controllerFor('search').setCurrentQuery(params.query);
        return [];
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
            controller.set('listView', true);
            controller.set('objectView', false);
        }
    }

});

