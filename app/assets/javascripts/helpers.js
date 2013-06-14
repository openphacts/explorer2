Ember.Handlebars.registerBoundHelper('cs_image_src', function(csURL, options) {
  //TODO I'm sure the context can be changed to the actual compound somehow in the view, I'm just not sure how at the moment
  if (options && csURL) {
      return new Handlebars.SafeString('<img width="128" height="128" src="http://www.chemspider.com/ImagesHandler.ashx?id=' + csURL.split("/").pop() + '"&amp;w=128&amp;h=128/>');
  }
});
Ember.Handlebars.registerBoundHelper('target_image_src', function(target, options) {
  //TODO I'm sure the context can be changed to the actual compound somehow in the view, I'm just not sure how at the moment
  if (options && target && target.length >= 1) {
      return new Handlebars.SafeString('<img width="128" height="128" src="http://www.rcsb.org/pdb/images/' + target[0].split('/').pop() + '_asr_r_250.jpg"&amp;w=128&amp;h=128/>');
  } else {
      return new Handlebars.SafeString('<img width="128" height="128" src="/assets/target_placeholder.png"/>');
  }
});
Ember.Handlebars.registerBoundHelper('compoundSource', function(cwCompoundUri, compoundPrefLabel) {
  if (cwCompoundUri && compoundPrefLabel) {
    return new Handlebars.SafeString('<a href="/compounds/' + cwCompoundUri.split('/').pop() + '">' + compoundPrefLabel + '</a>');
  }
});
Ember.Handlebars.registerBoundHelper('formatMolecularFormula', function(molform) {
  if (molform) {
    return new Handlebars.SafeString(molform.replace(/(\d+)?\s*/g, "<sub>$1</sub>"));
  }
});
Ember.Handlebars.registerBoundHelper('linkablePubmedId', function(pubmedId) {
	if (pubmedId) {
		return new Handlebars.SafeString('<a href="http://www.ncbi.nlm.nih.gov/pubmed?term=' + pubmedId + '" target="_blank">' + pubmedId + '</a>');
	}
});
Ember.Handlebars.registerBoundHelper('expandableDescription', function(description) {
	if (description) {
	 	var words = new Array();
		words = description.split(" ");
		
		if (words.length > 48) {
			var readmore = '<span class="read-more-content">';
			var position = 230;
			var end = '</span>'
			var output = [description.slice(0, position), readmore, description.slice(position), end].join('');
			//console.log(output);
			return new Handlebars.SafeString(output);
		} else {
			return new Handlebars.SafeString(description);
		}
	}
});
Ember.Handlebars.registerBoundHelper('linkableChemspiderID', function(chemspiderId) {
	if (chemspiderId) {
		var id = chemspiderId.split("/").pop();
		//console.log(" ID " + id);
		var fullLink = '<a href="http://www.chemspider.com/' + id +'" target="_blank">' + id +'</a>'
		return new Handlebars.SafeString(fullLink);;
	}
});

Ember.Handlebars.registerBoundHelper('linkableOrganism', function(organism) {
	if (organism) {
	var id = organism.split("/").pop();
	var fullLink = '<a href="' + organism +'" target="_blank">' + id +'</a>'
	return new Handlebars.SafeString(fullLink);;
	}
});

Ember.Handlebars.registerBoundHelper('linkableExistence', function(existence) {
	if (existence) {
	var id = existence.split("/").pop();
	id = id.replace(/_/g, " ");
	var fullLink = '<a href="' + existence +'" target="_blank">' + id +'</a>'
	return new Handlebars.SafeString(fullLink);;
	}
});

Ember.Handlebars.registerBoundHelper('pdbLinkouts', function(pdb) {
	if (pdb) {
		var url = new String();
		
		$.each(pdb, function(i, item) {
			var id = item.split("/").pop();
			var aLink = '<a href="' + item +'" target="_blank">' + id +'</a>   '
			url += aLink;
		});
		return new Handlebars.SafeString(url);
	}
});

// 'infinite' scrolling helpers, set whether page should allow fetching more assets, prevent scrolling while fetching next page
var scrollOnThisPage = false;

var pageScrolling = false;
var scrollHandler;
//$(window).scroll(function() {
//    var s = $(window).scrollTop(),
//        d = $(document).height(),
//        c = $(window).height();
//        scrollPercent = (s / (d-c)) * 100;
//        console.log("page scrolling is " + pageScrolling);
//    if (scrollPercent >= 99 && pageScrolling != true && scrollOnThisPage == true) {
//        disable_scroll();
//        pageScrolling = true;
//        console.log("Fetching results for scroll " + pageScrolling);
//        App.searchController.conceptWikiSearch(App.searchController.getCurrentQuery());
//    }
//});

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
