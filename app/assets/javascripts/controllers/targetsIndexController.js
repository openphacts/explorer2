App.TargetsIndexController = Ember.ObjectController.extend({

  needs: ['application'],

  queryParams: ['uri'],

  uri: '',

  showProvenance: false,

  actions: {
  	  enableProvenance: function() {
    	this.get('showProvenance') === false ? this.set('showProvenance', true) : '';
	  },

  	  disableProvenance: function() {
      	this.get('showProvenance') === true ? this.set('showProvenance', false) : '';
  	  }
  }

});
    
