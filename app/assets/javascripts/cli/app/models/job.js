App.Job = DS.Model.extend({
    uuid: DS.attr('string'),
    date: DS.attr('number'),
    percentage: DS.attr('number'),
    label: DS.attr('string'),
    status: DS.attr('string'),
    filters: DS.attr('string'),
    // Is the job being run in the browser or remotely
    local: DS.attr('boolean', {defaultValue: true}),

    complete: function() {
        if (this.get('status') === 'complete') {
            return true;
        } else {
            return false;
        }
    }.property('status')
});
