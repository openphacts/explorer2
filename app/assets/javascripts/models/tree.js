App.Tree = App.SearchResult.extend({
    uri: DS.attr('string'),
    name: DS.attr('string'),
    children: DS.attr('boolean'),
    level: DS.attr('number'),
    pharmacology: DS.hasMany('treePharmacology'),
    pharmacologyRecords: DS.attr('number')
});
