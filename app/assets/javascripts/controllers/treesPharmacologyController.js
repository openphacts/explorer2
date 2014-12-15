App.TreesPharmacologyController = Ember.ArrayController.extend({

    needs: ['trees', 'application'],

    queryParams: ['uri'],

    uri: '',

    //If it is Chebi then we need to know to call compound class since the api can't tell us what hierarchy a uri belongs to
    treeType: null,

    compoundClass: function() {
        return this.get('treeType') === 'chebi';
    }.property('treeType'),

    page: null,

    currentCount: function() {
        return this.get('model.length');
    }.property('model.length'),

    totalCount: null,

    notEmpty: function() {
        return this.get('model.length') > 0;
    }.property('model.length'),

    conditions: [">", "<", "=", "<=", ">="],

    activityRelations: [">", "<", "=", "<=", ">="],

    pchemblConditions: [">", "<", "=", "<=", ">="],

    activityTypes: null,

    activityUnits: null,

    sortedHeader: null,

    currentHeader: null,

    selectedActivity: null,

    selectedUnit: null,

    selectedCondition: null,

    activityValue: null,

    selectedRelation: null,

    pchemblValue: null,

    selectedPchemblCondition: null,

    selectedPchemblValue: null,

    assayOrganismQuery: null,

    targetOrganismQuery: null,

    showPharmaProvenance: false,

    // I'm sure all this can be done more elegantly but....

    inchikeySortASC: function() {
        return this.get('currentHeader') === "inchi_key" && this.get('sortedHeader') === "inchi_key";
    }.property('sortedHeader'),

    inchikeySortDESC: function() {
        return this.get('currentHeader') === "inchi_key" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    inchiSortASC: function() {
        return this.get('currentHeader') === "inchi" && this.get('sortedHeader') === "inchi";
    }.property('sortedHeader'),

    inchiSortDESC: function() {
        return this.get('currentHeader') === "inchi" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    smilesSortASC: function() {
        return this.get('currentHeader') === "smiles" && this.get('sortedHeader') === "smiles";
    }.property('sortedHeader'),

    smilesSortDESC: function() {
        return this.get('currentHeader') === "smiles" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    molweightSortASC: function() {
        return this.get('currentHeader') === "molweight" && this.get('sortedHeader') === "molweight";
    }.property('sortedHeader'),

    molweightSortDESC: function() {
        return this.get('currentHeader') === "molweight" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    compoundNameSortASC: function() {
        return this.get('currentHeader') === "compound_name" && this.get('sortedHeader') === "compound_name";
    }.property('sortedHeader'),

    compoundNameSortDESC: function() {
        return this.get('currentHeader') === "compound_name" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    targetOrganismSortASC: function() {
        return this.get('currentHeader') === "target_organism" && this.get('sortedHeader') === "target_organism";
    }.property('sortedHeader'),

    targetOrganismSortDESC: function() {
        return this.get('currentHeader') === "target_organism" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    targetComponentSortASC: function() {
        return this.get('currentHeader') === "target_component" && this.get('sortedHeader') === "target_component";
    }.property('sortedHeader'),

    targetComponentSortDESC: function() {
        return this.get('currentHeader') === "target_component" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    assayOrganismSortASC: function() {
        return this.get('currentHeader') === "assay_organism" && this.get('sortedHeader') === "assay_organism";
    }.property('sortedHeader'),

    assayOrganismSortDESC: function() {
        return this.get('currentHeader') === "assay_organism" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    assayDescriptionSortASC: function() {
        return this.get('currentHeader') === "assay_description" && this.get('sortedHeader') === "assay_description";
    }.property('sortedHeader'),

    assayDescriptionSortDESC: function() {
        return this.get('currentHeader') === "assay_description" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    activityTypeSortASC: function() {
        return this.get('currentHeader') === "activity_type" && this.get('sortedHeader') === "activity_type";
    }.property('sortedHeader'),

    activityTypeSortDESC: function() {
        return this.get('currentHeader') === "activity_type" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    activityRelationSortASC: function() {
        return this.get('currentHeader') === "activity_relation" && this.get('sortedHeader') === "activity_relation";
    }.property('sortedHeader'),

    activityRelationSortDESC: function() {
        return this.get('currentHeader') === "activity_relation" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    activityValueSortASC: function() {
        return this.get('currentHeader') === "activity_value" && this.get('sortedHeader') === "activity_value";
    }.property('sortedHeader'),

    activityValueSortDESC: function() {
        return this.get('currentHeader') === "activity_value" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    activityUnitSortASC: function() {
        return this.get('currentHeader') === "activity_unit" && this.get('sortedHeader') === "activity_unit";
    }.property('sortedHeader'),

    activityUnitSortDESC: function() {
        return this.get('currentHeader') === "activity_unit" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    pmidSortASC: function() {
        return this.get('currentHeader') === "pmid" && this.get('sortedHeader') === "pmid";
    }.property('sortedHeader'),

    pmidSortDESC: function() {
        return this.get('currentHeader') === "pmid" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    pchemblSortASC: function() {
        return this.get('currentHeader') === "pChembl" && this.get('sortedHeader') === "pChembl";
    }.property('sortedHeader'),

    pchemblSortDESC: function() {
        return this.get('currentHeader') === "pChembl" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    targetNameSortASC: function() {
        return this.get('currentHeader') === "target_name" && this.get('sortedHeader') === "target_name";
    }.property('sortedHeader'),

    targetNameSortDESC: function() {
        return this.get('currentHeader') === "target_name" && this.get('sortedHeader') === null;
    }.property('sortedHeader'),

    actions: {

        fetchMore: function() {
            if (this.get('model.length') < this.totalCount && this.totalCount > 0 && this.get('controllers.application').get('fetching') === false) {
                var me = this;
                var searcher = new Openphacts.TreeSearch(ldaBaseUrl, appID, appKey);
                var compoundSearcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);
                var pharmaCallback = function(success, status, response) {
                    if (success && response) {
                        me.page++;
                        var pharmaResults;
                        if (me.get('treeType') === 'chebi') {
                            pharmaResults = searcher.parseCompoundClassPharmacologyPaginated(response);
                        } else {
                            pharmaResults = searcher.parseTargetClassPharmacologyPaginated(response);
                        }
                        $.each(pharmaResults, function(index, pharma) {
                            var pharmaRecord = me.store.createRecord('treePharmacology', pharma);
                            me.pushObject(pharmaRecord);
                        });
                        me.get('controllers.application').set('fetching', false);
                        enable_scroll();
                    } else {
                        me.get('controllers.application').set('fetching', false);
                        enable_scroll();
                    }
                };
                this.get('controllers.application').set('fetching', true);
                if (this.get('treeType') === 'chebi') {
                    searcher.getCompoundClassPharmacologyPaginated(this.get('uri'), null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, this.page, 50, null, pharmaCallback);
                } else {
                    searcher.getTargetClassPharmacologyPaginated(this.get('uri'), null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, this.page, 50, null, pharmaCallback);
                }
            } else {
                enable_scroll();
            }
        },

        sortHeader: function(header) {
            console.log('sorting by ' + header);
            //first set all the current filters
            var me = this;
            var assayOrganism = this.get('assayOrganismQuery');
            var targetOrganism = this.get('targetOrganismQuery');
            var targetType = null;
            var lens = null;
            var activity = this.get('selectedActivity') != null ? this.get('selectedActivity').label : null;
            var unit = this.get('selectedUnit') != null ? this.get('selectedUnit').label : null;
            var condition = this.get('selectedCondition') != null ? this.get('selectedCondition') : null;
            var currentActivityValue = this.get('activityValue') != null ? this.get('activityValue') : null;
            var activityRelation = null;
            var minActivityValue = null;
            var maxActivityValue = null;
            var maxExActivityValue = null;
            var activityValue = null;
            var minExActivityValue = null;
            // only set activity filter if all filter boxes have been selected
            if (unit != null && activity != null && condition != null && currentActivityValue != null) {
                switch (condition) {
                    case '>':
                        minExActivityValue = currentActivityValue;
                        break;
                    case '<':
                        maxExActivityValue = currentActivityValue;
                        break;
                    case '=':
                        activityValue = currentActivityValue;
                        break;
                    case '<=':
                        maxActivityValue = currentActivityValue;
                        break;
                    case '>=':
                        minActivityValue = currentActivityValue;
                        break;
                }
            }

            var pchemblCondition = this.get('selectedPchemblCondition') != null ? this.get('selectedPchemblCondition') : null;
            var currentPchemblValue = this.get('pchemblValue') != null ? this.get('pchemblValue') : null;
            var minPchemblValue = null;
            var maxPchemblValue = null;
            var maxExPchemblValue = null;
            var minExPchemblValue = null;
            var actualPchemblValue = null;
            // pchembl filter only valid if all filter bits selected
            if (pchemblCondition != null && currentPchemblValue != null) {
                switch (pchemblCondition) {
                    case '>':
                        minExPchemblValue = currentPchemblValue;
                        break;
                    case '<':
                        maxExPchemblValue = currentPchemblValue;
                        break;
                    case '=':
                        actualPchemblValue = currentPchemblValue;
                        break;
                    case '<=':
                        maxPchemblValue = currentPchemblValue;
                        break;
                    case '>=':
                        minPchemblValue = currentPchemblValue;
                        break;
                }
            }
            var activityRelations = [];
            if (this.get('greaterThan') === true) {
                activityRelations.push(">");
            }
            if (this.get('lessThan') === true) {
                activityRelations.push("<");
            }
            if (this.get('greaterThanOrEqual') === true) {
                activityRelations.push(">=");
            }
            if (this.get('lessThanOrEqual') === true) {
                activityRelations.push("<=");
            }
            if (this.get('equalTo') === true) {
                activityRelations.push("=");
            }
            // if there are any relations then add them all to the string with the "|" (OR) separator otherwise activityRelation will still be null
            // a trailing "|" is fine according to tests on the LD API
            if (activityRelations.length > 0) {
                activityRelation = "";
                $.each(activityRelations, function(index, relation) {
                    activityRelation = activityRelation + relation + "|";
                });
            }
            me.clear();
            this.set('page', 1);
            this.get('controllers.application').set('fetching', true);
            var sortBy = '';
            if (this.get('sortedHeader') === header) {
                sortBy = 'DESC(?' + header + ')';
                this.set('sortedHeader', null);
            } else {
                // keep track of the fact we have just sorted by this header so next time has to be descending for same one
                sortBy = '?' + header;
                this.set('sortedHeader', header);
                this.set('currentHeader', header);
            }
            var pharmaCallback = function(success, status, response) {
                if (success && response) {
                    me.page++;
                    var pharmaResults;
                    if (me.get('treeType') === 'chebi') {
                        pharmaResults = searcher.parseCompoundClassPharmacologyPaginated(response);
                    } else {
                        pharmaResults = searcher.parseTargetClassPharmacologyPaginated(response);
                    }
                    $.each(pharmaResults, function(index, pharma) {
                        var pharmaRecord = me.store.createRecord('treePharmacology', pharma);
                        me.pushObject(pharmaRecord);
                    });
                    me.get('controllers.application').set('fetching', false);
                    enable_scroll();
                } else {
                    me.get('controllers.application').set('fetching', false);
                    enable_scroll();
                }
            };
            var searcher = new Openphacts.TreeSearch(ldaBaseUrl, appID, appKey);
            if (this.get('treeType') === 'chebi') {
                searcher.getCompoundClassPharmacologyPaginated(this.get('uri'), assayOrganism, targetOrganism, activity, currentActivityValue, unit, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, activityRelation, actualPchemblValue, minPchemblValue, minExPchemblValue, maxPchemblValue, maxExPchemblValue, targetType, lens, this.page, 50, sortBy, pharmaCallback);
            } else {
                searcher.getTargetClassPharmacologyPaginated(this.get('uri'), assayOrganism, targetOrganism, activity, currentActivityValue, unit, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, activityRelation, actualPchemblValue, minPchemblValue, minExPchemblValue, maxPchemblValue, maxExPchemblValue, targetType, lens, this.page, 50, sortBy, pharmaCallback);
            }
        },
        applyFilters: function() {
            var sortBy = null;
            var assayOrganism = this.get('assayOrganismQuery');
            var targetOrganism = this.get('targetOrganismQuery');
            var targetType = null;
            var lens = null;
            var activity = this.get('selectedActivity') != null ? this.get('selectedActivity').label : null;
            var unit = this.get('selectedUnit') != null ? this.get('selectedUnit').label : null;
            var condition = this.get('selectedCondition') != null ? this.get('selectedCondition') : null;
            var currentActivityValue = this.get('activityValue') != null ? this.get('activityValue') : null;
            var activityRelation = null;
            var minActivityValue = null;
            var maxActivityValue = null;
            var maxExActivityValue = null;
            var activityValue = null;
            var minExActivityValue = null;
            // only set activity filter if all filter boxes have been selected
            if (unit != null && activity != null && condition != null && currentActivityValue != null) {
                switch (condition) {
                    case '>':
                        minExActivityValue = currentActivityValue;
                        break;
                    case '<':
                        maxExActivityValue = currentActivityValue;
                        break;
                    case '=':
                        activityValue = currentActivityValue;
                        break;
                    case '<=':
                        maxActivityValue = currentActivityValue;
                        break;
                    case '>=':
                        minActivityValue = currentActivityValue;
                        break;
                }
            }
            var activityRelations = [];
            if (this.get('greaterThan') === true) {
                activityRelations.push(">");
            }
            if (this.get('lessThan') === true) {
                activityRelations.push("<");
            }
            if (this.get('greaterThanOrEqual') === true) {
                activityRelations.push(">=");
            }
            if (this.get('lessThanOrEqual') === true) {
                activityRelations.push("<=");
            }
            if (this.get('equalTo') === true) {
                activityRelations.push("=");
            }
            // if there are any relations then add them all to the string with the "|" (OR) separator otherwise activityRelation will still be null
            // a trailing "|" is fine according to tests on the LD API
            if (activityRelations.length > 0) {
                activityRelation = "";
                $.each(activityRelations, function(index, relation) {
                    activityRelation = activityRelation + relation + "|";
                });
            }
            var pchemblCondition = this.get('selectedPchemblCondition') != null ? this.get('selectedPchemblCondition') : null;
            var currentPchemblValue = this.get('pchemblValue') != null ? this.get('pchemblValue') : null;
            var minPchemblValue = null;
            var maxPchemblValue = null;
            var maxExPchemblValue = null;
            var minExPchemblValue = null;
            var actualPchemblValue = null;
            // pchembl filter only valid if all filter bits selected
            if (pchemblCondition != null && currentPchemblValue != null) {
                switch (pchemblCondition) {
                    case '>':
                        minExPchemblValue = currentPchemblValue;
                        break;
                    case '<':
                        maxExPchemblValue = currentPchemblValue;
                        break;
                    case '=':
                        actualPchemblValue = currentPchemblValue;
                        break;
                    case '<=':
                        maxPchemblValue = currentPchemblValue;
                        break;
                    case '>=':
                        minPchemblValue = currentPchemblValue;
                        break;
                }
            }
            var me = this;
            me.set('page', 1);
            me.clear();
            this.get('controllers.application').set('fetching', true);
            var searcher = new Openphacts.TreeSearch(ldaBaseUrl, appID, appKey);
            var pharmaCallback = function(success, status, response) {
                if (success && response) {
                    me.page++;
                    var pharmaResults = searcher.parseTargetClassPharmacologyPaginated(response);
                    $.each(pharmaResults, function(index, pharma) {
                        var pharmaRecord = me.store.createRecord('treePharmacology', pharma);
                        me.pushObject(pharmaRecord);
                    });
                    me.get('controllers.application').set('fetching', false);
                    enable_scroll();
                } else {
                    //failed response so scrolling is now allowed
                    me.get('controllers.application').set('fetching', false);
                    enable_scroll();
                }
            };
            // get the count for these filters then get the first page of results
            var countCallback = function(success, status, response) {
                $('#enzymePharmaFilterModalView').modal('toggle');
                $('#enzymePharmaFilterModalView').button('toggle');
                if (success && response) {
                    var count = searcher.parseTargetClassPharmacologyCount(response);
                    me.set('totalCount', count);
                    if (count > 0) {
                        //		    searcher.targetPharmacology(thisTarget.get('URI'), assayOrganism, targetOrganism, activity, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, unit, activityRelation, actualPchemblValue, minPchemblValue, minExPchemblValue, maxPchemblValue, maxExPchemblValue, targetType, me.get('page') + 1, 50, sortBy, lens, pharmaCallback);
                        searcher.getTargetClassPharmacologyPaginated(me.get('uri'), assayOrganism, targetOrganism, activity, activityValue, unit, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, activityRelation, actualPchemblValue, minPchemblValue, minExPchemblValue, maxPchemblValue, maxExPchemblValue, targetType, lens, me.page, 50, sortBy, pharmaCallback);
                    } else {
                        me.get('controllers.application').set('fetching', false);
                        App.FlashQueue.pushFlash('error', 'No target class pharmacology available with those filters. Please apply different filters and try again');
                    }
                }
            };
            searcher.getTargetClassPharmacologyCount(me.get('uri'), assayOrganism, targetOrganism, activity, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, unit, activityRelation, actualPchemblValue, minPchemblValue, minExPchemblValue, maxPchemblValue, maxExPchemblValue, targetType, lens, countCallback);

        },
        resetFilters: function() {
            this.set('selectedActivity', null);
            this.set('selectedUnit', null);
            this.set('selectedCondition', null);
            this.set('activityValue', null);
            this.set('selectedRelation', null);
            this.set('pchemblValue', null);
            this.set('selectedPchemblCondition', null);
            this.set('selectedPchemblValue', null);
            this.set('assayOrganismQuery', null);
            this.set('targetOrganismQuery', null);
        },

        goToTop: function() {
            window.scrollTo(0, 0);
        },
        enableProvenance: function() {
            this.set('showProvenance', true);
        },

        disableProvenance: function() {
            this.set('showProvenance', false);
        },

        tsvDownload: function(target) {
            var me = this;
            //first set all the current filters
            var assayOrganism = this.get('assayOrganismQuery');
            var targetOrganism = this.get('targetOrganismQuery');
            var targetType = null;
            var lens = null;
            var activity = this.get('selectedActivity') != null ? this.get('selectedActivity').label : null;
            var unit = this.get('selectedUnit') != null ? this.get('selectedUnit').label : null;
            var condition = this.get('selectedCondition') != null ? this.get('selectedCondition') : null;
            var currentActivityValue = this.get('activityValue') != null ? this.get('activityValue') : null;
            var activityRelation = null;
            var minActivityValue = null;
            var maxActivityValue = null;
            var maxExActivityValue = null;
            var activityValue = null;
            var minExActivityValue = null;
            var activityValueType = null;
            // only set activity filter if all filter boxes have been selected
            //if (unit != null && activity != null && condition != null && currentActivityValue != null) {
            if (condition != null) {
                switch (condition) {
                    case '>':
                        activityValueType = "minEx-activity_value";
                        break;
                    case '<':
                        activityValueType = "maxEx-activity_value";
                        break;
                    case '=':
                        activityValueType = "activity_value";
                        break;
                    case '<=':
                        activityValueType = "max-activity_value";
                        break;
                    case '>=':
                        activityValueType = "min-activity_value";
                        break;
                }
            }
            var activityRelations = [];
            if (this.get('greaterThan') === true) {
                activityRelations.push(">");
            }
            if (this.get('lessThan') === true) {
                activityRelations.push("<");
            }
            if (this.get('greaterThanOrEqual') === true) {
                activityRelations.push(">=");
            }
            if (this.get('lessThanOrEqual') === true) {
                activityRelations.push("<=");
            }
            if (this.get('equalTo') === true) {
                activityRelations.push("=");
            }
            // if there are any relations then add them all to the string with the "|" (OR) separator otherwise activityRelation will still be null
            // a trailing "|" is fine according to tests on the LD API
            if (activityRelations.length > 0) {
                activityRelation = "";
                $.each(activityRelations, function(index, relation) {
                    activityRelation = activityRelation + relation + "|";
                });
            }
            var pchemblCondition = this.get('selectedPchemblCondition') != null ? this.get('selectedPchemblCondition') : null;
            var currentPchemblValue = this.get('pchemblValue') != null ? this.get('pchemblValue') : null;
            var minPchemblValue = null;
            var maxPchemblValue = null;
            var maxExPchemblValue = null;
            var minExPchemblValue = null;
            var actualPchemblValue = null;
            // pchembl filter only valid if all filter bits selected
            var pChemblValueType = null;
            if (pchemblCondition != null && currentPchemblValue != null) {
                switch (pchemblCondition) {
                    case '>':
                        pChemblValueType = "minEx-pChembl";
                        break;
                    case '<':
                        pChemblValueType = "maxEx-pChembl";
                        break;
                    case '=':
                        pChemblValueType = "pchembl";
                        break;
                    case '<=':
                        pChemblValueType = "max-pChembl";
                        break;
                    case '>=':
                        pChemblValueType = "min-pChembl";
                        break;
                }
            }
            var filtersString = "";
            // pchembl
            filtersString += pChemblValueType != null ? "pChembl " + pchemblCondition + " " + currentPchemblValue : '';
            //activity
            filtersString += activity != null || condition != null || currentActivityValue != null || unit != null ? " Activity: " : '';
            filtersString += activity != null ? activity + " " : '';
            filtersString += condition != null ? condition + " " : '';
            filtersString += currentActivityValue != null ? currentActivityValue + " " : '';
            filtersString += unit != null ? unit + " " : '';
            if (activityRelations.length > 0) {
                filtersString += " Relations: ";
                $.each(activityRelations, function(index, relation) {
                    filtersString += relation + " ";
                });
            }

            //filtersString += activityRelation != null ? " Relations: " + activityRelation + " " : ''
            //organisms
            filtersString += assayOrganism != null ? " Assay Organism: " + assayOrganism : '';
            filtersString += targetOrganism != null ? " Target Organism: " + targetOrganism : '';

            filtersString = filtersString == "" ? "No filters applied" : "Filters applied - " + filtersString;

            var thisTarget = this.get('content');
            var tsvCreateRequest = $.ajax({
                url: tsvCreateUrl,
                dataType: 'json',
                cache: true,
                data: {
                    _format: "json",
                    uri: this.get('uri'),
                    total_count: me.totalCount,
                    request_type: 'tree',
                    pchembl_value_type: pChemblValueType,
                    pchembl_value: currentPchemblValue,
                    activity_relation: activityRelation,
                    activity_value_type: activityValueType,
                    activity_value: currentActivityValue,
                    activity_type: activity,
                    activity_unit: unit,
                    assay_organism: assayOrganism,
                    target_organism: targetOrganism
                },
                success: function(response, status, request) {
                    me.get('controllers.application').addJob(response.uuid, thisTarget.get('name'), filtersString);
                    App.FlashQueue.pushFlash('notice', 'Creating TSV file for download. You will be alerted when ready.');
                    //me.monitorTSVCreation(response.uuid);
                },
                error: function(request, status, error) {
                    App.FlashQueue.pushFlash('error', 'Could not create TSV file, please contact support quoting error: ' + error);
                }
            });
        }
    }
});
