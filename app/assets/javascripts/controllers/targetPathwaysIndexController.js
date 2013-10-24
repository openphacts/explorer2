App.TargetPathwaysIndexController = Ember.ArrayController.extend({

  needs: ["compound", "target"],

  page: null,

  currentCount: function() {
    return this.get('model.content.length');
  }.property('model.content.length'),

  totalCount: null,

  notEmpty: function() {
    return this.get('totalCount') > 0;
  }.property('totalCount')

});

App.TargetPathwaysIndexController.reopen({
 
  fetchMore: function() {
    if (this.currentCount < this.totalCount) {
    var me = this;
    var thisTarget = this.get('content');
    var searcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
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
    searcher.byTarget('http://www.conceptwiki.org/concept/' + thisTarget.id, null, null, 1, 50, null, pathwaysByTargetCallback);
    }
    pageScrolling = false;
    enable_scroll();
  }

});
