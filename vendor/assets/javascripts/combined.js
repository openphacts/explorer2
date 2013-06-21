var Openphacts = Openphacts || {};
Openphacts.CompoundSearch = function CompoundSearch(baseURL, appID, appKey) {
	this.baseURL = baseURL;
	this.appID = appID;
	this.appKey = appKey;
}

Openphacts.CompoundSearch.prototype.fetchCompound = function(compoundURI, callback) {
	var compoundQuery = $.ajax({
		url: this.baseURL + '/compound',
                dataType: 'json',
		cache: true,
		data: {
			_format: "json",
			uri: compoundURI,
			app_id: this.appID,
			app_key: this.appKey
		},
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result.primaryTopic);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.CompoundSearch.prototype.compoundPharmacology = function(compoundURI, page, pageSize, callback) {
	var compoundQuery = $.ajax({
		url: this.baseURL + '/compound/pharmacology/pages',
                dataType: 'json',
		cache: true,
		data: {
			_format: "json",
			_page: page,
			_pageSize: pageSize,
			uri: compoundURI,
			app_id: this.appID,
			app_key: this.appKey
		},
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.CompoundSearch.prototype.compoundPharmacologyCount = function(compoundURI, callback) {
	var compoundQuery = $.ajax({
		url: this.baseURL + '/compound/pharmacology/count',
                dataType: 'json',
		cache: true,
		data: {
			_format: "json",
			uri: compoundURI,
			app_id: this.appID,
			app_key: this.appKey
		},
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.CompoundSearch.prototype.parseCompoundResponse = function(response) {
	var drugbankData, chemspiderData, chemblData;
	var cwUri = response["_about"];
	var id = cwUri.split("/").pop();
	var prefLabel = response.prefLabel;
	$.each(response.exactMatch, function(i, exactMatch) {
		if (exactMatch["_about"]) {
			if (exactMatch["_about"].indexOf("http://www4.wiwiss.fu-berlin.de/drugbank") !== -1) {
				drugbankData = exactMatch;
			} else if (exactMatch["_about"].indexOf("http://linkedlifedata.com/resource/drugbank") !== -1) {
				drugbankData = exactMatch;
			} else if (exactMatch["_about"].indexOf("http://www.chemspider.com") !== -1) {
				chemspiderData = exactMatch;
			} else if (exactMatch["_about"].indexOf("http://rdf.chemspider.com") !== -1) {
				chemspiderData = exactMatch;
			} else if (exactMatch["_about"].indexOf("http://data.kasabi.com/dataset/chembl-rdf") !== -1) {
				chemblData = exactMatch;
			}
		}
	});
	return {
		id: id,
		prefLabel: prefLabel,
		cwUri: cwUri,
		description: drugbankData ? drugbankData.description : null,
		biotransformationItem: drugbankData ? drugbankData.biotransformation : null,
		toxicity: drugbankData ? drugbankData.toxicity : null,
		proteinBinding: drugbankData ? drugbankData.proteinBinding : null,
		csUri: chemspiderData ? chemspiderData["_about"] : null,
		hba: chemspiderData ? chemspiderData.hba : null,
		hbd: chemspiderData ? chemspiderData.hbd : null,
		inchi: chemspiderData ? chemspiderData.inchi : null,
		logp: chemspiderData ? chemspiderData.logp : null,
		psa: chemspiderData ? chemspiderData.psa : null,
		ro5Violations: chemspiderData ? chemspiderData.ro5_violations : null,
		smiles: chemspiderData ? chemspiderData.smiles : null,
		chemblURI: chemblData ? chemblData["_about"] : null,
		fullMWT: chemblData ? chemblData.full_mwt : null,
		molform: chemblData ? chemblData.molform : null,
		mwFreebase: chemblData ? chemblData.mw_freebase : null,
		rtb: chemblData ? chemblData.rtb : null,
                inchiKey: chemspiderData ? chemspiderData.inchikey : null
	};
}

Openphacts.CompoundSearch.prototype.parseCompoundPharmacologyResponse = function(response) {
	var records = [];

	$.each(response.items, function(i, item) {

		var chembl_activity_uri = item["_about"];
		var chembl_src = item["_inDataset"];
		var activity_pubmed_id = item['pmid'];
		var activity_relation = item['relation'];
		var activity_standard_units = item['standardUnits'];
		var activity_standard_value = item['standardValue'];
		var activity_activity_type = item['activity_type'];

		var compound_full_mwt_item;

		//big bits
		var forMolecule = item["forMolecule"];
		var chembleMolecultLink = 'https://www.ebi.ac.uk/chembldb/compound/inspect/';
		if (forMolecule != null) {
			var chembl_compound_uri = forMolecule["_about"];
			var compound_full_mwt = forMolecule['full_mwt'];
			chembleMolecultLink += chembl_compound_uri.split('/').pop();
			compound_full_mwt_item = chembleMolecultLink;
			var em = forMolecule["exactMatch"];
		}

		var cw_compound_uri, compound_pref_label, cw_src, cs_compound_uri, compound_inchi, compound_inchikey, compound_smiles, cs_src, drugbank_compound_uri, compound_drug_type, compound_generic_name, drugbank_src, csid, compound_smiles_item, compound_inchi_item, compound_inchikey_item, compound_pref_label_item;

		$.each(em, function(index, match) {
			var src = match["inDataset"];
			if (match["_about"].indexOf("http://www.conceptwiki.org") !== -1) {
				cw_compound_uri = match["_about"];
				compound_pref_label = match['prefLabel'];
				compound_pref_label_item = cw_compound_uri;
				cw_src = match["inDataset"];
			} else if (match["_about"].indexOf("chemspider.com") !== -1) {
				cs_compound_uri = match["_about"];
				csid = cs_compound_uri.split('/').pop();
				compound_inchi = match['inchi'];
				compound_inchikey = match['inchikey'];
				compound_smiles = match['smiles'];
				var chemSpiderLink = 'http://www.chemspider.com/' + csid;
				compound_smiles_item = chemSpiderLink;
				compound_inchi_item = chemSpiderLink;
				compound_inchikey_item = chemSpiderLink;
				cs_src = match["inDataset"];
			} else if (match["_about"].indexOf("http://www4.wiwiss.fu-berlin.de/drugbank") !== -1) {
				drugbank_compound_uri = match["_about"];
				compound_drug_type = match['drugType'];
				compound_generic_name = match['genericName'];
				drugbank_src = match["_about"];
			} else if (match["_about"].indexOf("http://linkedlifedata.com/resource/drugbank") !== -1) {
				drugbank_compound_uri = match["_about"];
				compound_drug_type = match['drugType'];
				compound_generic_name = match['genericName'];
				drugbank_src = match["_about"];
			}
		});

		var target_title_item, target_organism_item, activity_activity_type_item, activity_standard_value_item, activity_standard_units_item, activity_relation_item, assay_description, assay_description_item, assay_organism, assay_organism_src, assay_organism_item;

		var onAssay = item["onAssay"];
		//console.log(" ITEM : " + onAssay["_about"]);
		if (onAssay != null) {
			var chembl_assay_uri = onAssay["_about"];
			var chembldAssayLink = 'https://www.ebi.ac.uk/chembldb/assay/inspect/';
			assay_description = onAssay['description'];
			var chembleAssayLink = chembldAssayLink + chembl_assay_uri.split('/').pop();
			assay_description_item = chembleAssayLink;
			assay_organism = onAssay['organism'];
			assay_organism_item = chembleAssayLink;

			var target = onAssay['target'];
			var targets = new Array();
			var target_organisms = new Array();

                        if ($.isArray(target)) {
			    $.each(target, function(index, target_item) {	
				// For Target
				var target_inner = {};
			        target_inner['title'] = target_item['title']
				target_inner['src'] = onAssay["inDataset"] ? onAssay["inDataset"] : '';
				if (target_item["_about"]) {
                                        target_inner['about'] = target_item['_about'];
					var targetLink = 'https://www.ebi.ac.uk/chembl/target/inspect/' + target_item["_about"].split('/').pop();
					target_inner['item'] = targetLink;
				} else {
					target_inner['item'] = '';
				}
				targets.push(target_inner);

				// For Organism
				var organism_inner = {};
				organism_inner['organism'] = target_item['organism'] ? target_item['organism'] : '';
				organism_inner['src'] = onAssay["inDataset"] ? onAssay["inDataset"] : '';
				if (target_item["_about"]) {
					var organismLink = 'https://www.ebi.ac.uk/chembl/target/inspect/' + target_item["_about"].split('/').pop();
					organism_inner['item'] = organismLink;
				} else {
					organism_inner['item'] = '';
				}
				target_organisms.push(organism_inner);
			    });
                        } else {	
		            // For Target
			    var target_inner = {};
			    target_inner['title'] = target['title']
			    target_inner['src'] = onAssay["inDataset"] ? onAssay["inDataset"] : '';
			    if (target["_about"]) {
                                target_inner['about'] = target['_about'];
				var targetLink = 'https://www.ebi.ac.uk/chembl/target/inspect/' + target["_about"].split('/').pop();
				target_inner['item'] = targetLink;
			     } else {
				target_inner['item'] = '';
			     }
			     targets.push(target_inner);

			     // For Organism
			     var organism_inner = {};
			     organism_inner['organism'] = target['organism'] ? target['organism'] : '';
			     organism_inner['src'] = onAssay["inDataset"] ? onAssay["inDataset"] : '';
			     if (target["_about"]) {
				var organismLink = 'https://www.ebi.ac.uk/chembl/target/inspect/' + target["_about"].split('/').pop();
				organism_inner['item'] = organismLink;
			     } else {
				organism_inner['item'] = '';
			     }
			     target_organisms.push(organism_inner);
                        }
		}

		var chemblActivityLink = 'https://www.ebi.ac.uk/ebisearch/crossrefsearch.ebi?id=' + chembl_activity_uri.split('/a').pop() + '&db=chembl-activity&ref=chembl-compound';

		//console.log(" chembl value " + chembl_activity_uri.split('/a').pop());
		activity_activity_type_item = chemblActivityLink;
		activity_standard_value_item = chemblActivityLink;
		activity_standard_units_item = chemblActivityLink;
		activity_relation_item = chemblActivityLink;
		records.push({
			//for compound
			compoundInchikey: compound_inchikey,
			compoundDrugType: compound_drug_type,
			compoundGenericName: compound_generic_name,
			targets: targets,
			compoundInchikeySrc: cs_src,
			compoundDrugTypeSrc: drugbank_src,
			compoundGenericNameSrc: drugbank_src,
			targetTitleSrc: chembl_src,
			//for target
			chemblActivityUri: chembl_activity_uri,
			chemblCompoundUri: chembl_compound_uri,
			compoundFullMwt: compound_full_mwt,
			cwCompoundUri: cw_compound_uri,
			compoundPrefLabel: compound_pref_label,
			csCompoundUri: cs_compound_uri,
			csid: csid,
			compoundInchi: compound_inchi,
			compoundSmiles: compound_smiles,
			chemblAssayUri: chembl_assay_uri,
			targetOrganisms: target_organisms,
			assayOrganism: assay_organism,
			assayDescription: assay_description,
			activityRelation: activity_relation,
			activityStandardUnits: activity_standard_units,
			activityStandardValue: activity_standard_value,
			activityActivityType: activity_activity_type,

			compoundFullMwtSrc: chembl_src,
			compoundPrefLabel_src: cw_src,
			compoundInchiSrc: cs_src,
			compoundSmilesSrc: cs_src,
			targetOrganismSrc: chembl_src,
			assayOrganismSrc: chembl_src,
			assayDescriptionSrc: chembl_src,
			activityRelationSrc: chembl_src,
			activityStandardUnitsSrc: chembl_src,
			activityStandardValueSrc: chembl_src,
			activityActivityTypeSrc: chembl_src,
			activityPubmedId: activity_pubmed_id,
			assayDescriptionItem: assay_description_item,
			assayOrganismItem: assay_organism_item,
			activityActivityTypeItem: activity_activity_type_item,
			activityRelationItem: activity_relation_item,
			activityStandardValueItem: activity_standard_value_item,
			activityStandardUnitsItem: activity_standard_units_item,
			compoundFullMwtItem: compound_full_mwt_item,
			compoundSmilesItem: compound_smiles_item,
			compoundInchiItem: compound_inchi_item,
			compoundInchikeyItem: compound_inchikey_item,
			compoundPrefLabelItem: compound_pref_label_item
		});
	});
	return records;
}

Openphacts.CompoundSearch.prototype.parseCompoundPharmacologyCountResponse = function(response) {
    return response.primaryTopic.compoundPharmacologyTotalResults;
}
Openphacts.ConceptWikiSearch = function(baseURL, appID, appKey) {
	this.baseURL = baseURL;
	this.appID = appID;
	this.appKey = appKey;
}

Openphacts.ConceptWikiSearch.prototype.byTag = function(query, limit, branch, type, callback) {
	var conceptWikiSearcher = $.ajax({
		url: this.baseURL + "/search/byTag",
                dataType: 'json',
		cache: true,
		data: {
			q: query,
			limit: limit,
			branch: branch,
			uuid: type,
			app_id: this.appID,
			app_key: this.appKey
		},
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result.primaryTopic.result);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.ConceptWikiSearch.prototype.findCompounds = function(query, limit, branch, callback) {
	var conceptWikiSearcher = $.ajax({
		url: this.baseURL + "/search/byTag",
                dataType: 'json',
		cache: true,
		data: {
			q: query,
			limit: limit,
			branch: branch,
			uuid: '07a84994-e464-4bbf-812a-a4b96fa3d197',
			app_id: this.appID,
			app_key: this.appKey
		},
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result.primaryTopic.result);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.ConceptWikiSearch.prototype.findTargets = function(query, limit, branch, callback) {
	var conceptWikiSearcher = $.ajax({
		url: this.baseURL + "/search/byTag",
                dataType: 'json',
		cache: true,
		data: {
			q: query,
			limit: limit,
			branch: branch,
			uuid: 'eeaec894-d856-4106-9fa1-662b1dc6c6f1',
			app_id: this.appID,
			app_key: this.appKey
		},
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result.primaryTopic.result);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.ConceptWikiSearch.prototype.parseResponse = function(response) {
	var uris = [];
	//response can be either array or singleton.
	if (response instanceof Array) {
		$.each(response, function(i, match) {
			uris.push({
				'uri': match["_about"],
				'prefLabel': match["prefLabel"],
				'match': match["match"]
			});
		});
	} else {
		uris.push({
			'uri': response["_about"],
			'prefLabel': response["prefLabel"],
			'match': response["match"]
		});
	}
	return uris;
}

Openphacts.ConceptWikiSearch.prototype.findConcept = function(uuid, callback) {
	var conceptWikiSearcher = $.ajax({
                dataType: 'json',
		url: this.baseURL + "/getConceptDescription",
		cache: true,
		data: {
			uuid: uuid,
			app_id: this.appID,
			app_key: this.appKey
		},
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result.primaryTopic);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.ConceptWikiSearch.prototype.parseFindConceptResponse = function(response) {
	var prefLabel = response.prefLabel_en;
	var definition = response.definition;
	var altLabels = [];
	if (response.altLabel_en) {
		$.each(response.altLabel_en, function(index, altLabel) {
			altLabels.push(altLabel);
		});
	}
	return {
		prefLabel: prefLabel,
		definition: definition,
		altLabels: altLabels
	};
}
Openphacts.TargetSearch = function TargetSearch(baseURL, appID, appKey) {
	this.baseURL = baseURL;
	this.appID = appID;
	this.appKey = appKey;
}

Openphacts.TargetSearch.prototype.fetchTarget = function(targetURI, callback) {
	var targetQuery = $.ajax({
		url: this.baseURL + '/target',
                dataType: 'json',
		cache: true,
		data: {
			_format: "json",
			uri: targetURI,
			app_id: this.appID,
			app_key: this.appKey
		},
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result.primaryTopic);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.TargetSearch.prototype.targetPharmacology = function(targetURI, page, pageSize, callback) {
	var targetQuery = $.ajax({
		url: this.baseURL + '/target/pharmacology/pages',
                dataType: 'json',
		cache: true,
		data: {
			_format: "json",
			_page: page,
			_pageSize: pageSize,
			uri: targetURI,
			app_id: this.appID,
			app_key: this.appKey
		},
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.TargetSearch.prototype.targetPharmacologyCount = function(targetURI, callback) {
	var targetQuery = $.ajax({
		url: this.baseURL + '/target/pharmacology/count',
                dataType: 'json',
		cache: true,
		data: {
			_format: "json",
			uri: targetURI,
			app_id: this.appID,
			app_key: this.appKey
		},
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.TargetSearch.prototype.parseTargetResponse = function(response) {
	var drugbankData, chemblData, uniprotData;
	var cwUri = response["_about"];
	var id = cwUri.split("/").pop();
	var keywords = [];
	var classifiedWith = [];
	var seeAlso = [];
        var label = response.prefLabel;
	$.each(response.exactMatch, function(i, exactMatch) {
		if (exactMatch["_about"]) {
			if (exactMatch["_about"].indexOf("http://www4.wiwiss.fu-berlin.de/drugbank") !== -1) {
				drugbankData = exactMatch;
			} else if (exactMatch["_about"].indexOf("http://linkedlifedata.com/resource/drugbank") !== -1) {
				drugbankData = exactMatch;
			} else if (exactMatch["_about"].indexOf("http://data.kasabi.com/dataset/chembl-rdf") !== -1) {
				chemblData = exactMatch;
				$.each(chemblData.keyword, function(j, key) {
					keywords.push(key);
				});
			} else if (exactMatch["_about"].indexOf("http://purl.uniprot.org") !== -1) {
				uniprotData = exactMatch;
				if (uniprotData.classifiedWith) {
					$.each(uniprotData.classifiedWith, function(j, classified) {
						classifiedWith.push(classified);
					});
				}
				if (uniprotData.seeAlso) {
					$.each(uniprotData.seeAlso, function(j, see) {
						seeAlso.push(see);
					});
				}
			} else if (exactMatch["_about"].indexOf("conceptwiki.org") !== -1) {
                          // if using a chembl id to search then the about would be a chembl id rather than the
                          // cw one which we want
                          id = exactMatch["_about"].split("/").pop();
                          label = exactMatch["prefLabel"];
                        }
		}
	});
	return {
		id: id,
		cellularLocation: drugbankData ? drugbankData.cellularLocation : null,
		molecularWeight: drugbankData ? drugbankData.molecularWeight : null,
		numberOfResidues: drugbankData ? drugbankData.numberOfResidues : null,
		theoreticalPi: drugbankData ? drugbankData.theoreticalPi : null,
		drugbankURI: drugbankData ? drugbankData["_about"] : null,
		description: chemblData ? chemblData.description : null,
		subClassOf: chemblData ? chemblData.subClassOf : null,
		keywords: keywords,
		functionAnnotation: uniprotData ? uniprotData.Function_Annotation : null,
		alternativeName: uniprotData ? uniprotData.alternativeName : null,
		existence: uniprotData ? uniprotData.existence : null,
		organism: uniprotData ? uniprotData.organism : null,
		sequence: uniprotData ? uniprotData.sequence : null,
		classifiedWith: classifiedWith,
		seeAlso: seeAlso,
                prefLabel: label
	};
}

Openphacts.TargetSearch.prototype.parseTargetPharmacologyResponse = function(response) {
	var records = [];

	$.each(response.items, function(index, item) {
		var chembl_activity_uri = item["_about"];
		var chembl_src = item["inDataset"];

		//big bits
		var forMolecule = item["forMolecule"];
		var chembl_compound_uri;
		var compound_full_mwt;
		var compound_full_mwt_item;

		var em;
		var chembleMolecultLink = 'https://www.ebi.ac.uk/chembldb/compound/inspect/';

		if (forMolecule != null) {
			chembl_compound_uri = forMolecule["_about"];
			compound_full_mwt = forMolecule['full_mwt'];
			chembleMolecultLink += chembl_compound_uri.split('/').pop();
			compound_full_mwt_item = chembleMolecultLink;
			em = forMolecule["exactMatch"];
		}

		var cw_compound_uri, compound_pref_label, cw_src, cs_compound_uri, compound_inchi, compound_inchikey, compound_smiles, cs_src, drugbank_compound_uri, compound_drug_type, compound_generic_name, drugbank_src, csid, compound_pref_label_item, compound_inchi_item, compound_inchikey_item, compound_smiles_item, assay_description, assay_description_item;

		$.each(em, function(index, match) {
			var src = match["inDataset"];
			if (match["_about"].indexOf("http://www.conceptwiki.org") !== -1) {
				cw_compound_uri = match["_about"];
				compound_pref_label = match['prefLabel'];
				cw_src = match["inDataset"];
				compound_pref_label_item = cw_compound_uri;
			} else if (match["_about"].indexOf("chemspider.com") !== -1) {
				cs_compound_uri = match["_about"];
				csid = cs_compound_uri.split('/').pop();
				compound_inchi = match['inchi'];
				compound_inchikey = match['inchikey'];
				compound_smiles = match['smiles'];
				cs_src = match["inDataset"];
				var chemSpiderLink = 'http://www.chemspider.com/' + csid;
				compound_inchi_item = chemSpiderLink;
				compound_inchikey_item = chemSpiderLink;
				compound_smiles_item = chemSpiderLink;
			} else if (match["_about"].indexOf("http://www4.wiwiss.fu-berlin.de/drugbank") !== -1) {
				drugbank_compound_uri = match["_about"];
				compound_drug_type = match['drugType'];
				compound_generic_name = match['genericName'];
				drugbank_src = match["_about"];
			} else if (match["_about"].indexOf("http://linkedlifedata.com/resource/drugbank") !== -1) {
				drugbank_compound_uri = match["_about"];
				compound_drug_type = match['drugType'];
				compound_generic_name = match['genericName'];
				drugbank_src = match["_about"];
			}
		});

		var onAssay = item["onAssay"];
		var chembl_assay_uri;
		var assay_organism;
		var assay_organism_item;
		var target;
		var chembldAssayLink = 'https://www.ebi.ac.uk/chembldb/assay/inspect/';

		if (onAssay != null) {
			chembl_assay_uri = onAssay["_about"];
			assay_organism = onAssay['assay_organism'];
			assay_organism_item = chembldAssayLink + chembl_assay_uri.split('/').pop();
			assay_description = onAssay['description'];
			assay_description_item = chembldAssayLink + chembl_assay_uri.split('/').pop();
			target = onAssay['target'];
		}
		var chembl_target_uri;
		var target_pref_label;
		var target_pref_label_item;
		var targetMatch;
		var target_title;
		var target_organism;
		var target_organism_item;
		var target_concatenated_uris;
		var chemblTargetLink = 'https://www.ebi.ac.uk/chembldb/target/inspect/';
		var target_organisms = new Array();
		var targets = new Array();
		if (target != null) {
			chembl_target_uri = target["_about"];
			//target_pref_label = target['prefLabel'];
			targetMatch = target['exactMatch'];
			if (targetMatch != null) {
				var targetMatchURI = targetMatch["_about"];
				target_pref_label = targetMatch['prefLabel'];
				target_pref_label_item = targetMatchURI;
				target_title = target_pref_label;
			}

			target_organism = target['target_organism'];
			target_organism_item = chemblTargetLink + chembl_target_uri.split('/').pop();
			target_concatenated_uris = target['concatenatedURIs'];
			var target_organisms_inner = {};
			target_organisms_inner['organism'] = target_organism;
			target_organisms_inner['src'] = target_organism_item;
			target_organisms.push(target_organisms_inner);
			var targets_inner = {};
			targets_inner['title'] = target_pref_label;
			targets_inner['cw_uri'] = target_pref_label_item;
			targets.push(targets_inner);
		}

		var chemblActivityLink = 'https://www.ebi.ac.uk/ebisearch/crossrefsearch.ebi?id=' + chembl_activity_uri.split('/a').pop() + '&db=chembl-activity&ref=chembl-compound';

		var activity_activity_type_item, activity_standard_value_item, activity_standard_units_item, activity_relation_item;

		var activity_activity_type = item['activity_type'];
		activity_activity_type_item = chemblActivityLink;
		var activity_standard_value = item['standardValue'];
		activity_standard_value_item = chemblActivityLink;
		var activity_standard_units = item['standardUnits'];
		activity_standard_units_item = chemblActivityLink;
		var activity_relation = item['relation'];
		activity_relation_item = chemblActivityLink;
		var activity_pubmed_id = item['pmid'];
		records.push({ //for compound
			compoundInchikey: compound_inchikey,
			compoundDrugType: compound_drug_type,
			compoundGenericName: compound_generic_name,
			targetTitle: target_title,
			targetConcatenatedUris: target_concatenated_uris,

			compoundInchikeySrc: cs_src,
			compoundDrugTypeSrc: drugbank_src,
			compoundGenericNameSrc: drugbank_src,
			targetTitleSrc: chembl_src,
			targetConcatenatedUrisSrc: chembl_src,


			//for target
			chemblActivityUri: chembl_activity_uri,
			chemblCompoundUri: chembl_compound_uri,
			compoundFullMwt: compound_full_mwt,
			cwCompoundUri: cw_compound_uri,
			compoundPrefLabel: compound_pref_label,
			csCompoundUri: cs_compound_uri,
			csid: csid,
			compoundInchi: compound_inchi,
			compoundSmiles: compound_smiles,
			chemblAssayUri: chembl_assay_uri,
			chemblTargetUri: chembl_target_uri,

			targetOrganism: target_organism,
			targetOrganisms: target_organisms,
			targetPrefLabel: target_pref_label,

			assayOrganism: assay_organism,
			assayDescription: assay_description,
			activityRelation: activity_relation,
			activityStandardUnits: activity_standard_units,
			activityStandardValue: activity_standard_value,
			activityActivityType: activity_activity_type,
			activityPubmedId: activity_pubmed_id,

			compoundFullMwtSrc: chembl_src,
			compoundPrefLabelSrc: cw_src,
			compoundInchiSrc: cs_src,
			compoundSmilesSrc: cs_src,
			targetOrganismSrc: chembl_src,
			targetPrefLabelSrc: cw_src,
			assayOrganismSrc: chembl_src,
			assayDescriptionSrc: chembl_src,
			activityRelationSrc: chembl_src,
			activityStandardUnits_src: chembl_src,
			activityStandardValue_src: chembl_src,
			activityActivityType_src: chembl_src,

			compoundPrefLabelItem: compound_pref_label_item,
			activityActivityTypeItem: activity_activity_type_item,
			activityRelationItem: activity_relation_item,
			activityStandardValueItem: activity_standard_value_item,
			activityStandardUnitsItem: activity_standard_units_item,
			compoundFullMwtItem: compound_full_mwt_item,
			compoundSmilesItem: compound_smiles_item,
			compoundInchiItem: compound_inchi_item,
			compoundInchikeyItem: compound_inchikey_item,
			targetPrefLabelItem: target_pref_label_item,
			assayOrganismItem: assay_organism_item,
			assayDescriptionItem: assay_description_item,
			targetOrganismItem: target_organism_item,
			targets: targets
		});
	});
	return records;
}

Openphacts.TargetSearch.prototype.parseTargetPharmacologyCountResponse = function(response) {
    return response.primaryTopic.targetPharmacologyTotalResults;
}
Openphacts.StructureSearch = function StructureSearch(baseURL, appID, appKey) {
	this.baseURL = baseURL;
	this.appID = appID;
	this.appKey = appKey;
}

Openphacts.StructureSearch.prototype.exact = function(smiles, matchType, limit, start, length, callback) {
        params={};
        params['_format'] = "json";
        params['app_key'] = this.appKey;
        params['app_id'] = this.appID;
        params['searchOptions.Molecule'] = smiles;
        matchType != null ? params['searchOptions.MatchType'] = matchType : '';
        limit != null ? params['resultOptions.Limit'] = limit : '';
        start != null ? params['resultOptions.Start'] = start : '';
        length != null ? params['resultOptions.Length'] = length : '';
	var exactQuery = $.ajax({
		url: this.baseURL + '/structure/exact',
                dataType: 'json',
		cache: true,
		data: params,
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result.primaryTopic);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.StructureSearch.prototype.substructure = function(smiles, limit, start, length, callback) {
        params={};
        params['_format'] = "json";
        params['app_key'] = this.appKey;
        params['app_id'] = this.appID;
        params['searchOptions.Molecule'] = smiles;
        limit != null ? params['resultOptions.Limit'] = limit : '';
        start != null ? params['resultOptions.Start'] = start : '';
        length != null ? params['resultOptions.Length'] = length : '';
	var exactQuery = $.ajax({
		url: this.baseURL + '/structure/substructure',
                dataType: 'json',
		cache: true,
		data: params,
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result.primaryTopic);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.StructureSearch.prototype.inchiKeyToURL = function(inchiKey, callback) {
	var exactQuery = $.ajax({
		url: this.baseURL + '/structure',
                dataType: 'json',
		cache: true,
		data: {
		    _format: "json",
                    app_id: this.appID,
                    app_key: this.appKey,
                    inchi_key: inchiKey
                },
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result.primaryTopic);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.StructureSearch.prototype.inchiToURL = function(inchi, callback) {
	var exactQuery = $.ajax({
		url: this.baseURL + '/structure',
                dataType: 'json',
		cache: true,
		data: {
	            _format: "json",
                    app_id: this.appID,
                    app_key: this.appKey,
                    inchi: inchi
                },
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result.primaryTopic);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.StructureSearch.prototype.similarity = function(smiles, type, threshold, limit, start, length, callback) {
        params={};
        params['_format'] = "json";
        params['app_key'] = this.appKey;
        params['app_id'] = this.appID;
        params['searchOptions.Molecule'] = smiles;
        type != null ? params['searchOptions.SimilarityType'] = type : params['searchOptions.SimilarityType'] = 0;
        threshold != null ? params['searchOptions.Threshold'] = threshold : params['searchOptions.Threshold'] = 0.99;
        limit != null ? params['resultOptions.Limit'] = limit : '';
        start != null ? params['resultOptions.Start'] = start : '';
        length != null ? params['resultOptions.Length'] = length : '';
	var exactQuery = $.ajax({
		url: this.baseURL + '/structure/similarity',
                dataType: 'json',
		cache: true,
		data: params,
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result.primaryTopic);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.StructureSearch.prototype.smilesToURL = function(smiles, callback) {
	var exactQuery = $.ajax({
		url: this.baseURL + '/structure',
                dataType: 'json',
		cache: true,
		data: {
	            _format: "json",
                    app_id: this.appID,
                    app_key: this.appKey,
                    smiles: smiles
                },
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result.primaryTopic);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.StructureSearch.prototype.parseExactResponse = function(response) {
	return {
                type: response.type,
                molecule: response.Molecule,
                csURI: response.result
        };
}

Openphacts.StructureSearch.prototype.parseSubstructureResponse = function(response) {
	return response.result;
}

Openphacts.StructureSearch.prototype.parseInchiKeyToURLResponse = function(response) {
	return response["_about"];
}

Openphacts.StructureSearch.prototype.parseInchiToURLResponse = function(response) {
	return response["_about"];
}

Openphacts.StructureSearch.prototype.parseSimilarityResponse = function(response) {
	return response.result;
}

Openphacts.StructureSearch.prototype.parseSmilesToURLResponse = function(response) {
	return response["_about"];
}
Openphacts.ActivitySearch = function ActivitySearch(baseURL, appID, appKey) {
	this.baseURL = baseURL;
	this.appID = appID;
	this.appKey = appKey;
}

Openphacts.ActivitySearch.prototype.getTypes = function(callback) {
	var activityQuery = $.ajax({
		url: this.baseURL + '/pharmacology/filters/activities',
                dataType: 'json',
		cache: true,
		data: {
			_format: "json",
			app_id: this.appID,
			app_key: this.appKey
		},
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result.primaryTopic);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.ActivitySearch.prototype.getUnits = function(activityType, callback) {
	var activityQuery = $.ajax({
		url: this.baseURL + '/pharmacology/filters/units/' + activityType,
                dataType: 'json',
		cache: true,
		data: {
			_format: "json",
			app_id: this.appID,
			app_key: this.appKey
		},
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result.primaryTopic);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.ActivitySearch.prototype.parseTypes = function(response) {
        var activityTypes = [];
	$.each(response.normalised_activity_type, function(i, type) {
            activityTypes.push({uri: type["_about"], label: type.label});
	});
	return activityTypes;
}

Openphacts.ActivitySearch.prototype.parseUnits = function(response) {
        var units = [];
	$.each(response.unit, function(i, type) {
            units.push({uri: type["_about"], label: type.label});
	});
	return units;
}
Openphacts.ChebiSearch = function ChebiSearch(baseURL, appID, appKey) {
	this.baseURL = baseURL;
	this.appID = appID;
	this.appKey = appKey;
}

Openphacts.ChebiSearch.prototype.getOntologyClassMembers = function(chebiURI, callback) {
	var chebiQuery = $.ajax({
		url: this.baseURL + '/compound/chebi/members',
                dataType: 'json',
		cache: true,
		data: {
			_format: "json",
			uri: chebiURI,
			app_id: this.appID,
			app_key: this.appKey
		},
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result.primaryTopic);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.ChebiSearch.prototype.getOntologyRootClassMembers = function(callback) {
	var chebiQuery = $.ajax({
		url: this.baseURL + '/compound/chebi/root',
                dataType: 'json',
		cache: true,
		data: {
			_format: "json",
			app_id: this.appID,
			app_key: this.appKey
		},
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result.primaryTopic);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.ChebiSearch.prototype.getOntologyClass = function(chebiURI, callback) {
	var chebiQuery = $.ajax({
		url: this.baseURL + '/compound/chebi/node',
                dataType: 'json',
		cache: true,
		data: {
			_format: "json",
                        uri: chebiURI,
			app_id: this.appID,
			app_key: this.appKey
		},
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result.primaryTopic);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.ChebiSearch.prototype.getClassPharmacologyCount = function(chebiURI, assayOrganism, targetOrganism, activityType, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, activityUnit, callback) {
        params={};
        params['_format'] = "json";
        params['app_key'] = this.appKey;
        params['app_id'] = this.appID;
        params['uri'] = chebiURI;
        assayOrganism != null ? params['assay_organism'] = assayOrganism : '';
        targetOrganism != null ? params['target_organism'] = targetOrganism : '';
        activityType != null ? params['activity_type'] = activityType : '';
        activityValue != null ? params['activity_value'] = activityValue : '';
        minActivityValue != null ? params['min-activity_value'] = minActivityValue : '';
        minExActivityValue != null ? params['minEx-activity_value'] = minExActivityValue : '';
        maxActivityValue != null ? params['max-activity_value'] = maxActivityValue : '';
        maxExActivityValue != null ? params['maxEx-activity_value'] = maxExActivityValue : '';
        activityUnit != null ? params['activity_unit'] = activityUnit : '';
	var chebiQuery = $.ajax({
		url: this.baseURL + '/compound/chebi/pharmacology/count',
                dataType: 'json',
		cache: true,
		data: params,
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result.primaryTopic);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.ChebiSearch.prototype.getClassPharmacologyPaginated = function(chebiURI, assayOrganism, targetOrganism, activityType, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, activityUnit, page, pageSize, orderBy, callback) {
        params={};
        params['_format'] = "json";
        params['app_key'] = this.appKey;
        params['app_id'] = this.appID;
        params['uri'] = chebiURI;
        assayOrganism != null ? params['assay_organism'] = assayOrganism : '';
        targetOrganism != null ? params['target_organism'] = targetOrganism : '';
        activityType != null ? params['activity_type'] = activityType : '';
        activityValue != null ? params['activity_value'] = activityValue : '';
        minActivityValue != null ? params['min-activity_value'] = minActivityValue : '';
        minExActivityValue != null ? params['minEx-activity_value'] = minExActivityValue : '';
        maxActivityValue != null ? params['max-activity_value'] = maxActivityValue : '';
        maxExActivityValue != null ? params['maxEx-activity_value'] = maxExActivityValue : '';
        activityUnit != null ? params['activity_unit'] = activityUnit : '';
        page != null ? params['_page'] = page : '';
        pageSize != null ? params['_pageSize'] = pageSize : '';
        orderBy != null ? params['_orderBy'] = orderBy : '';
	var chebiQuery = $.ajax({
		url: this.baseURL + '/compound/chebi/pharmacology/pages',
                dataType: 'json',
		cache: true,
		data: params,
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.ChebiSearch.prototype.parseOntologyClassMembers = function(response) {
        var chebiOntologyClassMembers = [];
	$.each(response.has_member, function(i, member) {
            chebiOntologyClassMembers.push({uri: member["_about"], label: member.label});
	});
	return chebiOntologyClassMembers;
}

Openphacts.ChebiSearch.prototype.parseOntologyRootClassMembers = function(response) {
        var chebiOntologyRootMembers = [];
	$.each(response.rootNode, function(i, member) {
            chebiOntologyRootMembers.push({uri: member["_about"], label: member.label});
	});
	return chebiOntologyRootMembers;
}

Openphacts.ChebiSearch.prototype.parseOntologyClass = function(response) {
        var chebiOntologyRootMembers = [];
	$.each(response.sibling, function(i, member) {
            chebiOntologyRootMembers.push({uri: member["_about"], label: member.label});
	});
	return chebiOntologyRootMembers;
}

Openphacts.ChebiSearch.prototype.parseClassPharmacologyCount = function(response) {
	return response.chebiPharmacologyTotalResults;
}

Openphacts.ChebiSearch.prototype.parseClassPharmacologyPaginated = function(response) {
        var records = [];
        $.each(response.items, function(i, item) {
            var chemblActivityURI, chemblURI, pmid, fullMWT, inDataset, cwURL, prefLabel, csURI, inchi, inchiKey, smiles, ro5Violations, assayURI, assayDescription, assayTarget, assayOrganism, assayDataset, purlURL;
            chemblActivityURI = item["_about"];
            pmid = item.pmid;
            chemblURI = item.forMolecule["_about"];
            fullMWT = item.forMolecule.full_mwt;
            inDataset = item.forMolecule.inDataset;
            $.each(item.forMolecule.exactMatch, function(j, match) {
		if (match["_about"] && match["_about"].indexOf("http://www.conceptwiki.org") !== -1) {
                    cwURI = match["_about"];
                    prefLabel = match["prefLabel"];
		} else if (match["_about"] && match["_about"].indexOf("chemspider.com") !== -1) {
                    csURI = match["_about"];
                    inchi = match.inchi;
                    inchiKey = match.inchikey;
                    smiles = match.smiles;
                    ro5Violations = match.ro5_violations;
		} else if (match.indexOf("purl.obolibrary.org") !== -1) {
                    purlURI = match;
                }
            });
            assayURI = item.onAssay["_about"];
            assayDescription = item.onAssay.description;
            assayTarget = item.onAssay.target;
            assayOrganism = item.onAssay.assay_organism;
            assayDataset = item.onAssay.inDataset;
            records.push({
                    chemblActivityURI: chemblActivityURI,
                    chemblURI: chemblURI,
                    pmid: pmid,
                    fullMWT: fullMWT,
                    inDataset: inDataset,
                    cwURI: cwURI,
                    prefLabel: prefLabel,
                    csURI: csURI,
                    inchi: inchi,
                    inchiKey: inchiKey,
                    smiles: smiles,
                    ro5Violations: ro5Violations,
                    assayURI: assayURI,
                    assayDescription: assayDescription,
                    assayTarget: assayTarget,
                    assayOrganism: assayOrganism,
                    assayDataset: assayDataset,
                    purlURI: purlURI
             });
        });
	return records;
}
Openphacts.EnzymeSearch = function EnzymeSearch(baseURL, appID, appKey) {
	this.baseURL = baseURL;
	this.appID = appID;
	this.appKey = appKey;
}

Openphacts.EnzymeSearch.prototype.getClassificationRootClasses = function(callback) {
	var enzymeQuery = $.ajax({
		url: this.baseURL + '/target/enzyme/root',
                dataType: 'json',
		cache: true,
		data: {
			_format: "json",
			app_id: this.appID,
			app_key: this.appKey
		},
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result.primaryTopic);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.EnzymeSearch.prototype.getClassificationClass = function(enzymeURI, callback) {
	var enzymeQuery = $.ajax({
		url: this.baseURL + '/target/enzyme/node',
                dataType: 'json',
		cache: true,
		data: {
			_format: "json",
                        uri: enzymeURI,
			app_id: this.appID,
			app_key: this.appKey
		},
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result.primaryTopic);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.EnzymeSearch.prototype.getClassificationClassMembers = function(enzymeURI, callback) {
	var enzymeQuery = $.ajax({
		url: this.baseURL + '/target/enzyme/members',
                dataType: 'json',
		cache: true,
		data: {
			_format: "json",
                        uri: enzymeURI,
			app_id: this.appID,
			app_key: this.appKey
		},
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result.primaryTopic);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.EnzymeSearch.prototype.getPharmacologyCount = function(enzymeURI, assayOrganism, targetOrganism, activityType, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, activityUnit, callback) {
        params={};
        params['_format'] = "json";
        params['app_key'] = this.appKey;
        params['app_id'] = this.appID;
        params['uri'] = enzymeURI;
        assayOrganism != null ? params['assay_organism'] = assayOrganism : '';
        targetOrganism != null ? params['target_organism'] = targetOrganism : '';
        activityType != null ? params['activity_type'] = activityType : '';
        activityValue != null ? params['activity_value'] = activityValue : '';
        minActivityValue != null ? params['min-activity_value'] = minActivityValue : '';
        minExActivityValue != null ? params['minEx-activity_value'] = minExActivityValue : '';
        maxActivityValue != null ? params['max-activity_value'] = maxActivityValue : '';
        maxExActivityValue != null ? params['maxEx-activity_value'] = maxExActivityValue : '';
        activityUnit != null ? params['activity_unit'] = activityUnit : '';
	var enzymeQuery = $.ajax({
		url: this.baseURL + '/target/enzyme/pharmacology/count',
                dataType: 'json',
		cache: true,
		data: params,
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result.primaryTopic);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.EnzymeSearch.prototype.getPharmacologyPaginated = function(enzymeURI, assayOrganism, targetOrganism, activityType, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, activityUnit, page, pageSize, orderBy, callback) {
        params={};
        params['_format'] = "json";
        params['app_key'] = this.appKey;
        params['app_id'] = this.appID;
        params['uri'] = enzymeURI;
        assayOrganism != null ? params['assay_organism'] = assayOrganism : '';
        targetOrganism != null ? params['target_organism'] = targetOrganism : '';
        activityType != null ? params['activity_type'] = activityType : '';
        activityValue != null ? params['activity_value'] = activityValue : '';
        minActivityValue != null ? params['min-activity_value'] = minActivityValue : '';
        minExActivityValue != null ? params['minEx-activity_value'] = minExActivityValue : '';
        maxActivityValue != null ? params['max-activity_value'] = maxActivityValue : '';
        maxExActivityValue != null ? params['maxEx-activity_value'] = maxExActivityValue : '';
        activityUnit != null ? params['activity_unit'] = activityUnit : '';
        page != null ? params['_page'] = page : '';
        pageSize != null ? params['_pageSize'] = pageSize : '';
        orderBy != null ? params['_orderBy'] = orderBy : '';
	var chebiQuery = $.ajax({
		url: this.baseURL + '/target/enzyme/pharmacology/pages',
                dataType: 'json',
		cache: true,
		data: params,
		success: function(response, status, request) {
			callback.call(this, true, request.status, response.result);
		},
		error: function(request, status, error) {
			callback.call(this, false, request.status);
		}
	});
}

Openphacts.EnzymeSearch.prototype.parseClassificationRootClasses = function(response) {
        var enzymeRootClasses = [];
	$.each(response.rootNode, function(i, member) {
            enzymeRootClasses.push({uri: member["_about"], name: member.name});
	});
	return enzymeRootClasses;
}

Openphacts.EnzymeSearch.prototype.parseClassificationClass = function(response) {
        var enzymeClasses = [];
        var uri = response["_about"];
        var name = response.name;
	$.each(response.sibling, function(i, member) {
            enzymeClasses.push({uri: member["_about"], name: member.name});
	});
	return { uri: uri, name: name, siblings: enzymeClasses};
}

Openphacts.EnzymeSearch.prototype.parseClassificationClassMembers = function(response) {
        var enzymeClasses = [];
        if ($.isArray(response.has_member)) {
	        $.each(response.has_member, function(i, member) {
                var about = member["_about"];
                var names = [];
                if ($.isArray(member.name)) {
                    $.each(member.name, function(j, label) {
                        names.push(label);
                    });
                } else {
                   names.push(member.name);
                }
                enzymeClasses.push({uri: about, names: names});
	        });
        } else {
	        var about = response.has_member["_about"];
            var names = [];
            if ($.isArray(response.has_member.name)) {
                $.each(response.has_member.name, function(j, label) {
                    names.push(label);
                });
            } else {
                names.push(response.has_member.name);
            }
            enzymeClasses.push({uri: about, names: names});
        }
	    return enzymeClasses;
}

Openphacts.EnzymeSearch.prototype.parsePharmacologyCount = function(response) {
	return response.enzymePharmacologyTotalResults;
}

Openphacts.EnzymeSearch.prototype.parsePharmacologyPaginated = function(response) {
        var records = [];
        $.each(response.items, function(i, item) {
            var targets = [];
            var chemblActivityURI, pmid, relation, standardUnits, standardValue, activityType, inDataset, fullMWT, chemblURI, cwURI, prefLabel, csURI, inchi, inchiKey, smiles, ro5Violations, targetURI, targetTitle, targetOrganism, assayURI, assayDescription;
            chemblActivityURI = item["_about"];
            pmid = item.pmid;
            relation = item.relation;
            standardUnits = item.standardUnits;
            standardValue = item.standardValue;
            activityType = item.activity_type;
            inDataset = item.inDataset;
            chemblURI = item.forMolecule["_about"];
            fullMWT = item.forMolecule.full_mwt;
            $.each(item.forMolecule.exactMatch, function(j, match) {
		if (match["_about"] && match["_about"].indexOf("http://www.conceptwiki.org") !== -1) {
                    cwURI = match["_about"];
                    prefLabel = match["prefLabel"];
		} else if (match["_about"] && match["_about"].indexOf("chemspider.com") !== -1) {
                    csURI = match["_about"];
                    inchi = match.inchi;
                    inchiKey = match.inchikey;
                    smiles = match.smiles;
                    ro5Violations = match.ro5_violations;
		}
            });
            targetURI = item.target["_about"];
            targetTitle = item.target.title;
            targetOrganism = item.target.organism;
            if (item.target.exactMatch) {
                $.each(item.target.exactMatch, function(j, match) {
                    targets.push(match);
                });
            }
            assayURI = item.onAssay["_about"];
            assayDescription = item.onAssay.description;
            records.push({
                             targets: targets,
                             chemblActivityURI: chemblActivityURI,
                             pmid: pmid,
                             relation: relation,
                             standardUnits: standardUnits,
                             standardValue: standardValue,
                             activityType: activityType,
                             inDataset: inDataset,
                             fullMWT: fullMWT,
                             chemblURI: chemblURI,
                             cwURI: cwURI,
                             prefLabel: prefLabel,
                             csURI: csURI,
                             inchi: inchi,
                             inchiKey: inchiKey,
                             smiles: smiles,
                             ro5Violations: ro5Violations,
                             targetURI: targetURI,
                             targetTitle: targetTitle,
                             targetOrganism: targetOrganism,
                             assayURI: assayURI,
                             assayDescription: assayDescription
                         });
        });
        return records;
}
