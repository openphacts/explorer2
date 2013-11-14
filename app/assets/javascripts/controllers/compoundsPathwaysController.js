App.CompoundsPathwaysController = Ember.ObjectController.extend({


  page: null,

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
    var me = this;
    var thisCompound = this.get('content');
    var searcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
    var pathwaysByCompoundCallback=function(success, status, response){
      if (success && response) {
        me.page++;
        var pathwayResults = searcher.parseByCompoundPathwayResponse(response);
        $.each(pathwayResults, function(index, pathway) {
            pathwayID = pathway.identifier.split('/').pop();
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
    searcher.byCompound('http://www.conceptwiki.org/concept/' + thisCompound.id, null, null, 1, 50, null, pathwaysByCompoundCallback);
    }
  }
  }

});
