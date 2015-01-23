importScripts('parser.js', 'nets.js');
onmessage = function(e) {
    var params = e.data[3];
    var searcher;
    var tsvFile = "";
    var number_of_pages = parseInt(params.total_count / 250);
    number_of_pages += parseInt(params.total_count) % 250 > 0 ? 1 : 0;
    var i = 1;
    if (params.request_type === "compound") {
        searcher = new Openphacts.CompoundSearch(e.data[0], e.data[1], e.data[2]);
        var request_url = e.data[0] + '/compound/pharmacology/pages?uri=' + encodeURIComponent(e.data[3].uri) + '&app_id=' + e.data[1] + '&app_key=' + e.data[2] + '&_page=' + i + '&_pageSize=250';
        var failed = false;
        var processTSVFile = function() {
            nets({
                url: request_url,
                method: "GET",
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
                    if (i < number_of_pages) {
                        postMessage({
                            "status": "processing",
                            "percent": 100 / number_of_pages * i
                        });
                        i++;
                        processTSVFile();
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
