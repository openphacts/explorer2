App.CompoundPharmacologyIndexController = Ember.ObjectController.extend({

  needs: "compound",

  page: 1,

  currentCount: 0,

  totalCount: 0,

  navigateTo: function(target) {
    var me = this;
    console.log(target.about);
    var searcher = new Openphacts.TargetSearch(ldaBaseUrl, appID, appKey);
    var this_target = App.Target.createRecord();  
    var callback=function(success, status, response){
        if (success) {
            var targetResult = searcher.parseTargetResponse(response);
            this_target.setProperties(targetResult);
            me.target.transitionTo('target', this_target);
        } else {
            alert("Could not find information about " + target.title);
        }
    };  
    searcher.fetchTarget(target.about, callback);
  }

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
