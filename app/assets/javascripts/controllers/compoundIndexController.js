App.CompoundIndexController = Ember.ObjectController.extend({

  showProvenance: false,

  	  enableProvenance: function() {
    	this.set('showProvenance', true);
    	console.log("Compound provenance enabled");
	  },

  	  disableProvenance: function() {
      	this.set('showProvenance', false);
    	console.log("Compound provenance disabled");
  	  }
  	
});