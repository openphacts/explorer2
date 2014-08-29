App.CompoundsStructureController = Ember.ObjectController.extend({

  needs: ['application'],
 
  searchOptionsVisible: function() {
    return this.get('structureSearchType') === 'exact' || this.get('structureSearchType') === 'similarity';
  }.property('structureSearchType'),
  //structure search type radio button selection
  isSelected: 1,

  isExactSearch:  function() {
    return this.get('structureSearchType') === 'exact';
  }.property('structureSearchType'),

  isSubstructureSearch: function() {
    return this.get('structureSearchType') === 'substructure';
  }.property('structureSearchType'),

  isSimilaritySearch: function() {
    return this.get('structureSearchType') === 'similarity';
  }.property('structureSearchType'),

  exactMatch: true, 

  substructureMatch: false,

  similarityMatch: false,

  smilesValue: null,

  //placeholder for smiles
  origSmilesValue: null,

  searchTypes: [{type: 'Exact', value: 'exact'}, {type: 'Sub-structure', value: 'substructure'}, {type: 'Similarity', value: 'similarity'}],

  thresholdTypes: [{type: 'Tanimoto', id: 0}, {type: 'Tversky', id: 1}, {type: 'Euclidian', id: 2}],

  matchTypes: [{type: 'exact', id: 0}, {type: 'All Tautomers', id: 1}, {type: 'Same skeleton including H', id: 2}, {type: 'Same skeleton excluding H', id: 3}, {type: 'Isomers', id: 4}],

  selectedMatchType: 0,

  selectedThresholdType: 0,

  structureSearchType: "exact",

  //placeholder for the initial search type the route was entered with
  initStructureSearchType: null,

  queryParams: ['smiles', 'type', 'thresholdtype', 'match', 'threshold', 'records'],

  smiles: null,

  thresholdtype: null,

  match: null,

  threshold: null,

  records: null,

  thresholdPercent: 0.90,

  maxRecords: 100,

  filteredCompounds: [],

  uri: null,

  type: null,

  page: null,

  totalCount: null,

  sortedHeader: null,

  currentHeader: null,

  mwSelectedLowerValue: null,

  mwSelectedHigherValue: null,

  mwSelectedFreebaseLowerValue: null,

  mwSelectedFreebaseHigherValue: null,

  hBondAcceptorsSelectedLowerValue: null,

  hBondAcceptorsSelectedHigherValue: null,

  hBondDonorsSelectedLowerValue: null,

  hBondDonorsSelectedHigherValue: null,

  logPSelectedLowerValue: null,

  logPSelectedHigherValue: null,

  polarSurfaceAreaSelectedLowerValue: null,

  polarSurfaceAreaSelectedHigherValue: null,

  ro5SelectedLowerValue: null,

  ro5SelectedHigherValue: null,

  rbSelectedLowerValue: null,

  rbSelectedHigherValue: null,

  relSelectedLowerValue: null,

  relSelectedHigherValue: null,

  getMolfile: function() {
    return this.get('controllers.application').get('molfile');
  },

  currentCount: function() {
    return this.get('filteredCompounds.length');
  }.property('filteredCompounds.length'),

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
    if (this.get('initStructureSearchType') === "exact") {
	  this.set('exactMatch', true);
	  return true;
    } else {
	  this.set('exactMatch', false);
	  return false;
    }
  }.property('structureSearchType'),

  subSearch: function() {
    if (this.get('initStructureSearchType') === "substructure") {
	  this.set('substructureMatch', true);
	  return true;
    } else {
	  this.set('substructureMatch', false);
	  return false;
    }

  }.property('structureSearchType'),

  simSearch: function() {
    if (this.get('initStructureSearchType') === "similarity") {
	  this.set('similarityMatch', true);
	  return true;
    } else {
	  this.set('similarityMatch', false);
	  return false;
    }
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
	   this.get('filteredCompounds').clear();
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
       // reset all the filters
       this.set('mwSelectedLowerValue', null);
       this.set('mwSelectedHigherValue', null);
       this.set('mwSelectedFreebaseLowerValue', null);
       this.set('mwSelectedFreebaseHigherValue', null);
       this.set('hBondAcceptorsSelectedLowerValue', null);
       this.set('hBondAcceptorsSelectedHigherValue', null);
       this.set('hBondDonorsSelectedLowerValue', null);
       this.set('hBondDonorsSelectedHigherValue', null);
       this.set('logPSelectedLowerValue', null);
       this.set('logPSelectedHigherValue', null);
       this.set('polarSurfaceAreaSelectedLowerValue', null);
       this.set('polarSurfaceAreaSelectedHigherValue', null);
       this.set('ro5SelectedLowerValue', null);
       this.set('ro5SelectedHigherValue', null);
       this.set('rbSelectedLowerValue', null);
       this.set('rbSelectedHigherValue', null);
       this.set('relSelectedLowerValue', null);
       this.set('relSelectedHigherValue', null);
       // TODO turn the thresholdPercent and maxRecords input into ember views
       // grab the threshold percent and max records value from the dom since these are not ember views but standard html elements
       //if (this.get('similarityMatch') === true) {
       //	     this.set('thresholdPercent', $('#threshold-percent')[0].value);
       //	   }
       //this.set('maxRecords', $('#max-records')[0].value);
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
                       me.get('filteredCompounds').pushObject(compound);
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
                       me.get('filteredCompounds').pushObject(compound);
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
                       me.get('filteredCompounds').pushObject(compound);
                   });
                 });
             }
         } else {
	        me.get('controllers.application').set('fetching', false);
		    App.FlashQueue.pushFlash('error', 'No compound(s) found for this structure search type.');
         }
       };
       if (structureType == "exact") {
           this.get('controllers.application').set('fetching', true);
           searcher.exact(thisCompound.get('smiles'), this.get('selectedMatchType'), callback);
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
    $.each(this.get('filteredCompounds'), function(index, compound) {
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
        //filtersString += ": max records=" + this.maxRecords;
    } else if (this.structureSearchType === "substructure") {
        filtersString += "Sub-structure search";
        //filtersString += ": max records=" + this.maxRecords;
    } else {
        filtersString += "Exact structure search";
    }

    var thisCompound = this.get('content');
	var tsvCreateRequest = $.ajax({
		url: cs_download_url,
        dataType: 'json',
		cache: true,
		// send as post because it can be a really long query string
        type: "POST",
		data: {
			_format: "json",
			uris: uris,
            total: me.get('filteredCompounds').length
		},
		success: function(response, status, request) {
			console.log('tsv create request success');
            me.get('controllers.application').addJob(response.uuid, thisCompound.get('prefLabel'), filtersString);
			App.FlashQueue.pushFlash('notice', 'Creating TSV file for download. You will be alerted when ready.');
            //me.monitorTSVCreation(response.uuid);
		},
		error: function(request, status, error) {
			console.log('tsv create request error');
			  App.FlashQueue.pushFlash('error', 'Could not create TSV file, please contact support quoting error: ' + error);
		}
	});
    },

    applyFilters: function() {
	  console.log('compound structure filters');
	  var me = this;
	  me.get('filteredCompounds').clear();
	  $.each(me.get('content.structure.content'), function(index, compound) {
		    var mwFilter = false;
		    var mwFreebaseFilter = false;
		    var hbaFilter = false;
		    var hbdFilter = false;
		    var logpFilter = false;
		    var ro5Filter = false;
		    var psaFilter = false;
		    var rtbFilter = false;
		    var relFilter = false;
			if (me.get('mwSelectedLowerValue') != "" && me.get('mwSelectedHigherValue') != "" && me.get('mwSelectedLowerValue') != null && me.get('mwSelectedHigherValue') != null && Number(me.get('mwSelectedLowerValue')) <= Number(me.get('mwSelectedHigherValue'))) {
              if (Number(compound.get('fullMWT')) >= Number(me.get('mwSelectedLowerValue')) && Number(compound.get('fullMWT')) <= Number(me.get('mwSelectedHigherValue'))) {
	            // compound is within the params so we add it 
	            mwFilter = true;          
              }
		    } else {
			  // this filter is valid since we are not checking it so we would add the compound regardless
			  mwFilter = true;
		    }
			if (me.get('mwFreebaseSelectedLowerValue') != "" && me.get('mwFreebaseHigherValue') != "" && me.get('mwFreebaseSelectedLowerValue') != null && me.get('mwFreebaseSelectedHigherValue') != null && Number(me.get('mwFreebaseSelectedLowerValue')) <= Number(me.get('mwFreebaseSelectedHigherValue'))) {
              if (Number(compound.get('mwFreebase')) >= Number(me.get('mwFreebaseSelectedLowerValue')) && Number(compound.get('mwFreebase')) <= Number(me.get('mwFreebaseSelectedHigherValue'))) {
                mwFreebaseFilter = true;
              }
		    } else {
			  mwFreebaseFilter = true;
		    }	      	
			if (me.get('hBondAcceptorsSelectedLowerValue') != "" && me.get('hBondAcceptorsSelectedHigherValue') != "" && me.get('hBondAcceptorsSelectedLowerValue') != null && me.get('hBondAcceptorsSelectedHigherValue') != null && Number(me.get('hBondAcceptorsSelectedLowerValue')) <= Number(me.get('hBondAcceptorsSelectedHigherValue'))) {
              if (Number(compound.get('hba')) >= Number(me.get('hBondAcceptorsSelectedLowerValue')) && Number(compound.get('hba')) <= Number(me.get('hBondAcceptorsSelectedHigherValue'))) {
                hbaFilter = true;
              }
		    } else {
			  hbaFilter = true;
		    }
			if (me.get('hBondDonorsSelectedLowerValue') != "" && me.get('hBondDonorsSelectedHigherValue') != "" && me.get('hBondDonorsSelectedLowerValue') != null && me.get('hBondDonorsSelectedHigherValue') != null && Number(me.get('hBondDonorsSelectedLowerValue')) <= Number(me.get('hBondDonorsSelectedHigherValue'))) {
              if (Number(compound.get('hbd')) >= Number(me.get('hBondDonorsSelectedLowerValue')) && Number(compound.get('hbd')) <= Number(me.get('hBondDonorsSelectedHigherValue'))) {
                hbdFilter = true;
              }
		    } else {
			  hbdFilter = true;
		    }
			if (me.get('logPSelectedLowerValue') != "" && me.get('logPSelectedHigherValue') != "" && me.get('logPSelectedLowerValue') != null && me.get('logPSelectedHigherValue') != null && Number(me.get('logPSelectedLowerValue')) <= Number(me.get('logPSelectedHigherValue'))) {
              if (Number(compound.get('logp')) >= Number(me.get('logPSelectedLowerValue')) && Number(compound.get('logp')) <= Number(me.get('logPSelectedHigherValue'))) {
                logpFilter = true;
              }
		    } else {
			  logpFilter = true;
		    }
			if (me.get('ro5SelectedLowerValue') != "" && me.get('ro5SelectedHigherValue') != "" && me.get('ro5SelectedLowerValue') != null && me.get('ro5SelectedHigherValue') != null && Number(me.get('ro5SelectedLowerValue')) <= Number(me.get('ro5SelectedHigherValue'))) {
              if (Number(compound.get('ro5Violations')) >= Number(me.get('ro5SelectedLowerValue')) && Number(compound.get('ro5Violations')) <= Number(me.get('ro5SelectedHigherValue'))) {
                ro5Filter = true;
              }
		    } else {
			  ro5Filter = true;
		    }
			if (me.get('polarSurfaceAreaSelectedLowerValue') != "" && me.get('polarSurfaceAreaSelectedHigherValue') != "" && me.get('polarSurfaceAreaSelectedLowerValue') != null && me.get('polarSurfaceAreaSelectedHigherValue') != null && Number(me.get('polarSurfaceAreaSelectedLowerValue')) <= Number(me.get('polarSurfaceAreaSelectedHigherValue'))) {
              if (Number(compound.get('psa')) >= Number(me.get('polarSurfaceAreaSelectedLowerValue')) && Number(compound.get('psa')) <= Number(me.get('polarSurfaceAreaSelectedHigherValue'))) {
                psaFilter = true;
              }
		    } else {
			  psaFilter = true;
		    }
			if (me.get('rbSelectedLowerValue') != "" && me.get('rbSelectedHigherValue') != "" && me.get('rbSelectedLowerValue') != null && me.get('rbSelectedHigherValue') != null && Number(me.get('rbSelectedLowerValue')) <= Number(me.get('rbSelectedHigherValue'))) {
              if (Number(compound.get('rtb')) >= Number(me.get('rbSelectedLowerValue')) && Number(compound.get('rtb')) <= Number(me.get('rbSelectedHigherValue'))) {
                rtbFilter = true;
              }
		    } else {
			  rtbFilter = true;
		    }
			if (me.get('relSelectedHigherValue') != "" && me.get('relSelectedHigherValue') != null) {
              if (Number(compound.get('relevance')) >= Number(me.get('relSelectedHigherValue'))) {
                relFilter = true;
              }
		    } else {
			  relFilter = true;
		    }
		
		
		
		    // check all the filter flags and add the compound if all are true
		    console.log('mw ' + mwFilter + ' freebase ' + mwFreebaseFilter + ' hba ' + hbaFilter + ' hbd ' + hbdFilter + ' logp ' + logpFilter + ' ro5 ' + ro5Filter + ' psa ' + psaFilter + ' rtb ' + rtbFilter + ' rel ' + relFilter);    	
		    if (mwFilter == true && mwFreebaseFilter == true && hbaFilter == true && hbdFilter == true && logpFilter == true && ro5Filter == true && psaFilter == true && rtbFilter == true && relFilter == true) {
			  me.get('filteredCompounds').pushObject(compound);
		    }
	  });
      $('#compoundStructureFilterModalView').modal('toggle');
    },

    resetFilters: function() {
      console.log('reset structure filters');
      this.set('mwSelectedLowerValue', null);
      this.set('mwSelectedHigherValue', null);
      this.set('mwSelectedFreebaseLowerValue', null);
      this.set('mwSelectedFreebaseHigherValue', null);
      this.set('hBondAcceptorsSelectedLowerValue', null);
      this.set('hBondAcceptorsSelectedHigherValue', null);
      this.set('hBondDonorsSelectedLowerValue', null);
      this.set('hBondDonorsSelectedHigherValue', null);
      this.set('logPSelectedLowerValue', null);
      this.set('logPSelectedHigherValue', null);
      this.set('polarSurfaceAreaSelectedLowerValue', null);
      this.set('polarSurfaceAreaSelectedHigherValue', null);
      this.set('ro5SelectedLowerValue', null);
      this.set('ro5SelectedHigherValue', null);
      this.set('rbSelectedLowerValue', null);
      this.set('rbSelectedHigherValue', null);
      this.set('relSelectedLowerValue', null);
      this.set('relSelectedHigherValue', null);
    },

    searchForSMILES: function() {
        this.transitionToRoute('compounds.structure', {queryParams: {'smiles': me.get('smilesValue'), 'type': 'exact'}});
    },

    drawThisSMILES: function() {
      this.transitionToRoute('compounds.draw', {queryParams: {smiles: this.get('smilesValue')}});
    }

  }
});
