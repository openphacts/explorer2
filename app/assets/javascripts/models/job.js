App.Job = DS.Model.extend({
    uuid: DS.attr('string'),
    date: DS.attr('number'),
    percentage: DS.attr('number'),
    label: DS.attr('string'),
    status: DS.attr('string'),
    filters: DS.attr('string'),

    complete: function() {
        if (this.get('status') === 'complete') {
            return true;
        } else {
            return false;
        }
    }.property('status')
});
