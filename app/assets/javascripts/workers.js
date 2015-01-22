importScripts('parser.js', 'nets.js');
onmessage = function(e) {
    var params = e.data[3];
    var searcher;
    var tsvFile;
    var number_of_pages = parseInt(params.total_count / 250);
    number_of_pages += parseInt(params.total_count) % 250 > 0 ? 1 : 0;
    var i = 1;
    if (params.request_type === "compound") {
        searcher = new Openphacts.CompoundSearch(e.data[0], e.data[1], e.data[2]);
        var request_url = e.data[0] + '/compound/pharmacology/pages?uri=' + encodeURIComponent(e.data[3].uri) + '&app_id=' + e.data[1] + '&app_key=' + e.data[2];
        nets({
            url: request_url,
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        }, function(err, resp, body) {
            if (err == null && body != null) {
                var pharmaResponse = JSON.parse(body.toString());
                var pharmaResults = searcher.parseCompoundPharmacologyResponse(pharmaResponse.result);
                pharmaResults.forEach(function(result, index, results) {

                });
                if (i <= number_of_pages) {
                    postMessage({
                        "status": "processing",
                        "percent": 100 / number_of_pages * i
                    });
                } else {
                    // finished so do something
                    postMessage({
                        "status": "complete",
                        "percent": "100"
                    });
                }
                i++;
            } else {
                postMessage({
                    "status": "failed"
                });

            }
            console.log('response');
        });
    } else if (params.request_type === "target") {

    } else if (params.request_type === "structure") {

    }
}
