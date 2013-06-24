App.EnzymePharmacologyIndexController = Ember.ObjectController.extend({

  needs: "enzyme",

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
    var countCallback = function(success, status, response) {
        if (success) {
            var count = searcher.parsePharmacologyCount(response);
            me.totalCount = count;
            if (count > 0) {
                searcher.fetchTarget(target.about, callback);        
            }
        }
    };

    searcher.getPharmacologyCount(target.about, countCallback);
  }

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
