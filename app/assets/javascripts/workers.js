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
                            tsvFile += index < keys.length - 1 ? key + '\t' : key + '\r\n';
                        });
                    }
                    pharmaResults.forEach(function(result, index, results) {
                        var line = result.compoundInchikey + '\t' + result.compoundDrugType + '\t' + result.compoundGenericName + '\t' + result.targets + '\t' + result.compoundInchikeySrc + '\t' + result.compoundDrugTypeSrc + '\t' + result.compoundGenericNameSrc + '\t' + result.targetTitleSrc + '\t' + result.chemblActivityUri + '\t' + result.chemblCompoundUri + '\t' + result.compoundFullMwt + '\t' + result.cwCompoundUri + '\t' + result.compoundPrefLabel + '\t' + result.csCompoundUri + '\t' + result.csid + '\t' + result.compoundInchi + '\t' + result.compoundSmiles + '\t' + result.chemblAssayUri + '\t' + result.targetOrganisms + '\t' + result.assayOrganism + '\t' + result.assayDescription + '\t' + result.activityRelation + '\t' + result.activityStandardUnits + '\t' + result.activityStandardValue + '\t' + result.activityActivityType + '\t' + result.compoundFullMwtSrc + '\t' + result.compoundPrefLabelSrc + '\t' + result.compoundInchiSrc + '\t' + result.compoundSmilesSrc + '\t' + result.targetOrganismSrc + '\t' + result.assayOrganismSrc + '\t' + result.assayDescriptionSrc + '\t' + result.activityRelationSrc + '\t' + result.activityStandardUnitsSrc + '\t' + result.activityStandardValueSrc + '\t' + result.activityActivityTypeSrc + '\t' + result.activityPubmedId + '\t' + result.assayDescriptionItem + '\t' + result.assayOrganismItem + '\t' + result.activityActivityTypeItem + '\t' + result.activityRelationItem + '\t' + result.activityStandardValueItem + '\t' + result.activityStandardUnitsItem + '\t' + result.activityValue + '\t' + result.compoundFullMwtItem + '\t' + result.compoundSmilesItem + '\t' + result.compoundInchiItem + '\t' + result.compoundInchikeyItem + '\t' + result.compoundPrefLabelItem + '\t' + result.pChembl + '\t' + result.chemblProvenance;
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
