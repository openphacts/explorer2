App.Job = DS.Model.extend({
    uuid: DS.attr('string'),
    percentage: DS.attr('number'),
    label: DS.attr('string'),
    status: DS.attr('string'),
    filters: DS.attr('string')
});
