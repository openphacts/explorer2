importScripts('combined.js');
onmessage = function(e) {
    var params = e.data[0];
    var searcher;
    var tsvFile;
    var number_of_pages = parseInt(params.total_count) / 250;
    number_of_pages += parseInt(params.total_count) % 250 > 0 ? 1 : 0;
    int i = 1;
    if (params.request_type === "compound") {
        searcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);
        var pharmaCallback = function(success, status, response) {
            if (success && response) {
                var pharmaResults = searcher.parseCompoundPharmacologyResponse(response);
		pharmaResults.forEach(function(result, index, results) {

		});
             
		//write results out to the tsvFile  
                //
                i++;
                if (i <= number_of_pages) {
                    postMessage({
                        "status": "processing",
                        "percent": 100 / number_of_pages * i
                    });
		    // target_type & lens not supported yet
                    searcher.compoundPharmacologyCount(params.uri, params.assay_organism, params.target_organism, params.activity_type, params.activity_value_type === "activity_value" ? params.activity_value : null, params.activity_value_type === "min-activity_value" ? params.activity_value : null, params.activity_value_type === "minEx-activity_value" ? params.activity_value : null, params.activity_value_type === "max-activity_value" ? params.activity_value : null, params.activity_value_type === "maxEx-activity_value" ? params.activity_value : null, params.unit, params.activityRelation,  params.pchembl_value_type === "pchembl" ? params.pchembl_value : null,  params.pchembl_value_type === "min-pChembl" ? params.pchembl_value : null,  params.pchembl_value_type === "minEx-pChembl" ? params.pchembl_value : null,  params.pchembl_value_type === "max-pChembl" ? params.pchembl_value : null,  params.pchembl_value_type === "maxEx-pChembl" ? params.pchembl_value : null, null, null, countCallback);
                } else {
                    // finished so do something
                    postMessage({
                        "status": "complete",
                        "percent": "100"
                    });
                }
            } else {
                postMessage({
                    "status": "failed"
                });
            }
        }
	// target_type and lens not supported yet
searcher.compoundPharmacologyCount(params.uri, params.assay_organism, params.target_organism, params.activity_type, params.activity_value_type === "activity_value" ? params.activity_value : null, params.activity_value_type === "min-activity_value" ? params.activity_value : null, params.activity_value_type === "minEx-activity_value" ? params.activity_value : null, params.activity_value_type === "max-activity_value" ? params.activity_value : null, params.activity_value_type === "maxEx-activity_value" ? params.activity_value : null, params.unit, params.activityRelation,  params.pchembl_value_type === "pchembl" ? params.pchembl_value : null,  params.pchembl_value_type === "min-pChembl" ? params.pchembl_value : null,  params.pchembl_value_type === "minEx-pChembl" ? params.pchembl_value : null,  params.pchembl_value_type === "max-pChembl" ? params.pchembl_value : null,  params.pchembl_value_type === "maxEx-pChembl" ? params.pchembl_value : null, null, null, countCallback);
    } else if (params.request_type === "target") {

    } else if (params.request_type === "structure") {

    }
}
