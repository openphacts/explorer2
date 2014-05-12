App.CompoundsPharmacologyView = Ember.View.extend({
    didInsertElement: function() {
        var controller = this.get('controller');
        $('#assay_organism_box').typeahead({
            source: function(query, process) {
                $.getJSON(organismsUrl, {
                    query: query
                }, function(data) {
                    return process(data);
                })
            }
        });
        $('#target_organism_box').typeahead({
            source: function(query, process) {
                $.getJSON(organismsUrl, {
                    query: query
                }, function(data) {
                    return process(data);
                })
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
    // If the summary box is scrolling off the page then shrink and fix to top of page.
    // If scrolled to bottom of page then fetch more results
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
        var scrollPercent = (top / (documentHeight - windowHeight)) * 100;

        return scrollPercent > 99;
    }
});
