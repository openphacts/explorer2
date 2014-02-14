App.Compound = App.SearchResult.extend({
    URI: DS.attr('string'),
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
    pharmacology: DS.hasMany('CompoundPharmacology'),
    pharmacologyRecords: DS.attr('number'),
    pathways: DS.hasMany('pathway', { async: true }),
    pathwayRecords: DS.attr('number'),
    structure: DS.hasMany('compound'),
    structureRecords: DS.attr('number'),
    //for structure search
    relevance: DS.attr('number'),
    isCompound: true,
    uri: DS.attr('string'),
    chemspiderProvenance: DS.attr(),
    chemblProvenance: DS.attr(),
    drugbankProvenance: DS.attr(),

    pathwayInfoAvailable: function() {
        return (this.get('pathwayRecords') !== null && this.get('pathwayRecords') >= 0);
    }.property('pathwayRecords'),

    hasPathways: function() {
        return this.get('pathwayRecords') > 0;
    }.property('pathwayRecords')
});
