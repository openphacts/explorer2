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
        }
        if (requestType === "structure") {
            uris = params.uris;
            searcher = new Openphacts.CompoundSearch(ldaBaseURL, appID, appKey);
        }
    }
    if (requestType === "compound" || requestType === "target") {
        var requestURL;
        if (requestType === "compound") {
            requestURL = ldaBaseURL + '/compound/pharmacology/pages?uri=' + encodeURIComponent(params.uri) + '&app_id=' + appID + '&app_key=' + appKey + '&_page=' + i + '&_pageSize=250';
        } else if (requestType === "target") {
            requestURL = ldaBaseURL + '/target/pharmacology/pages?uri=' + encodeURIComponent(params.uri) + '&app_id=' + appID + '&app_key=' + appKey + '&_page=' + i + '&_pageSize=250';
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
                // 30 second timeout just in case
                timeout: 30000,
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
                    }
                    // Add the headers in the first line
                    if (i === 1) {
                        keys = Object.keys(pharmaResults[0]);
                        keys.forEach(function(key, index, keys) {
                            tsvFile += index < keys.length - 1 ? key + '\t' : key + '\r\n';
                        });
                    }
                    pharmaResults.forEach(function(result, index, results) {
                        var line = "";
                        if (requestType === "compound") {
                            // keep this list in case we want to cut down the columns some time
                            //line = result.compoundInchikey + '\t' + result.compoundDrugType + '\t' + result.compoundGenericName + '\t' + result.targets + '\t' + result.compoundInchikeySrc + '\t' + result.compoundDrugTypeSrc + '\t' + result.compoundGenericNameSrc + '\t' + result.targetTitleSrc + '\t' + result.chemblActivityUri + '\t' + result.chemblCompoundUri + '\t' + result.compoundFullMwt + '\t' + result.cwCompoundUri + '\t' + result.compoundPrefLabel + '\t' + result.csCompoundUri + '\t' + result.csid + '\t' + result.compoundInchi + '\t' + result.compoundSmiles + '\t' + result.chemblAssayUri + '\t' + result.targetOrganisms + '\t' + result.assayOrganism + '\t' + result.assayDescription + '\t' + result.activityRelation + '\t' + result.activityStandardUnits + '\t' + result.activityStandardValue + '\t' + result.activityActivityType + '\t' + result.compoundFullMwtSrc + '\t' + result.compoundPrefLabelSrc + '\t' + result.compoundInchiSrc + '\t' + result.compoundSmilesSrc + '\t' + result.targetOrganismSrc + '\t' + result.assayOrganismSrc + '\t' + result.assayDescriptionSrc + '\t' + result.activityRelationSrc + '\t' + result.activityStandardUnitsSrc + '\t' + result.activityStandardValueSrc + '\t' + result.activityActivityTypeSrc + '\t' + result.activityPubmedId + '\t' + result.assayDescriptionItem + '\t' + result.assayOrganismItem + '\t' + result.activityActivityTypeItem + '\t' + result.activityRelationItem + '\t' + result.activityStandardValueItem + '\t' + result.activityStandardUnitsItem + '\t' + result.activityValue + '\t' + result.compoundFullMwtItem + '\t' + result.compoundSmilesItem + '\t' + result.compoundInchiItem + '\t' + result.compoundInchikeyItem + '\t' + result.compoundPrefLabelItem + '\t' + result.pChembl + '\t' + result.chemblProvenance;
                            keys.forEach(function(key, index, keys) {
                                // Change null values to empty string
                                var value = result[key] ? result[key] : '';
                                line += index < keys.length - 1 ? value + '\t' : value;
                            });

                        } else if (requestType === "target") {
                            keys.forEach(function(key, index, keys) {
                                // Change null values to empty string
                                var value = result[key] ? result[key] : '';
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
                keys = Object.keys(result[0]);
                keys.forEach(function(key, index, keys) {
                    tsvFile += index < keys.length - 1 ? key + '\t' : key + '\r\n';
                });
                result.forEach(function(result, index, results) {
                    var line = "";
                    keys.forEach(function(key, index, keys) {
                        // Change null values to empty string
                        var value = result[key] ? result[key] : '';
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
