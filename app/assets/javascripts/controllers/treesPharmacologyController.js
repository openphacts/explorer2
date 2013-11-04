App.TreesPharmacologyController = Ember.ObjectController.extend({

  needs: "trees",

  page: 1,

  currentCount: 0,

  totalCount: 0,

  empty: true,

  notEmpty: function() {
    return this.get('model.pharmacology.length') > 0;
  }.property('model.pharmacology.length'),
  
  navigateTo: function(target) {
    var me = this;
    console.log(" val "  + target);
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

    searcher.fetchTarget(target, callback);
  }

});



App.TreesPharmacologyController.reopen({
 
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