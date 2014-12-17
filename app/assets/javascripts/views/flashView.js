App.FlashView = Ember.View.extend({
    templateName: 'flash',
    didInsertElement: function() {
        console.log("flash inserted");
        var me = this;
        this.$().fadeIn(700);
    },
    actions: {
        click: function(alert) {
            this.get('controller').get('controllers.flash').removeObject(this.get('content'));
            this.destroy();
        }
    }
});
