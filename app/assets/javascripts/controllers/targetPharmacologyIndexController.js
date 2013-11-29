App.TargetPharmacologyIndexController = Ember.ArrayController.extend({

  needs: ["target"],

  greaterThan: false,

  lessThan: false,

  equalTo: false,

  greaterThanOrEqual: false,

  lessThanOrEqual: false,

  conditions: [">", "<", "=", "<=", ">="],

  activityRelations: [">", "<", "=", "<=", ">="],

  pchemblConditions: [">", "<", "=", "<=", ">="],

  activityTypes: null,

  activityUnits: null,

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

  page: null,
    
  showPharmaProvenance: false,

  currentCount: function() {
    return this.get('model.content.length');
  }.property('model.content.length'),

  totalCount: null,

  notEmpty: function() {
    return this.get('model.content.length') > 0;
  }.property('model.content.length'),

  fetching: false,

  inchikeySortASC: function() {
	return this.get('currentHeader') === "inchi_key" && this.get('sortedHeader') === "inchi_key";
  }.property('sortedHeader'),

  inchikeySortDESC: function() {
	return this.get('currentHeader') === "inchi_key" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  inchiSortASC: function() {
	return this.get('currentHeader') === "inchi" && this.get('sortedHeader') === "inchi";
  }.property('sortedHeader'),

  inchiSortDESC: function() {
	return this.get('currentHeader') === "inchi" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  smilesSortASC: function() {
	return this.get('currentHeader') === "smiles" && this.get('sortedHeader') === "smiles";
  }.property('sortedHeader'),

  smilesSortDESC: function() {
	return this.get('currentHeader') === "smiles" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  molweightSortASC: function() {
	return this.get('currentHeader') === "molweight" && this.get('sortedHeader') === "molweight";
  }.property('sortedHeader'),

  molweightSortDESC: function() {
	return this.get('currentHeader') === "molweight" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  compoundNameSortASC: function() {
	return this.get('currentHeader') === "compound_name" && this.get('sortedHeader') === "compound_name";
  }.property('sortedHeader'),

  compoundNameSortDESC: function() {
	return this.get('currentHeader') === "compound_name" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  targetOrgansismSortASC: function() {
	return this.get('currentHeader') === "target_organism" && this.get('sortedHeader') === "target_organism";
  }.property('sortedHeader'),

  targetOrganismSortDESC: function() {
	return this.get('currentHeader') === "target_organism" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  assayOrganismSortASC: function() {
	return this.get('currentHeader') === "assay_organism" && this.get('sortedHeader') === "assay_organism";
  }.property('sortedHeader'),

  assayOrganismSortDESC: function() {
	return this.get('currentHeader') === "assay_organism" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  assayDescriptionSortASC: function() {
	return this.get('currentHeader') === "assay_description" && this.get('sortedHeader') === "assay_description";
  }.property('sortedHeader'),

  assayDescriptionSortDESC: function() {
	return this.get('currentHeader') === "assay_description" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  activityTypeSortASC: function() {
	return this.get('currentHeader') === "activity_type" && this.get('sortedHeader') === "activity_type";
  }.property('sortedHeader'),

  activityTypeSortDESC: function() {
	return this.get('currentHeader') === "activity_type" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  activityRelationSortASC: function() {
	return this.get('currentHeader') === "activity_relation" && this.get('sortedHeader') === "activity_relation";
  }.property('sortedHeader'),

  activityRelationSortDESC: function() {
	return this.get('currentHeader') === "activity_relation" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  activityValueSortASC: function() {
	return this.get('currentHeader') === "activity_value" && this.get('sortedHeader') === "activity_value";
  }.property('sortedHeader'),

  activityValueSortDESC: function() {
	return this.get('currentHeader') === "activity_value" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  activityUnitSortASC: function() {
	return this.get('currentHeader') === "activity_unit" && this.get('sortedHeader') === "activity_unit";
  }.property('sortedHeader'),

  activityUnitSortDESC: function() {
	return this.get('currentHeader') === "activity_unit" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  pmidSortASC: function() {
	return this.get('currentHeader') === "pmid" && this.get('sortedHeader') === "pmid";
  }.property('sortedHeader'),

  pmidSortDESC: function() {
	return this.get('currentHeader') === "pmid" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  pchemblSortASC: function() {
	return this.get('currentHeader') === "pchembl" && this.get('sortedHeader') === "pchembl";
  }.property('sortedHeader'),

  pchemblSortDESC: function() {
	return this.get('currentHeader') === "pchembl" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  actions: {
	
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
	    this.clear();
	    this.set('page', 0);
	    this.set('fetching', true);
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
	        //failed response so scrolling is now allowed
	        me.set('fetching', false);
	      }
	    };
	    searcher.targetPharmacology('http://www.conceptwiki.org/concept/' + thisTarget.id, assayOrganism, targetOrganism, activity, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, unit, activityRelation, actualPchemblValue, minPchemblValue, minExPchemblValue, maxPchemblValue, maxExPchemblValue, targetType, this.get('page') + 1, 50, sortBy, lens, pharmaCallback);
	},

  fetchMore: function() {
    console.log('fetching more');
    if (this.get('model.content.length') < this.totalCount) {
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
		    var sortBy = null;
		    if (this.get('currentHeader') !== null && this.get('sortedHeader') == null) {
			    // we have previously sorted descending on a header and it is still current
			    sortBy = 'DESC(?' + this.get('currentHeader') + ')';
	     	} else if (this.get('currentHeader') !== null) {
		        //we have previously sorted on a header
		        sortBy = '?' + this.get('currentHeader');
	        }
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
    searcher.targetPharmacology('http://www.conceptwiki.org/concept/' + thisTarget.id, assayOrganism, targetOrganism, activity, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, unit, activityRelation, actualPchemblValue, minPchemblValue, minExPchemblValue, maxPchemblValue, maxExPchemblValue, targetType, this.get('page') + 1, 50, sortBy, lens, pharmaCallback);
    }
  },
  applyFilters: function() {
    console.log('apply filters');	
    var sortBy = null;
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
    var me = this;
    me.set('page', 0);
    var thisTarget = this.get('controllers.target').get('content');
    me.clear();
    me.set('fetching', true);
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
    // get the count for these filters then get the first page of results
    var countCallback=function(success, status, response){
      $('#targetPharmaFilterModalView').modal('toggle');
      $('#targetPharmaFilterModalView').button('toggle');
      if (success && response) {
        var count = searcher.parseTargetPharmacologyCountResponse(response);
        me.set('totalCount', count);
        if (count > 0) {
		    searcher.targetPharmacology('http://www.conceptwiki.org/concept/' + thisTarget.id, assayOrganism, targetOrganism, activity, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, unit, activityRelation, actualPchemblValue, minPchemblValue, minExPchemblValue, maxPchemblValue, maxExPchemblValue, targetType, me.get('page') + 1, 50, sortBy, lens, pharmaCallback);
        }
      }
    };
    searcher.targetPharmacologyCount('http://www.conceptwiki.org/concept/' + thisTarget.id, assayOrganism, targetOrganism, activity, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, unit, activityRelation, actualPchemblValue, minPchemblValue, minExPchemblValue, maxPchemblValue, maxExPchemblValue, targetType, lens, countCallback);

  },
  resetFilters: function() {
      console.log('reset filters');
      this.set('selectedActivity',null);
      this.set('selectedUnit', null);
      this.set('selectedCondition', null);
      this.set('activityValue', null);
      this.set('selectedRelation', null);
      this.set('pchemblValue', null);
      this.set('selectedPchemblCondition', null);
      this.set('selectedPchemblValue', null);
      this.set('assayOrganismQuery', null);
      this.set('targetOrganismQuery', null);
  },

  goToTop: function() {
      window.scrollTo(0,0);
  },
  enableProvenance: function() {
      this.set('showPharmaProvenance', true);
      console.log("Target pharma provenance enabled");
  },

  disableProvenance: function() {
      this.set('showPharmaProvenance', false);
      console.log("Target pharma provenance disabled");
  }
  }

  	

});
