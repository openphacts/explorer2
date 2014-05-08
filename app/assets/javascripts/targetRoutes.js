// Target Routes

App.TargetsIndexRoute = Ember.Route.extend({
	
  setupController: function(controller, model, params) {
    console.log('target index controller');
    controller.set('model', model);	
  },

  model: function(params) {
    console.log('target index model')
    var uri = params.uri;
    return this.get('store').find('target', uri);
  },

  beforeModel: function() {
    this.controllerFor('application').set('fetching', false);
    enable_scroll();
  },

  actions: {
    error: function(error, transition) {
        // TODO need to navigate back somewhere if there is an error, however using window.history.back()
        // might not go back to the correct place because the browser window might have been at a different
        // starting point than the ember app.
        App.FlashQueue.pushFlash('error', 'This target is not available, please try a different one');
    }
  }

});

App.TargetsPharmacologyRoute = Ember.Route.extend({

  setupController: function(controller, model, params) {
    console.log('target index route setup controller');
    controller.set('content', model);
    controller.set('totalCount', null);
    var me = controller;
    // set all the current filters
    var assayOrganism = me.get('assayOrganismQuery');
    var targetOrganism = me.get('targetOrganismQuery');
    var targetType = null;
    var lens = null;
    var activity = me.get('selectedActivity') != null ? me.get('selectedActivity').label : null;
    var unit = me.get('selectedUnit') != null ? me.get('selectedUnit').label : null;
    var condition = me.get('selectedCondition') != null ? me.get('selectedCondition') : null;
    var currentActivityValue = me.get('activityValue') != null ? me.get('activityValue') : null;
    var activityRelation = null;
    var minActivityValue = null;
    var maxActivityValue = null;
    var maxExActivityValue = null;
    var activityValue = null;
    var minExActivityValue = null;
    // only set activity filter if all filter boxes have been selected
    if (unit != null && activity != null && condition != null && currentActivityValue != null) {
        switch(condition)
        {
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
    if (me.get('greaterThan') === true) {
        activityRelations.push(">");
    }
    if (me.get('lessThan') === true) {
        activityRelations.push("<");
    }
    if (me.get('greaterThanOrEqual') === true) {
        activityRelations.push(">=");
    }
    if (me.get('lessThanOrEqual') === true) {
        activityRelations.push("<=");
    }
    if (me.get('equalTo') === true) {
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
    var pchemblCondition = me.get('selectedPchemblCondition') != null ? me.get('selectedPchemblCondition') : null;
    var currentPchemblValue = me.get('pchemblValue') != null ? me.get('pchemblValue') : null;
    var minPchemblValue = null;
    var maxPchemblValue = null;
    var maxExPchemblValue = null;
    var minExPchemblValue = null;
    var actualPchemblValue = null;
    // pchembl filter only valid if all filter bits selected
    if (pchemblCondition != null && currentPchemblValue != null) {
        switch(pchemblCondition)
        {
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
    var sortBy = null;
    if (me.get('currentHeader') !== null && me.get('sortedHeader') == null) {
      // we have previously sorted descending on a header and it is still current
      sortBy = 'DESC(?' + me.get('currentHeader') + ')';
    } else if (me.get('currentHeader') !== null) {
      //we have previously sorted on a header
      sortBy = '?' + me.get('currentHeader');
    }
      var thisTarget = model;
      var searcher = new Openphacts.TargetSearch(ldaBaseUrl, appID, appKey);
      var pharmaCallback=function(success, status, response){
      if (success && response) {
        var pharmaResults = searcher.parseTargetPharmacologyResponse(response);
        $.each(pharmaResults, function(index, pharma) {
          var pharmaRecord = me.store.createRecord('targetPharmacology', pharma);
              thisTarget.get('pharmacology').pushObject(pharmaRecord);
        });
        controller.set('page', 1);
        me.get('controllers.application').set('fetching', false);
      } else {
        me.get('controllers.application').set('fetching', false);
      }
    };
    var countCallback=function(success, status, response){
	  me.set('fetchingCount', false);
      if (success && response) {
          var count = searcher.parseTargetPharmacologyCountResponse(response);
          controller.set('totalCount', count);
          if (count > 0 && controller.get('page') == null) {
              me.get('controllers.application').set('fetching', true);
              searcher.targetPharmacology(thisTarget.get('URI'), assayOrganism, targetOrganism, activity, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, unit, activityRelation, actualPchemblValue, minPchemblValue, minExPchemblValue, maxPchemblValue, maxExPchemblValue, targetType, 1, 50, sortBy, lens, pharmaCallback);
          } else {
		  me.get('controllers.application').set('fetching', true);
	  }
      }
    };
    if (controller.get('totalCount') == null) {
	    me.set('fetchingCount', true);
	    me.get('controllers.application').set('fetching', true);
        searcher.targetPharmacologyCount(thisTarget.get('URI'), assayOrganism, targetOrganism, activity, activityValue, minActivityValue, minExActivityValue, maxActivityValue, maxExActivityValue, unit, activityRelation, actualPchemblValue, minPchemblValue, minExPchemblValue, maxPchemblValue, maxExPchemblValue, targetType, lens, countCallback);
    }
    var activityTypesCallback=function(success, status, response){
        if (success && response) {
                var activityTypes = activitySearcher.parseTypes(response);
            me.set('activityTypes', activityTypes);
        }
    };
    var activitySearcher = new Openphacts.ActivitySearch(ldaBaseUrl, appID, appKey);
    activitySearcher.getTypes(null, null, null, null, null, activityTypesCallback);

    // fetch all activity units for default in filter select
    var allUnitsCallback=function(success, status, response){
                if (success && response) {
                    var units = activitySearcher.parseAllUnits(response);
                    me.set('activityUnits', units);
            //me.set('defaultUnitFilters', units);
                }
    };
    activitySearcher.getAllUnits(null, 'all', null, null, allUnitsCallback);
  },
  model: function(params) {
    console.log('target pharma index route');
    var uri = params.uri;
    return this.get('store').find('target', uri);
  },

  beforeModel: function() {
    this.controllerFor('application').set('fetching', false);
    enable_scroll();
  }

});

App.TargetsPathwaysRoute = Ember.Route.extend({

  setupController: function(controller, model, params) {
    controller.set('content', model);
    controller.set('totalCount', null);
    var me = controller;
    var thisTarget = model;
    var searcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
    //how many pathways for this compound
    var countCallback=function(success, status, response){
	    me.get('controllers.application').set('fetching', false);
      if (success && response) {
        var count = searcher.parseCountPathwaysByTargetResponse(response);
        controller.set('totalCount', count);
        if (count > 0) {
            searcher.byTarget(thisTarget.get('URI'), null, null, 1, 50, null, pathwaysByTargetCallback);
        }
      }
    };
    var countOnlyCallback=function(success, status, response){
	    me.get('controllers.application').set('fetching', false);
      if (success && response) {
        var count = searcher.parseCountPathwaysByTargetResponse(response);
        controller.set('totalCount', count);
        //set page just in case it is for a different compound previously loaded
        if (me.get('currentCount')%50 > 0) {
            me.set('page', Math.floor(me.get('currentCount')/50) + 1);
        } else {
            me.set('page', me.get('currentCount')/50);
        }
      }
    };

    //load the pathways for this compound
    var pathwaysByTargetCallback=function(success, status, response){
      if (success && response) {
          var pathwayResults = searcher.parseByTargetResponse(response);
          $.each(pathwayResults, function(index, pathwayResult) {
            pathwayID = pathwayResult.identifier;
            //have to find the pathway record and add it, just adding the ID does not work
            me.get('store').find('pathway', pathwayID).then(function(pathway) {
              thisTarget.get('pathways').pushObject(pathway);
            });
          });
      }
    }
    //searcher.countPathwaysByTarget(thisTarget.get('URI'), null, null, countCallback);
    //if currentCount is 0 (ie controllers content is empty) and totalCount is null then we have not loaded any pharma
    if (controller.get('currentCount') === 0 && controller.get('totalCount') === null) {
	    me.get('controllers.application').set('fetching', true);
	    searcher.countPathwaysByTarget(thisTarget.get('URI'), null, null, countCallback);
    } else if (controller.get('currentCount') === 0 && controller.get('totalCount') >= 0) {
        //could still be count for a different compound
	    me.get('controllers.application').set('fetching', true);
	    searcher.countPathwaysByTarget(thisTarget.get('URI'), null, null, countCallback);
    } else {
        //reset the totalCount just to be sure
	    me.get('controllers.application').set('fetching', true);
	    searcher.countPathwaysByTarget(thisTarget.get('URI'), null, null, countOnlyCallback);
    }

  },
  model: function(params) {
    var uri = params.uri;
    return this.get('store').find('target', uri);
  },

  beforeModel: function() {
    this.controllerFor('application').set('fetching', false);
    enable_scroll();
  }
});
