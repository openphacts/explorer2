App.TreesPharmacologyController = Ember.ObjectController.extend({

  needs: ['trees', 'application'],

  queryParams: ['uri'],

  uri: '',

  page: null,

  currentCount: function() {
    return this.get('model.pharmacology.length');
  }.property('model.pharmacology.length'),

  totalCount: null,

  notEmpty: function() {
    return this.get('model.pharmacology.length') > 0;
  }.property('model.pharmacology.length'),

  sortedHeader: null,

  currentHeader: null,

  selectedActivity: null,

  selectedUnit: null,

  selectedCondition: null,

  activityValue: null,

  selectedRelation: null,

  pchemblValue: null,

  selectedPchemblCondition: null,

  selectedPchemblValue: null,

  assayOrganismQuery: null,

  targetOrganismQuery: null,

  // I'm sure all this can be done more elegantly but....

  prefLabelSortASC: function() {
	return this.get('currentHeader') === "prefLabel" && this.get('sortedHeader') === "prefLabel";
  }.property('sortedHeader'),

  preflabelSortDESC: function() {
	return this.get('currentHeader') === "prefLabel" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  descriptionSortASC: function() {
	return this.get('currentHeader') === "description" && this.get('sortedHeader') === "description";
  }.property('sortedHeader'),

  descriptionSortDESC: function() {
	return this.get('currentHeader') === "description" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

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
        me.get('controllers.application').set('fetching', false);
        enable_scroll();
      } else {
        me.get('controllers.application').set('fetching', false);
        enable_scroll();
      }
    };
    this.get('controllers.application').set('fetching', true);
    searcher.getTargetClassPharmacologyPaginated(thisEnzyme.id, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, this.page, 50, null, pharmaCallback);
    }
  },

	sortHeader: function(header) {
	console.log('sorting by ' + header);
    //first set all the current filters
    var assayOrganism = this.get('assayOrganismQuery');
    var targetOrganism = this.get('targetOrganismQuery');
    var targetType = null;
    var lens = null;
    var activity = this.get('selectedActivity') != null ? this.get('selectedActivity').label : null;
    var unit = this.get('selectedUnit') != null ? this.get('selectedUnit').label : null;
    var condition = this.get('selectedCondition') != null ? this.get('selectedCondition') : null;
    var currentActivityValue = this.get('activityValue') != null ? this.get('activityValue') : null;
    var activityRelation = null;
    var minActivityValue = null;
    var maxActivityValue = null;
    var maxExActivityValue = null;
    var activityValue = null;
    var minExActivityValue = null;
    // only set activity filter if all filter boxes have been selected
    if (unit != null && activity != null && condition != null && currentActivityValue != null) {
	switch(condition)
	{
	case '>':
  	  minExActivityValue = currentActivityValue;
	  break;
	case '<':
      maxExActivityValue = currentActivityValue;
  	  break;
	case '=':
      activityValue = currentActivityValue;
	  break;
	case '<=':
      maxActivityValue = currentActivityValue;
	  break;
	case '>=':
      minActivityValue = currentActivityValue;
	  break;
	}
    }

    var pchemblCondition = this.get('selectedPchemblCondition') != null ? this.get('selectedPchemblCondition') : null;
    var currentPchemblValue = this.get('pchemblValue') != null ? this.get('pchemblValue') : null;
    var minPchemblValue = null;
    var maxPchemblValue = null;
    var maxExPchemblValue = null;
    var minExPchemblValue = null;
    var actualPchemblValue = null;
    // pchembl filter only valid if all filter bits selected
    if (pchemblCondition != null && currentPchemblValue != null) {
	switch(pchemblCondition)
	{
	case '>':
  	  minExPchemblValue = currentPchemblValue;
	  break;
	case '<':
      maxExPchemblValue = currentPchemblValue;
  	  break;
	case '=':
      actualPchemblValue = currentPchemblValue;
	  break;
	case '<=':
      maxPchemblValue = currentPchemblValue;
	  break;
	case '>=':
      minPchemblValue = currentPchemblValue;
	  break;
	}
    }
    var activityRelations = [];
    if (this.get('greaterThan') === true) {
        activityRelations.push(">");
    }
    if (this.get('lessThan') === true) {
        activityRelations.push("<");
    }
    if (this.get('greaterThanOrEqual') === true) {
        activityRelations.push(">=");
    }
    if (this.get('lessThanOrEqual') === true) {
        activityRelations.push("<=");
    }
    if (this.get('equalTo') === true) {
        activityRelations.push("=");
    }
    // if there are any relations then add them all to the string with the "|" (OR) separator otherwise activityRelation will still be null
    // a trailing "|" is fine according to tests on the LD API
    if (activityRelations.length > 0) {
        activityRelation = "";
        $.each(activityRelations, function(index, relation) {
            activityRelation = activityRelation + relation + "|";
        });
    }
	    var thisTargetClass = this.get('content');
	    thisTargetClass.get('pharmacology').clear();
	    this.set('page', 0);
	    this.get('controllers.application').set('fetching', true);
	    var sortBy = '';
	    if (this.get('sortedHeader') === header) {
		    sortBy = 'DESC(?' + header + ')';
		    this.set('sortedHeader', null);
     	} else {
	        // keep track of the fact we have just sorted by this header so next time has to be descending for same one
	        sortBy = '?' + header;
	        this.set('sortedHeader', header);
	        this.set('currentHeader', header);
        }
	    var me = this;
    var pharmaCallback=function(success, status, response){
      if (success && response) {
        me.page++;
        var pharmaResults = searcher.parseTargetClassPharmacologyPaginated(response);
        $.each(pharmaResults, function(index, pharma) {
          var pharmaRecord = me.store.createRecord('treePharmacology', pharma);
	      thisTargetClass.get('pharmacology').pushObject(pharmaRecord);
        });
        me.get('controllers.application').set('fetching', false);
        enable_scroll();
      } else {
        me.get('controllers.application').set('fetching', false);
        enable_scroll();
      }
    };
    var searcher = new Openphacts.TreeSearch(ldaBaseUrl, appID, appKey);
    searcher.getTargetClassPharmacologyPaginated(thisTargetClass.get('uri'), assayOrganism, targetOrganism, activity, currentActivityValue, unit, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, activityRelation, actualPchemblValue, minPchemblValue, minExPchemblValue, maxPchemblValue, maxExPchemblValue, targetType, lens, this.page, 50, sortBy, pharmaCallback);	
	},

  goToTop: function() {
      window.scrollTo(0,0);
  }

  }

});
