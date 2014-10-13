App.TargetsIndexView = Ember.View.extend({
    didInsertElement: function() {
        var glmol01 = new GLmol('glmol01', true);
        this.get('controller').set('molViewer', glmol01);
	var threeDee = $('#threeDeeTargetModalView');
	this.get('controller').set('threeDeeTarget', threeDee);
    }

});
