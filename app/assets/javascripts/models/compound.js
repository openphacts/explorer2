App.Compound = App.SearchResult.extend({
    URI: DS.attr('string'),
    originalType: DS.attr('string'),
    cwURI: DS.attr('string'),
    drugbankURI: DS.attr('string'),
    description: DS.attr('string'),
    biotransformationItem: DS.attr('string'),
    toxicity: DS.attr('string'),
    proteinBinding: DS.attr('string'),
    prefLabel: DS.attr('string'),
    exactMatch: DS.attr('boolean'),
    csURI: DS.attr('string'),
    smiles: DS.attr('string'),
    chemblURI: DS.attr('string'),
    fullMWT: DS.attr('number'),
    hba: DS.attr('number'),
    hbd: DS.attr('number'),
    inchi: DS.attr('string'),
    inchiKey: DS.attr('string'),
    logp: DS.attr('number'),
    molform: DS.attr('string'),
    mwFreebase: DS.attr('number'),
    psa: DS.attr('number'),
    ro5Violations: DS.attr('number'),
    rtb: DS.attr('number'),
    pharmacology: DS.hasMany('CompoundPharmacology'),
    pharmacologyRecords: DS.attr('number'),
    pathways: DS.hasMany('pathway', { async: true }),
    pathwayRecords: DS.attr('number'),
    structure: DS.hasMany('compound', {inverse: null}),
    structureRecords: DS.attr('number'),
    //for structure search
    relevance: DS.attr('number'),
    isCompound: true,
    uri: DS.attr('string'),
    chemspiderProvenance: DS.attr(),
    chemblProvenance: DS.attr(),
    drugbankProvenance: DS.attr(),
    molfile: DS.attr('string'),
    favourite: DS.attr('boolean'),

    pathwayInfoAvailable: function() {
        return (this.get('pathwayRecords') !== null && this.get('pathwayRecords') >= 0);
    }.property('pathwayRecords'),

    hasPathways: function() {
        return this.get('pathwayRecords') > 0;
    }.property('pathwayRecords'),

    pharmacologyInfoAvailable: function() {
        return (this.get('pharmacologyRecords') !== null && this.get('pharmacologyRecords') >= 0);
    }.property('pharmacologyRecords'),

    hasPharmacology: function() {
        return this.get('pharmacologyRecords') > 0;
    }.property('pharmacologyRecords')
});
