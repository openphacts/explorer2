importScripts('combined.js');
var state = null;
var params = null;
var tsvFile = "";
var numberOfPages = null;
var i = 1;
var ldaBaseURL = null;
var appKey = null;
var appID = null;
var requestType = null;
var searcher = null;
var keys = null;
var uris = null;
var treeType = null;
// Map of the OPS.js response param name to the renamed column headers wanted in the TSV 
var headers = null;
onmessage = function(e) {
    // The woker can be told to 'start' or to 'continue'
    state = e.data[0];
    if (state === "start") {
        ldaBaseURL = e.data[1];
        appID = e.data[2];
        appKey = e.data[3];
        params = e.data[4];
        numberOfPages = parseInt(params.total_count / 250);
        numberOfPages += parseInt(params.total_count) % 250 > 0 ? 1 : 0;
        requestType = params.request_type;
        if (requestType === "compound") {
            searcher = new CompoundSearch(ldaBaseURL, appID, appKey);
        } else if (requestType === "target") {
            searcher = new TargetSearch(ldaBaseURL, appID, appKey);
        } else if (requestType === "tree") {
            searcher = new TreeSearch(ldaBaseURL, appID, appKey);
            treeType = params.tree_type;
        }

        if (requestType === "structure") {
            uris = params.uris;
            searcher = new CompoundSearch(ldaBaseURL, appID, appKey);
        }
    }

    var failed = false;
    if (requestType === "compound") {
        headers = {
            'compoundInchikey': 'InChiKey',
            'compoundDrugType': 'Drug type',
            'compoundGenericName': 'Compound Generic name',
            'compoundFullMwt': 'Molecular Weight',
            'compoundPrefLabel': 'Compound preferred label',
            'csid': 'OPS RSC identifier',
            'compoundInchi': 'InChI',
            'compoundSmiles': 'SMILES',
            'targetTitle': 'Target title',
            'targetOrganismName': 'Target organism',
            'assayOrganism': 'Assay Organism',
            'assayDescription': 'Assay description',
            'activityActivityType': 'Acivity type',
            'activityRelation': 'Activity relation',
            'activityValue': 'Activity value',
            'activityStandardUnits': 'Activity units',
            'pChembl': 'pChembl',
            'activityPubmedId': 'Pubmed ID',
            'compoundDrugTypeSrc': 'Drugbank URI',
            'chemblActivityUri': 'ChEMBL activity URI',
            'chemblCompoundUri': 'ChEMBL compound URI',
            'cwCompoundUri': 'Concept Wiki compound URI',
            'csCompoundUri': 'OPS RSC URI',
            'chemblAssayUri': 'ChEMBL assay URI'
        };
        var compoundCallback = function(success, status, response) {
            if (success && response) {
                var pharmaResults = searcher.parseCompoundPharmacologyResponse(response);
                if (i === 1) {
                    keys = Object.keys(headers);
                    keys.forEach(function(key, index, keys) {
                        tsvFile += index < keys.length - 1 ? headers[key] + '\t' : headers[key] + '\r\n';
                    });
                }
                pharmaResults.forEach(function(result, index, results) {
                    var line = "";
                    keys.forEach(function(key, index, keys) {
                        // Change null values to empty string
                        var value = result[key] !== null ? result[key] : '';
                        line += index < keys.length - 1 ? value + '\t' : value;
                    });
                    line += "\r\n";
                    tsvFile += line;
                });
                if (i < numberOfPages) {
                    var percent = 100 / numberOfPages * i;
                    i++;
                    postMessage({
                        "status": "processing",
                        "percent": percent
                    });
                } else {
                    // finished so do something
                    postMessage({
                        "status": "complete",
                        "percent": "100",
                        "tsvFile": tsvFile
                    });
                }
            } else {
                failed = true;
                postMessage({
                    "status": "failed"
                });
            }
        };
        searcher.compoundPharmacology(params.uri, params.assay_organism, params.target_organism, params.activity_type, params.activity_value_type === "activity_value" ? activity_value : null, params.activity_value_type === "min-activity_value" ? activity_value : null, params.activity_value_type === "minEx-activity_value" ? activity_value : null, params.activity_value_type === "max-activity_value" ? activity_value : null, params.activity_value_type === "maxEx-activity_value" ? activity_value : null, params.activity_unit, params.activity_relation, params.pchembl_value_type === "pchembl" ? params.pchembl_value : null, params.pchembl_value_type === "min-pChembl" ? params.pchembl_value : null, params.pchembl_value_type === "minEx-pChembl" ? params.pchembl_value : null, params.pchembl_value_type === "max-pChembl" ? params.pchembl_value : null, params.pchembl_value_type === "maxEx-pChembl" ? params.pchembl_value : null, null, i, 250, null, null, compoundCallback);
    } else if (requestType === "target") {
        headers = {
            'compoundInchikey': 'InChiKey',
            'compoundFullMwt': 'Molecular Weight',
            'compoundPrefLabel': 'Compound preferred label',
            'csid': 'OPS RSC identifier',
            'compoundInchi': 'InChI',
            'compoundSmiles': 'SMILES',
            'targetTitle': 'Target title',
            'targetOrganismName': 'Target organism',
            'assayOrganism': 'Assay Organism',
            'assayDescription': 'Assay description',
            'activityActivityType': 'Activity type',
            'activityRelation': 'Activity relation',
            'activityStandardValue': 'Activity value',
            'activityStandardUnits': 'Activity units',
            'activityComment': 'Activity comment',
            'pChembl': 'pChembl',
            'activityPubmedId': 'Pubmed ID',
            'chemblDOIs': 'Document DOIs',
            'compoundRO5Violations': 'Rule of 5 violations',
            'chemblActivityUri': 'ChEMBL activity URI',
            'chemblCompoundUri': 'ChEMBL compound URI',
            //'chemblTargetUri': 'ChEMBL target URI',
            'cwCompoundUri': 'Concept Wiki compound URI',
            'csCompoundUri': 'OPS RSC URI',
            'chemblAssayUri': 'ChEMBL assay URI'
        };
        var targetCallback = function(success, status, response) {
            if (success && response) {
                var pharmaResults = searcher.parseTargetPharmacologyResponse(response);
                if (i === 1) {
                    keys = Object.keys(headers);
                    keys.forEach(function(key, index, keys) {
                        tsvFile += index < keys.length - 1 ? headers[key] + '\t' : headers[key] + '\r\n';
                    });
                }
                pharmaResults.forEach(function(result, index, results) {
                    var line = "";
                    keys.forEach(function(key, index, keys) {
                        // Change null values to empty string
                        var value = result[key] !== null ? result[key] : '';
                        line += index < keys.length - 1 ? value + '\t' : value;
                    });
                    line += "\r\n";
                    tsvFile += line;
                });
                if (i < numberOfPages) {
                    var percent = 100 / numberOfPages * i;
                    i++;
                    postMessage({
                        "status": "processing",
                        "percent": percent
                    });
                } else {
                    // finished so do something
                    postMessage({
                        "status": "complete",
                        "percent": "100",
                        "tsvFile": tsvFile
                    });
                }
            } else {
                failed = true;
                postMessage({
                    "status": "failed"
                });
            }
        };
        searcher.targetPharmacology(params.uri, params.assay_organism, params.target_organism, params.activity_type, params.activity_value_type === "activity_value" ? params.activity_value : null, params.activity_value_type === "min-activity_value" ? params.activity_value : null, params.activity_value_type === "minEx-activity_value" ? params.activity_value : null, params.activity_value_type === "max-activity_value" ? params.activity_value : null, params.activity_value_type === "maxEx-activity_value" ? params.activity_value : null, params.activity_unit, params.activity_relation, params.pchembl_value_type === "pchembl" ? params.pchembl_value : null, params.pchembl_value_type === "min-pChembl" ? params.pchembl_value : null, params.pchembl_value_type === "minEx-pChembl" ? params.pchembl_value : null, params.pchembl_value_type === "max-pChembl" ? params.pchembl_value : null, params.pchembl_value_type === "maxEx-pChembl" ? params.pchembl_value : null, null, i, 250, null, null, targetCallback);
    } else if (requestType === "tree") {
        if (treeType === "tree") {
            headers = {
                'inchiKey': 'InChiKey',
                //'targetTitle': 'Target title',
                //'targets': 'Target',
                'targetTitle': 'Target title',
                'targetOrganismName': 'Target organism',
                'fullMWT': 'Molecular Weight',
                'prefLabel': 'Compound preferred label',
                //'csid': 'OPS RSC identifier',
                'inchi': 'InChI',
                'smiles': 'SMILES',
                //'targetOrganisms': 'Target Organism',
                'assayOrganismName': 'Assay Organism',
                'assayDescription': 'Assay description',
                'activityType': 'Activity type',
                'activityRelation': 'Activity relation',
                'activityValue': 'Activity value',
                'activityUnits': 'Activity units',
                'activityComment': 'Activity comment',
                'pChembl': 'pChembl',
                'pmid': 'Pubmed ID',
                'chemblDOIs': 'Document DOIs',
                'ro5Violations': 'Rule of 5 violations',
                'chemblActivityURI': 'ChEMBL activity URI',
                'chemblURI': 'ChEMBL compound URI',
                //'chemblTargetUri': 'ChEMBL target URI',
                'cwURI': 'Concept Wiki compound URI',
                'csURI': 'OPS RSC URI',
                'assayURI': 'ChEMBL assay URI'
            };
            var treeCallback = function(success, status, response) {
                if (success && response) {
                    var pharmaResults = searcher.parseTargetClassPharmacologyPaginated(response);
                    if (i === 1) {
                        keys = Object.keys(headers);
                        keys.forEach(function(key, index, keys) {
                            tsvFile += index < keys.length - 1 ? headers[key] + '\t' : headers[key] + '\r\n';
                        });
                    }
                    pharmaResults.forEach(function(result, index, results) {
                        var line = "";
                        keys.forEach(function(key, index, keys) {
                            // Change null values to empty string
                            var value = result[key] !== null ? result[key] : '';
                            line += index < keys.length - 1 ? value + '\t' : value;
                        });
                        line += "\r\n";
                        tsvFile += line;
                    });
                    if (i < numberOfPages) {
                        var percent = 100 / numberOfPages * i;
                        i++;
                        postMessage({
                            "status": "processing",
                            "percent": percent
                        });
                    } else {
                        // finished so do something
                        postMessage({
                            "status": "complete",
                            "percent": "100",
                            "tsvFile": tsvFile
                        });
                    }
                } else {
                    failed = true;
                    postMessage({
                        "status": "failed"
                    });
                }
            }
            searcher.getTargetClassPharmacologyPaginated(params.queryParams.uri, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 1, 50, null, treeCallback);
        } else {
            headers = {
                'inchiKey': 'InChiKey',
                'targetTitle': 'Target title',
                'targetOrganismName': 'Target organism',
                'fullMWT': 'Molecular Weight',
                'prefLabel': 'Compound preferred label',
                //'csid': 'OPS RSC identifier',
                'inchi': 'InChI',
                'smiles': 'SMILES',
                //'targetOrganisms': 'Target Organism',
                'assayOrganismName': 'Assay Organism',
                'assayDescription': 'Assay description',
                'activityType': 'Activity type',
                'activityRelation': 'Activity relation',
                'activityValue': 'Activity value',
                'activityUnits': 'Activity units',
                'activityComment': 'Activity comment',
                'pChembl': 'pChembl',
                'pmid': 'Pubmed ID',
                'chemblDOIs': 'Document DOIs',
                'ro5Violations': 'Rule of 5 violations',
                'chemblActivityURI': 'ChEMBL activity URI',
                //'chemblURI': 'ChEMBL compound URI',
                //'chemblTargetUri': 'ChEMBL target URI',
                'cwURI': 'Concept Wiki compound URI',
                //'csURI': 'OPS RSC URI',
                'assayURI': 'ChEMBL assay URI'
            };
            var treeCallback = function(success, status, response) {
                if (success && response) {
                    var pharmaResults = searcher.parseCompoundClassPharmacologyPaginated(response);
                    if (i === 1) {
                        keys = Object.keys(headers);
                        keys.forEach(function(key, index, keys) {
                            tsvFile += index < keys.length - 1 ? headers[key] + '\t' : headers[key] + '\r\n';
                        });
                    }
                    pharmaResults.forEach(function(result, index, results) {
                        var line = "";
                        keys.forEach(function(key, index, keys) {
                            // Change null values to empty string
                            var value = result[key] !== null ? result[key] : '';
                            line += index < keys.length - 1 ? value + '\t' : value;
                        });
                        line += "\r\n";
                        tsvFile += line;
                    });
                    if (i < numberOfPages) {
                        var percent = 100 / numberOfPages * i;
                        i++;
                        postMessage({
                            "status": "processing",
                            "percent": percent
                        });
                    } else {
                        // finished so do something
                        postMessage({
                            "status": "complete",
                            "percent": "100",
                            "tsvFile": tsvFile
                        });
                    }
                } else {
                    failed = true;
                    postMessage({
                        "status": "failed"
                    });
                }
            }
            searcher.getCompoundClassPharmacologyPaginated(params.uri, params.assay_organism, params.target_organism, params.activity_type, params.activity_value_type === "activity_value" ? activity_value : null, params.activity_unit, params.activity_value_type === "min-activity_value" ? activity_value : null, params.activity_value_type === "minEx-activity_value" ? activity_value : null, params.activity_value_type === "max-activity_value" ? activity_value : null, params.activity_value_type === "maxEx-activity_value" ? activity_value : null, params.activity_relation, params.pchembl_value_type === "pchembl" ? params.pchembl_value : null, params.pchembl_value_type === "min-pChembl" ? params.pchembl_value : null, params.pchembl_value_type === "minEx-pChembl" ? params.pchembl_value : null, params.pchembl_value_type === "max-pChembl" ? params.pchembl_value : null, params.pchembl_value_type === "maxEx-pChembl" ? params.pchembl_value : null, null, null, i, 250, null, treeCallback);
        }
    } else if (requestType === "structure") {
        headers = {
            'prefLabel': 'Compound preferred label',
            'description': 'Description',
            'biotransformationItem': 'Biotransformation Item',
            'toxicity': 'Toxicity',
            'proteinBinding': 'Protein Binding',
            'csURI': 'OPS RSC Identifier',
            'hba': 'HBA',
            'hbd': 'HBD',
            'inchi': 'InChi',
            'logp': 'logP',
            'psa': 'PSA',
            'ro5Violations': 'Rule of 5 violations',
            'smiles': 'SMILES',
            'fullMWT': 'Molecular weight',
            'molform': 'Molecular formula',
            'mwFreebase': 'mw Freebase',
            'rtb': 'RTB',
            'inchiKey': 'InChiKey',
            'chemblURI': 'ChEMBL identifier',
            'drugbankProvenanceURI': 'DrugBank Identifier',
        };
        var compoundBatchCallback = function(success, status, response) {
            if (success && response) {
                var pharmaResults = searcher.parseCompoundBatchResponse(response);
                Object.keys(headers).forEach(function(key, index, keys) {
                    tsvFile += index < keys.length - 1 ? headers[key] + '\t' : headers[key] + '\r\n';
                });
                result.forEach(function(result, index, results) {
                    var line = "";
                    Object.keys(headers).forEach(function(key, index, keys) {
                        // Change null values to empty string
                        var value = result[key] !== null ? result[key] : '';
                        line += index < keys.length - 1 ? value + '\t' : value;
                    });
                    line += "\r\n";
                    tsvFile += line;
                });
                postMessage({
                    "status": "complete",
                    "percent": "100",
                    "tsvFile": tsvFile
                });
            } else {
                failed = true;
                postMessage({
                    "status": "failed"
                });
            }
        };
        searcher.fetchCompoundBatch(uris, null, compoundBatchCallback);
    }
}
