App.TargetsDiseasesView = Ember.View.extend({
    didInsertElement: function() {
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
