App.Disease = DS.Model.extend({
    name: DS.attr('string'),
    URI: DS.attr('string'),
    diseaseClass: DS.attr(),
    targets: DS.hasMany('target'),
    hasDiseaseClasses: function() {
        return this.get('diseaseClass').length > 0;
    }.property('diseaseClass'),


});
