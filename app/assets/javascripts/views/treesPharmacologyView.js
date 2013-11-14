App.TreesPharmacologyView = Ember.View.extend({
  didInsertElement: function() {
    var view = this;
    $(window).bind("scroll", function() {
      view.didScroll();
    });
  },

  willDestroyElement: function() {
    $(window).unbind("scroll");
  },

  didScroll: function() {
    if(this.isScrolledToBottom() && !this.get('controller').get('fetching')) {
      this.get('controller').set('fetching', true);
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
