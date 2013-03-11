App.compoundsController = Ember.ArrayController.create({

   total_compounds: 0,

    addCompound: function(compound) {
        this.pushObject(compound);
    },
    addExactMatch: function(compound) {
        this.insertAt(0, compound);
    }

});
    
