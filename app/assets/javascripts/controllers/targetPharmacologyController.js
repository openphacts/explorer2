App.TargetPharmacologyIndexController = Ember.ObjectController.extend({

  needs: "target",

  page: 1

});

App.TargetPharmacologyIndexController.reopen({
 
  fetchMore: function() {
    console.log('fetching more');
    var me = this;
    var thisTarget = this.get('content');
    var searcher = new Openphacts.TargetSearch(ldaBaseUrl, appID, appKey);
    var pharmaCallback=function(success, status, response){
      if (success && response) {
        me.page++;
        var pharmaResults = searcher.parseTargetPharmacologyResponse(response);
        $.each(pharmaResults, function(index, pharma) {
          var pharmaRecord = App.TargetPharmacology.createRecord(pharma);
	  thisTarget.get('pharmacology').pushObject(pharmaRecord);
        });
      pageScrolling = false;
      enable_scroll();
      }
    };
    searcher.targetPharmacology('http://www.conceptwiki.org/concept/' + thisTarget.id, this.page, 50, pharmaCallback);
  }

});
