App.CompoundPathwaysIndexController = Ember.ArrayController.extend({

  needs: "compound",

  page: 1,

  currentCount: function() {
    return this.get('model.content.length');
  }.property('model.content.length'),

  totalCount: 0,

  notEmpty: function() {
    return this.get('totalCount') > 0;
  }.property('totalCount')

});

App.CompoundPathwaysIndexController.reopen({
 
  fetchMore: function() {
    if (this.currentCount < this.totalCount) {
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
        me.set('currentCount', me.get('currentCount') + pathwayResults.length);
      pageScrolling = false;
      enable_scroll();
      }
    };
    searcher.byCompound('http://www.conceptwiki.org/concept/' + thisCompound.id, null, null, 1, 50, null, pathwaysByCompoundCallback);
    }
    pageScrolling = false;
    enable_scroll();
  }

});
