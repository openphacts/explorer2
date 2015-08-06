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
            remote: {
		        url: typeaheadUrl + '?q=%QUERY',
	                filter: function(data) {
				var response = [];
				data.hits.forEach(function(hit) {
					//TODO decide which label metadata is of relevance - label, altLabel, Synonym, title etc
					var label;
				       if (hit.label != null) {
					       label = hit.label[0];
				       } else if (hit.title != null) {
                                           label = hit.title[0];
				       }       
                                    label != null ? response.push({value: label}) : '';
				});
				return response;
			}
	    },
            datumTokenizer: function(d) {
                return Bloodhound.tokenizers.whitespace(d.val);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            limit: 20
        });
        engine.initialize();
	// initialize the search box for both small and larger devices. One of
	// them will be hidden.
	// (horrible I agree but Ember doesn't like 2 views with the same id)
           $('#search_box_responsive').typeahead({
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
