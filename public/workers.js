importScripts('parser.js', 'nets.js');
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
            searcher = new Openphacts.CompoundSearch(ldaBaseURL, appID, appKey);
        } else if (requestType === "target") {
            searcher = new Openphacts.TargetSearch(ldaBaseURL, appID, appKey);
        } else if (requestType === "tree") {
            searcher = new Openphacts.TreeSearch(ldaBaseURL, appID, appKey);
            treeType = params.tree_type;
        }

        if (requestType === "structure") {
            uris = params.uris;
            searcher = new Openphacts.CompoundSearch(ldaBaseURL, appID, appKey);
        }
    }
    if (requestType === "compound" || requestType === "target" || requestType === "tree") {
        var requestURL;
        if (requestType === "compound") {
            requestURL = ldaBaseURL + '/compound/pharmacology/pages?uri=' + encodeURIComponent(params.uri) + '&app_id=' + appID + '&app_key=' + appKey + '&_page=' + i + '&_pageSize=250';
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
        } else if (requestType === "target") {
            requestURL = ldaBaseURL + '/target/pharmacology/pages?uri=' + encodeURIComponent(params.uri) + '&app_id=' + appID + '&app_key=' + appKey + '&_page=' + i + '&_pageSize=250';
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
                'chemblTargetUri': 'ChEMBL target URI',
                'cwCompoundUri': 'Concept Wiki compound URI',
                'csCompoundUri': 'OPS RSC URI',
                'chemblAssayUri': 'ChEMBL assay URI'
            };
        } else if (requestType === "tree") {
            if (treeType === "tree") {
                requestURL = ldaBaseURL + '/target/tree/pharmacology/pages?uri=' + encodeURIComponent(params.uri) + '&app_id=' + appID + '&app_key=' + appKey + '&_page=' + i + '&_pageSize=250';
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

            } else {
                requestURL = ldaBaseURL + '/compound/tree/pharmacology/pages?uri=' + encodeURIComponent(params.uri) + '&app_id=' + appID + '&app_key=' + appKey + '&_page=' + i + '&_pageSize=250';
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
            }
        }

        // Add any filters to the request
        requestURL += params['pchembl_value_type'] !== null ? '&' + encodeURIComponent(params['pchembl_value_type']) + '=' + encodeURIComponent(params['pchembl_value']) : '';
        requestURL += params['activity_value_type'] !== null ? '&' + encodeURIComponent(params['activity_value_type']) + '=' + encodeURIComponent(params['activity_value']) : '';
        requestURL += params['activity_type'] !== null ? '&activity_type=' + encodeURIComponent(params['activity_type']) : '';
        requestURL += params['activity_unit'] !== null ? '&activity_unit=' + encodeURIComponent(params['activity_unit']) : '';
        requestURL += params['activity_relation'] !== null ? '&activity_relation=' + encodeURIComponent(params['activity_relation']) : '';
        requestURL += params['assay_organism'] !== null ? '&assay_organism=' + encodeURIComponent(params['assay_organism']) : '';
        requestURL += params['target_organism'] !== null ? '&target_organism=' + encodeURIComponent(params['target_organism']) : '';

        var failed = false;
        var processTSVFile = function() {
            nets({
                url: requestURL,
                method: "GET",
                // 300 second timeout just in case
                timeout: 300000,
                headers: {
                    "Accept": "application/json"
                }
            }, function(err, resp, body) {
                if (err === null && body !== null) {
                    var pharmaResponse = JSON.parse(body.toString());
                    var pharmaResults;
                    if (requestType === "compound") {
                        pharmaResults = searcher.parseCompoundPharmacologyResponse(pharmaResponse.result);
                    } else if (requestType === "target") {
                        pharmaResults = searcher.parseTargetPharmacologyResponse(pharmaResponse.result);
                    } else if (requestType === "tree") {
                        if (treeType === "tree") {
                            pharmaResults = searcher.parseTargetClassPharmacologyPaginated(pharmaResponse.result);
                        } else {
                            pharmaResults = searcher.parseCompoundClassPharmacologyPaginated(pharmaResponse.result);
                        }
                    }

                    // Add the headers in the first line
                    if (requestType === "compound" || requestType === "target" || requestType === "tree") {
                        if (i === 1) {
                            keys = Object.keys(headers);
                            keys.forEach(function(key, index, keys) {
                                tsvFile += index < keys.length - 1 ? headers[key] + '\t' : headers[key] + '\r\n';
                            });
                        }
                    } else {
                        // defined keys only for compound right now
                        if (i === 1) {
                            keys = Object.keys(pharmaResults[0]);
                            keys.forEach(function(key, index, keys) {
                                tsvFile += index < keys.length - 1 ? key + '\t' : key + '\r\n';
                            });
                        }
                    }
                    pharmaResults.forEach(function(result, index, results) {
                        var line = "";
                        if (requestType === "compound" || requestType === "target" || requestType === "tree") {
                            keys.forEach(function(key, index, keys) {
                                // Change null values to empty string
                                var value = result[key] !== null ? result[key] : '';
                                line += index < keys.length - 1 ? value + '\t' : value;
                            });
                        }
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
            });
        }
        processTSVFile();
    } else if (requestType === "structure") {
        var allURIs = uris.join('|');
        requestURL = ldaBaseURL + '/compound/batch?uri_list=' + encodeURIComponent(allURIs) + '&app_id=' + appID + '&app_key=' + appKey;
        nets({
            url: requestURL,
            method: "GET",
            // 30 second timeout just in case
            timeout: 30000,
            headers: {
                "Accept": "application/json"
            }
        }, function(err, resp, body) {
            if (err === null && body !== null) {
                var response = JSON.parse(body.toString());
                var result = searcher.parseCompoundBatchResponse(response.result);
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
        });
    }
}
