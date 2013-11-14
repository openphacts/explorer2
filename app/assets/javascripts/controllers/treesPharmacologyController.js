App.TreesPharmacologyController = Ember.ObjectController.extend({

  needs: "trees",

  page: null,

  currentCount: function() {
    return this.get('model.pharmacology.length');
  }.property('model.pharmacology.length'),

  totalCount: null,

  notEmpty: function() {
    return this.get('model.pharmacology.length') > 0;
  }.property('model.pharmacology.length'),

  fetching: false,
  
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
  },

  actions: {

  fetchMore: function() {
    if (this.get('model.pharmacology.length') < this.totalCount) {
    var me = this;
    var thisEnzyme = this.get('content');
    var searcher = new Openphacts.TreeSearch(ldaBaseUrl, appID, appKey);
    var pharmaCallback=function(success, status, response){
      if (success && response) {
        me.page++;
        var pharmaResults = searcher.parseTargetClassPharmacologyPaginated(response);
        $.each(pharmaResults, function(index, pharma) {
          var pharmaRecord = me.store.createRecord('treePharmacology', pharma);
	      thisEnzyme.get('pharmacology').pushObject(pharmaRecord);
        });
        me.set('fetching', false);
      } else {
        me.set('fetching', false);
      }
    };
    searcher.getTargetClassPharmacologyPaginated(thisEnzyme.id, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, this.page, 50, null, pharmaCallback);
    }
  }

  }

});
