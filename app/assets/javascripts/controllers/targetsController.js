App.TargetsController = Ember.ArrayController.extend({

   total_compounds: 0,

    addCompound: function(target) {
        this.pushObject(target);
    },
    addExactMatch: function(target) {
        this.insertAt(0, target);
    },
  contract: function() {
    this.set('isExpanded', false);
  }

});
    
