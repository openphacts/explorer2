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
onmessage = function(e) {

    state = e.data[0];
    if (state === "start") {
        ldaBaseURL = e.data[1];
        appID = e.data[2];
        appKey = e.data[3];
        params = e.data[4];
        numberOfPages = parseInt(params.total_count / 250);
        numberOfPages += parseInt(params.total_count) % 250 > 0 ? 1 : 0;
        requestType = params.request_type;
        searcher = new Openphacts.CompoundSearch(ldaBaseURL, appID, appKey);
    }
    if (requestType === "compound") {
        var requestURL = ldaBaseURL + '/compound/pharmacology/pages?uri=' + encodeURIComponent(params.uri) + '&app_id=' + appID + '&app_key=' + appKey + '&_page=' + i + '&_pageSize=250';
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
                    var pharmaResults = searcher.parseCompoundPharmacologyResponse(pharmaResponse.result);
                    // Add the headers in the first line
                    if (i === 1) {
                        Object.keys(pharmaResults[0]).forEach(function(key, index, keys) {
                            tsvFile += index < keys.length - 1 ? key + ',' : key + '\r\n';
                        });
                    }
                    pharmaResults.forEach(function(result, index, results) {
                        console.log('parse');
                        var line = result.compoundInchikey + ',' + result.compoundDrugType + ',' + result.compoundGenericName + ',' + result.targets + ',' + result.compoundInchikeySrc + ',' + result.compoundDrugTypeSrc + ',' + result.compoundGenericNameSrc + ',' + result.targetTitleSrc + ',' + result.chemblActivityUri + ',' + result.chemblCompoundUri + ',' + result.compoundFullMwt + ',' + result.cwCompoundUri + ',' + result.compoundPrefLabel + ',' + result.csCompoundUri + ',' + result.csid + ',' + result.compoundInchi + ',' + result.compoundSmiles + ',' + result.chemblAssayUri + ',' + result.targetOrganisms + ',' + result.assayOrganism + ',' + result.assayDescription + ',' + result.activityRelation + ',' + result.activityStandardUnits + ',' + result.activityStandardValue + ',' + result.activityActivityType + ',' + result.compoundFullMwtSrc + ',' + result.compoundPrefLabelSrc + ',' + result.compoundInchiSrc + ',' + result.compoundSmilesSrc + ',' + result.targetOrganismSrc + ',' + result.assayOrganismSrc + ',' + result.assayDescriptionSrc + ',' + result.activityRelationSrc + ',' + result.activityStandardUnitsSrc + ',' + result.activityStandardValueSrc + ',' + result.activityActivityTypeSrc + ',' + result.activityPubmedId + ',' + result.assayDescriptionItem + ',' + result.assayOrganismItem + ',' + result.activityActivityTypeItem + ',' + result.activityRelationItem + ',' + result.activityStandardValueItem + ',' + result.activityStandardUnitsItem + ',' + result.activityValue + ',' + result.compoundFullMwtItem + ',' + result.compoundSmilesItem + ',' + result.compoundInchiItem + ',' + result.compoundInchikeyItem + ',' + result.compoundPrefLabelItem + ',' + result.pChembl + ',' + result.chemblProvenance;
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
    } else if (params.request_type === "target") {

    } else if (params.request_type === "structure") {

    }
}
