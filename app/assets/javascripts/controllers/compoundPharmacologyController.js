App.CompoundPharmacologyIndexController = Ember.ObjectController.extend({

  needs: "compound",

  page: 1,

  currentCount: 0,

  totalCount: 0

});

App.CompoundPharmacologyIndexController.reopen({
 
  fetchMore: function() {
    if (this.currentCount < this.totalCount) {
    var me = this;
    var thisCompound = this.get('content');
    var searcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);
    var pharmaCallback=function(success, status, response){
      if (success && response) {
        me.page++;
        var pharmaResults = searcher.parseCompoundPharmacologyResponse(response);
        $.each(pharmaResults, function(index, pharma) {
          var pharmaRecord = App.CompoundPharmacology.createRecord(pharma);
	  thisCompound.get('pharmacology').pushObject(pharmaRecord);
        });
        me.set('currentCount', me.get('currentCount') + pharmaResults.length);
      pageScrolling = false;
      enable_scroll();
      }
    };
    searcher.compoundPharmacology('http://www.conceptwiki.org/concept/' + thisCompound.id, this.page, 50, pharmaCallback);
    }
    pageScrolling = false;
    enable_scroll();
  }

});
