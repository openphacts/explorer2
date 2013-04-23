var Openphacts= Openphacts || {};
Openphacts.CompoundSearch = function CompoundSearch(baseURL) {
    this.baseURL = baseURL;
}

Openphacts.CompoundSearch.prototype.fetchCompound = function(appID, appKey, compoundUri, callback) {
    var compoundQuery = $.ajax({
        url: this.baseURL + '/compound',
        cache: true,
        data: {
            _format: "json",
            uri: compoundUri,
            app_id: appID,
            app_key: appKey
        },
        success: function(response, status, request) {
            callback.call(this, true, request.status, response.result.primaryTopic);   
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
    $.each(response.exactMatch, function (i, exactMatch) {
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
        rtb: chemblData ? chemblData.rtb : null
    };
}
Openphacts.TargetSearch = function TargetSearch(baseURL) {
    this.baseURL = baseURL;
}

Openphacts.TargetSearch.prototype.fetchTarget = function(appID, appKey, targetUri, callback) {
    var targetQuery = $.ajax({
        url: this.baseURL + '/target',
        cache: true,
        data: {
            _format: "json",
            uri: targetUri,
            app_id: appID,
            app_key: appKey
        },
        success: function(response, status, request) {
            callback.call(this, true, request.status, response.result.primaryTopic);   
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
    $.each(response.exactMatch, function (i, exactMatch) {
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
        seeAlso: seeAlso
    };
}
Openphacts.ConceptWikiSearch = function (baseURL) {
    this.baseURL = baseURL;
}

Openphacts.ConceptWikiSearch.prototype.byTag = function(appID, appKey, query, limit, branch, type, callback) {
    var conceptWikiSearcher = $.ajax({
        url: this.baseURL + "/search/byTag",
        cache: true,
        data: {
            q: query,
            limit: limit,
            branch: branch,
            uuid: type,
            app_id: appID,
            app_key: appKey
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
        $.each(response, function (i, match) {
            uris.push({'uri': match["_about"], 'prefLabel': match["prefLabel"], 'match': match["match"]});
        });
    } else {
        uris.push({'uri': response["_about"], 'prefLabel': response["prefLabel"], 'match': response["match"]});
    }
    return uris;
}
