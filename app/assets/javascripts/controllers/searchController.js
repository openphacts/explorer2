App.searchResultsController = Ember.ArrayController.create({
    isSearching: false,

    currentPage: 1,

    current_query: '',

    setCurrentQuery: function(query) {
        this.current_query=query;
    },

    getCurrentQuery: function() {
        return this.current_query;
    },

    search: function (query) {
        var me = this;
        var q = query;

        this.set('isSearching', true);
        this.set('content', []);

        var c = $.ajax({
            dataType: "jsonp",
            url: search_url,
            cache: true,
            data: {
                q: query,
                limit: 20,
                branch: 4,
                uuid: "07a84994-e464-4bbf-812a-a4b96fa3d197"
            }
        });
        c.success(function (data) {
            this.currentPage++;

            $.each(data, function (i, match) {

                var compound_query = $.ajax({
                    dataType: "jsonp",
                    url: compound_info_search_url,
                    cache: true,
                    data: {
                        _format: "json",
                        uri: "http://www.conceptwiki.org/concept/" + match.uuid
                    }
                });

                compound_query.success(function (data) {
                    var drugbankData, csid, smiles;
                    $.each(data.result.primaryTopic.exactMatch, function (i, exactMatch) {
                        if (exactMatch["_about"]) {
                            if (exactMatch["_about"].indexOf("http://www4.wiwiss.fu-berlin.de/drugbank") !== -1) {
                                drugbankData = exactMatch;
                            } else if(exactMatch["_about"].indexOf("http://linkedlifedata.com/resource/drugbank") !== -1) {
                                drugbankData = exactMatch;
                            } else if (exactMatch["_about"].indexOf("http://www.chemspider.com") !== -1) {
                                csid = exactMatch["_about"].split('/').pop();
                                smiles = exactMatch.smiles;
                            } else if (exactMatch["_about"].indexOf("http://rdf.chemspider.com") !== -1) {
                                csid = exactMatch["_about"].split('/').pop();
                                smiles = exactMatch.smiles;
                            }
                        }
                    });
                    this_compound = App.Compound.create({
                        description: drugbankData ? drugbankData.description : null,
                        biotransformation: drugbankData ? drugbankData.biotransformation : null,
                        toxicity: drugbankData ? drugbankData.toxicity : null,
                        proteinbinding: drugbankData ? drugbankData.proteinBinding : null,
                        label: data.result.primaryTopic.prefLabel,
                        exactMatch: data.result.primaryTopic.prefLabel == q ? true : false,
                        csid: csid,
                        smiles: smiles
                    });
                    if (data.result.primaryTopic.prefLabel == q) {
                        App.compoundsController.addExactMatch(this_compound);
                    } else {
                        App.compoundsController.addCompound(this_compound);
                    }
                });
            });
            me.set('isSearching', false);
            pageScrolling = false;
            enable_scroll();
        });
    }
});
