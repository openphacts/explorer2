App.EnzymePharmacology = DS.Model.extend({
   enzyme: DS.belongsTo('App.Enzyme'),
   targets: DS.attr('array'),
   chemblActivityURI: DS.attr('string'),
   pubmedID: DS.attr('string'),
   activityRelationItem: DS.attr('string'),
   activityStandardUnits: DS.attr('string'),
   activityStandardValue: DS.attr('string'),
   activityActivityType: DS.attr('string'),
   inDataset: DS.attr('string'),
   fullMWT: DS.attr('string'),
   chemblActivityURI: DS.attr('string'),
   cwCompoundURI: DS.attr('string'),
   compoundPrefLabel: DS.attr('string'),
   csCompoundURI: DS.attr('string'),
   compoundInchi: DS.attr('string'),
   compoundInchiKey: DS.attr('string'),
   compoundSmiles: DS.attr('string'),
   ro5Violations: DS.attr('string'),
   targetURI: DS.attr('string'),
   targetTitle: DS.attr('string'),
   targetOrganism: DS.attr('string'),
   assayURI: DS.attr('string'),
   assayDescription: DS.attr('string')
});
