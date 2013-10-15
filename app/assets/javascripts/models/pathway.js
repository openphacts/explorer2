App.Pathway = DS.Model.extend({
  compound: DS.belongsTo('App.SearchResult'),
  title: DS.attr('string'),
  identifier: DS.attr('string'),
  description: DS.attr('string'),
  pathwayOntologies: DS.attr(),
  organism: DS.attr('string'),
  organismLabel: DS.attr('string'),
  geneProductLabel: DS.attr('string'),
  geneProductURI: DS.attr('string'),
  geneProductCWURI: DS.attr('string'),
  about: DS.attr('string'),
  parts: DS.attr(),
  compounds: DS.hasMany('App.Compound'),
  targets: DS.hasMany('App.Target'),
});
App.Pathway.reopenClass({
    find: function(id) {
      var pathway = App.Pathway.createRecord();
      var searcher = new Openphacts.PathwaySearch(ldaBaseUrl, appID, appKey);
      var compoundSearcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);
      var pathwayInfoCallback=function(success, status, response){
        if (success && response) {
          var pathwayResult = searcher.parseInformationResponse(response);
          pathway.setProperties(pathwayResult);
	      pathway.trigger('didLoad');
          var getCompoundsCallback=function(success, status, response){
              if (success && response) {   
                  var getCompoundsReponse = searcher.parseGetCompoundsResponse(response);
                  $.each(getCompoundsReponse.metabolites, function(i, compound) {  
                    var compoundInfoCallback = function(success, status, response) {
                      if (success && response) {   
                          var compoundResult = compoundSearcher.parseCompoundResponse(response);
                          var compound = App.Compound.createRecord(); 
                          compound.setProperties(compoundResult);
                          pathway.get('compounds').pushObject(compound);
                      };
                    };
                    compoundSearcher.fetchCompound(compound, null, compoundInfoCallback);
                  });
              }
          };
          searcher.getCompounds('http://identifiers.org/wikipathways/' + id, null, getCompoundsCallback);
        }
      };

      searcher.information('http://identifiers.org/wikipathways/' + id, null, pathwayInfoCallback);
      return pathway;
    }
});
