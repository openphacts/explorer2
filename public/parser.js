//This content is released under the MIT License, http://opensource.org/licenses/MIT.
// The webworker that creates the TSV files cannot use the jquery lib since it needs access to the browser window global object.
// The parser functions that it would have used from OPS.js are here until the OPS.js library removes its dependency on jquery and moves towards
// something like the nets NodeJS lib for xhr and native JS functions for forEach etc.

var Openphacts = Openphacts || {};

Openphacts.arrayify = function(data) {
    if (!Array.isArray(data)) {
        return [data];
    } else {
        return data;;
    }
}
Openphacts.Constants = function() {};

Openphacts.Constants.prototype.SRC_CLS_MAPPINGS = {
    'http://www.conceptwiki.org': 'conceptWikiValue',
    'http://www.conceptwiki.org/': 'conceptWikiValue',
    'http://ops.conceptwiki.org': 'conceptWikiValue',
    'http://ops.conceptwiki.org/': 'conceptWikiValue',
    'http://data.kasabi.com/dataset/chembl-rdf': 'chemblValue',
    'http://rdf.ebi.ac.uk/resource/chembl/molecule': 'chemblValue',
    'http://www.ebi.ac.uk/chembl': 'chemblValue',
    'http://www4.wiwiss.fu-berlin.de/drugbank': 'drugbankValue',
    'http://linkedlifedata.com/resource/drugbank': 'drugbankValue',
    'http://www.chemspider.com': 'chemspiderValue',
    'http://www.chemspider.com/': 'chemspiderValue',
    'http://ops.rsc-us.org': 'chemspiderValue',
    'http://ops.rsc.org': 'chemspiderValue',
    'http://rdf.chemspider.com': 'chemspiderValue',
    'http://rdf.chemspider.com/': 'chemspiderValue',
    'http://ops.rsc-us.org': 'chemspiderValue',
    'http://purl.uniprot.org': 'uniprotValue',
    'http://purl.uniprot.org/': 'uniprotValue'
};

Openphacts.Constants.prototype.IN_DATASET = 'inDataset';
Openphacts.Constants.prototype.ABOUT = '_about';
Openphacts.Constants.prototype.LABEL = 'label';
Openphacts.Constants.prototype.PREF_LABEL = 'prefLabel';
Openphacts.Constants.prototype.COMPOUND_PHARMACOLOGY_COUNT = 'compoundPharmacologyTotalResults';
Openphacts.Constants.prototype.TARGET_PHARMACOLOGY_COUNT = 'targetPharmacologyTotalResults';
Openphacts.Constants.prototype.ENZYME_FAMILY_COUNT = 'enzymePharmacologyTotalResults';
Openphacts.Constants.prototype.ON_ASSAY = 'hasAssay';
Openphacts.Constants.prototype.ON_TARGET = 'hasTarget';
Openphacts.Constants.prototype.EXACT_MATCH = 'exactMatch';
Openphacts.Constants.prototype.PRIMARY_TOPIC = 'primaryTopic';
Openphacts.Constants.prototype.RESULT = 'result';
Openphacts.Constants.prototype.ACTIVITY = 'activity';
Openphacts.Constants.prototype.FOR_MOLECULE = 'hasMolecule';
Openphacts.Constants.prototype.ASSAY_TARGET = 'target';
Openphacts.Constants.prototype.ITEMS = 'items';
Openphacts.Constants.prototype.PAGINATED_NEXT = 'next';
Openphacts.Constants.prototype.PAGINATED_PREVIOUS = 'prev';
Openphacts.Constants.prototype.PAGINATED_PAGE_SIZE = 'itemsPerPage';
Openphacts.Constants.prototype.PAGINATED_START_INDEX = 'startIndex';
Openphacts.Constants.prototype.TARGET_OF_ASSAY = 'targetOfAssay';
Openphacts.Constants.prototype.ASSAY_OF_ACTIVITY = 'assayOfActivity';
Openphacts.Constants.prototype.HAS_TARGET_COMPONENT = 'hasTargetComponent';
Openphacts.Constants.prototype.MOLFORM = 'molformula';
Openphacts.Constants.prototype.FULL_MWT = 'full_mwt';
Openphacts.Constants.prototype.INCHI = 'inchi';
Openphacts.Constants.prototype.INCHIKEY = 'inchikey';
Openphacts.Constants.prototype.RO5_VIOLATIONS = 'ro5_violations';
Openphacts.Constants.prototype.SMILES = 'smiles';
Openphacts.Constants.prototype.RELEVANCE = 'relevance';
Openphacts.Constants.prototype.PATHWAY_COUNT = 'pathway_count';
Openphacts.Constants.prototype.MOLWT = 'molweight';
Openphacts.Constants.prototype.EBILINK = 'http://www.ebi.ac.uk';

