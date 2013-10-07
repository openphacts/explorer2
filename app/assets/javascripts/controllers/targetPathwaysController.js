App.TargetPathwaysIndexController = Ember.ObjectController.extend({

  needs: "compound",

  page: 1,

  currentCount: 0,

  totalCount: 0,

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
        $.each(pathwayResults, function(index, pharma) {
          //var pharmaRecord = App.CompoundPharmacology.createRecord(pharma);
	      //thisCompound.get('pharmacology').pushObject(pharmaRecord);
        });
        me.set('currentCount', me.get('currentCount') + pathwayResults.length);
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
