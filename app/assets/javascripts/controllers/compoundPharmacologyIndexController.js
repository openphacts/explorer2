App.CompoundPharmacologyIndexController = Ember.ArrayController.extend({

  needs: "compound",

  conditions: [">", "<", "=", "<=", ">="],

  activityTypes: null,

  activityUnits: null,

  activityTypesSelected: function() {
	var me = this;
	var activitySearcher = new Openphacts.ActivitySearch(ldaBaseUrl, appID, appKey);
	if (this.get('selectedActivity') != null) {
	    // fetch the units for activity
	  var callback=function(success, status, response){
		if (success && response) {
		    var units = activitySearcher.parseUnits(response);
		    me.set('activityUnits', units);	
		}
      };
      activitySearcher.getUnits(this.get('selectedActivity').label, null, callback);		
	}
  }.observes('selectedActivity'),

  page: null,

  currentCount: function() {
    return this.get('model.content.length');
  }.property('model.content.length'),

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

  targetNameSortASC: function() {
	return this.get('currentHeader') === "target_name" && this.get('sortedHeader') === "target_name";
  }.property('sortedHeader'),

  targetNameSortDESC: function() {
	return this.get('currentHeader') === "target_name" && this.get('sortedHeader') === null;
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
	    var thisCompound = this.get('controllers.compound').get('content');
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
	    searcher.compoundPharmacology('http://www.conceptwiki.org/concept/' + thisCompound.id, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, this.page + 1, 50, sortBy, null, pharmaCallback);	
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
    console.log("Create TSV file");
	var tsvCreateRequest = $.ajax({
		url: tsvCreateUrl,
        dataType: 'json',
		cache: true,
		data: {
			_format: "json",
			uri: 'http://www.conceptwiki.org/concept/' + compound.id,
            total_count: me.totalCount,
            request_type: 'compound'
		},
		success: function(response, status, request) {
			console.log('tsv create request success');
            me.monitorTSVCreation(response.uuid);
		},
		error: function(request, status, error) {
			console.log('tsv create request success');
		}
	});

  },

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

  fetchMore: function() {
    if (this.get('model.content.length') < this.totalCount) {
	    var sortBy = null;
	    if (this.get('currentHeader') !== null && this.get('sortedHeader') == null) {
		    // we have previously sorted descending on a header and it is still current
		    sortBy = 'DESC(?' + this.get('currentHeader') + ')';
     	} else if (this.get('currentHeader') !== null) {
	        //we have previously sorted on a header
	        sortBy = '?' + this.get('currentHeader');
        }
    var me = this;
    var thisCompound = this.get('controllers.compound').get('content');
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
    searcher.compoundPharmacology('http://www.conceptwiki.org/concept/' + thisCompound.id, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, this.page + 1, 50, sortBy, null, pharmaCallback);
    }
  }
  }

});
