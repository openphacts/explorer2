App.Target = DS.Model.extend({
    id: null,
    exactMatch: DS.attr('boolean'),
    cellularLocation: DS.attr('string'),
    molecularWeight: DS.attr('string'),
    numberOfResidues: DS.attr('string'),
    theoreticalPi: DS.attr('string'),
    drugbankURI: DS.attr('string'),
    description: DS.attr('string'),
    subClassOf: DS.attr('string'),
    keywords: DS.attr('array'),
    functionAnnotation: DS.attr('string'),
    alternativeName: DS.attr('string'),
    existence: DS.attr('string'),
    organism: DS.attr('string'),
    sequence: DS.attr('string'),
    classifiedWith: DS.attr('array'),
    seeAlso: DS.attr('string')
});
