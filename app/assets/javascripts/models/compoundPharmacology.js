App.CompoundPharmacology = DS.Model.extend({
  compound: DS.belongsTo('App.Compound'),
  compoundInchikey: DS.attr('string'),
  compoundDrugType: DS.attr('string'),
  compoundGenericName: DS.attr('string'),
  targets: DS.attr('array'),
  compoundInchikeySrc: DS.attr('string'),
  compoundDrugTypeSrc: DS.attr('string'),
  compoundGenericNameSrc: DS.attr('string'),
  targetTitleSrc: DS.attr('string'),
  chemblActivityUri: DS.attr('string'),
  chemblCompoundUri: DS.attr('string'),
  compoundFullMwt: DS.attr('string'),
  cwCompoundUri: DS.attr('string'),
  compoundPrefLabel: DS.attr('string'),
  csCompoundUri: DS.attr('string'),
  csid: DS.attr('string'),
  compoundInchi: DS.attr('string'),
  compoundSmiles: DS.attr('string'),
  chemblAssayUri: DS.attr('string'),
  targetOrganisms: DS.attr('array'),
  assayOrganism: DS.attr('string'),
  assayDescription: DS.attr('string'),
  activityRelation: DS.attr('string'),
  activityStandardUnits: DS.attr('string'),
  activityStandardValue: DS.attr('string'),
  activityActivityType: DS.attr('string'),
  compoundFullMwtSrc: DS.attr('string'),
  compoundPrefLabelSrc: DS.attr('string'),
  compoundInchiSrc: DS.attr('string'),
  compoundSmilesSrc: DS.attr('string'),
  targetOrganismSrc: DS.attr('string'),
  assayOrganismSrc: DS.attr('string'),
  assayDescriptionSrc: DS.attr('string'),
  activityRelationSrc: DS.attr('string'),
  activityStandardUnitsSrc: DS.attr('string'),
  activityStandardValueSrc: DS.attr('string'),
  activityActivityTypeSrc: DS.attr('string'),
  activityPubmedId: DS.attr('number'),
  assayDescriptionItem: DS.attr('string'),
  assayOrganismItem: DS.attr('string'),
  activityActivityTypeItem: DS.attr('string'),
  activityRelationItem: DS.attr('string'),
  activityStandardValueItem: DS.attr('string'),
  activityStandardUnitsItem: DS.attr('string'),
  compoundFullMwtItem: DS.attr('string'),
  compoundSmilesItem: DS.attr('string'),
  compoundInchiItem: DS.attr('string'),
  compoundInchikeyItem: DS.attr('string'),
  compoundPrefLabelItem: DS.attr('string')
});
//App.CompoundPharmacology.reopen({
//    find: function(uri, page, pageSize) {
//        // use the lda api to fetch compounds rather than the default behaviour of rails side
//       var compoundPharmacology = App.CompoundPharmacology.createRecord();
//        var searcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);  
//        var callback=function(success, status, response){
//	    if (response) {	
//              var compoundPharmacologyResult = searcher.parseCompoundPharmacologyResponse(response); 
//              compoundPharmacology.setProperties(compoundPharmacologyResult);
//	    }
//        };  
//        searcher.compoundPharmacology('http://www.conceptwiki.org/concept/' + uri, page, pageSize, callback);
//        compoundPharmacology.set("id", uri);
//        return compoundPharmacology;
//    }
//});
