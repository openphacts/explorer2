App.ApplicationView = Ember.View.extend({
    didInsertElement: function() {
      $('#search_box').typeahead({
        source: function (query, process) {
            $.getJSON(typeaheadUrl, { query: query }, function (data) {
                return process(data);
            })
        }
      });
    }
});
