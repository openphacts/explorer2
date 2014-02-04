App.PathwayIndexController = Ember.ObjectController.extend({

  showProvenance: false,

  actions: {
  	  enableProvenance: function() {
    	this.set('showProvenance', true);
    	console.log("Pathway info provenance enabled");
	  },

  	  disableProvenance: function() {
      	this.set('showProvenance', false);
    	console.log("Pathway info provenance disabled");
  	  }
  }
  	
});