App.CompoundsIndexController = Ember.ObjectController.extend({

  queryParams: ['uri'],
  uri: '',

  showProvenance: false,

  actions: {
  	  enableProvenance: function() {
    	this.set('showProvenance', true);
    	console.log("Compund provenance enabled");
	  },

  	  disableProvenance: function() {
      	this.set('showProvenance', false);
    	console.log("Compound provenance disabled");
  	  }
  }
	
});
