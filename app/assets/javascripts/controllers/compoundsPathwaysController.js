App.CompoundsPathwaysController = Ember.ObjectController.extend({

  queryParams: ['uri'],

  uri: '',

  page: null,

  fetching: false,

  currentCount: function() {
    return this.get('model.pathways.length');
  }.property('model.pathways.length'),

  totalCount: null,

  notEmpty: function() {
    return this.get('totalCount') > 0;
  }.property('totalCount'),

  fetching: false,

actions: {
  fetchMore: function() {
    if (this.get('model.pathways.length') < this.totalCount) {
        me.set('fetching', true);
    var me = this;
    var thisCompound = this.get('content');
    var searcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
    var pathwaysByCompoundCallback=function(success, status, response){
      if (success && response) {
        me.page++;
        var pathwayResults = searcher.parseByCompoundResponse(response);
        $.each(pathwayResults, function(index, pathway) {
            pathwayID = pathway.identifier;
            //have to find the pathway record and add it, just adding the ID does not work
            me.get('store').find('pathway', pathwayID).then(function(pathway) {
              thisCompound.get('pathways').pushObject(pathway);
            });
        });
        me.set('fetching', false);
      } else {
        //failed response so scrolling is now allowed
        me.set('fetching', false);
      }
    };
    searcher.byCompound(thisCompound.get('URI'), null, null, me.page + 1, 50, null, pathwaysByCompoundCallback);
    }
  },
  goToTop: function() {
      window.scrollTo(0,0);
  }
  }

});
