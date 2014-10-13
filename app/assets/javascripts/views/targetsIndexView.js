App.TargetsIndexView = Ember.View.extend({
    didInsertElement: function() {
        var glmol02 = new GLmol('glmol02');
        var glmol01 = new GLmol('glmol01', true);
        this.get('controller').set('molViewer', glmol01);
    }

});