Openphacts.CompoundSearch = function CompoundSearch(baseURL, appID, appKey) {
    this.baseURL = baseURL;
    this.appID = appID;
    this.appKey = appKey;
}
Openphacts.TargetSearch = function TargetSearch(baseURL, appID, appKey) {
	this.baseURL = baseURL;
	this.appID = appID;
	this.appKey = appKey;
}
Openphacts.TreeSearch = function TreeSearch(baseURL, appID, appKey) {
    this.baseURL = baseURL;
    this.appID = appID;
    this.appKey = appKey;
}
Openphacts.CompoundSearch.prototype.parseCompoundPharmacologyResponse = function(response) {
    var drugbankProvenance, chemspiderProvenance, chemblProvenance, conceptwikiProvenance;
    var constants = new Openphacts.Constants();
    var records = [];

    response.items.forEach(function(item, i, items) {

        chemblProvenance = {};
        chemblProvenance['source'] = 'chembl';

        var chembl_activity_uri = item[constants.ABOUT];
        var chembl_src = item[constants.IN_DATASET];
        // according to the API docs pmid can be an array but an array of what?
        var activity_pubmed_id = item['pmid'] ? item['pmid'] : null;
        var activity_relation = item['activity_relation'] ? item['activity_relation'] : null;
        var activity_unit_block = item['activity_unit'];
        var activity_standard_units = activity_unit_block ? activity_unit_block.prefLabel : null;
        //var activity_standard_units = item['standardUnits'] ? item['standardUnits'] : null;
        var activity_standard_value = item['standardValue'] ? item['standardValue'] : null;
        var activity_activity_type = item['activity_type'] ? item['activity_type'] : null;
        //TODO seems to be some confusion about what the value is called
        var activity_activity_value = item['activity_value'] ? item['activity_value'] : null;
        var pChembl = item['pChembl'] ? item['pChembl'] : null;

        var compound_full_mwt_item = null;
        var forMolecule = item[constants.FOR_MOLECULE];
        var chembleMoleculeLink = 'https://www.ebi.ac.uk/chembldb/compound/inspect/';
        var chembl_compound_uri = null;
        var compound_full_mwt = null;
        var em = null;
        var cw_compound_uri = null,
            compound_pref_label = null,
            cw_src = null,
            cs_compound_uri = null,
            compound_inchi = null,
            compound_inchikey = null,
            compound_smiles = null,
            cs_src = null,
            drugbank_compound_uri = null,
            compound_drug_type = null,
            compound_generic_name = null,
            drugbank_src = null,
            csid = null,
            compound_smiles_item = null,
            compound_inchi_item = null,
            compound_inchikey_item = null,
            compound_pref_label_item = null;

        if (forMolecule != null) {
            chembl_compound_uri = forMolecule[constants.ABOUT];
            //compound_full_mwt = forMolecule['full_mwt'] ? forMolecule['full_mwt'] : null;
            chembleMoleculeLink += chembl_compound_uri.split('/').pop();
            //compound_full_mwt_item = chembleMoleculeLink;
            em = forMolecule["exactMatch"];
        }
        //during testing there have been cases where em is null
        var chemblMolecule = em != null ? em[constants.ABOUT] : null;
        if (em != null) {
            // the exact match block may only have 1 entry
            if (!Array.isArray(em)) {
                em = [em];
            }
            em.forEach(function(match, index, matches) {
                var src = match[constants.IN_DATASET];
                if (constants.SRC_CLS_MAPPINGS[src] == 'conceptWikiValue') {
                    cw_compound_uri = match[constants.ABOUT];
                    compound_pref_label = match[constants.PREF_LABEL];
                    compound_pref_label_item = cw_compound_uri;
                    cw_src = match["inDataset"];
                } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemspiderValue') {
                    cs_compound_uri = match[constants.ABOUT];
                    csid = cs_compound_uri.split('/').pop();
                    compound_inchi = match['inchi'];
                    compound_inchikey = match['inchikey'];
                    compound_smiles = match['smiles'];
                    compound_full_mwt = match['molweight'];
                    var chemSpiderLink = 'http://www.chemspider.com/' + csid;
                    compound_smiles_item = chemSpiderLink;
                    compound_inchi_item = chemSpiderLink;
                    compound_inchikey_item = chemSpiderLink;
                    compound_full_mwt_item = chemSpiderLink;
                    cs_src = match["inDataset"];
                } else if (constants.SRC_CLS_MAPPINGS[src] == 'drugbankValue') {
                    drugbank_compound_uri = match[constants.ABOUT];
                    compound_drug_type = match['drugType'];
                    compound_generic_name = match['genericName'];
                    drugbank_src = match[constants.ABOUT];
                }
            });
        }

        var target_title_item = null,
            target_organism_item = null,
            activity_activity_type_item = null,
            activity_standard_value_item = null,
            activity_standard_units_item = null,
            activity_relation_item = null,
            assay_description = null,
            assay_description_item = null,
            assay_organism = null,
            assay_organism_src = null,
            assay_organism_item = null;
        var target_organism = {};
        var onAssay = item[constants.ON_ASSAY];
        if (onAssay != null) {
            var chembl_assay_uri = onAssay[constants.ABOUT];
            var chembldAssayLink = 'https://www.ebi.ac.uk/chembldb/assay/inspect/';
            assay_description = onAssay['description'];
            var chembleAssayLink = chembldAssayLink + chembl_assay_uri.split('/').pop();
            assay_description_item = chembleAssayLink;
            assay_organism = onAssay['assayOrganismName'] ? onAssay['assayOrganismName'] : null;
            assay_organism_item = chembleAssayLink;
            chemblProvenance['assayOrganism'] = chembleAssayLink;
            chemblProvenance['assayDescription'] = chembleAssayLink;

            var target = onAssay[constants.ON_TARGET];
            // For Target
            var target_components = [];
	    var target_title = null;
	    var target_organism_name = null;
	    var target_uri = null;
	    if (target != null) {
                target_title = target.title;
		target_uri = target._about;
                target_provenance = 'https://www.ebi.ac.uk/chembl/target/inspect/' + target._about.split('/').pop();
		target_organism_name = target.assay_organism != null ? target.assay_organism : null;
		if (target.hasTargetComponent != null) {
			Openphacts.arrayify(target.hasTargetComponent).forEach(function(targetComponent, i) {
				var tc = {};
				tc.uri = targetComponent._about;
				if (targetComponent.exactMatch != null) {
					tc.labelProvenance = targetComponent._about;
					tc.label = targetComponent.prefLabel;
				}
				target_components.push(tc);
			});
		}
            }
        }
        var chemblActivityLink = 'https://www.ebi.ac.uk/ebisearch/search.ebi?t=' + chembl_activity_uri.split('/').pop().split('_').pop() + '&db=chembl-activity';

        activity_activity_type_item = chemblActivityLink;
        activity_standard_value_item = chemblActivityLink;
        activity_standard_units_item = chemblActivityLink;
        activity_relation_item = chemblActivityLink;
        records.push({
            //for compound
            compoundInchikey: compound_inchikey,
            compoundDrugType: compound_drug_type,
            compoundGenericName: compound_generic_name,
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
            targetTitle: target_title,
	    targetOrganismName: target_organism_name,
	    targetComponents: target_components,
	    targetURI: target_uri,
	    targetProvenance: target_provenance,
            assayOrganism: assay_organism,
            assayDescription: assay_description,
            activityRelation: activity_relation,
            activityStandardUnits: activity_standard_units,
            activityStandardValue: activity_standard_value,
            activityActivityType: activity_activity_type,
            activityValue: activity_activity_value,

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
            compoundPrefLabelItem: compound_pref_label_item,
            pChembl: pChembl,
            chemblProvenance: chemblProvenance
        });
    });
    return records;
}
Openphacts.CompoundSearch.prototype.parseCompoundBatchResponse = function(response) {
    var constants = new Openphacts.Constants();
    var compounds = [];
    response.items.forEach(function(item, index, data) {
        var id = null,
            prefLabel = null,
            cwURI = null,
            description = null,
            biotransformationItem = null,
            toxicity = null,
            proteinBinding = null,
            csURI = null,
            hba = null,
            hbd = null,
            inchi = null,
            logp = null,
            psa = null,
            ro5Violations = null,
            smiles = null,
            chemblURI = null,
            fullMWT = null,
            molform = null,
            mwFreebase = null,
            rtb = null,
            inchiKey = null,
            drugbankURI = null,
            molweight = null,
            molformula = null;
        var drugbankData, chemspiderData, chemblData, conceptWikiData;
        var uri = item[constants.ABOUT];

        // check if we already have the CS URI
        var possibleURI = 'http://' + uri.split('/')[2];
	//var uriLink = document.createElement('a');
        //uriLink.href = uri;
        //var possibleURI = 'http://' + uriLink.hostname;
        csURI = constants.SRC_CLS_MAPPINGS[possibleURI] === 'chemspiderValue' ? uri : null;

        var drugbankProvenance, chemspiderProvenance, chemblProvenance;
        var descriptionItem, toxicityItem, proteinBindingItem, hbaItem, hbdItem, inchiItem, logpItem, psaItem, ro5VioloationsItem, smilesItem, inchiKeyItem, molformItem, fullMWTItem, mwFreebaseItem;
        var drugbankLinkout, chemspiderLinkOut, chemblLinkOut;

        // this id is not strictly true since we could have searched using a chemspider id etc
        id = uri.split("/").pop();
        prefLabel = item.prefLabel ? item.prefLabel : null;
        cwURI = constants.SRC_CLS_MAPPINGS[item[constants.IN_DATASET]] == 'conceptWikiValue' ? item[constants.ABOUT] : cwURI;
        //if an ops.rsc.org uri is used then the compound chemistry details are found in the top level
        hba = item.hba != null ? item.hba : null;
        hbd = item.hbd != null ? item.hbd : null;
        inchi = item.inchi != null ? item.inchi : null;
        inchiKey = item.inchikey != null ? item.inchikey : null;
        logp = item.logp != null ? item.logp : null;
        molform = item.molformula != null ? item.molformula : null;
        fullMWT = item.molweight != null ? item.molweight : null;
        psa = item.psa != null ? item.psa : null;
        ro5Violations = item.ro5_violations != null ? item.ro5_violations : null;
        rtb = item.rtb !== null ? item.rtb : null;
        smiles = item.smiles != null ? item.smiles : null;
        if (Array.isArray(item.exactMatch)) {
        item.exactMatch.forEach(function(match, i, data) {
            var src = match[constants.IN_DATASET];
            if (constants.SRC_CLS_MAPPINGS[src] == 'drugbankValue') {
                drugbankData = match;
            } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemspiderValue') {
                chemspiderData = match;
            } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemblValue') {
                chemblData = match;
            } else if (constants.SRC_CLS_MAPPINGS[src] == 'conceptWikiValue') {
                conceptWikiData = match;
            }
        });
	}
        if (drugbankData) {
            description = drugbankData.description != null ? drugbankData.description : description;
            biotransformationItem = drugbankData.biotransformation != null ? drugbankData.biotransformation : biotransformationItem;
            toxicity = drugbankData.toxicity != null ? drugbankData.toxicity : toxicity;
            proteinBinding = drugbankData.proteinBinding != null ? drugbankData.proteinBinding : proteinBinding;
            drugbankURI = drugbankData[constants.ABOUT] != null ? drugbankData[constants.ABOUT] : drugbankURI;

            // provenance
            drugbankLinkout = drugbankURI;
            drugbankProvenance = {};
            drugbankProvenance['source'] = 'drugbank';
            drugbankProvenance['description'] = drugbankLinkout;
            drugbankProvenance['biotransformation'] = drugbankLinkout;
            drugbankProvenance['toxicity'] = drugbankLinkout;
            drugbankProvenance['proteinBinding'] = drugbankLinkout;

        }
        if (chemspiderData) {
            csURI = chemspiderData["_about"] !== null ? chemspiderData["_about"] : csURI;
            hba = chemspiderData.hba != null ? chemspiderData.hba : hba;
            hbd = chemspiderData.hbd != null ? chemspiderData.hbd : hbd;
            inchi = chemspiderData.inchi != null ? chemspiderData.inchi : inchi;
            logp = chemspiderData.logp != null ? chemspiderData.logp : logp;
            psa = chemspiderData.psa != null ? chemspiderData.psa : psa;
            ro5Violations = chemspiderData.ro5_violations != null ? chemspiderData.ro5_violations : ro5Violations;
            smiles = chemspiderData.smiles != null ? chemspiderData.smiles : smiles;
            inchiKey = chemspiderData.inchikey != null ? chemspiderData.inchikey : inchikey;
            rtb = chemspiderData.rtb != null ? chemspiderData.rtb : rtb;
            fullMWT = chemspiderData.molweight != null ? chemspiderData.molweight : molweight;
            molform = chemspiderData.molformula != null ? chemspiderData.molformula : molformula;

            // provenance 
            chemspiderLinkOut = csURI;
            chemspiderProvenance = {};
            chemspiderProvenance['source'] = 'chemspider';
            chemspiderProvenance['hba'] = chemspiderLinkOut;
            chemspiderProvenance['hbd'] = chemspiderLinkOut;
            chemspiderProvenance['inchi'] = chemspiderLinkOut;
            chemspiderProvenance['logp'] = chemspiderLinkOut;
            chemspiderProvenance['psa'] = chemspiderLinkOut;
            chemspiderProvenance['ro5violations'] = chemspiderLinkOut;
            chemspiderProvenance['smiles'] = chemspiderLinkOut;
            chemspiderProvenance['inchiKey'] = chemspiderLinkOut;
            chemspiderProvenance['molform'] = chemspiderLinkOut;

        }
        if (chemblData) {
            chemblURI = chemblData["_about"] != null ? chemblData["_about"] : chemblURI;
            mwFreebase = chemblData.mw_freebase != null ? chemblData.mw_freebase : mwFreebase;

            // provenance
            chemblLinkOut = 'https://www.ebi.ac.uk/chembldb/compound/inspect/' + chemblURI.split("/").pop();
            chemblProvenance = {};
            chemblProvenance['source'] = 'chembl';
            chemblProvenance['fullMWT'] = chemblLinkOut;
            chemblProvenance['mwFreebase'] = chemblLinkOut;
            chemblProvenance['rtb'] = chemblLinkOut;
        }
        if (conceptWikiData) {
            prefLabel = conceptWikiData.prefLabel != null ? conceptWikiData.prefLabel : prefLabel;
            cwURI = conceptWikiData["_about"] != null ? conceptWikiData["_about"] : cwURI;
        }
        compounds.push({
            "id": id,
            "cwURI": cwURI,
            "prefLabel": prefLabel,
            "URI": uri,
            "description": description,
            "biotransformationItem": biotransformationItem,
            "toxicity": toxicity,
            "proteinBinding": proteinBinding,
            "csURI": csURI,
            "hba": hba,
            "hbd": hbd,
            "inchi": inchi,
            "logp": logp,
            "psa": psa,
            "ro5Violations": ro5Violations,
            "smiles": smiles,
            "chemblURI": chemblURI,
            "fullMWT": fullMWT,
            "molform": molform,
            "mwFreebase": mwFreebase,
            "rtb": rtb,
            "inchiKey": inchiKey,
            "drugbankURI": drugbankURI,

            "drugbankProvenance": drugbankProvenance,
            "chemspiderProvenance": chemspiderProvenance,
            "chemblProvenance": chemblProvenance

        });
    });
    return compounds;
}
Openphacts.TargetSearch.prototype.parseTargetPharmacologyResponse = function(response) {
    var constants = new Openphacts.Constants();
    var records = [];

    response.items.forEach(function(item, index, items) {

        chemblProvenance = {};
        chemblProvenance['source'] = 'chembl';

        var chembl_activity_uri = item["_about"];
        var chembl_src = item["inDataset"];

        //big bits
        var forMolecule = item[constants.FOR_MOLECULE];
        var chembl_compound_uri;
        var compound_full_mwt = null;
        var compound_full_mwt_item;

        var em;
        var chembleMoleculeLink = 'https://www.ebi.ac.uk/chembldb/compound/inspect/';

        if (forMolecule != null) {
            chembl_compound_uri = forMolecule["_about"];
            //compound_full_mwt = forMolecule['full_mwt'] ? forMolecule['full_mwt'] : null;
            chembleMoleculeLink += chembl_compound_uri.split('/').pop();
            compound_full_mwt_item = chembleMoleculeLink;
            em = forMolecule["exactMatch"];
        }

        var cw_compound_uri = null,
            compound_pref_label = null,
            cw_src = null,
            cs_compound_uri = null,
            compound_inchi = null,
            compound_inchikey = null,
            compound_smiles = null,
            cs_src = null,
            drugbank_compound_uri = null,
            compound_drug_type = null,
            compound_generic_name = null,
            drugbank_src = null,
            csid = null,
            compound_pref_label_item = null,
            compound_inchi_item = null,
            compound_inchikey_item = null,
            compound_smiles_item = null,
            assay_description = null,
            assay_description_item = null,
            compound_ro5_violations = null;
        if (em != null) {
            em.forEach(function(match, index, all) {
                var src = match[constants.IN_DATASET];
                if (constants.SRC_CLS_MAPPINGS[src] == 'conceptWikiValue') {
                    cw_compound_uri = match["_about"];
                    compound_pref_label = match['prefLabel'];
                    cw_src = match["inDataset"];
                    compound_pref_label_item = cw_compound_uri;
                } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemspiderValue') {
                    cs_compound_uri = match["_about"];
                    csid = cs_compound_uri.split('/').pop();
                    compound_inchi = match['inchi'];
                    compound_inchikey = match['inchikey'];
                    compound_smiles = match['smiles'];
                    compound_full_mwt = match.molweight;
                    compound_ro5_violations = match.ro5_violations;
                    cs_src = match["inDataset"];
                    var chemSpiderLink = 'http://www.chemspider.com/' + csid;
                    compound_inchi_item = chemSpiderLink;
                    compound_inchikey_item = chemSpiderLink;
                    compound_smiles_item = chemSpiderLink;
                } // else if (constants.SRC_CLS_MAPPINGS[src] == 'drugbankValue') {
                //   drugbank_compound_uri = match["_about"];
                //   compound_drug_type = match['drugType'];
                //   compound_generic_name = match['genericName'];
                //   drugbank_src = match["_about"];
                //}
            });
        }

        var onAssay = item[constants.ON_ASSAY];
        var chembl_assay_uri;
        var assay_organism;
        var assay_organism_item;
        var target;
        var chembldAssayLink = 'https://www.ebi.ac.uk/chembldb/assay/inspect/';

        if (onAssay != null) {
            chembl_assay_uri = onAssay[constants.ABOUT];
            assay_organism = onAssay.assayOrganismName ? onAssay.assayOrganismName : null;
            assay_organism_item = chembldAssayLink + chembl_assay_uri.split('/').pop();
            assay_description = onAssay['description'] ? onAssay['description'] : null;
            //assay_description_item = chembldAssayLink + chembl_assay_uri.split('/').pop();
            target = onAssay[constants.ON_TARGET];
        }
        var chembl_target_uri;
        var target_pref_label;
        var target_pref_label_item;
        var targetMatch;
        var target_title = null;
        var target_organism;
        var target_organism_item;
        var target_concatenated_uris;
        var chemblTargetLink = 'https://www.ebi.ac.uk/chembldb/target/inspect/';
        var target_organisms = new Array();
            // For Target
            var target_components = [];
	    var target_title = null;
	    var target_organism_name = null;
	    var target_uri = null;
	    if (target != null) {
                target_title = target.title;
		target_uri = target._about;
                target_provenance = 'https://www.ebi.ac.uk/chembl/target/inspect/' + target._about.split('/').pop();
		target_organism_name = target.assay_organism != null ? target.assay_organism : null;
		if (target.hasTargetComponent != null) {
			Openphacts.arrayify(target.hasTargetComponent).forEach(function(targetComponent, i) {
				var tc = {};
				tc.uri = targetComponent._about;
				if (targetComponent.exactMatch != null) {
					tc.labelProvenance = targetComponent._about;
					tc.label = targetComponent.prefLabel;
				}
				target_components.push(tc);
			});
		}
            }

        var chemblActivityLink = 'https://www.ebi.ac.uk/ebisearch/search.ebi?t=' + chembl_activity_uri.split('/').pop().split('_').pop() + '&db=chembl-activity';

        var activity_activity_type_item, activity_standard_value_item, activity_standard_units_item, activity_relation_item;

        var activity_activity_type = item['activity_type'] ? item['activity_type'] : null;
        activity_activity_type_item = chemblActivityLink;
        var activity_standard_value = item['activity_value'] ? item['activity_value'] : null;
        activity_standard_value_item = chemblActivityLink;
        var activity_standard_units = item.activity_unit ? item.activity_unit.prefLabel : null;
        activity_standard_units_item = chemblActivityLink;
        var activity_relation = item['activity_relation'] ? item['activity_relation'] : null;
        activity_relation_item = chemblActivityLink;
        var activity_pubmed_id = item['pmid'] ? item['pmid'] : null;
        var activity_comment = item['activityComment'] ? item['activityComment'] : null;
        var pChembl = item.pChembl;
        var documents = [];
        if (item.hasDocument) {
            Openphacts.arrayify(item.hasDocument).forEach(function(document, index, documents) {
                documents.push(document);
            });
        }
        records.push({ //for compound
            'compoundInchikey': compound_inchikey,
            //compoundDrugType: compound_drug_type,
            //compoundGenericName: compound_generic_name,
            'targetTitle': target_title,
            //targetConcatenatedUris: target_concatenated_uris,

            'compoundInchikeySrc': cs_src,
            //compoundDrugTypeSrc: drugbank_src,
            //compoundGenericNameSrc: drugbank_src,
            'targetTitleSrc': chembl_src,
            //targetConcatenatedUrisSrc: chembl_src,
	    targetTitle: target_title,
	    targetOrganismName: target_organism_name,
	    targetComponents: target_components,
	    targetURI: target_uri,
	    targetProvenance: target_provenance,

            //for target
            'chemblActivityUri': chembl_activity_uri,
            'chemblCompoundUri': chembl_compound_uri,
            'compoundFullMwt': compound_full_mwt,
            'cwCompoundUri': cw_compound_uri,
            'compoundPrefLabel': compound_pref_label,
            'csCompoundUri': cs_compound_uri,
            'csid': csid,
            'compoundInchi': compound_inchi,
            'compoundSmiles': compound_smiles,
            'chemblAssayUri': chembl_assay_uri,
            'chemblTargetUri': chembl_target_uri,


            'assayOrganism': assay_organism,
            'assayDescription': assay_description,
            'activityRelation': activity_relation,
            'activityStandardUnits': activity_standard_units,
            'activityStandardValue': activity_standard_value,
            'activityActivityType': activity_activity_type,
            'activityPubmedId': activity_pubmed_id,
            'activityComment': activity_comment,

            'compoundFullMwtSrc': chembl_src,
            'compoundPrefLabelSrc': cw_src,
            'compoundInchiSrc': cs_src,
            'compoundSmilesSrc': cs_src,
            //targetOrganismSrc: chembl_src,
            'targetPrefLabelSrc': cw_src,
            'assayOrganismSrc': chembl_src,
            'assayDescriptionSrc': chembl_src,
            'activityRelationSrc': chembl_src,
            'activityStandardUnits_src': chembl_src,
            'activityStandardValue_src': chembl_src,
            'activityActivityType_src': chembl_src,

            'compoundPrefLabelItem': compound_pref_label_item,
            'activityActivityTypeItem': activity_activity_type_item,
            'activityRelationItem': activity_relation_item,
            'activityStandardValueItem': activity_standard_value_item,
            'activityStandardUnitsItem': activity_standard_units_item,
            'compoundFullMwtItem': compound_full_mwt_item,
            'compoundSmilesItem': compound_smiles_item,
            'compoundInchiItem': compound_inchi_item,
            'compoundInchikeyItem': compound_inchikey_item,
            //targetPrefLabelItem: target_pref_label_item,
            'assayOrganismItem': assay_organism_item,
            //assayDescriptionItem: assay_description_item,
            //targetOrganismItem: target_organism_item,
            'pChembl': pChembl,
            'compoundRO5Violations': compound_ro5_violations,
            'chemblProvenance': chemblProvenance,
            'chemblDOIs': documents
        });
    });
    return records;
}
Openphacts.TreeSearch.prototype.parseTargetClassPharmacologyPaginated = function(response) {
    var constants = new Openphacts.Constants();
    var records = [];
    response.items.forEach(function(item, i, all) {
        var targets = [];
        var chemblActivityURI = null,
            pmid = null,
            //relation = null,
            //standardUnits = null,
            //standardValue = null,
            activityType = null,
            inDataset = null,
            fullMWT = null,
            chemblURI = null,
            cwURI = null,
            prefLabel = null,
            csURI = null,
            inchi = null,
            inchiKey = null,
            smiles = null,
            ro5Violations = null,
            targetURI = null,
            targetTitle = null,
            targetOrganism = null,
            assayURI = null,
            assayDescription = null,
            assayOrganism = null,
            publishedRelation = null,
            publishedType = null,
            publishedUnits = null,
            publishedValue = null,
            pChembl = null,
            activityType = null,
            activityRelation = null,
            activityValue = null,
            activityUnits = null,
            conceptwikiProvenance = {},
            chemspiderProvenance = {},
            assayTargetProvenance = {},
            assayProvenance = {};
        chemblActivityURI = item["_about"];
        pmid = item.pmid;

        activityType = item.activity_type;
        activityRelation = item.activity_relation;
        activityValue = item.activity_value;
        var units = item.activity_unit;
        if (units) {
            activityUnits = units.prefLabel;
        }

        //relation = item.relation ? item.relation : null;
        //standardUnits = item.standardUnits;
        //standardValue = item.standardValue ? item.standardValue : null;
        activityType = item.activity_type;
        inDataset = item[constants.IN_DATASET];
        forMolecule = item[constants.FOR_MOLECULE];
        chemblURI = forMolecule[constants.ABOUT] ? forMolecule[constants.ABOUT] : null;
        pChembl = item.pChembl ? item.pChembl : null;
        if (forMolecule[constants.EXACT_MATCH] != null) {
            forMolecule[constants.EXACT_MATCH].forEach(function(match, j, all) {
                var src = match[constants.IN_DATASET];
                if (constants.SRC_CLS_MAPPINGS[src] == 'conceptWikiValue') {
                    cwURI = match[constants.ABOUT];
                    prefLabel = match[constants.PREF_LABEL];
                    var conceptWikiLinkOut = cwURI;
                    conceptwikiProvenance['source'] = 'conceptwiki';
                    conceptwikiProvenance['prefLabel'] = conceptWikiLinkOut;
                } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemspiderValue') {
                    csURI = match[constants.ABOUT];
                    inchi = match[constants.INCHI];
                    inchiKey = match[constants.INCHIKEY];
                    smiles = match[constants.SMILES];
                    ro5Violations = match[constants.RO5_VIOLATIONS] !== null ? match[constants.RO5_VIOLATIONS] : null;
                    fullMWT = match[constants.MOLWT] ? match[constants.MOLWT] : null;
                    var chemspiderLinkOut = csURI;
                    chemspiderProvenance['source'] = 'chemspider';
                    chemspiderProvenance['hba'] = chemspiderLinkOut;
                    chemspiderProvenance['hbd'] = chemspiderLinkOut;
                    chemspiderProvenance['inchi'] = chemspiderLinkOut;
                    chemspiderProvenance['logp'] = chemspiderLinkOut;
                    chemspiderProvenance['psa'] = chemspiderLinkOut;
                    chemspiderProvenance['ro5violations'] = chemspiderLinkOut;
                    chemspiderProvenance['smiles'] = chemspiderLinkOut;
                    chemspiderProvenance['inchiKey'] = chemspiderLinkOut;
                    chemspiderProvenance['molform'] = chemspiderLinkOut;
                }
            });
        }
        var target = item.hasAssay.hasTarget;
var target_organisms = [];
            // For Target
            var target_components = [];
	    var target_title = null;
	    var target_organism_name = null;
	    var target_uri = null;
	    if (target != null) {
                target_title = target.title;
		target_uri = target._about;
                target_provenance = 'https://www.ebi.ac.uk/chembl/target/inspect/' + target._about.split('/').pop();
		target_organism_name = target.assay_organism != null ? target.assay_organism : null;
		if (target.hasTargetComponent != null) {
			Openphacts.arrayify(target.hasTargetComponent).forEach(function(targetComponent, i) {
				var tc = {};
				tc.uri = targetComponent._about;
				if (targetComponent.exactMatch != null) {
					tc.labelProvenance = targetComponent[constants.EXACT_MATCH]._about != null ? targetComponent[constants.EXACT_MATCH]._about : null;
					tc.label = targetComponent[constants.EXACT_MATCH].prefLabel != null ? targetComponent[constants.EXACT_MATCH].prefLabel : null;
				}
				target_components.push(tc);
			});
		}
            }

        var onAssay = item[constants.ON_ASSAY];
        assayURI = onAssay["_about"] ? onAssay["_about"] : null;
        assayDescription = onAssay.description ? onAssay.description : null;
        assayOrganismName = onAssay.assayOrganismName ? onAssay.assayOrganismName : null;
        var assayOrganismLinkOut = assayURI;
        assayProvenance['assayDescription'] = assayOrganismLinkOut;
        assayProvenance['assayOrganismName'] = assayOrganismLinkOut;
        publishedRelation = item.publishedRelation ? item.publishedRelation : null;
        publishedType = item.publishedType ? item.publishedType : null;
        publishedUnits = item.publishedUnits ? item.publishedUnits : null;
        publishedValue = item.publishedValue ? item.publishedValue : null;
        standardUnits = item.standardUnits ? item.standardUnits : null;
        var activity_comment = item['activityComment'] ? item['activityComment'] : null;
        var documents = [];
        if (item.hasDocument) {
            if (Array.isArray(item.hasDocument)) {
                item.hasDocument.forEach(function(document, index, documents) {
                    documents.push(document);
                });
            } else {
                documents.push(item.hasDocument);
            }
        }

        records.push({
            'targetComponents': target_components,
		'targetTitle': target_title,
		'targetURI': target_uri,
		'targetOrganismName': target_organism_name,
            'chemblActivityURI': chemblActivityURI,
            'pmid': pmid,
            //'relation': relation,
            //'standardUnits': standardUnits,
            //'standardValue': standardValue,
            'activityType': activityType,
            'activityRelation': activityRelation,
            'activityUnits': activityUnits,
            'activityValue': activityValue,
            'inDataset': inDataset,
            'fullMWT': fullMWT,
            'chemblURI': chemblURI,
            'cwURI': cwURI,
            'prefLabel': prefLabel,
            'csURI': csURI,
            'inchi': inchi,
            'inchiKey': inchiKey,
            'smiles': smiles,
            'ro5Violations': ro5Violations,
            //targetURI: targetURI,
            //targetTitle: targetTitle,
            //targetOrganism: targetOrganism,
            'assayURI': assayURI,
            'assayDescription': assayDescription,
            'assayOrganismName': assayOrganismName,
            'publishedRelation': publishedRelation,
            'publishedType': publishedType,
            'publishedUnits': publishedUnits,
            'publishedValue': publishedValue,
            'pChembl': pChembl,
            'conceptWikiProvenance': conceptwikiProvenance,
            'chemspiderProvenance': chemspiderProvenance,
            'assayTargetProvenance': assayTargetProvenance,
            'assayProvenance': assayProvenance,
            'chemblDOIs': documents,
            'activityComment': activity_comment
        });
    });
    return records;
}

