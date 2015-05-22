App.CompoundStructure = App.SearchResult.extend({
    type: DS.attr('string'),
    molecule:DS.attr('string'),
    csURI: DS.attr('string'),
    matchType: DS.attr('string'),
    complexity: DS.attr('string'),
    isotopic: DS.attr('string'),
    hasSpectra: DS.attr('string'),
    hasPatents: DS.attr('string')
});
