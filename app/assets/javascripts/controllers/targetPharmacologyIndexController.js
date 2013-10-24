App.TargetPharmacologyIndexController = Ember.ArrayController.extend({

  needs: ["target"],

  page: null,

  currentCount: function() {
    return this.get('model.content.length');
  }.property('model.content.length'),

  totalCount: null,

  notEmpty: function() {
    return this.get('totalCount') > 0;
  }.property('totalCount'),

  fetching: false,

  fetchMore: function() {
    console.log('fetching more');
    if (this.get('model.content.length') < this.totalCount) {
    var me = this;
    var thisTarget = this.get('controllers.target').get('content');
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
        //failed response so allow scrolling
        me.set('fetching', false);
      }
    };
    searcher.targetPharmacology('http://www.conceptwiki.org/concept/' + thisTarget.id, this.page + 1, 50, pharmaCallback);
    }
  }

});
