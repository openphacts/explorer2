App.ErrorController = Ember.ObjectController.extend({

    is404: function() {
        return this.get('model.message') === 404;
    }.property('model.message'),

    is500: function() {
        return this.get('model.message') === 500;
    }.property('model.message'),

    isGeneralError: function() {
        return this.get('model.message') !== 404 && this.get('model.message') !== 500;
    }.property('model.message')

});
