App.CompoundsPharmacologyController = Ember.ObjectController.extend({

  needs: ["compounds", "application"],

  getJobs: function() {
    return this.myJobs.get('length');
  }.property('myJobs.@each.percentage'),

  defaultUnitFilters: null,

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

	//   activityTypesSelected: function() {
	// var me = this;
	// var activitySearcher = new Openphacts.ActivitySearch(ldaBaseUrl, appID, appKey);
	// if (this.get('selectedActivity') != null) {
	//     // fetch the units for activity
	//   var callback=function(success, status, response){
	// 	if (success && response) {
	// 	    var units = activitySearcher.parseUnits(response);
	// 	    me.set('activityUnits', units);	
	//             //TODO the selected unit filter might not be valid for this activity so alert the user somehow
	// 	}
	//       };
	//       activitySearcher.getUnits(this.get('selectedActivity').label, null, callback);		
	// } else {
	//         // no activity type selected so reset to all units
	//         me.set('activityUnits', me.get('defaultUnitFilters'));	
	//         // find the previously selected unit and rest the unit select to it
	//         if (me.get('selectedUnit') != null) {
	//             var label = me.get('selectedUnit').label;
	//             $.each(me.get('defaultUnitFilters'), function(index, unit) {
	//                 if (unit.get('label') === label) {
	//                     me.set('selectedUnit', unit);
	//                 }
	//             });
	//         }
	//     }
	//   }.observes('selectedActivity'),

  page: null,

  showPharmaProvenance: false,

  currentCount: function() {
    return this.get('model.pharmacology.length');
  }.property('model.pharmacology.length'),

  totalCount: null,

  fetching: false,

  notEmpty: function() {
    return this.get('totalCount') > 0;
  }.property('totalCount'),

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

  targetNameSortASC: function() {
	return this.get('currentHeader') === "target_name" && this.get('sortedHeader') === "target_name";
  }.property('sortedHeader'),

  targetNameSortDESC: function() {
	return this.get('currentHeader') === "target_name" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  targetOrganismSortASC: function() {
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
	return this.get('currentHeader') === "pChembl" && this.get('sortedHeader') === "pChembl";
  }.property('sortedHeader'),

  pchemblSortDESC: function() {
	return this.get('currentHeader') === "pChembl" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  monitorTSVCreation: function(uuid) {
    var me = this;
    console.log("Monitor TSV file");
	var tsvCreateRequest = $.ajax({
		url: tsvStatusUrl,
        dataType: 'json',
		cache: true,
		data: {
			_format: "json",
			uuid: uuid,
		},
		success: function(response, status, request) {
			console.log('tsv monitor status ' + response.status);
		},
		error: function(request, status, error) {
			console.log('tsv create request success');
		}
	});
  },

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
	    var thisCompound = this.get('content');
	    thisCompound.get('pharmacology').clear();
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
	    var searcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);
	    var pharmaCallback=function(success, status, response){
	      if (success && response) {
	        me.page++;
	        var pharmaResults = searcher.parseCompoundPharmacologyResponse(response);
	        $.each(pharmaResults, function(index, pharma) {
	          var pharmaRecord = me.store.createRecord('compoundPharmacology', pharma);
		      thisCompound.get('pharmacology').pushObject(pharmaRecord);
	        });
	        me.set('fetching', false);
	      } else {
	        //failed response so scrolling is now allowed
	        me.set('fetching', false);
	      }
	    };
	    searcher.compoundPharmacology(thisCompound.get('URI'), assayOrganism, targetOrganism, activity, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, unit, activityRelation, actualPchemblValue, minPchemblValue, minExPchemblValue, maxPchemblValue, maxExPchemblValue, targetType, this.page + 1, 50, sortBy, lens, pharmaCallback);	
	},
	
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
  },

  tsvDownload: function(compound) {
    var me = this;
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
    var activityValueType = null;
    // only set activity filter if all filter boxes have been selected
    if (unit != null && activity != null && condition != null && currentActivityValue != null) {
	switch(condition)
	{
	case '>':
  	  activityValueType = "minExActivityValue";
	  break;
	case '<':
      activityValueType = "maxExActivityValue";
  	  break;
	case '=':
      activityValueType = "activityValue";
	  break;
	case '<=':
      activityValueType = "maxActivityValue";
	  break;
	case '>=':
      activityValueType = "minActivityValue";
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
    var pChemblValueType = null;
    if (pchemblCondition != null && currentPchemblValue != null) {
	switch(pchemblCondition)
	{
	case '>':
  	  pChemblValueType = "minExPchemblValue";
	  break;
	case '<':
      pChemblValueType = "maxExPchemblValue";
  	  break;
	case '=':
      pChemblValueType = "actualPchemblValue";
	  break;
	case '<=':
      pChemblValueType = "maxPchemblValue";
	  break;
	case '>=':
      pChemblValueType = "minPchemblValue";
	  break;
	}
    }
	var tsvCreateRequest = $.ajax({
		url: tsvCreateUrl,
        dataType: 'json',
		cache: true,
		data: {
			_format: "json",
			uri: this.get('content').get('URI'),
            total_count: me.totalCount,
            request_type: 'compound',
            pchembl_value_type: pChemblValueType,
            pchembl_value: currentPchemblValue,
            activity_relation: activityRelation,
            activity_value_type: activityValueType,
            activity_value: currentActivityValue,
            activity_type: activity,
            activity_unit: unit,
            assay_organism: assayOrganism,
            target_organism: targetOrganism
		},
		success: function(response, status, request) {
			console.log('tsv create request success');
            me.get('controllers.application').addJob(response.uuid);
            //me.monitorTSVCreation(response.uuid);
		},
		error: function(request, status, error) {
			console.log('tsv create request success');
		}
	});

  },

  fetchMore: function() {
    if (this.get('content').get('pharmacology').get('length') < this.totalCount && this.totalCount > 0) {
    this.set('fetching', true)
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
    var thisCompound = this.get('content');
    var searcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);
    me.set('fetching', true);
    var pharmaCallback=function(success, status, response){
      if (success && response) {
        me.page++;
        var pharmaResults = searcher.parseCompoundPharmacologyResponse(response);
        $.each(pharmaResults, function(index, pharma) {
          var pharmaRecord = me.store.createRecord('compoundPharmacology', pharma);
	      thisCompound.get('pharmacology').pushObject(pharmaRecord);
        });
        me.set('fetching', false);
      } else {
        //failed response so scrolling is now allowed
        me.set('fetching', false);
      }
    };
    //searcher.compoundPharmacology('http://www.conceptwiki.org/concept/' + thisCompound.id, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, this.page + 1, 50, sortBy, null, pharmaCallback);
    searcher.compoundPharmacology(thisCompound.get('URI'), assayOrganism, targetOrganism, activity, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, unit, activityRelation, actualPchemblValue, minPchemblValue, minExPchemblValue, maxPchemblValue, maxExPchemblValue, targetType, this.page + 1, 50, sortBy, lens, pharmaCallback);
    }
  },

  applyFilters: function() {
    console.log('apply filters');	
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
    var thisCompound = this.get('content');
    thisCompound.get('pharmacology').clear();
    me.set('fetching', true);
    var searcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);
    var pharmaCallback=function(success, status, response){
      if (success && response) {
        me.page++;
        var pharmaResults = searcher.parseCompoundPharmacologyResponse(response);
        $.each(pharmaResults, function(index, pharma) {
          var pharmaRecord = me.store.createRecord('compoundPharmacology', pharma);
	      thisCompound.get('pharmacology').pushObject(pharmaRecord);
        });
        me.set('fetching', false);
      } else {
        //failed response so scrolling is now allowed
        me.set('fetching', false);
      }
    };
    // get the count for these filters then get the first page of results
    var countCallback=function(success, status, response){
      $('#compoundPharmaFilterModalView').modal('toggle');
      $('#compoundPharmaFilterModalView').button('toggle');
      if (success && response) {
        var count = searcher.parseCompoundPharmacologyCountResponse(response);
        me.set('totalCount', count);
        if (count > 0) {
            searcher.compoundPharmacology(thisCompound.get('URI'), assayOrganism, targetOrganism, activity, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, unit, activityRelation, actualPchemblValue, minPchemblValue, minExPchemblValue, maxPchemblValue, maxExPchemblValue, targetType, 1, 50, null, lens, pharmaCallback);
        }
      }
    };
    searcher.compoundPharmacologyCount(thisCompound.get('URI'), assayOrganism, targetOrganism, activity, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, unit, activityRelation, actualPchemblValue, minPchemblValue, minExPchemblValue, maxPchemblValue, maxExPchemblValue, targetType, lens, countCallback);

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
      console.log("Compound pharma provenance enabled");
  },

  disableProvenance: function() {
      this.set('showPharmaProvenance', false);
      console.log("Compound pharma provenance disabled");
  }
  }


});
