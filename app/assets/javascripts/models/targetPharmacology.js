App.TargetPharmacology = DS.Model.extend({
  target: DS.belongsTo('App.Target'),
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
App.TargetPharmacology.reopenClass({
    find: function(uri, page, pageSize) {
        // use the lda api to fetch targets rather than the default behaviour of rails side
        var targetPharmacology = App.TargetPharmacology.createRecord();
        var searcher = new Openphacts.TargetSearch(ldaBaseUrl, appID, appKey);  
        var callback=function(success, status, response){  
            var targetPharmacologyResult = searcher.parseTargetPharmacologyResponse(response); 
            targetPharmacology.setProperties(targetPharmacologyResult);
            //return compoundPharmacologyResult;
        };  
        searcher.targetPharmacology('http://www.conceptwiki.org/concept/' + uri, page, pageSize, callback);
        targetPharmacology.set("id", uri);
        return targetPharmacology;
    }
});
