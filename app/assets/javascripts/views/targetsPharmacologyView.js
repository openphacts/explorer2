App.TargetsPharmacologyView = Ember.View.extend({
  didInsertElement: function() {

	    var assay_engine = new Bloodhound({
		      name: 'assayorganisms',
		  remote: organismsUrl + 'query=%QUERY',
		  datumTokenizer: function(d) {
			      return Bloodhound.tokenizers.whitespace(d.val);
			        },
		  queryTokenizer: Bloodhound.tokenizers.whitespace,
		limit: 20
	    });
	    assay_engine.initialize();
      $('#assay_organism_box').typeahead({
        minLength: 3
      },
	{
		source: assay_engine.ttAdapter(),
	       templates: {
		           empty: [
	            '<div class="empty-message">',
	            'unable to find any assay organisms matching the current query',
	            '</div>'
	          ].join('\n'),
	          suggestion: Handlebars.compile('<p><strong>{{value}}</strong></p>')
	        }
      });

var target_engine = new Bloodhound({
		      name: 'targetorganisms',
		  remote: organismsUrl + 'query=%QUERY',
		  datumTokenizer: function(d) {
			      return Bloodhound.tokenizers.whitespace(d.val);
			        },
		  queryTokenizer: Bloodhound.tokenizers.whitespace,
		limit: 20
	    });
	    target_engine.initialize();
      $('#target_organism_box').typeahead({
        minLength: 3
      },
	{
		source: target_engine.ttAdapter(),
	       templates: {
		           empty: [
	            '<div class="empty-message">',
	            'unable to find any target organisms matching the current query',
	            '</div>'
	          ].join('\n'),
	          suggestion: Handlebars.compile('<p><strong>{{value}}</strong></p>')
	        }
      });

    var view = this;
    $(window).bind("scroll", function() {
      view.didScroll();
    });
  },

  willDestroyElement: function() {
    $(window).unbind("scroll");
  },
    didScroll: function() {
        var controller = this.get('controller');
        var st = $(window).scrollTop();
        var ot = $("#summary-anchor").offset().top;
        var s = $("#summary");
        if (st > ot) {
            controller.set('fixSummaryBox', true);
            controller.set('infoHide', true);

        } else {
            controller.set('fixSummaryBox', false);
            controller.set('infoHide', false);
        }
        if (this.isScrolledToBottom() && !this.get('controller').get('fetching')) {
            disable_scroll();
            this.get('controller').send('fetchMore');
        }
    },

  isScrolledToBottom: function() {
    var documentHeight = $(document).height();
    var windowHeight = $(window).height();
    var top = $(document).scrollTop();
    var scrollPercent = (top/(documentHeight-windowHeight)) * 100;

    return scrollPercent > 99;
  }
});