Openphacts.TreeSearch.prototype.parseCompoundClassPharmacologyPaginated = function(response) {
    var constants = new Openphacts.Constants();
    var records = [];
    response.items.forEach(function(item, i, all) {
        var targets = [];
        var chemblActivityURI = null,
            qudtURI = null,
            pmid = null,
            //relation = null,
            //standardUnits = null,
            //standardValue = null,
            activityType = null,
            inDataset = null,
            fullMWT = null,
            chemblURI = null,
            cwURI = null,
            prefLabel = null,
            csURI = null,
            inchi = null,
            inchiKey = null,
            smiles = null,
            ro5Violations = null,
            targetURI = null,
            targetTitle = null,
            targetOrganism = null,
            assayURI = null,
            assayDescription = null,
            assayOrganism = null,
            publishedRelation = null,
            publishedType = null,
            publishedUnits = null,
            publishedValue = null,
            pChembl = null,
            activityType = null,
            activityRelation = null,
            activityValue = null,
            activityUnits = null,
            conceptwikiProvenance = {},
            chemspiderProvenance = {},
            assayTargetProvenance = {},
            assayProvenance = {};
        chemblActivityURI = item["_about"];
        pmid = item.pmid;

        activityType = item.activity_type;
        activityRelation = item.activity_relation;
        activityValue = item.activity_value;
        var units = item.activity_unit;
        if (units) {
            activityUnits = units.prefLabel;
        }
        qudtURI = item.qudt_uri ? item.qudt_uri : null;
        //relation = item.relation ? item.relation : null;
        //standardUnits = item.standardUnits;
        //standardValue = item.standardValue ? item.standardValue : null;
        activityType = item.activity_type;
        inDataset = item[constants.IN_DATASET];
        forMolecule = item[constants.FOR_MOLECULE];
        chemblURI = forMolecule[constants.ABOUT] ? forMolecule[constants.ABOUT] : null;
        pChembl = item.pChembl ? item.pChembl : null;
if (forMolecule[constants.EXACT_MATCH] != null) {
        forMolecule[constants.EXACT_MATCH].forEach(function(match, j, all) {
            var src = match[constants.IN_DATASET];
            if (constants.SRC_CLS_MAPPINGS[src] == 'conceptWikiValue') {
                cwURI = match[constants.ABOUT];
                prefLabel = match[constants.PREF_LABEL];
                var conceptWikiLinkOut = cwURI;
                conceptwikiProvenance['source'] = 'conceptwiki';
                conceptwikiProvenance['prefLabel'] = conceptWikiLinkOut;
            } else if (constants.SRC_CLS_MAPPINGS[src] == 'chemspiderValue') {
                csURI = match[constants.ABOUT];
                inchi = match[constants.INCHI];
                inchiKey = match[constants.INCHIKEY];
                smiles = match[constants.SMILES];
                ro5Violations = match[constants.RO5_VIOLATIONS] !== null ? match[constants.RO5_VIOLATIONS] : null;
                fullMWT = match[constants.MOLWT] ? match[constants.MOLWT] : null;
                var chemspiderLinkOut = csURI;
                chemspiderProvenance['source'] = 'chemspider';
                chemspiderProvenance['hba'] = chemspiderLinkOut;
                chemspiderProvenance['hbd'] = chemspiderLinkOut;
                chemspiderProvenance['inchi'] = chemspiderLinkOut;
                chemspiderProvenance['logp'] = chemspiderLinkOut;
                chemspiderProvenance['psa'] = chemspiderLinkOut;
                chemspiderProvenance['ro5violations'] = chemspiderLinkOut;
                chemspiderProvenance['smiles'] = chemspiderLinkOut;
                chemspiderProvenance['inchiKey'] = chemspiderLinkOut;
                chemspiderProvenance['molform'] = chemspiderLinkOut;
            }
        });
}
        var target = item.hasAssay.hasTarget;
        var assayTargets = [];
var target_organism_name = null;
            // For Target
            var target_components = [];
	    var target_title = null;
	    var target_organism_name = null;
	    var target_uri = null;
	    if (target != null) {
                target_title = target.title;
		target_uri = target._about;
                target_provenance = 'https://www.ebi.ac.uk/chembl/target/inspect/' + target._about.split('/').pop();
		target_organism_name = target.assay_organism != null ? target.assay_organism : null;
		if (target.hasTargetComponent != null) {
			Openphacts.arrayify(target.hasTargetComponent).forEach(function(targetComponent, i) {
				var tc = {};
				tc.uri = targetComponent._about;
				if (targetComponent.exactMatch != null) {
					tc.labelProvenance = targetComponent[constants.EXACT_MATCH]._about != null ? targetComponent[constants.EXACT_MATCH]._about : null;
					tc.label = targetComponent[constants.EXACT_MATCH].prefLabel != null ? targetComponent[constants.EXACT_MATCH].prefLabel : null;
				}
				target_components.push(tc);
			});
		}
            }
        var onAssay = item[constants.ON_ASSAY];
        assayURI = onAssay["_about"] ? onAssay["_about"] : null;
        assayDescription = onAssay.description ? onAssay.description : null;
        assayOrganismName = onAssay.assayOrganismName ? onAssay.assayOrganismName : null;
        var assayOrganismLinkOut = assayURI;
        assayProvenance['assayDescription'] = assayOrganismLinkOut;
        assayProvenance['assayOrganismName'] = assayOrganismLinkOut;
        publishedRelation = item.publishedRelation ? item.publishedRelation : null;
        publishedType = item.publishedType ? item.publishedType : null;
        publishedUnits = item.publishedUnits ? item.publishedUnits : null;
        publishedValue = item.publishedValue ? item.publishedValue : null;
        standardUnits = item.standardUnits ? item.standardUnits : null;
        var activity_comment = item['activityComment'] ? item['activityComment'] : null;
        var documents = [];
        if (item.hasDocument) {
            if (Array.isArray(item.hasDocument)) {
                item.hasDocument.forEach(function(document, index, documents) {
                    documents.push(document);
                });
            } else {
                documents.push(item.hasDocument);
            }
        }

        records.push({
            'qudtURI': qudtURI,
            'chemblActivityURI': chemblActivityURI,
            'pmid': pmid,
            //'relation': relation,
            //'standardUnits': standardUnits,
            //'standardValue': standardValue,
            'activityType': activityType,
            'activityRelation': activityRelation,
            'activityUnits': activityUnits,
            'activityValue': activityValue,
            'inDataset': inDataset,
            'fullMWT': fullMWT,
            'chemblURI': chemblURI,
            'cwURI': cwURI,
            'prefLabel': prefLabel,
            'csURI': csURI,
            'inchi': inchi,
            'inchiKey': inchiKey,
            'smiles': smiles,
            'ro5Violations': ro5Violations,
            'targetURI': target_uri,
            'targetTitle': target_title,
            'targetOrganismName': target_organism_name,
	    'targetComponents': target_components,
            'assayURI': assayURI,
            'assayDescription': assayDescription,
            'assayOrganismName': assayOrganismName,
            'publishedRelation': publishedRelation,
            'publishedType': publishedType,
            'publishedUnits': publishedUnits,
            'publishedValue': publishedValue,
            'pChembl': pChembl,
            'conceptWikiProvenance': conceptwikiProvenance,
            'chemspiderProvenance': chemspiderProvenance,
            'assayTargetProvenance': assayTargetProvenance,
            'assayProvenance': assayProvenance,
            'chemblDOIs': documents,
            'activityComment': activity_comment
        });
    });
    return records;
}
