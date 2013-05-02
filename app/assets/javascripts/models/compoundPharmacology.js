App.CompoundPharmacology = DS.Model.extend({
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
assay_organism_src: chembl_src,
assay_description_src: chembl_src,
activity_relation_src: chembl_src,
activity_standard_units_src: chembl_src,
activity_standard_value_src: chembl_src,
activity_activity_type_src: chembl_src,
activity_pubmed_id: activity_pubmed_id,
assay_description_item: assay_description_item,
assay_organism_item: assay_organism_item,
activity_activity_type_item: activity_activity_type_item,
activity_relation_item: activity_relation_item,
activity_standard_value_item: activity_standard_value_item,
activity_standard_units_item: activity_standard_units_item,
compound_full_mwt_item: compound_full_mwt_item,
compound_smiles_item: compound_smiles_item,
compound_inchi_item: compound_inchi_item,
compound_inchikey_item: compound_inchikey_item,
compound_pref_label_item: compound_pref_label_item
})
