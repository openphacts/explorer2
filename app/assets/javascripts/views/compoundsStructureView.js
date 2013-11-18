App.CompoundsStructureView = Ember.View.extend({
  didInsertElement: function() {
    var view = this;
    $(window).bind("scroll", function() {
      view.didScroll();
    });
	// Hide the extra content initially, using JS so that if JS is disabled, no problemo:
	$('.read-more-content').addClass('hide')

	// Set up a link to expand the hidden content:
	.before('<a class="read-more-show" href="#"> more</a>')

	// Set up a link to hide the expanded content.
	.append(' <a class="read-more-hide" href="#"> less</a>');

	// Set up the toggle effect:
	$('.read-more-show').on('click', function(e) {
	  $(this).next('.read-more-content').removeClass('hide');
	  $(this).addClass('hide');
	  e.preventDefault();
	  	var s = $("#summary");
	        s.css({
	            height: "250px"
	        });
	});

	$('.read-more-hide').on('click', function(e) {
	  $(this).parent('.read-more-content').addClass('hide').parent().children('.read-more-show').removeClass('hide');
	  e.preventDefault();
	  var s = $("#summary");
	        s.css({
	            height: "135px"
	        });
	});
	 var toggleSummary = true;

	 $('#toggle-summary').on('click', function() {
	 	console.log("var " + toggleSummary);
	 	if (toggleSummary) {
			var s = $("#summary");

	        s.css({
	            height: "55px"
	        });
	    	$('#structure').hide();

	    	var i = $('#compound-image');
			i.css({
				visibility:"hidden"
			});	
			toggleSummary = false;
			$(this).text(function(i, text){
	          return "more";
	      	});

	 	} else {
			var s = $("#summary");
	        s.css({
	            height: "135px",
	            width: "100%"
	        });
	        $('#structure').show();

			var i = $('#compound-image');
				i.css({
				visibility:"visible"
			});
			toggleSummary = true;
			$(this).text(function(i, text){
	          return "less";
	      	});
	 	}

	 });

	$(function() {
		moveScroller();
	});

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
	    		$('#structure').hide();

	    		var i = $('#compound-image');
					i.css({
						visibility:"hidden"
					});
				toggleSummary = false;
				$('#toggle-summary').text(function(i, text){
	    			return "more";
	    		});



	        } else {

				s.css({
	            	position: "relative",
	            	top: "",
	            	height: "135px",
	            	width: "100%"
	        	});
	        	$('#structure').show();

				var i = $('#compound-image');
					i.css({
					visibility:"visible"
				});

				toggleSummary = true;
				$('#toggle-summary').text(function(i, text){
	    			return "less";
	    		});        
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
