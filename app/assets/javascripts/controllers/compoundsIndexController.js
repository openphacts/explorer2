App.CompoundsIndexController = Ember.ObjectController.extend({

  needs: ['application'],

  queryParams: ['uri'],
  uri: '',

  showProvenance: false,

  provenanceEnabled: function() {
    return this.get('showProvenance') === true;
  }.property('showProvenance'),  


  hasPathways: function() {
      if(this.get('model.pathwayRecords') != null && this.get('model.pathwayRecords') > 0) {
        return true;
      }
  }.property('model.pathwayRecords'),

  hasPharmacology: function() {
      if(this.get('model.pharmacologyRecords') != null && this.get('model.pharmacologyRecords') > 0) {
        return true;
      }
  }.property('model.pharmacologyRecords'),

  actions: {
  	  enableProvenance: function() {
    	this.get('showProvenance') === false ? this.set('showProvenance', true) : '';
	  },

  	  disableProvenance: function() {
      	this.get('showProvenance') === true ? this.set('showProvenance', false) : '';
  	  }
  }
	
});
