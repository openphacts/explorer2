App.TargetsPathwaysController = Ember.Controller.extend({

  needs: ['application'],

  queryParams: ['uri'],

  uri: '',

  page: null,

  showProvenance: false,

haveRecords: function() {
	return this.get('model.pathways.length') > 0;	
  }.property('model.pathways.length'),


  currentCount: function() {
    return this.get('model.pathways.length');
  }.property('model.pathways.length'),

  totalCount: null,

  notEmpty: function() {
    return this.get('totalCount') > 0;
  }.property('totalCount'),

  actions: {
  fetchMore: function() {
    if (this.currentCount < this.totalCount) {
    var me = this;
    var thisTarget = this.get('content');
    var searcher = new PathwaySearch(ldaBaseUrl, appID, appKey);
    var pathwaysByTargetCallback=function(success, status, response){
      if (success && response) {
        me.page++;
        var pathwayResults = searcher.parseByTargetPathwayResponse(response);
        $.each(pathwayResults, function(index, pathway) {
            pathwayID = pathway.identifier.split('/').pop();
            //have to find the pathway record and add it, just adding the ID does not work
            me.get('store').find('pathway', pathwayID).then(function(pathway) {
              thisTarget.get('pathways').pushObject(pathway);
            });
        });
      pageScrolling = false;
      enable_scroll();
      }
    };
    searcher.byTarget(thisTarget.get('URI'), null, null, 1, 50, null, pathwaysByTargetCallback);
    }
    pageScrolling = false;
    enable_scroll();
  },
  enableProvenance: function() {
    	this.get('showProvenance') === false ? this.set('showProvenance', true) : '';
	  },

  	  disableProvenance: function() {
      	this.get('showProvenance') === true ? this.set('showProvenance', false) : '';
  	  },

	  goToTop: function() {
      window.scrollTo(0,0);
  }
  
  }

});

