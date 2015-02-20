App.ApplicationView = Ember.View.extend({
    didInsertElement: function() {
        // Set the CSRF token for all AJAX POST requests
        var token = $('meta[name="csrf-token"]').attr('content');
        $.ajaxPrefilter(function(options, originalOptions, xhr) {
            if (!options.crossDomain) {
                xhr.setRequestHeader('X-CSRF-Token', token);
            }
        });
        var engine = new Bloodhound({
            name: 'animals',
            remote: typeaheadUrl + '?query=%QUERY',
            datumTokenizer: function(d) {
                return Bloodhound.tokenizers.whitespace(d.val);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            limit: 20
        });
        engine.initialize();
        $('#search_box').typeahead({
            minLength: 3
        }, {
            source: engine.ttAdapter(),
            templates: {
                empty: [
                    '<div class="empty-message">',
                    'unable to find any matches for the current query',
                    '</div>'
                ].join('\n'),
                suggestion: Handlebars.compile('<p><strong>{{value}}</strong></p>')
            }
            //	source: function (query, cb) {
            //    $.getJSON(typeaheadUrl, { query: query }, function (data) {
            //        return cb($.makeArray(data));
            //    })
            //}
        });
    }
});
