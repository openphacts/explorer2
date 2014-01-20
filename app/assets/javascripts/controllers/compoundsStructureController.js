App.CompoundsStructureController = Ember.ObjectController.extend({

  structureSearchType: "exact",

  page: null,

  currentCount: function() {
    return this.get('model.structure.length');
  }.property('model.structure.length'),

  totalCount: null,

  fetching: false,

  sortedHeader: null,

  currentHeader: null,

  structure: (function() {
    return Ember.ArrayProxy.createWithMixins(Ember.SortableMixin, {
      sortProperties: null,
      sortAscending: false,
      content: this.get('content.structure')
    });
  }).property('content.structure'),

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
       this.set('structureSearchType', type);
       var me = this;
       var thisCompound = this.get('content');
       thisCompound.get('structure').clear();
       var searcher = new Openphacts.StructureSearch(ldaBaseUrl, appID, appKey);
       var callback=function(success, status, response){
         if (success && response) {
            me.set('fetching', false);
             var results = null;
             if (type == "exact") {
                 results = searcher.parseExactResponse(response);
                 me.set('totalCount', results.length);
                 $.each(results, function(index, result) {
                   me.get('store').find('compound', result).then(function(compound) {
		               thisCompound.get('structure').pushObject(compound);
                   });
                 });
             } else if (type == "similarity") {
                 results = searcher.parseSimilarityResponse(response);
                 me.set('totalCount', results.length);
                 var relevance = {};
                 $.each(results, function(index, result) {
                   var about = result.about;
                   var relVal = result.relevance;
                   relevance[about] = relVal;
                   me.get('store').find('compound', about).then(function(compound) {
		               thisCompound.get('structure').pushObject(compound);
                   });
                 }); 
             } else if (type == "substructure") {
                 results = searcher.parseSubstructureResponse(response);
                 me.set('totalCount', results.length);
                 var relevance = {};
                 $.each(results, function(index, result) {
                   var about = result.about;
                   var relVal = result.relevance;
                   relevance[about] = relVal;
                   me.get('store').find('compound', about).then(function(compound) {
		               thisCompound.get('structure').pushObject(compound);
                   });
                 });
             }
         }
       };
       if (type == "exact") {
           this.set('fetching', true);
           searcher.exact(thisCompound.get('smiles'), null, callback);
       } else if (type == "similarity") {
           this.set('fetching', true);
           // TODO fix start and count at 1 and 100 for the moment
           searcher.similarity(thisCompound.get('smiles'), null, null, null, null, 1, 100, callback);
       } else if (type == "substructure") {
           this.set('fetching', true);
           // TODO fix start and count at 1 and 100 for the moment
           searcher.substructure(thisCompound.get('smiles'), null, 1, 100, callback);
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
         this.get('structure').set('sortAscending', true);
         //ascending
         //reset so next time for same one will be descending
         this.set('sortedHeader', null);
       } else {
         //descending
         //next time will be ascending
         this.get('structure').set('sortProperties', sortHeader);
         this.get('structure').set('sortAscending', false);
	     this.set('sortedHeader', header);
	     this.set('currentHeader', header);
       }
    },

  }
});
