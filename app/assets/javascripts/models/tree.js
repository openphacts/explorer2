App.Tree = App.SearchResult.extend({
    uri: DS.attr('string'),
    name: DS.attr('string'),
    hasChildren: DS.attr('boolean'),
    level: DS.attr('number'),
    children: DS.hasMany('tree'),
    hidden: DS.attr('boolean'),
    pharmacology: DS.hasMany('treePharmacology'),
    pharmacologyRecords: DS.attr('number')
});
