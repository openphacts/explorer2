Ember.Handlebars.registerBoundHelper('renderHtml', function(rawHtml) {
    	return new Ember.Handlebars.SafeString(rawHtml);
});


Ember.Handlebars.registerBoundHelper('targetComponentLink', function(component) {
  if (component.label != null && component.uri != null) {
	var aLink = '<a href="' + component.uri +'" target="_blank">' + component.label +'</a>'
    return new Handlebars.SafeString(aLink);
  } else if (component.label != null){
    return new Handlebars.SafeString(component.label);
  } else if (component.uri != null){
    var id = component.uri.split('/').pop();
	var aLink = '<a href="' + component.uri +'" target="_blank" title="No label available for this target component">' + id +'</a>';
    return new Handlebars.SafeString(aLink);
  }
});
Ember.Handlebars.registerBoundHelper('targetOrganismLink', function(target) {
  if (target.targetOrganismNames != null && target.uri != null) {
	var aLink = '<a href="' + target.uri +'" target="_blank">' + target.targetOrganismNames +'</a>'
    return new Handlebars.SafeString(aLink);
  } else if (target.targetOrganismNames != null){
    return new Handlebars.SafeString(target.targetOrganismNames);
  } else if (target.uri != null){
    var id = target.uri.split('/').pop();
	var aLink = '<a href="' + target.uri +'" target="_blank" title="No organism name available for this target">' + id +'</a>';
    return new Handlebars.SafeString(aLink);
  }
});
Ember.Handlebars.registerBoundHelper('assayOrganismLink', function(pharma) {
  if (pharma.get('assayOrganismName') != null && pharma.get('assayURI') != null) {
	var aLink = '<a href="' + pharma.get('assayURI') +'" target="_blank">' + pharma.get('assayOrganismName') +'</a>'
    return new Handlebars.SafeString(aLink);
  } else if (pharma.get('assayOrganismName') != null){
    return new Handlebars.SafeString(pharma.get('assayOrganismName'));
  } else if (pharma.get('assayURI') != null){
    var id = pharma.get('assayURI').split('/').pop();
	var aLink = '<a href="' + pharma.get('assayURI') +'" target="_blank" title="No organism name available for this assay">' + id +'</a>';
    return new Handlebars.SafeString(aLink);
  }
});
Ember.Handlebars.registerBoundHelper('pdbLink', function(link) {
  if (link != null) {
	var id = link.split("/").pop();
	var aLink = '<a href="' + link +'" target="_blank">' + id +'</a>'
    return new Handlebars.SafeString(aLink);
  }
});
Ember.Handlebars.registerBoundHelper('insertKetcherIframe', function(structure) {
    if (structure != null) {
      return new Handlebars.SafeString('<iframe src="/ketcher/ketcher.html?smiles=' + structure.smiles  + '" id="ketcher-iframe"></iframe>');
    } else {
      return new Handlebars.SafeString('<iframe src="/ketcher/ketcher.html" id="ketcher-iframe"></iframe>');
    }
});
Ember.Handlebars.registerBoundHelper('structureSearchHasRelevance', function(type) {
  if (type === "substructure" || type === "similarity") {
    return true;
  }
});
Ember.Handlebars.registerBoundHelper('pathwayOrganismLink', function(link, label) {
  if (link != null && label != null) {
    return new Handlebars.SafeString('<a href="' + link + '" target="_blank">' + label + '</a>');
  }
});
Ember.Handlebars.registerBoundHelper('pathwayRevision', function(link) {
  if (link != null) {
    var text = link.split('/').pop();
    var rev = text.split('_')[1];
    return new Handlebars.SafeString('<a href="' + link + '" target="_blank">' + rev + '</a>');
  }
});
Ember.Handlebars.registerBoundHelper('textLink', function(link) {
  if (link != null) {
    var text = link.split('/').pop();
    return new Handlebars.SafeString('<a href="' + link + '" target="_blank">' + text + '</a>');
  }
});
Ember.Handlebars.registerBoundHelper('getLabelWithTooltip', function(job) {
  return new Handlebars.SafeString('<td title="' + job.filters + '">' + job.label + '</td>');
});
Ember.Handlebars.registerBoundHelper('progressBar', function(percentage) {
  return new Handlebars.SafeString('<div class="progress progress-striped active no-margin" title="' + percentage + '%"><div class="bar" style="width: ' + percentage + '%;"></div></div>');
});
Ember.Handlebars.registerBoundHelper('completedJob', function(status, uuid) {
  var html = "";
  if (status == "complete") {
    return new Handlebars.SafeString("<a class='btn' target='_blank' href='" + tsvDownloadUrl + "uuid=" + uuid + "' title='TSV file ready. Click button to download.'>Download</a>");
  } else {
    return new Handlebars.SafeString("<button type='button' class='btn btn-disabled' disabled='disabled' title='TSV file still being created. Download button disabled until ready.'>Download</button>");
  }
});
Ember.Handlebars.registerHelper("log", function(context) {
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
  var link = '<a href="/compounds?uri=' + uri + '">' + label + '</a>';
  return new Handlebars.SafeString(link);		
});
Ember.Handlebars.registerBoundHelper('objectLink', function(type, route, routeLabel, content) {
  var link = '<a href="/' + type + '/' + route + '?uri=' + content.get('URI') + '">' + routeLabel + '</a>';
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
		if (Array.isArray(part)) {
			var parts = "";
                    part.forEach(function(item, index, array) {
                        index == 0 ? parts += item.split('#').pop() : parts += ', ' + item.split('#').pop();
		    });
		    return new  Handlebars.SafeString(parts);
		} else {
		    return new Handlebars.SafeString(part.split('#').pop());
		}
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
    return new Handlebars.SafeString(uri.split('/').pop());	
  }	
});
Ember.Handlebars.registerBoundHelper('cs_image_src', function(csURL, options) {
  if (options && csURL) {
      return new Handlebars.SafeString('<img width="128" height="128" src="http://ops.rsc.org/' + csURL.split("/").pop() + '/image">');
  }
});
Ember.Handlebars.registerBoundHelper('target_image_src', function(target, options) {
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
		var fullLink = '<a href="' + chemspiderId +'" target="_blank">' + id +'</a>'
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
	//console.log(" prov func params " + item + " " + source);
	
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
			
			case 'wikipathways':
			  	//console.log(" wikipathways datasource");
				linkout = createWikipathwaysLink(item);
				break;
			
			default:
				//console.log("source unrecognised: " + source);
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

function createWikipathwaysLink(item) {
	var dbLink;
	dbLink = '<a href="' + item + '" target="_blank"><img src="/assets/wikipathwaysProvIcon.png" title="WikiPathways" height="15" width="15"></a>'
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
