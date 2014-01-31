App.TargetsIndexController = Ember.ObjectController.extend({

  needs: ['application'],

  queryParams: ['uri'],

  uri: '',

  showProvenance: false,

  actions: {
  	  enableProvenance: function() {
    	this.set('showProvenance', true);
    	console.log("Target provenance enabled");
	  },

  	  disableProvenance: function() {
      	this.set('showProvenance', false);
    	console.log("Target provenance disabled");
  	  }
  }

});
    