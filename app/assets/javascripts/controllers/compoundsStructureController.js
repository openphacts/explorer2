App.CompoundsStructureController = Ember.ObjectController.extend({

  needs: ['application'],

  thresholdTypes: [{type: 'Tanimoto', id: 0}, {type: 'Tversky', id: 1}, {type: 'Euclidian', id: 2}],

  selectedThresholdType: 0,

  structureSearchType: "exact",

  queryParams: ['uri', 'type'],

  thresholdPercent: 90,

  maxRecords: 100,

  filteredCompounds: null,

  uri: null,

  type: null,

  page: null,

  mwLowerValue: null,

  mwHigherValue: null,

  mwFreebaseLowerValue: null,

  mwFreebaseHigherValue: null,

  hBondAcceptorsLowerValue: null,

  hBondAcceptorsHigherValue: null,

  hBondDonorsLowerValue: null,

  hBondDonorsHigherValue: null,

  logPLowerValue: null,

  logPHigherValue: null,

  polarSurfaceAreaLowerValue: null,

  polarSurfaceAreaHigherValue: null,

  ro5LowerValue: null,

  ro5HigherValue: null,

  rbLowerValue: null,

  rbHigherValue: null,

  relLowerValue: null,

  relHigherValue: null,

  currentCount: function() {
    return this.get('model.structure.length');
  }.property('model.structure.length'),

  maxMWT: function() {
    var currentMax = 0;
    $.each(this.get('content.structure').get('content'), function(index, compound) {
      currentMax = compound.get('fullMWT') > currentMax ? compound.get('fullMWT') : currentMax;
    });
    this.set('mwHigherValue', currentMax);
    return currentMax;
  }.property('content.structure.length'),

  minMWT: function() {
    if (this.get('content.structure.length') > 0) {
      var currentMin = this.get('content.structure').get('content')[0].get('fullMWT');
      $.each(this.get('content.structure').get('content'), function(index, compound) {
        currentMin = compound.get('fullMWT') > currentMin ? compound.get('fullMWT') : currentMin;
      });
    this.set('mwLowerValue', currentMin);
    return currentMin;
    }
  }.property('content.structure.length'),

  maxMWFreebase: function() {
    var currentMax = 0;
    $.each(this.get('content.structure').get('content'), function(index, compound) {
      currentMax = compound.get('mwFreebase') > currentMax ? compound.get('mwFreebase') : currentMax;
    });
    this.set('mwFreebaseHigherValue', currentMax);
    return currentMax;
  }.property('content.structure.length'),

  minMWFreebase: function() {
    if (this.get('content.structure.length') > 0) {
      var currentMin = this.get('content.structure').get('content')[0].get('mwFreebase');
      $.each(this.get('content.structure').get('content'), function(index, compound) {
        currentMin = compound.get('mwFreebase') > currentMin ? compound.get('mwFreebase') : currentMin;
      });
    this.set('mwFreebaseLowerValue', currentMin);
    return currentMin;
    }
  }.property('content.structure.length'),

  maxHBondAcceptors: function() {
    var currentMax = 0;
    $.each(this.get('content.structure').get('content'), function(index, compound) {
      currentMax = compound.get('hba') > currentMax ? compound.get('hba') : currentMax;
    });
    this.set('hBondAcceptorsHigherValue', currentMax);
    return currentMax;
  }.property('content.structure.length'),

  minHBondAcceptors: function() {
    if (this.get('content.structure.length') > 0) {
      var currentMin = this.get('content.structure').get('content')[0].get('hba');
      $.each(this.get('content.structure').get('content'), function(index, compound) {
        currentMin = compound.get('hba') > currentMin ? compound.get('hba') : currentMin;
      });
    this.set('hBondAcceptorsLowerValue', currentMin);
    return currentMin;
    }
  }.property('content.structure.length'),

  maxHBondDonors: function() {
    var currentMax = 0;
    $.each(this.get('content.structure').get('content'), function(index, compound) {
      currentMax = compound.get('hbd') > currentMax ? compound.get('hbd') : currentMax;
    });
    this.set('hBondDonorsHigherValue', currentMax);
    return currentMax;
  }.property('content.structure.length'),

  minHBondDonors: function() {
    if (this.get('content.structure.length') > 0) {
      var currentMin = this.get('content.structure').get('content')[0].get('hbd');
      $.each(this.get('content.structure').get('content'), function(index, compound) {
        currentMin = compound.get('hbd') > currentMin ? compound.get('hbd') : currentMin;
      });
    this.set('hBondDonorsLowerValue', currentMin);
    return currentMin;
    }
  }.property('content.structure.length'),

  maxLogP: function() {
    var currentMax = 0;
    $.each(this.get('content.structure').get('content'), function(index, compound) {
      currentMax = compound.get('logp') > currentMax ? compound.get('logp') : currentMax;
    });
    this.set('logPHigherValue', currentMax);
    return currentMax;
  }.property('content.structure.length'),

  minLogP: function() {
    if (this.get('content.structure.length') > 0) {
      var currentMin = this.get('content.structure').get('content')[0].get('logp');
      $.each(this.get('content.structure').get('content'), function(index, compound) {
        currentMin = compound.get('logp') > currentMin ? compound.get('logp') : currentMin;
      });
    this.set('logPLowerValue', currentMin);
    return currentMin;
    }
  }.property('content.structure.length'),

  maxPSA: function() {
    var currentMax = 0;
    $.each(this.get('content.structure').get('content'), function(index, compound) {
      currentMax = compound.get('psa') > currentMax ? compound.get('psa') : currentMax;
    });
    this.set('polarSurfaceAreaHigherValue', currentMax);
    return currentMax;
  }.property('content.structure.length'),

  minPSA: function() {
    if (this.get('content.structure.length') > 0) {
      var currentMin = this.get('content.structure').get('content')[0].get('psa');
      $.each(this.get('content.structure').get('content'), function(index, compound) {
        currentMin = compound.get('psa') > currentMin ? compound.get('psa') : currentMin;
      });
    this.set('polarSurfaceAreaLowerValue', currentMin);
    return currentMin;
    }
  }.property('content.structure.length'),

  maxRO5: function() {
    var currentMax = 0;
    $.each(this.get('content.structure').get('content'), function(index, compound) {
      currentMax = compound.get('ro5Violations') > currentMax ? compound.get('ro5Violations') : currentMax;
    });
    this.set('ro5HigherValue', currentMax);
    return currentMax;
  }.property('content.structure.length'),

  minRO5: function() {
    if (this.get('content.structure.length') > 0) {
      var currentMin = this.get('content.structure').get('content')[0].get('ro5Violations');
      $.each(this.get('content.structure').get('content'), function(index, compound) {
        currentMin = compound.get('ro5Violations') > currentMin ? compound.get('ro5Violations') : currentMin;
      });
    this.set('ro5LowerValue', currentMin);
    return currentMin;
    }
  }.property('content.structure.length'),

  maxRB: function() {
    var currentMax = 0;
    $.each(this.get('content.structure').get('content'), function(index, compound) {
      currentMax = compound.get('rtb') > currentMax ? compound.get('rtb') : currentMax;
    });
    this.set('rbHigherValue', currentMax);
    return currentMax;
  }.property('content.structure.length'),

  minRB: function() {
    if (this.get('content.structure.length') > 0) {
      var currentMin = this.get('content.structure').get('content')[0].get('rtb');
      $.each(this.get('content.structure').get('content'), function(index, compound) {
        currentMin = compound.get('rtb') > currentMin ? compound.get('rtb') : currentMin;
      });
    this.set('rbLowerValue', currentMin);
    return currentMin;
    }
  }.property('content.structure.length'),

  maxRel: function() {
    var currentMax = 0;
    $.each(this.get('content.structure').get('content'), function(index, compound) {
      currentMax = compound.get('relevance') > currentMax ? compound.get('relevance') : currentMax;
    });
    this.set('relHigherValue', currentMax);
    return currentMax;
  }.property('content.structure.length'),

  minRel: function() {
    if (this.get('content.structure.length') > 0) {
      var currentMin = this.get('content.structure').get('content')[0].get('relevance');
      $.each(this.get('content.structure').get('content'), function(index, compound) {
        currentMin = compound.get('relevance') > currentMin ? compound.get('relevance') : currentMin;
      });
    this.set('relLowerValue', currentMin);
    return currentMin;
    }
  }.property('content.structure.length'),

  currentCount: function() {
    return this.get('model.structure.length');
  }.property('model.structure.length'),

  totalCount: null,

  sortedHeader: null,

  currentHeader: null,

  structure: (function() {
    return Ember.ArrayProxy.createWithMixins(Ember.SortableMixin, {
      sortProperties: null,
      sortAscending: false,
      content: this.get('filteredCompounds')
    });
  }).property('filteredCompounds'),

  notEmpty: function() {
    return this.get('totalCount') > 0;
  }.property('totalCount'),

  exactSearch: function() {
    return this.get('structureSearchType') === "exact";
  }.property('structureSearchType'),

  subSearch: function() {
    return this.get('structureSearchType') === "substructure";
  }.property('structureSearchType'),

  simSearch: function() {
    return this.get('structureSearchType') === "similarity";
  }.property('structureSearchType'),

  prefLabelSortASC: function() {
	return this.get('currentHeader') === "prefLabel" && this.get('sortedHeader') === "prefLabel";
  }.property('sortedHeader'),

  prefLabelSortDESC: function() {
	return this.get('currentHeader') === "prefLabel" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  descriptionSortASC: function() {
	return this.get('currentHeader') === "description" && this.get('sortedHeader') === "description";
  }.property('sortedHeader'),

  descriptionSortDESC: function() {
	return this.get('currentHeader') === "description" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  biotransSortASC: function() {
	return this.get('currentHeader') === "biotransformationItem" && this.get('sortedHeader') === "biotransformationItem";
  }.property('sortedHeader'),

  biotransSortDESC: function() {
	return this.get('currentHeader') === "biotransformationItem" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  toxicitySortASC: function() {
	return this.get('currentHeader') === "toxicity" && this.get('sortedHeader') === "toxicity";
  }.property('sortedHeader'),

  toxicitySortDESC: function() {
	return this.get('currentHeader') === "toxicity" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  proteinBindingSortASC: function() {
	return this.get('currentHeader') === "proteinBinding" && this.get('sortedHeader') === "proteinBinding";
  }.property('sortedHeader'),

  proteinBindingSortDESC: function() {
	return this.get('currentHeader') === "proteinBinding" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  smilesSortASC: function() {
	return this.get('currentHeader') === "smiles" && this.get('sortedHeader') === "smiles";
  }.property('sortedHeader'),

  smilesSortDESC: function() {
	return this.get('currentHeader') === "smiles" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  chemblURISortASC: function() {
	return this.get('currentHeader') === "chemblURI" && this.get('sortedHeader') === "chemblURI";
  }.property('sortedHeader'),

  chemblURISortDESC: function() {
	return this.get('currentHeader') === "chemblURI" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  fullMWTSortASC: function() {
	return this.get('currentHeader') === "fullMWT" && this.get('sortedHeader') === "fullMWT";
  }.property('sortedHeader'),

  fullMWTSortDESC: function() {
	return this.get('currentHeader') === "fullMWT" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  hbaSortASC: function() {
	return this.get('currentHeader') === "hba" && this.get('sortedHeader') === "hba";
  }.property('sortedHeader'),

  hbaSortDESC: function() {
	return this.get('currentHeader') === "hba" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  hbdSortASC: function() {
	return this.get('currentHeader') === "hbd" && this.get('sortedHeader') === "hbd";
  }.property('sortedHeader'),

  hbdSortDESC: function() {
	return this.get('currentHeader') === "hbd" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  inchiSortASC: function() {
	return this.get('currentHeader') === "inchi" && this.get('sortedHeader') === "inchi";
  }.property('sortedHeader'),

  inchiSortDESC: function() {
	return this.get('currentHeader') === "inchi" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  inchiKeySortASC: function() {
	return this.get('currentHeader') === "inchiKey" && this.get('sortedHeader') === "inchiKey";
  }.property('sortedHeader'),

  inchiKeySortDESC: function() {
	return this.get('currentHeader') === "inchiKey" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  logpSortASC: function() {
	return this.get('currentHeader') === "logp" && this.get('sortedHeader') === "logp";
  }.property('sortedHeader'),

  logpSortDESC: function() {
	return this.get('currentHeader') === "logp" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  molformSortASC: function() {
	return this.get('currentHeader') === "molform" && this.get('sortedHeader') === "molform";
  }.property('sortedHeader'),

  molformSortDESC: function() {
	return this.get('currentHeader') === "molform" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  mwFreebaseSortASC: function() {
	return this.get('currentHeader') === "mwFreebase" && this.get('sortedHeader') === "mwFreebase";
  }.property('sortedHeader'),

  mwFreebaseSortDESC: function() {
	return this.get('currentHeader') === "mwFreebase" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  psaSortASC: function() {
	return this.get('currentHeader') === "psa" && this.get('sortedHeader') === "psa";
  }.property('sortedHeader'),

  psaSortDESC: function() {
	return this.get('currentHeader') === "psa" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  ro5ViolationsSortASC: function() {
	return this.get('currentHeader') === "ro5Violations" && this.get('sortedHeader') === "ro5Violations";
  }.property('sortedHeader'),

  ro5ViolationsSortDESC: function() {
	return this.get('currentHeader') === "ro5Violations" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  rtbSortASC: function() {
	return this.get('currentHeader') === "rtb" && this.get('sortedHeader') === "rtb";
  }.property('sortedHeader'),

  rtbSortDESC: function() {
	return this.get('currentHeader') === "rtb" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  relevanceSortASC: function() {
	return this.get('currentHeader') === "relevance" && this.get('sortedHeader') === "relevance";
  }.property('sortedHeader'),

  relevanceSortDESC: function() {
	return this.get('currentHeader') === "relevance" && this.get('sortedHeader') === null;
  }.property('sortedHeader'),

  actions: {
     structureSearchType: function(type) {
       console.log("Set structure search type: " + type);
       var structureType = type;
       if (structureType == null ) {
         structureType = this.structureSearchType;
       }
       if (structureType == null) {
         structureType = "exact";
       }
       //reset sorting
       this.get('structure').set('sortProperties', null);
       this.get('structure').set('sortAscending', null);
	   this.set('sortedHeader', null);
	   this.set('currentHeader', null);
       this.set('structureSearchType', structureType);
       var me = this;
       var thisCompound = this.get('content');
       thisCompound.get('structure').clear();
       // grab the threshold percent and max records value from the dom since these are not ember views but standard html elements
       this.set('thresholdPercent', $('#threshold-percent')[0].value);
       this.set('maxRecords', $('#max-records')[0].value);
       var searcher = new Openphacts.StructureSearch(ldaBaseUrl, appID, appKey);
       var callback=function(success, status, response){
         if (success && response) {
            me.get('controllers.application').set('fetching', false);
             var results = null;
             if (structureType == "exact") {
                 results = searcher.parseExactResponse(response);
                 me.set('totalCount', results.length);
                 $.each(results, function(index, result) {
                   me.get('store').find('compound', result).then(function(compound) {
		               thisCompound.get('structure').pushObject(compound);
                   });
                 });
             } else if (structureType == "similarity") {
                 results = searcher.parseSimilarityResponse(response);
                 me.set('totalCount', results.length);
                 var relevance = {};
                 $.each(results, function(index, result) {
                   var about = result.about;
                   var relVal = result.relevance;
                   result['relevance'] = relVal;
                   me.get('store').find('compound', about).then(function(compound) {
                       compound.set('relevance', relVal);
		               thisCompound.get('structure').pushObject(compound);
                   });
                 }); 
             } else if (structureType == "substructure") {
                 results = searcher.parseSubstructureResponse(response);
                 me.set('totalCount', results.length);
                 var relevance = {};
                 $.each(results, function(index, result) {
                   var about = result.about;
                   var relVal = result.relevance;
                   result['relevance'] = relVal;
                   me.get('store').find('compound', about).then(function(compound) {
                       compound.set('relevance', relVal);
		               thisCompound.get('structure').pushObject(compound);
                   });
                 });
             }
         }
       };
       if (structureType == "exact") {
           this.get('controllers.application').set('fetching', true);
           searcher.exact(thisCompound.get('smiles'), null, callback);
       } else if (structureType == "similarity") {
           this.get('controllers.application').set('fetching', true);
           searcher.similarity(thisCompound.get('smiles'), this.selectedThresholdType, this.thresholdPercent, null, null, 1, this.maxRecords, callback);
       } else if (structureType == "substructure") {
           this.get('controllers.application').set('fetching', true);
           searcher.substructure(thisCompound.get('smiles'), null, 1, this.maxRecords, callback);
       }
     },

     fetchMore: function() {
       console.log('fetch more structures');
     },

     sortHeader: function(header) {
       var sortHeader=[];
       sortHeader.push(header);
       if (this.get('currentHeader') === header && this.get('sortedHeader') === header) {
         this.get('structure').set('sortProperties', sortHeader);
         this.get('structure').set('sortAscending', false);
         //descending
         //reset so next time for same one will be ascending
         this.set('sortedHeader', null);
       } else {
         //ascending
         //next time will be descending
         this.get('structure').set('sortProperties', sortHeader);
         this.get('structure').set('sortAscending', true);
	     this.set('sortedHeader', header);
	     this.set('currentHeader', header);
       }
    },

    tsvDownload: function() {
    var me = this;
    var uris = [];
    $.each(this.get('content').get('structure').get('content'), function(index, compound) {
        uris.push(compound.get('URI'));
    });
    
    var filtersString = "";
    if (this.structureSearchType === "similarity") {
        filtersString += "Similarity structure search";
        switch(this.selectedThresholdType)
        {
        case 0:
          filtersString += ": threshold type=Tanimoto";
          break;
        case 1:
          filtersString += ": threshold type=Tversky";
          break;
        case 2:
          filtersString += ": threshold type=Euclidian";
          break;
        }
        filtersString += ": threshold=" + this.thresholdPercent;
        filtersString += ": max records=" + this.maxRecords;
    } else if (this.structureSearchType === "substructure") {
        filtersString += "Sub-structure search";
        filtersString += ": max records=" + this.maxRecords;
    } else {
        filtersString += "Exact structure search";
    }

    var thisCompound = this.get('content');
	var tsvCreateRequest = $.ajax({
		url: cs_download_url,
        dataType: 'json',
		cache: true,
        type: "POST",
		data: {
			_format: "json",
			uris: uris,
            total: me.get('totalCount')
		},
		success: function(response, status, request) {
			console.log('tsv create request success');
            me.get('controllers.application').addJob(response.uuid, thisCompound.get('prefLabel'), filtersString);
            //me.monitorTSVCreation(response.uuid);
		},
		error: function(request, status, error) {
			console.log('tsv create request success');
		}
	});
    },

    applyFilters: function() {
	  console.log('compound structure filters');
	  // mwLowerValue: null,
	  // 
	  // mwHigherValue: null,
	  // 
	  // mwFreebaseLowerValue: null,
	  // 
	  // mwFreebaseHigherValue: null,
	  // 
	  // hBondAcceptorsLowerValue: null,
	  // 
	  // hBondAcceptorsHigherValue: null,
	  // 
	  // hBondDonorsLowerValue: null,
	  // 
	  // hBondDonorsHigherValue: null,
	  // 
	  // logPLowerValue: null,
	  // 
	  // logPHigherValue: null,
	  // 
	  // polarSurfaceAreaLowerValue: null,
	  // 
	  // polarSurfaceAreaHigherValue: null,
	  // 
	  // ro5LowerValue: null,
	  // 
	  // ro5HigherValue: null,
	  // 
	  // rbLowerValue: null,
	  // 
	  // rbHigherValue: null,
	  // 
	  // relLowerValue: null,
	  // 
	  // relHigherValue: null,
	
	
    }

  }
});
