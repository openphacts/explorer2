App.TargetPharmacologyIndexController = Ember.ArrayController.extend({

  needs: 'targets',

  page: null,

  currentCount: function() {
    return this.get('model.pharmacology.length');
  }.property('model.pharmacology.length'),

  totalCount: null,

  fetching: false,

  notEmpty: function() {
    return this.get('totalCount') > 0;
  }.property('totalCount'),

  fetching: false,

  fetchMore: function() {
    if (this.get('model.pharmacology.length') < this.totalCount) {
    var me = this;
    var thisTarget = this.get('content');
    var searcher = new Openphacts.TargetSearch(ldaBaseUrl, appID, appKey);
    var pharmaCallback=function(success, status, response){
      if (success && response) {
        me.page++;
        var pharmaResults = searcher.parseTargetPharmacologyResponse(response);
        $.each(pharmaResults, function(index, pharma) {
          var pharmaRecord = me.store.createRecord('targetPharmacology', pharma);
	      thisTarget.get('pharmacology').pushObject(pharmaRecord);
        });
        me.set('fetching', false);
      } else {
        //failed response so scrolling is now allowed
        me.set('fetching', false);
      }
    };
    searcher.targetPharmacology(thisTarget.get('URI'), this.page + 1, 50, pharmaCallback);
    }
  }

});
