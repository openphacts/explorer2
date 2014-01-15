Ember.Handlebars.registerBoundHelper('completedJob', function(status, uuid) {
  var html = "";
  if (status == "complete") {
    return new Handlebars.SafeString("<a href='" + tsvDownloadUrl +"/" + uuid + "'>Download</a>");
  } else {
    return new Handlebars.SafeString("");
  }
});
Handlebars.registerHelper("log", function(context) {
  return console.log(context);
});
Ember.Handlebars.registerBoundHelper('pathwayLink', function(uri, label) {
  var link = '<a href="#/pathways?uri=' + uri + '">' + label + '</a>';
  return new Handlebars.SafeString(link);		
});
Ember.Handlebars.registerBoundHelper('targetLink', function(uri, label) {
        if (label === "Unchecked") {
            return new Handlebars.SafeString('N/A');
        } else {
  var link = '<a href="#/targets?uri=' + uri + '">' + label + '</a>';
  return new Handlebars.SafeString(link);
}		
});
Ember.Handlebars.registerBoundHelper('compoundLink', function(uri, label) {
  var link = '<a href="#/compounds?uri=' + uri + '">' + label + '</a>';
  return new Handlebars.SafeString(link);		
});
Ember.Handlebars.registerBoundHelper('objectLink', function(type, route, routeLabel, content) {
  var link = '<a href="#/' + type + '/' + route + '?uri=' + content.get('URI') + '">' + routeLabel + '</a>';
  return new Handlebars.SafeString(link);		
});

Ember.Handlebars.registerBoundHelper('pathwayShortLink', function(pathwayURI) {
	if (pathwayURI) {
		return new Handlebars.SafeString('<a href="' + pathwayURI + '">' + pathwayURI.split('/').pop() + '</a>');		
	}
});

Ember.Handlebars.registerBoundHelper('organismLink', function(organism) {
	if (organism) {
		return new Handlebars.SafeString('<a href="' + organism + '">' + organism.split('/').pop() + '</a>');		        
	}
});

Ember.Handlebars.registerBoundHelper('revisionLink', function(revision) {
	if (revision) {
		return new Handlebars.SafeString('<a href="' + revision + '">' + revision.split('/').pop() + '</a>');		        
	}
});

Ember.Handlebars.registerBoundHelper('ontologyLink', function(ontology) {
	if (ontology) {
		return new Handlebars.SafeString('<a href="' + ontology + '">' + ontology.split('/').pop() + '</a>');		        
	}
});

Ember.Handlebars.registerBoundHelper('vocabPart', function(part) {
	if (part) {
		return new Handlebars.SafeString(part.split('#').pop());		        
	}
});

Ember.Handlebars.registerBoundHelper('treePharmaLink', function(tree) {
	if (tree) {
		return new Handlebars.SafeString('<a class="enzymeName" href="#/trees/pharmacology?uri=' + tree.get('uri') + '">' + tree.get('name') + '</a>');		
	}
});
Ember.Handlebars.registerBoundHelper('getIndentLevel', function(view) {
  if (view) {
    console.log('getIndentLevel');
  }	
});
Ember.Handlebars.registerBoundHelper('enzymeECNumber', function(uri) {
  if (uri) {
    return new Handlebars.SafeString(uri.split('/')[uri.split('/').length - 1]);	
  }	
});
Ember.Handlebars.registerBoundHelper('cs_image_src', function(csURL, options) {
  //TODO I'm sure the context can be changed to the actual compound somehow in the view, I'm just not sure how at the moment
  if (options && csURL) {
      return new Handlebars.SafeString('<img width="128" height="128" src="http://ops.rsc.org/' + csURL.split("/").pop() + '/image"/>');
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
		var justId = pubmedId.split("/").pop();
		return new Handlebars.SafeString('<a href="' + pubmedId + '" target="_blank">' + justId + '</a>');
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

Ember.Handlebars.registerBoundHelper('provenanceLinkout', function(item, source) {

	// create provenance linkout
	var linkout = new String();
	console.log(" prov func params " + item + " " + source);
	
	if (item) {

		// check datasource of the item
		switch(source)
		{
			case 'drugbank':
				//console.log(" drugbank datasource");
				linkout = createDrugbankLink(item);				
  				break;
			
			case 'chembl':
				//console.log(" chembl datasource");
				linkout = createChemblLink(item);
  				break;

  			case 'chemspider':
  				//console.log(" chemspider databsource");
  				linkout = createChemspiderLink(item);
  				break;

  			case 'conceptwiki':
  				//console.log(" conceptwiki datasource");
  				linkout = createConceptWikiLink(item);
				break;
				
			case 'uniprot':
				linkout = createUniprotLink(item);
				break;
				
			default:
				console.log("source unrecognised: " + source);
		}
		
		// assign icon to datasource

		// append linkout to icon

		// return clickable icon
		return new Handlebars.SafeString(linkout);
	}
 
});

// provenance mini functions - linkout per source

function createDrugbankLink(item) {
	var dbLink;
	dbLink = '<a href="' + item + '" target="_blank"><img src="/assets/drugbankProvIcon.png" title="DrugBank" height="15" width="15"></a>'
	return dbLink;
}

function createChemblLink(item) {
	var dbLink;
	dbLink = '<a href="' + item + '" target="_blank"><img src="/assets/chemblProvIcon.png" title="ChEMBL" height="15" width="15"></a>'
	return dbLink;
}

function createChemspiderLink(item) {
	var dbLink;
	dbLink = '<a href="' + item + '" target="_blank"><img src="/assets/chemspiderProvIcon.png" title="ChemSpider" height="15" width="15"></a>'
	return dbLink;
}

function createConceptWikiLink(item) {
	var dbLink;
	dbLink = '<a href="' + item + '" target="_blank"><img src="/assets/conceptWikiProvIcon.png" title="ConceptWiki" height="15" width="15"></a>'
	return dbLink;
}

function createUniprotLink(item) {
	var dbLink;
	dbLink = '<a href="' + item + '" target="_blank"><img src="/assets/uniprotProvIcon.png" title="UniProt" height="15" width="33"></a>'
	return dbLink;	
}

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
