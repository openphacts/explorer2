App.EnzymePharmacologyIndexController = Ember.ObjectController.extend({

  needs: "enzyme",

  page: 1,

  currentCount: 0,

  totalCount: 0,

  empty: true,

});

App.EnzymePharmacologyIndexController.reopen({
 
  fetchMore: function() {
    if (this.currentCount < this.totalCount) {
    var me = this;
    var thisEnzyme = this.get('content');
    var searcher = new Openphacts.EnzymeSearch(ldaBaseUrl, appID, appKey);
    var pharmaCallback=function(success, status, response){
      if (success && response) {
        me.page++;
        var pharmaResults = searcher.parseEnzymePharmacologyResponse(response);
        $.each(pharmaResults, function(index, pharma) {
          var pharmaRecord = App.EnzymePharmacology.createRecord(pharma);
	  thisEnzyme.get('pharmacology').pushObject(pharmaRecord);
        });
        me.set('currentCount', me.get('currentCount') + pharmaResults.length);
      pageScrolling = false;
      enable_scroll();
      }
    };
    searcher.enzymePharmacology(thisEnzyme.id, this.page, 50, pharmaCallback);
    }
    pageScrolling = false;
    enable_scroll();
  }

});
