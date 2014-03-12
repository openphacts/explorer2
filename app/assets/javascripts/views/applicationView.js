App.ApplicationView = Ember.View.extend({
    didInsertElement: function() {
      $('#search_box').typeahead({
        items: 20,
        source: function (query, process) {
            $.getJSON(typeaheadUrl, { query: query }, function (data) {
                return process(data);
            })
        }
      });
    }
});
