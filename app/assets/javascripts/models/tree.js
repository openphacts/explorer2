App.Tree = App.SearchResult.extend({
    uri: DS.attr('string'),
    name: DS.attr('string'),
    pharmacology: DS.hasMany('treePharmacology'),
    pharmacologyRecords: DS.attr('number')
});
