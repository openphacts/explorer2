App.CompoundStructure = App.SearchResult.extend({
    cwURI: DS.attr('string'),
    description: DS.attr('string'),
    biotransformationItem: DS.attr('string'),
    toxicity: DS.attr('string'),
    proteinBinding: DS.attr('string'),
    prefLabel: DS.attr('string'),
    exactMatch: DS.attr('boolean'),
    csURI: DS.attr('string'),
    smiles: DS.attr('string'),
    chemblURI: DS.attr('string'),
    fullMWT: DS.attr('string'),
    hba: DS.attr('string'),
    hbd: DS.attr('string'),
    inchi: DS.attr('string'),
    inchiKey: DS.attr('string'),
    logp: DS.attr('string'),
    molform: DS.attr('string'),
    mwFreebase: DS.attr('string'),
    psa: DS.attr('string'),
    ro5Violations: DS.attr('string'),
    rtb: DS.attr('string'),
    isCompound: true
});