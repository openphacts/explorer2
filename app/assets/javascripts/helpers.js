Handlebars.registerHelper('cs_image_src', function(compound, options) {
  //TODO I'm sure the context can be changed to the actual compound somehow in the view, I'm just not sure how at the moment
  if (options &&  Ember.Handlebars.get(options.contexts[0], compound,options)) {
      return "http://www.chemspider.com/ImagesHandler.ashx?id=" + Ember.Handlebars.get(options.contexts[0], compound,options).split("/").pop() + "&amp;w=128&amp;h=128";
  }
});

Handlebars.registerHelper('image_from_csid', function(csid, options) {
  //TODO I'm sure the context can be changed to the actual compound somehow in the view, I'm just not sure how at the moment
  if (options && Ember.Handlebars.get(options.contexts[0], csid ,options)) {
      return "http://www.chemspider.com/ImagesHandler.ashx?id=" + Ember.Handlebars.get(options.contexts[0], csid ,options).split('/').pop() + "&amp;w=128&amp;h=128";
  }
});

var pageScrolling = false;
$(window).scroll(function() {
    var s = $(window).scrollTop(),
        d = $(document).height(),
        c = $(window).height();
        scrollPercent = (s / (d-c)) * 100;
        console.log("page scrolling is " + pageScrolling);
    if (scrollPercent >= 100 && pageScrolling != true) {
        disable_scroll();
        pageScrolling = true;
        console.log("Fetching results for scroll " + pageScrolling);
        App.searchResultsController.search(App.searchResultsController.getCurrentQuery());
    }
});

// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = [37, 38, 39, 40];

function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;  
}

function keydown(e) {
    for (var i = keys.length; i--;) {
        if (e.keyCode === keys[i]) {
            preventDefault(e);
            return;
        }
    }
}

function wheel(e) {
  preventDefault(e);
}

function disable_scroll() {
  if (window.addEventListener) {
      window.addEventListener('DOMMouseScroll', wheel, false);
  }
  window.onmousewheel = document.onmousewheel = wheel;
  document.onkeydown = keydown;
}

function enable_scroll() {
    if (window.removeEventListener) {
        window.removeEventListener('DOMMouseScroll', wheel, false);
    }
    window.onmousewheel = document.onmousewheel = document.onkeydown = null;  
}
