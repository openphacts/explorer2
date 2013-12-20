App.TargetsPharmacologyView = Ember.View.extend({
  didInsertElement: function() {
	  $('#assay_organism_box').typeahead({
        source: function (query, process) {
            $.getJSON(organismsUrl, { query: query }, function (data) {
                return process(data);
            })
        }
      });
      $('#target_organism_box').typeahead({
        source: function (query, process) {
            $.getJSON(organismsUrl, { query: query }, function (data) {
                return process(data);
            })
        }
      });
    var view = this;
    $(window).bind("scroll", function() {
      view.didScroll();
    });
	$(function() {
		moveScroller();
	});

	var toggleSummary;
	//sticky
	function moveScroller() {
	    var move = function() {
	        var st = $(window).scrollTop();
	        var ot = $("#summary-anchor").offset().top;
	        var s = $("#summary");
	        if(st > ot) {

	    		s.css({
	            	position: "fixed",
	            	top: "0px",
	            	height: "55px"
	        	});

	    		var i = $('#target-image');
					i.css({
						visibility:"hidden"
					});
				toggleSummary = false;




	        } else {

				s.css({
	            	position: "relative",
	            	top: "",
	            	height: "135px",
	            	width: "100%"
	        	});

				var i = $('#target-image');
					i.css({
					visibility:"visible"
				});

				toggleSummary = true;

	    	}
	    };
	    $(window).scroll(move);
	    move();
	}
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
