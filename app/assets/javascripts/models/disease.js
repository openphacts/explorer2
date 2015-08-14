App.Disease = DS.Model.extend({
    //target: DS.belongsTo('searchResult'),
    name: DS.attr('string'),
    URI: DS.attr('string'),
    diseaseClass: DS.attr(),
    targets: DS.hasMany('target'),
    targetRecords: DS.attr('number'),
    hasDiseaseClasses: function() {
        return this.get('diseaseClass').length > 0;
    }.property('diseaseClass'),

    hasTargets: function() {
        return this.get('targetRecords') > 0;
    }.property('targetRecords')

});
